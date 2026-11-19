// Draws a Neon Bay cover: multi-panel photo poster with a colour grade,
// vector sun and palm silhouettes, and bold outlined caption lettering.
// Everything is drawn from the state object; nothing here touches the network.
import { TEMPLATES, GRADES } from './presets.js';

const GAP = 0.02; // white gutter between panels, as a fraction of cover width

/** Finds a template by id, falling back to the first one. */
export function templateById(id) {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
}

/** Finds a grade by id, falling back to the first one. */
export function gradeById(id) {
  return GRADES.find((g) => g.id === id) ?? GRADES[0];
}

/** Draws one palm-tree silhouette (trunk + fronds) at (x, y), height h. */
export function drawPalm(ctx, x, y, h, color) {
  const s = h / 100;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(6, -45, -2, -92);
  ctx.stroke();
  for (let i = 0; i < 7; i++) {
    const a = (-150 + i * 50) * (Math.PI / 180);
    const dx = Math.cos(a) * 52;
    const dy = Math.sin(a) * 26 - 92;
    ctx.beginPath();
    ctx.moveTo(-2, -92);
    ctx.quadraticCurveTo(dx * 0.55, -92 + dy * 0.35, dx, -92 + dy);
    ctx.quadraticCurveTo(dx * 0.55, -92 + dy * 0.7 + 12, -2, -92);
    ctx.fill();
  }
  ctx.restore();
}

/** Draws the striped retro sun used as the cover's emblem. */
export function drawSun(ctx, cx, cy, r, grade) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  const g = ctx.createLinearGradient(0, cy - r, 0, cy + r);
  g.addColorStop(0, '#ffe259');
  g.addColorStop(0.55, '#ff7e3d');
  g.addColorStop(1, grade.id === 'neon' ? '#ff2ea6' : '#ff2e63');
  ctx.fillStyle = g;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  ctx.fillStyle = 'rgba(20, 8, 40, 0.55)';
  let y = cy + r * 0.05;
  let h = r * 0.06;
  while (y < cy + r) { ctx.fillRect(cx - r, y, r * 2, h); y += h * 2.4; h *= 1.35; }
  ctx.restore();
}

/** Paints a photo into a panel rect with cover-fit, zoom and pan. */
function drawPanelPhoto(ctx, photo, rect, slot) {
  const { x, y, w, h } = rect;
  const base = Math.max(w / photo.naturalWidth, h / photo.naturalHeight);
  const scale = base * (slot.zoom || 1);
  const pw = photo.naturalWidth * scale;
  const ph = photo.naturalHeight * scale;
  const cx = x + w / 2 + (slot.panX || 0) * w;
  const cy = y + h / 2 + (slot.panY || 0) * h;
  ctx.drawImage(photo, cx - pw / 2, cy - ph / 2, pw, ph);
}

/** Paints the empty-panel placeholder: dusk gradient, sun and palms. */
function drawEmptyPanel(ctx, rect, grade) {
  const { x, y, w, h } = rect;
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, '#3b1d5e');
  g.addColorStop(0.6, '#c94b7c');
  g.addColorStop(1, '#ff8a3d');
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
  const r = Math.min(w, h) * 0.26;
  drawSun(ctx, x + w / 2, y + h * 0.42, r, grade);
  drawPalm(ctx, x + w * 0.12, y + h * 0.96, h * 0.34, 'rgba(20, 8, 30, 0.85)');
  drawPalm(ctx, x + w * 0.88, y + h * 0.98, h * 0.28, 'rgba(20, 8, 30, 0.85)');
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.font = `600 ${Math.max(13, h * 0.045)}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('ADD A PHOTO', x + w / 2, y + h * 0.72);
}

/** Draws the title block (subtitle, title, tagline) with outline and shadow. */
function drawTitleBlock(ctx, w, h, state, grade) {
  const pos = state.titlePosition === 'top' ? 'top' : 'bottom';
  const title = (state.title || '').trim().toUpperCase();
  const bandH = h * 0.30;
  const bandY = pos === 'top' ? 0 : h - bandH;
  const grad = ctx.createLinearGradient(0, bandY, 0, bandY + bandH);
  if (pos === 'top') {
    grad.addColorStop(0, grade.band);
    grad.addColorStop(1, 'rgba(20, 8, 40, 0)');
  } else {
    grad.addColorStop(0, 'rgba(20, 8, 40, 0)');
    grad.addColorStop(1, grade.band);
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, bandY, w, bandH);

  const cx = w / 2;
  const baseY = pos === 'top' ? h * 0.085 : h - h * 0.085;
  ctx.save();
  ctx.translate(cx, baseY);
  ctx.rotate(-0.02);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const sub = (state.subtitle || '').trim().toUpperCase();
  if (sub) {
    const subSize = h * 0.032;
    ctx.font = `400 ${subSize}px "Archivo Black", system-ui, sans-serif`;
    ctx.fillStyle = grade.accent;
    const track = sub.split('').join('\u2009');
    ctx.fillText(track, 0, pos === 'top' ? -h * 0.085 : -h * 0.115);
  }

  if (title) {
    let size = h * 0.115 * (state.titleSize || 1);
    ctx.font = `${size}px Anton, "Archivo Black", system-ui, sans-serif`;
    while (ctx.measureText(title).width > w * 0.94 && size > 16) {
      size -= 4;
      ctx.font = `${size}px Anton, "Archivo Black", system-ui, sans-serif`;
    }
    if (state.titleShadow) {
      ctx.shadowColor = 'rgba(255, 46, 136, 0.75)';
      ctx.shadowBlur = size * 0.18;
      ctx.shadowOffsetY = size * 0.06;
    }
    if (state.titleOutline) {
      ctx.lineWidth = Math.max(2, size * 0.09);
      ctx.strokeStyle = '#160a24';
      ctx.lineJoin = 'round';
      ctx.strokeText(title, 0, 0);
    }
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = state.titleColor || '#ffffff';
    ctx.fillText(title, 0, 0);
  }

  const tag = (state.tagline || '').trim();
  if (tag) {
    const tagSize = h * 0.026;
    ctx.font = `italic 600 ${tagSize}px system-ui, sans-serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.fillText(tag, 0, pos === 'top' ? h * 0.075 : h * 0.062);
  }
  ctx.restore();

  // Corner badge: original emblem, never a Rockstar mark. It sits in the corner
  // opposite the title block, so a wide title can never run over it.
  const badge = 'NEON BAY  •  EST. 2026';
  ctx.font = `700 ${Math.max(11, h * 0.016)}px system-ui, sans-serif`;
  ctx.textAlign = pos === 'top' ? 'left' : 'right';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.fillText(badge, pos === 'top' ? w * 0.03 : w - w * 0.03, pos === 'top' ? h - h * 0.035 : h * 0.035);
}

