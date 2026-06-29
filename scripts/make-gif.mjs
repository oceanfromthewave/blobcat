// Renders the cat animation frame-by-frame with headless Edge, then encodes a GIF.
// No screen recording needed. Run: node scripts/make-gif.mjs
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, rmSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import pngjs from 'pngjs';
import gifenc from 'gifenc';
const { PNG } = pngjs;
const { GIFEncoder, quantize, applyPalette } = gifenc;

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const FRAME_HTML = 'file:///C:/dev/cat-extension/scripts/frame.html';
const OUT = 'C:/dev/cat-extension/docs/demo.gif';
const W = 420, H = 150;

const HOLD = 130, FAST = 70;

// id => one frame state. delay in ms.
const frames = [
  // settle / idle
  { delay: HOLD }, { delay: HOLD },
  // type -> jump (squash & stretch) + particles
  { ty: 2,   sx: 1.18, sy: 0.82, eye: 1, parts: 0.0, delay: FAST },
  { ty: -5,  sx: 0.95, sy: 1.12, eye: 0, parts: 0.25, delay: FAST },
  { ty: -9,  sx: 0.88, sy: 1.2,  eye: 0, parts: 0.5, delay: FAST },
  { ty: -12, sx: 0.92, sy: 1.14, eye: 0, parts: 0.7, delay: FAST },
  { ty: -6,  sx: 0.95, sy: 1.08, eye: 0, parts: 0.85, delay: FAST },
  { ty: 0,   sx: 1.18, sy: 0.82, eye: 1, parts: 1.0, delay: FAST },
  { ty: -2,  sx: 0.97, sy: 1.05, eye: 1, delay: FAST },
  { delay: HOLD }, { delay: HOLD },
  // click -> pet wiggle + hearts
  { rot: -10, cheek: 1, eye: 0, hearts: 0.15, delay: FAST },
  { rot: 9,   cheek: 1, eye: 0, hearts: 0.35, delay: FAST },
  { rot: -6,  cheek: 1, eye: 0, hearts: 0.55, delay: FAST },
  { rot: 3,   cheek: 1, eye: 0, hearts: 0.78, delay: FAST },
  { rot: 0,   cheek: 1, eye: 0, hearts: 0.95, delay: FAST },
  // back to idle hold
  { delay: HOLD }, { delay: HOLD }, { delay: HOLD },
];

const tmp = mkdtempSync(join(tmpdir(), 'blobgif-'));
try {
  mkdirSync('C:/dev/cat-extension/docs', { recursive: true });
  const gif = GIFEncoder();

  frames.forEach((f, i) => {
    const params = new URLSearchParams();
    for (const k of ['ty', 'sx', 'sy', 'rot', 'eye', 'cheek', 'parts', 'hearts']) {
      if (f[k] !== undefined) params.set(k, String(f[k]));
    }
    const png = join(tmp, `f${String(i).padStart(2, '0')}.png`);
    execFileSync(EDGE, [
      '--headless', '--disable-gpu', '--no-sandbox',
      `--user-data-dir=${tmp}\\ud`,
      `--screenshot=${png}`,
      `--window-size=${W},${H}`,
      `${FRAME_HTML}?${params.toString()}`,
    ], { stdio: 'ignore' });

    const { data, width, height } = PNG.sync.read(readFileSync(png));
    const palette = quantize(data, 256);
    const index = applyPalette(data, palette);
    gif.writeFrame(index, width, height, { palette, delay: f.delay ?? FAST, ...(i === 0 ? { repeat: 0 } : {}) });
    process.stdout.write(`frame ${i + 1}/${frames.length}\r`);
  });

  gif.finish();
  writeFileSync(OUT, Buffer.from(gif.bytes()));
  console.log(`\nWrote ${OUT}`);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
