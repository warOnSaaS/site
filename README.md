# warOnSaaS site

The hub for warOnSaaS's open-source projects: **agent-kanban** and **the UI kit**.

- `/` home: each project with a live preview.
- `/kit/` the UI kit as a component library. Pick a component in the sidebar, watch it live in the preview (answers stream in), switch theme, copy the code. Every component has its own address, `/kit/<id>/`.
- `/agent-kanban/` what agent-kanban does, the example board live, and app tiles that connect to the public demo board (agent-kanban-demo.vercel.app, a `DEMO_BOARD=1` deploy of agent-kanban). Setup steps live in the agent-kanban README, not here.

## The UI kit

The kit is warOnSaaS/ui-design. Its files are not copied by hand: `scripts/sync-ui.mjs` copies them from a ui-design checkout into `vendor/ui-design/`, and the build serves them under `/ui/`. The preview runs on them unchanged (the agent layout, `renderBlock`, `enhance`, the themes and fonts).

```
node scripts/sync-ui.mjs [path-to-ui-design]   # default $UI_DESIGN_DIR, then ../waronsaas-ui-design
```

`vendor/` is git-ignored because ui-design's repo is private and this one is public. The build runs the sync itself when `vendor/` is missing, so a build needs a ui-design checkout next to this repo (or `UI_DESIGN_DIR`).

- `src/kit-components.mjs` every component in the library and the questions the agent pieces answer.
- `src/kit-options.mjs` the themes, style switches and speeds the toolbar offers. Add an entry and it shows up in the toolbar and the preview.
- `ui-themes/field.css` the Field theme, served next to ui-design's own themes.
- `src/stage.js` the live preview page (`/kit/stage/`), loaded in an iframe.

## wOS kit

`kit/wos.css` is the stylesheet agent-kanban uses. agent-kanban copies it with its own `scripts/sync-kit.mjs`, so this file stays its single source. It is served at `/wos.css` and styles the example board.

## Build and deploy

```
npm install     # agent-kanban from GitHub, for the example board
npm run build   # dist/
npx vercel@latest deploy --prod --yes
```

Vercel builds it remotely. `.vercelignore` (not `.gitignore`) decides what is uploaded, so the git-ignored `vendor/ui-design` goes up with the source and the build uses it: run the sync before deploying. Do not deploy prebuilt: a local `vercel build` wrote a routing config without the file handler and every page answered 404.

Rules: no em dashes (the build fails on one). Plain words.

Apache-2.0.
