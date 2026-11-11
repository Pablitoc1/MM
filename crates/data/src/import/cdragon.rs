//! Sorts des champions du patch de départ, lus dans les fichiers du jeu (note 011).
//!
//! Source principale : CommunityDragon (raw.communitydragon.org), qui publie les fichiers de
//! données du client pour chaque patch. On y lit, pour chaque sort, les valeurs par rang, les
//! formules de dégâts (ratios), les temps de recharge, les coûts et les portées.
//! Complément : Meraki Analytics (cdn.merakianalytics.com) pour le type de dégâts et les
//! contrôles quand le fichier du jeu ne les nomme pas. Meraki n'est plus tenu à jour (patch 25.x) :
//! il ne sert jamais pour un chiffre que les fichiers du jeu donnent.

use std::collections::BTreeMap;

use mm_engine::kit::{
    Cc, CcKind, DamageType, Formula, Kit, Ratio, Spell, Stat, StatPart, Targeting,
};
use rusqlite::{params, Transaction};
use serde_json::Value;

use super::http::Fetcher;
use super::Result;

/// Patch des fichiers du jeu (26.1 = version 16.1 du client).
pub const CDRAGON_VERSION: &str = "16.1";
const CDRAGON: &str = "https://raw.communitydragon.org";
const MERAKI: &str =
    "https://cdn.merakianalytics.com/riot/lol/resources/latest/en-US/champions.json";
const SLOTS: [&str; 4] = ["Q", "W", "E", "R"];

/// Niveau du champion retenu quand un ratio change avec le niveau (milieu de partie).
const MID_LEVEL: usize = 9; // estimé (niveau moyen vers 15 min en LEC)

pub fn import(fetch: &Fetcher, tx: &Transaction, champions: &[String]) -> Result<String> {
    let meraki = fetch.get_json(MERAKI)?;
    let mut stmt = tx.prepare("INSERT INTO champion_kits (champion, data) VALUES (?1, ?2)")?;
    let (mut spells, mut damage, mut cc, mut meraki_used) = (0, 0, 0, 0);
    for id in champions {
        let folder = id.to_lowercase();
        let url =
            format!("{CDRAGON}/{CDRAGON_VERSION}/game/data/characters/{folder}/{folder}.bin.json");
        let bin = fetch.get_json(&url)?;
        let kit = kit_from_bin(id, &bin, meraki.get(id))
            .ok_or_else(|| format!("sorts introuvables pour {id}"))?;
        for s in &kit.spells {
            spells += 1;
            damage += usize::from(s.damage.is_some());
            cc += usize::from(!s.cc.is_empty());
            meraki_used += usize::from(s.source.contains("meraki"));
        }
        stmt.execute(params![id, serde_json::to_string(&kit)?])?;
    }
    Ok(format!(
        "{} champions, {spells} sorts ({damage} avec dégâts, {cc} avec contrôle, \
         {meraki_used} complétés par Meraki)",
        champions.len()
    ))
}

const ITEMS: &str = "game/items.cdtb.bin.json";

/// Stats des objets de la Faille de l'invocateur (carte 11 de Data Dragon), lues dans le fichier
/// des objets du patch. Prix total et nom français : Data Dragon (table `items`).
pub fn import_items(fetch: &Fetcher, tx: &Transaction) -> Result<String> {
    let bin = fetch.get_json(&format!("{CDRAGON}/{CDRAGON_VERSION}/{ITEMS}"))?;
    let rows: Vec<(u32, String, f64, String)> = {
        let mut st = tx.prepare("SELECT id, name, gold, data FROM items")?;
        let rows = st
            .query_map([], |r| Ok((r.get(0)?, r.get(1)?, r.get(2)?, r.get(3)?)))?
            .collect::<rusqlite::Result<_>>()?;
        rows
    };
    let mut stmt = tx.prepare("INSERT INTO item_stats (id, data) VALUES (?1, ?2)")?;
    let mut n = 0;
    for (id, name, gold, data) in rows {
        let dd: Value = serde_json::from_str(&data)?;
        if dd["maps"]["11"] != Value::Bool(true) || gold <= 0.0 {
            continue;
        }
        let Some(v) = bin.get(format!("Items/{id}")) else {
            continue;
        };
        let item = mm_engine::item::Item {
            id,
            name,
            gold,
            stats: item_stats(v),
        };
        stmt.execute(params![id, serde_json::to_string(&item)?])?;
        n += 1;
    }
    Ok(format!("{n} objets"))
}

