# Hogly

Site du club de hockey sur glace du Hogly (La Roche-sur-Yon).

## Classement Division 2 automatique

Scorenco ne couvre plus la D2. Ce dépôt récupère donc le classement
directement sur le site officiel de la FFHG et l'affiche sur le site du club.

```
hockeyfrance.com ──(GitHub Actions, toutes les 3 h)──> data/classement-d2.json ──> widget/classement.js ──> site du club
```

- `scripts/update-classement.mjs` télécharge la page de classement de la FFHG
  et en extrait chaque poule (rang, équipe, J, V, VP, DP, D, BP, BC, Diff, Pts).
  Si le tableau est généré en JavaScript, la page est ouverte dans un navigateur
  sans interface. Le JSON n'est réécrit que si le classement a changé.
- `.github/workflows/classement.yml` lance ce script toutes les 3 heures, et
  toutes les 30 minutes les soirs de match du week-end, puis commite le JSON.
- `.github/workflows/pages.yml` publie le widget et le JSON sur GitHub Pages.
- `widget/classement.js` affiche le classement et met le Hogly en avant.

### Mise en route

1. **Settings > Actions > General** : autoriser les workflows à écrire
   (« Read and write permissions »).
2. **Settings > Pages** : Source = « GitHub Actions ».
3. **Actions > Classement D2 > Run workflow** pour un premier lancement.
   Le classement est ensuite visible sur `https://juleswafflard.github.io/hogly/`.

### Intégrer le classement sur le site du club

Coller ce bloc dans la page voulue (bloc « HTML personnalisé » sous WordPress,
« Embed code » sous Wix, etc.) :

```html
<div class="hogly-classement"></div>
<script src="https://juleswafflard.github.io/hogly/widget/classement.js" defer></script>
```

Options :

| Attribut | Effet |
| --- | --- |
| `data-poule="Poule A"` | n'affiche que la poule du Hogly |
| `data-compact="true"` | masque les colonnes détaillées (V, VP, DP, D, BP, BC) |
| `data-highlight="Roche,Hogly"` | équipes mises en avant |
| `data-src="…/classement-d2.json"` | utiliser un autre fichier JSON |

Les couleurs se changent en CSS sur le site du club :

```css
.hogly-classement { --hc-accent: #c8102e; --hc-highlight: #ffe9a8; }
```

### Nouvelle saison ou changement d'adresse

Si la FFHG change l'adresse de la page de classement, il suffit de modifier
`source` dans `classement.config.json`. En cas d'échec (page introuvable ou
tableau non reconnu), le workflow échoue et GitHub envoie un e-mail. L'ancien
classement reste affiché.

GitHub met en pause les tâches planifiées d'un dépôt sans activité pendant
60 jours. Si le classement ne bouge plus pendant l'intersaison, il faut
réactiver le workflow à la reprise (onglet Actions).

### En local

```sh
npm install
npm test
npm run classement
```
