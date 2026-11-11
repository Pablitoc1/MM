//! Une draft jouée par le joueur contre l'IA, et ce qu'en montre l'écran Draft.
//!
//! L'adversaire joue avec l'IA ; quand vient le tour du joueur, la session attend son
//! choix (`play`) ou le confie au coach (`delegate`, aussi utilisé quand le temps est
//! écoulé). `view` rend tout ce qu'affiche l'écran.

use mm_engine::SimRng;
use serde::Serialize;

use super::ai::{choose, rank, Candidate, Reason};
use super::knowledge::{DraftTeam, Knowledge};
use super::styles::{analyse, CompAnalysis, Style};
use super::{Action, Draft, DraftError, Kind, Pick, Role, RoleExt, Side, ORDER};

pub struct Session {
    pub k: Knowledge,
    pub blue: DraftTeam,
    pub red: DraftTeam,
    /// Côté du club du joueur.
    pub user: Side,
    pub draft: Draft,
    seed: u64,
}

/// Le tour en cours.
#[derive(Debug, Clone, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Turn {
    pub side: Side,
    pub kind: Kind,
    /// Numéro du choix, de 0 à 19.
    pub index: usize,
    pub phase: String,
    /// Poste conseillé pour un pick.
    pub role: Option<Role>,
}

/// Les choix suivants du même côté, d'affilée (« Ensuite : G2 choisit 2 champions »).
#[derive(Debug, Clone, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Next {
    pub side: Side,
    pub kind: Kind,
    pub count: usize,
}

#[derive(Debug, Clone, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Slot {
    pub role: Role,
    pub person_id: String,
    pub handle: String,
    pub champion: Option<String>,
    /// Nom affiché du champion (« Xin Zhao »).
    pub champion_name: Option<String>,
    pub current: bool,
}

/// Une case de la grille des champions.
#[derive(Debug, Clone, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Card {
    pub champion: String,
    pub name: String,
    /// Maîtrise du joueur (A à D) ; pour un ban, rang du champion sur le patch.
    pub letter: char,
    /// Victoires en compétition, en %, `None` sans partie.
    pub win_pct: Option<u32>,
    pub games: u32,
    pub tag: Option<String>,
    pub available: bool,
    pub advised: bool,
}

#[derive(Debug, Clone, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Advice {
    pub champion: String,
    pub name: String,
    pub role: Option<Role>,
    pub text: String,
}

/// « Ce que G2 prépare » : un joueur adverse sans pick et ses choix probables.
#[derive(Debug, Clone, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Threat {
    pub role: Role,
    pub person_id: String,
    pub handle: String,
    pub label: String,
    pub champions: Vec<String>,
}

#[derive(Debug, Clone, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct View {
    pub patch: String,
    pub user: Side,
    pub blue_team: String,
    pub red_team: String,
    pub turn: Option<Turn>,
    pub next: Option<Next>,
    pub blue_bans: Vec<String>,
    pub red_bans: Vec<String>,
    pub blue: Vec<Slot>,
    pub red: Vec<Slot>,
    /// Joueur dont la grille montre les champions (le nôtre au poste conseillé).
    pub focus: Role,
    pub focus_handle: String,
    pub cards: Vec<Card>,
    pub advice: Option<Advice>,
    /// Champion regardé (sélection du joueur, sinon conseil du coach).
    pub preview: Option<String>,
    pub comp_us: CompAnalysis,
    pub comp_them: CompAnalysis,
    /// Part physique de notre compo avant le champion regardé.
    pub physical_before: Option<f64>,
    pub curve_text: String,
    pub threats: Vec<Threat>,
    pub lineup_blue: Option<Vec<Pick>>,
    pub lineup_red: Option<Vec<Pick>>,
}

fn phase(index: usize) -> &'static str {
    match index {
        0..=5 => "Phase de bans 1",
        6..=11 => "Phase de picks 1",
        12..=15 => "Phase de bans 2",
        _ => "Phase de picks 2",
    }
}

