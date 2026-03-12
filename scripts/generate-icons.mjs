import fs from 'node:fs';
import path from 'node:path';
import twemoji from 'twemoji';
import sharp from 'sharp';

const emoji = '🇵🇱';
const outDir = path.resolve('public/icons');
fs.mkdirSync(outDir, { recursive: true });

// Convert emoji to Twemoji SVG url
const parsed = twemoji.parse(emoji, { folder: 'svg', ext: '.svg' });
// parsed is an <img ... src="...svg">
const match = parsed.match(/src="([^"]+)"/);
if (!match) throw new Error('Failed to parse twemoji svg url');
const svgUrl = match[1];

// Download SVG (simple fetch)
const res = await fetch(svgUrl);
if (!res.ok) throw new Error(`Failed to fetch SVG: ${res.status}`);
const svgBuffer = Buffer.from(await res.arrayBuffer());

// Sizes required by Chrome
const sizes = [16, 32, 48, 128];

for (const size of sizes) {
  const outPath = path.join(outDir, `icon-${size}.png`);
  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(outPath);
  console.log('Wrote', outPath);
}
