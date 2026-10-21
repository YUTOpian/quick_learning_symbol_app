// 学習プロファイル。6つの枠があり、プロファイルごとに「保存したアカウント」「SDKバージョン」「演習の回答」を別々に持つ（このブラウザの localStorage に保存）。
// プロファイル1は、プロファイル導入前から使っていた保存キーをそのまま使う（それまでに保存したアカウントが引き継がれる）。
export const PROFILE_COUNT = 6;
export const NAME_MAX = 20;

export const profileKey = (base: string, n: number): string => (n === 1 ? base : `${base}-p${n}`);
export const defaultName = (n: number): string => `プロファイル${n}`;

const NAMES_KEY = 'sokushu-profiles';
// 学習の進捗記録は廃止した。旧版が残した保存データだけ、プロファイルの全消去のときに一緒に消す。
const LEGACY_PROG_BASE = 'sokushu-progress';
const LEGACY_SWAP_BASE = 'sokushu-chswap';
const EX_BASE = 'sokushu-exercise';

export const loadNames = (): string[] => {
  let a: unknown = [];
  try { a = JSON.parse(localStorage.getItem(NAMES_KEY) ?? '[]'); } catch { /* 読めなければ既定の名前 */ }
  const arr = Array.isArray(a) ? a : [];
  return Array.from({ length: PROFILE_COUNT }, (_, i) => (typeof arr[i] === 'string' && arr[i].trim() ? arr[i].trim().slice(0, NAME_MAX) : defaultName(i + 1)));
};
export const saveNames = (names: string[]): void => {
  try { localStorage.setItem(NAMES_KEY, JSON.stringify(names)); } catch { /* 保存できなくても動作には影響しない */ }
};

// 演習編の記録（クイズの回答と、ハンズオン演習の「できた」チェック）。プロファイルごとに保存する。
export type ExState = { quiz: Record<string, number>; done: Record<string, boolean> };
export const loadEx = (n: number): ExState => {
  try {
    const v = JSON.parse(localStorage.getItem(profileKey(EX_BASE, n)) ?? '{}');
    return { quiz: v && typeof v.quiz === 'object' && v.quiz ? v.quiz : {}, done: v && typeof v.done === 'object' && v.done ? v.done : {} };
  } catch { return { quiz: {}, done: {} }; }
};
export const saveEx = (n: number, s: ExState): void => {
  try { localStorage.setItem(profileKey(EX_BASE, n), JSON.stringify(s)); } catch { /* 保存できなくても動作には影響しない */ }
};

// プロファイルごとに選んだ SDK バージョン（初回に1度だけ選び、以降は変えない）。未選択なら null。
export type SdkVer = 'v2' | 'v3';
const SDK_BASE = 'sokushu-sdk';
export const loadSdk = (n: number): SdkVer | null => {
  try { const v = localStorage.getItem(profileKey(SDK_BASE, n)); return v === 'v2' || v === 'v3' ? v : null; } catch { return null; }
};
export const saveSdk = (n: number, v: SdkVer): void => {
  try { localStorage.setItem(profileKey(SDK_BASE, n), v); } catch { /* 保存できなくても、このセッション中は選んだバージョンで進む */ }
};

// プロファイルの設定を全消去する（名前・SDKバージョン・演習の回答・保存したアカウント）。元に戻せない。
// 保存したアカウントのキーは account.ts と同じ（プロファイル1は旧版の1個保存用キーも消す）。
export const ACCOUNT_BASE = 'sokushu-accounts';
export const clearProfile = (n: number): void => {
  const keys = [profileKey(ACCOUNT_BASE, n), profileKey(SDK_BASE, n), profileKey(EX_BASE, n), profileKey(LEGACY_PROG_BASE, n), profileKey(LEGACY_SWAP_BASE, n)];
  if (n === 1) keys.push('sokushu-account');
  keys.forEach((k) => { try { localStorage.removeItem(k); } catch { /* 消せなくても他の処理は続ける */ } });
  const names = loadNames();
  names[n - 1] = defaultName(n);
  saveNames(names);
};
