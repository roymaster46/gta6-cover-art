# Neon Bay Cover Maker

[![GTA 6 Cover Art](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?referral_code=26tnw136)
[![Rank](https://make.fun/badge/gta6-cover-art-01/roymaster46/gta6-cover-art/rank.svg)](https://make.fun/bounty/gta6-cover-art-01?referral_code=26tnw136)
[![Reward](https://make.fun/badge/gta6-cover-art-01/roymaster46/gta6-cover-art/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?referral_code=26tnw136)

Turn your photos and a caption into a GTA-style multi-panel poster cover — sunset
and neon colour grades, bold outlined lettering, vector sun and palms — and export
it as a PNG to post. Built for the [GTA 6 Cover Art bounty](https://make.fun/bounty/gta6-cover-art-01?referral_code=26tnw136) on make.fun.

## What it does

- **Any photo:** load photos from your machine, crop and position each one (drag on
  the cover, or use the zoom / pan sliders), fill several panels with one photo or
  several, shuffle for ideas.
- **Key Art layout (default):** 6 different photos — hero driver in the centre,
  insider, boss, rider and courier around her, fisherman strip below — each with
  its role tag, on a dark frame with thin gold gutters. Chrome gradient title
  (white → gold → pink → violet) with a pink script subtitle, a five-star quote
  bar, VOL. 1 badge, starburst "ORIGINAL COVER ART" seal, billing block,
  barcode and COMING SOON — the full print finish, drawn in the canvas.
- **Multi-panel posters:** 6 layouts — Key Art (default), Vice Trio (hero + 2
  stacked), Comic Six (3×2 grid), Duo Split, Hero Shot (full-bleed), Sunset
  Strip (wide hero + 3 below).
- **Colour grades:** Sunset (golden-hour, boosted saturation), Neon, Dusk, Noir,
  Teal Gold — one click re-grades every panel.
- **Lettering:** bold condensed title (Anton, SIL OFL) with outline, neon shadow,
  5 colours, size and top/bottom position, plus script subtitle (Yellowtail, SIL
  OFL) and tagline.
- **Fast:** 4 steps from photo to PNG — add photos, pick layout & grade, write the
  caption, export. 1-click export in the common post sizes: **1080×1080**,
  **1080×1350**, **1920×1080**.
- **Offline:** static files under `app/`, no build step, no network request. Photos
  are read on your own machine and never uploaded.

## Try it

```sh
node serve.ts
# open http://localhost:8080
```

## Originality

All art is original: no Rockstar Games logo, wordmark, official artwork, character
or font. Display type is Anton and Archivo Black, script type is Yellowtail — all
SIL Open Font License, shipped under `app/fonts/`. The six sample photos were made
with an image model for make.fun.

## v2 — Key Art rebuild

- New default template **Key Art**: 6 panels, 6 different sample photos, role
  tags, dark frame + gold gutters, chrome title, script subtitle, and the full
  print finish (quote bar, VOL. 1, seal, billing, barcode, COMING SOON).
- Sunset grade boosted (saturation 1.4, contrast 1.1, stronger warm tint).
- `main.ts` now refuses to hand in when any of the six sample photos is missing
  and writes a `samples-manifest.json` (file names + bytes) beside `dossier.json`.
- Screenshots re-shot from the rebuilt app (square cover, editor, wide cover,
  portrait cover), 0 JS errors.

## Hand-in

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to
`/output` and writes `/output/dossier.json` with the vendored make.fun library:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```