fn item_stats(v: &Value) -> mm_engine::item::ItemStats {
    // Les fichiers stockent des f32 : on arrondit (0.30000001 → 0.3).
    let f = |k: &str| (v[k].as_f64().unwrap_or(0.0) * 1e4).round() / 1e4;
    mm_engine::item::ItemStats {
        attack_damage: f("mFlatPhysicalDamageMod"),
        ability_power: f("mFlatMagicDamageMod"),
        health: f("mFlatHPPoolMod"),
        mana: f("flatMPPoolMod") + f("mFlatMPPoolMod"),
        armor: f("mFlatArmorMod"),
        magic_resist: f("mFlatSpellBlockMod"),
        attack_speed: f("mPercentAttackSpeedMod"),
        crit_chance: f("mFlatCritChanceMod"),
        crit_damage: f("mFlatCritDamageMod"),
        ability_haste: f("mAbilityHasteMod"),
        move_speed: f("mFlatMovementSpeedMod"),
        move_speed_pct: f("mPercentMovementSpeedMod"),
        armor_pen_pct: f("mPercentArmorPenetrationMod"),
        // La létalité n'est pas une stat du fichier : c'est une valeur nommée de l'objet.
        lethality: v["mDataValues"]
            .as_array()
            .into_iter()
            .flatten()
            .find(|d| d["mName"] == "LethalityAmount" || d["mName"] == "Lethality")
            .and_then(|d| d["mValue"].as_f64())
            .unwrap_or(0.0),
        magic_pen: f("mFlatMagicPenetrationMod"),
        magic_pen_pct: f("mPercentMagicPenetrationMod"),
        life_steal: f("mPercentLifeStealMod"),
    }
}

/// Les quatre sorts d'un champion à partir de son fichier `<champion>.bin.json`.
pub fn kit_from_bin(id: &str, bin: &Value, meraki: Option<&Value>) -> Option<Kit> {
    let root = bin
        .as_object()?
        .iter()
        .find(|(k, _)| k.ends_with("CharacterRecords/Root"))?
        .1;
    let names = root["spells"].as_array()?;
    let mut spells = Vec::new();
    for (i, slot) in SLOTS.iter().enumerate() {
        let obj = &bin[names.get(i)?.as_str()?];
        let m = meraki.map(|m| &m["abilities"][*slot][0]);
        spells.push(spell(slot, obj, m)?);
    }
    Some(Kit {
        champion: id.to_string(),
        spells,
    })
}

/// Contexte d'évaluation d'un sort : ses valeurs nommées, ses calculs, ses valeurs d'effet.
struct Ctx<'a> {
    values: BTreeMap<&'a str, Vec<f64>>,
    calcs: &'a serde_json::Map<String, Value>,
    effects: Vec<Vec<f64>>,
}

fn floats(v: &Value) -> Vec<f64> {
    v.as_array()
        .map(|a| a.iter().filter_map(Value::as_f64).collect())
        .unwrap_or_default()
}

