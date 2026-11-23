import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from 'playwright';

const root = resolve(import.meta.dirname, '..');
const label = process.argv[2] ?? 'presentation';
const port = 53000 + Math.floor(Math.random() * 5000);
const browserPath = process.env.TWILIGHT_BROWSER || [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
].find(existsSync);
if (!browserPath) throw new Error('Set TWILIGHT_BROWSER to an Edge or Chrome executable');
const server = spawn(process.execPath, [resolve(root, 'node_modules/vite/bin/vite.js'), '--host', '127.0.0.1', '--port', String(port), '--strictPort'], { cwd: root, stdio: 'ignore' });
const pause = (ms) => new Promise((done) => setTimeout(done, ms));
async function until(task, timeout = 45000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    try { if (await task()) return; } catch { /* Server is starting. */ }
    await pause(150);
  }
  throw new Error('Timed out waiting for Vite');
}

const viewports = [
  ['desktop', 1440, 900], ['laptop', 1280, 720], ['narrow', 390, 844],
  ['short', 1024, 560], ['zoom-150', 960, 600], ['zoom-200', 720, 450],
  ['narrow-zoom', 320, 560],
];
const out = resolve(root, 'preview', 'presentation');
let browser;
try {
  await until(async () => (await fetch(`http://127.0.0.1:${port}/`)).ok);
  browser = await chromium.launch({ executablePath: browserPath, headless: true });
  await mkdir(out, { recursive: true });
  const records = [];
  for (const [name, width, height] of viewports) {
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
    await page.goto(`http://127.0.0.1:${port}/?diagnostics=1`);
    await page.waitForFunction(() => Boolean(window.__twilightPlayerPosition && window.__twilightRuntimeAsset));
    await pause(500);
    for (const mode of ['guide', 'guide-prompt', 'prompt']) {
      if (mode === 'guide-prompt') {
        await page.evaluate(() => { window.__twilightPlayerPosition.current = { x: 0, z: 3.55 }; });
        await page.waitForFunction(() => document.querySelector('.interaction-prompt')?.textContent?.includes('About Tanish'));
        await pause(500);
      }
      if (mode === 'prompt') await page.locator('.world-guide-close').click();
      const elements = await page.evaluate(() => {
        const box = (selector) => {
          const node = document.querySelector(selector);
          if (!node) return null;
          const rect = node.getBoundingClientRect();
          return { x: rect.x, y: rect.y, width: rect.width, height: rect.height,
            right: rect.right, bottom: rect.bottom };
        };
        return { switch: box('.world-view-switch'), switchButton: box('.view-switch button'),
          guide: box('.world-overlay'), close: box('.world-guide-close'),
          reopen: box('.world-guide-reopen'), prompt: box('.interaction-prompt p'),
          world: box('.world-view'), scrollWidth: document.documentElement.scrollWidth,
          innerWidth: window.innerWidth, innerHeight: window.innerHeight };
      });
      if (label === 'final') {
        const visible = (box) => !box || (box.x >= 0 && box.y >= 0 && box.right <= width && box.bottom <= height);
        const overlap = (a, b) => a && b && a.x < b.right && b.x < a.right && a.y < b.bottom && b.y < a.bottom;
        for (const key of ['switch', 'guide', 'close', 'reopen', 'prompt'])
          assert.ok(visible(elements[key]), `${name} ${mode}: ${key} clipped`);
        assert.ok(elements.scrollWidth <= width, `${name} ${mode}: horizontal overflow`);
        assert.ok(!overlap(elements.switch, elements.guide), `${name} ${mode}: switch overlaps guide`);
        assert.ok(!overlap(elements.guide, elements.prompt), `${name} ${mode}: guide overlaps prompt`);
        assert.ok(!overlap(elements.reopen, elements.prompt), `${name} ${mode}: reopen overlaps prompt`);
        assert.ok(elements.switchButton.height >= 44, `${name} ${mode}: switch target too small`);
        if (elements.close) assert.ok(elements.close.height >= 44 && elements.close.width >= 44, `${name} ${mode}: close target too small`);
        if (elements.reopen) assert.ok(elements.reopen.height >= 44, `${name} ${mode}: reopen target too small`);
      }
      await page.screenshot({ path: resolve(out, `${label}-${name}-${mode}.png`) });
      records.push({ label, name, width, height, mode, player: mode === 'guide' ? { x: 0, z: 9.6 } : { x: 0, z: 3.55 }, elements });
    }
    if (label === 'final') {
      await page.keyboard.press('Tab');
      await page.locator('.view-switch button:first-child').focus();
      const focus = await page.locator('.view-switch button:first-child').evaluate((button) => ({
        outline: getComputedStyle(button).outlineStyle,
        width: Number.parseFloat(getComputedStyle(button).outlineWidth),
      }));
      assert.ok(focus.outline !== 'none' && focus.width >= 3, `${name}: keyboard focus is not visible`);
    }
    await page.close();
  }
  await writeFile(resolve(out, `${label}.json`), JSON.stringify(records, null, 2));
  console.log(JSON.stringify(records.map(({ name, mode, elements }) => ({ name, mode, elements })), null, 2));
} finally {
  await browser?.close();
  server.kill();
}
