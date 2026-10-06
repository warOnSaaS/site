// The page shell every page shares: wOS mark, three links, footer.

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export function layout({ title, description, current, body }) {
  const link = (href, label, key) => `<a href="${href}"${current === key ? ' aria-current="page"' : ''}>${label}</a>`;
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@700&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/wos.css">
</head><body>
<header class="header"><div class="wrap">
  <a class="mark" href="/" aria-label="warOnSaaS home">wOS</a>
  <nav class="nav" aria-label="Main">${link('/kit/', 'UI KIT', 'kit')}${link('/agent-kanban/', 'AGENT-KANBAN', 'agent-kanban')}<a href="https://github.com/warOnSaaS">GITHUB</a></nav>
</div></header>
<main class="wrap">${body}</main>
<footer class="footer"><div class="wrap row" style="justify-content:space-between">
  <span>warOnSaaS. Open source.</span><span><a href="https://github.com/warOnSaaS">github.com/warOnSaaS</a></span>
</div></footer>
</body></html>
`;
}

// A component sample on the kit page: the live render, then its markup.
export function sample(name, html, { note } = {}) {
  return `<div class="stack" style="margin-bottom:var(--s7)">
  <div class="row" style="justify-content:space-between"><span class="label">${esc(name)}</span>${note ? `<span class="small dim">${esc(note)}</span>` : ''}</div>
  <div class="panel">${html}</div>
  <pre class="code"><code>${esc(html.trim())}</code></pre>
</div>`;
}
