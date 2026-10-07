import path from 'node:path';
import fs from 'node:fs';
import { layout, esc, GITHUB } from './layout.mjs';

// The example board is rendered at build time from agent-kanban's own example workspace and renderer,
// so the picture is always the real product. AGENT_KANBAN_DIR points at a checkout; otherwise a sibling
// checkout, otherwise the copy npm installs from github:warOnSaaS/agent-kanban.
const AK = path.resolve(process.env.AGENT_KANBAN_DIR ?? (fs.existsSync('../agent-kanban/lib/kanban.mjs') ? '../agent-kanban' : 'node_modules/agent-kanban'));
const REPO = `${GITHUB}/agent-kanban`;

async function exampleBoard() {
  const { Workspace } = await import(path.join(AK, 'lib/workspace.mjs'));
  const { FsStore } = await import(path.join(AK, 'lib/store.mjs'));
  const { renderKanban } = await import(path.join(AK, 'lib/kanban.mjs'));
  const ws = new Workspace(new FsStore(path.join(AK, 'example-workspace')), { name: 'Example Co' });
  const owner = (await ws.team()).find((p) => p.role === 'owner');
  const s = ws.as(owner);
  const [tasks, clients, people] = await Promise.all([s.tasks(), s.clients(), s.teamList()]);
  return renderKanban({ tasks, clients, people, today: '2026-01-15', me: owner.id });
}

