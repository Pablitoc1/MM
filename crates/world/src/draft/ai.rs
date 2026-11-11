//! IA de draft. Elle sert à l'équipe adverse, à la draft déléguée au coach et au
//! « Conseil du coach ». À chaque tour, elle note les champions libres :
//! - pick : force sur le patch au poste, aisance du joueur, équilibre de la compo
//!   (dégâts, styles), duel contre l'adversaire direct déjà choisi, et le fait de
//!   priver l'adversaire d'un de ses champions favoris ;
//! - ban : danger du champion entre les mains des joueurs adverses encore sans pick,
//!   moins l'envie qu'on a de le jouer soi-même.
//!
//! Le coach choisit parmi les meilleurs avec une erreur qui dépend de son niveau :
//! un bon coach prend presque toujours le meilleur choix. Poids : voir la note 012.

use mm_engine::SimRng;
use serde::Serialize;

use super::knowledge::{DraftTeam, Knowledge};
use super::{Action, Draft, Kind, Role, RoleExt, Side};

/// Pourquoi un champion est proposé (affiché dans « Conseil du coach »).
#[derive(Debug, Clone, PartialEq, Serialize)]
#[serde(tag = "kind", rename_all = "camelCase")]
pub enum Reason {
    /// Rang de la grille sur le patch.
    Meta { tier: char },
    /// Champion bien maîtrisé par le joueur (parties en compétition).
    Comfort { handle: String, games: u32 },
    /// Champion jamais ou presque jamais joué en compétition par le joueur.
    Unplayed { handle: String },
    /// Bon duel contre l'adversaire direct déjà choisi.
    Counter { against: String },
    /// Rééquilibre les dégâts (part physique de la compo après ce pick, 0 à 1).
    Balance { physical: f64 },
    /// Retire à l'adversaire un champion qu'il maîtrise.
    Deny { handle: String },
}

impl Reason {
    /// Phrase de l'écran Draft.
    pub fn text(&self, k: &Knowledge) -> String {
        match self {
            Reason::Meta { tier } => format!("Rang {tier} sur le patch {}", k.patch),
            Reason::Comfort { handle, games } => {
                format!("{games} parties en compétition pour {handle}")
            }
            Reason::Unplayed { handle } => format!("Peu joué par {handle}"),
            Reason::Counter { against } => {
                let name = k.champ(against).map_or(against.as_str(), |c| &c.name);
                format!("Contre {name}")
            }
            Reason::Balance { physical } => format!(
                "Équilibre les dégâts ({:.0} % phys.)",
                (physical * 100.0).round()
            ),
            Reason::Deny { handle } => format!("Prive {handle} de son champion"),
        }
    }
}

/// Un choix possible, noté.
#[derive(Debug, Clone, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Candidate {
    pub champion: String,
    pub role: Option<Role>,
    pub score: f64,
    pub reasons: Vec<Reason>,
}

impl Candidate {
    pub fn action(&self, side: Side, kind: Kind) -> Action {
        Action {
            side,
            kind,
            champion: self.champion.clone(),
            role: self.role,
        }
    }
}

// Poids de la note d'un pick. // estimé (réglés pour que l'IA retrouve les vrais
// picks LEC : voir le rapport de la démo)
const W_META: f64 = 1.0;
const W_COMFORT: f64 = 0.9;
const UNPLAYED: f64 = -0.35;
const W_COUNTER: f64 = 2.0;
const W_BALANCE: f64 = 0.8;
const W_STYLE: f64 = 0.15;
const W_DENY: f64 = 0.25;
const W_FLEX: f64 = 0.1;
/// Part minimale d'un poste pour qu'un champion y soit envisagé sans que le joueur
/// le maîtrise.
const MIN_ROLE_SHARE: f64 = 0.08;

/// Tous les choix possibles pour l'équipe dont c'est le tour, du meilleur au moins
/// bon, sans erreur de coach. Vide si la draft est finie.
pub fn rank(draft: &Draft, k: &Knowledge, us: &DraftTeam, them: &DraftTeam) -> Vec<Candidate> {
    let Some((side, kind)) = draft.turn() else {
        return Vec::new();
    };
    let mut out = match kind {
        Kind::Pick => rank_picks(draft, k, side, us, them),
        Kind::Ban => rank_bans(draft, k, side, us, them),
    };
    out.sort_by(|a, b| {
        b.score
            .total_cmp(&a.score)
            .then_with(|| a.champion.cmp(&b.champion))
    });
    out
}

