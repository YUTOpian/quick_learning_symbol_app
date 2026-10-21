// 第3章以降で作るアカウント（alice / bob / carol など、コンソール上の変数）を、このブラウザ（localStorage）に最大10個まで保存・復元する。
// 秘密鍵は第3章の注意事項どおり平文では保存せず、パスフレーズから導出した鍵で暗号化（PBKDF2 + AES-GCM）して保存する。
// 保存先は学習プロファイルごとに別（profile.ts）。
// アドレスと公開鍵は秘密情報ではないので、パスフレーズなしで表示できるよう平文で保存する。
// 保存名はコンソール上の変数名（alice など）。アカウントごとに別のパスフレーズを使ってもよい。

import { ACCOUNT_BASE, profileKey } from './profile';

export type Ver = 'v2' | 'v3';
export type PublicInfo = { address: string; publicKey: string };
export type LiveAccount = PublicInfo & { privateKey: string };
export type LiveEntry = PublicInfo & { name: string };
export type SavedAccount = PublicInfo & { name: string; savedAt: string; salt: string; iv: string; ct: string };

const STORE_BASE = ACCOUNT_BASE;
let current = 1; // 今使っているプロファイル番号
export const setProfile = (n: number): void => { current = n; };
const storeKey = (n = current): string => profileKey(STORE_BASE, n);
const OLD_KEY = 'sokushu-account'; // 1個だけ保存できた旧版のキー（読み込み時に移行する）
const ITERATIONS = 310_000;
const HEX64 = /^[0-9a-fA-F]{64}$/;
const ADDRESS = /^[NT][A-Z2-7]{38}$/;
const VAR_NAME = /^[A-Za-z_$][\w$]*$/;
export const MAX_ACCOUNTS = 10;
export const MIN_PASS = 8;

const g = globalThis as unknown as Record<string, unknown>;

type AccV2 = { privateKey: string; publicKey: string; address: { plain(): string } };
type AccV3 = { keyPair: { privateKey: { toString(): string } }; publicKey: { toString(): string }; address: { toString(): string } };

export const networkOf = (address: string): string =>
  address.startsWith('N') ? 'メインネット' : address.startsWith('T') ? 'テストネット' : '不明';

// 任意の値が、v2 / v3 どちらかの「秘密鍵を持つアカウント」なら鍵とアドレスを取り出す。違えば null。
const parseAccount = (v: unknown): LiveAccount | null => {
  const a = v as (Partial<AccV2> & Partial<AccV3>) | null | undefined;
  if (!a || typeof a !== 'object' || a.address == null) return null;
  try {
    const out: LiveAccount = typeof a.address.plain === 'function'
      ? { address: a.address.plain(), publicKey: String(a.publicKey), privateKey: String(a.privateKey) }
      : { address: String(a.address.toString()), publicKey: String(a.publicKey?.toString()), privateKey: String(a.keyPair?.privateKey.toString()) };
    return ADDRESS.test(out.address) && HEX64.test(out.publicKey) && HEX64.test(out.privateKey) ? out : null;
  } catch { return null; }
};

// コンソールの変数 name に入っているアカウントを読む（秘密鍵つき）。
export const readAccount = (name: string): LiveAccount | null => (VAR_NAME.test(name) ? parseAccount(g[name]) : null);

// コンソール上にあるアカウントの変数を全部探す（公開情報のみ）。getter は呼ばず、ユーザーが代入した変数（データプロパティ）だけを見る。
export const listLive = (): LiveEntry[] => {
  const out: LiveEntry[] = [];
  for (const k of Object.keys(g)) {
    if (!VAR_NAME.test(k)) continue;
    const d = Object.getOwnPropertyDescriptor(g, k);
    if (!d || !('value' in d)) continue;
    const a = parseAccount(d.value);
    if (a) out.push({ name: k, address: a.address, publicKey: a.publicKey });
  }
  return out;
};

