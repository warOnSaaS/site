// The CRM and Scanner pages. Same shape as agent-kanban's: what it is, see it, two equal ways to run it.
import { layout, esc, SITE_URL, SCANNER_URL, CRM_URL, ORG } from './layout.mjs';
import { PROJECTS, softwareLd } from './projects.mjs';

const feat = (items) => `<div class="feat">${items.map(([g, t, d]) => `<div class="feat-i"><i class="px ${g}"></i><h3>${t}</h3><p>${d}</p></div>`).join('')}</div>`;
const crumbs = (name, path) => ({ '@type': 'BreadcrumbList', itemListElement: [
  { '@type': 'ListItem', position: 1, name: 'warOnSaaS', item: SITE_URL + '/' },
  { '@type': 'ListItem', position: 2, name, item: SITE_URL + path },
] });

const CRM_FEATURES = [
  ['g1', 'Contacts, companies, deals', 'Every person, organization and deal, linked to each other, with a page per record that shows its whole history.'],
  ['g2', 'A pipeline you can drag', 'Deals by stage with totals per stage. Drag a deal to move it, or open it and pick a stage.'],
  ['g3', 'Every call and meeting', 'Calls, meetings, notes and tasks land on the record they belong to, with what is due this week on top.'],
  ['g4', 'Import from Salesforce', 'Drop in the files from Salesforce Data Export, or any report saved as CSV. You see every row as new, updated or skipped before anything changes.'],
  ['g1', 'Your assistant runs it', 'Claude, ChatGPT, Claude Code and Codex use the same tools the screens use: "log a call with Dana", "move Birch Law to Won".'],
  ['g2', 'Leave any time', 'Export every kind of record as a spreadsheet file whenever you like. Your data is never stuck here.'],
];

