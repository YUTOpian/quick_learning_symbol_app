import { useId } from 'react';
import type { ReactNode } from 'react';
import { Box, Button, Chip, Typography } from '@mui/material';
import logoUrl from './logo.png';

// Symbol のロゴの配色に合わせた見た目。
// ロゴは、左右で明るさが違うパープルの盾（縁は濃いパープル）に、白い Y と、ティール・ブルー・オレンジの3色のアクセント。
// 画面全体をこの盾のパープルで統一し、アクセントの3色を「補足の色」として使う。
export const sym = {
  void: '#14002f',       // 背景の底（ロゴの縁より暗い）
  deep: '#230052',
  outline: '#3c007c',    // ロゴの盾の縁
  violet: '#6c00dc',     // ロゴの盾（右半分）
  violetLight: '#8c30e4', // ロゴの盾（左半分）
  glow: '#b583f2',       // 暗い面の上の線・文字に使う明るいパープル
  teal: '#1cb4ac',       // ロゴのアクセント: ティール（補足・強調）
  sky: '#78b4e0',        // ロゴのアクセント: ブルー（リンク・情報）
  amber: '#f4a800',      // ロゴのアクセント: オレンジ（注意）
  text: '#f6f0ff',
  sub: '#c9b8ea',
  line: 'rgba(181,131,242,0.34)',
  card: 'rgba(60,0,124,0.5)',
} as const;

// 六角形（頂点が上を向く）の頂点列。背景のブロックの飾りに使う。
const hexPts = (cx: number, cy: number, r: number) =>
  Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 180) * (60 * i - 30);
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
  }).join(' ');

const NODES: readonly (readonly [number, number, number])[] = [
  [110, 120, 46], [300, 250, 30], [520, 90, 38], [760, 210, 54], [990, 110, 34], [1100, 330, 44],
  [170, 490, 38], [400, 610, 50], [660, 530, 32], [900, 650, 42], [1100, 720, 30], [60, 730, 28],
];
const LINKS: readonly (readonly [number, number])[] = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [1, 6], [6, 7], [7, 8], [8, 3], [8, 9], [9, 10], [5, 9], [6, 11],
];
// ロゴのアクセント3色を、ところどころのブロックに散らす。
const ACCENT_NODES: Record<number, string> = { 3: sym.teal, 9: sym.sky, 6: sym.amber };

// 夜空のグラデーション。ロゴのパープルが左上から差し、右下にティールがにじむ。
export const sceneBg = `radial-gradient(1100px 560px at 12% -10%, rgba(108,0,220,0.55) 0%, transparent 62%), radial-gradient(900px 520px at 100% 108%, rgba(28,180,172,0.2) 0%, transparent 58%), linear-gradient(180deg, ${sym.deep} 0%, ${sym.void} 100%)`;

// ブロックがつながったネットワークの背景（飾り）。学習ページでは opacity を下げて、本文の邪魔をしないようにする。
export function ChainBackdrop({ opacity = 1 }: { opacity?: number }) {
  return (
    <Box aria-hidden component="svg" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice"
      sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity }}>
      {LINKS.map(([a, b]) => (
        <line key={`${a}-${b}`} x1={NODES[a][0]} y1={NODES[a][1]} x2={NODES[b][0]} y2={NODES[b][1]} stroke={sym.glow} strokeOpacity={0.2} strokeWidth={1.5} />
      ))}
      {NODES.map(([x, y, r], i) => {
        const c = ACCENT_NODES[i];
        return (
          <polygon key={i} points={hexPts(x, y, r)} fill={c ? 'none' : 'rgba(108,0,220,0.2)'} stroke={c ?? sym.glow} strokeOpacity={c ? 0.65 : 0.4} strokeWidth={c ? 2 : 1.5} />
        );
      })}
    </Box>
  );
}

// ロゴそのもの（透過PNG）。
export function Logo({ height = 64, sx }: { height?: number; sx?: object }) {
  return <Box component="img" src={logoUrl} alt="Symbol" sx={{ height, width: 'auto', display: 'block', flexShrink: 0, ...sx }} />;
}

