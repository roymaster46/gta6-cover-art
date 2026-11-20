// Wires the Neon Bay cover maker: photo uploads, panel picking and dragging,
// template and grade pickers, caption and typography controls, and 1-click PNG export.
import { TEMPLATES, GRADES, SIZES, TITLE_COLORS, SAMPLE_FILES, defaultState, panelsFor } from './presets.js';
import { drawCover, exportCover, templateById } from './cover.js';
import { runShot } from './shots.js';

const $ = (id) => document.getElementById(id);
const canvas = $('cover');
const statusEl = $('status');
const state = defaultState();
let photos = []; // loaded Image objects, index matches the thumbnail strip
let photoNames = [];
let drag = null;

function setStatus(msg) { statusEl.textContent = msg; }

/** Loads an image from a URL, resolving once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function currentSize() {
  return SIZES.find((s) => s.id === state.size) ?? SIZES[0];
}

function redraw() {
  const size = currentSize();
  if (canvas.width !== size.w || canvas.height !== size.h) {
    canvas.width = size.w;
    canvas.height = size.h;
  }
  drawCover(canvas, photos, state);
  syncPanelControls();
}

/** Rebuilds the photo thumbnail strip from the loaded photos. */
function renderThumbs() {
  const strip = $('thumbs');
  strip.innerHTML = '';
  photos.forEach((img, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'thumb';
    b.title = `Use ${photoNames[i] ?? 'photo ' + (i + 1)} in the selected panel`;
    const t = document.createElement('img');
    t.src = img.src;
    t.alt = photoNames[i] ?? 'photo';
    b.appendChild(t);
    b.addEventListener('click', () => {
      state.panels[state.selectedPanel].photo = i;
      state.panels[state.selectedPanel].zoom = 1;
      state.panels[state.selectedPanel].panX = 0;
      state.panels[state.selectedPanel].panY = 0;
      redraw();
      setStatus(`Panel ${state.selectedPanel + 1} now shows ${photoNames[i] ?? 'photo ' + (i + 1)}.`);
    });
    strip.appendChild(b);
  });
  $('photoCount').textContent = photos.length ? `${photos.length} photo${photos.length > 1 ? 's' : ''} loaded` : 'No photos yet — add one below, or use a sample.';
}

/** Builds the template picker buttons. */
function renderTemplates() {
  const box = $('templates');
  box.innerHTML = '';
  TEMPLATES.forEach((t) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'pick' + (t.id === state.template ? ' active' : '');
    b.textContent = t.name;
    b.title = t.hint;
    b.addEventListener('click', () => {
      state.template = t.id;
      state.panels = panelsFor(t.id, state.panels);
      state.selectedPanel = 0;
      renderTemplates();
      redraw();
    });
    box.appendChild(b);
  });
}

/** Builds the grade swatch buttons. */
function renderGrades() {
  const box = $('grades');
  box.innerHTML = '';
  GRADES.forEach((g) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'swatch' + (g.id === state.grade ? ' active' : '');
    b.style.background = g.swatch;
    b.textContent = g.name;
    b.title = g.name + ' colour grade';
    b.addEventListener('click', () => {
      state.grade = g.id;
      renderGrades();
      redraw();
    });
    box.appendChild(b);
  });
}

/** Builds the title-colour swatch buttons. */
function renderTitleColors() {
  const box = $('titleColors');
  box.innerHTML = '';
  TITLE_COLORS.forEach((c) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'swatch small' + (c === state.titleColor ? ' active' : '');
    b.style.background = c;
    b.setAttribute('aria-label', 'Title colour ' + c);
    b.addEventListener('click', () => {
      state.titleColor = c;
      renderTitleColors();
      redraw();
    });
    box.appendChild(b);
  });
}

/** Builds the export-size buttons. */
function renderSizes() {
  const box = $('sizes');
  box.innerHTML = '';
  SIZES.forEach((s) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'pick' + (s.id === state.size ? ' active' : '');
    b.textContent = `${s.w} x ${s.h}`;
    b.addEventListener('click', () => {
      state.size = s.id;
      renderSizes();
      redraw();
    });
    box.appendChild(b);
  });
}

/** Syncs the per-panel sliders with the selected panel's slot. */
function syncPanelControls() {
  const slot = state.panels[state.selectedPanel] ?? { photo: -1, zoom: 1, panX: 0, panY: 0 };
  $('panelLabel').textContent = `Panel ${state.selectedPanel + 1} of ${templateById(state.template).panels.length}`;
  $('zoom').value = slot.zoom;
  $('panX').value = slot.panX;
  $('panY').value = slot.panY;
}

/** Adds loaded photos (File objects or sample URLs) to the library. */
async function addPhotos(files) {
  for (const f of files) {
    const url = typeof f === 'string' ? f : URL.createObjectURL(f);
    const name = typeof f === 'string' ? f.split('/').pop() : f.name;
    try {
      const img = await loadImage(url);
      photos.push(img);
      photoNames.push(name);
      if (photos.length === 1) state.panels.forEach((p) => { p.photo = 0; });
    } catch {
      setStatus(`Could not read ${name}. Try a JPG or PNG photo.`);
    }
  }
  renderThumbs();
  redraw();
}

