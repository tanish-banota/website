import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromium } from 'playwright';

const root = resolve(import.meta.dirname, '..');
const port = 53000 + Math.floor(Math.random() * 5000);
const browserPath = process.env.TWILIGHT_BROWSER || [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
].find(existsSync);
if (!browserPath) throw new Error('Set TWILIGHT_BROWSER to an Edge or Chrome executable');
const server = spawn(process.execPath, [resolve(root, 'node_modules/vite/bin/vite.js'), '--host', '127.0.0.1', '--port', String(port), '--strictPort'], { cwd: root, stdio: 'ignore' });
const pause = (ms) => new Promise((done) => setTimeout(done, ms));
let browser;
try {
  for (let attempt = 0; attempt < 300; attempt++) {
    try { if ((await fetch(`http://127.0.0.1:${port}/`)).ok) break; } catch { /* Vite is starting. */ }
    if (attempt === 299) throw new Error('Vite did not start');
    await pause(150);
  }
  browser = await chromium.launch({ executablePath: browserPath, headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await page.goto(`http://127.0.0.1:${port}/?diagnostics=1`);
  await page.waitForFunction(() => Boolean(window.__twilightPlayerPosition && window.__twilightRuntimeAsset));
  await page.locator('.world-guide-close').click();
  await page.evaluate(() => { window.__twilightPlayerPosition.current = { x: 0, z: 4.25 }; });
  await pause(1600);
  for (const second of [0, 2, 4, 6]) {
    if (second) await pause(2000);
    await page.screenshot({ path: resolve(root, 'preview', `fountain-color-${second}s.png`) });
  }
  await page.close();
} finally {
  await browser?.close();
  server.kill();
}
