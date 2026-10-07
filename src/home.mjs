import { layout, tank, GITHUB } from './layout.mjs';

const unit = ({ n, cls, name, line, facts, viz, open, more }) => `
<article class="unit ${cls}">
  <a class="unit-viz" href="${open[1]}" aria-label="${open[0]}: ${name}" tabindex="-1">${viz}</a>
  <div class="unit-body">
    <p class="kicker"><i class="px ${n === 1 ? 'g2' : 'g1'}"></i>Unit 0${n}<span class="ready">Ready</span></p>
    <h3><a href="${open[1]}">${name}</a></h3>
    <p class="unit-line">${line}</p>
    <ul class="facts">${facts.map((f) => `<li>${f}</li>`).join('')}</ul>
    <div class="cta"><a class="btn" href="${open[1]}">${open[0]}</a>${more ? `<a class="btn btn-ghost" href="${more[1]}">${more[0]}</a>` : ''}</div>
  </div>
</article>`;

export function homePage() {
  return layout({
    title: 'warOnSaaS · free tools that replace the software you rent',
    description: 'warOnSaaS builds open-source replacements for software businesses rent by the month: agent-kanban, a shared board for people and their AI agents, and a UI kit for websites you can ask.',
    page: 'is-home',
    body: `
<main class="home">
<section class="hero">
  <div class="hero-in">
    <div class="hero-mark">${tank('tank tank-hero')}<span class="shell" aria-hidden="true"></span></div>
    <p class="pill"><i class="pulse"></i>2 projects ready<span class="sep"></span>free and open source</p>
    <h1>Free tools that replace the software you&nbsp;rent.</h1>
    <p class="lede">warOnSaaS builds open-source versions of the apps businesses pay for every month. Use them, change them, run them yourself, and keep everything.</p>
  </div>
</section>

<section class="units" id="projects" aria-label="Projects">
  <div class="units-h"><h2>Pick a unit</h2><span>Both are live below. Point at one.</span></div>
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
  </div>
</section>

<section class="factory" aria-label="What is next">
  <div class="factory-in">
    <div class="road" aria-hidden="true">${tank('tank tank-roll')}</div>
    <p><b>Unit 03 is in the factory.</b> Watch <a href="${GITHUB}">github.com/warOnSaaS</a> to see it first.</p>
  </div>
</section>
</main>`,
  });
}