// 復元先の変数名として安全か。未使用の名前か、すでにアカウント（か undefined）が入っている変数だけ許す。
// （保存データが書き換えられていても、location や sym のような既存の変数を壊さないため）
const canAssign = (name: string): boolean => {
  if (!VAR_NAME.test(name)) return false;
  if (!(name in g)) return true;
  const d = Object.getOwnPropertyDescriptor(g, name);
  return !!d && 'value' in d && (d.value === undefined || parseAccount(d.value) !== null);
};
const canAssignHelper = (name: string): boolean => {
  if (!(name in g)) return true;
  const d = Object.getOwnPropertyDescriptor(g, name);
  return !!d && 'value' in d;
};

// 保存した秘密鍵から、コンソールの変数 name にアカウントを作り直す。あわせて ${name}Address（aliceAddress など）も入れる。復元したアドレスを返す。
const restoreAccount = (ver: Ver, name: string, privateKey: string): string => {
  if (!canAssign(name)) throw new Error(`変数名 ${name} は別の用途で使われているため、復元できません。`);
  let address: string;
  let acc: unknown;
  let addrObj: unknown;
  if (ver === 'v3') {
    const core = g.sdkCore as { PrivateKey: new (hex: string) => unknown } | undefined;
    const facade = g.facade as { createAccount(key: unknown): AccV3 } | undefined;
    if (!core || !facade) throw new Error('v3 の環境構築（第2章 2.3）が完了していません。');
    const a = facade.createAccount(new core.PrivateKey(privateKey));
    acc = a; address = a.address.toString();
    try { const s = g.sdkSymbol as { Address: new (x: string) => unknown }; addrObj = new s.Address(address); } catch { /* ${name}Address は無くてもアカウントは使える */ }
  } else {
    const sym = g.sym as { Account: { createFromPrivateKey(k: string, n: number): AccV2 }; Address: { createFromRawAddress(a: string): unknown } } | undefined;
    if (!sym || typeof g.networkType !== 'number') throw new Error('v2 の環境構築（第2章 2.3）が完了していません。');
    const a = sym.Account.createFromPrivateKey(privateKey, g.networkType);
    acc = a; address = a.address.plain();
    try { addrObj = sym.Address.createFromRawAddress(address); } catch { /* 同上 */ }
  }
  g[name] = acc;
  const helper = `${name}Address`;
  if (addrObj !== undefined && canAssignHelper(helper)) g[helper] = addrObj;
  return address;
};

// ---------- 暗号化 ----------
const toB64 = (u: Uint8Array): string => { let s = ''; u.forEach((b) => { s += String.fromCharCode(b); }); return btoa(s); };
const fromB64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

const deriveKey = async (pass: string, salt: Uint8Array<ArrayBuffer>): Promise<CryptoKey> => {
  if (!globalThis.crypto?.subtle) throw new Error('この環境では暗号化が使えません（https または localhost / file で開いてください）。');
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(pass), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
};

const decrypt = async (pass: string, s: SavedAccount): Promise<string> => {
  const key = await deriveKey(pass, fromB64(s.salt));
  try {
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromB64(s.iv) }, key, fromB64(s.ct));
    return new TextDecoder().decode(plain);
  } catch { throw new Error('パスフレーズが違うか、保存データが壊れています。'); }
};

// ---------- 保存・読み込み ----------
const isSaved = (s: unknown): s is SavedAccount => {
  const x = s as Partial<SavedAccount> | null;
  return !!x && typeof x.name === 'string' && VAR_NAME.test(x.name) && typeof x.address === 'string' && ADDRESS.test(x.address)
    && typeof x.publicKey === 'string' && HEX64.test(x.publicKey) && typeof x.savedAt === 'string'
    && typeof x.salt === 'string' && typeof x.iv === 'string' && typeof x.ct === 'string';
};

