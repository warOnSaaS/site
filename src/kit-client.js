// The kit page: pick a component, see it live in the preview, switch theme, copy the code.
// Every component has its own address (/kit/<id>/), so links and the back button work.
(function () {
  var src = document.getElementById('kit-data').dataset.src;
  fetch(src).then(function (r) { return r.json(); }).then(start);
})();
function start(R) {
  var OPT = R.options, byId = {};
  R.components.forEach(function (c) { byId[c.id] = c; });
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return [].slice.call((el || document).querySelectorAll(s)); };
  var frame = $('#stage'), store = {
    get: function (k) { try { return localStorage.getItem('wos-kit-' + k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem('wos-kit-' + k, v); } catch (e) {} },
  };
  var S = {
    c: document.body.dataset.component,
    t: store.get('theme') || OPT.defaultTheme,
    v: store.get('variant') || 'answer',
    s: store.get('speed') || OPT.defaultSpeed,
    axes: {},
    tab: 0,
  };
  if (!OPT.themes.some(function (t) { return t.id === S.t; })) S.t = OPT.defaultTheme;
  if (!OPT.speeds.some(function (x) { return x[0] === S.s; })) S.s = OPT.defaultSpeed;
  (OPT.axes || []).forEach(function (ax) { var v = store.get('axis-' + ax.id); if (v) S.axes[ax.id] = v; });

  var post = function (msg) { try { frame.contentWindow.postMessage(msg, location.origin); } catch (e) {} };

  // ---- toolbar, drawn from the options list ----
  function seg(el, items, current, onPick) {
    el.innerHTML = items.map(function (it) { return '<button type="button" data-v="' + it[0] + '" aria-pressed="' + (it[0] === current) + '">' + it[1] + '</button>'; }).join('');
    el.onclick = function (e) {
      var b = e.target.closest('button'); if (!b) return;
      $$('button', el).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      onPick(b.dataset.v);
    };
  }
  function pick(el, items, current, onPick) {
    el.innerHTML = items.map(function (it) { return '<option value="' + it[0] + '"' + (it[0] === current ? ' selected' : '') + '>' + it[1] + '</option>'; }).join('');
    el.onchange = function () { onPick(el.value); };
  }
  pick($('[data-themes]'), OPT.themes.map(function (t) { return [t.id, t.label]; }), S.t, function (v) { S.t = v; store.set('theme', v); post({ t: v }); drawInstall(); });
  seg($('[data-variants]'), [['answer', 'In an answer'], ['page', 'On a page']], S.v, function (v) { S.v = v; store.set('variant', v); post({ v: v }); drawTabs(); });
  var sp = $('[data-speed]');
  sp.innerHTML = OPT.speeds.map(function (x) { return '<option value="' + x[0] + '"' + (x[0] === S.s ? ' selected' : '') + '>' + x[1] + '</option>'; }).join('');
  sp.onchange = function () { S.s = sp.value; store.set('speed', S.s); post({ s: S.s, replay: true }); };
  var axesBox = $('[data-axes]');
  axesBox.innerHTML = (OPT.axes || []).map(function (ax) { return '<label class="speed"><span>' + ax.label + '</span><select data-axis="' + ax.id + '" aria-label="' + ax.label + '"></select></label>'; }).join('');
  (OPT.axes || []).forEach(function (ax) {
    if (!ax.values.some(function (v) { return v[0] === S.axes[ax.id]; })) delete S.axes[ax.id];
    pick($('[data-axis="' + ax.id + '"]'), ax.values, S.axes[ax.id] || ax.default, function (v) { S.axes[ax.id] = v; store.set('axis-' + ax.id, v); post({ axes: S.axes }); drawInstall(); });
  });
  $('[data-replay]').onclick = function () { post({ replay: true }); };

  // ---- the panels for one component ----
  function code() { var c = byId[S.c]; return c.kind === 'block' && S.v === 'page' ? c.codePage : c.code; }
  function drawTabs() {
    var tabs = code();
    if (S.tab >= tabs.length) S.tab = 0;
    $('[data-tabs]').innerHTML = tabs.map(function (t, i) { return '<button type="button" role="tab" aria-selected="' + (i === S.tab) + '" data-i="' + i + '">' + t.label + '</button>'; }).join('');
    $('[data-code]').innerHTML = tabs[S.tab].hl;
  }
  $('[data-tabs]').onclick = function (e) { var b = e.target.closest('button'); if (b) { S.tab = +b.dataset.i; drawTabs(); } };
  function drawInstall() {
    var t = OPT.themes.find(function (x) { return x.id === S.t; });
    var c = byId[S.c];
    var attrs = ' data-scheme="' + t.scheme + '"' + (OPT.axes || []).map(function (ax) { return ' ' + ax.attr + '="' + (S.axes[ax.id] || ax.default) + '"'; }).join('');
    var lines = ['<html' + attrs + '>', '<link rel="stylesheet" href="' + R.site + '/ui/src/ui.css">', '<link rel="stylesheet" href="' + R.site + '/ui/src/tokens.css">'];
    if (t.href) lines.push('<link rel="stylesheet" href="' + R.site + t.href + '">');
    if (c.kind === 'agent') lines.push('<script type="module" src="' + R.site + '/ui/layouts/boot.mjs" data-ui-boot data-content="/content.json"></script>');
    else if (c.id === 'table' || c.id === 'form') lines.push('<script type="module">import { enhance } from "' + R.site + '/ui/src/ui.mjs"; enhance();</script>');
    $('[data-install]').textContent = lines.join('\n');
    $('[data-theme-note]').textContent = t.label + ': ' + t.note;
  }
  function select(id, push, init) {
    if (!byId[id]) return;
    var c = byId[id];
    S.c = id; S.tab = 0;
    document.body.dataset.component = id;
    $$('[data-c]').forEach(function (a) { a.setAttribute('aria-current', String(a.dataset.c === id)); });
    var chip = $('.kit-chips [data-c="' + id + '"]'); if (chip) chip.scrollIntoView({ block: 'nearest', inline: 'center', behavior: push ? 'smooth' : 'auto' });
    $('[data-name]').textContent = c.name;
    $('[data-blurb]').textContent = c.blurb;
    $('[data-group]').textContent = c.group;
    $('[data-variants]').hidden = c.kind !== 'block';
    $('[data-replay]').hidden = c.kind === 'page';
    $('[data-speed-wrap]').hidden = c.kind === 'page';
    $('[data-fields]').innerHTML = c.fieldsHtml;
    $('[data-fields-wrap]').hidden = !c.fieldsHtml;
    $('[data-notes]').innerHTML = (c.notes || []).map(function (n) { return '<li>' + n + '</li>'; }).join('');
    $('[data-notes-wrap]').hidden = !(c.notes && c.notes.length);
    $('[data-open]').href = '/kit/stage/?c=' + id + '&t=' + S.t;
    document.title = c.name + ' · UI kit · warOnSaaS';
    drawTabs(); drawInstall();
    if (!init) post({ c: id, t: S.t, v: S.v, s: S.s, axes: S.axes, replay: true });
    if (push) history.pushState({ c: id }, '', '/kit/' + id + '/');
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[data-c]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
    e.preventDefault(); select(a.dataset.c, true);
  });
  addEventListener('popstate', function () { var id = location.pathname.split('/').filter(Boolean)[1] || R.components[0].id; select(id, false); });

  // search
  var search = $('[data-search]');
  search.addEventListener('input', function () {
    var q = search.value.trim().toLowerCase();
    $$('.kit-nav a[data-c]').forEach(function (a) { a.hidden = q && a.textContent.toLowerCase().indexOf(q) < 0 && byId[a.dataset.c].blurb.toLowerCase().indexOf(q) < 0; });
    $$('.kit-nav .kit-g').forEach(function (g) { g.hidden = !$$('a[data-c]', g).some(function (a) { return !a.hidden; }); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === '/' && document.activeElement !== search && !/input|textarea|select/i.test(document.activeElement.tagName)) { e.preventDefault(); search.focus(); }
  });

  // copy buttons
  function copy(btn, text) {
    var done = function () { btn.dataset.copied = '1'; setTimeout(function () { delete btn.dataset.copied; }, 1400); };
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, function () {}); else done();
  }
  $('[data-copy-code]').onclick = function () { copy(this, code()[S.tab].text); };
  $('[data-copy-install]').onclick = function () { copy(this, $('[data-install]').textContent); };

  // the iframe starts with the address's component; send the saved look once it is up
  frame.addEventListener('load', function () { post({ t: S.t, v: S.v, s: S.s, axes: S.axes, c: S.c, replay: S.t !== OPT.defaultTheme || S.v !== 'answer' || S.s !== OPT.defaultSpeed }); });
  select(S.c, false, true);
  try { if (frame.contentDocument && frame.contentDocument.readyState === 'complete') post({ t: S.t, v: S.v, s: S.s, axes: S.axes, c: S.c, replay: true }); } catch (e) {}
}
