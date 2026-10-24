import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const root = resolve(new URL('..', import.meta.url).pathname);
const sourceA = resolve(root, 'imgs/photos/1.webp');
const sourceB = resolve(root, 'imgs/photos/2.webp');
const outputDir = resolve(root, 'imgs/photos');

mkdirSync(outputDir, { recursive: true });

const assets = [
  { name: 'valeria_1.webp', source: sourceA, args: ['-resize', '720x960^', '-gravity', 'center', '-extent', '720x960', '-modulate', '105,112,100'] },
  { name: 'valeria_2.webp', source: sourceB, args: ['-resize', '720x960^', '-gravity', 'center', '-extent', '720x960', '-colorize', '8', '-fill', '#ff2b9a'] },
  { name: 'mateo_1.webp', source: sourceB, args: ['-resize', '720x960^', '-gravity', 'center', '-extent', '720x960', '-modulate', '108,118,100', '-fill', '#00d9ff', '-colorize', '5'] },
  { name: 'sofia_1.webp', source: sourceA, args: ['-resize', '720x960^', '-gravity', 'center', '-extent', '720x960', '-modulate', '103,110,100'] },
  { name: 'sofia_2.webp', source: sourceB, args: ['-resize', '720x960^', '-gravity', 'center', '-extent', '720x960', '-modulate', '100,108,100', '-fill', '#8a45ff', '-colorize', '6'] },
  { name: 'alex_secret.webp', source: sourceA, args: ['-resize', '720x960^', '-gravity', 'center', '-extent', '720x960', '-blur', '0x14', '-modulate', '88,80,100'] },
  { name: 'user_avatar.webp', source: sourceB, args: ['-resize', '512x512^', '-gravity', 'center', '-extent', '512x512', '-modulate', '108,112,100'] },
];

for (const asset of assets) {
  const destination = resolve(outputDir, asset.name);
  execFileSync('magick', [asset.source, ...asset.args, '-strip', '-quality', '86', destination], { stdio: 'inherit' });
  console.log(`Generado: ${destination}`);
}
