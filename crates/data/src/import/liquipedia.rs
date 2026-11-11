//! Liquipedia (liquipedia.net) : photos des joueurs et du staff, logos des clubs.
//!
//! API MediaWiki, selon les règles publiées par Liquipedia : un User-Agent qui
//! nomme l'outil, la compression gzip, et une requête toutes les 2 secondes
//! (voir `Fetcher::with_delay`). Images sous licence CC BY-SA 3.0.

use std::collections::HashMap;
use std::fmt;
use std::path::Path;

use rusqlite::{params, Transaction};
use serde_json::Value;

use super::http::Fetcher;
use super::Result;

const API: &str = "https://liquipedia.net/leagueoflegends/api.php";
const BATCH: usize = 50;

#[derive(Default)]
pub struct ImageSummary {
    pub logos: usize,
    pub photos: usize,
    pub missing: Vec<String>,
}

impl fmt::Display for ImageSummary {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{} logos, {} photos", self.logos, self.photos)?;
        if !self.missing.is_empty() {
            write!(f, " (sans image : {})", self.missing.join(", "))?;
        }
        Ok(())
    }
}

pub fn import_images(
    fetch: &Fetcher,
    tx: &Transaction,
    leagues: &[&str],
    images: &Path,
) -> Result<ImageSummary> {
    let mut sum = ImageSummary::default();
    let in_leagues = leagues
        .iter()
        .map(|l| format!("'{}'", l.replace('\'', "''")))
        .collect::<Vec<_>>()
        .join(",");

    let teams: Vec<String> = tx
        .prepare(&format!(
            "SELECT id FROM teams WHERE league_id IN ({in_leagues}) ORDER BY id"
        ))?
        .query_map([], |r| r.get(0))?
        .collect::<rusqlite::Result<_>>()?;
    let people: Vec<(String, String, Option<String>)> = tx
        .prepare(&format!(
            "SELECT DISTINCT p.id, p.handle, p.real_name FROM roster r
             JOIN people p ON p.id = r.person_id JOIN teams t ON t.id = r.team_id
             WHERE t.league_id IN ({in_leagues}) ORDER BY p.id"
        ))?
        .query_map([], |r| Ok((r.get(0)?, r.get(1)?, r.get(2)?)))?
        .collect::<rusqlite::Result<_>>()?;

    // Logos : icônes des modèles d'équipe, version pour fond sombre si elle existe.
    let icons = team_icons(fetch, &teams)?;
    let mut logos = Vec::new();
    for team in &teams {
        match icons.get(team) {
            Some(f) => logos.push((team.clone(), f.clone())),
            None => sum.missing.push(team.clone()),
        }
    }

    // Photos : la page doit être celle de la bonne personne.
    let handles: Vec<String> = people.iter().map(|p| p.1.clone()).collect();
    let person_pages = infoboxes(fetch, &handles)?;
    let mut photos = Vec::new();
    for (id, handle, real_name) in &people {
        let Some(info) = person_pages.get(handle) else {
            sum.missing.push(handle.clone());
            continue;
        };
        if !same_person(real_name.as_deref(), info) {
            sum.missing.push(format!("{handle} (homonyme)"));
            continue;
        }
        match info.get("image") {
            Some(f) => photos.push((id.clone(), f.clone())),
            None => sum.missing.push(handle.clone()),
        }
    }

    let logo_urls = thumb_urls(
        fetch,
        &logos.iter().map(|l| l.1.clone()).collect::<Vec<_>>(),
        160,
    )?;
    let photo_urls = thumb_urls(
        fetch,
        &photos.iter().map(|p| p.1.clone()).collect::<Vec<_>>(),
        220,
    )?;

    for (team, file) in &logos {
        if let Some(rel) = save(fetch, logo_urls.get(file), "logos", team, images)? {
            tx.execute(
                "UPDATE teams SET logo_file = ?1 WHERE id = ?2",
                params![rel, team],
            )?;
            sum.logos += 1;
        }
    }
    for (id, file) in &photos {
        if let Some(rel) = save(fetch, photo_urls.get(file), "photos", id, images)? {
            tx.execute(
                "UPDATE people SET photo_file = ?1 WHERE id = ?2",
                params![rel, id],
            )?;
            sum.photos += 1;
        }
    }
    Ok(sum)
}

/// Fichier de l'icône de chaque club (modèle `TeamIcon`), en une seule requête
/// `parse` : Liquipedia demande 30 s entre deux requêtes de ce type.
fn team_icons(fetch: &Fetcher, teams: &[String]) -> Result<HashMap<String, String>> {
    let text: Vec<String> = teams
        .iter()
        .enumerate()
        .map(|(i, t)| format!("@@{i}@@ {{{{TeamIcon|{}}}}}", t.to_lowercase()))
        .collect();
    let url = format!(
        "{API}?action=parse&format=json&formatversion=2&prop=text&contentmodel=wikitext&text={}",
        enc(&text.join("\n\n"))
    );
    let json = fetch.get_json(&url)?;
    let html = json["parse"]["text"].as_str().unwrap_or_default();
    let mut out = HashMap::new();
    for (i, team) in teams.iter().enumerate() {
        let marker = format!("@@{i}@@");
        let Some(pos) = html.find(&marker) else {
            continue;
        };
        let start = pos + marker.len();
        let end = html[start..].find("@@").map_or(html.len(), |e| start + e);
        if let Some(file) = best_icon(&image_files(&html[start..end])) {
            out.insert(team.clone(), file);
        }
    }
    Ok(out)
}

