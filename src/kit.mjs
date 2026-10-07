// The UI kit page: a component library you select from. Sidebar of components, one big live
// preview (ui-design's own files, in an iframe), its code under it, and what it takes on the right.
import { layout, esc, SITE_URL, ASSET, ORG } from './layout.mjs';
import { softwareLd } from './projects.mjs';
import { COMPONENTS, CONTENT, GROUPS } from './kit-components.mjs';
import { OPTIONS } from './kit-options.mjs';
import { prettyHtml, prettyJson, highlight } from './code.mjs';
import { renderBlock } from '../vendor/ui-design/src/render.mjs';

const ctx = { label: (id) => CONTENT.questions[id]?.prompt ?? id, href: (id) => '#' + id, avatar: CONTENT.site.avatar };
const GROUP_ICON = { Agent: 'g1', Blocks: 'g2', Page: 'g3' };
const tab = (label, lang, text) => ({ label, lang, text, hl: highlight(text, lang) });
const head = () => `<!-- on <html>: data-scheme="midnight" data-shape="round" data-type="grotesk" and the rest -->\n<link rel="stylesheet" href="/ui/src/ui.css">\n<link rel="stylesheet" href="/ui/src/tokens.css">\n\n`;

function agentShellCode(c) {
  const Q = CONTENT.questions;
  return `${head()}<main class="ui-stage">
  <section class="ui-app is-home" data-ui-app>
    <button type="button" class="ui-back" data-ui-back hidden>‹ Back</button>
    <div class="ui-screen" data-ui-screen aria-live="polite">
      <div class="ui-home" data-ui-home>
        <h1>${esc(CONTENT.home.headline)}</h1>
        <p class="ui-lede">${esc(CONTENT.home.lede)}</p>
      </div>
      <div class="ui-answer" data-ui-answer hidden></div>
    </div>
    <div class="ui-prompts" data-ui-prompts>
${CONTENT.featured.map((id) => `      <a href="#${id}" data-ask="${id}">${esc(Q[id].prompt)}</a>`).join('\n')}
    </div>
    <form class="ui-composer" data-ui-composer>
      <button type="button" class="ui-topics" data-ui-topics>Topics</button>
      <input data-ui-input placeholder="${esc(CONTENT.home.placeholder)}">
      <button type="submit" class="ui-send" aria-label="Send">↑</button>
    </form>
  </section>${c.start === 'menu' ? `
  <nav class="ui-menu" data-ui-menu hidden><!-- the groups, as links with data-ask --></nav>` : ''}
</main>
<script type="module" src="/ui/layouts/boot.mjs" data-ui-boot data-content="/content.json"></script>`;
}
function agentContent(c) {
  if (c.start === 'menu') return { groups: CONTENT.groups };
  if (c.start === 'type') return { home: CONTENT.home, featured: CONTENT.featured, questions: { [c.q]: CONTENT.questions[c.q] } };
  return { questions: { [c.q]: CONTENT.questions[c.q] } };
}

// What the client needs per component, with code ready to show.
function prepare(c) {
  const out = { id: c.id, name: c.name, group: c.group, kind: c.kind, blurb: c.blurb, notes: c.notes || [] };
  out.fieldsHtml = c.fields ? `<table class="props"><thead><tr><th>Field</th><th>Type</th><th>What</th></tr></thead><tbody>${c.fields.map(([f, t, w]) => `<tr><td><code>${esc(f)}</code></td><td>${esc(t)}</td><td>${esc(w)}</td></tr>`).join('')}</tbody></table>` : '';
  if (c.kind === 'agent') {
    out.code = [tab('index.html', 'html', agentShellCode(c)), tab('content.json', 'json', prettyJson(agentContent(c)))];
  } else if (c.kind === 'block') {
    const html = c.blocks.map((b) => prettyHtml(renderBlock(b, ctx))).join('\n');
    const json = tab('content.json', 'json', prettyJson(c.blocks.length === 1 ? c.blocks[0] : c.blocks));
    out.code = [json, tab('HTML', 'html', html)];
    out.codePage = [tab('HTML', 'html', html), json];
  } else {
    out.code = [tab('HTML', 'html', c.html)];
  }
  return out;
}
const PREPARED = COMPONENTS.map(prepare);
const byId = Object.fromEntries(PREPARED.map((c) => [c.id, c]));

