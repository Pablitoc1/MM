//! Lecture des données de la draft (voir `docs/decisions/008-donnees-de-draft.md`).

use rusqlite::{params, OptionalExtension};
use serde::Serialize;

use crate::Db;

/// Un champion sur un patch : présence, victoires, rang de la grille, rôles.
#[derive(Debug, Clone, Serialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct MetaChampion {
    pub champion: String,
    pub games: u32,
    pub picks: u32,
    pub bans: u32,
    pub wins: u32,
    pub tier: String,
    /// (rôle : top, jng, mid, bot, sup ; picks ; victoires), du plus joué au moins joué.
    pub roles: Vec<(String, u32, u32)>,
}

/// Un champion joué en compétition par un joueur, 2014-2025.
#[derive(Debug, Clone, Serialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct PoolEntry {
    pub champion: String,
    pub games: u32,
    pub wins: u32,
    /// Parties pondérées par l'ancienneté (une année = moitié moins).
    pub mastery: f64,
    pub last_played: String,
}

/// Profil d'un champion dans les ligues majeures 2024-2025.
#[derive(Debug, Clone, Serialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct Profile {
    pub champion: String,
    /// (parties, victoires) : courtes (< 29 min), moyennes, longues (>= 36 min).
    pub by_length: [(u32, u32); 3],
    pub gold_diff_10: Option<f64>,
    pub gold_diff_15: Option<f64>,
}

/// Ce que Data Dragon dit d'un champion : nom affiché, classes, et notes d'attaque
/// physique et de magie sur 10 (champ `info`).
#[derive(Debug, Clone, Serialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct ChampionKind {
    pub id: String,
    pub name: String,
    pub tags: Vec<String>,
    pub attack: u8,
    pub magic: u8,
}

/// Une vraie draft dans l'ordre officiel : (côté « B » ou « R », « ban » ou « pick »,
/// champion, rôle du pick ou vide).
#[derive(Debug, Clone, Serialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct ProDraft {
    pub game_id: String,
    pub date: String,
    pub league: String,
    pub patch: String,
    pub game_no: u8,
    pub blue_team: String,
    pub red_team: String,
    pub blue_win: bool,
    pub actions: Vec<(String, String, String, String)>,
}

impl Db {
    /// Méta d'un patch (« 26.2 »), du champion le plus fort au plus faible.
    pub fn patch_meta(&self, patch: &str) -> rusqlite::Result<Vec<MetaChampion>> {
        let mut st = self.conn.prepare(
            "SELECT champion, games, picks, bans, wins, tier FROM champion_meta
             WHERE patch = ?1 ORDER BY rowid",
        )?;
        let mut out: Vec<MetaChampion> = st
            .query_map([patch], |r| {
                Ok(MetaChampion {
                    champion: r.get(0)?,
                    games: r.get(1)?,
                    picks: r.get(2)?,
                    bans: r.get(3)?,
                    wins: r.get(4)?,
                    tier: r.get(5)?,
                    roles: Vec::new(),
                })
            })?
            .collect::<rusqlite::Result<_>>()?;
        let mut st = self.conn.prepare(
            "SELECT champion, role, picks, wins FROM champion_meta_roles
             WHERE patch = ?1 ORDER BY champion, picks DESC, role",
        )?;
        let roles = st.query_map([patch], |r| {
            Ok((
                r.get::<_, String>(0)?,
                (r.get::<_, String>(1)?, r.get(2)?, r.get(3)?),
            ))
        })?;
        let index: std::collections::HashMap<String, usize> = out
            .iter()
            .enumerate()
            .map(|(i, m)| (m.champion.clone(), i))
            .collect();
        for row in roles {
            let (champ, role) = row?;
            if let Some(&i) = index.get(&champ) {
                out[i].roles.push(role);
            }
        }
        Ok(out)
    }

