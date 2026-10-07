// The kit page's look options, in one place. The toolbar and the preview are both drawn from this
// list, so new themes or style axes from ui-design drop in by adding entries here.
//
// themes: one stylesheet each, served from /ui/. `modes` lists the light/dark modes the theme has;
//         a theme with both follows the site's light or dark setting.
// axes:   optional style switches set as data attributes on the preview's <html>
//         (for example { id: 'shape', attr: 'data-shape', label: 'Shape', values: [['square','Square'],['round','Round']] }).
//         None ship in ui-design main yet.
// speeds: how fast streamed answers play, as a multiplier on the agent's own timing.

export const OPTIONS = {
  defaultTheme: 'midnight',
  themes: [
    { id: 'midnight', label: 'Midnight', href: '/ui/themes/midnight.css', modes: ['dark'], note: 'Near-black, rounded, a cool accent.' },
    { id: 'ops', label: 'Ops', href: '/ui/themes/ops.css', modes: ['dark'], note: 'Monochrome, square, monospace.' },
    { id: 'field', label: 'Field', href: '/ui/themes/field.css', modes: ['dark', 'light'], note: 'Midnight with a little game colour. Light and dark.' },
  ],
  axes: [],
  defaultSpeed: '1',
  speeds: [['2', 'Slow'], ['1', 'Normal'], ['0.45', 'Fast']],
};
