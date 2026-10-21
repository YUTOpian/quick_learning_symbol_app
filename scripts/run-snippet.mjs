// 入門1のコード例を、アプリのコンソール（Sokushu.tsx の run / fmt）と同じ変換・表示で実行して、出力を標準出力に書く。
// 使い方: node scripts/run-snippet.mjs <コードのファイル> [ノードURL]
import fs from 'node:fs';

const src = fs.readFileSync(process.argv[2], 'utf8');
const node = process.argv[3] ?? 'https://sym-test-01.opening-line.jp:3001';

// ── Sokushu.tsx の fmt と同じ ──
const fmt = (x) => {
  if (typeof x === 'string') return x;
  const seen = new WeakSet();
  try {
    return JSON.stringify(x, (_k, v) => {
      if (typeof v === 'bigint') return `${v}n`;
      if (v instanceof Uint8Array) return `${v.constructor.name}(${v.length}) ` + Array.from(v, (b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();
      if (v && typeof v === 'object') { if (seen.has(v)) return '[Circular]'; seen.add(v); }
      return v;
    }, 2) ?? String(x);
  } catch { return String(x); }
};

const out = [];
for (const m of ['log', 'warn', 'error']) console[m] = (...a) => { out.push(a.map(fmt).join(' ')); };

// ── fetch は本物の通信をしない。ノードの代わりに、決まった応答を返す（出力例は「一例」）──
const J = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { 'Content-Type': 'application/json' } });
globalThis.fetch = async (input, init) => {
  const u = new URL(typeof input === 'string' ? input : input.url ?? String(input));
  if (u.pathname === '/node/health') return J({ status: { apiNode: 'up', db: 'up' } });
  if (u.pathname === '/chain/info') return J({ height: '1234567', scoreHigh: '0', scoreLow: '987654321', latestFinalizedBlock: { height: '1234500', hash: 'A1B2C3', finalizationEpoch: 1000, finalizationPoint: 5 } });
  return J({ code: 'ResourceNotFound', message: `no resource exists with id '${u.pathname.split('/').pop()}'` }, 404);
};

// ── Sokushu.tsx の run と同じ変換 ──
const asyncFns = [...src.matchAll(/^async\s+function\s+(\w+)\s*\(/gm)].map((m) => `globalThis.${m[1]} = ${m[1]};`).join('\n');
const code = asyncFns + '\n' + src
  .replace(/window\.origin/g, JSON.stringify(node))
  .replace(/^(const|let|var)\s+/gm, '')
  .replace(/^function\s+(\w+)\s*\(/gm, '$1 = function(');

process.on('exit', () => { process.stdout.write(out.join('\n')); });
setTimeout(() => { out.push('[TIMEOUT]'); process.exit(1); }, 15000).unref();
try {
  const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor;
  await new AsyncFunction(code)();
} catch (e) { out.push(String(e)); }
