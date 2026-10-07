// Copies the ui-design kit (warOnSaaS/ui-design, the source of truth) into vendor/ui-design/.
// The kit page and its live preview run on these files unchanged.
// Usage: node scripts/sync-ui.mjs [path-to-ui-design]   (default $UI_DESIGN_DIR, then ../waronsaas-ui-design)
// It reads the kit's main branch through git (UI_DESIGN_REF to change it), so unfinished work in that
// checkout never ships. Without git it copies the files as they are.
// vendor/ is git-ignored on purpose: the ui-design repo is private, this one is public.
// The built site still serves the files it needs under /ui/, the same as ui-design's own site does.
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const src = path.resolve(process.argv[2] ?? process.env.UI_DESIGN_DIR ?? path.join('..', 'waronsaas-ui-design'));
const out = path.resolve('vendor', 'ui-design');
if (!fs.existsSync(path.join(src, 'src', 'ui.css'))) {
  console.error(`sync-ui: no ui-design checkout at ${src}. Pass its path or set UI_DESIGN_DIR.`);
  process.exit(1);
}
const REF = process.env.UI_DESIGN_REF || 'main';
let useGit = false;
try { execSync(`git rev-parse --verify ${REF}`, { cwd: src, stdio: 'ignore' }); useGit = true; } catch {}
const listFonts = () => useGit
  ? execSync(`git ls-tree --name-only ${REF} fonts/`, { cwd: src }).toString().trim().split('\n').map((f) => f.replace(/^fonts\//, ''))
  : fs.readdirSync(path.join(src, 'fonts'));
const read = (f) => useGit ? execSync(`git show ${REF}:${f}`, { cwd: src, maxBuffer: 64 << 20 }) : fs.readFileSync(path.join(src, f));
const FILES = [
  'src/ui.css', 'src/render.mjs', 'src/ui.mjs',
  'layouts/agent.mjs', 'layouts/boot.mjs',
  'src/tokens.css', 'src/tokens.mjs', 'src/noscript.css', 'themes/ops.css', 'themes/midnight.css',
  'LICENSE', 'NOTICE',
  ...listFonts().map((f) => `fonts/${f}`),
];
const EXTRA = [['www/logo.svg', 'logo.svg'], ['www/preview-demo.png', 'img/preview-demo.png'], ['www/preview-page.png', 'img/preview-page.png']];

fs.rmSync(out, { recursive: true, force: true });
for (const [from, to] of [...FILES.map((f) => [f, f]), ...EXTRA]) {
  fs.mkdirSync(path.dirname(path.join(out, to)), { recursive: true });
  fs.writeFileSync(path.join(out, to), read(from));
}
let commit = 'unknown';
try { commit = execSync(`git rev-parse --short ${useGit ? REF : 'HEAD'}`, { cwd: src }).toString().trim(); } catch {}
fs.writeFileSync(path.join(out, 'SYNCED.json'), JSON.stringify({ from: 'warOnSaaS/ui-design', commit, files: FILES.length + EXTRA.length }, null, 2) + '\n');
console.log(`synced ui-design ${commit} (${FILES.length + EXTRA.length} files) into vendor/ui-design`);
