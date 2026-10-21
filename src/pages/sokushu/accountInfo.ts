// アカウントの「詳細」（モザイク・ネームスペース・マルチシグ・署名待ち・ロック・制限・メタデータ・取引履歴）を、ノードの REST API から取得する。
// SDK には依存しないので、v2 / v3 どちらの環境でも使える。章との対応: 第5章 モザイク / 第6章 ネームスペース / 第7章 メタデータ / 第8章 ロック /
// 第9章 マルチシグ化 / 第11章 制限 / 第12章 オフライン署名（署名待ち）/ 第4章 トランザクション（履歴）。
// セクションごとに成功・失敗を分けて返すので、1つ取得できなくても他は表示できる。

import { XYM_IDS, call, divisibility, formatAmount, mosaicNames, nodeNetwork } from './balance';

export type Sec<T> = { ok: true; data: T } | { ok: false; error: string };

// 人（アドレス・ネームスペース名・その他）の表し方。ネームスペース名で宛先を指定したトランザクションを表示するために使う。
export type Party = { kind: 'addr' | 'ns' | 'raw'; value: string };

export type MosaicRow = {
  id: string; name: string; isXym: boolean; held: string; supply: string; divisibility: number;
  flags: string[]; expiry: string; owner: string; mine: boolean;
};
export type NsRow = { name: string; kind: 'ルート' | 'サブ'; expiry: string; active: boolean; alias: string };
export type MultisigInfo = { isMultisig: boolean; minApproval: number; minRemoval: number; cosigners: string[]; parents: string[] };
export type PendingRow = { kind: '署名待ち' | '未承認'; hash: string; type: string; signer: string; deadline: string; inner: string[]; cosigners: string[] };
export type LockRow = { kind: 'ハッシュロック' | 'シークレットロック'; mosaic: string; amount: string; expiry: string; status: string; value: string; recipient?: string };
export type RestrictionRow = { kind: string; mode: '許可' | 'ブロック'; direction: string; values: string[] };
export type MosaicRestrictionRow = { mosaic: string; entries: string[] };
export type RestrictionInfo = { account: RestrictionRow[]; mosaic: MosaicRestrictionRow[] };
export type MetaRow = { kind: string; key: string; value: string; source: string; target: string };
export type TxRow = {
  hash: string; height: string; time: string; type: string; role: '送信' | '受信' | '関与'; signer: string;
  recipient?: Party; mosaics: { label: string; amount: string }[]; message?: string; inner: string[];
};

export type Info = {
  height: number | null;
  mosaics: Sec<MosaicRow[]>;
  namespaces: Sec<NsRow[]>;
  multisig: Sec<MultisigInfo>;
  pending: Sec<PendingRow[]>;
  locks: Sec<LockRow[]>;
  restrictions: Sec<RestrictionInfo>;
  metadata: Sec<MetaRow[]>;
  history: Sec<TxRow[]>;
};

export const LIST_MAX = 100; // 一覧の取得上限（REST の pageSize の上限）
export const HISTORY_MAX = 10;

// ---------- 小さな変換 ----------
const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const ADDRESS = /^[NT][A-Z2-7]{38}$/;

// REST が返す 16進のアドレス（24バイト = 48桁）を、39文字の Base32 のアドレスに直す（第3章で見たアドレスの形）。
export const hexToAddress = (hex: string): string => {
  if (ADDRESS.test(hex)) return hex;
  if (!/^[0-9A-Fa-f]{48}$/.test(hex)) return hex;
  let bits = 0;
  let val = 0;
  let out = '';
  for (const h of hex.match(/../g) ?? []) {
    val = (val << 8) | parseInt(h, 16);
    bits += 8;
    while (bits >= 5) { out += B32[(val >>> (bits - 5)) & 31]; bits -= 5; }
    val &= (1 << bits) - 1;
  }
  if (bits > 0) out += B32[(val << (5 - bits)) & 31];
  return out;
};