export function crmPage({ repoPublic }) {
  const p = PROJECTS.crm;
  const self = repoPublic ? `${p.repo}#run-your-own` : '#host-it-yourself';
  return layout({
    title: 'CRM · a free Salesforce alternative that keeps your records',
    description: 'A free, open-source CRM a small team owns: contacts, deals and activities, Salesforce import, CSV export, and AI agents that can run it.',
    path: p.path, current: 'crm', page: 'is-crm', og: 'crm',
    jsonld: [ORG, softwareLd('crm', { featureList: CRM_FEATURES.map(([, t]) => t) }), crumbs('CRM', p.path)],
    body: `
<main class="page">
<section class="page-hero">
  <p class="kicker"><i class="px g3"></i>Unit 04<span class="sep"></span>${p.license}<span class="ready">Live demo</span></p>
  <h1>A free CRM your small team owns instead of rents.</h1>
  <p class="lede">Contacts, organizations, deals and every call, meeting, note and task, in one place you control. Bring your records over from Salesforce, take them anywhere, and let Claude or ChatGPT do the typing.</p>
  <div class="cta cta-even"><a class="btn" href="${p.demo}">Try the demo</a><a class="btn btn-ghost" href="${self}">Host it yourself, free</a></div>
</section>

<section class="board-wrap" aria-label="The CRM demo">
  <a class="window shot" href="${CRM_URL}/pipeline">
    <div class="window-bar"><span class="dots"><i></i><i></i><i></i></span><span class="window-t">crm.waronsaas.com · the pipeline · example data, fictional</span><span class="live-tag"><i class="pulse"></i>Live demo</span></div>
    <img src="/img/crm-pipeline.webp" width="1600" height="1000" alt="The CRM pipeline: deals in lanes from Lead to Won, with value, company, close date and owner on each card" loading="eager" decoding="async">
  </a>
</section>

<section class="sec">
  <h2>What the CRM does</h2>
  ${feat(CRM_FEATURES)}
</section>

<section class="sec split">
  <div>
    <h2>Moving off Salesforce</h2>
    <p class="prose">Small teams use a handful of Salesforce's hundreds of features, and pay for all of them per seat. This CRM covers the part you use every day. In Salesforce, go to Setup, then Data Export, and download the zip. Drop the files in, accounts first. Columns are matched for you, and you can change any match. Importing again updates records instead of duplicating them.</p>
  </div>
  <a class="window shot" href="${CRM_URL}/import">
    <img src="/img/crm-import.webp" width="1600" height="1000" alt="Import and export in the CRM: choose Contacts, Organizations, Deals or Activities, drop a CSV file, then match columns and check before importing" loading="lazy" decoding="async">
  </a>
</section>

<section class="sec">
  <h2>Agents can run it</h2>
  <p class="prose">Every button in the CRM calls a tool, and your AI assistant gets the same tools over MCP. Add the CRM to Claude as a custom connector, to Claude Code or Codex with one command, or to ChatGPT as a GPT. Then ask in plain words.</p>
  <div class="tbl"><table><thead><tr><th>App</th><th>How to connect</th></tr></thead><tbody>
    <tr><td><b>Claude</b> (web, desktop, phone)</td><td>Settings, Connectors, Add custom connector: <code>https://your-crm/mcp</code></td></tr>
    <tr><td><b>Claude Code</b></td><td><code>claude mcp add --transport http crm https://your-crm/mcp</code></td></tr>
    <tr><td><b>ChatGPT</b></td><td>A GPT with actions imported from <code>https://your-crm/openapi.json</code></td></tr>
  </tbody></table></div>
</section>

<section class="sec" id="host-it-yourself">
  <h2>Two ways to run it</h2>
  <div class="ak-ways">
    <div class="ak-way">
      <h3>Try the demo</h3>
      <p>The full CRM with a fictional team and example records. Click around, drag deals, try an import. Nothing to sign up for.</p>
      <a class="btn" href="${p.demo}">Try the demo</a>
    </div>
    <div class="ak-way">
      <h3>Host it yourself, free</h3>
      <p>Your server, your private GitHub repo for the records, no account with us. You need a GitHub sign-in app and somewhere that runs Node, such as Vercel.</p>
      <a class="btn btn-ghost" href="${repoPublic ? self : '#steps'}">Self-host steps</a>${repoPublic ? '' : '<p class="small">The source opens on GitHub soon. The steps below are the ones it ships with.</p>'}
    </div>
  </div>
  <ol class="steps steps-host" id="steps">
    <li><b>Make a workspace repo</b><span>A private GitHub repo that holds your records. List your team's GitHub usernames in <code>people.yml</code>.</span></li>
    <li><b>Create a GitHub sign-in app</b><span>github.com/settings/developers, New OAuth App, with the callback <code>https://your-crm/oauth/github/callback</code>.</span></li>
    <li><b>Deploy it</b><span>To Vercel or any server that runs Node, with the repo name, a token for it and the sign-in app's details as settings.</span></li>
    <li><b>Bring your data</b><span>Import and export, then the Salesforce files, accounts first.</span></li>
  </ol>
  <p class="ak-calm">Either way, your records are plain files in your own repo, and every kind of record exports as a spreadsheet file.</p>
</section>
</main>`,
  });
}

const SCAN_FEATURES = [
  ['g4', 'A score out of 100', 'What AI assistants can read, search basics, speed and security, each scored and combined, with the points each fix is worth.'],
  ['g1', 'The fix for every gap', 'Every failed check says why it matters and what to change, in plain words.'],
  ['g2', 'Watch it happen', 'The scan shows each request as it runs: the page, llms.txt, robots.txt, the sitemap and the rest.'],
  ['g3', 'Compare with a competitor', 'Two to five sites side by side, check by check.'],
  ['g4', 'From your agent', 'An MCP server for Claude, ChatGPT, Claude Code and Codex: scan, follow a scan, read a report, compare.'],
  ['g1', 'The same score every time', 'No AI model is involved, so a scan costs nothing to run and the same site gets the same score.'],
];