/// Noms des fichiers images cités dans un extrait HTML.
fn image_files(html: &str) -> Vec<String> {
    let mut files = Vec::new();
    for part in html.split("/commons/images/").skip(1) {
        let path = part.split(['"', ' ', '\'']).next().unwrap_or_default();
        let file = path.split('/').find(|seg| {
            let l = seg.to_ascii_lowercase();
            [".png", ".svg", ".jpg", ".jpeg", ".webp"]
                .iter()
                .any(|e| l.ends_with(e))
        });
        if let Some(f) = file {
            let f = f.replace('_', " ");
            if !files.contains(&f) {
                files.push(f);
            }
        }
    }
    files
}

/// Pour un fond sombre : version darkmode, sinon allmode, sinon la première.
fn best_icon(files: &[String]) -> Option<String> {
    ["darkmode", "allmode"]
        .iter()
        .find_map(|k| files.iter().find(|f| f.contains(k)))
        .or(files.first())
        .cloned()
}

/// Champs de l'infobox de chaque page demandée (clé = titre demandé).
fn infoboxes(
    fetch: &Fetcher,
    titles: &[String],
) -> Result<HashMap<String, HashMap<String, String>>> {
    let mut out = HashMap::new();
    for chunk in titles.chunks(BATCH) {
        let url = format!(
            "{API}?action=query&format=json&formatversion=2&redirects=1&prop=revisions\
             &rvprop=content&rvslots=main&titles={}",
            enc(&chunk.join("|"))
        );
        let json = fetch.get_json(&url)?;
        let resolve = resolver(&json);
        let mut content: HashMap<String, String> = HashMap::new();
        for page in json["query"]["pages"].as_array().into_iter().flatten() {
            if let (Some(title), Some(text)) = (
                page["title"].as_str(),
                page["revisions"][0]["slots"]["main"]["content"].as_str(),
            ) {
                content.insert(title.to_string(), text.to_string());
            }
        }
        for asked in chunk {
            let Some(text) = content.get(&resolve(asked)) else {
                continue;
            };
            if text.contains("{{Disambig") || !text.contains("{{Infobox") {
                continue;
            }
            out.insert(asked.clone(), parse_infobox(text));
        }
    }
    Ok(out)
}

/// Suit les normalisations et redirections de la réponse : titre demandé → titre final.
fn resolver(json: &Value) -> impl Fn(&str) -> String {
    let mut map: HashMap<String, String> = HashMap::new();
    for key in ["normalized", "redirects"] {
        for r in json["query"][key].as_array().into_iter().flatten() {
            if let (Some(a), Some(b)) = (r["from"].as_str(), r["to"].as_str()) {
                map.insert(a.to_string(), b.to_string());
            }
        }
    }
    move |title: &str| {
        let mut t = title.to_string();
        for _ in 0..3 {
            match map.get(&t) {
                Some(next) => t = next.clone(),
                None => break,
            }
        }
        t
    }
}

/// Lignes `|clé=valeur` du modèle Infobox.
fn parse_infobox(text: &str) -> HashMap<String, String> {
    let mut fields = HashMap::new();
    for line in text.lines() {
        let Some(rest) = line.trim().strip_prefix('|') else {
            continue;
        };
        if let Some((k, v)) = rest.split_once('=') {
            let v = v.trim();
            if !v.is_empty() {
                fields
                    .entry(k.trim().to_string())
                    .or_insert_with(|| v.to_string());
            }
        }
    }
    fields
}

/// Vérifie qu'une page Liquipedia décrit bien la personne de Leaguepedia :
/// au moins un mot du vrai nom en commun, quand on peut comparer.
fn same_person(real_name: Option<&str>, info: &HashMap<String, String>) -> bool {
    let words = |s: &str| -> Vec<String> {
        s.split(|c: char| !c.is_alphanumeric())
            .filter(|w| w.chars().count() >= 2)
            .map(str::to_lowercase)
            .collect()
    };
    let Some(real) = real_name else {
        return true;
    };
    let theirs: Vec<String> = ["romanized_name", "name"]
        .iter()
        .filter_map(|k| info.get(*k))
        .flat_map(|v| words(v))
        .collect();
    if theirs.is_empty() || !real.is_ascii() {
        return true;
    }
    words(real).iter().any(|w| theirs.contains(w))
}

