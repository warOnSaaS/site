// Builds the warOnSaaS site into dist/: the home page, the UI kit (a component library with a live
// preview), agent-kanban, and the files they run on.
//   /ui/        ui-design's own files (synced into vendor/ui-design by scripts/sync-ui.mjs) plus the Field theme
//   /wos.css    the wOS kit agent-kanban uses, kept here as its source of truth
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

if (!fs.existsSync('vendor/ui-design/src/ui.css')) execFileSync(process.execPath, ['scripts/sync-ui.mjs'], { stdio: 'inherit' });

const { HASHES } = await import('./src/layout.mjs');
const out = 'dist';
fs.rmSync(out, { recursive: true, force: true });
const write = (p, s) => {
  fs.mkdirSync(path.dirname(path.join(out, p)), { recursive: true });
  fs.writeFileSync(path.join(out, p), s);
};

// fingerprinted assets: a new deploy never meets a cached old copy
for (const [name, src] of [['site.css', 'src/site.css'], ['site.js', 'src/site.js'], ['kit.js', 'src/kit-client.js'], ['kit/stage.js', 'src/stage.js']]) {
  const body = fs.readFileSync(src);
  const h = crypto.createHash('sha256').update(body).digest('hex').slice(0, 10);
  const file = `assets/${name.replace(/\//g, '-').replace(/\.(\w+)$/, `.${h}.$1`)}`;
  write(file, body);
  HASHES[name] = '/' + file;
}

// ui-design, served as its own build serves it
fs.cpSync('vendor/ui-design', path.join(out, 'ui'), { recursive: true });
fs.rmSync(path.join(out, 'ui', 'SYNCED.json'));
fs.rmSync(path.join(out, 'ui', 'src', 'tokens.mjs'), { force: true }); // read at build time only
fs.cpSync('ui-themes', path.join(out, 'ui', 'themes'), { recursive: true });

const { homePage } = await import('./src/home.mjs');
const { kitPage, stagePage, KIT_IDS, kitData } = await import('./src/kit.mjs');
const { agentKanbanPage, boardPage } = await import('./src/agent-kanban.mjs');
const { crmPage, scannerPage } = await import('./src/project-pages.mjs');
const { PROJECTS, repoStatus, isPublic } = await import('./src/projects.mjs');
const { appPage, APPS } = await import('./src/app-pages.mjs');

// the kit's component data, one fingerprinted file the kit page fetches
{
  const body = kitData();
  const file = `assets/kit-data.${crypto.createHash('sha256').update(body).digest('hex').slice(0, 10)}.json`;
  write(file, body);
  HASHES['kit-data.json'] = '/' + file;
}

// Which repos are public, so no page links to a 404.
const repos = await repoStatus();
// Decks and Sheets are being built. They get a link only once their site answers.
const upcoming = {};
for (const key of ['decks', 'sheets']) {
  const url = `https://${key}.waronsaas.com/`;
  const live = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(8000) }).then((r) => r.status === 200).catch(() => false);
  const repo = `https://github.com/warOnSaaS/${key}`;
  upcoming[key] = { url, live, repo, repoPublic: live && await isPublic(repo) };
}
console.log('upcoming: ' + Object.entries(upcoming).map(([k, v]) => `${k} ${v.live ? 'live' : 'building'}`).join(', '));
console.log('public repos: ' + Object.entries(repos).map(([k, v]) => `${k} ${v ? 'yes' : 'no'}`).join(', '));

// Social cards: redraw any whose words changed when Playwright is here (never on Vercel), then ship og/.
if (!process.env.VERCEL) {
  const { drawCards } = await import('./scripts/og.mjs');
  const drawn = await drawCards();
  if (drawn === null) console.warn('og: Playwright not found, using the committed cards');
  else if (drawn.length) console.log(`og: drew ${drawn.join(', ')} (commit og/)`);
}
fs.cpSync('og', path.join(out, 'og'), { recursive: true, filter: (f) => !f.endsWith('manifest.json') });
fs.cpSync('img', path.join(out, 'img'), { recursive: true });

