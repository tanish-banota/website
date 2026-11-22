import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const port = 51000 + Math.floor(Math.random() * 9000);
const production = `http://127.0.0.1:${port}/`;
const development = `http://127.0.0.1:${port + 1}/`;
const browserPath = process.env.TWILIGHT_BROWSER || [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
].find(existsSync);
if (!browserPath) throw new Error('Set TWILIGHT_BROWSER to an Edge or Chrome executable');
const profile = await mkdtemp(join(tmpdir(), 'twilight-review-'));
const preview = spawn(process.execPath, [resolve(root, 'node_modules/vite/bin/vite.js'), 'preview', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], { cwd: root, stdio: 'ignore' });
const dev = spawn(process.execPath, [resolve(root, 'node_modules/vite/bin/vite.js'), '--host', '127.0.0.1', '--port', String(port + 1), '--strictPort'], { cwd: root, stdio: 'ignore' });
const browser = spawn(browserPath, ['--headless=new', '--no-first-run', '--enable-precise-memory-info', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });
browser.stderr.on('data', (chunk) => { if (process.env.TWILIGHT_REVIEW_DEBUG) process.stderr.write(chunk); });
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
let socket;
const keepAlive = setInterval(() => {}, 1000);
try {
  await Promise.all([
    until(async () => (await fetch(production)).ok, 'production preview'),
    until(async () => (await fetch(development)).ok, 'development preview'),
  ]);
  const debugPort = await until(async () => Number((await readFile(join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]), 'browser debugger');
  const target = await until(async () => (await (await fetch(`http://127.0.0.1:${debugPort}/json`)).json()).find((item) => item.type === 'page'), 'browser page');
  socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((done, fail) => { socket.onopen = done; socket.onerror = fail; });
  let id = 0;
  const pending = new Map();
  socket.onmessage = ({ data }) => {
    const message = JSON.parse(data);
    if (!message.id) return;
    const entry = pending.get(message.id);
    if (!entry) return;
    pending.delete(message.id);
    clearTimeout(entry.timer);
    if (message.error) entry.reject(new Error(message.error.message)); else entry.resolve(message.result);
  };
  function command(method, params = {}) {
    const next = ++id;
    return new Promise((done, fail) => {
      const timer = setTimeout(() => { if (pending.delete(next)) fail(new Error(`${method} timed out`)); }, 30000);
      pending.set(next, { resolve: done, reject: fail, timer });
      socket.send(JSON.stringify({ id: next, method, params }));
    });
  }
  async function evaluate(expression) {
    const result = await command('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text);
    return result.result.value;
  }
  async function navigate(url, ready) {
    await command('Page.navigate', { url });
    await until(() => evaluate(ready), url);
  }
  async function press(key, code, virtualKeyCode) {
    await command('Input.dispatchKeyEvent', { type: 'keyDown', key, code, windowsVirtualKeyCode: virtualKeyCode });
    await command('Input.dispatchKeyEvent', { type: 'keyUp', key, code, windowsVirtualKeyCode: virtualKeyCode });
  }
  async function capture(name) {
    const shot = await command('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    await writeFile(resolve(root, 'preview', name), Buffer.from(shot.data, 'base64'));
  }
  async function closeGuide() {
    await evaluate("document.querySelector('.world-guide-close')?.click()");
    await until(() => evaluate("!document.querySelector('.world-overlay')"), 'closed guide');
  }
  async function teleport(x, z) {
    await until(() => evaluate('Boolean(window.__twilightPlayerPosition)'), 'diagnostic player position');
    await evaluate(`window.__twilightPlayerPosition.current = { x: ${x}, z: ${z} }`);
  }
  async function prompt(text) {
    await until(() => evaluate(`document.querySelector('.interaction-prompt')?.textContent?.includes(${JSON.stringify(text)})`), `${text} prompt`);
  }
  async function pressInteraction() { await press('e', 'KeyE', 69); }
  async function settle(ms = 1400) { await pause(ms); }
  async function state() { return evaluate('window.__twilightRenderInfo ?? null'); }
  async function measure() {
    await settle(700);
    return evaluate(`new Promise((resolve) => {
      let frames = 0, calls = 0, triangles = 0;
      const started = performance.now();
      function frame(now) {
        const info = window.__twilightRenderInfo;
        if (info) { frames++; calls += info.calls; triangles += info.triangles; }
        if (now - started < 5000) requestAnimationFrame(frame);
        else resolve({ seconds: (now - started) / 1000, fps: frames * 1000 / (now - started),
          drawCalls: Math.round(calls / Math.max(1, frames)), triangles: Math.round(triangles / Math.max(1, frames)),
          geometries: info?.geometries, textures: info?.textures, heapBytes: performance.memory?.usedJSHeapSize ?? null });
      }
      requestAnimationFrame(frame);
    })`);
  }
  await command('Runtime.enable');
  await command('Page.enable');
  await command('Network.enable');
  await command('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await mkdir(resolve(root, 'preview'), { recursive: true });

  // The source view and normal route must show the same authored static kits.
  await navigate(`${development}?asset-export=town&diagnostics=1`, 'Boolean(window.__twilightTownKit)');
  await closeGuide();
  await settle();
  await capture('review-town-source.png');
  const sourceTownMeshes = await evaluate(`(() => { let meshes = 0, casters = 0, receivers = 0;
    window.__twilightTownKit.traverse(object => { if (object.isMesh && object.visible) {
      meshes++; casters += Number(object.castShadow); receivers += Number(object.receiveShadow);
    } }); return { meshes, casters, receivers }; })()`);
  await navigate(`${development}?diagnostics=1`, "Boolean(window.__twilightRuntimeAsset?.getObjectByName('ClockTower'))");
  await closeGuide();
  await settle();
  await capture('review-town-runtime.png');
  const runtimeTownMeshes = await evaluate(`(() => { let meshes = 0, casters = 0, receivers = 0;
    window.__twilightRuntimeAsset.traverse(object => { if (object.isMesh && object.visible) {
      meshes++; casters += Number(object.castShadow); receivers += Number(object.receiveShadow);
    } }); return { meshes, casters, receivers }; })()`);
  assert.deepEqual(runtimeTownMeshes, sourceTownMeshes, 'town GLB shadow flags differ from source');
  await navigate(`${development}?asset-export=observatory&diagnostics=1`, 'Boolean(window.__twilightObservatoryKit)');
  await closeGuide();
  await settle();
  await capture('review-interior-source.png');
  const sourceInteriorMeshes = await evaluate(`(() => { let meshes = 0, casters = 0, receivers = 0;
    window.__twilightObservatoryKit.traverse(object => { if (object.isMesh && object.visible) {
      meshes++; casters += Number(object.castShadow); receivers += Number(object.receiveShadow);
    } }); return { meshes, casters, receivers }; })()`);
  await navigate(`${development}?preview=observatory&diagnostics=1`, "Boolean(window.__twilightRuntimeAsset?.getObjectByName('ObservatoryInterior'))");
  await closeGuide();
  await settle();
  await capture('review-interior-runtime.png');
  const runtimeInteriorMeshes = await evaluate(`(() => { let meshes = 0, casters = 0, receivers = 0;
    window.__twilightRuntimeAsset.traverse(object => { if (object.isMesh && object.visible) {
      meshes++; casters += Number(object.castShadow); receivers += Number(object.receiveShadow);
    } }); return { meshes, casters, receivers }; })()`);
  assert.deepEqual(runtimeInteriorMeshes, sourceInteriorMeshes, 'observatory GLB shadow flags differ from source');

  await navigate(`${production}?diagnostics=1`, "Boolean(document.querySelector('canvas') && window.__twilightRenderInfo)");
  await until(() => evaluate("performance.getEntriesByType('resource').some(entry => entry.name.includes('/models/town.glb'))"), 'production town GLB');
  assert.match(await evaluate("document.querySelector('.world-overlay h1')?.textContent"), /quiet town/);
  assert.equal((await state()).moon, false);
  assert.equal((await state()).water, true);
  await closeGuide();
  await capture('review-square.png');
  const renderer = await evaluate(`(() => {
    const gl = document.querySelector('canvas')?.getContext('webgl2');
    const info = gl?.getExtension('WEBGL_debug_renderer_info');
    return { userAgent: navigator.userAgent, vendor: info ? gl.getParameter(info.UNMASKED_VENDOR_WEBGL) : gl?.getParameter(gl.VENDOR),
      renderer: info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl?.getParameter(gl.RENDERER) };
  })()`);
  const townPerformance = await measure();
  assert.equal(await evaluate("document.querySelector('.site-footer') === null"), true);
  await command('Input.dispatchKeyEvent', { type: 'keyDown', key: 'd', code: 'KeyD', windowsVirtualKeyCode: 68 });
  await pause(450);
  await capture('review-shadow-motion.png');
  await command('Input.dispatchKeyEvent', { type: 'keyUp', key: 'd', code: 'KeyD', windowsVirtualKeyCode: 68 });

  // The portfolio route should not fetch the world bundle or GLBs.
  await navigate(`${production}?view=portfolio`, "Boolean(document.querySelector('#about-title'))");
  assert.equal(await evaluate("performance.getEntriesByType('resource').some(entry => entry.name.includes('/models/town.glb'))"), false);
  assert.equal(await evaluate("Boolean(document.querySelector('.site-footer'))"), true);
  await evaluate("document.querySelector('.view-control button:last-child')?.click()");
  await until(() => evaluate("Boolean(document.querySelector('.world-view'))"), 'world switch');
  assert.equal(await evaluate("document.querySelector('.world-overlay') === null"), true);

  // The diagnostic route changes only the test spawn; it still loads the shipped GLB.
  await navigate(`${production}?diagnostics=1`, 'Boolean(window.__twilightPlayerPosition && window.__twilightRenderInfo)');
  await closeGuide();
  for (const [x, z, label] of [[0, 3.55, 'About Tanish'], [-6.5, 3.1, 'Event Finder'], [6.5, 0.65, 'Experience'], [7.4, 5.55, 'Contact']]) {
    await teleport(x, z);
    await prompt(label);
  }
  await teleport(1.92, 1.35);
  await command('Input.dispatchKeyEvent', { type: 'keyDown', key: 'a', code: 'KeyA', windowsVirtualKeyCode: 65 });
  await pause(850);
  await command('Input.dispatchKeyEvent', { type: 'keyUp', key: 'a', code: 'KeyA', windowsVirtualKeyCode: 65 });
  const fountainX = await evaluate('window.__twilightPlayerPosition.current.x');
  assert.ok(fountainX >= 1.77, `fountain basin collision failed at x=${fountainX}`);

  await teleport(-7, -3.5);
  await settle();
  await capture('review-observatory-exterior.png');
  const sceneMemory = [];
  for (let loop = 0; loop < 3; loop++) {
    await teleport(-8.3, -3.32);
    await prompt('Enter observatory');
    await pressInteraction();
    await until(() => evaluate("document.querySelector('.world-view.interior') && window.__twilightRenderInfo?.scene === 'observatory'"), 'interior transition');
    await until(() => evaluate("performance.getEntriesByType('resource').some(entry => entry.name.includes('/models/observatory.glb'))"), 'production interior GLB');
    await settle(1100);
    const interiorState = await state();
    assert.equal(interiorState.moon, false);
    assert.equal(interiorState.water, false);
    assert.ok(Math.abs(interiorState.camera[1] - 5.1) < 0.05 && interiorState.camera[2] > 8.1, 'interior camera left its safe exterior preset');
    if (loop === 0) {
      await capture('review-observatory-interior.png');
      await teleport(-0.37, 0.34);
      await prompt('Use telescope');
      await pressInteraction();
      await until(() => evaluate("Boolean(document.querySelector('dialog[open]'))"), 'telescope panel');
      assert.equal((await state()).moon, false, 'moon leaked into telescope panel');
      await press('Escape', 'Escape', 27);
      await until(() => evaluate("!document.querySelector('dialog[open]')"), 'closed telescope panel');
    }
    if (loop === 2) sceneMemory.push({ scene: 'interior', ...interiorState, performance: await measure() });
    await teleport(0, 2.35);
    await prompt('Exit observatory');
    await pressInteraction();
    await until(() => evaluate("!document.querySelector('.world-view.interior') && window.__twilightRenderInfo?.scene === 'town'"), 'town return');
    await settle(1000);
    sceneMemory.push({ scene: 'town', ...(await state()) });
  }

  // The faced moon is a live, isolated reveal, and held input cannot resume movement.
  await navigate(`${production}?diagnostics=1`, 'Boolean(window.__twilightPlayerPosition && window.__twilightRenderInfo)');
  await closeGuide();
  await teleport(-3.7, -8.8);
  await prompt('Look at the moon');
  await settle(2300);
  const beforeLookoutCamera = (await state()).camera;
  await command('Input.dispatchKeyEvent', { type: 'keyDown', key: 'd', code: 'KeyD', windowsVirtualKeyCode: 68 });
  await pressInteraction();
  await until(() => evaluate("Boolean(document.querySelector('.lookout-controls') && window.__twilightRenderInfo?.moon)"), 'lookout moon');
  await until(() => evaluate("performance.getEntriesByType('resource').some(entry => entry.name.includes('/models/majoras-moon.glb'))"), 'lookout moon GLB');
  assert.equal((await state()).water, false);
  await settle(2500);
  await capture('review-lookout.png');
  await press('Escape', 'Escape', 27);
  await until(() => evaluate("!document.querySelector('.lookout-controls') && !window.__twilightRenderInfo?.moon && window.__twilightRenderInfo?.water"), 'lookout Escape return');
  await settle(2200);
  await capture('review-lookout-return.png');
  const afterLookoutCamera = (await state()).camera;
  assert.ok(Math.hypot(...afterLookoutCamera.map((value, index) => value - beforeLookoutCamera[index])) < 0.6, 'exploration camera did not return');
  const heldPosition = await evaluate('({ ...window.__twilightPlayerPosition.current })');
  await pause(500);
  const clearedPosition = await evaluate('({ ...window.__twilightPlayerPosition.current })');
  assert.ok(Math.hypot(clearedPosition.x - heldPosition.x, clearedPosition.z - heldPosition.z) < 0.02, 'held input resumed after lookout');
  await command('Input.dispatchKeyEvent', { type: 'keyUp', key: 'd', code: 'KeyD', windowsVirtualKeyCode: 68 });
  await prompt('Look at the moon');
  await pressInteraction();
  await until(() => evaluate("Boolean(document.querySelector('.lookout-controls'))"), 'second lookout entry');
  await evaluate("document.querySelector('.lookout-controls button').click()");
  await until(() => evaluate("!window.__twilightRenderInfo?.moon"), 'button return from lookout');

  await command('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await navigate(`${production}?diagnostics=1`, 'Boolean(window.__twilightPlayerPosition && window.__twilightRenderInfo)');
  await closeGuide();
  await teleport(-3.7, -8.8);
  await prompt('Look at the moon');
  await pressInteraction();
  await until(() => evaluate("Boolean(window.__twilightRenderInfo?.moon)"), 'reduced-motion lookout');
  assert.equal(await evaluate("getComputedStyle(document.querySelector('.world-view'), '::before').animationName"), 'none');
  assert.equal(await evaluate("getComputedStyle(document.querySelector('.scene-fade')).transitionDuration"), '0s');
  await command('Emulation.setEmulatedMedia', { features: [] });

  // The separate moon asset can fail without preventing the lookout exit.
  await command('Network.setCacheDisabled', { cacheDisabled: true });
  await command('Network.setBlockedURLs', { urls: ['*majoras-moon.glb'] });
  await navigate(`${production}?diagnostics=1`, 'Boolean(window.__twilightPlayerPosition && window.__twilightRenderInfo)');
  await closeGuide();
  await teleport(-3.7, -8.8);
  await prompt('Look at the moon');
  await pressInteraction();
  await until(() => evaluate("Boolean(document.querySelector('.lookout-credit[role=status]') && window.__twilightRenderInfo?.moon)"), 'generated moon fallback');
  await evaluate("document.querySelector('.lookout-controls button').click()");
  await until(() => evaluate("!window.__twilightRenderInfo?.moon"), 'fallback moon return');

  // Block the shipped town GLB to exercise primitive fallback and the HTML route.
  await command('Network.setBlockedURLs', { urls: ['*town.glb'] });
  await navigate(`${production}?diagnostics=1`, "Boolean(document.querySelector('.world-view'))");
  await evaluate("document.querySelector('.world-guide-reopen')?.click()");
  await until(() => evaluate("Boolean(document.querySelector('.world-overlay [role=status]'))"), 'town asset fallback');
  assert.equal((await state()).moon, false);
  await command('Network.setBlockedURLs', { urls: [] });

  // A missing WebGL context must offer the portfolio instead of a blank canvas.
  await command('Page.addScriptToEvaluateOnNewDocument', { source: `(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(kind, ...args) {
      if (kind === 'webgl' || kind === 'webgl2' || kind === 'experimental-webgl') return null;
      return original.call(this, kind, ...args);
    };
  })()` });
  await navigate(production, "Boolean(document.querySelector('.world-message'))");
  await evaluate("document.querySelector('.world-message button:last-child').click()");
  await until(() => evaluate("Boolean(document.querySelector('#about-title'))"), 'WebGL fallback portfolio');

  const assets = Object.fromEntries(await Promise.all(['town.glb', 'observatory.glb', 'majoras-moon.glb'].map(async (name) => {
    const file = resolve(root, 'public/models', name);
    const buffer = await readFile(file);
    const jsonSize = buffer.readUInt32LE(12);
    const gltf = JSON.parse(buffer.toString('utf8', 20, 20 + jsonSize));
    const alpha = Object.groupBy(gltf.materials ?? [], (material) => material.alphaMode ?? 'OPAQUE');
    const summary = { bytes: (await stat(file)).size, meshes: gltf.meshes?.length ?? 0,
      materials: gltf.materials?.length ?? 0, textures: gltf.textures?.length ?? 0,
      opaque: alpha.OPAQUE?.length ?? 0, transparent: (alpha.BLEND?.length ?? 0) + (alpha.MASK?.length ?? 0) };
    if (name !== 'majoras-moon.glb') assert.equal(summary.transparent, 0, `${name} gained a transparent static material`);
    return [name, summary];
  })));
  const report = { browser: renderer, assets, sourceTownMeshes, runtimeTownMeshes,
    sourceInteriorMeshes, runtimeInteriorMeshes, town: townPerformance, sceneChanges: sceneMemory, checks: {
    sourceAndRuntimeCaptured: true, worldFirstAndPortfolio: true, fountainCollisionAndAnchors: true,
    repeatedObservatoryLoops: 3, telescopePanel: true, lookoutEscapeAndButton: true,
    moonAndWaterIsolation: true, clearedInputAndCameraReturn: true, reducedMotion: true,
    moonAssetRecovery: true, failedAssetRecovery: true,
  } };
  await writeFile(resolve(root, 'preview', 'production-review.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} finally {
  clearInterval(keepAlive);
  socket?.close();
  browser.kill();
  preview.kill();
  dev.kill();
  await pause(500);
  await rm(profile, { recursive: true, force: true }).catch(() => {});
}