const hexToText = (hex: string): string | null => {
  try {
    const bytes = Uint8Array.from(hex.match(/../g) ?? [], (h) => parseInt(h, 16));
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch { return null; }
};

const TX_TYPES: Record<number, string> = {
  0x4154: '転送', 0x4141: 'アグリゲートコンプリート', 0x4241: 'アグリゲートボンデッド',
  0x414c: 'アカウントキーリンク', 0x424c: 'ノードキーリンク', 0x4143: '投票キーリンク', 0x4243: 'VRFキーリンク',
  0x4148: 'ハッシュロック', 0x4152: 'シークレットロック', 0x4252: 'シークレットプルーフ',
  0x4144: 'アカウントメタデータ', 0x4244: 'モザイクメタデータ', 0x4344: 'ネームスペースメタデータ',
  0x414d: 'モザイク定義', 0x424d: 'モザイク供給量変更', 0x434d: 'モザイク回収',
  0x4155: 'マルチシグ構成変更',
  0x414e: 'ネームスペース登録', 0x424e: 'アドレスエイリアス', 0x434e: 'モザイクエイリアス',
  0x4150: 'アカウントアドレス制限', 0x4250: 'アカウントモザイク制限', 0x4350: 'アカウント操作制限',
  0x4151: 'モザイクグローバル制限', 0x4251: 'モザイクアドレス制限',
};
const typeName = (t: number): string => TX_TYPES[t] ?? `不明(0x${t.toString(16).toUpperCase()})`;

const FOREVER = 10n ** 15n; // これ以上の終了ブロック高は「無期限」（ネームスペースの nemesis など）
const BLOCK_SEC = 30; // Symbol は 1 ブロックおよそ 30 秒

// 終了ブロック高を「あと約◯日」の形に直す。
const until = (end: string, height: number | null): { text: string; alive: boolean } => {
  let e: bigint;
  try { e = BigInt(end); } catch { return { text: end, alive: true }; }
  if (e >= FOREVER) return { text: '無期限', alive: true };
  if (height === null) return { text: `ブロック高 ${e} まで`, alive: true };
  const rest = Number(e) - height;
  if (rest <= 0) return { text: `期限切れ（ブロック高 ${e}）`, alive: false };
  const sec = rest * BLOCK_SEC;
  const span = sec >= 86400 ? `約${Math.round(sec / 86400)}日` : sec >= 3600 ? `約${Math.round(sec / 3600)}時間` : `約${Math.max(1, Math.round(sec / 60))}分`;
  return { text: `ブロック高 ${e} まで（あと${span}）`, alive: true };
};

// ---------- REST 呼び出し ----------
const get = async <T>(node: string, path: string): Promise<T | null> => (await call(node, path)) as T | null;
const post = async <T>(node: string, path: string, body: unknown): Promise<T | null> =>
  (await call(node, path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })) as T | null;

const sec = async <T>(f: () => Promise<T>): Promise<Sec<T>> => {
  try { return { ok: true, data: await f() }; } catch (e) { return { ok: false, error: e instanceof Error ? e.message : String(e) }; }
};

const epochs = new Map<string, Promise<number | null>>();
const epochOf = (node: string): Promise<number | null> => {
  let p = epochs.get(node);
  if (!p) {
    p = get<{ network?: { epochAdjustment?: string } }>(node, '/network/properties')
      .then((j) => { const m = /^(\d+)s?$/.exec(String(j?.network?.epochAdjustment ?? '')); return m ? Number(m[1]) : null; })
      .catch(() => null);
    epochs.set(node, p);
  }
  return p;
};
const fmtTime = (epoch: number | null, ms: string | undefined): string => {
  if (epoch === null || ms === undefined) return '';
  const n = Number(ms);
  return Number.isFinite(n) ? new Date(epoch * 1000 + n).toLocaleString('ja-JP') : '';
};

// ネームスペースIDから「tomato.token」のような完全な名前を求める（親をたどる）。
const nsFullNames = async (node: string, ids: string[]): Promise<Map<string, string>> => {
  const info = new Map<string, { name: string; parent: string }>();
  let todo = [...new Set(ids.map((i) => i.toUpperCase()))];
  for (let round = 0; round < 4 && todo.length > 0; round++) {
    let j: { namespaceNames?: { id: string; name: string; parentId?: string }[] } | { id: string; name: string; parentId?: string }[] | null = null;
    try { j = await post(node, '/namespaces/names', { namespaceIds: todo }); } catch { break; }
    const list = Array.isArray(j) ? j : (j?.namespaceNames ?? []);
    const next: string[] = [];
    for (const n of list) {
      const id = n.id.toUpperCase();
      const parent = (n.parentId ?? '').toUpperCase();
      info.set(id, { name: n.name, parent });
      if (parent && !/^0+$/.test(parent) && !info.has(parent)) next.push(parent);
    }
    todo = [...new Set(next)];
  }
  const out = new Map<string, string>();
  const full = (id: string, depth = 0): string | null => {
    const n = info.get(id);
    if (!n || depth > 3) return null;
    if (!n.parent || /^0+$/.test(n.parent)) return n.name;
    const p = full(n.parent, depth + 1);
    return p ? `${p}.${n.name}` : null;
  };
  for (const id of new Set(ids.map((i) => i.toUpperCase()))) { const f = full(id); if (f) out.set(id, f); }
  return out;
};

