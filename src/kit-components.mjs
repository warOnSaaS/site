// Every component on the kit page. Each one is shown live in the preview with ui-design's own
// files: agent pieces run the real agent layout, blocks are drawn by ui-design's renderBlock
// (and played by the agent, so text streams and lists arrive item by item), page pieces are plain markup.
//
// kind: 'agent'  the agent layout. start: 'answer' plays question q at once, 'type' types it into
//                the chat box first, 'home' shows the opening screen, 'menu' opens the topics menu.
//       'block'  one or more blocks, with a variant switch: in an answer, or on a plain page.
//       'page'   plain markup with ui-design classes.

// The questions the agent pieces answer. All of it is true about warOnSaaS and the kit.
export const CONTENT = {
  site: { name: 'warOnSaaS', avatar: 'w' },
  home: {
    headline: 'Ask about warOnSaaS.',
    lede: 'A website you ask instead of scroll. Pick a question or type one.',
    placeholder: 'Ask anything',
  },
  featured: ['what', 'kit', 'kanban'],
  groups: [
    { name: 'Start here', ids: ['what', 'kit', 'kanban'] },
    { name: 'Using the kit', ids: ['install', 'themes', 'steps'] },
  ],
  questions: {
    what: {
      prompt: 'What is warOnSaaS?',
      blocks: [
        { t: 'step', text: 'Checking what is ready' },
        { t: 'text', text: 'warOnSaaS builds free, open-source replacements for software people rent by the month. You can use them, change them and run them yourself.' },
        { t: 'text', text: 'Two projects are ready today:' },
        { t: 'cards', items: [
          ['agent-kanban', 'ready', 'A shared to-do board for people and their AI agents. Tasks live as files in your own GitHub repo.'],
          ['UI kit', 'ready', 'The pieces this site is built from: answers that type themselves out, cards, tables, forms and themes.'],
        ] },
        { t: 'text', text: 'Both are plain files with no monthly fee. Leave any time and keep everything.' },
      ],
      next: ['kanban', 'kit'],
    },
    kit: {
      prompt: 'What is in the UI kit?',
      blocks: [
        { t: 'text', text: 'Everything a website needs to answer questions instead of making people scroll. Every page becomes a question, and its answer plays in place like a chat reply.' },
        { t: 'stats', items: [['14', 'block types'], ['3', 'themes here'], ['0', 'dependencies'], ['0', 'AI model calls']] },
        { t: 'text', text: 'Answers are written ahead of time, so a visit costs nothing to serve, and every answer is also in the page for search engines.' },
      ],
      next: ['install', 'themes'],
    },
    kanban: {
      prompt: 'How does agent-kanban work?',
      blocks: [
        { t: 'step', text: 'Opening the example board' },
        { t: 'text', text: 'Your team shares one board. Each person works it from the AI app they already use: Claude, ChatGPT, Claude Code or Codex.' },
        { t: 'rows', items: [['Tasks live as files in your GitHub repo', 'yours'], ['Hand-offs say what was done and what is next', 'hand-off'], ['Reviews open the actual work', 'review'], ['Everyone signs in with GitHub', 'no keys']] },
        { t: 'link', text: 'See the example board', href: '/agent-kanban/' },
      ],
      next: ['what', 'kit'],
    },
    install: {
      prompt: 'How do I use the kit?',
      blocks: [
        { t: 'text', text: 'Add two stylesheets, the base and a theme. Then write ordinary HTML with the kit classes.' },
        { t: 'tool', name: 'link', arg: 'ui.css + a theme', out: 'styled' },
        { t: 'text', text: 'For the ask-the-site layout, add one script and a content file with your questions and answers.' },
      ],
      next: ['themes', 'kit'],
    },
    themes: {
      prompt: 'How do I change the look?',
      blocks: [
        { t: 'text', text: 'Swap the theme file. The base has no colours or fonts of its own, so one file changes everything.' },
        { t: 'cards', items: [
          ['Midnight', 'dark', 'Near-black, rounded, a cool accent.'],
          ['Ops', 'dark', 'Monochrome, square, monospace.'],
          ['Field', 'light and dark', 'Midnight with a little game colour.'],
        ] },
      ],
      next: ['install', 'what'],
    },
    steps: {
      prompt: 'Show me steps and tools',
      blocks: [
        { t: 'text', text: 'Steps and tools make an answer read as work being done: a lookup, a check, a sum.' },
        { t: 'step', text: 'A step shows a spinner, then marks itself done' },
        { t: 'tool', name: 'search', arg: 'kit files', out: '11 found' },
        { t: 'tool', name: 'check', arg: 'links', out: 'all good' },
        { t: 'text', text: 'Then the answer carries on.' },
      ],
      next: ['kit', 'install'],
    },
  },
  fallback: { blocks: [{ t: 'text', text: 'I answer the questions in Topics. Pick one, or ask it another way.' }], next: ['what', 'kit'] },
};