// The board on its own page, styled by the wOS kit (kit/wos.css, which agent-kanban itself uses),
// with its tokens set to match this site. The home page and /agent-kanban/ show it in a frame.
// ?demo=1 moves one card along the lanes so the board reads as live.
export async function boardPage() {
  const board = await exampleBoard();
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Example board · agent-kanban</title>
<meta name="robots" content="noindex">
<script>(function(){var m='dark';try{var r=parent.document.documentElement;m=r.dataset.theme||(parent.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light')}catch(e){m=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.dataset.theme=m})()</script>
<link rel="stylesheet" href="/wos.css">
<style>
@font-face{font-family:Geist;src:url(/ui/fonts/geist.woff2) format("woff2");font-weight:300 700;font-display:swap}
:root{--font-body:Geist,ui-sans-serif,system-ui,sans-serif;--font-head:Geist,ui-sans-serif,system-ui,sans-serif;--radius:10px;--pill:999px;--track:0;--shadow-sm:0 1px 2px rgba(0,0,0,.05);--shadow-md:0 6px 18px rgba(0,0,0,.12)}
:root[data-theme=dark]{--page:#111113;--bg:#1b1b1f;--lane:#16161a;--cell:#16161a;--chip:#26262b;--fg:#fafafa;--body:#d4d4d8;--dim:#a1a1aa;--rule:rgba(255,255,255,.08);--accent:#ffd84d;--accent-ink:#1a1300;--accent-soft:rgba(255,216,77,.12)}
:root[data-theme=light]{--page:#ffffff;--bg:#ffffff;--lane:#f4f4f1;--cell:#f4f4f1;--chip:#ebebe7;--fg:#0b0b0c;--body:#2a2a2e;--dim:#6b6b73;--rule:rgba(0,0,0,.08);--accent:#c58a00;--accent-ink:#fff;--accent-soft:rgba(197,138,0,.1)}
html,body{background:var(--page)}
html{overflow-y:hidden}
body{padding:16px;font-size:13px}
.kanban{grid-auto-columns:minmax(208px,1fr);gap:10px;overflow:visible}
.kanban-col{border-radius:12px;min-height:120px}
.kcard{transition:border-color .2s,box-shadow .2s}
.kcard.is-moving{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-soft),var(--shadow-md);z-index:2;position:relative}
.kanban-col.is-target{outline-color:var(--accent-soft)}
</style>
</head>
<body>
${board}
<script>
(function(){
  try{var host=parent.document.documentElement;new MutationObserver(function(){if(host.dataset.theme)document.documentElement.dataset.theme=host.dataset.theme}).observe(host,{attributes:true,attributeFilter:['data-theme']})}catch(e){}
  if(!/demo=1/.test(location.search)||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  var cols=[].slice.call(document.querySelectorAll('.kanban-col'));
  var path=[0,1,3,4];/* To do, Doing, Review, Done */
  var lane=function(i){return cols[i].querySelector('.kanban-cards')};
  var count=function(i){cols[i].querySelector('.count').textContent=lane(i).querySelectorAll('.kcard').length};
  var card=lane(0).querySelector('.kcard'),step=0;
  if(!card)return;
  function move(to){
    var from=cols.indexOf(card.closest('.kanban-col'));
    var a=card.getBoundingClientRect();
    var empty=lane(to).querySelector('.kanban-empty');if(empty)empty.remove();
    lane(to).insertBefore(card,lane(to).firstChild);
    if(!lane(from).querySelector('.kcard'))lane(from).insertAdjacentHTML('beforeend','<div class="kanban-empty">Nothing yet</div>');
    count(from);count(to);
    var b=card.getBoundingClientRect();
    card.style.transition='none';card.style.transform='translate('+(a.left-b.left)+'px,'+(a.top-b.top)+'px)';
    card.classList.add('is-moving');cols[to].classList.add('is-target');
    requestAnimationFrame(function(){requestAnimationFrame(function(){card.style.transition='transform .7s cubic-bezier(.2,.8,.2,1),border-color .2s,box-shadow .2s';card.style.transform='';});});
    setTimeout(function(){card.classList.remove('is-moving');cols[to].classList.remove('is-target')},1300);
  }
  setInterval(function(){step=(step+1)%path.length;move(path[step]);},2600);
})();
</script>
</body>
</html>`;
}

// The "use it" moment: the same app tiles every board's front page shows, pointed at the public demo board
// (agent-kanban with DEMO_BOARD=1: a made-up team, no sign-in). Logos and links come from agent-kanban itself.
const DEMO = 'https://agent-kanban-demo.vercel.app';
const OWN = `${REPO}#get-your-own-board`;
const { CLAUDE, OPENAI, BOARD } = await import(path.join(AK, 'lib/logos.mjs'));
const { claudeInstallLink, connectLine, CHATGPT_APPS } = await import(path.join(AK, 'lib/connect.mjs'));

const copyCmd = (line) => `<div class="ak-cmd"><code>${esc(line)}</code><button type="button" class="btn ak-copy" data-copy="${esc(line)}" aria-label="Copy the command">Copy</button></div>`;
const TILES = [
  ['Claude', 'Web, desktop and phone', CLAUDE, false, `<a class="btn" href="${esc(claudeInstallLink('agent-kanban demo', `${DEMO}/mcp`))}" target="_blank" rel="noopener" data-copy-also="${DEMO}/mcp" data-note="Opening Claude. The address is copied too.">Add to Claude</a>`, 'Click Add, then Connect.'],
  ['ChatGPT', 'Web, with developer mode on', OPENAI, false, `<a class="btn" href="${CHATGPT_APPS}" target="_blank" rel="noopener" data-copy-also="${DEMO}/mcp" data-note="Opening ChatGPT. The address is copied.">Open in ChatGPT</a>`, 'Paste the copied address in Settings, Apps, Create.'],
  ['Browser', 'Any device', BOARD, false, `<a class="btn btn-ghost" href="${DEMO}/board" target="_blank" rel="noopener">Open the demo board</a>`, 'Click around. Changes reset.'],
  ['Claude Code', 'Terminal', CLAUDE, true, copyCmd(connectLine(DEMO, 'claude')), 'Paste it in your terminal.'],
  ['Codex', 'Terminal', OPENAI, true, copyCmd(connectLine(DEMO, 'codex')), 'Paste it in your terminal.'],
];

const COPY_JS = `<script>(function(){
function copy(s){if(navigator.clipboard&&window.isSecureContext)return navigator.clipboard.writeText(s);var a=document.createElement('textarea');a.value=s;document.body.appendChild(a);a.select();try{document.execCommand('copy')}finally{a.remove()}return Promise.resolve()}
var t=document.createElement('div');t.className='ak-toast';t.setAttribute('role','status');document.body.appendChild(t);var h;
function toast(m){t.textContent=m;t.classList.add('on');clearTimeout(h);h=setTimeout(function(){t.classList.remove('on')},2400)}
document.addEventListener('click',function(e){
  var b=e.target.closest('[data-copy]');
  if(b){copy(b.dataset.copy).then(function(){b.textContent='Copied';toast('Copied. Paste it in your terminal.');setTimeout(function(){b.textContent='Copy'},2000)});return}
  var a=e.target.closest('[data-copy-also]');
  if(a)copy(a.dataset.copyAlso).then(function(){toast(a.dataset.note)},function(){});
});
})();</script>`;

const FEATURES = [
  ['g1', 'By client', 'Every task belongs to a client. Ideas can too. Filter anything by client.'],
  ['g2', 'Gated per person', 'Each person sees their clients only. Some see only their own tasks. Anything can be private to named people.'],
  ['g3', 'Hand-offs', 'What you did and what is next go into the task. The next person\'s agent picks it up.'],
  ['g4', 'Real reviews', 'The agent opens the actual work: linked pages and files. Verdict, issues, decision.'],
  ['g1', 'Sign in with GitHub', 'No keys to share. Who you are comes from GitHub; what you can see comes from people.yml.'],
  ['g2', 'Plain files', 'Markdown in your repo, with history. Leave any time and keep everything.'],
];

export function agentKanbanPage() {
  return layout({
    title: 'agent-kanban · warOnSaaS',
    description: 'A shared to-do board for people and their AI agents. Tasks, hand-offs and reviews in a GitHub repo, worked from Claude, ChatGPT, Claude Code or Codex.',
    current: 'agent-kanban',
    page: 'is-ak',
    scripts: COPY_JS,
    body: `
<main class="page">
<section class="page-hero">
  <p class="kicker"><i class="px g2"></i>Unit 01<span class="sep"></span>AGPL-3.0<span class="ready">Ready</span></p>
  <h1>A shared to-do board for people and their AI agents.</h1>
  <p class="lede">Tasks, hand-offs, reviews, notes and ideas live as files in your private GitHub repo. Everyone works them from the AI app they already use.</p>
  <div class="cta"><a class="btn" href="#try">Try it</a><a class="btn btn-ghost" href="${OWN}">Get your own board</a><a class="btn btn-ghost" href="${REPO}">GitHub</a></div>
</section>

<section class="board-wrap" aria-label="Example board">
  <div class="window">
    <div class="window-bar"><span class="dots"><i></i><i></i><i></i></span><span class="window-t">Example Co · two clients, four people · fictional</span><span class="live-tag"><i class="pulse"></i>Live</span></div>
    <iframe src="/agent-kanban/board/?demo=1" title="Example board" data-autoheight></iframe>
  </div>
</section>

<section class="sec">
  <h2>What it does</h2>
  <div class="feat">${FEATURES.map(([g, t, d]) => `<div class="feat-i"><i class="px ${g}"></i><h3>${t}</h3><p>${d}</p></div>`).join('')}</div>
</section>

<section class="sec" id="try">
  <h2>Try it from your AI app</h2>
  <p class="ak-sub">Pick your app to connect to a demo board: a made-up team, no sign-in. Then type <b>start</b>.</p>
  <div class="ak-apps">${TILES.map(([t, where, logo, term, action, hint]) => `<section class="ak-app"><div class="ak-app-top"><span class="ak-logo">${logo}${term ? '<i aria-hidden="true">&gt;_</i>' : ''}</span><div><h3>${t}</h3><p>${where}</p></div></div><div class="ak-act">${action}</div><p class="ak-hint">${hint}</p></section>`).join('')}</div>
</section>

<section class="sec ak-own">
  <div><h2>Get your own board</h2><p>Your team, your private GitHub repo, the same one-click connect page.</p></div>
  <a class="btn" href="${OWN}">Get your own board</a>
</section>
</main>`,
  });
}