const ICONS = {
  replay: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4.5h4.5"/></svg>',
  copy: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8.5" y="8.5" width="11" height="11" rx="2.2"/><path d="M15.5 8.5V6.7a2.2 2.2 0 0 0-2.2-2.2H6.7a2.2 2.2 0 0 0-2.2 2.2v6.6a2.2 2.2 0 0 0 2.2 2.2h1.8"/></svg>',
  open: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4.5h5.5V10M19.5 4.5 11 13M17.5 14v4a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 18V8A1.5 1.5 0 0 1 6 6.5h4"/></svg>',
  search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
};

export function kitPage(id) {
  const c = byId[id];
  const nav = GROUPS.map((g) => `<div class="kit-g"><h3><i class="px ${GROUP_ICON[g]}"></i>${g}</h3>${PREPARED.filter((x) => x.group === g).map((x) => `<a href="/kit/${x.id}/" data-c="${x.id}" aria-current="${x.id === id}">${esc(x.name)}${COMPONENTS.find((k) => k.id === x.id).live ? '<span class="live" title="Plays live">live</span>' : ''}</a>`).join('')}</div>`).join('');
  const chips = PREPARED.map((x) => `<a href="/kit/${x.id}/" data-c="${x.id}" aria-current="${x.id === id}">${esc(x.name)}</a>`).join('');
  const first = c.code[0];
  const desc = `${c.blurb} A free UI kit component: see it live, copy the code.`;
  return layout({
    title: `${c.name} · free HTML UI kit component · warOnSaaS`,
    description: desc.length <= 150 ? desc : c.blurb.length <= 150 ? c.blurb : c.blurb.slice(0, 147).replace(/\s+\S*$/, '') + '...',
    og: 'kit',
    jsonld: [ORG, softwareLd('kit'), { '@type': 'WebPage', name: `${c.name}, a UI kit component`, url: `${SITE_URL}/kit/${c.id}/`, description: c.blurb, isPartOf: { '@type': 'WebSite', url: SITE_URL + '/' } }],
    path: `/kit/${c.id}/`,
    current: 'kit',
    page: 'is-kit',
    body: `
<div class="kit">
  <aside class="kit-side" aria-label="Components">
    <div class="kit-side-h">
      <p class="kit-k">UI kit</p>
      <p class="kit-lede">The pieces of a website people ask instead of scroll. Pick one.</p>
      <label class="kit-search">${ICONS.search}<input data-search type="search" placeholder="Search" aria-label="Search components"><kbd>/</kbd></label>
    </div>
    <nav class="kit-nav">${nav}</nav>
  </aside>
  <nav class="kit-chips" aria-label="Components">${chips}</nav>

  <section class="kit-main" aria-label="Preview">
    <div class="kit-bar">
      <label class="speed"><span>Scheme</span><select data-themes aria-label="Colour scheme"></select></label>
      <div class="seg" data-variants role="group" aria-label="Where it sits"${c.kind === 'block' ? '' : ' hidden'}></div>
      <span data-axes class="kit-axes"></span>
      <span class="kit-bar-r">
        <label class="speed" data-speed-wrap${c.kind === 'page' ? ' hidden' : ''}><span>Speed</span><select data-speed aria-label="Streaming speed"></select></label>
        <button class="icon-btn" type="button" data-replay title="Play again" aria-label="Play again"${c.kind === 'page' ? ' hidden' : ''}>${ICONS.replay}</button>
        <a class="icon-btn" data-open href="/kit/stage/?c=${id}" target="_blank" rel="noopener" title="Open on its own" aria-label="Open on its own">${ICONS.open}</a>
      </span>
    </div>
    <div class="kit-stage"><iframe id="stage" title="Live preview" src="/kit/stage/?c=${id}&amp;t=${OPTIONS.defaultTheme}"></iframe></div>
    <div class="kit-code">
      <div class="kit-code-h"><div class="tabs" data-tabs role="tablist">${c.code.map((t, i) => `<button type="button" role="tab" aria-selected="${i === 0}">${t.label}</button>`).join('')}</div>
        <button class="icon-btn copy" type="button" data-copy-code title="Copy" aria-label="Copy code">${ICONS.copy}${ICONS.check}</button></div>
      <pre><code data-code>${first.hl}</code></pre>
    </div>
  </section>

  <aside class="kit-info" aria-label="About this component">
    <p class="kit-k" data-group>${esc(c.group)}</p>
    <h1 data-name>${esc(c.name)}</h1>
    <p class="kit-blurb" data-blurb>${esc(c.blurb)}</p>
    <h2>Add it</h2>
    <div class="install"><pre data-install></pre><button class="icon-btn copy" type="button" data-copy-install title="Copy" aria-label="Copy">${ICONS.copy}${ICONS.check}</button></div>
    <p class="small" data-theme-note></p>
    <div data-fields-wrap${c.fieldsHtml ? '' : ' hidden'}><h2>What it takes</h2><div data-fields>${c.fieldsHtml}</div></div>
    <div data-notes-wrap${c.notes.length ? '' : ' hidden'}><h2>How it behaves</h2><ul class="checks" data-notes>${c.notes.map((n) => `<li>${esc(n)}</li>`).join('')}</ul></div>
  </aside>
</div>
<script type="application/json" id="kit-data" data-src="${ASSET('kit-data.json')}"></script>`,
    scripts: `<script src="${ASSET('kit.js')}" defer></script>`,
  }).replace('<body class="is-kit">', `<body class="is-kit" data-component="${id}">`);
}

