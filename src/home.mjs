import { layout, tank, GITHUB, ORG, CRM_URL } from './layout.mjs';
import { SCANNER_URL as SCANNER, SITE_URL } from './layout.mjs';
import { PROJECTS, SUITE, softwareLd } from './projects.mjs';
const PX = { 1: 'g2', 2: 'g1', 3: 'g4', 4: 'g3' };

const unit = ({ n, cls, name, line, facts, viz, open, more, extra = '', even = false, page = '' }) => `
<article class="unit ${cls}">
  <a class="unit-viz" href="${page || open[1]}" aria-label="${name}" tabindex="-1">${viz}</a>
  <div class="unit-body">
    <p class="kicker"><i class="px ${PX[n]}"></i>Unit 0${n}<span class="ready">Ready</span></p>
    <h3><a href="${page || open[1]}">${name}</a></h3>
    <p class="unit-line">${line}</p>
    <ul class="facts">${facts.map((f) => `<li>${f}</li>`).join('')}</ul>${extra}
    <div class="cta${even ? ' cta-even' : ''}"><a class="btn" href="${open[1]}">${open[0]}</a>${more ? `<a class="btn btn-ghost" href="${more[1]}">${more[0]}</a>` : ''}</div>
  </div>
</article>`;

export function homePage({ repos = {} } = {}) {
  return layout({
    title: 'warOnSaaS · free open-source CRM, board and AI tools',
    description: 'Free, open-source tools that replace the software you rent: a CRM, a board for people and AI agents, a website scanner and a UI kit.',
    path: '/',
    jsonld: [ORG, { '@type': 'WebSite', '@id': SITE_URL + '/#site', name: 'warOnSaaS', url: SITE_URL + '/', publisher: { '@id': ORG['@id'] } },
      { '@type': 'ItemList', name: 'warOnSaaS projects', itemListElement: Object.values(PROJECTS).sort((a, b) => a.unit - b.unit).map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: SITE_URL + p.path, name: p.name })) }],
    page: 'is-home',
    body: `
<main class="home">
<section class="hero">
  <div class="hero-in">
    <div class="hero-mark">${tank('tank tank-hero')}<span class="shell" aria-hidden="true"></span></div>
    <p class="pill"><i class="pulse"></i>4 projects ready<span class="sep"></span>free and open source</p>
    <h1>Free, open-source tools that replace the software you&nbsp;rent.</h1>
    <p class="lede">warOnSaaS builds open-source versions of the apps businesses pay for every month: a CRM, a team board, a website scanner. Use them, change them, host them yourself for free, and keep everything. Your AI agents can run every one of them.</p>
  </div>
</section>

<section class="units" id="projects" aria-label="Projects">
  <div class="units-h"><h2>Pick a unit</h2><span>All four are live below. Point at one.</span></div>
  <div class="unit-grid">
  ${unit({
    n: 1, cls: 'u-kanban', name: 'agent-kanban', even: true, page: '/agent-kanban/',
    line: 'A shared to-do board for people and their AI agents. Tasks, hand-offs and reviews live in your own GitHub repo.',
    facts: ['Works from Claude, ChatGPT, Claude Code or Codex', 'Sign in with GitHub, no keys to share', 'Plain files you keep'],
    viz: '<div class="frame" data-w="1100" data-h="560"><iframe src="/agent-kanban/board/?demo=1" title="agent-kanban example board, live" loading="lazy" tabindex="-1" scrolling="no"></iframe></div>',
    open: ['Create your board', PROJECTS['agent-kanban'].hosted], more: ['Host it yourself, free', `${GITHUB}/agent-kanban#host-it-yourself`],
  })}
  ${unit({
    n: 2, cls: 'u-kit', name: 'UI kit', page: '/kit/',
    line: 'The building blocks of a website people ask instead of scroll: answers that type themselves out, cards, tables and forms.',
    facts: ['Plain HTML, CSS and JavaScript', 'Eight colour schemes, light and dark', 'No AI model runs, so visits cost nothing'],
    viz: '<div class="frame" data-w="900" data-h="458"><iframe src="/kit/stage/?c=streaming&amp;t=midnight&amp;loop=1" title="UI kit streaming answer, live" loading="lazy" tabindex="-1"></iframe></div>',
    open: ['Browse the kit', '/kit/'], more: ['Watch it stream', '/kit/streaming/'],
  })}
  ${unit({
    n: 4, cls: 'u-crm', name: 'CRM', page: '/crm/',
    line: 'A CRM a small team owns instead of rents. Contacts, deals and every call, with a pipeline you drag and the history on each record.',
    facts: ['Import from Salesforce', 'Agents can run it over MCP', 'Export everything, any time'],
    viz: '<img src="/img/crm-pipeline.webp" width="1600" height="1000" alt="The CRM demo pipeline with deals in lanes from Lead to Won" loading="lazy" decoding="async">',
    open: ['Try the demo', `${CRM_URL}/`], more: ['Host it yourself, free', repos.crm ? `${PROJECTS.crm.repo}#run-your-own` : '/crm/#host-it-yourself'], even: true,
  })}
  ${unit({
    n: 3, cls: 'u-scan', name: 'Scanner', page: '/scanner/',
    line: 'Can AI assistants read your website? Put in an address and watch the scan: a score out of 100 and the fix for every gap.',
    facts: ['Runs from Claude, ChatGPT, Claude Code or Codex', 'Compare you with a competitor', 'No AI model, the same score every time'],
    viz: `<div class="frame scan-wide" data-w="1100" data-h="600"><iframe src="${SCANNER}/embed" title="Scanner scanning a website, live" loading="lazy" tabindex="-1" scrolling="no"></iframe></div><div class="frame scan-narrow" data-w="560" data-h="600"><iframe src="${SCANNER}/embed" title="Scanner scanning a website, live" loading="lazy" tabindex="-1" scrolling="no"></iframe></div>`,
    open: ['Open the scanner', `${SCANNER}/`], more: ['How it works', '/scanner/'],
    extra: `<form class="scan-box" action="${SCANNER}/" method="get" role="search"><label><span>https://</span><input name="url" placeholder="yoursite.com" autocomplete="url" inputmode="url" spellcheck="false" autocapitalize="off" aria-label="Website address to scan" required></label><button class="btn" type="submit">Scan</button></form>`,
  })}
  </div>
