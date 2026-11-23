import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
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
if (!browserPath) throw new Error('Set TWILIGHT_BROWSER to Edge or Chrome');
const server = spawn(process.execPath, [resolve(root, 'node_modules/vite/bin/vite.js'), '--host', '127.0.0.1', '--port', String(port), '--strictPort'], { cwd: root, stdio: 'ignore' });
const pause = (ms) => new Promise((done) => setTimeout(done, ms));
const output = resolve(root, 'preview', 'shadow-motion');
mkdirSync(output, { recursive: true });
let browser;
try {
  for (let attempt = 0; attempt < 300; attempt++) {
    try { if ((await fetch(`http://127.0.0.1:${port}/`)).ok) break; } catch { /* Starting. */ }
    if (attempt === 299) throw new Error('Vite did not start');
    await pause(150);
  }
  browser = await chromium.launch({ executablePath: browserPath, headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const records = [];
  for (const mode of ['shadows', 'no-shadows', 'no-grass-tint']) {
    await page.goto(`http://127.0.0.1:${port}/?diagnostics=1`);
    await page.waitForFunction(() => Boolean(window.__twilightPlayerPosition && window.__twilightRuntimeAsset));
    if (await page.locator('.world-guide-close').count()) await page.locator('.world-guide-close').click();
    await page.evaluate(({ mode }) => {
      window.__twilightPlayerPosition.current = { x: 0, z: 7.2 };
      const scene = window.__twilightRuntimeAsset.parent;
      const sun = scene.children.find((child) => child.isDirectionalLight && child.castShadow);
      if (mode === 'no-shadows') sun.castShadow = false;
      if (mode === 'no-grass-tint') window.__twilightRuntimeAsset.getObjectByName('GrassVariation').visible = false;
    }, { mode });
    await pause(1800);
    const capture = async (name) => {
      const info = await page.evaluate(() => {
        const camera = window.__twilightRuntimeAsset.parent.children.find((child) => child.isCamera);
        const projected = camera.position.clone().set(-2.5, 0.025, 7.4).project(camera);
        return { player: window.__twilightPlayerPosition.current, camera: camera.position.toArray(), patchPx: [(projected.x + 1) * 720, (1 - projected.y) * 450] };
      });
      const path = resolve(output, `${label}-${mode}-${name}.png`);
      await page.screenshot({ path });
      records.push({ name, mode, viewport: [1440, 900], ...info, path });
    };
    await capture('start');
    await page.keyboard.down('a');
    for (let frame = 1; frame <= 5; frame++) { await pause(200); await capture(`moving-${frame}`); }
    await page.keyboard.up('a');
    for (let frame = 1; frame <= 5; frame++) { await pause(200); await capture(`settling-${frame}`); }
  }
  writeFileSync(resolve(output, `${label}.json`), JSON.stringify(records, null, 2));
  console.log(`${records.length} normal-runtime frames saved to ${output} from 1440x900 and player (0, 7.2)`);
  await page.close();
} finally {
  await browser?.close();
  server.kill();
}
