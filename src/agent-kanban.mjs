import path from 'node:path';
import { layout, esc } from './layout.mjs';

// The example board is rendered at build time from agent-kanban's own example workspace and renderer,
// so the picture is always the real product. AGENT_KANBAN_DIR points at a checkout; otherwise a sibling
// checkout, otherwise the copy npm installs from github:warOnSaaS/agent-kanban.
import fs from 'node:fs';
const AK = path.resolve(process.env.AGENT_KANBAN_DIR ?? (fs.existsSync('../agent-kanban/lib/kanban.mjs') ? '../agent-kanban' : 'node_modules/agent-kanban'));
const REPO = 'https://github.com/warOnSaaS/agent-kanban';

async function exampleBoard() {
  const { Workspace } = await import(path.join(AK, 'lib/workspace.mjs'));
  const { FsStore } = await import(path.join(AK, 'lib/store.mjs'));
  const { renderKanban } = await import(path.join(AK, 'lib/kanban.mjs'));
  const ws = new Workspace(new FsStore(path.join(AK, 'example-workspace')), { name: 'Example Co' });
  const owner = (await ws.team()).find((p) => p.role === 'owner');
  const s = ws.as(owner);
  const [tasks, clients, people] = await Promise.all([s.tasks(), s.clients(), s.teamList()]);
  return renderKanban({ tasks, clients, people, today: '2026-01-15' });
}

const APPS = [
  ['CLAUDE CODE', 'claude mcp add --transport http --scope user agent-kanban https://&lt;instance&gt;/mcp', 'Then /mcp, pick agent-kanban, Authenticate.'],
  ['CODEX', 'codex mcp add agent-kanban --url https://&lt;instance&gt;/mcp', 'Then codex mcp login agent-kanban.'],
  ['CLAUDE APP', 'Settings, Connectors, Add custom connector: https://&lt;instance&gt;/mcp', 'Web, desktop and phone. Add it once in a browser.'],
  ['CHATGPT', 'A GPT with Actions from /openapi.json', 'Any paid plan, web and phone. Setup in docs/chatgpt-gpt.md.'],
  ['BROWSER', 'https://&lt;instance&gt;/board', 'Read-only board, sign in with GitHub.'],
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
  ['GITHUB_OAUTH_CLIENT_ID, GITHUB_OAUTH_CLIENT_SECRET', 'Your GitHub OAuth app. Callback: https://&lt;instance&gt;/oauth/github/callback'],
  ['OAUTH_SECRET', 'Long random string'],
  ['WORKSPACE_NAME, WORKSPACE_TZ, WORKSPACE_CONTACT', 'Name, time zone, who people message when stuck'],
];

export async function agentKanbanPage() {
  const board = await exampleBoard();
  return layout({
    title: 'agent-kanban · warOnSaaS',
    description: 'A shared kanban for people and their AI agents. Tasks, hand-offs and reviews in a GitHub repo, worked from Claude, ChatGPT, Claude Code or Codex.',
    current: 'agent-kanban',
    body: `
<section style="padding:var(--s7) 0 var(--s5)">
  <p class="label">AGENT-KANBAN · AGPL-3.0</p>
  <h1>A shared kanban for people and their agents.</h1>
  <p class="lead">Tasks, hand-offs, reviews, notes and ideas live as files in your private GitHub repo. Everyone works them from the agent they already use.</p>
  <div class="row"><a class="btn" href="${REPO}">GITHUB</a><a class="btn btn-secondary" href="#join">HOW TO JOIN</a><a class="btn btn-secondary" href="#run">RUN YOUR OWN</a></div>
</section>

<section class="section">
  <div class="row" style="justify-content:space-between;margin-bottom:var(--s4)"><h2 style="margin:0">EXAMPLE</h2><span class="small dim">Example Co: two clients, four people. Fictional.</span></div>
  ${board}
</section>

<section class="section">
  <h2>WHAT IT DOES</h2>
  <div class="grid">
    <div class="card"><div class="label">BY CLIENT</div><p class="small">Every task belongs to a client. Ideas can. Filter anything by client.</p></div>
    <div class="card"><div class="label">GATED PER PERSON</div><p class="small">Each person sees their clients only. Some see only their own tasks. Anything can be private to named people.</p></div>
    <div class="card"><div class="label">HAND-OFFS</div><p class="small">What you did and what is next go into the task. The next person's agent picks it up.</p></div>
    <div class="card"><div class="label">REAL REVIEWS</div><p class="small">The agent opens the actual work: linked pages and files. Verdict, issues, decision.</p></div>
    <div class="card"><div class="label">SIGN IN WITH GITHUB</div><p class="small">No keys. Who you are comes from GitHub; what you can see comes from people.yml.</p></div>
    <div class="card"><div class="label">PLAIN FILES</div><p class="small">Markdown in your repo, with history. Leave any time and keep everything.</p></div>
  </div>
</section>

<section class="section" id="join">
  <h2>HOW TO JOIN</h2>
  <ol class="steps">
    <li><div><b>Get the instructions file.</b><br><span class="small dim">https://&lt;instance&gt;/INSTRUCTIONS.md. It holds no secrets.</span></div></li>
    <li><div><b>Hand it to your agent.</b><br><span class="small dim">It works out what it is and walks you through: GitHub account, connect, sign in.</span></div></li>
    <li><div><b>Type start.</b></div></li>
  </ol>
  <h3 style="margin-top:var(--s6)">COMMANDS</h3>
  <div class="table-wrap"><table class="table"><thead><tr><th>TYPE</th><th>WHAT HAPPENS</th></tr></thead><tbody>
    ${COMMANDS.map(([c, d]) => `<tr><td><code>${esc(c)}</code></td><td>${esc(d)}</td></tr>`).join('')}
  </tbody></table></div>
  <h3 style="margin-top:var(--s6)">WHERE IT WORKS</h3>
  <div class="table-wrap"><table class="table"><thead><tr><th>APP</th><th>CONNECT</th><th></th></tr></thead><tbody>
    ${APPS.map(([a, c, n]) => `<tr><td><b>${a}</b></td><td><code>${c}</code></td><td class="dim">${n}</td></tr>`).join('')}
  </tbody></table></div>
</section>

<section class="section" id="run">
  <h2>RUN YOUR OWN</h2>
  <ol class="steps">
    <li><div><b>Make a private workspace repo.</b><br><span class="small dim">Copy example-workspace/ into it. List your people in people.yml by GitHub username.</span></div></li>
    <li><div><b>Make a GitHub OAuth app.</b><br><span class="small dim">github.com/settings/developers. Callback: https://&lt;instance&gt;/oauth/github/callback</span></div></li>
    <li><div><b>Deploy.</b><br><span class="small dim">Vercel, or any host that runs Node. Set the environment below.</span></div></li>
    <li><div><b>Send people INSTRUCTIONS.md.</b></div></li>
  </ol>
  <div class="table-wrap" style="margin-top:var(--s5)"><table class="table"><thead><tr><th>VARIABLE</th><th>WHAT</th></tr></thead><tbody>
    ${ENV.map(([v, d]) => `<tr><td><code>${v}</code></td><td>${d}</td></tr>`).join('')}
  </tbody></table></div>
  <pre class="code" style="margin-top:var(--s5)"><code>git clone ${REPO}
cd agent-kanban && npm install
npm test        # end-to-end tests on the example workspace
npm run dev     # local server on the example workspace</code></pre>
</section>`,
  });
}