const idsLabel = (id: string, names: Map<string, string>): string => {
  const u = id.toUpperCase();
  return XYM_IDS.has(u) ? 'XYM' : names.get(u) ? `${names.get(u)}（${u}）` : u;
};

// ---------- 各セクション ----------
type MosaicDTO = { id?: string; mosaic?: { id: string; supply: string; startHeight: string; ownerAddress: string; flags: number; divisibility: number; duration: string } };
const FLAG_NAMES: [number, string][] = [[1, '供給量変更可'], [2, '譲渡可'], [4, '制限可'], [8, '回収可']];

const mosaicSection = async (node: string, address: string, height: number | null): Promise<MosaicRow[]> => {
  const acc = await get<{ account?: { mosaics?: { id: string; amount: string }[] } }>(node, `/accounts/${address}`);
  const held = new Map((acc?.account?.mosaics ?? []).map((m) => [m.id.toUpperCase(), String(m.amount)] as const));
  const created = await get<{ data?: MosaicDTO[] }>(node, `/mosaics?ownerAddress=${address}&pageSize=${LIST_MAX}`);
  const detail = new Map<string, NonNullable<MosaicDTO['mosaic']>>();
  for (const d of created?.data ?? []) if (d.mosaic) detail.set(d.mosaic.id.toUpperCase(), d.mosaic);
  const missing = [...held.keys()].filter((id) => !detail.has(id));
  if (missing.length > 0) {
    let list: MosaicDTO[] = [];
    try { list = (await post<MosaicDTO[]>(node, '/mosaics', { mosaicIds: missing })) ?? []; }
    catch { list = (await Promise.all(missing.map((id) => get<MosaicDTO>(node, `/mosaics/${id}`).catch(() => null)))).filter((x): x is MosaicDTO => !!x); }
    for (const d of list) if (d.mosaic) detail.set(d.mosaic.id.toUpperCase(), d.mosaic);
  }
  const ids = [...new Set([...held.keys(), ...detail.keys()])];
  const names = await mosaicNames(node, ids.filter((i) => !XYM_IDS.has(i)));
  const rows = await Promise.all(ids.map(async (id): Promise<MosaicRow> => {
    const m = detail.get(id);
    const div = m ? m.divisibility : await divisibility(node, id);
    const dur = m && m.duration !== '0' ? until(String(BigInt(m.startHeight) + BigInt(m.duration)), height).text : '無期限';
    const owner = m ? hexToAddress(m.ownerAddress) : '';
    return {
      id, name: XYM_IDS.has(id) ? 'XYM' : (names.get(id) ?? ''), isXym: XYM_IDS.has(id),
      held: formatAmount(held.get(id) ?? '0', div), supply: m ? formatAmount(String(m.supply), div) : '', divisibility: div,
      flags: m ? FLAG_NAMES.filter(([b]) => (m.flags & b) !== 0).map(([, n]) => n) : [], expiry: dur, owner, mine: owner === address,
    };
  }));
  rows.sort((a, b) => Number(b.isXym) - Number(a.isXym) || Number(b.held !== '0') - Number(a.held !== '0') || a.id.localeCompare(b.id));
  return rows;
};

type NsDTO = { namespace?: { registrationType: number; depth: number; level0: string; level1?: string; level2?: string; alias?: { type: number; mosaicId?: string; address?: string }; endHeight: string } };

