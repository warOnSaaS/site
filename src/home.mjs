// The home page: wOS first, then the apps in the order a business buyer cares about, why it is
// different, and the free tools. Every product card names what it replaces and has the same three
// actions: open it, host it yourself (same weight), and the code.
import { layout, tank, GITHUB, ORG, CRM_URL, SITE_URL, SCANNER_URL as SCANNER, themedShot, actions } from './layout.mjs';
import { PROJECTS } from './projects.mjs';
import { selfHref } from './app-pages.mjs';

const card = ({ cls = '', color, replaces, kick, name, page, line, viz, acts, badge = '<span class="ready">Live</span>' }) => `
<article class="unit ${cls}" style="--c:var(--${color})">
  <a class="unit-viz" href="${page}" aria-label="${name}" tabindex="-1">${viz}</a>
  <div class="unit-body">
    <p class="kicker"><i class="px ${color}"></i>${kick || `Replaces ${replaces}`}${badge}</p>
    <h3><a href="${page}">${name}</a></h3>
    <p class="unit-line">${line}</p>
    ${acts}
  </div>
</article>`;

const building = ({ color, replaces, name, line, url }) => `
<article class="unit unit-soon" style="--c:var(--${color})">
  <div class="unit-body">
    <p class="kicker"><i class="px ${color}"></i>Replaces ${replaces}<span class="soon">Building now</span></p>
    <h3>${name}</h3>
    <p class="unit-line">${line}</p>
    <p class="small">It opens at ${url.replace('https://', '')} when it is ready, and joins wOS.</p>
  </div>
</article>`;

export function homePage({ repos = {}, upcoming = {} } = {}) {
  const P = PROJECTS;
  const app = (id, open, color, replaces, line, extra = {}) => card({
    color, replaces, line, name: P[id].name, page: P[id].path,
    viz: themedShot(id, `${P[id].name}, live at ${P[id].live.replace('https://', '').replace(/\/$/, '')}`),
    acts: actions({ open: [open, P[id].live], self: selfHref(id, repos), repo: repos[id] ? P[id].repo : null }), ...extra,
  });
  const soon = (key, color, replaces, name, line) => {
    const u = upcoming[key];
    if (!u?.live) return building({ color, replaces, name, line, url: u?.url || `https://${key}.waronsaas.com` });
    return card({ color, replaces, name, line, page: u.url, viz: '', cls: 'unit-noviz',
      acts: actions({ open: [`Open ${name}`, u.url], self: u.repoPublic ? u.repo : u.url, repo: u.repoPublic ? u.repo : null }) });
  };
  return layout({
    title: 'warOnSaaS · free, open-source apps to run your business with AI',
    description: 'wOS is free, open-source software for your whole business: CRM, email, chat, meetings and a team board in one app your AI agents can run.',
    path: '/',
    jsonld: [ORG, { '@type': 'WebSite', '@id': SITE_URL + '/#site', name: 'warOnSaaS', url: SITE_URL + '/', publisher: { '@id': ORG['@id'] } },
      { '@type': 'ItemList', name: 'warOnSaaS products', itemListElement: ['suite', 'crm', 'email', 'chat', 'meet', 'agent-kanban', 'scanner', 'kit'].map((id, i) => ({ '@type': 'ListItem', position: i + 1, url: SITE_URL + P[id].path, name: P[id].name })) }],
    page: 'is-home',
    body: `
<main class="home">
<section class="hero hero-suite">
  <div class="hero-in">
    <div class="hero-mark">${tank('tank tank-hero')}<span class="shell" aria-hidden="true"></span></div>
    <p class="pill"><i class="pulse"></i>wOS is live<span class="sep"></span>free and open source</p>
    <h1>Run your whole business with AI agents. Free and open&nbsp;source.</h1>
    <p class="lede">CRM, email, chat, meetings, decks, sheets and a team board in one app. Your AI does the work through every one of them. Host it yourself for free, or let us run it.</p>
    <div class="acts acts-hero"><a class="btn" href="${P.suite.live}">Open wOS</a><a class="btn btn-self" href="${repos.suite ? P.suite.repo : '/suite/#host-it-yourself'}">Host it yourself, free</a><a class="btn btn-ghost" href="#apps">See every app</a></div>
  </div>
  <a class="window shot hero-shot" href="${P.suite.live}">
    <div class="window-bar"><span class="dots"><i></i><i></i><i></i></span><span class="window-t">app.waronsaas.com · two agents at work · example data, fictional</span><span class="live-tag"><i class="pulse"></i>Live demo</span></div>
    ${themedShot('suite', 'wOS: the Agents view with two agents working side by side, each with its plan, progress and the steps it took, and the apps in the left rail', true)}
  </a>
</section>

<section class="units" id="apps" aria-labelledby="apps-h">
  <div class="units-h"><h2 id="apps-h">Every app</h2><span>Each one works on its own, and all of them work inside wOS.</span></div>
  <div class="unit-grid">
  ${card({
    color: 'g3', replaces: 'Salesforce', name: 'CRM', page: '/crm/',
    line: 'Contacts, deals and every call in one place you own. Bring your Salesforce records with you, and take them anywhere.',
    viz: '<img src="/img/crm-pipeline.webp" width="1600" height="1000" alt="The CRM pipeline with deals in lanes from Lead to Won" loading="lazy" decoding="async">',
    acts: actions({ open: ['Open the demo', `${CRM_URL}/`], self: repos.crm ? `${P.crm.repo}#run-your-own` : '/crm/#host-it-yourself', repo: repos.crm ? P.crm.repo : null }),
  })}
  ${app('email', 'Open the demo', 'g4', 'Gmail and Superhuman', 'The mailbox you already have, sorted into what needs you. The AI drafts the reply, and you press Send.')}
  ${app('chat', 'Open the demo', 'g2', 'Slack', 'Channels, threads and search for your team, with AI helpers you can @mention in any thread.')}
  ${app('meet', 'Start a meeting', 'g1', 'Zoom', 'Video calls anyone can join from a browser. Encrypted end to end, with webinars built in.')}
  ${card({
    cls: 'u-wide', color: 'g2', replaces: 'Trello and Asana', name: 'Board', page: '/agent-kanban/',
    line: 'One to-do board for your people and your AI agents. Tasks, hand-offs and reviews, kept in your own GitHub.',
    viz: '<div class="frame" data-w="1100" data-h="560"><iframe src="/agent-kanban/board/?demo=1" title="The board, live with example tasks" loading="lazy" tabindex="-1" scrolling="no"></iframe></div>',
    acts: actions({ open: ['Create your board', P['agent-kanban'].hosted], self: `${GITHUB}/agent-kanban#host-it-yourself`, repo: `${GITHUB}/agent-kanban` }),
  })}
  ${soon('decks', 'g3', 'PowerPoint and Google Slides', 'Decks', 'Presentations in the same app as everything else, so your AI can build one from what your team already knows.')}
  ${soon('sheets', 'g4', 'Excel and Google Sheets', 'Sheets', 'Spreadsheets in the same app as everything else, so your AI can fill and check them for you.')}
  </div>