fn spell(slot: &str, obj: &Value, meraki: Option<&Value>) -> Option<Spell> {
    let sp = &obj["mSpell"];
    let empty = serde_json::Map::new();
    let ctx = Ctx {
        values: sp["DataValues"]
            .as_array()
            .map(|a| {
                a.iter()
                    .filter_map(|d| Some((d["mName"].as_str()?, floats(&d["mValues"]))))
                    .collect()
            })
            .unwrap_or_default(),
        calcs: sp["mSpellCalculations"].as_object().unwrap_or(&empty),
        effects: sp["mEffectAmount"]
            .as_array()
            .map(|a| a.iter().map(|e| floats(&e["value"])).collect())
            .unwrap_or_default(),
    };
    let ranks = if slot == "R" { 3 } else { 5 };
    // `cooldownTime` et les valeurs nommées commencent au rang 0 ; `mana` au rang 1.
    let per_rank = |v: &[f64], from: usize| -> Vec<f64> {
        (0..ranks)
            .map(|r| v.get(r + from).copied().unwrap_or(0.0))
            .collect()
    };
    let first = |key: &str| floats(&sp[key]).get(1).copied();
    let range = first("castRangeDisplayOverride")
        .or_else(|| first("castRange"))
        .unwrap_or(0.0)
        .clamp(0.0, 25_000.0);
    let missile_speed = sp["missileSpeed"].as_f64().unwrap_or(0.0);
    let width = sp["mLineWidth"].as_f64().unwrap_or(0.0);
    let targeting = match sp["mTargetingTypeData"]["__type"].as_str() {
        Some("Self") => Targeting::SelfCast,
        Some("Area" | "AreaClamped" | "SelfAoe" | "TerrainLocation" | "TerrainType") => {
            Targeting::Area
        }
        Some(
            "Location" | "LocationClamped" | "Direction" | "DragDirection" | "Cone"
            | "WallDetection",
        ) => {
            if missile_speed > 0.0 || width > 0.0 {
                Targeting::Skillshot
            } else {
                Targeting::Area
            }
        }
        _ => Targeting::Unit,
    };

    let mut sources = vec![format!("cdragon {CDRAGON_VERSION}")];
    // Dégâts fixes et dégâts en pourcentage des PV max de la cible, rangés à part.
    let mut damage = None;
    let mut max_health = None;
    for key in damage_calcs(obj, ctx.calcs) {
        let Some(f) = formula(&ctx, key, ranks) else {
            continue;
        };
        let shown_as_percent = ctx.calcs[key]["mDisplayAsPercent"].as_bool() == Some(true);
        let fraction = f.by_level.is_none() && f.base.iter().all(|b| b.abs() < 1.0);
        if shown_as_percent || fraction {
            max_health.get_or_insert(f);
        } else {
            damage.get_or_insert(f);
        }
    }
    if damage.is_none() && max_health.is_some() {
        let base: Vec<f64> = (1..=ranks)
            .map(|r| {
                ctx.value(Some("BaseDamage"), r)
                    .max(ctx.value(Some("Damage"), r))
            })
            .collect();
        if base.iter().any(|b| *b > 0.0) {
            damage = Some(Formula {
                base,
                ..Default::default()
            });
        }
    }
    if damage.is_none() {
        if let Some(f) = meraki.and_then(|m| meraki_formula(m, ranks)) {
            damage = Some(f);
            sources.push("meraki (dégâts)".into());
        }
    }
    let damage_type = match obj["BotData"]["DamageTag"].as_i64() {
        Some(0) => DamageType::Physical,
        Some(2) => DamageType::True,
        Some(_) => DamageType::Magic,
        None => match meraki.and_then(|m| m["damageType"].as_str()) {
            Some("PHYSICAL_DAMAGE") => DamageType::Physical,
            Some("TRUE_DAMAGE") => DamageType::True,
            Some(_) => DamageType::Magic,
            None => {
                let ad = damage
                    .as_ref()
                    .is_some_and(|f| f.ratios.iter().any(|r| r.stat == Stat::AttackDamage));
                if ad {
                    DamageType::Physical
                } else {
                    DamageType::Magic
                }
            }
        },
    };
    let named = |word: &str| {
        let mut keys: Vec<&String> = ctx
            .calcs
            .keys()
            .filter(|k| {
                let l = k.to_lowercase();
                l.contains(word) && !excluded(&l)
            })
            .collect();
        keys.sort_by_key(|k| (!k.to_lowercase().contains("total"), k.len()));
        keys.first().and_then(|k| formula(&ctx, k, ranks))
    };
    let mut cc = cc_from_values(&ctx.values, ranks);
    if cc.is_empty() {
        if let Some(m) = meraki {
            cc = cc_from_meraki(m, ranks);
            if !cc.is_empty() {
                sources.push("meraki (contrôles)".into());
            }
        }
    }
    Some(Spell {
        slot: slot.to_string(),
        name: obj["mScriptName"]
            .as_str()
            .or_else(|| obj["ObjectName"].as_str())
            .unwrap_or_default()
            .to_string(),
        cooldown: per_rank(&floats(&sp["cooldownTime"]), 1),
        cost: per_rank(&floats(&sp["mana"]), 0),
        range,
        radius: first("castRadius").unwrap_or(0.0),
        width,
        missile_speed,
        cast_time: sp["mCastTime"].as_f64().unwrap_or(0.25),
        targeting,
        damage,
        max_health_damage: max_health,
        damage_type,
        heal: named("heal"),
        shield: named("shield"),
        cc,
        source: sources.join(", "),
    })
}

/// Mots qui désignent une variante (contre les sbires, info-bulle, pourcentage…), pas la valeur principale.
fn excluded(name: &str) -> bool {
    [
        "minion",
        "monster",
        "tooltip",
        "reduction",
        "percent",
        "ratio",
        "mod",
        "multiplier",
        "increase",
        "amp",
        "{",
        "tt",
        "pct",
        "bonus",
        "max",
    ]
    .iter()
    .any(|w| name.contains(w))
}