/// Note d'un champion `c` au poste `role` pour l'équipe `team` qui a déjà `mine`.
fn pick_value(
    k: &Knowledge,
    team: &DraftTeam,
    role: Role,
    c: &str,
    mine: &[&str],
    reasons: &mut Vec<Reason>,
) -> Option<f64> {
    let info = k.champ(c)?;
    let player = team.player(role);
    let comfort = player.map_or(0.0, |p| p.comfort(c));
    let share = info.role_share[role.index()];
    if share < MIN_ROLE_SHARE && comfort < 0.3 {
        return None;
    }
    // La force du patch ne compte qu'au poste où le champion est vraiment joué.
    let mut score = W_META * info.power() * share.max(comfort * 0.5).min(1.0);
    if let Some(t @ ('A' | 'B')) = info.tier {
        reasons.push(Reason::Meta { tier: t });
    }
    if let Some(p) = player {
        score += W_COMFORT * comfort;
        let games = p.pool.get(c).map_or(0, |e| e.0);
        if comfort >= 0.6 {
            reasons.push(Reason::Comfort {
                handle: p.handle.clone(),
                games,
            });
        } else if games < 3 {
            score += UNPLAYED;
            reasons.push(Reason::Unplayed {
                handle: p.handle.clone(),
            });
        }
    }
    // Équilibre des dégâts : au-delà de 70 % d'un type, la compo devient facile à
    // contrer (armure ou résistance magique). // estimé
    let n = mine.len() as f64 + 1.0;
    let physical = (mine
        .iter()
        .filter_map(|m| k.champ(m))
        .map(|i| i.physical)
        .sum::<f64>()
        + info.physical)
        / n;
    if n >= 3.0 {
        let excess = (physical - 0.5).abs() - 0.2;
        if excess > 0.0 {
            score -= W_BALANCE * excess * 2.0;
        } else if mine.len() >= 2 {
            let before = mine
                .iter()
                .filter_map(|m| k.champ(m))
                .map(|i| i.physical)
                .sum::<f64>()
                / mine.len() as f64;
            if (before - 0.5).abs() > 0.2 {
                score += W_BALANCE * 0.15;
                reasons.push(Reason::Balance { physical });
            }
        }
    }
    // Cohérence de style : un champion qui renforce ce que la compo fait déjà.
    if !mine.is_empty() {
        let mut team_styles = [0.0; 5];
        for m in mine.iter().filter_map(|m| k.champ(m)) {
            for (s, v) in team_styles.iter_mut().zip(m.styles) {
                *s += v / mine.len() as f64;
            }
        }
        let fit: f64 = team_styles
            .iter()
            .zip(info.styles)
            .map(|(a, b)| a * b)
            .sum();
        score += W_STYLE * fit;
        // Une compo sans engage en cherche un. // estimé
        if mine.len() >= 2 && team_styles[0] < 0.4 && info.styles[0] >= 1.0 {
            score += W_STYLE;
        }
    }
    // Flexible : joué à plusieurs postes, il cache nos intentions.
    if info.role_share.iter().filter(|s| **s >= 0.15).count() >= 2 {
        score += W_FLEX;
    }
    Some(score)
}

