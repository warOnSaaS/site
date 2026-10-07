// Draws the social card images (1200x630 PNG) for every page from one HTML template in the site's
// look, with Playwright. The images are committed in og/, because Vercel's build has no browser;
// build.mjs redraws any card whose words changed when Playwright is on this machine.
//   node scripts/og.mjs           redraw the cards whose words changed
//   node scripts/og.mjs --all     redraw every card
// Playwright: PLAYWRIGHT_PATH, else ./node_modules/playwright, else ~/crm/node_modules/playwright.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';

const { PROJECTS } = await import('../src/projects.mjs');

export const CARDS = {
  home: { kicker: 'wOS · free and open source', title: 'Run your whole business with AI agents.', line: 'CRM, email, chat, meetings and a team board in one app. Host it yourself for free, or let us run it.', color: 'g1' },
  suite: { kicker: 'wOS · the suite', title: 'One app for your team and its AI agents.', line: 'Agents, board, CRM, Chat, Email and Meetings. Turn apps on and off, use any model, host it yourself free.', color: 'g1' },
  chat: { kicker: 'Chat · replaces Slack', title: 'Team chat your team owns.', line: 'Channels, threads, search and files, with AI agents you can @mention. Self-host it with one command.', color: 'g2' },
  email: { kicker: 'Email · replaces Gmail and Superhuman', title: 'Fast email for small teams.', line: 'Sorted for you, AI drafts you send yourself, and one address your team runs wOS from.', color: 'g4' },
  meet: { kicker: 'Meetings · replaces Zoom', title: 'Video meetings with no server in the middle.', line: 'Encrypted end to end. Calls of up to 4 people go straight between browsers. Webinars built in.', color: 'g3' },
  'agent-kanban': { kicker: 'Unit 01 · agent-kanban', title: 'A shared to-do board for people and their AI agents.', line: 'Tasks, hand-offs and reviews live in your own GitHub repo, worked from Claude, ChatGPT, Claude Code or Codex.', color: 'g2' },
  kit: { kicker: 'Unit 02 · UI kit', title: 'The building blocks of a website people ask instead of scroll.', line: 'Streaming answers, cards, tables and forms in plain HTML, CSS and JavaScript. Eight colour schemes.', color: 'g1' },
  scanner: { kicker: 'Unit 03 · Scanner', title: 'Can AI assistants read your website?', line: 'A free scan scored out of 100, with the fix for every gap. On the web, in a terminal, or from your agent.', color: 'g4' },
  crm: { kicker: 'Unit 04 · CRM', title: 'A free CRM your small team owns instead of rents.', line: 'Contacts, deals and every call. Import from Salesforce, export any time, and let your AI agents run it.', color: 'g3' },
};
for (const id of Object.keys(PROJECTS)) if (!CARDS[id]) throw new Error(`og: no card for project ${id}`);

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = path.join(ROOT, 'og');
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const COLORS = { g1: '#ffd84d', g2: '#4ade80', g3: '#f472b6', g4: '#7dd3fc' };

function template(c) {
  const fonts = pathToFileURL(path.join(ROOT, 'vendor/ui-design/fonts')).href;
  const tank = fs.readFileSync(path.join(ROOT, 'vendor/ui-design/logo.svg'), 'utf8').replace(/<!--[\s\S]*?-->\s*/, '').replace(/ width="\d+" height="\d+"/, ' width="96"');
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Geist;src:url(${fonts}/geist.woff2) format("woff2");font-weight:300 700}
@font-face{font-family:"Departure Mono";src:url(${fonts}/departure-mono.woff2) format("woff2")}
*{box-sizing:border-box;margin:0}
html,body{width:1200px;height:630px;overflow:hidden}
body{background:radial-gradient(700px 420px at 78% 20%,rgba(125,211,252,.10),transparent 70%),linear-gradient(rgba(255,255,255,.035) 1px,transparent 1px) 0 0/40px 40px,linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px) 0 0/40px 40px,#09090b;color:#fafafa;font-family:Geist,sans-serif;padding:72px 80px;display:flex;flex-direction:column}
.top{display:flex;align-items:center;justify-content:space-between}
.brand{display:flex;align-items:center;gap:18px;font:700 34px/1 "Geist",monospace;letter-spacing:-.02em}
.brand svg{image-rendering:pixelated;shape-rendering:crispEdges}
.k{display:flex;align-items:center;gap:14px;font:22px/1 "Departure Mono",monospace;letter-spacing:.05em;text-transform:uppercase;color:#a1a1aa}
.k i{width:14px;height:14px;border-radius:3px;background:${COLORS[c.color]}}
h1{margin-top:auto;font-size:${c.title.length > 48 ? 66 : 76}px;line-height:1.04;letter-spacing:-.05em;font-weight:600;max-width:20ch;background:linear-gradient(180deg,#fff 40%,#b4b4bc);-webkit-background-clip:text;color:transparent;padding-bottom:6px}
p{margin-top:24px;font-size:27px;line-height:1.4;color:#a1a1aa;max-width:46ch}
.bar{position:absolute;left:0;right:0;bottom:0;height:8px;background:${COLORS[c.color]}}
.url{font:22px/1 "Departure Mono",monospace;color:#71717a}
</style></head><body>
<div class="top"><div class="brand">${tank}<span>wOS</span></div><div class="url">waronsaas.com</div></div>
<div class="k" style="margin-top:56px"><i></i>${esc(c.kicker)}</div>
<h1>${esc(c.title)}</h1>
<p>${esc(c.line)}</p>
<div class="bar"></div>
</body></html>`;
}

export const hashOf = (c) => crypto.createHash('sha256').update(JSON.stringify(c) + fs.readFileSync(new URL(import.meta.url))).digest('hex').slice(0, 12);

async function loadPlaywright() {
  const tries = [process.env.PLAYWRIGHT_PATH, path.join(ROOT, 'node_modules/playwright'), path.join(os.homedir(), 'crm/node_modules/playwright')].filter(Boolean);
  for (const t of tries) if (fs.existsSync(path.join(t, 'index.mjs'))) return import(pathToFileURL(path.join(t, 'index.mjs')).href);
  return null;
}

// Redraws stale cards. Returns the ids it drew, or null when there is no Playwright here.
export async function drawCards({ all = false } = {}) {
  fs.mkdirSync(OUT, { recursive: true });
  const manPath = path.join(OUT, 'manifest.json');
  const man = fs.existsSync(manPath) ? JSON.parse(fs.readFileSync(manPath, 'utf8')) : {};
  const stale = Object.entries(CARDS).filter(([id, c]) => all || man[id] !== hashOf(c) || !fs.existsSync(path.join(OUT, `${id}.png`)));
  if (!stale.length) return [];
  const pw = await loadPlaywright();
  if (!pw) return null;
  const browser = await pw.chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  for (const [id, c] of stale) {
    const tmp = path.join(os.tmpdir(), `wos-og-${id}.html`);
    fs.writeFileSync(tmp, template(c));
    await page.goto(pathToFileURL(tmp).href);
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(OUT, `${id}.png`), type: 'png' });
    man[id] = hashOf(c);
  }
  await browser.close();
  fs.writeFileSync(manPath, JSON.stringify(man, null, 2) + '\n');
  return stale.map(([id]) => id);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const drawn = await drawCards({ all: process.argv.includes('--all') });
  if (drawn === null) { console.error('og: Playwright not found. Set PLAYWRIGHT_PATH.'); process.exit(1); }
  console.log(drawn.length ? `og: drew ${drawn.join(', ')}` : 'og: every card is current');
}
