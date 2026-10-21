import type { ReactNode } from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Box, Typography } from '@mui/material';
import { Code, H, H3, P } from './ui';
import type { Ver } from './Ch02';
import { EX } from './exercises';
import type { Item } from './exercises';

const Fold = ({ title, defaultExpanded, children }: { title: string; defaultExpanded?: boolean; children: ReactNode }) => (
  <Accordion disableGutters variant="outlined" defaultExpanded={defaultExpanded} sx={{ my: 1 }}>
    <AccordionSummary><Typography sx={{ fontWeight: 700 }}>{title}</Typography></AccordionSummary>
    <AccordionDetails>{children}</AccordionDetails>
  </Accordion>
);

// 問題文。条件があれば箇条書きで添える。
const Question = ({ item }: { item: Item }) => (
  <Box sx={{ my: 1.5, p: 2, border: 1, borderColor: 'divider', borderLeft: 4, borderLeftColor: 'primary.main', borderRadius: 1, bgcolor: 'action.hover' }}>
    <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary', mb: 0.5 }}>問題</Typography>
    <Typography sx={{ lineHeight: 1.9 }}>{item.q}</Typography>
    {item.conds && (
      <Box component="ul" sx={{ my: 0.5, pl: 3 }}>
        {item.conds.map((c) => <Box component="li" key={c} sx={{ lineHeight: 1.8 }}>{c}</Box>)}
      </Box>
    )}
  </Box>
);

// 解答のコード（v2 / v3 で選択中のほう）と、解説。
const Answer = ({ item, ver }: { item: Item; ver: Ver }) => {
  const src = ver === 'v2' ? item.v2 : item.v3;
  const list = Array.isArray(src) ? src : [src];
  return (
    <>
      {list.map((s, i) => <Code key={i} code={s} runnable={item.runnable !== false} />)}
      {item.note && <P>{item.note}</P>}
    </>
  );
};

// 章末問題。例題（解き方まで示す）1つと、練習問題（自分で解く）1つ。
export default function Exercise({ ver, no }: { ver: Ver; no: number }) {
  const ex = EX[no];
  if (!ex) return null;
  const { example, practice } = ex;
  return (
    <>
      <H>章末問題</H>
      <P>この章の内容を確認する問題です。まず例題で解き方を確認してから、練習問題に挑戦してみましょう。コードはボタンからコンソールで実行できます。</P>

      <H3>{`例題：${example.title}`}</H3>
      <Question item={example} />
      <Fold title="解答と解説" defaultExpanded>
        <Answer item={example} ver={ver} />
      </Fold>

      <H3>{`練習問題：${practice.title}`}</H3>
      <Question item={practice} />
      {practice.hint && <Fold title="ヒント"><P>{practice.hint}</P></Fold>}
      <Fold title="解答例（まず自分で試してから開きましょう）">
        <Answer item={practice} ver={ver} />
      </Fold>
    </>
  );
}
