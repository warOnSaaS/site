// The page shell every page shares: the wOS mark, three links, a light/dark switch, the footer.
import fs from 'node:fs';
import { esc } from './code.mjs';
export { esc };

export const SITE_URL = 'https://waronsaas.com';
export const SCANNER_URL = 'https://scanner.waronsaas.com';
export const CRM_URL = 'https://crm.waronsaas.com';
export const KANBAN_URL = 'https://kanban.waronsaas.com';
export const GITHUB = 'https://github.com/warOnSaaS';
export const ORG = { '@type': 'Organization', '@id': 'https://waronsaas.com/#org', name: 'warOnSaaS', url: 'https://waronsaas.com/', logo: 'https://waronsaas.com/favicon.svg', email: 'hello@waronsaas.com', sameAs: ['https://github.com/warOnSaaS'] };

// ui-design's pixel tank, inline so its flag can wave.
export function tank(cls = 'tank') {
  const svg = fs.readFileSync('vendor/ui-design/logo.svg', 'utf8')
    .replace(/<!--[\s\S]*?-->\s*/, '')
    .replace(/ width="\d+" height="\d+"/, '')
    .replace(/role="img" aria-label="[^"]*"/, 'aria-hidden="true" focusable="false"')
    .replace(/<rect x="4" y="0"/, '<rect class="flag" x="4" y="0"')
    .replace(/<rect x="4" y="2"/, '<rect class="flag flag-2" x="4" y="2"');
  return svg.replace('<svg ', `<svg class="${cls}" `).trim();
}

const SUN = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/></svg>';
const MOON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.6A8.2 8.2 0 0 1 9.4 4a8.2 8.2 0 1 0 10.6 10.6z"/></svg>';

// title: under 65 characters. description: 70 to 150 characters (the build checks both).
// og: the social card image, /og/<name>.png, drawn by scripts/og.mjs. jsonld: structured data objects.
export function layout({ title, description, current, body, path = '/', page = '', head = '', scripts = '', og = 'home', jsonld = [] }) {
  const url = SITE_URL + path;
  const img = `${SITE_URL}/og/${og}.png`;
  const ld = jsonld.length ? `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': jsonld }).replace(/</g, '\\u003c')}</script>\n` : '';
  const link = (href, label, key) => `<a href="${href}"${current === key ? ' aria-current="page"' : ''}>${label}</a>`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website"><meta property="og:site_name" content="warOnSaaS"><meta property="og:url" content="${url}">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${img}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="${esc(title)}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(description)}"><meta name="twitter:image" content="${img}">
${ld}
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/ui/fonts/geist.woff2" as="font" type="font/woff2" crossorigin>
<script>try{var t=localStorage.getItem('wos-theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}</script>
<link rel="stylesheet" href="${ASSET('site.css')}">
${head}
</head>
<body class="${page}">
<header class="top"><div class="top-in">
  <a class="brand" href="/" aria-label="warOnSaaS home">${tank()}<span>wOS</span></a>
  <nav class="nav" aria-label="Main">${link('/agent-kanban/', 'agent-kanban', 'agent-kanban')}${link('/crm/', 'CRM', 'crm')}${link('/scanner/', 'Scanner', 'scanner')}${link('/kit/', 'UI kit', 'kit')}<a href="${GITHUB}" class="nav-gh">GitHub</a>
    <button class="mode" type="button" data-mode-toggle aria-label="Switch light or dark">${SUN}${MOON}</button>
  </nav>
</div></header>
${body}
${page === 'is-kit' ? '' : `<footer class="foot"><div class="foot-in">
  <span class="foot-l">${tank('tank tank-sm')}warOnSaaS. Free and open source.</span>
  <nav class="foot-links" aria-label="Projects"><a href="/agent-kanban/">agent-kanban</a><a href="/crm/">CRM</a><a href="/scanner/">Scanner</a><a href="/kit/">UI kit</a><a href="/llms.txt">llms.txt</a><a href="${GITHUB}">GitHub</a><a href="mailto:hello@waronsaas.com">hello@waronsaas.com</a></nav>
  <span class="foot-r">No subscriptions were renewed in the making of this site.</span>
</div></footer>`}
<script src="${ASSET('site.js')}" defer></script>
${scripts}
</body></html>
`;
}

// Fingerprinted asset paths, filled in by build.mjs so a new deploy never shows a cached old file.
export const HASHES = {};
export const ASSET = (name) => HASHES[name] || '/' + name;