/// Lettre de maîtrise d'après l'aisance du joueur (0 à 1). // estimé (paliers)
fn mastery_letter(comfort: f64) -> char {
    match comfort {
        c if c >= 0.85 => 'A',
        c if c >= 0.6 => 'B',
        c if c >= 0.3 => 'C',
        _ => 'D',
    }
}

impl Session {
    /// Nouvelle draft. L'IA joue tout de suite si l'adversaire commence.
    pub fn new(
        k: Knowledge,
        blue: DraftTeam,
        red: DraftTeam,
        user: Side,
        fearless: Vec<String>,
        seed: u64,
    ) -> Self {
        let mut s = Self {
            k,
            blue,
            red,
            user,
            draft: Draft::fearless(fearless),
            seed,
        };
        s.advance();
        s
    }

    /// Draft d'un match entre deux clubs de la base, à une date (AAAA-MM-JJ) :
    /// méta du patch en vigueur, titulaires des deux clubs.
    pub fn start(
        db: &mm_data::Db,
        blue: &str,
        red: &str,
        user: Side,
        date: &str,
        seed: u64,
    ) -> mm_data::rusqlite::Result<Self> {
        Ok(Self::new(
            Knowledge::load(db, date)?,
            DraftTeam::load(db, blue)?,
            DraftTeam::load(db, red)?,
            user,
            Vec::new(),
            seed,
        ))
    }

    fn team(&self, side: Side) -> &DraftTeam {
        match side {
            Side::Blue => &self.blue,
            Side::Red => &self.red,
        }
    }

    /// Choix du coach de l'équipe dont c'est le tour, avec son erreur. Tirage propre
    /// à chaque tour : le conseil affiché et « Déléguer » donnent le même champion.
    pub fn coach_choice(&self) -> Option<Action> {
        let (side, _) = self.draft.turn()?;
        let turn = self.draft.actions.len() as u64;
        let mut rng = SimRng::new(self.seed ^ turn.wrapping_mul(0x9E37_79B9_7F4A_7C15));
        choose(
            &self.draft,
            &self.k,
            self.team(side),
            self.team(side.other()),
            &mut rng,
        )
    }

    /// L'adversaire joue jusqu'au prochain tour du joueur (ou la fin).
    pub fn advance(&mut self) {
        while let Some((side, _)) = self.draft.turn() {
            if side == self.user {
                break;
            }
            let Some(a) = self.coach_choice() else {
                break;
            };
            self.draft
                .apply(a)
                .expect("l'IA ne propose que des choix valides");
        }
    }

    fn ranked(&self) -> Vec<Candidate> {
        let Some((side, _)) = self.draft.turn() else {
            return Vec::new();
        };
        rank(
            &self.draft,
            &self.k,
            self.team(side),
            self.team(side.other()),
        )
    }

    /// Choix du joueur. Pour un pick, `role` : poste visé, sinon le meilleur poste
    /// libre pour ce champion.
    pub fn play(&mut self, champion: &str, role: Option<Role>) -> Result<(), DraftError> {
        let (side, kind) = self.draft.turn().ok_or(DraftError::Finished)?;
        if side != self.user {
            return Err(DraftError::WrongTurn {
                expected: (side, kind),
            });
        }
        let role = match kind {
            Kind::Ban => None,
            Kind::Pick => role.or_else(|| self.best_role(champion)),
        };
        self.draft.apply(Action {
            side,
            kind,
            champion: champion.to_string(),
            role,
        })?;
        self.advance();
        Ok(())
    }

    /// Poste libre où le champion vaut le plus pour nous.
    fn best_role(&self, champion: &str) -> Option<Role> {
        if let Some(c) = self.ranked().into_iter().find(|c| c.champion == champion) {
            return c.role;
        }
        let info = self.k.champ(champion);
        let us = self.team(self.user);
        self.draft.open_roles(self.user).into_iter().max_by(|a, b| {
            let v = |r: Role| {
                info.map_or(0.0, |i| i.role_share[r.index()])
                    + us.player(r).map_or(0.0, |p| p.comfort(champion))
            };
            v(*a).total_cmp(&v(*b))
        })
    }