/// Les calculs qui donnent les dégâts du sort, du plus probable au moins probable : celui que
/// l'IA des bots de Riot utilise, puis les calculs nommés « …Damage ».
fn damage_calcs<'a>(obj: &Value, calcs: &'a serde_json::Map<String, Value>) -> Vec<&'a str> {
    let mut out = Vec::new();
    let bot = obj["BotData"]["{6d548702}"]["mFormulaParts"][0]["mSpellCalculationKey"].as_str();
    if let Some((k, _)) = bot.and_then(|b| calcs.get_key_value(b)) {
        out.push(k.as_str());
    }
    let mut keys: Vec<&String> = calcs
        .keys()
        .filter(|k| {
            let l = k.to_lowercase();
            l.contains("damage") && !excluded(&l)
        })
        .collect();
    keys.sort_by_key(|k| (!k.to_lowercase().contains("total"), k.len()));
    for k in keys {
        if !out.contains(&k.as_str()) {
            out.push(k.as_str());
        }
    }
    out
}

/// Forme linéaire : constante + terme selon le niveau + ratios.
#[derive(Clone, Default)]
struct Lin {
    c: f64,
    lvl: Option<Vec<f64>>,
    ratios: Vec<(Stat, StatPart, f64)>,
}

impl Lin {
    fn constant(c: f64) -> Self {
        Lin {
            c,
            ..Default::default()
        }
    }

    fn is_constant(&self) -> bool {
        self.lvl.is_none() && self.ratios.is_empty()
    }

    fn add(mut self, o: Lin) -> Lin {
        self.c += o.c;
        self.lvl = match (self.lvl, o.lvl) {
            (Some(a), Some(b)) => Some(a.iter().zip(&b).map(|(x, y)| x + y).collect()),
            (a, b) => a.or(b),
        };
        self.ratios.extend(o.ratios);
        self
    }

    fn scale(mut self, k: f64) -> Lin {
        self.c *= k;
        if let Some(l) = &mut self.lvl {
            l.iter_mut().for_each(|x| *x *= k);
        }
        self.ratios.iter_mut().for_each(|r| r.2 *= k);
        self
    }

    /// Produit. Deux termes variables : on garde le premier, évalué au milieu de partie.
    fn mul(self, o: Lin) -> Lin {
        if o.is_constant() {
            return self.scale(o.c);
        }
        if self.is_constant() {
            return o.scale(self.c);
        }
        if self.ratios.is_empty() {
            let k = self.lvl.as_ref().map_or(0.0, |l| l[MID_LEVEL - 1]) + self.c;
            return o.scale(k);
        }
        let k = o.lvl.as_ref().map_or(0.0, |l| l[MID_LEVEL - 1]) + o.c;
        self.scale(k)
    }

    /// Valeur sans les ratios (pour un coefficient qui varie avec le niveau).
    fn mid_value(&self) -> f64 {
        self.c + self.lvl.as_ref().map_or(0.0, |l| l[MID_LEVEL - 1])
    }
}

fn stat(code: i64) -> Stat {
    match code {
        0 => Stat::AbilityPower,
        1 => Stat::Armor,
        2 => Stat::AttackDamage,
        4 => Stat::AttackSpeed,
        6 => Stat::MagicResist,
        7 => Stat::MoveSpeed,
        12 => Stat::Health,
        29 => Stat::Lethality,
        _ => Stat::Other,
    }
}

fn stat_part(code: i64) -> StatPart {
    match code {
        1 => StatPart::Base,
        2 => StatPart::Bonus,
        _ => StatPart::Total,
    }
}

fn by_level(f: impl Fn(f64) -> f64) -> Lin {
    Lin {
        lvl: Some((1..=18).map(|l| f(f64::from(l))).collect()),
        ..Default::default()
    }
}