</section>

<section class="about" aria-labelledby="about-h">
  <div class="about-in">
    <h2 id="about-h">Why it's different</h2>
    <div class="about-grid">
      <div><i class="px g2"></i><h3>Your AI can do anything you can</h3><p>Every button is also a tool your AI can use. Connect your own Claude or ChatGPT and ask in plain words: "log a call with Dana", "move Birch Law to Won".</p></div>
      <div><i class="px g1"></i><h3>No lock-in</h3><p>Your data lives where you choose. Export everything or move to another server whenever you like, and take it all with you.</p></div>
      <div><i class="px g4"></i><h3>Free to host yourself</h3><p>Every app is open source, with no licence key. Or we host it at what it costs us plus a fair margin, and we show you those costs.</p></div>
    </div>
  </div>
</section>

<section class="units" id="tools" aria-labelledby="tools-h">
  <div class="units-h"><h2 id="tools-h">Free tools</h2><span>No sign-up. Use them today.</span></div>
  <div class="unit-grid">
  ${card({
    color: 'g4', kick: 'Free tool', name: 'Scanner', page: '/scanner/', badge: '',
    line: 'Can AI assistants read your website? Put in your address and get a score out of 100, with the fix for every gap.',
    viz: `<div class="frame" data-w="1100" data-h="600"><iframe src="${SCANNER}/embed" title="The scanner scanning a website, live" loading="lazy" tabindex="-1" scrolling="no"></iframe></div>`,
    acts: `<form class="scan-box" action="${SCANNER}/" method="get" role="search"><label><span>https://</span><input name="url" placeholder="yoursite.com" autocomplete="url" inputmode="url" spellcheck="false" autocapitalize="off" aria-label="Website address to scan" required></label><button class="btn" type="submit">Scan</button></form>
    ${actions({ open: ['Open the scanner', `${SCANNER}/`], self: `${P.scanner.repo}#run-your-own`, repo: P.scanner.repo })}`,
  })}
  ${card({
    color: 'g1', kick: 'Free tool', name: 'UI kit', page: '/kit/', badge: '',
    line: 'The building blocks of a website people can ask instead of scroll: answers that type themselves out, cards, tables and forms.',
    viz: '<div class="frame" data-w="900" data-h="458"><iframe src="/kit/stage/?c=streaming&amp;t=midnight&amp;loop=1" title="UI kit streaming answer, live" loading="lazy" tabindex="-1"></iframe></div>',
    acts: '<div class="acts"><a class="btn" href="/kit/">Browse the kit</a><a class="btn btn-self" href="/kit/streaming/">Copy a component</a></div>',
  })}
  </div>
</section>
</main>`,
  });
}
