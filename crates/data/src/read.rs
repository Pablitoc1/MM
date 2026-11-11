//! Lecture de la base par l'application.

use std::path::Path;

use rusqlite::{params, Connection, OpenFlags, OptionalExtension};
use serde::Serialize;

pub struct Db {
    conn: Connection,
}

#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct League {
    pub id: String,
    pub name: String,
    pub region: Option<String>,
    pub tier: u8,
    pub team_count: u32,
}

#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct Team {
    pub id: String,
    pub short: Option<String>,
    pub league_id: String,
    pub logo_file: Option<String>,
}

#[derive(Debug, Clone, Serialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct SeasonStats {
    pub games: u32,
    pub wins: u32,
    pub kills: u32,
    pub deaths: u32,
    pub assists: u32,
    pub cs_per_min: f64,
    pub gold_per_min: f64,
    pub damage_per_min: f64,
}

#[derive(Debug, Clone, Serialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct RosterMember {
    pub person_id: String,
    pub handle: String,
    pub real_name: Option<String>,
    pub country: Option<String>,
    pub birthdate: Option<String>,
    pub role: String,
    pub is_staff: bool,
    pub photo_file: Option<String>,
    pub contract_end: Option<String>,
    pub stats_2025: Option<SeasonStats>,
    /// Les 3 champions les plus joués en 2025 (clés Data Dragon).
    pub top_champions: Vec<String>,
    /// Niveau et potentiel (joueurs seulement).
    pub rating: Option<Rating>,
}

/// Niveau et potentiel sur 100.
#[derive(Debug, Clone, Serialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct Rating {
    pub level: f64,
    pub level_low: f64,
    pub level_high: f64,
    pub potential: f64,
    pub games: u32,
    /// « stats » ou « estimé » (joueur sans parties dans Oracle's Elixir).
    pub source: String,
}

/// Un attribut sur 20, avec sa fourchette.
#[derive(Debug, Clone, Serialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct AttrScore {
    pub key: String,
    pub value: f64,
    pub low: f64,
    pub high: f64,
    pub estimated: bool,
}

/// Stats 2025 d'un tournoi.
#[derive(Debug, Clone, Serialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct TournamentStats {
    pub tournament: String,
    pub stats: SeasonStats,
    pub vision_per_min: f64,
}

#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct ChampionUse {
    pub champion: String,
    pub games: u32,
    pub wins: u32,
}

/// Tout ce que montre la fiche joueur.
#[derive(Debug, Clone, Serialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct PlayerDetail {
    pub member: RosterMember,
    pub team_id: String,
    pub league_id: String,
    pub residency: Option<String>,
    pub native_name: Option<String>,
    pub attributes: Vec<AttrScore>,
    pub tournaments: Vec<TournamentStats>,
    pub champions: Vec<ChampionUse>,
}

impl Db {
    /// Ouvre la base en lecture seule.
    pub fn open_read_only(path: &Path) -> rusqlite::Result<Self> {
        let conn = Connection::open_with_flags(path, OpenFlags::SQLITE_OPEN_READ_ONLY)?;
        Ok(Self { conn })
    }

    pub fn from_connection(conn: Connection) -> Self {
        Self { conn }
    }

    pub fn meta(&self, key: &str) -> rusqlite::Result<Option<String>> {
        self.conn
            .query_row("SELECT value FROM meta WHERE key = ?1", [key], |r| r.get(0))
            .optional()
    }

    pub fn leagues(&self) -> rusqlite::Result<Vec<League>> {
        let mut st = self.conn.prepare(
            "SELECT l.id, l.name, l.region, l.tier, COUNT(t.id)
             FROM leagues l LEFT JOIN teams t ON t.league_id = l.id
             GROUP BY l.id ORDER BY l.tier, l.id",
        )?;
        let rows = st.query_map([], |r| {
            Ok(League {
                id: r.get(0)?,
                name: r.get(1)?,
                region: r.get(2)?,
                tier: r.get(3)?,
                team_count: r.get(4)?,
            })
        })?;
        rows.collect()
    }

    pub fn teams(&self, league_id: &str) -> rusqlite::Result<Vec<Team>> {
        let mut st = self.conn.prepare(
            "SELECT id, short, league_id, logo_file FROM teams WHERE league_id = ?1 ORDER BY id",
        )?;
        let rows = st.query_map([league_id], |r| {
            Ok(Team {
                id: r.get(0)?,
                short: r.get(1)?,
                league_id: r.get(2)?,
                logo_file: r.get(3)?,
            })
        })?;
        rows.collect()
    }

