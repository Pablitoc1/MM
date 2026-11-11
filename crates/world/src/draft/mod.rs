//! Draft : règles officielles (ordre, bans, Fearless), connaissance du patch et IA.
//!
//! La draft rend, pour chaque côté, 5 [`Pick`] (rôle, joueur, champion) que le moteur
//! lit pour monter le match. Tout aléatoire passe par `SimRng` : la même graine donne
//! la même draft. Voir les notes 011 (règles) et 012 (IA).

pub mod ai;
pub mod knowledge;
pub mod styles;

use std::collections::BTreeSet;
use std::fmt;

use serde::Serialize;

pub use ai::{auto_draft, choose, rank, Candidate, Reason};
pub use knowledge::{ChampInfo, DraftPlayer, DraftTeam, Knowledge};
pub use styles::{analyse, CompAnalysis, Style};

/// Poste d'un joueur : celui du moteur (même ordre, mêmes noms que la vue 2D).
pub use mm_engine::Role;

/// Ce que la draft ajoute aux postes du moteur.
pub trait RoleExt: Sized {
    fn index(self) -> usize;
    /// Code d'Oracle's Elixir (top, jng, mid, bot, sup).
    fn from_code(code: &str) -> Option<Self>;
    /// Poste de l'effectif (Leaguepedia : Top, Jungle, Mid, Bot, Support).
    fn from_roster(role: &str) -> Option<Self>;
    /// Nom affiché.
    fn label(self) -> &'static str;
}

impl RoleExt for Role {
    fn index(self) -> usize {
        self as usize
    }

    fn from_code(code: &str) -> Option<Role> {
        Some(match code {
            "top" => Role::Top,
            "jng" => Role::Jungle,
            "mid" => Role::Mid,
            "bot" => Role::Bot,
            "sup" => Role::Support,
            _ => return None,
        })
    }

    fn from_roster(role: &str) -> Option<Role> {
        Some(match role {
            "Top" => Role::Top,
            "Jungle" => Role::Jungle,
            "Mid" => Role::Mid,
            "Bot" | "ADC" => Role::Bot,
            "Support" => Role::Support,
            _ => return None,
        })
    }

    fn label(self) -> &'static str {
        ["Top", "Jungle", "Mid", "Bot", "Support"][self.index()]
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum Side {
    Blue,
    Red,
}

impl Side {
    pub fn other(self) -> Side {
        match self {
            Side::Blue => Side::Red,
            Side::Red => Side::Blue,
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum Kind {
    Ban,
    Pick,
}

/// Ordre officiel d'une draft de tournoi : 3 bans chacun, 3 picks (B R R B B R),
/// 2 bans chacun (le rouge commence), 2 picks (R B B R).
pub const ORDER: [(Side, Kind); 20] = {
    use Kind::*;
    use Side::*;
    [
        (Blue, Ban),
        (Red, Ban),
        (Blue, Ban),
        (Red, Ban),
        (Blue, Ban),
        (Red, Ban),
        (Blue, Pick),
        (Red, Pick),
        (Red, Pick),
        (Blue, Pick),
        (Blue, Pick),
        (Red, Pick),
        (Red, Ban),
        (Blue, Ban),
        (Red, Ban),
        (Blue, Ban),
        (Red, Pick),
        (Blue, Pick),
        (Blue, Pick),
        (Red, Pick),
    ]
};

/// Temps de réflexion par choix, en secondes (règle des tournois Riot).
pub const SECONDS_PER_TURN: u32 = 30;

/// Un choix de la draft. `role` : poste du joueur qui jouera le champion (picks).
#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
pub struct Action {
    pub side: Side,
    pub kind: Kind,
    pub champion: String,
    pub role: Option<Role>,
}

/// Ce que la draft rend au moteur : un joueur, son poste et son champion.
#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Pick {
    pub role: Role,
    pub person_id: String,
    pub champion: String,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum DraftError {
    Finished,
    WrongTurn { expected: (Side, Kind) },
    Banned(String),
    Picked(String),
    Fearless(String),
    MissingRole,
    RoleTaken(Role),
}

impl fmt::Display for DraftError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            DraftError::Finished => write!(f, "la draft est terminée"),
            DraftError::WrongTurn { expected } => {
                let side = match expected.0 {
                    Side::Blue => "bleu",
                    Side::Red => "rouge",
                };
                let kind = match expected.1 {
                    Kind::Ban => "bannir",
                    Kind::Pick => "choisir",
                };
                write!(f, "c'est au côté {side} de {kind}")
            }
            DraftError::Banned(c) => write!(f, "{c} est banni"),
            DraftError::Picked(c) => write!(f, "{c} est déjà choisi"),
            DraftError::Fearless(c) => {
                write!(f, "{c} a déjà été joué dans la série (draft Fearless)")
            }
            DraftError::MissingRole => write!(f, "un pick doit avoir un poste"),
            DraftError::RoleTaken(r) => write!(f, "le poste {} est déjà pris", r.label()),
        }
    }
}

impl std::error::Error for DraftError {}

/// Une draft en cours.
#[derive(Debug, Clone, Default, Serialize)]
pub struct Draft {
    pub actions: Vec<Action>,
    /// Champions joués dans les parties précédentes de la série : interdits aux deux
    /// équipes (draft Fearless, règle de la LEC).
    pub fearless: BTreeSet<String>,
}

impl Draft {
    pub fn new() -> Self {
        Self::default()
    }

