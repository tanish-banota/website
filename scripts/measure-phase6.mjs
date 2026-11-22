import { writeFile } from 'node:fs/promises';

const targets = await (await fetch('http://127.0.0.1:9222/json')).json();
const target = targets.find((item) => item.type === 'page' && item.url.includes('127.0.0.1:5173'));
if (!target) throw new Error('Local preview tab not found');
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
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value;
}
await command('Runtime.enable');
await command('Page.enable');
await command('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
const scene = process.argv.includes('--observatory') ? 'observatory' : 'town';
await command('Page.navigate', { url: scene === 'town' ? 'http://127.0.0.1:5173/' : 'http://127.0.0.1:5173/?preview=observatory' });
await new Promise((resolve) => setTimeout(resolve, 1000));
if (scene === 'town') await evaluate("document.querySelector('.view-switch button:last-child').click()");
await new Promise((resolve) => setTimeout(resolve, 6200));
const metrics = await evaluate('window.__twilightMetrics ?? null');
const screenshot = await command('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
const screenshotPath = `preview/phase6-${scene}.png`;
await writeFile(screenshotPath, Buffer.from(screenshot.data, 'base64'));
console.log(JSON.stringify({ metrics, screenshot: screenshotPath, webgl: await evaluate("!!document.querySelector('canvas')") }, null, 2));
socket.close();
