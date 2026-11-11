//! Les objets qu'un joueur achète pendant un match (note 014).
//!
//! Les stats des objets sont les vraies (fichiers du patch 26.1). Les builds, eux, sont des builds
//! types par profil de champion (`// estimé`) : les vrais builds des pros (Leaguepedia) restent à
//! importer, leur API nous limitait pendant M4.

use mm_data::read::Db;
use mm_engine::item::Item;
use mm_engine::kit::{Kit, Stat};
use mm_engine::Role;

use crate::lineup::LineupError;

/// Profil d'un champion pour ses achats.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Archetype {
    Marksman,
    Mage,
    AdAssassin,
    Fighter,
    Tank,
    SupportTank,
    Enchanter,
}

impl Archetype {
    /// Build type, dans l'ordre d'achat (bottes d'abord, puis les objets légendaires).
    /// // estimé : objets les plus courants de chaque profil en LEC 2025-2026 (relevé à la main).
    pub fn items(self) -> &'static [u32] {
        match self {
            // Jambières du berzerker, Tueur de krakens, Lame d'infini, Salutations de Dominik,
            // Soif-de-sang, Ange gardien.
            Archetype::Marksman => &[3006, 6672, 3031, 3036, 3072, 3026],
            // Chaussures de sorcier, Écho de Luden, Flamme-ombre, Coiffe de Rabadon, Bâton du vide,
            // Sablier de Zhonya.
            Archetype::Mage => &[3020, 6655, 4645, 3089, 3135, 3157],
            // Bottes de lucidité, Éclipse, Lame spectre de Youmuu, Rancune de Serylda, Manteau de la
            // nuit, Danse de la mort.
            Archetype::AdAssassin => &[3158, 6692, 3142, 6694, 3814, 6333],
            // Coques en acier, Couperet noir, Gage de Sterak, Danse de la mort, Visage spirituel.
            Archetype::Fighter => &[3047, 3071, 3053, 6333, 3065],
            // Sandales de Mercure, Égide solaire, Cotte épineuse, Visage spirituel, Présage de
            // Randuin, Armure de Warmog.
            Archetype::Tank => &[3111, 3068, 3075, 3065, 3143, 3083],
            // Mélodie du sang, Sandales de Mercure, Médaillon de l'Iron Solari, Vœu du chevalier,
            // Rookern kaénique.
            Archetype::SupportTank => &[3877, 3111, 3190, 3109, 2504],
            // Mélodie du sang, Bottes de lucidité, Régénérateur de pierre de lune, Encensoir ardent.
            Archetype::Enchanter => &[3877, 3158, 6617, 3504],
        }
    }
}

/// Le profil d'un champion : ses mots-clés Data Dragon, son rôle, et les ratios de ses sorts
/// (puissance ou dégâts d'attaque) pour départager un combattant AP d'un combattant AD.
pub fn archetype(tags: &[String], role: Role, kit: Option<&Kit>) -> Archetype {
    let has = |t: &str| tags.iter().any(|x| x == t);
    let (ap, ad) = kit.map_or((0.0, 0.0), ratios);
    let ap_heavy = ap > ad;
    match role {
        Role::Support if has("Tank") || has("Fighter") => Archetype::SupportTank,
        Role::Support => Archetype::Enchanter,
        Role::Bot if has("Marksman") || !ap_heavy => Archetype::Marksman,
        Role::Bot => Archetype::Mage,
        _ => match tags.first().map(String::as_str) {
            Some("Marksman") => Archetype::Marksman,
            Some("Tank") => Archetype::Tank,
            Some("Mage") | Some("Support") if !ap_heavy && ad > 0.0 => Archetype::Fighter,
            Some("Mage") | Some("Support") => Archetype::Mage,
            Some("Assassin") if ap_heavy => Archetype::Mage,
            Some("Assassin") => Archetype::AdAssassin,
            _ if ap_heavy => Archetype::Mage,
            _ => Archetype::Fighter,
        },
    }
}

/// Somme des ratios de dégâts des sorts au dernier rang : (puissance, dégâts d'attaque).
fn ratios(kit: &Kit) -> (f64, f64) {
    let (mut ap, mut ad) = (0.0, 0.0);
    for f in kit.spells.iter().filter_map(|s| s.damage.as_ref()) {
        for r in &f.ratios {
            let c = r.coef.last().copied().unwrap_or(0.0);
            match r.stat {
                Stat::AbilityPower => ap += c,
                Stat::AttackDamage => ad += c,
                _ => {}
            }
        }
    }
    (ap, ad)
}

/// Les objets du build d'un champion, lus dans la base. Un objet absent de la base est sauté.
pub fn build(
    db: &Db,
    champion: &str,
    role: Role,
    kit: Option<&Kit>,
) -> Result<Vec<Item>, LineupError> {
    let tags: Vec<String> = db
        .champion_tags(champion)?
        .and_then(|t| serde_json::from_str(&t).ok())
        .unwrap_or_default();
    items(db, archetype(&tags, role, kit).items())
}

/// Les objets demandés, dans l'ordre.
pub fn items(db: &Db, ids: &[u32]) -> Result<Vec<Item>, LineupError> {
    let mut out = Vec::new();
    for &id in ids {
        if let Some(json) = db.item_stats(id)? {
            let item: Item = serde_json::from_str(&json).map_err(|_| LineupError::BadItem(id))?;
            out.push(item);
        }
    }
    Ok(out)
}
