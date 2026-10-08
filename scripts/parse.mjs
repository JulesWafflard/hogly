// Extraction des tableaux de classement depuis le HTML d'une page.
// Le parseur ne dépend pas de classes CSS précises : il repère les
// tableaux dont les en-têtes ressemblent à un classement (équipe + points),
// ce qui le rend tolérant aux refontes du site de la fédération.
import * as cheerio from 'cheerio';

// Clé normalisée -> en-têtes possibles (comparés sans accents ni casse).
const COLUMNS = {
  rang: ['rang', 'rg', 'pos', 'position', 'place', 'cl', 'clt', '#', 'n°', 'no'],
  equipe: ['equipe', 'equipes', 'club', 'clubs', 'nom', 'team'],
  points: ['pts', 'points', 'pt', 'p.'],
  joues: ['j', 'mj', 'joues', 'matchs', 'm', 'mp', 'gp', 'pj'],
  victoires: ['v', 'g', 'victoires', 'w', 'vtr'],
  victoiresProlong: ['vp', 'vap', 'vt', 'vtb', 'vprol', 'otw', 'v.p', 'v.ap'],
  defaitesProlong: ['dp', 'dap', 'dt', 'dtb', 'dprol', 'otl', 'd.p', 'd.ap'],
  defaites: ['d', 'p', 'defaites', 'l'],
  nuls: ['n', 'nuls', 't'],
  butsPour: ['bp', 'bm', 'buts pour', 'gf', 'pour', 'b+'],
  butsContre: ['bc', 'be', 'buts contre', 'ga', 'contre', 'b-'],
  difference: ['diff', 'dif', '+/-', 'diff.', 'gd', 'ga', 'goal average', '+-'],
};

const normalize = (s) =>
  String(s ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

function columnKey(header, taken) {
  const h = normalize(header);
  if (!h) return null;
  for (const [key, aliases] of Object.entries(COLUMNS)) {
    if (!taken.has(key) && aliases.includes(h)) return key;
  }
  // Correspondances partielles pour les intitulés longs ("Équipe / Club", "Points").
  if (!taken.has('equipe') && /equipe|club/.test(h)) return 'equipe';
  if (!taken.has('points') && /^points?\b/.test(h)) return 'points';
  return null;
}

const toNumber = (s) => {
  const m = String(s).replace(/−/g, '-').match(/[-+]?\d+/);
  return m ? Number(m[0]) : null;
};

// Titre le plus proche avant le tableau : <caption>, sinon un h1-h6 ou un
// élément ressemblant à un onglet/titre de poule.
function poolName($, table) {
  const caption = $(table).find('caption').first().text().trim();
  if (caption) return caption;
  let node = $(table);
  for (let depth = 0; depth < 6 && node.length; depth++) {
    let prev = node.prev();
    while (prev.length) {
      const heading = prev.is('h1,h2,h3,h4,h5,h6')
        ? prev
        : prev.find('h1,h2,h3,h4,h5,h6').last();
      if (heading.length && heading.text().trim()) return heading.text().trim();
      prev = prev.prev();
    }
    node = node.parent();
  }
  return null;
}

function headerCells($, table) {
  const thead = $(table).find('thead tr').last();
  if (thead.length) return thead.find('th,td').toArray();
  const first = $(table).find('tr').first();
  return first.find('th,td').toArray();
}

export function parseStandings(html) {
  const $ = cheerio.load(html);
  const tables = [];

  $('table').each((_, table) => {
    const headers = headerCells($, table).map((c) => $(c).text());
    const taken = new Set();
    const keys = headers.map((h) => {
      const k = columnKey(h, taken);
      if (k) taken.add(k);
      return k;
    });

    // Certains sites laissent l'en-tête de la colonne équipe vide.
    if (!taken.has('equipe')) {
      const blank = headers.findIndex((h, i) => !normalize(h) && !keys[i] && i <= 2);
      if (blank !== -1) { keys[blank] = 'equipe'; taken.add('equipe'); }
    }
    if (!taken.has('equipe') || !taken.has('points')) return;

    const bodyRows = $(table).find('tbody tr').length
      ? $(table).find('tbody tr').toArray()
      : $(table).find('tr').slice(1).toArray();

    const rows = [];
    for (const tr of bodyRows) {
      const cells = $(tr).find('td,th').toArray();
      if (cells.length < 2) continue;
      const row = {};
      keys.forEach((key, i) => {
        if (!key || !cells[i]) return;
        const cell = $(cells[i]);
        if (key === 'equipe') {
          row.equipe = cell.text().replace(/\s+/g, ' ').trim();
          const img = cell.find('img').first();
          const src = img.attr('data-src') || img.attr('src');
          if (src && !src.startsWith('data:')) row.logo = src;
        } else {
          row[key] = toNumber(cell.text());
        }
      });
      if (!row.equipe || row.points == null) continue;
      rows.push(row);
    }
    if (rows.length < 2) return;

    rows.forEach((r, i) => { if (r.rang == null) r.rang = i + 1; });
    if (rows.every((r) => r.difference == null && r.butsPour != null && r.butsContre != null)) {
      rows.forEach((r) => { r.difference = r.butsPour - r.butsContre; });
    }
    tables.push({ nom: poolName($, table), equipes: rows });
  });

  // Nomme les poules restées anonymes.
  const letters = 'ABCDEFGH';
  tables.forEach((t, i) => {
    if (!t.nom) t.nom = tables.length > 1 ? `Poule ${letters[i] ?? i + 1}` : 'Classement';
  });
  return tables;
}

// Rend les URLs de logos absolues.
export function absolutizeLogos(tables, baseUrl) {
  for (const t of tables) {
    for (const r of t.equipes) {
      if (r.logo) {
        try { r.logo = new URL(r.logo, baseUrl).href; } catch { delete r.logo; }
      }
    }
  }
  return tables;
}
