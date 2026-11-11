//! Simule des parties sans interface et les compare aux vraies parties de la LEC.
//!
//! Exemple : `just sim KC G2 --n 100 --report docs/demo/M3/rapport-farm.md --replay partie.json`

use std::fmt::Write as _;
use std::path::PathBuf;

use mm_data::read::Db;
use mm_engine::sim::{simulate, MatchSetup, Snapshot};
use mm_world::lineup::lineup;

const ROLES: [&str; 5] = ["top", "jungle", "mid", "bot", "support"];
const ROLE_FR: [&str; 5] = ["Haut", "Jungle", "Milieu", "Bas", "Support"];

struct Args {
    teams: [String; 2],
    n: u64,
    seed: u64,
    minutes: f64,
    report: Option<PathBuf>,
    replay: Option<PathBuf>,
}

fn args() -> Args {
    let mut a = Args {
        teams: ["KC".into(), "G2".into()],
        n: 100,
        seed: 1,
        minutes: 15.0,
        report: None,
        replay: None,
    };
    let mut it = std::env::args().skip(1);
    let mut pos = 0;
    while let Some(x) = it.next() {
        let mut val = || it.next().unwrap_or_default();
        match x.as_str() {
            "--n" => a.n = val().parse().unwrap_or(100),
            "--seed" => a.seed = val().parse().unwrap_or(1),
            "--minutes" => a.minutes = val().parse().unwrap_or(15.0),
            "--report" => a.report = Some(val().into()),
            "--replay" => a.replay = Some(val().into()),
            t if pos < 2 => {
                a.teams[pos] = t.to_string();
                pos += 1;
            }
            other => eprintln!("argument ignoré : {other}"),
        }
    }
    a
}

/// Moyenne et écart-type.
fn mean_sd(v: &[f64]) -> (f64, f64) {
    let n = v.len().max(1) as f64;
    let m = v.iter().sum::<f64>() / n;
    let var = v.iter().map(|x| (x - m) * (x - m)).sum::<f64>() / n;
    (m, var.sqrt())
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let a = args();
    let root = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../..");
    let db = Db::open_read_only(&root.join("data/seed/world.sqlite"))?;
    let reference: serde_json::Value = serde_json::from_str(&std::fs::read_to_string(
        root.join("data/reference/lec-2025.json"),
    )?)?;
    let lec = db.teams("LEC")?;
    let find = |tag: &str| {
        lec.iter()
            .find(|t| {
                t.short
                    .as_deref()
                    .is_some_and(|s| s.eq_ignore_ascii_case(tag))
                    || t.id == tag
            })
            .ok_or_else(|| format!("club LEC introuvable : {tag}"))
    };
    let (blue, red) = (find(&a.teams[0])?, find(&a.teams[1])?);
    let mut taken = Vec::new();
    let teams = [
        lineup(&db, blue, &mut taken)?,
        lineup(&db, red, &mut taken)?,
    ];
    let setup = |seed| MatchSetup {
        seed,
        patch: "26.1".into(),
        teams: teams.clone(),
        duration: a.minutes * 60.0,
        context: None,
    };

    // Les 10 joueurs × les parties : instantanés à 10 et 15 minutes.
    let mut at10: Vec<Vec<Snapshot>> = vec![Vec::new(); 5];
    let mut at15: Vec<Vec<Snapshot>> = vec![Vec::new(); 5];
    let (mut wards, mut recalls) = (vec![0.0; 5], vec![0.0; 5]);
    let start = std::time::Instant::now();
    for k in 0..a.n {
        let r = simulate(&setup(a.seed + k));
        if k == 0 {
            if let Some(path) = &a.replay {
                std::fs::write(path, serde_json::to_string(&r.replay)?)?;
            }
        }
        for (i, p) in r.players.iter().enumerate() {
            at10[i % 5].push(p.at10);
            at15[i % 5].push(p.at15);
            wards[i % 5] += f64::from(p.wards);
            recalls[i % 5] += f64::from(p.recalls);
        }
    }
    let per_game = start.elapsed().as_secs_f64() / a.n.max(1) as f64;
    let same = simulate(&setup(a.seed)).players == simulate(&setup(a.seed)).players;

    let mut out = String::new();
    writeln!(out, "# Rapport de farm (M3)\n")?;
    writeln!(
        out,
        "{} parties de {} min, {} (bleu) contre {} (rouge), graines {} à {}. Sans combat entre champions (M4).",
        a.n,
        a.minutes,
        teams[0].tag,
        teams[1].tag,
        a.seed,
        a.seed + a.n - 1
    )?;
    writeln!(
        out,
        "Référence : {}.\n",
        reference["source"].as_str().unwrap_or("?")
    )?;
    for (title, idx) in [("Joueurs", 0), ("Champions", 1)] {
        let names: Vec<String> = teams
            .iter()
            .map(|t| {
                t.players
                    .iter()
                    .map(|p| {
                        if idx == 0 {
                            p.name.clone()
                        } else {
                            p.champion.id.clone()
                        }
                    })
                    .collect::<Vec<_>>()
                    .join(", ")
            })
            .collect();
        writeln!(out, "- {title} : {} / {}", names[0], names[1])?;
    }
    writeln!(out)?;
    type Metric<'a> = (
        &'a str,
        &'a str,
        &'a Vec<Vec<Snapshot>>,
        fn(&Snapshot) -> f64,
    );
    let metrics: [Metric; 5] = [
        ("CS à 10 min", "csat10", &at10, |s| f64::from(s.cs)),
        ("Or à 10 min", "goldat10", &at10, |s| s.gold),
        ("XP à 10 min", "xpat10", &at10, |s| s.xp),
        ("CS à 15 min", "csat15", &at15, |s| f64::from(s.cs)),
        ("Or à 15 min", "goldat15", &at15, |s| s.gold),
    ];
    for (title, key, data, get) in metrics {
        writeln!(out, "## {title}\n")?;
        writeln!(
            out,
            "| Rôle | Simulé | LEC 2025 | Écart |\n|---|---|---|---|"
        )?;
        for r in 0..5 {
            let v: Vec<f64> = data[r].iter().map(get).collect();
            let (m, sd) = mean_sd(&v);
            let real = &reference["roles"][ROLES[r]][key];
            let (rm, rsd) = (
                real[0].as_f64().unwrap_or(0.0),
                real[1].as_f64().unwrap_or(0.0),
            );
            let gap = if rm > 0.0 { (m - rm) / rm * 100.0 } else { 0.0 };
            writeln!(
                out,
                "| {} | {m:.1} ± {sd:.1} | {rm:.1} ± {rsd:.1} | {gap:+.0} % |",
                ROLE_FR[r]
            )?;
        }
        writeln!(out)?;
    }
    writeln!(out, "## Autres mesures\n")?;
    let n = (a.n * 2).max(1) as f64;
    for r in 0..5 {
        writeln!(
            out,
            "- {} : {:.1} balises, {:.1} retours à la base par partie",
            ROLE_FR[r],
            wards[r] / n,
            recalls[r] / n
        )?;
    }
    writeln!(
        out,
        "\nMême graine, même partie : {}. Temps de calcul : {:.0} ms par partie.",
        if same { "oui" } else { "NON" },
        per_game * 1000.0
    )?;
    print!("{out}");
    if let Some(path) = &a.report {
        std::fs::write(path, &out)?;
    }
    Ok(())
}
