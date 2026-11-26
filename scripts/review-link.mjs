import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromium } from 'playwright';

const root = resolve(import.meta.dirname, '..');
const output = resolve(root, 'preview', 'blender-character-final');
mkdirSync(output, { recursive: true });
const port = 53000 + Math.floor(Math.random() * 5000);
const browserPath = process.env.TWILIGHT_BROWSER || [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
].find(existsSync);
if (!browserPath) throw new Error('Set TWILIGHT_BROWSER to Edge or Chrome');
const server = spawn(process.execPath, [resolve(root, 'node_modules/vite/bin/vite.js'), '--host', '127.0.0.1', '--port', String(port), '--strictPort'], { cwd: root, stdio: 'ignore' });
const pause = (ms) => new Promise((done) => setTimeout(done, ms));
const legDifference = (a, b) => Math.max(...a.legs.flatMap((values, index) => values.map((value, axis) => Math.abs(value - b.legs[index][axis]))));
let browser;
try {
  for (let attempt = 0; attempt < 300; attempt++) {
    try { if ((await fetch(`http://127.0.0.1:${port}/`)).ok) break; } catch { /* Starting. */ }
    if (attempt === 299) throw new Error('Vite did not start');
    await pause(150);
  }
  browser = await chromium.launch({ executablePath: browserPath, headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const state = () => page.evaluate(() => {
    const scene = window.__twilightRuntimeAsset.parent;
    const player = scene.getObjectByName('Player');
    const visual = player?.getObjectByName('LinkVisual');
    const left = visual?.getObjectByName('LLegJ_5');
    const right = visual?.getObjectByName('RLegJ_9');
    const skinned = [];
    visual?.traverse((object) => { if (object.type === 'SkinnedMesh') skinned.push({ name: object.name, material: object.material.name,
      opacity: object.material.opacity, castsShadow: object.castShadow, visible: object.visible }); });
    return { position: { ...window.__twilightPlayerPosition.current }, visual: Boolean(visual),
      placeholder: player?.getObjectByName('PlayerPlaceholder')?.visible,
      scale: visual?.scale.x, visualOffset: visual?.position.toArray(),
      legs: [left?.quaternion.toArray(), right?.quaternion.toArray()], heading: player?.rotation.y,
      scene: window.__twilightRenderInfo?.scene, skinned };
  });
  const open = async (url) => {
    await page.goto(`http://127.0.0.1:${port}/${url}`);
    await page.waitForFunction(() => Boolean(window.__twilightPlayerPosition && window.__twilightRuntimeAsset));
    if (await page.locator('.world-guide-close').count()) await page.locator('.world-guide-close').click();
  };
  await open('?diagnostics=1');
  await page.waitForFunction(() => Boolean(window.__twilightRuntimeAsset?.parent.getObjectByName('LinkVisual')));
  await pause(400);
  const arrival = await state();
  assert.equal(arrival.visual, true);
  assert.equal(arrival.placeholder, false);
  for (const name of ['Object_7', 'Object_9', 'Object_17'])
    assert.equal(arrival.skinned.find((mesh) => mesh.name === name)?.opacity, 0, `${name} is still visible in hand`);
  for (const name of ['Object_11', 'Object_13', 'Object_15'])
    assert.equal(arrival.skinned.find((mesh) => mesh.name === name)?.opacity, 1, `${name} disappeared from the back`);
  await page.screenshot({ path: resolve(output, 'town-arrival.png') });
  await page.keyboard.down('w');
  await pause(320);
  const walking = await state();
  await page.screenshot({ path: resolve(output, 'town-walk.png') });
  await page.keyboard.up('w');
  assert.ok(walking.position.z < arrival.position.z - 0.2, 'town movement stopped');
  assert.ok(legDifference(walking, arrival) > 0.01, 'walk rig did not move');
  await pause(400);
  const stopped = await state();
  await page.screenshot({ path: resolve(output, 'town-stopped.png') });
  assert.ok(legDifference(stopped, arrival) < 0.02, 'idle did not settle after stopping');
  await page.evaluate(() => { window.__twilightPlayerPosition.current = { x: 12.6, z: 8 }; });
  await pause(350);
  const edge = await state();
  await page.keyboard.down('d');
  await pause(450);
  const blocked = await state();
  await page.screenshot({ path: resolve(output, 'town-blocked.png') });
  await page.keyboard.up('d');
  assert.ok(Math.abs(blocked.position.x - edge.position.x) < 0.001, 'collision edge moved');
  assert.ok(legDifference(blocked, edge) < 0.02, 'walk rig continued at blocked edge');

  await open('?preview=observatory&diagnostics=1');
  await page.waitForFunction(() => Boolean(window.__twilightRuntimeAsset?.parent.getObjectByName('LinkVisual')));
  await pause(450);
  const interior = await state();
  await page.screenshot({ path: resolve(output, 'interior-arrival.png') });
  assert.equal(interior.visual, true);
  assert.equal(interior.placeholder, false);
  await page.keyboard.down('a');
  await pause(280);
  const interiorWalk = await state();
  await page.screenshot({ path: resolve(output, 'interior-walk.png') });
  await page.keyboard.up('a');
  assert.ok(interiorWalk.position.x < interior.position.x - 0.1, 'interior movement stopped');
  await pause(400);
  const interiorStop = await state();
  assert.ok(legDifference(interiorStop, interior) < 0.02, 'interior idle did not settle');
  await page.keyboard.down('d');
  await pause(240);
  const turned = await state();
  await page.screenshot({ path: resolve(output, 'interior-turn.png') });
  await page.keyboard.up('d');
  assert.ok(turned.position.x > interiorStop.position.x + 0.1 && Math.abs(turned.heading - interiorWalk.heading) > 2,
    'player did not turn and move in the opposite direction');
  await pause(400);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.keyboard.down('d');
  await pause(250);
  const reducedMotion = await state();
  await page.keyboard.up('d');
  assert.ok(legDifference(reducedMotion, interior) < 0.02,
    'reduced motion left the walk active');
  await page.emulateMedia({ reducedMotion: 'no-preference' });

  await page.route('**/models/toon_link_animated.glb', (route) => route.abort());
  await open('?diagnostics=1');
  await pause(800);
  const fallback = await state();
  await page.screenshot({ path: resolve(output, 'asset-fallback.png') });
  assert.equal(fallback.visual, false);
  assert.equal(fallback.placeholder, true);
  await page.keyboard.down('w');
  await pause(250);
  const fallbackMove = await state();
  await page.keyboard.up('w');
  assert.ok(fallbackMove.position.z < fallback.position.z - 0.1, 'fallback movement stopped');
  await open('?preview=observatory&diagnostics=1');
  await pause(650);
  const interiorFallback = await state();
  await page.screenshot({ path: resolve(output, 'interior-asset-fallback.png') });
  assert.equal(interiorFallback.visual, false);
  assert.equal(interiorFallback.placeholder, true);
  const report = { viewport: [1440, 900], arrival, walking, stopped, edge, blocked, interior, interiorWalk, interiorStop, turned,
    reducedMotion, fallback, fallbackMove, interiorFallback };
  writeFileSync(resolve(output, 'review.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  await page.close();
} finally {
  await browser?.close();
  server.kill();
}
