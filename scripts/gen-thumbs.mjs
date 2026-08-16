/**
 * Generates the 9:16 placeholder thumbnails that stand in for the reels until
 * real exports exist. Everything is seeded off the reel id, so a given id
 * always renders the same artwork and the set stays stable across builds.
 *
 *   node scripts/gen-thumbs.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = resolve(dirname(fileURLToPath(import.meta.url)), "../public/thumbs");
const W = 540;
const H = 960;

/** xmurmur-ish string hash → 32-bit seed. */
function seedOf(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** mulberry32 — small, fast, good enough for artwork. */
function rng(seed) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Palettes are deliberately off-key — acid greens, bruised purples, hot
// coral — so the placeholders read as "obviously not the real work".
const PALETTES = [
  ["#0b0b0d", "#ff2e63", "#08d9d6", "#f8f5f2"],
  ["#120b1f", "#c0ff3e", "#7b2ff7", "#ffd6f6"],
  ["#0a0f0d", "#ff9f1c", "#2ec4b6", "#fdfffc"],
  ["#150505", "#e71d36", "#ff9f1c", "#f7f3e3"],
  ["#05080f", "#4cc9f0", "#f72585", "#e9ecf5"],
  ["#0d0a06", "#ffbe0b", "#fb5607", "#8338ec"],
];

const TAU = Math.PI * 2;
const n = (v) => Math.round(v * 100) / 100;

/** Concentric wobbling rings around an off-centre pupil. */
function eye(r, [bg, a, b, c]) {
  const cx = W * (0.3 + r() * 0.4);
  const cy = H * (0.3 + r() * 0.4);
  const rings = [];
  for (let i = 14; i > 0; i--) {
    const rad = i * (26 + r() * 10);
    rings.push(
      `<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(rad * (0.5 + r() * 0.3))}" ry="${n(rad)}" fill="none" stroke="${i % 2 ? a : c}" stroke-width="${n(1 + r() * 5)}" opacity="${n(0.25 + r() * 0.6)}"/>`,
    );
  }
  rings.push(`<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(18 + r() * 26)}" fill="${b}"/>`);
  return `<rect width="${W}" height="${H}" fill="${bg}"/>${rings.join("")}`;
}

/** Horizontal bands sheared by a sine, like a melting VHS frame. */
function melt(r, [bg, a, b, c]) {
  const out = [`<rect width="${W}" height="${H}" fill="${bg}"/>`];
  const bands = 26 + Math.floor(r() * 20);
  const amp = 20 + r() * 90;
  const freq = 1 + r() * 4;
  for (let i = 0; i < bands; i++) {
    const y = (i / bands) * H;
    const h = H / bands + 1;
    const dx = Math.sin((i / bands) * TAU * freq + r()) * amp;
    const fill = [a, b, c][Math.floor(r() * 3)];
    out.push(
      `<rect x="${n(dx - 60)}" y="${n(y)}" width="${W + 120}" height="${n(h)}" fill="${fill}" opacity="${n(0.35 + r() * 0.6)}"/>`,
    );
  }
  return out.join("");
}

/** A moiré of rotated line grids — reads as interference on screen. */
function moire(r, [bg, a, b, c]) {
  const out = [`<rect width="${W}" height="${H}" fill="${bg}"/>`];
  for (let layer = 0; layer < 3; layer++) {
    const step = 7 + r() * 13;
    const rot = r() * 180;
    const stroke = [a, b, c][layer];
    const lines = [];
    for (let x = -H; x < W + H; x += step) {
      lines.push(`M ${n(x)} ${-H} L ${n(x)} ${H * 2}`);
    }
    out.push(
      `<g transform="rotate(${n(rot)} ${W / 2} ${H / 2})" opacity="${n(0.3 + r() * 0.4)}"><path d="${lines.join(" ")}" stroke="${stroke}" stroke-width="${n(1 + r() * 2)}" fill="none"/></g>`,
    );
  }
  return out.join("");
}

/** Blobs on a halftone dot field. */
function halftone(r, [bg, a, b, c]) {
  const out = [`<rect width="${W}" height="${H}" fill="${bg}"/>`];
  for (let i = 0; i < 3; i++) {
    const cx = r() * W;
    const cy = r() * H;
    const rad = 90 + r() * 220;
    out.push(
      `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(rad)}" fill="${[a, b, c][i]}" opacity="${n(0.4 + r() * 0.4)}"/>`,
    );
  }
  const dots = [];
  const step = 16 + r() * 10;
  for (let y = step / 2; y < H; y += step) {
    for (let x = step / 2; x < W; x += step) {
      const d = (Math.sin(x / 70) + Math.cos(y / 90)) * 0.5;
      const rad = 1 + Math.abs(d) * (step / 2.4);
      dots.push(`<circle cx="${n(x)}" cy="${n(y)}" r="${n(rad)}"/>`);
    }
  }
  out.push(`<g fill="${bg}" opacity="0.75">${dots.join("")}</g>`);
  return out.join("");
}

/** Nested rotated squares tunnelling toward a vanishing point. */
function tunnel(r, [bg, a, b, c]) {
  const out = [`<rect width="${W}" height="${H}" fill="${bg}"/>`];
  const cx = W * (0.35 + r() * 0.3);
  const cy = H * (0.35 + r() * 0.3);
  const twist = 2 + r() * 12;
  for (let i = 20; i > 0; i--) {
    const s = i / 20;
    const w = W * 1.4 * s;
    const h = H * 1.4 * s;
    out.push(
      `<rect x="${n(cx - w / 2)}" y="${n(cy - h / 2)}" width="${n(w)}" height="${n(h)}" fill="none" stroke="${[a, b, c][i % 3]}" stroke-width="${n(1 + s * 6)}" opacity="${n(0.2 + s * 0.7)}" transform="rotate(${n(i * twist)} ${n(cx)} ${n(cy)})"/>`,
    );
  }
  return out.join("");
}

/** A drunk polyline walk — spidery and unpredictable. */
function walk(r, [bg, a, b, c]) {
  const out = [`<rect width="${W}" height="${H}" fill="${bg}"/>`];
  for (let s = 0; s < 3; s++) {
    let x = r() * W;
    let y = r() * H;
    let ang = r() * TAU;
    const pts = [`M ${n(x)} ${n(y)}`];
    for (let i = 0; i < 160; i++) {
      ang += (r() - 0.5) * 1.9;
      const len = 10 + r() * 55;
      x = Math.max(-40, Math.min(W + 40, x + Math.cos(ang) * len));
      y = Math.max(-40, Math.min(H + 40, y + Math.sin(ang) * len));
      pts.push(`L ${n(x)} ${n(y)}`);
    }
    out.push(
      `<path d="${pts.join(" ")}" fill="none" stroke="${[a, b, c][s]}" stroke-width="${n(1.5 + r() * 4)}" stroke-linecap="round" opacity="${n(0.5 + r() * 0.4)}"/>`,
    );
  }
  return out.join("");
}

const MOTIFS = [eye, melt, moire, halftone, tunnel, walk];

/** Grain + a chromatic split, applied over whatever the motif drew. */
function overlay(r, palette) {
  const [, a, b] = palette;
  return [
    `<rect width="${W}" height="${H}" fill="url(#g)" opacity="0.4"/>`,
    `<rect width="${W}" height="${H}" filter="url(#grain)" opacity="0.22"/>`,
    `<rect x="0" y="${n(r() * H)}" width="${W}" height="${n(4 + r() * 14)}" fill="${a}" opacity="0.7"/>`,
    `<rect x="0" y="${n(r() * H)}" width="${W}" height="${n(2 + r() * 8)}" fill="${b}" opacity="0.6"/>`,
  ].join("");
}

export function svgFor(id) {
  const r = rng(seedOf(id));
  const palette = PALETTES[Math.floor(r() * PALETTES.length)];
  const motif = MOTIFS[Math.floor(r() * MOTIFS.length)];
  const body = motif(r, palette);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img">
<defs>
<radialGradient id="g" cx="50%" cy="45%" r="75%">
<stop offset="0%" stop-color="#000" stop-opacity="0"/>
<stop offset="100%" stop-color="#000" stop-opacity="0.95"/>
</radialGradient>
<filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3"/></filter>
</defs>
${body}${overlay(r, palette)}
</svg>`;
}

const IDS = process.argv.slice(2);
if (IDS.length) {
  mkdirSync(OUT, { recursive: true });
  for (const id of IDS) {
    writeFileSync(resolve(OUT, `${id}.svg`), svgFor(id));
  }
  console.log(`wrote ${IDS.length} thumbnails to ${OUT}`);
}
