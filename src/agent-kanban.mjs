import path from 'node:path';
import fs from 'node:fs';
import { layout, esc, GITHUB, ORG, SITE_URL } from './layout.mjs';
import { softwareLd } from './projects.mjs';

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

// Two ways to run it, side by side and equal. The hosted button goes to the hosted agent-kanban (a preview in
// demo mode until warOnSaaS's GitHub App is set up); self-hosting goes to the README's steps.
const CREATE = 'https://kanban.waronsaas.com/create';
const SELF = `${REPO}#host-it-yourself`;

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
    title: 'agent-kanban · a GitHub board for people and AI agents',
    description: 'A free shared to-do board for people and their AI agents. Tasks, hand-offs and reviews live in your GitHub repo, worked from Claude or ChatGPT.',
    og: 'agent-kanban',
    jsonld: [ORG, softwareLd('agent-kanban', { codeRepository: REPO, featureList: FEATURES.map(([, t]) => t) }),
      { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'warOnSaaS', item: SITE_URL + '/' }, { '@type': 'ListItem', position: 2, name: 'agent-kanban', item: SITE_URL + '/agent-kanban/' }] }],
    path: '/agent-kanban/',
    current: 'agent-kanban',
    page: 'is-ak',
    body: `
<main class="page">
<section class="page-hero">
  <p class="kicker"><i class="px g2"></i>Unit 01<span class="sep"></span>AGPL-3.0<span class="ready">Ready</span></p>
  <h1>A shared to-do board for people and their AI agents.</h1>
  <p class="lede">Tasks, hand-offs, reviews, notes and ideas live as files in your private GitHub repo. Everyone works them from the AI app they already use.</p>
  <div class="cta"><a class="btn" href="${CREATE}">Create your board</a><a class="btn btn-ghost" href="${SELF}">Host it yourself, free</a><a class="btn btn-ghost" href="${REPO}">GitHub</a></div>
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

<section class="sec">
  <h2>How a day on the board goes</h2>
  <p class="prose">You open your AI app and type <b>start</b>. Your agent reads the board in your team's GitHub repo and tells you what is yours today: the client tasks due, the reviews waiting on you, and the hand-offs a teammate's agent left overnight. You work a task with your agent; when you stop, it writes what was done and what is next into the task, and moves the card. The next person, or their agent, picks it up from exactly there. Reviews open the real work, the linked pages and files, and end in a verdict and a decision on the card.</p>
  <p class="prose">Nothing lives in a database you rent. Every task, note and idea is a plain Markdown file in a private repo you own, with its full history. Who you are comes from your GitHub sign-in, and what you can see comes from one file, <code>people.yml</code>. The same board works for a team of two or twenty, and for any mix of people and agents. See also <a href="/crm/">the CRM</a>, which keeps your clients' contacts and deals the same way.</p>
</section>

<section class="sec" id="start">
  <h2>Two ways to run it</h2>
  <div class="ak-ways">
    <div class="ak-way">
      <h3>Create your board</h3>
      <p>Sign in with GitHub, name your team, done. You land on your board with a few example cards, pick your AI app, and type <b>start</b>.</p>
      <a class="btn" href="${CREATE}">Create your board</a>
    </div>
    <div class="ak-way">
      <h3>Host it yourself, free</h3>
      <p>Your server, your GitHub repo, no account with us. The steps take about 20 minutes.</p>
      <a class="btn btn-ghost" href="${SELF}">Self-host steps</a>
    </div>
  </div>
  <p class="ak-calm">Either way, your data is always in your own GitHub repo, and a board we host can move to your own hosting any time.</p>
</section>
</main>`,
  });
}