$('photo').addEventListener('change', (e) => addPhotos([...e.target.files]));
$('samplePier').addEventListener('click', () => addPhotos(['samples/pier.jpg']));
$('sampleBoulevard').addEventListener('click', () => addPhotos(['samples/boulevard.jpg']));
$('sampleDriver').addEventListener('click', () => addPhotos(['samples/driver.jpg']));
$('sampleInsider').addEventListener('click', () => addPhotos(['samples/insider.jpg']));
$('sampleBoss').addEventListener('click', () => addPhotos(['samples/boss.jpg']));
$('sampleRider').addEventListener('click', () => addPhotos(['samples/rider.jpg']));
$('sampleAll').addEventListener('click', () => addPhotos(SAMPLE_FILES));

$('fillAll').addEventListener('click', () => {
  const slot = state.panels[state.selectedPanel];
  if (slot.photo < 0) { setStatus('Pick a photo for this panel first.'); return; }
  state.panels.forEach((p) => { p.photo = slot.photo; });
  redraw();
  setStatus('Every panel now shows the same photo — crop each one differently.');
});

$('shuffle').addEventListener('click', () => {
  if (!photos.length) { setStatus('Add a photo first.'); return; }
  state.panels.forEach((p) => {
    p.photo = Math.floor(Math.random() * photos.length);
    p.zoom = 1 + Math.random() * 0.35;
    p.panX = (Math.random() - 0.5) * 0.3;
    p.panY = (Math.random() - 0.5) * 0.3;
  });
  redraw();
  setStatus('Shuffled — pick the layout you like, then export.');
});

$('zoom').addEventListener('input', (e) => { state.panels[state.selectedPanel].zoom = Number(e.target.value); redraw(); });
$('panX').addEventListener('input', (e) => { state.panels[state.selectedPanel].panX = Number(e.target.value); redraw(); });
$('panY').addEventListener('input', (e) => { state.panels[state.selectedPanel].panY = Number(e.target.value); redraw(); });

$('title').addEventListener('input', (e) => { state.title = e.target.value; redraw(); });
$('subtitle').addEventListener('input', (e) => { state.subtitle = e.target.value; redraw(); });
$('tagline').addEventListener('input', (e) => { state.tagline = e.target.value; redraw(); });
$('titleSize').addEventListener('input', (e) => { state.titleSize = Number(e.target.value); redraw(); });
$('titleOutline').addEventListener('change', (e) => { state.titleOutline = e.target.checked; redraw(); });
$('titleShadow').addEventListener('change', (e) => { state.titleShadow = e.target.checked; redraw(); });
$('titlePosition').addEventListener('change', (e) => { state.titlePosition = e.target.value; redraw(); });

/** Clicks pick a panel; drags pan the photo inside the selected panel. */
function panelAt(clientX, clientY) {
  const r = canvas.getBoundingClientRect();
  const px = (clientX - r.left) / r.width;
  const py = (clientY - r.top) / r.height;
  const tpl = templateById(state.template);
  return tpl.panels.findIndex((p) => px >= p.x && px < p.x + p.w && py >= p.y && py < p.y + p.h);
}

canvas.addEventListener('pointerdown', (e) => {
  const i = panelAt(e.clientX, e.clientY);
  if (i < 0) return;
  state.selectedPanel = i;
  const slot = state.panels[i];
  drag = { x: e.clientX, y: e.clientY, panX: slot.panX, panY: slot.panY, moved: false };
  canvas.setPointerCapture(e.pointerId);
  redraw();
});
canvas.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const r = canvas.getBoundingClientRect();
  const dx = (e.clientX - drag.x) / r.width;
  const dy = (e.clientY - drag.y) / r.height;
  if (Math.abs(dx) + Math.abs(dy) > 0.005) drag.moved = true;
  const slot = state.panels[state.selectedPanel];
  slot.panX = Math.max(-0.6, Math.min(0.6, drag.panX + dx));
  slot.panY = Math.max(-0.6, Math.min(0.6, drag.panY + dy));
  redraw();
});
canvas.addEventListener('pointerup', () => { drag = null; });

$('export').addEventListener('click', async () => {
  const size = currentSize();
  setStatus('Exporting…');
  try {
    const blob = await exportCover(photos, state, size);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `neon-bay-cover-${size.w}x${size.h}.png`;
    a.click();
    setStatus(`Saved neon-bay-cover-${size.w}x${size.h}.png — post it!`);
    window.__exported = { w: size.w, h: size.h, bytes: blob.size };
  } catch {
    setStatus('Export failed — try again.');
  }
});

renderTemplates();
renderGrades();
renderTitleColors();
renderSizes();
renderThumbs();

const query = new URLSearchParams(location.search);
if (query.get('shot')) {
  runShot(query.get('shot'), query, async (shotState) => {
    Object.assign(state, shotState);
    state.panels = panelsFor(state.template, state.panels);
    $('title').value = state.title;
    $('subtitle').value = state.subtitle;
    $('tagline').value = state.tagline;
    renderTemplates();
    renderGrades();
    renderTitleColors();
    renderSizes();
    // The Key Art default needs all six samples, one per panel, in the
    // SAMPLE_FILES order the default state was built against.
    await addPhotos(SAMPLE_FILES);
    state.panels = state.panels.map((p, i) => ({ ...p, photo: i < photos.length ? i : -1 }));
    // A cover shot shows the finished export: no selection outline.
    if (query.get('shot') === 'cover') state.selectedPanel = -1;
    // Paint again once the webfonts are in, so the chrome title and the
    // script subtitle never render in a fallback face.
    await document.fonts.ready;
    redraw();
  });
} else {
  redraw();
  document.fonts.ready.then(() => redraw());
}