/// URL des miniatures (`width` px) pour chaque fichier.
fn thumb_urls(fetch: &Fetcher, files: &[String], width: u32) -> Result<HashMap<String, String>> {
    let mut out = HashMap::new();
    let titles: Vec<String> = files.iter().map(|f| format!("File:{f}")).collect();
    for chunk in titles.chunks(BATCH) {
        let url = format!(
            "{API}?action=query&format=json&formatversion=2&prop=imageinfo&iiprop=url\
             &iiurlwidth={width}&titles={}",
            enc(&chunk.join("|"))
        );
        let json = fetch.get_json(&url)?;
        let resolve = resolver(&json);
        let mut by_title = HashMap::new();
        for page in json["query"]["pages"].as_array().into_iter().flatten() {
            let info = &page["imageinfo"][0];
            if let (Some(title), Some(u)) = (
                page["title"].as_str(),
                info["thumburl"].as_str().or(info["url"].as_str()),
            ) {
                by_title.insert(title.to_string(), u.to_string());
            }
        }
        for asked in chunk {
            if let Some(u) = by_title.get(&resolve(asked)) {
                out.insert(asked["File:".len()..].to_string(), u.clone());
            }
        }
    }
    Ok(out)
}

/// Télécharge une image dans `public/<dir>/` ; renvoie son chemin relatif.
fn save(
    fetch: &Fetcher,
    url: Option<&String>,
    dir: &str,
    name: &str,
    images: &Path,
) -> Result<Option<String>> {
    let Some(url) = url else {
        return Ok(None);
    };
    let ext = url
        .rsplit('.')
        .next()
        .map(|e| e.to_ascii_lowercase())
        .filter(|e| ["png", "jpg", "jpeg", "webp", "svg"].contains(&e.as_str()))
        .unwrap_or_else(|| "png".to_string());
    let rel = format!("{dir}/{}.{ext}", file_slug(name));
    let dest = images.join(&rel);
    if !dest.exists() {
        match fetch.get(url) {
            Ok(bytes) => {
                std::fs::create_dir_all(images.join(dir))?;
                std::fs::write(&dest, bytes)?;
            }
            Err(e) => {
                eprintln!("  image ignorée ({name}) : {e}");
                return Ok(None);
            }
        }
    }
    Ok(Some(rel))
}

fn enc(s: &str) -> String {
    let mut out = String::new();
    for b in s.bytes() {
        match b {
            b'A'..=b'Z' | b'a'..=b'z' | b'0'..=b'9' | b'-' | b'_' | b'.' | b'~' => {
                out.push(b as char)
            }
            _ => out.push_str(&format!("%{b:02X}")),
        }
    }
    out
}

/// Nom de fichier sûr sur Windows, Mac et Linux, unique grâce à une empreinte.
fn file_slug(name: &str) -> String {
    let slug: String = name
        .chars()
        .map(|c| {
            if c.is_ascii_alphanumeric() {
                c.to_ascii_lowercase()
            } else {
                '-'
            }
        })
        .collect();
    let slug = slug
        .split('-')
        .filter(|p| !p.is_empty())
        .collect::<Vec<_>>()
        .join("-");
    let hash = format!("{:x}", md5::compute(name));
    format!("{slug}-{}", &hash[..8])
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn lit_l_infobox() {
        let text = "{{Infobox player\n|id=Caliste\n|romanized_name=Caliste Henry-Hennebert\n|image=KC Caliste at Worlds 2026.jpeg\n|team=\n}}";
        let i = parse_infobox(text);
        assert_eq!(i["image"], "KC Caliste at Worlds 2026.jpeg");
        assert!(!i.contains_key("team"));
    }

    #[test]
    fn reconnait_les_homonymes() {
        let mut i = HashMap::new();
        i.insert("romanized_name".to_string(), "Kim Chang-dong".to_string());
        assert!(same_person(Some("Kim Chang-dong"), &i));
        assert!(!same_person(Some("Lee Sang-hyeok"), &i));
        assert!(same_person(None, &i));
    }

    #[test]
    fn suit_les_redirections() {
        let json = serde_json::json!({"query": {
            "normalized": [{"from": "Karmine_Corp", "to": "Karmine Corp"}],
            "redirects": [{"from": "Karmine Corp", "to": "Karmine Corp (French team)"}]
        }});
        assert_eq!(
            resolver(&json)("Karmine_Corp"),
            "Karmine Corp (French team)"
        );
    }

    #[test]
    fn choisit_l_icone_pour_fond_sombre() {
        let html = r#"<img src="/commons/images/thumb/4/4b/G2_Esports_2020_lightmode.png/50px-G2.png"> <img src="/commons/images/thumb/1/1a/G2_Esports_2020_darkmode.png/50px-x.png">"#;
        let files = image_files(html);
        assert_eq!(files[0], "G2 Esports 2020 lightmode.png");
        assert_eq!(
            best_icon(&files).as_deref(),
            Some("G2 Esports 2020 darkmode.png")
        );
    }

    #[test]
    fn noms_de_fichiers_surs() {
        assert!(file_slug("G2 Esports").starts_with("g2-esports-"));
        assert_ne!(file_slug("한화생명"), file_slug("농심"));
    }
}