write('wos.css', fs.readFileSync('kit/wos.css', 'utf8'));
write('index.html', homePage({ repos, upcoming }));
for (const id of Object.keys(APPS)) write(`${id}/index.html`, appPage(id, repos));
write('crm/index.html', crmPage({ repoPublic: repos.crm }));
write('scanner/index.html', scannerPage({ repoPublic: repos.scanner }));
write('kit/index.html', kitPage(KIT_IDS[0]));
for (const id of KIT_IDS) write(`kit/${id}/index.html`, kitPage(id));
write('kit/stage/index.html', stagePage());
write('agent-kanban/index.html', agentKanbanPage());
write('agent-kanban/board/index.html', await boardPage());
const { SITE_URL, SCANNER_URL, GITHUB } = await import('./src/layout.mjs');
write('robots.txt', `User-agent: *\nAllow: /\nDisallow: /kit/stage/\nDisallow: /agent-kanban/board/\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
const PAGES = ['/', '/suite/', '/crm/', '/email/', '/chat/', '/meet/', '/agent-kanban/', '/scanner/', ...KIT_IDS.map((id) => `/kit/${id}/`)];
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${PAGES.map((p) => `  <url><loc>${SITE_URL}${p}</loc></url>`).join('\n')}\n</urlset>\n`);
const P = PROJECTS;
const line = (id, extra) => `- [${P[id].name}](${SITE_URL}${P[id].path}): ${P[id].about} ${P[id].license}. ${extra}${repos[id] ? ` Source: ${P[id].repo}` : ' Source opens on GitHub soon.'}`;
write('llms.txt', `# warOnSaaS

> warOnSaaS builds wOS: free, open-source software that replaces the apps a business rents by the month, in one app a team and its AI agents both work in. Every app can be self-hosted for free, or hosted by us at cost plus a fair margin, shown openly. AI agents can drive every app over MCP (at /mcp on any install), with the same tools the screens use.

## wOS, the suite

${line('suite', `Live demo: ${P.suite.live}.`)}

## The apps

${line('crm', `Replaces Salesforce. Live demo with fictional data: ${P.crm.demo}.`)}
${line('email', `Replaces Gmail and Superhuman. Live demo with a made-up mailbox: ${P.email.live}.`)}
${line('chat', `Replaces Slack. Live demo, a fictional dental practice: ${P.chat.live}.`)}
${line('meet', `Replaces Zoom. Calls of up to 4 people need no server for media. Live: ${P.meet.live}.`)}
${line('agent-kanban', `Replaces Trello and Asana for people plus agents. Create a hosted board: ${P['agent-kanban'].hosted}.`)}
${['decks', 'sheets'].map((k) => `- ${k === 'decks' ? 'Decks (replaces PowerPoint and Google Slides)' : 'Sheets (replaces Excel and Google Sheets)'}: ${upcoming[k].live ? `live at ${upcoming[k].url}` : 'being built now'}.`).join('\n')}

## Free tools

${line('scanner', `Use it: ${P.scanner.hosted}. MCP: ${P.scanner.hosted}mcp. Command line: npx -y github:warOnSaaS/scanner example.com.`)}
- [UI kit](${SITE_URL}/kit/): ${P.kit.about} ${P.kit.license}. Every component has its own page, /kit/<id>/.

## Contact

- GitHub: ${GITHUB}
- Email: hello@waronsaas.com
`);
write('favicon.svg', fs.readFileSync('vendor/ui-design/logo.svg', 'utf8'));

// No em dashes anywhere in what ships.
const files = fs.readdirSync(out, { recursive: true }).map(String).filter((f) => /\.(html|css|js|mjs|txt|json|svg)$/.test(f));
const dashed = files.filter((f) => fs.readFileSync(path.join(out, f), 'utf8').includes('\u2014'));
if (dashed.length) { console.error('em dash found in: ' + dashed.join(', ')); process.exit(1); }
// Every page: a title search shows whole (65 characters at most), a description of 150 at most, a social card.
const htmlPages = files.filter((f) => f.endsWith('index.html') && !/^(kit\/stage|agent-kanban\/board)\//.test(f));
const bad = [];
for (const f of htmlPages) {
  const h = fs.readFileSync(path.join(out, f), 'utf8');
  const dec = (x) => x.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
  const t = dec((h.match(/<title>([^<]*)<\/title>/) || [])[1] || '');
  const d = dec((h.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '');
  const og = (h.match(/property="og:image" content="[^"]*\/og\/([\w-]+)\.png"/) || [])[1];
  if (t.length < 20 || t.length > 65) bad.push(`${f}: title is ${t.length} characters`);
  if (d.length < 70 || d.length > 150) bad.push(`${f}: description is ${d.length} characters`);
  if (!og || !fs.existsSync(path.join(out, 'og', og + '.png'))) bad.push(`${f}: no social card image`);
  for (const b of h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) { try { JSON.parse(b[1]); } catch { bad.push(`${f}: structured data does not parse`); } }
}
// Private names never ship. The list lives in the git-ignored .names file, one per line.
if (fs.existsSync('.names')) {
  const names = fs.readFileSync('.names', 'utf8').split('\n').map((x) => x.trim()).filter((x) => x && !x.startsWith('#'));
  for (const f of files) { const body = fs.readFileSync(path.join(out, f), 'utf8').toLowerCase(); for (const n of names) if (body.includes(n.toLowerCase())) bad.push(`${f}: private name "${n}"`); }
}
// The Content-Security-Policy in vercel.json allows inline scripts by their hash only. Every inline
// script that ships must be listed there; `CSP_WRITE=1 npm run build` rewrites the list.
{
  const hashes = new Set();
  for (const f of files.filter((x) => x.endsWith('.html'))) {
    for (const m of fs.readFileSync(path.join(out, f), 'utf8').matchAll(/<script(?![^>]*\bsrc=)(?![^>]*type="application\/(?:ld\+)?json")[^>]*>([\s\S]*?)<\/script>/g)) {
      if (m[1].trim()) hashes.add(`'sha256-${crypto.createHash('sha256').update(m[1]).digest('base64')}'`);
    }
  }
  const vj = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
  const h = vj.headers.find((x) => x.source === '/(.*)').headers.find((x) => x.key === 'Content-Security-Policy');
  const listed = new Set((h?.value.match(/'sha256-[^']+'/g)) || []);
  const missing = [...hashes].filter((x) => !listed.has(x));
  if (process.env.CSP_WRITE && h) {
    h.value = h.value.replace(/script-src [^;]*/, `script-src 'self' ${[...hashes].sort().join(' ')}`);
    fs.writeFileSync('vercel.json', JSON.stringify(vj, null, 2) + '\n');
    console.log(`csp: ${hashes.size} inline script hashes written to vercel.json`);
  } else if (!h || missing.length) bad.push(`vercel.json Content-Security-Policy is missing ${missing.length} inline script hash(es); run CSP_WRITE=1 npm run build`);
}
if (bad.length) { console.error(bad.join('\n')); process.exit(1); }
console.log(`built ${fs.readdirSync(out, { recursive: true }).length} files into ${out}/ (${KIT_IDS.length} kit components)`);
