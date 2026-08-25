// Generates app icon + favicon from an inline SVG using sharp.
// PLACEHOLDER art — a designed icon should replace this before a serious launch.
// Run: node scripts/generate-icon.mjs
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const assets = join(root, 'assets');
mkdirSync(assets, { recursive: true });

const GROUND = '#233A63';
const GROUND2 = '#1B2C4C';
const GOLD = '#F7C64E';
const GOLD_D = '#D9A62F';
const RED = '#FF5D66';
const CREAM = '#FCF5EA';

// One frothy mug as a reusable group, drawn upright then rotated per side.
const mug = (fill, stroke) => `
  <g>
    <path d="M -70 -40 h 140 a 18 18 0 0 1 18 18 v 150 a 30 30 0 0 1 -30 30 h -116 a 30 30 0 0 1 -30 -30 v -150 a 18 18 0 0 1 18 -18 z" fill="${fill}" stroke="${stroke}" stroke-width="10"/>
    <path d="M 88 -20 a 44 44 0 0 1 0 88 v -26 a 20 20 0 0 0 0 -36 z" fill="${fill}" stroke="${stroke}" stroke-width="10"/>
    <g fill="${CREAM}">
      <circle cx="-52" cy="-46" r="30"/><circle cx="-14" cy="-58" r="34"/>
      <circle cx="26" cy="-50" r="30"/><circle cx="60" cy="-42" r="26"/>
    </g>
  </g>`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <radialGradient id="bg" cx="30%" cy="20%" r="90%">
      <stop offset="0%" stop-color="${GROUND}"/>
      <stop offset="100%" stop-color="${GROUND2}"/>
    </radialGradient>
    <radialGradient id="glow" cx="50%" cy="42%" r="45%">
      <stop offset="0%" stop-color="${RED}" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="${RED}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1024" height="1024" rx="230" fill="url(#bg)"/>
  <circle cx="512" cy="430" r="360" fill="url(#glow)"/>
  <!-- clink burst -->
  <g stroke="${GOLD}" stroke-width="14" stroke-linecap="round" opacity="0.9">
    <line x1="512" y1="250" x2="512" y2="300"/>
    <line x1="452" y1="270" x2="478" y2="312"/>
    <line x1="572" y1="270" x2="546" y2="312"/>
  </g>
  <g transform="translate(370 470) rotate(-16) scale(1.15)">${mug(GOLD, GOLD_D)}</g>
  <g transform="translate(654 470) rotate(16) scale(-1.15,1.15)">${mug(GOLD, GOLD_D)}</g>
</svg>`;

const buf = Buffer.from(svg);
await sharp(buf).resize(1024, 1024).png().toFile(join(assets, 'icon.png'));
await sharp(buf).resize(48, 48).png().toFile(join(assets, 'favicon.png'));
console.log('wrote assets/icon.png (1024) and assets/favicon.png (48)');
