/*
 * Widget « classement D2 » du Hogly.
 * Intégration :
 *   <div class="hogly-classement"></div>
 *   <script src="https://juleswafflard.github.io/hogly/widget/classement.js" defer></script>
 * Options (attributs data-*) :
 *   data-src        URL du JSON (par défaut : ../data/classement-d2.json)
 *   data-highlight  équipes à mettre en avant, séparées par des virgules
 *   data-poule      n'afficher qu'une poule (ex. "Poule A") ; sinon des onglets
 *   data-compact    "true" pour masquer les colonnes détaillées
 *   data-theme      "dark" (par défaut) ou "light"
 *   data-playoffs   nombre d'équipes qualifiées pour les playoffs (8 ; 0 = pas de ligne)
 */
(function () {
  var FONT = 'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800;900&family=Barlow:wght@500;600&display=swap';

  // Barres inclinées façon « bandeau TV » : les cellules sont des
  // parallélogrammes (clip-path), le texte reste droit.
  var CSS = '\
.hogly-classement{--hc-red:#b2170d;--hc-bg:#0a0a0a;--hc-bar:#fff;--hc-bar-text:#0a0a0a;--hc-text:#fff;\
--hc-muted:rgba(255,255,255,.55);--hc-us-bar:var(--hc-red);--hc-red-text:#e0463b;--hc-us-text:#fff;--hc-slant:9px;\
--hc-stat:2.9em;--hc-tab-bg:rgba(255,255,255,.1);--hc-gap:5px;\
font-family:Barlow,system-ui,sans-serif;color:var(--hc-text);background:var(--hc-bg);\
padding:22px 20px 18px;max-width:100%;box-sizing:border-box;overflow:hidden;line-height:1.2;\
border-top:4px solid var(--hc-red)}\
.hogly-classement[data-theme=light]{--hc-bg:#fff;--hc-bar:#0a0a0a;--hc-bar-text:#fff;--hc-text:#0a0a0a;\
--hc-muted:rgba(10,10,10,.55);--hc-red-text:var(--hc-red);--hc-tab-bg:rgba(0,0,0,.07);box-shadow:inset 0 0 0 1px rgba(0,0,0,.08)}\
.hogly-classement *{box-sizing:border-box}\
.hc-head{display:flex;align-items:flex-end;justify-content:space-between;gap:12px 20px;flex-wrap:wrap;margin-bottom:18px}\
.hc-kicker{font:700 12px/1 Barlow,sans-serif;letter-spacing:.2em;text-transform:uppercase;color:var(--hc-red-text);margin:0 0 6px}\
.hc-title{font:900 36px/0.9 "Barlow Condensed",sans-serif;text-transform:uppercase;margin:0}\
.hc-tabs{display:flex;gap:6px}\
.hc-tab{appearance:none;border:0;cursor:pointer;background:transparent;color:var(--hc-muted);\
font:800 15px/1 "Barlow Condensed",sans-serif;letter-spacing:.06em;text-transform:uppercase;padding:9px 18px;\
clip-path:polygon(var(--hc-slant) 0,100% 0,calc(100% - var(--hc-slant)) 100%,0 100%);\
background:var(--hc-tab-bg);transition:background .15s,color .15s}\
.hc-tab:hover{color:var(--hc-text)}\
.hc-tab[aria-selected=true]{background:var(--hc-red);color:#fff}\
.hc-tab:focus-visible{outline:2px solid var(--hc-text);outline-offset:2px}\
.hc-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch}\
.hc-table{display:grid;gap:var(--hc-gap);min-width:max-content;font-variant-numeric:tabular-nums}\
.hc-row{display:grid;grid-template-columns:2.1em minmax(12em,1fr) repeat(var(--hc-n),var(--hc-stat));gap:var(--hc-gap);align-items:stretch}\
.hc-row>*{display:flex;align-items:center;justify-content:center}\
.hc-th{text-decoration:none;cursor:default;font:800 17px/1 "Barlow Condensed",sans-serif;text-transform:uppercase;color:var(--hc-text);padding:0 0 2px}\
.hc-th.hc-team{justify-content:flex-start;padding-left:4px;font-size:15px;letter-spacing:.06em;color:var(--hc-muted)}\
.hc-rank{font:900 28px/1 "Barlow Condensed",sans-serif;color:var(--hc-text);justify-content:flex-start}\
.hc-row.hc-down .hc-rank{color:var(--hc-red-text)}\
.hc-cell{background:var(--hc-bar);color:var(--hc-bar-text);min-height:46px;\
font:800 22px/1 "Barlow Condensed",sans-serif;\
clip-path:polygon(var(--hc-slant) 0,100% 0,calc(100% - var(--hc-slant)) 100%,0 100%)}\
.hc-cell.hc-team{justify-content:flex-start;gap:12px;padding:0 22px 0 8px;\
clip-path:polygon(0 0,100% 0,calc(100% - var(--hc-slant)) 100%,0 100%)}\
.hc-logo{flex:none;width:36px;height:36px;display:grid;place-items:center}\
.hc-logo img{max-width:100%;max-height:100%;object-fit:contain}\
.hc-logo span{width:100%;height:100%;display:grid;place-items:center;background:var(--hc-bar-text);color:var(--hc-bar);\
font:800 12px/1 "Barlow Condensed",sans-serif}\
.hc-name{font:900 23px/1 "Barlow Condensed",sans-serif;text-transform:uppercase;white-space:nowrap;overflow:hidden;\
text-overflow:ellipsis;max-width:14em}\
.hc-row.hc-us .hc-cell{background:var(--hc-us-bar);color:var(--hc-us-text)}\
.hc-row.hc-us .hc-rank{color:var(--hc-red)}\
.hogly-classement:not([data-theme=light]) .hc-row.hc-us .hc-rank{color:#fff}\
.hc-row.hc-us .hc-logo{background:#fff;padding:3px}\
.hc-pts{font-weight:900}\
.hc-cut{display:flex;align-items:center;gap:10px;margin:4px 0;font:700 11px/1 Barlow,sans-serif;letter-spacing:.18em;\
text-transform:uppercase;color:var(--hc-muted)}\
.hc-cut:before,.hc-cut:after{content:"";flex:1;border-top:2px dashed var(--hc-red);opacity:.7}\
.hc-legend{display:flex;gap:16px;flex-wrap:wrap;margin:16px 0 0;font-size:12px;color:var(--hc-muted)}\
.hc-legend b{color:var(--hc-text);font-weight:600}\
.hc-meta{margin:10px 0 0;font-size:12px;color:var(--hc-muted)}\
.hc-meta a{color:inherit}\
.hc-msg{padding:24px 4px;color:var(--hc-muted);text-align:center}\
@keyframes hc-in{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:none}}\
.hc-body .hc-row{animation:hc-in .35s ease both}\
@media (prefers-reduced-motion:reduce){.hc-body .hc-row{animation:none}.hc-tab{transition:none}}\
@media (max-width:640px){.hogly-classement{padding:16px 12px 14px;--hc-stat:2.4em;--hc-gap:4px;--hc-slant:7px}\
.hc-title{font-size:30px}.hogly-classement .hc-detail{display:none}.hc-legend{display:none}\
.hc-row{grid-template-columns:1.7em minmax(0,1fr) repeat(var(--hc-n-compact),var(--hc-stat))}\
.hc-table{min-width:0}.hc-cell{min-height:40px;font-size:19px}.hc-cell.hc-team{gap:8px;padding-right:14px}\
.hc-name{font-size:17px;max-width:none}.hc-logo{width:28px;height:28px}.hc-rank{font-size:22px}.hc-th{font-size:15px}}\
.hogly-classement[data-compact=true] .hc-detail{display:none}\
.hogly-classement[data-compact=true] .hc-row{grid-template-columns:2.1em minmax(12em,1fr) repeat(var(--hc-n-compact),var(--hc-stat))}';

  // [clé, en-tête, détaillée ?, légende]
  var COLS = [
    ['points', 'Pts', false, 'points'],
    ['joues', 'J', false, 'joués'],
    ['victoires', 'V', true, 'victoires'],
    ['victoiresProlong', 'VP', true, 'vict. prolong.'],
    ['defaitesProlong', 'DP', true, 'déf. prolong.'],
    ['defaites', 'D', true, 'défaites'],
    ['nuls', 'N', true, 'nuls'],
    ['butsPour', 'BP', true, 'buts pour'],
    ['butsContre', 'BC', true, 'buts contre'],
    ['difference', '+/-', false, 'différence']
  ];

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function initials(name) {
    var words = name.replace(/[^A-Za-zÀ-ÿ0-9 \-]/g, '').split(/[\s\-]+/).filter(Boolean);
    return (words.length > 1 ? words[0][0] + words[1][0] : (words[0] || '?').slice(0, 3)).toUpperCase();
  }

  function logo(t) {
    var box = el('span', 'hc-logo');
    var fallback = el('span', null, initials(t.equipe || ''));
    if (!t.logo) { box.appendChild(fallback); return box; }
    var img = el('img');
    img.alt = ''; img.loading = 'lazy'; img.decoding = 'async';
    img.onerror = function () { box.replaceChild(fallback, img); };
    img.src = t.logo;
    box.appendChild(img);
    return box;
  }

  var base = document.currentScript ? document.currentScript.src.replace(/[^/]*$/, '') : '';

  function isUs(name, marks) {
    name = (name || '').toLowerCase();
    return marks.some(function (m) { return name.indexOf(m) !== -1; });
  }

  function cell(tag, cls, text, role) {
    var c = el(tag, cls, text);
    c.setAttribute('role', role);
    return c;
  }

  function renderTable(poule, marks, playoffs) {
    var cols = COLS.filter(function (c) {
      return poule.equipes.some(function (t) { return t[c[0]] != null; });
    });
    var table = el('div', 'hc-table');
    table.setAttribute('role', 'table');
    table.setAttribute('aria-label', 'Classement ' + poule.nom);
    table.style.setProperty('--hc-n', cols.length);
    table.style.setProperty('--hc-n-compact', cols.filter(function (c) { return !c[2]; }).length);

    var head = el('div', 'hc-row');
    head.setAttribute('role', 'row');
    head.appendChild(cell('span', 'hc-th', '#', 'columnheader'));
    head.appendChild(cell('span', 'hc-th hc-team', poule.nom, 'columnheader'));
    cols.forEach(function (c) {
      var th = cell('abbr', 'hc-th' + (c[2] ? ' hc-detail' : ''), c[1], 'columnheader');
      th.title = c[3];
      head.appendChild(th);
    });
    table.appendChild(head);

    var body = el('div', 'hc-body');
    body.setAttribute('role', 'rowgroup');
    body.style.display = 'contents';
    poule.equipes.forEach(function (t, i) {
      if (playoffs > 0 && i === playoffs && poule.equipes.length > playoffs) {
        var cut = el('div', 'hc-cut', 'Playoffs ▲  ·  ▼ Maintien');
        cut.setAttribute('aria-hidden', 'true');
        body.appendChild(cut);
      }
      var row = el('div', 'hc-row');
      row.setAttribute('role', 'row');
      row.style.animationDelay = (i * 40) + 'ms';
      if (isUs(t.equipe, marks)) row.className += ' hc-us';
      if (playoffs > 0 && i >= playoffs) row.className += ' hc-down';

      row.appendChild(cell('span', 'hc-rank', t.rang, 'cell'));
      var team = cell('span', 'hc-cell hc-team', null, 'rowheader');
      team.appendChild(logo(t));
      var name = el('span', 'hc-name', t.equipe);
      name.title = t.equipe;
      team.appendChild(name);
      row.appendChild(team);

      cols.forEach(function (c) {
        var v = t[c[0]];
        if (c[0] === 'difference' && v != null) v = v > 0 ? '+' + v : v < 0 ? '−' + Math.abs(v) : '0';
        row.appendChild(cell('span', 'hc-cell' + (c[2] ? ' hc-detail' : '') + (c[0] === 'points' ? ' hc-pts' : ''),
          v == null ? '' : v, 'cell'));
      });
      body.appendChild(row);
    });
    table.appendChild(body);

    var wrap = el('div', 'hc-scroll');
    wrap.appendChild(table);

    var legend = el('p', 'hc-legend');
    cols.forEach(function (c) {
      var item = el('span');
      item.appendChild(el('b', null, c[1]));
      item.appendChild(document.createTextNode(' ' + c[3]));
      legend.appendChild(item);
    });
    return [wrap, legend];
  }

  function render(root, data) {
    var only = root.getAttribute('data-poule');
    var playoffs = parseInt(root.getAttribute('data-playoffs') || '8', 10);
    var marks = (root.getAttribute('data-highlight') || 'Roche,Hogly')
      .split(',').map(function (s) { return s.trim().toLowerCase(); }).filter(Boolean);
    var poules = data.poules.filter(function (p) {
      return !only || p.nom.toLowerCase() === only.toLowerCase();
    });
    if (!poules.length) poules = data.poules;
    root.textContent = '';

    var head = el('div', 'hc-head');
    var titles = el('div');
    titles.appendChild(el('p', 'hc-kicker', data.competition || 'Division 2'));
    titles.appendChild(el('h3', 'hc-title', 'Classement'));
    head.appendChild(titles);
    root.appendChild(head);

    var content = el('div');
    root.appendChild(content);
    var tabs = [];
    function show(i) {
      content.textContent = '';
      renderTable(poules[i], marks, playoffs).forEach(function (n) { content.appendChild(n); });
      tabs.forEach(function (b, j) { b.setAttribute('aria-selected', String(i === j)); b.tabIndex = i === j ? 0 : -1; });
    }

    if (poules.length > 1) {
      var bar = el('div', 'hc-tabs');
      bar.setAttribute('role', 'tablist');
      poules.forEach(function (p, i) {
        var b = el('button', 'hc-tab', p.nom);
        b.type = 'button';
        b.setAttribute('role', 'tab');
        b.onclick = function () { show(i); };
        b.onkeydown = function (e) {
          var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
          if (!d) return;
          var n = (i + d + poules.length) % poules.length;
          show(n); tabs[n].focus();
        };
        tabs.push(b);
        bar.appendChild(b);
      });
      head.appendChild(bar);
    }

    // Onglet par défaut : la poule du Hogly.
    var start = 0;
    for (var i = 0; i < poules.length; i++) {
      if (poules[i].equipes.some(function (t) { return isUs(t.equipe, marks); })) { start = i; break; }
    }
    show(start);

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
    root.textContent = '';
    root.appendChild(el('p', 'hc-msg', 'Chargement du classement…'));
    // Paramètre anti-cache : le JSON change au fil des matchs.
    var url = src + (src.indexOf('?') === -1 ? '?' : '&') + 't=' + Math.floor(Date.now() / 300000);
    fetch(url)
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (data) { render(root, data); })
      .catch(function () {
        root.textContent = '';
        root.appendChild(el('p', 'hc-msg', 'Classement momentanément indisponible.'));
      });
  }

  if (!document.querySelector('link[data-hogly-font]')) {
    var link = el('link');
    link.rel = 'stylesheet'; link.href = FONT; link.setAttribute('data-hogly-font', '');
    document.head.appendChild(link);
  }
  document.head.appendChild(el('style', null, CSS));
  function start() {
    var roots = document.querySelectorAll('.hogly-classement');
    for (var i = 0; i < roots.length; i++) init(roots[i]);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
