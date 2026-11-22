import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';

const targets = await (await fetch('http://127.0.0.1:9223/json')).json();
const target = targets.find((item) => item.type === 'page' && item.url.includes('127.0.0.1:4173'));
if (!target) throw new Error('Production preview tab not found');
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
let id = 0;
const pending = new Map();
socket.onmessage = ({ data }) => {
  const message = JSON.parse(data);
  if (!message.id) return;
  const entry = pending.get(message.id);
  if (!entry) return;
  pending.delete(message.id);
  if (message.error) entry.reject(new Error(message.error.message)); else entry.resolve(message.result);
};
function command(method, params = {}) {
  const next = ++id;
  return new Promise((resolve, reject) => {
    pending.set(next, { resolve, reject });
    socket.send(JSON.stringify({ id: next, method, params }));
  });
}
async function evaluate(expression) {
  const result = await command('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text);
  return result.result.value;
}
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function screenshot(path) {
  const result = await command('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  await writeFile(path, Buffer.from(result.data, 'base64'));
}
await command('Page.enable');
await command('Runtime.enable');
await command('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
await command('Page.navigate', { url: 'http://127.0.0.1:4173/' });
await pause(1200);
const initial = await evaluate(`({heading: document.querySelector('#about-title')?.textContent,
  note: document.querySelector('.explore-note')?.textContent,
  worldRequests: performance.getEntriesByType('resource').filter(e => ['WorldExperience', 'three.core', 'town.glb'].some(part => e.name.includes(part))).length})`);
assert.equal(initial.heading, 'Tanish Banota');
assert.match(initial.note, /keyboard/);
assert.equal(initial.worldRequests, 0);
await screenshot('preview/phase7-desktop.png');

await evaluate("document.querySelector('.view-switch button:last-child').click()");
await pause(2600);
const world = await evaluate(`({canvas: !!document.querySelector('canvas'), heading: document.querySelector('.world-overlay h1')?.textContent,
  worldRequests: performance.getEntriesByType('resource').filter(e => ['WorldExperience', 'three.core', 'town.glb'].some(part => e.name.includes(part))).length})`);
assert.equal(world.canvas, true);
assert.match(world.heading, /quiet town/);
assert.ok(world.worldRequests > 0);
await evaluate("window.dispatchEvent(new KeyboardEvent('keydown', {key:'e', bubbles:true}))");
await pause(250);
assert.equal(await evaluate("document.querySelector('dialog[open] h2')?.textContent"), 'About');
await evaluate("document.querySelector('dialog[open]').close()");
await pause(150);
assert.equal(await evaluate("!!document.querySelector('dialog[open]')"), false);
await evaluate("document.querySelector('.site-header nav a[href=\"#projects\"]').click()");
await pause(150);
assert.equal(await evaluate("document.querySelector('#projects-title')?.textContent"), 'Projects');
assert.equal(await evaluate('window.location.hash'), '#projects');

await command('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
await command('Page.navigate', { url: 'http://127.0.0.1:4173/' });
await pause(900);
const mobile = await evaluate(`({about: !!document.querySelector('#about-title'), projects: !!document.querySelector('#projects-title'),
  contact: !!document.querySelector('#contact-title'), overflow: document.documentElement.scrollWidth > innerWidth})`);
assert.deepEqual(mobile, { about: true, projects: true, contact: true, overflow: false });
await screenshot('preview/phase7-mobile.png');

await command('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
await command('Page.navigate', { url: 'http://127.0.0.1:4173/' });
await pause(900);
await evaluate("document.querySelector('.view-switch button:last-child').click()");
await pause(1200);
const reducedMotion = await evaluate(`({preferred: matchMedia('(prefers-reduced-motion: reduce)').matches,
  stars: getComputedStyle(document.querySelector('.world-view'), '::before').animationName,
  fade: getComputedStyle(document.querySelector('.scene-fade')).transitionDuration})`);
assert.deepEqual(reducedMotion, { preferred: true, stars: 'none', fade: '0s' });
await command('Emulation.setEmulatedMedia', { features: [] });

await command('Page.addScriptToEvaluateOnNewDocument', { source: `(() => {
  const original = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function(kind, ...args) {
    if (kind === 'webgl' || kind === 'webgl2' || kind === 'experimental-webgl') return null;
    return original.call(this, kind, ...args);
  };
})()` });
await command('Page.navigate', { url: 'http://127.0.0.1:4173/' });
await pause(900);
await evaluate("document.querySelector('.view-switch button:last-child').click()");
await pause(250);
assert.match(await evaluate("document.querySelector('.world-message h1')?.textContent"), /could not open/);
await evaluate("document.querySelector('.world-message button:last-child').click()");
assert.equal(await evaluate("document.querySelector('#about-title')?.textContent"), 'Tanish Banota');
console.log(JSON.stringify({ initial, world, mobile, reducedMotion, webglFailureRecovered: true }, null, 2));
socket.close();
