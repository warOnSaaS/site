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

const APPS = [
  ['Claude Code', 'claude mcp add --transport http --scope user agent-kanban https://<instance>/mcp', 'Then /mcp, pick agent-kanban, Authenticate.'],
  ['Codex', 'codex mcp add agent-kanban --url https://<instance>/mcp', 'Then codex mcp login agent-kanban.'],
  ['Claude app', 'Settings, Connectors, Add custom connector: https://<instance>/mcp', 'Web, desktop and phone. Add it once in a browser.'],
  ['ChatGPT', 'A GPT with Actions from /openapi.json', 'Any paid plan, web and phone. Setup in docs/chatgpt-gpt.md.'],
  ['Browser', 'https://<instance>/board', 'Read-only board, sign in with GitHub.'],
];

const COMMANDS = [
  ['start', 'Welcome, what is waiting for you, the commands.'],
  ['check tasks', "What's assigned to you, new things first."],
  ['review', 'Opens the actual work, says READY or NOT READY, up to 3 issues, then approve, send back or meet.'],
  ['new task', 'Creates one. Your agent asks only what it cannot work out.'],
  ['assign task', 'Gives a task to someone, or back to up for grabs.'],
  ['hand off task', 'Passes work on with what you did and what is next. Their agent picks it up.'],
  ['status', 'Every task and where it stands.'],
  ['view kanban', 'Draws this board inside the chat.'],
];

const ENV = [
  ['WORKSPACE_REPO', 'owner/repo of the private workspace repo'],
  ['GITHUB_TOKEN', 'Can read and write that repo'],
  ['GITHUB_OAUTH_CLIENT_ID, GITHUB_OAUTH_CLIENT_SECRET', 'Your GitHub OAuth app. Callback: https://<instance>/oauth/github/callback'],
  ['OAUTH_SECRET', 'Long random string'],
  ['WORKSPACE_NAME, WORKSPACE_TZ, WORKSPACE_CONTACT', 'Name, time zone, who people message when stuck'],
];

const FEATURES = [
  ['g1', 'By client', 'Every task belongs to a client. Ideas can too. Filter anything by client.'],
  ['g2', 'Gated per person', 'Each person sees their clients only. Some see only their own tasks. Anything can be private to named people.'],
  ['g3', 'Hand-offs', 'What you did and what is next go into the task. The next person\'s agent picks it up.'],
  ['g4', 'Real reviews', 'The agent opens the actual work: linked pages and files. Verdict, issues, decision.'],
  ['g1', 'Sign in with GitHub', 'No keys to share. Who you are comes from GitHub; what you can see comes from people.yml.'],
  ['g2', 'Plain files', 'Markdown in your repo, with history. Leave any time and keep everything.'],
];

const steps = (items) => `<ol class="steps">${items.map(([t, d]) => `<li><b>${t}</b>${d ? `<span>${d}</span>` : ''}</li>`).join('')}</ol>`;

export function agentKanbanPage() {
  return layout({
    title: 'agent-kanban · warOnSaaS',
    description: 'A shared to-do board for people and their AI agents. Tasks, hand-offs and reviews in a GitHub repo, worked from Claude, ChatGPT, Claude Code or Codex.',
    current: 'agent-kanban',
    page: 'is-ak',
    body: `
<main class="page">
<section class="page-hero">
  <p class="kicker"><i class="px g2"></i>Unit 01<span class="sep"></span>AGPL-3.0<span class="ready">Ready</span></p>
  <h1>A shared to-do board for people and their AI agents.</h1>
  <p class="lede">Tasks, hand-offs, reviews, notes and ideas live as files in your private GitHub repo. Everyone works them from the AI app they already use.</p>
  <div class="cta"><a class="btn" href="${REPO}">Get it on GitHub</a><a class="btn btn-ghost" href="#join">How to join</a><a class="btn btn-ghost" href="#run">Run your own</a></div>
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

<section class="sec split" id="join">
  <div>
    <h2>How to join</h2>
    ${steps([['Get the instructions file.', 'https://&lt;instance&gt;/INSTRUCTIONS.md. It holds no secrets.'], ['Hand it to your agent.', 'It works out what it is and walks you through: GitHub account, connect, sign in.'], ['Type start.', '']])}
  </div>
  <div>
    <h2>Then just type</h2>
    <div class="tbl"><table><tbody>${COMMANDS.map(([c, d]) => `<tr><td class="nowrap"><code>${esc(c)}</code></td><td>${esc(d)}</td></tr>`).join('')}</tbody></table></div>
  </div>
</section>

<section class="sec">
  <h2>Where it works</h2>
  <div class="tbl"><table><thead><tr><th>App</th><th>Connect</th><th>Note</th></tr></thead><tbody>
    ${APPS.map(([a, c, n]) => `<tr><td class="nowrap"><b>${a}</b></td><td><code>${esc(c)}</code></td><td class="dim">${esc(n)}</td></tr>`).join('')}
  </tbody></table></div>
</section>

<section class="sec split" id="run">
  <div>
    <h2>Run your own</h2>
    ${steps([['Make a private workspace repo.', 'Copy example-workspace/ into it. List your people in people.yml by GitHub username.'], ['Make a GitHub OAuth app.', 'github.com/settings/developers. Callback: https://&lt;instance&gt;/oauth/github/callback'], ['Deploy.', 'Vercel, or any host that runs Node. Set the settings on the right.'], ['Send people INSTRUCTIONS.md.', '']])}
  </div>
  <div>
    <h2>Settings</h2>
    <div class="tbl"><table><tbody>${ENV.map(([v, d]) => `<tr><td><code>${esc(v)}</code></td><td>${esc(d)}</td></tr>`).join('')}</tbody></table></div>
    <pre class="code-block"><code>git clone ${REPO}
cd agent-kanban && npm install
npm test        # end-to-end tests on the example workspace
npm run dev     # local server on the example workspace</code></pre>
  </div>
</section>
</main>`,
  });
}
