// Renders the PNG brand assets from the SVG / HTML sources in this folder.
// Usage (needs Playwright + Chromium): node brand/render-assets.js
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const dir = __dirname;
const svg = (f) => fs.readFileSync(path.join(dir, f), 'utf8');

// Full-bleed square: iOS and Android maskable apply their own corner mask.
const square = (size) =>
  `<html><body style="margin:0"><img src="data:image/svg+xml;base64,${Buffer.from(svg('app-icon.svg')).toString('base64')}" width="${size}" height="${size}" style="display:block"></body></html>`;

// "any" purpose: same art on a rounded tile with transparent corners (desktop installs, launchers without masks).
const tile = (size) =>
  `<html><body style="margin:0;background:transparent"><div style="width:${size}px;height:${size}px;border-radius:${Math.round(size * 0.22)}px;overflow:hidden"><img src="data:image/svg+xml;base64,${Buffer.from(svg('app-icon.svg')).toString('base64')}" width="${size}" height="${size}" style="display:block"></div></body></html>`;

const jobs = [
  { out: 'apple-touch-icon.png', size: 180, html: square(180) },
  { out: 'icon-maskable-512.png', size: 512, html: square(512) },
  { out: 'icon-192.png', size: 192, html: tile(192), transparent: true },
  { out: 'icon-512.png', size: 512, html: tile(512), transparent: true },
];

(async () => {
  const browser = await chromium.launch();
  for (const j of jobs) {
    const page = await browser.newPage({ viewport: { width: j.size, height: j.size } });
    await page.setContent(j.html, { waitUntil: 'load' });
    await page.screenshot({ path: path.join(dir, j.out), omitBackground: !!j.transparent });
    await page.close();
    console.log('wrote', j.out);
  }
  const og = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await og.goto('file://' + path.join(dir, 'og-image.html'), { waitUntil: 'load' });
  await og.evaluate(() => document.fonts.ready);
  await og.screenshot({ path: path.join(dir, 'og-image.png') });
  console.log('wrote og-image.png');
  await browser.close();
})();
