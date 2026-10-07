// Every warOnSaaS project in one list. The home cards, the project pages, llms.txt, the sitemap,
// the structured data and the social cards all read from here, so a new project is one entry.
import { SITE_URL, SCANNER_URL, CRM_URL, KANBAN_URL, GITHUB, ORG } from './layout.mjs';

export const PROJECTS = {
  'agent-kanban': {
    unit: 1, name: 'agent-kanban', path: '/agent-kanban/', repo: `${GITHUB}/agent-kanban`, license: 'AGPL-3.0',
    category: 'BusinessApplication',
    line: 'A shared to-do board for people and their AI agents.',
    about: 'A shared to-do board for people and their AI agents. Tasks, hand-offs and reviews live as files in the team\'s own GitHub repo, worked from Claude, ChatGPT, Claude Code or Codex.',
    hosted: `${KANBAN_URL}/create`,
  },
  crm: {
    unit: 4, name: 'CRM', path: '/crm/', repo: `${GITHUB}/crm`, license: 'AGPL-3.0',
    category: 'BusinessApplication',
    line: 'A CRM a small team owns instead of rents.',
    about: 'A CRM a small team owns instead of rents: contacts, organizations, deals and every call, meeting, note and task. Imports from Salesforce, exports to CSV at any time, and Claude or ChatGPT can run it over MCP.',
    demo: `${CRM_URL}/`,
  },
  scanner: {
    unit: 3, name: 'Scanner', path: '/scanner/', repo: `${GITHUB}/scanner`, license: 'Apache-2.0',
    category: 'DeveloperApplication',
    line: 'Can AI assistants read your website? A free scan, scored out of 100.',
    about: 'Shows what ChatGPT, Claude and Google can read on any website, with a score out of 100 and the fix for every gap. A web page, an API, a command line tool and an MCP server.',
    hosted: `${SCANNER_URL}/`,
  },
  kit: {
    unit: 2, name: 'UI kit', path: '/kit/', repo: null, license: 'Apache-2.0',
    category: 'DeveloperApplication',
    line: 'The building blocks of a website people ask instead of scroll.',
    about: 'ui-design, the building blocks of a website people ask instead of scroll: streaming answers, cards, tables and forms in plain HTML, CSS and JavaScript, with eight colour schemes.',
  },
};

// The wOS suite: not built yet, so it is shown as coming.
export const SUITE = {
  repo: `${GITHUB}/suite`,
  line: 'One app for your team and its agents: chat, meetings and email around a conversation with the AI you choose.',
  apps: [['Chat', 'Channels and threads, like Slack'], ['Meetings', 'Video calls with notes, like Zoom'], ['Email', 'Your inbox, and run it all by email']],
};

// Whether a GitHub repo is public yet, so a page never links to a 404. Asked once per build.
const seen = new Map();
export async function isPublic(repo) {
  if (!repo) return false;
  if (!seen.has(repo)) {
    seen.set(repo, fetch(repo, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(6000) })
      .then((r) => r.ok).catch(() => false));
  }
  return seen.get(repo);
}
export async function repoStatus() {
  const out = {};
  for (const [id, p] of Object.entries(PROJECTS)) out[id] = await isPublic(p.repo);
  out.suite = await isPublic(SUITE.repo);
  return out;
}

// schema.org SoftwareApplication for a project page.
export function softwareLd(id, extra = {}) {
  const p = PROJECTS[id];
  return {
    '@type': 'SoftwareApplication', name: p.name === 'CRM' ? 'warOnSaaS CRM' : p.name === 'UI kit' ? 'ui-design, the warOnSaaS UI kit' : p.name,
    url: SITE_URL + p.path, description: p.about, applicationCategory: p.category, operatingSystem: 'Any (web browser)',
    license: `https://spdx.org/licenses/${p.license}.html`, isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    publisher: { '@id': ORG['@id'] }, ...extra,
  };
}
