// The page shell every page shares: the wOS mark, three links, a light/dark switch, the footer.
import fs from 'node:fs';
import { esc } from './code.mjs';
export { esc };

export const SITE_URL = 'https://waronsaas.com';
export const SCANNER_URL = 'https://scanner.waronsaas.com';
export const CRM_URL = 'https://crm.waronsaas.com';
export const GITHUB = 'https://github.com/warOnSaaS';

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

export function layout({ title, description, current, body, path = '/', page = '', head = '', scripts = '' }) {
  const url = SITE_URL + path;
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
<meta name="twitter:card" content="summary"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(description)}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/ui/fonts/geist.woff2" as="font" type="font/woff2" crossorigin>
<script>try{var t=localStorage.getItem('wos-theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}</script>
<link rel="stylesheet" href="${ASSET('site.css')}">
${head}
</head>
<body class="${page}">
<header class="top"><div class="top-in">
  <a class="brand" href="/" aria-label="warOnSaaS home">${tank()}<span>wOS</span></a>
  <nav class="nav" aria-label="Main">${link('/kit/', 'UI kit', 'kit')}${link('/agent-kanban/', 'agent-kanban', 'agent-kanban')}<a href="${SCANNER_URL}/">Scanner</a><a href="${GITHUB}" class="nav-gh">GitHub</a>
    <button class="mode" type="button" data-mode-toggle aria-label="Switch light or dark">${SUN}${MOON}</button>
  </nav>
</div></header>
${body}
${page === 'is-kit' ? '' : `<footer class="foot"><div class="foot-in">
  <span class="foot-l">${tank('tank tank-sm')}warOnSaaS. Free and open source.</span>
  <span class="foot-r">No subscriptions were renewed in the making of this site. <a href="${GITHUB}">github.com/warOnSaaS</a></span>
</div></footer>`}
<script src="${ASSET('site.js')}" defer></script>
${scripts}
</body></html>
`;
}

// Fingerprinted asset paths, filled in by build.mjs so a new deploy never shows a cached old file.
export const HASHES = {};
export const ASSET = (name) => HASHES[name] || '/' + name;