export function scannerPage({ repoPublic }) {
  const p = PROJECTS.scanner;
  const self = repoPublic ? `${p.repo}#run-your-own` : null;
  return layout({
    title: 'Scanner · scan your website for AI assistants, free',
    description: 'A free website scanner: what ChatGPT, Claude and Google can read on your site, a score out of 100, and the fix for every gap.',
    path: p.path, current: 'scanner', page: 'is-scanner', og: 'scanner',
    jsonld: [ORG, softwareLd('scanner', { featureList: SCAN_FEATURES.map(([, t]) => t), ...(repoPublic && { codeRepository: p.repo }) }), crumbs('Scanner', p.path)],
    body: `
<main class="page">
<section class="page-hero">
  <p class="kicker"><i class="px g4"></i>Unit 03<span class="sep"></span>${p.license}<span class="ready">Ready</span></p>
  <h1>Can AI assistants read your website? Scan it.</h1>
  <p class="lede">Put in an address and watch the scanner read your home page the way ChatGPT, Claude and Google do. You get a score out of 100 and the fix for every gap, in about thirty seconds.</p>
  <form class="scan-box scan-hero" action="${SCANNER_URL}/" method="get" role="search"><label><span>https://</span><input name="url" placeholder="yoursite.com" autocomplete="url" inputmode="url" spellcheck="false" autocapitalize="off" aria-label="Website address to scan" required></label><button class="btn" type="submit">Scan</button></form>
  <div class="cta cta-even"><a class="btn" href="${SCANNER_URL}/">Open the scanner</a>${self ? `<a class="btn btn-ghost" href="${self}">Host it yourself, free</a>` : ''}${repoPublic ? `<a class="btn btn-ghost" href="${p.repo}">GitHub</a>` : ''}</div>
</section>

<section class="board-wrap" aria-label="The scanner, live">
  <div class="window">
    <div class="window-bar"><span class="dots"><i></i><i></i><i></i></span><span class="window-t">scanner.waronsaas.com · a scan, live</span><span class="live-tag"><i class="pulse"></i>Live</span></div>
    <div class="frame scan-wide" data-w="1100" data-h="600"><iframe src="${SCANNER_URL}/embed" title="Scanner scanning a website, live" loading="lazy" tabindex="-1" scrolling="no"></iframe></div>
    <div class="frame scan-narrow" data-w="560" data-h="600"><iframe src="${SCANNER_URL}/embed" title="Scanner scanning a website, live" loading="lazy" tabindex="-1" scrolling="no"></iframe></div>
  </div>
</section>

<section class="sec">
  <h2>What the scanner checks</h2>
  ${feat(SCAN_FEATURES)}
</section>

<section class="sec">
  <h2>Use it from your agent or a terminal</h2>
  <div class="tbl"><table><thead><tr><th>Where</th><th>How</th></tr></thead><tbody>
    <tr><td><b>Claude</b> (web, desktop, phone)</td><td>Settings, Connectors, Add custom connector: <code>${SCANNER_URL}/mcp</code></td></tr>
    <tr><td><b>Claude Code</b></td><td><code>claude mcp add --transport http scanner ${SCANNER_URL}/mcp</code></td></tr>
    <tr><td><b>Codex</b></td><td><code>codex mcp add scanner --url ${SCANNER_URL}/mcp</code></td></tr>
    <tr><td><b>A terminal</b></td><td><code>npx -y github:warOnSaaS/scanner yoursite.com</code></td></tr>
  </tbody></table></div>
  <p class="ak-calm">Then ask: "Scan mysite.com and tell me the three fixes worth the most", or "Compare mysite.com with competitor.com". We scan every page of this site with it, and fix what it finds. A scan reads only public pages and files, the way any crawler does, and refuses private or internal addresses.</p>
</section>

<section class="sec">
  <h2>Two ways to run it</h2>
  <div class="ak-ways">
    <div class="ak-way">
      <h3>Use ours</h3>
      <p>The hosted scanner, its API and its MCP server are free and need no sign-in.</p>
      <a class="btn" href="${SCANNER_URL}/">Open the scanner</a>
    </div>
    <div class="ak-way">
      <h3>Host it yourself, free</h3>
      <p>Run the web page, the API and the MCP server on your own machine or server, or scan from your terminal with nothing to set up.</p>
      ${self ? `<a class="btn btn-ghost" href="${self}">Self-host steps</a>` : '<p class="small">The source opens on GitHub soon.</p>'}
    </div>
  </div>
</section>
</main>`,
  });
}
