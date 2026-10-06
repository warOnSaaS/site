// Builds waronsaas.com into dist/: a home page, the wOS UI kit, and agent-kanban.
// Plain HTML from template functions. The only stylesheet is kit/wos.css.
import fs from 'node:fs';
import path from 'node:path';
import { kitPage } from './src/kit.mjs';
import { agentKanbanPage } from './src/agent-kanban.mjs';
import { homePage } from './src/home.mjs';

const out = 'dist';
fs.rmSync(out, { recursive: true, force: true });
const write = (p, html) => {
  fs.mkdirSync(path.dirname(path.join(out, p)), { recursive: true });
  fs.writeFileSync(path.join(out, p), html);
};

write('wos.css', fs.readFileSync('kit/wos.css', 'utf8'));
write('index.html', homePage());
write('kit/index.html', kitPage());
write('agent-kanban/index.html', await agentKanbanPage());
write('robots.txt', 'User-agent: *\nAllow: /\n');
write('favicon.svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#0b0b0b"/><text x="32" y="42" text-anchor="middle" font-family="ui-monospace,Menlo,monospace" font-weight="700" font-size="24" fill="#ededea">wOS</text></svg>');
console.log(`built ${fs.readdirSync(out, { recursive: true }).length} files into ${out}/`);
