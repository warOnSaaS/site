import { layout, sample, esc } from './layout.mjs';

const TOKENS = [
  ['--bg', 'Background'], ['--cell', 'Panel'], ['--rule', 'Rule'], ['--dim', 'Dim text'], ['--body', 'Body text'], ['--fg', 'Foreground'],
];
const SIZES = [['--t-3xl', '40'], ['--t-2xl', '28'], ['--t-xl', '20'], ['--t-lg', '16'], ['--t-md', '14'], ['--t-sm', '12'], ['--t-xs', '11']];
const SPACE = [['--s1', 4], ['--s2', 8], ['--s3', 12], ['--s4', 16], ['--s5', 24], ['--s6', 32], ['--s7', 48], ['--s8', 64]];

const groups = [
  ['FOUNDATIONS', [
    ['Colour tokens', `<div class="grid">${TOKENS.map(([v, n]) => `<div class="swatch"><div style="background:var(${v})"></div><div style="padding:var(--s2)" class="small"><b>${n}</b><br><span class="dim">${v}</span></div></div>`).join('')}</div>`, 'Light and dark follow the system; set data-theme on html to force one.'],
    ['Type scale', `<div class="stack">${SIZES.map(([v, px]) => `<div class="row"><span class="small dim" style="width:72px">${v}</span><span style="font-size:var(${v});color:var(--fg);font-family:var(--font-head);font-weight:700">wOS ${px}</span></div>`).join('')}</div>`],
    ['Spacing', `<div class="stack">${SPACE.map(([v, px]) => `<div class="row"><span class="small dim" style="width:72px">${v}</span><span style="display:inline-block;height:12px;width:${px}px;background:var(--fg)"></span><span class="small dim">${px}px</span></div>`).join('')}</div>`],
    ['Rules', `<p class="small">1px rule</p><hr class="rule"><p class="small">2px section rule</p><hr class="rule-strong">`],
  ]],
  ['TYPE', [
    ['Headings', `<h1>Heading one</h1>\n<h2>Heading two</h2>\n<h3>Heading three</h3>\n<h4>Heading four</h4>`],
    ['Text', `<p class="label">LABEL</p>\n<p class="lead">Lead paragraph. Short, blunt sentences.</p>\n<p>Body text with <b>strong</b>, a <a href="#">link</a>, <code>inline code</code> and <kbd>Enter</kbd>.</p>\n<p class="small dim">Small, dim supporting text.</p>`],
    ['Code block', `<pre class="code"><code>claude mcp add --transport http agent-kanban https://example.com/mcp</code></pre>`],
  ]],
  ['ACTIONS', [
    ['Buttons', `<div class="row">\n  <button class="btn">PRIMARY</button>\n  <button class="btn btn-secondary">SECONDARY</button>\n  <button class="btn btn-ghost">GHOST</button>\n  <button class="btn" disabled>DISABLED</button>\n  <button class="btn btn-sm">SMALL</button>\n</div>`],
  ]],
  ['FORMS', [
    ['Inputs', `<div class="grid">\n  <label class="field"><span class="label">TEXT</span><input class="input" placeholder="Type here"></label>\n  <label class="field"><span class="label">SELECT</span><select class="select"><option>To do</option><option>Doing</option></select></label>\n  <label class="field" style="grid-column:1/-1"><span class="label">TEXTAREA</span><textarea class="textarea" placeholder="Notes"></textarea><span class="hint">Hint text sits under the field.</span></label>\n</div>`],
    ['Checks and radios', `<div class="row">\n  <label class="check"><input type="checkbox" checked> Checked</label>\n  <label class="check"><input type="checkbox"> Unchecked</label>\n  <label class="check"><input type="radio" name="r" checked> Radio A</label>\n  <label class="check"><input type="radio" name="r"> Radio B</label>\n</div>`],
  ]],
  ['STATUS', [
    ['Status words', `<div class="row">\n  <span class="status">TODO</span>\n  <span class="status">DOING</span>\n  <span class="status">WAITING</span>\n  <span class="status">REVIEW</span>\n  <span class="status">DONE</span>\n</div>`, 'State is words, never colour.'],
    ['Tags', `<div class="row">\n  <span class="tag">TAG</span>\n  <span class="tag tag-strong">STRONG</span>\n  <span class="tag tag-inverse">INVERSE</span>\n  <span class="count">12</span>\n</div>`],
    ['Avatars', `<div class="row">\n  <span class="avatar">SR</span>\n  <span class="avatar">JL</span>\n  <span class="avatar avatar-empty">?</span>\n</div>`],
    ['Meter', `<div class="meter" role="meter" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100"><span style="width:40%"></span></div>`],
  ]],
  ['CONTAINERS', [
    ['Card', `<article class="card">\n  <div class="card-head"><span class="label">CARD</span><span class="count">3</span></div>\n  <p class="small">Content inside a card.</p>\n</article>`],
    ['Panel', `<div class="panel"><p class="small" style="margin:0">A panel sits on the cell colour.</p></div>`],
    ['Notices', `<div class="stack">\n  <div class="notice">Notice. Something needs attention.</div>\n  <div class="notice notice-quiet">Quiet notice. For context.</div>\n</div>`],
    ['Empty state', `<div class="empty">NOTHING HERE YET</div>`],
    ['Dialog', `<dialog class="dialog" open style="position:static">\n  <h4>Send it back?</h4>\n  <p class="small">The task goes back to Jordan with your notes.</p>\n  <div class="dialog-actions"><button class="btn btn-secondary">CANCEL</button><button class="btn">SEND BACK</button></div>\n</dialog>`, 'Use with dialog.showModal().'],
  ]],
  ['DATA', [
    ['Table', `<div class="table-wrap"><table class="table">\n  <thead><tr><th>TASK</th><th>OWNER</th><th>STATUS</th></tr></thead>\n  <tbody>\n    <tr><td>Draft the PTO policy</td><td>Jordan</td><td><span class="status">DOING</span></td></tr>\n    <tr><td>Exit interview template</td><td>Jordan</td><td><span class="status">DONE</span></td></tr>\n  </tbody>\n</table></div>`],
    ['List', `<ul class="list small">\n  <li>First item</li>\n  <li>Second item</li>\n  <li>Third item</li>\n</ul>`],
    ['Key-value', `<dl class="kv">\n  <dt>CLIENT</dt><dd>Acme Dental</dd>\n  <dt>OWNER</dt><dd>Jordan Lee</dd>\n  <dt>DUE</dt><dd>2026-01-20</dd>\n</dl>`],
    ['Steps', `<ol class="steps">\n  <li><div><b>Get a GitHub account.</b><br><span class="small dim">Free.</span></div></li>\n  <li><div><b>Connect your agent.</b></div></li>\n  <li><div><b>Type start.</b></div></li>\n</ol>`],
  ]],
  ['NAVIGATION', [
    ['Header', `<header class="header" style="border:1px solid var(--rule)"><div class="wrap">\n  <span class="mark">wOS</span>\n  <nav class="nav"><a href="#" aria-current="page">ONE</a><a href="#">TWO</a><a href="#">THREE</a></nav>\n</div></header>`],
    ['Tabs', `<nav class="tabs">\n  <a href="#" aria-current="page">ALL</a>\n  <a href="#">ACME DENTAL</a>\n  <a href="#">BIRCH LAW</a>\n</nav>`],
    ['Breadcrumbs', `<div class="crumbs"><a href="#">Home</a> / <a href="#">Projects</a> / agent-kanban</div>`],
  ]],
  ['KANBAN', [
    ['Column and cards', `<div class="kanban" style="grid-auto-columns:minmax(240px,320px)">\n<section class="kanban-col">\n  <div class="kanban-col-head"><span class="label">REVIEW</span><span class="count">1</span></div>\n  <div class="kanban-cards">\n    <article class="kcard">\n      <div class="kcard-title">Review the onboarding site</div>\n      <div class="kcard-meta"><span class="kcard-flag">FROM JORDAN</span><span class="kcard-flag">HIGH</span></div>\n      <div class="kcard-next">NEXT: Click through it and approve or send back</div>\n      <div class="kcard-meta"><span class="avatar">SR</span><span>Sam</span><span class="tag">Acme Dental</span></div>\n    </article>\n  </div>\n</section>\n<section class="kanban-col">\n  <div class="kanban-col-head"><span class="label">TO DO</span><span class="count">1</span></div>\n  <div class="kanban-cards">\n    <article class="kcard">\n      <div class="kcard-title">Write front-desk phone scripts</div>\n      <div class="kcard-meta"><span class="avatar avatar-empty">?</span><span>UP FOR GRABS</span><span class="tag">Acme Dental</span></div>\n    </article>\n  </div>\n</section>\n</div>`],
  ]],
];

export function kitPage() {
  const toc = groups.map(([g]) => `<a href="#${g.toLowerCase()}">${g}</a>`).join('');
  const body = groups.map(([g, items]) => `<section class="section" id="${g.toLowerCase()}"><h2>${esc(g)}</h2>${items.map(([n, html, note]) => sample(n, html, { note })).join('')}</section>`).join('');
  return layout({
    title: 'UI kit · warOnSaaS',
    description: 'Every component of the warOnSaaS interface. One stylesheet, plain HTML.',
    current: 'kit',
    body: `
<section style="padding:var(--s7) 0 var(--s5)">
  <p class="label">UI KIT</p>
  <h1>Every component, one page.</h1>
  <p class="lead">One stylesheet. Plain HTML classes. No build step.</p>
  <pre class="code"><code>&lt;link rel="stylesheet" href="https://waronsaas.com/wos.css"&gt;</code></pre>
</section>
<nav class="tabs" aria-label="Sections">${toc}</nav>
${body}`,
  });
}