    /// Partie suivante d'une série Fearless : `previous` = champions déjà joués.
    pub fn fearless(previous: impl IntoIterator<Item = String>) -> Self {
        Self {
            actions: Vec::new(),
            fearless: previous.into_iter().collect(),
        }
    }

    /// À qui de jouer, et quoi. `None` : draft terminée.
    pub fn turn(&self) -> Option<(Side, Kind)> {
        ORDER.get(self.actions.len()).copied()
    }

    pub fn is_done(&self) -> bool {
        self.turn().is_none()
    }

    /// Champion encore libre (ni banni, ni choisi, ni joué dans la série).
    pub fn is_free(&self, champion: &str) -> bool {
        !self.fearless.contains(champion) && !self.actions.iter().any(|a| a.champion == champion)
    }

    pub fn picks(&self, side: Side) -> impl Iterator<Item = &Action> {
        self.actions
            .iter()
            .filter(move |a| a.side == side && a.kind == Kind::Pick)
    }

    pub fn bans(&self, side: Side) -> impl Iterator<Item = &Action> {
        self.actions
            .iter()
            .filter(move |a| a.side == side && a.kind == Kind::Ban)
    }

    /// Postes encore sans champion.
    pub fn open_roles(&self, side: Side) -> Vec<Role> {
        Role::ALL
            .into_iter()
            .filter(|r| !self.picks(side).any(|a| a.role == Some(*r)))
            .collect()
    }

    /// Joue un choix après avoir vérifié les règles.
    pub fn apply(&mut self, action: Action) -> Result<(), DraftError> {
        let expected = self.turn().ok_or(DraftError::Finished)?;
        if (action.side, action.kind) != expected {
            return Err(DraftError::WrongTurn { expected });
        }
        if self.fearless.contains(&action.champion) {
            return Err(DraftError::Fearless(action.champion));
        }
        if let Some(prev) = self.actions.iter().find(|a| a.champion == action.champion) {
            return Err(match prev.kind {
                Kind::Ban => DraftError::Banned(action.champion),
                Kind::Pick => DraftError::Picked(action.champion),
            });
        }
        if action.kind == Kind::Pick {
            let role = action.role.ok_or(DraftError::MissingRole)?;
            if !self.open_roles(action.side).contains(&role) {
                return Err(DraftError::RoleTaken(role));
            }
        }
        self.actions.push(action);
        Ok(())
    }

    /// Les 5 picks d'un côté dans l'ordre des postes, avec les joueurs de l'équipe.
    /// `None` tant que la draft n'est pas finie.
    pub fn lineup(&self, side: Side, team: &DraftTeam) -> Option<Vec<Pick>> {
        if !self.is_done() {
            return None;
        }
        Role::ALL
            .into_iter()
            .map(|role| {
                let a = self.picks(side).find(|a| a.role == Some(role))?;
                let p = team.player(role)?;
                Some(Pick {
                    role,
                    person_id: p.person_id.clone(),
                    champion: a.champion.clone(),
                })
            })
            .collect()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn pick(side: Side, c: &str, role: Role) -> Action {
        Action {
            side,
            kind: Kind::Pick,
            champion: c.into(),
            role: Some(role),
        }
    }
    fn ban(side: Side, c: &str) -> Action {
        Action {
            side,
            kind: Kind::Ban,
            champion: c.into(),
            role: None,
        }
    }

    #[test]
    fn ordre_officiel() {
        let bans = ORDER.iter().filter(|(_, k)| *k == Kind::Ban).count();
        assert_eq!(bans, 10);
        for side in [Side::Blue, Side::Red] {
            assert_eq!(
                ORDER
                    .iter()
                    .filter(|(s, k)| *s == side && *k == Kind::Pick)
                    .count(),
                5
            );
        }
        assert_eq!(ORDER[6], (Side::Blue, Kind::Pick));
        assert_eq!(ORDER[12], (Side::Red, Kind::Ban));
        assert_eq!(ORDER[19], (Side::Red, Kind::Pick));
    }

    #[test]
    fn regles_respectees() {
        let mut d = Draft::fearless(["Azir".to_string()]);
        assert_eq!(
            d.apply(ban(Side::Red, "Ahri")),
            Err(DraftError::WrongTurn {
                expected: (Side::Blue, Kind::Ban)
            })
        );
        d.apply(ban(Side::Blue, "Ahri")).unwrap();
        assert_eq!(
            d.apply(ban(Side::Red, "Ahri")),
            Err(DraftError::Banned("Ahri".into()))
        );
        assert_eq!(
            d.apply(ban(Side::Red, "Azir")),
            Err(DraftError::Fearless("Azir".into()))
        );
        for c in ["Sylas", "Rakan", "Vi", "Jayce", "Lulu"] {
            let side = d.turn().unwrap().0;
            d.apply(ban(side, c)).unwrap();
        }
        d.apply(pick(Side::Blue, "Orianna", Role::Mid)).unwrap();
        d.apply(pick(Side::Red, "Syndra", Role::Mid)).unwrap();
        assert_eq!(
            d.apply(pick(Side::Red, "Viktor", Role::Mid)),
            Err(DraftError::RoleTaken(Role::Mid))
        );
        assert_eq!(
            d.apply(Action {
                role: None,
                ..pick(Side::Red, "Viktor", Role::Mid)
            }),
            Err(DraftError::MissingRole)
        );
        assert_eq!(d.open_roles(Side::Red).len(), 4);
    }
}
