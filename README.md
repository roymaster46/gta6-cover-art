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
- **Multi-panel posters:** 5 layouts — Vice Trio (hero + 2 stacked), Comic Six
  (3×2 grid), Duo Split, Hero Shot (full-bleed), Sunset Strip (wide hero + 3 below).
- **Colour grades:** Sunset, Neon, Dusk, Noir, Teal Gold — one click re-grades
  every panel.
- **Lettering:** bold condensed title (Anton, SIL OFL) with outline, neon shadow,
  5 colours, size and top/bottom position, plus subtitle and tagline.
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
or font. Display type is Anton and Archivo Black, both SIL Open Font License, shipped
under `app/fonts/`. The two sample photos were made with an image model for make.fun.

## Hand-in

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to
`/output` and writes `/output/dossier.json` with the vendored make.fun library:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```
