// Copies the ui-design kit (warOnSaaS/ui-design, the source of truth) into vendor/ui-design/.
// The kit page and its live preview run on these files unchanged.
// Usage: node scripts/sync-ui.mjs [path-to-ui-design]   (default $UI_DESIGN_DIR, then ../waronsaas-ui-design)
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
const FILES = [
  'src/ui.css', 'src/render.mjs', 'src/ui.mjs',
  'layouts/agent.mjs', 'layouts/boot.mjs',
  'themes/ops.css', 'themes/midnight.css',
  'LICENSE', 'NOTICE',
  ...fs.readdirSync(path.join(src, 'fonts')).map((f) => `fonts/${f}`),
];
const EXTRA = [['www/logo.svg', 'logo.svg'], ['www/preview-demo.png', 'img/preview-demo.png'], ['www/preview-page.png', 'img/preview-page.png']];

fs.rmSync(out, { recursive: true, force: true });
for (const [from, to] of [...FILES.map((f) => [f, f]), ...EXTRA]) {
  fs.mkdirSync(path.dirname(path.join(out, to)), { recursive: true });
  fs.copyFileSync(path.join(src, from), path.join(out, to));
}
let commit = 'unknown';
try { commit = execSync('git rev-parse --short HEAD', { cwd: src }).toString().trim(); } catch {}
fs.writeFileSync(path.join(out, 'SYNCED.json'), JSON.stringify({ from: 'warOnSaaS/ui-design', commit, files: FILES.length + EXTRA.length }, null, 2) + '\n');
console.log(`synced ui-design ${commit} (${FILES.length + EXTRA.length} files) into vendor/ui-design`);
