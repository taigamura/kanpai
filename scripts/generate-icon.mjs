// Renders the app icon + favicon from assets/icon.svg (the source of truth) using sharp.
// Art: ワイワイ！ two riso speech bubbles (blue + yellow, multiply) with !? on pink paper (2026-10-02).
// Run: node scripts/generate-icon.mjs
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const assets = join(root, 'assets');
const svg = readFileSync(join(assets, 'icon.svg'));

// App Store icons must be opaque: flatten onto the pink paper color.
const render = (size) => sharp(svg).resize(size, size).flatten({ background: '#FFE3E8' }).png();
await render(1024).toFile(join(assets, 'icon.png'));
await render(48).toFile(join(assets, 'favicon.png'));
console.log('wrote assets/icon.png (1024) and assets/favicon.png (48)');
