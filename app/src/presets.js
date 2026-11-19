// Templates and colour grades for the Neon Bay cover maker.
// A template is a set of panels in fractions of the cover (x, y, w, h).
// A grade is a set of overlay tints painted over every photo panel.
export const TEMPLATES = [
  {
    id: 'trio', name: 'Vice Trio', hint: '1 hero + 2 stacked',
    panels: [
      { x: 0.00, y: 0.00, w: 0.615, h: 1.00 },
      { x: 0.635, y: 0.00, w: 0.365, h: 0.49 },
      { x: 0.635, y: 0.51, w: 0.365, h: 0.49 },
    ],
  },
  {
    id: 'comic', name: 'Comic Six', hint: '3 x 2 grid',
    panels: [
      { x: 0.00, y: 0.00, w: 0.32, h: 0.49 }, { x: 0.34, y: 0.00, w: 0.32, h: 0.49 }, { x: 0.68, y: 0.00, w: 0.32, h: 0.49 },
      { x: 0.00, y: 0.51, w: 0.32, h: 0.49 }, { x: 0.34, y: 0.51, w: 0.32, h: 0.49 }, { x: 0.68, y: 0.51, w: 0.32, h: 0.49 },
    ],
  },
  {
    id: 'duo', name: 'Duo Split', hint: 'two halves, one story',
    panels: [
      { x: 0.00, y: 0.00, w: 0.49, h: 1.00 },
      { x: 0.51, y: 0.00, w: 0.49, h: 1.00 },
    ],
  },
  {
    id: 'hero', name: 'Hero Shot', hint: 'one full-bleed photo',
    panels: [{ x: 0.00, y: 0.00, w: 1.00, h: 1.00 }],
  },
  {
    id: 'strip', name: 'Sunset Strip', hint: 'wide hero + 3 below',
    panels: [
      { x: 0.00, y: 0.00, w: 1.00, h: 0.62 },
      { x: 0.00, y: 0.64, w: 0.32, h: 0.36 }, { x: 0.34, y: 0.64, w: 0.32, h: 0.36 }, { x: 0.68, y: 0.64, w: 0.32, h: 0.36 },
    ],
  },
];

export const GRADES = [
  {
    id: 'sunset', name: 'Sunset', swatch: 'linear-gradient(135deg,#ff9a3d,#ff2e88)',
    top: 'rgba(255, 154, 61, 0.10)', bottom: 'rgba(255, 46, 136, 0.38)',
    band: 'rgba(20, 8, 40, 0.55)', accent: '#ffd166',
  },
  {
    id: 'neon', name: 'Neon', swatch: 'linear-gradient(135deg,#00e5ff,#ff2ea6)',
    top: 'rgba(0, 229, 255, 0.16)', bottom: 'rgba(255, 46, 166, 0.42)',
    band: 'rgba(8, 4, 32, 0.60)', accent: '#00e5ff',
  },
  {
    id: 'dusk', name: 'Dusk', swatch: 'linear-gradient(135deg,#7b5cff,#1b1035)',
    top: 'rgba(123, 92, 255, 0.14)', bottom: 'rgba(27, 16, 53, 0.55)',
    band: 'rgba(10, 6, 28, 0.60)', accent: '#b388ff',
  },
  {
    id: 'noir', name: 'Noir', swatch: 'linear-gradient(135deg,#e8e8e8,#111)',
    top: 'rgba(255, 255, 255, 0.05)', bottom: 'rgba(0, 0, 0, 0.45)',
    band: 'rgba(0, 0, 0, 0.62)', accent: '#ffffff', gray: true,
  },
  {
    id: 'teal', name: 'Teal Gold', swatch: 'linear-gradient(135deg,#0fd6c0,#ffb703)',
    top: 'rgba(15, 214, 192, 0.14)', bottom: 'rgba(255, 140, 0, 0.30)',
    band: 'rgba(4, 24, 28, 0.58)', accent: '#ffb703',
  },
];

export const SIZES = [
  { id: 'square', label: 'Square 1080 x 1080', w: 1080, h: 1080 },
  { id: 'portrait', label: 'Portrait 1080 x 1350', w: 1080, h: 1350 },
  { id: 'wide', label: 'Wide 1920 x 1080', w: 1920, h: 1080 },
];

export const TITLE_COLORS = ['#ffffff', '#ffd166', '#ff2ea6', '#00e5ff', '#ff5a3c'];

/** A fresh default state: trio template, sunset grade, one sample photo everywhere. */
export function defaultState() {
  return {
    template: 'trio',
    grade: 'sunset',
    size: 'square',
    title: 'SUNSET HEIST',
    subtitle: 'NEON BAY',
    tagline: 'One last job under the palms.',
    titleSize: 1.0,
    titleColor: '#ffffff',
    titleOutline: true,
    titleShadow: true,
    titlePosition: 'bottom',
    selectedPanel: 0,
    panels: [
      { photo: 0, zoom: 1.0, panX: 0, panY: 0 },
      { photo: 0, zoom: 1.15, panX: 0.08, panY: -0.05 },
      { photo: -1, zoom: 1.0, panX: 0, panY: 0 },
    ],
  };
}

/** Panel slots for a template id, grown to the template's panel count. */
export function panelsFor(templateId, oldPanels) {
  const tpl = TEMPLATES.find((t) => t.id === templateId) ?? TEMPLATES[0];
  return tpl.panels.map((_, i) => oldPanels[i] ?? { photo: 0, zoom: 1.0, panX: 0, panY: 0 });
}
