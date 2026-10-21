import { Box, ButtonBase, Typography } from '@mui/material';
import { PARTS } from './parts';
import type { Part } from './parts';
import { Masthead, NavButton, Shield, SymChip, SymbolShell, cardSx, sym } from './SymbolScene';

export type PartStat = { count: number };

// プロファイル（と、初回はSDKバージョン）を選んだあとに表示する、「入門編・本編・演習編」の選択画面。
export default function PartSelect({ profileName, ver, stats, onSelect, onBack }: {
  profileName: string; ver: string; stats: Record<Part, PartStat>; onSelect: (p: Part) => void; onBack: () => void;
}) {
  return (
    <SymbolShell>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.5 }}><NavButton label="プロファイルを切り替える" onClick={onBack} /></Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 3, flexWrap: 'wrap' }}>
        <SymChip tone="doing" label={`プロファイル: ${profileName}`} />
        <SymChip label={`SDK ${ver}`} />
      </Box>
      <Masthead small />
      <Typography sx={{ mt: 3, mb: 4, color: sym.sub, lineHeight: 1.9 }}>
        学習する編を選んでください。<br />はじめての方は、入門編 → 本編 → 演習編の順に進めるのがおすすめです。
      </Typography>

      <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, textAlign: 'left' }}>
        {PARTS.map((p) => {
          const s = stats[p.id];
          return (
            <ButtonBase key={p.id} onClick={() => onSelect(p.id)} focusRipple sx={{ ...cardSx, p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Shield glyph={p.glyph} size={64} />
                {/* 編と編をつなぐ鎖の線 */}
                <Box aria-hidden sx={{ flex: 1, height: 2, background: `linear-gradient(90deg, ${sym.violetLight}, transparent)`, opacity: 0.6 }} />
              </Box>
              <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, mt: 2 }}>{p.title}</Typography>
              <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: sym.teal, mt: 0.25 }}>{p.lead}</Typography>
              <Typography sx={{ mt: 1.5, mb: 2.5, fontSize: '0.88rem', color: sym.sub, lineHeight: 1.8, flex: 1 }}>{p.desc}</Typography>
              <Typography sx={{ fontSize: '0.8rem', color: sym.sub }}>{s.count}章</Typography>
              <Typography sx={{ mt: 1, fontSize: '0.85rem', color: sym.teal, fontWeight: 700 }}>{p.title}に進む ▶</Typography>
            </ButtonBase>
          );
        })}
      </Box>
    </SymbolShell>
  );
}