    /// Effectif d'un club : joueurs dans l'ordre des rôles, puis le staff.
    pub fn roster(&self, team_id: &str) -> rusqlite::Result<Vec<RosterMember>> {
        let mut st = self.conn.prepare(
            "SELECT p.id, p.handle, p.real_name, p.country, p.birthdate, r.role, r.is_staff,
                    p.photo_file, c.end_date
             FROM roster r JOIN people p ON p.id = r.person_id
             LEFT JOIN contracts c ON c.person_id = p.id
             WHERE r.team_id = ?1
             ORDER BY r.is_staff,
                 CASE r.role WHEN 'Top' THEN 1 WHEN 'Jungle' THEN 2 WHEN 'Mid' THEN 3
                             WHEN 'Bot' THEN 4 WHEN 'Support' THEN 5 ELSE 6 END,
                 r.sort, p.handle",
        )?;
        let rows = st.query_map([team_id], |r| {
            Ok(RosterMember {
                person_id: r.get(0)?,
                handle: r.get(1)?,
                real_name: r.get(2)?,
                country: r.get(3)?,
                birthdate: r.get(4)?,
                role: r.get(5)?,
                is_staff: r.get::<_, i64>(6)? != 0,
                photo_file: r.get(7)?,
                contract_end: r.get(8)?,
                stats_2025: None,
                top_champions: Vec::new(),
                rating: None,
            })
        })?;
        let mut members: Vec<RosterMember> = rows.collect::<rusqlite::Result<_>>()?;
        for m in &mut members {
            if !m.is_staff {
                self.fill_player(m)?;
            }
        }
        Ok(members)
    }

    fn fill_player(&self, m: &mut RosterMember) -> rusqlite::Result<()> {
        m.stats_2025 = self.stats_2025(&m.person_id)?;
        m.top_champions = self.top_champions(&m.person_id, 3)?;
        m.rating = self.rating(&m.person_id)?;
        Ok(())
    }

    pub fn rating(&self, person_id: &str) -> rusqlite::Result<Option<Rating>> {
        self.conn
            .query_row(
                "SELECT level, level_low, level_high, potential, games, source
                 FROM player_ratings WHERE person_id = ?1",
                [person_id],
                |r| {
                    Ok(Rating {
                        level: r.get(0)?,
                        level_low: r.get(1)?,
                        level_high: r.get(2)?,
                        potential: r.get(3)?,
                        games: r.get(4)?,
                        source: r.get(5)?,
                    })
                },
            )
            .optional()
    }

    pub fn attributes(&self, person_id: &str) -> rusqlite::Result<Vec<AttrScore>> {
        let mut st = self.conn.prepare(
            "SELECT attr, value, low, high, estimated FROM player_attributes
             WHERE person_id = ?1 ORDER BY rowid",
        )?;
        let rows = st.query_map([person_id], |r| {
            Ok(AttrScore {
                key: r.get(0)?,
                value: r.get(1)?,
                low: r.get(2)?,
                high: r.get(3)?,
                estimated: r.get::<_, i64>(4)? != 0,
            })
        })?;
        rows.collect()
    }

