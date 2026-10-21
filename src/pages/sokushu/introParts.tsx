import type { ReactNode } from 'react';
import { Box } from '@mui/material';

// 入門講座（Intro.tsx / Js1.tsx）で共通に使う本文の部品。
export const Ul = ({ items }: { items: string[] }) => (
  <Box component="ul" sx={{ my: 1.25, pl: 3, lineHeight: 1.95 }}>{items.map((t) => <li key={t}>{t}</li>)}</Box>
);
export const B = ({ children }: { children: ReactNode }) => <Box component="strong" sx={{ fontWeight: 700, color: 'primary.light' }}>{children}</Box>;
const NOTE = {
  goal: ['この節のゴール', '#c9a0ff', 'rgba(108,0,220,0.24)', '🎯'],
  point: ['ポイント', '#1cb4ac', 'rgba(28,180,172,0.13)', '💡'],
  ex: ['例', '#78b4e0', 'rgba(120,180,224,0.13)', '📝'],
  warn: ['つまずき注意', '#f4a800', 'rgba(244,168,0,0.12)', '⚠️'],
  story: ['小噺', '#d79bff', 'rgba(215,155,255,0.12)', '📖'],
} as const;
export const Note = ({ kind, children }: { kind: keyof typeof NOTE; children: ReactNode }) => (
  <Box sx={{ my: 3, p: 2, pl: 2.5, border: 1, borderLeft: 8, borderColor: NOTE[kind][1], bgcolor: NOTE[kind][2], borderRadius: 1 }}>
    <Box sx={{ fontWeight: 800, fontSize: '0.95rem', color: NOTE[kind][1], mb: 0.5 }}>{NOTE[kind][3]} {NOTE[kind][0]}</Box>
    <Box sx={{ lineHeight: 1.9 }}>{children}</Box>
  </Box>
);
// 表。列ごとに内容の長さを見て、短い列（見出し・章番号・略称など）は折り返さず、いちばん長い列に幅を回す。
// 全角は半角2つ分として数える。
const wlen = (t: string) => Array.from(t).reduce((n, ch) => n + (ch.charCodeAt(0) > 0x2e7f ? 2 : 1), 0);
export const Tbl = ({ head, rows }: { head: string[]; rows: string[][] }) => {
  const widths = head.map((h, j) => Math.max(wlen(h), ...rows.map((r) => wlen(r[j] ?? ''))));
  const widest = widths.indexOf(Math.max(...widths));
  const cellStyle = (j: number) => (j !== widest && widths[j] <= 32 ? { whiteSpace: 'nowrap' as const } : { minWidth: '12em' });
  return (
    <Box sx={{ overflowX: 'auto', my: 3 }}>
      <Box component="table" sx={{ borderCollapse: 'collapse', width: '100%', fontSize: '0.95rem', lineHeight: 1.8,
        '& th, & td': { border: 1, borderColor: 'divider', px: 2, py: 1.25, textAlign: 'left', verticalAlign: 'top' },
        '& th': { bgcolor: '#6c00dc', color: '#fff', fontWeight: 700 },
        '& tbody tr:nth-of-type(even)': { bgcolor: 'rgba(255,255,255,0.04)' },
        '& td:first-of-type': { fontWeight: 700, bgcolor: 'rgba(108,0,220,0.2)' } }}>
        <thead><tr>{head.map((h, j) => <th key={h} style={cellStyle(j)}>{h}</th>)}</tr></thead>
        <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} style={cellStyle(j)}>{c}</td>)}</tr>)}</tbody>
      </Box>
    </Box>
  );
};
export const Q = ({ q, a }: { q: string; a: string }) => (
  <Box sx={{ my: 1.5 }}>
    <Box sx={{ fontWeight: 700 }}>問. {q}</Box>
    <Box component="details" sx={{ mt: 0.5, color: 'text.secondary' }}><summary style={{ cursor: 'pointer' }}>答えを見る</summary><Box sx={{ mt: 0.5 }}>{a}</Box></Box>
  </Box>
);
export const L = (...lines: string[]) => lines.join('\n');
