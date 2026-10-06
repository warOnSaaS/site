import { layout } from './layout.mjs';

export function homePage() {
  return layout({
    title: 'warOnSaaS',
    description: 'warOnSaaS builds open-source replacements for rented software.',
    body: `
<section style="padding:var(--s8) 0 var(--s7)">
  <p class="label">PROJECTS</p>
  <h1>Open-source replacements for rented software.</h1>
  <p class="lead">Two things are ready to look at.</p>
</section>
<section class="section">
  <div class="table-wrap"><table class="table">
    <thead><tr><th>PROJECT</th><th>WHAT IT IS</th><th>STATUS</th><th></th></tr></thead>
    <tbody>
      <tr><td class="nowrap"><b>AGENT-KANBAN</b></td><td>A shared kanban for people and their AI agents. Tasks, hand-offs and reviews in a GitHub repo, worked from Claude, ChatGPT, Claude Code or Codex.</td><td><span class="status">WORKING</span></td><td><a href="/agent-kanban/">OPEN</a></td></tr>
      <tr><td class="nowrap"><b>UI KIT</b></td><td>Every component of the warOnSaaS interface on one page. One stylesheet, plain HTML.</td><td><span class="status">WORKING</span></td><td><a href="/kit/">OPEN</a></td></tr>
    </tbody>
  </table></div>
</section>`,
  });
}
