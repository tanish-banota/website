import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { isAbsolute, join, relative, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const appPort = 51000 + Math.floor(Math.random() * 10000);
const appUrl = `http://127.0.0.1:${appPort}/`;
const browserPath = process.env.TWILIGHT_BROWSER || [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
].find(existsSync);
if (!browserPath) throw new Error('Set TWILIGHT_BROWSER to a Chrome or Edge executable');
const profile = await mkdtemp(join(tmpdir(), 'twilight-export-'));
const vite = spawn(process.execPath, [resolve(root, 'node_modules/vite/bin/vite.js'), '--host', '127.0.0.1', '--port', String(appPort), '--strictPort'], { cwd: root, stdio: 'ignore' });
const browser = spawn(browserPath, ['--headless=new', '--disable-gpu', '--enable-unsafe-swiftshader', '--no-first-run', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });
browser.stderr.on('data', (chunk) => { if (process.env.TWILIGHT_EXPORT_DEBUG) process.stderr.write(chunk); });
const delay = (ms) => new Promise((resolveDelay) => setTimeout(resolveDelay, ms));
async function until(task, label) {
  const deadline = Date.now() + 60000;
  let last;
  while (Date.now() < deadline) {
    try { const result = await task(); if (result) return result; } catch (error) { last = error; }
    await delay(150);
  }
  throw new Error(`Timed out waiting for ${label}${last ? `: ${last.message}` : ''}`);
}
let socket;
const keepAlive = setInterval(() => {}, 1000);
try {
  await until(async () => (await fetch(appUrl)).ok, 'Vite');
  const port = await until(async () => Number((await readFile(join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]), 'browser debugger');
  const target = await until(async () => (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find((item) => item.type === 'page'), 'browser page');
  socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolveOpen, reject) => { socket.onopen = resolveOpen; socket.onerror = reject; });
  if (process.env.TWILIGHT_EXPORT_DEBUG) console.log('Connected to', target.webSocketDebuggerUrl);
  let id = 0;
  const pending = new Map();
  socket.onmessage = ({ data }) => {
    const message = JSON.parse(data);
    if (!message.id) return;
    const entry = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) entry.reject(new Error(message.error.message)); else entry.resolve(message.result);
  };
  function command(method, params = {}) {
    const next = ++id;
    return new Promise((resolveCommand, reject) => {
      pending.set(next, { resolve: resolveCommand, reject });
      socket.send(JSON.stringify({ id: next, method, params }));
      setTimeout(() => { if (pending.delete(next)) reject(new Error(`${method} timed out (socket ${socket.readyState})`)); }, 30000);
    });
  }
  async function evaluate(expression) {
    const result = await command('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text);
    return result.result.value;
  }
  await command('Runtime.enable');
  await command('Page.enable');
  await command('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await mkdir(resolve(root, 'public/models'), { recursive: true });
  for (const [name, file, global] of [
    ['Town', 'town.glb', '__twilightTownKit'],
    ['Observatory', 'observatory.glb', '__twilightObservatoryKit'],
  ]) {
    await command('Page.navigate', { url: `${appUrl}?asset-export=${name.toLowerCase()}` });
    await until(() => evaluate(`Boolean(window.${global})`), `${name} source kit`);
    const base64 = await evaluate(`import('/src/world/exportAssets.ts').then(m => m.exportKit('${name}'))`);
    const buffer = Buffer.from(base64, 'base64');
    assert.equal(buffer.toString('ascii', 0, 4), 'glTF');
    const jsonLength = buffer.readUInt32LE(12);
    const names = JSON.parse(buffer.toString('utf8', 20, 20 + jsonLength)).nodes?.map((node) => node.name) ?? [];
    const requiredGroups = name === 'Town'
      ? ['ClockTower', 'Fountain', 'FountainCrest', 'ObservatoryExterior', 'TriangulatedDome', 'DomePanels', 'DomeRibs', 'ObservatoryDoor', 'RoofTelescope']
      : ['ObservatoryInterior', 'ObservatoryFloor', 'InteriorStarDome', 'TiledLowerWall', 'StarPanels', 'DomeRibs', 'Telescope', 'Eyepiece', 'StarDisplay'];
    assert.ok(requiredGroups.every((group) => names.includes(group)), `${file} lost replaceable groups`);
    assert.ok(!names.includes('FountainWater'), `${file} contains runtime water`);
    await writeFile(resolve(root, 'public/models', file), buffer);
    console.log(`${file}: ${buffer.length} bytes; landmark groups preserved`);
  }
  await command('Page.navigate', { url: appUrl });
  await until(() => evaluate('Boolean(window.__twilightRuntimeAsset)'), 'normal application GLB');
  const runtime = await evaluate(`(() => {
    const asset = window.__twilightRuntimeAsset;
    const tower = asset.getObjectByName('ClockTower');
    const colors = [];
    tower?.traverse(object => { if (object.isMesh && object.material.color) colors.push(object.material.color.getHexString()); });
    return { tower: Boolean(tower), face: Boolean(asset.getObjectByName('ClockFace')),
      paving: Boolean(asset.getObjectByName('PlazaPaving')),
      fountain: Boolean(asset.getObjectByName('Fountain')),
      dome: Boolean(asset.getObjectByName('TriangulatedDome')),
      telescope: Boolean(asset.getObjectByName('RoofTelescope')), colors,
      request: performance.getEntriesByType('resource').some(entry => entry.name.includes('/models/town.glb')) };
  })()`);
  assert.ok(runtime.tower && runtime.face && runtime.paving && runtime.fountain && runtime.dome && runtime.telescope && runtime.request,
    'normal application did not load the exported square landmarks');
  const expected = process.argv.find((arg) => arg.startsWith('--expect-clock-color='))?.split('=')[1]?.replace('#', '').toLowerCase();
  if (expected) assert.ok(runtime.colors.includes(expected), `normal application clock colors ${runtime.colors.join(', ')} lack ${expected}`);
  console.log(`Normal application loaded exported GLB; clock colors: ${runtime.colors.join(', ')}`);
  await command('Page.navigate', { url: `${appUrl}?preview=observatory` });
  await until(() => evaluate("Boolean(window.__twilightRuntimeAsset?.getObjectByName('ObservatoryInterior'))"), 'normal application observatory GLB');
  const interior = await evaluate(`(() => {
    const asset = window.__twilightRuntimeAsset;
    return {
      dome: Boolean(asset.getObjectByName('InteriorStarDome')),
      panels: Boolean(asset.getObjectByName('StarPanels')),
      eyepiece: Boolean(asset.getObjectByName('Eyepiece')),
      display: Boolean(asset.getObjectByName('StarDisplay')),
      wall: Boolean(asset.getObjectByName('TiledLowerWall')),
      request: performance.getEntriesByType('resource').some(entry => entry.name.includes('/models/observatory.glb')),
    };
  })()`);
  assert.ok(interior.dome && interior.panels && interior.eyepiece && interior.display && interior.wall && interior.request,
    'normal application did not load the exported observatory landmarks');
  console.log('Normal application loaded exported observatory GLB');
  const screenshot = process.argv.find((arg) => arg.startsWith('--screenshot='))?.slice('--screenshot='.length);
  if (screenshot) {
    const preview = process.argv.find((arg) => arg.startsWith('--preview='))?.slice('--preview='.length) ?? 'style-sample';
    await command('Page.navigate', { url: preview === 'plaza' ? appUrl : `${appUrl}?preview=${encodeURIComponent(preview)}` });
    await until(() => evaluate('Boolean(window.__twilightRuntimeAsset)'), `${preview} GLB`);
    await evaluate("document.querySelector('.world-guide-close')?.click()");
    await delay(800);
    const capture = await command('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    const destination = resolve(root, screenshot);
    const previewRoot = resolve(root, 'preview');
    const screenshotWithinPreview = relative(previewRoot, destination);
    if (!screenshotWithinPreview || screenshotWithinPreview.startsWith('..') || isAbsolute(screenshotWithinPreview)) throw new Error('Screenshot path must be inside preview/');
    await mkdir(resolve(root, 'preview'), { recursive: true });
    await writeFile(destination, Buffer.from(capture.data, 'base64'));
    console.log(`Normal gameplay zoom screenshot: ${screenshot}`);
    if (process.argv.includes('--shadow-check')) {
      await evaluate("window.dispatchEvent(new KeyboardEvent('keydown', { key: 'd' }))");
      await delay(400);
      await evaluate("window.dispatchEvent(new KeyboardEvent('keyup', { key: 'd' }))");
      await delay(650);
      const moved = await command('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
      await writeFile(resolve(previewRoot, 'style-sample-moved.png'), Buffer.from(moved.data, 'base64'));
      console.log('Movement shadow check: preview/style-sample-moved.png');
    }
  }
} finally {
  clearInterval(keepAlive);
  socket?.close();
  browser.kill();
  vite.kill();
  await delay(300);
  await rm(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
}