    /// Fiche complète d'un joueur (ou d'un membre du staff).
    pub fn player(&self, person_id: &str) -> rusqlite::Result<Option<PlayerDetail>> {
        let head = self
            .conn
            .query_row(
                "SELECT p.id, p.handle, p.real_name, p.country, p.birthdate, r.role, r.is_staff,
                        p.photo_file, c.end_date, r.team_id, t.league_id, p.residency, p.native_name
                 FROM people p JOIN roster r ON r.person_id = p.id JOIN teams t ON t.id = r.team_id
                 LEFT JOIN contracts c ON c.person_id = p.id
                 WHERE p.id = ?1 ORDER BY r.is_staff LIMIT 1",
                [person_id],
                |r| {
                    Ok((
                        RosterMember {
                            person_id: r.get(0)?,
                            handle: r.get(1)?,
                            real_name: r.get(2)?,
                            country: r.get(3)?,
                            birthdate: r.get(4)?,
                            role: r.get(5)?,
                            is_staff: r.get::<_, i64>(6)? != 0,
                            photo_file: r.get(7)?,
                            contract_end: r.get(8)?,
                            stats_2025: None,
                            top_champions: Vec::new(),
                            rating: None,
                        },
                        r.get::<_, String>(9)?,
                        r.get::<_, String>(10)?,
                        r.get::<_, Option<String>>(11)?,
                        r.get::<_, Option<String>>(12)?,
                    ))
                },
            )
            .optional()?;
        let Some((mut member, team_id, league_id, residency, native_name)) = head else {
            return Ok(None);
        };
        if !member.is_staff {
            self.fill_player(&mut member)?;
        }
        let mut st = self.conn.prepare(
            "SELECT tournament, games, wins, kills, deaths, assists, cs, gold, damage, vision, minutes
             FROM player_stats_2025 WHERE person_id = ?1 ORDER BY games DESC, tournament",
        )?;
        let tournaments = st
            .query_map([person_id], |r| {
                let minutes: f64 = r.get(10)?;
                let per_min = |v: i64| {
                    if minutes > 0.0 {
                        v as f64 / minutes
                    } else {
                        0.0
                    }
                };
                Ok(TournamentStats {
                    tournament: r.get(0)?,
                    stats: SeasonStats {
                        games: r.get(1)?,
                        wins: r.get(2)?,
                        kills: r.get(3)?,
                        deaths: r.get(4)?,
                        assists: r.get(5)?,
                        cs_per_min: per_min(r.get(6)?),
                        gold_per_min: per_min(r.get(7)?),
                        damage_per_min: per_min(r.get(8)?),
                    },
                    vision_per_min: per_min(r.get(9)?),
                })
            })?
            .collect::<rusqlite::Result<_>>()?;
        let mut st = self.conn.prepare(
            "SELECT champion, games, wins FROM player_champions_2025
             WHERE person_id = ?1 ORDER BY games DESC, champion LIMIT 12",
        )?;
        let champions = st
            .query_map([person_id], |r| {
                Ok(ChampionUse {
                    champion: r.get(0)?,
                    games: r.get(1)?,
                    wins: r.get(2)?,
                })
            })?
            .collect::<rusqlite::Result<_>>()?;
        Ok(Some(PlayerDetail {
            attributes: self.attributes(person_id)?,
            member,
            team_id,
            league_id,
            residency,
            native_name,
            tournaments,
            champions,
        }))
    }

    /// Stats 2025 cumulées sur tous les tournois du joueur.
    pub fn stats_2025(&self, person_id: &str) -> rusqlite::Result<Option<SeasonStats>> {
        self.conn.query_row(
            "SELECT SUM(games), SUM(wins), SUM(kills), SUM(deaths), SUM(assists),
                        SUM(cs), SUM(gold), SUM(damage), SUM(minutes)
                 FROM player_stats_2025 WHERE person_id = ?1",
            params![person_id],
            |r| {
                let games: Option<u32> = r.get(0)?;
                let Some(games) = games.filter(|g| *g > 0) else {
                    return Ok(None);
                };
                let minutes: f64 = r.get(8)?;
                let per_min = |v: f64| if minutes > 0.0 { v / minutes } else { 0.0 };
                Ok(Some(SeasonStats {
                    games,
                    wins: r.get(1)?,
                    kills: r.get(2)?,
                    deaths: r.get(3)?,
                    assists: r.get(4)?,
                    cs_per_min: per_min(r.get::<_, i64>(5)? as f64),
                    gold_per_min: per_min(r.get::<_, i64>(6)? as f64),
                    damage_per_min: per_min(r.get::<_, i64>(7)? as f64),
                }))
            },
        )
    }

    /// Données Data Dragon d'un champion (JSON complet : stats, sorts, passif).
    pub fn champion_json(&self, id: &str) -> rusqlite::Result<Option<String>> {
        self.conn
            .query_row("SELECT data FROM champions WHERE id = ?1", [id], |r| {
                r.get(0)
            })
            .optional()
    }

    /// Clés Data Dragon de tous les champions.
    pub fn champion_ids(&self) -> rusqlite::Result<Vec<String>> {
        let mut st = self.conn.prepare("SELECT id FROM champions ORDER BY id")?;
        let ids = st.query_map([], |r| r.get(0))?.collect();
        ids
    }

    /// Sorts d'un champion (JSON `mm_engine::kit::Kit`), si la base les a.
    pub fn champion_kit(&self, id: &str) -> rusqlite::Result<Option<String>> {
        self.conn
            .query_row(
                "SELECT data FROM champion_kits WHERE champion = ?1",
                [id],
                |r| r.get(0),
            )
            .optional()
    }

