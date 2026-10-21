import { Box, ButtonBase, Typography } from '@mui/material';
import { mono } from './ui';
import type { SdkVer } from './profile';
import { Masthead, NavButton, Shield, SymChip, SymbolShell, cardSx, sym } from './SymbolScene';

const OPTIONS: { ver: SdkVer; title: string; badge?: string; lines: string[] }[] = [
  { ver: 'v3', title: 'Symbol SDK v3', badge: '推奨',
    lines: ['現行のSDKです。REST API に直接アクセスして、トランザクションは Descriptor で組み立てます。', 'これから新しく学ぶ方はこちらがおすすめです。'] },
  { ver: 'v2', title: 'Symbol SDK v2', badge: 'deprecated',
    lines: ['symbol-sdk v2.0.4 です。リポジトリ（rxjs）を使った書き方で、すでに非推奨（deprecated）です。', '既存の v2 のコードを読み解きたい方向けです。'] },
];

// プロファイルを初めて使うときに、学習に使う SDK バージョンを1度だけ選ぶ画面。選んだバージョンで、その後ずっと進める。
// 選んだあとは、入門編・本編・演習編を選ぶ画面に進む。
export default function SdkSelect({ profileName, onSelect, onBack }: { profileName: string; onSelect: (v: SdkVer) => void; onBack: () => void }) {
  const choose = (v: SdkVer) => {
    if (window.confirm(`プロファイル「${profileName}」を、Symbol SDK ${v} で学習します。\n選んだバージョンは、あとから変更できません（別のプロファイルなら、別のバージョンを選べます）。\nよろしいですか？`)) onSelect(v);
  };
  return (
    <SymbolShell maxWidth={900}>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.5 }}><NavButton label="プロファイルを選び直す" onClick={onBack} /></Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}><SymChip tone="doing" label={`プロファイル: ${profileName}`} /></Box>
      <Masthead small />
      <Typography component="h2" sx={{ mt: 4, fontWeight: 800, fontSize: { xs: '1.5rem', sm: '2rem' } }}>どのSDKで学びますか？</Typography>
      <Typography sx={{ mt: 2, mb: 4, color: sym.sub, lineHeight: 1.9 }}>
        このプロファイルで使う Symbol SDK のバージョンを選んでください。<br />
        選ぶのは最初の1回だけです。以降はずっと、そのバージョンのコードで進みます。
      </Typography>
      <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, textAlign: 'left' }}>
        {OPTIONS.map((o) => (
          <ButtonBase key={o.ver} onClick={() => choose(o.ver)} focusRipple sx={{ ...cardSx, p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Shield glyph={o.ver} size={60} accent={o.ver === 'v3'} />
              <Typography sx={{ ...mono, color: sym.sub, fontSize: '0.8rem', flex: 1 }}>SDK {o.ver.toUpperCase()}</Typography>
              {o.badge && <SymChip tone={o.ver === 'v3' ? 'done' : 'warn'} label={o.badge} />}
            </Box>
            <Typography sx={{ fontSize: '1.3rem', fontWeight: 700, mt: 2 }}>{o.title}</Typography>
            {o.lines.map((l) => <Typography key={l} sx={{ mt: 1, fontSize: '0.88rem', color: sym.sub, lineHeight: 1.7 }}>{l}</Typography>)}
            <Typography sx={{ mt: 2, fontSize: '0.85rem', color: sym.teal, fontWeight: 700 }}>{o.ver} で学習する ▶</Typography>
          </ButtonBase>
        ))}
      </Box>
    </SymbolShell>
  );
}