    /// Patch en vigueur à une date (AAAA-MM-JJ) : le dernier patch de l'année joué en
    /// compétition à cette date, sinon le premier de l'année (« 26.1 » en janvier 2026,
    /// avant le premier match).
    pub fn patch_on(&self, date: &str) -> rusqlite::Result<String> {
        let year = date.get(2..4).unwrap_or("26");
        let found: Option<String> = self
            .conn
            .query_row(
                "SELECT patch FROM pro_drafts WHERE patch LIKE ?2 || '.%'
                 GROUP BY patch HAVING MIN(date) <= ?1 ORDER BY MIN(date) DESC LIMIT 1",
                params![date, year],
                |r| r.get(0),
            )
            .optional()?;
        Ok(found.unwrap_or_else(|| format!("{year}.1")))
    }

    /// Champions joués par un joueur, du mieux maîtrisé au moins bien.
    pub fn pool(&self, person_id: &str) -> rusqlite::Result<Vec<PoolEntry>> {
        let mut st = self.conn.prepare(
            "SELECT champion, games, wins, mastery, last_played FROM player_pool
             WHERE person_id = ?1 ORDER BY mastery DESC, champion",
        )?;
        let rows = st.query_map([person_id], |r| {
            Ok(PoolEntry {
                champion: r.get(0)?,
                games: r.get(1)?,
                wins: r.get(2)?,
                mastery: r.get(3)?,
                last_played: r.get(4)?,
            })
        })?;
        rows.collect()
    }

    pub fn profiles(&self) -> rusqlite::Result<Vec<Profile>> {
        let mut st = self.conn.prepare(
            "SELECT champion, games_short, wins_short, games_mid, wins_mid, games_long,
                    wins_long, gold_diff_10, gold_diff_15
             FROM champion_profile ORDER BY champion",
        )?;
        let rows = st.query_map([], |r| {
            Ok(Profile {
                champion: r.get(0)?,
                by_length: [
                    (r.get(1)?, r.get(2)?),
                    (r.get(3)?, r.get(4)?),
                    (r.get(5)?, r.get(6)?),
                ],
                gold_diff_10: r.get(7)?,
                gold_diff_15: r.get(8)?,
            })
        })?;
        rows.collect()
    }

    /// Tous les champions du patch de départ, avec leurs classes et leurs notes
    /// d'attaque et de magie (Data Dragon).
    pub fn champion_kinds(&self) -> rusqlite::Result<Vec<ChampionKind>> {
        let mut st = self.conn.prepare(
            "SELECT id, name, tags,
                    COALESCE(json_extract(data, '$.info.attack'), 0),
                    COALESCE(json_extract(data, '$.info.magic'), 0)
             FROM champions ORDER BY id",
        )?;
        let rows = st.query_map([], |r| {
            let tags: String = r.get(2)?;
            Ok(ChampionKind {
                id: r.get(0)?,
                name: r.get(1)?,
                tags: tags
                    .trim_matches(|c| c == '[' || c == ']')
                    .split(',')
                    .map(|t| t.trim().trim_matches('"').to_string())
                    .filter(|t| !t.is_empty())
                    .collect(),
                attack: r.get(3)?,
                magic: r.get(4)?,
            })
        })?;
        rows.collect()
    }

