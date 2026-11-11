//! Téléchargements avec cache disque et politesse envers les serveurs.

use std::path::PathBuf;
use std::thread::sleep;
use std::time::Duration;

use super::Result;

const USER_AGENT: &str = "EsportManager-seed/0.1 (jeu personnel, import ponctuel)";

pub struct Fetcher {
    cache: PathBuf,
    agent: ureq::Agent,
    /// Pause après chaque vraie requête, selon les règles du site.
    delay: Duration,
}

impl Fetcher {
    pub fn new(cache: PathBuf) -> Self {
        let agent = ureq::AgentBuilder::new()
            .user_agent(USER_AGENT)
            .timeout(Duration::from_secs(120))
            // Respecte HTTPS_PROXY et les certificats du système (SSL_CERT_FILE).
            .try_proxy_from_env(true)
            .build();
        Self {
            cache,
            agent,
            delay: Duration::from_millis(300),
        }
    }

    /// Même cache, autre rythme (Liquipedia demande 2 s entre deux requêtes).
    pub fn with_delay(cache: PathBuf, delay: Duration) -> Self {
        Self {
            delay,
            ..Self::new(cache)
        }
    }

    /// Renvoie le corps de `url`, depuis le cache s'il existe.
    pub fn get(&self, url: &str) -> Result<Vec<u8>> {
        let path = self.cache.join(format!("{:x}", md5::compute(url)));
        if let Ok(bytes) = std::fs::read(&path) {
            return Ok(bytes);
        }
        let mut last_err = None;
        for attempt in 0..5u64 {
            if attempt > 0 {
                sleep(Duration::from_secs(2u64.pow(attempt as u32)));
            }
            match self.agent.get(url).call() {
                Ok(resp) => {
                    let mut bytes = Vec::new();
                    std::io::Read::read_to_end(&mut resp.into_reader(), &mut bytes)?;
                    std::fs::create_dir_all(&self.cache)?;
                    std::fs::write(&path, &bytes)?;
                    // Une requête à la fois, avec une pause : les wikis sont des services gratuits.
                    sleep(self.delay);
                    return Ok(bytes);
                }
                // Refus définitif : inutile de réessayer.
                Err(ureq::Error::Status(code @ (403 | 404), _)) => {
                    return Err(format!("{code} : {url}").into())
                }
                Err(e) => last_err = Some(e),
            }
        }
        Err(format!("échec du téléchargement {url} : {last_err:?}").into())
    }

    pub fn get_json(&self, url: &str) -> Result<serde_json::Value> {
        Ok(serde_json::from_slice(&self.get(url)?)?)
    }
}