fn rank_picks(
    draft: &Draft,
    k: &Knowledge,
    side: Side,
    us: &DraftTeam,
    them: &DraftTeam,
) -> Vec<Candidate> {
    let mine: Vec<&str> = draft.picks(side).map(|a| a.champion.as_str()).collect();
    let theirs: Vec<(Role, &str)> = draft
        .picks(side.other())
        .filter_map(|a| Some((a.role?, a.champion.as_str())))
        .collect();
    let their_open = draft.open_roles(side.other());
    let mut out = Vec::new();
    for c in k.champs.keys().filter(|c| draft.is_free(c)) {
        let mut best: Option<Candidate> = None;
        for role in draft.open_roles(side) {
            let mut reasons = Vec::new();
            let Some(mut score) = pick_value(k, us, role, c, &mine, &mut reasons) else {
                continue;
            };
            if let Some((_, against)) = theirs.iter().find(|(r, _)| *r == role) {
                let (edge, games) = k.matchup(role, c, against);
                score += W_COUNTER * edge;
                if edge >= 0.04 && games >= 3 {
                    reasons.push(Reason::Counter {
                        against: against.to_string(),
                    });
                }
            }
            // Priver l'adversaire : son joueur encore sans pick le maîtrise.
            if let Some(p) = their_open
                .iter()
                .filter_map(|r| them.player(*r))
                .max_by(|a, b| a.comfort(c).total_cmp(&b.comfort(c)))
            {
                let deny = p.comfort(c) * k.champ(c).map_or(0.0, |i| i.power().max(0.0));
                if deny > 0.6 {
                    reasons.push(Reason::Deny {
                        handle: p.handle.clone(),
                    });
                }
                score += W_DENY * deny;
            }
            if best.as_ref().is_none_or(|b| score > b.score) {
                best = Some(Candidate {
                    champion: c.clone(),
                    role: Some(role),
                    score,
                    reasons,
                });
            }
        }
        out.extend(best);
    }
    out
}

fn rank_bans(
    draft: &Draft,
    k: &Knowledge,
    side: Side,
    us: &DraftTeam,
    them: &DraftTeam,
) -> Vec<Candidate> {
    let theirs: Vec<&str> = draft
        .picks(side.other())
        .map(|a| a.champion.as_str())
        .collect();
    let mine: Vec<&str> = draft.picks(side).map(|a| a.champion.as_str()).collect();
    let mut out = Vec::new();
    for c in k.champs.keys().filter(|c| draft.is_free(c)) {
        // Danger : ce que vaudrait ce champion pour l'adversaire, à son meilleur poste
        // encore libre.
        let mut danger: Option<(f64, Vec<Reason>)> = None;
        for role in draft.open_roles(side.other()) {
            let mut reasons = Vec::new();
            if let Some(v) = pick_value(k, them, role, c, &theirs, &mut reasons) {
                if danger.as_ref().is_none_or(|d| v > d.0) {
                    reasons.retain(|r| !matches!(r, Reason::Unplayed { .. }));
                    if let Some(p) = them.player(role) {
                        if p.comfort(c) >= 0.6 {
                            reasons.retain(|r| !matches!(r, Reason::Comfort { .. }));
                            reasons.push(Reason::Deny {
                                handle: p.handle.clone(),
                            });
                        }
                    }
                    danger = Some((v, reasons));
                }
            }
        }
        let Some((mut score, reasons)) = danger else {
            continue;
        };
        // On ne bannit pas ce qu'on veut jouer.
        let want = draft
            .open_roles(side)
            .into_iter()
            .filter_map(|r| pick_value(k, us, r, c, &mine, &mut Vec::new()))
            .fold(0.0f64, f64::max);
        score -= 0.5 * want.max(0.0);
        out.push(Candidate {
            champion: c.clone(),
            role: None,
            score,
            reasons,
        });
    }
    out
}

/// Écart-type de l'erreur du coach sur la note d'un choix : 0,05 pour le meilleur
/// coach, 0,40 pour le plus faible. // estimé
pub fn coach_error(coach: f64) -> f64 {
    0.05 + 0.35 * (1.0 - coach.clamp(0.0, 1.0))
}

/// Tirage d'une loi normale centrée réduite (Box-Muller), déterministe.
fn normal(rng: &mut SimRng) -> f64 {
    let u1 = rng.next_f64().max(1e-12);
    let u2 = rng.next_f64();
    (-2.0 * u1.ln()).sqrt() * (2.0 * std::f64::consts::PI * u2).cos()
}

/// Choix de l'équipe dont c'est le tour, avec l'erreur de son coach.
/// `None` si la draft est finie ou si aucun champion n'est possible.
pub fn choose(
    draft: &Draft,
    k: &Knowledge,
    us: &DraftTeam,
    them: &DraftTeam,
    rng: &mut SimRng,
) -> Option<Action> {
    let (side, kind) = draft.turn()?;
    let sd = coach_error(us.coach);
    rank(draft, k, us, them)
        .into_iter()
        .take(15)
        .map(|c| {
            let noisy = c.score + sd * normal(rng);
            (noisy, c)
        })
        .max_by(|a, b| a.0.total_cmp(&b.0))
        .map(|(_, c)| c.action(side, kind))
}

