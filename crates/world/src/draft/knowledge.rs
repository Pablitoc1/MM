//! Ce que les équipes savent avant la draft : la méta du patch, le profil des
//! champions, les duels en ligne, et les champions de chaque joueur.

use std::collections::{BTreeMap, HashMap};

use mm_data::Db;
use serde::Serialize;

use super::styles::{physical_share, styles_of};
use super::{Role, RoleExt};

/// Un champion vu par la draft.
#[derive(Debug, Clone, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ChampInfo {
    pub id: String,
    pub name: String,
    /// Rang de la grille sur le patch (A à D), `None` s'il n'a pas été joué.
    pub tier: Option<char>,
    /// Picks + bans par partie sur le patch.
    pub presence: f64,
    /// Victoires sur le patch, lissées vers 50 %.
    pub win: f64,
    /// Part des picks à chaque poste (top, jungle, mid, bot, support).
    pub role_share: [f64; 5],
    pub physical: f64,
    pub styles: [f64; 5],
    /// Écart de victoires avec 50 % en début, milieu et fin de partie (2024-2025).
    pub curve: [f64; 3],
}

impl ChampInfo {
    /// Force sur le patch, de 0 (jamais vu) à environ 1,5 (présent dans toutes les
    /// parties et gagnant). // estimé (poids réglés sur la LEC 2025, voir la note 011)
    pub fn power(&self) -> f64 {
        let tier = match self.tier {
            Some('A') => 1.0,
            Some('B') => 0.65,
            Some('C') => 0.35,
            Some(_) => 0.1,
            None => 0.0,
        };
        0.3 * tier + self.presence + 1.5 * (self.win - 0.5)
    }
}

/// Un joueur titulaire et ses champions.
#[derive(Debug, Clone, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DraftPlayer {
    pub person_id: String,
    pub handle: String,
    pub role: Role,
    /// Champion → (parties, victoires, maîtrise pondérée par l'ancienneté).
    pub pool: HashMap<String, (u32, u32, f64)>,
}

impl DraftPlayer {
    /// Aisance sur un champion, de 0 (jamais joué) à 1. Une dizaine de parties
    /// récentes donnent 0,85. // estimé
    pub fn comfort(&self, champion: &str) -> f64 {
        self.pool
            .get(champion)
            .map_or(0.0, |(_, _, m)| 1.0 - (-m / 5.0).exp())
    }
}

/// Une équipe qui drafte : ses 5 titulaires et le niveau de draft de son coach.
#[derive(Debug, Clone, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DraftTeam {
    pub id: String,
    pub name: String,
    pub players: Vec<DraftPlayer>,
    /// Niveau de draft du staff, de 0 à 1. Le staff n'a pas encore de notes (M10) :
    /// 0,5 pour tous en attendant. // estimé
    pub coach: f64,
}

impl DraftTeam {
    pub fn player(&self, role: Role) -> Option<&DraftPlayer> {
        self.players.iter().find(|p| p.role == role)
    }

    /// Les titulaires d'un club de la base (premier joueur listé à chaque poste).
    pub fn load(db: &Db, team_id: &str) -> mm_data::rusqlite::Result<Self> {
        let roster = db.roster(team_id)?;
        let mut players = Vec::new();
        for role in Role::ALL {
            let Some(m) = roster
                .iter()
                .find(|m| !m.is_staff && Role::from_roster(&m.role) == Some(role))
            else {
                continue;
            };
            let pool = db
                .pool(&m.person_id)?
                .into_iter()
                .map(|p| (p.champion, (p.games, p.wins, p.mastery)))
                .collect();
            players.push(DraftPlayer {
                person_id: m.person_id.clone(),
                handle: m.handle.clone(),
                role,
                pool,
            });
        }
        Ok(Self {
            id: team_id.to_string(),
            name: team_id.to_string(),
            players,
            coach: 0.5,
        })
    }
}

/// Toute la connaissance de la draft à une date donnée.
#[derive(Debug, Clone, Default)]
pub struct Knowledge {
    pub patch: String,
    pub champs: BTreeMap<String, ChampInfo>,
    /// (n° du poste, champion, adversaire direct) → (parties, victoires du champion).
    pub matchups: HashMap<(usize, String, String), (u32, u32)>,
}

impl Knowledge {
    pub fn champ(&self, id: &str) -> Option<&ChampInfo> {
        self.champs.get(id)
    }