const namespaceSection = async (node: string, address: string, height: number | null): Promise<NsRow[]> => {
  const j = await get<{ data?: NsDTO[] }>(node, `/namespaces?ownerAddress=${address}&pageSize=${LIST_MAX}`);
  const list = (j?.data ?? []).map((d) => d.namespace).filter((n): n is NonNullable<NsDTO['namespace']> => !!n);
  const names = await nsFullNames(node, list.flatMap((n) => [n.level0, n.level1, n.level2].filter((x): x is string => !!x)));
  const rows = list.map((n): NsRow => {
    const lastId = [n.level0, n.level1, n.level2][n.depth - 1] ?? n.level0;
    const e = until(n.endHeight, height);
    const a = n.alias;
    return {
      name: names.get(lastId.toUpperCase()) ?? lastId, kind: n.registrationType === 0 ? 'ルート' : 'サブ',
      expiry: n.registrationType === 0 ? e.text : '（ルートと同じ）', active: e.alive,
      alias: a?.type === 1 && a.mosaicId ? `モザイク ${a.mosaicId.toUpperCase()}` : a?.type === 2 && a.address ? `アドレス ${hexToAddress(a.address)}` : '',
    };
  });
  rows.sort((a, b) => a.name.localeCompare(b.name));
  return rows;
};

const multisigSection = async (node: string, address: string): Promise<MultisigInfo> => {
  const j = await get<{ multisig?: { minApproval: number; minRemoval: number; cosignatoryAddresses?: string[]; multisigAddresses?: string[] } }>(node, `/multisig/${address}`);
  const m = j?.multisig;
  if (!m) return { isMultisig: false, minApproval: 0, minRemoval: 0, cosigners: [], parents: [] };
  const cosigners = (m.cosignatoryAddresses ?? []).map(hexToAddress);
  return { isMultisig: cosigners.length > 0, minApproval: m.minApproval, minRemoval: m.minRemoval, cosigners, parents: (m.multisigAddresses ?? []).map(hexToAddress) };
};

type TxDTO = {
  meta?: { hash?: string; height?: string; timestamp?: string };
  transaction?: {
    type: number; signerPublicKey: string; deadline?: string; recipientAddress?: string; message?: string;
    mosaics?: { id: string; amount: string }[];
    transactions?: { transaction?: { type: number } }[];
    cosignatures?: { signerPublicKey: string }[];
  };
};

const innerTypes = (t: NonNullable<TxDTO['transaction']>): string[] => {
  const count = new Map<string, number>();
  for (const x of t.transactions ?? []) { const n = typeName(x.transaction?.type ?? 0); count.set(n, (count.get(n) ?? 0) + 1); }
  return [...count].map(([n, c]) => (c > 1 ? `${n} ×${c}` : n));
};

const pendingSection = async (node: string, address: string, epoch: number | null): Promise<PendingRow[]> => {
  const q = `address=${address}&pageSize=20&order=desc`;
  const [partial, unconfirmed] = await Promise.all([
    get<{ data?: TxDTO[] }>(node, `/transactions/partial?${q}`),
    get<{ data?: TxDTO[] }>(node, `/transactions/unconfirmed?${q}`),
  ]);
  const conv = (kind: PendingRow['kind']) => (d: TxDTO): PendingRow | null => {
    const t = d.transaction;
    if (!t) return null;
    return {
      kind, hash: d.meta?.hash ?? '', type: typeName(t.type), signer: t.signerPublicKey, deadline: fmtTime(epoch, t.deadline),
      inner: innerTypes(t), cosigners: (t.cosignatures ?? []).map((c) => c.signerPublicKey),
    };
  };
  return [
    ...(partial?.data ?? []).map(conv('署名待ち')),
    ...(unconfirmed?.data ?? []).map(conv('未承認')),
  ].filter((x): x is PendingRow => !!x);
};

type LockDTO = { lock?: { mosaicId: string; amount: string; endHeight: string; status: number; hash?: string; secret?: string; recipientAddress?: string } };

const lockSection = async (node: string, address: string, height: number | null): Promise<LockRow[]> => {
  const q = `address=${address}&pageSize=${LIST_MAX}`;
  const [hash, secret] = await Promise.all([
    get<{ data?: LockDTO[] }>(node, `/lock/hash?${q}`),
    get<{ data?: LockDTO[] }>(node, `/lock/secret?${q}`),
  ]);
  const all = [
    ...(hash?.data ?? []).map((d) => ({ kind: 'ハッシュロック' as const, l: d.lock })),
    ...(secret?.data ?? []).map((d) => ({ kind: 'シークレットロック' as const, l: d.lock })),
  ].filter((x): x is { kind: LockRow['kind']; l: NonNullable<LockDTO['lock']> } => !!x.l);
  const names = await mosaicNames(node, [...new Set(all.map((x) => x.l.mosaicId.toUpperCase()))].filter((i) => !XYM_IDS.has(i)));
  return Promise.all(all.map(async ({ kind, l }): Promise<LockRow> => {
    const id = l.mosaicId.toUpperCase();
    const e = until(l.endHeight, height);
    return {
      kind, mosaic: idsLabel(id, names), amount: formatAmount(String(l.amount), await divisibility(node, id)),
      expiry: e.text, status: l.status === 1 ? '使用済み' : e.alive ? '有効（未使用）' : '期限切れ',
      value: (kind === 'ハッシュロック' ? l.hash : l.secret) ?? '', recipient: l.recipientAddress ? hexToAddress(l.recipientAddress) : undefined,
    };
  }));
};

