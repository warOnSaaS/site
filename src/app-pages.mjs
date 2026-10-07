// The pages for wOS and its apps: Chat, Email and Meetings. The same shape as the CRM page:
// what it does, a real screenshot of the live site, how agents drive it, what self-hosting needs,
// and the limits, said plainly. Every fact here comes from the app's own README.
import { layout, esc, SITE_URL, ORG, themedShot, actions } from './layout.mjs';
import { PROJECTS, softwareLd } from './projects.mjs';

const feat = (items) => `<div class="feat">${items.map(([g, t, d]) => `<div class="feat-i"><i class="px ${g}"></i><h3>${t}</h3><p>${d}</p></div>`).join('')}</div>`;
const crumbs = (name, path) => ({ '@type': 'BreadcrumbList', itemListElement: [
  { '@type': 'ListItem', position: 1, name: 'warOnSaaS', item: SITE_URL + '/' },
  { '@type': 'ListItem', position: 2, name, item: SITE_URL + path },
] });
const table = (head, rows) => `<div class="tbl"><table><thead><tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c, i) => `<td>${i === 0 ? `<b>${c}</b>` : c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
const mcpRows = (slug) => [
  ['Claude (web, desktop, phone)', `Settings, Connectors, Add custom connector: <code>https://your-${slug}/mcp</code>`],
  ['ChatGPT', `Add <code>https://your-${slug}/mcp</code> as a connector`],
  ['Claude Code', `<code>claude mcp add --transport http ${slug} https://your-${slug}/mcp</code>`],
  ['Codex', `<code>codex mcp add ${slug} --url https://your-${slug}/mcp</code>`],
  ['Any program', `<code>POST /api/tools/&lt;name&gt;</code> with a JSON body, the same call the screens make`],
];

// Self-host links: the README's own section when the repo is public, the steps on this page when not.
export const selfHref = (id, repos) => (repos[id] ? `${PROJECTS[id].repo}${README_HOST[id]}` : `${PROJECTS[id].path}#host-it-yourself`);
const README_HOST = { chat: '#self-hosting-in-five-minutes', email: '#host-it-yourself-free', meet: '#use-it', suite: '#host-it-yourself', 'agent-kanban': '#host-it-yourself', scanner: '#run-your-own', crm: '#run-your-own' };

export const APPS = {
  suite: {
    title: 'wOS · one open-source app for your team and its AI agents',
    description: 'wOS is one free, open-source app for a team and its AI agents: Agents, board, CRM, Chat, Email and Meetings, any model, self-hosted or hosted.',
    color: 'g1', tag: 'Live demo', open: 'Try the demo',
    h1: 'One app for your team and its AI&nbsp;agents.',
    lede: 'wOS opens on a conversation, like the Claude and ChatGPT apps. Around it sit the apps you and your agents both work in: Agents, the board, the CRM, Chat, Email and Meetings. Turn any app on or off, and pick any model.',
    shot: ['suite', 'The wOS Agents view: two agents working side by side in panels, each with its plan, progress and the tools it called, and the saved agents below', 'app.waronsaas.com · the Agents view · example data, fictional'],
    whatH: 'What wOS does',
    features: [
      ['g1', 'A conversation first', 'Ask in plain words and the model works across every app that is on, with a history of past conversations and a model picker.'],
      ['g2', 'The Agents view', 'Saved agents run on the server. See 1, 2, 4 or 6 at once in panels, each with its plan as a checklist, progress as done steps out of all steps, and a colour for its status.'],
      ['g3', 'Alerts in one inbox', 'When an agent needs your yes, it waits in one inbox, and can reach you in the browser, as a phone notification or by email.'],
      ['g4', 'Apps on and off', 'Agents, Board, CRM, Chat, Email and Meetings. An app that is off is not loaded at all: no tables, no tools, nothing downloaded.'],
      ['g1', 'Any model', 'Your Anthropic or OpenAI key, a local model through Ollama, or any OpenAI-compatible server. The demo uses a scripted model, so it needs no key.'],
      ['g2', 'Leave any time', 'Export everything with one button. Settings, Hosting also checks your server and says in plain words what is missing.'],
    ],
    agents: 'Every button calls a tool, and the same tools are served to Claude, ChatGPT, Claude Code and Codex over MCP, for every app that is on. A scripted agent that uses only MCP must be able to turn apps off and on, invite someone, start an agent and export everything, or the build fails.',
    slug: 'wos',
    hostLede: 'One command runs wOS, Postgres and HTTPS on any server. One person can run it on their own computer with nothing but Node and a SQLite file. No licence check, ever.',
    commands: `git clone https://github.com/warOnSaaS/suite && cd suite
cp .env.example .env     # set WOS_DOMAIN and WOS_SECRET_KEY
docker compose up -d     # wOS, Postgres and Caddy for HTTPS

# or, one person on one computer:
npm install && npm run build
WOS_SOLO=1 npm start     # http://localhost:8080, SQLite in ./.data`,
    needs: [
      ['A machine that stays on', 'Docker or Node 22, for chat sockets, agents and email checks', 'A $5 to $10 server, a home server, your laptop'],
      ['A domain with HTTPS', 'Sign-in, phone notifications, installing the app', 'Caddy in the compose file gets the certificate'],
      ['A database', 'Storage', 'The bundled Postgres, Neon, Supabase, RDS, or SQLite'],
      ['Email sending (SMTP)', 'Sign-in links, invites, alert emails', 'Any mailbox you already have'],
      ['A model', 'Conversations and agents', 'Your API key, or Ollama on your own hardware'],
    ],
    hostNote: 'The first person to sign in owns the server; everyone else joins by invite or through a linked GitHub organization. Database changes apply themselves when the server starts.',
    limits: [
      'Early: this is version 0.1.',
      'Hosting with us is coming soon. Today, the demo or your own server.',
      'On serverless hosting like Vercel it runs in a reduced mode: screens refresh by polling, and agents move forward only while a screen is open. The demo runs this way, and its changes can reset.',
      'A Claude subscription cannot be used inside wOS (Anthropic\'s rule). Use an API key, or connect wOS to the Claude app as a connector.',
    ],
  },
  chat: {
    title: 'Chat · a free, open-source Slack alternative with agents',
    description: 'Free, open-source team chat like Slack: channels, threads, search and files, with AI agents you can @mention. Self-host it with one command.',
    color: 'g2', tag: 'Live demo', open: 'Try the demo',
    h1: 'Team chat your team owns, with agents in the&nbsp;room.',
    lede: 'Channels, direct messages, threads, reactions, search and files, like Slack. Add an AI agent as a member and @mention it, and it answers in the thread. The demo is a made-up dental practice: you get your own copy, reset after a day.',
    shot: ['chat', 'wOS Chat: the marketing channel of a fictional dental practice with a thread open on the right', 'chat.waronsaas.com · #marketing with a thread open · example data, fictional'],
    whatH: 'What Chat does',
    features: [
      ['g2', 'Channels and messages', 'Public and private channels, direct messages and group messages of up to 9 people, with unread counts and mention badges.'],
      ['g1', 'Threads and reactions', 'Reply in a thread, react, @mention a person, @channel or @here, edit, delete and format with markdown. Images show inline.'],
      ['g4', 'Search', 'Across every channel you can see, narrowed with <code>in:#channel</code> and <code>from:@person</code>.'],
      ['g3', 'Notifications your way', 'Per channel: every message, mentions or nothing, plus keywords. Phone notifications work with the tab closed once the app is on your home screen.'],
      ['g2', 'Agents as members', 'An agent sees only the channels it is in and reads with the same tools a person has. Agents never wake each other, so they cannot loop.'],
      ['g1', 'Leave any time', 'Export everything as a zip shaped like a Slack export, with the files themselves.'],
    ],
    agents: 'Every action in Chat is a tool, served over MCP and REST from the same code the screens use. Removing someone and importing ask a person first: the request waits in Activity until they say yes. A connection can be limited to reading only.',
    slug: 'chat',
    hostLede: 'One <code>docker compose up</code> and you have it. Use any Postgres, or SQLite on one computer. Keep files on disk or in any S3 store. No licence key and no limits.',
    commands: `git clone https://github.com/warOnSaaS/chat && cd chat
echo "OAUTH_SECRET=$(openssl rand -hex 32)" > .env
docker compose up -d     # Postgres and the chat, on http://localhost:3995`,
    needs: [
      ['A database', 'Yes', 'Postgres (your own, Neon, Supabase, RDS), or SQLite for one server'],
      ['Somewhere for files', 'Yes', 'A folder on disk, the database itself, or any S3 store'],
      ['Email for sign-in links', 'Recommended', 'Any SMTP service, or GitHub sign-in only'],
      ['Phone notifications', 'No extra service', 'The server makes its own push keys on first start'],
      ['A model for agents', 'Optional', 'Ollama, LM Studio, llama.cpp or any OpenAI-compatible server'],
    ],
    needsHead: ['Piece', 'Needed?', 'Free options'],
    hostNote: 'The first person to sign in becomes the owner. The database sets itself up when the app starts, so there is nothing to run by hand.',
    limits: [
      'Huddles, link previews, slash commands, pinned items and guests are not built yet.',
      'Slack import reads a Slack export and shows what it holds; the import itself is next.',
      'Slack\'s own export leaves out private channels and direct messages on its Free and Pro plans.',
      'On Vercel, uploads are capped at 4 MB. Self-hosted, you set the limit.',
    ],
  },
  email: {
    title: 'Email · free, open-source email for small teams',
    description: 'Fast, open-source email on the mailbox you already have: sorted for you, AI drafts you send yourself, and one address that runs wOS by email.',
    color: 'g4', tag: 'Live demo', open: 'Try the demo',
    h1: 'Fast email for small teams, and an address that runs&nbsp;wOS.',
    lede: 'Connect the mailbox you already have. Mail lands in Needs you, FYI or Newsletters, the AI drafts a reply when you ask, and you press Send. Your team can also run wOS by writing to one address, like ops@.',
    shot: ['email', 'wOS Email: the Needs you inbox of a fictional mailbox, with five messages waiting for a reply', 'mail.waronsaas.com · Needs you · a made-up mailbox'],
    whatH: 'What Email does',
    features: [
      ['g4', 'Your own mailbox', 'Fastmail, iCloud, your own server, or Gmail and Outlook with an app password. Threads, search, reply, compose and archive, all from the keyboard.'],
      ['g1', 'Sorted for you', 'Needs you, FYI or Newsletters. Your own rules come first; without an AI model, rules do the sorting.'],
      ['g2', 'Drafts by AI, sent by you', 'Ask for a reply in a few words. The AI writes it and you press Send.'],
      ['g3', 'Run wOS by email', 'Verified teammates write to one address to search, archive, draft and answer alerts. Reply "yes" or "2" to answer an alert, and get a daily digest.'],
      ['g4', 'Only your team is believed', 'Commands count only from team members whose mail passes SPF, DKIM and DMARC. Mail from anyone else is logged and never answered.'],
      ['g1', 'Leave any time', 'Export everything is a button in Settings. Mailbox passwords are encrypted with a key kept outside the database.'],
    ],
    agents: 'Every action on every screen is a tool, and each keyboard shortcut runs the same tool an agent would. Sending to anyone outside the team, deleting, and disconnecting a mailbox wait for a person\'s yes, and only a person can turn that check off. Outside mail reaches the model only as marked data, and the model has no tools: it only writes text.',
    slug: 'email',
    hostLede: 'You need a server that stays on (a small one is plenty), Docker, and a mailbox. Want to try it with no real mailbox? The compose file has a test mail server.',
    commands: `git clone https://github.com/warOnSaaS/email && cd email
cp .env.example .env     # EMAIL_SECRET_KEY, OAUTH_SECRET, PUBLIC_URL, TEAM_MEMBERS
docker compose up -d     # the app and Postgres on http://localhost:3990`,
    needs: [
      ['A server that stays on', 'Mail is checked every minute, the team address every 30 seconds', 'Any small server, a home server, your laptop for a trial'],
      ['A database', 'Everything except message bodies', 'The bundled Postgres, any Postgres, or a SQLite file'],
      ['A mailbox per person', 'Email is a mail client, not a mail host', 'The mailbox you already have'],
      ['One spare address', 'Running wOS by email', 'An address at your domain, like ops@'],
      ['HTTPS and a domain', 'Sign-in and signed links', 'Caddy or your host\'s certificates'],
      ['A model', 'Optional: AI sorting and drafts', 'Ollama or any OpenAI-compatible server'],
    ],
    hostNote: 'Database updates apply themselves when the app starts.',
    limits: [
      'Gmail and Microsoft sign-in buttons are not built yet. For now, use an app password.',
      'Mail is checked every minute; there is no instant push yet.',
      'Not yet: send later, attachments in compose, shared inboxes, and snoozing to a chosen time from the screen.',
      'The demo runs on a mail server that lives in memory. Nothing reaches a real inbox.',
    ],
  },
  meet: {
    title: 'Meetings · free, open-source video calls, encrypted',
    description: 'Free, open-source video meetings like Zoom: small calls go straight between people, calls are encrypted end to end, and webinars are built in.',
    color: 'g3', tag: 'Live', open: 'Start a meeting',
    h1: 'Video meetings with no server in the&nbsp;middle.',
    lede: 'Start a call, send the link, talk. Guests join from a browser with no account. Up to 4 people connect straight to each other. Bigger calls are carried by a computer in the call, and it cannot see or hear them, because the call is encrypted end to end.',
    shot: ['meet', 'wOS Meetings: start a meeting, or paste a link to join, with use it here and host it yourself side by side', 'meet.waronsaas.com · start or join a meeting'],
    whatH: 'What Meetings does',
    features: [
      ['g3', 'Meetings', 'Start now, or schedule for later with a calendar invite. Join by link; guests need no account.'],
      ['g1', 'In the call', 'Grid and speaker views, screen share, mute, camera, chat and raise hand.'],
      ['g2', 'Host controls', 'Waiting room, mute someone or everyone, make co-hosts, ask someone to share, remove, lock, and end for everyone.'],
      ['g4', 'Webinars', 'A few speakers and many viewers. Viewers send nothing until they raise a hand and the host lets them speak.'],
      ['g3', 'Encrypted end to end', 'Every audio and video frame is encrypted in the browser with the meeting\'s key. Computers carrying the call forward frames they cannot read.'],
      ['g1', 'Rooms for other apps', 'One tool opens the live room for a record, such as a Chat channel, with no waiting room. Export every meeting you host, who joined and the chat.'],
    ],
    agents: 'Every button is also a tool an agent can call, over MCP or REST. A person still has to allow the camera and choose what screen to share. <code>meet doctor</code> (and its tool) checks the network and the media server and says what to fix.',
    slug: 'meet',
    hostLede: 'One command on your own server runs the app, Postgres and HTTPS. Calls of up to 4 people need nothing else.',
    commands: `git clone https://github.com/warOnSaaS/meet && cd meet
cp .env.example .env     # set SESSION_SECRET and DOMAIN
docker compose up -d     # the app, Postgres and HTTPS`,
    needs: [
      ['Up to 4 people', 'Nothing extra', 'Browsers connect straight to each other. A TURN relay helps people behind strict firewalls.'],
      ['More than 4 people', 'A computer in the call', 'Someone runs <code>npx github:warOnSaaS/meet host "&lt;link&gt;"</code> on a plugged-in computer with good upload and Node 22'],
      ['The biggest calls', 'A media server, if you have one', 'LiveKit, self-hosted (in the compose file) or LiveKit Cloud, still encrypted with the meeting\'s key'],
      ['A database', 'Meetings and who joined', 'SQLite until you set <code>DATABASE_URL</code> to any Postgres'],
    ],
    needsHead: ['Call size', 'What it needs', 'How'],
    hostNote: 'Without Docker: <code>npm install &amp;&amp; npm start</code> on Node 22. Database updates apply themselves when it starts.',
    extra: '<p class="ak-calm"><b>Being added now:</b> AI notes, recording (it will start only after everyone in the call is told and agrees) and a whiteboard.</p>',
    limits: [
      'Recording is off today: it is not built yet.',
      'The app\'s server keeps each meeting\'s key, so whoever runs that server could read a call they also captured. It never sees the media itself.',
      'Calls carried by computers in the call were measured with up to 12 people on one computer, not across real networks yet.',
      'On the hosted site, starting a meeting needs a GitHub sign-in. Joining needs nothing.',
    ],
  },
};

export function appPage(id, repos) {
  const p = PROJECTS[id];
  const a = APPS[id];
  const pub = repos[id];
  const self = selfHref(id, repos);
  return layout({
    title: a.title, description: a.description,
    path: p.path, current: id, page: `is-${id}`, og: id,
    jsonld: [ORG, softwareLd(id, { featureList: a.features.map(([, t]) => t), ...(pub && { codeRepository: p.repo }), sameAs: p.live }), crumbs(p.name, p.path)],
    body: `
<main class="page">
<section class="page-hero">
  <p class="kicker"><i class="px ${a.color}"></i>Unit 0${p.unit}<span class="sep"></span>${p.license}<span class="ready">${a.tag}</span></p>
  <h1>${a.h1}</h1>
  <p class="lede">${a.lede}</p>
  ${actions({ open: [a.open, p.live], self, repo: pub ? p.repo : null })}
</section>

<section class="board-wrap" aria-label="${esc(p.name)}, live">
  <a class="window shot" href="${p.live}">
    <div class="window-bar"><span class="dots"><i></i><i></i><i></i></span><span class="window-t">${a.shot[2]}</span><span class="live-tag"><i class="pulse"></i>${a.tag}</span></div>
    ${themedShot(a.shot[0], a.shot[1], true)}
  </a>
</section>

<section class="sec">
  <h2>${a.whatH}</h2>
  ${feat(a.features)}
</section>

<section class="sec">
  <h2>Agents can run it</h2>
  <p class="prose">${a.agents}</p>
  ${table(['App', 'How to connect'], mcpRows(a.slug))}
</section>

<section class="sec" id="host-it-yourself">
  <h2>Host it yourself, free</h2>
  <p class="prose">${a.hostLede}</p>
  <pre class="code-block"><code>${esc(a.commands)}</code></pre>
  <p class="ak-calm">${a.hostNote}</p>
  <h3 class="sec-h3">What you need</h3>
  ${table(a.needsHead || ['Piece', 'Why', 'Free option'], a.needs)}
  ${a.extra || ''}
  <div class="ak-ways host-ways">
    <div class="ak-way">
      <h3>Use ours</h3>
      <p>The live ${id === 'meet' ? 'site' : 'demo'} at ${p.live.replace('https://', '').replace(/\/$/, '')}.${id === 'suite' ? ' Hosting with us, at what it costs doubled and shown openly, is coming soon.' : ''}</p>
      <a class="btn" href="${p.live}">${a.open}</a>
    </div>
    <div class="ak-way">
      <h3>Host it yourself, free</h3>
      <p>${p.license}, no account with us, no licence key. Your server, your database, and an export of everything whenever you want it.</p>
      <a class="btn btn-ghost" href="${pub ? p.repo : '#host-it-yourself'}">${pub ? 'Get the code on GitHub' : 'Source opens on GitHub soon'}</a>
    </div>
  </div>
</section>

<section class="sec">
  <h2>Limits, plainly</h2>
  <ul class="limits">${a.limits.map((l) => `<li>${l}</li>`).join('')}</ul>
</section>
</main>`,
  });
}