    /// Avantage d'un champion contre l'adversaire direct, en points de victoire
    /// (lissé vers 0 avec 10 parties fictives). // estimé (méthode)
    pub fn matchup(&self, role: Role, champ: &str, against: &str) -> (f64, u32) {
        let (g, w) = self
            .matchups
            .get(&(role.index(), champ.to_string(), against.to_string()))
            .copied()
            .unwrap_or((0, 0));
        ((w as f64 + 5.0) / (g as f64 + 10.0) - 0.5, g)
    }

    /// Ce que savent les équipes à la date `date` (AAAA-MM-JJ) : méta du patch en
    /// vigueur, duels des vraies parties jouées avant cette date (depuis 2025).
    pub fn load(db: &Db, date: &str) -> mm_data::rusqlite::Result<Self> {
        let patch = db.patch_on(date)?;
        let meta: HashMap<String, mm_data::MetaChampion> = db
            .patch_meta(&patch)?
            .into_iter()
            .map(|m| (m.champion.clone(), m))
            .collect();
        let profiles: HashMap<String, mm_data::Profile> = db
            .profiles()?
            .into_iter()
            .map(|p| (p.champion.clone(), p))
            .collect();
        let mut champs = BTreeMap::new();
        for c in db.champion_kinds()? {
            let m = meta.get(&c.id);
            let mut role_share = [0.0; 5];
            let mut tier = None;
            let (mut presence, mut win) = (0.0, 0.5);
            if let Some(m) = m {
                let picks: u32 = m.roles.iter().map(|r| r.1).sum();
                for (code, p, _) in &m.roles {
                    if let Some(r) = Role::from_code(code) {
                        role_share[r.index()] = *p as f64 / picks.max(1) as f64;
                    }
                }
                tier = m.tier.chars().next();
                presence = (m.picks + m.bans) as f64 / m.games.max(1) as f64;
                // Lissage : 20 parties fictives à 50 %. // estimé
                win = (m.wins as f64 + 10.0) / (m.picks as f64 + 20.0);
            }
            let curve = profiles.get(&c.id).map_or([0.0; 3], |p| {
                let mut curve = p
                    .by_length
                    .map(|(g, w)| (w as f64 + 15.0) / (g as f64 + 30.0) - 0.5);
                // L'or d'avance à 15 min compte pour le début. // estimé
                curve[0] += p.gold_diff_15.unwrap_or(0.0) / 3000.0;
                curve
            });
            champs.insert(
                c.id.clone(),
                ChampInfo {
                    physical: physical_share(c.attack, c.magic),
                    styles: styles_of(&c.id, &c.tags),
                    id: c.id,
                    name: c.name,
                    tier,
                    presence,
                    win,
                    role_share,
                    curve,
                },
            );
        }
        let mut matchups: HashMap<(usize, String, String), (u32, u32)> = HashMap::new();
        let drafts = db.pro_drafts("2025-01-01", date, None)?;
        for d in drafts.iter().filter(|d| d.date.as_str() < date) {
            let mut by_role: [[Option<&str>; 2]; 5] = [[None; 2]; 5];
            for (side, kind, champ, role) in &d.actions {
                if kind != "pick" {
                    continue;
                }
                if let Some(r) = Role::from_code(role) {
                    by_role[r.index()][(side == "R") as usize] = Some(champ);
                }
            }
            for r in Role::ALL {
                if let [Some(b), Some(red)] = by_role[r.index()] {
                    let e = matchups
                        .entry((r.index(), b.to_string(), red.to_string()))
                        .or_default();
                    e.0 += 1;
                    e.1 += d.blue_win as u32;
                    let e = matchups
                        .entry((r.index(), red.to_string(), b.to_string()))
                        .or_default();
                    e.0 += 1;
                    e.1 += !d.blue_win as u32;
                }
            }
        }
        Ok(Self {
            patch,
            champs,
            matchups,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn aisance_selon_la_maitrise() {
        let p = DraftPlayer {
            person_id: "Caps".into(),
            handle: "Caps".into(),
            role: Role::Mid,
            pool: [("Orianna".to_string(), (52, 34, 16.1))].into(),
        };
        assert!(p.comfort("Orianna") > 0.95);
        assert_eq!(p.comfort("Teemo"), 0.0);
    }
}