// 選択画面の外枠。全画面の背景（夜のネットワーク）の上に、中身を中央寄せで置く。
export function SymbolShell({ children, maxWidth = 1120 }: { children: ReactNode; maxWidth?: number }) {
  return (
    <Box sx={{
      position: 'relative', height: '100dvh', overflow: 'hidden', color: sym.text,
      background: sceneBg,
    }}>
      <ChainBackdrop />
      <Box sx={{ position: 'relative', height: '100%', overflow: 'auto' }}>
        <Box sx={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', px: 2, py: 6 }}>
          <Box sx={{ width: '100%', maxWidth, textAlign: 'center' }}>{children}</Box>
        </Box>
      </Box>
    </Box>
  );
}

// 選択カード（ロゴの盾と同じパープルの面。フォーカス・ホバーで明るいパープルの縁になる）。
export const cardSx = {
  display: 'flex', flexDirection: 'column', alignItems: 'stretch', textAlign: 'left', borderRadius: 2, border: 2, borderColor: sym.line,
  bgcolor: sym.card, color: sym.text, backdropFilter: 'blur(6px)',
  transition: 'transform .15s, border-color .15s, box-shadow .15s',
  '&:hover, &:focus-visible, &:focus-within': { borderColor: sym.violetLight, transform: 'translateY(-3px)', boxShadow: '0 10px 30px rgba(108,0,220,0.5)' },
  '@media (prefers-reduced-motion: reduce)': { transition: 'none', '&:hover, &:focus-visible, &:focus-within': { transform: 'none' } },
} as const;

// 暗い面の上の文字ボタン。
export const linkBtnSx = { color: sym.sky, '&:hover': { bgcolor: 'rgba(120,180,224,0.12)' } } as const;

// 画面を戻る・切り替えるためのボタン。文字リンクではなく、枠つきの大きなボタンにして見つけやすくする。
export function NavButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button variant="outlined" onClick={onClick}
      sx={{ color: '#fff', borderWidth: 2, borderColor: sym.glow, bgcolor: 'rgba(108,0,220,0.35)', px: 2, py: 0.75, fontSize: '0.95rem', whiteSpace: 'nowrap',
        '&:hover': { borderWidth: 2, borderColor: '#fff', bgcolor: sym.violet } }}>
      {'◀ '}{label}
    </Button>
  );
}

// 状態を示す小さなラベル。
const TONES = {
  done: { color: sym.teal, bg: 'rgba(28,180,172,0.16)', border: 'rgba(28,180,172,0.6)' },
  doing: { color: '#e4d0ff', bg: 'rgba(140,48,228,0.34)', border: 'rgba(181,131,242,0.65)' },
  idle: { color: sym.sub, bg: 'transparent', border: sym.line },
  warn: { color: sym.amber, bg: 'rgba(244,168,0,0.13)', border: 'rgba(244,168,0,0.55)' },
} as const;
export type Tone = keyof typeof TONES;
export function SymChip({ label, tone = 'idle' }: { label: string; tone?: Tone }) {
  const t = TONES[tone];
  return <Chip size="small" label={label} sx={{ color: t.color, bgcolor: t.bg, border: 1, borderColor: t.border, fontWeight: 700 }} />;
}

// ロゴの盾の輪郭（ロゴの座標のまま）。上辺は中央がせり上がり、下は1点に収束する。
const SHIELD = 'M40 98 Q200 18 360 98 C360 250 290 330 200 375 C110 330 40 250 40 98 Z';

// 盾のエンブレム（中に1文字）。ロゴと同じく、左半分が明るく右半分が濃いパープルで、縁は濃いパープル。
// accent = 強調（ティールの光をまとわせる）。
export function Shield({ glyph, size = 56, accent = false }: { glyph: string; size?: number; accent?: boolean }) {
  const id = useId();
  return (
    <Box sx={{ position: 'relative', width: size, height: size, flexShrink: 0, filter: accent ? 'drop-shadow(0 0 9px rgba(28,180,172,0.6))' : undefined }}>
      <Box aria-hidden component="svg" viewBox="28 42 344 344" sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id={id} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0.5" stopColor={sym.violetLight} />
            <stop offset="0.5" stopColor={sym.violet} />
          </linearGradient>
        </defs>
        <path d={SHIELD} fill={`url(#${id})`} stroke={sym.outline} strokeWidth={20} strokeLinejoin="round" />
      </Box>
      <Typography component="span" sx={{ position: 'absolute', inset: 0, pb: '8%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: size * 0.4, color: '#fff', lineHeight: 1 }}>{glyph}</Typography>
    </Box>
  );
}

// 画面の上のほうに置く、ロゴとプロダクト名の見出し。
export function Masthead({ small = false }: { small?: boolean }) {
  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.5 }}><Logo height={small ? 64 : 96} /></Box>
      <Typography sx={{ fontFamily: 'Consolas, Menlo, monospace', fontSize: '0.85rem', letterSpacing: '0.3em', color: sym.teal, mb: 2 }}>SYMBOL BLOCKCHAIN</Typography>
      <Typography component="h1" sx={{ fontWeight: 300, lineHeight: 1.4, fontSize: small ? { xs: '1.3rem', sm: '1.7rem' } : { xs: '1.6rem', sm: '2.2rem', md: '2.6rem' } }}>
        今日から現場で使える
        <Box component="span" sx={{ display: 'block', fontWeight: 800, mt: 0.5 }}>速習Symbol ブロックチェーン</Box>
      </Typography>
    </>
  );
}
