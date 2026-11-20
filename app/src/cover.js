// Draws a Neon Bay cover: multi-panel photo poster with a colour grade,
// vector sun and palm silhouettes, and bold outlined caption lettering.
// The Key Art template adds the full print finish: chrome gradient title,
// script subtitle, quote bar, VOL badge, starburst seal, billing block,
// barcode and COMING SOON. Everything is drawn from the state object;
// nothing here touches the network.
import { TEMPLATES, GRADES } from './presets.js';

const GAP = 0.02; // white gutter between panels, as a fraction of cover width
const KEYART_GAP = 0.006; // thin gold gutter for the Key Art template

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

/** Paints a panel's role tag: black tag, gold edge, white caps text. */
function drawPanelLabel(ctx, rect, panel, w, h) {
  const size = Math.max(10, h * 0.018);
  ctx.font = `700 ${size}px "Archivo Black", system-ui, sans-serif`;
  const padX = Math.max(6, w * 0.008);
  const tagH = size * 1.9;
  const tagW = ctx.measureText(panel.label).width + padX * 2;
  const tx = rect.x + Math.max(5, w * 0.006);
  const ty = panel.labelPos === 'top'
    ? rect.y + Math.max(5, h * 0.008)
    : rect.y + rect.h - tagH - Math.max(5, h * 0.008);
  ctx.fillStyle = 'rgba(10, 4, 20, 0.88)';
  ctx.fillRect(tx, ty, tagW, tagH);
  ctx.fillStyle = '#ffd166';
  ctx.fillRect(tx, ty, Math.max(3, w * 0.003), tagH);
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(panel.label, tx + padX, ty + tagH / 2 + size * 0.04);
}

/** Draws the gold starburst "ORIGINAL COVER ART" seal. */
function drawSeal(ctx, cx, cy, r) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.beginPath();
  const spikes = 16;
  for (let i = 0; i < spikes * 2; i++) {
    const a = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
    const rad = i % 2 === 0 ? r : r * 0.82;
    const px = Math.cos(a) * rad;
    const py = Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  const g = ctx.createLinearGradient(-r, -r, r, r);
  g.addColorStop(0, '#ffe259');
  g.addColorStop(0.5, '#ffd166');
  g.addColorStop(1, '#f5a623');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.lineWidth = Math.max(1.5, r * 0.04);
  ctx.strokeStyle = '#7a4d00';
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.74, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(122, 77, 0, 0.7)';
  ctx.lineWidth = Math.max(1, r * 0.03);
  ctx.stroke();
  ctx.fillStyle = '#3a2400';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `700 ${r * 0.24}px "Archivo Black", system-ui, sans-serif`;
  ctx.fillText('ORIGINAL', 0, -r * 0.18);
  ctx.fillText('COVER ART', 0, r * 0.10);
  ctx.font = `${r * 0.22}px system-ui, sans-serif`;
  ctx.fillText('★★★', 0, r * 0.38);
  ctx.restore();
}

/** Draws the barcode block (white plate, black bars, number). */
function drawBarcode(ctx, w, h) {
  const bw = w * 0.075;
  const bh = h * 0.058;
  const bx = w - bw - w * 0.015;
  const by = h * 0.898;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(bx, by, bw, bh);
  const pattern = [3, 1, 2, 1, 1, 3, 1, 2, 2, 1, 3, 1, 1, 2, 1, 3, 2, 1, 2, 1, 1, 3];
  const total = pattern.reduce((a, b) => a + b, 0);
  const unit = (bw * 0.84) / total;
  let px = bx + bw * 0.08;
  ctx.fillStyle = '#111111';
  for (const n of pattern) {
    ctx.fillRect(px, by + bh * 0.10, unit * n * 0.6, bh * 0.62);
    px += unit * n;
  }
  // The number shrinks until it fits the plate (tall covers make the
  // height-based size wider than the width-based plate).
  let numSize = Math.max(8, h * 0.010);
  ctx.font = `${numSize}px system-ui, sans-serif`;
  while (ctx.measureText('0 02113 12820').width > bw * 0.88 && numSize > 6) {
    numSize -= 0.5;
    ctx.font = `${numSize}px system-ui, sans-serif`;
  }
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('0 02113 12820', bx + bw / 2, by + bh * 0.88);
}

/** Draws the whole Key Art print finish: quote bar, chrome title, script
 *  subtitle, tagline ribbon, VOL badge, seal, billing, barcode, COMING SOON. */
