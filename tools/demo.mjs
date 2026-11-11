// Captures de démo d'un jalon : sert l'interface construite (app/dist)
// et prend des captures avec Playwright dans docs/demo/<jalon>/.
// Usage : node tools/demo.mjs M0
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { extname, join, resolve } from 'node:path';

const milestone = process.argv[2];
if (!milestone) {
  console.error('Usage : node tools/demo.mjs <jalon>');
  process.exit(1);
}

// Chaque démo déclare ses captures : nom du fichier, clics à faire avant,
// et pour le match en direct l'instant de jeu à afficher (en secondes, lecture en pause).
const SHOTS = {
  M0: [
    { name: 'accueil', clicks: [] },
    { name: 'effectif', clicks: ['Effectif'] },
  ],
  // Vue 2D du match (préparation de M6), sur le faux match KC contre G2.
  'vue-2d': [
    { name: '01-debut-0m45', clicks: ['Match en direct', 'Pause'], seek: 45 },
    { name: '02-premier-sang-3m12', clicks: ['Match en direct', 'Pause'], seek: 193 },
    { name: '03-double-kill-10m36', clicks: ['Match en direct', 'Pause'], seek: 636 },
    { name: '04-teamfight-triple-19m50', clicks: ['Match en direct', 'Pause'], seek: 1190 },
    { name: '05-nashor-20m20', clicks: ['Match en direct', 'Pause'], seek: 1220 },
    { name: '06-fin-24m05', clicks: ['Match en direct', 'Pause'], seek: 1445 },
  ],
};

const shots = SHOTS[milestone];
if (!shots) {
  console.error(`Aucune démo définie pour ${milestone} dans tools/demo.mjs`);
  process.exit(1);
}

const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require('playwright'));
} catch {
  console.error('Playwright est introuvable. Installe-le avec : npm i -g playwright');
  process.exit(1);
}

const root = resolve('app/dist');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp' };
const server = createServer(async (req, res) => {
  const path = req.url === '/' ? '/index.html' : decodeURIComponent(req.url.split('?')[0]);
  try {
    const body = await readFile(join(root, path));
    res.writeHead(200, { 'content-type': TYPES[extname(path)] ?? 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((ok) => server.listen(0, ok));
const url = `http://127.0.0.1:${server.address().port}/`;

const out = resolve('docs/demo', milestone);
await mkdir(out, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
for (const shot of shots) {
  await page.goto(url);
  await page.waitForLoadState('networkidle');
  for (const label of shot.clicks) await page.getByRole('button', { name: label, exact: true }).click();
  if (shot.seek !== undefined) {
    await page.locator('[data-testid="match-map"][data-ready="true"]').waitFor();
    await page.getByLabel('Temps de jeu').fill(String(Math.floor(shot.seek)));
    await page.waitForTimeout(400);
    await page.evaluate(() => document.querySelector('main')?.scrollTo(0, 0));
  }
  await page.evaluate(() => document.fonts.ready);
  const file = join(out, `${shot.name}.png`);
  await page.screenshot({ path: file });
  console.log(`Capture : ${file}`);
}
await browser.close();
server.close();