export const KIT_IDS = PREPARED.map((c) => c.id);

// Every component's code and notes, loaded by the kit page as one file so each page stays light.
export function kitData() {
  return JSON.stringify({ site: SITE_URL, options: OPTIONS, components: PREPARED.map(({ id, name, group, kind, blurb, notes, fieldsHtml, code, codePage }) => ({ id, name, group, kind, blurb, notes, fieldsHtml, code, codePage })) });
}

// The preview page the iframe loads.
export function stagePage() {
  const registry = { options: OPTIONS, content: CONTENT, components: COMPONENTS.map(({ id, name, group, kind, start, q, blocks, html, bare }) => ({ id, name, group, kind, start, q, blocks, html, bare })) };
  const themes = Object.fromEntries(OPTIONS.themes.map((t) => [t.id, [t.scheme, t.href || '']]));
  return `<!doctype html>
<html lang="en" data-mode="dark">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>UI kit preview · warOnSaaS</title>
<meta name="robots" content="noindex">
<link rel="stylesheet" href="/ui/src/ui.css">
<link rel="stylesheet" href="/ui/src/tokens.css">
<link rel="stylesheet" id="theme">
<script>(function(){var t=new URLSearchParams(location.search).get('t'),h=${JSON.stringify(themes)},e=h[t]||h[${JSON.stringify(OPTIONS.defaultTheme)}],r=document.documentElement;r.dataset.scheme=e[0];if(e[1])document.getElementById('theme').href=e[1];var d=${JSON.stringify(Object.fromEntries(OPTIONS.axes.map((a) => [a.attr, a.default])))};for(var k in d)r.setAttribute(k,d[k])})()</script>
<style>
html,body{min-height:100%}
.st-page{width:min(680px,100% - 40px);margin:56px auto}
.st-page.is-bare{width:auto;margin:0}
.st-page>.ui-next{margin-top:28px}
/* the preview box is the window: the agent fills it exactly */
.ui-app{min-height:0;height:calc(100svh - 92px)}
</style>
</head>
<body>
<div id="root"></div>
<script type="application/json" id="registry">${JSON.stringify(registry).replace(/</g, '\\u003c')}</script>
<script type="module" src="${ASSET('kit/stage.js')}"></script>
</body>
</html>`;
}