impl Ctx<'_> {
    fn value(&self, name: Option<&str>, rank: usize) -> f64 {
        name.and_then(|n| {
            self.values.get(n).or_else(|| {
                self.values
                    .iter()
                    .find(|(k, _)| k.eq_ignore_ascii_case(n))
                    .map(|(_, v)| v)
            })
        })
        .and_then(|v| v.get(rank))
        .copied()
        .unwrap_or(0.0)
    }

    fn calc(&self, key: &str, rank: usize, depth: u32) -> Lin {
        let Some(c) = self.calcs.get(key) else {
            return Lin::default();
        };
        if depth > 8 {
            return Lin::default();
        }
        let mut lin = if c["__type"] == "GameCalculationModified" {
            match c["mModifiedGameCalculation"].as_str() {
                Some(k) => self.calc(k, rank, depth + 1),
                None => Lin::default(),
            }
        } else {
            let parts = c["mFormulaParts"].as_array().cloned().unwrap_or_default();
            parts
                .iter()
                .fold(Lin::default(), |acc, p| acc.add(self.part(p, rank, depth)))
        };
        if c.get("mMultiplier").is_some() {
            lin = lin.mul(self.part(&c["mMultiplier"], rank, depth));
        }
        lin
    }

    fn part(&self, p: &Value, rank: usize, depth: u32) -> Lin {
        let num = |k: &str| p[k].as_f64().unwrap_or(0.0);
        // Une stat que le moteur ne suit pas (coups critiques…) compte pour zéro.
        let stat_ratio = |coef: f64| match stat(p["mStat"].as_i64().unwrap_or(0)) {
            Stat::Other => Lin::default(),
            s => Lin {
                ratios: vec![(s, stat_part(p["mStatFormula"].as_i64().unwrap_or(0)), coef)],
                ..Default::default()
            },
        };
        match p["__type"].as_str().unwrap_or_default() {
            "NamedDataValueCalculationPart" => {
                Lin::constant(self.value(p["mDataValue"].as_str(), rank))
            }
            "NumberCalculationPart" => Lin::constant(num("mNumber")),
            "EffectValueCalculationPart" => {
                let i = p["mEffectIndex"].as_u64().unwrap_or(1).max(1) as usize - 1;
                Lin::constant(
                    self.effects
                        .get(i)
                        .and_then(|v| v.get(rank))
                        .copied()
                        .unwrap_or(0.0),
                )
            }
            "StatByCoefficientCalculationPart" => stat_ratio(num("mCoefficient")),
            "StatByNamedDataValueCalculationPart" => {
                stat_ratio(self.value(p["mDataValue"].as_str(), rank))
            }
            "StatBySubPartCalculationPart" => {
                stat_ratio(self.part(&p["mSubpart"], rank, depth).mid_value())
            }
            "AbilityResourceByCoefficientCalculationPart" => Lin {
                ratios: vec![(Stat::Mana, StatPart::Total, num("mCoefficient"))],
                ..Default::default()
            },
            "SumOfSubPartsCalculationPart" => p["mSubparts"]
                .as_array()
                .map(|a| {
                    a.iter()
                        .fold(Lin::default(), |acc, s| acc.add(self.part(s, rank, depth)))
                })
                .unwrap_or_default(),
            "ProductOfSubPartsCalculationPart" => self
                .part(&p["mPart1"], rank, depth)
                .mul(self.part(&p["mPart2"], rank, depth)),
            "ByCharLevelInterpolationCalculationPart" => {
                let (a, b) = (num("mStartValue"), num("mEndValue"));
                by_level(|l| a + (b - a) * (l - 1.0) / 17.0)
            }
            "ByCharLevelBreakpointsCalculationPart" => {
                let start = num("mLevel1Value");
                let initial = num("mInitialBonusPerLevel");
                let bps = p["mBreakpoints"].as_array().cloned().unwrap_or_default();
                by_level(|l| {
                    let mut v = start + initial * (l - 1.0);
                    for b in &bps {
                        let at = b["mLevel"].as_f64().unwrap_or(99.0);
                        if l >= at {
                            v += b["mAdditionalBonusAtThisLevel"].as_f64().unwrap_or(0.0);
                            v += b["mBonusPerLevelAtAndAfter"].as_f64().unwrap_or(0.0)
                                * (l - at + 1.0);
                        }
                    }
                    v
                })
            }
            "ByCharLevelFormulaCalculationPart" => {
                let v = floats(&p["mValues"]);
                by_level(|l| v.get(l as usize - 1).copied().unwrap_or(0.0))
            }
            // Référence à un autre calcul du même sort.
            "{f3cbe7b2}" => match p["mSpellCalculationKey"].as_str() {
                Some(k) => self.calc(k, rank, depth + 1),
                None => Lin::default(),
            },
            // Cumuls (charges, marques) : dépendent de la partie, comptés à zéro.
            _ => Lin::default(),
        }
    }
}

/// Évalue le calcul `key` à chaque rang.
fn formula(ctx: &Ctx, key: &str, ranks: usize) -> Option<Formula> {
    let lins: Vec<Lin> = (1..=ranks).map(|r| ctx.calc(key, r, 0)).collect();
    let mut ratios: Vec<Ratio> = Vec::new();
    for (r, lin) in lins.iter().enumerate() {
        for &(stat, part, coef) in &lin.ratios {
            let i = match ratios.iter().position(|x| x.stat == stat && x.part == part) {
                Some(i) => i,
                None => {
                    ratios.push(Ratio {
                        stat,
                        part,
                        coef: vec![0.0; ranks],
                    });
                    ratios.len() - 1
                }
            };
            ratios[i].coef[r] += coef;
        }
    }
    ratios.retain(|r| r.stat != Stat::Other && r.coef.iter().any(|c| *c != 0.0));
    let f = Formula {
        base: lins.iter().map(|l| l.c).collect(),
        by_level: lins[0].lvl.clone(),
        ratios,
    };
    let nothing = f.base.iter().all(|b| *b == 0.0) && f.by_level.is_none() && f.ratios.is_empty();
    (!nothing).then_some(f)
}

