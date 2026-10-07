// The kit preview. Runs inside an iframe on the kit page and on the home page, on ui-design's own
// files: the agent layout, renderBlock and enhance, unchanged.
// URL: /kit/stage/?c=<component>&t=<theme>&v=answer|page&s=<speed>&loop=1
// The kit page changes it in place with postMessage({ c, t, v, s, axes, replay }).
import { mount } from '/ui/layouts/agent.mjs';
import { renderBlock } from '/ui/src/render.mjs';
import { enhance } from '/ui/src/ui.mjs';

const R = JSON.parse(document.getElementById('registry').textContent);
const C = R.content, OPT = R.options;
const byId = Object.fromEntries(R.components.map((c) => [c.id, c]));
const q = new URLSearchParams(location.search);
const S = { c: q.get('c') || 'streaming', t: q.get('t') || OPT.defaultTheme, v: q.get('v') || 'answer', s: q.get('s') || OPT.defaultSpeed, axes: {}, loop: q.get('loop') === '1' };

// Keep the preview out of the page's back button: the agent's history entries replace instead of add.
history.pushState = function (s, t, u) { try { history.replaceState(s, t, u); } catch {} };

// Speed: a multiplier on every pause the agent takes.
let speed = Number(S.s) || 1;
const realTimeout = window.setTimeout.bind(window);
window.setTimeout = (f, ms, ...a) => realTimeout(f, (ms || 0) * speed, ...a);
const sleep = (ms) => new Promise((ok) => setTimeout(ok, ms));

// Light or dark follows the page around the preview.
function siteMode() {
  try {
    const host = window.parent !== window ? window.parent : window;
    const set = host.document.documentElement.dataset.theme;
    if (set === 'light' || set === 'dark') return set;
    return host.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch { return 'dark'; }
}
function applyLook() {
  const theme = OPT.themes.find((x) => x.id === S.t) || OPT.themes[0];
  const link = document.getElementById('theme');
  if (link.getAttribute('href') !== theme.href) link.setAttribute('href', theme.href);
  const want = siteMode();
  document.documentElement.dataset.mode = theme.modes.includes(want) ? want : theme.modes[0];
  for (const ax of OPT.axes || []) {
    const val = S.axes?.[ax.id];
    if (val) document.documentElement.setAttribute(ax.attr, val); else document.documentElement.removeAttribute(ax.attr);
  }
}
try {
  const host = window.parent !== window ? window.parent : null;
  if (host) new MutationObserver(applyLook).observe(host.document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyLook);
} catch {}

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const ctx = { label: (id) => C.questions[id]?.prompt ?? id, href: (id) => '#' + id, avatar: C.site.avatar };

// The agent layout's markup, as ui-design's build writes it.
function shell() {
  const Q = C.questions;
  return `<header class="ui-top"><a class="ui-brand" href="#"><img src="/ui/logo.svg" alt="">${esc(C.site.name)}</a><div class="ui-top-r"><a class="ui-btn" href="#what" data-ask="what">Start</a></div></header>
<main class="ui-stage"><section class="ui-app is-home" data-ui-app>
<button type="button" class="ui-back" data-ui-back hidden>‹ Back</button>
<div class="ui-screen" data-ui-screen aria-live="polite">
<div class="ui-home" data-ui-home><h1>${esc(C.home.headline)}</h1><p class="ui-lede">${esc(C.home.lede)}</p></div>
<div class="ui-answer" data-ui-answer hidden></div></div>
<div class="ui-prompts" data-ui-prompts>${C.featured.map((id) => `<a href="#${id}" data-ask="${id}" aria-current="false">${esc(Q[id].prompt)}</a>`).join('')}</div>
<form class="ui-composer" data-ui-composer><button type="button" class="ui-topics" data-ui-topics aria-haspopup="dialog" aria-expanded="false">Topics</button><input data-ui-input placeholder="${esc(C.home.placeholder)}" aria-label="${esc(C.home.placeholder)}" autocomplete="off"><button type="submit" class="ui-send" aria-label="Send">↑</button></form>
</section>
<nav class="ui-menu" data-ui-menu hidden aria-label="Topics"><div class="ui-menu-in"><div class="ui-menu-h"><b>Topics</b><button type="button" data-ui-menu-close aria-label="Close">×</button></div><div class="ui-menu-g">${C.groups.map((g) => `<div><h3>${esc(g.name)}</h3>${g.ids.map((id) => `<a href="#${id}" data-ask="${id}">${esc(Q[id].prompt)}</a>`).join('')}</div>`).join('')}</div></div></nav>
</main>`;
}

let run = 0;
async function render() {
  const my = ++run;
  const comp = byId[S.c] || R.components[0];
  const wrap = document.createElement('div');
  wrap.className = 'st-root';
  document.getElementById('root').replaceChildren(wrap);
  const plain = comp.kind === 'page' || (comp.kind === 'block' && S.v === 'page');
  if (plain) {
    const html = comp.kind === 'page' ? comp.html : comp.blocks.map((b) => renderBlock(b, ctx)).join('');
    wrap.innerHTML = `<main class="st-page${comp.bare ? ' is-bare' : ''}">${html}</main>`;
    enhance(wrap);
    return;
  }
  wrap.innerHTML = shell();
  const api = mount(wrap, { content: C });
  const live = () => my === run;
  let done;
  if (comp.kind === 'block') {
    await sleep(450); if (!live()) return;
    done = api.show(`Show me ${comp.name.toLowerCase()}`, comp.blocks, '', []);
  } else if (comp.start === 'answer') {
    await sleep(450); if (!live()) return;
    const qq = C.questions[comp.q];
    done = api.show(qq.prompt, qq.blocks, '', qq.next);
  } else if (comp.start === 'type') {
    const input = wrap.querySelector('[data-ui-input]');
    await sleep(900);
    for (const ch of C.questions[comp.q].prompt) { if (!live()) return; input.value += ch; await sleep(48 + Math.random() * 40); }
    await sleep(500); if (!live()) return;
    wrap.querySelector('[data-ui-composer]').requestSubmit();
  } else if (comp.start === 'menu') {
    await sleep(600); if (!live()) return;
    wrap.querySelector('[data-ui-topics]').click();
  }
  if (S.loop && done) { await done; await sleep(5200); if (live()) render(); }
}

// Links to pages of this site open in the page, not inside the preview; demo links go nowhere.
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href]');
  if (!a || a.hasAttribute('data-ask')) return;
  const href = a.getAttribute('href');
  if (href === '#') { e.preventDefault(); return; }
  if (href.startsWith('/') && !href.startsWith('/ui/')) { e.preventDefault(); (window.top || window).location.href = href; }
});

addEventListener('message', (e) => {
  if (e.origin !== location.origin || !e.data || typeof e.data !== 'object') return;
  const d = e.data, before = S.c + '|' + S.v;
  if (d.t) S.t = d.t;
  if (d.s) { S.s = d.s; speed = Number(d.s) || 1; }
  if (d.axes) S.axes = d.axes;
  if (d.c) S.c = d.c;
  if (d.v) S.v = d.v;
  applyLook();
  if (d.replay || S.c + '|' + S.v !== before) render();
});

applyLook();
render();
