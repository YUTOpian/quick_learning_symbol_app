import { useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import { Alert, Box, Button, Chip, Drawer, FormControlLabel, List, ListItemButton, ListItemText, SvgIcon, Switch, TextField, ToggleButton, ToggleButtonGroup, Typography, useMediaQuery, useTheme } from '@mui/material';
import { ConsoleContext, mono } from './ui';
import Ch01 from './Ch01';
import Ch02 from './Ch02';
import type { Setup, Ver } from './Ch02';
import Ch03 from './Ch03';
import Ch04 from './Ch04';
import Ch05 from './Ch05';
import Ch06 from './Ch06';
import Ch07 from './Ch07';
import Ch08 from './Ch08';
import Ch09 from './Ch09';
import Ch10 from './Ch10';
import Ch11 from './Ch11';
import Ch12 from './Ch12';
import Ch13 from './Ch13';
import Ch14 from './Ch14';
import Ch15 from './Ch15';
import Ex01 from './Ex01';
import Ex02 from './Ex02';
import Ex03 from './Ex03';
import Ex04 from './Ex04';
import Ex05 from './Ex05';
import Title from './Title';
import { INTRO } from './Intro';
import AccountDialog from './AccountDialog';
import ProfileSelect from './ProfileSelect';
import { clearLive, setProfile as setAccountProfile } from './account';
import SdkSelect from './SdkSelect';
import PartSelect from './PartSelect';
import type { PartStat } from './PartSelect';
import { ChainBackdrop, Logo, Shield, sceneBg, sym } from './SymbolScene';
import { PARTS, partOf } from './parts';
import type { Part } from './parts';
import { clearProfile, loadNames, loadSdk, saveNames, saveSdk } from './profile';

type Line = { k: 'in' | 'log' | 'err'; s: string };
type Dock = 'right' | 'bottom';

// Uint8Array は 16進、BigInt は 123n 表記にして、循環参照があっても落ちないように文字列化する。
const fmt = (x: unknown): string => {
  if (typeof x === 'string') return x;
  const seen = new WeakSet<object>();
  try {
    return JSON.stringify(x, (_k, v) => {
      if (typeof v === 'bigint') return `${v}n`;
      if (v instanceof Uint8Array) return `${v.constructor.name}(${v.length}) ` + Array.from(v, (b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();
      if (v && typeof v === 'object') { if (seen.has(v)) return '[Circular]'; seen.add(v); }
      return v;
    }, 2) ?? String(x);
  } catch { return String(x); }
};

const CHAPTERS = [
  { no: 1, title: 'はじめに', desc: '本書のねらいと、Symbolでできること・できないことが分かる。' },
  { no: 2, title: '環境構築', desc: 'SDKを読み込み、コンソールでコードを動かせる状態にする。' },
  { no: 3, title: 'アカウント', desc: 'アカウントを作ってXYMを受け取り、署名と暗号化ができるようになる。' },
  { no: 4, title: 'トランザクション', desc: 'トランザクションを作成・署名・アナウンスし、承認されたことを確認できるようになる。' },
  { no: 5, title: 'モザイク', desc: 'モザイクを作成し、送信して確認できるようになる。' },
  { no: 6, title: 'ネームスペース', desc: 'ネームスペースを取得し、アドレスやモザイクに名前を付けられるようになる。' },
  { no: 7, title: 'メタデータ', desc: 'アカウント・モザイク・ネームスペースにKey-Valueのデータを登録し、確認できるようになる。' },
  { no: 8, title: 'ロック', desc: 'ハッシュロックとシークレットロックを使い、連署や解除の手順を実行できるようになる。' },
  { no: 9, title: 'マルチシグ化', desc: 'アカウントをマルチシグにして、複数人の署名で送信できるようになる。' },
  { no: 10, title: '監視', desc: 'ノードの通信を監視して、受信やブロックの更新、署名の要求を検知できるようになる。' },
  { no: 11, title: '制限', desc: 'アカウントやモザイクに制限をかけて、送受信できる相手や内容を管理できるようになる。' },
  { no: 12, title: 'オフライン署名', desc: '署名を事前に集めてから、まとめてアナウンスできるようになる。' },
  { no: 13, title: '検証', desc: 'ノードを信用せずに、トランザクション・ブロック・アカウントなどを自分で検証できるようになる。' },
  { no: 14, title: 'NEM（付録）', desc: 'Symbol SDK v3 で、NEMのアカウント・署名・モザイク・マルチシグを扱えるようになる。（SDK v3 のみ）' },
  // 演習の章の内部番号は 15。画面に出す章番号は、NEM の付録がない v2 では 14（disp 参照）。
  { no: 15, title: '演習', desc: 'これまでの章で学んだ機能を組み合わせて、使いこなせるようになる。' },
] as const;

// 演習編の、本編の章ごとの演習（内部番号 201〜）。演習編の章番号は 内部番号 - 200（201 = 第1章）。
const EX_CHAPTERS = [
  { no: 201, title: 'アカウント', desc: '本編 第3章（アカウント）の演習。鍵とアドレス、アカウント情報、暗号化と署名を、クイズとハンズオンで確かめる。' },
  { no: 202, title: 'トランザクション', desc: '本編 第4章（トランザクション）の演習。手数料、メッセージ、ステータス、アグリゲート、存在証明を、クイズとハンズオンで確かめる。' },
  { no: 203, title: 'モザイク', desc: '本編 第5章（モザイク）の演習。可分性とフラグ、供給量、送信、ポイント運用、NFTを、クイズとハンズオンで確かめる。' },
  { no: 204, title: 'ネームスペース', desc: '本編 第6章（ネームスペース）の演習。手数料と期間、レンタル、リンク、名前での送信、レシートを、クイズとハンズオンで確かめる。' },
  { no: 205, title: 'メタデータ', desc: '本編 第7章（メタデータ）の演習。キーとサイズ、アカウント・モザイク・ネームスペースへの登録、更新と差分、資格証明の検証を、クイズとハンズオンで確かめる。' },
] as const;

// 第14章（NEM）は Symbol SDK v3 のときだけ表示する。
const V3_ONLY = [14];
// 画面に出す章番号。v2 では NEM の付録がないので、演習（内部番号 15）が第14章になる。
const dispNo = (no: number, ver: Ver) => (ver === 'v2' && no === 15 ? 14 : no);
const chaptersFor = (ver: Ver) => CHAPTERS.filter((c) => ver === 'v3' || !V3_ONLY.includes(c.no)).map((c) => ({ ...c, disp: dispNo(c.no, ver) }));

// コンソールの配置・サイズは次回も使えるように保存しておく（保存できない環境では何もしない）。
const PREF_KEY = 'sokushu-console';
const loadPref = (): { dock?: Dock; w?: number; h?: number } => {
  try { return JSON.parse(localStorage.getItem(PREF_KEY) ?? '{}'); } catch { return {}; }
};
// 環境構築（第2章 2.3）の完了判定。コンソールで実行した結果、グローバルに置かれた変数が揃っているかを見る。
const checkSetup = (ver: Ver): number => {
  const g = globalThis as unknown as Record<string, unknown>;
  const sdk = ver === 'v3' ? !!g.sdkSymbol && !!g.buffer : typeof g.require === 'function';
  const common = ver === 'v3' ? !!g.facade && !!g.generationHash && !!g.Buffer : !!g.sym && !!g.repo && !!g.generationHash;
  return (sdk ? 1 : 0) | (common ? 2 : 0);
};
const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), Math.max(min, max));

// 速習Symbol。ページの本文（コードと説明）と、そのコードをその場で試せるコンソール。
// 広い画面では「左: 説明 / 右: コンソール」、狭い画面では「上: 説明 / 下: コンソール」。境界はドラッグで調整できる。
export default function Sokushu() {
  const theme = useTheme();
  const narrow = useMediaQuery(theme.breakpoints.down('lg'));
  const [dock, setDock] = useState<Dock>(() => (loadPref().dock === 'bottom' ? 'bottom' : 'right'));
  const [w, setW] = useState(() => loadPref().w ?? clamp(Math.round(window.innerWidth * 0.35), 440, 640));
  const [h, setH] = useState(() => loadPref().h ?? 280);
  const [open, setOpen] = useState(true);
  const [accOpen, setAccOpen] = useState(false);
  const [setupBits, setSetupBits] = useState(0);
  const [dragging, setDragging] = useState(false);
  const right = !narrow && dock === 'right';

  const [profile, setProfile] = useState<number | null>(null); // null = プロファイル選択画面
  const [names, setNames] = useState<string[]>(loadNames);
  const [part, setPart] = useState<Part | null>(null); // null = 編の選択画面（入門編・本編・演習編）
  const [chapter, setChapter] = useState<number | null>(null); // null = 章の選択画面
  const [ver, setVer] = useState<Ver>('v3'); // プロファイルごとに初回に選んだ SDK バージョン
  const [verSet, setVerSet] = useState(false); // false = このプロファイルは SDK バージョン未選択
  const [node, setNode] = useState('https://sym-test-01.opening-line.jp:3001');
  const [input, setInput] = useState('');
  const [lines, setLines] = useState<Line[]>([]);
  const rootRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const outRef = useRef<HTMLDivElement>(null);
  // 目次（左上のハンバーガーボタン）。いま表示している章の見出しを集めて、選んだ位置へ移動する。
  const headerRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const headEls = useRef<HTMLElement[]>([]);
  const [tocOpen, setTocOpen] = useState(false);
  const [tocAll, setTocAll] = useState(false); // true = 項（小見出し）も表示する
  const [toc, setToc] = useState<{ i: number; level: 2 | 3; text: string }[]>([]);
  const [tocActive, setTocActive] = useState(-1);
  const [tocPart, setTocPart] = useState<Part>('main'); // 目次に出している編（開いたときは、いま読んでいる章の編）
  const [tocNo, setTocNo] = useState<number | null>(null); // 集めた見出しが、どの章のものか
  const pendingJump = useRef<number | null>(null); // 目次で選んだ見出しの番号（ドロワーが閉じたあとに移動する）
  const push = (k: Line['k'], s: string) => setLines((l) => [...l, { k, s }]);

  useEffect(() => {
    try { localStorage.setItem(PREF_KEY, JSON.stringify({ dock, w, h })); } catch { /* 保存できなくても動作には影響しない */ }
  }, [dock, w, h]);

  // console.log をこのコンソールにも流す（fetch の .then など、実行後に呼ばれる出力も拾うため、ページを開いている間ずっと差し替える）
  useEffect(() => {
    const orig = { log: console.log, warn: console.warn, error: console.error };
    (['log', 'warn', 'error'] as const).forEach((m) => {
      console[m] = (...a: unknown[]) => { orig[m](...a); setLines((l) => [...l, { k: m === 'log' ? 'log' : 'err', s: a.map(fmt).join(' ') }]); };
    });
    return () => { Object.assign(console, orig); };
  }, []);
  useEffect(() => { const t = setInterval(() => setSetupBits(checkSetup(ver)), 700); return () => clearInterval(t); }, [ver]);
  // 目次からの移動は、ドロワーが閉じてフォーカスが元のボタンに戻ったあとに行う。
  // 閉じる処理と同時にスクロールを始めると、フォーカスの復帰でスクロールが中断され、動かないことがある。
  useEffect(() => {
    if (tocOpen || pendingJump.current === null) return;
    const i = pendingJump.current;
    pendingJump.current = null;
    const timer = setTimeout(() => {
      const page = pageRef.current;
      // 開いたときに集めた要素ではなく、いまの画面から取り直す（再描画で要素が入れ替わっていても動くように）
      const els = Array.from(bodyRef.current?.querySelectorAll<HTMLElement>('h2, h3') ?? []);
      const el = els[i] ?? headEls.current[i];
      if (!el || !page) return;
      const top = el.getBoundingClientRect().top - page.getBoundingClientRect().top + page.scrollTop - (headerRef.current?.offsetHeight ?? 0) - 12;
      page.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    }, 350);
    return () => clearTimeout(timer);
  }, [tocOpen]);
  useEffect(() => { const el = outRef.current; if (el) el.scrollTop = el.scrollHeight; }, [lines, open]);

  // ブラウザの開発者コンソールと同じ挙動にする: 行頭の const/let/var と function は外してグローバルに置き、変数が次の実行にも残るようにする。
  const run = async (src: string) => {
    push('in', src);
    // async function の宣言は、そのまま実行すると実行ごとの内側に閉じてしまうので、先にグローバルへ公開しておく（宣言は巻き上げられる）。
    const asyncFns = [...src.matchAll(/^async\s+function\s+(\w+)\s*\(/gm)].map((m) => `globalThis.${m[1]} = ${m[1]};`).join('\n');
    const code = asyncFns + '\n' + src
      .replace(/window\.origin/g, JSON.stringify(node))
      .replace(/^(const|let|var)\s+/gm, '')
      .replace(/^function\s+(\w+)\s*\(/gm, '$1 = function(');
    try {
      const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor;
      await new AsyncFunction(code)();
    } catch (e) { push('err', String(e)); }
  };

  // コードのボタンを押したとき、コンソールが畳んであれば自動で開く。
  const api = useMemo(() => ({
    run: (src: string) => { setOpen(true); run(src); },
    setInput: (src: string) => { setOpen(true); setInput(src); },
  }), [node]); // eslint-disable-line react-hooks/exhaustive-deps
  const setup: Setup = { sdk: !!(setupBits & 1), common: !!(setupBits & 2) };
  const ready = setup.sdk && setup.common;
  // 入門講座は内部番号 101〜106（本編の章番号と衝突しない）。101=JavaScript、102=データの表現、103=暗号の基礎、104=ブロックチェーン基礎、105=Symbol、106=NEM（任意）。
  // 演習編では、章ごとの演習（201〜）を先に、総合の演習（15）を最後に並べる。
  const ALL: readonly { no: number; title: string; desc: string; disp?: number }[] = [...INTRO, ...chaptersFor(ver).filter((c) => c.no !== 15), ...EX_CHAPTERS, ...chaptersFor(ver).filter((c) => c.no === 15)];
  const intro = INTRO.find((c) => c.no === chapter);
  const chLabel = (no: number) => (no > 200 ? `演習${no - 200}章` : no > 100 ? `入門${no - 100}` : `第${dispNo(no, ver)}章`);
  const cur = ALL.find((c) => c.no === chapter) ?? CHAPTERS[0];
  // プロファイルを選ぶ。保存したアカウントはプロファイルごとなので、前のプロファイルのアカウントをコンソールから消してから切り替える。
  const selectProfile = (n: number) => {
    clearLive();
    setAccountProfile(n);
    const sdk = loadSdk(n);
    if (sdk) setVer(sdk);
    setVerSet(sdk !== null);
    setProfile(n);
    setPart(null);
    setChapter(null);
    setAccOpen(false);
  };
  const chooseSdk = (v: Ver) => { if (profile === null) return; saveSdk(profile, v); setVer(v); setVerSet(true); };
  const leaveProfile = () => {
    clearLive();
    setProfile(null);
    setPart(null);
    setChapter(null);
    setAccOpen(false);
  };
  const resetProfile = (n: number) => { clearProfile(n); setNames(loadNames()); };
  const renameProfile = (n: number, name: string) => setNames((p) => { const next = p.map((x, i) => (i === n - 1 ? name : x)); saveNames(next); return next; });
  // 章を開く。章が属する編も合わせて切り替える（本文中のリンクで別の編の章へ移ったときも、章の一覧と目次が合うように）。
  const goChapter = (no: number) => { setChapter(no); setPart(partOf(no)); setTocPart(partOf(no)); requestAnimationFrame(() => pageRef.current?.scrollTo({ top: 0 })); };

  // 目次を開く: 本文の見出し（節 ＝ h2、項 ＝ h3）を画面から集め、いま読んでいる位置を調べる。
  const collectToc = () => {
    const els = Array.from(bodyRef.current?.querySelectorAll<HTMLElement>('h2, h3') ?? []);
    headEls.current = els;
    setToc(els.map((el, i) => ({ i, level: el.tagName === 'H2' ? 2 : 3, text: (el.textContent ?? '').trim() })));
    const line = (headerRef.current?.getBoundingClientRect().bottom ?? 0) + 40;
    let a = -1;
    els.forEach((el, i) => { if (el.getBoundingClientRect().top <= line) a = i; });
    setTocActive(a);
    setTocNo(chapter);
  };
  const openToc = () => { collectToc(); setTocPart(partOf(cur.no)); setTocOpen(true); };
  // 目次から、編の選択画面・プロファイルの選択画面へ移る。
  const toPartSelect = () => { setTocOpen(false); setChapter(null); setPart(null); };
  const toProfileSelect = () => { setTocOpen(false); leaveProfile(); };
  // 目次を開いたまま別の章を選んだときは、新しい章の本文が描画されたあとに見出しを集め直す。
  useEffect(() => {
    if (!tocOpen) return;
    const t = setTimeout(collectToc, 150);
    return () => clearTimeout(t);
  }, [chapter]); // eslint-disable-line react-hooks/exhaustive-deps
  // 選んだ見出しへの移動：ドロワーを閉じて、行き先を覚えておく。実際のスクロールは、上の effect が閉じたあとに行う。
  const jumpTo = (i: number) => { pendingJump.current = i; setTocOpen(false); };

  // 境界のドラッグでコンソールの幅（右配置）／高さ（下配置）を変える。
  const onDragMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragging || !rootRef.current) return;
    const r = rootRef.current.getBoundingClientRect();
    if (right) setW(clamp(r.right - e.clientX, 320, r.width * 0.5));
    else setH(clamp(r.bottom - e.clientY, 120, r.height * 0.8));
  };

  const submit = () => { if (input.trim()) { run(input); setInput(''); } };

  const consolePanel = !open ? (
    <Box sx={right
      ? { width: 40, flexShrink: 0, borderLeft: 1, borderColor: 'divider', display: 'flex', justifyContent: 'center', pt: 1 }
      : { flexShrink: 0, borderTop: 1, borderColor: 'divider', px: 1, py: 0.5 }}>
      <Button size="small" onClick={() => setOpen(true)} sx={right ? { writingMode: 'vertical-rl', py: 2 } : undefined}>
        {right ? '◀ コンソールを開く' : '▲ コンソールを開く'}
      </Button>
    </Box>
  ) : (
    <>
      <Box
        onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); setDragging(true); }}
        onPointerMove={onDragMove}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
        sx={{ flexShrink: 0, [right ? 'width' : 'height']: 6, cursor: right ? 'col-resize' : 'row-resize', touchAction: 'none',
          bgcolor: dragging ? 'primary.main' : 'divider', '&:hover': { bgcolor: 'primary.main' } }} />
      <Box sx={{ ...(right ? { width: w, maxWidth: '50%' } : { height: h }), flexShrink: 0, minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 1, p: 1, bgcolor: 'background.paper' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', columnGap: 1, rowGap: 0.5 }}>
          <Typography sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>コンソール</Typography>
          <Chip size="small" color={ready ? 'success' : 'default'} label={ready ? '環境構築: 完了' : '環境構築: 未完了'} sx={{ flexShrink: 0 }} />
          <Box sx={{ flex: 1 }} />
          {!narrow && (
            <ToggleButtonGroup size="small" exclusive value={dock} onChange={(_e, v: Dock | null) => { if (v) setDock(v); }}>
              <ToggleButton value="right" sx={{ px: 1, py: 0.25 }}>右</ToggleButton>
              <ToggleButton value="bottom" sx={{ px: 1, py: 0.25 }}>下</ToggleButton>
            </ToggleButtonGroup>
          )}
          <Button size="small" onClick={() => setAccOpen(true)} sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}>アカウント</Button>
          <Button size="small" onClick={() => setLines([])} sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}>クリア</Button>
          <Button size="small" onClick={() => setOpen(false)} sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}>閉じる</Button>
        </Box>
        <TextField size="small" label="ノードURL" value={node} onChange={(e) => setNode(e.target.value)} />
        <Box ref={outRef} sx={{ ...mono, flex: 1, minHeight: 60, overflow: 'auto', bgcolor: '#0f0024', p: 1, borderRadius: 1, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
          {lines.length === 0 && <Box sx={{ color: '#a894cf' }}>ここに実行結果が表示されます。</Box>}
          {lines.map((l, i) => <Box key={i} sx={{ color: l.k === 'err' ? '#f48771' : l.k === 'in' ? '#8fe9e2' : '#eee6ff' }}>{(l.k === 'in' ? '< ' : '> ') + l.s}</Box>)}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField multiline minRows={3} maxRows={8} fullWidth size="small" placeholder="コードを入力（Ctrl+Enterで実行）" value={input}
            onChange={(e) => setInput(e.target.value)} slotProps={{ input: { sx: mono } }}
            onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); submit(); } }} />
          <Button variant="contained" disabled={!input.trim()} onClick={submit} sx={{ flexShrink: 0, whiteSpace: 'nowrap', alignSelf: 'flex-end' }}>実行</Button>
        </Box>
      </Box>
    </>
  );

  // 編ごとの章数。
  const partStats = Object.fromEntries(PARTS.map((p) => [p.id, { count: ALL.filter((c) => partOf(c.no) === p.id).length }])) as Record<Part, PartStat>;

  if (profile === null) return <ProfileSelect names={names} onSelect={selectProfile} onRename={renameProfile} onReset={resetProfile} />;
  if (!verSet) return <SdkSelect profileName={names[profile - 1]} onSelect={chooseSdk} onBack={leaveProfile} />;
  if (part === null) return <PartSelect profileName={names[profile - 1]} ver={ver} stats={partStats} onSelect={setPart} onBack={leaveProfile} />;
  if (chapter === null) return <Title part={part} chapters={ALL.filter((c) => partOf(c.no) === part)} profileName={names[profile - 1]} ver={ver} onSwitch={leaveProfile} onBackToParts={() => setPart(null)} onSelect={goChapter} />;

  // 目次に出す項目。項を出さないときは、いまの位置を含む節を強調する。
  const tocShown = toc.filter((t) => tocAll || t.level === 2);
  let tocAct = tocActive;
  if (!tocAll) while (tocAct >= 0 && toc[tocAct]?.level === 3) tocAct--;

  return (
    <ConsoleContext.Provider value={api}>
      <Box ref={rootRef} sx={{ position: 'relative', height: '100dvh', display: 'flex', flexDirection: right ? 'row' : 'column', overflow: 'hidden', userSelect: dragging ? 'none' : undefined, background: sceneBg,
        '& > *:not(:first-child)': { position: 'relative', zIndex: 1 } }}>
        {/* 選択画面と同じ「ブロックがつながる夜のネットワーク」を、本文の邪魔にならない濃さで敷く。 */}
        <ChainBackdrop opacity={0.4} />
        {/* 説明（左／上）。ここだけがスクロールし、コンソールは常に画面内に残る。 */}
        <Box ref={pageRef} sx={{ flex: 1, minWidth: 0, minHeight: 0, overflow: 'auto', textAlign: 'left', pb: 16 }}>
          {/* 章の切り替えとSDKバージョンは、スクロールしても上に残す。 */}
          <Box ref={headerRef} sx={{ position: 'sticky', top: 0, zIndex: 2, bgcolor: 'rgba(28,0,66,0.92)', backdropFilter: 'blur(8px)', borderBottom: 2, borderColor: sym.outline }}>
            <Box sx={{ px: { xs: 2, md: 4 }, pt: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {/* 章の選択と節の選択は、この「目次」ひとつにまとめた（章を選ぶと、その章の節が開く）。 */}
              <Button aria-label="目次を開く（章・節）" onClick={openToc} startIcon={<SvgIcon><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" /></SvgIcon>}
                sx={{ flexShrink: 1, minWidth: 0, color: sym.teal, border: 1, borderColor: sym.teal, px: 1.5, '& .MuiButton-startIcon': { mr: 0.75 } }}>
                <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>目次　{chLabel(cur.no)} {cur.title}</Box>
              </Button>
              <Logo height={30} />
              <Chip size="small" variant="outlined" color="primary" label={names[profile - 1]} sx={{ flexShrink: 0, maxWidth: 200 }} />
              <Chip size="small" color="primary" label={PARTS.find((p) => p.id === partOf(cur.no))?.title} sx={{ flexShrink: 0 }} />
              <Box sx={{ flex: 1 }} />
              {/* このプロファイルで選んだSDKバージョン（初回に選んだら変えられない） */}
              <Chip size="small" variant="outlined" label={`SDK ${ver}`} sx={{ flexShrink: 0 }} />
            </Box>
            <Box sx={{ height: 8 }} />
          </Box>

          {/* 本文は読みやすい行幅に収めて中央に置く。 */}
          <Box ref={bodyRef} sx={{ maxWidth: 980, mx: 'auto', px: { xs: 2, md: 5, xl: 8 }, pb: 4, display: 'flow-root', bgcolor: 'rgba(20,0,47,0.78)', backdropFilter: 'blur(3px)', borderLeft: 1, borderRight: 1, borderColor: sym.line }}>
            <Box sx={{ mt: 5, mb: 3, px: 3, py: 2.5, display: 'flex', alignItems: 'center', gap: 2.5, borderRadius: 2, border: 3, borderColor: sym.outline, color: '#fff',
              background: `linear-gradient(90deg, ${sym.violetLight} 0 50%, ${sym.violet} 50% 100%)` }}>
              <Shield glyph={cur.no > 200 ? String(cur.no - 200) : cur.no > 100 ? '入' : String(dispNo(cur.no, ver))} size={64} accent />
              <Box>
                <Typography sx={{ fontSize: '0.85rem', letterSpacing: '0.25em', color: 'rgba(255,255,255,0.88)', fontWeight: 700 }}>{cur.no > 200 ? `演習編　第${cur.no - 200}章` : cur.no > 100 ? `入門講座　第${cur.no - 100}章` : `CHAPTER ${String(dispNo(cur.no, ver)).padStart(2, '0')}`}</Typography>
                <Typography component="h1" sx={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1.4, mt: 0.5 }}>{cur.no > 200 ? `第${cur.no - 200}章　${cur.title}` : cur.no > 100 ? cur.title : `第${dispNo(cur.no, ver)}章　${cur.title}`}</Typography>
              </Box>
            </Box>

            {intro ? <intro.Body /> : cur.no === 1 ? <Ch01 /> : cur.no === 2 ? <Ch02 ver={ver} setup={setup} /> : (
            <>
              {!ready && (
                <Alert severity="info" sx={{ mt: 2 }} action={<Button color="inherit" size="small" onClick={() => goChapter(2)}>第2章へ</Button>}>
                  環境構築（第2章 2.3）が完了していません。このままではコードが動かないので、先に済ませてください。
                </Alert>
              )}
              {cur.no === 3 ? <Ch03 ver={ver} /> : cur.no === 4 ? <Ch04 ver={ver} /> : cur.no === 5 ? <Ch05 ver={ver} /> : cur.no === 6 ? <Ch06 ver={ver} /> : cur.no === 7 ? <Ch07 ver={ver} /> : cur.no === 8 ? <Ch08 ver={ver} /> : cur.no === 9 ? <Ch09 ver={ver} /> : cur.no === 10 ? <Ch10 ver={ver} /> : cur.no === 11 ? <Ch11 ver={ver} /> : cur.no === 12 ? <Ch12 ver={ver} /> : cur.no === 13 ? <Ch13 ver={ver} /> : cur.no === 14 ? <Ch14 /> : cur.no === 201 ? <Ex01 ver={ver} profile={profile} /> : cur.no === 202 ? <Ex02 ver={ver} profile={profile} /> : cur.no === 203 ? <Ex03 ver={ver} profile={profile} /> : cur.no === 204 ? <Ex04 ver={ver} profile={profile} /> : cur.no === 205 ? <Ex05 ver={ver} profile={profile} /> : <Ch15 ver={ver} profile={profile} no={dispNo(15, ver)} />}
            </>
          )}
          </Box>
        </Box>
        {consolePanel}
        <AccountDialog open={accOpen} onClose={() => setAccOpen(false)} ready={ready} ver={ver} node={node} profileName={names[profile - 1]} />
        <Drawer anchor="left" open={tocOpen} onClose={() => setTocOpen(false)} slotProps={{ paper: { sx: { width: { xs: '85vw', sm: 380 }, maxWidth: 420 } } }}>
          <Box sx={{ p: 2, pb: 1, borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}>
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: 'text.secondary' }}>目次（章を選ぶと、その章の節が開きます）</Typography>
            {/* 編（入門編・本編・演習編）。ここで切り替えると、下の章の一覧がその編の章になる。 */}
            <ToggleButtonGroup size="small" exclusive fullWidth value={tocPart} sx={{ mt: 0.75 }} onChange={(_e, v: Part | null) => { if (v) setTocPart(v); }}>
              {PARTS.map((p) => <ToggleButton key={p.id} value={p.id} sx={{ py: 0.5, fontWeight: 700 }}>{p.title}</ToggleButton>)}
            </ToggleButtonGroup>
            <FormControlLabel sx={{ mt: 0.5, ml: 0 }} control={<Switch size="small" checked={tocAll} onChange={(e) => setTocAll(e.target.checked)} />}
              label={<Typography sx={{ fontSize: '0.85rem' }}>項（小見出し）も表示</Typography>} />
          </Box>
          <List dense sx={{ flex: 1, minHeight: 0, overflow: 'auto', position: 'relative', py: 0.5 }}>
            {ALL.filter((c) => partOf(c.no) === tocPart).map((c) => {
              const isCur = c.no === cur.no;
              return (
                <Box key={c.no}>
                  {/* 章。いま読んでいる章を押すと先頭へ戻り、別の章を押すとその章へ移って節の一覧を開く。 */}
                  <ListItemButton selected={isCur} sx={{ py: 0.75, borderTop: 1, borderColor: 'divider' }}
                    onClick={() => { if (isCur) { setTocOpen(false); pageRef.current?.scrollTo({ top: 0, behavior: 'smooth' }); } else goChapter(c.no); }}>
                    <ListItemText primary={`${chLabel(c.no)}　${c.title}`} slotProps={{ primary: { sx: { fontWeight: 800, fontSize: '1rem', lineHeight: 1.5 } } }} />
                    <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary', flexShrink: 0, ml: 1 }}>{isCur ? '▼' : '▶'}</Typography>
                  </ListItemButton>
                  {isCur && tocNo !== cur.no && <Typography sx={{ pl: 3, py: 1, color: 'text.secondary', fontSize: '0.85rem' }}>読み込み中…</Typography>}
                  {isCur && tocNo === cur.no && tocShown.length === 0 && <Typography sx={{ pl: 3, py: 1, color: 'text.secondary', fontSize: '0.9rem' }}>この章には見出しがありません。</Typography>}
                  {isCur && tocNo === cur.no && tocShown.map((t) => (
                    <ListItemButton key={t.i} selected={t.i === tocAct} onClick={() => jumpTo(t.i)}
                      ref={t.i === tocAct ? (n: HTMLDivElement | null) => { const l = n?.closest('ul'); if (n && l) l.scrollTop = Math.max(0, n.offsetTop - l.clientHeight / 2); } : undefined}
                      sx={{ pl: t.level === 2 ? 4 : 6.5, py: t.level === 2 ? 0.75 : 0.25 }}>
                      <ListItemText primary={t.text} slotProps={{ primary: { sx: { fontWeight: t.level === 2 ? 700 : 400, fontSize: t.level === 2 ? '0.95rem' : '0.85rem', lineHeight: 1.5 } } }} />
                    </ListItemButton>
                  ))}
                </Box>
              );
            })}
          </List>
          {/* 学習の途中から、編の選択・プロファイルの選択へ移れる。 */}
          <Box sx={{ flexShrink: 0, borderTop: 1, borderColor: 'divider', p: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button size="small" variant="outlined" onClick={toPartSelect} sx={{ justifyContent: 'flex-start' }}>◀ 編の選択へ（入門編・本編・演習編）</Button>
            <Button size="small" variant="outlined" onClick={toProfileSelect} sx={{ justifyContent: 'flex-start' }}>◀ プロファイルの選択へ（いまは {names[profile - 1]}）</Button>
          </Box>
        </Drawer>
      </Box>
    </ConsoleContext.Provider>
  );
}