    /// Le coach choisit à la place du joueur (bouton « Déléguer », temps écoulé).
    pub fn delegate(&mut self) -> Result<(), DraftError> {
        let (side, kind) = self.draft.turn().ok_or(DraftError::Finished)?;
        if side != self.user {
            return Err(DraftError::WrongTurn {
                expected: (side, kind),
            });
        }
        let a = self.coach_choice().ok_or(DraftError::Finished)?;
        self.draft.apply(a)?;
        self.advance();
        Ok(())
    }

    fn slots(&self, side: Side, current: Option<(Side, Role)>) -> Vec<Slot> {
        let team = self.team(side);
        Role::ALL
            .into_iter()
            .map(|role| {
                let p = team.player(role);
                let champion = self
                    .draft
                    .picks(side)
                    .find(|a| a.role == Some(role))
                    .map(|a| a.champion.clone());
                Slot {
                    champion_name: champion.as_deref().map(|c| self.name(c)),
                    champion,
                    role,
                    person_id: p.map_or(String::new(), |p| p.person_id.clone()),
                    handle: p.map_or(String::new(), |p| p.handle.clone()),
                    current: current == Some((side, role)),
                }
            })
            .collect()
    }

    fn name(&self, champion: &str) -> String {
        self.k
            .champ(champion)
            .map_or(champion.to_string(), |c| c.name.clone())
    }