    /// Vraies drafts jouées entre deux dates incluses (AAAA-MM-JJ), d'une ligue ou de
    /// toutes (`None`), dans l'ordre chronologique.
    pub fn pro_drafts(
        &self,
        from: &str,
        to: &str,
        league: Option<&str>,
    ) -> rusqlite::Result<Vec<ProDraft>> {
        let mut st = self.conn.prepare(
            "SELECT game_id, date, league, patch, game_no, blue_team, red_team, blue_win
             FROM pro_drafts WHERE date BETWEEN ?1 AND ?2 AND (?3 IS NULL OR league = ?3)
             ORDER BY date, game_id",
        )?;
        let mut drafts: Vec<ProDraft> = st
            .query_map(params![from, to, league], |r| {
                Ok(ProDraft {
                    game_id: r.get(0)?,
                    date: r.get(1)?,
                    league: r.get(2)?,
                    patch: r.get(3)?,
                    game_no: r.get(4)?,
                    blue_team: r.get(5)?,
                    red_team: r.get(6)?,
                    blue_win: r.get(7)?,
                    actions: Vec::new(),
                })
            })?
            .collect::<rusqlite::Result<_>>()?;
        let mut act = self.conn.prepare(
            "SELECT json_extract(value, '$[0]'), json_extract(value, '$[1]'),
                    json_extract(value, '$[2]'), COALESCE(json_extract(value, '$[3]'), '')
             FROM pro_drafts, json_each(pro_drafts.actions)
             WHERE game_id = ?1 ORDER BY key",
        )?;
        for d in &mut drafts {
            d.actions = act
                .query_map([&d.game_id], |r| {
                    Ok((r.get(0)?, r.get(1)?, r.get(2)?, r.get(3)?))
                })?
                .collect::<rusqlite::Result<_>>()?;
        }
        Ok(drafts)
    }
}

#[cfg(test)]
mod tests {
    use rusqlite::Connection;

    use crate::{schema, Db};

    fn sample() -> Db {
        let conn = Connection::open_in_memory().unwrap();
        schema::create(&conn).unwrap();
        conn.execute_batch(
            r#"INSERT INTO champions VALUES ('Azir',268,'Azir','Empereur des sables','["Mage","Marksman"]','{"info":{"attack":6,"magic":8}}');
             INSERT INTO champion_meta VALUES ('26.1','Azir',184,56,48,30,'A');
             INSERT INTO champion_meta VALUES ('26.1','Ahri',184,10,2,4,'C');
             INSERT INTO champion_meta_roles VALUES ('26.1','Azir','mid',55,30);
             INSERT INTO champion_meta_roles VALUES ('26.1','Azir','top',1,0);
             INSERT INTO player_pool VALUES ('Caps','Azir',50,30,15.4,'2025-10-15');
             INSERT INTO player_pool VALUES ('Caps','Orianna',52,34,16.1,'2025-10-30');
             INSERT INTO pro_drafts VALUES ('g1','2026-01-17','LEC','26.1',1,'G2 Esports','Karmine Corp',1,'[["B","ban","Ahri"],["B","pick","Azir","mid"]]');
             INSERT INTO pro_drafts VALUES ('g2','2026-02-01','LEC','26.2',1,'G2 Esports','Karmine Corp',0,'[]');"#,
        )
        .unwrap();
        Db::from_connection(conn)
    }

    #[test]
    fn meta_d_un_patch() {
        let m = sample().patch_meta("26.1").unwrap();
        assert_eq!(m[0].champion, "Azir");
        assert_eq!(m[0].tier, "A");
        assert_eq!(m[0].roles[0], ("mid".to_string(), 55, 30));
        assert_eq!(m[1].roles.len(), 0);
    }

    #[test]
    fn patch_selon_la_date() {
        let db = sample();
        assert_eq!(db.patch_on("2026-01-05").unwrap(), "26.1");
        assert_eq!(db.patch_on("2026-01-20").unwrap(), "26.1");
        assert_eq!(db.patch_on("2026-02-10").unwrap(), "26.2");
        assert_eq!(db.patch_on("2025-06-10").unwrap(), "25.1");
    }

    #[test]
    fn pool_et_classes() {
        let db = sample();
        let p = db.pool("Caps").unwrap();
        assert_eq!(p[0].champion, "Orianna");
        let k = db.champion_kinds().unwrap();
        assert_eq!(k[0].tags, ["Mage", "Marksman"]);
        assert_eq!((k[0].attack, k[0].magic), (6, 8));
    }

    #[test]
    fn vraies_drafts_dans_l_ordre() {
        let d = sample()
            .pro_drafts("2026-01-01", "2026-01-31", Some("LEC"))
            .unwrap();
        assert_eq!(d.len(), 1);
        assert_eq!(
            d[0].actions[1],
            ("B".into(), "pick".into(), "Azir".into(), "mid".into())
        );
    }
}
