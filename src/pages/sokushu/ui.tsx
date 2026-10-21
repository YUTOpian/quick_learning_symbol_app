import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { Box, Button, Collapse, IconButton, Link, SvgIcon, Tooltip, Typography } from '@mui/material';
import { explainOf } from './explain';

export const mono = { fontFamily: 'Consolas, Menlo, monospace', fontSize: 14 };

// コンソール（Sokushu.tsx が持つ）への実行・入力の窓口。
type ConsoleApi = { run: (src: string) => void; setInput: (src: string) => void };
export const ConsoleContext = createContext<ConsoleApi>({ run: () => {}, setInput: () => {} });

// 実行・入力ボタン付きのコード。右上の「?」でコードの意味の解説を開閉できる（解説があるコードのみ）。
// runnable=false は、引数を省略した断片など「そのままでは実行できないコード」用で、実行・入力ボタンを出さない。
export function Code({ code, runnable = true }: { code: string; runnable?: boolean }) {
  const { run, setInput } = useContext(ConsoleContext);
  const [showExp, setShowExp] = useState(false);
  const exp = explainOf(code);
  return (
    <Box sx={{ my: 3 }}>
      <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#1cb4ac', mb: 0.5 }}>▼ コード</Typography>
      <Box sx={{ position: 'relative' }}>
        <Box component="pre" sx={{ ...mono, lineHeight: 1.75, m: 0, p: 2.5, pr: exp ? 7 : 2.5, bgcolor: '#12002a', color: '#efe6ff', border: 1, borderColor: 'rgba(181,131,242,0.35)', borderTop: 4, borderTopColor: '#8c30e4', borderRadius: 1, overflow: 'auto' }}>{code}</Box>
        {exp && (
          <Tooltip title="コードの意味を見る">
            <IconButton size="small" aria-label="コードの意味を見る" aria-expanded={showExp} onClick={() => setShowExp((v) => !v)}
              sx={{ position: 'absolute', top: 8, right: 4, color: showExp ? '#1cb4ac' : '#b9a6dc' }}>
              <SvgIcon fontSize="small"><path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z" /></SvgIcon>
            </IconButton>
          </Tooltip>
        )}
      </Box>
      {exp && (
        <Collapse in={showExp} unmountOnExit>
          <Box sx={{ mt: 0.5, p: 1.5, borderLeft: 5, borderColor: '#8c30e4', bgcolor: 'rgba(108,0,220,0.22)', borderRadius: 1 }}>
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: 'primary.light', mb: 0.5 }}>コードの意味</Typography>
            <Typography sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, fontSize: '0.9rem' }}>{exp}</Typography>
          </Box>
        </Collapse>
      )}
      {runnable ? (
        <Box sx={{ display: 'flex', gap: 1.5, mt: 1.5 }}>
          <Button size="small" variant="contained" onClick={() => run(code)}>コンソールで実行</Button>
          <Button size="small" onClick={() => setInput(code)}>コンソールに入力</Button>
        </Box>
      ) : (
        <Typography sx={{ mt: 0.5, fontSize: '0.8rem', color: 'text.secondary' }}>※ 参考用のコードです。このコンソールでは実行できません。</Typography>
      )}
    </Box>
  );
}

// 出力例（実行はできない、表示のみ）。
export function Out({ code }: { code: string }) {
  return (
    <Box sx={{ my: 3 }}>
      <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#1cb4ac' }}>▼ 出力例</Typography>
      <Box component="pre" sx={{ ...mono, lineHeight: 1.75, m: 0, mt: 0.5, p: 2.5, bgcolor: 'rgba(28,180,172,0.1)', color: '#c4f6f2', border: 1, borderColor: 'rgba(28,180,172,0.35)', borderLeft: 6, borderLeftColor: '#1cb4ac', borderRadius: 1, overflow: 'auto' }}>{code}</Box>
    </Box>
  );
}

// 節（■ 大見出し）: 薄い青の帯に太い左線。参考書の「節」の見出し。
export const H = ({ children }: { children: ReactNode }) => <Typography component="h2" sx={{ fontSize: '1.4rem', fontWeight: 700, mt: 8, mb: 2.5, px: 2, py: 1, color: '#fff', bgcolor: 'rgba(108,0,220,0.3)', borderLeft: 8, borderColor: '#1cb4ac', borderRadius: '0 6px 6px 0' }}>{children}</Typography>;
// 項（小見出し）: 下線つき。先頭に ■ を付ける。
export const H3 = ({ children }: { children: ReactNode }) => <Typography component="h3" sx={{ fontSize: '1.15rem', fontWeight: 700, mt: 5, mb: 1.5, pb: 0.5, color: 'text.primary', borderBottom: 2, borderColor: 'rgba(181,131,242,0.55)', '&::before': { content: '"■ "', color: '#1cb4ac' } }}>{children}</Typography>;
// 目（さらに小さい見出し）: 先頭に ▶ を付ける。
export const H4 = ({ children }: { children: ReactNode }) => <Typography component="h4" sx={{ fontSize: '1rem', fontWeight: 700, mt: 3.5, mb: 0.75, color: 'primary.light', '&::before': { content: '"▶ "', color: '#1cb4ac', fontSize: '0.85em' } }}>{children}</Typography>;
export const P = ({ children }: { children: ReactNode }) => <Typography sx={{ my: 1.5, lineHeight: 2, letterSpacing: '0.02em' }}>{children}</Typography>;
export const Ext = ({ href, children }: { href: string; children?: ReactNode }) => (
  <Link href={href} target="_blank" rel="noopener noreferrer">{children ?? href}</Link>
);