const restrictionSection = async (node: string, address: string): Promise<RestrictionInfo> => {
  const [acc, mos] = await Promise.all([
    get<{ accountRestrictions?: { restrictions?: { restrictionFlags: number; values?: (string | number)[] }[] } }>(node, `/restrictions/account/${address}`),
    get<{ data?: { mosaicRestrictionEntry?: { entryType: number; mosaicId: string; restrictions?: { key: string; value: string }[] } }[] }>(node, `/restrictions/mosaic?targetAddress=${address}&pageSize=${LIST_MAX}`),
  ]);
  const raw = acc?.accountRestrictions?.restrictions ?? [];
  const mosaicIds = raw.filter((r) => (r.restrictionFlags & 7) === 2).flatMap((r) => (r.values ?? []).map((v) => String(v).toUpperCase()));
  const entries = (mos?.data ?? []).map((d) => d.mosaicRestrictionEntry).filter((e): e is NonNullable<typeof e> => !!e && e.entryType === 0);
  const names = await mosaicNames(node, [...new Set([...mosaicIds, ...entries.map((e) => e.mosaicId.toUpperCase())])].filter((i) => !XYM_IDS.has(i)));
  const account = raw.map((r): RestrictionRow => {
    const f = r.restrictionFlags;
    const base = f & 7;
    const kind = base === 1 ? 'アドレス' : base === 2 ? 'モザイク' : base === 4 ? 'トランザクションタイプ' : '不明';
    const direction = base === 2 ? '受信' : base === 4 ? '送信' : (f & 0x4000) !== 0 ? '送信' : '受信';
    const values = (r.values ?? []).map((v) => (base === 1 ? hexToAddress(String(v)) : base === 2 ? idsLabel(String(v), names) : typeName(Number(v))));
    return { kind, mode: (f & 0x8000) !== 0 ? 'ブロック' : '許可', direction, values };
  });
  const mosaic = entries.map((e): MosaicRestrictionRow => ({ mosaic: idsLabel(e.mosaicId, names), entries: (e.restrictions ?? []).map((r) => `キー ${r.key} = ${r.value}`) }));
  return { account, mosaic };
};

type MetaDTO = { metadataEntry?: { sourceAddress: string; targetAddress: string; scopedMetadataKey: string; targetId: string; metadataType: number; value: string } };

const metadataSection = async (node: string, address: string): Promise<MetaRow[]> => {
  const j = await get<{ data?: MetaDTO[] }>(node, `/metadata?targetAddress=${address}&pageSize=${LIST_MAX}`);
  return (j?.data ?? []).map((d) => d.metadataEntry).filter((e): e is NonNullable<MetaDTO['metadataEntry']> => !!e).map((e): MetaRow => ({
    kind: e.metadataType === 0 ? 'アカウント' : e.metadataType === 1 ? 'モザイク' : 'ネームスペース',
    key: e.scopedMetadataKey.toUpperCase(), value: hexToText(e.value) ?? `0x${e.value}`, source: hexToAddress(e.sourceAddress),
    target: e.metadataType === 0 ? '' : e.targetId.toUpperCase(),
  }));
};

