# warOnSaaS site

The source of waronsaas.com, and the home of the **wOS UI kit**.

- `kit/wos.css`: the UI kit. One stylesheet, plain HTML classes, no build step. Every component is shown at `/kit/`.
- `src/`: the pages, as plain template functions. `build.mjs` writes `dist/`.
- `/agent-kanban/` renders the example board with agent-kanban's own renderer and example workspace.

```
npm install     # pulls agent-kanban from GitHub for the example board
npm run build   # dist/
```

Projects that use the kit (agent-kanban) copy `kit/wos.css` in with their own sync script, so this file is the single source.

Rules: monochrome, two monospace faces (JetBrains Mono, Geist Mono), square corners, no colour, no italic, no text-transform. Capitals are written in the source so warOnSaaS and wOS are never re-cased. No em dashes.

Apache-2.0.
