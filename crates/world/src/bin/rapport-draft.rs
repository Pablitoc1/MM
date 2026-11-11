//! `just rapport-draft` : l'IA de draft rejouée sur les vraies drafts de la LEC 2025.
//!
//! Pour chaque vraie partie, on rejoue la draft telle qu'elle s'est passée et, à chaque
//! tour, on demande à l'IA son classement : le vrai choix est-il son premier choix,
//! dans ses 5 premiers ? Comparé à un classement naïf (présence sur le patch).
//! Les joueurs de 2025 ne sont pas tous dans la base : les équipes sont vues sans
//! leurs champions favoris (méta, compo et duels seulement).
//! Résultat écrit dans `docs/demo/draft/rapport-ia.md`.

use std::collections::HashMap;
use std::fmt::Write as _;
use std::path::PathBuf;

use mm_data::Db;
use mm_world::draft::{
    rank, Action, Draft, DraftPlayer, DraftTeam, Kind, Knowledge, Role, RoleExt, Side,
};

fn anonymous(name: &str) -> DraftTeam {
    DraftTeam {
        id: name.into(),
        name: name.into(),
        coach: 1.0,
        players: Role::ALL
            .into_iter()
            .map(|role| DraftPlayer {
                person_id: String::new(),
                handle: role.label().into(),
                role,
                pool: HashMap::new(),
            })
            .collect(),
    }
}

#[derive(Default)]
struct Score {
    n: u32,
    top1: u32,
    top5: u32,
    naive5: u32,
}

impl Score {
    fn line(&self, label: &str) -> String {
        let p = |x: u32| 100.0 * x as f64 / self.n.max(1) as f64;
        format!(
            "| {label} | {} | {:.0} % | {:.0} % | {:.0} % |",
            self.n,
            p(self.top1),
            p(self.top5),
            p(self.naive5)
        )
    }
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let root = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../..");
    let db = Db::open_read_only(&root.join("data/seed/world.sqlite"))?;
    let games = db.pro_drafts("2025-01-01", "2025-12-31", Some("LEC"))?;
    let mut by_patch: HashMap<String, Knowledge> = HashMap::new();
    let (mut picks, mut bans) = (Score::default(), Score::default());
    let blue = anonymous("Bleu");
    let red = anonymous("Rouge");
    for g in &games {
        if !by_patch.contains_key(&g.patch) {
            by_patch.insert(g.patch.clone(), Knowledge::load(&db, &g.date)?);
        }
        let k = &by_patch[&g.patch];
        let mut draft = Draft::new();
        for (side, kind, champ, role) in &g.actions {
            let Some((s, kd)) = draft.turn() else { break };
            let side = if side == "B" { Side::Blue } else { Side::Red };
            let kind = if kind == "ban" { Kind::Ban } else { Kind::Pick };
            if (s, kd) != (side, kind) || !k.champs.contains_key(champ) {
                break;
            }
            let (us, them) = match side {
                Side::Blue => (&blue, &red),
                Side::Red => (&red, &blue),
            };
            let ranked = rank(&draft, k, us, them);
            let pos = ranked.iter().position(|c| &c.champion == champ);
            let mut naive: Vec<_> = k.champs.values().filter(|c| draft.is_free(&c.id)).collect();
            naive.sort_by(|a, b| b.presence.total_cmp(&a.presence));
            let naive_pos = naive.iter().position(|c| &c.id == champ);
            let sc = if kind == Kind::Pick {
                &mut picks
            } else {
                &mut bans
            };
            sc.n += 1;
            sc.top1 += (pos == Some(0)) as u32;
            sc.top5 += pos.is_some_and(|p| p < 5) as u32;
            sc.naive5 += naive_pos.is_some_and(|p| p < 5) as u32;
            let role = Role::from_code(role);
            if kind == Kind::Pick && role.is_none() {
                break;
            }
            if draft
                .apply(Action {
                    side,
                    kind,
                    champion: champ.clone(),
                    role,
                })
                .is_err()
            {
                break;
            }
        }
    }
    let mut out = String::new();
    writeln!(
        out,
        "# IA de draft contre les vraies drafts de la LEC 2025\n"
    )?;
    writeln!(
        out,
        "Généré par `just rapport-draft` sur {} parties de LEC 2025. À chaque tour, la vraie \
         draft est rejouée jusque-là, puis l'IA classe les champions libres. Les équipes \
         sont vues sans leurs champions favoris (les joueurs de 2025 ne sont pas tous dans \
         la base) : la maîtrise des joueurs, qui compte dans le jeu, n'aide pas ici.\n",
        games.len()
    )?;
    writeln!(
        out,
        "| Tour | Choix | Vrai choix = 1er de l'IA | Dans les 5 premiers de l'IA | Dans les 5 plus présents du patch |"
    )?;
    writeln!(out, "|---|---|---|---|---|")?;
    writeln!(out, "{}", picks.line("Picks"))?;
    writeln!(out, "{}", bans.line("Bans"))?;
    let dir = root.join("docs/demo/draft");
    std::fs::create_dir_all(&dir)?;
    std::fs::write(dir.join("rapport-ia.md"), &out)?;
    print!("{out}");
    Ok(())
}