const historySection = async (node: string, address: string, publicKey: string, epoch: number | null): Promise<TxRow[]> => {
  const j = await get<{ data?: TxDTO[] }>(node, `/transactions/confirmed?address=${address}&pageSize=${HISTORY_MAX}&order=desc`);
  const list = (j?.data ?? []).filter((d): d is TxDTO & { transaction: NonNullable<TxDTO['transaction']> } => !!d.transaction);
  const mosaicIds = [...new Set(list.flatMap((d) => (d.transaction.mosaics ?? []).map((m) => m.id.toUpperCase())))];
  const mNames = await mosaicNames(node, mosaicIds.filter((i) => !XYM_IDS.has(i)));
  // 宛先がネームスペース（エイリアス）の場合は、先頭バイトの最下位ビットが 1 で、続く 8 バイトがネームスペースID（リトルエンディアン）。
  const nsIds = new Map<string, string>();
  const parties = new Map<string, Party>();
  for (const d of list) {
    const r = d.transaction.recipientAddress;
    if (!r || parties.has(r)) continue;
    if (/^[0-9A-Fa-f]{48}$/.test(r) && (parseInt(r.slice(0, 2), 16) & 1) === 1) {
      const id = (r.slice(2, 18).match(/../g) ?? []).reverse().join('').toUpperCase();
      nsIds.set(r, id);
      parties.set(r, { kind: 'ns', value: id });
    } else parties.set(r, { kind: ADDRESS.test(r) || /^[0-9A-Fa-f]{48}$/.test(r) ? 'addr' : 'raw', value: hexToAddress(r) });
  }
  const nsNames = nsIds.size > 0 ? await nsFullNames(node, [...nsIds.values()]) : new Map<string, string>();
  return Promise.all(list.map(async (d): Promise<TxRow> => {
    const t = d.transaction;
    const rp = t.recipientAddress ? parties.get(t.recipientAddress) : undefined;
    const recipient = rp && rp.kind === 'ns' ? { kind: 'ns' as const, value: nsNames.get(rp.value) ?? rp.value } : rp;
    const mosaics = await Promise.all((t.mosaics ?? []).map(async (m) => ({ label: idsLabel(m.id, mNames), amount: formatAmount(String(m.amount), await divisibility(node, m.id.toUpperCase())) })));
    let message: string | undefined;
    if (t.message !== undefined && t.message.length >= 2) {
      const kind = parseInt(t.message.slice(0, 2), 16);
      message = kind === 0 ? (hexToText(t.message.slice(2)) ?? '（文字として読めないデータ）') : kind === 1 ? '（暗号化メッセージ）' : '（その他のメッセージ）';
    }
    const role: TxRow['role'] = t.signerPublicKey.toUpperCase() === publicKey.toUpperCase() ? '送信' : rp?.kind === 'addr' && rp.value === address ? '受信' : '関与';
    return { hash: d.meta?.hash ?? '', height: d.meta?.height ?? '', time: fmtTime(epoch, d.meta?.timestamp), type: typeName(t.type), role, signer: t.signerPublicKey, recipient, mosaics, message, inner: innerTypes(t) };
  }));
};

// ---------- まとめて取得 ----------
const cache = new Map<string, Promise<Info>>();

// address の詳細を全部取得する。node / address / rev（「更新」を押した回数）が同じ間は、同じ結果を使い回す（同じアカウントが2か所に出るため）。
export const fetchInfo = (node: string, address: string, publicKey: string, rev: number): Promise<Info> => {
  const key = `${node}|${address}|${rev}`;
  let p = cache.get(key);
  if (!p) {
    p = (async (): Promise<Info> => {
      const accountNet = address[0] === 'N' ? 104 : address[0] === 'T' ? 152 : undefined;
      const nodeNet = await nodeNetwork(node);
      if (accountNet !== undefined && accountNet !== nodeNet) throw new Error(`接続先ノードは${nodeNet === 104 ? 'メインネット' : nodeNet === 152 ? 'テストネット' : '別のネットワーク'}、このアカウントは${accountNet === 104 ? 'メインネット' : 'テストネット'}のため、詳細を取得できません。`);
      const [chain, epoch] = await Promise.all([
        get<{ height?: string }>(node, '/chain/info').catch(() => null),
        epochOf(node),
      ]);
      const h = chain?.height !== undefined ? Number(chain.height) : NaN;
      const height = Number.isFinite(h) ? h : null;
      const [mosaics, namespaces, multisig, pending, locks, restrictions, metadata, history] = await Promise.all([
        sec(() => mosaicSection(node, address, height)),
        sec(() => namespaceSection(node, address, height)),
        sec(() => multisigSection(node, address)),
        sec(() => pendingSection(node, address, epoch)),
        sec(() => lockSection(node, address, height)),
        sec(() => restrictionSection(node, address)),
        sec(() => metadataSection(node, address)),
        sec(() => historySection(node, address, publicKey, epoch)),
      ]);
      return { height, mosaics, namespaces, multisig, pending, locks, restrictions, metadata, history };
    })();
    cache.set(key, p);
    p.catch(() => cache.delete(key));
    if (cache.size > 40) cache.delete(cache.keys().next().value as string);
  }
  return p;
};