const CC_WORDS: [(&str, CcKind); 16] = [
    ("stun", CcKind::Stun),
    ("root", CcKind::Root),
    ("snare", CcKind::Root),
    ("knockup", CcKind::Knockup),
    ("knockback", CcKind::Knockup),
    ("airborne", CcKind::Knockup),
    ("charm", CcKind::Charm),
    ("fear", CcKind::Fear),
    ("flee", CcKind::Fear),
    ("taunt", CcKind::Taunt),
    ("silence", CcKind::Silence),
    ("sleep", CcKind::Sleep),
    ("suppress", CcKind::Suppress),
    ("ground", CcKind::Ground),
    ("blind", CcKind::Blind),
    ("slow", CcKind::Slow),
];

/// Contrôles lus dans les valeurs nommées du sort (« StunDuration », « SlowPercent »…).
fn cc_from_values(values: &BTreeMap<&str, Vec<f64>>, ranks: usize) -> Vec<Cc> {
    let mut out: Vec<Cc> = Vec::new();
    for (word, kind) in CC_WORDS {
        let matching: Vec<(&str, &Vec<f64>)> = values
            .iter()
            .filter(|(n, _)| {
                let l = n.to_lowercase();
                l.contains(word)
                    && ![
                        "minion", "monster", "radius", "range", "width", "speed", "aoe",
                    ]
                    .iter()
                    .any(|w| l.contains(w))
            })
            .map(|(n, v)| (*n, v))
            .collect();
        let per_rank = |v: &Vec<f64>| -> Vec<f64> {
            (1..=ranks)
                .map(|r| v.get(r).copied().unwrap_or(0.0))
                .collect()
        };
        let duration = matching
            .iter()
            .find(|(n, _)| n.to_lowercase().contains("duration"))
            .map(|(_, v)| per_rank(v));
        if kind == CcKind::Slow {
            let amount = matching
                .iter()
                .find(|(n, _)| !n.to_lowercase().contains("duration"))
                .map(|(_, v)| {
                    per_rank(v)
                        .into_iter()
                        .map(|x| {
                            if x.abs() > 1.0 {
                                x.abs() / 100.0
                            } else {
                                x.abs()
                            }
                        })
                        .collect::<Vec<f64>>()
                });
            // Sinon, un bonus de vitesse négatif (« MoveSpeedMod » à -0,8) donne le ralentissement.
            let amount = amount.filter(|a| a.iter().any(|x| *x > 0.0)).or_else(|| {
                duration.as_ref()?;
                values
                    .iter()
                    .find(|(n, v)| {
                        n.to_lowercase().contains("movespeed")
                            && v.get(1).is_some_and(|x| (-1.0..0.0).contains(x))
                    })
                    .map(|(_, v)| per_rank(v).into_iter().map(f64::abs).collect())
            });
            if let Some(amount) = amount.filter(|a| a.iter().all(|x| (0.0..=1.0).contains(x))) {
                out.push(Cc {
                    kind,
                    duration: duration.unwrap_or_else(|| vec![1.0; ranks]), // estimé (durée non nommée)
                    amount,
                });
            }
            continue;
        }
        if out.iter().any(|c| c.kind == kind) {
            continue;
        }
        let duration = match duration {
            Some(d) => Some(d),
            // Projection sans durée nommée : environ 0,75 s en l'air (estimé, valeur courante du jeu).
            None if kind == CcKind::Knockup && !matching.is_empty() => Some(vec![0.75; ranks]),
            None => None,
        };
        if let Some(duration) = duration.filter(|d| d.iter().any(|x| *x > 0.0)) {
            out.push(Cc {
                kind,
                duration,
                amount: Vec::new(),
            });
        }
    }
    out
}

/// Première durée « for N seconds » dans la phrase qui suit.
fn seconds_after(text: &str) -> Option<f64> {
    let sentence = text.split(". ").next()?;
    let at = sentence.find("for ")?;
    let rest = &sentence[at + 4..];
    let num: String = rest
        .chars()
        .take_while(|c| c.is_ascii_digit() || *c == '.')
        .collect();
    let d: f64 = num.parse().ok()?;
    rest[num.len()..]
        .trim_start()
        .starts_with("second")
        .then_some(d)
        .filter(|d| *d > 0.0 && *d <= 5.0)
}

