import type { ComponentType } from 'react';
import { Code, Out, H, H3, P } from './ui';
import { Ul, B, Note, Tbl, Q, L } from './introParts';
import { Js1 } from './Js1';
import { FigAddress, FigAddressBytes, FigAddressBase32, FigBase32, FigBlock, FigLedger, FigFork, FigMerkleProof, FigTxState, FigBinary, FigBitOps, FigConsensus, FigHash, FigHashChain, FigMerkleSmall, FigSigFlow, FigKeyUse, FigKeyExchange, FigSymbolParts, FigText, FigTxFlow, FigEndian, FigField, FigEdwardsCurve, FigFiniteCurve, FigFlags, FigInverse, FigMap, FigMerkle, FigMod, FigMul, FigOneWay, FigPow, FigRealCurve, FigSets, FigSign, FigNodeRoles, FigNamespaceTree, FigTxBytes, FigPerm, FigNumRange, FigHistoryState, FigFinality, FigUint64, FigTimestamp, FigAmount, FigAggregate, FigFee, FigSdkLayers, FigNemRelation, FigNemFee, FigNemImportance, FigNemVesting, FigNemDelegate, FigNemAddress, FigNemMosaic, FigNemMultisig, FigNemEvolution } from './figs';


// 共通: Uint8Array → 16進文字列。コードを単独で実行できるよう、各スニペットに含める。
const HEX = 'const hex = (u8) => Array.from(u8, (b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();';
const SHA = HEX + '\nconst sha = async (s) => hex(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s))));';

// 3.10 ハッシュ関数の体験コード。MCの番号に影響しないよう、MCの外に置く。
const HASH_LEN = SHA + '\n' + `for (const s of ["", "a", "Hello", "あ".repeat(10000)]) {
  const h = await sha(s);
  console.log("入力", String(s.length).padStart(5), "文字 →", h.length, "桁", h.slice(0, 16) + "…");
}`;
const HASH_AVALANCHE = SHA + '\n' + `const diffBits = (a, b) => {                       // 16進文字列の2つが、何ビット違うかを数える
  let n = 0;
  for (let i = 0; i < a.length; i++) n += (parseInt(a[i], 16) ^ parseInt(b[i], 16)).toString(2).replace(/0/g, "").length;
  return n;
};
const h1 = await sha("Hello");
const h2 = await sha("hello");                     // 「H」と「h」は、文字コードで1ビットだけ違う
console.log(h1);
console.log(h2);
console.log("違うビット:", diffBits(h1, h2), "／ 256");
let sum = 0;
for (const c of "abcdefghijklmnopqrstuvwxyz") sum += diffBits(await sha(c), await sha(c.toUpperCase()));
console.log("26組の平均:", (sum / 26).toFixed(1), "ビット（256ビット中）");`;
const HASH_BRUTE = SHA + '\n' + `const target = "A388F562E286FDF28986F9253579F4D096446E01DD0C771996A51FF11B390FA2";   // 4桁の暗証番号のハッシュ
let found = null, tries = 0;
for (let i = 0; i < 10000; i++) {                  // 0000〜9999を、1つずつハッシュにして比べる
  const pin = String(i).padStart(4, "0");
  tries++;
  if (await sha(pin) === target) { found = pin; break; }
}
console.log("見つかった暗証番号:", found);
console.log("試した回数:", tries, "／ 全部で10000通り");`;

// ───────── 共通部品とコード例 ─────────

// 第1章のコード例（上から順に実行する前提）。
// 3.5 バイナリ法（上位ビットから読む向き）。MCの番号に影響しないよう、MCの外に置く。
const BIN_TOP = `const powmodTop = (b, e, m) => {
  let r = 1n; b %= m;
  for (const bit of e.toString(2)) {          // 指数の2進数を、上位ビットから1つずつ読む
    r = (r * r) % m;                          // まず2乗する（指数が2倍になる）
    if (bit === "1") r = (r * b) % m;         // ビットが1なら b を掛ける（指数が+1になる）
    console.log(bit, Number(r));
  }
  return r;
};
console.log("ビット r");
console.log("3^13 mod 17 =", powmodTop(3n, 13n, 17n));`;

const MC: string[] = [
`console.log((255).toString(2), (255).toString(16), parseInt("FF", 16));
for (const bits of [8, 16, 32, 64]) console.log("uint" + bits, "= 0 〜", 2n ** BigInt(bits) - 1n);
console.log("2^256 =", 2n ** 256n);
console.log("10進で", (2n ** 256n).toString().length, "桁");`,
`console.log(Number.MAX_SAFE_INTEGER, 2 ** 53 + 1);   // 丸められて正しくない
console.log(2n ** 53n + 1n);                          // BigIntなら正確
console.log(18446744073709551615n + 1n);              // uint64の上限を超える`,
`const toLE = (v, n) => Array.from({ length: n }, (_, i) => Number((v >> BigInt(8 * i)) & 255n));
console.log("1000000 =", (1000000).toString(16));
console.log("リトルエンディアン8バイト:", toLE(1000000n, 8));`,
`console.log(0b1010 & 0b0110, 0b1010 | 0b0110, 0b1010 ^ 0b0110);
console.log(1 << 4, 256 >> 2);
console.log((0xA5 ^ 0x3C).toString(16), (0xA5 ^ 0x3C ^ 0x3C).toString(16));   // 2回XORで元に戻る`,
`const P = { read: 4, write: 2, exec: 1 };
const perm = P.read | P.write;   // ORで立てる
console.log(perm, perm.toString(2).padStart(3, "0"));
for (const [k, bit] of Object.entries(P)) console.log(k, (perm & bit) !== 0);   // ANDで調べる`,
`console.log(17 % 5, -3 % 5, ((-3 % 5) + 5) % 5);
console.log((7 * 8) % 5, ((7 % 5) * (8 % 5)) % 5);       // 途中でmodを取っても同じ
console.log([0, 1, 2, 3, 4, 5, 6].map((i) => (i * 3) % 7));  // 0〜6が1回ずつ現れる（nが素数のとき）`,
`const gcd = (a, b) => (b === 0n ? a : gcd(b, a % b));
const egcd = (a, b) => {                        // a*x + b*y = gcd を満たす [gcd, x, y]
  if (b === 0n) return [a, 1n, 0n];
  const [g, x, y] = egcd(b, a % b);
  return [g, y, x - (a / b) * y];
};
const invm = (a, m) => { const [, x] = egcd(((a % m) + m) % m, m); return ((x % m) + m) % m; };
console.log(gcd(48n, 18n), egcd(3n, 11n));
console.log("3の逆元 (mod 11) =", invm(3n, 11n), "確認:", (3n * invm(3n, 11n)) % 11n);`,
`const powmod = (b, e, m) => {
  let r = 1n; b %= m;
  while (e > 0n) { if (e & 1n) r = (r * b) % m; b = (b * b) % m; e >>= 1n; }
  return r;
};
console.log(powmod(3n, 200n, 13n));
console.log(powmod(3n, 10n ** 60n, 1000000007n));   // 指数が巨大でも一瞬`,
`console.log(powmod(3n, 10n, 11n));                 // 1（p=11, a=3）
console.log(powmod(3n, 11n - 2n, 11n), invm(3n, 11n));   // どちらも逆元 4`,
`const sieve = (n) => { const a = Array(n + 1).fill(true); a[0] = a[1] = false;
  for (let i = 2; i * i <= n; i++) if (a[i]) for (let j = i * i; j <= n; j += i) a[j] = false;
  return a.flatMap((ok, i) => (ok ? [i] : [])); };
console.log(sieve(60));
const field = 2n ** 255n - 19n;     // Ed25519が使う素数（名前の由来）
console.log(field.toString(16));
const a1 = 123456789123456789n;
console.log("a × a⁻¹ mod p =", (a1 * powmod(a1, field - 2n, field)) % field);   // 1`,
`for (const p of [65537, 1000003, 10000019]) {
  const e = p - 3, t = Number(powmod(3n, BigInt(e), BigInt(p)));
  let x = 1, k = 0; const t0 = performance.now();
  while (x !== t) { x = (x * 3) % p; k++; }
  console.log("p =", p, " 総当たり", k, "回", Math.round(performance.now() - t0), "ms");
}
console.log("256ビットなら約 2^256 回 =", 2n ** 256n);`,
`const fp = 17n;
const md = (a) => ((a % fp) + fp) % fp;
const invp = (a) => { for (let i = 1n; i < fp; i++) if (md(a * i) === 1n) return i; };
const eadd = (P, Q) => {
  if (P === null) return Q;
  if (Q === null) return P;
  const [x1, y1] = P, [x2, y2] = Q;
  if (x1 === x2 && md(y1 + y2) === 0n) return null;            // 無限遠点O
  const s = x1 === x2 ? md((3n * x1 * x1 + 2n) * invp(2n * y1)) : md((y2 - y1) * invp(x2 - x1));
  const x3 = md(s * s - x1 - x2);
  return [x3, md(s * (x1 - x3) - y1)];
};
const G = [5n, 1n];
let acc = null; const rows = [];
for (let k = 1; k <= 19; k++) { acc = eadd(acc, G); rows.push("k=" + k + ": " + (acc ? "(" + acc[0] + ", " + acc[1] + ")" : "O（無限遠点）")); }
console.log(rows.join("\\n"));`,
`const p = 2n ** 255n - 19n;                                      // 体の大きさ（素数）
const mod = (a) => ((a % p) + p) % p;                              // 負の数も 0〜p−1 に直す
const pw = (b, e) => powmod(mod(b), e, p);                         // べき乗 mod p（繰り返し二乗法）
const inv = (a) => pw(a, p - 2n);                                  // 逆元（フェルマーの小定理）
const d = mod(-121665n * inv(121666n));                            // 曲線の定数 d = −121665 ÷ 121666
console.log("d =", d);
console.log("d × 121666 ≡ −121665 :", mod(d * 121666n) === mod(-121665n));`,
`const hexs = (a) => a.map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
const encode = ([x, y]) => { const b = toLE(y, 32); b[31] |= Number(x & 1n) << 7; return hexs(b); };
console.log(encode(B));   // 58666666…6666 になれば正しい
const a = 0x1234567890ABCDEFn * 2n ** 128n + 987654321n;   // 秘密のスカラー（例）
const A = mul(a, B);                                         // 公開鍵 A = a × B
console.log("公開鍵:", encode(A));`,
`${SHA}
const same = (P, Q) => P[0] === Q[0] && P[1] === Q[1];
const r = 31415926535897932384626433832795n;
const R = mul(r, B);
const h = BigInt("0x" + await sha(encode(R) + encode(A) + "hello")) % L;   // 本物はSHA-512（標準のEd25519）だが、仕組みは同じ
const S = (r + h * a) % L;
console.log("署名の検算:", same(mul(S, B), add(R, mul(h, A))));
const h2 = BigInt("0x" + await sha(encode(R) + encode(A) + "hellO")) % L;  // メッセージが1文字違う
console.log("改ざん後の検算:", same(mul(S, B), add(R, mul(h2, A))));`,
`const n = 1e12;                                    // 1兆個のハッシュを作ったとして
console.log("256ビットで衝突する確率 ≈", (n * n) / 2 ** 257);
console.log("衝突が50%になる個数 ≈ 2^128 =", 2n ** 128n);
console.log("宇宙の原子の数 ≈ 10^80 ≈ 2^", Math.round(80 * Math.log2(10)));
console.log("32ビットなら:", (n * n) / 2 ** 33);       // 1を超える＝確実に衝突`,
`for (const n of [4, 1000, 1000000, 1e9]) console.log(n, "件 → 証明に必要なハッシュ", Math.ceil(Math.log2(n)), "個");`,
`const comb = (n, m) => { let r = 1n; for (let i = 1n; i <= BigInt(m); i++) r = (r * (BigInt(n) - BigInt(m) + i)) / i; return r; };
console.log("3人中2人:", comb(3, 2), "／5人中3人:", comb(5, 3), "／10人中6人:", comb(10, 6));`,
`const signers = new Set(["Alice", "Bob", "Carol"]);
const online = new Set(["Bob", "Carol", "Dave"]);
console.log("Bob ∈ signers:", signers.has("Bob"), "／Dave ∈ signers:", signers.has("Dave"));
console.log("元の個数 |signers| =", signers.size);
console.log("和集合:", [...new Set([...signers, ...online])].join(", "));
console.log("共通部分:", [...signers].filter((x) => online.has(x)).join(", "));
console.log("差集合 signers − online:", [...signers].filter((x) => !online.has(x)).join(", "));`,
`const n6 = 6, sums = new Set(), prods = new Set();
for (let a = 0; a < n6; a++) for (let b = 0; b < n6; b++) { sums.add((a + b) % n6); prods.add((a * b) % n6); }
console.log("足した結果の集合:", [...sums].sort().join(", "));
console.log("掛けた結果の集合:", [...prods].sort().join(", "));
console.log("すべて {0〜5} に収まる:", [...sums, ...prods].every((x) => x >= 0 && x < n6));`,
`const inverses = (n) => {
  const rows = [];
  for (let a = 1; a < n; a++) {
    const x = [...Array(n).keys()].find((b) => (a * b) % n === 1);
    rows.push("a=" + a + " の逆元: " + (x === undefined ? "なし" : x));
  }
  return rows.join("\\n");
};
console.log("ℤ₇（7は素数）\\n" + inverses(7));
console.log("ℤ₆（6は素数でない）\\n" + inverses(6));`,
`const invTable = (a, n) => {
  let [r0, r1, t0, t1] = [n, a, 0n, 1n];
  const rows = ["r=" + r0 + "  t=" + t0, "r=" + r1 + "  t=" + t1];
  while (r1 !== 0n) {
    const q = r0 / r1;                                    // 商
    [r0, r1, t0, t1] = [r1, r0 - q * r1, t1, t0 - q * t1];   // 余りと t を1行進める
    rows.push("q=" + q + "  r=" + r1 + "  t=" + t1);
  }
  console.log(rows.join("\\n"));
  console.log("逆元 =", ((t0 % n) + n) % n);              // r が 1 の行の t（負なら n を足す）
};
invTable(7n, 40n);
invTable(3n, 11n);`,
`const powTrace = (b, e, m) => {
  let r = 1n, x = b % m, i = 0;
  console.log("i  下位ビット  x  r");
  while (e > 0n) {
    const bit = e & 1n;
    if (bit) r = (r * x) % m;                  // ビットが1なら結果に x を掛ける
    console.log(i + "  " + bit + "  " + x + "  " + r);
    x = (x * x) % m; e >>= 1n; i++;            // x を2乗して、次のビットへ
  }
  return r;
};
console.log("3^13 mod 17 =", powTrace(3n, 13n, 17n));`,
`const eaddTrace = (P, Q) => {
  const [x1, y1] = P, [x2, y2] = Q;
  const dbl = x1 === x2 && y1 === y2;                      // 同じ点なら2倍（接線）
  const num = dbl ? md(3n * x1 * x1 + 2n) : md(y2 - y1);   // 傾きの分子
  const den = dbl ? md(2n * y1) : md(x2 - x1);             // 傾きの分母
  const s = md(num * invp(den));                           // 割り算は逆元を掛ける
  const x3 = md(s * s - x1 - x2), y3 = md(s * (x1 - x3) - y1);
  console.log("s = " + num + " ÷ " + den + " = " + num + " × " + invp(den) + " = " + s);
  console.log("(x3, y3) = (" + x3 + ", " + y3 + ")");
  return [x3, y3];
};
const twoG = eaddTrace([5n, 1n], [5n, 1n]);                // 2G = G + G
const threeG = eaddTrace(twoG, [5n, 1n]);                  // 3G = 2G + G`,
`const birthday = (n, N) => { let q = 1; for (let k = 0; k < n; k++) q *= (N - k) / N; return 1 - q; };
for (const n of [10, 23, 50]) {
  const approx = (n * n) / (2 * 365);
  console.log(n + "人  厳密:", birthday(n, 365).toFixed(4), " n²/2N:", approx.toFixed(4), " 1−e^(−n²/2N):", (1 - Math.exp(-approx)).toFixed(4));
}
console.log("50%になる人数 ≈ √(2·ln2·N) =", Math.sqrt(2 * Math.LN2 * 365).toFixed(1));
console.log("N = 2^256 なら ≈", Math.sqrt(2 * Math.LN2) * 2 ** 128, "個（≈ 1.18 × 2^128）");`,
`const tq = 13n, td = 2n;                                   // 体の大きさ 13、定数 d = 2
const tm = (a) => ((a % tq) + tq) % tq;
const tinv = (a) => { for (let i = 1n; i < tq; i++) if (tm(a * i) === 1n) return i; };
const tadd = ([x1, y1], [x2, y2]) => {
  const k = tm(td * x1 * x2 * y1 * y2);
  return [tm((x1 * y2 + x2 * y1) * tinv(1n + k)), tm((y1 * y2 + x1 * x2) * tinv(1n - k))];
};
let tp = [0n, 1n]; const trows = [];
for (let k = 1; k <= 16; k++) { tp = tadd(tp, [2n, 4n]); trows.push("k=" + k + ": (" + tp + ")"); }
console.log(trows.join("\\n"));`,
`const add = ([x1, y1], [x2, y2]) => {
  const k = mod(d * x1 * x2 * y1 * y2);
  return [mod((x1 * y2 + x2 * y1) * inv(1n + k)), mod((y1 * y2 + x1 * x2) * inv(1n - k))];
};
const mul = (k, P) => {
  let R = [0n, 1n];                                        // 結果。最初は単位元（0, 1）
  while (k > 0n) { if (k & 1n) R = add(R, P); P = add(P, P); k >>= 1n; }
  return R;
};`,
`const recoverX = (y, odd) => {
  const x2 = mod((y * y - 1n) * inv(d * y * y + 1n));      // x² = (y² − 1) ÷ (d·y² + 1)
  let x = pw(x2, (p + 3n) / 8n);                           // 平方根の候補
  if (mod(x * x - x2) !== 0n) x = mod(x * pw(2n, (p - 1n) / 4n));   // 違えば √−1 を掛ける
  return (x & 1n) === BigInt(odd) ? x : p - x;             // 偶奇を合わせる
};
const By = mod(4n * inv(5n));                              // 基点のy座標 = 4 ÷ 5
const B = [recoverX(By, 0), By];                           // 基点
const L = 2n ** 252n + 27742317777372353535851937790883648493n;   // 基点の位数
console.log("基点が曲線上:", mod(-B[0] * B[0] + B[1] * B[1] - 1n - d * B[0] * B[0] * B[1] * B[1]) === 0n);
console.log("L × B = 無限遠点（0, 1）:", mul(L, B).join(", "));`,
`const O = [0n, 1n];
const eq = (P, Q) => P[0] === Q[0] && P[1] === Q[1];
console.log("B + O = B           :", eq(add(B, O), B));
console.log("(−B) + B = O        :", eq(add([mod(-B[0]), B[1]], B), O));
console.log("B + B = 2B（mul）    :", eq(add(B, B), mul(2n, B)));
console.log("B+B+B+B+B = 5B（mul）:", eq(add(add(add(add(B, B), B), B), B), mul(5n, B)));
console.log("(2^((p−1)/4))² ≡ −1  :", mod(pw(2n, (p - 1n) / 4n) ** 2n + 1n) === 0n);`
];

// ───────── 第1章・第2章で使うコード例 ─────────
// 各コードは単独で実行できる（fetch系はノードに接続できる環境が必要）。
// 出力例は、本アプリのコンソールと同じ変換・表示で実際に実行した結果（fetch系の値は一例）。
const JX = {
  big_precision: L(
    "console.log(Number.MAX_SAFE_INTEGER);",
    "console.log(9007199254740993, 9007199254740993n);",
    "console.log(2n ** 64n - 1n);",
  ),
  big_ops: L(
    "console.log(7n + 3n, 7n * 3n, 7n / 2n, 7n % 2n, -7n / 2n);",
    "try { console.log(1n + 1); } catch (e) { console.log(String(e)); }",
    "console.log(1n + BigInt(1), Number(1n) + 1);",
    "console.log(2n > 1, 2n == 2, 2n === 2);",
  ),
  big_convert: L(
    "console.log(BigInt(\"1000000\"), BigInt(42), Number(1500000n));",
    "try { BigInt(1.5); } catch (e) { console.log(String(e)); }",
    "try { BigInt(\"abc\"); } catch (e) { console.log(String(e)); }",
    "console.log(BigInt(Number.MAX_SAFE_INTEGER) + 2n);",
  ),
  big_hex: L(
    "const idHex = \"1A2B3C4D5E6F7A8B\";",
    "const idBig = BigInt(\"0x\" + idHex);",
    "console.log(idBig);",
    "console.log(idBig.toString(16).toUpperCase().padStart(16, \"0\"));",
    "console.log(BigInt(\"0x0A01\").toString(16).toUpperCase().padStart(16, \"0\"));",
  ),
  big_json: L(
    "const dataObj = { height: 123n, amount: 1000000n };",
    "try { JSON.stringify(dataObj); } catch (e) { console.log(String(e)); }",
    "console.log(JSON.stringify(dataObj, (k, v) => (typeof v === \"bigint\" ? v.toString() : v)));",
  ),
  float: L(
    "console.log(0.1 + 0.2, 1.1 * 3);",
    "console.log(0.1 + 0.2 === 0.3);",
  ),
  amount_fmt: L(
    "const formatAmount = (amount, decimals) => {",
    "  const unit = 10n ** BigInt(decimals);",
    "  const whole = amount / unit;",
    "  if (decimals === 0) return whole.toString();",
    "  const frac = (amount % unit).toString().padStart(decimals, \"0\");",
    "  return whole + \".\" + frac;",
    "};",
    "const parseAmount = (text, decimals) => {",
    "  const [whole, frac = \"\"] = text.split(\".\");",
    "  return BigInt(whole + frac.padEnd(decimals, \"0\").slice(0, decimals));",
    "};",
    "console.log(formatAmount(1500000n, 6), formatAmount(123456789n, 6), formatAmount(100n, 2), formatAmount(5n, 0));",
    "console.log(parseAmount(\"1.5\", 6), parseAmount(\"0.000001\", 6), parseAmount(\"100\", 2));",
  ),
  validate: L(
    "const fromHex = (s) => {",
    "  if (s.length % 2 !== 0 || /[^0-9a-fA-F]/.test(s)) throw new Error(\"16進文字列ではありません: \" + s);",
    "  return Uint8Array.from(s.match(/../g) ?? [], (h) => parseInt(h, 16));",
    "};",
    "for (const s of [\"48656C6C6F\", \"48656C6C6\", \"ZZ\"]) {",
    "  try { console.log(fromHex(s)); } catch (e) { console.log(e.name, e.message); }",
    "}",
  ),
  textenc: L(
    "const enc = new TextEncoder();",
    "console.log(enc.encode(\"Hello\"));",
    "console.log(\"Hello\".length, enc.encode(\"Hello\").length);",
    "console.log(\"日本語\".length, enc.encode(\"日本語\").length);",
    "console.log(new TextDecoder().decode(enc.encode(\"日本語\")));",
  ),
  hexconv: L(
    "const toHex = (u8) => Array.from(u8, (b) => b.toString(16).padStart(2, \"0\")).join(\"\").toUpperCase();",
    "const fromHex = (s) => Uint8Array.from(s.match(/../g) ?? [], (h) => parseInt(h, 16));",
    "const bytes = fromHex(\"48656c6c6f\");",
    "console.log(bytes, toHex(bytes));",
    "console.log(toHex(new Uint8Array([0, 1, 15, 16, 255])));",
  ),
  u8ops: L(
    "const part1 = new Uint8Array([1, 2, 3]);",
    "const part2 = new Uint8Array([4, 5]);",
    "const joined = new Uint8Array(part1.length + part2.length);",
    "joined.set(part1, 0);",
    "joined.set(part2, part1.length);",
    "console.log(joined, joined.slice(1, 4), joined.subarray(3).length);",
    "console.log(new Uint8Array(4), part1[0], part1.at(-1));",
  ),
  dataview: L(
    "const buf = new ArrayBuffer(8);",
    "const view = new DataView(buf);",
    "view.setBigUint64(0, 1000000n, true);   // true = リトルエンディアン",
    "console.log(new Uint8Array(buf));",
    "console.log(view.getBigUint64(0, true));",
    "const buf2 = new ArrayBuffer(2);",
    "new DataView(buf2).setUint16(0, 0x1234, true);",
    "console.log(new Uint8Array(buf2));",
  ),
  klass: L(
    "class Item {",
    "  constructor(id, amount) {",
    "    this.id = id;",
    "    this.amount = amount;",
    "  }",
    "  static create(id, amount) {",
    "    return new Item(id, amount);",
    "  }",
    "  get isBulk() {",
    "    return this.amount >= 100n;",
    "  }",
    "  describe() {",
    "    return this.id + \" × \" + this.amount;",
    "  }",
    "}",
    "const m1 = new Item(\"A001\", 100n);",
    "const m2 = Item.create(\"B002\", 5n);",
    "console.log(m1.describe(), \"/\", m2.describe());",
    "console.log(m1.isBulk, m2.isBulk, m1 instanceof Item);",
    "console.log(m1);",
  ),
  big_sort: L(
    "const bigs = [30n, 4n, 200n];",
    "try { [...bigs].sort((a, b) => a - b); } catch (e) { console.log(String(e)); }",
    "console.log([...bigs].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)).join(\", \"));",
    "console.log(bigs.reduce((sum, v) => sum + v, 0n));",
  ),
  big_errors: L(
    "const tryIt = (f) => {",
    "  try { f(); } catch (e) { console.log(e.name + \": \" + e.message); }",
    "};",
    "tryIt(() => 1n + 1);",
    "tryIt(() => BigInt(1.5));",
    "tryIt(() => BigInt(\"abc\"));",
    "tryIt(() => JSON.stringify({ amount: 5n }));",
  ),
  big_equal: L(
    "console.log(1n === 1, 1n == 1, 1n === 1n);",
    "console.log(Boolean(0n), Boolean(1n));",
  ),
};

const OX = {
  big_precision: L(
    "9007199254740991",
    "9007199254740992 \"9007199254740993n\"",
    "\"18446744073709551615n\"",
  ),
  big_ops: L(
    "\"10n\" \"21n\" \"3n\" \"1n\" \"-3n\"",
    "TypeError: Cannot mix BigInt and other types, use explicit conversions",
    "\"2n\" 2",
    "true true false",
  ),
  big_convert: L(
    "\"1000000n\" \"42n\" 1500000",
    "RangeError: The number 1.5 cannot be converted to a BigInt because it is not an integer",
    "SyntaxError: Cannot convert abc to a BigInt",
    "\"9007199254740993n\"",
  ),
  big_hex: L(
    "\"1885667171979197067n\"",
    "1A2B3C4D5E6F7A8B",
    "0000000000000A01",
  ),
  big_json: L(
    "TypeError: Do not know how to serialize a BigInt",
    "{\"height\":\"123\",\"amount\":\"1000000\"}",
  ),
  float: L(
    "0.30000000000000004 3.3000000000000003",
    "false",
  ),
  amount_fmt: L(
    "1.500000 123.456789 1.00 5",
    "\"1500000n\" \"1n\" \"10000n\"",
  ),
  validate: L(
    "\"Uint8Array(5) 48656C6C6F\"",
    "Error 16進文字列ではありません: 48656C6C6",
    "Error 16進文字列ではありません: ZZ",
  ),
  textenc: L(
    "\"Uint8Array(5) 48656C6C6F\"",
    "5 5",
    "3 9",
    "日本語",
  ),
  hexconv: L(
    "\"Uint8Array(5) 48656C6C6F\" 48656C6C6F",
    "00010F10FF",
  ),
  u8ops: L(
    "\"Uint8Array(5) 0102030405\" \"Uint8Array(3) 020304\" 2",
    "\"Uint8Array(4) 00000000\" 1 3",
  ),
  dataview: L(
    "\"Uint8Array(8) 40420F0000000000\"",
    "\"1000000n\"",
    "\"Uint8Array(2) 3412\"",
  ),
  klass: L(
    "A001 × 100 / B002 × 5",
    "true false true",
    "{",
    "  \"id\": \"A001\",",
    "  \"amount\": \"100n\"",
    "}",
  ),
  big_sort: L(
    "TypeError: Cannot convert a BigInt value to a number",
    "4, 30, 200",
    "\"234n\"",
  ),
  big_errors: L(
    "TypeError: Cannot mix BigInt and other types, use explicit conversions",
    "RangeError: The number 1.5 cannot be converted to a BigInt because it is not an integer",
    "SyntaxError: Cannot convert abc to a BigInt",
    "TypeError: Do not know how to serialize a BigInt",
  ),
  big_equal: L(
    "false true true",
    "false true",
  ),
};

function Data2() {
  return (
    <>
      <H>2.1 この章の進め方</H>
      <Note kind="goal">数値・文字・バイト列が、コンピューターの中でどう表されているかを説明できる。</Note>
      <P>ブロックチェーンのデータは、最終的にはすべて<B>数値とバイト列</B>です。公開鍵・ハッシュ・署名・アドレス・トランザクションが「長い英数字」に見えるのは、バイト列を16進数などの文字で書いているからです。この章では、その正体を、第1章のJavaScriptで確かめます。</P>
      <Tbl head={['学ぶこと', '後の章での登場場面', '節']} rows={[
        ['進数・ビット幅', '鍵やハッシュの表示（16進）、数量や日時（uint64）', '2.2'],
        ['BigInt', '64ビットの大きな整数（数量・高さ・日時・ID）、数量の表示と入力', '2.3'],
        ['ビット演算', '複数のON/OFFを1つの整数にまとめるフラグ', '2.4'],
        ['文字・バイト列・16進', 'メッセージ、ハッシュ、署名', '2.5'],
        ['バイト順（エンディアン）', 'データをバイト列に並べるときの順序', '2.6'],
        ['Base32', '長いデータを読みやすい文字で書く方式（アドレスなど）', '2.7'],
      ]} />
      <Note kind="warn">この章のコードは、それぞれ<B>単独で実行</B>できます。</Note>

      <H>2.2 進数とビット</H>
      <Note kind="goal">2進数・16進数を読み書きでき、「uint64」のようなビット幅が何を指すか説明できる。</Note>
      <H3>2進数と16進数</H3>
      <P>普段使う10進数は、0〜9の10種類の数字を使い、9の次で桁が上がります。<B>2進数</B>は0と1の2種類だけを使い、1の次で桁が上がる数え方です。桁の重みは、右から1, 2, 4, 8, 16…と2倍ずつ増えます。</P>
      <Note kind="ex">2進数 <code>1101</code> を10進数にします。重みは左から 8, 4, 2, 1 です。<br />8×1 ＋ 4×1 ＋ 2×0 ＋ 1×1 ＝ <B>13</B></Note>
      <P>2進数は桁が長くなって読みにくいので、<B>4桁をひとまとめにして1文字で書く</B>のが16進数です。0〜9に続けて、10〜15をA〜Fで表します。</P>
      <Tbl head={['10進数', '2進数', '16進数']} rows={[['9', '1001', '9'], ['10', '1010', 'A'], ['15', '1111', 'F'], ['255', '1111 1111', 'FF']]} />
      <FigBinary />
      <P>1バイト（8ビット）は、16進数でちょうど2桁（00〜FF）です。鍵やハッシュ、署名が長い英数字で表示されるのは、バイト列を16進数で書いているためです。</P>
      <H3>ビット幅：決まった桁数の電卓</H3>
      <P>コンピューターの整数は、桁数が決まった電卓のようなものです。<B>nビット</B>の入れ物には、0〜2<sup>n</sup>−1 の 2<sup>n</sup> 通りの整数が入ります。たとえば8ビットなら0〜255です。数量や日時、IDなどには、<B>64ビットの符号なし整数（uint64）</B>がよく使われ、約1844京まで入ります。</P>
      <Code code={MC[0]} />

      <H>2.3 BigInt：大きな整数</H>
      <Note kind="goal">64ビットの大きな整数をBigIntで扱う理由を説明でき、数量や16進のIDを正しく変換できる。</Note>
      <P>JavaScriptの通常の数値（Number）は、整数を正確に扱えるのが <code>Number.MAX_SAFE_INTEGER</code>（約9×10<sup>15</sup>）までです。それより大きい値は、下の桁がずれてしまいます。お金の数量・日時（ミリ秒）・IDなど、<B>64ビット（最大 約1.8×10<sup>19</sup>）の整数</B>が当たり前に出てくるデータを扱うときは、<B>BigInt</B> という別の種類の整数を使います。数字の後ろに <code>n</code> を付けると BigInt になります（<code>100n</code>）。</P>
      <Code code={JX.big_precision} />
      <Out code={OX.big_precision} />
      <P>1行目は安全に扱える上限です。2行目は、同じ数字を Number と BigInt で書いたときの違いです。Number では末尾が <code>2</code> にずれて、<B>エラーも出ずに値が変わっています</B>。静かに壊れるので、もっとも気づきにくい不具合です。</P>
      <FigNumRange />
      <H3>計算と比較</H3>
      <P>BigInt同士なら、<code>+ - * / % **</code> が使えます。<B>割り算は整数で、小数点以下は切り捨て</B>です。BigInt と Number を<B>混ぜて計算するとエラー</B>になります。意図しない型変換で値が壊れるのを防ぐための仕様です。</P>
      <Code code={JX.big_ops} />
      <Out code={OX.big_ops} />
      <P>大小の比較（<code>&gt;</code> など）と <code>==</code> は混ぜても動きますが、<code>===</code> は種類が違うので false です（1.4）。</P>
      <Code code={JX.big_equal} />
      <Out code={OX.big_equal} />
      <Note kind="point">BigInt と Number では、<code>1n == 1</code> は true ですが <code>1n === 1</code> は false です（1.4）。数量や件数を比べるときは、<B>両方を BigInt にそろえてから</B>比べます。また、条件式では <code>0n</code> も「偽」として扱われます。</Note>
      <H3>変換</H3>
      <P><code>BigInt(値)</code> で整数や数字の文字列から作り、<code>Number(値)</code> で通常の数値に戻せます。<B>小数や、整数にならない文字列は変換できません</B>。また、<code>Number()</code> に戻すと、上限を超える値は正確さを失うので、計算には使わず、表示のためだけに使います。</P>
      <Code code={JX.big_convert} />
      <Out code={OX.big_convert} />
      <H3>16進数との往復</H3>
      <P>IDは、16桁の16進文字列で表すことがあります。<code>BigInt("0x" + 16進文字列)</code> で数値になり、<code>toString(16)</code> で16進文字列に戻せます。先頭の0が消えるので、<code>padStart</code> で桁をそろえます。</P>
      <Code code={JX.big_hex} />
      <Out code={OX.big_hex} />
      <H3>JSONにするとき</H3>
      <P><code>JSON.stringify</code> は BigInt を扱えず、エラーになります。文字列に変換する関数を渡して回避します。サーバーが64ビットの値を<B>文字列</B>で返すことが多いのも、同じ理由です。</P>
      <Code code={JX.big_json} />
      <Out code={OX.big_json} />
      <H3>並べ替えと合計</H3>
      <P>1.9で見た <code>sort</code> の比較関数に、BigInt では <code>a - b</code> が使えません。引き算の結果も BigInt になり、比較関数が受け取れる数値ではないからです。大小を判定して <code>-1 / 0 / 1</code> を返します。合計の初期値は <code>0n</code> にします。</P>
      <Code code={JX.big_sort} />
      <Out code={OX.big_sort} />
      <H3>数量の表示と入力：小数を使わない</H3>
      <P>お金のような数量は、<B>最小単位の整数</B>で持つのが定石です。小数点以下を6桁まで扱う設計なら、<code>1500000</code> が 1.5 に当たります。小数（Number）で計算すると、<code>0.1 + 0.2</code> のように誤差が出ます。お金を扱う計算では致命的なので、<B>整数のまま計算し、表示するときだけ小数点を入れる</B>のが鉄則です。</P>
      <Code code={JX.float} />
      <Out code={OX.float} />
      <P>次の2つの関数は、最小単位の数量を表示用の文字列に直す <code>formatAmount</code> と、人が入力した文字列（"1.5"）を最小単位の BigInt に直す <code>parseAmount</code> です。実際のブロックチェーンの数量も、この考え方で扱われます（第5章）。</P>
      <Code code={JX.amount_fmt} />
      <Out code={OX.amount_fmt} />
      <Note kind="point">この2つの関数を覚える必要はありません。「<B>数量は整数のまま持ち、表示と入力のところだけ小数点以下の桁数で変換する</B>」という考え方が大切です。<code>parseAmount</code> は、小数点以下が指定の桁数より多いと切り捨てます。実際のアプリでは、入力のチェックも必要です。</Note>
      <H3>BigIntで出会うエラー</H3>
      <P>ここまでに出てきたエラーを、まとめて起こしてみます。メッセージを覚える必要はありません。「BigInt と Number を混ぜた」「整数にならない値を変換した」「JSONにできない」と読み取れれば十分です（エラーの読み方は1.9）。</P>
      <Code code={JX.big_errors} />
      <Out code={OX.big_errors} />

      <H>2.4 ビット演算：数を「スイッチの集まり」として見る</H>
      <Note kind="goal">AND・OR・XOR・シフトを使え、フラグ（複数のON/OFFを1つの整数にまとめる方法）の仕組みが読める。</Note>
      <P>整数を、ON/OFFのスイッチが横に並んだものと考えます。ビット演算は、そのスイッチを1つずつ操作する計算です。</P>
      <Tbl head={['a', 'b', 'AND（&）', 'OR（|）', 'XOR（^）']} rows={[['0', '0', '0', '0', '0'], ['0', '1', '0', '1', '1'], ['1', '0', '0', '1', '1'], ['1', '1', '1', '1', '0']]} />
      <Ul items={['AND：両方が1のときだけ1。「このスイッチは入っているか」を調べるのに使う', 'OR：どちらかが1なら1。「このスイッチを入れる」のに使う', 'XOR：違うときだけ1。同じ値でもう一度XORすると元に戻る（暗号の部品として登場する）', 'シフト：ビットを左右にずらす。左に1つずらすと2倍、右に1つずらすと半分（10進数で桁を左にずらすと10倍になるのと同じ）']} />
      <FigBitOps />
      <Code code={MC[3]} />
      <H3>使いどころ：フラグ（権限の例）</H3>
      <P>「読み取れる」「書き込める」「実行できる」のような<B>いくつかのON/OFFの性質</B>は、<B>1つの性質に1ビットを割り当て、足し合わせた1つの整数</B>でまとめて持てます。Linuxのファイルの権限（<code>chmod 755</code> など）と同じ考え方です。</P>
      <Tbl head={['フラグ', '値', '2進数', '意味']} rows={[['read', '4', '100', '読み取れる'], ['write', '2', '010', '書き込める'], ['exec', '1', '001', '実行できる']]} />
      <FigPerm />
      <Code code={MC[4]} />
      <Note kind="point">「読み取り」と「書き込み」を両方もつ権限は、4 ＋ 2 ＝ <B>6</B>（<code>110</code>）の1つの数で表せます。ORで足し、ANDで調べる、という流れを覚えておくと、フラグを使ったデータ（第5章で見るデータなど）が読みやすくなります。</Note>

      <H>2.5 文字とバイト列</H>
      <Note kind="goal">文字列とバイト列を相互に変換でき、16進文字列で表示できる。バイト列を連結・切り出しできる。</Note>
      <H3>文字とバイト：UTF-8</H3>
      <P>文字は、<B>文字コード</B>（UTF-8）によってバイト列に変換されます。英数字は1文字が1バイト、日本語は1文字が3バイトです。<code>TextEncoder</code> は文字列をUTF-8のバイト列に、<code>TextDecoder</code> はその逆に変換します。<code>length</code>（文字数）とバイト数は一致しません。メッセージの長さの制限は、多くの場合バイト数で数えます。</P>
      <FigText />
      <Code code={JX.textenc} />
      <Out code={OX.textenc} />
      <H3>バイト列：Uint8Array</H3>
      <P>暗号に関わるデータはほぼ<B>バイト列</B>で、JavaScriptでは <code>Uint8Array</code>（0〜255の整数が並んだ配列）で扱います。署名・ハッシュ・鍵はすべてこの型です。</P>
      <Code code={JX.u8ops} />
      <Out code={OX.u8ops} />
      <P><code>set(配列, 位置)</code> は、指定位置に別のバイト列を書き込みます。バイト列を連結するには、必要な長さの新しい <code>Uint8Array</code> を作って、<code>set</code> で順に書き込みます。<code>slice</code> はコピー、<code>subarray</code> は元のバイト列を見る窓（コピーしない）です。<code>at(-1)</code> は末尾の要素です。</P>
      <H3>16進文字列との相互変換</H3>
      <P>16進文字列は、2文字が1バイトです。<code>match(/../g)</code> で2文字ずつに分けて数値に直し、逆は <code>toString(16)</code> に <code>padStart(2, "0")</code> を付けて2桁にそろえます。</P>
      <Code code={JX.hexconv} />
      <Out code={OX.hexconv} />
      <H3>変換前に形式をチェックする</H3>
      <P>16進文字列は、人が書き写すとまちがえやすい値です。変換の前に形式を確かめ、おかしければ <code>throw</code> で止めるのが定石です（1.14）。次のコードは、桁数が奇数のときと、16進以外の文字が混ざるときにエラーにします。</P>
      <Code code={JX.validate} />
      <Out code={OX.validate} />

      <H>2.6 バイト順（エンディアン）</H>
      <Note kind="goal">複数バイトの数をバイト列に並べる順序（エンディアン）を説明でき、リトルエンディアンで数値をバイト列にできる。</Note>
      <P>2バイト以上の数をバイト列に並べるとき、上の桁から並べる方法と、下の桁から並べる方法があります。日付を「年月日」と書くか「日月年」と書くかの違いに似ています。</P>
      <Note kind="ex">1000000 は16進数で <code>0F4240</code>、1バイトずつに分けると <code>0F</code> <code>42</code> <code>40</code> です。<br />・ビッグエンディアン（上の桁から）：<code>0F 42 40</code><br />・<B>リトルエンディアン（下の桁から）</B>：<code>40 42 0F</code></Note>
      <FigEndian />
      <Code code={MC[2]} />
      <H3>DataView で順番を指定する</H3>
      <P><code>DataView</code> を使うと、順番を指定して数値を書き込み・読み出しできます。第2引数の <code>true</code> がリトルエンディアンの指定です。</P>
      <Code code={JX.dataview} />
      <Out code={OX.dataview} />
      <P>1000000（16進で <code>0F4240</code>）が <code>40 42 0F …</code> と下の桁から並ぶのは、上のとおりです。<code>0x1234</code> が <code>34 12</code> と並ぶのも同じ理由です。手作業でバイト列を組み立てる場面は多くありませんが、ほかのシステムが出力するバイト列を読むときに役立ちます。</P>
      <Note kind="point">多くのコンピューターのCPUや、ブロックチェーンのデータ形式は<B>リトルエンディアン</B>を採用しています。16進数の文字列を見たときに「順番が逆に見える」ことがあるのは、このためです。</Note>

      <H>2.7 Base32：バイト列を読みやすい文字で書く</H>
      <P><B>Base32</B>は、A–Zと2–7の32種類の文字だけで、バイト列を書く方式です。バイト列を5ビットずつに区切って、1つずつ文字へ変換するだけの仕組みです。大文字と数字だけなので、人が読み書きしても間違えにくく、ブロックチェーンのアドレスの表記などに使われます（第5章）。</P>
      <FigBase32 />
      <Code code={'const b32 = (u8) => {\n  const A = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"; let bits = "", out = "";\n  for (const b of u8) bits += b.toString(2).padStart(8, "0");\n  for (let i = 0; i < bits.length; i += 5) out += A[parseInt(bits.slice(i, i + 5).padEnd(5, "0"), 2)];\n  return out;\n};\nconsole.log(b32(new TextEncoder().encode("Hello")));'} />
      <Note kind="point">バイト数が5の倍数でないときは、最後に5ビットに足りない端数が出るので、0を足して1文字にします（コードの <code>padEnd(5, "0")</code>）。たとえばSymbolのアドレスは24バイト（192ビット）なので、192 ÷ 5 ＝ 38.4 から<B>39文字</B>になります（5.7）。</Note>
      <P>元に戻す（デコード）は、この逆です。文字を5ビットに戻して並べ、8ビットずつ読み直します。Symbolのアドレスは、公開鍵から作った24バイトをこの方法で文字にしたものです（5.7で、作るところから動かします）。</P>

      <H>2.8 確認問題とまとめ</H>
      <P>コンソールで試してから、答えを確認してください。</P>
      <Q q="2の64乗−1は、10進数で何桁か。" a="18446744073709551615 で、20桁です（2.2のコードで確認できます）。" />
      <Q q="console.log(1n + 1) の結果は何か。" a="TypeError（Cannot mix BigInt and other types）になります。BigInt と Number は混ぜて計算できません。1n + BigInt(1) か、Number(1n) + 1 のように、どちらかにそろえます（2.3）。" />
      <Q q="JSON.stringify({ amount: 5n }) が失敗する。どうすればよいか。" a="JSON.stringify は BigInt を扱えず TypeError になります。第2引数に、BigInt なら文字列に変換する関数を渡します（v.toString()）（2.3）。" />
      <Q q={'通信で値 "1234567"（文字列）を受け取った。1を足したいときの書き方は。'} a={'BigInt("1234567") + 1n です。文字列のまま + 1 とすると、"12345671" のように文字列の連結になってしまいます（2.3）。'} />
      <Q q="小数点以下を6桁まで扱う数量で 2.5 を表したい。最小単位の整数はいくつか。また、Number の小数計算を避ける理由は。" a="2500000 です（2.5 × 10の6乗）。小数の計算には誤差が出る（0.1 + 0.2 が 0.3 にならない）ため、数量は整数（BigInt）のまま扱い、表示と入力のときだけ変換します（2.3）。" />
      <Q q="権限のフラグで、read（4）と write（2）をどちらも立てた値は何か。立っているかは、どう調べるか。" a="4 ＋ 2 ＝ 6（110）です。OR で立て、AND で調べます。たとえば perm &amp; 2 が 0 でなければ、write が立っています（2.4）。" />
      <Q q="文字列「日本語」を UTF-8 にすると、何バイトか。" a="9バイトです（1文字が3バイト）。文字数（3）とは一致しません。メッセージの長さの制限はバイト数で数えます（2.5）。" />
      <Q q="1000000 を、8バイトのリトルエンディアンで並べると、どうなるか。" a="40 42 0F 00 00 00 00 00 です。1000000 は16進で 0F4240。下の桁のバイトから順に並べ、残りを0で埋めます（2.6）。" />
      <H3>この章のまとめ</H3>
      <Ul items={[
        '整数はビット幅（uint64など）とバイト順（リトルエンディアン）で決まる。表示は16進数',
        '64ビットの大きな値（数量・日時・IDなど）は BigInt で扱う。Number と混ぜず、JSON.stringify では文字列に直す。サーバーが64ビットの値を文字列で返すことも多い',
        '数量は最小単位の整数のまま持ち、表示と入力のところだけ小数点以下の桁数で変換する。小数の計算はしない',
        'ビット演算（AND・OR・XOR・シフト）で、1つの整数に複数のON/OFFを持たせられる。権限のフラグが例',
        '文字列は TextEncoder でUTF-8のバイト列にする。日本語は1文字が3バイトで、メッセージの長さの制限はバイト数',
        'ハッシュ・署名・鍵・ペイロードはバイト列（Uint8Array）。16進文字列との変換は、変換の前に形式をチェックする',
        '数値をバイト列にするときの並べ順がエンディアン。下の桁から並べるのがリトルエンディアン。DataView で指定できる',
        'Base32は、バイト列を5ビットずつ区切って、32種類の文字で書く方式',
      ]} />

      <H>2.9 用語集</H>
      <Note kind="goal">本章の用語の一覧。右端の数字は、詳しい説明がある節。</Note>
      <Tbl head={['用語', '意味', '節']} rows={[
        ['AND、OR、XOR', 'ビットごとの論理演算。XORは同じ値でもう一度演算すると元に戻る', '2.4'],
        ['エンディアン', '複数バイトの数をバイト列に並べる順序。リトルエンディアンは下の桁から', '2.6'],
        ['最小単位', '数量を小数ではなく整数で持つときの単位。小数点以下が6桁なら 1 ＝ 1000000', '2.3'],
        ['16進数', '0〜9とA〜Fで表す、16を基数とする数。4ビットが1文字、1バイトが2桁', '2.2'],
        ['BigInt', 'JavaScriptの巨大な整数型。数字の末尾に n を付ける。Numberと混ぜて計算できない', '2.3'],
        ['ビット、バイト', '1ビットは0か1。8ビットが1バイト（16進で2桁）', '2.2'],
        ['フラグ', '1つの性質を1ビットに割り当てた整数。権限などの性質に使う', '2.4'],
        ['Base32', 'A–Zと2–7の32文字で、バイト列を5ビットずつ表す方式。アドレスの表記などに使う', '2.7'],
        ['Number.MAX_SAFE_INTEGER', 'Number で整数を正確に扱える上限（約9×10の15乗）', '2.3'],
        ['uint64', '64ビットの符号なし整数。0〜約1844京', '2.2'],
        ['Uint8Array', '0〜255の整数が並んだ配列。バイト列を表す', '2.5'],
        ['UTF-8', '文字をバイト列にする方法。日本語は1文字が3バイト', '2.5'],
        ['リトルエンディアン', '下の桁のバイトから順に並べる方式。1000000 ＝ 0F4240 は 40 42 0F の順', '2.6'],
      ]} />
    </>
  );
}

// 3.8・3.12 の追加コード（MCの番号に影響しないよう、MCの外に置く）。各コードは単独で実行できる。
const SG: string[] = [
// 0: 3.8 小さな素数で、表を引いて離散対数を逆算する
`const p = 13n, g = 2n;
const tbl = [];
let y = 1n;
for (let x = 0n; x < p - 1n; x++) { tbl.push([x, y]); y = (y * g) % p; }   // g^x mod p を、x = 0, 1, 2, … の順に作る
console.log(tbl.map(([x, y]) => "2^" + x + "=" + y).join("  "));
const hit = tbl.find(([, y]) => y === 11n);                                  // 表から11を探せば、逆算できてしまう
console.log("2^x ≡ 11 (mod 13) になる x =", "" + hit[0]);`,
// 1: 3.8 鍵共有（ディフィー・ヘルマン）
`const powmod = (b, e, m) => { let r = 1n; b %= m; while (e > 0n) { if (e & 1n) r = (r * b) % m; b = (b * b) % m; e >>= 1n; } return r; };
const p = 2n ** 127n - 1n, g = 3n;                    // 公開してよい値（pは素数。例として使う大きさ）
const a = 123456789012345678901234567890n;            // Aliceだけが知る秘密
const b = 987654321098765432109876543210n;            // Bobだけが知る秘密
const A = powmod(g, a, p);                            // Aliceが公開する値  A = g^a mod p
const B = powmod(g, b, p);                            // Bobが公開する値    B = g^b mod p
const keyAlice = powmod(B, a, p);                     // Alice：Bの公開値と、自分の秘密 a から
const keyBob = powmod(A, b, p);                       // Bob  ：Aの公開値と、自分の秘密 b から
const short = (n) => n.toString(16).toUpperCase().slice(0, 12) + "…";
console.log("A       :", short(A));
console.log("B       :", short(B));
console.log("Alice鍵 :", short(keyAlice));
console.log("Bob鍵   :", short(keyBob));
console.log("一致    :", keyAlice === keyBob);`,
// 2: 3.12 署名の模型（mod p）
`const p = 467n, q = 233n, g = 4n;             // q は「gを何乗かすると1に戻るか」の回数（位数）。p ＝ 2q ＋ 1
const powmod = (b, e, m) => { let r = 1n; b %= m; while (e > 0n) { if (e & 1n) r = (r * b) % m; b = (b * b) % m; e >>= 1n; } return r; };
const H = async (s) => BigInt("0x" + Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s))), (x) => x.toString(16).padStart(2, "0")).join("")) % q;
const a = 77n;                                   // 秘密鍵
const A = powmod(g, a, p);                       // 公開鍵  A = g^a mod p
const sign = async (msg, r) => {
  const R = powmod(g, r, p);                     // ① 使い捨ての秘密 r の公開版
  const h = await H(R + "|" + A + "|" + msg);    // ② R・公開鍵・データのハッシュ
  return { R, h, S: (r + h * a) % q };           // ③ 署名 (R, S)
};
const verify = async (msg, { R, S }) => {
  const h = await H(R + "|" + A + "|" + msg);
  return powmod(g, S, p) === (R * powmod(A, h, p)) % p;   // g^S ＝ R × A^h
};
console.log("公開鍵 A =", "" + A);
const sig = await sign("Alice → Bob 30", 101n);
console.log("署名 (R, S) =", "(" + sig.R + ", " + sig.S + ")");
console.log("そのまま          :", await verify("Alice → Bob 30", sig));
console.log("データを変える    :", await verify("Alice → Bob 31", sig));
console.log("Sを1だけ変える    :", await verify("Alice → Bob 30", { R: sig.R, S: (sig.S + 1n) % q }));`,
// 3: 3.12 乱数 r を使い回すと、秘密鍵が計算できてしまう
`const p = 467n, q = 233n, g = 4n;             // q は「gを何乗かすると1に戻るか」の回数（位数）。p ＝ 2q ＋ 1
const powmod = (b, e, m) => { let r = 1n; b %= m; while (e > 0n) { if (e & 1n) r = (r * b) % m; b = (b * b) % m; e >>= 1n; } return r; };
const H = async (s) => BigInt("0x" + Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s))), (x) => x.toString(16).padStart(2, "0")).join("")) % q;
const a = 77n;                                   // 秘密鍵
const A = powmod(g, a, p);                       // 公開鍵  A = g^a mod p
const sign = async (msg, r) => {
  const R = powmod(g, r, p);
  const h = await H(R + "|" + A + "|" + msg);
  return { R, h, S: (r + h * a) % q };
};
const inv = (x) => powmod(((x % q) + q) % q, q - 2n, q);      // mod q の逆元（qは素数なのでフェルマーの小定理）
const r = 101n;                                              // 使い回してしまった乱数
const s1 = await sign("Alice → Bob 30", r);
const s2 = await sign("Alice → Carol 99", r);
console.log("h1 =", "" + s1.h, " h2 =", "" + s2.h, " S1 =", "" + s1.S, " S2 =", "" + s2.S);   // どれも公開されている値
const stolen = ((s1.S - s2.S) * inv(s1.h - s2.h)) % q;       // a ＝ (S1 − S2) ÷ (h1 − h2)
console.log("計算で求めた秘密鍵:", "" + ((stolen + q) % q));
console.log("本物の秘密鍵      :", "" + a);`,
];

function Crypto3() {
  return (
    <>
      <H>3.1 この章の進め方</H>
      <Note kind="goal">素数・有限体・楕円曲線から、ハッシュ、電子署名（Ed25519）までを順に積み上げて、鍵と署名の計算を説明できる。そのうえで、公開鍵暗号での署名と暗号化の違いも説明できる。</Note>
      <P>数学が苦手でも大丈夫です。出てくるのは「割り算の余り」「同じ数を何回も掛ける」といった、中学〜高校の入口で習う考え方が中心です。公式を暗記するのではなく、<B>「こう動くのか」と自分で動かして納得する</B>ことを大事にします。</P>
      <P>各節は、次の流れで進みます。</P>
      <Tbl head={['順番', '内容']} rows={[['1', 'ゴール：その節で何が分かるようになるか'], ['2', 'たとえ話：身近なものに置き換えてイメージをつかむ'], ['3', '手計算：小さな数で、自分の手で確かめる'], ['4', 'コード：同じことをコンソールで動かす'], ['5', 'ポイント／つまずき注意：大事な点と、間違えやすい点']]} />
      <P>この章で学ぶことが、あとの章でどう使われるかを先に見ておきましょう。ビットやBigIntは、第2章で扱いました。</P>
      <Tbl head={['学ぶこと', 'あとの章での登場場面', '節']} rows={[
        ['集合・単位元・逆元・群・環・体', '鍵・点・署名の計算で使う言葉の土台。メンバーや許可リストの集合', '3.2'],
        ['剰余・逆元・べき乗', '暗号の計算すべての土台', '3.3〜3.5'],
        ['素数・有限体', '楕円曲線の座標が属する集合', '3.6'],
        ['公開鍵暗号（鍵のペア）', 'アカウントと署名の考え方。暗号化と署名の使い分け', '3.7'],
        ['離散対数・楕円曲線', '秘密鍵から公開鍵は作れるが、逆はできない仕組み', '3.8〜3.9'],
        ['ハッシュ関数', 'データの「指紋」（署名、ブロックのつながり、アドレスなど）', '3.10'],
        ['確率・指数の大きさ', '鍵やハッシュが他人と重ならない根拠', '3.11'],
        ['電子署名・Ed25519', '署名と公開鍵の計算、署名の検算', '3.12〜3.13'],
      ]} />
      <FigMap />
      <Note kind="warn">3.2〜3.9と3.13のコードは<B>上から順に</B>実行してください。前のコードで作った変数や関数を、後のコードが使います。</Note>
      <Note kind="point">記号の読み方が分からなくなったら<B>3.15 記号の読み方</B>、言葉の意味を忘れたら<B>3.16 用語集</B>を引いてください。新しい記号や用語は使う前にその場で説明しますが、あとから見返せる一覧も章末につけてあります。</Note>

      <H>3.2 集合と元：「ものの集まり」を正確に言う</H>
      <Note kind="goal">集合・元・部分集合の言葉を使え、「演算で閉じている」「単位元」「逆元」「群」「位数」「環」「体」の意味が分かり、群・環・体の順に何が増えていくかを説明できる。</Note>
      <P>数学では、「ものの集まり」を<B>集合</B>と呼び、集まりに入っている1つ1つを<B>元</B>（げん）、または要素と呼びます。このあとに「逆元」「単位元」「有限体」と、「元」の付く言葉が続けて出てくるので、先にここで整理します。</P>
      <Note kind="warn">ここでの「元」は「元に戻る」の「元」ではなく、<B>集合のメンバー</B>という意味です。「逆元」は「逆の元（メンバー）」、「単位元」は「基準になる元」と読むと分かりやすくなります。</Note>
      <H3>集合の書き方</H3>
      <Tbl head={['記号', '読み方', '例']} rows={[
        ['A = {2, 3, 5}', '2, 3, 5 を元にもつ集合Aを表す', '素数の一部を集めた集合'],
        ['3 ∈ A', '3 は A の元である', '3 は A に入っている'],
        ['4 ∉ A', '4 は A の元ではない', '4 は A に入っていない'],
        ['|A| = 3', 'A の元の個数は3', '個数が決まっている集合を有限集合という'],
        ['{2, 5} ⊆ A', '{2, 5} は A の部分集合', '元がすべて A に入っている'],
        ['∅', '元を1つももたない空集合', '|∅| = 0'],
        ['ℤ', '整数全体の集合', '…, −2, −1, 0, 1, 2, … と終わりがない（無限集合）'],
      ]} />
      <H3>集合の演算：和集合・共通部分・差集合</H3>
      <Tbl head={['記号', '意味']} rows={[['A ∪ B（和集合）', 'AとBのどちらかに入っている元すべて'], ['A ∩ B（共通部分）', 'AにもBにも入っている元'], ['A − B（差集合）', 'Aに入っていて、Bには入っていない元']]} />
      <FigSets />
      <P>集合の考え方は、プログラミングでも頻繁に出てきます。「承認できる人の集合」、「許可・拒否するIDの集合」、「N人からM人を選ぶ」ときの部分集合などです。JavaScriptには集合を表す <code>Set</code> があります。</P>
      <Code code={MC[18]} />
      <H3>演算と「閉じている」</H3>
      <P>集合の元を2つ取って新しい元を作る規則を<B>演算</B>と呼びます（足し算、掛け算など）。<B>結果が必ず同じ集合の元になるとき、その集合はその演算について「閉じている」</B>と言います。</P>
      <Note kind="ex">整数の集合ℤは、足し算・引き算・掛け算について閉じています（結果も整数）。しかし、割り算では閉じていません。1 ÷ 2 ＝ 0.5 は整数ではなく、ℤの外に出てしまうからです。</Note>
      <H3>単位元と逆元</H3>
      <P><B>単位元</B>は、どの元と演算しても相手を変えない元です。<B>逆元</B>は、演算すると単位元になる相手の元です。</P>
      <Tbl head={['演算', '単位元', 'aの逆元', '確かめ']} rows={[['足し算', '0', '−a', 'a ＋ 0 ＝ a、a ＋ (−a) ＝ 0'], ['掛け算', '1', '1 ÷ a（0以外）', 'a × 1 ＝ a、a × (1 ÷ a) ＝ 1']]} />
      <Note kind="point">逆元があると、逆の演算ができます。<B>「引く」とは「足し算の逆元を足す」こと、「割る」とは「掛け算の逆元を掛ける」こと</B>です。次の節以降では、この見方を使って、割り算のない集合の中でも割り算を行います。</Note>
      <H3>群・環・体：演算を1つずつ増やしていく</H3>
      <P>ここからは、<B>群 → 環 → 体</B>の順に説明します。出発点は、演算が1つだけの集合です。そこに演算を1つ足し、条件を1つ足すたびに、<B>できる計算が1つずつ増えていきます</B>。</P>
      <Tbl head={['段階', '演算', 'できること', '例']} rows={[
        ['① 群', '1つ（足し算など）', '演算して、元に戻せる（足す・引く）', '整数ℤの足し算'],
        ['② 環', '2つ（足し算と掛け算）', '足す・引く・掛ける。割れるとは限らない', '整数ℤ、時計の世界'],
        ['③ 体', '2つ（足し算と掛け算）', '足す・引く・掛ける・割る（四則演算）', '有理数、実数、有限体'],
      ]} />
      <P>各段階は、1つ前の段階で<B>できなかったこと</B>を解決する形で進みます。群では掛けられないので環へ、環では割れないので体へ進みます。</P>

      <H3>① 群：1つの演算で「元に戻せる」世界</H3>
      <P>演算を「∘」と書くことにして、次の4つの条件を満たす集合を<B>群</B>（ぐん）と呼びます。</P>
      <Ul items={['演算で閉じている', '結合法則が成り立つ（(a ∘ b) ∘ c ＝ a ∘ (b ∘ c)。どこから先に計算しても結果が同じ）', '単位元がある', 'すべての元に逆元がある']} />
      <P>最後の条件のおかげで、<B>どの操作も元に戻せます</B>。足し算なら「引いて戻す」ことができる、ということです。さらに、a ∘ b ＝ b ∘ a（順番を入れ替えても同じ）が成り立つ群を<B>可換群</B>と呼びます。</P>
      <Tbl head={['集合と演算', '群か', '理由']} rows={[
        ['整数ℤの足し算', '群', '単位元は0、aの逆元は −a'],
        ['整数ℤの掛け算', '群ではない', '2の逆元 1/2 が整数ではなく、ℤの外に出てしまう'],
        ['時計の針の足し算（12時間で一周）', '群', '0時（＝12時）が単位元。a時間進めたら、12−a時間進めれば元に戻る（3.3で詳しく）'],
        ['楕円曲線の上の点の足し算', '群', '3.9で登場。暗号の鍵の計算は、この群の上で行われる'],
      ]} />
      <P><B>群の「位数」</B>：あとの3.9で使う言葉を、ここで1つ紹介します。<B>位数</B>には、似た2つの意味があります。</P>
      <Tbl head={['言葉', '意味', '例（時計の針の足し算、0〜11）']} rows={[
        ['群の位数', '群の元の個数', '0〜11 の12個なので、群の位数は12'],
        ['元の位数', 'その元を足し続けて（a、a ＋ a、a ＋ a ＋ a、…）、単位元に戻るまでの回数', '3 を足し続けると 3、6、9、0 と戻るので、3の位数は4'],
      ]} />
      <Tbl head={['元 a', 'a を足し続けた結果（mod 12）', 'aの位数']} rows={[
        ['0', '（最初から単位元）', '1'],
        ['6', '6、0', '2'],
        ['3', '3、6、9、0', '4'],
        ['5', '5、10、3、8、1、6、11、4、9、2、7、0', '12'],
      ]} />
      <Note kind="point">・<B>元の位数は、群の位数（12）の約数</B>になります。上の表の 1、2、4、12 は、すべて12の約数です（ラグランジュの定理と呼ばれる性質です）。<br />・整数ℤの足し算では、0以外の元をいくら足しても 0 に戻らないので、位数は「無限」です。位数が決まった数になるのは、元の個数が有限の群の話です。<br />・群の位数が素数なら、単位元以外のどの元も、位数は群の位数と同じになります。3.9の曲線（点が19個）では、O以外のどの点を基点にしても、位数は19です。</Note>
      <P>群は演算が1つだけなので、「足す・引く」はできても、<B>「掛ける」は別の演算</B>として用意する必要があります。数の計算では足し算と掛け算の両方を使いたいので、次に演算を1つ足します。</P>

      <H3>② 環：掛け算を足す</H3>
      <P>足し算と掛け算の2つの演算をもつ集合で、次の条件を満たすものを<B>環</B>（かん）と呼びます。</P>
      <Ul items={['足し算について、可換群になっている（足す・引くができ、順番は入れ替えられる）', '掛け算で閉じていて、結合法則が成り立ち、単位元1がある', '足し算と掛け算が、分配法則 a × (b ＋ c) ＝ a × b ＋ a × c でつながっている']} />
      <P>分配法則は、2つの演算を結びつける接着剤です。そして掛け算には、<B>逆元の条件を求めません</B>。つまり環では、足す・引く・掛けるはできますが、<B>割れるとは限りません</B>。なお、ここでは掛け算の順番も入れ替えられる環（可換環）だけを扱います。</P>
      <Note kind="ex">整数ℤは環です。足し算で群になり、掛け算も自由にできます。しかし 1 ÷ 2 ＝ 0.5 のように、割り算の答えがℤの外に出ることがあります。2には掛け算の逆元がない（2に整数を掛けても1にならない）からです。</Note>
      <Note kind="warn">環には、「0でない元どうしを掛けたら0になる」ことがあります。12時間で一周する時計の世界では、3時間を4回進めると12時間で0時に戻るので、<code>3 × 4 ＝ 0</code> です。こうなると割り算がうまくいきません（3.4で見る、ℤ₁₂の元4に逆元がない例も同じ理由です）。</Note>

      <H3>③ 体：割り算を足す</H3>
      <P>環のうち、さらに<B>「0以外のすべての元に、掛け算の逆元がある」</B>ものを<B>体</B>（たい）と呼びます。掛け算の逆元があれば「掛けて戻す」、つまり割り算ができます。足す・引く・掛ける・割るの<B>四則演算がすべてできる集合</B>、ということです。条件を並べると、次のとおりです。</P>
      <Ul items={['足し算・掛け算で閉じている', '足し算の単位元0と、掛け算の単位元1がある', 'すべての元に足し算の逆元がある（引き算ができる）', '0以外のすべての元に掛け算の逆元がある（割り算ができる）']} />
      <P>群の言葉で言い直すこともできます。体とは、<B>足し算について群</B>で、<B>0を除いた掛け算についても群</B>で、2つが分配法則でつながった集合です。0を除くのは、0には掛け算の逆元がなく、0を含めると群にならないからです。</P>
      <P>有理数全体や実数全体は体です（元は無限個）。<B>元の個数が有限個の体を「有限体」</B>と呼びます。整数ℤは環ですが体ではありません。ℤを「割った余りの世界」にして、割る数を素数にすると、有限体になります。作り方は、3.3から3.6で順に説明します。</P>
      <Note kind="point">暗号では、<B>座標の計算は有限体</B>の上で行い、<B>点の足し算は群</B>になります（3.9）。群と体の両方が使われ、環はその途中の段階です。</Note>
      <FigField />
      <Note kind="story"><B>ガロアと、20歳で終わった「群」の物語</B><br />「群」や「体」の考え方を生んだのは、19世紀フランスの数学者エヴァリスト・ガロア（1811〜1832）です。当時の大きな謎は「5次方程式に解の公式はあるのか」でした。2次方程式には解の公式があり、3次・4次にも（複雑ですが）あります。ところが5次になると、誰も作れません。のちに「一般的な公式は存在しない」ことが証明されましたが、ガロアはさらに進んで、<B>「どの方程式なら解の公式で解けるのか」</B>を見分ける方法を見つけました。<br /><br />カギは、方程式の解そのものではなく、<B>解どうしの入れ替え方の集まり</B>に目を向けたことです。その集まりが、先ほど見た「元に戻せる」性質をもつこと（これがのちに群と呼ばれる構造です）と、その中身の作りが、解の公式で解けるかどうかを決めていたのです。<br /><br />ガロアは政治活動に熱中し、20歳のとき決闘で亡くなりました（原因には諸説あります）。前の夜、友人に宛てて自分の発見を急いで書き残した、と伝えられています。その理論が世に広まったのは、死後およそ14年がたって論文が出版されてからです。<br /><br />そして、元の個数が有限個の体は<B>「ガロア体」</B>とも呼ばれ、<code>GF(p)</code> の GF は <B>Galois Field</B>（ガロア体）の頭文字です。ガロアは、素数を法とする整数の世界も研究していました。次の節からコンソールで動かす暗号の計算は、200年近く前の若者が作った「群」と「体」という言葉の上で行われています。</Note>

      <H>3.3 剰余：割った余りで整数を分類する</H>
      <Note kind="goal">「mod」の意味を理解し、手で計算できる。</Note>
      <P>10時の5時間後は15時ですが、時計の上では3時です。つまり<B>12で割った余り</B>で考えています。このように、一定の値に達したら0に戻る計算が<B>剰余</B>（mod）です。</P>
      <Note kind="ex">17 ÷ 5 ＝ 3 あまり 2 なので、17 mod 5 ＝ <B>2</B> です。</Note>
      <FigMod />
      <H3>「≡」の意味：合同</H3>
      <P>この先の節では、「＝」によく似た「<B>≡</B>」という記号が出てきます。<B>「＝」は両辺の値がまったく同じ</B>ことを表し、<B>「≡」は両辺をnで割った余りが同じ</B>ことを表します。「≡」は「合同」と読みます。</P>
      <Note kind="point"><code>a ≡ b (mod n)</code>　…　「aとbはnを法として合同」と読みます。意味は「<B>a − b がnの倍数</B>」、言い換えると「aをnで割った余りと、bをnで割った余りが等しい」です。</Note>
      <Note kind="ex">17 ≡ 2 (mod 5) は正しい式です。17 − 2 ＝ 15 は5の倍数で、17を5で割った余りも2だからです。<br />同じように、7 ≡ 2 (mod 5)、12 ≡ 2 (mod 5)、−3 ≡ 2 (mod 5)（−3 − 2 ＝ −5 は5の倍数）も正しい式です。5で割って余り2になる整数は、すべて互いに「≡」で結べます。</Note>
      <Tbl head={['書き方', '読み方', '意味']} rows={[
        ['17 mod 5 ＝ 2', '17 mod 5 は 2', '「mod」は計算。17を5で割った余りを求め、答えは0〜4のどれか1つに決まる'],
        ['17 ≡ 2 (mod 5)', '17と2は5を法として合同', '「余りが同じ」という関係を述べる式。答えを求める計算ではない'],
        ['17 ≡ 7 ≡ 2 (mod 5)', '17、7、2はどれも合同', '余りが2の仲間。どれに置き換えてもよい'],
        ['x ≡ 0 (mod n)', 'xはnを法として0と合同', 'xがnの倍数（割り切れる）。例：15 ≡ 0 (mod 5)'],
      ]} />
      <P>式の末尾の「(mod n)」は、「この式は、nで割った余りだけを見て比べています」という<B>断り書き</B>で、式全体にかかります。「＝」と違い、左右の見た目の数が違っていても成り立つ点に注意してください。</P>
      <Note kind="warn">「mod」は2通りの顔を持ちます。<code>17 mod 5</code> のように<B>余りを求める計算</B>として使う場合と、<code>(mod 5)</code> のように「≡」とセットで使う<B>断り書き</B>の場合です。プログラムの <code>%</code> は前者（計算）で、「≡」そのものではありません。コードで <code>a ≡ b (mod n)</code> を確かめるには、<code>(a - b) % n === 0n</code> か、両方に mod を取って <code>===</code> で比べます。</Note>
      <P>剰余で計算するときは、足し算・引き算・掛け算の<B>途中でいつmodを取っても答えが変わりません</B>。</P>
      <Note kind="ex">7 × 8 ＝ 56、56 mod 5 ＝ 1。<br />先にmodを取ると、7 mod 5 ＝ 2、8 mod 5 ＝ 3 で、2 × 3 ＝ 6、6 mod 5 ＝ 1。<br />どちらも <B>1</B> で一致します。</Note>
      <Note kind="ex">いまの例を「≡」で書き直すと、「7 ≡ 2、8 ≡ 3 (mod 5) なので、7 × 8 ≡ 2 × 3 ＝ 6 ≡ 1 (mod 5)」となります。<B>「≡」で結ばれた数どうしは、足しても掛けても入れ替えてよい</B>、というのがこの性質の言い換えです。</Note>
      <Code code={MC[5]} />
      <H3>集合として見る：ℤₙ</H3>
      <P>整数を「nで割った余り」で分類すると、余りは 0, 1, …, n−1 の<B>n通りしかありません</B>。この n 個の元を集めた集合を、ここでは<B>ℤₙ</B>と書きます。足し算・掛け算の結果をmod nで戻すことで、ℤₙの元どうしの演算はℤₙの中に収まります（ℤₙは演算について閉じています）。</P>
      <Code code={MC[19]} />
      <Note kind="point">計算の途中で何度でもmodを取れるので、<B>どれだけ巨大な数も小さな範囲に保ったまま</B>計算できます。256ビットの暗号計算が現実的な速さで動く理由の1つです。</Note>
      <Note kind="warn">JavaScriptの <code>%</code> は、負の数で負の余りを返します（<code>-3 % 5</code> は <code>-3</code>）。数学のmodにしたいときは <code>((a % n) + n) % n</code> と補正します。</Note>

      <H>3.4 逆元：割り算の代わりに掛ける</H>
      <Note kind="goal">逆元の意味が分かり、拡張ユークリッドの互除法で求められる。</Note>
      <P>3.2で見たとおり、掛け算の単位元は1で、<B>aの掛け算の逆元は「aに掛けると1になる元」</B>です。実数なら3の逆元は3分の1、「3で割る」とは「3分の1を掛ける」ことでした。同じ考え方を、集合ℤₙの中で行います。ℤₙには分数がないので、<B>ℤₙの元の中から</B>逆元を探します。</P>
      <Note kind="ex">集合ℤ₁₁ ＝ {'{0, 1, …, 10}'} で、3 × 4 ＝ 12 ≡ 1 (mod 11) なので、3の逆元は <B>4</B>（ℤ₁₁の元）です。<br />「6 ÷ 3」は「6 × 4 ＝ 24 ≡ 2（mod 11）」で、答えは2。確かめると 3 × 2 ＝ 6 で、元に戻ります。</Note>
      <FigInverse />
      <H3>逆元の求め方</H3>
      <P>小さな数なら総当たりで見つかりますが、巨大な数では無理です。そこで<B>ユークリッドの互除法</B>を使います。「大きい方を小さい方で割った余り」を取る操作を、余りが0になるまで繰り返す方法で、<B>最大公約数</B>（gcd：2つの数を両方とも割り切れる最大の整数）が求まります。</P>
      <Note kind="ex">48 と 18 の最大公約数：<br />48 ＝ 18 × 2 ＋ 12<br />18 ＝ 12 × 1 ＋ 6<br />12 ＝ 6 × 2 ＋ 0 　→ 最後に割った数 <B>6</B> が最大公約数</Note>
      <H3>なぜ最大公約数が逆元につながるのか</H3>
      <P>aとnの最大公約数が1のとき、次の式を満たす整数 x、y が必ず存在します。</P>
      <Note kind="point"><code>a × x ＋ n × y ＝ 1</code></Note>
      <P>この式を「nで割った余り」の世界で見ると、<code>n × y</code> はnの倍数なので消えて、<code>a × x ≡ 1 (mod n)</code> が残ります。つまり<B>この x が a の逆元</B>です。互除法の計算の途中経過を使うと、この x と y を求められます。これが<B>拡張ユークリッドの互除法</B>です。</P>
      <H3>手計算の例1：3の逆元（mod 11）</H3>
      <P>手順は3段階です。(1) 互除法を最後まで行う。(2) 各行を「余り ＝ …」の形に書き直す。(3) 最後の行から<B>逆にたどって</B>、余りを1つ前の行の式で置き換えていく。</P>
      <Note kind="ex"><B>(1) 互除法</B>（割り算を、余りが0になるまで）<br />① 11 ＝ 3 × 3 ＋ 2<br />② 3 ＝ 2 × 1 ＋ 1<br />③ 2 ＝ 1 × 2 ＋ 0 　→ 余り0の直前の余り <B>1</B> が最大公約数。1なので逆元はあります。<br /><br /><B>(2) 余りを左に出す</B><br />① 2 ＝ 11 − 3 × 3<br />② 1 ＝ 3 − 2 × 1<br /><br /><B>(3) 逆にたどる</B>（②から始めて、2を①で置き換える）<br />1 ＝ 3 − 2 × 1<br />　＝ 3 − (11 − 3 × 3) × 1 　←「2」を ① の右辺で置き換えた<br />　＝ 3 − 11 ＋ 3 × 3<br />　＝ 3 × <B>4</B> ＋ 11 × (−1) 　← 3と11でまとめ直した<br /><br />よって <code>3 × 4 ＋ 11 × (−1) ＝ 1</code>。11の倍数を無視すると <code>3 × 4 ≡ 1 (mod 11)</code> なので、<B>3の逆元は4</B>です。</Note>
      <H3>手計算の例2：7の逆元（mod 40）</H3>
      <P>もう少し長い例です。同じ3段階で解きます。</P>
      <Note kind="ex"><B>(1) 互除法</B><br />① 40 ＝ 7 × 5 ＋ 5<br />② 7 ＝ 5 × 1 ＋ 2<br />③ 5 ＝ 2 × 2 ＋ 1<br />④ 2 ＝ 1 × 2 ＋ 0 　→ gcd ＝ <B>1</B><br /><br /><B>(2) 余りを左に出す</B><br />① 5 ＝ 40 − 7 × 5<br />② 2 ＝ 7 − 5 × 1<br />③ 1 ＝ 5 − 2 × 2<br /><br /><B>(3) 逆にたどる</B>（③から始めて、新しい余りを②、①の順に置き換える）<br />1 ＝ 5 − 2 × 2<br />　＝ 5 − (7 − 5 × 1) × 2 　← 2 を ② で置き換え<br />　＝ 5 × 3 − 7 × 2 　← 5と7でまとめ直した<br />　＝ (40 − 7 × 5) × 3 − 7 × 2 　← 5 を ① で置き換え<br />　＝ 40 × 3 − 7 × <B>17</B> 　← 40と7でまとめ直した<br /><br />よって <code>7 × (−17) ＋ 40 × 3 ＝ 1</code>、つまり <code>7 × (−17) ≡ 1 (mod 40)</code>。<br />−17 は負なので、40を足して <B>−17 ＋ 40 ＝ 23</B>。<B>7の逆元は23</B>です。<br />確かめ：7 × 23 ＝ 161 ＝ 40 × 4 ＋ 1 → 余り1 ✓</Note>
      <H3>表にして機械的に解く方法（コードと同じ手順）</H3>
      <P>「逆にたどる」を毎回式変形するのは大変なので、<B>互除法を進めながら、同時に t という数を1行ずつ計算していく</B>表の方法があります。最初の2行は「n、0」と「a、1」です。以降は、前の2行から次のように計算します。</P>
      <Ul items={['商 q ＝ 2つ前の行の余り ÷ 1つ前の行の余り（整数部分）', '余り r ＝ 2つ前の r − q × 1つ前の r', 't ＝ 2つ前の t − q × 1つ前の t', 'r が 1 になった行の t が逆元（負なら n を足す）']} />
      <P>7の逆元（mod 40）を、この方法で解きます。</P>
      <Tbl head={['行', '商 q', '余り r', 't の計算', 't']} rows={[
        ['0', '—', '40（＝n）', '（初期値）', '0'],
        ['1', '—', '7（＝a）', '（初期値）', '1'],
        ['2', '40 ÷ 7 ＝ 5', '40 − 5 × 7 ＝ 5', '0 − 5 × 1', '−5'],
        ['3', '7 ÷ 5 ＝ 1', '7 − 1 × 5 ＝ 2', '1 − 1 × (−5)', '6'],
        ['4', '5 ÷ 2 ＝ 2', '5 − 2 × 2 ＝ 1', '−5 − 2 × 6', '−17'],
        ['5', '2 ÷ 1 ＝ 2', '2 − 2 × 1 ＝ 0', '6 − 2 × (−17)', '40'],
      ]} />
      <P>余りが1になった行4の t ＝ <B>−17</B> が答えで、40を足して <B>23</B>。手計算の例2と一致しました。この表が成り立つ理由は、<B>どの行でも「r ≡ a × t (mod n)」が保たれている</B>からです。行2なら 5 ≡ 7 × (−5) ＝ −35 ≡ 5 (mod 40) です。r が1になった行では、<code>1 ≡ a × t</code> となり、tがそのまま逆元になります。</P>
      <Code code={MC[21]} />
      <Out code={'r=40  t=0\nr=7  t=1\nq=5  r=5  t=-5\nq=1  r=2  t=6\nq=2  r=1  t=-17\nq=2  r=0  t=40\n逆元 = 23n\nr=11  t=0\nr=3  t=1\nq=3  r=2  t=-3\nq=1  r=1  t=4\nq=2  r=0  t=-11\n逆元 = 4n'} />
      <P>表の各行が、手計算の表と1行ずつ対応していることを確かめてください。下のコード（再帰版）は、同じ計算を<B>「逆にたどる」の側</B>から書いたものです。</P>
      <Code code={MC[6]} />
      <Tbl head={['コードの部品', '役割']} rows={[
        ['gcd(a, b)', 'ユークリッドの互除法。「bが0ならa、そうでなければ gcd(b, a % b)」を繰り返す'],
        ['egcd(a, b)', 'a × x ＋ b × y ＝ gcd を満たす [gcd, x, y] を返す関数'],
        ['if (b === 0n) return [a, 1n, 0n]', '互除法の終点。余りが0のとき、a × 1 ＋ 0 × 0 ＝ a が成り立つ'],
        ['egcd(b, a % b)', '互除法を1段進める（手計算の「割り算を1行書く」にあたる）'],
        ['return [g, y, x − (a / b) * y]', '「逆にたどる」1段分。下の説明を参照'],
        ['invm(a, m)', 'egcd の x を取り出し、負なら m を足して 0〜m−1 にそろえる（手計算で −17 を 23 に直した操作）']
      ]} />
      <Note kind="point"><code>return [g, y, x − (a / b) * y]</code> の意味：1段先の結果として <code>b × x ＋ (a % b) × y ＝ g</code> が分かっているとします。<code>a % b ＝ a − (a / b) × b</code> を代入して整理すると <code>a × y ＋ b × (x − (a / b) × y) ＝ g</code> になり、新しい x は「元の y」、新しい y は「元の x − (a/b) × 元の y」だと分かります。手計算で「余りを1つ前の式で置き換えて、まとめ直す」作業を、そのまま式にしたものです。<br />egcd(3n, 11n) の出力は <code>[1n, 4n, −1n]</code> で、手計算の <code>3 × 4 ＋ 11 × (−1) ＝ 1</code> と一致します。</Note>
      <Note kind="warn">逆元があるのは、<B>aとnの最大公約数が1のとき</B>だけです。たとえば集合ℤ₁₂の元4には、逆元がありません（gcd(4, 12) ＝ 4 で、1ではありません。4に何を掛けても12の倍数＋1にならない）。</Note>

      <H>3.5 べき乗剰余とフェルマーの小定理</H>
      <Note kind="goal">巨大な指数のべき乗をmodつきで素早く計算でき、フェルマーの小定理から逆元が求められる。</Note>
      <H3>繰り返し二乗法</H3>
      <P>3<sup>200</sup> は95桁もある巨大な数です。しかし、掛け算のたびにmodを取れば、数は小さいままです。さらに、<B>2乗を繰り返すと、指数が2倍ずつ増える</B>ので、掛け算の回数を大きく減らせます。この方法は<B>バイナリ法</B>（二進法によるべき乗）とも呼ばれます。</P>
      <Note kind="ex">3<sup>13</sup> を計算します。13 を2進数にすると <code>1101</code>、つまり 13 ＝ 8 ＋ 4 ＋ 1 です。<br />3<sup>13</sup> ＝ 3<sup>8</sup> × 3<sup>4</sup> × 3<sup>1</sup>。<br />3<sup>1</sup> → 3<sup>2</sup> → 3<sup>4</sup> → 3<sup>8</sup> と2乗を3回するだけで材料が揃います。</Note>
      <H3>手順と表を使った計算例</H3>
      <P>手順をまとめると、次のようになります。</P>
      <Ul items={['指数を2進数にして、下の桁（右端）から順に見る', '「x」を用意する。最初は底そのもの（b）。「r」（結果）の最初は1', 'いま見ているビットが1なら、r ← r × x (mod m) と更新する（0なら何もしない）', 'x を2乗する（x ← x × x (mod m)）。これで x は b, b², b⁴, b⁸… と進む', '次のビットへ。すべてのビットを見終わったら、r が答え']} />
      <P>3<sup>13</sup> mod 17 を、この手順で計算します。13 ＝ <code>1101</code>（2進数）なので、下の桁から読むと 1, 0, 1, 1 です。</P>
      <Tbl head={['回 i', '13の下位ビット', 'x（3の2ⁱ乗 mod 17）', 'ビットが1なら r × x', 'r']} rows={[
        ['0', '1', '3（最初は底そのもの）', '1 × 3 ＝ 3', '3'],
        ['1', '0', '3² ＝ 9', '掛けない', '3'],
        ['2', '1', '9² ＝ 81 ≡ 13', '3 × 13 ＝ 39 ≡ 5', '5'],
        ['3', '1', '13² ＝ 169 ≡ 16', '5 × 16 ＝ 80 ≡ 12', '12'],
      ]} />
      <P>答えは <B>3<sup>13</sup> ≡ 12 (mod 17)</B> です。確かめると、3<sup>13</sup> ＝ 1594323 ＝ 17 × 93783 ＋ 12 で、余りは12。一致しています。</P>
      <FigPow />
      <Note kind="point">表の中でビットが1だった行の x は、3, 13, 16 です。それぞれ 3<sup>1</sup>, 3<sup>4</sup>, 3<sup>8</sup> にあたり、掛けると 3 × 13 × 16 ＝ 624 ≡ 12 (mod 17)。これは <B>3<sup>13</sup> ＝ 3<sup>1</sup> × 3<sup>4</sup> × 3<sup>8</sup></B> という分解（13 ＝ 1 ＋ 4 ＋ 8）を、mod を取りながら実行したものです。</Note>
      <P>普通に計算すると、3<sup>13</sup> は掛け算12回です。この方法は、2乗が3回、掛け算が3回で済みます。指数がnビットなら、<B>2乗がn回、掛け算が最大n回</B>なので、256ビットでも合計512回程度です。「3を2<sup>256</sup>回掛ける」のとは比べものになりません。</P>
      <Code code={MC[7]} />
      <Tbl head={['コードの部品', '役割']} rows={[
        ['let r = 1n', '結果の入れ物。最初は1（掛け算の単位元）'],
        ['b %= m', '底を先に m で割った余りにしておく（数を小さく保つ）。表の「x の最初の値」'],
        ['while (e > 0n)', '指数 e のビットが残っている間、繰り返す'],
        ['if (e & 1n) r = (r * b) % m', 'e の最下位ビットが1なら、結果に今の b を掛ける。表の「ビットが1なら r × x」'],
        ['b = (b * b) % m', 'b を2乗する。表の「x」の列が1行ごとに2乗されていく'],
        ['e >>= 1n', 'e を右に1ビットずらして、次のビットへ（表の「回 i」を1つ進める）'],
      ]} />
      <P>表の中身を、コードで出力してみましょう。</P>
      <Code code={MC[22]} />
      <Out code={'i  下位ビット  x  r\n0  1  3  3\n1  0  9  3\n2  1  13  5\n3  1  16  12\n3^13 mod 17 = 12n'} />
      <H3>バイナリ法をもう少し詳しく</H3>
      <P>繰り返し二乗法は、指数を<B>二進数（バイナリ）</B>で扱うので、バイナリ法とも呼ばれます。英語では square-and-multiply（2乗して、掛ける）です。名前が違うだけで、同じ計算方法です。</P>
      <P><B>なぜこれで正しく計算できるのか</B></P>
      <P>指数 e を二進数で表すと、e ＝ （ビットが1の桁の 2<sup>i</sup> の合計）です。13 ＝ <code>1101</code> なら 13 ＝ 8 ＋ 4 ＋ 1 です。べき乗には「指数の足し算は、べき乗の掛け算になる」という性質（<code>b<sup>m＋n</sup> ＝ b<sup>m</sup> × b<sup>n</sup></code>）があるので、</P>
      <Note kind="ex">3<sup>13</sup> ＝ 3<sup>8＋4＋1</sup> ＝ 3<sup>8</sup> × 3<sup>4</sup> × 3<sup>1</sup><br />つまり、<B>ビットが1の桁の b<sup>2<sup>i</sup></sup> だけを掛ければ</B>よいことになります。<br />材料の b<sup>1</sup>、b<sup>2</sup>、b<sup>4</sup>、b<sup>8</sup>… は、<B>前の値を2乗するだけ</B>で順に作れます（b<sup>4</sup> ＝ (b<sup>2</sup>)<sup>2</sup>）。表の x の列が、これにあたります。</Note>
      <P><B>読む向きは2通りある</B></P>
      <P>ここまでの表は、指数のビットを<B>下位（右端）から</B>読む向きでした。xとrの2つの変数を使います。もう1つ、<B>上位（左端）から</B>読む向きもあります。こちらは変数が r だけで済みます。</P>
      <Ul items={['rは最初1にしておく', '指数のビットを、上位（左端）から1つずつ読む', 'まず r を2乗する。指数が2倍になる（二進数で桁が1つ左にずれる）', 'ビットが1なら、さらに b を掛ける。指数が1増える', '最後のビットまで読んだら、r が答え']} />
      <P>3<sup>13</sup> mod 17 を、この向きで計算します。13 ＝ <code>1101</code> なので、上位から 1, 1, 0, 1 と読みます。</P>
      <Tbl head={['読んだビット', 'ここまでのビット列', '指数', '操作', 'r']} rows={[
        ['1', '1', '1', '1² ＝ 1、ビットが1なので × 3', '3'],
        ['1', '11', '3', '3² ＝ 9、ビットが1なので × 3 ＝ 27 ≡ 10', '10'],
        ['0', '110', '6', '10² ＝ 100 ≡ 15（ビットが0なので掛けない）', '15'],
        ['1', '1101', '13', '15² ＝ 225 ≡ 4、ビットが1なので × 3 ＝ 12', '12'],
      ]} />
      <P>指数が 1 → 3 → 6 → 13 と、二進数の桁を左から1つずつ足すように育っていきます。答えは下位から読んだ場合と同じ <B>12</B> です。</P>
      <Code code={BIN_TOP} />
      <Out code={'ビット r\n1 3\n1 10\n0 15\n1 12\n3^13 mod 17 = 12n'} />
      <Tbl head={['', '下位から読む（本文の表）', '上位から読む（今の表）']} rows={[
        ['使う変数', 'x（2乗していく値）と r（結果）', 'r だけ'],
        ['1回ごとの操作', 'ビットが1なら r × x、そのあと x を2乗', 'r を2乗、ビットが1なら r × b'],
        ['特徴', '指数を最下位ビットから取り出せる（e & 1、e >> 1）', 'コードが短い。点の計算（3.9）の説明にも向く'],
      ]} />
      <P><B>掛け算の回数を数えてみる</B></P>
      <P>3<sup>200</sup> を例にします。200 ＝ <code>11001000</code>（8ビット）で、1のビットは3つです。</P>
      <Tbl head={['方法', '掛け算の回数']} rows={[
        ['3を200回掛ける（素直な方法）', '199回'],
        ['バイナリ法', '2乗が7〜8回 ＋ 掛け算が3回（1のビットの数）で、合計およそ10回']
      ]} />
      <P>一般に、指数が n ビットなら、<B>2乗が n 回、掛け算が最大 n 回</B>です。256ビットの指数でも、最大512回、平均でおよそ384回（256 ＋ 128）で済みます。</P>
      <Note kind="warn"><B>毎回 mod を取ること</B><br />2乗するたびに桁数はほぼ倍になります。最後にまとめて mod を取ろうとすると、途中の数が巨大になって計算できません。2乗や掛け算のたびに、その場で mod を取ります。</Note>
      <Note kind="point"><B>点の計算（3.9）も同じ発想</B><br />バイナリ法の「2乗」を「点の2倍（P ＋ P）」、「b を掛ける」を「P を足す」に置き換えると、kP の計算になります。秘密鍵 k から公開鍵 K ＝ k × G が速く求まるのは、この「倍々にして足す」方法のおかげです。</Note>
      <H3>フェルマーの小定理</H3>
      <P>pが素数で、aがpの倍数でないとき、次が成り立ちます。</P>
      <Note kind="point"><code>a<sup>p−1</sup> ≡ 1 (mod p)</code></Note>
      <Note kind="story"><B>小噺：フェルマーの小定理はなぜ成り立つのか（二項定理による証明）</B><br />公式が急に出てきて戸惑った人のために、証明を紹介します。まず <code>a<sup>p</sup> ≡ a (mod p)</code> を示し、最後に <code>a<sup>p−1</sup> ≡ 1</code> に直します。<br /><br />
        <B>① 二項定理で (x ＋ y)<sup>p</sup> を展開する</B><br />(x ＋ y) を p 回掛けて展開すると、各項の係数は「p個からk個を選ぶ組合せの数」になります。p ＝ 5 なら、<br /><code>(x ＋ y)<sup>5</sup> ＝ x<sup>5</sup> ＋ 5x<sup>4</sup>y ＋ 10x<sup>3</sup>y<sup>2</sup> ＋ 10x<sup>2</sup>y<sup>3</sup> ＋ 5xy<sup>4</sup> ＋ y<sup>5</sup></code><br />両端の係数は1で、間の 5, 10, 10, 5 はすべて5の倍数です。<br /><br />
        <B>② pが素数なら、間の係数は必ずpの倍数</B><br />間の係数を C とすると、C × k! × (p−k)! ＝ p! が成り立ちます（0 ＜ k ＜ p）。右辺の p! には因数 p が含まれます。一方、k! と (p−k)! は p より小さい数の積で、pは素数なので、これらはpの倍数になりません。よって C がpの倍数でなければなりません。<br />mod p では、pの倍数の項はすべて 0 になって消えるので、<br /><code>(x ＋ y)<sup>p</sup> ≡ x<sup>p</sup> ＋ y<sup>p</sup> (mod p)</code><br />（p ＝ 5 の例では、5, 10, 10, 5 の項が全部消えて、x⁵ ＋ y⁵ が残ります。）<br /><br />
        <B>③ aについての数学的帰納法で、a<sup>p</sup> ≡ a を示す</B><br />・a ＝ 1 のとき：1<sup>p</sup> ＝ 1 なので成り立ちます。<br />・ある a で a<sup>p</sup> ≡ a が成り立つと仮定します。②で x ＝ a、y ＝ 1 とすると、<br /><code>(a ＋ 1)<sup>p</sup> ≡ a<sup>p</sup> ＋ 1<sup>p</sup> ≡ a ＋ 1</code><br />となり、a ＋ 1 でも成り立ちます。<br />よって、すべての正の整数 a で <code>a<sup>p</sup> ≡ a (mod p)</code> です。p ＝ 5 なら、1⁵ ＝ 1、2⁵ ＝ 32 ≡ 2、3⁵ ＝ 243 ≡ 3、… と順に確かめられます。<br /><br />
        <B>④ a で割って、a<sup>p−1</sup> ≡ 1 にする</B><br />a<sup>p</sup> ≡ a は <code>a × a<sup>p−1</sup> ≡ a × 1</code> と書けます。aがpの倍数でなければ、pが素数なので a には逆元があります（3.4）。両辺に逆元を掛けると、<code>a<sup>p−1</sup> ≡ 1 (mod p)</code> が残ります。</Note>
      <P>この式の両辺を a で割ると、<code>a × a<sup>p−2</sup> ≡ 1</code> となるので、<B>a<sup>p−2</sup> がaの逆元</B>だと分かります。拡張ユークリッドより短く書けるため、楕円曲線の実装でよく使われます。</P>
      <Note kind="ex">p ＝ 11、a ＝ 3 なら、3<sup>10</sup> mod 11 ＝ 1。逆元は 3<sup>9</sup> mod 11 ＝ <B>4</B>（前の節の答えと一致）。</Note>
      <Code code={MC[8]} />

      <H>3.6 素数と有限体</H>
      <Note kind="goal">有限体とは何か、そしてなぜ「素数」でなければならないのかが分かる。</Note>
      <P><B>素数</B>とは、1とその数自身でしか割り切れない2以上の整数です（2, 3, 5, 7, 11, 13…）。</P>
      <P>3.2で、元の個数が有限個の体を有限体と呼びました。その具体例が、<B>素数pについて、集合ℤₚ ＝ {'{0, 1, …, p−1}'} に、mod pの足し算・掛け算を備えたもの</B>です。これを GF(p) と書き（GF は Galois Field の頭文字で、3.2の小噺のガロアにちなむ名前です）、暗号ではこれを使います。元の個数はp個で、3.2の体の条件を満たします。結果は必ずℤₚの中に収まり（閉じている）、<B>0以外のすべての元に逆元がある</B>ので、割り算ができます。</P>
      <Note kind="ex">pが素数でないとどうなるか。集合ℤ₆ ＝ {'{0, …, 5}'} では、2 × 3 ＝ 6 ≡ 0 になります。0でない元どうしを掛けて0になると、2には逆元がなくなり、割り算ができません。ℤ₆は環ではありますが、体ではないのです。pが素数なら、この問題は起きません。</Note>
      <FigMul />
      <Code code={MC[20]} />
      <Code code={MC[9]} />
      <Note kind="point">Ed25519の名前の「25519」は、この素数 <B>2<sup>255</sup>−19</B> に由来します。曲線上の点の座標はすべて、この有限体の数です。</Note>

      <H>3.7 公開鍵暗号：鍵のペアという考え方</H>
      <Note kind="goal">鍵が2つある理由と、暗号化・電子署名という2つの使い道の違いを説明できる。このあとの離散対数・楕円曲線・ハッシュ・署名が、何のための部品なのかが分かる。</Note>
      <P>3.2〜3.6で、暗号の計算に使う道具（剰余・逆元・べき乗・有限体）がそろいました。次の節からは、それを使って<B>鍵</B>や<B>署名</B>を作っていきます。その前に、この節で、<B>「秘密鍵」と「公開鍵」という2つの鍵があるのはなぜか</B>、そして<B>何に使うのか</B>を、数学を使わずに押さえます。以降の節で出てくる秘密鍵・公開鍵・署名は、すべてこの節の言葉です。</P>
      <H3>管理者がいないと、何が困るのか</H3>
      <P>銀行なら、パスワードや暗証番号で本人を確かめ、管理者が「本人からの依頼」だけを台帳に反映します。一方、ブロックチェーンの取引は、誰でも作ってノードに送れます。受け取ったノードには、送った人の顔も声も分かりません。ですから、取引には<B>「持ち主だけが作れる印」</B>が付いている必要があります。それが電子署名です。</P>
      <H3>共通鍵暗号と公開鍵暗号</H3>
      <P>暗号には、大きく2つの方式があります。</P>
      <Tbl head={['', '共通鍵暗号', '公開鍵暗号']} rows={[
        ['鍵', '暗号化と復号に、同じ1つの鍵を使う', '2つの鍵（公開鍵と秘密鍵）がペアになっている'],
        ['鍵の渡し方', '同じ鍵を、相手に安全な方法で先に渡す必要がある', '公開鍵は誰に見せてもよい。秘密鍵だけを、持ち主が守る'],
        ['速さ', '速い', '共通鍵暗号より遅い'],
        ['代表例', 'AES', 'RSA、楕円曲線を使う方式（Ed25519、secp256k1など）'],
        ['向いている使い方', '大きなデータの暗号化', '電子署名、鍵の受け渡し'],
      ]} />
      <P>共通鍵暗号の弱点は、「鍵をどうやって相手に渡すか」です。通信が盗み見られていれば、鍵ごと盗まれてしまいます。公開鍵暗号は、<B>片方（公開鍵）を公開しても安全になるように作った、鍵のペア</B>を使うことで、この弱点を避けます。</P>
      <H3>鍵のペアの性質</H3>
      <P>鍵のペアは、<B>秘密鍵から公開鍵は簡単に計算できるが、公開鍵から秘密鍵を求めるのは現実的に不可能</B>という、片方向の関係でできています。だから、公開鍵を世界中に見せても、秘密鍵は漏れません。この片方向の関係を数学で作るのが、次の3.8（離散対数）と3.9（楕円曲線）です。</P>
      <Tbl head={['名前', 'できること', '持ち主以外に見せてよいか']} rows={[
        ['秘密鍵', '署名する。暗号文を復号する', '見せてはいけない'],
        ['公開鍵', '署名を検証する。暗号化する', '見せてよい'],
        ['アドレス', '公開鍵から計算する、口座番号のような短い値（5.7）', '見せてよい'],
      ]} />
      <Note kind="warn">「公開鍵から秘密鍵を計算できない」は、「どんなに時間をかけても不可能」ではなく、「現実的な時間では不可能」という意味です。小さな数や小さな曲線なら、表を引けば秘密鍵が分かってしまいます（3.8、3.9で体験します）。しかし、実際の曲線は位数が約2<sup>252</sup>もあるので、表引きも総当たりもできません。</Note>
      <H3>公開鍵暗号の2つの使い方</H3>
      <P>鍵のペアの使い方は、2つあります。どちらも「片方の鍵で作り、もう片方の鍵で確かめる」点は同じですが、<B>誰がどちらの鍵を使うか</B>が逆になります。</P>
      <FigKeyUse />
      <Tbl head={['', '暗号化', '電子署名']} rows={[
        ['目的', '中身を秘密にする', '本人が承認したことと、データが変わっていないことを示す'],
        ['秘密鍵を使う人', '受信者（復号する）', '送信者（署名する）'],
        ['公開鍵を使う人', '送信者（暗号化する）', '誰でも（検証する）'],
        ['データは', '暗号文になり、読めなくなる', 'そのまま読める。署名は、データに付ける別のデータ'],
        ['ブロックチェーンでの出番', 'メッセージを秘密にしたいとき（本編第3章）', 'すべてのトランザクション（4.9）'],
      ]} />
      <Note kind="warn">「署名は、秘密鍵で暗号化したもの」という説明を見かけることがありますが、この講座で扱うEd25519の署名は、暗号化とは別の計算です（3.13）。署名はデータを隠さず、データに付ける「印」です。ブロックチェーンのデータは誰でも読めるので、署名を付けても内容は隠れません。</Note>
      <Note kind="point">楕円曲線の方式で暗号化をするときは、公開鍵でデータを直接暗号化するのではなく、「自分の秘密鍵と相手の公開鍵から、2人だけが同じ共通鍵を作る」しくみ（鍵共有。3.8）を使い、その共通鍵で速い共通鍵暗号を使うのが一般的です。暗号化を実際に行うのは、本編第3章です。</Note>
      <Note kind="point">この節の言葉を、次の節から数学で作ります。「秘密鍵から公開鍵は簡単に作れて、逆はできない」仕組みは3.8（離散対数）と3.9（楕円曲線）、データの「指紋」は3.10（ハッシュ）、署名の中身は3.12と3.13です。署名を実際に動かして確かめるのは、3.13の終わりです。</Note>

      <H>3.8 離散対数：一方向の壁</H>
      <Note kind="goal">「計算は簡単だが逆算は困難」という性質を、具体的な数で体験する。</Note>
      <P>絵の具を混ぜるのは簡単ですが、混ざった絵の具から元の色を取り出すのは困難です。数学にも同じ性質を持つ計算があります。</P>
      <P>次の式を考えます。</P>
      <Note kind="point"><code>y ＝ g<sup>x</sup> mod p</code>　（gとpは公開、xが秘密）</Note>
      <P>xが分かればyは繰り返し二乗法ですぐ求まります。しかし<B>yからxを求める問題（離散対数問題）</B>は、巨大な素数pでは総当たりしか手がありません。</P>
      <Note kind="ex">3<sup>1</sup>, 3<sup>2</sup>, 3<sup>3</sup>… を mod 13 で計算すると、3, 9, 1, 3, 9, 1… と短い周期で繰り返します。pが小さいと規則性が見えて逆算できますが、pが巨大になると規則性を利用できず、探索量が一気に膨らみます。</Note>
      <FigOneWay title="一方向の壁：計算は速く、逆算は遅い" left={['x（秘密）']} right={['y ＝ gˣ mod p']} fwd="計算：速い（繰り返し二乗法）" back="逆算：総当たりしかない（pが巨大だと不可能）" chips={{ head: '3ˣ mod 13 は 3, 9, 1 をくり返す（pが小さいと規則が見えて逆算できてしまう）', items: ['x=1 → 3', 'x=2 → 9', 'x=3 → 1', 'x=4 → 3', 'x=5 → 9'] }} />
      <Code code={MC[10]} />
      <P>実行結果を見ると、素数が大きくなるほど総当たりの回数がほぼ比例して増えます。pが256ビットなら約2<sup>256</sup>回で、現実には不可能です。</P>
      <H3>小さな素数なら、表を引けば逆算できる</H3>
      <P>離散対数が「困難」なのは、pが巨大なときだけです。小さな素数で確かめてみましょう。p ＝ 13、g ＝ 2 として、<code>2<sup>x</sup> mod 13</code> を x ＝ 0, 1, 2, … の順に表にします。</P>
      <Code code={SG[0]} />
      <Out code={`2^0=1  2^1=2  2^2=4  2^3=8  2^4=3  2^5=6  2^6=12  2^7=11  2^8=9  2^9=5  2^10=10  2^11=7
2^x ≡ 11 (mod 13) になる x = 7`} />
      <P>表を作れば、「2<sup>x</sup> ≡ 11 になる x は？」は、表から11を探すだけで x ＝ 7 と分かります。表の行数は約 p 行なので、pが13なら12行で済みます。pが256ビットなら約2<sup>256</sup>行になり、表そのものが作れません。これが「逆算は困難」の正体です。</P>
      <Tbl head={['', '順方向：xからyを求める', '逆方向：yからxを求める']} rows={[
        ['やること', 'g^x mod p を計算する', 'g^x mod p ＝ y になる x を探す'],
        ['方法', '繰り返し二乗法（3.5）', '表を引く、または総当たり'],
        ['pが256ビットのときの回数', '約256回の2乗と、最大256回の掛け算', '約 2²⁵⁶ 回'],
      ]} />
      <H3>3.9への橋渡し：「掛ける」を「点を足す」に置き換える</H3>
      <P>3.9の楕円曲線は、この「g<sup>x</sup> mod p」の<B>「掛ける」を「点を足す」に置き換えた</B>ものです。仕組みは同じで、違うのは計算の中身だけです。</P>
      <Tbl head={['', 'この節（mod p）', '3.9（楕円曲線）']} rows={[
        ['秘密', '整数 x', '整数 k'],
        ['公開される値', 'y ＝ g^x mod p（数）', 'K ＝ k × G（曲線上の点）'],
        ['繰り返す演算', 'g を x 回「掛ける」', 'G を k 回「足す」'],
        ['速く求める方法', '繰り返し二乗法', '倍々にして足す方法（同じ考え方）'],
        ['逆算', '離散対数問題', '楕円曲線上の離散対数問題'],
      ]} />
      <P>同じ強さの安全性を得るのに必要なビット数は、楕円曲線のほうがずっと小さくて済みます（256ビットの楕円曲線と、3000ビット程度のmod pが、どちらも約128ビット相当の強さとされています）。鍵や署名が短くなるので、ブロックチェーンでは楕円曲線がよく使われます。</P>
      <H3>使い道：鍵共有（ディフィー・ヘルマン）</H3>
      <P>一方向の壁を使うと、<B>秘密を送らずに、2人だけが知る共通の値を作れます</B>。これが鍵共有（ディフィー・ヘルマン鍵交換）です。AliceとBobが、盗み見られている通信路だけを使って、同じ値を作る手順を見てみましょう。</P>
      <FigKeyExchange />
      <Code code={SG[1]} />
      <Out code={`A       : 1BCB8C976060…
B       : 586D16CB07B6…
Alice鍵 : 6B8BB793B350…
Bob鍵   : 6B8BB793B350…
一致    : true`} />
      <P>手順の核心は、<code>(g<sup>a</sup>)<sup>b</sup> ＝ (g<sup>b</sup>)<sup>a</sup> ＝ g<sup>ab</sup></code> という指数の交換法則です。盗み見た人が知っているのは g、p、A、B だけです。A から a を求めるには離散対数問題を解く必要があり、現実的には不可能なので、g<sup>ab</sup> は作れません。</P>
      <Note kind="point">楕円曲線でも同じことができ、「自分の秘密鍵 × 相手の公開鍵」で共通の点が得られます。3.7で触れた、暗号化のための鍵共有は、この仕組みです。</Note>
      <Note kind="warn">この節で使った素数は、仕組みを見るための例で、安全な設定ではありません。実際には、素数の選び方などに多くの決まりがあります。また、巨大なpでも、量子コンピューターなら離散対数問題を効率よく解けることが知られています（ショアのアルゴリズム）。現在のブロックチェーンは、そのような量子コンピューターがまだ使えないことを前提にしています。</Note>

      <H>3.9 楕円曲線</H>
      <Note kind="goal">楕円曲線上の点の足し算・スカラー倍・位数が分かり、「秘密鍵・公開鍵」との対応が説明できる。</Note>
      <H3>はじめに：楕円曲線はディオファントス方程式</H3>
      <P><B>ディオファントス方程式</B>とは、整数（あるいは有理数）の解を求める多項式の方程式のことです。名前は、3世紀ごろの古代ギリシャの数学者ディオファントスに由来します。解の範囲を「実数ならなんでもよい」とせず、整数や分数に限るのが特徴です。</P>
      <Tbl head={['方程式', '求めるもの']} rows={[
        ['x² ＋ y² ＝ z²', '整数の解。(3, 4, 5) や (5, 12, 13) などのピタゴラス数'],
        ['xⁿ ＋ yⁿ ＝ zⁿ（n ≧ 3）', '整数の解。「解がない」と証明されたものが、フェルマーの最終定理'],
        ['a × x ＋ n × y ＝ 1', '整数の解 x、y。3.4の拡張ユークリッドの互除法で解いたのは、この形のディオファントス方程式'],
        ['y² ＝ x³ ＋ ax ＋ b', '整数や有理数の解 (x, y)。これが楕円曲線'],
      ]} />
      <P>つまり楕円曲線は、新しく出てきた特別な対象ではなく、「y² ＝ x³ ＋ ax ＋ b の解 (x, y) を探す」というディオファントス方程式の1つです。この方程式は解を探しにくい一方で、<B>解どうしを「足し算」して新しい解を作れる</B>という、ほかにはあまりない性質があります。次の「点の足し算」は、この性質のことです。</P>
      <Note kind="point"><B>暗号で使うときの違い</B><br />数学では、解の範囲を整数や有理数にして調べます。暗号では、解の範囲を<B>有限体（mod p）</B>に限ります。すると、解は有限個の「飛び飛びの点」になり、コンピュータで正確に計算できます。</Note>
      <H3>曲線と「点の足し算」</H3>
      <P>楕円曲線は、<code>y² ＝ x³ ＋ ax ＋ b</code> のような式を満たす点 (x, y) の集まりです。曲線上の2点には、「足し算」を定義できます（幾何的には、2点を通る直線が曲線と交わる3点目を、x軸に対して反転させた点）。足した結果も、必ず曲線上の点になります。</P>
      <FigRealCurve />
      <P>暗号では、座標が<B>有限体の元</B>である点だけを集めた、飛び飛びの点の集合として扱います。足し算の公式には<B>割り算が含まれる</B>ので、3.4の「逆元」が使われます。</P>
      <H3>曲線の条件：なめらかであること</H3>
      <P>y² ＝ x³ ＋ ax ＋ b の形でありさえすれば何でもよい、というわけではありません。<code>4a<sup>3</sup> ＋ 27b<sup>2</sup> ≠ 0</code> という条件が必要です。これは、曲線が<B>とがったり、自分自身と交わったりしていない</B>（なめらかである）ことを表しています。たとえば a ＝ b ＝ 0 の y² ＝ x³ は原点でとがっていて、そこでは接線が決まらないので、「同じ点の2倍」が計算できません。</P>
      <Note kind="ex">有限体の上では、この条件を mod p で確かめます。後の手計算の曲線（a ＝ 2、b ＝ 2、p ＝ 17）なら、4 × 2<sup>3</sup> ＋ 27 × 2<sup>2</sup> ＝ 32 ＋ 108 ＝ 140 ≡ 4 (mod 17)。0ではないので、この曲線は使えます。</Note>
      <H3>足し算の考え方：一直線上の3点の和は0</H3>
      <P>「2点を通る直線と曲線の3点目を、x軸で反転する」という定義は、少し唐突に見えます。もとの考え方は、<B>一直線上に並ぶ曲線上の3点 P、Q、R の和を 0（無限遠点O）と決める</B>というものです。</P>
      <Note kind="point">P ＋ Q ＋ R ＝ O と決めると、P ＋ Q ＝ −R になります。−R は「Rと x 座標が同じで、y の符号が逆の点」（x軸について反転した点）です。<B>これが「3点目を反転する」の正体</B>です。<br />接線の場合は、接点を2回数えます。P ＋ P ＋ R ＝ O なので、2P ＝ −R です。縦の直線の場合、P、−P、そして無限遠点Oの3点が並ぶので、P ＋ (−P) ＝ O になります。</Note>
      <P>この足し算は、3.2で学んだ<B>群の条件</B>を満たします。</P>
      <Tbl head={['群の条件', '楕円曲線の点の足し算では']} rows={[
        ['演算で閉じている', '足した結果も、必ず曲線上の点（または無限遠点O）になる'],
        ['結合法則', '(P ＋ Q) ＋ R ＝ P ＋ (Q ＋ R) が成り立つ（証明は長いので省略します）'],
        ['単位元', '無限遠点O（P ＋ O ＝ P）'],
        ['逆元', '−P（x座標が同じで、yの符号が逆の点）'],
        ['（可換）', 'P ＋ Q ＝ Q ＋ P。2点を通る直線は、順番を入れ替えても同じなので成り立つ'],
      ]} />
      <H3>足し算の公式</H3>
      <P>幾何の説明を座標の計算に直すと、次の公式になります。曲線は <code>y² ＝ x³ ＋ ax ＋ b</code>、足す2点は P ＝ (x₁, y₁) と Q ＝ (x₂, y₂)、答えは P ＋ Q ＝ (x₃, y₃) とします。計算はすべて有限体の中（mod p）で行います。</P>
      <Tbl head={['場合', '傾き s', 'x₃', 'y₃']} rows={[
        ['P ≠ Q（異なる2点）', '(y₂ − y₁) ÷ (x₂ − x₁)', 's² − x₁ − x₂', 's × (x₁ − x₃) − y₁'],
        ['P ＝ Q（同じ点の2倍）', '(3x₁² ＋ a) ÷ (2y₁)', 's² − x₁ − x₂（＝ s² − 2x₁）', 's × (x₁ − x₃) − y₁'],
      ]} />
      <Tbl head={['特別な場合', '結果']} rows={[
        ['x₁ ＝ x₂ で、y₁ ＋ y₂ ＝ 0 （QがPの逆元 −P）', 'P ＋ (−P) ＝ O（無限遠点）。直線が垂直になり、3点目が存在しない'],
        ['どちらかがO', 'P ＋ O ＝ P（Oは足し算の0にあたる単位元）'],
      ]} />
      <P>式の中の「÷」は、有限体の中では<B>逆元を掛ける</B>ことです（3.4）。たとえば「(y₂ − y₁) ÷ (x₂ − x₁)」は、「(y₂ − y₁) × (x₂ − x₁)の逆元」を mod p で計算します。</P>
      <Note kind="point"><B>公式の出どころ</B>（雰囲気をつかめれば十分です）<br />1. 2点を通る直線を <code>y ＝ s(x − x₁) ＋ y₁</code> と置くと、傾き s は (y₂ − y₁) ÷ (x₂ − x₁) です。同じ点の2倍のときは、その点での接線の傾きを使います。曲線の式を微分すると <code>2y·dy ＝ (3x² ＋ a)·dx</code> となり、接線の傾きは s ＝ (3x₁² ＋ a) ÷ (2y₁) です。<br />2. この直線の式を曲線の式に代入すると、x についての3次式になります。3次式の解の合計は、x² の係数から <code>s²</code> と分かります（解と係数の関係）。解のうち2つは x₁ と x₂ なので、3つ目の解は <code>x ＝ s² − x₁ − x₂</code>。これが x₃ です。<br />3. 3つ目の交点の y は、直線の式から <code>s(x₃ − x₁) ＋ y₁</code>。足し算の答えは、これをx軸で反転した点なので、符号を逆にして <code>y₃ ＝ s(x₁ − x₃) − y₁</code> となります。</Note>
      <P>この変形は「足す・引く・掛ける・割る」だけで成り立っているので、有限体の中でもそのまま使えます。</P>
      <H3>有限体の上で、曲線の点を探す</H3>
      <P>有限体の上の点は、<B>xを1つ決めて、右辺を計算し、それが「ある数の2乗」になっているか</B>を調べると見つかります。曲線 <code>y² ＝ x³ ＋ 2x ＋ 2 (mod 17)</code> で、x ＝ 0〜16 を全部調べてみます。</P>
      <P>先に、17で割った余りが2乗になる数を調べておきます。yと 17−y は同じ2乗になるので、1〜8を調べれば十分です。1² ＝ 1、2² ＝ 4、3² ＝ 9、4² ＝ 16、5² ＝ 25 ≡ 8、6² ＝ 36 ≡ 2、7² ＝ 49 ≡ 15、8² ＝ 64 ≡ 13。つまり、2乗になる数は <code>1, 2, 4, 8, 9, 13, 15, 16</code> の8個です。</P>
      <Tbl head={['x', 'x³ ＋ 2x ＋ 2 を17で割った余り', '曲線上の点']} rows={[
        ['0', '2', '(0, 6)、(0, 11)'],
        ['1', '5', '点なし'],
        ['2', '14', '点なし'],
        ['3', '1', '(3, 1)、(3, 16)'],
        ['4', '6', '点なし'],
        ['5', '1', '(5, 1)、(5, 16)'],
        ['6', '9', '(6, 3)、(6, 14)'],
        ['7', '2', '(7, 6)、(7, 11)'],
        ['8', '3', '点なし'],
        ['9', '1', '(9, 1)、(9, 16)'],
        ['10', '2', '(10, 6)、(10, 11)'],
        ['11', '12', '点なし'],
        ['12', '3', '点なし'],
        ['13', '15', '(13, 7)、(13, 10)'],
        ['14', '3', '点なし'],
        ['15', '7', '点なし'],
        ['16', '16', '(16, 4)、(16, 13)'],
      ]} />
      <Note kind="ex">x ＝ 1 なら、1 ＋ 2 ＋ 2 ＝ 5。5 は2乗になる数の中にないので、この x に点はありません。x ＝ 3 なら、27 ＋ 6 ＋ 2 ＝ 35 ≡ 1。1 ＝ 1² ＝ 16² なので、(3, 1) と (3, 16) の2点があります。</Note>
      <Note kind="point">点があるxでは、必ず2点（yと 17−y、x軸について対称な点）あります。点があるxは9個なので、<B>18個の点と無限遠点Oを合わせて、点の総数は19個</B>です。<br />有限体 mod p の曲線の点の数は、<B>ハッセの定理</B>により、p ＋ 1 から 2√p 以内しかずれません。p ＝ 17 なら 18 ± 約8 の範囲で、19 は範囲内です。pが2<sup>256</sup>くらいなら、点の数もほぼ2<sup>256</sup>個あります。</Note>
      <H3>手計算の例：曲線 y² ＝ x³ ＋ 2x ＋ 2 (mod 17)</H3>
      <P>この曲線は a ＝ 2 です。基点 G ＝ (5, 1) について、まず曲線上の点か確かめ、2G、3G、4Gを順に求めます。</P>
      <Note kind="ex"><B>確認</B>：G ＝ (5, 1) の左辺 y² ＝ 1。右辺 5³ ＋ 2 × 5 ＋ 2 ＝ 137 ＝ 17 × 8 ＋ 1 で、余り1。一致するので曲線上の点です。</Note>
      <Note kind="ex"><B>2G ＝ G ＋ G</B>（同じ点なので s ＝ (3x₁² ＋ a) ÷ (2y₁)）<br />s ＝ (3 × 5² ＋ 2) ÷ (2 × 1) ＝ 77 ÷ 2<br />77 ＝ 17 × 4 ＋ 9 なので 77 ≡ 9。2の逆元は 9（2 × 9 ＝ 18 ≡ 1）なので、s ＝ 9 × 9 ＝ 81 ≡ <B>13</B>（81 − 68）<br />x₃ ＝ 13² − 5 − 5 ＝ 169 − 10 ＝ 159 ≡ <B>6</B>（159 − 153）<br />y₃ ＝ 13 × (5 − 6) − 1 ＝ −14 ≡ <B>3</B>（−14 ＋ 17）<br />→ <B>2G ＝ (6, 3)</B>。確認：y² ＝ 9、6³ ＋ 2 × 6 ＋ 2 ＝ 230 ＝ 17 × 13 ＋ 9 で一致。</Note>
      <Note kind="ex"><B>3G ＝ 2G ＋ G</B>（異なる点なので s ＝ (y₂ − y₁) ÷ (x₂ − x₁)。P ＝ (6, 3)、Q ＝ (5, 1)）<br />s ＝ (1 − 3) ÷ (5 − 6) ＝ (−2) ÷ (−1) ＝ <B>2</B><br />x₃ ＝ 2² − 6 − 5 ＝ −7 ≡ <B>10</B><br />y₃ ＝ 2 × (6 − 10) − 3 ＝ −11 ≡ <B>6</B><br />→ <B>3G ＝ (10, 6)</B>。確認：y² ＝ 36 ≡ 2、10³ ＋ 2 × 10 ＋ 2 ＝ 1022 ＝ 17 × 60 ＋ 2 で一致。</Note>
      <Note kind="ex"><B>4G ＝ 2G ＋ 2G</B>（同じ点 (6, 3) の2倍）<br />s ＝ (3 × 6² ＋ 2) ÷ (2 × 3) ＝ 110 ÷ 6。110 ≡ 8（110 − 102）、6の逆元は 3（6 × 3 ＝ 18 ≡ 1）なので、s ＝ 8 × 3 ＝ 24 ≡ <B>7</B><br />x₃ ＝ 7² − 6 − 6 ＝ 37 ≡ <B>3</B>、y₃ ＝ 7 × (6 − 3) − 3 ＝ 18 ≡ <B>1</B><br />→ <B>4G ＝ (3, 1)</B>。下の表の k ＝ 4 と一致します。</Note>
      <Note kind="ex"><B>位数</B>（Gを足し続けて、無限遠点Oに戻るまでの回数。3.2の「元の位数」と同じ意味。詳しくは次の節）：表の k ＝ 18 は (5, 16)。G ＝ (5, 1) と x が同じで、y の合計は 1 ＋ 16 ＝ 17 ≡ 0 です。つまり 18G は −G で、<B>19G ＝ 18G ＋ G ＝ O（無限遠点）</B>になります。位数は19です。</Note>
      <H3>スカラー倍と位数</H3>
      <P>点Gを自分自身に足し続けると、G, 2G, 3G, 4G… という点の列ができます。<B>kGは「Gをk回足した点」</B>で、これを<B>スカラー倍</B>と呼びます。足し続けると、いつか「無限遠点O」（足し算の0にあたる点）に戻ります。そこまでの回数が<B>位数</B>です（3.2の「元の位数」と同じ意味です）。</P>
      <Note kind="ex">集合の言葉で言い直すと、<B>曲線上の点すべて（無限遠点Oを含む）を集めた集合E</B>が、点の足し算について閉じています。単位元はO、点Pの逆元は、x座標が同じでyの符号を反転した点−Pです。Gの倍 G, 2G, 3G, …, O を集めた集合はEの<B>部分集合</B>で、その元の個数がGの位数です。</Note>
      <Note kind="point"><B>秘密鍵</B>＝整数k　→　<B>公開鍵</B>＝点 K ＝ k × G<br />kとGから K は速く求まりますが、KとGからkを求める（楕円曲線の離散対数問題）のは現実的に不可能です。</Note>
      <FigOneWay title="秘密鍵と公開鍵：片方向にしか計算できない" left={['秘密鍵 k', '（整数）']} right={['公開鍵 K ＝ k × G', '（曲線上の点）']} fwd="計算：速い（倍々にして足す）" back="逆算：現実的に不可能" />
      <H3>手で追える小さな曲線</H3>
      <P>曲線 <code>y² ＝ x³ ＋ 2x ＋ 2 (mod 17)</code>、基点 G ＝ (5, 1) で、kGを順に求めます。</P>
      <Code code={MC[11]} />
      <Out code={'k=1: (5, 1)\nk=2: (6, 3)\nk=3: (10, 6)\nk=4: (3, 1)\nk=5: (9, 16)\nk=6: (16, 13)\nk=7: (0, 6)\nk=8: (13, 7)\nk=9: (7, 6)\nk=10: (7, 11)\nk=11: (13, 10)\nk=12: (0, 11)\nk=13: (16, 4)\nk=14: (9, 1)\nk=15: (3, 16)\nk=16: (10, 11)\nk=17: (6, 14)\nk=18: (5, 16)\nk=19: O（無限遠点）'} />
      <FigFiniteCurve />
      <P>手計算で求めた 2G、3G、4G が、表と一致していることを確かめてください。途中の傾き s まで表示するコードも用意しました（上のコードを実行したあとに実行してください）。</P>
      <Code code={MC[23]} />
      <Out code={'s = 9 ÷ 2 = 9 × 9 = 13\n(x3, y3) = (6, 3)\ns = 15 ÷ 16 = 15 × 16 = 2\n(x3, y3) = (10, 6)'} />
      <P>2行目の「15 ÷ 16」は、手計算の「(−2) ÷ (−1)」と同じものです（−2 ≡ 15、−1 ≡ 16）。</P>
      <P>k=19で無限遠点Oに戻るので、位数は19です。秘密鍵は1〜18のどれか、公開鍵は上の表の点のどれかです。<B>この曲線は19通りしかないので、表を引けば秘密鍵が分かってしまいます</B>。実際に使う曲線は位数が約2<sup>252</sup>もあり、この表引きができません。</P>
      <H3>kGを速く求める：バイナリ法の点版</H3>
      <P>3.5のバイナリ法は、点の計算でもそのまま使えます。<B>「2乗」が「点の2倍（P ＋ P）」、「bを掛ける」が「Pを足す」</B>に変わるだけです。13G を例にします。13 ＝ <code>1101</code> ＝ 8 ＋ 4 ＋ 1 なので、13G ＝ 8G ＋ 4G ＋ G です。</P>
      <Note kind="ex"><B>① 2倍を重ねて、2G、4G、8Gを作る</B><br />2G ＝ (6, 3)、4G ＝ (3, 1) は手計算済みです。8G ＝ 4G ＋ 4G は、s ＝ (3 × 3² ＋ 2) ÷ (2 × 1) ＝ 29 ÷ 2 ≡ 12 × 9 ≡ 6、x₃ ＝ 6² − 3 − 3 ≡ 13、y₃ ＝ 6 × (3 − 13) − 1 ＝ −61 ≡ 7。→ <B>8G ＝ (13, 7)</B><br /><B>② 8G ＋ 4G ＝ 12G</B>（P ＝ (13, 7)、Q ＝ (3, 1)）<br />s ＝ (1 − 7) ÷ (3 − 13) ＝ (−6) ÷ (−10) ＝ 6 ÷ 10。10の逆元は12（10 × 12 ＝ 120 ≡ 1）なので s ＝ 6 × 12 ＝ 72 ≡ 4。x₃ ＝ 4² − 13 − 3 ＝ 0、y₃ ＝ 4 × (13 − 0) − 7 ＝ 45 ≡ 11。→ <B>12G ＝ (0, 11)</B><br /><B>③ 12G ＋ G ＝ 13G</B>（P ＝ (0, 11)、Q ＝ (5, 1)）<br />s ＝ (1 − 11) ÷ (5 − 0) ＝ −2 ≡ 15。x₃ ＝ 15² − 0 − 5 ＝ 220 ≡ 16、y₃ ＝ 15 × (0 − 16) − 11 ＝ −251 ≡ 4。→ <B>13G ＝ (16, 4)</B>（表の k ＝ 13 と一致）</Note>
      <P>13回足す代わりに、<B>2倍が3回、足し算が2回</B>の合計5回で済みました。指数が256ビットなら、2倍が約256回、足し算が最大256回です。<B>秘密鍵 k から公開鍵 K ＝ kG が速く求まる</B>のは、この方法のおかげです。一方、KとGからkを逆算する方法は、総当たり以外にありません。</P>
      <H3>実際に使われる曲線</H3>
      <P>ここで説明した y² ＝ x³ ＋ ax ＋ b の形の曲線の代表が、ビットコインなどで使われる<B>secp256k1</B>です。a ＝ 0、b ＝ 7、pは約2<sup>256</sup>の素数で、位数（Gを足し続けてOに戻るまでの回数）も約2<sup>256</sup>あります。一方、3.13で使うEd25519は、同じ楕円曲線の仲間でも<B>エドワーズ曲線</B>という別の形で、足し算の公式が違います。どちらも「点の足し算が群になり、kGは速く求まるが、逆算はできない」という性質は同じです。</P>

      <H>3.10 ハッシュ関数</H>
      <Note kind="goal">ハッシュ関数の性質と、ブロックチェーンでの使い道を説明し、コンソールで確かめられる。</Note>
      <P>ダウンロードしたファイルが壊れていないか、すり替えられていないかを確かめるとき、配布元が公開している「ハッシュ値」と、手元で計算したハッシュ値を見比べることがあります。ファイル全体を見比べる代わりに、<B>短い値を1つ比べるだけ</B>で済むからです。この「データの身代わりになる短い値」を作るのが、ハッシュ関数です。</P>
      <P>ハッシュ関数は任意の長さのデータを<B>固定長の「指紋」</B>に変換します。入力を<B>メッセージ</B>、出力を<B>ハッシュ値</B>（ダイジェスト）と呼びます。人の指紋がその人の身代わりになるように、ハッシュ値はデータの身代わりになります。性質は3つです。</P>
      <Ul items={['同じ入力なら必ず同じ出力（決定性）', '1ビットでも入力が違えば出力はまったく別物（雪崩効果）', '出力から入力を逆算できない（一方向性）']} />
      <FigHash />
      <P>ここに「出力の長さが、入力の長さに関係なく一定」という性質が加わります。この4つを、順にコンソールで確かめます。</P>

      <H3>出力の長さは、入力の長さに関係なく一定</H3>
      <P>SHA-256の出力は256ビット（32バイト）で、16進数で書くと64桁です（1バイトが2桁）。空文字でも、1万文字でも、同じ長さになります。</P>
      <Code code={HASH_LEN} />
      <Out code={'入力     0 文字 → 64 桁 E3B0C44298FC1C14…\n入力     1 文字 → 64 桁 CA978112CA1BBDCA…\n入力     5 文字 → 64 桁 185F8DB32271FE25…\n入力 10000 文字 → 64 桁 E4EEA943AB0D3C77…'} />
      <P>空文字のハッシュ値（E3B0C442…）も、世界共通で同じ値です。どれだけ長いデータでも、64桁の値1つで代表させられます。署名やマークルツリー（4.7）が、データの長さに左右されないのは、このおかげです。</P>

      <H3>同じ入力なら、同じ出力（決定性）</H3>
      <P>ハッシュ関数には、乱数も、鍵も、時刻も入りません。<B>同じ入力は、いつ、どこで、誰が計算しても、同じ出力</B>になります。次のコードは、何度実行しても、他の人のコンソールで実行しても、同じ値が出ます。</P>
      <Code code={SHA + '\nconsole.log(await sha("Hello"));\nconsole.log(await sha("hello"));'} />
      <Out code={'185F8DB32271FE25F561A6FC938B2E264306EC304EDA518007D1764826381969\n2CF24DBA5FB0A30E26E83B2AC5B9E29E1B161E5C1FA7425E73043362938B9824'} />
      <P>だから、ハッシュ値を伝えるだけで、「同じデータか」を確かめられます。ハッシュ値が一致すれば同じデータ、1つでも違えば別のデータです。ファイルの照合や、ブロックチェーンでの「データが書き換えられていないか」の確認は、この性質を使っています。</P>

      <H3>1ビット違えば、出力は別物（雪崩効果）</H3>
      <P>上の2つの入力は、大文字と小文字が違うだけですが、出力はまったく似ていません。実は「H」と「h」は、文字コードで1ビットしか違いません（0x48 ＝ 01001000、0x68 ＝ 01101000）。出力で何ビット違うか、数えてみます。</P>
      <Code code={HASH_AVALANCHE} />
      <Out code={'185F8DB32271FE25F561A6FC938B2E264306EC304EDA518007D1764826381969\n2CF24DBA5FB0A30E26E83B2AC5B9E29E1B161E5C1FA7425E73043362938B9824\n違うビット: 125 ／ 256\n26組の平均: 129.5 ビット（256ビット中）'} />
      <P>入力が1ビット違うだけで、出力は<B>約半分（128ビット前後）のビットが変わります</B>。雪崩が一気に広がるように、小さな違いが出力全体に広がるので、この名前が付いています。「似たデータは、似たハッシュ値になる」ということが<B>ありません</B>。そのため、データが少しでも書き換えられると、ハッシュ値は別物になり、すぐ見つかります。また、ハッシュ値を見ても、元のデータにどれだけ近いか、手がかりが得られません。</P>

      <H3>出力から入力は逆算できない（一方向性）</H3>
      <P>ハッシュ値から入力を求める「逆算の公式」はありません。できるのは、<B>入力の候補を1つずつハッシュにして、一致するものを探す（総当たり）</B>ことだけです。候補が少なければ、これで見つかってしまいます。例として、4桁の暗証番号（0000〜9999の1万通り）のハッシュ値から、暗証番号を探してみます。</P>
      <Code code={HASH_BRUTE} />
      <Out code={'見つかった暗証番号: 4821\n試した回数: 4822 ／ 全部で10000通り'} />
      <P>逆算の公式がなくても、候補が1万通りなら、あっという間に見つかりました。一方向性が守ってくれるのは、<B>入力の候補が膨大なとき</B>だけです。256ビットの乱数なら 2<sup>256</sup>（約 10<sup>77</sup>）通りで、全部を試すことはできません（3.11）。秘密鍵や乱数に、桁数の大きなランダムな値を使うのは、この理由です。</P>
      <Note kind="warn"><B>ハッシュは、暗号化ではありません。</B>暗号化は、鍵があれば元に戻せます（3.7）。ハッシュ関数には鍵がなく、元に戻す方法もありません。そのかわり、誰が計算しても同じ値になるので、「同じデータか」の照合に使えます。「ハッシュにして送って、あとで元に戻す」使い方はできません。</Note>

      <H3>攻撃する側から見た、3つの強さ</H3>
      <P>安全なハッシュ関数には、「一方向性」をさらに細かく分けた、次の3つの強さが求められます。数字は、理想的な256ビットのハッシュ関数を、総当たりで破るのにかかる回数です。</P>
      <Tbl head={['名前', '破られない、とはどういうことか', '総当たりでかかる回数']} rows={[
        ['原像耐性', 'ハッシュ値 h から、H(x) ＝ h になる入力 x を見つけられない（上の「一方向性」）', '約 2²⁵⁶ 回'],
        ['第二原像耐性', 'ある入力 x₁ から、同じハッシュ値になる別の入力 x₂ を見つけられない（すり替えができない）', '約 2²⁵⁶ 回'],
        ['衝突耐性', '同じハッシュ値になる2つの入力を、組み合わせを問わず見つけられない', '約 2¹²⁸ 回（3.11の誕生日のパラドックス）'],
      ]} />
      <Note kind="point"><B>衝突は「存在しない」のではなく、「見つけられない」</B>のです。入力は無限にありますが、出力は 2<sup>256</sup> 通りしかないので、同じハッシュ値になる入力は必ず存在します（部屋より鳩が多ければ、同じ部屋に入る鳩がいる、という考え方です）。ただし、探すのに 2<sup>128</sup> 回かかるので、現実には見つかりません。3つの中で、衝突耐性がいちばん破りやすく、ハッシュの安全性は<B>出力ビット数の半分</B>で見積もります。次の節で、数字で確かめます。</Note>

      <H3>ハッシュ関数の種類と、この講座での使い道</H3>
      <P>ハッシュ関数にはいくつもの種類があり、性質はどれも同じです。ブラウザ標準で使えるのはSHA-256なので、第3章・第4章のコードは、これで体験します。Symbolが実際に使うものは、第5章で動かします。</P>
      <Tbl head={['名前', '出力の長さ', '使われる場所']} rows={[
        ['SHA-256', '256ビット（32バイト）', 'ブラウザ標準（crypto.subtle）で使える。第3章・第4章のコードで、ハッシュの代わりに使う'],
        ['SHA3-256', '256ビット（32バイト）', 'Symbolのブロック・トランザクションのハッシュ、マークルツリー、アドレスの導出（5.6、5.7）'],
        ['SHA-512', '512ビット（64バイト）', 'Ed25519の鍵の導出と署名（3.13、5.7）'],
        ['RIPEMD-160', '160ビット（20バイト）', 'アドレスの導出で、公開鍵のハッシュを短くする（5.7）'],
      ]} />
      <Note kind="warn">MD5やSHA-1といった古いハッシュ関数は、衝突が実際に見つかっているので、安全性が必要な用途には使いません。また、SHA3-256とKeccak-256は、区切りのバイトだけが違う別物です（5.7）。</Note>

      <H3>ブロックチェーンでの使い道</H3>
      <P>ハッシュ関数は、これから先の章のあちこちに出てきます。ここで、どこで何に使うかを先に見ておきます。</P>
      <Tbl head={['使い道', 'ハッシュで何をするか', '節']} rows={[
        ['署名', 'データを固定長のハッシュにしてから、署名の計算に使う。データが長くても、署名の長さは変わらない', '3.12、3.13'],
        ['ブロックの鎖（ハッシュチェーン）', '前のブロックのハッシュを、次のブロックに入れてつなぐ。1か所を書き換えると、後ろがすべて合わなくなる', '4.6'],
        ['マークルツリー', '多数の取引のハッシュを、2つずつ束ねて、1つのハッシュ（マークルルート）にまとめる', '4.7'],
        ['ブロック・トランザクションのID', 'データのハッシュを、そのデータの「名前（ID）」として使う。同じデータなら、同じIDになる', '4.5、5.6'],
        ['アドレス', '公開鍵をハッシュにして短くする。アドレスの間違いを見つけるチェックサムにも使う', '5.7'],
      ]} />
      <Note kind="ex"><B>ハッシュ値だけを先に公開して、あとで答え合わせをする</B><br />試合の勝敗の予想を、先に発表したいが、中身は今は見せたくないとします。予想の文章そのものではなく、<B>そのハッシュ値だけ</B>を先に公開します。結果が出てから予想の文章を見せれば、誰でもハッシュ値を計算して、「確かに前から決めていた」と確かめられます。後から書き換えると、ハッシュ値が合いません。<br />ただし、予想が「AかB」のように候補が少ないと、ハッシュ値を見た人が両方を試して、当てられてしまいます（上の暗証番号の実験と同じです）。実際には、推測できない乱数を混ぜて、候補を増やします。</Note>
      <P>256ビットのハッシュが「ほかと重ならない」と言える理由は、次の節で、数字を使って確かめます。</P>

      <H>3.11 確率と数の大きさ</H>
      <Note kind="goal">「他人と鍵が重ならない」「ハッシュが衝突しない」と言える根拠を、数字で説明できる。</Note>
      <P>ブロックチェーンの安全性は、「偶然に一致する確率が、現実には起こらないほど小さい」ことに支えられています。浜辺の砂のうち、あなたが印を付けた1粒を目隠しで当てる確率のようなものです。</P>
      <H3>先に道具：組み合わせの数 C(N, M)</H3>
      <P>N個のものからM個を選ぶ選び方の総数を<B>組み合わせ C(N, M)</B>といいます。たとえば、「N人のうちM人の承認が必要」というルールのとき、承認者の選び方がこの数だけあります。</P>
      <Note kind="ex">3人中2人なら、AB・AC・BC の<B>3通り</B>です。</Note>
      <Code code={MC[17]} />
      <H3>衝突確率の式はどこから来るのか</H3>
      <P>ここでは「N通りの値の中から、n個を無作為に選んだとき、どれか2つが同じ値になる確率」を考えます。ハッシュ値が256ビットなら N ＝ 2<sup>256</sup> です。最初は身近な例（誕生日、N ＝ 365）で考え、そのあとN ＝ 2<sup>256</sup> に当てはめます。</P>
      <Note kind="ex"><B>ステップ1：ペアの数を数える</B><br />n個から2個を選ぶ組み合わせは C(n, 2) ＝ n(n − 1) ÷ 2 通りです（組み合わせは、上で見た C(n, M)）。nが大きいときは n² ÷ 2 とみなせます。<br />例：23人なら 23 × 22 ÷ 2 ＝ 253組。</Note>
      <Note kind="ex"><B>ステップ2：1組が一致する確率</B><br />2つ目の値が1つ目と同じになるのは、N通りのうち1通りだけです。だから1組が一致する確率は <B>1 ÷ N</B>。</Note>
      <Note kind="ex"><B>ステップ3：ペアごとの確率を足す</B><br />「どれかのペアが一致する確率」は、各ペアの確率を足し合わせたもの以下です。（足し算だと、2組以上が同時に一致する場合を二重に数えるぶん、実際より少し大きくなります。）確率が小さいうちは、ほぼ等しくなります。<br />衝突の確率 ≲ (ペアの数) × (1組の確率) ≈ <B>n² ÷ (2N)</B>（「≲」は「以下で、値が小さいときはほぼ等しい」の意味）<br />N ＝ 2<sup>256</sup> なら、<code>n² ÷ 2<sup>257</sup></code>。これが下のコードで使っている式です。</Note>
      <P>「実際の確率はこの値以下」と言えるので、安全性を示すときは都合のよい見積もりです。たとえば n ＝ 1兆（10<sup>12</sup>）個のハッシュを作っても、衝突の確率は 10<sup>24</sup> ÷ 2<sup>257</sup> ≈ 4 × 10<sup>−54</sup> 以下です。</P>
      <Note kind="ex"><B>ステップ4：「50%になる個数」を求める</B><br />今度は逆に、「衝突しない確率」を順に掛けて求めます。2つ目が1つ目と違う確率は (N − 1) ÷ N、3つ目が前の2つと違う確率は (N − 2) ÷ N、… なので、<br />衝突しない確率 ＝ (1 − 1/N) × (1 − 2/N) × … × (1 − (n−1)/N)<br />xが小さいとき 1 − x ≈ e<sup>−x</sup>（eは約2.718）と近似できるので、これは e<sup>−(1 ＋ 2 ＋ … ＋ (n−1))/N</sup> ＝ e<sup>−n(n−1)/(2N)</sup> ≈ e<sup>−n²/(2N)</sup> となります。<br />これが 1/2 になるのは n² ÷ (2N) ＝ ln 2（約0.693）のとき（ln は、eを底とする対数＝自然対数）。つまり <B>n ＝ √(2 · ln 2 · N) ≈ 1.18 × √N</B>。<br />N ＝ 365 なら 約22.5、つまり<B>23人</B>で50%を超えます（誕生日のパラドックス）。<br />N ＝ 2<sup>256</sup> なら √N ＝ 2<sup>128</sup> なので、<B>約 1.18 × 2<sup>128</sup>（おおよそ 2<sup>128</sup>）個</B>です。</Note>
      <P>一般に、nビットの空間なら N ＝ 2<sup>n</sup>、√N ＝ 2<sup>n/2</sup> なので、衝突が現実になるのは約 2<sup>n/2</sup> 個作ったときです。これが「256ビットのハッシュで衝突を探すには、約2<sup>128</sup>回かかる」の理由です。</P>
      <P>誕生日の例で、厳密な値と近似の式を比べてみます。</P>
      <Code code={MC[24]} />
      <Out code={'10人  厳密: 0.1169  n²/2N: 0.1370  1−e^(−n²/2N): 0.1280\n23人  厳密: 0.5073  n²/2N: 0.7247  1−e^(−n²/2N): 0.5155\n50人  厳密: 0.9704  n²/2N: 3.4247  1−e^(−n²/2N): 0.9674\n50%になる人数 ≈ √(2·ln2·N) = 22.5\nN = 2^256 なら ≈ 4.006518692980012e+38 個（≈ 1.18 × 2^128）'} />
      <P>確率が小さいうちは3つの値が近く、50人のように確率が1に近づくと「n² ÷ 2N」は1を超えてしまい、確率としては使えなくなります（ステップ3の式は「小さいときの見積もり」だからです）。1に近いときは、e<sup>−x</sup> を使った式のほうが正確です。</P>
      <Ul items={['nビットの乱数が、特定の1つに当たる確率は 1 ÷ 2ⁿ', '誕生日のパラドックス：「どれか2つが一致する」確率は、個数nに対して n² ÷ (2N) で増えるため、全体Nの平方根の個数で半分に達する。nビットなら約 2^(n/2) 個', '256ビットのハッシュで衝突を探す難しさは、約2^128回']} />
      <Code code={MC[15]} />
      <Tbl head={['出力の行', '何を計算しているか']} rows={[
        ['256ビットで衝突する確率', '上のステップ3の式 n² ÷ 2²⁵⁷ に n ＝ 10¹² を入れたもの（約 4.3e-54）'],
        ['衝突が50%になる個数', 'ステップ4の結果の 2¹²⁸（係数 1.18 は無視）'],
        ['宇宙の原子の数', '約 10⁸⁰ は、2を何乗かに直すと 80 × log₂10 ≈ 2²⁶⁶。2¹²⁸（約 3.4 × 10³⁸）はそれよりずっと小さいが、現実に試せる回数をはるかに超える'],
        ['32ビットなら', '同じ式に N ＝ 2³² を入れたもの。n² ÷ 2³³ ≈ 1.2 × 10¹⁴ で、1を大きく超える（ほぼ確実に衝突）'],
      ]} />
      <Note kind="warn">最後の行の確率は1を超えています。これは「ほぼ確実に衝突する」という意味です。ビット幅が小さいと安全でないことが、数字で見えます。</Note>

      <H>3.12 電子署名</H>
      <Note kind="goal">電子署名で何が保証され、誰が何を使って署名・検証するかを説明できる。</Note>
      <P>署名は「<B>このデータは秘密鍵の持ち主が確かに承認した</B>」ことを示すデータです。流れは、①送信者がデータのハッシュに秘密鍵で署名する、②誰でも公開鍵で署名が正しいか検証できる、③データが1ビットでも変わると検証に失敗する、です。管理者のいないブロックチェーンのような仕組みでは、「署名＝本人の意思表示」になります。公開鍵暗号の中での位置づけ（暗号化との違い）は3.7で整理しました。ブロックチェーンでの使われ方は、4.3で整理します。</P>
      <FigSigFlow />
      <H3>署名と検証で使うもの</H3>
      <Tbl head={['操作', '入力', '出力', 'できる人']} rows={[
        ['署名する', 'データ、秘密鍵', '署名', '秘密鍵を持つ人だけ'],
        ['検証する', 'データ、署名、公開鍵', '成功／失敗', '公開鍵を知っている誰でも'],
      ]} />
      <P>検証に<B>秘密鍵は要りません</B>。だから、秘密鍵を誰にも見せなくても、世界中の誰もが署名を確かめられます。</P>
      <H3>なぜデータそのものではなく、ハッシュを使うのか</H3>
      <P>署名の計算の中心は、曲線上の計算です。データの長さに合わせて曲線の計算が増えないように、データは3.10のハッシュ関数で<B>固定長の指紋</B>にしてから、署名の計算に使います。データがどれだけ長くても、署名の長さは変わりません（Ed25519の署名は64バイト）。ハッシュは1ビット変わると別の値になるので、データが書き換えられると、検証は失敗します。</P>
      <H3>署名の中身を、小さな数で作ってみる</H3>
      <P>署名の仕組みを、3.8の「g<sup>x</sup> mod p」で作ってみます（Schnorr署名という方式で、Ed25519はこの仲間です）。手で追えるように、素数は小さくしてあります。</P>
      <Tbl head={['ステップ', '式', '意味']} rows={[
        ['鍵', 'a：秘密鍵　A ＝ g^a mod p：公開鍵', '3.8の一方向の壁。Aから a は分からない'],
        ['① 使い捨ての秘密', 'r：署名ごとの乱数　R ＝ g^r mod p', 'Rは公開してよい'],
        ['② 指紋', 'h ＝ H(R, A, データ)', 'R、公開鍵、データをまとめたハッシュ。データが変わると h も変わる'],
        ['③ 署名', 'S ＝ r ＋ h × a （mod q）', '秘密 a と、使い捨ての r を混ぜる。署名は (R, S) の組'],
        ['検証', 'g^S ＝ R × A^h （mod p）', '秘密鍵は使わず、公開されている値だけで確かめる'],
      ]} />
      <P>検証の式が成り立つ理由は、1行で書けます。<code>g<sup>S</sup> ＝ g<sup>r＋h·a</sup> ＝ g<sup>r</sup> × (g<sup>a</sup>)<sup>h</sup> ＝ R × A<sup>h</sup></code>。秘密鍵 a は、検証の式の中には現れません。</P>
      <Code code={SG[2]} />
      <Out code={`公開鍵 A = 448
署名 (R, S) = (449, 99)
そのまま          : true
データを変える    : false
Sを1だけ変える    : false`} />
      <P>データを変えると h が変わり、署名の S と合わなくなるので、検証に失敗します。なお、この模型は q が小さいので、まれに偶然成り立つことがあります。実際の q は約2<sup>252</sup>あり、その心配はありません。</P>
      <Note kind="point">この仕組みの「mod p の掛け算」を、「楕円曲線の点の足し算」に置き換えると、Ed25519になります。3.13で、実際に動かします。</Note>
      <H3>つまずき注意：乱数 r を使い回してはいけない</H3>
      <P>署名のたびに作る r は、<B>必ず毎回違う値</B>にする必要があります。同じ r で2つのデータに署名すると、<code>S₁ ＝ r ＋ h₁a</code>、<code>S₂ ＝ r ＋ h₂a</code> から r が消えて、<code>a ＝ (S₁ − S₂) ÷ (h₁ − h₂)</code> と、秘密鍵が計算できてしまいます。h と S は、署名とデータから誰でも分かる値です。</P>
      <Code code={SG[3]} />
      <Out code={`h1 = 3  h2 = 78  S1 = 99  S2 = 49
計算で求めた秘密鍵: 77
本物の秘密鍵      : 77`} />
      <Note kind="warn">乱数の使い回しや、予測できる乱数による秘密鍵の漏えいは、実際のシステムでも起きています。Ed25519は、r を「秘密鍵の一部とデータのハッシュ」から決めるので、同じデータには同じ署名ができ、別のデータには別の r になります。乱数の質に頼らずに済む設計です。</Note>
      <H3>署名で保証されること、されないこと</H3>
      <Tbl head={['', '内容', '理由・補足']} rows={[
        ['保証される', '秘密鍵の持ち主が、このデータを承認した', '秘密鍵 a を知らないと、検証を通る S は作れない（離散対数問題が解けないため）'],
        ['保証される', 'データが、署名のあとで変わっていない', 'データが変わると h が変わり、検証の式が成り立たない'],
        ['保証される', '後から「署名していない」と言いにくい', '本人以外には作れない署名だから。ただし、鍵が盗まれた場合などは別（3.13）'],
        ['保証されない', 'データの中身が秘密であること', '署名はデータを隠さない（3.7）'],
        ['保証されない', '同じ署名済みデータの、送り直しの防止', '期限などを署名に含めて防ぐ（4.3、4.9）'],
        ['保証されない', '署名した人が、現実の誰か', '署名が示すのは「この鍵の持ち主」まで（3.13）'],
      ]} />

      <H>3.13 Ed25519：鍵と署名の計算を動かす</H>
      <Note kind="goal">Ed25519の曲線で公開鍵を計算し、署名がなぜ検算できるのかを説明できる。</Note>
      <P>ここで動かす曲線は、多くのシステムで使われる署名方式<B>Ed25519</B>のもので、有限体は2<sup>255</sup>−19、式は <code>−x² ＋ y² ＝ 1 ＋ d·x²y²</code> です。実装は意外に短く、必要なのは<B>点の足し算</B>と、倍々にして足す<B>スカラー倍</B>だけです。</P>
      <Note kind="warn">ここでは数学の核心部分だけを取り出して動かすため、鍵の導出や署名のハッシュの細部は省略しています。実際のSymbolでの鍵の導出（秘密鍵をSHA-512でハッシュしてから曲線を使う）は、5.7で動かします。</Note>
      <H3>Ed25519の足し算公式（エドワーズ曲線）</H3>
      <P>3.9の公式は <code>y² ＝ x³ ＋ ax ＋ b</code> の形の曲線用でした。Ed25519は、同じ楕円曲線の仲間でも<B>エドワーズ曲線</B>という別の形で表したもので、足し算の公式が違います。</P>
      <Note kind="point">曲線：<code>−x² ＋ y² ＝ 1 ＋ d·x²y²</code><br />足し算：(x₁, y₁) ＋ (x₂, y₂) ＝ (x₃, y₃)<br />　<code>x₃ ＝ (x₁y₂ ＋ x₂y₁) ÷ (1 ＋ d·x₁x₂y₁y₂)</code><br />　<code>y₃ ＝ (y₁y₂ ＋ x₁x₂) ÷ (1 − d·x₁x₂y₁y₂)</code><br />単位元（足し算の0）は <B>(0, 1)</B>。点 (x, y) の逆元は <B>(−x, y)</B>。</Note>
      <P>この公式の利点は、<B>場合分けが要らない</B>ことです。同じ点の2倍でも、逆元との足し算でも、同じ式で計算できます。Ed25519の定数 d は有限体の中で「平方数でない」ように選ばれていて、分母 1 ± d·x₁x₂y₁y₂ が0になることがありません。だから実装が短く、特殊なケースの処理漏れも起きにくくなっています。</P>
      <H3>小さな体で手計算する（mod 13）</H3>
      <P>仕組みを手で追えるように、有限体を13、定数を d ＝ 2、基点を B ＝ (2, 4) とした小さなエドワーズ曲線 <code>−x² ＋ y² ＝ 1 ＋ 2x²y² (mod 13)</code> で、2B と 3B を求めます。</P>
      <Note kind="ex"><B>確認</B>：B ＝ (2, 4)。左辺 −4 ＋ 16 ＝ 12。右辺 1 ＋ 2 × 4 × 16 ＝ 129 ＝ 13 × 9 ＋ 12 で、余り12。一致するので曲線上の点です。</Note>
      <Note kind="ex"><B>2B ＝ B ＋ B</B>（x₁ ＝ x₂ ＝ 2、y₁ ＝ y₂ ＝ 4）<br />k ＝ d·x₁x₂y₁y₂ ＝ 2 × 2 × 2 × 4 × 4 ＝ 128 ≡ <B>11</B>（128 − 117）<br /><B>x₃</B>：分子 x₁y₂ ＋ x₂y₁ ＝ 8 ＋ 8 ＝ 16 ≡ 3。分母 1 ＋ k ＝ 12。12の逆元は12（12 × 12 ＝ 144 ＝ 13 × 11 ＋ 1）。x₃ ＝ 3 × 12 ＝ 36 ≡ <B>10</B><br /><B>y₃</B>：分子 y₁y₂ ＋ x₁x₂ ＝ 16 ＋ 4 ＝ 20 ≡ 7。分母 1 − k ＝ −10 ≡ 3。3の逆元は9（3 × 9 ＝ 27 ≡ 1）。y₃ ＝ 7 × 9 ＝ 63 ≡ <B>11</B><br />→ <B>2B ＝ (10, 11)</B></Note>
      <Note kind="ex"><B>3B ＝ 2B ＋ B</B>（P ＝ (10, 11)、Q ＝ (2, 4)）<br />k ＝ 2 × 10 × 2 × 11 × 4 ＝ 1760 ≡ <B>5</B>（1760 − 1755）<br /><B>x₃</B>：分子 x₁y₂ ＋ x₂y₁ ＝ 40 ＋ 22 ＝ 62 ≡ 10。分母 1 ＋ 5 ＝ 6。6の逆元は11（6 × 11 ＝ 66 ＝ 65 ＋ 1）。x₃ ＝ 10 × 11 ＝ 110 ≡ <B>6</B><br /><B>y₃</B>：分子 y₁y₂ ＋ x₁x₂ ＝ 44 ＋ 20 ＝ 64 ≡ 12。分母 1 − 5 ＝ −4 ≡ 9。9の逆元は3（9 × 3 ＝ 27 ≡ 1）。y₃ ＝ 12 × 3 ＝ 36 ≡ <B>10</B><br />→ <B>3B ＝ (6, 10)</B></Note>
      <P>同じ計算をコードで k ＝ 1〜16 まで続けます。16回足すと単位元 (0, 1) に戻るので、この小さな曲線では<B>Bの位数は16</B>です。</P>
      <Code code={MC[25]} />
      <Out code={'k=1: (2,4)\nk=2: (10,11)\nk=3: (6,10)\nk=4: (8,0)\nk=5: (6,3)\nk=6: (10,2)\nk=7: (2,9)\nk=8: (0,12)\nk=9: (11,9)\nk=10: (3,2)\nk=11: (7,3)\nk=12: (5,0)\nk=13: (7,10)\nk=14: (3,11)\nk=15: (11,4)\nk=16: (0,1)'} />
      <FigEdwardsCurve />
      <Note kind="ex"><B>本物のEd25519の曲線は、グラフにできません</B><br />Ed25519の有限体は 2²⁵⁵−19 で、曲線上の点は約2<sup>255</sup>個あるので、1つずつ描くことはできません。そこで上の図は、同じ形の式を mod 13 にした小さな曲線を描いたものです。<br />ちなみに、dの値（−121665 ÷ 121666 ≈ −0.99999）のまま、実数の座標平面に式を描くと、y が ±1 からほとんどずれないため、ほぼ2本の水平な直線になってしまいます。曲線らしい形は見えません。エドワーズ曲線は、座標が有限体の元であるときに、はじめて暗号に使える群になります。</Note>
      <P>k ＝ 2 と 3 が手計算の答えと一致しています。k ＝ 8 の (0, 12) は、(0, −1) のことで、2倍すると単位元になる点です。Ed25519の実装は、体を2<sup>255</sup>−19、dを −121665 ÷ 121666 に取り替えただけで、やっていることは同じです。</P>
      <H3>ステップ0：部品の全体像</H3>
      <P>これから作る部品を、先に一覧にしておきます。上から順に、前の部品を使って次の部品を作ります。</P>
      <Tbl head={['部品', '何をするか', '使っている数学']} rows={[
        ['p、mod、pw、inv、d', '有限体の計算道具と、曲線の定数', '剰余（3.3）、繰り返し二乗法・フェルマーの小定理（3.5）'],
        ['add(P, Q)', '2点の足し算', '上のエドワーズ曲線の公式'],
        ['mul(k, P)', '点のスカラー倍（kP）', '繰り返し二乗法の「足し算版」'],
        ['recoverX、B、L', '基点Bと、その位数L', '平方根の計算、位数（3.9）'],
        ['encode(P)', '点を32バイトにする', 'リトルエンディアン（2.6）、ビット演算（2.4）'],
        ['a、A ＝ mul(a, B)', '秘密のスカラーと公開鍵', '一方向性（3.8、3.9）'],
        ['r、R、h、S', '署名の4つの値', 'スカラー倍の分配法則、mod L'],
      ]} />
      <H3>ステップ1：有限体の道具と定数 d を用意する</H3>
      <Code code={MC[12]} />
      <Tbl head={['コードの部品', '役割']} rows={[
        ['p', '2²⁵⁵ − 19。有限体の大きさ（素数）。座標はすべて 0〜p−1 の整数'],
        ['mod(a)', 'aをpで割った余りを 0〜p−1 で返す。JavaScriptの % は負の数で負の余りを返すので、((a % p) + p) % p と補正する（3.3）'],
        ['pw(b, e)', 'bのe乗を p で割った余り。3.5の powmod（繰り返し二乗法）を使う'],
        ['inv(a)', 'aの逆元。フェルマーの小定理（3.5）から a^(p−2) mod p で求める。この先の「÷a」は、すべて「inv(a) を掛ける」に置き換わる'],
        ['d', '曲線の定数 d ＝ −121665 ÷ 121666 (mod p)。割り算なので、inv(121666n) を掛けて計算している'],
        ['最後の2行の console.log', 'd が正しく作られたかの検算。d × 121666 ≡ −121665 が成り立てば true']
      ]} />
      <H3>ステップ2：点の足し算とスカラー倍</H3>
      <Code code={MC[26]} />
      <Tbl head={['コードの部品', '役割']} rows={[
        ['add(P, Q)', '2点の足し算。上のエドワーズ曲線の公式そのまま'],
        ['([x1, y1], [x2, y2])', '引数の分割代入。点は [x, y] という BigInt 2個の配列で表す'],
        ['k ＝ mod(d * x1 * x2 * y1 * y2)', '公式の d·x₁x₂y₁y₂。分母に2回出てくるので、先に1回だけ計算しておく'],
        ['inv(1n + k)、inv(1n − k)', '公式の分母 1 ＋ k と 1 − k の逆元。「÷」を「逆元を掛ける」に置き換えている'],
        ['mul(k, P)', 'Pをk回足した点 kP。繰り返し二乗法（3.5）の「掛ける」を「足す」に、「2乗」を「2倍（P ＋ P）」に置き換えたもの'],
        ['R ＝ [0n, 1n]', '結果の入れ物。最初は単位元（足し算の0にあたる点）'],
        ['k & 1n', 'kの最下位ビット。1なら R に今の P を足す'],
        ['P ＝ add(P, P)', 'Pを2倍にする。P、2P、4P、8P… と進む'],
        ['k >>= 1n', 'kを右に1ビットずらして、次のビットへ'],
      ]} />
      <P>mulの動きを、13 × B を例に表で見ます。13 ＝ 1 ＋ 4 ＋ 8 なので、<code>13B ＝ B ＋ 4B ＋ 8B</code> です。3.5の表と、ほとんど同じ形になります。</P>
      <Tbl head={['回 i', '13の下位ビット', 'P（2ⁱ × B）', 'ビットが1なら R ＋ P', 'R']} rows={[
        ['0', '1', 'B', '単位元 ＋ B', 'B'],
        ['1', '0', '2B', '足さない', 'B'],
        ['2', '1', '4B', 'B ＋ 4B', '5B'],
        ['3', '1', '8B', '5B ＋ 8B', '13B'],
      ]} />
      <P>kが256ビットなら、2倍が256回、足し算が最大256回です。「Bを2<sup>256</sup>回足す」ことは現実にはできませんが、mulなら一瞬で終わります。</P>
      <H3>ステップ3：基点と位数を用意する</H3>
      <Code code={MC[27]} />
      <Tbl head={['コードの部品', '役割']} rows={[
        ['recoverX(y, odd)', 'y座標から x座標を逆算する関数。基点は仕様で「yだけ」決まっているので、xはこの関数で求める'],
        ['x2 ＝ mod((y*y − 1n) * inv(d*y*y ＋ 1n))', '曲線の式を x² について解いた形 x² ＝ (y² − 1) ÷ (d·y² ＋ 1)。まだ「xの2乗」が求まっただけ'],
        ['pw(x2, (p ＋ 3n) / 8n)', '平方根（2乗して x2 になる数）の候補。pを8で割った余りが5の素数では、この計算で候補が得られる（2²⁵⁵−19 はこの条件を満たす）'],
        ['x * pw(2n, (p − 1n) / 4n)', '候補が違っていたときの補正。2^((p−1)/4) は「2乗すると −1 になる数（√−1）」で、掛けると正しい平方根になる'],
        ['(x & 1n) === BigInt(odd) ? x : p − x', '平方根は x と p − x の2つある。xの偶奇（odd）に合うほうを選ぶ'],
        ['By', '基点のy座標。仕様で 4 ÷ 5 と決まっている'],
        ['B', '基点 ＝ [recoverX(By, 0), By]。xは偶数のほうを採用（仕様）'],
        ['L', 'Bの位数。2²⁵² ＋ 27742317777372353535851937790883648493。L × B ＝ 単位元'],
        ['最後の2行の console.log', '基点が曲線の式を満たすか、L倍すると単位元 (0, 1) に戻るかの検算'],
      ]} />
      <P>「基点が曲線上にある」「位数Lを掛けると無限遠点（0, 1）に戻る」の2つが確認できれば、実装は正しく動いています。</P>
      <H3>部品の動作確認</H3>
      <P>足し算とスカラー倍が、ここまでに学んだ性質を満たすかを確認します。</P>
      <Code code={MC[28]} />
      <Tbl head={['確認する式', '意味']} rows={[
        ['B ＋ O ＝ B', '単位元 (0, 1) を足しても変わらない'],
        ['(−B) ＋ B ＝ O', '(−x, y) が逆元になっている'],
        ['B ＋ B ＝ 2B（mul）', 'add で2倍した結果と、mul で2倍した結果が同じ'],
        ['B＋B＋B＋B＋B ＝ 5B（mul）', 'add を繰り返した結果と、mul の結果が同じ（「kB ＝ Bをk回足す」の確認）'],
        ['(2^((p−1)/4))² ≡ −1', 'recoverX の補正に使う √−1 が、本当に2乗して −1 になる']
      ]} />
      <H3>ステップ4：公開鍵を計算する</H3>
      <P>点を32バイトに表す<B>エンコード</B>は、y座標をリトルエンディアンで並べ、最上位ビットにxの偶奇を載せるだけです。基点のエンコードは仕様で決まっているので、実装の確認にも使えます。</P>
      <Code code={MC[13]} />
      <Out code={'5866666666666666666666666666666666666666666666666666666666666666'} />
      <P>上の出力になれば正しいエンコードです。<B>秘密のスカラー a から、公開鍵 A ＝ a × B</B> が計算できました。逆にAからaを求めることは、3.9で見たとおり現実的に不可能です。</P>
      <Tbl head={['コードの部品', '役割']} rows={[
        ['toLE(v, n)', '2.6で作った関数。整数 v を、n バイトのリトルエンディアンの配列にする'],
        ['hexs(a)', 'バイトの配列を、16進文字列（大文字）にする'],
        ['encode([x, y])', '点を32バイトにする関数。中身は次の2行'],
        ['toLE(y, 32)', 'y座標を32バイト（256ビット）のリトルエンディアンに並べる。yは255ビットに収まるので、最上位ビットが空いている'],
        ['b[31] |= Number(x & 1n) << 7', '最後のバイト（最上位のバイト）の最上位ビットに、xの偶奇を載せる。xは y から recoverX で復元できるので、偶奇だけで足りる'],
        ['encode(B)', '基点のエンコード。仕様で決まった値になるので、実装の確認に使える'],
        ['a', '秘密のスカラー（例）。実際は乱数から作る'],
        ['A ＝ mul(a, B)', '公開鍵。秘密のスカラー a を基点 B に掛けた点'],
        ['encode(A)', '公開鍵を32バイトにしたもの。16進で64文字'],
      ]} />
      <H3>ステップ5：署名と検算</H3>
      <P>署名の骨組みは次の4つです。</P>
      <Tbl head={['記号', '意味']} rows={[['r、R ＝ r × B', '署名ごとに作る使い捨ての乱数と、その公開用の点'], ['h', 'R・A・メッセージから作るハッシュ値（mod L）'], ['S ＝ r ＋ h × a （mod L）', '秘密鍵 a を使って作る値。署名は (R, S)'], ['検算：S × B ＝ R ＋ h × A', '公開鍵 A だけで確かめられる']]} />
      <FigSign />
      <P>検算が成り立つ理由は、スカラー倍が普通の掛け算と同じように分配できるからです。</P>
      <Note kind="point">S × B ＝ (r ＋ h·a) × B ＝ r × B ＋ h × (a × B) ＝ <B>R ＋ h × A</B></Note>
      <P>検算の式には<B>秘密鍵aが一度も現れません</B>。だから、公開鍵・署名・メッセージだけで誰でも検証でき、秘密鍵は漏れません。</P>
      <Code code={MC[14]} />
      <Tbl head={['コードの部品', '役割']} rows={[
        ['SHA（sha関数）', '文字列のSHA-256を取り、16進文字列にする。本物のEd25519は SHA-512（Symbolもこの方式）だが、「入力が1文字でも違うと、まったく別の値になる」性質は同じ'],
        ['same(P, Q)', '2点の x と y がそれぞれ等しいかを比べる関数'],
        ['r', '署名ごとに作る使い捨ての乱数（ここでは固定の例。本物は秘密鍵とメッセージから決める）'],
        ['R ＝ mul(r, B)', 'rの「公開版」の点。署名の前半'],
        ['sha(encode(R) ＋ encode(A) ＋ "hello")', 'R、公開鍵A、メッセージを連結してハッシュにかける。署名が3つすべてに結びつく'],
        ['BigInt("0x" ＋ …) % L', '16進文字列を巨大な整数にして、Lで割った余りにする。これが h'],
        ['S ＝ (r ＋ h * a) % L', '署名の後半。Lで割った余りで足りるのは、B を L 回足すと単位元に戻るから（スカラーは L を法として考えてよい）'],
        ['mul(S, B)', '検算の左辺。S × B'],
        ['add(R, mul(h, A))', '検算の右辺。R ＋ h × A。左辺と一致すれば署名は正しい'],
        ['h2、改ざん後の検算', 'メッセージを1文字変えて作ったハッシュ。右辺が変わるので、一致しなくなる'],
      ]} />
      <P>メッセージを1文字変えるとhがまったく別の値になり、検算が失敗します。これが、電子署名が「本人の承認」と「改ざんの検知」を同時に実現する数学的な仕組みです。</P>
      <H3>署名を動かして確かめる</H3>
      <P>ブラウザ標準のWebCryptoで、署名を作って検証してみます（SymbolもEd25519を使います）。鍵のペアを作り、メッセージに署名して、いくつかの条件で検証します。</P>
      <Code code={C3[10]} />
      <Out code={`公開鍵: 32 バイト 8304A15D3061B52C…
署名  : 64 バイト
そのまま          : true
データを1文字変更 : false
署名を1ビット変更 : false
別人の公開鍵で検証: false`} />
      <P>鍵は実行のたびに新しく作られるので、公開鍵の値は毎回変わります。true／false の結果は変わりません。</P>
      <Tbl head={['結果', '分かること']} rows={[
        ['公開鍵 32バイト、署名 64バイト', 'どちらも決まった長さ。署名は、署名するデータが長くても短くても同じ長さになる'],
        ['そのまま → true', '秘密鍵の持ち主が作った署名は、公開鍵で検証できる'],
        ['データを1文字変える → false', '署名は、署名したときのデータにだけ合う（3.12の③）'],
        ['署名を1ビット変える → false', '署名の書き換えや偽造は、検証で見つかる'],
        ['別人の公開鍵 → false', '署名は、その公開鍵に対応する秘密鍵の持ち主が作ったものとしてだけ通る'],
      ]} />
      <Note kind="warn">WebCryptoのEd25519に対応していない古いブラウザでは、このコードは動きません。その場合は、ここまでの模型で署名の計算を確かめてください。</Note>
      <H3>署名が確かめているのは、「人」ではなく「鍵」</H3>
      <P>署名の検証が確かめているのは、「<B>この秘密鍵を持っている誰かが承認した</B>」ことです。それが現実の誰なのかは、署名からは分かりません。そのかわり、<B>秘密鍵を持っている人は、本人と区別されません</B>。盗まれた秘密鍵で作った署名も、正しい署名として通ります。4.13で見る「鍵を失うと戻せず、盗まれたら取り消せない」は、ここから来ています。</P>

      <H>3.14 確認問題</H>
      <P>コンソールで試してから、答えを確認してください。</P>
      <Q q="集合ℤ₁₃で、7の逆元は？" a="2 です。7 × 2 ＝ 14 ≡ 1 (mod 13)。invm(7n, 13n) でも確かめられます。" />
      <Q q="3.9の小さな曲線で、7Gはどの点か。" a="(0, 6) です（表の k=7）。" />
      <Q q="ハッシュが128ビットだと、衝突が50%になる個数はおよそ？" a="約2の64個です。256ビット（約2の128個）と比べて、安全性が桁違いに下がります。" />
      <Q q="SHA-256で、入力を1ビットだけ変えると、出力のおよそ何ビットが変わるか。" a="約半分（256ビット中、約128ビット）です。1ビットの違いでも、出力はまったく別物になります（雪崩効果、3.10）。" />
      <Q q="ハッシュ値から、元のデータを取り出せるか。暗号化との違いは？" a="取り出せません。暗号化は鍵があれば元に戻せますが、ハッシュ関数には鍵がなく、元に戻す方法もありません。そのかわり、同じデータなら誰が計算しても同じ値になるので、データの照合に使えます（3.10）。" />
      <Q q="4桁の暗証番号のハッシュ値から、暗証番号が見つかってしまうのはなぜか。" a="ハッシュ関数は逆算できませんが、候補が1万通りしかないので、全部をハッシュにして比べれば見つかるからです。一方向性が守れるのは、入力の候補が 2²⁵⁶ のように膨大なときだけです（3.10の実験）。" />
      <Q q="3.13のコードで、秘密のスカラー a を1だけ変えると公開鍵はどうなるか。" a="見た目の似ていない、まったく別の値になります。公開鍵から a の近さは推測できません。" />
      <Q q="集合ℤ₁₇で、5の逆元を拡張ユークリッドの互除法（手計算）で求めよ。" a="17 ＝ 5 × 3 ＋ 2、5 ＝ 2 × 2 ＋ 1 から、1 ＝ 5 − 2 × 2 ＝ 5 − (17 − 5 × 3) × 2 ＝ 5 × 7 − 17 × 2。よって逆元は 7 です。確かめ：5 × 7 ＝ 35 ＝ 17 × 2 ＋ 1。" />
      <Q q="5の6乗 mod 13 を、繰り返し二乗法で求めよ。" a="6 ＝ 110（2進数）。下の桁から 0, 1, 1。x は 5、5² ＝ 25 ≡ 12、12² ＝ 144 ≡ 1。ビットが1の行（x ＝ 12 と x ＝ 1）を掛けて 12 × 1 ＝ 12。答えは 12 です。" />
      <Q q="3.9の小さな曲線で、2G ＋ 2G を計算して4Gを求めよ。" a="2G ＝ (6, 3)。s ＝ (3 × 36 ＋ 2) ÷ 6 ＝ 110 ÷ 6 ≡ 8 × 3 ＝ 24 ≡ 7。x₃ ＝ 49 − 12 ＝ 37 ≡ 3、y₃ ＝ 7 × (6 − 3) − 3 ＝ 18 ≡ 1。4G ＝ (3, 1) で、表の k＝4 と一致します。" />
      <Q q="p ＝ 13、g ＝ 2 のとき、2^x ≡ 9 (mod 13) になる x は？" a="x ＝ 8 です。3.8の表（2^8 ＝ 256 ＝ 13 × 19 ＋ 9）から分かります。pが小さいので、表を引けば逆算できてしまいます。" />
      <Q q="鍵共有で、盗み見た人が知っている値と、知らない値はどれか。" a="知っているのは g、p、A、B です。知らないのは、秘密 a、b と、共通の値 g^ab です。A から a、B から b を求めるのは離散対数問題で、現実的に不可能だからです。" />
      <Q q="署名の検証の式 g^S ＝ R × A^h が成り立つ理由を、式で説明せよ。" a="S ＝ r ＋ h × a なので、g^S ＝ g^(r＋h·a) ＝ g^r × (g^a)^h ＝ R × A^h です。秘密鍵 a は、検証の式に現れません。" />
      <Q q="署名に使う乱数 r を、2つのデータで使い回すと、なぜ危険か。" a="S₁ − S₂ ＝ (h₁ − h₂) × a となり、r が消えるからです。h と S は誰でも分かる値なので、a ＝ (S₁ − S₂) ÷ (h₁ − h₂) で秘密鍵が計算できてしまいます（3.12のコードで確かめられます）。" />
      <Q q="衝突確率の式 n² ÷ 2ⁿ⁺¹ は、何を何で数えて導いたものか。" a="n個の値のペアの数（約 n² ÷ 2）に、1組が一致する確率（1 ÷ N）を掛けたものです。N ＝ 2²⁵⁶ なら n² ÷ 2²⁵⁷ になります。" />
      <Q q="公開鍵暗号で、暗号化と電子署名では、秘密鍵を使う人はそれぞれ誰か。" a="暗号化では、復号する受信者が秘密鍵を使います。電子署名では、署名する送信者が秘密鍵を使います。公開鍵は、どちらも誰でも使えます（3.7の図）。" />
      <Q q="電子署名の検証が確かめているのは、「Alice本人であること」か、「秘密鍵を持っていること」か。" a="「秘密鍵を持っていること」です。署名からは、現実の誰なのかは分かりません。秘密鍵が盗まれると、盗んだ人の署名も正しい署名として通るので、鍵の管理が大切です（3.13、4.13）。" />

      <H3>この章のまとめ</H3>
      <Ul items={[
        '集合・演算・単位元・逆元の言葉で、有限体（0以外のすべてに逆元がある集合）を説明できる',
        '剰余の計算では、逆元を掛けて割り算をし、巨大なべき乗は繰り返し二乗法で素早く計算する',
        '秘密鍵kから公開鍵 K ＝ k × G は速く作れるが、逆は現実的に不可能（離散対数問題）',
        '離散対数は、pが小さければ表を引いて逆算できるが、pが巨大だと表が作れない。この一方向性を使うと、公開値の交換だけで共通の値を作れる（鍵共有）',
        '署名の検算は、スカラー倍の分配法則 S × B ＝ R ＋ h × A で成り立つ。秘密鍵は式に現れない',
        '256ビットの空間は巨大で、鍵やハッシュの偶然の一致は起きない',
        '≡ は「nで割った余りが同じ」という関係で、a ≡ b (mod n) は a − b がnの倍数ということ',
        '拡張ユークリッドの互除法は、互除法の途中経過を「逆にたどる」（または表で t を同時に計算する）ことで a の逆元を求める',
        '楕円曲線の足し算は、傾き s を使った公式で計算でき、2G、3G… と手でも追える。Ed25519ではその別の形（エドワーズ曲線）の公式を使う',
        '衝突確率は「ペアの数 × 1組が一致する確率」から n² ÷ 2N となり、約 √N 個で50%に達する',
        'ハッシュ関数は、データの「指紋」を作る。出力の長さは一定で、決定性・雪崩効果・一方向性をもつ。1ビット変えても出力の約半分が変わるので、改ざんはすぐ分かる。ただし入力の候補が少ないと、総当たりで逆算できる',
        '電子署名は、秘密鍵の持ち主による承認の証明。公開鍵で誰でも検証でき、データが1ビット変わると検証に失敗する',
        '署名は S ＝ r ＋ h × a の形で、検証は公開されている値だけでできる。乱数 r を使い回すと、秘密鍵が計算できてしまう',
        '公開鍵暗号は、秘密鍵と公開鍵のペアを使う。暗号化と署名では、秘密鍵を使う人が逆になる（暗号化は受信者、署名は送信者）',
        '署名が確かめているのは「人」ではなく「鍵」。秘密鍵が盗まれると、盗んだ人の署名も正しい署名として通る',
      ]} />

      <H>3.15 記号の読み方</H>
      <Note kind="goal">本章に出てくる数学の記号を、声に出して読めるようにする。分からない記号が出たときの辞書として使う。</Note>
      <H3>数と計算</H3>
      <Tbl head={['記号', '読み方', '意味・使われる場所']} rows={[
        ['＝', 'イコール', '両辺の値が等しい'],
        ['≠', 'ノットイコール', '等しくない（例：P ≠ Q は「PとQは違う点」）'],
        ['≈', 'ニアリーイコール', 'ほぼ等しい（例：π ≈ 3.14）'],
        ['×、・（中点）', 'かける', '掛け算。「d·x²y²」の「・」も掛け算。式を読みやすくするために × や・を省略して「ax」と書くこともある'],
        ['÷', 'わる', '割り算。有限体の中では「逆元を掛ける」こと'],
        ['aⁿ、a^n', 'aのn乗', 'aをn回掛ける。2²⁵⁵ は「2の255乗」。キーボードでは 2^255 や 2 ** 255 と書く'],
        ['a²、x₁、x₃', 'aの2乗、エックスいち、エックスさん', '右上の小さい数は「乗」、右下の小さい数は「何番目か（添字）」。x₁ は「1つ目の点のx座標」'],
        ['a⁻¹', 'aのインバース（aの逆元）', '掛けると1になる元。通常の数の 1 ÷ a にあたるが、有限体の中では mod p の世界の数になる（3.4）'],
        ['√N', 'ルートN', '平方根。2乗するとNになる数（N ＝ 2²⁵⁶ なら √N ＝ 2¹²⁸）'],
        ['log₂N', 'ログ2のN', '「2を何乗するとNか」。log₂1024 ＝ 10（4.7）'],
        ['ln 2', 'エルエヌ2', '自然対数。eを底とする対数で、ln 2 ≈ 0.693（3.11）'],
        ['eˣ、exp(x)', 'eのx乗', 'eは約2.718の定数。3.11の近似 1 − x ≈ e⁻ˣ で使う'],
        ['C(N, M)', 'N個からM個を選ぶ組み合わせ', '選び方の総数。C(3, 2) ＝ 3 通り（3.11）'],
        ['≲', 'ほぼ以下', '「以下」で、小さいときはほぼ等しい（3.11）'],
      ]} />
      <H3>剰余と合同</H3>
      <Tbl head={['記号', '読み方', '意味・使われる場所']} rows={[
        ['a mod n', 'aモッドn', 'aをnで割った余り（0〜n−1）。計算（3.3）'],
        ['a ≡ b (mod n)', 'aとbはnを法として合同', 'a − b がnの倍数。「余りが同じ」という関係（3.3）'],
        ['ℤₙ、ℤ₇', 'ゼットn、ゼットなな', '0〜n−1 の整数n個の集合。足し算・掛け算は mod n で行う（3.3）'],
        ['GF(p)、ℤₚ', 'ジーエフp', 'pが素数のときの有限体（ガロア体）。GF は Galois Field の頭文字。ℤₚ に mod p の足し算・掛け算を備えたもの（3.6）'],
        ['gcd(a, b)', 'ジーシーディー', 'aとbの最大公約数（3.4）'],
        ['p、n、m', 'ピー、エヌ、エム', 'この章では、p は素数、n・m は mod の「割る数」（法）に使う'],
      ]} />
      <H3>集合</H3>
      <Tbl head={['記号', '読み方', '意味・使われる場所']} rows={[
        ['{ 2, 3, 5 }', '中かっこ', '元を並べて集合を表す（3.2）'],
        ['x ∈ A', 'xはAの元', 'xがAに入っている'],
        ['x ∉ A', 'xはAの元でない', 'xがAに入っていない'],
        ['|A|', 'Aの元の個数', '集合の大きさ。「位数」の意味でも使う'],
        ['A ⊆ B', 'AはBの部分集合', 'Aの元がすべてBに入っている'],
        ['∅', '空集合', '元を1つももたない集合'],
        ['A ∪ B', 'AとBの和集合', 'どちらかに入っている元すべて'],
        ['A ∩ B', 'AとBの共通部分', '両方に入っている元'],
        ['A − B', 'AひくB（差集合）', 'Aに入っていて、Bに入っていない元'],
        ['ℤ', 'ゼット（整数全体）', '…, −1, 0, 1, 2, … の集合'],
      ]} />
      <H3>楕円曲線と署名</H3>
      <Tbl head={['記号', '読み方', '意味・使われる場所']} rows={[
        ['P、Q、G、B', 'ピー、キュー、ジー、ビー', '曲線上の点。G・B は「基点」（スカラー倍の出発点）'],
        ['(x, y)', '座標', '点を2つの数で表したもの。有限体の元の組'],
        ['O', 'オー（無限遠点）', '点の足し算の0にあたる単位元。エドワーズ曲線では (0, 1)'],
        ['P ＋ Q', 'ピー たす キュー', '点の足し算（3.9の公式）。ふつうの数の足し算ではない'],
        ['−P', 'マイナスP', 'Pの逆元（P ＋ (−P) ＝ O になる点）'],
        ['kP、k × P、k·G', 'ケーかけるP', 'Pをk回足した点（スカラー倍）'],
        ['a、A', '小文字のエー、大文字のエー', '秘密のスカラーと、公開鍵の点（A ＝ a × B）。大文字は点、小文字は整数、という書き分け'],
        ['r、R、h、S', 'アール、ハッシュ、エス', '署名の部品（3.13）。r はランダムな整数、R は点、h はハッシュ値、S は署名の整数部分'],
        ['L', 'エル', '基点Bの位数。L × B ＝ O'],
        ['d', 'ディー', 'エドワーズ曲線の定数（Ed25519では −121665 ÷ 121666）'],
        ['(R, S)', '署名', '署名は、点Rと整数Sの組'],
      ]} />

      <H>3.16 用語集</H>
      <Note kind="goal">本章の用語の一覧。右端の数字は、詳しい説明がある節。</Note>
      <Tbl head={['用語', '意味', '節']} rows={[
        ['位数', '元の位数は、その元を足し続けて単位元に戻るまでの回数（楕円曲線では、点Gを足し続けて無限遠点Oに戻るまでの回数）。群の位数は、群の元の個数', '3.2、3.9'],
        ['一方向性', '計算は簡単だが、結果から元の値を求めるのは現実的に不可能、という性質。入力の候補が膨大なときだけ守られる', '3.8、3.10'],
        ['Ed25519', '広く使われる署名方式。体 2²⁵⁵−19 上のエドワーズ曲線を使う', '3.13'],
        ['エドワーズ曲線', 'Ed25519が使う形の楕円曲線 −x² ＋ y² ＝ 1 ＋ d·x²y²。場合分けなしの足し算公式をもつ', '3.13'],
        ['エンコード', 'データを決められた形式のバイト列に変換すること。Ed25519では点を32バイトにする', '3.13'],
        ['演算', '2つの元から新しい元を作る規則（足し算・掛け算など）', '3.2'],
        ['拡張ユークリッドの互除法', 'a × x ＋ n × y ＝ gcd を満たす x、y を求める方法。逆元を求めるのに使う', '3.4'],
        ['環', '足し算と掛け算をもち、足す・引く・掛けるができる集合。掛け算の逆元は求めないので、割れるとは限らない（整数ℤなど）', '3.2'],
        ['基点', '公開鍵の計算の出発点になる、決まった点（ベースポイント）。この章では B または G', '3.9'],
        ['共通鍵暗号', '暗号化と復号に同じ鍵を使う方式。速いが、鍵を安全に渡す必要がある', '3.7'],
        ['逆元', '演算すると単位元になる相手の元。足し算なら −a、掛け算なら a⁻¹（a × a⁻¹ ＝ 1）', '3.2'],
        ['群', '演算について、閉じている・結合法則・単位元・すべての元に逆元、の4条件を満たす集合。足し算の群に掛け算を足したのが環、さらに割り算ができるようにしたのが体', '3.2'],
        ['繰り返し二乗法（バイナリ法）', '指数を二進数で見て、2乗を繰り返してべき乗を素早く求める方法。下位・上位どちらのビットからでも計算できる。点の場合は「2倍を繰り返す」', '3.5'],
        ['元（要素）', '集合に入っている1つ1つのもの。「元に戻る」の元ではない', '3.2'],
        ['公開鍵', '秘密鍵から作る、公開してよい鍵。A ＝ a × B', '3.9'],
        ['公開鍵暗号', '秘密鍵と公開鍵のペアを使う方式。公開鍵は公開してよい。署名や、鍵の受け渡しに使う', '3.7'],
        ['合同', '「nで割った余りが等しい」関係。記号は ≡', '3.3'],
        ['最大公約数（gcd）', '2つの整数を両方とも割り切れる最大の整数', '3.4'],
        ['集合', 'ものの集まり。入っている1つ1つが元', '3.2'],
        ['衝突（コリジョン）', '違う入力が、同じハッシュ値になること', '3.10、3.11'],
        ['署名', '秘密鍵を持つ人だけが作れ、公開鍵で誰でも検算できるデータ。(R, S)', '3.13'],
        ['剰余', '割った余り。記号は mod', '3.3'],
        ['スカラー倍', '点を整数k回足した点kP。「点 × 整数」の計算', '3.9'],
        ['ℤₙ（ゼットn）', '0〜n−1 のn個の整数の集合。mod n の足し算・掛け算で閉じている', '3.3'],
        ['素数', '1とその数自身でしか割り切れない2以上の整数', '3.6'],
        ['体', '四則演算（足す・引く・掛ける・割る）ができる集合。0以外の全ての元に掛け算の逆元がある', '3.2'],
        ['単位元', 'どの元と演算しても相手を変えない元。足し算は0、掛け算は1', '3.2'],
        ['誕生日のパラドックス', 'N通りの値から、約√N個選ぶと、どれか2つが同じになる確率が半分に達する現象', '3.11'],
        ['ディオファントス方程式', '整数や有理数の解を求める多項式の方程式。楕円曲線 y² ＝ x³ ＋ ax ＋ b もその1つ', '3.9'],
        ['楕円曲線', '式を満たす点の集まり。点どうしの足し算が定義できる。暗号では座標が有限体の元', '3.9'],
        ['閉じている', '集合の元どうしを演算した結果が、必ず同じ集合の元になること', '3.2'],
        ['ハッシュ', '任意の長さのデータから、決まった長さの値を作る関数・その値。1文字違えば別の値になる', '3.10'],
        ['雪崩効果', '入力が1ビット違うだけで、出力のおよそ半分のビットが変わる性質', '3.10'],
        ['決定性', '同じ入力なら、いつ、どこで、誰が計算しても、同じ出力になる性質', '3.10'],
        ['秘密鍵', '本人だけが持つ整数。署名を作るのに使う', '3.9'],
        ['フェルマーの小定理', 'pが素数で、aがpの倍数でないとき a^(p−1) ≡ 1 (mod p)', '3.5'],
        ['部分集合', 'ある集合の元を一部取り出してできた集合（全部でもよい）', '3.2'],
        ['無限遠点', '点の足し算の単位元 O。曲線の「外」にある仮想の点', '3.9'],
        ['有限体', '元の個数が有限個の体（ガロア体とも呼ぶ）。GF(p) は ℤₚ に mod p の演算を備えたもの', '3.6'],
        ['離散対数問題', 'y ＝ gˣ（または K ＝ k × G）から x（または k）を求める問題。現実的に不可能', '3.8'],
        ['鍵共有（ディフィー・ヘルマン）', '公開値を交換するだけで、2人だけが同じ値を作る方法。(g^a)^b ＝ (g^b)^a を使う', '3.8'],
        ['Schnorr署名', 'S ＝ r ＋ h × a の形をもつ署名。検証は g^S ＝ R × A^h。Ed25519の仲間', '3.12'],
        ['署名の乱数 r', '署名のたびに作る使い捨ての値。使い回すと秘密鍵が計算できてしまう', '3.12'],
      ]} />
    </>
  );
}


// ───────── 第4章 ブロックチェーン基礎 ─────────
// 第4章のコード例（SHA を使うものは各コードの先頭で sha を定義しているので、単独で実行できる）。
const C3: string[] = [
// 0: 3.3 履歴から状態を再計算
`const txs = [
  { from: "Mint", to: "Alice", amount: 100n },
  { from: "Alice", to: "Bob", amount: 30n },
  { from: "Bob", to: "Carol", amount: 10n },
  { from: "Alice", to: "Carol", amount: 200n },   // 残高不足
];
const state = { Mint: 1000n };
for (const tx of txs) {
  const bal = state[tx.from] ?? 0n;
  if (bal < tx.amount) { console.log("拒否:", tx.from, "→", tx.to, tx.amount, "（残高", bal, "）"); continue; }
  state[tx.from] = bal - tx.amount;
  state[tx.to] = (state[tx.to] ?? 0n) + tx.amount;
  console.log("受理:", tx.from, "→", tx.to, tx.amount);
}
console.log(state);`,
// 1: 3.3 処理順で結果が変わる
`const replay = (list) => {
  const s = { Alice: 100n };
  return list.map((t) => {
    const ok = (s[t.from] ?? 0n) >= t.amount;
    if (ok) { s[t.from] -= t.amount; s[t.to] = (s[t.to] ?? 0n) + t.amount; }
    return t.to + ": " + (ok ? "受理" : "拒否");
  });
};
const toBob = { from: "Alice", to: "Bob", amount: 80n };
const toCarol = { from: "Alice", to: "Carol", amount: 80n };
console.log("Bobが先 :", replay([toBob, toCarol]));
console.log("Carolが先:", replay([toCarol, toBob]));`,
// 2: 3.5 チェーンの検証と改ざん
SHA + `
const ZERO = "0".repeat(64);
const buildChain = async (list) => {
  let prev = ZERO; const out = [];
  for (const data of list) { const h = await sha(prev + data); out.push({ data, prev, hash: h }); prev = h; }
  return out;
};
const checkChain = async (chain) => {
  let prev = ZERO;
  for (let i = 0; i < chain.length; i++) {
    const h = await sha(prev + chain[i].data);
    if (chain[i].prev !== prev || chain[i].hash !== h) return "ブロック" + (i + 1) + " で不整合";
    prev = chain[i].hash;
  }
  return "OK";
};
const ch = await buildChain(["A→B 10", "B→C 3", "C→A 1"]);
console.log("そのまま        :", await checkChain(ch));
ch[0].data = "A→B 100";
console.log("データだけ書換え:", await checkChain(ch));
const ch2 = await buildChain(["A→B 100", "B→C 3", "C→A 1"]);
ch[0].hash = ch2[0].hash;
console.log("ハッシュも直す  :", await checkChain(ch));
console.log("全部作り直す    :", await checkChain(ch2));`,
// 3: 3.6 マークル 奇数個と階層
SHA + `
const levels = async (leaves) => {
  let lv = await Promise.all(leaves.map(sha));
  const all = [lv];
  while (lv.length > 1) {
    const next = [];
    for (let i = 0; i < lv.length; i += 2) next.push(await sha(lv[i] + (lv[i + 1] ?? lv[i])));
    lv = next; all.push(lv);
  }
  return all;
};
const txList = ["tx1", "tx2", "tx3", "tx4", "tx5"];
const tree = await levels(txList);
tree.forEach((lv, i) => console.log("階層" + i + "：" + lv.length + "個", lv.map((h) => h.slice(0, 6))));`,
// 4: 3.6 包含証明
`const proofOf = (tree, index) => {
  const p = [];
  for (let d = 0; d < tree.length - 1; d++) {
    const lv = tree[d];
    const isLeft = index % 2 === 0;
    p.push({ hash: isLeft ? (lv[index + 1] ?? lv[index]) : lv[index - 1], sibLeft: !isLeft });
    index = Math.floor(index / 2);
  }
  return p;
};
const verifyProof = async (leafHash, proof, root) => {
  let h = leafHash;
  for (const s of proof) h = await sha(s.sibLeft ? s.hash + h : h + s.hash);
  return h === root;
};
const root = tree[tree.length - 1][0];
const proof = proofOf(tree, 2);   // tx3 の証明
console.log("証明のハッシュ数:", proof.length, "／ 取引数:", txList.length);
console.log("tx3 は含まれる:", await verifyProof(await sha("tx3"), proof, root));
console.log("tx9 は含まれる:", await verifyProof(await sha("tx9"), proof, root));`,
// 5: 3.7 ブロックを組み立てる
SHA + `
const merkle = async (leaves) => {
  if (leaves.length === 0) return "0".repeat(64);
  let lv = await Promise.all(leaves.map(sha));
  while (lv.length > 1) {
    const next = [];
    for (let i = 0; i < lv.length; i += 2) next.push(await sha(lv[i] + (lv[i + 1] ?? lv[i])));
    lv = next;
  }
  return lv[0];
};
const makeBlock = async (height, prevHash, txs) => {
  const header = { height, prevHash, txRoot: await merkle(txs) };
  return { header, txs, hash: await sha(JSON.stringify(header)) };
};
const verifyBlocks = async (blocks) => {
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i], n = i + 1;
    if (b.header.txRoot !== await merkle(b.txs)) return "ブロック" + n + "：取引とtxRootが合わない";
    if (b.hash !== await sha(JSON.stringify(b.header))) return "ブロック" + n + "：ヘッダーとhashが合わない";
    if (i > 0 && b.header.prevHash !== blocks[i - 1].hash) return "ブロック" + n + "：前のブロックとつながらない";
  }
  return "OK";
};
const b1 = await makeBlock(1, "0".repeat(64), ["A→B 10", "B→C 3"]);
const b2 = await makeBlock(2, b1.hash, ["C→A 1"]);
const b3 = await makeBlock(3, b2.hash, ["A→C 5", "B→A 2", "C→B 1"]);
console.log("そのまま    :", await verifyBlocks([b1, b2, b3]));
const fake1 = { ...b1, txs: ["A→B 100", "B→C 3"] };
console.log("取引を書換え:", await verifyBlocks([fake1, b2, b3]));
const forged = await makeBlock(1, "0".repeat(64), ["A→B 100", "B→C 3"]);
console.log("1だけ作り直し:", await verifyBlocks([forged, b2, b3]));`,
// 6: 3.8 取引の検証
`const NOW = 1000;
const validate = (tx, st) => {
  const errs = [];
  if (!tx.signed) errs.push("署名がない");
  if (tx.deadline < NOW) errs.push("期限切れ");
  if ((st[tx.from] ?? 0n) < tx.amount + tx.fee) errs.push("残高が足りない");
  return errs.length ? errs : ["OK"];
};
const st = { Alice: 100n };
console.log(validate({ from: "Alice", amount: 30n, fee: 1n, signed: true, deadline: 2000 }, st));
console.log(validate({ from: "Alice", amount: 30n, fee: 1n, signed: false, deadline: 2000 }, st));
console.log(validate({ from: "Alice", amount: 30n, fee: 1n, signed: true, deadline: 500 }, st));
console.log(validate({ from: "Alice", amount: 300n, fee: 1n, signed: true, deadline: 2000 }, st));`,
// 7: 3.9 PoW 難易度
SHA + `
for (let k = 1; k <= 3; k++) {
  let sum = 0;
  for (let t = 0; t < 20; t++) {
    let n = 0;
    while (!(await sha("trial" + t + "-block-data-" + n)).startsWith("0".repeat(k))) n++;
    sum += n + 1;
  }
  console.log("先頭に0が" + k + "個：平均 " + Math.round(sum / 20) + "回で成功（理論値 " + 16 ** k + "回）");
}`,
// 8: 3.9 PoW 書き換えコスト
SHA + `
const ZERO = "0".repeat(64);
const mine = async (prev, data, k) => {
  let n = 0;
  while (!(await sha(prev + data + n)).startsWith("0".repeat(k))) n++;
  return { tries: n + 1, hash: await sha(prev + data + n) };
};
const list = ["A→B 10", "B→C 3", "C→A 1", "A→C 5", "B→A 2", "C→B 1"];
const k = 3;
let prev = ZERO;
const hashes = [ZERO];
for (const data of list) { const r = await mine(prev, data, k); prev = r.hash; hashes.push(prev); }
for (const i of [5, 3, 0]) {
  let tries = 0, p = hashes[i];
  for (let j = i; j < list.length; j++) {
    const r = await mine(p, j === i ? list[j] + "（改ざん）" : list[j], k);
    tries += r.tries; p = r.hash;
  }
  console.log((i + 1) + "番目を書き換える → " + (list.length - i) + "ブロック掘り直し：" + tries + "回");
}`,
// 9: 3.9 PoS くじ引き
`const stakes = { ノード1: 44, ノード2: 108, ノード3: 70, ノード4: 150 };
const total = Object.values(stakes).reduce((a, b) => a + b, 0);
const pick = () => {
  let r = Math.random() * total;
  for (const [id, s] of Object.entries(stakes)) { if ((r -= s) < 0) return id; }
};
const wins = {};
for (let i = 0; i < 10000; i++) { const id = pick(); wins[id] = (wins[id] ?? 0) + 1; }
console.log(wins);
for (const [id, s] of Object.entries(stakes)) console.log(id, "期待:", ((s / total) * 100).toFixed(1) + "%", "実際:", ((wins[id] / 10000) * 100).toFixed(1) + "%");`,
// 10: 3.13 鍵のペアを作り、署名・検証する（WebCryptoのEd25519）
`const hex = (u8) => Array.from(u8, (b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
const enc = (s) => new TextEncoder().encode(s);
const k = await crypto.subtle.generateKey("Ed25519", false, ["sign", "verify"]);   // 鍵のペアを作る
const pub = new Uint8Array(await crypto.subtle.exportKey("raw", k.publicKey));
console.log("公開鍵:", pub.length, "バイト", hex(pub).slice(0, 16) + "…");
const msg = enc("Alice → Bob 30");
const sig = new Uint8Array(await crypto.subtle.sign("Ed25519", k.privateKey, msg));    // 秘密鍵で署名する
console.log("署名  :", sig.length, "バイト");
const ok = (m, s, key) => crypto.subtle.verify("Ed25519", key, s, m);                   // 公開鍵で検証する
console.log("そのまま          :", await ok(msg, sig, k.publicKey));
console.log("データを1文字変更 :", await ok(enc("Alice → Bob 31"), sig, k.publicKey));
const bad = sig.slice(); bad[0] ^= 1;                                                   // 署名の1ビットを反転
console.log("署名を1ビット変更 :", await ok(msg, bad, k.publicKey));
const other = await crypto.subtle.generateKey("Ed25519", false, ["sign", "verify"]);
console.log("別人の公開鍵で検証:", await ok(msg, sig, other.publicKey));`,
// 11: 4.3 署名つきの取引を、ノードが検証する模型
`const hex = (u8) => Array.from(u8, (b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
const fromHex = (s) => Uint8Array.from(s.match(/../g).map((h) => parseInt(h, 16)));
const body = (tx) => new TextEncoder().encode(JSON.stringify([tx.from, tx.to, tx.amount]));   // 署名する対象
const newAccount = async () => {
  const k = await crypto.subtle.generateKey("Ed25519", false, ["sign", "verify"]);
  const pub = hex(new Uint8Array(await crypto.subtle.exportKey("raw", k.publicKey)));
  return { pub, sign: async (tx) => hex(new Uint8Array(await crypto.subtle.sign("Ed25519", k.privateKey, body(tx)))) };
};
const verify = async (tx) => {                                   // ノードの確認：送信者の公開鍵で署名を検証する
  const key = await crypto.subtle.importKey("raw", fromHex(tx.from), "Ed25519", false, ["verify"]);
  return crypto.subtle.verify("Ed25519", key, fromHex(tx.sig), body(tx));
};
const alice = await newAccount(), mallory = await newAccount();
const check = async (label, tx) => console.log(label + ":", (await verify(tx)) ? "受理" : "拒否");

const tx = { from: alice.pub, to: "Bob", amount: 30 };
tx.sig = await alice.sign(tx);                                   // Aliceが、自分の秘密鍵で署名する
await check("Alice本人の取引          ", tx);
await check("金額を書き換え           ", { ...tx, amount: 3000 });
await check("宛先を書き換え           ", { ...tx, to: "Mallory" });
const forged = { from: alice.pub, to: "Mallory", amount: 30 };   // Alice名義の取引を、Malloryが勝手に作る
forged.sig = await mallory.sign(forged);                         // 署名できるのは、自分の秘密鍵だけ
await check("Malloryが署名（Alice名義）", forged);
await check("同じ取引をもう一度送る   ", tx);`,
];

function Chain4() {
  return (
    <>
      <H>4.1 この章の進め方</H>
      <Note kind="goal">ブロックチェーンが「なぜ改ざんに強いのか」「誰がどうやって次のブロックを決めるのか」を、小さな模型を動かしながら説明できるようになる。</Note>
      <P>個別のブロックチェーンの機能に入る前に、ブロックチェーンという仕組みそのものを押さえます。難しい理論ではなく、<B>ハッシュとデータ構造を組み合わせた、意外に素朴な仕組み</B>です。部品として使うのは、第3章で見たハッシュと電子署名だけです（公開鍵暗号は3.7、電子署名は3.12〜3.13で整理しました。4.3では、それを台帳の書き込みに当てはめます）。この章では、実物の代わりに数十行のコードで作った模型を動かして確かめます。</P>
      <Tbl head={['学ぶこと', 'ひとことで言うと']} rows={[
        ['台帳とノード', '取引の記録を、多数のコンピューター（ノード）が同じものとして持つ（4.2）'],
        ['署名つきの取引', '署名で「本人の承認」を示し、金額や宛先の書き換えを見つける。署名だけでは防げないこと（4.3）'],
        ['履歴と状態', '記録されるのは履歴。残高などの状態は、履歴から計算する（4.4）'],
        ['ブロックの構造', 'ブロックの中身は、ブロックの情報をまとめた「ヘッダー」と、取引の一覧の「本体」の2つ。ヘッダーが前のブロックや取引と結びつく（4.5）'],
        ['ハッシュチェーン', '前のブロックのハッシュで鎖をつなぎ、書き換えを見つける（4.6）'],
        ['マークルツリーと包含証明', '多数の取引を1つのハッシュにまとめ、少数のハッシュで「入っている」と示す（4.7）'],
        ['トランザクションの検証と状態', '署名・期限・残高の確認、未承認／承認済み／確定（4.9）'],
        ['合意形成（PoW／PoS）', '次のブロックを作る人の選ばれ方（4.10）'],
        ['フォークとファイナリティ', '鎖の分かれ方と、ブロックの確定（4.11、4.12）'],
      ]} />
      <Note kind="warn">この章のコードは、それぞれ<B>単独で実行</B>できます（ハッシュ関数 <code>sha</code> は各コードの先頭で定義しています）。ここで使う <code>sha</code> はブラウザ標準のSHA-256で、実際のブロックチェーンが使うSHA3-256などとは別のアルゴリズムですが、性質（決定性・雪崩効果・一方向性）は同じなので、仕組みの体験には十分です。</Note>

      <H>4.2 ブロックチェーンとは</H>
      <Note kind="goal">従来の台帳との違いと、基本の用語（ノード・台帳・トランザクション・ブロック）を説明できる。</Note>
      <P>ブロックチェーンは、<B>取引（トランザクション）をまとめたブロックを、ハッシュで数珠つなぎにした台帳</B>を、世界中のノードが同じものとして共有する仕組みです。特定の管理者がいなくても、全員が同じ履歴を持つことで改ざんを防ぎます。</P>
      <H3>従来の台帳との違い</H3>
      <P>銀行の口座残高のように、これまでの台帳は<B>管理者が1か所で持つ</B>のが普通でした。ブロックチェーンは、それを多数のノードが分担して持つ形に置き換えます。</P>
      <Tbl head={['観点', '管理者がいる台帳', 'ブロックチェーン']} rows={[
        ['台帳を持つのは', '管理者のサーバー', '参加している多数のノードが、同じものを持つ'],
        ['書き換えの可否', '管理者は変更も削除もできる', '追記のみ。過去の記録は書き換えにくい'],
        ['止まったとき', '管理者が止まると全体が止まる', '一部のノードが止まっても続く'],
        ['何を信じるか', '管理者', '仕組み（署名・ハッシュ・多数のノードによる確認）'],
        ['不正の見つけ方', '管理者の監査を待つ', '誰でも自分のノードで検証できる'],
      ]} />
      <FigLedger />
      <H3>用語の整理</H3>
      <Tbl head={['用語', '意味']} rows={[
        ['ノード', 'ブロックチェーンのソフトウェアを動かし、台帳を保持するコンピューター'],
        ['台帳', 'すべてのアカウントの状態と、取引の履歴'],
        ['トランザクション', '台帳を変更する要求の単位。送金など'],
        ['ブロック', 'トランザクションをまとめた1かたまり。一定間隔で作られ、何番目かをブロック高という'],
        ['ブロックの作成者', '次のブロックを作る役。作った人には、手数料などが報酬として入る（仕組みによってマイナー、バリデーターなどと呼ぶ）'],
      ]} />
      <Note kind="point">「管理者がいない」は「誰でも書き換えられる」ではありません。<B>書き込むには秘密鍵の署名が必要</B>（第3章の電子署名。ブロックチェーンでの使われ方は4.3）で、書き込まれた内容は<B>すべてのノードが同じルールで検証</B>します。</Note>
      <Note kind="warn">ブロックチェーンは、ふつうのデータベースの上位互換ではありません。「<B>お互いを信用しきれない相手どうしが、管理者なしで同じ記録を共有する</B>」ための仕組みで、処理速度や保存容量では通常のデータベースに劣ります。向いていない用途に使わないことも大切です。</Note>

      <H>4.3 ブロックチェーンでの電子署名</H>
      <Note kind="goal">ブロックチェーンで署名が「本人の意思表示」になる理由と、署名だけでは防げないことを、台帳の模型で確かめる。</Note>
      <P>公開鍵暗号と電子署名の中身は、3.7、3.12、3.13で見ました。この節では、それを台帳の書き込みに当てはめます。管理者のいない台帳には、「ログインして本人確認をする窓口」がありません。そこで、<B>「AliceからBobへ30送る」という取引を、本当にAliceが承認したのか</B>を、取引のデータそのものから確かめます。</P>
      <H3>台帳の模型に、署名をつける</H3>
      <P>4.2で見たとおり、書き込みには署名が必要です。取引に署名を付けた模型で、ノードが何を確かめるのかを見てみましょう。ここでは、送信者を「公開鍵そのもの」で表します（実際のブロックチェーンでは、公開鍵から計算したアドレスで表します。5.7）。</P>
      <Code code={C3[11]} />
      <Out code={`Alice本人の取引          : 受理
金額を書き換え           : 拒否
宛先を書き換え           : 拒否
Malloryが署名（Alice名義）: 拒否
同じ取引をもう一度送る   : 受理`} />
      <Tbl head={['試したこと', '結果', '理由']} rows={[
        ['金額や宛先を書き換える', '拒否', '署名は、署名したときのデータにだけ合う。1か所でも変わると、検証に失敗する'],
        ['Alice名義で、自分の署名を付ける', '拒否', 'Aliceの公開鍵で検証するので、Aliceの秘密鍵で作った署名でなければ通らない'],
        ['署名済みの取引を、そのまま送り直す', '受理', '署名そのものは正しいので、検証は通ってしまう（下の注意）'],
      ]} />
      <Note kind="warn"><B>署名が保証するのは、「この内容を、この秘密鍵の持ち主が承認した」ことまで</B>です。「その取引が一度しか使われない」ことは、署名だけでは保証できません。最後の行のように、署名済みの取引を送り直しても（再送）、署名の検証は通ります。そこで実際のブロックチェーンは、署名する内容に<B>期限</B>や<B>ネットワーク固有の値</B>を含めて、使い回しを防ぎます（4.9）。</Note>
      <H3>この先で、署名が使われる場所</H3>
      <Tbl head={['場所', '署名するのは誰か', '節']} rows={[
        ['トランザクション', '送信者。ノードは、署名がないトランザクションを受理しない', '4.9、5.10'],
        ['ブロック', 'ブロックを作った人。ヘッダーに公開鍵と署名が入る', '4.5、5.6'],
        ['マルチシグ・オフライン署名', '複数の人。署名を集めて、1つの取引を承認する', '本編第9章、第12章'],
      ]} />

      <H>4.4 台帳の「履歴」と「状態」</H>
      <Note kind="goal">ブロックチェーンに記録されるのは「取引の履歴」で、残高などの「状態」はそこから計算されることを、コードで確かめる。</Note>
      <P>台帳というと「各アカウントの残高が書いてある表」を想像しがちですが、ブロックチェーンに順番に記録されているのは<B>取引の履歴（ログ）</B>です。残高のような<B>状態</B>は、履歴を先頭から順に当てはめれば求まります。各ノードはこの計算を自分で行い、全員が同じ結果になることを確かめています。</P>
      <FigHistoryState />
      <Code code={C3[0]} />
      <Out code={`受理: Mint → Alice 100n
受理: Alice → Bob 30n
受理: Bob → Carol 10n
拒否: Alice → Carol 200n （残高 70n ）
{ Mint: 900n, Alice: 70n, Bob: 20n, Carol: 10n }`} />
      <P>4件目は、Aliceの残高が70しかないのに200を送ろうとしているので<B>拒否</B>されます。ルールが同じなら、誰が計算しても同じ結果になります。</P>
      <Tbl head={['', '履歴', '状態']} rows={[
        ['中身', '取引の並び（誰が誰にいくら送ったか）', 'アカウントごとの残高など'],
        ['変わり方', '追記のみ。過去の行は変わらない', '取引を反映するたびに更新される'],
        ['ブロックチェーンでは', 'ブロックに記録される', '各ノードが保持する。状態全体のハッシュを、ブロックの情報をまとめたヘッダー（4.5で説明）に入れる仕組みもある'],
      ]} />
      <H3>処理の順序で結果が変わる：二重支払い</H3>
      <P>残高100のAliceが、Bobへ80、Carolへ80を送る2つの取引を同時に出したとします。両方が通ることはありません。<B>先に処理した方だけが受理</B>されます。</P>
      <Code code={C3[1]} />
      <Out code={`Bobが先 : [ 'Bob: 受理', 'Carol: 拒否' ]
Carolが先: [ 'Carol: 受理', 'Bob: 拒否' ]`} />
      <P>処理する順序が違うと、結果が変わります。つまり、<B>全員が同じ順序で取引を処理しなければ、ノードごとに台帳がずれてしまう</B>のです。これが二重支払い（ダブルスペンディング）の問題です。管理者がいれば、サーバーが順序を決めれば済みます。管理者がいないブロックチェーンでは、「<B>順序を1つに決める役</B>」を仕組みで選ぶ必要があります。それが4.10の合意形成です。</P>

      <H>4.5 ブロックの構造</H>
      <Note kind="goal">ブロックがヘッダーと本体でできていて、ヘッダーのどの項目が「鎖」と「取引」をつないでいるかを説明できる。</Note>
      <P>ブロックは、<B>ヘッダー</B>と<B>本体</B>に分かれます。本体にはトランザクションの一覧が入り、ヘッダーにはブロック自身の情報と、他のものとの結びつきを示す値が入ります。</P>
      <FigBlock />
      <Tbl head={['ヘッダーの項目', '意味', '役割']} rows={[
        ['height', 'ブロック高。何番目のブロックか', 'ブロックの住所のようなもの'],
        ['timestamp', '作成時刻（ネットワーク開始時点からの経過ミリ秒）', '時間の順序を決める'],
        ['difficulty', '難易度', 'ブロックを作る条件の厳しさ（4.10、4.11）'],
        ['previousBlockHash', '前のブロックのハッシュ', '鎖をつなぐ（4.6）'],
        ['transactionsHash', '本体のトランザクションのマークルルート', '取引とヘッダーを結びつける（4.7）'],
        ['stateHash', '台帳の状態全体のハッシュ', '全ノードの状態が一致していることの確認（4.4）'],
        ['signerPublicKey／signature', 'ブロックを作った人の公開鍵と署名', '誰が作ったかの証明（第3章の署名、4.3）'],
      ]} />
      <Note kind="point"><B>ブロックのハッシュは、本体ではなくヘッダーだけから計算</B>します。本体のトランザクションは、マークルルート（transactionsHash）を通してヘッダーに結びつきます。取引が何千件あってもヘッダーは小さいままなので、ヘッダーだけを持つ軽い参加者でも検証ができます（4.7）。</Note>
      <Note kind="warn">項目名をすべて覚える必要はありません。項目名は、実際のブロックチェーンで使われる呼び方にならっています。第5章で、実際のブロックを取得して眺める機会があるので、そのときに「4.5の表のどれか」と照らし合わせてください。</Note>

      <H>4.6 ハッシュチェーン：改ざんが見つかる理由</H>
      <Note kind="goal">1か所の書き換えが、後続のブロックすべての不整合として見つかる理由を、手を動かして確かめる。</Note>
      <P>各ブロックは「<B>前のブロックのハッシュ</B>」を中に含みます。そのブロックのハッシュは、前のハッシュを含んだ内容から計算します。だから、途中のデータを1つ書き換えると、そのブロックのハッシュが変わり、次のブロックが持つ「前のハッシュ」と合わなくなり、後続のブロックがすべて不整合になります。実際に手で確かめてみましょう。</P>
      <FigHashChain />
      <Code code={SHA + '\nlet prev = "0".repeat(64); const chain = [];\nfor (const data of ["A→B 10", "B→C 3", "C→A 1"]) {\n  const h = await sha(prev + data);\n  chain.push({ data, prev: prev.slice(0, 8), hash: h.slice(0, 8) });\n  prev = h;\n}\nconsole.log(chain);'} />
      <Out code={`[ { data: 'A→B 10', prev: '00000000', hash: 'E92713DE' },
  { data: 'B→C 3', prev: 'E92713DE', hash: '2BE919E6' },
  { data: 'C→A 1', prev: '2BE919E6', hash: 'A381A174' } ]`} />
      <P>1行目のデータを <code>"A→B 100"</code> に変えて再実行すると、以降のハッシュがすべて変わることを確認できます。</P>
      <Out code={`[ { data: 'A→B 100', prev: '00000000', hash: '13E35EBC' },
  { data: 'B→C 3', prev: '13E35EBC', hash: '346EA920' },
  { data: 'C→A 1', prev: '346EA920', hash: '1395424E' } ]`} />
      <H3>検証する関数を書いて、改ざんを試す</H3>
      <P>「見つかる」とは、具体的には<B>各ブロックのハッシュを計算し直して、記録されている値と比べる</B>ことです。その関数を作り、いくつかのやり方で改ざんしてみます。</P>
      <Code code={C3[2]} />
      <Out code={`そのまま        : OK
データだけ書換え: ブロック1 で不整合
ハッシュも直す  : ブロック2 で不整合
全部作り直す    : OK`} />
      <Tbl head={['試したこと', '結果', '理由']} rows={[
        ['データだけ書き換える', 'ブロック1で不整合', 'データから計算したハッシュが、記録されたハッシュと合わない'],
        ['そのブロックのハッシュも直す', 'ブロック2で不整合', 'ブロック2が持つ「前のハッシュ」が、直したハッシュと合わない'],
        ['後続を含めて全部作り直す', 'OK', '鎖の中のつじつまは合う。ここが弱点']
      ]} />
      <Note kind="warn">ハッシュチェーンだけでは、<B>最初から最後まで全部を作り直されると見抜けません</B>（最後の行がOKになっています）。それを防ぐのが、次の2つです。(1) 作り直しに大きな手間やコストがかかる仕組み（4.10）。(2) 多数のノードが元の鎖を持っているので、作り直した鎖は「多数派と違う」と判定される（4.11）。</Note>

      <H>4.7 マークルツリー</H>
      <Note kind="goal">マークルルートの作り方と、「取引がブロックに入っていること」を少数のハッシュで証明する仕組み（包含証明）を説明できる。</Note>
      <P>ブロック内の多数のトランザクションは、ハッシュを2つずつ束ねて木構造にまとめ、最終的に1つの<B>マークルルート</B>として表します。1つの値でブロック内の全取引を代表できるので、ヘッダーに入れるのに向いています。</P>
      <FigMerkleSmall />
      <Code code={SHA + '\nlet level = await Promise.all(["tx1", "tx2", "tx3", "tx4"].map(sha));\nwhile (level.length > 1) {\n  const next = [];\n  for (let i = 0; i < level.length; i += 2) next.push(await sha(level[i] + (level[i + 1] ?? level[i])));\n  level = next;\n}\nconsole.log("merkle root:", level[0]);'} />
      <Out code="merkle root: EEB49F6519E4E0CF7B9A457F6F8F5B244A911C052681B8631A4AF6B638610FB5" />
      <H3>個数が奇数のとき、各階層を眺める</H3>
      <P>取引が5件のように奇数のとき、最後の1つは相手がいません。この模型では、<B>最後のハッシュを自分自身と組にします</B>（組み方は実装によって異なります）。各階層のハッシュを順に出力してみましょう。</P>
      <Code code={C3[3]} />
      <Out code={`階層0：5個 [ '709B55', '27CA64', '1F3CB1', '41B637', 'A8C0CC' ]
階層1：3個 [ 'D04866', '5FC588', 'F6664F' ]
階層2：2個 [ 'EEB49F', 'BF5F6B' ]
階層3：1個 [ 'AA8E1F' ]`} />
      <Note kind="ex">階層2の左端 <code>EEB49F</code> は、先ほど計算した4件（tx1〜tx4）のマークルルート <code>EEB49F65…</code> と同じです。5件の木の左半分は、4件の木そのものだからです。5件目（tx5）を足しても、左側の計算は変わりません。</Note>
      <H3>包含証明：全部を見ずに「入っている」を示す</H3>
      <P>「tx3がこのブロックに入っているか」を確かめたいとき、全取引を受け取る必要はありません。<B>tx3から根までの道筋の「となりのハッシュ」だけ</B>を受け取れば、根まで自分で計算できます。</P>
      <FigMerkleProof />
      <Code code={C3[4]} />
      <Out code={`証明のハッシュ数: 3 ／ 取引数: 5
tx3 は含まれる: true
tx9 は含まれる: false`} />
      <Tbl head={['コードの部品', '役割']} rows={[
        ['levels(leaves)', '各階層のハッシュの配列を返す（上のコードで作ったもの）'],
        ['proofOf(tree, index)', 'index番目の取引から根まで、各階層で「となりのハッシュ」を集める。sibLeft は、となりが左側かどうか'],
        ['verifyProof(leafHash, proof, root)', '自分のハッシュにとなりを順に合わせてハッシュし、最後が root と一致するかを返す'],
      ]} />
      <H3>対数：なぜ証明は小さいのか</H3>
      <P><B>対数</B>は、「2を何回掛けると、その数になるか」を表します（log<sub>2</sub>1024 ＝ 10）。言い換えると、「<B>何回半分にすれば1になるか</B>」です。</P>
      <FigMerkle />
      <Code code={MC[16]} />
      <Note kind="point">証明に必要なハッシュの数は、取引数 n に対して<B>約 log₂ n 個</B>です（上の「対数」の説明）。取引が100万件あっても約20個で済みます。これが、少ないデータでブロックの中身を検証できる理由です。</Note>
      <Note kind="warn">実際のブロックチェーンでは、木の葉に使う値や、組み方の細かい決まりが、ブロックチェーンごとに違います。ここでは、考え方をつかむために単純化しています。</Note>

      <H>4.8 ブロックを組み立てて、検証してみる</H>
      <Note kind="goal">ここまでの部品（ハッシュチェーン・マークルルート）を合わせた、小さなブロックチェーンの模型を動かす。</Note>
      <P>ヘッダー（高さ・前のブロックのハッシュ・マークルルート）を作り、そのハッシュをブロックのハッシュとする模型です。検証では、ノードが受け取ったブロックに対して行う<B>3つの確認</B>を行います。</P>
      <Code code={C3[5]} />
      <Out code={`そのまま    : OK
取引を書換え: ブロック1：取引とtxRootが合わない
1だけ作り直し: ブロック2：前のブロックとつながらない`} />
      <Tbl head={['確認', '見ているもの', 'ここで防げる改ざん']} rows={[
        ['① 取引 ↔ txRoot', '本体の取引から計算したルートが、ヘッダーのtxRootと一致するか', '取引だけを書き換える'],
        ['② ヘッダー ↔ hash', 'ヘッダーから計算したハッシュが、記録されたhashと一致するか', 'ヘッダー（txRootなど）を書き換える'],
        ['③ prevHash ↔ 前のhash', 'ヘッダーの prevHash が、前のブロックのhashと一致するか', 'ブロックを丸ごと作り直して差し替える'],
      ]} />
      <Note kind="point">取引を書き換えると、①でtxRootが合わなくなります。txRootも直すと②でhashが合わなくなります。hashも直すと③で次のブロックとつながりません。<B>どこから直しても、後ろのブロックを巻き込むまで止まらない</B>のが、ハッシュチェーンのしくみです。</Note>

      <H>4.9 トランザクションの一生</H>
      <Note kind="goal">ノードがトランザクションの何を確認するかと、トランザクションの3つの状態（未承認・承認済み・確定）を説明できる。</Note>
      <H3>ノードが確認すること</H3>
      <P>送られてきたトランザクションは、そのままブロックに入るわけではありません。<B>ノードが一定のルールで確認し、通ったものだけ</B>が取り込まれます。主な確認を、模型にしてみましょう。</P>
      <Code code={C3[6]} />
      <Out code={`[ 'OK' ]
[ '署名がない' ]
[ '期限切れ' ]
[ '残高が足りない' ]`} />
      <Tbl head={['確認項目', '見るもの', '関係すること']} rows={[
        ['署名', '秘密鍵の持ち主が確かに承認したか', '第3章の電子署名。署名のないトランザクションは受理されない'],
        ['期限（deadline）', '有効期限を過ぎていないか', '古いトランザクションが、後から使い回されるのを防ぐ'],
        ['残高', '送る額と手数料を払えるか', '4.4の状態'],
      ]} />
      <Note kind="point">実際のノードはこのほかにも、サイズや権限など多くの項目を確認します。また、署名の対象にネットワーク固有の値を含めて、あるネットワークで署名したトランザクションを別のネットワークで使い回せないようにする仕組みもあります。</Note>
      <H3>3つの状態</H3>
      <P>アナウンスされたトランザクションは、次の順に進みます。</P>
      <FigTxState />
      <Ul items={[
        '未承認：ノードに届いて確認は通ったが、まだブロックに入っていない状態',
        '承認済み：ブロックの作成者がブロックに取り込んだ状態。ただし、フォークで別の鎖が選ばれると取り消される可能性が残る',
        '確定：ファイナライズ（4.12）が済み、ネットワーク全体として巻き戻さないことが決まった状態',
      ]} />
      <P>第5章では、この状態を実際のデータで確認します。</P>

      <H>4.10 合意形成：誰が次のブロックを作るか</H>
      <Note kind="goal">PoWとPoSの違いを、「誰が」「何を根拠に」ブロックを作るかで説明できる。</Note>
      <P>4.4で見たとおり、全員が同じ台帳を持つには「<B>次のブロックを誰が作り、どれを正とするか</B>」を決めるルール（コンセンサス）が必要です。このルールが満たすべきことは、次の3つです。</P>
      <Ul items={[
        '取引の順序が1つに決まる（二重支払いを防ぐ）',
        '不正な取引を含むブロックは受け入れられない（4.8の検証を、全員が行う）',
        '一部の参加者が悪意をもっても、全体が壊れない（作る人が一人に偏らない）',
      ]} />
      <P>代表例は2つあります。</P>
      <Ul items={['PoW（Proof of Work）: 計算競争に勝った人が作る。Bitcoinなど', 'PoS（Proof of Stake）: 保有量などに応じて選ばれた人が作る。Ethereumなど']} />
      <FigConsensus />
      <H3>PoW：計算競争</H3>
      <P>PoWの「計算競争」がどんなものか、条件を満たすハッシュ（先頭が0000）が出るまで総当たりで体験できます。データに付け足す数 <code>nonce</code> を1つずつ変えて、条件に合うものを探します。</P>
      <Code code={SHA + '\nlet n = 0;\nwhile (!(await sha("block-data-" + n)).startsWith("0000")) n++;\nconsole.log("見つかったnonce:", n, await sha("block-data-" + n));'} />
      <Out code="見つかったnonce: 15243 0000CBCD3572BC8F2CCA24EB70B8B779405D87E37D44D7D3CEA2A02BA1A94BFD" />
      <P>条件に合うハッシュは、<B>総当たりでしか見つからず、見つけた後の確認は1回のハッシュ計算で済みます</B>。この「探すのは大変、確かめるのは簡単」という非対称性がPoWの核心です。条件を厳しくする（先頭の0を増やす）と、どれだけ大変になるかも見てみましょう。</P>
      <Code code={C3[7]} />
      <Out code={`先頭に0が1個：平均 15回で成功（理論値 16回）
先頭に0が2個：平均 303回で成功（理論値 256回）
先頭に0が3個：平均 4182回で成功（理論値 4096回）`} />
      <P>16進数の1桁は4ビットなので、<B>0を1個増やすごとに、必要な試行回数が約16倍</B>になります。難易度はこのようにして調整されます（実際のブロックのヘッダーにも difficulty のような項目があります）。</P>
      <H3>PoWで過去を書き換えるコスト</H3>
      <P>4.6で、「全部作り直せば整合する」ことを見ました。PoWでは、<B>作り直しにも計算競争が必要</B>になります。ブロック1つを書き換えると、そのブロック以降のすべてを掘り直さなくてはなりません。</P>
      <Code code={C3[8]} />
      <Out code={`6番目を書き換える → 1ブロック掘り直し：1449回
4番目を書き換える → 3ブロック掘り直し：8363回
1番目を書き換える → 6ブロック掘り直し：13520回`} />
      <P>古いブロックほど、書き換えのコストが大きくなります。しかも、その間も正直な参加者たちは新しいブロックを積み続けています。</P>
      <H3>PoS：保有量などによる選出</H3>
      <P>PoSでは計算競争をしません。<B>保有量などに応じた確率で、ブロックを作る人をくじ引きで選びます</B>。保有量が多いほど選ばれやすくなります。</P>
      <Code code={C3[9]} />
      <Out code={`{ 'ノード4': 3951, 'ノード3': 1971, 'ノード2': 2851, 'ノード1': 1227 }
ノード1 期待: 11.8% 実際: 12.3%
ノード2 期待: 29.0% 実際: 28.5%
ノード3 期待: 18.8% 実際: 19.7%
ノード4 期待: 40.3% 実際: 39.5%`} />
      <P>乱数を使うので、出力は実行のたびに変わります。10000回引くと、選ばれた回数がそれぞれの保有量の比率にほぼ一致します。</P>
      <Tbl head={['', 'PoW', 'PoS']} rows={[
        ['選ばれ方', '計算競争の勝者', '保有量などに応じたくじ引き'],
        ['必要な資源', '計算力（電力）', 'トークンの保有'],
        ['不正のコスト', '計算力を用意し、掘り直す', '保有しているトークンの価値を損ねる'],
        ['代表例', 'Bitcoin', 'Ethereum']
      ]} />
      <Note kind="point">PoSにも、保有量だけで決めるもの、活動などを加味するものなど、さまざまな方式があります。実際のブロックチェーンでどう選ばれるかは、第5章で見ます。</Note>

      <H>4.11 フォークと、どの鎖を正とするか</H>
      <Note kind="goal">フォークが起きる理由と、ノードが「どの鎖を採用するか」を決める考え方を説明できる。</Note>
      <P>ネットワークには通信の遅れがあるため、離れた2つのノードが<B>ほぼ同時に次のブロックを作る</B>ことがあります。すると鎖が2本に分かれます。これが<B>フォーク</B>です。</P>
      <FigFork />
      <Tbl head={['問い', '答え']} rows={[
        ['どちらの鎖を採用するか', 'ノードは、鎖のスコアを比べて、大きい方を正とする（PoWなら累積の計算量。PoSなら、方式ごとに決めた各ブロックのスコアの合計など）'],
        ['スコアはどう決まるか', 'ブロックチェーンごとに決まった式で計算する（たとえば、ブロックごとの難易度や、前のブロックからの時間間隔を使う）'],
        ['選ばれなかった側の取引は', 'ブロックが捨てられても、取引自体は取り込み直しを待つ'],
        ['なぜ全員が同じ結論になるか', '全員が同じ式でスコアを計算するので、同じ入力から同じ答えが出る'],
      ]} />
      <Note kind="point">4.6の最後で見た「全部作り直された鎖」は、<B>ほかのノードが持つ元の鎖よりスコアが小さければ、採用されません</B>。攻撃者がより大きいスコアの鎖を作るには、ネットワークの大多数に匹敵する力（PoWなら計算力、PoSなら保有量）が必要です。これが、いわゆる「51%攻撃」が現実的に難しいとされる理由です。</Note>

      <H>4.12 ファイナリティ：確定という考え方</H>
      <Note kind="goal">「承認済み」と「確定」の違いと、実務で確定を待つ意味を説明できる。</Note>
      <P>フォークがあり得るうちは、承認されたトランザクションも取り消される可能性があります。そこで、<B>「このブロックまでは、もう巻き戻さない」とネットワークが宣言する</B>仕組みが必要になります。これがファイナリティ（確定）です。</P>
      <Tbl head={['方式', '考え方', '例']} rows={[
        ['確率的ファイナリティ', 'ブロックが深く積まれるほど、覆る確率が小さくなる。いつ確定とするかは利用者が決める', 'Bitcoinなど'],
        ['明示的なファイナリティ', '投票などで「ここまでは確定」と明示的に決める', '投票で確定させる方式のブロックチェーンなど'],
      ]} />
      <FigFinality />
      <P>明示的なファイナリティでは、確定したブロックより前には、巻き戻りません。確定までにかかる時間は、方式やネットワークの状態によって変わります。実際のブロックチェーンでの確定の仕組みは、第5章で見ます。</P>
      <Note kind="point">高額な送金や、商品の引き渡しなど、あとで取り消せない処理は<B>確定まで待つ</B>のが安全です。少額の確認程度なら、承認済みの時点で進める判断もあります。「どの状態まで待つか」は、利用者が決めることです。</Note>

      <H>4.13 ブロックチェーンの性質と限界</H>
      <Note kind="goal">ブロックチェーンが保証することと保証しないことを分けて説明できる。</Note>
      <Tbl head={['性質', '支える仕組み', '限界・注意']} rows={[
        ['改ざん耐性', 'ハッシュチェーン（4.6）と合意形成（4.10、4.11）', '記録される前の嘘（誤入力、偽の情報）は防げない'],
        ['検証可能性', '署名・ハッシュ・マークルツリーを誰でも計算し直せる（4.7、4.8）', '完全に検証するには、ノードの容量と時間が必要'],
        ['可用性', '多数のノードが同じ台帳を持つ（4.2）', '参加者が少ないネットワークでは安全性が下がる'],
        ['ファイナリティ', '投票による確定（4.12）', '確定までに待ち時間がある'],
        ['公開性', '全ノードが同じ内容を持つ', '誰でも読める。秘密にしたい内容は暗号化する'],
        ['本人による操作', '署名は秘密鍵の持ち主の意思表示（第3章）', '鍵を失うと戻せず、盗まれたら取り消せない'],
      ]} />
      <Note kind="warn">「ブロックチェーンに載っているから正しい」とは限りません。<B>保証されるのは、「載った内容が後から書き換えられていない」こと</B>です。載せる内容が正しいかどうかは、ブロックチェーンの外の問題です。</Note>

      <H>4.14 確認問題</H>
      <P>コンソールで試してから、答えを確認してください。</P>
      <Q q="Aliceの署名が付いた取引の金額を、Malloryが書き換えて送った。ノードはなぜ見抜けるのか。" a="署名は、署名したときのデータにだけ合うからです。金額が1か所でも変わると、Aliceの公開鍵で検証したときに失敗します（4.3のコードで確かめられます）。" />
      <Q q="Aliceの署名済みの取引を、そのまま送り直すと、署名の検証は通るか。通るなら、何でこれを防ぐのか。" a="通ります。署名そのものは正しいからです。署名する内容に期限やネットワーク固有の値を含めることなどで、使い回しを防ぎます（4.3、4.9）。" />
      <Q q="「履歴」と「状態」の違いは？ ブロックチェーンに記録されているのはどちらか。" a="履歴は取引の並びで、状態は残高など履歴を当てはめた結果です。ブロックに記録されるのは履歴で、状態はそこから各ノードが計算します（4.4のコードで確かめられます）。" />
      <Q q="4.6の検証コードで、2行目のデータだけを「B→C 30」に書き換えると、どのブロックで不整合になるか。" a="ブロック2です。ブロック1は変わらないので合いますが、ブロック2は、データから計算したハッシュが記録されたハッシュと合わなくなります。" />
      <Q q="ハッシュチェーンだけでは防げない改ざんは何か。何がそれを防ぐのか。" a="ブロックを最初から最後まで全部作り直して差し替える改ざんです。作り直しに計算競争などのコストをかけること（4.10）と、多数のノードが持つ元の鎖よりスコアが小さい鎖は採用されないこと（4.11）で防ぎます。" />
      <Q q="取引が8件のブロックで、包含証明に必要なハッシュは何個か。" a="3個です。8件は3階層で根になり（2の3乗が8）、各階層でとなりのハッシュを1個ずつ受け取ります。" />
      <Q q="取引が約100万件のブロックでは、包含証明に必要なハッシュは約何個か。" a="約20個です。2の20乗が1,048,576なので、log₂ 100万は約20です。件数が増えても、証明の大きさは少ししか増えません。" />
      <Q q="PoWで、先頭に必要な0を2個から4個に増やすと、試行回数は平均で何倍になるか。" a="約256倍です。1個増えるごとに約16倍なので、16 × 16 ＝ 256倍です。4.10のコードで、平均の試行回数が増える様子を確認できます。" />
      <Q q="PoSで、他の条件が同じとき、保有量が2倍になると、ブロックを作る権利を得る確率はどうなるか。" a="おおよそ2倍になります。4.10のくじ引きのコードで、stakes の値を変えて確かめられます。ただし、実際のブロックチェーンでは、保有量以外の要素も重みに含める方式があり、これだけでは決まらないこともあります。" />
      <Q q="「承認済み」と「確定」の違いは何か。" a="承認済みは、ブロックに入った状態で、フォークによって取り消される可能性が残ります。確定は、ファイナライズされて巻き戻らないことが決まった状態です（4.9、4.12）。" />
      <Q q="あるデータがブロックチェーンに記録されていれば、その内容は真実だと言えるか。" a="言えません。保証されるのは「記録された後に書き換えられていないこと」です。記録される前の内容が正しいかどうかは、ブロックチェーンの外の問題です（4.13）。" />

      <H3>この章のまとめ</H3>
      <Ul items={[
        'ブロックチェーンは、管理者のいない台帳を、多数のノードが同じものとして持つ仕組み。書き込みには署名が必要で、内容は全ノードが検証する',
        '署名（第3章）は「この秘密鍵の持ち主が承認した」ことを示す。ただし、署名済みの取引の送り直し（再送）は防げないので、期限などを署名に含める',
        '記録されるのは取引の履歴。残高などの状態は、履歴を先頭から当てはめて計算する。順序が違うと結果が変わるため、順序を1つに決める仕組みが必要',
        'ブロックはヘッダーと本体でできていて、ブロックのハッシュはヘッダーだけから計算する。previousBlockHash が鎖を、transactionsHash が取引をつなぐ',
        'ハッシュチェーンにより、1か所の書き換えは後続すべての不整合になる。ただし全部の作り直しは、それだけでは防げない',
        'マークルツリーにより、取引が約 log₂ n 個のハッシュで「入っている」と証明できる',
        'トランザクションは署名・期限・残高などを確認され、未承認 → 承認済み → 確定の順に進む',
        '合意形成には、計算競争のPoWと、保有量などによるくじ引きのPoSがある',
        'フォークではスコアの大きい鎖が採用される。確定（ファイナライズ）したブロックより前には巻き戻らない。ブロックチェーンが保証するのは「載った内容が書き換えられていない」こと',
      ]} />

      <H>4.15 用語集</H>
      <Tbl head={['用語', '意味']} rows={[
        ['ノード', 'ブロックチェーンのソフトウェアを動かし、台帳を持つコンピューター'],
        ['台帳', 'アカウントの状態と取引の履歴を合わせたもの'],
        ['トランザクション', '台帳を変更する要求の単位'],
        ['ブロック／ブロック高', 'トランザクションをまとめたかたまり／何番目のブロックか'],
        ['秘密鍵／公開鍵', '持ち主だけが持つ鍵（署名・復号）／誰に見せてもよい鍵（検証・暗号化）。秘密鍵から公開鍵は計算できるが、逆は現実的に不可能'],
        ['電子署名／検証', '秘密鍵でデータに付ける「印」／公開鍵で、その印が正しいか確かめること。データが変わると失敗する'],
        ['再送（リプレイ）', '署名済みのトランザクションを、そのまま送り直して使い回すこと。期限などを署名に含めて防ぐ'],
        ['ヘッダー', 'ブロックの情報と、前のブロック・取引・状態との結びつきを示す部分'],
        ['ハッシュチェーン', '前のブロックのハッシュを含めてつないだ鎖。書き換えが見つかる'],
        ['マークルツリー／マークルルート', 'ハッシュを2つずつ束ねてできる木／その最上位の1つの値'],
        ['包含証明', '取引がブロックに入っていることを、少数のハッシュで示すこと'],
        ['二重支払い', '同じ資産を2回使おうとすること。処理順序を1つに決めて防ぐ'],
        ['合意形成（コンセンサス）', '次のブロックを誰が作り、どれを正とするかを決めるルール'],
        ['PoW／PoS', '計算競争で選ぶ方式／保有量などで選ぶ方式'],
        ['フォーク', 'ほぼ同時に作られた複数のブロックで、鎖が分かれること'],
        ['ファイナリティ', 'ブロックが確定し、もう巻き戻らないこと'],
      ]} />
    </>
  );
}


// ───────── 第5章 Symbolブロックチェーン ─────────
// 第5章のコード例。ノードへの問い合わせは読み取りだけで、SDKは要らない（5.7の計算も、手元のブラウザの中だけで行う）。
// 各コードは単独で実行できる。ただし S4[13]・S4[14] は、S4[11]（ハッシュの部品）を先に実行しておく必要がある（未実行ならメッセージを出して止まる）。
const S4: string[] = [
// 0: 5.4 ノードの状態と役割
`const base = window.origin;
const health = await (await fetch(base + "/node/health")).json();
console.log("health:", health.status);
const nodeInfo = await (await fetch(base + "/node/info")).json();
console.log("friendlyName:", nodeInfo.friendlyName);
console.log("version:", [24, 16, 8, 0].map((s) => (nodeInfo.version >> s) & 255).join("."));
console.log("networkIdentifier:", nodeInfo.networkIdentifier, "= 0x" + nodeInfo.networkIdentifier.toString(16));
const ROLE = { Peer: 1, Api: 2, Voting: 4 };
console.log("roles:", nodeInfo.roles, Object.entries(ROLE).filter(([k, bit]) => (nodeInfo.roles & bit) !== 0).map(([k]) => k));`,
// 1: 5.4 チェーンの現在地とuint64
`const chain = await (await fetch(window.origin + "/chain/info")).json();
console.log(chain);
const tip = BigInt(chain.height);
const fin = BigInt(chain.latestFinalizedBlock.height);
console.log("ブロック高:", chain.height, " 確定済み:", chain.latestFinalizedBlock.height);
console.log("確定が追いついていないブロック数:", (tip - fin).toString());
console.log("JSONでの型:", typeof chain.height, " → BigIntにすると:", typeof tip);`,
// 2: 5.5 ブロックの時刻
`const props = await (await fetch(window.origin + "/network/properties")).json();
const epochMs = Number(props.network.epochAdjustment.replace("s", "")) * 1000;
const toDate = (ts) => new Date(epochMs + Number(ts));
const latest = (await (await fetch(window.origin + "/chain/info")).json()).height;
const b1 = await (await fetch(window.origin + "/blocks/" + latest)).json();
const b0 = await (await fetch(window.origin + "/blocks/" + (BigInt(latest) - 1n))).json();
console.log("ブロック", latest, "の作成時刻(UTC):", toDate(b1.block.timestamp).toISOString());
console.log("日本時間:", toDate(b1.block.timestamp).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" }));
console.log("前のブロックとの間隔:", (Number(b1.block.timestamp) - Number(b0.block.timestamp)) / 1000, "秒");
console.log("ネットワークの目標間隔:", props.chain.blockGenerationTargetTime);`,
// 3: 5.6 ブロックを読む・鎖のつながりを確かめる
`const getBlock = async (h) => (await fetch(window.origin + "/blocks/" + h)).json();
const tipH = BigInt((await (await fetch(window.origin + "/chain/info")).json()).height);
const cur = await getBlock(tipH);
const prev = await getBlock(tipH - 1n);
console.log("height:", cur.block.height, " type:", cur.block.type, "= 0x" + cur.block.type.toString(16));
console.log("transactionsHash:", cur.block.transactionsHash);
console.log("取引の数:", cur.meta.transactionsCount, " 手数料の合計:", cur.meta.totalFee);
console.log("このブロックのハッシュ :", cur.meta.hash);
console.log("previousBlockHash     :", cur.block.previousBlockHash);
console.log("前のブロックのハッシュ :", prev.meta.hash);
console.log("鎖がつながっている:", cur.block.previousBlockHash === prev.meta.hash);`,
// 4: 5.7 アドレスの変換とアカウントの取得
`const A32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const b32 = (u8) => {
  let bits = "", out = "";
  for (const x of u8) bits += x.toString(2).padStart(8, "0");
  for (let i = 0; i < bits.length; i += 5) out += A32[parseInt(bits.slice(i, i + 5).padEnd(5, "0"), 2)];
  return out;
};
const fromHex = (s) => Uint8Array.from(s.match(/../g).map((h) => parseInt(h, 16)));
const lastH = (await (await fetch(window.origin + "/chain/info")).json()).height;
const lastB = await (await fetch(window.origin + "/blocks/" + lastH)).json();
const hexAddr = lastB.block.beneficiaryAddress;
const addr = b32(fromHex(hexAddr));
console.log(hexAddr.length, "桁の16進 →", addr, "（" + addr.length + "文字）");
const resAcc = await fetch(window.origin + "/accounts/" + addr);
if (!resAcc.ok) {
  console.log("取得できません:", resAcc.status, await resAcc.text());
} else {
  const account = (await resAcc.json()).account;
  console.log("accountType:", account.accountType, " publicKey:", account.publicKey);
  console.log("mosaics:", account.mosaics);
}`,
// 5: 5.8 モザイクの性質
`const props = await (await fetch(window.origin + "/network/properties")).json();
const cid = props.chain.currencyMosaicId.replace("0x", "").replaceAll("'", "");
console.log("基軸通貨のモザイクID:", cid);
const mz = (await (await fetch(window.origin + "/mosaics/" + cid)).json()).mosaic;
const FL = { supplyMutable: 1, transferable: 2, restrictable: 4, revokable: 8 };
console.log("divisibility:", mz.divisibility, " duration:", mz.duration, " flags:", mz.flags, "=", mz.flags.toString(2).padStart(4, "0"));
for (const [k, bit] of Object.entries(FL)) console.log("  ", k, (mz.flags & bit) !== 0);
const unit = 10n ** BigInt(mz.divisibility);
console.log("供給量(最小単位):", mz.supply, " → 整数部だけ表示:", (BigInt(mz.supply) / unit).toString());
console.log("基軸通貨 1 単位 ＝", unit.toString(), "（最小単位）");
console.log("12.5 単位 ＝", (125n * unit / 10n).toString(), "（最小単位）");`,
// 6: 5.9 ネームスペースの名前
`const props = await (await fetch(window.origin + "/network/properties")).json();
const cid = props.chain.currencyMosaicId.replace("0x", "").replaceAll("'", "");
const nm = await fetch(window.origin + "/namespaces/mosaic/names", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ mosaicIds: [cid] }),
});
console.log(JSON.stringify(await nm.json()));`,
// 7: 5.10 送金トランザクションの模型（バイト列）
HEX + `
const props = await (await fetch(window.origin + "/network/properties")).json();
const epochMs = Number(props.network.epochAdjustment.replace("s", "")) * 1000;
const cid = props.chain.currencyMosaicId.replace("0x", "").replaceAll("'", "");
const netByte = props.network.identifier === "mainnet" ? 0x68 : 0x98;
const deadline = BigInt(Date.now() - epochMs + 2 * 60 * 60 * 1000);   // いまから2時間後（ネットワーク開始からのミリ秒）
const buf = new Uint8Array(176);
const dv = new DataView(buf.buffer);
let pos = 0;
const parts = [];
const put = (label, size, write) => { if (write) write(pos); parts.push([label, pos, size]); pos += size; };
put("size", 4, (p) => dv.setUint32(p, 176, true));
put("reserved", 4);
put("signature", 64);
put("signerPublicKey", 32);
put("reserved", 4);
put("version", 1, (p) => dv.setUint8(p, 1));
put("network", 1, (p) => dv.setUint8(p, netByte));
put("type", 2, (p) => dv.setUint16(p, 0x4154, true));
put("maxFee", 8, (p) => dv.setBigUint64(p, 17600n, true));
put("deadline", 8, (p) => dv.setBigUint64(p, deadline, true));
put("recipientAddress", 24, (p) => { buf[p] = netByte; });
put("messageSize", 2);
put("mosaicsCount", 1, (p) => dv.setUint8(p, 1));
put("reserved", 4);
put("reserved", 1);
put("mosaic.id", 8, (p) => dv.setBigUint64(p, BigInt("0x" + cid), true));
put("mosaic.amount", 8, (p) => dv.setBigUint64(p, 1000000n, true));
for (const [label, start, size] of parts) {
  const hx = hex(buf.slice(start, start + size));
  console.log(String(start).padStart(3), String(size).padStart(2) + "バイト", label.padEnd(17), hx.length > 24 ? hx.slice(0, 24) + "…" : hx);
}
console.log("合計", pos, "バイト");`,
// 8: 5.12 手数料の計算
`const fees = await (await fetch(window.origin + "/network/fees/transaction")).json();
console.log(fees);
const size = 176n;   // メッセージなし・XYM1種類の送金（5.10の模型と同じ）
const mult = BigInt(fees.medianFeeMultiplier ?? 100);
const fee = size * mult;
console.log("手数料 =", size.toString(), "バイト ×", mult.toString(), "=", fee.toString(), "（最小単位）");
console.log("基軸通貨に直すと", (Number(fee) / 1e6).toString());`,
// 9: 5.13 承認済みトランザクションを眺める
`const props = await (await fetch(window.origin + "/network/properties")).json();
const epochMs = Number(props.network.epochAdjustment.replace("s", "")) * 1000;
const recent = await (await fetch(window.origin + "/transactions/confirmed?pageSize=10&order=desc")).json();
if (recent.data.length === 0) { console.log("承認済みの取引が見つかりません"); return; }
for (const item of recent.data.slice(0, 5)) {
  const t = item.transaction;
  console.log("ブロック", item.meta.height, " type", t.type, "(0x" + t.type.toString(16).toUpperCase() + ")", " maxFee", t.maxFee, " deadline", new Date(epochMs + Number(t.deadline)).toISOString());
}
const hash0 = recent.data[0].meta.hash;
console.log("hash:", hash0);
console.log(await (await fetch(window.origin + "/transactionStatus/" + hash0)).json());`,
// 10: 5.13 存在しないハッシュを問い合わせる（エラーの形）
`const zero = "0".repeat(64);
const r1 = await fetch(window.origin + "/transactionStatus/" + zero);
console.log("/transactionStatus →", r1.status, await r1.text());
const r2 = await fetch(window.origin + "/transactions/confirmed/" + zero);
console.log("/transactions/confirmed →", r2.status, await r2.text());`,
// 11: 5.7 ハッシュの部品（SHA3-256、RIPEMD-160）
`// SHA3-256 と RIPEMD-160 の小さな実装（ブラウザ標準の crypto.subtle には、どちらもない）
const sha3_256 = (data) => {
  const rate = 136, outLen = 32;                 // SHA3-256: 1ブロック136バイト、出力32バイト
  const M = (1n << 64n) - 1n;
  const rotl = (x, n) => ((x << BigInt(n)) | (x >> BigInt(64 - n))) & M;
  const RC = [];
  for (let t = 0, r = 1; t < 24; t++) {
    let c = 0n;
    for (let j = 0; j < 7; j++) { if (r & 1) c |= 1n << BigInt((1 << j) - 1); r = (r << 1) ^ (r & 0x80 ? 0x171 : 0); }
    RC.push(c);
  }
  const s = Array(25).fill(0n);
  const round = () => {
    for (let t = 0; t < 24; t++) {
      const C = [0, 1, 2, 3, 4].map((x) => s[x] ^ s[x + 5] ^ s[x + 10] ^ s[x + 15] ^ s[x + 20]);
      for (let x = 0; x < 5; x++) { const D = C[(x + 4) % 5] ^ rotl(C[(x + 1) % 5], 1); for (let y = 0; y < 25; y += 5) s[y + x] ^= D; }
      let x = 1, y = 0, cur = s[1];
      for (let i = 0; i < 24; i++) {
        const nx = y, ny = (2 * x + 3 * y) % 5, tmp = s[nx + 5 * ny];
        s[nx + 5 * ny] = rotl(cur, ((i + 1) * (i + 2) / 2) % 64); cur = tmp; x = nx; y = ny;
      }
      for (let y2 = 0; y2 < 25; y2 += 5) { const row = s.slice(y2, y2 + 5); for (let x2 = 0; x2 < 5; x2++) s[y2 + x2] = row[x2] ^ (~row[(x2 + 1) % 5] & M & row[(x2 + 2) % 5]); }
      s[0] ^= RC[t];
    }
  };
  const q = Array.from(data);
  q.push(0x06);                                   // SHA3の区切り（Keccakは0x01）
  while (q.length % rate) q.push(0);
  q[q.length - 1] |= 0x80;
  for (let o = 0; o < q.length; o += rate) {
    for (let i = 0; i < rate / 8; i++) { let lane = 0n; for (let b = 7; b >= 0; b--) lane = (lane << 8n) | BigInt(q[o + i * 8 + b]); s[i] ^= lane; }
    round();
  }
  const out = [];
  for (let i = 0; out.length < outLen; i++) for (let b = 0; b < 8; b++) out.push(Number((s[i] >> BigInt(8 * b)) & 255n));
  return Uint8Array.from(out.slice(0, outLen));
};
const ripemd160 = (data) => {
  const R1 = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,7,4,13,1,10,6,15,3,12,0,9,5,2,14,11,8,3,10,14,4,9,15,8,1,2,7,0,6,13,11,5,12,1,9,11,10,0,8,12,4,13,3,7,15,14,5,6,2,4,0,5,9,7,12,2,10,14,1,3,8,11,6,15,13];
  const R2 = [5,14,7,0,9,2,11,4,13,6,15,8,1,10,3,12,6,11,3,7,0,13,5,10,14,15,8,12,4,9,1,2,15,5,1,3,7,14,6,9,11,8,12,2,10,0,4,13,8,6,4,1,3,11,15,0,5,12,2,13,9,7,10,14,12,15,10,4,1,5,8,7,6,2,13,14,0,3,9,11];
  const S1 = [11,14,15,12,5,8,7,9,11,13,14,15,6,7,9,8,7,6,8,13,11,9,7,15,7,12,15,9,11,7,13,12,11,13,6,7,14,9,13,15,14,8,13,6,5,12,7,5,11,12,14,15,14,15,9,8,9,14,5,6,8,6,5,12,9,15,5,11,6,8,13,12,5,12,13,14,11,8,5,6];
  const S2 = [8,9,9,11,13,15,15,5,7,7,8,11,14,14,12,6,9,13,15,7,12,8,9,11,7,7,12,7,6,15,13,11,9,7,15,11,8,6,6,14,12,13,5,14,13,13,7,5,15,5,8,11,14,14,6,14,6,9,12,9,12,5,15,8,8,5,12,9,12,5,14,6,8,13,6,5,15,13,11,11];
  const K1 = [0x00000000, 0x5A827999, 0x6ED9EBA1, 0x8F1BBCDC, 0xA953FD4E];
  const K2 = [0x50A28BE6, 0x5C4DD124, 0x6D703EF3, 0x7A6D76E9, 0x00000000];
  const F = (j, x, y, z) => (j < 16 ? x ^ y ^ z : j < 32 ? (x & y) | (~x & z) : j < 48 ? (x | ~y) ^ z : j < 64 ? (x & z) | (y & ~z) : x ^ (y | ~z));
  const rol = (x, n) => ((x << n) | (x >>> (32 - n))) >>> 0;
  const q = Array.from(data);
  q.push(0x80);
  while (q.length % 64 !== 56) q.push(0);
  const bitLen = BigInt(data.length) * 8n;
  for (let i = 0; i < 8; i++) q.push(Number((bitLen >> BigInt(8 * i)) & 255n));   // 長さはリトルエンディアン
  let h = [0x67452301, 0xEFCDAB89, 0x98BADCFE, 0x10325476, 0xC3D2E1F0];
  for (let o = 0; o < q.length; o += 64) {
    const X = Array.from({ length: 16 }, (_, i) => (q[o + 4 * i] | (q[o + 4 * i + 1] << 8) | (q[o + 4 * i + 2] << 16) | (q[o + 4 * i + 3] << 24)) >>> 0);
    let [a1, b1, c1, d1, e1] = h, [a2, b2, c2, d2, e2] = h;
    for (let j = 0; j < 80; j++) {
      const k = Math.floor(j / 16);
      let t = (rol((a1 + F(j, b1, c1, d1) + X[R1[j]] + K1[k]) >>> 0, S1[j]) + e1) >>> 0;
      a1 = e1; e1 = d1; d1 = rol(c1, 10); c1 = b1; b1 = t;
      t = (rol((a2 + F(79 - j, b2, c2, d2) + X[R2[j]] + K2[k]) >>> 0, S2[j]) + e2) >>> 0;
      a2 = e2; e2 = d2; d2 = rol(c2, 10); c2 = b2; b2 = t;
    }
    h = [(h[1] + c1 + d2) >>> 0, (h[2] + d1 + e2) >>> 0, (h[3] + e1 + a2) >>> 0, (h[4] + a1 + b2) >>> 0, (h[0] + b1 + c2) >>> 0];
  }
  const out = new Uint8Array(20);
  h.forEach((v, i) => { for (let b = 0; b < 4; b++) out[4 * i + b] = (v >>> (8 * b)) & 255; });
  return out;
};
const hex = (u8) => Array.from(u8, (b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
const utf8 = (s) => new TextEncoder().encode(s);
console.log("SHA3-256(空文字):", hex(sha3_256(utf8(""))));
console.log("SHA3-256(abc)  :", hex(sha3_256(utf8("abc"))));
console.log("RIPEMD-160(空文字):", hex(ripemd160(utf8(""))));
console.log("RIPEMD-160(abc)  :", hex(ripemd160(utf8("abc"))));`,
// 12: 5.7 秘密鍵から公開鍵（Ed25519）
`const hex = (u8) => Array.from(u8, (b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
const edPublicKey = async (priv) => {
  const p = 2n ** 255n - 19n;                                  // 3.13と同じ道具（有限体の計算と、曲線の足し算・スカラー倍）
  const mod = (a) => ((a % p) + p) % p;
  const pw = (b, e) => { let r = 1n; b = mod(b); while (e > 0n) { if (e & 1n) r = (r * b) % p; b = (b * b) % p; e >>= 1n; } return r; };
  const inv = (a) => pw(a, p - 2n);
  const d = mod(-121665n * inv(121666n));
  const add = (P, Q) => {
    const k = mod(d * P[0] * Q[0] * P[1] * Q[1]);
    return [mod((P[0] * Q[1] + Q[0] * P[1]) * inv(1n + k)), mod((P[1] * Q[1] + P[0] * Q[0]) * inv(1n - k))];
  };
  const mul = (k, P) => { let R = [0n, 1n]; while (k > 0n) { if (k & 1n) R = add(R, P); P = add(P, P); k >>= 1n; } return R; };
  const By = mod(4n * inv(5n));                                // 基点B（y = 4/5、xは偶数のほう）
  const x2 = mod((By * By - 1n) * inv(d * By * By + 1n));
  let x = pw(x2, (p + 3n) / 8n);
  if (mod(x * x - x2) !== 0n) x = mod(x * pw(2n, (p - 1n) / 4n));
  if (x & 1n) x = p - x;
  const h = new Uint8Array(await crypto.subtle.digest("SHA-512", priv));   // ① 秘密鍵をSHA-512でハッシュする
  let a = 0n;
  for (let i = 31; i >= 0; i--) a = (a << 8n) | BigInt(h[i]);              // ② 前半32バイトを、リトルエンディアンで整数にする
  a = (a & ((1n << 254n) - 8n)) | (1n << 254n);                            // ③ 下位3ビットを0、254ビット目を1、255ビット目を0にそろえる
  const A = mul(a, [x, By]);                                               // ④ 公開鍵 A = a × B
  const out = new Uint8Array(32);
  for (let i = 0, y = A[1]; i < 32; i++, y >>= 8n) out[i] = Number(y & 255n);   // ⑤ yをリトルエンディアンの32バイトに
  out[31] |= Number(A[0] & 1n) << 7;                                       //    最上位ビットに、xが奇数かどうかを入れる
  return out;
};
const priv = Uint8Array.from({ length: 32 }, (_, i) => (i === 31 ? 1 : 0));   // 練習用の秘密鍵（00…01）。実際の資産には使わない
console.log("秘密鍵:", hex(priv));
console.log("公開鍵:", hex(await edPublicKey(priv)));`,
// 13: 5.7 公開鍵からアドレス（SHA3-256、RIPEMD-160、チェックサム、Base32）
`if (typeof ripemd160 === "undefined") { console.log("先に、上の「ハッシュの部品」のコードを実行してください"); return; }
const hex = (u8) => Array.from(u8, (b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
const fromHex = (s) => Uint8Array.from(s.match(/../g).map((h) => parseInt(h, 16)));
const A32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const b32enc = (u8) => {
  let bits = "", out = "";
  for (const x of u8) bits += x.toString(2).padStart(8, "0");
  for (let i = 0; i < bits.length; i += 5) out += A32[parseInt(bits.slice(i, i + 5).padEnd(5, "0"), 2)];
  return out;
};
const toAddress = (pub, netByte) => {
  const hash20 = ripemd160(sha3_256(pub));                   // ② SHA3-256 → ③ RIPEMD-160（20バイト）
  const body = new Uint8Array(21);
  body[0] = netByte; body.set(hash20, 1);                    // ④ 先頭にネットワーク識別子（21バイト）
  const check = sha3_256(body).slice(0, 3);                  // ⑤ 21バイトをSHA3-256にかけた先頭3バイトが、チェックサム
  const raw = new Uint8Array(24);
  raw.set(body); raw.set(check, 21);                         //    識別子1 ＋ ハッシュ20 ＋ チェックサム3 ＝ 24バイト
  return { hash20, check, raw, text: b32enc(raw) };          // ⑥ Base32で39文字にする
};
const pub = fromHex("4CB5ABF6AD79FBF5ABBCCAFCC269D85CD2651ED4B885B5869F241AEDF0A5BA29");   // 上で求めた公開鍵
for (const [name, netByte] of [["テストネット", 0x98], ["メインネット", 0x68]]) {
  const r = toAddress(pub, netByte), bits = netByte.toString(2).padStart(8, "0");
  console.log(name, "識別子 0x" + netByte.toString(16), "=", bits, "→ 先頭5ビット", bits.slice(0, 5), "→", A32[parseInt(bits.slice(0, 5), 2)]);
  console.log("  ハッシュ(20バイト)    :", hex(r.hash20));
  console.log("  チェックサム(3バイト) :", hex(r.check));
  console.log("  24バイト              :", hex(r.raw));
  console.log("  アドレス              :", r.text, "（" + r.text.length + "文字）");
}`,
// 14: 5.7 アドレスの検証と、24バイトへの復元
`if (typeof sha3_256 === "undefined") { console.log("先に、「ハッシュの部品」のコードを実行してください"); return; }
const hex = (u8) => Array.from(u8, (b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
const A32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const b32dec = (s) => {
  let bits = "";
  for (const ch of s) bits += A32.indexOf(ch).toString(2).padStart(5, "0");
  const out = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) out.push(parseInt(bits.slice(i, i + 8), 2));   // 8ビットずつ読む。余ったビットは捨てる
  return Uint8Array.from(out);
};
const checkAddress = (text) => {
  if (!/^[A-Z2-7]{39}$/.test(text)) return "形式が違います（A–Zと2–7の39文字）";
  const raw = b32dec(text);                                  // 24バイトに戻す
  const expected = sha3_256(raw.slice(0, 21)).slice(0, 3);   // 先頭21バイトから、チェックサムを計算し直す
  return hex(expected) === hex(raw.slice(21)) ? "OK（識別子 0x" + raw[0].toString(16) + "）" : "チェックサムが合いません";
};
const good = "TB6QOVCUOFRCF5QJSKPIQMLUVWGJS3KYFDETRPA";
const typo = good.slice(0, 10) + "A" + good.slice(11);        // 11文字目を、1文字だけ変える
console.log(good, "→", checkAddress(good));
console.log(typo, "→", checkAddress(typo));
console.log("小文字・短い →", checkAddress("tb6qovcu"));
console.log("復元した24バイト:", hex(b32dec(good)));
console.log("末尾だけ変える →", checkAddress(good.slice(0, 38) + "B"));`,
];

function Symbol5() {
  return (
    <>
      <H>5.1 この章の進め方</H>
      <Note kind="goal">Symbolを構成する4つの要素（アカウント・モザイク・ネームスペース・トランザクション）の役割と、ノードのREST APIから実際のデータを読む方法を説明できる。</Note>
      <P>第1〜4章は、特定のブロックチェーンに依存しない基礎でした。この章では、<B>Symbolに固有の話</B>（設計、データの形、鍵とハッシュの選び方、用語）を<B>まとめて</B>扱い、第4章で見たブロックチェーンの仕組みが、Symbolでは具体的にどんな形で現れるのかを見ていきます。この章は、台帳を<B>読むだけ</B>で、書き込みはしません。SDKも使いません（5.7では、練習用の秘密鍵からアドレスを手元で計算しますが、鍵をノードに送ることはありません）。第1〜4章で身につけた道具（JavaScript、データの表現、ハッシュと署名、ブロックチェーンの仕組み）を、実際のデータで使います。コンソールからノードに問い合わせ、返ってきた実際のデータを眺めながら進めます。</P>
      <Tbl head={['学ぶこと', '実際のデータで確かめること', '本編で使う章']} rows={[
        ['Symbolの設計と特徴（5.2）', '第1〜4章の部品との対応、メインネットとテストネットの違い、ハーベスト、ファイナライズ', '第2章'],
        ['ノードとREST API（5.3、5.4）', 'ノードの状態・役割、チェーンの現在地', '第2章'],
        ['時刻とブロック（5.5、5.6）', 'ブロックの項目、鎖のつながり', '第13章'],
        ['アカウントとアドレス（5.7）', '秘密鍵→公開鍵→アドレスの導出（Ed25519・SHA3・RIPEMD・Base32）、チェックサムの検証、REST APIが返す16進との変換、アカウント情報の取得', '第3章'],
        ['モザイク（5.8）', '可分性・フラグ・数量', '第5章'],
        ['ネームスペース（5.9）', '階層とエイリアス、名前の取得', '第6章'],
        ['トランザクション（5.10〜5.13）', '構造、種類、手数料と期限、状態の確認', '第4章以降'],
        ['SDKの位置づけ（5.14）', 'REST APIだけではできないこと', '第2章、全章'],
      ]} />
      <Note kind="warn">コードは、画面の「ノードURL」に入力したノードに問い合わせます（初期値はテストネットのノードです）。返ってくる値は<B>実行した時点のもの</B>なので、この章の「出力例」とは数値が一致しません。どんな項目がどんな形で返るかを見てください。</Note>

      <H>5.2 Symbolの全体像</H>
      <Note kind="goal">Symbolの設計の特徴を、コントラクト型との違いとあわせて説明できる。</Note>
      <P>Symbolは<B>パブリックブロックチェーン</B>で、NEMの後継として2021年3月にメインネットが始まりました（NEMについては、任意の第6章で扱います）。誰でもノードを動かして参加でき、誰でも台帳を読めます。</P>
      <H3>設計の考え方：機能が最初から組み込まれている</H3>
      <P>イーサリアムのようなコントラクト型は、プログラム（コントラクト）を自分で書いてデプロイし、その中にトークンや承認の仕組みを作ります。Symbolは逆に、<B>アカウント・モザイク・ネームスペース・トランザクション</B>といった機能があらかじめ組み込まれており、それらを組み合わせて使います。</P>
      <Tbl head={['観点', 'コントラクト型', 'Symbol']} rows={[
        ['機能の作り方', 'コントラクトのコードを書いてデプロイする', '組み込みの機能を組み合わせて使う'],
        ['トークン', 'コントラクトで実装する', 'モザイクという標準機能'],
        ['複数の操作をまとめる', 'コントラクトの中に書く', 'アグリゲートトランザクション（複数の操作を1つにまとめる機能。5.11）で束ねる'],
        ['複数人の承認', 'コントラクトで実装する', 'マルチシグ（複数の署名が必要なアカウント）と連署が標準機能'],
        ['独自のロジック', '自由度が高い', '標準機能の範囲内。足りない部分はアプリ側で補う'],
      ]} />
      <Note kind="point">組み込み機能は、コントラクトのバグによる事故を避けやすく、機能の使い方も共通になる利点があります。一方で、<B>標準機能にない独自のロジックはブロックチェーンの中に書けません</B>。向き不向きの違いであって、優劣ではありません。</Note>
      <FigSymbolParts />
      <Tbl head={['構成要素', '役割', 'この章の節']} rows={[
        ['アカウント', '秘密鍵・公開鍵のペアと、そこから作るアドレス。台帳上の「持ち主」', '5.7'],
        ['モザイク', 'トークン。基軸通貨のXYMも、独自に作るポイントやNFTも同じ仕組み', '5.8'],
        ['ネームスペース', 'アドレスやモザイクに付ける、人が読める名前', '5.9'],
        ['トランザクション', '台帳を変更する要求の単位。署名して送る', '5.10〜5.13'],
      ]} />
      <H3>第1〜4章の部品は、Symbolのどこに現れるか</H3>
      <P>第4章までは、特定のブロックチェーンを離れて、仕組みそのものを見てきました。それぞれがSymbolでどう現れるかを、まとめておきます。詳しくは、右端の節で扱います。</P>
      <Tbl head={['第1〜4章で学んだこと', 'Symbolでの現れ方', 'この章の節']} rows={[
        ['JavaScript：fetch・await・JSON（第1章）', 'ノードのREST APIを呼んで、返ってきたJSONを読む。この章のコードは、ほとんどが fetch と await で動く', '5.4〜5.13'],
        ['BigInt（2.3）', '数量・ブロック高・期限・モザイクIDなどは64ビット整数で、JSONでは文字列で返る。BigIntに直して計算する', '5.4、5.8、5.12'],
        ['台帳とノード（4.2）', '接続先のノードURL。アプリはノードのREST APIで台帳を読む', '5.3、5.4'],
        ['公開鍵暗号・電子署名（3.7、3.12）', 'アカウントは秘密鍵と公開鍵のペアで、アドレスは公開鍵から作る。トランザクションにはEd25519の署名を付ける', '5.7、5.10'],
        ['履歴と状態（4.4）', '状態は、アカウントの残高や所有モザイクなど。状態全体のハッシュがブロックヘッダーの stateHash に入る', '5.6、5.7'],
        ['ブロックの構造（4.5）', 'height、previousBlockHash、transactionsHash などのヘッダー項目', '5.6'],
        ['ハッシュ関数・ハッシュチェーン（3.10、4.6）', '次のブロックの previousBlockHash が、前のブロックの meta.hash と一致する。ブロックやトランザクションのハッシュはSHA3-256', '5.6、5.7'],
        ['マークルツリー（4.7）', 'transactionsHash。木の葉には、マルチシグの連署者の情報を含めた「マークルコンポーネントハッシュ」を使う', '5.6、本編第13章'],
        ['トランザクションの検証（4.9）', '署名・期限（deadline）・残高を確認。手数料はXYMで支払い、署名にはネットワーク固有のジェネレーションハッシュ（ネットワークごとに決まった値。署名に混ぜて、別のネットワークでの使い回しを防ぐ）が含まれる', '5.10、5.12、5.13'],
        ['合意形成（4.10）', 'ハーベスト（PoS+）で次のブロックを作る人を選ぶ', '5.2（下記）'],
        ['フォークとファイナリティ（4.11、4.12）', 'ブロックのスコアで鎖を選び、投票ノードによるファイナライズで確定させる', '5.2（下記）、5.13'],
        ['ビットフラグ・リトルエンディアン・Base32（第2章）', 'ノードの役割やモザイクの性質はフラグ、データの内部表現はリトルエンディアン、アドレスの表記はBase32（5.7で、公開鍵から作る）', '5.3、5.8、5.10、5.7'],
        ['Ed25519・SHA3・RIPEMD（第3章）', '署名と公開鍵はEd25519（SHA-512を使う標準の方式）。ブロックやトランザクションのハッシュはSHA3-256。アドレスは、公開鍵をSHA3-256とRIPEMD-160でハッシュして作る', '5.7'],
      ]} />

      <H3>ネットワークの特徴</H3>
      <Tbl head={['項目', 'Symbolでは']} rows={[
        ['ブロックの間隔', '約30秒ごとに1つ'],
        ['合意形成', 'ハーベスト（PoS系）。一定以上のXYMを持つアカウントが、次のブロックを作る役に選ばれる'],
        ['ファイナリティ', '投票ノードによるファイナライズで、ブロックを確定させる'],
        ['基軸通貨', 'XYM（モザイクの1つ）。ブロックを作った人への報酬や、手数料に使う'],
      ]} />
      <H3>ハーベスト：Symbolのブロックの作り方</H3>
      <P>第4章の4.10で見たPoSのうち、Symbolは、保有量に加えて<B>ネットワークでの活動（手数料の支払いなど）</B>も重みに含める「PoS+」という方式です。ブロックを作る作業は<B>ハーベスト</B>と呼ばれ、ブロックを作ったハーベスターには手数料が報酬として入ります。</P>
      <Ul items={[
        'ハーベストするには、一定以上の保有量が必要（メインネットの設定では10,000 XYM以上）',
        '秘密鍵を常時オンラインのノードに置かなくて済むよう、権限を別のアカウントに委任する「委任ハーベスト」がある',
        '選出の確率はくじ引きなので、保有量が多いからといって毎回選ばれるわけではない',
      ]} />
      <H3>フォークとファイナリティ：Symbolでの決まり方</H3>
      <P>第4章の4.11で見たとおり、ノードは<B>鎖のスコア</B>を比べて、大きい方を正とします。Symbolでは、スコアを<B>ブロックごとの難易度と、前のブロックからの時間間隔</B>から計算し、その合計で鎖を比べます。</P>
      <P>さらに、第4章の4.12で見た「明示的なファイナリティ」にあたる仕組みとして、<B>投票ノードによるファイナライズ</B>があります。投票ノードが投票で「ここまでは確定」と決めたブロックより前には、巻き戻りません。ブロック自体は約30秒ごとに作られますが、確定までにかかる時間は、ネットワークの状態によって変わります（5.4で確定済みのブロック高を確かめます）。</P>
      <Note kind="warn">数値（最低保有量など）はネットワークの設定で決まり、テストネットとメインネットで異なる場合があります。実際の値は、ノードのREST APIでネットワークのプロパティを確認してください。</Note>

      <H3>メインネットとテストネット</H3>
      <P>Symbolには、本番用の<B>メインネット</B>と、学習・開発用の<B>テストネット</B>があります。仕組みは同じですが、まったく別のネットワークで、台帳もアカウントの残高も共有されません。</P>
      <Tbl head={['項目', 'メインネット', 'テストネット']} rows={[
        ['ネットワーク識別子', '104（0x68）', '152（0x98）'],
        ['アドレスの先頭', 'N', 'T'],
        ['XYMのモザイクID', '6BED913FA20223F8', '72C0212E67A08BCE'],
        ['XYMの価値', '実際の資産', '練習用。価値はない'],
        ['使いどころ', '本番', '学習・開発・動作確認'],
      ]} />
      <Note kind="warn">アドレスにはネットワーク識別子が含まれるため、<B>同じ秘密鍵でも、ネットワークが違えばアドレスが変わります</B>。また、この講座の練習で使う秘密鍵を、メインネットで資産を持つアカウントに使い回さないでください。</Note>

      <H>5.3 ノードとREST API</H>
      <Note kind="goal">ノードの役割の違いと、アプリがノードのREST APIを通して台帳を読み書きする流れを説明できる。</Note>
      <P>台帳を持っているのは<B>ノード</B>です。アプリは直接ブロックチェーンに触れるのではなく、ノードが公開している<B>REST API</B>（HTTPで呼び出し、JSONで受け取る窓口）に問い合わせます。環境構築で指定した「ノードURL」が、その接続先です。</P>
      <FigNodeRoles />
      <P>ノードには3つの役割があり、<B>1・2・4という数</B>で区別します。</P>
      <Tbl head={['役割', 'ビット', '何をするか']} rows={[
        ['ピアノード', '1', 'ブロックを作り、ほかのノードと中継し合う。ネットワークの土台'],
        ['APIノード', '2', 'REST APIを公開し、読み取り用のデータベースに台帳を持つ。アプリの接続先'],
        ['投票ノード', '4', 'ファイナライズの投票に参加する'],
      ]} />
      <P>1台のノードが複数の役割を兼ねることもあり、その場合は<B>ビットを足した値</B>で表します（ピアとAPIを兼ねるなら 1 ＋ 2 ＝ 3）。第2章の2.4で見たモザイクのフラグと同じ考え方で、AND演算で調べられます。</P>
      <H3>主なエンドポイント</H3>
      <Tbl head={['エンドポイント', 'わかること']} rows={[
        ['/node/health', 'ノードが動いているか'],
        ['/node/info', 'ノードの情報（バージョン・役割・ネットワーク識別子など）'],
        ['/chain/info', '現在のブロック高と、確定済みのブロック'],
        ['/network/properties', 'ネットワークの設定値（ブロック間隔・基軸通貨・開始時刻など）'],
        ['/network/fees/transaction', '手数料の倍率'],
        ['/blocks/{height}', '指定したブロック高のブロック'],
        ['/accounts/{アドレスまたは公開鍵}', 'アカウントの情報と所有モザイク'],
        ['/mosaics/{モザイクID}', 'モザイクの性質'],
        ['/transactions/confirmed/{ハッシュ}', '承認済みトランザクション'],
        ['/transactionStatus/{ハッシュ}', 'トランザクションの状態'],
      ]} />
      <Note kind="point">読み取りはGETで呼ぶだけです。<B>台帳への書き込み（アナウンス）だけは、署名済みトランザクションを送る専用の窓口（PUT /transactions）</B>を使います（5.14）。変化を待ち受け続けたいときはWebSocketという別の方法を使います（本編の第10章）。</Note>

      <H>5.4 REST APIに触れてみる</H>
      <Note kind="goal">ノードの状態・役割・チェーンの現在地を取得し、返ってきた値の読み方を説明できる。</Note>
      <H3>ノードの状態と役割</H3>
      <P>まず、ノードが動いているかを確かめ、ノードの情報を取得します。<code>roles</code> は第2章の2.4で見たビットフラグなので、ANDで役割を取り出しています。<code>version</code> は4つの数を1つの整数にまとめたもので、8ビットずつに分けると読めます。</P>
      <Code code={S4[0]} />
      <Out code={`health: { apiNode: "up", db: "up" }
friendlyName: sym-test-01
version: 1.0.6.5
networkIdentifier: 152 = 0x98
roles: 3 [ "Peer", "Api" ]`} />
      <H3>チェーンの現在地</H3>
      <Code code={S4[1]} />
      <Out code={`{ height: "1234567", scoreHigh: "0", scoreLow: "…", latestFinalizedBlock: { height: "1234540", … } }
ブロック高: 1234567  確定済み: 1234540
確定が追いついていないブロック数: 27
JSONでの型: string  → BigIntにすると: bigint`} />
      <Note kind="point">ブロック高が増え続けることが、ネットワークが動いている証拠です。確定済みのブロック高は、通常は現在のブロック高より少し遅れます（ファイナライズに時間がかかるため）。</Note>
      <FigUint64 />
      <Note kind="warn">Symbolでは、数量・ブロック高・期限・モザイクIDなどが<B>64ビットの符号なし整数（uint64）</B>です。<B>64ビットの値は、JSONでは文字列で返ってきます</B>（<code>"1234567"</code> のように引用符つき）。JavaScriptの通常の数値は約9×10<sup>15</sup>までしか正確に扱えないためです。計算するときは <code>BigInt(...)</code> に変換します（第2章の2.2、2.3）。</Note>

      <H>5.5 時刻とブロック高</H>
      <Note kind="goal">ブロックの timestamp から実際の日時を求める方法を説明できる。</Note>
      <P>ブロックの <code>timestamp</code> は、日付ではなく<B>ネットワークが始まった時点からの経過ミリ秒</B>です。実際の日時にするには、ネットワークの開始時刻（<code>/network/properties</code> の <code>epochAdjustment</code>。Unix時刻の秒に <code>s</code> が付いた形）を足します。</P>
      <FigTimestamp />
      <Ul items={[
        '実際の日時（ミリ秒） ＝ epochAdjustment（秒） × 1000 ＋ timestamp',
        'トランザクションの deadline も、同じ「ネットワーク開始からのミリ秒」',
        '本編のコードで epochAdjustment を取得しているのは、この変換のため',
      ]} />
      <Code code={S4[2]} />
      <Out code={`ブロック 1234567 の作成時刻(UTC): 2026-10-17T05:30:12.345Z
日本時間: 2026/10/17 14:30:12
前のブロックとの間隔: 31.4 秒
ネットワークの目標間隔: 30s`} />
      <P>ブロックの間隔は、ちょうど30秒ではなく<B>毎回ばらつきます</B>。目標が30秒で、平均すると30秒前後になるよう、ブロックを作る難易度が調整されています（第4章の difficulty）。</P>

      <H>5.6 ブロックを読む</H>
      <Note kind="goal">ブロックのどの項目が第4章のどの仕組みに対応するかを説明し、鎖のつながりを自分で確かめる。</Note>
      <P>第4章で見たブロックの構造を、実際のブロックで確かめます。<code>/blocks/ブロック高</code> は、ヘッダーに当たる <code>block</code> と、ノードが付け足した補足情報 <code>meta</code> を返します。</P>
      <FigBlock symbol />
      <Tbl head={['場所', '項目', '意味（第4章の対応）']} rows={[
        ['block', 'height／timestamp', 'ブロック高と作成時刻（4.5、5.5）'],
        ['block', 'difficulty', '難易度。ブロックを作る条件の厳しさ。スコアの計算に使う（4.10、4.11）'],
        ['block', 'previousBlockHash', '前のブロックのハッシュ。鎖をつなぐ（4.6）'],
        ['block', 'transactionsHash', '取引のマークルルート（4.7）。取引が0件のブロックでは、全部0になる'],
        ['block', 'receiptsHash', 'レシート（手数料の分配など、取引の結果として起きた出来事）のハッシュ。ブロック処理の結果を固定する'],
        ['block', 'stateHash', '台帳の状態のハッシュ（4.4）'],
        ['block', 'signerPublicKey／signature', 'ブロックを作ったハーベスターの公開鍵と署名'],
        ['block', 'beneficiaryAddress／feeMultiplier', '報酬の一部の受取先と、手数料の倍率（5.12）'],
        ['block', 'type', 'ブロックの種類（通常のブロックは 0x8143）'],
        ['meta', 'hash', 'このブロックのハッシュ（ヘッダーから計算された値）'],
        ['meta', 'transactionsCount／totalFee', '取引の数と、手数料の合計'],
      ]} />
      <Note kind="warn">第4章のマークルツリーの模型は、考え方をつかむために単純化したものです。本物のSymbolでは、マルチシグの連署者の情報を含めた「マークルコンポーネントハッシュ」を木の葉に使うため、トランザクションのハッシュをそのまま葉にはできません（本編の第13章で扱います）。</Note>
      <P>ブロックのハッシュは <code>block</code> の中ではなく <code>meta.hash</code> に入っています。<B>次のブロックの <code>previousBlockHash</code> が、前のブロックの <code>meta.hash</code> と一致している</B>ことを確かめてみましょう。これが第4章のハッシュチェーンです。</P>
      <Code code={S4[3]} />
      <Out code={`height: 1234567  type: 33091 = 0x8143
transactionsHash: 0000000000000000000000000000000000000000000000000000000000000000
取引の数: 0  手数料の合計: 0
このブロックのハッシュ : 9A1F…（64桁）
previousBlockHash     : 5C03…（64桁）
前のブロックのハッシュ : 5C03…（64桁）
鎖がつながっている: true`} />
      <Note kind="point">ブロックの <code>type</code> は10進数で返ります。16進数に直すと <code>0x8143</code> で、取引のない静かなブロックも、同じ形で記録されています。</Note>

      <H>5.7 アカウントとアドレス</H>
      <Note kind="goal">アカウントとアドレスの関係と、アドレスの内訳を説明し、公開鍵からアドレスを自分で計算・検証して、アカウント情報を取得できる。</Note>
      <P>アカウントは、秘密鍵と公開鍵のペアです。アドレスは公開鍵から計算できるので、<B>アドレスを知っても秘密鍵は分かりません</B>。第2章の2.7で見たBase32で、アドレスは「バイト列をBase32で文字にしたもの」として表記されます。この節では、<B>秘密鍵からアドレスまでを、第2〜3章の道具だけで自分で計算</B>して、SDKと同じ結果になることを確かめます。</P>
      <FigAddress />
      <Tbl head={['データ', '長さ', '内容']} rows={[
        ['秘密鍵', '32バイト（16進で64桁）', '署名に使う、誰にも見せない値'],
        ['公開鍵', '32バイト（16進で64桁）', '署名の検証に使う、公開してよい値'],
        ['アドレス', '24バイト → Base32で39文字', 'ネットワーク識別子（1）＋公開鍵のハッシュ（20）＋チェックサム（3）'],
      ]} />
      <P>末尾のチェックサムのおかげで、アドレスを1文字打ち間違えると、無効なアドレスとして気づけます。先頭の文字は、ネットワーク識別子のビットから決まります（テストネットのT、メインネットのN）。どちらも、このあとの「アドレスを自分で計算する」で動かして確かめます。</P>
      <H3>24バイトが、なぜ39文字になるのか</H3>
      <P>アドレスの本体は<B>24バイト</B>（1 ＋ 20 ＋ 3）で、これは<B>192ビット</B>です。同じデータでも、書き方によって長さが変わります。</P>
      <Tbl head={['書き方', '1文字あたり', '長さ', '計算']} rows={[
        ['バイト列', '―', '24バイト', '1 ＋ 20 ＋ 3'],
        ['16進（REST APIが返す形）', '4ビット', '48桁', '192 ÷ 4 ＝ 48'],
        ['Base32（人が見る形）', '5ビット', '39文字', '192 ÷ 5 ＝ 38.4 → 切り上げて39'],
      ]} />
      <P>Base32は、ビットを5ビットずつ区切って1文字にします（第2章の2.7）。192ビットを区切ると、<B>38個で190ビット、2ビットが余ります</B>。この余りの2ビットも文字にする必要があるので、後ろに0を3ビット足して5ビットにそろえ、39文字目にします。そのため、<B>アドレスの最後の文字は、A・I・Q・Yのどれか</B>（余りの2ビットが 00・01・10・11 のとき）になります。</P>
      <Note kind="point">標準のBase32は、長さを8文字の倍数にそろえるために、末尾に <code>=</code> を足して40文字にします。Symbolのアドレスは、この <code>=</code> を付けず、<B>39文字のまま</B>で表記します。</Note>
      <P>逆向きは、39文字を5ビットずつ読み戻すと195ビットになり、先頭の192ビットが24バイトで、最後の3ビットは余りです。この余りの扱いは、あとの「ステップ4」で動かして確かめます。</P>
      <H3>Symbolの鍵・署名・ハッシュ</H3>
      <P>第3章で見た部品のうち、どれを選んでいるかがSymbolの特徴です。第3章の模型はSHA-256で動かしましたが、実際のSymbolは次のものを使います。</P>
      <Tbl head={['用途', 'Symbolが使うもの', '第3章での説明']} rows={[
        ['署名・公開鍵', 'Ed25519（ハッシュにSHA-512を使う、標準の方式）', '3.13'],
        ['トランザクション・ブロックのハッシュ、マークルツリー', 'SHA3-256', '3.10'],
        ['アドレスのもとになるハッシュ', '公開鍵をSHA3-256、さらにRIPEMD-160でハッシュして20バイトにする', '3.10'],
        ['アドレスの表記', 'Base32（先頭がTならテストネット、Nならメインネットの39文字）', '第2章の2.7'],
        ['内部のバイト列', '数値はリトルエンディアン（トランザクションや公開鍵の内部表現）', '第2章の2.6'],
      ]} />
      <Note kind="point">秘密鍵から公開鍵を作り、その公開鍵からアドレスを作る、という<B>一方向の流れ</B>は、第3章の離散対数とハッシュの性質で守られています。ここでもアドレスから公開鍵、公開鍵から秘密鍵は逆算できません。</Note>
      <H3>アドレスを自分で計算する</H3>
      <Note kind="goal">秘密鍵から公開鍵、公開鍵からアドレスまでを、第2〜3章の道具だけで計算し、SDKと同じ結果になることを確かめる。</Note>
      <P>アドレスは、乱数ではなく<B>公開鍵から決まる値</B>です。計算は次の6ステップで、<B>第2章（バイト列・Base32）と第3章（ハッシュ・Ed25519）で見た部品を、順につなぐだけ</B>です。この節のコードは手元のブラウザの中だけで動き、秘密鍵をノードに送ることはありません。</P>
      <Tbl head={['手順', '処理', '長さ', '使う部品']} rows={[
        ['① 秘密鍵 → 公開鍵', 'Ed25519。秘密鍵をSHA-512でハッシュして整数にし、基点Bをその回数だけ足す', '32バイト', '3.13（2.3 BigInt、2.6 エンディアン、3.3〜3.9 有限体と曲線）'],
        ['② 公開鍵 → SHA3-256', '公開鍵をハッシュにする', '32バイト', '3.10'],
        ['③ → RIPEMD-160', '②をさらにハッシュして、短くする', '20バイト', '3.10'],
        ['④ 識別子を付ける', '先頭に、ネットワーク識別子（メインネットは0x68、テストネットは0x98）の1バイトを付ける', '21バイト', '2.5'],
        ['⑤ チェックサムを付ける', '④をSHA3-256にかけ、先頭3バイトを末尾に付ける', '24バイト', '3.10'],
        ['⑥ Base32で書く', '5ビットずつ区切って、32種類の文字にする', '39文字', '2.4、2.7'],
      ]} />
      <FigAddressBytes />
      <H3>ステップ1：ハッシュ関数を用意する</H3>
      <P>②③⑤で使う<B>SHA3-256</B>と<B>RIPEMD-160</B>は、ブラウザ標準の <code>crypto.subtle</code> にありません（あるのはSHA-1、SHA-256、SHA-384、SHA-512）。そこで、小さな実装を用意します。中身（Keccakという仕組みの計算）は<B>読まなくて構いません</B>。実行して、末尾の4行が下の出力例と一致することを確かめてください。これで、<code>sha3_256(バイト列)</code> と <code>ripemd160(バイト列)</code> が使えるようになります。</P>
      <Code code={S4[11]} />
      <Out code={`SHA3-256(空文字): A7FFC6F8BF1ED76651C14756A061D662F580FF4DE43B49FA82D80A4B80F8434A
SHA3-256(abc)  : 3A985DA74FE225B2045C172D6BD390BD855F086E3E9D525B46BFE24511431532
RIPEMD-160(空文字): 9C1185A5C5E9FC54612808977EE8F548B2258D31
RIPEMD-160(abc)  : 8EB208F7E05D987A9B044A8E98C6B087F15A0BFC`} />
      <Note kind="warn"><B>SHA3-256とKeccak-256は別物</B>です。計算はほぼ同じで、最後の「区切りのバイト」だけが違い（SHA3は 0x06、Keccakは 0x01）、出力がまったく変わります。イーサリアムが使うのはKeccak-256、Symbolが使うのはSHA3-256です。コードの <code>q.push(0x06)</code> の行が、その区切りです。</Note>
      <H3>ステップ2：秘密鍵から公開鍵を作る</H3>
      <P>3.13で動かしたEd25519の計算が、そのまま使えます。3.13の模型では省いていた<B>鍵の導出の細部</B>を、ここで補います。秘密鍵（32バイト）を<B>SHA-512でハッシュ</B>し、その前半32バイトをリトルエンディアンの整数にします。さらに、<B>下位3ビットを0、254ビット目を1、255ビット目を0</B>にそろえて、秘密のスカラー a を作ります。基点Bを a 回足した点 A ＝ a × B が公開鍵で、点Aは、y座標をリトルエンディアンの32バイトにし、最上位ビットにx座標の偶奇を入れて表します（3.13の <code>encode</code> と同じです）。</P>
      <Code code={S4[12]} />
      <Out code={`秘密鍵: 0000000000000000000000000000000000000000000000000000000000000001
公開鍵: 4CB5ABF6AD79FBF5ABBCCAFCC269D85CD2651ED4B885B5869F241AEDF0A5BA29`} />
      <Note kind="point">3.13の模型との違いは、<B>ハッシュ関数</B>です。模型は手軽なSHA-256で代用しましたが、実際のSymbolは<B>SHA-512</B>を使う標準のEd25519なので、同じ秘密鍵から、一般的なEd25519の実装と同じ公開鍵ができます。なお、Symbolの前身のNEMは、SHA-512ではなくKeccak-512を使う派生版でした。</Note>
      <Note kind="warn">このコードの秘密鍵（00…01）は、誰でも思いつく値で、<B>実際の資産には絶対に使えません</B>。SDKが返す値と見比べるための、固定の練習用です。<code>crypto.getRandomValues(new Uint8Array(32))</code> で作ったランダムな鍵に差し替えて試すこともできますが、練習で使った鍵を、実際の資産の管理に使い回してはいけません。</Note>
      <H3>ステップ3：公開鍵からアドレスを作る</H3>
      <P>手順②〜⑥です。ステップ2で求めた公開鍵を、そのまま書き込んであります（ステップ2を実行していなくても動きますが、ステップ1の実行は必要です）。ネットワーク識別子は、<B>テストネットの0x98とメインネットの0x68の両方</B>で計算します。</P>
      <Code code={S4[13]} />
      <Out code={`テストネット 識別子 0x98 = 10011000 → 先頭5ビット 10011 → T
  ハッシュ(20バイト)    : 7D075454716222F609929E883174AD8C996D5828
  チェックサム(3バイト) : C938BC
  24バイト              : 987D075454716222F609929E883174AD8C996D5828C938BC
  アドレス              : TB6QOVCUOFRCF5QJSKPIQMLUVWGJS3KYFDETRPA （39文字）
メインネット 識別子 0x68 = 01101000 → 先頭5ビット 01101 → N
  ハッシュ(20バイト)    : 7D075454716222F609929E883174AD8C996D5828
  チェックサム(3バイト) : BC9FFF
  24バイト              : 687D075454716222F609929E883174AD8C996D5828BC9FFF
  アドレス              : NB6QOVCUOFRCF5QJSKPIQMLUVWGJS3KYFC6J77Y （39文字）`} />
      <FigAddressBase32 />
      <Note kind="point">この結果は、公式SDK（v3）の <code>facade.network.publicKeyToAddress(publicKey)</code>（本編の第3章）が返すアドレスと一致します。SDKの1回の呼び出しの中で、この6ステップが行われています。</Note>
      <Note kind="point"><B>ネットワークが違うと、どこが変わるか。</B>20バイトのハッシュは同じで、識別子の1バイトだけが違います。ただし、チェックサムは識別子を含めて計算するので、チェックサムも変わり、アドレスの先頭の文字と、末尾の数文字が変わります。5.2で「同じ秘密鍵でもネットワークが違えばアドレスが変わる」と書いたのは、このためです。</Note>
      <Note kind="point"><B>先頭がTやNになる理由。</B>識別子の0x98を2進にすると 10011000 です。Base32は5ビットずつ読むので、最初の5ビット 10011（19）が、文字表（A＝0、B＝1、…）の19番目のTになります。メインネットの0x68は 01101000 で、01101（13）がNです。2文字目は、識別子の残り3ビット（000）にハッシュの先頭2ビットが続くので、A〜Dのどれかになります。2.4（ビット）と2.7（5ビット区切り）が、そのままアドレスの見た目を決めています。</Note>
      <H3>ステップ4：アドレスを検証して、24バイトに戻す</H3>
      <P>逆向きの計算も、同じ部品でできます。39文字を5ビットずつ読んで8ビットずつに組み直せば24バイトに戻ります。そこで、<B>先頭21バイトからチェックサムを計算し直し、末尾の3バイトと比べる</B>と、入力ミスを見つけられます。次のコードは、正しいアドレスと、1文字だけ変えたアドレスを検証します（ステップ1の実行が必要です）。</P>
      <Code code={S4[14]} />
      <Out code={`TB6QOVCUOFRCF5QJSKPIQMLUVWGJS3KYFDETRPA → OK（識別子 0x98）
TB6QOVCUOFACF5QJSKPIQMLUVWGJS3KYFDETRPA → チェックサムが合いません
小文字・短い → 形式が違います（A–Zと2–7の39文字）
復元した24バイト: 987D075454716222F609929E883174AD8C996D5828C938BC
末尾だけ変える → OK（識別子 0x98）`} />
      <Note kind="point">チェックサムは3バイト（24ビット）なので、1文字の打ち間違いのほとんどは見つかります。ただし、見つけられるのは<B>「間違い」まで</B>で、正しい宛先かどうかは分かりません。別の人の正しいアドレスを入力すれば、チェックを通ってしまいます。</Note>
      <Note kind="warn">最後の例（末尾の1文字だけを変える）は、チェックを通ります。39文字 × 5 ＝ 195ビットのうち、24バイト（192ビット）に使うのは先頭の192ビットで、<B>最後の文字の下位3ビットは余り</B>だからです（2.7で見た、5ビットに満たない分を0で埋めた部分です）。この変換では、末尾の1文字だけが違う文字列が、同じ24バイトに戻ります。アドレスを文字列のまま比べたり保存したりするときは、書き方をそろえておくと安全です。</Note>
      <H3>REST APIが返すアドレスは「16進」</H3>
      <P>REST APIは、ブロックやトランザクションの中のアドレスを<B>48桁の16進文字列</B>（24バイト）で返します。人が見るアドレスの39文字に直すには、ステップ3の⑥と同じ、第2章の2.7のBase32変換を使います。次のコードは、最新ブロックの報酬の受取先（<code>beneficiaryAddress</code>）を39文字に直し、そのアカウントの情報を取得します。</P>
      <Code code={S4[4]} />
      <Out code={`48 桁の16進 → TBXU…（39文字）
accountType: 1  publicKey: 7C3A…（64桁）
mosaics: [ { id: "72C0212E67A08BCE", amount: "1234567890" } ]`} />
      <Note kind="point"><code>accountType</code> は、委任ハーベスト（5.2）のための、アカウントのつながりの状態を表す数です。0は、つながりなし。1は「メイン」アカウント（ハーベスト用の「リモート」アカウントとつながっている）、2は「リモート」アカウントです。ふつうの送金に使うアカウントは、0であることがほとんどです。</Note>
      <Note kind="point"><code>/accounts/…</code> には、39文字のアドレスだけでなく、64桁の公開鍵も指定できます。残高は <code>mosaics</code> に、モザイクIDと数量（文字列）の組で入っています。数量の読み方は5.8で説明します。</Note>
      <Note kind="warn">取得した <code>publicKey</code> が全部0のアカウントがあります。<B>公開鍵は、そのアカウントが初めて署名したトランザクションがブロックに入って、はじめて台帳に載る</B>ためです。受け取っただけのアカウントは、アドレスしか台帳に出てきません。</Note>

      <H>5.8 モザイク</H>
      <Note kind="goal">モザイクの性質（可分性・フラグ・数量）の意味と、数量を最小単位で扱う理由を説明できる。</Note>
      <P>モザイクはSymbolのトークンです。基軸通貨のXYMも、自分で作るポイントやNFTも、同じ仕組みの上に作られます。モザイクを作るときには、「何個発行するか」「小数を使うか」「あとから発行数を増やせるか」といったルールを最初に決めます。モザイクは次の性質を持ち、作るときに決めます。</P>
      <Tbl head={['項目', '意味', '例']} rows={[
        ['id', 'モザイクを区別する8バイトの値（16進で16桁）', '72C0212E67A08BCE（テストネットのXYM）'],
        ['supply', '供給量（発行数）。最小単位の整数', 'XYMでは10の6乗が1XYM'],
        ['divisibility', '可分性。小数点以下の桁数（0〜6）', '0なら整数だけ、6なら小数6桁まで'],
        ['flags', '「あとから何ができるか」を決める、4つのON/OFFの設定（下で説明）', '例：3 ＝ 譲渡可 ＋ 供給量の変更可'],
        ['duration', '有効期間（ブロック数）', '0なら無期限'],
      ]} />
      <H3>数量は「最小単位の整数」で扱う</H3>
      <P>ブロックチェーンの中に、小数は存在しません。数量は<B>最小単位の整数</B>で記録し、表示するときに可分性で割ります。可分性が6のXYMなら、<code>1000000</code> が 1 XYM、<code>12345678</code> が 12.345678 XYM です。小数の誤差で残高がずれる心配がありません。数量を整数のまま持ち、表示と入力のときだけ変換する書き方は、第2章の2.3でも確かめられます。</P>
      <H3>フラグ：あとから何ができるかを決める4つの設定</H3>
      <P>モザイクには、作るときに決める「ON/OFFの設定」が4つあります。まず、何ができる設定なのかを言葉で見てみましょう。</P>
      <Tbl head={['設定', 'ONのとき', 'たとえば']} rows={[
        ['supplyMutable（供給量変更可）', '作成者が、あとから発行数を増やしたり減らしたりできる', 'イベントのポイントを、あとから追加で発行したい'],
        ['transferable（譲渡可）', '作成者以外の人にも渡せる。OFFだと、作成者との間でしか動かせない', 'ONなら通貨のように流通する。OFFなら、人に渡せない参加証になる'],
        ['restrictable（保有制限可）', '保有できるアカウントを、作成者が制限できる（第11章）', '会員だけが持てるトークン'],
        ['revokable（回収可）', '作成者が、他人の保有分を取り戻せる', '不正に手に入れられた会員証や、期限切れのチケットを取り戻す'],
      ]} />
      <Note kind="warn">回収可（revokable）がONのモザイクは、<B>受け取った後でも、作成者に取り戻されることがある</B>ということです。見知らぬモザイクを受け取るときや、買うときは、この設定を確かめるのが安全です。</Note>
      <P>この4つのON/OFFは、<B>1つの整数にまとめて</B>持ちます。</P>
      <P>モザイクのフラグは、第2章の2.4で見た権限のフラグと同じ作りです。<B>1つの性質に1ビットを割り当て、足し合わせた1つの整数</B>で持ち、ORで立てて、ANDで調べます。たとえば「供給量変更可」と「譲渡可」を両方もつモザイクは、1 ＋ 2 ＝ 3（<code>0011</code>）です。</P>
      <FigFlags />
      <Tbl head={['フラグ', '重み', 'ONのとき']} rows={[
        ['supplyMutable', '1', '作成者が供給量を増減できる'],
        ['transferable', '2', '作成者以外にも譲渡できる'],
        ['restrictable', '4', '保有できる人を制限できる（第11章）'],
        ['revokable', '8', '作成者が、他人の保有分を回収できる'],
      ]} />
      <FigAmount />
      <P>次のコードは、基軸通貨のXYMの性質を取得し、フラグの数を4つの設定に分けて表示します。あわせて、数量を最小単位に直す計算も確かめます。</P>
      <Code code={S4[5]} />
      <Out code={`基軸通貨のモザイクID: 72C0212E67A08BCE
divisibility: 6  duration: 0  flags: 3 = 0011
   supplyMutable true
   transferable true
   restrictable false
   revokable false
供給量(最小単位): 7842928625000000  → 整数部だけ表示: 7842928625
基軸通貨 1 単位 ＝ 1000000 （最小単位）
12.5 単位 ＝ 12500000 （最小単位）`} />
      <Note kind="warn">モザイクの数量（<code>amount</code>、<code>supply</code>）は文字列で返ります。<B>画面に表示する前に、可分性で割る</B>のを忘れないでください。1000000と表示される残高が1XYMなのか100万個なのかは、可分性を見ないと分かりません。</Note>

      <H>5.9 ネームスペース</H>
      <Note kind="goal">ネームスペースの階層とエイリアスの考え方を説明できる。</Note>
      <P>アドレスは39文字、モザイクIDは16桁の16進数で、人には覚えにくい値です。<B>ネームスペース</B>は、それらに付ける人が読める名前で、ドメイン名のように所有権があり、期間を決めてレンタルします。</P>
      <FigNamespaceTree />
      <Tbl head={['項目', '内容']} rows={[
        ['ルートネームスペース', '最上位の名前。レンタルして取得し、期間（ブロック数）が過ぎると失効する。期限後には猶予期間もある'],
        ['サブネームスペース', 'ルートの所有者が、その下に作れる。点（.）でつなぎ、ルートを含めて3段まで'],
        ['使える文字', '小文字の英数字と _ と -'],
        ['エイリアス', 'ネームスペースを、アドレスまたはモザイクのどちらか1つに結びつけること'],
        ['内部の表現', '名前のハッシュから計算した8バイトのID。ノードは名前ではなくIDで扱う'],
      ]} />
      <P>例えば <code>symbol.xym</code> は、基軸通貨XYMのモザイクに結びついた名前です。転送時にモザイクIDの代わりにこの名前を指定できます（本編の第6章）。ノードに「このモザイクにどんな名前が付いているか」を聞いてみましょう。</P>
      <Code code={S4[6]} />
      <Out code={`{"mosaicNames":[{"mosaicId":"72C0212E67A08BCE","names":["symbol.xym"]}]}`} />
      <Note kind="point">ネームスペースは<B>便利な別名であって、本体ではありません</B>。期限が切れて失効すると、名前は使えなくなり、別の人が取得できます。長く使うものは、IDそのものを控えておくと安全です。</Note>

      <H>5.10 トランザクションの構造</H>
      <Note kind="goal">トランザクションが「共通ヘッダー＋種類ごとの本体」のバイト列であることを説明し、送金の例で各項目を読める。</Note>
      <P>第2章の2.5で見たとおり、ブロックチェーンのデータはバイト列です。トランザクションも例外ではなく、<B>先頭の共通ヘッダー（128バイト）と、種類ごとの本体</B>が並んだバイト列です。図は、メッセージのないXYMの送金です。</P>
      <FigTxBytes />
      <Tbl head={['ヘッダーの項目', '意味']} rows={[
        ['size', 'トランザクション全体のバイト数'],
        ['signature／signerPublicKey', '署名と、署名した人の公開鍵（第3章の3.12の電子署名）'],
        ['version／network', '形式のバージョンと、ネットワーク識別子（104または152）'],
        ['type', 'トランザクションの種類（送金は 0x4154）'],
        ['maxFee', '払ってもよい手数料の上限（5.12）'],
        ['deadline', '有効期限（5.5と同じ、ネットワーク開始からのミリ秒）'],
      ]} />
      <Note kind="point"><B>署名には、ネットワークのジェネレーションハッシュも含まれます</B>。そのため、テストネットで作った署名付きトランザクションを、メインネットへ流用することはできません。同じ内容でも、ネットワークが違えば署名が通りません。</Note>
      <P>次のコードは、この176バイトを手作業で並べた模型です。署名と公開鍵の欄は空のままで、署名の計算は、SDKが担当します（5.14）。宛先の欄（<code>recipientAddress</code>、24バイト）に入るのは、5.7で作った24バイト（Base32にする前の形）そのものです。この模型では、そのうち識別子の1バイトだけを入れています。<B>数値はリトルエンディアン</B>（下の桁から先に並べる、第2章の2.6。Symbolのトランザクションや公開鍵の内部表現は、すべてこの順です）で書き込んでいるので、<code>0x4154</code> が <code>5441</code> と並ぶのを確かめてください。</P>
      <Code code={S4[7]} />
      <Out code={`  0  4バイト size              B0000000
  4  4バイト reserved          00000000
  8 64バイト signature         000000000000000000000000…
 72 32バイト signerPublicKey   000000000000000000000000…
104  4バイト reserved          00000000
108  1バイト version           01
109  1バイト network           98
110  2バイト type              5441
112  8バイト maxFee            C044000000000000
120  8バイト deadline          …
128 24バイト recipientAddress  980000000000000000000000…
152  2バイト messageSize       0000
154  1バイト mosaicsCount      01
155  4バイト reserved          00000000
159  1バイト reserved          00
160  8バイト mosaic.id         CE8BA0672E21C072
168  8バイト mosaic.amount     40420F0000000000
合計 176 バイト`} />

      <Note kind="point">表の <code>reserved</code> は、将来のために空けてある領域で、いまは0が入ります。使い道のない欄ですが、位置（何バイト目か）を決めるために、バイト数のとおりに並べる必要があります。</Note>

      <H>5.11 トランザクションの種類</H>
      <Note kind="goal">Symbolの主なトランザクションの種類と、本編のどの章で扱うかを説明できる。</Note>
      <P>共通ヘッダーの <code>type</code> で種類が決まり、種類ごとに本体の形が変わります。本編の章は、この種類の順に進みます。</P>
      <Tbl head={['種類', '役割', '本編']} rows={[
        ['送金（転送）トランザクション', 'モザイクとメッセージを送る。type は 0x4154', '第4章'],
        ['モザイクの作成・供給量の変更', 'モザイクを作り、数量を増減する', '第5章'],
        ['ネームスペースの登録・エイリアス', 'ネームスペースを借り、アドレスやモザイクに結びつける', '第6章'],
        ['メタデータ', 'アカウント・モザイク・ネームスペースにKey-Valueを登録する', '第7章'],
        ['ハッシュロック・シークレットロック', '預けて、条件が満たされたら解除する', '第8章'],
        ['マルチシグの設定', 'アカウントを複数人の署名が必要な構成にする', '第9章'],
        ['アカウントの制限・モザイクの制限', '受け取りや送信を制限する', '第11章'],
        ['アグリゲートトランザクション', '複数のトランザクションを1つにまとめて、全部成功か全部失敗かにする', '第4章以降'],
      ]} />
      <P><B>アグリゲートトランザクション</B>は、Symbolの特徴的な機能です。中に入れる各トランザクション（インナートランザクション）は署名を持たず、外側のアグリゲートに対する署名（連署を含む）でまとめて承認されます。必要な署名が揃っている場合は <B>complete</B>（type 0x4141）、あとから署名を集める場合は <B>bonded</B>（type 0x4241）です。bondedは、署名が揃う前に、先にノードへ送っておける形です。その代わりに、<B>ハッシュロック</B>という預け金を先に払います（第8章）。</P>
      <FigAggregate />
      <Note kind="point">「複数の操作を原子的に（途中で止まらず全部成功か全部失敗か）行う」「複数人の署名を集める」といった、コントラクトで書く処理は、Symbolではこのアグリゲートとマルチシグの組み合わせで実現します（5.2）。</Note>

      <H>5.12 手数料と有効期限</H>
      <Note kind="goal">手数料の計算式と、maxFee・deadlineの意味を説明できる。</Note>
      <P>トランザクションの手数料は、<B>サイズ（バイト） × 手数料の倍率</B>です。サイズが大きいほど、つまりメッセージやインナートランザクションが多いほど、手数料が高くなります。倍率は、ブロックを作るハーベスターが決める値で、ブロックの <code>feeMultiplier</code> に入っています。</P>
      <Tbl head={['項目', '誰が決めるか', '意味']} rows={[
        ['maxFee', '送信者', '払ってもよい手数料の上限。トランザクションの中に書く'],
        ['feeMultiplier', 'ハーベスター（ブロック）', '実際に適用される倍率'],
        ['実際の手数料', '—', 'サイズ × ブロックのfeeMultiplier。maxFee以下で、余った分は取られない'],
        ['deadline', '送信者', '有効期限。これを過ぎると、承認されずに破棄される。最大で約6時間先まで指定でき、多くの例では2時間'],
      ]} />
      <FigFee />
      <P>176バイトの送金に、今の手数料倍率がかかった場合の金額を計算してみます。手数料はモザイクと同じく最小単位の整数で扱います。</P>
      <Code code={S4[8]} />
      <Out code={`{ averageFeeMultiplier: 100, medianFeeMultiplier: 100, highestFeeMultiplier: 100, lowestFeeMultiplier: 100, minFeeMultiplier: 100 }
手数料 = 176 バイト × 100 = 17600 （最小単位）
基軸通貨に直すと 0.0176`} />
      <Note kind="warn"><B>maxFeeがノードの最低手数料に満たないと、そのノードには伝播しません</B>。手数料が低すぎると、承認されないまま期限切れになることがあります。逆に、maxFeeを必要以上に高く設定しても、取られるのは実際の手数料だけです。</Note>

      <H>5.13 トランザクションの流れと状態の確認</H>
      <Note kind="goal">トランザクションが承認されるまでの流れと、状態をREST APIで確認する方法を説明できる。</Note>
      <P>トランザクションは、作成 → 署名 → アナウンスの順に手元で作り、ノードに送ります。あとは、ハーベスターがブロックに取り込むのを待つだけです。</P>
      <FigTxFlow />
      <FigTxState />
      <Tbl head={['状態', 'REST APIでの見え方', '意味']} rows={[
        ['未承認', '/transactions/unconfirmed（group: unconfirmed）', 'ノードに届いたが、まだブロックに入っていない'],
        ['署名待ち', '/transactions/partial（group: partial）', 'ボンデッドで、まだ必要な署名が揃っていない（第8、9、12章）'],
        ['承認済み', '/transactions/confirmed（group: confirmed）', 'ブロックに取り込まれた。巻き戻る可能性は残る'],
        ['確定', 'chain/infoの確定済みブロック高以下', 'ファイナライズされた。もう巻き戻らない'],
        ['失敗', '/transactionStatus（group: failed、codeに理由）', 'ノードが拒否した。例：Failure_Core_Insufficient_Balance'],
      ]} />
      <P>本編の環境構築で用意した <code>clog</code> が出力する「状態確認」と「承認済み確認」のURLは、この状態の違いを見るためのものです。</P>
      <H3>ノードが確認すること</H3>
      <P>第4章の4.9で見た確認が、Symbolでは次のように行われます。アナウンスされたトランザクションは、通ったものだけが取り込まれます。</P>
      <Tbl head={['確認項目', 'Symbolでは']} rows={[
        ['署名', '署名のないトランザクションは受理されない。署名の対象にジェネレーションハッシュが含まれるため、別のネットワークでは使い回せない（5.10）'],
        ['期限', 'deadline を過ぎていないこと（5.12）'],
        ['残高', '送る額と手数料（XYM）を払えること'],
        ['手数料の上限', 'maxFee がノードの最低手数料を満たしていること（5.12）'],
        ['そのほか', 'サイズや、モザイクの権限（制限など）の確認'],
      ]} />
      <P>実際の承認済みトランザクションを眺めてみましょう。最新の取引をいくつか取得し、<code>type</code>・手数料の上限・期限を表示して、先頭の取引の状態を問い合わせます。</P>
      <Code code={S4[9]} />
      <Out code={`ブロック 1234560  type 16724 (0x4154)  maxFee 17600  deadline 2026-10-17T07:12:03.000Z
ブロック 1234558  type 16705 (0x4141)  maxFee 78400  deadline 2026-10-17T06:58:41.000Z
…
hash: 4F2B…（64桁）
{ group: "confirmed", code: "Success", hash: "4F2B…", deadline: "…", height: "1234560" }`} />
      <P>見つからないハッシュを問い合わせると、ノードは<B>エラーを返します</B>。HTTPのステータスコードと、JSONのエラー内容を見てみましょう。</P>
      <Code code={S4[10]} />
      <Out code={`/transactionStatus → 404 {"code":"ResourceNotFound","message":"no resource exists with id '0000…'"}
/transactions/confirmed → 404 {"code":"ResourceNotFound","message":"no resource exists with id '0000…'"}`} />
      <Note kind="point"><B>アナウンスが受け付けられたことは、承認されたことではありません</B>。アナウンス後に状態を問い合わせて、承認済みになったことを確かめます。状態が <code>404</code> のときは、まだノードに届いていないか、期限切れなどで破棄された可能性があります。</Note>
      <Note kind="warn">高額な送金や、商品の引き渡しなど、あとで取り消せない処理は<B>確定まで待つ</B>のが安全です（4.12）。どの状態まで待つかは、用途で決めます。</Note>

      <H>5.14 SDKの位置づけ</H>
      <Note kind="goal">REST APIだけでできることと、SDKが必要なことを分けて説明できる。</Note>
      <P>この章のコードは、<code>fetch</code> だけで動きました。台帳を<B>読む</B>だけなら、REST APIで足ります。しかし、トランザクションを作って送るには、バイト列の細かい処理が必要で、これを手作業で書くのは現実的ではありません。そこで、公式の<B>Symbol SDK</B>（JavaScript版）を使います。</P>
      <FigSdkLayers />
      <Tbl head={['やりたいこと', 'REST APIだけで', 'SDKが必要']} rows={[
        ['ブロック・アカウント・モザイクを読む', 'できる', '—'],
        ['アドレスの計算（Ed25519、SHA3、RIPEMD、Base32）', '窓口がない。5.7のように自分で実装すれば、手元で計算はできる', '1回の呼び出しで済む。実際はSDKに任せる'],
        ['トランザクションのバイト列を組み立てる', '手作業では困難', '必要'],
        ['秘密鍵で署名する', 'できない（秘密鍵を送ってはいけない）', '必要'],
        ['トランザクションのハッシュを計算する', 'できない', '必要'],
        ['署名済みトランザクションを送る（アナウンス）', 'できる（PUT）', '送る中身を作るのに必要'],
      ]} />
      <P>SDKが作った署名済みトランザクションは、16進文字列にして、ノードに送ります。形はこれだけです。</P>
      <Code runnable={false} code={'PUT /transactions\nContent-Type: application/json\n\n{ "payload": "（署名済みトランザクションを16進文字列にしたもの）" }'} />
      <Note kind="warn"><B>秘密鍵は、ノードにも、REST APIにも、送ってはいけません</B>。署名は必ず手元で行い、ノードには署名の結果だけを渡します。本編では、署名とアナウンスを手元のSDKで行います（v2とv3のどちらかを選んで進めます）。</Note>
      <H3>SDKのコードを読むための文法：クラスと new</H3>
      <P>SDKの部品の多くは<B>クラス</B>です。クラスは、データ（プロパティ）と処理（メソッド）をまとめた「ひな形」で、<code>new クラス名(引数)</code> でそのひな形から実体（<B>インスタンス</B>）を作ります。ひな形そのものに属する関数は <B>static</B> メソッドといい、<code>クラス名.メソッド名()</code> で呼びます。<code>get</code> を付けたものは、関数ではなくプロパティのように読めます。</P>
      <Code code={JX.klass} />
      <Out code={OX.klass} />
      <H3>本編のコードの読み方</H3>
      <P>本編のコードには、SDKのバージョンによって2つの書き方があります。どちらも、上のクラスの読み方で説明できます。</P>
      <Tbl head={['', 'v2のコード', 'v3のコード']} rows={[
        ['作り方', 'sym.MosaicDefinitionTransaction.create( … )', 'new sdkSymbol.models.Amount(10000n)'],
        ['読み方', 'static メソッド create で作る', 'new でインスタンスを作る'],
        ['定数', 'sym.MosaicSupplyChangeAction.Increase', 'sdkSymbol.models.MosaicSupplyChangeAction.INCREASE'],
        ['数量の表し方', 'sym.UInt64.fromUint(1000000)', '1000000n（BigInt）'],
      ]} />
      <P><code>sdkSymbol.models.MosaicFlags.SUPPLY_MUTABLE.value</code> のような長い式は、<B>ドットで1つずつ区切って、左から順に読み</B>ます。<code>sdkSymbol</code>（SDKのシンボル関連の入口）→ <code>models</code>（SDKが扱うデータの種類の置き場）→ <code>MosaicFlags</code>（クラス）→ <code>SUPPLY_MUTABLE</code>（定数）→ <code>value</code>（その数値）、という具合です。どこで引っかかっても、1つずつ <code>console.log</code> で中身を確かめれば追えます。</P>
      <Note kind="point">クラス名は大文字で始まり（<code>MosaicFlags</code>）、変数や関数は小文字で始まる（<code>mosaicDefTx</code>）のが一般的な約束です。<code>new</code> を付け忘れる、あるいはクラスでないものに <code>new</code> を付けると <code>TypeError</code> になります。</Note>

      <H>5.15 確認問題</H>
      <P>コンソールで試してから、答えを確認してください。</P>
      <Q q="Symbolでトークンを作るとき、コントラクト型のブロックチェーンと何が違うか。" a="コントラクトのコードを書くのではなく、組み込みの機能（モザイク）を使います。独自のロジックはブロックチェーンの中に書けない代わりに、標準機能がそろっていて、使い方が共通です（5.2）。" />
      <Q q="メインネットとテストネットで違うものを3つ挙げよ。" a="ネットワーク識別子（104と152）、アドレスの先頭（NとT）、XYMのモザイクID（6BED…と72C0…）です。台帳もまったく別で、同じ秘密鍵でもアドレスが変わります（5.2）。" />
      <Q q="ノードの roles が 6 のとき、どの役割を持っているか。" a="6は2進で110なので、APIノード（2）と投票ノード（4）です。6 ＆ 2 と 6 ＆ 4 が0でないことで確かめられます（5.3、5.4）。" />
      <Q q="/chain/info の height は、なぜ文字列で返ってくるのか。計算するときはどうするか。" a="64ビットの値は、JavaScriptの通常の数値では正確に扱えないためです。BigInt(...) に変換して計算します（5.4）。" />
      <Q q="ブロックの timestamp から、実際の日時を求める式は。" a="epochAdjustment（秒）× 1000 ＋ timestamp が、実際の日時（ミリ秒）です。timestampは、ネットワークが始まった時点からの経過ミリ秒だからです（5.5）。" />
      <Q q="ブロックNの previousBlockHash は、どの値と一致するはずか。" a="ブロックN−1の meta.hash です。これが一致していることが、ハッシュチェーンでつながっているということです（5.6のコードで確かめられます）。" />
      <Q q="アドレスは何バイトのデータから作られるか。内訳は。" a="24バイトです。ネットワーク識別子1バイト、公開鍵のハッシュ20バイト、チェックサム3バイトで、Base32にすると39文字になります（5.7）。" />
      <Q q="公開鍵から39文字のアドレスができるまでの手順を、順に言え。" a="公開鍵をSHA3-256でハッシュし、さらにRIPEMD-160でハッシュして20バイトにします。先頭にネットワーク識別子の1バイトを付けて21バイトにし、これをSHA3-256にかけた先頭3バイトをチェックサムとして末尾に付けます（24バイト）。最後に、Base32で39文字にします（5.7）。" />
      <Q q="同じ公開鍵でも、テストネットとメインネットでアドレスが違うのは、どこが違うからか。" a="ネットワーク識別子の1バイト（0x98と0x68）です。これを含めてチェックサムを計算するので、チェックサムも変わり、先頭の文字もTとNに分かれます。公開鍵のハッシュ（20バイト）の部分は同じです（5.7）。" />
      <Q q="テストネットのアドレスが、Tで始まるのはなぜか。" a="識別子0x98は2進で10011000です。Base32は5ビットずつ読むので、最初の5ビット 10011（19）が、文字表の19番目のTになります。メインネットの0x68は 01101（13）で、Nです（5.7、2.7）。" />
      <Q q="アドレスを1文字打ち間違えたとき、どうやって気づけるか。また、気づけないのはどんなときか。" a="Base32で24バイトに戻し、先頭21バイトからチェックサムを計算し直して、末尾の3バイトと比べます。一致しなければ無効なアドレスです。ただし、別の人の正しいアドレスを入力した場合は、チェックを通ってしまいます（5.7）。" />
      <Q q="可分性が6のモザイクで、12.345678 を最小単位の整数で書くと。" a="12345678 です。10の6乗（1000000）を掛けた値です。表示するときは、逆に1000000で割ります（5.8）。" />
      <Q q="176バイトの送金で、手数料の倍率が100のとき、手数料はいくらか。" a="176 × 100 ＝ 17600（最小単位）で、基軸通貨に直すと 0.0176 です（5.12）。実際の倍率はノードに問い合わせて確かめます。" />
      <Q q="署名にジェネレーションハッシュが含まれているのは、なぜか。" a="テストネットで作った署名付きトランザクションを、メインネットなど別のネットワークで使い回せないようにするためです（5.10）。" />
      <Q q="アナウンスした直後に /transactionStatus が404を返した。何が考えられるか。" a="まだノードに届いていない、アナウンスに失敗した、期限切れなどで破棄された、のいずれかです。アナウンスの成功は承認を意味しないので、状態を何度か問い合わせて確かめます（5.13）。" />

      <H3>この章のまとめ</H3>
      <Ul items={[
        'Symbolは、アカウント・モザイク・ネームスペース・トランザクションを最初から組み込んだパブリックブロックチェーン。独自のロジックを書くのではなく、標準機能を組み合わせて使う',
        'メインネットとテストネットは別のネットワーク。識別子・アドレスの先頭・XYMのIDが違い、同じ秘密鍵でもアドレスが変わる',
        '台帳はノードが持ち、アプリはAPIノードのREST APIで読む。ノードの役割は1・2・4のビットフラグ。64ビットの値は文字列で返るので、BigIntで扱う',
        'ブロックの timestamp はネットワーク開始からのミリ秒。epochAdjustment を足すと実際の日時になる。次のブロックの previousBlockHash は、前のブロックの meta.hash と一致する',
        'アドレスは、公開鍵をSHA3-256とRIPEMD-160でハッシュした20バイトに、識別子1バイトとチェックサム3バイトを付けた24バイトを、Base32にした39文字。第2〜3章の道具だけで、秘密鍵からアドレスまで計算できる。REST APIはアドレスを48桁の16進で返す',
        '署名と公開鍵はEd25519（SHA-512を使う標準の方式）、ブロックやトランザクションのハッシュはSHA3-256。Keccak-256とは別物',
        'モザイクの数量は最小単位の整数で、表示時に可分性で割る。ネームスペースはアドレスやモザイクに付ける別名',
        'トランザクションは、共通ヘッダー（128バイト）＋種類ごとの本体のバイト列。手数料はサイズ × 倍率で、maxFeeは上限、deadlineを過ぎると破棄される',
        '読むだけならREST APIで足りる。署名やバイト列の組み立てにはSDKを使い（アドレスの計算も、実際はSDKに任せる）、秘密鍵はノードに送らない',
      ]} />

      <H>5.16 用語集</H>
      <Tbl head={['用語', '意味']} rows={[
        ['メインネット／テストネット', '本番のネットワーク／学習・開発用のネットワーク'],
        ['REST API', 'ノードが公開する、HTTPで呼ぶ窓口。読み取りはGET、アナウンスはPUT'],
        ['APIノード／ピアノード／投票ノード', 'REST APIを公開／ブロックを中継／ファイナライズに投票するノード'],
        ['ブロック高', 'ブロックが何番目か'],
        ['epochAdjustment', 'ネットワークの開始時刻（Unix時刻の秒）。timestampに足して実際の日時にする'],
        ['ハーベスト／ハーベスター', 'Symbolで、次のブロックを作る作業（PoS+）／その作業をする人'],
        ['ファイナライズ', '投票ノードの投票で、ブロックを確定させ、巻き戻らなくすること'],
        ['XYM', 'Symbolの基軸通貨（モザイクの1つ）。手数料や報酬に使う'],
        ['アカウント', '秘密鍵・公開鍵のペア。台帳上の持ち主'],
        ['アドレス', '公開鍵から計算する39文字の文字列（T始まりはテストネット、N始まりはメインネット）'],
         ['ネットワーク識別子', 'アドレスの先頭1バイト。メインネットは0x68（104）、テストネットは0x98（152）'],
         ['チェックサム', 'アドレスの末尾3バイト。識別子とハッシュから計算し直して、入力ミスを見つける検算用の値'],
         ['SHA3-256／RIPEMD-160', 'アドレスなどに使うハッシュ関数。出力は32バイト／20バイト。Keccak-256とは別物'],
         ['Base32', 'バイト列を5ビットずつ区切って、32種類の文字で書く方式。アドレスの表記に使う'],
        ['モザイク', 'Symbolのトークン。XYMもその1つ'],
        ['可分性（divisibility）', 'モザイクの小数点以下の桁数'],
        ['ネームスペース／エイリアス', '人が読める名前／名前をアドレスやモザイクに結びつけること'],
        ['トランザクション', '台帳を変更する要求の単位。共通ヘッダーと本体のバイト列'],
        ['アグリゲートトランザクション', '複数のトランザクションを1つにまとめたもの（complete／bonded）'],
        ['maxFee／feeMultiplier', '払ってもよい手数料の上限／ブロックに適用される倍率'],
        ['deadline', 'トランザクションの有効期限。過ぎると破棄される'],
        ['アナウンス', '署名済みトランザクションをノードに送ること'],
        ['Symbol SDK', '署名やアドレスの計算など、バイト列の細かい処理を担うライブラリ'],
      ]} />

      <H>5.17 次のステップ</H>
      <P>ここまでで、JavaScript・データの表現・暗号・ブロックチェーンの土台と、Symbolの概念が一通りそろいました。次は<B>本編（速習Symbol）</B>で、環境構築からアカウント・トランザクション・モザイクへ進んでください。本編でつまずいたとき、この講座のどこに戻ればよいかは、次の表を目安にしてください。</P>
      <Tbl head={['本編の章', 'この講座の関連する節']} rows={[
        ['第2章 環境構築', '1.11・1.12（then と await でSDKを読み込む）、1.14（失敗の確認）、5.14（SDKの位置づけ）'],
        ['第3章 アカウント', '1.7（戻り値から値を取り出す）、2.5（鍵・アドレスのバイト列）、2.7（Base32）、3.13（鍵と署名）、5.7（アドレスの導出）'],
        ['第4章 トランザクション', '1.11〜1.13（アナウンスと承認の待機）、1.14（失敗の受け止め）、2.5・2.6（ペイロード）、5.13（状態の確認）'],
        ['第5章 モザイク', '2.3（数量のBigInt、可分性）、2.4（フラグ）、5.14（クラス・定数の読み方）'],
        ['第10章 監視', '1.10〜1.12（コールバック、非同期、待ち続ける処理）'],
        ['第13章 検証', '2.3（BigInt）、3.10（ハッシュ）、4.7（マークルツリー）'],
      ]} />
      <Note kind="point">本編でコードが動かないときは、まず1.15の表で、エラーの名前とメッセージを確認してください。それでも原因が分からないときは、<B>1行ずつ <code>console.log</code> で値を確かめる</B>のが近道です。</Note>
      <Note kind="point">Symbolの前身であるNEMに興味があるときは、<B>入門講座の第6章（任意）</B>で、SymbolとNEMの違いを、手を動かして確かめられます。読まなくても、本編は進められます。</Note>
    </>
  );
}

// ───────── 第6章 NEMブロックチェーン（発展・任意） ─────────
// 第6章のコード例。手元のブラウザの中だけで計算する（ノードへの問い合わせも、SDKも使わない）。
// S6[2]・S6[3] は、S6[1]（ハッシュの部品）を先に実行しておく必要がある（未実行ならメッセージを出して止まる）。
const S6: string[] = [
// 0: 6.4 ベスティング（未ベスト→ベスト済み）の計算
`let vested = 0, unvested = 20000;      // 20,000 XEM を受け取った直後（すべて未ベスト）
for (let day = 1; day <= 10; day++) {
  const move = unvested / 10;           // 1440ブロック（約1日）ごとに、未ベスト分の 1/10 が、ベスト済みになる
  vested += move; unvested -= move;
  console.log("day " + String(day).padStart(2, " ") + "：ベスト済み " + Math.round(vested).toString().padStart(6, " ") + " XEM" + (vested >= 10000 ? "  ← 10,000以上（ハーベストできる）" : ""));
}`,
// 1: 6.5 ハッシュの部品（Keccak-256、RIPEMD-160）
`// NEM が使う Keccak-256 と、RIPEMD-160 の小さな実装（5.7の SHA3-256 と、区切りのバイトだけが違う）
const keccak256 = (data, pad = 0x01) => {   // pad が 0x01 なら Keccak-256（NEMが使う）、0x06 なら SHA3-256（Symbolが使う）
  const rate = 136, outLen = 32;                 // 1ブロック136バイト、出力32バイト（SHA3-256と同じ）
  const M = (1n << 64n) - 1n;
  const rotl = (x, n) => ((x << BigInt(n)) | (x >> BigInt(64 - n))) & M;
  const RC = [];
  for (let t = 0, r = 1; t < 24; t++) {
    let c = 0n;
    for (let j = 0; j < 7; j++) { if (r & 1) c |= 1n << BigInt((1 << j) - 1); r = (r << 1) ^ (r & 0x80 ? 0x171 : 0); }
    RC.push(c);
  }
  const s = Array(25).fill(0n);
  const round = () => {
    for (let t = 0; t < 24; t++) {
      const C = [0, 1, 2, 3, 4].map((x) => s[x] ^ s[x + 5] ^ s[x + 10] ^ s[x + 15] ^ s[x + 20]);
      for (let x = 0; x < 5; x++) { const D = C[(x + 4) % 5] ^ rotl(C[(x + 1) % 5], 1); for (let y = 0; y < 25; y += 5) s[y + x] ^= D; }
      let x = 1, y = 0, cur = s[1];
      for (let i = 0; i < 24; i++) {
        const nx = y, ny = (2 * x + 3 * y) % 5, tmp = s[nx + 5 * ny];
        s[nx + 5 * ny] = rotl(cur, ((i + 1) * (i + 2) / 2) % 64); cur = tmp; x = nx; y = ny;
      }
      for (let y2 = 0; y2 < 25; y2 += 5) { const row = s.slice(y2, y2 + 5); for (let x2 = 0; x2 < 5; x2++) s[y2 + x2] = row[x2] ^ (~row[(x2 + 1) % 5] & M & row[(x2 + 2) % 5]); }
      s[0] ^= RC[t];
    }
  };
  const q = Array.from(data);
  q.push(pad);                                    // 区切りのバイト（Keccakは0x01、SHA3は0x06）
  while (q.length % rate) q.push(0);
  q[q.length - 1] |= 0x80;
  for (let o = 0; o < q.length; o += rate) {
    for (let i = 0; i < rate / 8; i++) { let lane = 0n; for (let b = 7; b >= 0; b--) lane = (lane << 8n) | BigInt(q[o + i * 8 + b]); s[i] ^= lane; }
    round();
  }
  const out = [];
  for (let i = 0; out.length < outLen; i++) for (let b = 0; b < 8; b++) out.push(Number((s[i] >> BigInt(8 * b)) & 255n));
  return Uint8Array.from(out.slice(0, outLen));
};
const ripemd160 = (data) => {
  const R1 = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,7,4,13,1,10,6,15,3,12,0,9,5,2,14,11,8,3,10,14,4,9,15,8,1,2,7,0,6,13,11,5,12,1,9,11,10,0,8,12,4,13,3,7,15,14,5,6,2,4,0,5,9,7,12,2,10,14,1,3,8,11,6,15,13];
  const R2 = [5,14,7,0,9,2,11,4,13,6,15,8,1,10,3,12,6,11,3,7,0,13,5,10,14,15,8,12,4,9,1,2,15,5,1,3,7,14,6,9,11,8,12,2,10,0,4,13,8,6,4,1,3,11,15,0,5,12,2,13,9,7,10,14,12,15,10,4,1,5,8,7,6,2,13,14,0,3,9,11];
  const S1 = [11,14,15,12,5,8,7,9,11,13,14,15,6,7,9,8,7,6,8,13,11,9,7,15,7,12,15,9,11,7,13,12,11,13,6,7,14,9,13,15,14,8,13,6,5,12,7,5,11,12,14,15,14,15,9,8,9,14,5,6,8,6,5,12,9,15,5,11,6,8,13,12,5,12,13,14,11,8,5,6];
  const S2 = [8,9,9,11,13,15,15,5,7,7,8,11,14,14,12,6,9,13,15,7,12,8,9,11,7,7,12,7,6,15,13,11,9,7,15,11,8,6,6,14,12,13,5,14,13,13,7,5,15,5,8,11,14,14,6,14,6,9,12,9,12,5,15,8,8,5,12,9,12,5,14,6,8,13,6,5,15,13,11,11];
  const K1 = [0x00000000, 0x5A827999, 0x6ED9EBA1, 0x8F1BBCDC, 0xA953FD4E];
  const K2 = [0x50A28BE6, 0x5C4DD124, 0x6D703EF3, 0x7A6D76E9, 0x00000000];
  const F = (j, x, y, z) => (j < 16 ? x ^ y ^ z : j < 32 ? (x & y) | (~x & z) : j < 48 ? (x | ~y) ^ z : j < 64 ? (x & z) | (y & ~z) : x ^ (y | ~z));
  const rol = (x, n) => ((x << n) | (x >>> (32 - n))) >>> 0;
  const q = Array.from(data);
  q.push(0x80);
  while (q.length % 64 !== 56) q.push(0);
  const bitLen = BigInt(data.length) * 8n;
  for (let i = 0; i < 8; i++) q.push(Number((bitLen >> BigInt(8 * i)) & 255n));   // 長さはリトルエンディアン
  let h = [0x67452301, 0xEFCDAB89, 0x98BADCFE, 0x10325476, 0xC3D2E1F0];
  for (let o = 0; o < q.length; o += 64) {
    const X = Array.from({ length: 16 }, (_, i) => (q[o + 4 * i] | (q[o + 4 * i + 1] << 8) | (q[o + 4 * i + 2] << 16) | (q[o + 4 * i + 3] << 24)) >>> 0);
    let [a1, b1, c1, d1, e1] = h, [a2, b2, c2, d2, e2] = h;
    for (let j = 0; j < 80; j++) {
      const k = Math.floor(j / 16);
      let t = (rol((a1 + F(j, b1, c1, d1) + X[R1[j]] + K1[k]) >>> 0, S1[j]) + e1) >>> 0;
      a1 = e1; e1 = d1; d1 = rol(c1, 10); c1 = b1; b1 = t;
      t = (rol((a2 + F(79 - j, b2, c2, d2) + X[R2[j]] + K2[k]) >>> 0, S2[j]) + e2) >>> 0;
      a2 = e2; e2 = d2; d2 = rol(c2, 10); c2 = b2; b2 = t;
    }
    h = [(h[1] + c1 + d2) >>> 0, (h[2] + d1 + e2) >>> 0, (h[3] + e1 + a2) >>> 0, (h[4] + a1 + b2) >>> 0, (h[0] + b1 + c2) >>> 0];
  }
  const out = new Uint8Array(20);
  h.forEach((v, i) => { for (let b = 0; b < 4; b++) out[4 * i + b] = (v >>> (8 * b)) & 255; });
  return out;
};
const hex = (u8) => Array.from(u8, (b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
const utf8 = (s) => new TextEncoder().encode(s);
console.log("Keccak-256(空文字):", hex(keccak256(utf8(""))));
console.log("SHA3-256(空文字)  :", hex(keccak256(utf8(""), 0x06)));   // 区切りのバイトだけを 0x06 に変えると、SHA3-256になる
console.log("Keccak-256(abc)   :", hex(keccak256(utf8("abc"))));
console.log("RIPEMD-160(abc)   :", hex(ripemd160(utf8("abc"))));`,
// 2: 6.5 公開鍵からNEMのアドレス（Keccak-256、RIPEMD-160、チェックサム4バイト、Base32）
`if (typeof keccak256 === "undefined") { console.log("先に、上の「ハッシュの部品」のコードを実行してください"); return; }
const hex = (u8) => Array.from(u8, (b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
const fromHex = (s) => Uint8Array.from(s.match(/../g).map((h) => parseInt(h, 16)));
const A32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const b32enc = (u8) => {
  let bits = "", out = "";
  for (const x of u8) bits += x.toString(2).padStart(8, "0");
  for (let i = 0; i < bits.length; i += 5) out += A32[parseInt(bits.slice(i, i + 5).padEnd(5, "0"), 2)];
  return out;
};
const nemAddress = (pub, netByte) => {
  const hash20 = ripemd160(keccak256(pub));                  // ① Keccak-256 → ② RIPEMD-160（20バイト）
  const body = new Uint8Array(21);
  body[0] = netByte; body.set(hash20, 1);                    // ③ 先頭にネットワーク識別子（21バイト）
  const check = keccak256(body).slice(0, 4);                 // ④ 21バイトをKeccak-256にかけた先頭4バイトが、チェックサム
  const raw = new Uint8Array(25);
  raw.set(body); raw.set(check, 21);                         //    識別子1 ＋ ハッシュ20 ＋ チェックサム4 ＝ 25バイト
  return { hash20, check, raw, text: b32enc(raw) };          // ⑤ Base32で40文字にする
};
const pub = fromHex("C5247738C3A510FB6C11413331D8A47764F6E78FFCDB02B6878D5DD3B77F38ED");   // NEMの技術資料にある、例の公開鍵
const r = nemAddress(pub, 0x68);                             // 0x68 はメインネット
console.log("ハッシュ(20バイト)    :", hex(r.hash20));
console.log("チェックサム(4バイト) :", hex(r.check));
console.log("25バイト              :", hex(r.raw));
console.log("アドレス              :", r.text, "（" + r.text.length + "文字）");
console.log("資料の答えと一致      :", r.text === "NAPRILC6USCTAY7NNXB4COVKQJL427NPCEERGKS6");
const t = nemAddress(pub, 0x98);                             // 0x98 はテストネット
console.log("テストネット          :", t.text, "（先頭は " + t.text[0] + "）");`,
// 3: 6.5 NEMのアドレスの検証
`if (typeof keccak256 === "undefined") { console.log("先に、「ハッシュの部品」のコードを実行してください"); return; }
const hex = (u8) => Array.from(u8, (b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
const A32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const b32dec = (s) => {
  let bits = "";
  for (const ch of s) bits += A32.indexOf(ch).toString(2).padStart(5, "0");
  const out = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) out.push(parseInt(bits.slice(i, i + 8), 2));
  return Uint8Array.from(out);
};
const checkNem = (text) => {
  if (!/^[A-Z2-7]{40}$/.test(text)) return "形式が違います（A–Zと2–7の40文字）";
  const raw = b32dec(text);                                  // 25バイトに戻す
  const expected = keccak256(raw.slice(0, 21)).slice(0, 4);  // 先頭21バイトから、チェックサムを計算し直す
  return hex(expected) === hex(raw.slice(21)) ? "OK（識別子 0x" + raw[0].toString(16) + "）" : "チェックサムが合いません";
};
const good = "NAPRILC6USCTAY7NNXB4COVKQJL427NPCEERGKS6";
const typo = good.slice(0, 10) + "A" + good.slice(11);        // 11文字目を、1文字だけ変える
console.log(good, "→", checkNem(good));
console.log(typo, "→", checkNem(typo));
console.log("Symbolの39文字 →", checkNem("TB6QOVCUOFRCF5QJSKPIQMLUVWGJS3KYFDETRPA"));`,
];

function Nem6() {
  return (
    <>
      <H>6.1 この章の進め方</H>
      <Note kind="goal">NEMがどんなブロックチェーンかを、Symbolと見比べながら説明できる。ハーベスト（PoI）、アドレスの計算、ネームスペースとモザイク、マルチシグの4つについて、NEMとSymbolの違いを言える。</Note>
      <Note kind="point">この章は、Symbolの前身であるNEMを知るための<B>発展の章（任意）</B>です。第5章まででSymbolの土台は一通りそろっているので、<B>飛ばしても、本編はそのまま進められます</B>。「SymbolはNEMのどこを引き継ぎ、どこを変えたのか」に興味が出たとき、あるいは本編の付録（第14章）でNEMを操作する前に、読んでください。</Note>
      <P>第5章では、Symbolをそれ単体で見ました。この章では、その前身である<B>NEM</B>を、Symbolと見比べながら見ていきます。第2〜4章で学んだ道具（バイト列、Base32、ハッシュ、署名、PoS）が、別のブロックチェーンでも同じように使えることを確かめる機会にもなります。</P>
      <Tbl head={['学ぶこと', '確かめること']} rows={[
        ['NEMとは（6.2）', 'いつ、どんなブロックチェーンとして始まったか。Symbolとの関係'],
        ['NEMとSymbolの違い（6.3）', '設計・数値・仕組みの早見表。手数料の決まり方'],
        ['ハーベストとPoI（6.4）', '「重要度」でブロックを作る人が決まる仕組み。ベスティングの計算を動かして確かめる'],
        ['アカウントとアドレス（6.5）', 'Keccak-256を使った40文字のアドレス。公開鍵から計算して、NEMの技術資料の例と一致させる'],
        ['ネームスペースとモザイク（6.6）', 'モザイクを「名前」で識別する'],
        ['マルチシグ（6.7）', '連署が、別のトランザクションになる仕組み'],
        ['Symbolへの進化（6.8）', '何を引き継ぎ、何を変えたのか'],
      ]} />
      <Note kind="warn">この章のコードは、手元のブラウザの中だけで計算します。ノードには問い合わせず、SDKも使いません。NEMの技術資料にある例の値（公開鍵とアドレス）と、計算結果が一致することを確かめます。</Note>

      <H>6.2 NEMとは</H>
      <Note kind="goal">NEMがいつ始まり、Symbolとどんな関係にあるかを説明できる。</Note>
      <P>NEMは、<B>2015年3月</B>に始まったパブリックブロックチェーンです。基軸通貨は<B>XEM</B>で、総量は8,999,999,999 XEMです。この総量は、最初のブロック（<B>ネメシスブロック</B>）で<B>すべて発行</B>されていて、あとから増えることはありません。ブロックを作った人（ハーベスター）に渡されるのは、新しく発行された通貨ではなく、そのブロックに入っているトランザクションの<B>手数料</B>です。</P>
      <P>NEMのノードのソフトは<B>NIS</B>（NEM Infrastructure Server）です。Symbolと区別するために、このネットワークを「NEM1」や「NIS1」と呼ぶことがあります。</P>
      <H3>Symbolとの関係</H3>
      <P>Symbolは、NEMの後継として2021年3月にメインネットが始まりました（5.2）。NEMを書き換えたものではなく、<B>別のネットワーク</B>として動いています。そのため、台帳もアドレスも別で、NEMのXEMとSymbolのXYMは、別の通貨です。ただし、Symbolの開始にあたって、事前に申請したXEMの保有者には、保有量と同じ量のXYMが配られました。</P>
      <FigNemRelation />
      <P>設計の考え方にも、つながりがあります。NEMも、コントラクトのコードを書くのではなく、<B>アカウント・モザイク・ネームスペース・マルチシグ</B>などの組み込みの機能を組み合わせて使う設計でした。5.2で見た「機能が最初から組み込まれている」というSymbolの設計は、この考え方を引き継いでいます。</P>
      <Note kind="point">NEMでは、<B>NEM</B>（ブロックチェーンの名前）、<B>XEM</B>（通貨の単位）、<B>NIS</B>（ノードのソフト）の3つが、別々の言葉です。Symbolの<B>Symbol</B>、<B>XYM</B>、Symbolのノードのソフトに、それぞれ対応します。</Note>

      <H>6.3 NEMとSymbolの違い</H>
      <Note kind="goal">NEMとSymbolの主な違いを、表を見ながら説明できる。</Note>
      <P>まず、全体の早見表です。詳しいことは、右の節で扱います。</P>
      <Tbl head={['項目', 'NEM（NEM1）', 'Symbol', 'この章の節']} rows={[
        ['開始', '2015年3月', '2021年3月', '6.2'],
        ['基軸通貨', 'XEM（総量の全部を、最初のブロックで発行）', 'XYM', '6.2'],
        ['ブロックの間隔', '約60秒', '約30秒', '6.4'],
        ['合意形成', 'PoI（Proof of Importance）', 'PoS+（5.2）', '6.4'],
        ['ブロックの確定', 'ファイナリティはない。深く積まれるほど覆りにくい（巻き戻しの上限は360ブロック）', '投票ノードによるファイナライズ（5.2）', '6.8'],
        ['署名', 'Ed25519の派生版（内部のハッシュはKeccak-512）', '標準のEd25519（SHA-512。5.7）', '6.5'],
        ['ハッシュ', 'Keccak-256', 'SHA3-256', '6.5'],
        ['アドレス', '25バイト → Base32で40文字（チェックサムは4バイト）', '24バイト → Base32で39文字（チェックサムは3バイト）', '6.5'],
        ['ネットワーク識別子', 'メインネット0x68（N）、テストネット0x98（T）', '同じ（0x68と0x98）', '6.5'],
        ['モザイクの識別', 'ネームスペース名：モザイク名（例：nem:xem）', '64ビットのモザイクID', '6.6'],
        ['複数人の承認', 'マルチシグ。連署は別のトランザクション', 'アグリゲートトランザクションに、署名を集める（5.11）', '6.7'],
        ['手数料', '送金額とメッセージの長さで決まる', 'トランザクションのサイズ × 倍率（5.12）', '6.3（下記）'],
        ['ノードのAPI', 'NIS独自のAPI', 'REST API（5.3）', '6.8'],
      ]} />
      <Note kind="warn">ここにある数値や決まりは、ネットワークのバージョンアップで変わることがあります。実際に使うときは、公式の最新のドキュメントで確認してください。</Note>
      <H3>手数料の決まり方の違い</H3>
      <P>Symbolの手数料は、5.12で見たとおり、<B>トランザクションのバイト数 × 倍率</B>です。送る金額が大きくても、手数料は変わりません。NEMは、次の2つを足した値が、おおよその手数料になります。</P>
      <Ul items={[
        '送金額の部分：1万 XEM ごとに 0.05 XEM（最低 0.05 XEM、最高 1.25 XEM）',
        'メッセージの部分：（メッセージのバイト数 ÷ 32 の切り捨て ＋ 1）× 0.05 XEM（メッセージを付けたときだけ）',
      ]} />
      <P>たとえば、100 XEM に 11バイトのメッセージを付けて送ると、送金額の部分が0.05 XEM、メッセージの部分が0.05 XEM で、合計 <B>0.1 XEM</B> です。NEMの手数料は、<B>送る金額に応じて増える</B>（上限あり）のが、Symbolとの大きな違いです。</P>
      <FigNemFee />

      <H>6.4 ハーベストとPoI</H>
      <Note kind="goal">PoI（Proof of Importance）とベスティングの仕組みを説明し、ハーベストできるようになるまでの日数を計算できる。</Note>
      <P>4.10で、「次のブロックを作る人」を、保有量で選ぶPoSを見ました。NEMの<B>PoI</B>（重要度による合意形成）は、PoSに似ていますが、<B>保有量だけでは決めない</B>のが特徴です。NEMでも、ブロックを作る作業を<B>ハーベスト</B>と呼び、ブロックを作った人に、そのブロックの手数料が入ります（ここはSymbolと同じです）。</P>
      <H3>重要度は、何から決まるか</H3>
      <P>アカウントごとに<B>重要度</B>（importance）という数値があり、重要度が高いほど、次のブロックを作る人に選ばれやすくなります。材料は、おもに次の3つです。</P>
      <Ul items={[
        'ベスト済みの保有量：保有しているXEMのうち、「ベスト済み」になった分（次の項で説明します）',
        '他のアカウントとのXEMのやり取り：直近の約30日間の、1,000 XEM以上の送金（出ていった分から、入ってきた分を差し引いた流れ）',
        '取引のつながり方：取引の網（グラフ）の中での重要さを測る計算（NCDawareRank。検索エンジンのPageRankに近い考え方）',
      ]} />
      <P>XEMを持っているだけでなく、<B>実際に使っている</B>アカウントを重く見る、というのがねらいです。また、同じ金額を輪になって回しても、差し引きでゼロになるので、重要度は上がりません。</P>
      <FigNemImportance />
      <H3>ベスティング（既得バランスの積み上げ）：受け取ったXEMは、すぐには「ベスト済み」にならない</H3>
      <P>NEMのXEMの残高は、<B>ベスト済み</B>（vested。既得バランス）と<B>未ベスト</B>に分かれます。XEMを受け取ると、最初は未ベストに入ります。そして、<B>1440ブロック（約1日）ごとに、未ベスト分の10分の1</B>が、ベスト済みに移ります。送金するときは、ベスト済みと未ベストの両方から、比率を保つように減ります。</P>
      <Note kind="point">ハーベストできる（重要度の計算の対象になる）のは、<B>ベスト済みが10,000 XEM以上</B>のアカウントです。大量のXEMを買ってすぐ攻撃する、ということができないように、時間をかけて「ベスト済み」にする仕組みです。</Note>
      <P>20,000 XEM を受け取ったアカウントで、ベスト済みが日ごとにどう増えるかを、計算してみます。</P>
      <Code code={S6[0]} />
      <Out code={`day  1：ベスト済み   2000 XEM
day  2：ベスト済み   3800 XEM
day  3：ベスト済み   5420 XEM
day  4：ベスト済み   6878 XEM
day  5：ベスト済み   8190 XEM
day  6：ベスト済み   9371 XEM
day  7：ベスト済み  10434 XEM  ← 10,000以上（ハーベストできる）
day  8：ベスト済み  11391 XEM  ← 10,000以上（ハーベストできる）
day  9：ベスト済み  12252 XEM  ← 10,000以上（ハーベストできる）
day 10：ベスト済み  13026 XEM  ← 10,000以上（ハーベストできる）`} />
      <P>20,000 XEM を受け取っても、ベスト済みが10,000 XEMを超えるのは<B>7日目</B>です。増え方は、日ごとに少しずつ鈍くなります（残りの未ベストが減るため）。なお、このコードは、端数の丸めや、途中の送金による変化を無視した<B>簡単な計算</B>です。</P>
      <FigNemVesting />
      <H3>代理ハーベスト（デリゲートハーベスティング）</H3>
      <P>ハーベストは、ノードを動かし続けて行います。このとき、大きな残高を持つアカウントの秘密鍵を、サーバーに置くのは危険です。そこでNEMには、<B>重要度転送トランザクション</B>で、ハーベストする力を別のアカウントに貸す<B>代理ハーベスト</B>（delegated harvesting。デリゲートハーベスティング）があります。貸した側のアカウントの重要度で、貸された側のアカウントがハーベストするので、大事な秘密鍵はサーバーに置かずに済みます。有効になるまでには、360ブロック（約6時間）かかります。</P>
      <FigNemDelegate />
      <Note kind="point">Symbolは、PoIではなく<B>PoS+</B>（保有量に加えて、ネットワークでの活動も重みに含める方式。5.2）になりました。「保有量だけで決めない」というねらいは、形を変えて引き継がれています。</Note>

      <H>6.5 アカウントとアドレス</H>
      <Note kind="goal">NEMのアドレスを、公開鍵から自分で計算し、Symbolとの違い（Keccak-256、4バイトのチェックサム、40文字）を説明できる。</Note>
      <P>NEMのアカウントも、Symbolと同じく、Ed25519の秘密鍵と公開鍵のペアで、アドレスは公開鍵から計算します（5.7）。違うのは、<B>部品の選び方</B>です。</P>
      <Tbl head={['手順', 'NEM', 'Symbol（5.7）']} rows={[
        ['① 公開鍵をハッシュにする', 'Keccak-256（32バイト）', 'SHA3-256（32バイト）'],
        ['② 短くする', 'RIPEMD-160（20バイト）', 'RIPEMD-160（20バイト）'],
        ['③ 識別子を付ける', '先頭に、0x68（メインネット）か0x98（テストネット）の1バイト（21バイト）', '同じ（21バイト）'],
        ['④ チェックサムを付ける', '③をKeccak-256にかけた先頭4バイトを、末尾に付ける（25バイト）', '③をSHA3-256にかけた先頭3バイトを、末尾に付ける（24バイト）'],
        ['⑤ Base32で書く', '40文字', '39文字'],
      ]} />
      <P>Base32は5ビットずつ読むので、25バイト（200ビット）なら<B>ちょうど40文字</B>、24バイト（192ビット）なら、あまりを0で埋めて<B>39文字</B>になります。文字数が違うのは、チェックサムの長さが1バイト違うからです。</P>
      <FigNemAddress />
      <Note kind="point">識別子の値は、NEMとSymbolで<B>同じ</B>です。Base32は最初の5ビットが最初の文字になるので、0x68は「N」、0x98は「T」と、先頭の文字もSymbolと同じになります（5.7）。見分けるには、文字数（40か39か）を見ます。</Note>
      <H3>ステップ1：ハッシュ関数を用意する</H3>
      <P>5.7と同じく、ブラウザ標準の <code>crypto.subtle</code> には、Keccak-256もRIPEMD-160もありません。小さな実装を用意します。5.7の <code>sha3_256</code> と<B>ほとんど同じ</B>で、違うのは、計算の最後の「区切りのバイト」だけです。区切りを0x01にするとKeccak-256（NEM）、0x06にするとSHA3-256（Symbol）になります。コードの中身は読まなくて構いません。実行して、出力が下の出力例と一致することを確かめてください。</P>
      <Code code={S6[1]} />
      <Out code={`Keccak-256(空文字): C5D2460186F7233C927E7DB2DCC703C0E500B653CA82273B7BFAD8045D85A470
SHA3-256(空文字)  : A7FFC6F8BF1ED76651C14756A061D662F580FF4DE43B49FA82D80A4B80F8434A
Keccak-256(abc)   : 4E03657AEA45A94FC7D47BA826C8D667C0D1E6E33A64A036EC44F58FA12D6C45
RIPEMD-160(abc)   : 8EB208F7E05D987A9B044A8E98C6B087F15A0BFC`} />
      <P>1行目と2行目は、<B>同じ空文字</B>を、区切りのバイトだけ変えて計算した結果です。たった1バイトの違いで、出力がまったく変わります（3.10で見た、ハッシュの性質です）。</P>
      <H3>ステップ2：公開鍵からアドレスを作る</H3>
      <P>NEMの技術資料にある、例の公開鍵から、アドレスを計算します。5.7のSymbolと同じ手順で、部品が違うだけです。なお、この章は<B>公開鍵から</B>始めます。秘密鍵から公開鍵を作るEd25519の計算は、NEMでは内部のハッシュがKeccak-512なので、5.7（SHA-512）のコードは、そのままでは使えないからです。</P>
      <Code code={S6[2]} />
      <Out code={`ハッシュ(20バイト)    : 1F142C5EA4853063ED6DC3C13AAA8257CD7DAF11
チェックサム(4バイト) : 09132A5E
25バイト              : 681F142C5EA4853063ED6DC3C13AAA8257CD7DAF1109132A5E
アドレス              : NAPRILC6USCTAY7NNXB4COVKQJL427NPCEERGKS6 （40文字）
資料の答えと一致      : true
テストネット          : TAPRILC6USCTAY7NNXB4COVKQJL427NPCH2WV37Z （先頭は T）`} />
      <P>「資料の答えと一致：true」と出れば、計算が正しいということです。同じ公開鍵でも、識別子を0x98にすると、先頭が「T」になり、チェックサムも変わるので、末尾も変わります（5.7のSymbolと同じ性質です）。</P>
      <Note kind="warn">同じ秘密鍵から作っても、NEMとSymbolでは、<B>公開鍵もアドレスも別物</B>になります。署名の内部で使うハッシュ関数（Keccak-512とSHA-512）が違うからです。本編の14.3で、実際に確かめられます。また、同じ秘密鍵をSymbolとNEMで使い回すことは、おすすめしません。</Note>
      <H3>ステップ3：アドレスを検証する</H3>
      <P>5.7と同じく、アドレスを25バイトに戻し、先頭21バイトからチェックサムを計算し直して、末尾の4バイトと比べます。</P>
      <Code code={S6[3]} />
      <Out code={`NAPRILC6USCTAY7NNXB4COVKQJL427NPCEERGKS6 → OK（識別子 0x68）
NAPRILC6USATAY7NNXB4COVKQJL427NPCEERGKS6 → チェックサムが合いません
Symbolの39文字 → 形式が違います（A–Zと2–7の40文字）`} />
      <P>1文字だけ変えたアドレス（2行目）は、チェックサムが合わず、弾かれます。3行目のように、Symbolの39文字のアドレスは、文字数の時点でNEMのアドレスではないと分かります。</P>

      <H>6.6 ネームスペースとモザイク</H>
      <Note kind="goal">NEMでモザイクを識別する方法と、Symbolとの違いを説明できる。</Note>
      <P>NEMにも、ネームスペースとモザイクがあります（Symbolの5.8、5.9）。違いは、モザイクの<B>識別のしかた</B>です。</P>
      <Tbl head={['項目', 'NEM', 'Symbol']} rows={[
        ['モザイクの識別', 'ネームスペース名：モザイク名（例：nem:xem）', '64ビットのモザイクID（数値）'],
        ['ネームスペースとの関係', 'モザイクは、ネームスペースに属する。先にネームスペースを取得し、その中にモザイクを定義する', 'モザイクとネームスペースは、別のもの。ネームスペースは、あとから別名（エイリアス）として結びつける（5.9）'],
        ['基軸通貨', 'XEMも、ネームスペース nem の中のモザイク xem（nem:xem）', 'XYMも、モザイクの1つ（5.8）'],
        ['数量の表し方', '最小単位の整数。XEMは可分性6で、1 XEM ＝ 1,000,000 μXEM', '最小単位の整数。可分性で割って表示する（5.8）'],
      ]} />
      <P>NEMでは、モザイクの名前が、そのまま識別子です。そのため、<B>ネームスペースを持っている人だけが</B>、その配下にモザイクを作れます。ネームスペースの取得には賃料（ルートは100 XEM、サブは10 XEM）を、モザイクの定義にも賃料（10 XEM）を払います（額は目安です。最新の情報を確認してください）。</P>
      <FigNemMosaic />
      <Note kind="warn">モザイクを添付して送るときの、<code>amount</code> の使い方には、NEM独特の決まりがあります（XEMの金額ではなく、モザイクの数量にかける倍率）。つまずきやすいので、実際に送るときは、本編の14.9で確認してください。</Note>

      <H>6.7 マルチシグ</H>
      <Note kind="goal">NEMのマルチシグの流れを説明し、Symbolのアグリゲートトランザクションとの違いを言える。</Note>
      <P>NEMで複数人の承認が必要な操作をするには、<B>マルチシグ</B>を使います。流れは次のとおりです。</P>
      <Ul items={[
        'マルチシグ化：アカウントを、複数の連署者が必要な「マルチシグアカウント」に変える。連署者は最大32人。このあと、マルチシグアカウントは、自分だけではトランザクションを起こせなくなる',
        'マルチシグアカウントからの送金：連署者の1人が、普通のトランザクション（署名者はマルチシグアカウント）を作り、署名せずに、マルチシグトランザクションで包んで、署名して送る',
        '連署：ほかの連署者が、「マルチシグ署名トランザクション」で、元のトランザクションのハッシュに署名して送る',
        '成立：必要な署名がそろえば、トランザクションが成立する。期限までにそろわなければ、却下される',
      ]} />
      <FigNemMultisig />
      <Tbl head={['観点', 'NEMのマルチシグ', 'Symbolのアグリゲート']} rows={[
        ['署名の集め方', '連署が、別のトランザクションとして、1つずつ届く', '1つのアグリゲートトランザクションに、署名を集める（5.11）'],
        ['連署者の最大人数', '32人', '25人'],
        ['入れ子', 'できない（1段だけ）', 'できる（最大3段）'],
        ['手数料', '包むトランザクションにも、連署のトランザクションにも、それぞれかかる', 'アグリゲートトランザクション全体にかかる'],
      ]} />
      <P>NEMでは、<B>連署が、別々のトランザクションとして台帳に載る</B>のが特徴です。Symbolは、これを1つにまとめられるようにしました。コードで組み立てる方法は、本編の14.10で扱います。</P>

      <H>6.8 Symbolへの進化</H>
      <Note kind="goal">SymbolがNEMから何を引き継ぎ、何を変えたのかを整理できる。</Note>
      <Tbl head={['区分', '内容']} rows={[
        ['引き継いだもの', '楕円曲線Ed25519による鍵と署名。アカウント・ネームスペース・モザイク・マルチシグという、組み込み機能を組み合わせる設計。アドレスの作り方の骨格（公開鍵のハッシュ20バイト ＋ 識別子 ＋ チェックサム ＋ Base32）と、識別子の値（0x68、0x98）。ハーベストで手数料が入ること'],
        ['ハッシュと署名', 'KeccakからSHA3へ。署名の内部のハッシュも、Keccak-512から標準のSHA-512へ。そのため、同じ秘密鍵でも別のアカウントになった'],
        ['アドレス', 'チェックサムが4バイトから3バイトへ。25バイト（40文字）から、24バイト（39文字）へ'],
        ['ブロックの間隔', '約60秒から、約30秒へ'],
        ['合意形成', 'PoIから、PoS+へ'],
        ['確定', 'ファイナリティのない仕組みから、投票ノードによるファイナライズへ'],
        ['複数人の承認', '連署が別のトランザクションになるマルチシグから、アグリゲートトランザクション（入れ子もできるマルチシグ）へ'],
        ['モザイク', '名前で識別する方式から、64ビットのIDで識別する方式へ。名前は、ネームスペースのエイリアスで付ける'],
        ['ノードと窓口', 'ノードのソフトは別物（NISではなく、Symbolのノード）。ノードの窓口も、NIS独自のAPIから、REST APIへ'],
      ]} />
      <FigNemEvolution />
      <Note kind="point">この表のうち、<B>ハッシュ・アドレス・ネットワーク識別子</B>の部分は、この章のコードで手を動かして確かめました。第2〜3章の道具（バイト列、Base32、ハッシュ）が、そのまま使えたことが分かります。</Note>

      <H>6.9 確認問題</H>
      <P>コンソールで試してから、答えを確認してください。</P>
      <Q q="NEMとSymbolの関係を、説明せよ。" a="NEMは2015年3月に始まったブロックチェーンで、Symbolは、その後継として2021年3月に始まった、別のネットワークです。台帳もアドレスも別で、XEMとXYMも別の通貨です。ただし、Symbolの開始にあたって、事前に申請したXEMの保有者には、保有量と同じ量のXYMが配られました（6.2）。" />
      <Q q="XEMの総量は。また、ブロックを作った人（ハーベスター）には、何が渡されるか。" a="総量は8,999,999,999 XEMで、すべてが最初のブロックで発行され、あとから増えません。ハーベスターには、新しい通貨ではなく、そのブロックのトランザクションの手数料が渡されます（6.2）。" />
      <Q q="PoIで、重要度の材料になるものを挙げよ。" a="ベスト済みの保有量、直近の約30日間の1,000 XEM以上の送金（出た分から入った分を引いた流れ）、取引の網の中での重要さ（NCDawareRank）です。持っているだけでなく、使っていることを重く見ます（6.4）。" />
      <Q q="20,000 XEM を受け取ったアカウントは、何日目にハーベストできるようになるか。" a="7日目です。1日ごとに、未ベスト分の10分の1がベスト済みになるので、ベスト済みは、2000、3800、5420、……と増え、7日目に10,434 XEMとなって、10,000 XEMを超えます（6.4のコード）。" />
      <Q q="XEMを受け取っても、すぐにはベスト済みにならないのは、なぜか。" a="大量のXEMを買って、すぐにネットワークを攻撃する、ということができないようにするためです。時間をかけてベスト済みになるので、短期間の買い集めでは、ハーベストに必要な重要度が手に入りません（6.4）。" />
      <Q q="NEMのアドレスが40文字で、Symbolのアドレスが39文字なのは、なぜか。" a="チェックサムの長さが違うからです。NEMは識別子1 ＋ ハッシュ20 ＋ チェックサム4 ＝ 25バイト（200ビット）で、5ビットずつ読むとちょうど40文字です。Symbolはチェックサムが3バイトで24バイト（192ビット）なので、あまりを0で埋めて39文字になります（6.5）。" />
      <Q q="Keccak-256とSHA3-256は、どこが違うか。どちらがどちらで使われているか。" a="計算はほぼ同じで、最後の「区切りのバイト」だけが違います（Keccakは0x01、SHA3は0x06）。それだけで、出力がまったく変わります。NEMはKeccak-256、SymbolはSHA3-256です（6.5のコード）。" />
      <Q q="NEMとSymbolで、アドレスの先頭がどちらもNとTなのは、なぜか。" a="ネットワーク識別子が同じ（メインネット0x68、テストネット0x98）だからです。Base32は5ビットずつ読むので、識別子の最初の5ビットが、先頭の文字になります（0x68はN、0x98はT）。見分けるときは、文字数（40か39か）を見ます（6.5）。" />
      <Q q="同じ秘密鍵から作っても、NEMとSymbolで公開鍵が違うのは、なぜか。" a="署名の内部で使うハッシュ関数が違うからです。NEMはKeccak-512、Symbolは標準のSHA-512を使います。そのため、同じ秘密鍵でも、公開鍵もアドレスも別になります（6.5）。" />
      <Q q="NEMで、モザイクはどのように識別されるか。XEMは、どう表されるか。" a="「ネームスペース名：モザイク名」で識別します。XEMは、ネームスペース nem の中のモザイク xem で、nem:xem と表されます。Symbolの、64ビットのモザイクIDとは違います（6.6）。" />
      <Q q="NEMのマルチシグで、マルチシグアカウントから送金する手順を、順に言え。" a="連署者の1人が、署名者をマルチシグアカウントにした普通のトランザクションを作り、署名せずに、マルチシグトランザクションで包んで、署名して送ります。ほかの連署者は、元のトランザクションのハッシュに署名した「マルチシグ署名トランザクション」を、それぞれ送ります。必要な署名がそろえば成立し、期限までにそろわなければ却下されます（6.7）。" />

      <H3>この章のまとめ</H3>
      <Ul items={[
        'NEMは2015年3月に始まったブロックチェーンで、Symbolの前身。Symbolとは別のネットワークで、XEMとXYMも別の通貨。XEMの総量（8,999,999,999）は、最初のブロックで全部発行された',
        'NEMも、アカウント・モザイク・ネームスペース・マルチシグを組み合わせる設計。Symbolはこの考え方を引き継ぎ、ブロック間隔（60秒から30秒）、合意形成（PoIからPoS+）、確定（ファイナライズ）、複数人の承認（アグリゲート）などを変えた',
        'NEMのPoIは、保有量だけでなく、送金の流れや取引のつながりも重要度に入れる。受け取ったXEMは、1日ごとに未ベスト分の10分の1ずつベスト済みになり、ベスト済みが10,000 XEM以上でハーベストできる',
        'NEMのアドレスは、公開鍵をKeccak-256とRIPEMD-160でハッシュした20バイトに、識別子1バイトとチェックサム4バイトを付けた25バイトを、Base32にした40文字。Symbolとの違いは、ハッシュ（KeccakかSHA3か）とチェックサムの長さ。識別子（0x68、0x98）は同じ',
        'Keccak-256とSHA3-256は、区切りのバイト（0x01と0x06）だけが違う別物。署名の内部のハッシュも違うので、同じ秘密鍵でも、NEMとSymbolでは別のアカウントになる',
        'NEMのモザイクは「ネームスペース名：モザイク名」で識別する。マルチシグは、連署が別のトランザクションになる（Symbolのアグリゲートは、1つにまとめる）',
        'NEMの手数料は、送金額とメッセージの長さで決まる（Symbolは、サイズ × 倍率）',
      ]} />

      <H>6.10 用語集</H>
      <Tbl head={['用語', '意味']} rows={[
        ['NEM（NEM1／NIS1）', '2015年3月に始まった、Symbolの前身のブロックチェーン'],
        ['NIS', 'NEMのノードのソフト（NEM Infrastructure Server）'],
        ['XEM', 'NEMの基軸通貨（モザイク nem:xem）。可分性6で、1 XEM ＝ 1,000,000 μXEM'],
        ['ネメシスブロック', 'ブロックチェーンの最初のブロック。XEMの総量は、ここで全部発行された'],
        ['PoI（Proof of Importance）', 'NEMの合意形成。保有量だけでなく、取引の活動も含めた「重要度」で、ブロックを作る人を決める'],
        ['重要度（importance）', 'アカウントごとの数値。高いほど、ブロックを作る人に選ばれやすい'],
        ['ベスティング（ベスト済み／未ベスト）', '既得バランス（ベスト済みの残高）を、時間をかけて積み上げる仕組み。受け取ったXEMを、1日ごとに未ベスト分の10分の1ずつ、ベスト済みに移す仕組み。ベスト済みが10,000 XEM以上でハーベストできる'],
        ['代理ハーベスト（デリゲートハーベスティング）', '重要度転送トランザクションで、ハーベストする力を別のアカウントに貸すこと。秘密鍵をサーバーに置かずに済む'],
        ['Keccak-256', 'NEMがアドレスなどに使うハッシュ関数。SHA3-256とは、区切りのバイトだけが違う別物'],
        ['マルチシグ（NEM）', '複数の連署者が必要なアカウント。連署は、別のトランザクション（マルチシグ署名トランザクション）で行う'],
        ['連署', 'マルチシグアカウントのトランザクションに、連署者が署名すること'],
        ['ネームスペース名：モザイク名', 'NEMでモザイクを識別する名前（例：nem:xem）'],
        ['μXEM', 'XEMの最小単位。1 XEM ＝ 1,000,000 μXEM'],
      ]} />

      <H>6.11 次のステップ</H>
      <P>この章を読み終えたら、<B>本編の第14章（NEM。付録）</B>で、Symbol SDK v3 を使って、NEMのアカウントやトランザクションを実際に扱えます。第14章は、Symbol SDK v3 を選んだときだけ表示されます。本編でつまずいたとき、この章のどこに戻ればよいかは、次の表を目安にしてください。</P>
      <Tbl head={['本編の節', 'この章の関連する節']} rows={[
        ['14.1 SymbolとNEMの違い', '6.3、6.5、6.8'],
        ['14.3 アカウント', '6.5（Keccak、40文字のアドレス、別の公開鍵になる理由）'],
        ['14.4 トランザクションの作成', '6.3（手数料の決まり方）'],
        ['14.9 ネームスペースとモザイク', '6.6'],
        ['14.10 マルチシグ', '6.7'],
      ]} />
    </>
  );
}

export const INTRO: readonly { no: number; title: string; desc: string; Body: ComponentType }[] = [
  { no: 101, title: 'JavaScript', desc: '本編のコードを読み書きするためのJavaScriptの基礎を身につけ、本編のコードを1行ずつ読めるようになる。', Body: Js1 },
  { no: 102, title: 'データの表現', desc: 'ブロックチェーンが扱うデータ（ビット・バイト・16進数・Base32など）の表し方を説明できるようになる。', Body: Data2 },
  { no: 103, title: '暗号の基礎', desc: 'ハッシュ関数と電子署名のしくみを数学の基礎から説明し、公開鍵暗号での署名と暗号化の違いを説明できるようになる。', Body: Crypto3 },
  { no: 104, title: 'ブロックチェーン基礎', desc: '署名で「本人の承認」を示すブロックチェーンの仕組み、ブロックチェーンがなぜ改ざんに強いのか、誰が次のブロックを決めるのかを説明できるようになる。', Body: Chain4 },
  { no: 105, title: 'Symbolブロックチェーン', desc: 'Symbolの構成要素と、ノードから取得するデータの読み方を説明し、アドレスを自分で計算できるようになる。', Body: Symbol5 },
  { no: 106, title: 'NEMブロックチェーン（任意）', desc: 'Symbolの前身であるNEMを、Symbolと見比べながら説明できるようになる。', Body: Nem6 },
];
