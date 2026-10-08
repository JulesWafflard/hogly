import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { parseStandings } from '../scripts/parse.mjs';

const fixture = (name) => readFile(new URL(`./fixtures/${name}`, import.meta.url), 'utf8');

test('extrait les deux poules et ignore les autres tableaux', async () => {
  const poules = parseStandings(await fixture('deux-poules.html'));
  assert.deepEqual(poules.map((p) => p.nom), ['Poule A', 'Poule B']);
  assert.deepEqual(poules[0].equipes[0], {
    rang: 1, equipe: 'La Roche-sur-Yon', logo: '/logos/lry.png', joues: 4, victoires: 3,
    victoiresProlong: 1, defaitesProlong: 0, defaites: 0, butsPour: 18, butsContre: 7,
    difference: 11, points: 11,
  });
  assert.equal(poules[0].equipes[2].difference, -15);
});

test('gère un en-tête équipe vide et calcule la différence de buts', async () => {
  const [, b] = parseStandings(await fixture('deux-poules.html'));
  assert.deepEqual(b.equipes[1], { rang: 2, equipe: 'Valence', joues: 4, points: 8, butsPour: 12, butsContre: 9, difference: 3 });
});

test('ne trouve rien tant que le tableau est généré en JavaScript', async () => {
  assert.deepEqual(parseStandings(await fixture('rendu-js.html')), []);
});
