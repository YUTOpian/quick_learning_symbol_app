// 入門1（JavaScript）のコード例の出力を、実際に実行して js1/gen.ts に書き出す。
// 使い方: node scripts/gen-js1.mjs
// js1/snippets.txt の書式:  "@@ キー [norun]" の行から次の "@@" の行までが1つのコード例。norun は実行しない（出力なし）。
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, 'src/pages/sokushu/js1');
const text = fs.readFileSync(path.join(dir, 'snippets.txt'), 'utf8');

const blocks = [];
for (const line of text.split('\n')) {
  const m = line.match(/^@@ (\w+)( norun)?\s*$/);
  if (m) blocks.push({ key: m[1], norun: !!m[2], lines: [] });
  else if (blocks.length) blocks[blocks.length - 1].lines.push(line);
}

const tmp = fs.mkdtempSync(path.join(process.env.TMPDIR ?? '/tmp', 'js1-'));
const J = {}, O = {};
for (const b of blocks) {
  const code = b.lines.join('\n').replace(/\n+$/, '');
  if (b.key in J) throw new Error('キーが重複: ' + b.key);
  J[b.key] = code;
  if (b.norun) continue;
  const f = path.join(tmp, b.key + '.js');
  fs.writeFileSync(f, code);
  const r = spawnSync('node', [path.join(root, 'scripts/run-snippet.mjs'), f], { encoding: 'utf8', timeout: 30000 });
  O[b.key] = (r.stdout ?? '') + (r.stderr ? '\n[stderr] ' + r.stderr : '');
}
fs.rmSync(tmp, { recursive: true, force: true });

const out = '// 自動生成（scripts/gen-js1.mjs）。js1/snippets.txt を実行した結果。手で編集しない。\n'
  + 'export const J: Record<string, string> = ' + JSON.stringify(J, null, 1) + ';\n'
  + 'export const O: Record<string, string> = ' + JSON.stringify(O, null, 1) + ';\n';
fs.writeFileSync(path.join(dir, 'gen.ts'), out);
console.log(blocks.length + ' 個のコード例を処理しました');
