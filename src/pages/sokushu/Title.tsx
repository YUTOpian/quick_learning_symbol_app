import { Box, ButtonBase, Typography } from '@mui/material';
import { mono } from './ui';
import { PARTS } from './parts';
import type { Part } from './parts';
import { NavButton, Shield, SymChip, SymbolShell, cardSx, sym } from './SymbolScene';

export type ChapterInfo = { no: number; title: string; desc: string; disp?: number }; // disp = 画面に出す章番号（省略時は no）

// 選んだ編（入門編・本編・演習編）の章の一覧。章（ファイル）を1つ選ぶと、その章から学習を始める。
export default function Title({ part, chapters, profileName, ver, onSwitch, onBackToParts, onSelect }: {
  part: Part; chapters: readonly ChapterInfo[]; profileName: string; ver: string;
  onSwitch: () => void; onBackToParts: () => void; onSelect: (no: number) => void;
}) {
  const meta = PARTS.find((p) => p.id === part) ?? PARTS[1];
  return (
    <SymbolShell>
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1.5, mb: 1.5, flexWrap: 'wrap' }}>
        <NavButton label="編を選び直す" onClick={onBackToParts} />
        <NavButton label="プロファイルを切り替える" onClick={onSwitch} />
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 3, flexWrap: 'wrap' }}>
        <SymChip tone="doing" label={`プロファイル: ${profileName}`} />
        <SymChip label={`SDK ${ver}`} />
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}><Shield glyph={meta.glyph} size={80} accent /></Box>
      <Typography component="h1" sx={{ fontWeight: 800, lineHeight: 1.4, fontSize: { xs: '1.8rem', sm: '2.4rem' } }}>{meta.title}</Typography>
      <Typography sx={{ mt: 1, color: sym.teal, fontWeight: 700 }}>{meta.lead}</Typography>
      <Typography sx={{ mt: 2, mb: 5, color: sym.sub, lineHeight: 1.9, maxWidth: 640, mx: 'auto' }}>{meta.desc}<br />学習する章を選んでください。</Typography>

      <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, textAlign: 'left' }}>
        {chapters.map((c) => (
          <ButtonBase key={c.no} onClick={() => onSelect(c.no)} focusRipple sx={{ ...cardSx, p: 2.5 }}>
            <Typography sx={{ ...mono, color: sym.teal, fontSize: '0.8rem' }}>{c.no > 200 ? `EXERCISE ${String(c.no - 200).padStart(2, '0')}` : c.no > 100 ? `INTRO ${String(c.no - 100).padStart(2, '0')}` : `CHAPTER ${String(c.disp ?? c.no).padStart(2, '0')}`}</Typography>
            <Typography sx={{ fontSize: '1.3rem', fontWeight: 700, mt: 1 }}>{c.title}</Typography>
            <Typography sx={{ mt: 1, mb: 2, fontSize: '0.88rem', color: sym.sub, lineHeight: 1.7, flex: 1 }}>{c.desc}</Typography>
            <Typography sx={{ fontSize: '0.85rem', color: sym.teal, fontWeight: 700 }}>この章を読む ▶</Typography>
          </ButtonBase>
        ))}
      </Box>
    </SymbolShell>
  );
}
