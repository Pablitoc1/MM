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

// Chaque jalon déclare ses captures : nom du fichier + actions à faire avant.
// Action : { click: 'bouton' }, { tab: 'onglet' } ou { select: ['libellé', 'valeur'] }.
const SHOTS = {
  M0: [
    { name: 'accueil', steps: [] },
    { name: 'effectif', steps: [{ click: 'Effectif' }] },
  ],
  M1: [
    { name: 'effectif-karmine-corp', steps: [{ click: 'Effectif' }] },
    { name: 'effectif-g2-esports', steps: [{ click: 'Effectif' }, { select: ['Club', 'G2 Esports'] }] },
    { name: 'effectif-fnatic', steps: [{ click: 'Effectif' }, { select: ['Club', 'Fnatic'] }] },
    { name: 'staff-karmine-corp', steps: [{ click: 'Effectif' }, { tab: 'Staff' }] },
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
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.json': 'application/json' };
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
  for (const step of shot.steps) {
    if (step.click) await page.getByRole('button', { name: step.click }).click();
    if (step.tab) await page.getByRole('tab', { name: new RegExp(step.tab) }).click();
    if (step.select) await page.getByLabel(step.select[0]).selectOption(step.select[1]);
    await page.waitForLoadState('networkidle');
  }
  await page.evaluate(() => document.fonts.ready);
  // Attend que toutes les images (photos, logos, champions) soient chargées.
  await page.waitForFunction(() => [...document.images].every((i) => i.complete));
  const file = join(out, `${shot.name}.png`);
  await page.screenshot({ path: file });
  console.log(`Capture : ${file}`);
}
await browser.close();
server.close();
