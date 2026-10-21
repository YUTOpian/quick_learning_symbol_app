import { useState } from 'react';
import { Box, Button, ButtonBase, TextField, Typography } from '@mui/material';
import { mono } from './ui';
import { Masthead, SymChip, SymbolShell, cardSx, linkBtnSx, sym } from './SymbolScene';
import { NAME_MAX, PROFILE_COUNT, defaultName, loadSdk } from './profile';
import { countSaved, MAX_ACCOUNTS } from './account';

// 起動時に最初に表示する、学習プロファイルの選択画面。プロファイルごとに、使うSDKバージョンと保存したアカウントが別になる。
export default function ProfileSelect({ names, onSelect, onRename, onReset }: {
  names: string[]; onSelect: (n: number) => void; onRename: (n: number, name: string) => void; onReset: (n: number) => void;
}) {
  const [editing, setEditing] = useState<number | null>(null);
  const [draft, setDraft] = useState('');
  const commit = () => { if (editing !== null) onRename(editing, draft.trim() || defaultName(editing)); setEditing(null); };

  return (
    <SymbolShell>
      <Masthead />
      <Typography sx={{ mt: 3, mb: 4, color: sym.sub, lineHeight: 1.9 }}>
        学習プロファイルを選んでください。<br />プロファイルごとに、使うSDKバージョンと保存したアカウントが別々に残ります。
      </Typography>

          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, textAlign: 'left' }}>
            {Array.from({ length: PROFILE_COUNT }, (_, i) => i + 1).map((n) => {
              const sdk = loadSdk(n);
              const accounts = countSaved(n);
              const used = accounts > 0 || sdk !== null;
              return (
                <Box key={n} sx={cardSx}>
                  <ButtonBase onClick={() => onSelect(n)} focusRipple sx={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', textAlign: 'left', p: 2.5, pb: 1, flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography sx={{ ...mono, color: sym.teal, fontSize: '0.8rem' }}>PROFILE {String(n).padStart(2, '0')}</Typography>
                      <SymChip tone={used ? 'doing' : 'idle'} label={used ? '使用中' : '未使用'} />
                    </Box>
                    {editing === n ? (
                      <TextField autoFocus size="small" value={draft} sx={{ mt: 1, '& .MuiInputBase-root': { color: sym.text }, '& fieldset': { borderColor: sym.line }, '& .Mui-focused fieldset': { borderColor: `${sym.violetLight} !important` } }} slotProps={{ htmlInput: { maxLength: NAME_MAX, 'aria-label': 'プロファイル名' } }}
                        onClick={(e) => e.stopPropagation()} onChange={(e) => setDraft(e.target.value)} onBlur={commit}
                        onKeyDown={(e) => { e.stopPropagation(); if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(null); }} />
                    ) : (
                      <Typography sx={{ fontSize: '1.3rem', fontWeight: 700, mt: 1, wordBreak: 'break-all', color: sym.text }}>{names[n - 1]}</Typography>
                    )}
                    <Typography sx={{ mt: 1, fontSize: '0.88rem', color: sym.sub }}>SDK: {sdk ?? '未選択（開始時に選びます）'}</Typography>
                    <Typography sx={{ mt: 0.5, fontSize: '0.88rem', color: sym.sub }}>保存したアカウント: {accounts} / {MAX_ACCOUNTS}</Typography>
                    <Typography sx={{ mt: 1.5, fontSize: '0.85rem', color: sym.teal, fontWeight: 700 }}>{used ? 'このプロファイルで続ける ▶' : 'このプロファイルで始める ▶'}</Typography>
                  </ButtonBase>
                  <Box sx={{ px: 2, pb: 1, display: 'flex', justifyContent: 'space-between' }}>
                    <Button size="small" disabled={!used} sx={{ color: '#ff9aa5', '&.Mui-disabled': { color: 'rgba(188,176,220,0.4)' } }}
                      onClick={() => {
                        const detail = `・SDKバージョン：${sdk ?? '未選択'}\n・保存したアカウント：${accounts}個`;
                        if (window.confirm(`プロファイル「${names[n - 1]}」の設定を全消去します。\n${detail}\n\n名前・SDKバージョン・演習の回答・保存したアカウントがすべて消え、元に戻せません。保存したアカウントは、秘密鍵を別に控えていないと復元できなくなります。\n本当に消しますか？`)) onReset(n);
                      }}>設定を全消去</Button>
                    <Button size="small" sx={linkBtnSx} onClick={() => { setDraft(names[n - 1]); setEditing(n); }}>名前を変更</Button>
                  </Box>
                </Box>
              );
            })}
          </Box>
    </SymbolShell>
  );
}
