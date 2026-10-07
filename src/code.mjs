// Code shown under the kit preview: indented HTML and JSON, with light highlighting. Build time only.

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const BLOCK = new Set(['div', 'ul', 'ol', 'li', 'details', 'summary', 'form', 'section', 'header', 'p', 'input', 'textarea', 'script', 'main', 'nav', 'button', 'img', 'a']);
const VOID = new Set(['input', 'img', 'br', 'hr', 'link', 'meta']);

// One-line markup from renderBlock, indented: block tags on their own lines, inline content kept together.
export function prettyHtml(html) {
  const toks = html.split(/(<[^>]+>)/).filter(Boolean);
  let out = '', depth = 0;
  const stack = [];
  for (const t of toks) {
    const m = t.match(/^<(\/?)([a-zA-Z0-9-]+)/);
    const name = m?.[2]?.toLowerCase();
    // an <a> or <button> inside running text stays inline
    const inlineHere = (name === 'a' || name === 'button') && stack.length && !stack[stack.length - 1].block && /\S/.test(out.slice(out.lastIndexOf('\n')));
    if (m && !m[1] && BLOCK.has(name) && !inlineHere) {
      if (stack.length) stack[stack.length - 1].block = true;
      out += '\n' + '  '.repeat(depth) + t;
      if (!VOID.has(name) && !t.endsWith('/>')) { stack.push({ name, block: false }); depth++; }
    } else if (m && m[1] && stack.length && stack[stack.length - 1].name === name) {
      depth--;
      const s = stack.pop();
      out += s.block ? '\n' + '  '.repeat(depth) + t : t;
    } else {
      if (m && !m[1] && stack.length && !VOID.has(name)) { /* inline open tag */ }
      out += t;
    }
  }
  return out.replace(/^\n/, '');
}

// JSON with short lists kept on one line.
export function prettyJson(v) {
  return JSON.stringify(v, null, 2).replace(/\[\s+([^\[\]{}]*?)\s+\]/g, (_, inner) => '[' + inner.split(/,\s*\n\s*/).join(', ') + ']');
}

function hlTag(t) {
  if (t.startsWith('<!--')) return `<span class="t-c">${esc(t)}</span>`;
  const m = t.match(/^<(\/?)([\w-]+)([\s\S]*?)(\/?)>$/);
  if (!m) return esc(t);
  const attrs = m[3].replace(/([^\s=]+)(?:="([^"]*)")?/g, (all, n, v) => `<span class="t-a">${esc(n)}</span>` + (v !== undefined ? `=<span class="t-s">"${esc(v)}"</span>` : ''));
  return `<span class="t-p">&lt;${m[1]}</span><span class="t-n">${m[2]}</span>${attrs}<span class="t-p">${m[4]}&gt;</span>`;
}
export function highlightHtml(src) {
  return src.split(/(<!--[\s\S]*?-->|<[^>]+>)/).map((t) => (t.startsWith('<') ? hlTag(t) : esc(t))).join('');
}
export function highlightJson(src) {
  return esc(src).replace(/(&quot;(?:[^&]|&(?!quot;))*?&quot;)(\s*:)?|\b(-?\d+(?:\.\d+)?)\b|\b(true|false|null)\b/g,
    (all, str, colon, num, lit) => str ? `<span class="${colon ? 't-a' : 't-s'}">${str}</span>${colon || ''}` : num ? `<span class="t-num">${num}</span>` : `<span class="t-n">${lit}</span>`);
}
export const highlight = (src, lang) => (lang === 'json' ? highlightJson(src) : highlightHtml(src));