    /// Ce que montre l'écran. `focus` : poste dont on regarde les champions (sinon
    /// celui du conseil) ; `preview` : champion sélectionné dans la grille.
    pub fn view(&self, focus: Option<Role>, preview: Option<&str>) -> View {
        let turn = self.draft.turn();
        let ranked = self.ranked();
        let user_turn = turn.is_some_and(|(s, _)| s == self.user);
        let coach = self.coach_choice().filter(|_| user_turn);
        let best = coach
            .as_ref()
            .and_then(|a| ranked.iter().find(|c| c.champion == a.champion));
        let advice = best.map(|c| Advice {
            champion: c.champion.clone(),
            name: self.name(&c.champion),
            role: c.role,
            text: self.advice_text(c, turn.map(|t| t.1)),
        });
        let open = self.draft.open_roles(self.user);
        let focus = focus
            .filter(|r| open.contains(r))
            .or(advice.as_ref().and_then(|a| a.role))
            .or(open.first().copied())
            .unwrap_or(Role::Mid);
        let current_role = match turn {
            Some((side, Kind::Pick)) if side == self.user => Some(focus),
            Some((_, Kind::Pick)) => ranked.first().and_then(|c| c.role),
            _ => None,
        };
        let current = turn.zip(current_role).map(|((s, _), r)| (s, r));
        let us = self.team(self.user);

        // Grille : nos champions au poste regardé (tour de pick), ou les bans conseillés.
        let mut cards = Vec::new();
        let ban_turn = matches!(turn, Some((s, Kind::Ban)) if s == self.user);
        if ban_turn {
            for c in ranked.iter().take(10) {
                let info = self.k.champ(&c.champion);
                cards.push(Card {
                    champion: c.champion.clone(),
                    name: self.name(&c.champion),
                    letter: info.and_then(|i| i.tier).unwrap_or('D'),
                    win_pct: info.map(|i| (i.win * 100.0).round() as u32),
                    games: 0,
                    tag: c.reasons.first().map(|r| r.text(&self.k)),
                    available: true,
                    advised: Some(&c.champion) == advice.as_ref().map(|a| &a.champion),
                });
            }
        } else if let Some(p) = us.player(focus) {
            let mut pool: Vec<(&String, &(u32, u32, f64))> = p.pool.iter().collect();
            pool.sort_by(|a, b| b.1 .2.total_cmp(&a.1 .2).then(a.0.cmp(b.0)));
            let mut ids: Vec<String> = pool.iter().take(10).map(|(c, _)| (*c).clone()).collect();
            if let Some(a) = advice.as_ref().filter(|a| a.role == Some(focus)) {
                if !ids.contains(&a.champion) {
                    ids.insert(0, a.champion.clone());
                    ids.truncate(10);
                }
            }
            for c in ids {
                let (games, wins, _) = p.pool.get(&c).copied().unwrap_or((0, 0, 0.0));
                let available = self.draft.is_free(&c);
                let advised = advice
                    .as_ref()
                    .is_some_and(|a| a.champion == c && a.role == Some(focus));
                let reasons = ranked
                    .iter()
                    .find(|r| r.champion == c)
                    .map(|r| r.reasons.as_slice())
                    .unwrap_or(&[]);
                let tag = if advised {
                    Some("Conseil du coach".to_string())
                } else if !available {
                    Some(self.taken_label(&c))
                } else {
                    reasons
                        .iter()
                        .find(|r| matches!(r, Reason::Counter { .. } | Reason::Balance { .. }))
                        .map(|r| r.text(&self.k))
                        .or_else(|| (games < 3).then(|| "Peu joué".to_string()))
                };
                cards.push(Card {
                    name: self.name(&c),
                    letter: mastery_letter(p.comfort(&c)),
                    win_pct: (games > 0)
                        .then(|| (100.0 * wins as f64 / games as f64).round() as u32),
                    games,
                    tag,
                    available,
                    advised,
                    champion: c,
                });
            }
        }

        // Compo : la nôtre avec le champion regardé.
        let mine: Vec<&str> = self
            .draft
            .picks(self.user)
            .map(|a| a.champion.as_str())
            .collect();
        let theirs: Vec<&str> = self
            .draft
            .picks(self.user.other())
            .map(|a| a.champion.as_str())
            .collect();
        let preview = preview
            .map(str::to_string)
            .or_else(|| {
                advice
                    .as_ref()
                    .filter(|_| !ban_turn)
                    .map(|a| a.champion.clone())
            })
            .filter(|c| self.draft.is_free(c));
        let mut with = mine.clone();
        if let Some(p) = &preview {
            with.push(p);
        }
        let comp_us = analyse(&with, &self.k);
        let comp_them = analyse(&theirs, &self.k);
        let physical_before =
            (preview.is_some() && !mine.is_empty()).then(|| analyse(&mine, &self.k).physical);

        View {
            patch: self.k.patch.clone(),
            user: self.user,
            blue_team: self.blue.name.clone(),
            red_team: self.red.name.clone(),
            turn: turn.map(|(side, kind)| Turn {
                side,
                kind,
                index: self.draft.actions.len(),
                phase: phase(self.draft.actions.len()).to_string(),
                role: if kind == Kind::Pick {
                    current_role
                } else {
                    None
                },
            }),
            next: self.next(),
            blue_bans: self
                .draft
                .bans(Side::Blue)
                .map(|a| a.champion.clone())
                .collect(),
            red_bans: self
                .draft
                .bans(Side::Red)
                .map(|a| a.champion.clone())
                .collect(),
            blue: self.slots(Side::Blue, current),
            red: self.slots(Side::Red, current),
            focus,
            focus_handle: us.player(focus).map_or(String::new(), |p| p.handle.clone()),
            cards,
            advice,
            preview,
            curve_text: self.curve_text(&comp_us, &comp_them),
            comp_us,
            comp_them,
            physical_before,
            threats: self.threats(),
            lineup_blue: self.draft.lineup(Side::Blue, &self.blue),
            lineup_red: self.draft.lineup(Side::Red, &self.red),
        }
    }

    fn taken_label(&self, c: &str) -> String {
        if self.draft.fearless.contains(c) {
            return "Déjà joué (Fearless)".into();
        }
        match self.draft.actions.iter().find(|a| a.champion == c) {
            Some(a) if a.kind == Kind::Ban => "Banni".into(),
            _ => "Déjà choisi".into(),
        }
    }

