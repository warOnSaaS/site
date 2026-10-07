import { layout, tank, GITHUB } from './layout.mjs';

import { SCANNER_URL as SCANNER, SITE_URL } from './layout.mjs';
const PX = { 1: 'g2', 2: 'g1', 3: 'g4' };

const unit = ({ n, cls, name, line, facts, viz, open, more, extra = '' }) => `
<article class="unit ${cls}">
  <a class="unit-viz" href="${open[1]}" aria-label="${open[0]}: ${name}" tabindex="-1">${viz}</a>
  <div class="unit-body">
    <p class="kicker"><i class="px ${PX[n]}"></i>Unit 0${n}<span class="ready">Ready</span></p>
    <h3><a href="${open[1]}">${name}</a></h3>
    <p class="unit-line">${line}</p>
    <ul class="facts">${facts.map((f) => `<li>${f}</li>`).join('')}</ul>${extra}
    <div class="cta"><a class="btn" href="${open[1]}">${open[0]}</a>${more ? `<a class="btn btn-ghost" href="${more[1]}">${more[0]}</a>` : ''}</div>
  </div>
</article>`;

export function homePage() {
  return layout({
    title: 'warOnSaaS · free tools that replace the software you rent',
    description: 'Free, open-source replacements for the software you rent: a board for people and their AI agents, a UI kit, and an AI readiness scanner.',
    path: '/',
    head: `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'Organization', name: 'warOnSaaS', url: SITE_URL + '/', logo: SITE_URL + '/favicon.svg', sameAs: [GITHUB], description: 'Free, open-source replacements for the software businesses rent by the month.' })}</script>`,
    page: 'is-home',
    body: `
<main class="home">
<section class="hero">
  <div class="hero-in">
    <div class="hero-mark">${tank('tank tank-hero')}<span class="shell" aria-hidden="true"></span></div>
    <p class="pill"><i class="pulse"></i>3 projects ready<span class="sep"></span>free and open source</p>
    <h1>Free tools that replace the software you&nbsp;rent.</h1>
    <p class="lede">warOnSaaS builds open-source versions of the apps businesses pay for every month. Use them, change them, run them yourself, and keep everything.</p>
  </div>
</section>

<section class="units" id="projects" aria-label="Projects">
  <div class="units-h"><h2>Pick a unit</h2><span>All three are live below. Point at one.</span></div>
  <div class="unit-grid">
  ${unit({
    n: 1, cls: 'u-kanban', name: 'agent-kanban',
    line: 'A shared to-do board for people and their AI agents. Tasks, hand-offs and reviews live in your own GitHub repo.',
    facts: ['Works from Claude, ChatGPT, Claude Code or Codex', 'Sign in with GitHub, no keys to share', 'Plain files you keep'],
    viz: '<div class="frame" data-w="1100" data-h="560"><iframe src="/agent-kanban/board/?demo=1" title="agent-kanban example board, live" loading="lazy" tabindex="-1" scrolling="no"></iframe></div>',
    open: ['Open agent-kanban', '/agent-kanban/'], more: ['GitHub', `${GITHUB}/agent-kanban`],
  })}
  ${unit({
    n: 2, cls: 'u-kit', name: 'UI kit',
    line: 'The building blocks of a website people ask instead of scroll: answers that type themselves out, cards, tables and forms.',
    facts: ['Plain HTML, CSS and JavaScript', 'Midnight, Ops and Field themes', 'No AI model runs, so visits cost nothing'],
    viz: '<div class="frame" data-w="900" data-h="458"><iframe src="/kit/stage/?c=streaming&amp;t=midnight&amp;loop=1" title="UI kit streaming answer, live" loading="lazy" tabindex="-1"></iframe></div>',
    open: ['Browse the kit', '/kit/'], more: ['Watch it stream', '/kit/streaming/'],
  })}
  ${unit({
    n: 3, cls: 'u-scan', name: 'Scanner',
    line: 'Can AI assistants read your website? Put in an address and watch the scan: a score out of 100 and the fix for every gap.',
    facts: ['Runs from Claude, ChatGPT, Claude Code or Codex', 'Compare you with a competitor', 'No AI model, the same score every time'],
    viz: `<div class="frame scan-wide" data-w="1100" data-h="600"><iframe src="${SCANNER}/embed" title="Scanner scanning a website, live" loading="lazy" tabindex="-1" scrolling="no"></iframe></div><div class="frame scan-narrow" data-w="560" data-h="600"><iframe src="${SCANNER}/embed" title="Scanner scanning a website, live" loading="lazy" tabindex="-1" scrolling="no"></iframe></div>`,
    open: ['Open the scanner', `${SCANNER}/`], more: ['Use it from your agent', `${SCANNER}/#agents`],
    extra: `<form class="scan-box" action="${SCANNER}/" method="get" role="search"><label><span>https://</span><input name="url" placeholder="yoursite.com" autocomplete="url" inputmode="url" spellcheck="false" autocapitalize="off" aria-label="Website address to scan" required></label><button class="btn" type="submit">Scan</button></form>`,
  })}
  </div>
</section>

</main>`,
  });
}
