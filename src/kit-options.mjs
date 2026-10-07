// The kit page's look options, in one place. The toolbar and the preview are both drawn from this
// list. Since kit v2 they come from ui-design's own option list (src/tokens.mjs, synced into
// vendor/ui-design), so a new scheme or style value in the kit shows up here on the next sync.
//
// themes: one per colour scheme. The preview sets data-scheme on its <html> and loads src/tokens.css.
//         `href` adds a stylesheet on top (the Field theme is midnight plus field.css).
//         Every v2 scheme has a light and a dark mode, so it follows the site's light or dark setting.
// axes:   style switches set as data attributes on the preview's <html> (shape, density, type,
//         surface, motion). `default` is the value used until someone picks one.
// speeds: how fast streamed answers play, as a multiplier on the agent's own timing.
import { SCHEMES, AXES, PRESETS } from '../vendor/ui-design/src/tokens.mjs';

const look = PRESETS.midnight;
const AXIS_IDS = ['shape', 'density', 'type', 'surface', 'motion'];

export const OPTIONS = {
  defaultTheme: 'midnight',
  themes: [
    ...Object.entries(SCHEMES).map(([id, s]) => ({ id, label: s.label, scheme: id, modes: ['dark', 'light'], note: s.note.replace(/\s*The Agentic Intent look\./, '') })),
    { id: 'field', label: 'Field', scheme: 'midnight', href: '/ui/themes/field.css', modes: ['dark', 'light'], note: 'Midnight with a little game colour: the warOnSaaS fun theme.' },
  ],
  axes: AXIS_IDS.map((id) => ({
    id, attr: `data-${id}`, label: AXES[id].label, default: look[id],
    values: Object.entries(AXES[id].values).map(([v, d]) => [v, d.label]),
  })),
  defaultSpeed: '1',
  speeds: Object.values(AXES.speed.values).sort((a, b) => b.factor - a.factor).map((v) => [String(v.factor), v.label]),
};
