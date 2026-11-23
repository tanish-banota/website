import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from 'playwright';

const root = resolve(import.meta.dirname, '..');
const label = process.argv[2] ?? 'baseline';
const port = 53000 + Math.floor(Math.random() * 5000);
const browserPath = process.env.TWILIGHT_BROWSER || [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
].find(existsSync);
if (!browserPath) throw new Error('Set TWILIGHT_BROWSER to an Edge or Chrome executable');
const dev = spawn(process.execPath, [resolve(root, 'node_modules/vite/bin/vite.js'), '--host', '127.0.0.1', '--port', String(port), '--strictPort'], { cwd: root, stdio: 'ignore' });
const pause = (ms) => new Promise((done) => setTimeout(done, ms));
async function until(task, label, timeout = 45000) {
  const deadline = Date.now() + timeout;
  let last;
  while (Date.now() < deadline) {
    try { const value = await task(); if (value) return value; } catch (error) { last = error; }
    await pause(150);
  }
  throw new Error(`Timed out waiting for ${label}${last ? `: ${last.message}` : ''}`);
}
let browser;
try {
  await until(async () => (await fetch(`http://127.0.0.1:${port}/`)).ok, 'Vite');
  browser = await chromium.launch({ executablePath: browserPath, headless: true });
  const records = [];
  const positions = [['square', 0, 4.25], ['observatory-approach', -7, -3.5], ['eastern-edge', 12.25, 2], ['southern-edge', 0, 10], ['former-lookout-site', -3.7, -8.8], ['north-lookout', -3.7, -12.4]];
  await mkdir(resolve(root, 'preview', 'camera-pass'), { recursive: true });
  for (const [viewport, width, height] of [['desktop', 1440, 900], ['narrow', 390, 844]]) {
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
    await page.goto(`http://127.0.0.1:${port}/?diagnostics=1`);
    await page.waitForFunction(() => Boolean(window.__twilightPlayerPosition && window.__twilightRenderInfo && window.__twilightRuntimeAsset));
    await page.locator('.world-guide-close').click();
    await pause(1600);
    await page.screenshot({ path: resolve(root, 'preview', 'camera-pass', `${label}-${viewport}-entry.png`) });
    records.push({ label, viewport, width, height, name: 'entry', player: await page.evaluate(() => window.__twilightPlayerPosition.current), render: await page.evaluate(() => window.__twilightRenderInfo) });
    for (const [name, x, z] of positions) {
      await page.evaluate(({ x, z }) => { window.__twilightPlayerPosition.current = { x, z }; }, { x, z });
      await pause(1600);
      await page.screenshot({ path: resolve(root, 'preview', 'camera-pass', `${label}-${viewport}-${name}.png`) });
      records.push({ label, viewport, width, height, name, player: { x, z }, render: await page.evaluate(() => window.__twilightRenderInfo) });
    }
    await page.close();
  }
  await writeFile(resolve(root, 'preview', 'camera-pass', `${label}.json`), JSON.stringify(records, null, 2));
  console.log(JSON.stringify(records, null, 2));
} finally {
  await browser?.close();
  dev.kill();
}