    fn advice_text(&self, c: &Candidate, kind: Option<Kind>) -> String {
        let name = self.name(&c.champion);
        // Les raisons commencent par une majuscule (rapport) : en milieu de phrase,
        // seule la première lettre passe en minuscule (les pseudos ne sont jamais en tête).
        let why: Vec<String> = c
            .reasons
            .iter()
            .map(|r| {
                let text = r.text(&self.k);
                let mut chars = text.chars();
                chars.next().map_or(String::new(), |f| {
                    f.to_lowercase().collect::<String>() + chars.as_str()
                })
            })
            .collect();
        let why = if why.is_empty() {
            "le meilleur choix restant".to_string()
        } else {
            why.join(", ")
        };
        match kind {
            Some(Kind::Ban) => format!("« Bannissez {name} : {why}. »"),
            _ => format!("« {name} : {why}. »"),
        }
    }

    fn next(&self) -> Option<Next> {
        let i = self.draft.actions.len();
        let (side, kind) = *ORDER.get(i)?;
        // Le groupe en cours, puis le groupe suivant.
        let mut j = i;
        while ORDER.get(j) == Some(&(side, kind)) {
            j += 1;
        }
        let (ns, nk) = *ORDER.get(j)?;
        let count = ORDER[j..].iter().take_while(|t| **t == (ns, nk)).count();
        Some(Next {
            side: ns,
            kind: nk,
            count,
        })
    }

    fn curve_text(&self, us: &CompAnalysis, them: &CompAnalysis) -> String {
        let me = &self.team(self.user).name;
        let other = &self.team(self.user.other()).name;
        let label = [
            "en début de partie",
            "en milieu de partie",
            "en fin de partie",
        ];
        let diff: Vec<f64> = (0..3).map(|t| us.curve[t] - them.curve[t]).collect();
        let best = (0..3)
            .max_by(|a, b| diff[*a].total_cmp(&diff[*b]))
            .unwrap_or(0);
        let worst = (0..3)
            .min_by(|a, b| diff[*a].total_cmp(&diff[*b]))
            .unwrap_or(2);
        match (diff[best] > 3.0, diff[worst] < -3.0) {
            (true, true) => format!(
                "{me} est plus fort {}. {other} prend l'avantage {}.",
                label[best], label[worst]
            ),
            (true, false) => format!("{me} est plus fort {}.", label[best]),
            (false, true) => format!("{other} est plus fort {}.", label[worst]),
            _ => "Les deux compositions s'équilibrent sur toute la partie.".to_string(),
        }
    }

    fn threats(&self) -> Vec<Threat> {
        let them_side = self.user.other();
        let them = self.team(them_side);
        // Ses choix probables : force sur le patch au poste et aisance du joueur.
        let mut out = Vec::new();
        for role in self.draft.open_roles(them_side) {
            let Some(p) = them.player(role) else { continue };
            let mut picks: Vec<(String, f64)> = self
                .k
                .champs
                .keys()
                .filter(|c| self.draft.is_free(c))
                .filter_map(|c| {
                    let info = self.k.champ(c)?;
                    let share = info.role_share[role.index()];
                    let comfort = p.comfort(c);
                    (share >= 0.08 || comfort >= 0.3)
                        .then(|| (c.clone(), info.power() * share.sqrt() + 0.9 * comfort))
                })
                .collect();
            picks.sort_by(|a, b| b.1.total_cmp(&a.1).then(a.0.cmp(&b.0)));
            let champions: Vec<String> = picks.into_iter().take(3).map(|p| p.0).collect();
            if champions.is_empty() {
                continue;
            }
            let in_pool = champions.iter().all(|c| p.comfort(c) >= 0.3);
            let label = if in_pool {
                "pool restant".to_string()
            } else {
                let styles = self.k.champ(&champions[0]).map_or([0.0; 5], |i| i.styles);
                let s = (0..5)
                    .max_by(|a, b| styles[*a].total_cmp(&styles[*b]))
                    .unwrap_or(4);
                format!("{} probable", Style::ALL[s].label().to_lowercase())
            };
            out.push(Threat {
                role,
                person_id: p.person_id.clone(),
                handle: p.handle.clone(),
                label,
                champions,
            });
        }
        out
    }
}

#[cfg(test)]
mod tests {
    use std::collections::{BTreeMap, HashMap};