const persist = (items: SavedAccount[]): void => {
  try { localStorage.setItem(storeKey(), JSON.stringify({ v: 2, items })); } catch { throw new Error('このブラウザでは保存できません（localStorage が使えません）。'); }
};

// 保存済みの一覧。旧版（1個だけ保存）のデータがあれば alice として引き継ぐ。
export const loadSaved = (): SavedAccount[] => {
  try {
    const raw = JSON.parse(localStorage.getItem(storeKey()) ?? 'null');
    if (raw && raw.v === 2 && Array.isArray(raw.items)) return (raw.items as unknown[]).filter(isSaved).slice(0, MAX_ACCOUNTS);
    const old = current === 1 ? JSON.parse(localStorage.getItem(OLD_KEY) ?? 'null') : null;
    if (old && old.v === 1) {
      const item = { ...old, name: 'alice' };
      if (isSaved(item)) { persist([item]); localStorage.removeItem(OLD_KEY); return [item]; }
    }
  } catch { /* 保存データが読めなければ、保存なしとして扱う */ }
  return [];
};

// コンソールの変数 name のアカウントを暗号化して保存する。同じ名前があれば上書き。保存後の一覧を返す。
export const saveAccount = async (name: string, a: LiveAccount, pass: string): Promise<SavedAccount[]> => {
  if (!VAR_NAME.test(name)) throw new Error('この変数名では保存できません。');
  if (pass.length < MIN_PASS) throw new Error(`パスフレーズは${MIN_PASS}文字以上にしてください。`);
  const items = loadSaved();
  const dup = items.find((s) => s.address === a.address && s.name !== name);
  if (dup) throw new Error(`このアカウントは「${dup.name}」として保存済みです。`);
  const idx = items.findIndex((s) => s.name === name);
  if (idx < 0 && items.length >= MAX_ACCOUNTS) throw new Error(`保存できるのは最大${MAX_ACCOUNTS}個までです。不要なものを削除してください。`);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(pass, salt);
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(a.privateKey)));
  const saved: SavedAccount = { name, address: a.address, publicKey: a.publicKey, savedAt: new Date().toISOString(), salt: toB64(salt), iv: toB64(iv), ct: toB64(ct) };
  if ((await decrypt(pass, saved)) !== a.privateKey) throw new Error('保存の確認に失敗しました。'); // 書き込む前に、復号できることを確認する
  const next = idx < 0 ? [...items, saved] : items.map((s, i) => (i === idx ? saved : s));
  persist(next);
  return next;
};

// 保存済みの name を復号して、コンソールの変数 name に復元する。復元したアドレスを返す。
export const loadAccount = async (ver: Ver, name: string, pass: string): Promise<string> => {
  const saved = loadSaved().find((s) => s.name === name);
  if (!saved) throw new Error(`「${name}」は保存されていません。`);
  return restoreAccount(ver, name, await decrypt(pass, saved));
};

// 保存済みの name を削除して、残りの一覧を返す。
export const clearSaved = (name: string): SavedAccount[] => {
  const next = loadSaved().filter((s) => s.name !== name);
  persist(next);
  return next;
};

// 指定プロファイルに保存されているアカウント数（プロファイル選択画面の表示用。移行処理はしない）。
export const countSaved = (n: number): number => {
  try {
    const raw = JSON.parse(localStorage.getItem(storeKey(n)) ?? 'null');
    return raw && raw.v === 2 && Array.isArray(raw.items) ? (raw.items as unknown[]).filter(isSaved).length : 0;
  } catch { return 0; }
};

// コンソール上のアカウント（alice など）と ${name}Address を消す。プロファイルを切り替えるとき、前のプロファイルのアカウントを残さないために使う。
export const clearLive = (): void => {
  for (const e of listLive()) {
    for (const k of [e.name, `${e.name}Address`]) { try { delete g[k]; } catch { /* 消せない変数は残す */ } }
  }
};
