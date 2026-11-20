// Fixed scenes for screenshots: ?shot=cover shows the exported cover alone,
// ?shot=editor shows the editor with the sample photos loaded.
// Query params: caption, template, grade, size. Every scene loads all six
// bundled samples (see SAMPLE_FILES in presets.js), one per Key Art panel.
// window.__shotReady is set once the scene has painted.
import { defaultState } from './presets.js';

export async function runShot(shot, query, apply) {
  const state = defaultState();
  const caption = query.get('caption');
  if (caption) state.title = caption;
  const template = query.get('template');
  if (template) state.template = template;
  const grade = query.get('grade');
  if (grade) state.grade = grade;
  const size = query.get('size');
  if (size) state.size = size;
  if (shot === 'cover') document.body.classList.add('shot-cover');
  if (shot === 'editor') document.body.classList.add('shot-editor');
  await apply(state);
  await document.fonts.ready;
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  window.__shotReady = true;
}