    pub fn top_champions(&self, person_id: &str, n: u32) -> rusqlite::Result<Vec<String>> {
        let mut st = self.conn.prepare(
            "SELECT champion FROM player_champions_2025
             WHERE person_id = ?1 ORDER BY games DESC, champion LIMIT ?2",
        )?;
        let rows = st.query_map(params![person_id, n], |r| r.get(0))?;
        rows.collect()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::schema;

    fn sample() -> Db {
        let conn = Connection::open_in_memory().unwrap();
        schema::create(&conn).unwrap();
        conn.execute_batch(
            "INSERT INTO leagues VALUES ('LEC','LoL EMEA Championship','EMEA',1,'LEC/2026');
             INSERT INTO teams VALUES ('Karmine Corp','KC','EMEA','LEC',NULL);
             INSERT INTO people VALUES ('Caliste','Caliste','Caliste Henry-Hennebert',NULL,'France','2006-08-28','EMEA',NULL);
             INSERT INTO people VALUES ('Canna (Kim Chang-dong)','Canna','Kim Chang-dong',NULL,'South Korea','2000-09-21','Korea',NULL);
             INSERT INTO people VALUES ('Reapered','Reapered','Bok Han-gyu',NULL,'South Korea','1992-01-30','Korea',NULL);
             INSERT INTO roster VALUES ('Karmine Corp','Caliste','Bot',0,4);
             INSERT INTO roster VALUES ('Karmine Corp','Canna (Kim Chang-dong)','Top',0,1);
             INSERT INTO roster VALUES ('Karmine Corp','Reapered','Coach',1,6);
             INSERT INTO contracts VALUES ('Caliste','2028-11-20');
             INSERT INTO player_stats_2025 VALUES ('Caliste','LEC/2025 Season/Winter Season',10,6,40,10,50,3300,140000,250000,400,330.0);
             INSERT INTO player_stats_2025 VALUES ('Caliste','2025 First Stand',5,3,20,5,25,1650,70000,125000,200,165.0);
             INSERT INTO champions VALUES ('Kaisa',145,'Kai''Sa','Fille du Néant','[]','{}');
             INSERT INTO player_champions_2025 VALUES ('Caliste','Kaisa',7,5);
             INSERT INTO player_champions_2025 VALUES ('Caliste','Varus',8,4);
             INSERT INTO player_ratings VALUES ('Caliste','Bot',60,78.5,75.0,82.0,88.5,'stats');
             INSERT INTO player_attributes VALUES ('Caliste','mecanique',16.5,15.0,18.0,0);
             INSERT INTO player_attributes VALUES ('Caliste','shotcalling',9.0,6.0,12.0,1);",
        )
        .unwrap();
        Db::from_connection(conn)
    }

    #[test]
    fn ligues_avec_nombre_de_clubs() {
        let l = sample().leagues().unwrap();
        assert_eq!(l.len(), 1);
        assert_eq!(l[0].team_count, 1);
    }

    #[test]
    fn effectif_trie_par_role_puis_staff() {
        let r = sample().roster("Karmine Corp").unwrap();
        let roles: Vec<_> = r.iter().map(|m| m.role.as_str()).collect();
        assert_eq!(roles, ["Top", "Bot", "Coach"]);
        assert!(r[2].is_staff);
        assert_eq!(r[1].contract_end.as_deref(), Some("2028-11-20"));
    }

    #[test]
    fn stats_cumulees_par_minute() {
        let s = sample().stats_2025("Caliste").unwrap().unwrap();
        assert_eq!(s.games, 15);
        assert!((s.cs_per_min - 10.0).abs() < 1e-9);
        assert!(sample().stats_2025("Reapered").unwrap().is_none());
    }

    #[test]
    fn fiche_joueur_complete() {
        let p = sample().player("Caliste").unwrap().unwrap();
        assert_eq!(p.team_id, "Karmine Corp");
        assert_eq!(p.member.rating.as_ref().unwrap().level, 78.5);
        assert_eq!(p.attributes.len(), 2);
        assert!(p.attributes[1].estimated);
        assert_eq!(p.tournaments[0].stats.games, 10);
        assert_eq!(p.champions[0].champion, "Varus");
        assert!(sample().player("Inconnu").unwrap().is_none());
        // Le staff n'a pas de note.
        assert!(sample()
            .player("Reapered")
            .unwrap()
            .unwrap()
            .member
            .rating
            .is_none());
    }

    #[test]
    fn champions_les_plus_joues_avec_cle_data_dragon() {
        let c = sample().top_champions("Caliste", 3).unwrap();
        assert_eq!(c, ["Varus", "Kaisa"]);
    }
}
