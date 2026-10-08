# warOnSaaS site

The home of wOS and its apps. The home page leads with **wOS**, the suite, then the apps in the order a business buyer cares about (CRM, Email, Chat, Meetings, Board, then Decks and Sheets while they are built), why it is different, and the free tools (**Scanner**, **UI kit**). Every product card names what it replaces and has three actions: open it, Host it yourself, free (same weight), and GitHub.

- `/` home. Decks and Sheets show "Building now" until decks.waronsaas.com and sheets.waronsaas.com answer 200 at build time.
- `/suite/`, `/chat/`, `/email/`, `/meet/` (`src/app-pages.mjs`): what it does, a real screenshot of the live site in both themes, how agents drive it over MCP, what self-hosting needs (from each README), and the limits.
- `/kit/` the UI kit as a component library. Pick a component in the sidebar, watch it live in the preview (answers stream in), switch theme, copy the code. Every component has its own address, `/kit/<id>/`.
- `/crm/` the CRM: what it does, a picture of the live demo (crm.waronsaas.com refuses to be framed), Salesforce import, agents, and "Try the demo" beside "Host it yourself, free".
- `/scanner/` the Scanner: a scan box, the live scan from scanner.waronsaas.com/embed, the MCP and command line, and the repo.
- `/agent-kanban/` what agent-kanban does, the example board live, and the two ways to run it: Create your board (the hosted agent-kanban) or Host it yourself, free (the agent-kanban README). The app tiles live on each team's own board, not here.

## The UI kit

The kit is warOnSaaS/ui-design. Its files are not copied by hand: `scripts/sync-ui.mjs` copies them from a ui-design checkout into `vendor/ui-design/`, and the build serves them under `/ui/`. The preview runs on them unchanged (the agent layout, `renderBlock`, `enhance`, the themes and fonts).

```
node scripts/sync-ui.mjs [path-to-ui-design]   # default $UI_DESIGN_DIR, then ../waronsaas-ui-design
```

The sync reads ui-design's `main` branch through git (`UI_DESIGN_REF` to change it), so work in progress in that checkout never ships.

`vendor/` is git-ignored because ui-design's repo is private and this one is public. The build runs the sync itself when `vendor/` is missing, so a build needs a ui-design checkout next to this repo (or `UI_DESIGN_DIR`).

- `src/kit-components.mjs` every component in the library and the questions the agent pieces answer.
- `src/kit-options.mjs` the schemes, style switches and speeds the toolbar offers, read from ui-design's own `src/tokens.mjs` (kit v2), so a new scheme or value shows up on the next sync. Field is the one extra: midnight plus `ui-themes/field.css`.
- `ui-themes/field.css` the Field theme, served next to ui-design's own themes.
- `src/stage.js` the live preview page (`/kit/stage/`), loaded in an iframe.

## Projects, SEO and social cards

- `src/projects.mjs` every project in one list: the home cards, pages, `llms.txt`, the sitemap and the structured data read from it. The build asks GitHub whether each repo is public, so no page links to a 404 (the CRM's self-host link points at the steps on `/crm/` until its repo is public; the suite link appears once `warOnSaaS/suite` is public).
- `scripts/og.mjs` draws the 1200x630 social cards from one HTML template with Playwright into `og/`, which is committed because Vercel's build has no browser. A local build redraws any card whose words changed (Playwright from `PLAYWRIGHT_PATH`, `node_modules` or `~/crm/node_modules`). `node scripts/og.mjs --all` redraws all.
- `img/` screenshots used on the pages, as WebP. `<name>-light.webp` and `<name>-dark.webp` are Playwright shots of the live sites at 1440x900; `themedShot()` shows the one that matches the theme, and the other is never fetched.
- The header has one Products menu (a `<details>`, no script); the menu and the footer both read `MENU` in `src/layout.mjs`.
- The build fails when a page's title is over 65 characters, its description is not 70 to 150, it has no social card, its structured data does not parse, or a name from the git-ignored `.names` file appears in what ships.
- `vercel.json` sends a Content-Security-Policy that allows inline scripts by hash only. When an inline script changes, the build fails and says so; `CSP_WRITE=1 npm run build` rewrites the hashes.
- Score pages with the scanner: `npx -y github:warOnSaaS/scanner waronsaas.com` scores the home page only, so score other pages by pointing its home request at them (see the scanner's library `scan(host, { fetchImpl })`).

## Redirects

The old wOS site lives at protocol.waronsaas.com. `/whitepaper`, `/whitepaper.md`, every `/whitepaper/<path>` and `/log` redirect there. `trailingSlash: true` adds a slash first, so each rule has a form with and without one.

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