/**
 * Draws the whole cover onto a canvas 2D context at the canvas's own size.
 * `photos` is an array of loaded images (or nulls); `state` is the app state.
 */
export function drawCover(canvas, photos, state) {
  const ctx = canvas.getContext('2d');
  const { width: w, height: h } = canvas;
  const template = templateById(state.template);
  const grade = gradeById(state.grade);
  const gap = w * GAP;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);

  template.panels.forEach((p, i) => {
    const rect = {
      x: p.x * w + (p.x > 0 ? gap / 2 : 0),
      y: p.y * h + (p.y > 0 ? gap / 2 : 0),
      w: p.w * w - (p.x > 0 ? gap / 2 : 0) - (p.x + p.w < 1 ? gap / 2 : 0),
      h: p.h * h - (p.y > 0 ? gap / 2 : 0) - (p.y + p.h < 1 ? gap / 2 : 0),
    };
    const slot = state.panels[i] ?? { photo: -1, zoom: 1, panX: 0, panY: 0 };
    const photo = slot.photo >= 0 ? photos[slot.photo] : null;
    ctx.save();
    ctx.beginPath();
    ctx.rect(rect.x, rect.y, rect.w, rect.h);
    ctx.clip();
    if (photo) {
      if (grade.gray) ctx.filter = 'grayscale(1) contrast(1.15)';
      drawPanelPhoto(ctx, photo, rect, slot);
      ctx.filter = 'none';
    } else {
      drawEmptyPanel(ctx, rect, grade);
    }
    const tint = ctx.createLinearGradient(0, rect.y, 0, rect.y + rect.h);
    tint.addColorStop(0, grade.top);
    tint.addColorStop(1, grade.bottom);
    ctx.fillStyle = tint;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.restore();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = Math.max(2, w * 0.004);
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
    if (i === state.selectedPanel) {
      ctx.strokeStyle = grade.accent;
      ctx.lineWidth = Math.max(3, w * 0.006);
      ctx.setLineDash([w * 0.02, w * 0.012]);
      ctx.strokeRect(rect.x + 3, rect.y + 3, rect.w - 6, rect.h - 6);
      ctx.setLineDash([]);
    }
  });

  // Retro sun emblem in the top corner of the biggest panel.
  const hero = template.panels[0];
  const sunR = Math.min(w, h) * 0.055;
  drawSun(ctx, hero.x * w + sunR * 1.5, hero.y * h + sunR * 1.5, sunR, grade);

  drawTitleBlock(ctx, w, h, state, grade);
}

/** Renders the cover at export size and resolves with a PNG blob. */
export function exportCover(photos, state, size) {
  return new Promise((resolve, reject) => {
    const off = document.createElement('canvas');
    off.width = size.w;
    off.height = size.h;
    const clean = { ...state, selectedPanel: -1 };
    drawCover(off, photos, clean);
    off.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('export failed'))), 'image/png');
  });
}
