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
  var FONT = 'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700;800&family=Barlow:wght@400;500;600&display=swap';

  var CSS = '\
.hogly-classement{--hc-bg:#0c0d0f;--hc-panel:#15171a;--hc-line:rgba(255,255,255,.08);--hc-text:#f4f5f6;\
--hc-muted:rgba(244,245,246,.55);--hc-us-bg:#f4f5f6;--hc-us-text:#0c0d0f;--hc-win:#4ade80;--hc-loss:#f87171;\
--hc-ice:#9fd3ff;--hc-radius:16px;\
font-family:Barlow,system-ui,sans-serif;color:var(--hc-text);background:var(--hc-bg);\
background-image:radial-gradient(120% 80% at 100% 0,rgba(159,211,255,.10),transparent 60%),\
radial-gradient(80% 60% at 0 100%,rgba(255,255,255,.05),transparent 60%);\
border-radius:var(--hc-radius);padding:20px;max-width:100%;box-sizing:border-box;overflow:hidden;line-height:1.3}\
.hogly-classement[data-theme=light]{--hc-bg:#fff;--hc-panel:#f3f4f6;--hc-line:rgba(0,0,0,.08);--hc-text:#0c0d0f;\
--hc-muted:rgba(12,13,15,.55);--hc-us-bg:#0c0d0f;--hc-us-text:#fff;--hc-win:#15803d;--hc-loss:#b91c1c;--hc-ice:#1d6fb8;\
box-shadow:0 1px 3px rgba(0,0,0,.08),0 8px 24px rgba(0,0,0,.06)}\
.hogly-classement *{box-sizing:border-box}\
.hc-head{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:16px}\
.hc-kicker{font:600 12px/1 Barlow,sans-serif;letter-spacing:.18em;text-transform:uppercase;color:var(--hc-ice);margin:0 0 6px}\
.hc-title{font:800 34px/0.95 "Barlow Condensed",sans-serif;text-transform:uppercase;letter-spacing:.01em;margin:0}\
.hc-tabs{display:flex;gap:4px;background:var(--hc-panel);padding:4px;border-radius:999px}\
.hc-tab{appearance:none;border:0;background:transparent;color:var(--hc-muted);cursor:pointer;\
font:700 14px/1 "Barlow Condensed",sans-serif;letter-spacing:.08em;text-transform:uppercase;padding:9px 16px;border-radius:999px;\
transition:background .2s,color .2s}\
.hc-tab:hover{color:var(--hc-text)}\
.hc-tab[aria-selected=true]{background:var(--hc-text);color:var(--hc-bg)}\
.hc-tab:focus-visible{outline:2px solid var(--hc-ice);outline-offset:2px}\
.hc-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch;margin:0 -4px;padding:0 4px}\
.hogly-classement table{width:100%;border-collapse:separate;border-spacing:0 4px;font-variant-numeric:tabular-nums}\
.hogly-classement th{font:600 11px/1 Barlow,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:var(--hc-muted);\
padding:4px 6px 8px;text-align:center;white-space:nowrap}\
.hogly-classement td{padding:9px 6px;text-align:center;font-size:15px;background:var(--hc-panel)}\
.hogly-classement td:first-child{border-radius:10px 0 0 10px;padding-left:10px}\
.hogly-classement td:last-child{border-radius:0 10px 10px 0;padding-right:12px}\
.hogly-classement th.hc-team,.hogly-classement td.hc-team{text-align:left}\
.hc-rank{font:800 20px/1 "Barlow Condensed",sans-serif;width:2.2em}\
.hc-team-cell{display:flex;align-items:center;gap:10px;min-width:0}\
.hc-logo{flex:none;width:34px;height:34px;border-radius:50%;background:#fff;display:grid;place-items:center;overflow:hidden;\
box-shadow:0 0 0 1px var(--hc-line)}\
.hc-logo img{width:78%;height:78%;object-fit:contain}\
.hc-logo span{font:800 12px/1 "Barlow Condensed",sans-serif;color:#0c0d0f;letter-spacing:.02em}\
.hc-name{font:700 17px/1.1 "Barlow Condensed",sans-serif;text-transform:uppercase;letter-spacing:.03em;white-space:nowrap;\
overflow:hidden;text-overflow:ellipsis;max-width:16em}\
.hc-pts{font:800 22px/1 "Barlow Condensed",sans-serif}\
.hc-pos{color:var(--hc-win)}.hc-neg{color:var(--hc-loss)}\
.hogly-classement tr.hc-us td{background:var(--hc-us-bg);color:var(--hc-us-text)}\
.hogly-classement tr.hc-us .hc-pos,.hogly-classement tr.hc-us .hc-neg{color:var(--hc-us-text)}\
.hogly-classement tr.hc-us .hc-logo{box-shadow:0 0 0 2px var(--hc-us-text)}\
.hogly-classement tr.hc-cut td{background:transparent;padding:6px 0 2px}\
.hc-cut-line{display:flex;align-items:center;gap:10px;font:600 10px/1 Barlow,sans-serif;letter-spacing:.16em;\
text-transform:uppercase;color:var(--hc-muted)}\
.hc-cut-line:before,.hc-cut-line:after{content:"";flex:1;border-top:1px dashed var(--hc-line)}\
.hc-legend{display:flex;gap:16px;flex-wrap:wrap;margin:14px 0 0;font-size:12px;color:var(--hc-muted)}\
.hc-legend b{color:var(--hc-text);font-weight:600}\
.hc-meta{margin:12px 0 0;font-size:12px;color:var(--hc-muted)}\
.hc-meta a{color:inherit}\
.hc-msg{padding:24px 4px;color:var(--hc-muted);text-align:center}\
@keyframes hc-in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}\
.hogly-classement tbody tr{animation:hc-in .35s ease both}\
@media (prefers-reduced-motion:reduce){.hogly-classement tbody tr{animation:none}.hc-tab{transition:none}}\
@media (max-width:640px){.hogly-classement{padding:14px}.hc-title{font-size:28px}\
.hogly-classement .hc-detail{display:none}.hc-name{max-width:9.5em;font-size:16px}.hc-logo{width:30px;height:30px}\
.hogly-classement td{padding:8px 4px}.hc-legend{display:none}}\
.hogly-classement[data-compact=true] .hc-detail,.hogly-classement[data-compact=true] .hc-detail-legend{display:none}';

  var COLS = [
    ['rang', '#', 'hc-rank'],
    ['equipe', 'Équipe', 'hc-team'],
    ['joues', 'J', ''],
    ['victoires', 'V', 'hc-detail'],
    ['victoiresProlong', 'VP', 'hc-detail'],
    ['defaitesProlong', 'DP', 'hc-detail'],
    ['defaites', 'D', 'hc-detail'],
    ['nuls', 'N', 'hc-detail'],
    ['butsPour', 'BP', 'hc-detail'],
    ['butsContre', 'BC', 'hc-detail'],
    ['difference', '+/-', ''],
    ['points', 'Pts', 'hc-pts']
  ];
  var LEGEND = { joues: 'joués', victoires: 'victoires', victoiresProlong: 'vict. prolong.',
    defaitesProlong: 'déf. prolong.', defaites: 'défaites', butsPour: 'buts pour', butsContre: 'buts contre' };

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

  function renderTable(poule, marks, playoffs) {
    var cols = COLS.filter(function (c) {
      return poule.equipes.some(function (t) { return t[c[0]] != null; });
    });
    var table = el('table');
    var head = table.createTHead().insertRow();
    cols.forEach(function (c) {
      var th = el('th', c[2] === 'hc-rank' || c[2] === 'hc-pts' ? '' : c[2], c[1]);
      th.scope = 'col';
      if (c[0] === 'equipe') th.className = 'hc-team';
      head.appendChild(th);
    });
    var body = table.createTBody();
    poule.equipes.forEach(function (t, i) {
      if (playoffs > 0 && i === playoffs && poule.equipes.length > playoffs) {
        var cut = body.insertRow();
        cut.className = 'hc-cut';
        var td = cut.insertCell();
        td.colSpan = cols.length;
        td.appendChild(el('div', 'hc-cut-line', 'Playoffs ▲  ·  ▼ Maintien'));
      }
      var tr = body.insertRow();
      tr.style.animationDelay = (i * 35) + 'ms';
      if (isUs(t.equipe, marks)) tr.className = 'hc-us';
      cols.forEach(function (c) {
        var td = tr.insertCell();
        td.className = c[2];
        var v = t[c[0]];
        if (c[0] === 'equipe') {
          var cell = el('div', 'hc-team-cell');
          cell.appendChild(logo(t));
          var name = el('span', 'hc-name', v);
          name.title = v;
          cell.appendChild(name);
          td.appendChild(cell);
          return;
        }
        if (c[0] === 'difference' && v != null) {
          if (v > 0) { v = '+' + v; td.className += ' hc-pos'; }
          else if (v < 0) { v = '−' + Math.abs(v); td.className += ' hc-neg'; }
        }
        td.textContent = v == null ? '' : v;
      });
    });
    var wrap = el('div', 'hc-scroll');
    wrap.appendChild(table);

    var legend = el('p', 'hc-legend');
    cols.forEach(function (c) {
      if (!LEGEND[c[0]]) return;
      var item = el('span', c[0] === 'joues' ? '' : 'hc-detail-legend');
      item.appendChild(el('b', null, c[1]));
      item.appendChild(document.createTextNode(' ' + LEGEND[c[0]]));
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
    var title = el('h3', 'hc-title', poules[0].nom);
    titles.appendChild(title);
    head.appendChild(titles);
    root.appendChild(head);

    var content = el('div');
    root.appendChild(content);
    function show(i) {
      title.textContent = poules[i].nom;
      content.textContent = '';
      renderTable(poules[i], marks, playoffs).forEach(function (n) { content.appendChild(n); });
      tabs.forEach(function (b, j) { b.setAttribute('aria-selected', String(i === j)); b.tabIndex = i === j ? 0 : -1; });
    }

    var tabs = [];
    if (poules.length > 1) {
      var bar = el('div', 'hc-tabs');
      bar.setAttribute('role', 'tablist');
      poules.forEach(function (p, i) {
        var b = el('button', 'hc-tab', p.nom.replace(/^poule\s*/i, 'Poule '));
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
    poules.forEach(function (p, i) {
      if (p.equipes.some(function (t) { return isUs(t.equipe, marks); })) start = start || i;
    });
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
