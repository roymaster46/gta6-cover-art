// Neon Bay Cover Maker — gta6-cover-art-01 entry (Node 22, standard library only).
// The app is this directory's app/ folder: plain static files a desktop browser
// loads offline (app/index.html and its ES modules, shipped OFL fonts, no network
// request). This program hands it in: it copies app/ and screenshots/ from beside
// this file to /output and writes /output/dossier.json, the summary the judge
// reads, with the vendored make.fun library.
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Fail fast with a clear message instead of copying half an entry: the grader
// runs this twice and both runs must write the same bytes, so a missing app/
// or screenshots/ is an error here, not a silent partial output.
if (!existsSync(join(here, 'app', 'index.html'))) {
  throw new Error('app/index.html is missing — nothing to hand in');
}
if (!existsSync(join(here, 'screenshots'))) {
  throw new Error('screenshots/ is missing — the entry needs 3 or 4 screenshots');
}

// The Key Art default ships six different sample photos, one per panel;
// a missing sample would silently render an empty placeholder panel, so
// refuse to hand in instead of copying a broken default.
const SAMPLE_FILES = ['insider.jpg', 'boss.jpg', 'driver.jpg', 'rider.jpg', 'boulevard.jpg', 'pier.jpg'];
for (const f of SAMPLE_FILES) {
  if (!existsSync(join(here, 'app', 'samples', f))) {
    throw new Error(`app/samples/${f} is missing — the Key Art default needs all six sample photos`);
  }
}

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes; the others refuse an entry the
// scorer would refuse (more than 4 screenshots or one over 256 KiB; more than 993 files in app/ or 48 MiB of app
// files, in all, or a path under app/ over 1000 bytes: app/ counts beside /output's own 1000-entry cap, its
// screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  }),
);

// The sample manifest lives beside dossier.json, never inside it: the
// scorer requires dossier.json to byte-equal what buildDossier writes, so
// the manifest (sample file names + bytes) is its own file.
const samplesManifest = {
  template: 'keyart',
  samples: SAMPLE_FILES.map((f) => ({
    file: `samples/${f}`,
    bytes: statSync(join(here, 'app', 'samples', f)).size,
  })),
};
writeFileSync(join(out, 'samples-manifest.json'), JSON.stringify(samplesManifest, null, 2) + '\n');
