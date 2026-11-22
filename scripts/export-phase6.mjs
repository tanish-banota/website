import { mkdir, writeFile } from 'node:fs/promises';

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
await command('Runtime.enable');
await command('Page.enable');
await command('Page.navigate', { url: 'http://127.0.0.1:5173/?asset-export=town' });
await new Promise((resolve) => setTimeout(resolve, 1500));
await mkdir('public/models', { recursive: true });
for (const [name, path] of [['Town', 'town.glb'], ['Observatory', 'observatory.glb']]) {
  if (name === 'Observatory') {
    await command('Page.navigate', { url: 'http://127.0.0.1:5173/?asset-export=observatory' });
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
  const base64 = await evaluate(`import('/src/world/exportAssets.ts').then(m => m.exportKit('${name}'))`);
  const buffer = Buffer.from(base64, 'base64');
  await writeFile(`public/models/${path}`, buffer);
  console.log(path, buffer.length, 'bytes');
}
socket.close();
