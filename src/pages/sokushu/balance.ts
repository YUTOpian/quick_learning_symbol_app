// ノードの REST API から、アカウントのモザイク残高を取得する（SDK には依存しないので v2 / v3 どちらの環境でも使える）。
// 第3章 3.3「アカウント情報の確認」「表示桁数の調整」と同じ手順: /accounts/アドレス → /mosaics/ID の可分性で小数点を入れる。

export type MosaicBalance = { id: string; label: string; amount: string; isXym: boolean };
export type BalanceResult =
  | { kind: 'ok'; mosaics: MosaicBalance[] }
  | { kind: 'unused' } // ブロックチェーンにまだ記録されていないアカウント（宛先として受信するまで記録されない）
  | { kind: 'mismatch'; nodeNet: string; accountNet: string }; // アカウントとノードのネットワークが違う

// XYM のモザイクID（テストネット / メインネット）
export const XYM_IDS = new Set(['72C0212E67A08BCE', '6BED913FA20223F8']);
const NET_ID: Record<string, number> = { N: 104, T: 152 };
const netName = (n: number) => (n === 104 ? 'メインネット' : n === 152 ? 'テストネット' : `不明(${n})`);

export const call = async (node: string, path: string, init?: RequestInit): Promise<unknown> => {
  let res: Response;
  try { res = await fetch(new URL(path, node), init); } catch { throw new Error('ノードに接続できません。ノードURLを確認してください。'); }
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`ノードがエラーを返しました（HTTP ${res.status}）。`);
  return res.json();
};

// ノードごとに1回だけ取得して使い回す（失敗したものは覚えない）。
const nets = new Map<string, Promise<number>>();
export const nodeNetwork = (node: string): Promise<number> => {
  let p = nets.get(node);
  if (!p) {
    p = call(node, '/node/info').then((j) => {
      const n = (j as { networkIdentifier?: unknown } | null)?.networkIdentifier;
      if (typeof n !== 'number') throw new Error('ノードのネットワーク種別を取得できませんでした。');
      return n;
    });
    nets.set(node, p);
    p.catch(() => nets.delete(node));
  }
  return p;
};

const divs = new Map<string, Promise<number>>();
export const divisibility = (node: string, id: string): Promise<number> => {
  const key = `${node}|${id}`;
  let p = divs.get(key);
  if (!p) {
    p = call(node, `/mosaics/${id}`).then((j) => Number((j as { mosaic?: { divisibility?: unknown } } | null)?.mosaic?.divisibility ?? 0));
    divs.set(key, p);
    p.catch(() => divs.delete(key));
  }
  return p;
};

// 整数で持っている amount に、可分性の桁数ぶん小数点を入れる（3桁区切り、小数の末尾の0は省く）。
export const formatAmount = (raw: string, div: number): string => {
  const s = raw.padStart(div + 1, '0');
  const int = BigInt(div > 0 ? s.slice(0, -div) : s).toLocaleString('en-US');
  const frac = (div > 0 ? s.slice(-div) : '').replace(/0+$/, '');
  return frac ? `${int}.${frac}` : int;
};

// モザイク名（symbol.xym など）。取れなければ空（ID で表示する）。
export const mosaicNames = async (node: string, ids: string[]): Promise<Map<string, string>> => {
  const out = new Map<string, string>();
  if (ids.length === 0) return out;
  try {
    const j = await call(node, '/namespaces/mosaic/names', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mosaicIds: ids }) });
    for (const m of (j as { mosaicNames?: { mosaicId: string; names: string[] }[] } | null)?.mosaicNames ?? []) if (m.names?.[0]) out.set(m.mosaicId.toUpperCase(), m.names[0]);
  } catch { /* 名前は無くても残高は表示できる */ }
  return out;
};

export const fetchBalances = async (node: string, address: string): Promise<BalanceResult> => {
  const accountNet = NET_ID[address[0]];
  const nodeNet = await nodeNetwork(node);
  if (accountNet !== undefined && accountNet !== nodeNet) return { kind: 'mismatch', nodeNet: netName(nodeNet), accountNet: netName(accountNet) };
  const j = (await call(node, `/accounts/${address}`)) as { account?: { mosaics?: { id: string; amount: string }[] } } | null;
  if (!j) return { kind: 'unused' };
  const list = (j.account?.mosaics ?? []).map((m) => ({ id: m.id.toUpperCase(), amount: String(m.amount) }));
  const names = await mosaicNames(node, list.filter((m) => !XYM_IDS.has(m.id)).map((m) => m.id));
  const mosaics = await Promise.all(list.map(async (m): Promise<MosaicBalance> => {
    const isXym = XYM_IDS.has(m.id);
    const amount = formatAmount(m.amount, await divisibility(node, m.id));
    return { id: m.id, isXym, amount, label: isXym ? 'XYM' : names.get(m.id) ? `${names.get(m.id)}（${m.id}）` : m.id };
  }));
  mosaics.sort((a, b) => Number(b.isXym) - Number(a.isXym) || a.id.localeCompare(b.id));
  return { kind: 'ok', mosaics };
};
