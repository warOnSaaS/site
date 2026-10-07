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
fs.cpSync('ui-themes', path.join(out, 'ui', 'themes'), { recursive: true });

const { homePage } = await import('./src/home.mjs');
const { kitPage, stagePage, KIT_IDS } = await import('./src/kit.mjs');
const { agentKanbanPage, boardPage } = await import('./src/agent-kanban.mjs');

write('wos.css', fs.readFileSync('kit/wos.css', 'utf8'));
write('index.html', homePage());
write('kit/index.html', kitPage(KIT_IDS[0]));
for (const id of KIT_IDS) write(`kit/${id}/index.html`, kitPage(id));
write('kit/stage/index.html', stagePage());
write('agent-kanban/index.html', agentKanbanPage());
write('agent-kanban/board/index.html', await boardPage());
write('robots.txt', 'User-agent: *\nAllow: /\nDisallow: /kit/stage/\n');
write('favicon.svg', fs.readFileSync('vendor/ui-design/logo.svg', 'utf8'));

// No em dashes anywhere in what ships.
const files = fs.readdirSync(out, { recursive: true }).map(String).filter((f) => /\.(html|css|js|mjs|txt|json|svg)$/.test(f));
const dashed = files.filter((f) => fs.readFileSync(path.join(out, f), 'utf8').includes('\u2014'));
if (dashed.length) { console.error('em dash found in: ' + dashed.join(', ')); process.exit(1); }
console.log(`built ${fs.readdirSync(out, { recursive: true }).length} files into ${out}/ (${KIT_IDS.length} kit components)`);