/// Draft complète jouée par l'IA des deux côtés.
pub fn auto_draft(
    k: &Knowledge,
    blue: &DraftTeam,
    red: &DraftTeam,
    fearless: impl IntoIterator<Item = String>,
    rng: &mut SimRng,
) -> Draft {
    let mut draft = Draft::fearless(fearless);
    while let Some((side, _)) = draft.turn() {
        let (us, them) = match side {
            Side::Blue => (blue, red),
            Side::Red => (red, blue),
        };
        match choose(&draft, k, us, them, rng) {
            Some(a) => draft
                .apply(a)
                .expect("l'IA ne propose que des choix valides"),
            None => break,
        }
    }
    draft
}

#[cfg(test)]
mod tests {
    use std::collections::{BTreeMap, HashMap};

    use super::super::knowledge::{ChampInfo, DraftPlayer};
    use super::*;

    /// Un petit monde : 50 champions, 10 par poste, de forces croissantes.
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
                        win: 0.45 + 0.02 * i as f64,
                        role_share,
                        physical: if ri % 2 == 0 { 0.2 } else { 0.8 },
                        styles: [0.3; 5],
                        curve: [0.0; 3],
                    },
                );
            }
        }
        let team = |name: &str, fav: usize| DraftTeam {
            id: name.into(),
            name: name.into(),
            coach: 1.0,
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
    fn draft_complete_et_valide() {
        let (k, kc, g2) = world();
        let d = auto_draft(&k, &kc, &g2, [], &mut SimRng::new(7));
        assert!(d.is_done());
        let blue = d.lineup(Side::Blue, &kc).unwrap();
        let red = d.lineup(Side::Red, &g2).unwrap();
        assert_eq!(blue.len(), 5);
        // Chaque champion est joué à son poste.
        for p in blue.iter().chain(&red) {
            assert!(p.champion.starts_with(p.role.label()), "{p:?}");
        }
    }

    #[test]
    fn meme_graine_meme_draft() {
        let (k, kc, g2) = world();
        let a = auto_draft(&k, &kc, &g2, [], &mut SimRng::new(42));
        let b = auto_draft(&k, &kc, &g2, [], &mut SimRng::new(42));
        assert_eq!(a.actions, b.actions);
    }

    #[test]
    fn fearless_respecte() {
        let (k, kc, g2) = world();
        let first = auto_draft(&k, &kc, &g2, [], &mut SimRng::new(1));
        let played: Vec<String> = first
            .actions
            .iter()
            .filter(|a| a.kind == Kind::Pick)
            .map(|a| a.champion.clone())
            .collect();
        let second = auto_draft(&k, &kc, &g2, played.clone(), &mut SimRng::new(2));
        assert!(second.is_done());
        assert!(second.actions.iter().all(|a| !played.contains(&a.champion)));
    }

    #[test]
    fn on_bannit_les_favoris_adverses() {
        let (k, kc, g2) = world();
        let ranked = rank(&Draft::new(), &k, &kc, &g2);
        // G2 maîtrise ses champions n°7 (rang B) : ils doivent être en haut des bans.
        let top: Vec<&str> = ranked.iter().take(5).map(|c| c.champion.as_str()).collect();
        assert!(
            top.iter().filter(|c| c.ends_with('7')).count() >= 3,
            "{top:?}"
        );
    }

    #[test]
    fn un_bon_coach_se_trompe_moins() {
        // Sans champion favori chez G2, les bans se jouent sur la méta : les
        // écarts sont faibles et l'erreur du coach compte.
        let (k, mut kc, mut g2) = world();
        for p in &mut g2.players {
            p.pool.clear();
        }
        let ranked = rank(&Draft::new(), &k, &kc, &g2);
        let top: Vec<&str> = ranked.iter().take(5).map(|c| c.champion.as_str()).collect();
        let mut hits = |coach: f64| {
            kc.coach = coach;
            (0..300)
                .filter(|s| {
                    let a = choose(&Draft::new(), &k, &kc, &g2, &mut SimRng::new(*s)).unwrap();
                    top.contains(&a.champion.as_str())
                })
                .count()
        };
        let good = hits(1.0);
        let weak = hits(0.0);
        assert!(good > weak + 30, "bon {good}, faible {weak}");
    }
}
