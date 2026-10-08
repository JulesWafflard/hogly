// Récupère le classement officiel sur le site de la FFHG et l'écrit en JSON.
// Usage : node scripts/update-classement.mjs [--html fichier.html]
// Le fichier n'est réécrit que si le classement a changé, pour éviter des
// commits inutiles à chaque exécution planifiée.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseStandings, absolutizeLogos } from './parse.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const config = JSON.parse(await readFile(resolve(root, 'classement.config.json'), 'utf8'));
const source = process.env.CLASSEMENT_URL || config.source;
const output = resolve(root, config.output);

const UA = 'Mozilla/5.0 (compatible; HoglyClassementBot/1.0; +https://github.com/JulesWafflard/hogly)';

async function fetchStatic(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'fr-FR,fr' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} sur ${url}`);
  return res.text();
}

// Repli : si le tableau est construit en JavaScript, on rend la page dans
// un vrai navigateur avant de l'analyser.
async function fetchRendered(url) {
  const { chromium } = await import('playwright');
  const browser = await chromium.launch(
    process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
  );
  try {
    const page = await browser.newPage({ userAgent: UA, locale: 'fr-FR' });
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 });
    await page.waitForSelector('table', { timeout: 20_000 }).catch(() => {});
    // Le contenu des iframes (widgets de stats) est ajouté au document.
    let html = await page.content();
    for (const frame of page.frames().slice(1)) {
      try { html += await frame.content(); } catch { /* iframe inaccessible */ }
    }
    return html;
  } finally {
    await browser.close();
  }
}

async function load() {
  const i = process.argv.indexOf('--html');
  if (i !== -1) return { html: await readFile(process.argv[i + 1], 'utf8'), how: 'fichier' };
  const html = await fetchStatic(source);
  if (parseStandings(html).length) return { html, how: 'statique' };
  console.log('Aucun tableau dans le HTML brut, rendu avec un navigateur…');
  return { html: await fetchRendered(source), how: 'navigateur' };
}

const { html, how } = await load();
const poules = absolutizeLogos(parseStandings(html), source);
if (!poules.length) {
  console.error(`Aucun classement trouvé sur ${source}. L'ancien fichier est conservé.`);
  process.exit(1);
}

const previous = await readFile(output, 'utf8').then(JSON.parse).catch(() => null);
if (previous && JSON.stringify(previous.poules) === JSON.stringify(poules)) {
  console.log('Classement inchangé.');
  process.exit(0);
}

const data = {
  competition: config.competition,
  source,
  miseAJour: new Date().toISOString(),
  poules,
};
await mkdir(dirname(output), { recursive: true });
await writeFile(output, JSON.stringify(data, null, 2) + '\n');
console.log(`Classement mis à jour (${how}) : ${poules.map((p) => `${p.nom} (${p.equipes.length} équipes)`).join(', ')}`);