</section>

<section class="coming" aria-labelledby="coming-h">
  <div class="coming-in">
    <p class="kicker"><i class="px g1"></i>Coming<span class="sep"></span>the wOS suite</p>
    <h2 id="coming-h">${SUITE.line}</h2>
    <ul class="coming-apps">${SUITE.apps.map(([a, d]) => `<li><b>${a}</b><span>${d}</span></li>`).join('')}<li><b>Agents</b><span>Several AI agents working together, with their progress in view</span></li></ul>
    <p class="small">The CRM and the board load inside it. Each app switches on or off per team, and an app that is off is not installed. ${repos.suite ? `<a href="${SUITE.repo}">Follow it on GitHub</a>.` : 'Being built now, in the open soon.'}</p>
  </div>
</section>

<section class="about" aria-labelledby="about-h">
  <div class="about-in">
    <h2 id="about-h">How warOnSaaS works</h2>
    <div class="about-grid">
      <div><h3>Free to self-host</h3><p>Every project is open source. Run it on your own server with your own database or GitHub repo, for free, with no account with us. The steps are on each project page: <a href="/crm/#host-it-yourself">the CRM</a>, <a href="/agent-kanban/#start">agent-kanban</a> and <a href="/scanner/">the scanner</a>.</p></div>
      <div><h3>Or hosted by us</h3><p>If you would rather not run a server, we host it. The price will be what it costs us to run, doubled, plus a small fee per person for support, and we show those costs openly. You can move to your own hosting any time and take everything with you.</p></div>
      <div><h3>Agents run it too</h3><p>Everything a person can do on a screen, an AI agent can do through the same tools over MCP. Connect Claude, ChatGPT, Claude Code or Codex and work in plain words. There is a short summary for assistants in <a href="/llms.txt">llms.txt</a>.</p></div>
    </div>
  </div>
</section>

</main>`,
  });
}
