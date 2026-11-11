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

// Chaque démo déclare ses captures : nom du fichier + actions à faire avant.
// Action : { click: 'bouton' }, { tab: 'onglet' }, { select: ['libellé', 'valeur'] },
// { player: 'pseudo' } (ouvre la fiche depuis l'effectif)
// ou { seek: secondes } (match en direct : place la lecture à cet instant, en pause).
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
  // M2 : 10 joueurs connus (aperçu), leurs attributs détaillés, et un joueur peu connu.
  M2: [
    { name: 'effectif-niveaux-karmine-corp', steps: [{ click: 'Effectif' }] },
    ...[
      ['Karmine Corp', 'Caliste'], ['Karmine Corp', 'Canna'], ['G2 Esports', 'Caps'],
      ['G2 Esports', 'BrokenBlade'], ['Fnatic', 'Razork'], ['Fnatic', 'Upset'],
      ['Los Ratones', 'Rekkles'], ['Movistar KOI', 'Elyoya'], ['SK Gaming', 'Mikyx'],
      ['Team Vitality', 'Humanoid'],
    ].flatMap(([team, player]) => {
      const open = [{ click: 'Effectif' }, { select: ['Club', team] }, { player }];
      const slug = player.toLowerCase().replace(/\s+/g, '-');
      return [
        { name: `${slug}-apercu`, steps: open },
        { name: `${slug}-attributs`, steps: [...open, { tab: 'Attributs' }] },
      ];
    }),
    { name: 'caps-champions', steps: [{ click: 'Effectif' }, { select: ['Club', 'G2 Esports'] }, { player: 'Caps' }, { tab: 'Champions' }] },
    { name: 'caps-statistiques', steps: [{ click: 'Effectif' }, { select: ['Club', 'G2 Esports'] }, { player: 'Caps' }, { tab: 'Statistiques' }] },
    { name: 'effectif-niveaux-karmine-corp-blue', steps: [{ click: 'Effectif' }, { select: ['Club', 'Karmine Corp Blue'] }] },
  ],
  // M3 : une partie simulée par le moteur (KC contre G2, graine 1), farm seulement.
  M3: [
    { name: '01-premieres-vagues-1m10', steps: [{ click: 'Match en direct' }, { click: 'Pause' }, { seek: 70 }] },
    { name: '02-jungle-3m00', steps: [{ click: 'Match en direct' }, { click: 'Pause' }, { seek: 180 }] },
    { name: '03-farm-10m00', steps: [{ click: 'Match en direct' }, { click: 'Pause' }, { seek: 600 }] },
  ],
  // Vue 2D du match (préparation de M6), sur le faux match KC contre G2.
  'vue-2d': [
    { name: '01-debut-0m45', steps: [{ click: 'Match en direct' }, { click: 'Pause' }, { seek: 45 }] },
    { name: '02-premier-sang-3m12', steps: [{ click: 'Match en direct' }, { click: 'Pause' }, { seek: 193 }] },
    { name: '03-double-kill-10m36', steps: [{ click: 'Match en direct' }, { click: 'Pause' }, { seek: 636 }] },
    { name: '04-teamfight-triple-19m50', steps: [{ click: 'Match en direct' }, { click: 'Pause' }, { seek: 1190 }] },
    { name: '05-nashor-20m20', steps: [{ click: 'Match en direct' }, { click: 'Pause' }, { seek: 1220 }] },
    { name: '06-fin-24m05', steps: [{ click: 'Match en direct' }, { click: 'Pause' }, { seek: 1445 }] },
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
    if (step.click) await page.getByRole('button', { name: step.click, exact: true }).click();
    if (step.tab) await page.getByRole('tab', { name: new RegExp(step.tab) }).click();
    if (step.select) await page.getByLabel(step.select[0]).selectOption(step.select[1]);
    if (step.player) await page.getByRole('button', { name: `Fiche de ${step.player}`, exact: true }).click();
    if (step.seek !== undefined) {
      await page.locator('[data-testid="match-map"][data-ready="true"]').waitFor();
      await page.getByLabel('Temps de jeu').fill(String(Math.floor(step.seek)));
      await page.waitForTimeout(400);
      await page.evaluate(() => document.querySelector('main')?.scrollTo(0, 0));
    }
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