    use super::super::knowledge::{ChampInfo, DraftPlayer};
    use super::*;

    fn world() -> (Knowledge, DraftTeam, DraftTeam) {
        let mut champs = BTreeMap::new();
        for (ri, role) in Role::ALL.into_iter().enumerate() {
            for i in 0..10 {
                let id = format!("{}{i}", role.label());
                let mut role_share = [0.0; 5];
                role_share[ri] = 1.0;
                champs.insert(
                    id.clone(),
                    ChampInfo {
                        id: id.clone(),
                        name: id,
                        tier: Some(['D', 'D', 'D', 'D', 'C', 'C', 'C', 'B', 'B', 'A'][i]),
                        presence: i as f64 / 10.0,
                        win: 0.45 + 0.01 * i as f64,
                        role_share,
                        physical: if ri % 2 == 0 { 0.3 } else { 0.7 },
                        styles: [0.3; 5],
                        curve: [0.0; 3],
                    },
                );
            }
        }
        let team = |name: &str, fav: usize| DraftTeam {
            id: name.into(),
            name: name.into(),
            coach: 0.8,
            players: Role::ALL
                .into_iter()
                .map(|r| DraftPlayer {
                    person_id: format!("{name}-{}", r.label()),
                    handle: format!("{name}{}", r.label()),
                    role: r,
                    pool: HashMap::from([(format!("{}{fav}", r.label()), (40, 25, 15.0))]),
                })
                .collect(),
        };
        let k = Knowledge {
            patch: "26.1".into(),
            champs,
            matchups: HashMap::new(),
        };
        (k, team("KC", 5), team("G2", 7))
    }

    #[test]
    fn le_joueur_drafte_contre_l_ia() {
        let (k, kc, g2) = world();
        let mut s = Session::new(k, kc, g2, Side::Red, vec![], 3);
        // Côté rouge : le bleu a déjà banni.
        assert_eq!(s.draft.actions.len(), 1);
        let v = s.view(None, None);
        assert_eq!(v.turn.as_ref().unwrap().side, Side::Red);
        let advice = v.advice.clone().unwrap();
        assert!(advice.text.starts_with("« Bannissez"));
        assert_eq!(v.cards.len(), 10);
        // Le joueur suit le conseil, puis délègue tout le reste.
        s.play(&advice.champion, None).unwrap();
        while s.draft.turn().is_some() {
            s.delegate().unwrap();
        }
        let v = s.view(None, None);
        assert!(v.turn.is_none());
        assert_eq!(v.lineup_red.unwrap().len(), 5);
        assert_eq!(v.blue_bans.len(), 5);
    }

    #[test]
    fn grille_de_nos_champions_au_tour_de_pick() {
        let (k, kc, g2) = world();
        let mut s = Session::new(k, kc, g2, Side::Blue, vec![], 9);
        while s.draft.turn().is_some_and(|t| t.1 == Kind::Ban) {
            s.delegate().unwrap();
        }
        let v = s.view(Some(Role::Top), None);
        assert_eq!(v.turn.as_ref().unwrap().kind, Kind::Pick);
        assert_eq!(v.focus, Role::Top);
        assert_eq!(v.focus_handle, "KCTop");
        let fav = v.cards.iter().find(|c| c.champion == "Top5").unwrap();
        assert_eq!(fav.letter, 'A');
        assert_eq!(fav.win_pct, Some(63));
        assert!(v.preview.is_some());
        assert_eq!(v.threats.len(), 5);
        // Pas son tour : erreur claire.
        let theirs = s.view(None, None).advice.unwrap().champion;
        s.play(&theirs, None).unwrap();
        assert_ne!(s.draft.turn().map(|t| t.0), None);
    }

    #[test]
    fn suite_de_la_draft() {
        let (k, kc, g2) = world();
        let s = Session::new(k, kc, g2, Side::Blue, vec![], 1);
        let n = s.view(None, None).next.unwrap();
        assert_eq!((n.side, n.kind, n.count), (Side::Red, Kind::Ban, 1));
    }
}