const B = (fields) => fields; // block field table rows: [field, type, what]

export const COMPONENTS = [
  // ---- agent ----
  { id: 'streaming', group: 'Agent', name: 'Streaming answer', kind: 'agent', start: 'answer', q: 'what', live: true,
    blurb: 'A reply that types itself out, word by word, with steps, cards and follow-up questions.',
    fields: B([['prompt', 'text', 'The question, shown as the visitor\'s message'], ['blocks', 'list', 'What the answer holds, played in order'], ['next', 'list of ids', 'Follow-up questions offered at the end']]),
    notes: ['Text streams word by word with a cursor.', 'Lists arrive item by item.', 'Long answers play faster so none drags.', 'Every answer is also written into the page for search engines.'] },
  { id: 'chat-input', group: 'Agent', name: 'Chat input', kind: 'agent', start: 'type', q: 'kanban', live: true,
    blurb: 'The opening screen: a headline, suggested questions and a box to type in. It finds the closest answer.',
    fields: B([['home.headline', 'text', 'The big line on the opening screen'], ['featured', 'list of ids', 'Suggested questions above the box'], ['home.placeholder', 'text', 'Hint inside the box']]),
    notes: ['Type a question and press Enter.', 'It matches the closest prewritten question by shared words.', 'Optional live handlers can answer anything else.'] },
  { id: 'topics', group: 'Agent', name: 'Topics menu', kind: 'agent', start: 'menu', live: true,
    blurb: 'Every question, grouped. Opens from the Topics button or with Cmd K.',
    fields: B([['groups', 'list', 'Each group has a name and question ids']]),
    notes: ['Opens from the Topics button or Cmd K.', 'Escape closes it.'] },
  { id: 'steps', group: 'Agent', name: 'Steps and tools', kind: 'agent', start: 'answer', q: 'steps', live: true,
    blurb: 'Lines that show work happening: a spinner that ticks to done, a tool call that fills in its result.',
    fields: B([['step.text', 'text', 'What is happening'], ['tool.name', 'text', 'The tool, highlighted'], ['tool.arg', 'text', 'What it was given'], ['tool.out', 'text', 'The result, filled in after a pause']]),
    notes: ['In a plain page they show finished.'] },

  // ---- blocks ----
  { id: 'text', group: 'Blocks', name: 'Text', kind: 'block', live: true,
    blurb: 'A paragraph. In an answer it streams in word by word with a cursor.',
    blocks: [{ t: 'text', text: 'A text block streams in word by word, with a cursor at the end, the way a chat reply arrives.' }, { t: 'text', text: 'On a normal page it is simply a paragraph.' }],
    fields: B([['text', 'text', 'The paragraph']]) },
  { id: 'rows', group: 'Blocks', name: 'Rows', kind: 'block',
    blurb: 'Short facts, one per line, each with an optional tag.',
    blocks: [{ t: 'rows', items: [['Works without JavaScript', 'yes'], ['Dependencies', 'none'], ['Fonts bundled', '4'], ['Licence', 'Apache-2.0']] }],
    fields: B([['items', 'list of [text, tag]', 'The tag is optional']]) },
  { id: 'cards', group: 'Blocks', name: 'Cards', kind: 'block',
    blurb: 'A title, a tag and a line of text. Good for services, offers and steps.',
    blocks: [{ t: 'cards', items: [['Streaming answers', 'agent', 'Text arrives word by word, lists item by item.'], ['Plain HTML', 'page', 'Every block is a class on ordinary markup.'], ['Themes', 'css', 'Every colour and font is a setting you can change.']] }],
    fields: B([['items', 'list of [title, tag, text]', 'Tag and text are optional']]) },
  { id: 'accordion', group: 'Blocks', name: 'Accordion', kind: 'block',
    blurb: 'Questions that open one at a time. Works with no script at all.',
    blocks: [{ t: 'accordion', items: [['Does it need a framework?', 'no', 'No. Plain HTML, CSS and JavaScript.'], ['Does an AI model run?', 'no', 'No. Answers are written ahead of time, so a visit costs nothing to serve.'], ['Can search engines read it?', 'yes', 'Yes. Every answer is also written into the page.']] }],
    fields: B([['items', 'list of [title, tag, text]', 'Line breaks in the text are kept']]) },
  { id: 'stats', group: 'Blocks', name: 'Stats', kind: 'block',
    blurb: 'Big numbers with a label under each.',
    blocks: [{ t: 'stats', items: [['14', 'block types'], ['3', 'themes here'], ['0', 'dependencies'], ['0', 'model calls']] }],
    fields: B([['items', 'list of [value, label]', 'Values can be any text']]) },
  { id: 'calc', group: 'Blocks', name: 'Calculator', kind: 'block',
    blurb: 'Rows of figures with a total. For quotes and price breakdowns.',
    blocks: [{ t: 'calc', head: ['Item', 'Qty', 'Each', 'Line'], rows: [['Example line', '2', '40', '80'], ['Another line', '1', '25', '25']], total: ['Total', '', '', '105'] }],
    fields: B([['head', 'list', 'Column names'], ['rows', 'list of lists', 'One list per line'], ['total', 'list', 'The last line, highlighted']]) },
  { id: 'score', group: 'Blocks', name: 'Score', kind: 'block',
    blurb: 'A grade out of 100 with a bar per area. The bars fill as it arrives.',
    blocks: [{ t: 'score', title: 'SAMPLE SCORE', grade: 82, areas: [['Readable', 96], ['Fast', 78], ['Accessible', 61], ['Linked', 44]] }],
    fields: B([['grade', 'number', 'Out of 100'], ['title', 'text', 'Small heading'], ['areas', 'list of [label, number]', 'One bar each']]) },
  { id: 'table', group: 'Blocks', name: 'Table', kind: 'block',
    blurb: 'Three columns, paged, with search and filter chips.',
    blocks: [{ t: 'table', search: 'Search the kit files', page: 5, filterCol: 1, filters: [['', 'All'], ['base', 'Base'], ['theme', 'Themes'], ['layout', 'Layouts']], rows: [['src/ui.css', 'base', 'layout, components'], ['src/render.mjs', 'base', 'block to HTML'], ['src/ui.mjs', 'base', 'tables, forms'], ['themes/ops.css', 'theme', 'monochrome'], ['themes/midnight.css', 'theme', 'rounded, accent'], ['layouts/agent.mjs', 'layout', 'the agent'], ['layouts/boot.mjs', 'layout', 'safe start'], ['fonts/', 'base', '4 open fonts']] }],
    fields: B([['rows', 'list of [a, b, c]', 'All rows; the first page is real HTML'], ['page', 'number', 'Rows per page'], ['search', 'text', 'Search box hint'], ['filters', 'list of [value, label]', 'Chips that filter on filterCol']]) },
  { id: 'form', group: 'Blocks', name: 'Form', kind: 'block',
    blurb: 'Fields that send as JSON and show the reply in words. Carries a hidden spam trap.',
    blocks: [{ t: 'form', action: '/api/example', submit: 'Send', fields: [{ name: 'name', label: 'Name', required: true }, { name: 'email', label: 'Email', type: 'email', required: true }, { name: 'message', label: 'What would you build with it?', type: 'textarea' }] }],
    fields: B([['action', 'address', 'Where the JSON is sent'], ['fields', 'list', 'name, label, type, required'], ['submit', 'text', 'Button label']]),
    notes: ['Nothing is behind this example, so sending it says it did not send.'] },
  { id: 'gallery', group: 'Blocks', name: 'Gallery', kind: 'block',
    blurb: 'Linked cards with a picture on top. Each one lifts when you point at it.',
    blocks: [{ t: 'gallery', items: [['The demo site', 'docs', 'The kit, documenting itself.', '#', '/ui/img/preview-demo.png'], ['A plain page', 'no agent', 'Components on an ordinary page.', '#', '/ui/img/preview-page.png']] }],
    fields: B([['items', 'list of [title, tag, text, href, image]', 'Image is optional']]) },
  { id: 'ask', group: 'Blocks', name: 'Ask and link', kind: 'block',
    blurb: 'A link to another question, played in place, and a link to any address.',
    blocks: [{ t: 'ask', id: 'kit' }, { t: 'link', text: 'Open agent-kanban', href: '/agent-kanban/' }],
    fields: B([['ask.id', 'question id', 'Plays that question'], ['link.href', 'address', 'Goes anywhere'], ['link.text', 'text', 'The label']]) },

  // ---- page pieces ----
  { id: 'header', group: 'Page', name: 'Header', kind: 'page',
    blurb: 'The bar across the top: your name and logo, a link and one button.',
    html: `<header class="ui-top">
  <a class="ui-brand" href="#"><img src="/ui/logo.svg" alt="">Acme</a>
  <div class="ui-top-r"><a href="#">Sign in</a><a class="ui-btn" href="#">Get started</a></div>
</header>`, bare: true },
  { id: 'buttons', group: 'Page', name: 'Buttons', kind: 'page',
    blurb: 'The main button, the send button, and the soft links that ask a question.',
    html: `<div style="display:flex;flex-wrap:wrap;gap:12px;align-items:center">
  <a class="ui-btn" href="#">Get started</a>
  <button class="ui-send" aria-label="Send">↑</button>
  <a class="ui-ask" href="#">What does it cost? →</a>
</div>
<div class="ui-next">
  <p class="ui-next-k">Ask next</p>
  <div class="ui-next-l"><a href="#">How do I start?</a><a href="#">Who is it for?</a></div>
</div>` },
  { id: 'chips', group: 'Page', name: 'Tags and chips', kind: 'page',
    blurb: 'Tags label things in words. Chips filter, and suggested questions sit in a row.',
    html: `<p><span class="ui-tag">ready</span> <span class="ui-tag">new</span> <span class="ui-tag">2 left</span></p>
<div class="ui-chips">
  <button type="button" aria-pressed="true">All</button>
  <button type="button" aria-pressed="false">Base</button>
  <button type="button" aria-pressed="false">Themes</button>
</div>
<div class="ui-prompts" style="justify-content:flex-start">
  <a href="#">What is it?</a><a href="#">What does it cost?</a><a href="#">How do I start?</a>
</div>` },
  { id: 'inputs', group: 'Page', name: 'Inputs', kind: 'page',
    blurb: 'A plain text field, and the chat box with its Topics button and send button.',
    html: `<input class="ui-input" placeholder="Search">
<form class="ui-composer" onsubmit="return false">
  <button type="button" class="ui-topics">Topics</button>
  <input placeholder="Ask anything" aria-label="Ask anything">
  <button type="submit" class="ui-send" aria-label="Send">↑</button>
</form>` },
];

export const GROUPS = [...new Set(COMPONENTS.map((c) => c.group))];
