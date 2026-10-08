/*
 * Widget « classement D2 » du Hogly.
 * Intégration :
 *   <div class="hogly-classement" data-src="URL/classement-d2.json"></div>
 *   <script src="URL/classement.js" defer></script>
 * Options (attributs data-*) :
 *   data-src        URL du JSON (par défaut : ../data/classement-d2.json)
 *   data-highlight  équipes à mettre en avant, séparées par des virgules
 *   data-poule      n'afficher qu'une poule (ex. "Poule A")
 *   data-compact    "true" pour masquer les colonnes détaillées
 */
(function () {
  var CSS = '\
.hogly-classement{--hc-accent:#0b3d91;--hc-highlight:#fff4cc;--hc-border:#e2e5ea;--hc-muted:#6b7280;\
font-family:inherit;color:inherit;max-width:100%}\
.hogly-classement h3{margin:1.2em 0 .5em;font-size:1.1em;color:var(--hc-accent)}\
.hogly-classement .hc-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch}\
.hogly-classement table{width:100%;border-collapse:collapse;font-size:.95em;font-variant-numeric:tabular-nums}\
.hogly-classement th{background:var(--hc-accent);color:#fff;font-weight:600;padding:.5em .4em;text-align:center;white-space:nowrap}\
.hogly-classement td{padding:.45em .4em;border-bottom:1px solid var(--hc-border);text-align:center}\
.hogly-classement td.hc-team,.hogly-classement th.hc-team{text-align:left;white-space:nowrap}\
.hogly-classement td.hc-team img{height:1.4em;width:1.4em;object-fit:contain;vertical-align:middle;margin-right:.4em}\
.hogly-classement td.hc-pts{font-weight:700}\
.hogly-classement tr.hc-us td{background:var(--hc-highlight);font-weight:700}\
.hogly-classement .hc-meta{margin-top:.6em;font-size:.8em;color:var(--hc-muted)}\
.hogly-classement .hc-meta a{color:inherit}\
@media (max-width:600px){.hogly-classement .hc-detail{display:none}}\
.hogly-classement[data-compact=true] .hc-detail{display:none}';

  var COLS = [
    ['rang', '#', ''],
    ['equipe', 'Équipe', 'hc-team'],
    ['joues', 'J', ''],
    ['victoires', 'V', 'hc-detail'],
    ['victoiresProlong', 'VP', 'hc-detail'],
    ['defaitesProlong', 'DP', 'hc-detail'],
    ['defaites', 'D', 'hc-detail'],
    ['nuls', 'N', 'hc-detail'],
    ['butsPour', 'BP', 'hc-detail'],
    ['butsContre', 'BC', 'hc-detail'],
    ['difference', 'Diff', ''],
    ['points', 'Pts', 'hc-pts']
  ];

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function scriptBase() {
    var s = document.currentScript;
    return s ? s.src.replace(/[^/]*$/, '') : '';
  }
  var base = scriptBase();

  function render(root, data) {
    var only = root.getAttribute('data-poule');
    var marks = (root.getAttribute('data-highlight') || 'Roche,Hogly')
      .split(',').map(function (s) { return s.trim().toLowerCase(); }).filter(Boolean);
    root.textContent = '';

    data.poules.forEach(function (poule) {
      if (only && poule.nom.toLowerCase() !== only.toLowerCase()) return;
      var cols = COLS.filter(function (c) {
        return poule.equipes.some(function (t) { return t[c[0]] != null; });
      });
      if (data.poules.length > 1 && !only) root.appendChild(el('h3', null, poule.nom));

      var table = el('table');
      var head = table.createTHead().insertRow();
      cols.forEach(function (c) {
        var th = el('th', c[2], c[1]);
        th.scope = 'col';
        head.appendChild(th);
      });
      var body = table.createTBody();
      poule.equipes.forEach(function (t) {
        var tr = body.insertRow();
        var name = (t.equipe || '').toLowerCase();
        if (marks.some(function (m) { return name.indexOf(m) !== -1; })) tr.className = 'hc-us';
        cols.forEach(function (c) {
          var td = tr.insertCell();
          td.className = c[2];
          var v = t[c[0]];
          if (c[0] === 'equipe' && t.logo) {
            var img = el('img');
            img.src = t.logo; img.alt = ''; img.loading = 'lazy';
            img.style.display = 'none';
            img.onload = function () { img.style.display = ''; };
            td.appendChild(img);
          }
          if (c[0] === 'difference' && v > 0) v = '+' + v;
          td.appendChild(document.createTextNode(v == null ? '' : v));
        });
      });
      var wrap = el('div', 'hc-scroll');
      wrap.appendChild(table);
      root.appendChild(wrap);
    });

    var meta = el('p', 'hc-meta');
    var date = new Date(data.miseAJour);
    meta.appendChild(document.createTextNode('Mis à jour le ' + date.toLocaleDateString('fr-FR') +
      ' à ' + date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) + ' · Source : '));
    var a = el('a', null, 'FFHG');
    a.href = data.source; a.target = '_blank'; a.rel = 'noopener';
    meta.appendChild(a);
    root.appendChild(meta);
  }

  function init(root) {
    var src = root.getAttribute('data-src') || base + '../data/classement-d2.json';
    root.textContent = 'Chargement du classement…';
    // Paramètre anti-cache : le JSON change au fil des matchs.
    var url = src + (src.indexOf('?') === -1 ? '?' : '&') + 't=' + Math.floor(Date.now() / 300000);
    fetch(url)
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (data) { render(root, data); })
      .catch(function () { root.textContent = 'Classement momentanément indisponible.'; });
  }

  var style = el('style', null, CSS);
  document.head.appendChild(style);
  function start() {
    var roots = document.querySelectorAll('.hogly-classement');
    for (var i = 0; i < roots.length; i++) init(roots[i]);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