/// Attribut Meraki d'un sort (« Stun Duration », « Magic Damage »…).
fn meraki_leveling(ability: &Value, pred: impl Fn(&str) -> bool) -> Option<&Value> {
    ability["effects"].as_array()?.iter().find_map(|e| {
        e["leveling"]
            .as_array()?
            .iter()
            .find(|l| pred(&l["attribute"].as_str().unwrap_or_default().to_lowercase()))
    })
}

fn meraki_formula(ability: &Value, ranks: usize) -> Option<Formula> {
    let lv = meraki_leveling(ability, |a| a.contains("damage") && !a.contains("minion"))?;
    let mut f = Formula::default();
    for m in lv["modifiers"].as_array()? {
        let values: Vec<f64> = floats(&m["values"]);
        let unit = m["units"][0].as_str().unwrap_or_default();
        let per_rank: Vec<f64> = (0..ranks)
            .map(|r| values.get(r).or(values.last()).copied().unwrap_or(0.0))
            .collect();
        let ratio = |stat, part| Ratio {
            stat,
            part,
            coef: per_rank.iter().map(|v| v / 100.0).collect(),
        };
        match unit.trim() {
            "" => f.base = per_rank,
            "% AP" => f.ratios.push(ratio(Stat::AbilityPower, StatPart::Total)),
            "% AD" => f.ratios.push(ratio(Stat::AttackDamage, StatPart::Total)),
            "% bonus AD" => f.ratios.push(ratio(Stat::AttackDamage, StatPart::Bonus)),
            "% bonus health" => f.ratios.push(ratio(Stat::Health, StatPart::Bonus)),
            "% maximum health" => f.ratios.push(ratio(Stat::Health, StatPart::Total)),
            "% bonus armor" => f.ratios.push(ratio(Stat::Armor, StatPart::Bonus)),
            _ => {}
        }
    }
    (!f.base.is_empty() || !f.ratios.is_empty()).then_some(f)
}

