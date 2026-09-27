// Genera les icones PNG de l'app a partir dels SVG font (public/icon.svg i
// public/icons/icon-maskable.svg). Procedència i ús: docs/ICONES.md.
// Ús: node scripts/generate-icons.mjs   (necessita Google Chrome instal·lat)
import { readFileSync } from 'node:fs';
import { chromium } from 'playwright';

const OUTPUTS = [
  { source: 'public/icon.svg', size: 180, file: 'public/icons/apple-touch-icon.png' },
  { source: 'public/icon.svg', size: 192, file: 'public/icons/icon-192.png' },
  { source: 'public/icon.svg', size: 512, file: 'public/icons/icon-512.png' },
  { source: 'public/icons/icon-maskable.svg', size: 512, file: 'public/icons/icon-maskable-512.png' },
];

const browser = await chromium.launch({ channel: 'chrome' });
for (const { source, size, file } of OUTPUTS) {
  const page = await browser.newPage({ viewport: { width: size, height: size } });
  const svg = readFileSync(source, 'utf8');
  await page.setContent(
    `<style>html,body{margin:0}svg{display:block;width:${size}px;height:${size}px}</style>${svg}`,
  );
  await page.screenshot({ path: file, omitBackground: false });
  await page.close();
  console.log(`${file} (${size}×${size}) ← ${source}`);
}
await browser.close();
