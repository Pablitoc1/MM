//! Data Dragon : champions, objets et sorts d'invocateur, en français.

use std::collections::HashMap;
use std::path::Path;

use rusqlite::{params, Transaction};
use serde_json::Value;

use super::http::Fetcher;
use super::Result;

const CDN: &str = "https://ddragon.leagueoflegends.com/cdn";

/// Table de correspondance nom anglais (celui de Leaguepedia) → clé Data Dragon.
pub struct ChampionNames(HashMap<String, String>);

impl ChampionNames {
    pub fn key_for(&self, leaguepedia_name: &str) -> Option<&str> {
        self.0.get(&normalize(leaguepedia_name)).map(String::as_str)
    }
}

fn normalize(name: &str) -> String {
    name.chars()
        .filter(|c| c.is_alphanumeric())
        .flat_map(char::to_lowercase)
        .collect()
}

pub fn import(
    fetch: &Fetcher,
    tx: &Transaction,
    version: &str,
    images: &Path,
) -> Result<ChampionNames> {
    let full = fetch.get_json(&format!("{CDN}/{version}/data/fr_FR/championFull.json"))?;
    let en = fetch.get_json(&format!("{CDN}/{version}/data/en_US/champion.json"))?;

    let mut names = HashMap::new();
    for (id, c) in obj(&en["data"])? {
        names.insert(normalize(str_of(&c["name"])), id.clone());
        names.insert(normalize(id), id.clone());
    }

    let champ_dir = images.join("champions");
    std::fs::create_dir_all(&champ_dir)?;
    for (id, c) in obj(&full["data"])? {
        tx.execute(
            "INSERT INTO champions (id, key, name, title, tags, data) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![
                id,
                str_of(&c["key"]).parse::<i64>()?,
                str_of(&c["name"]),
                str_of(&c["title"]),
                c["tags"].to_string(),
                c.to_string()
            ],
        )?;
        let file = str_of(&c["image"]["full"]);
        let dest = champ_dir.join(file);
        if !dest.exists() {
            std::fs::write(
                &dest,
                fetch.get(&format!("{CDN}/{version}/img/champion/{file}"))?,
            )?;
        }
    }

    let items = fetch.get_json(&format!("{CDN}/{version}/data/fr_FR/item.json"))?;
    for (id, it) in obj(&items["data"])? {
        tx.execute(
            "INSERT INTO items (id, name, gold, data) VALUES (?1, ?2, ?3, ?4)",
            params![
                id.parse::<i64>()?,
                str_of(&it["name"]),
                it["gold"]["total"].as_i64().unwrap_or(0),
                it.to_string()
            ],
        )?;
    }

    let spells = fetch.get_json(&format!("{CDN}/{version}/data/fr_FR/summoner.json"))?;
    for (id, s) in obj(&spells["data"])? {
        tx.execute(
            "INSERT INTO summoner_spells (id, name, data) VALUES (?1, ?2, ?3)",
            params![id, str_of(&s["name"]), s.to_string()],
        )?;
    }
    Ok(ChampionNames(names))
}

fn obj(v: &Value) -> Result<&serde_json::Map<String, Value>> {
    v.as_object()
        .ok_or_else(|| "JSON Data Dragon inattendu".into())
}

fn str_of(v: &Value) -> &str {
    v.as_str().unwrap_or_default()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn noms_leaguepedia_vers_cles() {
        let mut m = HashMap::new();
        m.insert(normalize("Kai'Sa"), "Kaisa".to_string());
        m.insert(normalize("Nunu & Willump"), "Nunu".to_string());
        let names = ChampionNames(m);
        assert_eq!(names.key_for("Kai'Sa"), Some("Kaisa"));
        assert_eq!(names.key_for("Nunu & Willump"), Some("Nunu"));
        assert_eq!(names.key_for("Inconnu"), None);
    }
}