fn cc_from_meraki(ability: &Value, ranks: usize) -> Vec<Cc> {
    let mut out: Vec<Cc> = Vec::new();
    for (word, kind) in [
        ("stun duration", CcKind::Stun),
        ("root duration", CcKind::Root),
        ("knock up duration", CcKind::Knockup),
        ("airborne duration", CcKind::Knockup),
        ("charm duration", CcKind::Charm),
        ("fear duration", CcKind::Fear),
        ("taunt duration", CcKind::Taunt),
        ("silence duration", CcKind::Silence),
        ("suppression duration", CcKind::Suppress),
    ] {
        if let Some(lv) = meraki_leveling(ability, |a| a == word) {
            let values = floats(&lv["modifiers"][0]["values"]);
            let duration: Vec<f64> = (0..ranks)
                .map(|r| values.get(r).or(values.last()).copied().unwrap_or(0.0))
                .collect();
            out.push(Cc {
                kind,
                duration,
                amount: Vec::new(),
            });
        }
    }
    // Contrôle à durée fixe, écrit seulement dans le texte (« … roots … for 2 seconds »).
    for e in ability["effects"].as_array().into_iter().flatten() {
        let text = e["description"].as_str().unwrap_or_default().to_lowercase();
        for (word, kind) in [
            ("stun", CcKind::Stun),
            ("root", CcKind::Root),
            ("knock", CcKind::Knockup),
            ("charm", CcKind::Charm),
            ("fear", CcKind::Fear),
            ("taunt", CcKind::Taunt),
            ("silence", CcKind::Silence),
            ("suppress", CcKind::Suppress),
        ] {
            if out.iter().any(|c| c.kind == kind) {
                continue;
            }
            let Some(at) = text.find(word) else { continue };
            if let Some(d) = seconds_after(&text[at..]) {
                out.push(Cc {
                    kind,
                    duration: vec![d; ranks],
                    amount: Vec::new(),
                });
            }
        }
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;
    use mm_engine::kit::StatBlock;
    use serde_json::json;

    /// Extrait réduit du fichier du jeu d'Ahri (patch 16.1), Q et E.
    fn ahri() -> Value {
        let q = json!({
            "mScriptName": "AhriQ",
            "mSpell": {
                "DataValues": [{"mName": "BaseDamage", "mValues": [15.0, 40.0, 65.0, 90.0, 115.0, 140.0, 165.0]}],
                "mSpellCalculations": {"TotalDamage": {"mFormulaParts": [
                    {"mDataValue": "BaseDamage", "__type": "NamedDataValueCalculationPart"},
                    {"mCoefficient": 0.5, "__type": "StatByCoefficientCalculationPart"}
                ], "__type": "GameCalculation"}},
                "mCastTime": 0.25,
                "cooldownTime": [7.0, 7.0, 7.0, 7.0, 7.0, 7.0, 7.0],
                "castRange": [25000.0, 25000.0],
                "castRangeDisplayOverride": [970.0, 970.0],
                "missileSpeed": 1100.0, "mLineWidth": 100.0,
                "mana": [55.0, 65.0, 75.0, 85.0, 95.0, 95.0],
                "mTargetingTypeData": {"__type": "Location"}
            },
            "BotData": {"DamageTag": 1, "{6d548702}": {"mFormulaParts": [{"mSpellCalculationKey": "TotalDamage", "__type": "{f3cbe7b2}"}]}}
        });
        let e = json!({
            "mScriptName": "AhriE",
            "mSpell": {
                "DataValues": [
                    {"mName": "BaseDamage", "mValues": [40.0, 80.0, 120.0, 160.0, 200.0, 240.0, 280.0]},
                    {"mName": "CharmDuration", "mValues": [1.05, 1.2, 1.35, 1.5, 1.65, 1.8, 1.95]},
                    {"mName": "APRatio", "mValues": [0.85, 0.85, 0.85, 0.85, 0.85, 0.85, 0.85]}
                ],
                "mSpellCalculations": {"TotalDamage": {"mFormulaParts": [
                    {"mDataValue": "BaseDamage", "__type": "NamedDataValueCalculationPart"},
                    {"mDataValue": "APRatio", "__type": "StatByNamedDataValueCalculationPart"}
                ], "__type": "GameCalculation"}},
                "cooldownTime": [12.0, 12.0, 12.0, 12.0, 12.0, 12.0, 12.0],
                "mana": [60.0, 60.0, 60.0, 60.0, 60.0, 60.0],
                "missileSpeed": 1550.0, "mLineWidth": 60.0,
                "mTargetingTypeData": {"__type": "Location"}
            }
        });
        let blank = json!({"mSpell": {}});
        json!({
            "Characters/Ahri/CharacterRecords/Root": {"spells": ["q", "w", "e", "r"]},
            "q": q, "w": blank, "e": e, "r": blank
        })
    }

    #[test]
    fn sort_lu_dans_le_fichier_du_jeu() {
        let kit = kit_from_bin("Ahri", &ahri(), None).unwrap();
        let q = &kit.spells[0];
        assert_eq!(q.cooldown, vec![7.0; 5]);
        assert_eq!(q.cost, vec![55.0, 65.0, 75.0, 85.0, 95.0]);
        assert_eq!(q.range, 970.0);
        assert_eq!(q.targeting, Targeting::Skillshot);
        assert_eq!(q.damage_type, DamageType::Magic);
        let d = q.damage.as_ref().unwrap();
        assert_eq!(d.base, vec![40.0, 65.0, 90.0, 115.0, 140.0]);
        let stats = StatBlock {
            ability_power: 100.0,
            ..Default::default()
        };
        assert_eq!(d.eval(1, 1, &stats), 90.0);

        let e = &kit.spells[2];
        assert_eq!(e.damage.as_ref().unwrap().eval(2, 1, &stats), 120.0 + 85.0);
        assert_eq!(e.cc[0].kind, CcKind::Charm);
        assert_eq!(e.cc[0].duration, vec![1.2, 1.35, 1.5, 1.65, 1.8]);
        assert!(kit.spells[1].damage.is_none());
        assert_eq!(kit.spells[3].cooldown.len(), 3);
    }

    #[test]
    fn duree_ecrite_dans_le_texte() {
        assert_eq!(
            seconds_after("roots the first enemy hit for 2 seconds and deals damage."),
            Some(2.0)
        );
        assert_eq!(
            seconds_after("deals damage for each enemy. then 3 seconds"),
            None
        );
    }

    #[test]
    fn paliers_selon_le_niveau() {
        let ctx = Ctx {
            values: BTreeMap::new(),
            calcs: &serde_json::Map::new(),
            effects: Vec::new(),
        };
        let p = json!({"mLevel1Value": 1150.0, "mBreakpoints": [
            {"mLevel": 7, "mBonusPerLevelAtAndAfter": 50.0},
            {"mLevel": 11, "mAdditionalBonusAtThisLevel": 100.0}
        ], "__type": "ByCharLevelBreakpointsCalculationPart"});
        let lvl = ctx.part(&p, 1, 0).lvl.unwrap();
        assert_eq!(lvl[0], 1150.0);
        assert_eq!(lvl[6], 1200.0);
        assert_eq!(lvl[10], 1150.0 + 250.0 + 100.0);
    }
}
