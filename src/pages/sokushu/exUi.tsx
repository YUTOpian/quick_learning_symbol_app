import { useState } from 'react';
import type { ReactNode } from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Alert, Box, Button, Checkbox, Chip, FormControlLabel, Radio, RadioGroup, Typography } from '@mui/material';
import { mono } from './ui';
import type { Ver } from './Ch02';
import type { Quiz } from './ch15/quiz';

// 演習編の各章（演習1章〜、総合演習）で共通に使う部品。

// v2 / v3 でコードが違う箇所は、選択中のバージョンだけを表示する。
export const Pick = ({ ver, v2, v3 }: { ver: Ver; v2: ReactNode; v3: ReactNode }) => <>{ver === 'v2' ? v2 : v3}</>;
// 本文中のインラインコード。
export const C = ({ children }: { children: ReactNode }) => <Box component="code" sx={{ ...mono, bgcolor: 'action.hover', px: 0.6, py: 0.1, borderRadius: 0.5 }}>{children}</Box>;
// 箇条書き。
export const Ul = ({ children }: { children: ReactNode }) => <Box component="ul" sx={{ my: 0.5, pl: 3, lineHeight: 1.95 }}>{children}</Box>;
export const Li = ({ children }: { children: ReactNode }) => <Box component="li">{children}</Box>;
// 章末問題（Exercise.tsx）と同じ見た目の、開閉できる枠。
export const Fold = ({ title, defaultExpanded, children }: { title: string; defaultExpanded?: boolean; children: ReactNode }) => (
  <Accordion disableGutters variant="outlined" defaultExpanded={defaultExpanded} sx={{ my: 1 }}>
    <AccordionSummary><Typography sx={{ fontWeight: 700 }}>{title}</Typography></AccordionSummary>
    <AccordionDetails>{children}</AccordionDetails>
  </Accordion>
);
// 問題文（ミッション）。章末問題の「問題」と同じ見た目にそろえる。
export const Mission = ({ children, label = 'ミッション' }: { children: ReactNode; label?: string }) => (
  <Box sx={{ my: 1.5, p: 2, border: 1, borderColor: 'divider', borderLeft: 4, borderLeftColor: 'primary.main', borderRadius: 1, bgcolor: 'action.hover' }}>
    <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary', mb: 0.5 }}>{label}</Typography>
    <Typography component="div" sx={{ lineHeight: 1.9 }}>{children}</Typography>
  </Box>
);

// ハンズオン演習の枠。難易度（★）、使う章、「できた」のチェックを添える。
export const Task = ({ no, title, stars, chapters, done, onDone, children }: {
  no: number; title: string; stars: number; chapters: number[]; done: boolean; onDone: (v: boolean) => void; children: ReactNode;
}) => (
  <Box sx={{ mt: 5, mb: 2, p: { xs: 1.5, md: 2.5 }, border: 1, borderColor: done ? 'success.main' : 'divider', borderRadius: 2 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
      <Chip size="small" color="primary" label={`演習${no}`} />
      <Chip size="small" variant="outlined" label={`難易度 ${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}`} />
      {chapters.map((c) => <Chip key={c} size="small" variant="outlined" label={`第${c}章`} />)}
      {done && <Chip size="small" color="success" label="できた" />}
    </Box>
    <Typography component="h3" sx={{ fontSize: '1.25rem', fontWeight: 700, mt: 1.5 }}>{title}</Typography>
    {children}
    <FormControlLabel sx={{ mt: 1 }} control={<Checkbox checked={done} onChange={(e) => onDone(e.target.checked)} />} label="できた（答え合わせが ✅ になった）" />
  </Box>
);

// クイズ1問。回答するとその場で正誤と解説を表示し、回答は保存される。
export const QuizCard = ({ q, no, answered, onAnswer }: { q: Quiz; no: number; answered: number | undefined; onAnswer: (a: number) => void }) => {
  const [pick, setPick] = useState('');
  const done = answered !== undefined;
  const ok = done && answered === q.answer;
  return (
    <Box sx={{ my: 2.5, p: 2, border: 1, borderColor: done ? (ok ? 'success.main' : 'error.main') : 'divider', borderRadius: 2 }}>
      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
        <Chip size="small" color="primary" label={`問${no}`} />
        <Chip size="small" variant="outlined" label={`第${q.ch}章`} />
      </Box>
      <Typography sx={{ fontWeight: 700, lineHeight: 1.8 }}>{q.q}</Typography>
      <RadioGroup value={done ? String(answered) : pick} onChange={(e) => setPick(e.target.value)}>
        {q.options.map((o, i) => <FormControlLabel key={o} value={String(i)} disabled={done} control={<Radio size="small" />} label={o} />)}
      </RadioGroup>
      {!done ? (
        <Button size="small" variant="contained" disabled={pick === ''} onClick={() => onAnswer(Number(pick))}>答え合わせ</Button>
      ) : (
        <Alert severity={ok ? 'success' : 'error'} sx={{ mt: 1 }}>
          <strong>{ok ? '正解です。' : `不正解です。正解は「${q.options[q.answer]}」です。`}</strong>
          <Box sx={{ mt: 0.5, lineHeight: 1.8 }}>{q.exp}</Box>
        </Alert>
      )}
    </Box>
  );
};

// 例題の枠。解き方まで示す（練習問題の前に置く）。
export const Example = ({ title, children }: { title: string; children: ReactNode }) => (
  <Box sx={{ mt: 2, mb: 1, p: { xs: 1.5, md: 2 }, border: 1, borderColor: 'info.main', borderRadius: 2 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
      <Chip size="small" color="info" label="例題" />
      <Typography sx={{ fontWeight: 700 }}>{title}</Typography>
    </Box>
    {children}
  </Box>
);
// 練習問題の見出し。
export const PracticeHead = () => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 3 }}>
    <Chip size="small" color="primary" variant="outlined" label="練習問題" />
    <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>例題の解き方を参考に、自分で書いてみましょう。</Typography>
  </Box>
);