function drawKeyArtTitle(ctx, w, h, state, grade) {
  // Dark band behind the title so the chrome reads over any photo.
  const band = ctx.createLinearGradient(0, h * 0.46, 0, h * 0.74);
  band.addColorStop(0, 'rgba(16, 6, 32, 0)');
  band.addColorStop(0.5, 'rgba(16, 6, 32, 0.45)');
  band.addColorStop(1, 'rgba(16, 6, 32, 0.70)');
  ctx.fillStyle = band;
  ctx.fillRect(0, h * 0.46, w, h * 0.28);

  // VOL. 1 badge geometry first: the badge is sized from its text so the
  // word never overflows the yellow plate on tall covers, and the quote bar
  // below is capped to end clear of it.
  const vH = h * 0.030;
  ctx.font = `700 ${vH * 0.55}px "Archivo Black", system-ui, sans-serif`;
  const vW = ctx.measureText('VOL. 1').width + vH * 0.7;
  const vx = w - vW - w * 0.012;
  const vy = h * 0.012;
  const quoteCap = Math.min(w * 0.86, 2 * (vx - w * 0.015) - w);

  // Quote bar: five gold stars, the quote, the paper. Font sizes start from
  // the cover height, then shrink until the whole bar fits the cover width
  // clear of the VOL badge (portrait covers are taller than they are wide,
  // so a height-based size would otherwise run under the badge).
  const quote = '"SUNSET, STEEL AND SIX BAD DECISIONS"';
  const src = '— NEON BAY GAZETTE';
  const stars = '★★★★★';
  let qSize = h * 0.020;
  const measureQuote = (s) => {
    ctx.font = `${s}px system-ui, sans-serif`;
    const starsW = ctx.measureText(stars).width;
    ctx.font = `italic 700 ${s}px system-ui, sans-serif`;
    const quoteW = ctx.measureText(quote).width;
    ctx.font = `700 ${s * 0.85}px system-ui, sans-serif`;
    const srcW = ctx.measureText(src).width;
    return starsW + quoteW + srcW + w * 0.012 * 2;
  };
  let total = measureQuote(qSize);
  while (total > quoteCap && qSize > 8) {
    qSize *= 0.92;
    total = measureQuote(qSize);
  }
  ctx.font = `${qSize}px system-ui, sans-serif`;
  const starsW = ctx.measureText(stars).width;
  ctx.font = `italic 700 ${qSize}px system-ui, sans-serif`;
  const quoteW = ctx.measureText(quote).width;
  ctx.font = `700 ${qSize * 0.85}px system-ui, sans-serif`;
  const srcW = ctx.measureText(src).width;
  const gapQ = w * 0.012;
  let qx = (w - total) / 2;
  const qy = h * 0.028;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffd166';
  ctx.font = `${qSize}px system-ui, sans-serif`;
  ctx.fillText(stars, qx, qy);
  qx += starsW + gapQ;
  ctx.fillStyle = '#ffffff';
  ctx.font = `italic 700 ${qSize}px system-ui, sans-serif`;
  ctx.fillText(quote, qx, qy);
  qx += quoteW + gapQ;
  ctx.fillStyle = '#ffd166';
  ctx.font = `700 ${qSize * 0.85}px system-ui, sans-serif`;
  ctx.fillText(src, qx, qy);

  // VOL. 1 badge, top right (geometry computed above, with the quote bar).
  ctx.fillStyle = '#ffd166';
  ctx.fillRect(vx, vy, vW, vH);
  ctx.fillStyle = '#160a24';
  ctx.font = `700 ${vH * 0.55}px "Archivo Black", system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('VOL. 1', vx + vW / 2, vy + vH / 2 + 1);

  // Chrome title: white -> gold -> pink -> violet, thick dark outline.
  const title = (state.title || '').trim().toUpperCase();
  if (title) {
    let size = h * 0.15 * (state.titleSize || 1);
    ctx.font = `${size}px Anton, "Archivo Black", system-ui, sans-serif`;
    while (ctx.measureText(title).width > w * 0.96 && size > 16) {
      size -= 4;
      ctx.font = `${size}px Anton, "Archivo Black", system-ui, sans-serif`;
    }
    const cx = w / 2;
    const cy = h * 0.60;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-0.015);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // The gradient is built AFTER the translate, in the title's own
    // coordinates: a gradient made in page coordinates would be shifted by
    // the translate and paint the glyphs a single flat stop.
    const chrome = ctx.createLinearGradient(0, -size * 0.55, 0, size * 0.55);
    chrome.addColorStop(0, '#ffffff');
    chrome.addColorStop(0.30, '#ffe259');
    chrome.addColorStop(0.55, '#ff9a3d');
    chrome.addColorStop(0.75, '#ff2ea6');
    chrome.addColorStop(1, '#8a5cff');
    if (state.titleShadow) {
      ctx.shadowColor = 'rgba(255, 46, 136, 0.8)';
      ctx.shadowBlur = size * 0.16;
      ctx.shadowOffsetY = size * 0.05;
    }
    if (state.titleOutline) {
      ctx.lineWidth = Math.max(3, size * 0.10);
      ctx.strokeStyle = '#160a24';
      ctx.lineJoin = 'round';
      ctx.strokeText(title, 0, 0);
    }
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = chrome;
    ctx.fillText(title, 0, 0);

    // Script subtitle overlapping the title's foot, pink with a white edge.
    const script = (state.subtitle || '').trim();
    if (script) {
      const sSize = h * 0.082;
      ctx.save();
      ctx.translate(0, size * 0.44);
      ctx.rotate(-0.035);
      ctx.font = `${sSize}px Yellowtail, cursive`;
      ctx.shadowColor = 'rgba(255, 46, 136, 0.65)';
      ctx.shadowBlur = sSize * 0.18;
      ctx.shadowOffsetY = sSize * 0.05;
      ctx.lineWidth = Math.max(2, sSize * 0.07);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.92)';
      ctx.lineJoin = 'round';
      ctx.strokeText(script, 0, 0);
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
      ctx.fillStyle = '#ff5da2';
      ctx.fillText(script, 0, 0);
      ctx.restore();
    }
    ctx.restore();
  }

  // Tagline ribbon: black band, gold edge, white caps.
  const tag = (state.tagline || '').trim().toUpperCase();
  if (tag) {
    const tSize = h * 0.020;
    ctx.font = `700 ${tSize}px "Archivo Black", system-ui, sans-serif`;
    const padX = w * 0.02;
    const padY = tSize * 0.55;
    const rw = ctx.measureText(tag).width + padX * 2;
    const rh = tSize + padY * 2;
    const rx = (w - rw) / 2;
    const ry = h * 0.755 - rh / 2;
    ctx.fillStyle = 'rgba(8, 3, 16, 0.92)';
    ctx.fillRect(rx, ry, rw, rh);
    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = Math.max(1.5, w * 0.0015);
    ctx.strokeRect(rx, ry, rw, rh);
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(tag, w / 2, ry + rh / 2 + tSize * 0.05);
  }

  // Starburst seal, bottom right over the corner panel.
  drawSeal(ctx, w * 0.945, h * 0.77, w * 0.052);

  // Billing block, two lines, centred in the bottom frame.
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `600 ${Math.max(11, h * 0.0145)}px system-ui, sans-serif`;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.fillText('A NEON BAY PRODUCTION · STARRING YOU', w / 2, h * 0.905);
  ctx.fillText('SHOT ON YOUR OWN CAMERA · GRADED BY HAND', w / 2, h * 0.932);

  // COMING SOON, bottom left.
  ctx.textAlign = 'left';
  ctx.font = `${Math.max(13, h * 0.024)}px "Archivo Black", system-ui, sans-serif`;
  ctx.shadowColor = 'rgba(255, 93, 162, 0.8)';
  ctx.shadowBlur = h * 0.008;
  ctx.fillStyle = '#ffffff';
  ctx.fillText('COMING SOON', w * 0.02, h * 0.962);
  ctx.shadowBlur = 0;

  drawBarcode(ctx, w, h);

  // Thin gold frame around the whole cover.
  ctx.strokeStyle = 'rgba(255, 209, 102, 0.9)';
  ctx.lineWidth = Math.max(2, w * 0.003);
  ctx.strokeRect(w * 0.004, h * 0.004, w - w * 0.008, h - h * 0.008);
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
  const keyart = template.keyart === true;
  const gap = keyart ? w * KEYART_GAP : w * GAP;

  if (keyart) {
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#1c0b33');
    bg.addColorStop(1, '#0d0618');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
  } else {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
  }

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
      else if (grade.sat || grade.con) ctx.filter = `saturate(${grade.sat ?? 1}) contrast(${grade.con ?? 1})`;
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
    if (p.label) drawPanelLabel(ctx, rect, p, w, h);
    ctx.strokeStyle = keyart ? 'rgba(255, 209, 102, 0.9)' : 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = Math.max(2, w * (keyart ? 0.003 : 0.004));
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
    if (i === state.selectedPanel) {
      ctx.strokeStyle = grade.accent;
      ctx.lineWidth = Math.max(3, w * 0.006);
      ctx.setLineDash([w * 0.02, w * 0.012]);
      ctx.strokeRect(rect.x + 3, rect.y + 3, rect.w - 6, rect.h - 6);
      ctx.setLineDash([]);
    }
  });

  if (keyart) {
    drawKeyArtTitle(ctx, w, h, state, grade);
    return;
  }

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
