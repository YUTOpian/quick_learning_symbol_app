// 第1章の図解。すべてSVGで描き、文字色はテーマの文字色（currentColor）に合わせる。
import type { ReactNode } from 'react';
import { Box } from '@mui/material';

// ── 配色（暗い地の紙面向け。塗りは同じ色に透明度を付けて作る）──
const BLUE = '#78aeff';
const GREEN = '#5fd38d';
const ORANGE = '#ffa75a';
const RED = '#ff8a96';
const PURPLE = '#cf9cff';
const CYAN = '#1cb4ac';
const GRAY = '#a095c0';
const tint = (c: string, a = '33') => c + a;

// ── 共通部品 ──
export function Fig({ title, caption, w, h, children, max = 680 }: { title: string; caption?: ReactNode; w: number; h: number; children: ReactNode; max?: number }) {
  return (
    <Box component="figure" sx={{ my: 2.5, mx: 0, p: 1.5, border: 1, borderColor: 'divider', borderRadius: 1, bgcolor: 'rgba(9,3,25,0.6)', boxShadow: 'none' }}>
      <Box sx={{ fontWeight: 800, fontSize: '0.9rem', mb: 1, color: 'primary.light' }}>図　{title}</Box>
      <Box component="svg" viewBox={`0 0 ${w} ${h}`} role="img" aria-label={title} sx={{ display: 'block', width: '100%', maxWidth: max, height: 'auto', mx: 'auto', color: 'text.primary' }}>
        {children}
      </Box>
      {caption && <Box component="figcaption" sx={{ mt: 1, fontSize: '0.85rem', lineHeight: 1.8, color: 'text.secondary' }}>{caption}</Box>}
    </Box>
  );
}

type TProps = { x: number; y: number; children: ReactNode; size?: number; anchor?: 'start' | 'middle' | 'end'; fill?: string; bold?: boolean; dim?: boolean; mono?: boolean };
const T = ({ x, y, children, size = 14, anchor = 'middle', fill = 'currentColor', bold, dim, mono }: TProps) => (
  <text x={x} y={y} fontSize={size} textAnchor={anchor} fill={fill} fillOpacity={dim ? 0.7 : 1} fontWeight={bold ? 700 : 400} fontFamily={mono ? 'Consolas, Menlo, monospace' : undefined}>{children}</text>
);

function Arrow({ x1, y1, x2, y2, c = 'currentColor', dash, w = 2, head = 9 }: { x1: number; y1: number; x2: number; y2: number; c?: string; dash?: boolean; w?: number; head?: number }) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const ca = Math.cos(a), sa = Math.sin(a);
  const bx = x2 - head * ca, by = y2 - head * sa;
  const pts = `${x2},${y2} ${bx + (head / 2) * sa},${by - (head / 2) * ca} ${bx - (head / 2) * sa},${by + (head / 2) * ca}`;
  return (
    <g>
      <line x1={x1} y1={y1} x2={bx + ca} y2={by + sa} stroke={c} strokeWidth={w} strokeDasharray={dash ? '6 4' : undefined} strokeOpacity={c === 'currentColor' ? 0.7 : 1} />
      <polygon points={pts} fill={c} fillOpacity={c === 'currentColor' ? 0.7 : 1} />
    </g>
  );
}

function Bx({ x, y, w, h, lines, c = GRAY, size = 14, bold, dash, rx = 8, filled = true, mono }: { x: number; y: number; w: number; h: number; lines: string[]; c?: string; size?: number; bold?: boolean; dash?: boolean; rx?: number; filled?: boolean; mono?: boolean }) {
  const lh = size * 1.4;
  const y0 = y + h / 2 - ((lines.length - 1) * lh) / 2 + size * 0.35;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={rx} fill={filled ? tint(c) : 'none'} stroke={c} strokeWidth={1.5} strokeDasharray={dash ? '5 4' : undefined} />
      {lines.map((s, i) => <T key={i} x={x + w / 2} y={y0 + i * lh} size={size} bold={bold && i === 0} mono={mono}>{s}</T>)}
    </g>
  );
}

// 1ビット分のマス
const Cell = ({ x, y, w, h, v, c = BLUE, size = 20 }: { x: number; y: number; w: number; h: number; v: string; c?: string; size?: number }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx={5} fill={v === '1' ? tint(c, '55') : 'rgba(255,255,255,0.07)'} stroke={v === '1' ? c : GRAY} strokeWidth={1.5} />
    <T x={x + w / 2} y={y + h / 2 + size * 0.35} size={size} bold mono>{v}</T>
  </g>
);

// ── 1.1 章の地図 ──
export function FigMap() {
  const bw = 130, bh = 54, gx = 158, x0 = 18;
  const row1 = [['剰余', '3.3'], ['逆元', '3.4'], ['べき乗剰余', '3.5'], ['素数と有限体', '3.6']];
  const row2 = [['離散対数', '3.8'], ['楕円曲線', '3.9'], ['Ed25519', '3.13']];
  const y1 = 80, y2 = 172;
  return (
    <Fig title="この章の道筋（上から下、左から右へ積み上げる）" w={640} h={248} caption="ここまでの言葉（進数・集合・体）を土台に、剰余 → 逆元 → 有限体 → 楕円曲線と進み、最後に電子署名（Ed25519）の計算にたどり着きます。">
      <Bx x={x0} y={8} w={604} h={38} c={GRAY} lines={['土台の言葉：進数・ビット・BigInt（第2章）／ 集合・元・体（3.2）']} size={14} />
      <Arrow x1={x0 + 65} y1={46} x2={x0 + 65} y2={y1} />
      {row1.map(([n, s], i) => <Bx key={n} x={x0 + i * gx} y={y1} w={bw} h={bh} c={BLUE} lines={[n, s]} bold />)}
      {[0, 1, 2].map((i) => <Arrow key={i} x1={x0 + i * gx + bw} y1={y1 + bh / 2} x2={x0 + (i + 1) * gx} y2={y1 + bh / 2} />)}
      <Arrow x1={x0 + 3 * gx + bw / 2} y1={y1 + bh} x2={x0 + 3 * gx + bw / 2} y2={y2} />
      {row2.map(([n, s], i) => <Bx key={n} x={x0 + (3 - i) * gx} y={y2} w={bw} h={bh} c={ORANGE} lines={[n, s]} bold />)}
      <Bx x={x0} y={y2} w={bw} h={bh} c={GREEN} lines={['電子署名', '（Ed25519）']} bold />
      {[0, 1, 2].map((i) => <Arrow key={i} x1={x0 + (3 - i) * gx} y1={y2 + bh / 2} x2={x0 + (2 - i) * gx + bw} y2={y2 + bh / 2} />)}
    </Fig>
  );
}

// ── 1.2 2進数の重みと16進数 ──
export function FigBinary() {
  const bits = ['1', '1', '0', '1'];
  const wts = [8, 4, 2, 1];
  const cx = (i: number) => 150 + i * 70;
  const hb = ['1', '0', '1', '0', '1', '1', '1', '1'];
  const hx = (i: number) => 150 + i * 44 + (i >= 4 ? 24 : 0);
  return (
    <Fig title="2進数は「桁の重み」の足し算／16進数は4ビットで1文字" w={640} h={330}>
      <T x={10} y={20} anchor="start" bold>① 2進数 1101 を10進数にする</T>
      <T x={10} y={52} anchor="start" size={13} dim>桁の重み</T>
      <T x={10} y={92} anchor="start" size={13} dim>ビット</T>
      <T x={10} y={146} anchor="start" size={13} dim>重み × ビット</T>
      {bits.map((b, i) => (
        <g key={i}>
          <T x={cx(i) + 28} y={52} bold fill={BLUE}>{wts[i]}</T>
          <Cell x={cx(i)} y={64} w={56} h={40} v={b} />
          <T x={cx(i) + 28} y={146} bold dim={b === '0'}>{wts[i] * Number(b)}</T>
          {i < 3 && <T x={cx(i) + 63} y={146} dim>＋</T>}
        </g>
      ))}
      <T x={cx(3) + 76} y={146} anchor="start" bold>＝ 13</T>
      <line x1={10} y1={176} x2={630} y2={176} stroke="currentColor" strokeOpacity={0.2} />
      <T x={10} y={204} anchor="start" bold>② 2進数 1010 1111 を16進数にする（4桁ずつ区切る）</T>
      {hb.map((b, i) => <Cell key={i} x={hx(i)} y={218} w={38} h={36} v={b} c={i < 4 ? ORANGE : GREEN} size={18} />)}
      <path d={`M ${hx(0)} 262 v 6 h ${hx(3) + 38 - hx(0)} v -6`} fill="none" stroke={ORANGE} strokeWidth={1.5} />
      <path d={`M ${hx(4)} 262 v 6 h ${hx(7) + 38 - hx(4)} v -6`} fill="none" stroke={GREEN} strokeWidth={1.5} />
      <T x={(hx(0) + hx(3) + 38) / 2} y={288} size={13} dim>1010 ＝ 10 ＝ A</T>
      <T x={(hx(4) + hx(7) + 38) / 2} y={288} size={13} dim>1111 ＝ 15 ＝ F</T>
      <T x={(hx(0) + hx(3) + 38) / 2} y={316} bold size={20} fill={ORANGE} mono>A</T>
      <T x={(hx(4) + hx(7) + 38) / 2} y={316} bold size={20} fill={GREEN} mono>F</T>
      <T x={hx(7) + 52} y={316} anchor="start" bold>＝ 16進数 AF</T>
    </Fig>
  );
}

// ── 1.2 エンディアン ──
export function FigEndian() {
  const bx = (i: number) => 190 + i * 130;
  const big = [['0F', BLUE, '上の桁'], ['42', GRAY, '真ん中'], ['40', ORANGE, '下の桁']];
  const lit = [big[2], big[1], big[0]];
  const row = (y: number, items: string[][], name: string, sub: string) => (
    <g>
      <T x={10} y={y + 20} anchor="start" bold size={14}>{name}</T>
      <T x={10} y={y + 38} anchor="start" size={12} dim>{sub}</T>
      {items.map(([v, c, d], i) => (
        <g key={i}>
          <Bx x={bx(i)} y={y} w={116} h={46} c={c} lines={[v]} bold size={22} mono />
          <T x={bx(i) + 58} y={y + 64} size={12} dim>{d}</T>
        </g>
      ))}
    </g>
  );
  return (
    <Fig title="1000000（16進数 0F4240）をバイト列に並べる" w={640} h={236} caption="同じ数でも、並べる順番が逆になります。多くのコンピューターが使うのはリトルエンディアン（下の桁から）です。">
      <T x={10} y={18} anchor="start" size={13} dim>メモリの番地：</T>
      {[0, 1, 2].map((i) => <T key={i} x={bx(i) + 58} y={18} size={13} dim>{i}番地</T>)}
      {row(30, big, 'ビッグエンディアン', '上の桁から並べる')}
      {row(138, lit, 'リトルエンディアン', '下の桁から並べる')}
    </Fig>
  );
}

// ── 1.3 ビット演算 ──
export function FigBitOps() {
  const a = '1100', b = '1010';
  const op = (f: (x: number, y: number) => number) => a.split('').map((ch, i) => String(f(Number(ch), Number(b[i])))).join('');
  const rows: { name: string; v: string; c: string; note: string }[] = [
    { name: 'a', v: a, c: BLUE, note: '' },
    { name: 'b', v: b, c: BLUE, note: '' },
    { name: 'a ＆ b（AND）', v: op((x, y) => x & y), c: GREEN, note: '両方1のときだけ1　→ 調べる' },
    { name: 'a | b（OR）', v: op((x, y) => x | y), c: ORANGE, note: 'どちらか1なら1　→ 入れる' },
    { name: 'a ^ b（XOR）', v: op((x, y) => x ^ y), c: PURPLE, note: '違うときだけ1　→ 反転・差分' },
  ];
  return (
    <Fig title="ビット演算：スイッチを1つずつ見比べる（4ビットの例）" w={640} h={238}>
      {rows.map((r, i) => {
        const y = 12 + i * 44 + (i >= 2 ? 10 : 0);
        return (
          <g key={r.name}>
            <T x={10} y={y + 26} anchor="start" bold size={14} fill={r.c}>{r.name}</T>
            {r.v.split('').map((ch, j) => <Cell key={j} x={190 + j * 48} y={y} w={40} h={36} v={ch} c={r.c} />)}
            <T x={400} y={y + 24} anchor="start" size={13} dim>{r.note}</T>
          </g>
        );
      })}
      <line x1={10} y1={100} x2={630} y2={100} stroke="currentColor" strokeOpacity={0.2} />
    </Fig>
  );
}

// ── 1.3 フラグ ──
export function FigPerm() {
  const fl = [{ n: 'read', w: 4, on: true }, { n: 'write', w: 2, on: true }, { n: 'exec', w: 1, on: false }];
  const x = (i: number) => 90 + i * 170;
  return (
    <Fig title="フラグ：3つのスイッチを1つの整数にまとめる（権限の例）" w={640} h={260} caption="ONのスイッチの重みを足した値（ここでは 4 ＋ 2 ＝ 6）を、1つの整数として持ちます。調べるときは「その重みとのAND」が0かどうかを見ます。">
      {fl.map((f, i) => (
        <g key={f.n}>
          <T x={x(i) + 35} y={24} size={13} bold fill={f.on ? GREEN : GRAY}>{f.n}</T>
          <rect x={x(i)} y={40} width={70} height={34} rx={17} fill={f.on ? tint(GREEN, '66') : 'rgba(255,255,255,0.07)'} stroke={f.on ? GREEN : GRAY} strokeWidth={1.5} />
          <circle cx={f.on ? x(i) + 53 : x(i) + 17} cy={57} r={12} fill={f.on ? GREEN : GRAY} />
          <T x={x(i) + 35} y={96} size={13} dim>重み {f.w}</T>
          <T x={x(i) + 35} y={124} size={22} bold mono fill={f.on ? GREEN : 'currentColor'}>{f.on ? '1' : '0'}</T>
        </g>
      ))}
      <T x={320} y={160} size={17} bold>110（2進数）＝ 4 ＋ 2 ＝ 6</T>
      <Bx x={60} y={180} w={240} h={54} c={GREEN} lines={['6 ＆ 2 ＝ 2（0でない）', '→ 書き込める']} size={13} />
      <Bx x={340} y={180} w={240} h={54} c={RED} lines={['6 ＆ 1 ＝ 0', '→ 実行はできない']} size={13} />
    </Fig>
  );
}

export function FigFlags() {
  const fl = [{ n: 'revokable', w: 8, on: false }, { n: 'restrictable', w: 4, on: false }, { n: 'transferable', w: 2, on: true }, { n: 'supplyMutable', w: 1, on: true }];
  const x = (i: number) => 40 + i * 150;
  return (
    <Fig title="モザイクのフラグ：4つのスイッチを1つの整数にまとめる" w={640} h={260} caption="ONのスイッチの重みを足した値（ここでは 2 ＋ 1 ＝ 3）を、モザイクの性質として持ちます。調べるときは「その重みとのAND」が0かどうかを見ます。">
      {fl.map((f, i) => (
        <g key={f.n}>
          <T x={x(i) + 35} y={24} size={13} bold fill={f.on ? GREEN : GRAY}>{f.n}</T>
          <rect x={x(i)} y={40} width={70} height={34} rx={17} fill={f.on ? tint(GREEN, '66') : 'rgba(255,255,255,0.07)'} stroke={f.on ? GREEN : GRAY} strokeWidth={1.5} />
          <circle cx={f.on ? x(i) + 53 : x(i) + 17} cy={57} r={12} fill={f.on ? GREEN : GRAY} />
          <T x={x(i) + 35} y={96} size={13} dim>重み {f.w}</T>
          <T x={x(i) + 35} y={124} size={22} bold mono fill={f.on ? GREEN : 'currentColor'}>{f.on ? '1' : '0'}</T>
        </g>
      ))}
      <T x={320} y={160} size={17} bold>0011（2進数）＝ 2 ＋ 1 ＝ 3</T>
      <Bx x={60} y={180} w={240} h={54} c={GREEN} lines={['3 ＆ 2 ＝ 2（0でない）', '→ 譲渡できる']} size={13} />
      <Bx x={340} y={180} w={240} h={54} c={RED} lines={['3 ＆ 4 ＝ 0', '→ 制限は設定できない']} size={13} />
    </Fig>
  );
}

// ── 1.4 集合の演算（ベン図）──
export function FigSets() {
  const panel = (ox: number, mode: 'u' | 'i' | 'd', title: string) => {
    const ay = 78, ax = ox + 78, bx = ox + 134, r = 54;
    const id = 'fs-' + mode;
    return (
      <g key={mode}>
        <defs>
          <clipPath id={id + '-c'}><circle cx={ax} cy={ay} r={r} /></clipPath>
          <mask id={id + '-m'}>
            <rect x={ox} y={0} width={214} height={170} fill="black" />
            <circle cx={ax} cy={ay} r={r} fill="white" />
            <circle cx={bx} cy={ay} r={r} fill="black" />
          </mask>
        </defs>
        {mode === 'u' && <><circle cx={ax} cy={ay} r={r} fill={tint(ORANGE, '55')} /><circle cx={bx} cy={ay} r={r} fill={tint(ORANGE, '55')} /></>}
        {mode === 'i' && <circle cx={bx} cy={ay} r={r} fill={tint(ORANGE, '77')} clipPath={`url(#${id}-c)`} />}
        {mode === 'd' && <rect x={ox} y={0} width={214} height={170} fill={tint(ORANGE, '77')} mask={`url(#${id}-m)`} />}
        <circle cx={ax} cy={ay} r={r} fill="none" stroke={BLUE} strokeWidth={2} />
        <circle cx={bx} cy={ay} r={r} fill="none" stroke={GREEN} strokeWidth={2} />
        <T x={ax - 30} y={ay - 62} bold fill={BLUE}>A</T>
        <T x={bx + 30} y={ay - 62} bold fill={GREEN}>B</T>
        <T x={ax - 24} y={ay + 6} size={17} bold>2</T>
        <T x={(ax + bx) / 2} y={ay - 6} size={17} bold>3</T>
        <T x={(ax + bx) / 2} y={ay + 20} size={17} bold>5</T>
        <T x={bx + 24} y={ay + 6} size={17} bold>7</T>
        <T x={ox + 107} y={158} bold fill={ORANGE}>{title}</T>
      </g>
    );
  };
  return (
    <Fig title="集合の演算（A ＝ {2, 3, 5}、B ＝ {3, 5, 7}）" w={640} h={176} caption="色を付けた部分が、それぞれの演算の結果です。">
      {panel(0, 'u', 'A ∪ B ＝ {2, 3, 5, 7}')}
      {panel(213, 'i', 'A ∩ B ＝ {3, 5}')}
      {panel(426, 'd', 'A − B ＝ {2}')}
    </Fig>
  );
}

// ── 1.4 体と有限体の関係 ──
export function FigField() {
  return (
    <Fig title="体と有限体の関係" w={640} h={310} caption="「体」は四則演算ができる集合の総称です。その中で、元の個数が有限個のものが「有限体」で、素数 p について ℤₚ に mod p の演算を備えたものが GF(p) です（3.6）。">
      <rect x={176} y={10} width={454} height={290} rx={12} fill={tint(BLUE, '14')} stroke={BLUE} strokeWidth={2} />
      <T x={193} y={36} anchor="start" bold size={15} fill={BLUE}>体：足す・引く・掛ける・割るができる集合</T>
      <Bx x={192} y={54} w={190} h={126} c={GRAY} lines={['有理数ℚ・実数ℝ', '', '元の個数は無限']} />
      <rect x={398} y={54} width={216} height={226} rx={10} fill={tint(ORANGE, '1f')} stroke={ORANGE} strokeWidth={2} />
      <T x={506} y={80} bold fill={ORANGE}>有限体</T>
      <T x={506} y={100} size={13} dim>元の個数が有限個の体</T>
      <Bx x={412} y={116} w={188} h={74} c={GREEN} lines={['GF(p) ＝ ℤₚ', 'p は素数（3.6）', '例：GF(7)']} size={13} bold />
      <T x={506} y={220} size={13}>暗号で使うのは</T>
      <T x={506} y={240} size={13}>この有限体の方</T>
      <T x={506} y={262} size={12} dim>（GF(2²⁵⁵−19) など）</T>
      <Bx x={10} y={54} w={150} h={226} c={RED} dash filled={false} lines={['体ではない例', '', 'ℤ（整数）', '1 ÷ 2 が', '整数でない', '', 'ℤ₆', '2 に逆元がない']} size={13} />
    </Fig>
  );
}

// ── 1.5 時計と「折り返し」──
export function FigMod() {
  const cx = 112, cy = 120, R = 66;
  const pos = (h: number, r: number) => [cx + r * Math.cos(((h * 30 - 90) * Math.PI) / 180), cy + r * Math.sin(((h * 30 - 90) * Math.PI) / 180)];
  const cols = [BLUE, GREEN, ORANGE, PURPLE, CYAN];
  const gx = (c: number) => 292 + c * 68;
  const [s10x, s10y] = pos(10, R);
  const [s3x, s3y] = pos(3, R);
  return (
    <Fig title="剰余は「一周したら0に戻る」計算" w={680} h={268} caption="時計は12で一周するので、15時は3時と同じ位置です。右の表は、整数を5個ずつ折り返して並べたもので、同じ列（同じ余り）の数どうしが「合同」です。">
      <circle cx={cx} cy={cy} r={R + 20} fill="rgba(255,255,255,0.07)" stroke="currentColor" strokeOpacity={0.5} strokeWidth={2} />
      {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => {
        const [x, y] = pos(h, R);
        const hi = h === 10 || h === 3;
        return (
          <g key={h}>
            {hi && <circle cx={x} cy={y} r={14} fill={tint(ORANGE, '66')} stroke={ORANGE} strokeWidth={1.5} />}
            <T x={x} y={y + 5} size={14} bold={hi}>{h}</T>
          </g>
        );
      })}
      <path d={`M ${cx + 36 * Math.cos((210 * Math.PI) / 180)} ${cy + 36 * Math.sin((210 * Math.PI) / 180)} A 36 36 0 0 1 ${cx + 36} ${cy}`} fill="none" stroke={ORANGE} strokeWidth={2} />
      <Arrow x1={cx + 36} y1={cy - 6} x2={cx + 36} y2={cy + 2} c={ORANGE} head={8} />
      <T x={cx} y={cy + 4} size={11} dim fill={ORANGE}>＋5時間</T>
      <T x={s10x} y={s10y - 20} size={11} dim>10時</T>
      <T x={s3x + 30} y={s3y + 4} size={11} dim>3時</T>
      <T x={cx} y={218} size={13}>10時 ＋ 5時間 ＝ 15時</T>
      <T x={cx} y={238} size={13} bold fill={ORANGE}>15 mod 12 ＝ 3（時）</T>
      <T x={gx(2) + 30} y={22} bold>5個ずつ折り返して並べる（mod 5）</T>
      {cols.map((c, i) => <T key={i} x={gx(i) + 28} y={46} size={13} bold fill={c}>余り {i}</T>)}
      {Array.from({ length: 20 }, (_, n) => {
        const c = n % 5, r = Math.floor(n / 5);
        const hi = c === 2;
        return (
          <g key={n}>
            <rect x={gx(c)} y={56 + r * 38} width={56} height={32} rx={5} fill={tint(cols[c], hi ? '66' : '22')} stroke={cols[c]} strokeWidth={hi ? 2 : 1} />
            <T x={gx(c) + 28} y={78 + r * 38} size={15} bold={hi}>{n}</T>
          </g>
        );
      })}
      <T x={gx(2) + 30} y={226} size={13}>17 ＝ 5 × 3 ＋ 2　なので　17 ≡ 2 (mod 5)</T>
      <T x={gx(2) + 30} y={246} size={12} dim>2、7、12、17 は同じ列 ＝ 互いに合同</T>
    </Fig>
  );
}

// ── 1.6 ℤ₁₁ の逆元ペア ──
export function FigInverse() {
  const n = 11, cw = 54, x0 = 22, top = 108, ch = 42;
  const cx = (i: number) => x0 + i * cw + (cw - 6) / 2;
  const pairs: [number, number, string][] = [[2, 6, BLUE], [3, 4, GREEN], [5, 9, ORANGE], [7, 8, PURPLE]];
  const self: [number, string][] = [[1, CYAN], [10, CYAN]];
  const colorOf = (i: number) => { const p = pairs.find((q) => q[0] === i || q[1] === i); if (p) return p[2]; const s = self.find((q) => q[0] === i); return s ? s[1] : RED; };
  return (
    <Fig title="ℤ₁₁ の逆元：掛けて 1 になる相手（mod 11）" w={640} h={170} caption="0以外のすべての元に、相手（逆元）がちょうど1つあります。0だけは、何を掛けても0なので逆元がありません。">
      {pairs.map(([a, b, c]) => {
        const d = b - a, ry = 20 + d * 10;
        return (
          <g key={a}>
            <path d={`M ${cx(a)} ${top} A ${(cx(b) - cx(a)) / 2} ${ry} 0 0 1 ${cx(b)} ${top}`} fill="none" stroke={c} strokeWidth={2} />
            <T x={(cx(a) + cx(b)) / 2} y={top - ry - 6} size={12} fill={c}>{a}×{b}＝{a * b}≡1</T>
          </g>
        );
      })}
      {self.map(([a, c]) => <T key={a} x={cx(a)} y={top - 10} size={12} fill={c}>{a}×{a}≡1</T>)}
      <T x={cx(0)} y={top - 10} size={12} fill={RED}>逆元なし</T>
      {Array.from({ length: n }, (_, i) => (
        <g key={i}>
          <rect x={x0 + i * cw} y={top} width={cw - 6} height={ch} rx={6} fill={tint(colorOf(i))} stroke={colorOf(i)} strokeWidth={1.5} />
          <T x={cx(i)} y={top + 27} size={18} bold>{i}</T>
        </g>
      ))}
    </Fig>
  );
}

// ── 1.7 繰り返し二乗法（3¹³ mod 17）──
export function FigPow() {
  const bx = (i: number) => 28 + i * 152;
  const items = [
    { e: '3¹', v: '3', use: true, bit: 1 },
    { e: '3²', v: '9', use: false, bit: 0 },
    { e: '3⁴', v: '13', use: true, bit: 1 },
    { e: '3⁸', v: '16', use: true, bit: 1 },
  ];
  return (
    <Fig title="繰り返し二乗法：3¹³ mod 17 を5回の掛け算で求める" w={640} h={300} caption="13 ＝ 8 ＋ 4 ＋ 1（2進数 1101）。2乗を3回で 3¹・3²・3⁴・3⁸ を作り、ビットが1のものだけを掛け合わせます。普通に13回掛けると12回の掛け算が必要です。">
      <T x={10} y={20} anchor="start" size={13} dim>(mod 17 の値)</T>
      {items.map((it, i) => (
        <g key={i}>
          <T x={bx(i) + 52} y={44} size={13} dim>指数 {1 << i}</T>
          <Bx x={bx(i)} y={54} w={104} h={56} c={it.use ? ORANGE : GRAY} lines={[it.e, '≡ ' + it.v]} bold />
          <T x={bx(i) + 52} y={134} size={13} fill={it.use ? ORANGE : GRAY} bold>{it.use ? 'ビット 1 → 使う' : 'ビット 0 → 使わない'}</T>
          {i < 3 && <><Arrow x1={bx(i) + 104} y1={82} x2={bx(i + 1)} y2={82} /><T x={bx(i) + 128} y={74} size={12} dim>2乗</T></>}
        </g>
      ))}
      {items.map((it, i) => it.use && <line key={'l' + i} x1={bx(i) + 52} y1={142} x2={bx(i) + 52} y2={170} stroke={ORANGE} strokeWidth={1.5} />)}
      <line x1={bx(0) + 52} y1={170} x2={bx(3) + 52} y2={170} stroke={ORANGE} strokeWidth={1.5} />
      <Arrow x1={(bx(0) + bx(3) + 104) / 2} y1={170} x2={(bx(0) + bx(3) + 104) / 2} y2={196} c={ORANGE} />
      <Bx x={90} y={200} w={460} h={80} c={GREEN} lines={['3¹ × 3⁴ × 3⁸ ＝ 3¹³', '3 × 13 ≡ 5、5 × 16 ≡ 12（mod 17）', '答え：3¹³ ≡ 12 (mod 17)']} size={14} bold />
    </Fig>
  );
}

// ── 1.8 ℤ₆ と ℤ₇ の掛け算表 ──
export function FigMul() {
  const table = (ox: number, n: number, title: string, good: boolean) => {
    const cw = 38;
    const rowsWith1 = (a: number) => Array.from({ length: n - 1 }, (_, k) => (a * (k + 1)) % n).includes(1);
    return (
      <g>
        <T x={ox + (cw * n) / 2} y={22} bold size={15} fill={good ? GREEN : RED}>{title}</T>
        <T x={ox + cw / 2} y={50} size={13} dim>×</T>
        {Array.from({ length: n - 1 }, (_, k) => k + 1).map((b) => <T key={'h' + b} x={ox + b * cw + cw / 2} y={50} size={14} bold fill={BLUE}>{b}</T>)}
        {Array.from({ length: n - 1 }, (_, k) => k + 1).map((a, ri) => {
          const y = 84 + ri * cw;
          return (
            <g key={'r' + a}>
              <T x={ox + cw / 2} y={y + 6} size={14} bold fill={BLUE}>{a}</T>
              {Array.from({ length: n - 1 }, (_, k) => k + 1).map((b) => {
                const v = (a * b) % n;
                const bad = v === 0, one = v === 1;
                return (
                  <g key={b}>
                    <rect x={ox + b * cw + 2} y={y - 16} width={cw - 4} height={cw - 6} rx={4} fill={bad ? tint(RED, '77') : one ? tint(GREEN, '66') : 'rgba(255,255,255,0.07)'} stroke={bad ? RED : one ? GREEN : GRAY} strokeOpacity={bad || one ? 1 : 0.4} />
                    <T x={ox + b * cw + cw / 2} y={y + 5} size={14} bold={bad || one}>{v}</T>
                  </g>
                );
              })}
              <T x={ox + n * cw + 8} y={y + 5} size={12} anchor="start" fill={rowsWith1(a) ? GREEN : RED}>{rowsWith1(a) ? '逆元あり' : '逆元なし'}</T>
            </g>
          );
        })}
      </g>
    );
  };
  return (
    <Fig title="掛け算表で見る「素数でないとなぜ困るか」" w={680} h={346} caption="ℤ₆ には 2 × 3 ≡ 0 のように「0でない数どうしを掛けて0になる」組があり、1が出ない行（逆元がない元）が生まれます。素数7ではすべての行に1が1つずつあり、割り算ができます。">
      {table(10, 6, 'ℤ₆（mod 6）：体ではない', false)}
      {table(350, 7, 'ℤ₇（mod 7）：有限体 GF(7)', true)}
      <T x={10} y={334} anchor="start" size={12} dim>赤＝0になってしまう組　緑＝掛けて1（逆元の組）</T>
    </Fig>
  );
}

// ── 1.9 / 1.10 一方向の計算 ──
export function FigOneWay({ title, left, right, fwd, back, caption, chips }: { title: string; left: string[]; right: string[]; fwd: string; back: string; caption?: ReactNode; chips?: { head: string; items: string[] } }) {
  const h = chips ? 232 : 140;
  return (
    <Fig title={title} w={640} h={h} caption={caption}>
      <Bx x={14} y={24} w={150} h={64} c={BLUE} lines={left} bold />
      <Bx x={476} y={24} w={150} h={64} c={ORANGE} lines={right} bold />
      <Arrow x1={170} y1={44} x2={470} y2={44} c={GREEN} w={3} />
      <T x={320} y={36} size={13} fill={GREEN} bold>{fwd}</T>
      <Arrow x1={470} y1={72} x2={170} y2={72} c={RED} dash w={3} />
      <T x={320} y={96} size={13} fill={RED} bold>{back}</T>
      {chips && (
        <g>
          <T x={14} y={140} anchor="start" size={13} bold>{chips.head}</T>
          {chips.items.map((s, i) => <Bx key={i} x={14 + i * 100} y={160} w={86} h={46} c={[BLUE, GREEN, ORANGE][i % 3]} lines={[s]} size={14} mono />)}
          <T x={14 + chips.items.length * 100 + 6} y={188} anchor="start" size={16} dim>…</T>
        </g>
      )}
    </Fig>
  );
}

// ── 1.10 実数上の楕円曲線と点の足し算 ──
export function FigRealCurve() {
  const U = 34, ox = 96, oy = 188;
  const X = (x: number) => ox + x * U, Y = (y: number) => oy - y * U;
  const f = (x: number) => x * x * x - x + 1;
  const xr = -1.324717957;
  const tmax = Math.sqrt(3.4 - xr);
  const up: string[] = [], lo: string[] = [];
  for (let k = 0; k <= 120; k++) {
    const t = (tmax * k) / 120, x = xr + t * t, y = Math.sqrt(Math.max(0, f(x)));
    up.push(`${X(x).toFixed(1)},${Y(y).toFixed(1)}`);
    lo.push(`${X(x).toFixed(1)},${Y(-y).toFixed(1)}`);
  }
  const path = 'M ' + up.reverse().join(' L ') + ' L ' + lo.slice(1).join(' L ');
  // P(-1,1), Q(3,-5), 直線の傾き s = -1.5、R = (0.25, -0.875)、P+Q = (0.25, 0.875)
  const P = [-1, 1], Q = [3, -5], Rp = [0.25, -0.875], S = [0.25, 0.875];
  const dot = (p: number[], c: string, l: string, dx = 8, dy = -8) => (
    <g>
      <circle cx={X(p[0])} cy={Y(p[1])} r={5} fill={c} />
      <T x={X(p[0]) + dx} y={Y(p[1]) + dy} anchor="start" bold fill={c}>{l}</T>
    </g>
  );
  const steps = ['①　2点 P、Q を通る直線を引く', '②　直線が曲線と交わる', '　　3つ目の点 R を見つける', '③　R を x 軸に対して', '　　上下反転する', '④　反転した点が P ＋ Q'];
  return (
    <Fig title="点の足し算の幾何：曲線 y² ＝ x³ − x ＋ 1" w={680} h={376} caption="これは「なめらかな曲線」で見た足し算のイメージです。暗号では、座標を有限体の数に置き換えた「飛び飛びの点」で、同じ規則の足し算を使います（次の図）。">
      <line x1={20} y1={oy} x2={250} y2={oy} stroke="currentColor" strokeOpacity={0.35} />
      <line x1={ox} y1={4} x2={ox} y2={372} stroke="currentColor" strokeOpacity={0.35} />
      <T x={256} y={oy + 4} anchor="start" size={12} dim>x</T>
      <T x={ox + 6} y={14} anchor="start" size={12} dim>y</T>
      <path d={path} fill="none" stroke={BLUE} strokeWidth={2.5} />
      <line x1={X(-1.4)} y1={Y(1 + -1.5 * (-1.4 + 1))} x2={X(3.15)} y2={Y(1 + -1.5 * (3.15 + 1))} stroke={ORANGE} strokeWidth={2} />
      <line x1={X(Rp[0])} y1={Y(Rp[1])} x2={X(S[0])} y2={Y(S[1])} stroke={GREEN} strokeWidth={2} strokeDasharray="5 4" />
      {dot(P, ORANGE, 'P', -22, -6)}
      {dot(Q, ORANGE, 'Q', 8, -8)}
      {dot(Rp, RED, 'R', 8, 18)}
      {dot(S, GREEN, 'P＋Q', 8, -8)}
      {steps.map((s, i) => <T key={i} x={300} y={110 + i * 26} anchor="start" size={15} bold={i === 5} fill={i === 5 ? GREEN : 'currentColor'}>{s}</T>)}
    </Fig>
  );
}

// ── 1.10 有限体上の楕円曲線（y² ＝ x³ ＋ 2x ＋ 2 mod 17）──
const P17 = 17;
const mod17 = (a: number) => ((a % P17) + P17) % P17;
const pow17 = (b: number, e: number) => { let r = 1; for (let i = 0; i < e; i++) r = mod17(r * b); return r; };
type Pt = [number, number] | null;
const add17 = (A: Pt, B: Pt): Pt => {
  if (!A) return B;
  if (!B) return A;
  if (A[0] === B[0] && mod17(A[1] + B[1]) === 0) return null;
  const s = A[0] === B[0] ? mod17((3 * A[0] * A[0] + 2) * pow17(mod17(2 * A[1]), P17 - 2)) : mod17((B[1] - A[1]) * pow17(mod17(B[0] - A[0]), P17 - 2));
  const x = mod17(s * s - A[0] - B[0]);
  return [x, mod17(s * (A[0] - x) - A[1])];
};

export function FigFiniteCurve() {
  const U = 17, ox = 40, oy = 330;
  const X = (x: number) => ox + x * U, Y = (y: number) => oy - y * U;
  const mult: Record<string, number> = {};
  let cur: Pt = [5, 1];
  for (let k = 1; k <= 18; k++) { if (cur) mult[cur[0] + ',' + cur[1]] = k; cur = add17(cur, [5, 1]); }
  const pts: [number, number][] = [];
  for (let x = 0; x < P17; x++) for (let y = 0; y < P17; y++) if (mod17(y * y) === mod17(x * x * x + 2 * x + 2)) pts.push([x, y]);
  const lab = [0, 4, 8, 12, 16];
  return (
    <Fig title="有限体上の楕円曲線：y² ≡ x³ ＋ 2x ＋ 2 (mod 17) の点" w={680} h={372} caption={`曲線上の点は無限遠点Oを除いて ${pts.length} 個の「飛び飛びの点」です。点の中の数字 k は kG（G＝(5, 1) を k 回足した点）を表します。19G は無限遠点Oに戻るので、位数は19です。`}>
      {Array.from({ length: P17 }, (_, i) => (
        <g key={i}>
          <line x1={X(i)} y1={Y(0)} x2={X(i)} y2={Y(16)} stroke="currentColor" strokeOpacity={0.1} />
          <line x1={X(0)} y1={Y(i)} x2={X(16)} y2={Y(i)} stroke="currentColor" strokeOpacity={0.1} />
        </g>
      ))}
      {lab.map((v) => (
        <g key={v}>
          <T x={X(v)} y={Y(0) + 18} size={11} dim>{v}</T>
          <T x={X(0) - 10} y={Y(v) + 4} size={11} dim>{v}</T>
        </g>
      ))}
      <T x={X(16) + 14} y={Y(0) + 18} size={12} dim>x</T>
      <T x={X(0) - 10} y={Y(16) - 10} size={12} dim>y</T>
      <line x1={X(0) - 4} y1={Y(8.5)} x2={X(16) + 4} y2={Y(8.5)} stroke={GREEN} strokeDasharray="5 4" strokeOpacity={0.8} />
      <T x={X(16) + 8} y={Y(8.5) + 4} anchor="start" size={11} fill={GREEN}>y＝8.5</T>
      <line x1={X(5)} y1={Y(1)} x2={X(5)} y2={Y(16)} stroke={ORANGE} strokeWidth={1.5} strokeDasharray="3 3" />
      {pts.map(([x, y]) => {
        const k = mult[x + ',' + y];
        const g = k === 1;
        return (
          <g key={x + ',' + y}>
            <circle cx={X(x)} cy={Y(y)} r={g ? 8.5 : 7.5} fill={g ? ORANGE : tint(BLUE, 'aa')} stroke={g ? ORANGE : BLUE} />
            <T x={X(x)} y={Y(y) + 3.5} size={10} bold fill={g ? '#000' : 'currentColor'}>{k}</T>
          </g>
        );
      })}
      <T x={412} y={96} anchor="start" bold fill={ORANGE}>G ＝ (5, 1)　（k ＝ 1）</T>
      <T x={412} y={124} anchor="start" size={14}>2G ＝ (6, 3)、3G ＝ (10, 6)、…</T>
      <T x={412} y={160} anchor="start" size={14} fill={GREEN}>y ＝ 8.5 を軸に上下が対応する</T>
      <T x={412} y={182} anchor="start" size={13} dim>点 (x, y) の逆元 −P は (x, 17 − y)</T>
      <T x={412} y={212} anchor="start" size={14} fill={ORANGE}>G ＝ (5, 1) と 18G ＝ (5, 16) は</T>
      <T x={412} y={234} anchor="start" size={14} fill={ORANGE}>足すと 0 ＝ O（19G ＝ O）</T>
      <T x={412} y={274} anchor="start" size={13} dim>実数の曲線のなめらかな線は消え、</T>
      <T x={412} y={294} anchor="start" size={13} dim>ばらばらに見えますが、足し算の規則は</T>
      <T x={412} y={314} anchor="start" size={13} dim>同じ公式で成り立っています。</T>
    </Fig>
  );
}

// ── 3.13 エドワーズ曲線（−x² ＋ y² ＝ 1 ＋ 2x²y² mod 13）──
export function FigEdwardsCurve() {
  const PE = 13, DE = 2, U = 22, ox = 40, oy = 300;
  const X = (x: number) => ox + x * U, Y = (y: number) => oy - y * U;
  const md = (a: number) => ((a % PE) + PE) % PE;
  const inv = (a: number) => { for (let i = 1; i < PE; i++) if (md(a * i) === 1) return i; return 0; };
  const add = (A: [number, number], B: [number, number]): [number, number] => {
    const k = md(DE * A[0] * B[0] * A[1] * B[1]);
    return [md((A[0] * B[1] + B[0] * A[1]) * inv(md(1 + k))), md((A[1] * B[1] + A[0] * B[0]) * inv(md(1 - k)))];
  };
  const mult: Record<string, number> = {};
  let cur: [number, number] = [0, 1];
  for (let k = 1; k <= 16; k++) { cur = add(cur, [2, 4]); mult[cur[0] + ',' + cur[1]] = k; }
  const pts: [number, number][] = [];
  for (let x = 0; x < PE; x++) for (let y = 0; y < PE; y++) if (md(-x * x + y * y) === md(1 + DE * x * x * y * y)) pts.push([x, y]);
  const lab = [0, 4, 8, 12];
  return (
    <Fig title="有限体上のエドワーズ曲線：−x² ＋ y² ≡ 1 ＋ 2x²y² (mod 13) の点" w={680} h={346} caption={`曲線上の点は単位元 (0, 1) を含めて ${pts.length} 個です。点の中の数字 k は kB（B＝(2, 4) を k 回足した点）を表します。16B は単位元 (0, 1) に戻るので、Bの位数は16です。Ed25519 の曲線も同じ形の式で、有限体が 2²⁵⁵−19、点の数が桁違いに多いだけです。`}>
      {Array.from({ length: PE }, (_, i) => (
        <g key={i}>
          <line x1={X(i)} y1={Y(0)} x2={X(i)} y2={Y(12)} stroke="currentColor" strokeOpacity={0.1} />
          <line x1={X(0)} y1={Y(i)} x2={X(12)} y2={Y(i)} stroke="currentColor" strokeOpacity={0.1} />
        </g>
      ))}
      {lab.map((v) => (
        <g key={v}>
          <T x={X(v)} y={Y(0) + 18} size={11} dim>{v}</T>
          <T x={X(0) - 10} y={Y(v) + 4} size={11} dim>{v}</T>
        </g>
      ))}
      <T x={X(12) + 14} y={Y(0) + 18} size={12} dim>x</T>
      <T x={X(0) - 10} y={Y(12) - 10} size={12} dim>y</T>
      <line x1={X(6.5)} y1={Y(0) + 4} x2={X(6.5)} y2={Y(12) - 4} stroke={GREEN} strokeDasharray="5 4" strokeOpacity={0.8} />
      <T x={X(6.5)} y={Y(12) - 10} size={11} fill={GREEN}>x＝6.5</T>
      {pts.map(([x, y]) => {
        const k = mult[x + ',' + y];
        const isB = k === 1, isO = k === 16;
        const c = isB ? ORANGE : isO ? GREEN : BLUE;
        return (
          <g key={x + ',' + y}>
            <circle cx={X(x)} cy={Y(y)} r={isB || isO ? 9 : 8} fill={isB ? ORANGE : isO ? tint(GREEN, 'aa') : tint(BLUE, 'aa')} stroke={c} />
            <T x={X(x)} y={Y(y) + 3.5} size={10} bold fill={isB ? '#000' : 'currentColor'}>{isO ? 'O' : k}</T>
          </g>
        );
      })}
      <T x={372} y={70} anchor="start" bold fill={ORANGE}>B ＝ (2, 4)　（k ＝ 1）</T>
      <T x={372} y={96} anchor="start" size={14}>2B ＝ (10, 11)、3B ＝ (6, 10)、…</T>
      <T x={372} y={132} anchor="start" size={14} fill={GREEN}>O ＝ (0, 1)　単位元（16B ＝ O）</T>
      <T x={372} y={166} anchor="start" size={14} fill={GREEN}>x ＝ 6.5 を軸に左右が対応する</T>
      <T x={372} y={188} anchor="start" size={13} dim>点 (x, y) の逆元 −P は (−x, y) ＝ (13 − x, y)</T>
      <T x={372} y={224} anchor="start" size={13} dim>16個の点は、すべて B の倍数です。</T>
      <T x={372} y={254} anchor="start" size={13} dim>実数の曲線のなめらかな線は消え、</T>
      <T x={372} y={274} anchor="start" size={13} dim>ばらばらに見えますが、足し算の規則は</T>
      <T x={372} y={294} anchor="start" size={13} dim>同じ公式で成り立っています。</T>
    </Fig>
  );
}

// ── 1.11 Ed25519 の鍵と署名の流れ ──
export function FigSign() {
  const col = (x: number, title: string, c: string) => (
    <g>
      <rect x={x} y={8} width={200} height={308} rx={10} fill={tint(c, '12')} stroke={c} strokeWidth={1.5} />
      <T x={x + 100} y={32} bold fill={c} size={14}>{title}</T>
    </g>
  );
  return (
    <Fig title="Ed25519：鍵の生成・署名・検算の流れ（B は基点）" w={660} h={332} caption="検算の式に秘密鍵 a は現れません。公開鍵 A、署名 (R, S)、メッセージだけで、誰でも署名を確かめられます。">
      {col(8, '① 鍵をつくる', BLUE)}
      <Bx x={28} y={54} w={160} h={50} c={RED} lines={['秘密のスカラー a', '（人に見せない）']} size={13} />
      <Arrow x1={108} y1={104} x2={108} y2={142} />
      <T x={118} y={128} anchor="start" size={12} dim>B に掛ける</T>
      <Bx x={28} y={146} w={160} h={50} c={GREEN} lines={['公開鍵 A', 'A ＝ a × B']} size={13} bold />
      <T x={108} y={226} size={12} dim>A から a は求められない</T>
      <T x={108} y={244} size={12} dim>（3.9 の楕円曲線上の離散対数問題）</T>
      {col(226, '② 署名する', ORANGE)}
      <Bx x={246} y={50} w={160} h={44} c={GRAY} lines={['使い捨ての乱数 r']} size={13} />
      <Arrow x1={326} y1={94} x2={326} y2={110} />
      <Bx x={246} y={112} w={160} h={44} c={GREEN} lines={['R ＝ r × B']} size={13} />
      <Arrow x1={326} y1={156} x2={326} y2={172} />
      <Bx x={246} y={174} w={160} h={44} c={PURPLE} lines={['h ＝ ハッシュ', '(R, A, メッセージ)']} size={12} />
      <Arrow x1={326} y1={218} x2={326} y2={234} />
      <Bx x={246} y={236} w={160} h={44} c={ORANGE} lines={['S ＝ r ＋ h × a']} size={13} bold />
      <T x={326} y={298} size={12} dim>署名 ＝ (R, S)</T>
      {col(444, '③ 検算する', GREEN)}
      <Bx x={464} y={54} w={160} h={50} c={BLUE} lines={['左辺', 'S × B']} size={13} />
      <T x={544} y={134} size={18} bold>＝ ？</T>
      <Bx x={464} y={152} w={160} h={50} c={GREEN} lines={['右辺', 'R ＋ h × A']} size={13} />
      <T x={544} y={232} size={12} dim>一致 → 署名は正しい</T>
      <T x={544} y={252} size={12} dim>不一致 → 改ざんの疑い</T>
      <T x={544} y={284} size={12} fill={ORANGE}>S×B ＝ (r＋h·a)×B</T>
      <T x={544} y={300} size={12} fill={ORANGE}>＝ R ＋ h×A</T>
    </Fig>
  );
}

// ── 1.13 マークルツリーと証明 ──
export function FigMerkle() {
  const nw = 64, nh = 30;
  const lx = (i: number) => 14 + i * 78;
  const mid = (i: number) => lx(i) + nw / 2;
  const L1y = 258, L2y = 188, L3y = 118, L4y = 48;
  const l2 = [0, 1, 2, 3].map((i) => (mid(2 * i) + mid(2 * i + 1)) / 2);
  const l3 = [0, 1].map((i) => (l2[2 * i] + l2[2 * i + 1]) / 2);
  const root = (l3[0] + l3[1]) / 2;
  const sub = ['₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈'];
  const kind: Record<string, string> = { leaf2: ORANGE, need: GREEN, path: BLUE };
  const node = (cx: number, y: number, label: string, k?: string) => {
    const c = k ? kind[k] : GRAY;
    return (
      <g key={label + cx}>
        <rect x={cx - nw / 2} y={y} width={nw} height={nh} rx={6} fill={tint(c, k ? '66' : '22')} stroke={c} strokeWidth={k ? 2 : 1} />
        <T x={cx} y={y + 20} size={13} bold={!!k}>{label}</T>
      </g>
    );
  };
  const edge = (x1: number, y1: number, x2: number, y2: number, hi: boolean) => <line key={`${x1}-${y1}-${x2}-${y2}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={hi ? BLUE : 'currentColor'} strokeOpacity={hi ? 1 : 0.3} strokeWidth={hi ? 2.5 : 1.5} />;
  return (
    <Fig title="マークルツリー：「取引3が含まれる」ことを3個のハッシュで証明する" w={640} h={348} caption="8件の取引なら、証明に必要なハッシュは 3個（＝ log₂8）です。100万件でも約20個で済みます。検証する側は、取引3のハッシュと緑の3個から、青い道筋を順に計算し直し、ルートが一致するかを確かめます。">
      {/* 辺 */}
      {Array.from({ length: 8 }, (_, i) => edge(mid(i), L1y, l2[Math.floor(i / 2)], L2y + nh, i === 2 || i === 3 ? i === 2 : false))}
      {[0, 1, 2, 3].map((i) => edge(l2[i], L2y, l3[Math.floor(i / 2)], L3y + nh, i === 1))}
      {[0, 1].map((i) => edge(l3[i], L3y, root, L4y + nh, i === 0))}
      {/* 葉 */}
      {Array.from({ length: 8 }, (_, i) => (
        <g key={i}>
          {node(mid(i), L1y, 'H' + sub[i], i === 2 ? 'leaf2' : i === 3 ? 'need' : undefined)}
          <T x={mid(i)} y={L1y + 48} size={12} dim>取引{i + 1}</T>
        </g>
      ))}
      {/* 中間 */}
      {node(l2[0], L2y, 'H₁₂', 'need')}
      {node(l2[1], L2y, 'H₃₄', 'path')}
      {node(l2[2], L2y, 'H₅₆')}
      {node(l2[3], L2y, 'H₇₈')}
      {node(l3[0], L3y, 'H₁₋₄', 'path')}
      {node(l3[1], L3y, 'H₅₋₈', 'need')}
      {node(root, L4y, 'ルート', 'path')}
      {/* 凡例 */}
      <rect x={400} y={14} width={16} height={16} rx={3} fill={tint(ORANGE, '66')} stroke={ORANGE} />
      <T x={422} y={27} anchor="start" size={12}>証明したい取引のハッシュ</T>
      <rect x={400} y={38} width={16} height={16} rx={3} fill={tint(GREEN, '66')} stroke={GREEN} />
      <T x={422} y={51} anchor="start" size={12}>証明に添える兄弟のハッシュ</T>
      <rect x={400} y={62} width={16} height={16} rx={3} fill={tint(BLUE, '66')} stroke={BLUE} />
      <T x={422} y={75} anchor="start" size={12}>検証側が計算し直すハッシュ</T>
    </Fig>
  );
}

// ════════ 第2章 基礎情報科学 ════════

const hexOf = (u: Uint8Array) => Array.from(u, (b) => b.toString(16).padStart(2, '0')).join(' ').toUpperCase().split(' ');

// ── 2.1 文字とバイト ──
export function FigText() {
  const en = new TextEncoder();
  const ascii = 'Hello'.split('');
  const aBytes = hexOf(en.encode('Hello'));
  const jp = ['日', '本'];
  const jBytes = hexOf(en.encode('日本'));
  const bw = 44, g = 4;
  return (
    <Fig title="文字は文字コード（UTF-8）でバイト列になる" w={640} h={250} caption="英数字は1文字が1バイト、日本語は1文字が3バイトです。バイトは16進数2桁で書きます。">
      <T x={10} y={52} anchor="start" bold>英数字</T>
      <T x={10} y={72} anchor="start" size={12} dim>1文字 ＝ 1バイト</T>
      {ascii.map((ch, i) => (
        <g key={i}>
          <Bx x={150 + i * 74} y={26} w={64} h={36} c={BLUE} lines={[ch]} size={18} bold />
          <Arrow x1={182 + i * 74} y1={62} x2={182 + i * 74} y2={80} />
          <Bx x={150 + i * 74} y={82} w={64} h={34} c={GRAY} lines={[aBytes[i]]} size={16} mono />
        </g>
      ))}
      <T x={10} y={176} anchor="start" bold>日本語</T>
      <T x={10} y={196} anchor="start" size={12} dim>1文字 ＝ 3バイト</T>
      {jp.map((ch, i) => {
        const gx = 150 + i * 200;
        return (
          <g key={i}>
            <Bx x={gx} y={150} w={bw * 3 + g * 2} h={36} c={ORANGE} lines={[ch]} size={18} bold />
            <Arrow x1={gx + (bw * 3 + g * 2) / 2} y1={186} x2={gx + (bw * 3 + g * 2) / 2} y2={202} />
            {[0, 1, 2].map((k) => <Bx key={k} x={gx + k * (bw + g)} y={204} w={bw} h={34} c={GRAY} lines={[jBytes[i * 3 + k]]} size={15} mono />)}
          </g>
        );
      })}
    </Fig>
  );
}

// ── 2.3 Base32 ──
export function FigBase32() {
  const src = 'Hel';
  const bytes = new TextEncoder().encode(src);
  const bits = Array.from(bytes, (b) => b.toString(2).padStart(8, '0')).join('');
  const padded = bits.padEnd(25, '0');
  const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const groups = Array.from({ length: 5 }, (_, g) => padded.slice(g * 5, g * 5 + 5));
  const vals = groups.map((s) => parseInt(s, 2));
  const cw = 22, x0 = 26, step = 24;
  const bc = [BLUE, GREEN, ORANGE];
  const gc = [PURPLE, CYAN, RED, BLUE, GREEN];
  return (
    <Fig title={`Base32：「${src}」を5ビットずつに区切り直して文字にする`} w={640} h={262} caption="バイト（8ビット）の並びを、5ビットずつに区切り直します。5ビットは0〜31の32通りなので、A〜Z（0〜25）と2〜7（26〜31）の文字で表せます。最後の端数は0で埋めます。">
      {Array.from(bytes).map((b, i) => (
        <T key={i} x={x0 + i * 8 * step + (8 * step - 2) / 2} y={24} size={13} bold fill={bc[i]}>{src[i]}（{b.toString(16).toUpperCase()}）＝ 8ビット</T>
      ))}
      {bits.split('').map((ch, i) => <Cell key={i} x={x0 + i * step} y={34} w={cw} h={28} v={ch} c={bc[Math.floor(i / 8)]} size={14} />)}
      <T x={320} y={92} size={13} dim>↓　5ビットずつに区切り直す</T>
      {padded.split('').map((ch, i) => <Cell key={i} x={x0 + i * step} y={104} w={cw} h={28} v={ch} c={gc[Math.floor(i / 5)]} size={14} />)}
      <T x={x0 + 24 * step + cw / 2} y={150} size={10} dim>0で埋める</T>
      {groups.map((gp, g) => {
        const gx = x0 + g * 5 * step, gw = 5 * step - 2;
        return (
          <g key={g}>
            <path d={`M ${gx} 158 v 6 h ${gw} v -6`} fill="none" stroke={gc[g]} strokeWidth={1.5} />
            <T x={gx + gw / 2} y={186} size={14} fill={gc[g]}>{gp} ＝ {vals[g]}</T>
            <Arrow x1={gx + gw / 2} y1={194} x2={gx + gw / 2} y2={212} c={gc[g]} head={7} />
            <Bx x={gx + gw / 2 - 20} y={214} w={40} h={36} c={gc[g]} lines={[A[vals[g]]]} size={20} bold mono />
          </g>
        );
      })}
      <T x={x0 + 5 * 5 * step + 10} y={238} anchor="start" size={13} bold>→ {vals.map((v) => A[v]).join('')}</T>
    </Fig>
  );
}

// ── 2.4 ハッシュ関数 ──
export function FigHash() {
  return (
    <Fig title="ハッシュ関数：データを固定長の「指紋」にする" w={640} h={252} caption="入力が1文字違うだけで、出力はまったく別物になります（雪崩効果）。同じ入力なら必ず同じ出力で、出力から入力は逆算できません。出力はSHA-256の先頭16桁です。">
      <Bx x={14} y={30} w={130} h={46} c={BLUE} lines={['"Hello"']} size={16} mono />
      <Bx x={14} y={118} w={130} h={46} c={BLUE} lines={['"hello"']} size={16} mono />
      <T x={79} y={104} size={12} fill={ORANGE}>▲ 1文字だけ違う</T>
      <Arrow x1={146} y1={53} x2={236} y2={90} />
      <Arrow x1={146} y1={141} x2={236} y2={118} />
      <Bx x={238} y={64} w={160} h={80} c={PURPLE} lines={['ハッシュ関数', '（SHA-256）']} bold size={15} />
      <Arrow x1={400} y1={90} x2={466} y2={53} />
      <Arrow x1={400} y1={118} x2={466} y2={141} />
      <Bx x={468} y={30} w={160} h={46} c={GREEN} lines={['185f8db32271fe25…']} size={13} mono />
      <Bx x={468} y={118} w={160} h={46} c={GREEN} lines={['2cf24dba5fb0a30e…']} size={13} mono />
      <T x={548} y={104} size={12} fill={ORANGE}>▲ まったく別の値</T>
      <Arrow x1={466} y1={206} x2={150} y2={206} c={RED} dash w={2} />
      <T x={308} y={198} size={13} fill={RED} bold>出力から入力は逆算できない</T>
      <T x={308} y={236} size={12} dim>入力の長さに関係なく、出力は同じ長さ</T>
    </Fig>
  );
}

// ── 2.5 電子署名 ──
export function FigSigFlow() {
  return (
    <Fig title="電子署名：秘密鍵で署名し、公開鍵で検証する" w={640} h={318} caption="署名できるのは秘密鍵の持ち主だけで、検証は公開鍵を知っている誰でもできます。データが1ビットでも変わると、検証に失敗します。">
      <T x={10} y={22} anchor="start" bold fill={BLUE}>① 送信者が署名する</T>
      <Bx x={14} y={34} w={120} h={50} c={GRAY} lines={['データ']} bold />
      <Arrow x1={134} y1={59} x2={180} y2={59} />
      <Bx x={182} y={34} w={120} h={50} c={PURPLE} lines={['ハッシュ']} bold />
      <Arrow x1={302} y1={59} x2={348} y2={59} />
      <Bx x={350} y={34} w={130} h={50} c={RED} lines={['秘密鍵で署名']} bold />
      <Arrow x1={480} y1={59} x2={526} y2={59} />
      <Bx x={528} y={34} w={100} h={50} c={ORANGE} lines={['署名']} bold />
      <line x1={10} y1={106} x2={630} y2={106} stroke="currentColor" strokeOpacity={0.2} />
      <T x={10} y={128} anchor="start" bold fill={GREEN}>② 誰でも検証できる</T>
      <Bx x={14} y={140} w={190} h={54} c={GRAY} lines={['データ ＋ 署名', '＋ 送信者の公開鍵']} size={13} />
      <Arrow x1={204} y1={167} x2={260} y2={167} />
      <Bx x={262} y={140} w={120} h={54} c={BLUE} lines={['検証する']} bold />
      <Arrow x1={382} y1={167} x2={438} y2={167} />
      <Bx x={440} y={140} w={188} h={54} c={GREEN} lines={['一致 → 検証成功', '「本人の承認」']} size={13} bold />
      <T x={10} y={228} anchor="start" bold fill={RED}>③ データが1ビットでも変わると</T>
      <Bx x={14} y={240} w={190} h={54} c={RED} lines={['変更後のデータ ＋ 署名', '＋ 公開鍵']} size={13} />
      <Arrow x1={204} y1={267} x2={260} y2={267} />
      <Bx x={262} y={240} w={120} h={54} c={BLUE} lines={['検証する']} bold />
      <Arrow x1={382} y1={267} x2={438} y2={267} />
      <Bx x={440} y={240} w={188} h={54} c={RED} lines={['不一致 → 検証失敗', '「改ざんを検知」']} size={13} bold />
    </Fig>
  );
}

// ── 3.8 鍵共有（ディフィー・ヘルマン）──
export function FigKeyExchange() {
  return (
    <Fig title="鍵共有：公開値を交換するだけで、2人だけの共通の値を作る" w={640} h={350} caption="途中で盗み見られるのは g、p、A、B だけです。A から a、B から b を求めるのは離散対数問題なので、盗み見た人は g^ab を作れません。">
      <Bx x={210} y={8} w={220} h={36} c={GRAY} lines={['公開してよい：g と p']} size={13} bold />
      <T x={110} y={70} bold fill={BLUE}>Alice</T>
      <T x={530} y={70} bold fill={BLUE}>Bob</T>
      <Bx x={20} y={80} w={180} h={44} c={RED} lines={['秘密 a（誰にも見せない）']} size={13} />
      <Bx x={440} y={80} w={180} h={44} c={RED} lines={['秘密 b（誰にも見せない）']} size={13} />
      <Arrow x1={110} y1={124} x2={110} y2={150} />
      <Arrow x1={530} y1={124} x2={530} y2={150} />
      <Bx x={20} y={152} w={180} h={44} c={BLUE} lines={['A ＝ g^a mod p を公開']} size={13} />
      <Bx x={440} y={152} w={180} h={44} c={BLUE} lines={['B ＝ g^b mod p を公開']} size={13} />
      <T x={320} y={153} size={12} fill={BLUE}>A を送る</T>
      <Arrow x1={204} y1={160} x2={436} y2={160} c={BLUE} />
      <T x={320} y={177} size={11} dim>（途中で盗み見られてもよい）</T>
      <Arrow x1={436} y1={186} x2={204} y2={186} c={BLUE} />
      <T x={320} y={202} size={12} fill={BLUE}>B を送る</T>
      <Arrow x1={110} y1={196} x2={110} y2={226} />
      <Arrow x1={530} y1={196} x2={530} y2={226} />
      <Bx x={15} y={228} w={190} h={54} c={PURPLE} lines={['Bの値と自分の a から', 'B^a ＝ (g^b)^a ＝ g^ab']} size={13} />
      <Bx x={435} y={228} w={190} h={54} c={PURPLE} lines={['Aの値と自分の b から', 'A^b ＝ (g^a)^b ＝ g^ab']} size={13} />
      <Arrow x1={110} y1={282} x2={210} y2={306} c={GREEN} />
      <Arrow x1={530} y1={282} x2={430} y2={306} c={GREEN} />
      <Bx x={170} y={306} w={300} h={36} c={GREEN} lines={['同じ値 g^ab ができる（2人だけの共通の値）']} size={13} bold />
    </Fig>
  );
}

// ── 公開鍵暗号の2つの使い方（暗号化と電子署名）──
export function FigKeyUse() {
  const row = (y: number, label: string, lc: string, note: string, steps: { lines: string[]; c: string; w: number; x: number }[]) => (
    <g>
      <T x={10} y={y} anchor="start" bold fill={lc}>{label}</T>
      {steps.map((b, i) => (
        <g key={i}>
          <Bx x={b.x} y={y + 12} w={b.w} h={54} c={b.c} lines={b.lines} size={13} bold={b.lines.length === 1} />
          {i < steps.length - 1 && <Arrow x1={b.x + b.w} y1={y + 39} x2={steps[i + 1].x} y2={y + 39} />}
        </g>
      ))}
      <T x={14} y={y + 88} anchor="start" size={12} dim>{note}</T>
    </g>
  );
  return (
    <Fig title="公開鍵暗号の2つの使い方：鍵を使う向きが逆" w={640} h={290} caption="暗号化では、秘密鍵を使うのは受け取る人です。電子署名では、秘密鍵を使うのは署名する人です。どちらも、公開鍵は誰でも使えます。ブロックチェーンの取引は公開が前提なので、主役は電子署名です。">
      {row(22, 'A. 暗号化：中身を秘密にする', BLUE, '誰でも暗号化できるが、復号できるのは秘密鍵を持つ受信者だけ', [
        { x: 14, w: 96, lines: ['平文'], c: GRAY },
        { x: 148, w: 150, lines: ['受信者の公開鍵で', '暗号化する'], c: BLUE },
        { x: 336, w: 96, lines: ['暗号文'], c: ORANGE },
        { x: 470, w: 156, lines: ['受信者の秘密鍵で', '復号する'], c: RED },
      ])}
      <line x1={10} y1={132} x2={630} y2={132} stroke="currentColor" strokeOpacity={0.2} />
      {row(152, 'B. 電子署名：本人の承認を示す', GREEN, '署名できるのは秘密鍵を持つ本人だけ。検証は、公開鍵を知っている誰でもできる', [
        { x: 14, w: 96, lines: ['データ'], c: GRAY },
        { x: 148, w: 150, lines: ['署名者の秘密鍵で', '署名する'], c: RED },
        { x: 336, w: 96, lines: ['署名'], c: ORANGE },
        { x: 470, w: 156, lines: ['署名者の公開鍵で', '検証する'], c: BLUE },
      ])}
      <rect x={14} y={262} width={14} height={14} rx={3} fill={tint(BLUE)} stroke={BLUE} />
      <T x={34} y={274} anchor="start" size={12}>公開鍵を使う操作（誰でもできる）</T>
      <rect x={290} y={262} width={14} height={14} rx={3} fill={tint(RED)} stroke={RED} />
      <T x={310} y={274} anchor="start" size={12}>秘密鍵を使う操作（持ち主だけができる）</T>
    </Fig>
  );
}

// ════════ 第3章 ブロックチェーン基礎 ════════

// ── 3.2 ハッシュチェーン ──
export function FigHashChain() {
  const bw = 176, bh = 96, gap = 44, x0 = 12;
  const bx = (i: number) => x0 + i * (bw + gap);
  const normal = [['A→B 10', '00000000', 'E92713DE'], ['B→C 3', 'E92713DE', '2BE919E6'], ['C→A 1', '2BE919E6', 'A381A174']];
  const bad = [['A→B 100', '00000000', '13E35EBC'], ['B→C 3', '13E35EBC', '346EA920'], ['C→A 1', '346EA920', '1395424E']];
  const row = (y: number, data: string[][], tampered: boolean) => (
    <g>
      {data.map(([d, prev, h], i) => {
        const c = tampered ? RED : BLUE;
        return (
          <g key={i}>
            <rect x={bx(i)} y={y} width={bw} height={bh} rx={8} fill={tint(c, '1c')} stroke={c} strokeWidth={1.5} />
            <T x={bx(i) + 10} y={y + 20} anchor="start" size={13} bold>ブロック{i + 1}</T>
            <T x={bx(i) + 10} y={y + 41} anchor="start" size={12} fill={tampered && i === 0 ? ORANGE : 'currentColor'} bold={tampered && i === 0}>データ：{d}</T>
            <T x={bx(i) + 10} y={y + 61} anchor="start" size={12} mono dim={!tampered}>前：{prev}</T>
            <T x={bx(i) + 10} y={y + 81} anchor="start" size={12} mono fill={tampered ? RED : GREEN} bold>ハッシュ：{h}</T>
            {i < 2 && <Arrow x1={bx(i) + bw} y1={y + 78} x2={bx(i + 1)} y2={y + 78} c={tampered ? RED : GREEN} />}
          </g>
        );
      })}
    </g>
  );
  return (
    <Fig title="ハッシュチェーン：前のブロックのハッシュを中に含める" w={640} h={296} caption="各ブロックは「前のブロックのハッシュ」を含むので、鎖のようにつながります。ブロック1のデータを1か所変えると、そのハッシュが変わり、後続のブロックもすべて別の値になって不整合が見つかります。">
      <T x={10} y={20} anchor="start" bold fill={BLUE}>ふつうの鎖</T>
      {row(28, normal, false)}
      <T x={10} y={160} anchor="start" bold fill={RED}>ブロック1のデータを「A→B 100」に書き換えると</T>
      {row(170, bad, true)}
    </Fig>
  );
}

// ── 3.3 マークルツリー（4件）──
export function FigMerkleSmall() {
  const nw = 130, nh = 36;
  const lx = [20, 180, 340, 500];
  const mid = lx.map((x) => x + nw / 2);
  const m2 = [(mid[0] + mid[1]) / 2, (mid[2] + mid[3]) / 2];
  const root = (m2[0] + m2[1]) / 2;
  const box = (cx: number, y: number, lines: string[], c: string, w = nw, h = nh) => <Bx key={cx + '-' + y} x={cx - w / 2} y={y} w={w} h={h} c={c} lines={lines} size={13} />;
  return (
    <Fig title="マークルツリー：ハッシュを2つずつ束ねて、1つのルートにする" w={640} h={290} caption="取引のハッシュを2つずつ束ねてハッシュし直す操作を、1つになるまで繰り返します。最後の1つがマークルルートで、ブロックに記録されます（個数が奇数のときは、最後のハッシュを自分自身と組にします）。">
      {mid.map((m, i) => <line key={'a' + i} x1={m} y1={186} x2={m2[Math.floor(i / 2)]} y2={116 + nh} stroke="currentColor" strokeOpacity={0.4} strokeWidth={1.5} />)}
      {m2.map((m, i) => <line key={'b' + i} x1={m} y1={116} x2={root} y2={46 + nh} stroke="currentColor" strokeOpacity={0.4} strokeWidth={1.5} />)}
      {box(root, 46, ['マークルルート'], GREEN, 190)}
      {box(m2[0], 116, ['H(H₁ ＋ H₂)'], BLUE)}
      {box(m2[1], 116, ['H(H₃ ＋ H₄)'], BLUE)}
      {mid.map((m, i) => box(m, 186, [`H${'₁₂₃₄'[i]} ＝ H(tx${i + 1})`], PURPLE))}
      {mid.map((m, i) => <g key={'t' + i}><Arrow x1={m} y1={254} x2={m} y2={226} /><Bx x={m - 40} y={254} w={80} h={30} c={GRAY} lines={[`tx${i + 1}`]} size={13} /></g>)}
    </Fig>
  );
}

// ── 3.4 PoW と PoS ──
export function FigConsensus() {
  const runners = [['ノード1', 130], ['ノード2', 170], ['ノード3', 206], ['ノード4', 96]];
  const stakes: [string, number][] = [['ノード1', 44], ['ノード2', 108], ['ノード3', 70], ['ノード4', 150]];
  return (
    <Fig title="合意形成：誰が次のブロックを作るか" w={640} h={290} caption="PoWは計算競争の勝者、PoSは保有量などに応じて選ばれた人がブロックを作ります。">
      <rect x={8} y={8} width={306} height={274} rx={10} fill={tint(ORANGE, '10')} stroke={ORANGE} />
      <T x={161} y={32} bold fill={ORANGE}>PoW：計算競争に勝った人が作る</T>
      <T x={161} y={50} size={12} dim>先に条件を満たすハッシュを見つけた人が勝ち</T>
      <line x1={280} y1={64} x2={280} y2={250} stroke={ORANGE} strokeDasharray="4 3" />
      <T x={280} y={264} size={12} fill={ORANGE}>ゴール</T>
      {runners.map(([n, len], i) => {
        const win = i === 2;
        return (
          <g key={n}>
            <T x={22} y={92 + i * 40} anchor="start" size={12}>{n}</T>
            <rect x={78} y={78 + i * 40} width={len as number} height={22} rx={5} fill={tint(win ? GREEN : GRAY, '66')} stroke={win ? GREEN : GRAY} />
            {win && <T x={78 + (len as number) - 6} y={94 + i * 40} anchor="end" size={12} bold fill={GREEN}>先着★</T>}
          </g>
        );
      })}
      <rect x={326} y={8} width={306} height={274} rx={10} fill={tint(BLUE, '10')} stroke={BLUE} />
      <T x={479} y={32} bold fill={BLUE}>PoS：保有量などで選ばれた人が作る</T>
      <T x={479} y={50} size={12} dim>保有量が多いほど選ばれやすい（くじ引き）</T>
      {stakes.map(([n, hgt], i) => {
        const win = i === 1;
        const x = 356 + i * 68;
        return (
          <g key={n}>
            <rect x={x} y={236 - hgt} width={50} height={hgt} rx={5} fill={tint(win ? GREEN : GRAY, '66')} stroke={win ? GREEN : GRAY} />
            <T x={x + 25} y={254} size={12}>{n}</T>
            {win && <T x={x + 25} y={236 - hgt - 8} size={12} bold fill={GREEN}>★選ばれた</T>}
          </g>
        );
      })}
      <T x={356} y={274} anchor="start" size={11} dim>（棒の高さ ＝ 保有量など）</T>
    </Fig>
  );
}

// ── 3.2 台帳の持ち方 ──
export function FigLedger() {
  const users: [number, number][] = [[22, 66], [222, 66], [22, 196], [222, 196]];
  const nodes: [number, number][] = [[350, 66], [542, 66], [350, 176], [542, 176]];
  const ln = (x1: number, y1: number, x2: number, y2: number, k: string) => <line key={k} x1={x1} y1={y1} x2={x2} y2={y2} stroke={BLUE} strokeOpacity={0.6} strokeWidth={1.5} />;
  return (
    <Fig title="台帳の持ち方：管理者が1つ持つ／全員が同じものを持つ" w={640} h={268} caption="左は、管理者のサーバーだけが台帳を持つ従来の形です。管理者が止まれば全体が止まり、管理者が書き換えれば誰も気づけません。右は、多数のノードが同じ台帳を持ち、互いに照合する形です。1台が壊れても、1台が嘘をついても、残りが正しい台帳を保っています。">
      <rect x={8} y={8} width={306} height={252} rx={10} fill={tint(ORANGE, '10')} stroke={ORANGE} />
      <T x={161} y={32} bold fill={ORANGE}>従来：管理者が台帳を1つ持つ</T>
      <Bx x={110} y={108} w={100} h={56} c={ORANGE} lines={['管理者の', 'サーバー（台帳）']} size={12} />
      {users.map(([x, y], i) => <Bx key={i} x={x} y={y} w={72} h={30} c={GRAY} lines={['利用者']} size={12} />)}
      <Arrow x1={94} y1={92} x2={120} y2={108} />
      <Arrow x1={222} y1={92} x2={200} y2={108} />
      <Arrow x1={94} y1={206} x2={120} y2={164} />
      <Arrow x1={222} y1={206} x2={200} y2={164} />
      <T x={161} y={250} size={12} fill={ORANGE}>止まる・書き換えられる、の一点集中</T>
      <rect x={326} y={8} width={306} height={252} rx={10} fill={tint(BLUE, '10')} stroke={BLUE} />
      <T x={479} y={32} bold fill={BLUE}>ブロックチェーン：全員が同じ台帳を持つ</T>
      {ln(430, 91, 542, 91, 'a')}
      {ln(430, 201, 542, 201, 'b')}
      {ln(390, 116, 390, 176, 'c')}
      {ln(582, 116, 582, 176, 'd')}
      {ln(420, 116, 552, 176, 'e')}
      {ln(552, 116, 420, 176, 'f')}
      {nodes.map(([x, y], i) => <Bx key={i} x={x} y={y} w={80} h={50} c={BLUE} lines={['ノード', '台帳']} size={12} />)}
      <T x={479} y={250} size={12} fill={BLUE}>互いに照合する（1台の嘘は多数に負ける）</T>
    </Fig>
  );
}

// ── 3.4 ブロックの構造 ──
export function FigBlock({ symbol = false }: { symbol?: boolean } = {}) {
  const rows: [string, string, string][] = [
    ['height', 'ブロック高（何番目か）', GRAY],
    ['timestamp', '作成時刻', GRAY],
    ['previousBlockHash', '前のブロックのハッシュ', ORANGE],
    ['transactionsHash', '取引のマークルルート', GREEN],
    ['stateHash', '台帳の状態のハッシュ', GRAY],
    ['signature ほか', 'ブロックを作った人の署名など', GRAY],
  ];
  return (
    <Fig title="ブロックの構造：ヘッダーと本体" w={700} h={330} caption={"ブロックのハッシュは、本体ではなくヘッダーだけから計算します。取引は、マークルルート（transactionsHash）を通じてヘッダーに結びつくので、取引を1つ変えるとルートが変わり、ヘッダーのハッシュも変わります。" + (symbol ? '（フィールド名はSymbolのブロックヘッダーの主なものです）' : '')} max={700}>
      <Bx x={8} y={78} w={104} h={64} c={GRAY} lines={['前のブロック', 'ハッシュ ＝ H']} size={12} />
      <Arrow x1={112} y1={110} x2={164} y2={110} c={ORANGE} />
      <rect x={150} y={14} width={340} height={304} rx={10} fill="none" stroke={GRAY} strokeWidth={1.5} />
      <T x={166} y={36} anchor="start" bold fill={BLUE}>ヘッダー（ハッシュの対象）</T>
      {rows.map(([f, g, c], i) => (
        <g key={f}>
          <rect x={164} y={46 + i * 27} width={312} height={23} rx={5} fill={tint(c, c === GRAY ? '22' : '44')} stroke={c} strokeWidth={1} />
          <T x={172} y={62 + i * 27} anchor="start" size={12} mono bold={c !== GRAY}>{f}</T>
          <T x={468} y={62 + i * 27} anchor="end" size={12} dim={c === GRAY}>{g}</T>
        </g>
      ))}
      <T x={166} y={232} anchor="start" bold fill={PURPLE}>本体</T>
      {[0, 1, 2].map((i) => <Bx key={i} x={164 + i * 106} y={242} w={94} h={34} c={PURPLE} lines={[`取引${i + 1}`]} size={13} />)}
      <T x={320} y={302} size={12} dim>取引（トランザクション）の一覧</T>
      <polyline points="476,259 506,259 506,141 480,141" fill="none" stroke={GREEN} strokeWidth={2} />
      <Arrow x1={510} y1={141} x2={478} y2={141} c={GREEN} />
      <T x={524} y={196} anchor="start" size={12} fill={GREEN}>取引をマークルツリーで</T>
      <T x={524} y={214} anchor="start" size={12} fill={GREEN}>畳んだルートを入れる</T>
      <T x={504} y={84} anchor="start" size={12} fill={BLUE}>ヘッダー全体をハッシュ</T>
      <T x={504} y={102} anchor="start" size={12} fill={BLUE}>→ このブロックのハッシュ</T>
      <T x={504} y={120} anchor="start" size={12} fill={BLUE}>（次のブロックが参照）</T>
    </Fig>
  );
}

// ── 3.6 マークルツリーの包含証明 ──
export function FigMerkleProof() {
  const nw = 130, nh = 36;
  const lx = [20, 180, 340, 500];
  const mid = lx.map((x) => x + nw / 2);
  const m2 = [(mid[0] + mid[1]) / 2, (mid[2] + mid[3]) / 2];
  const root = (m2[0] + m2[1]) / 2;
  const box = (cx: number, y: number, lines: string[], c: string, w = nw, dash?: boolean) => <Bx key={cx + '-' + y} x={cx - w / 2} y={y} w={w} h={nh} c={c} lines={lines} size={13} dash={dash} />;
  return (
    <Fig title="包含証明：tx3 がこのブロックに入っていることを、2個のハッシュで示す" w={640} h={330} caption="tx3 を持つ人は、橙のハッシュ（H₄ と H₁₂）を受け取るだけで、青の部分を自分で計算し、最後にルートがブロックのマークルルートと一致するかを確かめられます。他の取引（tx1・tx2・tx4）の中身は不要です。">
      {mid.map((m, i) => <line key={'a' + i} x1={m} y1={186} x2={m2[Math.floor(i / 2)]} y2={116 + nh} stroke="currentColor" strokeOpacity={0.35} strokeWidth={1.5} />)}
      {m2.map((m, i) => <line key={'b' + i} x1={m} y1={116} x2={root} y2={46 + nh} stroke="currentColor" strokeOpacity={0.35} strokeWidth={1.5} />)}
      {box(root, 46, ['ルート（計算）', 'ブロックの値と一致？'], GREEN, 210)}
      {box(m2[0], 116, ['H₁₂（証明①）'], ORANGE)}
      {box(m2[1], 116, ['H₃₄（計算）'], BLUE)}
      {box(mid[0], 186, ['H₁'], GRAY, nw, true)}
      {box(mid[1], 186, ['H₂'], GRAY, nw, true)}
      {box(mid[2], 186, ['H₃（計算）'], BLUE)}
      {box(mid[3], 186, ['H₄（証明②）'], ORANGE)}
      {mid.map((m, i) => <g key={'t' + i}><Arrow x1={m} y1={254} x2={m} y2={226} c={i === 2 ? PURPLE : undefined} /><Bx x={m - 40} y={254} w={80} h={30} c={i === 2 ? PURPLE : GRAY} lines={[`tx${i + 1}`]} size={13} dash={i !== 2} /></g>)}
      <T x={20} y={314} anchor="start" size={12} fill={ORANGE}>■ 受け取るハッシュ</T>
      <T x={170} y={314} anchor="start" size={12} fill={BLUE}>■ 自分で計算するハッシュ</T>
      <T x={360} y={314} anchor="start" size={12} dim>■ 使わない（破線）</T>
    </Fig>
  );
}

// ── 3.9 フォーク ──
export function FigFork() {
  const bw = 64, bh = 44;
  const blk = (x: number, y: number, label: string, c: string, dash?: boolean) => <Bx key={label + x + y} x={x} y={y} w={bw} h={bh} c={c} lines={[label]} size={13} dash={dash} />;
  const mid = (y: number) => y + bh / 2;
  return (
    <Fig title="フォーク：同時にできた2つの鎖のうち、スコアの大きい方を採用する" w={640} h={252} caption="2つのノードがほぼ同時に次のブロックを作ると、鎖が2本に分かれます。ノードは、難易度や時間間隔から計算したスコアの合計が大きい方の鎖を正として選びます。選ばれなかった側のブロックは捨てられ、そこに含まれていた取引は、あらためてブロックに取り込まれるのを待ちます。">
      {blk(16, 104, '#98', BLUE)}
      {blk(108, 104, '#99', BLUE)}
      {blk(200, 104, '#100', BLUE)}
      <Arrow x1={80} y1={mid(104)} x2={108} y2={mid(104)} />
      <Arrow x1={172} y1={mid(104)} x2={200} y2={mid(104)} />
      <Arrow x1={264} y1={mid(104)} x2={308} y2={mid(34)} c={GREEN} />
      <Arrow x1={264} y1={mid(104)} x2={308} y2={mid(174)} c={RED} dash />
      {blk(308, 34, '#101a', GREEN)}
      {blk(400, 34, '#102a', GREEN)}
      {blk(492, 34, '#103a', GREEN)}
      <Arrow x1={372} y1={mid(34)} x2={400} y2={mid(34)} c={GREEN} />
      <Arrow x1={464} y1={mid(34)} x2={492} y2={mid(34)} c={GREEN} />
      <T x={566} y={mid(34) - 4} anchor="start" size={12} bold fill={GREEN}>★採用</T>
      <T x={566} y={mid(34) + 14} anchor="start" size={12} fill={GREEN}>スコア大</T>
      {blk(308, 174, '#101b', RED, true)}
      {blk(400, 174, '#102b', RED, true)}
      <Arrow x1={372} y1={mid(174)} x2={400} y2={mid(174)} c={RED} dash />
      <T x={480} y={mid(174) - 4} anchor="start" size={12} bold fill={RED}>×破棄</T>
      <T x={480} y={mid(174) + 14} anchor="start" size={12} fill={RED}>取引は取り込み直し</T>
    </Fig>
  );
}

// ── 3.8 トランザクションの状態 ──
export function FigTxState() {
  const items: [string, string[], string][] = [
    ['未承認', ['ノードに届いたが、', 'まだブロックに入っていない'], ORANGE],
    ['承認済み', ['ブロックに取り込まれた。', '巻き戻る可能性は残る'], BLUE],
    ['確定', ['ファイナライズされた。', 'もう巻き戻らない'], GREEN],
  ];
  const hs = [46, 18, 2];
  const labels = ['高い', '低い', 'なし'];
  return (
    <Fig title="トランザクションの3つの状態" w={640} h={290} caption="アナウンスしたトランザクションは、未承認 → 承認済み → 確定の順に進みます。承認済みでも、フォークで別の鎖が選ばれれば取り消される可能性があります。確定すると、ネットワーク全体として巻き戻さないことが決まります。">
      {items.map(([t, ds, c], i) => {
        const x = 10 + i * 220;
        return (
          <g key={t}>
            <rect x={x} y={20} width={190} height={110} rx={10} fill={tint(c, '1c')} stroke={c} strokeWidth={1.5} />
            <T x={x + 95} y={50} size={16} bold fill={c}>{`${i + 1}. ${t}`}</T>
            {ds.map((d, j) => <T key={j} x={x + 95} y={80 + j * 20} size={12}>{d}</T>)}
            {i < 2 && <Arrow x1={x + 190} y1={75} x2={x + 220} y2={75} />}
            <rect x={x + 85} y={230 - hs[i]} width={20} height={hs[i]} rx={3} fill={tint(c, '88')} stroke={c} />
            <T x={x + 95} y={250} size={12} bold fill={c}>{labels[i]}</T>
          </g>
        );
      })}
      <T x={10} y={168} anchor="start" size={13} bold>取り消される可能性</T>
      <line x1={10} y1={230} x2={630} y2={230} stroke="currentColor" strokeOpacity={0.3} />
    </Fig>
  );
}

// ════════ 第4章 Symbolブロックチェーン ════════

// ── 4.2 構成要素の関係 ──
export function FigSymbolParts() {
  const bw = 190, bh = 66;
  return (
    <Fig title="Symbolの4つの構成要素と、その関係" w={640} h={330} caption="アカウントがモザイクを持ち、ネームスペースがそれらに人が読める名前を付けます。台帳を変えるときは、アカウントの秘密鍵で署名したトランザクションを使います。">
      <Bx x={205} y={10} w={230} h={bh} c={PURPLE} lines={['ネームスペース', '人が読める名前（symbol.xym）']} size={13} bold />
      <Bx x={20} y={130} w={bw} h={bh} c={BLUE} lines={['アカウント', '秘密鍵・公開鍵 → アドレス']} size={13} bold />
      <Bx x={430} y={130} w={bw} h={bh} c={ORANGE} lines={['モザイク', 'XYMなどのトークン']} size={13} bold />
      <Bx x={225} y={250} w={bw} h={bh} c={GREEN} lines={['トランザクション', '台帳を変更する要求の単位']} size={13} bold />
      <Arrow x1={270} y1={78} x2={150} y2={128} />
      <T x={168} y={96} anchor="end" size={12} dim>名前を付ける</T>
      <Arrow x1={370} y1={78} x2={490} y2={128} />
      <T x={472} y={96} anchor="start" size={12} dim>名前を付ける</T>
      <Arrow x1={212} y1={163} x2={428} y2={163} />
      <T x={320} y={154} size={12} dim>保有する</T>
      <Arrow x1={270} y1={248} x2={150} y2={198} c={BLUE} />
      <T x={168} y={236} anchor="end" size={12} fill={BLUE}>秘密鍵で署名</T>
      <Arrow x1={370} y1={248} x2={490} y2={198} c={ORANGE} />
      <T x={472} y={236} anchor="start" size={12} fill={ORANGE}>数量を動かす</T>
    </Fig>
  );
}

// ── 4.2 アドレスの作り方 ──
export function FigAddress() {
  const steps = [['公開鍵', '秘密鍵から計算', BLUE], ['SHA3-256', 'でハッシュ', PURPLE], ['RIPEMD-160', 'でハッシュ', PURPLE], ['識別子と', 'チェックサム', ORANGE], ['Base32', 'で文字にする', GREEN]] as const;
  const bw = 100, gap = 22, x0 = 12;
  return (
    <Fig title="アドレスができるまで" w={640} h={200} caption="アドレスは公開鍵から一方向に計算できるので、公開しても秘密鍵は漏れません。">
      {steps.map(([a, b, c], i) => (
        <g key={i}>
          <Bx x={x0 + i * (bw + gap)} y={24} w={bw} h={64} c={c} lines={[a, b]} size={12} bold />
          {i < 4 && <Arrow x1={x0 + i * (bw + gap) + bw} y1={56} x2={x0 + (i + 1) * (bw + gap)} y2={56} />}
        </g>
      ))}
      <Arrow x1={x0 + 4 * (bw + gap) + bw / 2} y1={88} x2={x0 + 4 * (bw + gap) + bw / 2} y2={122} c={GREEN} />
      <Bx x={130} y={124} w={470} h={52} c={GREEN} lines={['アドレス：39文字', 'T始まり＝テストネット　／　N始まり＝メインネット']} size={13} bold />
    </Fig>
  );
}

// ── 5.7 アドレスの導出：データの流れ（バイト数つき）──
export function FigAddressBytes() {
  const x0 = 30, wid = 112, wh = 260, wck = 136;
  return (
    <Fig title="アドレスの導出：データの長さの変化" w={640} h={312} caption="公開鍵から20バイトのハッシュを作り、先頭に識別子（1バイト）を付けて21バイトにします。この21バイトからチェックサム（3バイト）を計算して末尾に付けると24バイトになり、これをBase32で39文字にしたものがアドレスです。">
      <Bx x={20} y={10} w={150} h={50} c={BLUE} lines={['公開鍵', '32バイト']} bold />
      <Arrow x1={170} y1={35} x2={215} y2={35} />
      <Bx x={215} y={10} w={150} h={50} c={PURPLE} lines={['SHA3-256', '→ 32バイト']} bold />
      <Arrow x1={365} y1={35} x2={410} y2={35} />
      <Bx x={410} y={10} w={150} h={50} c={PURPLE} lines={['RIPEMD-160', '→ 20バイト']} bold />
      <T x={x0 + wid / 2} y={90} size={11} fill={ORANGE}>0x98 / 0x68</T>
      <Arrow x1={485} y1={62} x2={x0 + wid + wh / 2 + 20} y2={102} c={PURPLE} />
      <Bx x={x0} y={104} w={wid} h={34} c={ORANGE} lines={['識別子 1バイト']} size={12} bold />
      <Bx x={x0 + wid} y={104} w={wh} h={34} c={BLUE} lines={['公開鍵のハッシュ 20バイト']} size={12} bold />
      <T x={x0 + wid + wh + 10} y={126} anchor="start" size={12} dim>＝ 21バイト</T>
      <Arrow x1={(x0 + wid + wh) / 2 + 10} y1={140} x2={(x0 + wid + wh) / 2 + 10} y2={180} />
      <T x={(x0 + wid + wh) / 2 + 22} y={165} anchor="start" size={12}>SHA3-256にかけて、先頭3バイトを末尾に付ける</T>
      <Bx x={x0} y={184} w={wid} h={34} c={ORANGE} lines={['識別子 1バイト']} size={12} bold />
      <Bx x={x0 + wid} y={184} w={wh} h={34} c={BLUE} lines={['公開鍵のハッシュ 20バイト']} size={12} bold />
      <Bx x={x0 + wid + wh} y={184} w={wck} h={34} c={GREEN} lines={['チェックサム 3バイト']} size={12} bold />
      <T x={x0 + wid + wh + wck + 8} y={206} anchor="start" size={12} dim>24バイト</T>
      <Arrow x1={320} y1={220} x2={320} y2={258} />
      <T x={332} y={244} anchor="start" size={12}>Base32：5ビットずつ区切って文字にする</T>
      <Bx x={150} y={262} w={340} h={36} c={GREEN} lines={['TB6QOVCUOFRCF5QJSKPIQMLUVWGJS3KYFDETRPA']} size={12} bold mono />
    </Fig>
  );
}

// ── 5.7 アドレスの先頭5バイトが、8文字になるところ ──
export function FigAddressBase32() {
  const bytes = [0x98, 0x7d, 0x07, 0x54, 0x54];
  const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const bits = bytes.map((b) => b.toString(2).padStart(8, '0')).join('');
  const groups = Array.from({ length: 8 }, (_, g) => bits.slice(g * 5, g * 5 + 5));
  const vals = groups.map((s) => parseInt(s, 2));
  const cw = 13, step = 15, x0 = 20;
  const bc = [ORANGE, BLUE, BLUE, BLUE, BLUE];
  const gc = [PURPLE, CYAN, PURPLE, CYAN, PURPLE, CYAN, PURPLE, CYAN];
  return (
    <Fig title="アドレスの先頭5バイト（40ビット）が、8文字になる" w={640} h={262} caption="アドレスの24バイトの先頭5バイトを、5ビットずつに区切り直したものです。最初のバイト（識別子0x98）の上位5ビット 10011 ＝ 19 が、文字表の19番目の「T」になります。5バイト（40ビット）はちょうど8文字で、割り切れます。">
      {bytes.map((b, i) => (
        <T key={i} x={x0 + i * 8 * step + (8 * step - 2) / 2} y={18} size={12} bold fill={bc[i]}>{b.toString(16).toUpperCase().padStart(2, '0')}{i === 0 ? '（識別子）' : ''}</T>
      ))}
      {bits.split('').map((ch, i) => <Cell key={i} x={x0 + i * step} y={26} w={cw} h={22} v={ch} c={bc[Math.floor(i / 8)]} size={11} />)}
      <T x={320} y={72} size={12} dim>↓　5ビットずつに区切り直す</T>
      {bits.split('').map((ch, i) => <Cell key={i} x={x0 + i * step} y={82} w={cw} h={22} v={ch} c={gc[Math.floor(i / 5)]} size={11} />)}
      {groups.map((_gp, g) => {
        const gx = x0 + g * 5 * step, gw = 5 * step - 2;
        return (
          <g key={g}>
            <path d={`M ${gx} 110 v 5 h ${gw} v -5`} fill="none" stroke={gc[g]} strokeWidth={1.5} />
            <T x={gx + gw / 2} y={134} size={11} fill={gc[g]}>＝ {vals[g]}</T>
            <Arrow x1={gx + gw / 2} y1={140} x2={gx + gw / 2} y2={158} c={gc[g]} head={7} />
            <Bx x={gx + gw / 2 - 17} y={160} w={34} h={34} c={gc[g]} lines={[A[vals[g]]]} size={18} bold mono />
          </g>
        );
      })}
      <T x={320} y={222} size={13} bold>→ {vals.map((v) => A[v]).join('')}（アドレスの先頭8文字）</T>
      <T x={320} y={246} size={12} dim>24バイト全体では 192ビット ＝ 5ビット × 38文字 ＋ 2ビット。最後の文字は、2ビットに0を3つ足して5ビットにします（合計39文字）。</T>
    </Fig>
  );
}

// ── 4.3 トランザクションの流れ ──
export function FigTxFlow() {
  const bw = 130, gap = 24, x0 = 12;
  const x = (i: number) => x0 + i * (bw + gap);
  const steps = [['① 作成', '宛先・数量・', '期限などを決める', BLUE], ['② 署名', '秘密鍵で署名する', '', BLUE], ['③ アナウンス', 'REST APIで送る', '（未承認）', ORANGE], ['④ 承認', 'ハーベスターが', 'ブロックに取り込む', ORANGE]] as const;
  return (
    <Fig title="トランザクションが承認されるまで" w={640} h={230} caption="アナウンスした時点ではまだ未承認です。ブロックに取り込まれた後、ファイナライズ（確定）されると、覆らなくなります。">
      <rect x={x(0) - 4} y={12} width={2 * bw + gap + 8} height={22} rx={5} fill={tint(BLUE, '22')} />
      <T x={x(0) + bw + gap / 2} y={28} size={12} fill={BLUE} bold>手元（自分のPC）</T>
      <rect x={x(2) - 4} y={12} width={2 * bw + gap + 8} height={22} rx={5} fill={tint(ORANGE, '22')} />
      <T x={x(2) + bw + gap / 2} y={28} size={12} fill={ORANGE} bold>ネットワーク（ノード）</T>
      {steps.map(([a, b, c, col], i) => (
        <g key={i}>
          <Bx x={x(i)} y={46} w={bw} h={74} c={col} lines={c ? [a, b, c] : [a, b]} size={13} bold />
          {i < 3 && <Arrow x1={x(i) + bw} y1={83} x2={x(i + 1)} y2={83} />}
        </g>
      ))}
      <Arrow x1={x(3) + bw / 2} y1={120} x2={x(3) + bw / 2} y2={158} c={GREEN} />
      <Bx x={x(3) - 20} y={160} w={bw + 40} h={52} c={GREEN} lines={['ファイナライズ', '（確定：もう覆らない）']} size={13} bold />
    </Fig>
  );
}

// ── 4.3 ノードとREST API ──
export function FigNodeRoles() {
  const chips: [string, string, string][] = [['ピア', '1', '001'], ['API', '2', '010'], ['投票', '4', '100']];
  return (
    <Fig title="ノードの役割と、REST APIの位置づけ" w={640} h={330} caption="アプリはAPIノードのREST APIを通して台帳を読み、署名済みのトランザクションをアナウンスします。ノードの役割は1・2・4のビットフラグで表され、複数の役割を兼ねるノードは合計値（例：1 ＋ 2 ＝ 3）になります。">
      <Bx x={10} y={92} w={140} h={74} c={BLUE} lines={['あなたのアプリ', '（このコンソール）']} size={13} bold />
      <Arrow x1={152} y1={112} x2={216} y2={112} c={BLUE} />
      <Arrow x1={216} y1={146} x2={152} y2={146} c={GREEN} />
      <T x={184} y={100} size={11} fill={BLUE}>GET（JSON）</T>
      <T x={184} y={164} size={11} fill={GREEN}>応答／PUT</T>
      <rect x={218} y={14} width={210} height={216} rx={10} fill="none" stroke={ORANGE} strokeWidth={1.5} strokeDasharray="6 4" />
      <T x={230} y={36} anchor="start" size={13} bold fill={ORANGE}>APIノード</T>
      <Bx x={232} y={48} w={182} h={46} c={ORANGE} lines={['REST API', '（HTTPで公開）']} size={12} bold />
      <Bx x={232} y={108} w={182} h={46} c={GRAY} lines={['ノード本体', '検証・ブロック処理']} size={12} />
      <Bx x={232} y={168} w={182} h={46} c={GRAY} lines={['データベース', '読み取り用の台帳']} size={12} />
      <Arrow x1={323} y1={94} x2={323} y2={108} />
      <Arrow x1={323} y1={154} x2={323} y2={168} />
      <Arrow x1={414} y1={131} x2={470} y2={131} />
      <T x={442} y={120} size={11} dim>伝播</T>
      <Bx x={472} y={40} w={150} h={52} c={PURPLE} lines={['ピアノード', 'ブロックを作る・中継']} size={12} bold />
      <Bx x={472} y={106} w={150} h={52} c={PURPLE} lines={['ピアノード', '（ほか多数）']} size={12} />
      <Bx x={472} y={172} w={150} h={52} c={GREEN} lines={['投票ノード', 'ファイナライズに投票']} size={12} bold />
      <T x={320} y={262} size={13} bold>役割はビットフラグ（第2章の「フラグ」と同じ考え方）</T>
      {chips.map(([n, w, b], i) => (
        <g key={n}>
          <rect x={90 + i * 170} y={274} width={150} height={40} rx={8} fill={tint(CYAN, '22')} stroke={CYAN} strokeWidth={1.5} />
          <T x={90 + i * 170 + 75} y={291} size={13} bold>{`${n}（${w}）`}</T>
          <T x={90 + i * 170 + 75} y={308} size={12} mono dim>{b}</T>
        </g>
      ))}
    </Fig>
  );
}

// ── 4.9 ネームスペースの階層とエイリアス ──
export function FigNamespaceTree() {
  const bw = 140, bh = 40;
  const col = [20, 190, 360];
  return (
    <Fig title="ネームスペースの階層とエイリアス" w={640} h={250} caption="ルート（レンタルして取得）の下に、所有者がサブネームスペースを作れます。ネームスペースはエイリアス（別名）として、アドレスかモザイクのどちらか1つに結びつけられます。">
      <T x={col[0] + bw / 2} y={18} size={12} bold fill={PURPLE}>ルート</T>
      <T x={col[1] + bw / 2} y={18} size={12} bold fill={PURPLE}>サブ（1段目）</T>
      <T x={col[2] + bw / 2} y={18} size={12} bold fill={PURPLE}>サブ（2段目）</T>
      <T x={575} y={18} size={12} bold fill={ORANGE}>結びつけ先</T>

      <Bx x={col[0]} y={30} w={bw} h={bh} c={PURPLE} lines={['symbol']} size={13} bold mono />
      <Bx x={col[1]} y={30} w={bw} h={bh} c={PURPLE} lines={['symbol.xym']} size={13} bold mono />
      <Arrow x1={col[0] + bw} y1={50} x2={col[1]} y2={50} />
      <Bx x={520} y={30} w={110} h={bh} c={ORANGE} lines={['モザイク XYM']} size={12} bold />
      <Arrow x1={col[1] + bw} y1={50} x2={518} y2={50} c={ORANGE} dash />

      <Bx x={col[0]} y={96} w={bw} h={bh} c={PURPLE} lines={['alice']} size={13} bold mono />
      <Bx x={col[1]} y={96} w={bw} h={bh} c={PURPLE} lines={['alice.tokens']} size={13} bold mono />
      <Bx x={col[2]} y={96} w={bw} h={bh} c={PURPLE} lines={['alice.tokens.point']} size={12} bold mono />
      <Arrow x1={col[0] + bw} y1={116} x2={col[1]} y2={116} />
      <Arrow x1={col[1] + bw} y1={116} x2={col[2]} y2={116} />
      <Bx x={520} y={96} w={110} h={bh} c={ORANGE} lines={['独自のモザイク']} size={12} bold />
      <Arrow x1={col[2] + bw} y1={116} x2={518} y2={116} c={ORANGE} dash />

      <Bx x={col[0]} y={162} w={bw} h={bh} c={PURPLE} lines={['bob']} size={13} bold mono />
      <Bx x={520} y={162} w={110} h={bh} c={BLUE} lines={['アドレス T…']} size={12} bold />
      <Arrow x1={col[0] + bw} y1={182} x2={518} y2={182} c={BLUE} dash />
      <T x={340} y={174} size={11} fill={BLUE}>アドレスのエイリアス</T>
      <T x={320} y={232} size={12} dim>点（.）で区切った全体が名前。名前は小文字の英数字と _ と - で付けます。</T>
    </Fig>
  );
}

// ── 4.10 トランザクションのバイト構造（送金の例）──
export function FigTxBytes() {
  type Row = [number, number, string, string];
  const head: Row[] = [
    [0, 4, 'size', BLUE], [4, 4, '予約', GRAY], [8, 64, 'signature（署名）', CYAN], [72, 32, 'signerPublicKey', CYAN], [104, 4, '予約', GRAY],
    [108, 1, 'version', BLUE], [109, 1, 'network', BLUE], [110, 2, 'type', BLUE], [112, 8, 'maxFee', BLUE], [120, 8, 'deadline', BLUE],
  ];
  const body: Row[] = [
    [128, 24, 'recipientAddress', GREEN], [152, 2, 'messageSize', GREEN], [154, 1, 'mosaicsCount', GREEN], [155, 4, '予約', GRAY], [159, 1, '予約', GRAY],
    [160, 8, 'mosaic の id', ORANGE], [168, 8, 'mosaic の amount', ORANGE],
  ];
  const rng = (o: number, n: number) => (n === 1 ? `${o}` : `${o}〜${o + n - 1}`);
  const draw = (rows: Row[], x: number) => rows.map(([o, n, name, c], i) => (
    <g key={`${x}-${o}`}>
      <rect x={x} y={48 + i * 28} width={300} height={24} rx={5} fill={tint(c, c === GRAY ? '22' : '44')} stroke={c} strokeWidth={1} strokeDasharray={c === GRAY ? '4 3' : undefined} />
      <T x={x + 8} y={65 + i * 28} anchor="start" size={12} mono dim>{rng(o, n)}</T>
      <T x={x + 92} y={65 + i * 28} anchor="start" size={12} bold={c !== GRAY}>{name}</T>
      <T x={x + 292} y={65 + i * 28} anchor="end" size={12} dim>{`${n}B`}</T>
    </g>
  ));
  return (
    <Fig title="送金トランザクションのバイト構造（メッセージなし・XYM送金）" w={640} h={348} caption="どのトランザクションも先頭128バイトは共通のヘッダーで、そのあとに種類ごとの本体が続きます。この例は 128 ＋ 32 ＋ 16 ＝ 176バイトです。数値はリトルエンディアンで並びます。">
      <T x={160} y={30} size={13} bold fill={BLUE}>共通ヘッダー（128バイト）</T>
      <T x={480} y={30} size={13} bold fill={GREEN}>送金の本体（32）＋ モザイク（16）</T>
      {draw(head, 10)}
      {draw(body, 330)}
      <T x={480} y={265} size={12} dim>灰色の破線は、将来のための予約領域です</T>
    </Fig>
  );
}

// ════════ 追加の図解（第1章・第2章・第4章・第5章の補足）════════

// ── 1.6 Promise の3つの状態と await ──
export function FigPromise() {
  return (
    <Fig title="Promise の状態と await" w={640} h={250} caption="Promise は、最初は「待機中」で、あとから「成功」か「失敗」のどちらかに必ず変わります。await は、その結果が出るまで待ち、成功なら値を返し、失敗なら例外を投げます（例外は try / catch で受けます）。">
      <Bx x={20} y={92} w={170} h={66} c={GRAY} lines={['待機中', '（pending）', '結果はまだ']} size={13} bold />
      <Bx x={260} y={26} w={190} h={66} c={GREEN} lines={['成功', '（fulfilled）', '値が届いた']} size={13} bold />
      <Bx x={260} y={158} w={190} h={66} c={RED} lines={['失敗', '（rejected）', 'エラーが届いた']} size={13} bold />
      <Arrow x1={190} y1={108} x2={258} y2={64} c={GREEN} />
      <T x={206} y={78} anchor="end" size={12} fill={GREEN} mono>resolve</T>
      <Arrow x1={190} y1={142} x2={258} y2={186} c={RED} />
      <T x={206} y={186} anchor="end" size={12} fill={RED} mono>reject</T>
      <Arrow x1={450} y1={59} x2={488} y2={59} c={GREEN} />
      <Bx x={490} y={30} w={140} h={58} c={GREEN} lines={['await は値を返す', 'v = await …']} size={12} />
      <Arrow x1={450} y1={191} x2={488} y2={191} c={RED} />
      <Bx x={490} y={162} w={140} h={58} c={RED} lines={['await は例外を投げる', '→ catch で受ける']} size={12} />
    </Fig>
  );
}

// ── 1.7 fetch の2段階 ──
export function FigFetch() {
  const bw = 140, bh = 66;
  const x = (i: number) => 10 + i * 160;
  const boxes: [string[], string][] = [
    [['fetch(URL)', 'await で待つ'], BLUE],
    [['Response', '通信の結果。', '本文はまだ'], ORANGE],
    [['① ok / status', '成功かどうかを', '自分で確かめる'], PURPLE],
    [['② res.json()', 'await で本文を', '読み取る'], GREEN],
  ];
  return (
    <Fig title="fetch の戻り値は2段階で読む" w={640} h={230} caption="fetch が返すのは、まず「通信の結果（Response）」です。本文（JSON）は、結果を確かめてから、もう一度 await して取り出します。サーバーが404や500を返しても例外にはならないので、ok の確認は自分で行います。">
      {boxes.map(([ls, c], i) => (
        <g key={i}>
          <Bx x={x(i)} y={20} w={bw} h={bh} c={c} lines={ls} size={12} bold />
          {i < 3 && <Arrow x1={x(i) + bw} y1={53} x2={x(i + 1)} y2={53} />}
        </g>
      ))}
      <Arrow x1={x(0) + bw / 2} y1={86} x2={x(0) + bw / 2} y2={136} c={RED} dash />
      <Bx x={x(0) - 4} y={138} w={bw + 8} h={56} c={RED} lines={['サーバーに届かない', '→ 例外（catch）']} size={12} />
      <Arrow x1={x(2) + bw / 2} y1={86} x2={x(2) + bw / 2} y2={136} c={ORANGE} dash />
      <Bx x={x(2) - 20} y={138} w={bw + 40} h={56} c={ORANGE} lines={['404・500 など', '→ ok が false（例外ではない）']} size={12} />
    </Fig>
  );
}

// ── 1.8 try / catch / finally の流れ ──
export function FigTryCatch() {
  return (
    <Fig title="try / catch / finally の流れ" w={640} h={240} caption="try の中で例外が起きると、残りは実行せず、すぐ catch に移ります。finally は、成功しても失敗しても、最後に必ず実行されます。">
      <Bx x={10} y={87} w={140} h={66} c={BLUE} lines={['try の中の処理', '上から順に実行']} size={13} bold />
      <Arrow x1={150} y1={108} x2={218} y2={64} c={GREEN} />
      <T x={196} y={74} anchor="end" size={12} fill={GREEN}>例外なし</T>
      <Arrow x1={150} y1={132} x2={218} y2={176} c={RED} />
      <T x={196} y={176} anchor="end" size={12} fill={RED}>例外あり</T>
      <Bx x={220} y={30} w={190} h={62} c={GREEN} lines={['最後まで実行する', '（catch は飛ばす）']} size={12} />
      <Bx x={220} y={148} w={190} h={62} c={RED} lines={['残りは実行しない', 'catch (e) で受ける']} size={12} />
      <Arrow x1={410} y1={61} x2={458} y2={102} />
      <Arrow x1={410} y1={179} x2={458} y2={138} />
      <Bx x={460} y={87} w={170} h={66} c={PURPLE} lines={['finally', 'どちらでも必ず実行', '（後始末をここに書く）']} size={12} bold />
    </Fig>
  );
}

// ── 2.3 Number と uint64 の範囲 ──
export function FigNumRange() {
  const u = 8; // 1ビット＝8px
  const x0 = 20;
  return (
    <Fig title="Number で正確に扱える範囲と、64ビットの値" w={640} h={210} caption="横の長さは、値の大きさではなく、ビット数です。Number が正確に扱える整数は約53ビットまでで、64ビットの値（数量・ミリ秒・ID）の上の約11ビット分は、下の桁がずれます。BigInt は、この範囲をすべて正確に扱えます。">
      <T x={x0} y={24} anchor="start" size={13} bold fill={BLUE}>Number で正確に扱える整数：約9×10¹⁵ まで（53ビット）</T>
      <rect x={x0} y={34} width={53 * u} height={34} rx={6} fill={tint(BLUE, '55')} stroke={BLUE} strokeWidth={1.5} />
      <T x={x0 + 53 * u / 2} y={57} size={13} mono>MAX_SAFE_INTEGER = 9007199254740991</T>
      <T x={x0} y={106} anchor="start" size={13} bold fill={GREEN}>64ビットの整数（uint64）：最大 約1.8×10¹⁹</T>
      <rect x={x0} y={116} width={53 * u} height={34} rx={6} fill={tint(GREEN, '33')} stroke={GREEN} strokeWidth={1.5} />
      <rect x={x0 + 53 * u} y={116} width={11 * u} height={34} rx={6} fill={tint(RED, '55')} stroke={RED} strokeWidth={1.5} />
      <T x={x0 + 53 * u / 2} y={139} size={13}>ここまでは Number でも正確</T>
      <T x={x0 + 53 * u + 11 * u / 2} y={139} size={12} fill={RED} bold>ずれる</T>
      <line x1={x0} y1={162} x2={x0 + 64 * u} y2={162} stroke="currentColor" strokeOpacity={0.4} />
      <T x={x0} y={182} anchor="start" size={12} dim>0</T>
      <T x={x0 + 53 * u} y={182} size={12} dim>53ビット</T>
      <T x={x0 + 64 * u} y={182} size={12} dim>64ビット</T>
    </Fig>
  );
}

// ── 4.3 履歴と状態 ──
export function FigHistoryState() {
  const rows: [string, boolean][] = [
    ['① Mint → Alice　100', true],
    ['② Alice → Bob　30', true],
    ['③ Bob → Carol　10', true],
    ['④ Alice → Carol　200（残高70で足りない）', false],
  ];
  const state: [string, number][] = [['Mint', 900], ['Alice', 70], ['Bob', 20], ['Carol', 10]];
  return (
    <Fig title="履歴（記録されるもの）と状態（計算で求まるもの）" w={640} h={250} caption="ブロックチェーンに順番に記録されるのは、取引の履歴です。残高などの状態は、履歴を先頭から順に当てはめて求めます。④は残高が足りないので拒否され、状態には反映されません。">
      <T x={10} y={20} anchor="start" size={13} bold fill={BLUE}>履歴（取引の記録・追記だけ）</T>
      {rows.map(([t, ok], i) => (
        <Bx key={i} x={10} y={32 + i * 48} w={330} h={38} c={ok ? GREEN : RED} lines={[t + (ok ? '　✓' : '　✗')]} size={12} />
      ))}
      <Arrow x1={346} y1={125} x2={410} y2={125} />
      <T x={378} y={112} size={11} dim>先頭から</T>
      <T x={378} y={142} size={11} dim>順に適用</T>
      <T x={420} y={20} anchor="start" size={13} bold fill={ORANGE}>状態（残高の表）</T>
      {state.map(([n, v], i) => (
        <g key={n}>
          <Bx x={420} y={32 + i * 48} w={210} h={38} c={ORANGE} lines={[`${n}：${v}`]} size={13} bold />
        </g>
      ))}
    </Fig>
  );
}

// ── 4.11 確率的ファイナリティと明示的ファイナリティ ──
export function FigFinality() {
  const bw = 64, gap = 14, x0 = 20;
  const bx = (i: number) => x0 + i * (bw + gap);
  const alpha = ['99', '88', '77', '55', '33', '22'];
  return (
    <Fig title="確率的ファイナリティと、明示的ファイナリティ" w={640} h={300} caption="確率的：ブロックが深く積まれるほど、覆る確率が下がりますが、0にはなりません。明示的：投票などで「ここまで」という確定ラインが引かれ、ラインより前は巻き戻りません。">
      <T x={x0} y={22} anchor="start" size={13} bold fill={BLUE}>確率的（例：Bitcoin）</T>
      {alpha.map((a, i) => (
        <g key={i}>
          <rect x={bx(i)} y={34} width={bw} height={40} rx={6} fill={tint(GREEN, a)} stroke={GREEN} strokeWidth={1.5} />
          <T x={bx(i) + bw / 2} y={59} size={12}>{i === 5 ? '最新' : `ブロック`}</T>
          {i < 5 && <Arrow x1={bx(i) + bw} y1={54} x2={bx(i + 1)} y2={54} head={7} />}
        </g>
      ))}
      <T x={x0} y={98} anchor="start" size={12} dim>古い ← 覆る確率が小さい　　　新しい → 覆る確率が大きい　（いつ確定とみなすかは利用者が決める）</T>

      <T x={x0} y={150} anchor="start" size={13} bold fill={PURPLE}>明示的（投票で確定させる方式）</T>
      {alpha.map((_, i) => (
        <g key={i}>
          <rect x={bx(i)} y={162} width={bw} height={40} rx={6} fill={tint(i < 3 ? GREEN : ORANGE, '44')} stroke={i < 3 ? GREEN : ORANGE} strokeWidth={1.5} />
          <T x={bx(i) + bw / 2} y={187} size={12}>ブロック</T>
          {i < 5 && <Arrow x1={bx(i) + bw} y1={182} x2={bx(i + 1)} y2={182} head={7} />}
        </g>
      ))}
      <line x1={bx(3) - gap / 2} y1={152} x2={bx(3) - gap / 2} y2={226} stroke={PURPLE} strokeWidth={2} strokeDasharray="6 4" />
      <T x={bx(3) - gap / 2} y={244} size={12} bold fill={PURPLE}>確定ライン</T>
      <T x={bx(1) + bw / 2} y={222} size={12} fill={GREEN} bold>確定（巻き戻らない）</T>
      <T x={bx(4) + bw / 2} y={222} size={12} fill={ORANGE} bold>まだ（巻き戻りうる）</T>
      <Arrow x1={bx(3) - gap / 2 + 6} y1={262} x2={bx(3) - gap / 2 + 70} y2={262} c={PURPLE} />
      <T x={bx(3) - gap / 2 + 76} y={266} anchor="start" size={12} dim>投票が進むと、ラインが右へ動く</T>
    </Fig>
  );
}

// ── 5.4 uint64 は JSON では文字列 ──
export function FigUint64() {
  const bw = 140, bh = 74;
  const x = (i: number) => 10 + i * 160;
  return (
    <Fig title="64ビットの値は、文字列で届いて、BigInt で計算する" w={640} h={250} caption="ブロック高・数量・期限などの64ビットの値は、JSONでは文字列で届きます。計算するときは BigInt に直し、表示や送信のときに、また文字列に戻します。Number に直すと、約9×10¹⁵ を超えた値がずれます。">
      <Bx x={x(0)} y={20} w={bw} h={bh} c={BLUE} lines={['台帳の値', 'uint64', '（64ビットの整数）']} size={12} bold />
      <Bx x={x(1)} y={20} w={bw} h={bh} c={ORANGE} lines={['JSON で届く', '"1234567"', '（文字列）']} size={12} bold />
      <Bx x={x(2)} y={20} w={bw} h={bh} c={GREEN} lines={['BigInt に直す', 'BigInt("1234567")', '→ 1234567n']} size={12} bold />
      <Bx x={x(3)} y={20} w={bw} h={bh} c={PURPLE} lines={['計算して', '.toString() で', '表示・送信']} size={12} bold />
      {[0, 1, 2].map((i) => <Arrow key={i} x1={x(i) + bw} y1={57} x2={x(i + 1)} y2={57} />)}
      <Arrow x1={x(1) + bw / 2} y1={94} x2={x(1) + bw / 2} y2={150} c={RED} dash />
      <Bx x={x(1) - 30} y={152} w={bw + 60} h={70} c={RED} lines={['Number("…") に直すと', '約9×10¹⁵ を超える値が', '静かにずれる']} size={12} />
      <Arrow x1={x(2) + 70} y1={94} x2={x(2) + 70} y2={150} c={RED} dash />
      <Bx x={x(2) + 30} y={152} w={bw + 90} h={70} c={RED} lines={['文字列のまま + 1 すると', '"12345671" になる（連結）']} size={12} />
    </Fig>
  );
}

// ── 5.5 timestamp を実際の日時にする ──
export function FigTimestamp() {
  return (
    <Fig title="timestamp から実際の日時を求める" w={640} h={230} caption="timestamp は、ネットワークが始まった時点からの経過ミリ秒です。ネットワークの開始時刻（epochAdjustment、Unix時刻の秒）にミリ秒へ直して足すと、実際の日時になります。deadline も同じ測り方です。図の長さは、実際の比率ではありません。">
      <line x1={50} y1={80} x2={600} y2={80} stroke="currentColor" strokeOpacity={0.4} strokeWidth={2} />
      <rect x={50} y={64} width={230} height={32} rx={6} fill={tint(GRAY, '44')} stroke={GRAY} strokeWidth={1.5} />
      <T x={165} y={85} size={12}>epochAdjustment（秒）× 1000</T>
      <rect x={280} y={64} width={250} height={32} rx={6} fill={tint(BLUE, '44')} stroke={BLUE} strokeWidth={1.5} />
      <T x={405} y={85} size={12}>timestamp（ミリ秒）</T>
      {[[50, '1970年1月1日', '（Unix時刻の0）'], [280, 'ネットワーク開始', '（開始時刻）'], [530, 'ブロックの', '作成時刻']].map(([cx, a, b], i) => (
        <g key={i}>
          <circle cx={cx as number} cy={80} r={5} fill="currentColor" />
          <T x={cx as number} y={122} size={12} bold>{a as string}</T>
          <T x={cx as number} y={140} size={12} dim>{b as string}</T>
        </g>
      ))}
      <Bx x={90} y={168} w={460} h={44} c={GREEN} lines={['実際の日時（ミリ秒）＝ epochAdjustment × 1000 ＋ timestamp']} size={13} bold />
    </Fig>
  );
}

// ── 5.8 数量は最小単位の整数 ──
export function FigAmount() {
  return (
    <Fig title="画面の数量と、台帳の数量（可分性が6の場合）" w={640} h={250} caption="台帳には小数がなく、最小単位の整数で記録されます。人が入力するときは 10の6乗 を掛け、画面に表示するときは 10の6乗 で割ります。可分性（divisibility）が違うモザイクでは、掛ける・割る数が変わります。">
      <Bx x={20} y={30} w={190} h={78} c={BLUE} lines={['画面に出す数量', '12.5 XYM', '（人が読む形）']} size={13} bold />
      <Bx x={430} y={30} w={190} h={78} c={ORANGE} lines={['台帳・APIの数量', '"12500000"', '（最小単位の整数）']} size={13} bold />
      <Arrow x1={212} y1={52} x2={428} y2={52} />
      <T x={320} y={44} size={12} dim>入力するとき：× 1000000</T>
      <Arrow x1={428} y1={86} x2={212} y2={86} />
      <T x={320} y={110} size={12} dim>表示するとき：÷ 1000000</T>
      <rect x={20} y={142} width={600} height={90} rx={8} fill="rgba(255,255,255,0.07)" stroke={GRAY} strokeWidth={1} />
      <T x={40} y={168} anchor="start" size={13}>divisibility ＝ 6 のとき　：　1000000 ＝ 1 XYM　、　12345678 ＝ 12.345678 XYM</T>
      <T x={40} y={192} anchor="start" size={13}>divisibility ＝ 0 のとき　：　数量は整数だけ（1 ＝ 1個）</T>
      <T x={40} y={216} anchor="start" size={12} dim>1000000 と書かれた残高が 1 XYM なのか 100万個なのかは、可分性を見ないと分かりません。</T>
    </Fig>
  );
}

// ── 5.11 アグリゲートトランザクション ──
export function FigAggregate() {
  return (
    <Fig title="アグリゲートトランザクション（複数の操作を1つにまとめる）" w={640} h={330} caption="中に入れる各トランザクション（インナー）は署名を持たず、外側のアグリゲートへの署名（連署を含む）でまとめて承認されます。全部成功するか、全部失敗するかのどちらかです。">
      <rect x={20} y={14} width={600} height={140} rx={10} fill="none" stroke={ORANGE} strokeWidth={1.5} strokeDasharray="6 4" />
      <T x={34} y={36} anchor="start" size={13} bold fill={ORANGE}>アグリゲートトランザクション（外側）：署名 ＋ 連署</T>
      <Bx x={40} y={52} w={170} h={80} c={BLUE} lines={['インナー①', '送金', '（署名なし）']} size={12} bold />
      <Bx x={235} y={52} w={170} h={80} c={BLUE} lines={['インナー②', 'モザイクの作成', '（署名なし）']} size={12} bold />
      <Bx x={430} y={52} w={170} h={80} c={BLUE} lines={['インナー③', 'ほかの操作', '（署名なし）']} size={12} bold />
      <Arrow x1={160} y1={156} x2={160} y2={190} />
      <Arrow x1={480} y1={156} x2={480} y2={190} />
      <Bx x={20} y={192} w={290} h={120} c={GREEN} lines={['complete（type 0x4141）', '必要な署名が、最初から揃っている', '→ そのまま送って、承認される']} size={12} bold />
      <Bx x={330} y={192} w={290} h={120} c={PURPLE} lines={['bonded（type 0x4241）', 'あとから署名（連署）を集める', '→ ハッシュロック（預け金）を払って先に送る', '→ 署名が揃ったら承認される']} size={12} bold />
    </Fig>
  );
}

// ── 5.12 手数料の計算 ──
export function FigFee() {
  const x0 = 100, full = 440, used = Math.round(full * 17600 / 20000);
  return (
    <Fig title="手数料の計算と、maxFee" w={640} h={290} caption="実際の手数料は「サイズ × feeMultiplier」で決まります。maxFee は、払ってもよい上限です。実際の手数料が maxFee 以下なら、余った分は取られません。maxFee が足りないと、承認されないまま期限切れになることがあります。数値は例です。">
      <Bx x={20} y={20} w={170} h={64} c={BLUE} lines={['サイズ', '176 バイト']} size={13} bold />
      <T x={208} y={60} size={24}>×</T>
      <Bx x={226} y={20} w={190} h={64} c={ORANGE} lines={['feeMultiplier', '100（ブロックが決める）']} size={13} bold />
      <T x={434} y={60} size={24}>＝</T>
      <Bx x={452} y={20} w={168} h={64} c={GREEN} lines={['実際の手数料', '17600（最小単位）']} size={13} bold />
      <T x={20} y={134} anchor="start" size={13} bold>maxFee（上限）の例：20000</T>
      <rect x={x0} y={148} width={used} height={36} rx={6} fill={tint(GREEN, '55')} stroke={GREEN} strokeWidth={1.5} />
      <rect x={x0 + used} y={148} width={full - used} height={36} rx={6} fill="none" stroke={GRAY} strokeWidth={1.5} strokeDasharray="5 4" />
      <T x={x0 + used / 2} y={171} size={13} bold>払う分　17600</T>
      <T x={x0 + full} y={142} anchor="end" size={11} dim>余り（取られない）</T>
      <line x1={x0} y1={198} x2={x0 + full} y2={198} stroke="currentColor" strokeOpacity={0.4} />
      <T x={x0} y={216} size={12} dim>0</T>
      <T x={x0 + full} y={216} size={12} dim>maxFee</T>
      <Bx x={20} y={236} w={600} h={40} c={RED} lines={['maxFee < 必要な手数料　→　ノードに受け付けられず、承認されないまま期限（deadline）切れになる']} size={12} />
    </Fig>
  );
}

// ── 5.14 アプリ・SDK・REST API の役割分担 ──
export function FigSdkLayers() {
  return (
    <Fig title="アプリ・SDK・REST API の役割分担" w={640} h={290} caption="署名は、必ず手元（SDK）で行います。ノードに渡すのは、署名の結果（署名済みトランザクション）だけです。台帳を読むだけなら、REST API だけで足ります。">
      <rect x={6} y={16} width={430} height={170} rx={10} fill="none" stroke={GREEN} strokeWidth={1.5} strokeDasharray="6 4" />
      <T x={20} y={38} anchor="start" size={13} bold fill={GREEN}>手元（秘密鍵は、ここから出さない）</T>
      <rect x={452} y={16} width={182} height={170} rx={10} fill="none" stroke={ORANGE} strokeWidth={1.5} strokeDasharray="6 4" />
      <T x={466} y={38} anchor="start" size={13} bold fill={ORANGE}>ネットワーク</T>
      <Bx x={20} y={62} w={130} h={100} c={BLUE} lines={['あなたのアプリ', '（本編のコード）']} size={12} bold />
      <Bx x={236} y={62} w={190} h={100} c={PURPLE} lines={['Symbol SDK', 'アドレスの計算', 'バイト列の組み立て', '署名・ハッシュ']} size={12} bold />
      <Bx x={466} y={62} w={156} h={100} c={ORANGE} lines={['ノードの', 'REST API', '読む（GET）', '受け取る（PUT）']} size={12} bold />
      <Arrow x1={150} y1={112} x2={234} y2={112} />
      <T x={192} y={102} size={11} dim>命令</T>
      <Arrow x1={426} y1={112} x2={464} y2={112} c={PURPLE} />
      <T x={445} y={102} size={10} fill={PURPLE}>PUT</T>
      <polyline points="544,164 544,222 85,222 85,166" fill="none" stroke="currentColor" strokeOpacity={0.7} strokeWidth={2} />
      <Arrow x1={85} y1={196} x2={85} y2={164} />
      <T x={315} y={214} size={12} dim>読み取り（GET）は、REST API だけで足りる</T>
      <Bx x={20} y={238} w={600} h={40} c={RED} lines={['秘密鍵を、ノードにも REST API にも送ってはいけない（署名は手元で行う）']} size={12} bold />
    </Fig>
  );
}
// ── JavaScript入門: for 文の流れ ──
export function FigFor() {
  const bw = 130, bh = 62, y = 28;
  const x = (i: number) => 10 + i * 160;
  const back = x(1) + bw * 0.78, out = x(1) + bw * 0.22;
  return (
    <Fig title="for 文は、この順番で動く" w={640} h={230} caption="① は最初の1回だけ。② の条件が真の間、③ → ④ → ② … と繰り返し、偽になったら終わります。条件を偽にする更新（④）を忘れると、永遠に終わりません。">
      <Bx x={x(0)} y={y} w={bw} h={bh} c={BLUE} lines={['① 準備', 'let i = 0', '（最初の1回だけ）']} size={12} bold />
      <Bx x={x(1)} y={y} w={bw} h={bh} c={ORANGE} lines={['② 条件を調べる', 'i < 3 ?']} size={12} bold />
      <Bx x={x(2)} y={y} w={bw} h={bh} c={GREEN} lines={['③ 中身を実行', '{ … }']} size={12} bold />
      <Bx x={x(3)} y={y} w={bw} h={bh} c={PURPLE} lines={['④ 更新', 'i++', '（i を1増やす）']} size={12} bold />
      <Arrow x1={x(0) + bw} y1={y + bh / 2} x2={x(1)} y2={y + bh / 2} />
      <Arrow x1={x(1) + bw} y1={y + bh / 2} x2={x(2)} y2={y + bh / 2} c={GREEN} />
      <T x={x(1) + bw + 15} y={y + bh / 2 - 8} size={11} fill={GREEN}>真</T>
      <Arrow x1={x(2) + bw} y1={y + bh / 2} x2={x(3)} y2={y + bh / 2} />
      <polyline points={`${x(3) + bw / 2},${y + bh} ${x(3) + bw / 2},${y + bh + 36} ${back},${y + bh + 36}`} fill="none" stroke="currentColor" strokeOpacity={0.7} strokeWidth={2} />
      <Arrow x1={back} y1={y + bh + 36} x2={back} y2={y + bh + 2} />
      <T x={(back + x(3) + bw / 2) / 2} y={y + bh + 30} size={11} dim>② に戻る</T>
      <Arrow x1={out} y1={y + bh} x2={out} y2={140} c={RED} dash />
      <T x={out + 8} y={y + bh + 30} anchor="start" size={11} fill={RED}>偽</T>
      <Bx x={out - 70} y={142} w={150} h={56} c={RED} lines={['偽になったら', 'for 文の次の行へ']} size={12} bold />
    </Fig>
  );
}

// ── JavaScript入門: 関数を渡す（コールバック）──
export function FigCallback() {
  const rows: [string, string, string, string][] = [
    ['setTimeout(f, 100)', 'タイマー', '100ミリ秒たったら', 'f が呼ばれる'],
    ['items.forEach(f)', '配列', '要素1つずつ', 'f(要素) が呼ばれる'],
    ['socket.onmessage = f', 'WebSocket', '受信するたびに', 'f(データ) が呼ばれる'],
  ];
  const y = (i: number) => 24 + i * 74;
  return (
    <Fig title="コールバック：関数を渡して、あとで呼んでもらう" w={680} h={250} caption="関数 f は、渡した時点では動きません。渡された側が、決められたタイミングで f を呼びます。呼ぶのも、引数を渡すのも、渡された側の仕事です。">
      {rows.map(([code, who, when, what], i) => (
        <g key={i}>
          <Bx x={10} y={y(i)} w={190} h={52} c={BLUE} lines={[code]} size={12} mono />
          <Arrow x1={200} y1={y(i) + 26} x2={238} y2={y(i) + 26} />
          <Bx x={240} y={y(i)} w={120} h={52} c={ORANGE} lines={[who, '（f を預かる）']} size={12} bold />
          <Arrow x1={360} y1={y(i) + 26} x2={398} y2={y(i) + 26} c={ORANGE} dash />
          <T x={379} y={y(i) + 14} size={10} fill={ORANGE}>あとで</T>
          <Bx x={400} y={y(i)} w={120} h={52} c={GRAY} lines={[when]} size={12} />
          <Arrow x1={520} y1={y(i) + 26} x2={548} y2={y(i) + 26} c={GREEN} />
          <Bx x={550} y={y(i)} w={120} h={52} c={GREEN} lines={[what]} size={12} bold />
        </g>
      ))}
    </Fig>
  );
}

// ── JavaScript入門: .then の連鎖 ──
export function FigThenChain() {
  const bw = 150, bh = 70, y = 24;
  const x = (i: number) => 10 + i * 215;
  return (
    <Fig title=".then の連鎖：return した値が、次の then の引数になる" w={640} h={250} caption="then に渡した関数が return した値（Promise を return したときは、その結果）が、次の then の関数の引数になります。途中で例外が起きると、残りの then は飛ばされて、catch に移ります。">
      <Bx x={x(0)} y={y} w={bw} h={bh} c={BLUE} lines={['fetch(URL)', '→ Promise', '（通信の結果を約束）']} size={12} bold />
      <Bx x={x(1)} y={y} w={bw} h={bh} c={ORANGE} lines={['res', 'Response', '（本文はまだ）']} size={12} bold />
      <Bx x={x(2) - 20} y={y} w={bw + 20} h={bh} c={GREEN} lines={['json', '本文のデータ', '（オブジェクト）']} size={12} bold />
      <Arrow x1={x(0) + bw} y1={y + bh / 2} x2={x(1)} y2={y + bh / 2} />
      <T x={(x(0) + bw + x(1)) / 2} y={y + bh / 2 - 18} size={11} mono>.then</T>
      <Arrow x1={x(1) + bw} y1={y + bh / 2} x2={x(2) - 20} y2={y + bh / 2} />
      <T x={(x(1) + bw + x(2) - 20) / 2} y={y + bh / 2 - 18} size={11} mono>.then</T>
      <Bx x={x(0) + 30} y={124} w={440} h={34} c={ORANGE} lines={['(res) => res.json()  ← 1つ目：本文を読む']} size={12} mono filled={false} />
      <Bx x={x(0) + 30} y={166} w={440} h={34} c={GREEN} lines={['(json) => { … }  ← 2つ目：本文のデータを使う']} size={12} mono filled={false} />
      <Bx x={x(0) + 30} y={208} w={440} h={34} c={RED} lines={['.catch((e) => …)  ← 失敗は、最後にここで受ける']} size={12} mono filled={false} />
    </Fig>
  );
}

// ════════ JavaScript入門: アルゴリズムの図解（繰り返し・再帰・配列メソッド・非同期の順序）════════

// ── 合計を作る：入れ物を用意して、繰り返しの中で育てる ──
export function FigAccumulate() {
  const bw = 76, bh = 56, y = 78, step = 118, x0 = 10;
  const x = (i: number) => x0 + i * step;
  const vals = [0, 1, 3, 6, 10, 15];
  const mid = y + bh / 2;
  return (
    <Fig title="合計を作る：入れ物を用意して、繰り返しの中で育てる" w={700} h={190} caption="最初に total を 0 にしておき、繰り返しのたびに i を足して、結果を total に入れ直します。1回ごとに、total が 0 → 1 → 3 → 6 → 10 → 15 と育っていきます。個数を数える、文字をつなぐ、といった処理も同じ形です。">
      {vals.map((v, i) => (
        <g key={i}>
          <Bx x={x(i)} y={y} w={bw} h={bh} c={i === 0 ? GRAY : i === 5 ? GREEN : BLUE} lines={['total', String(v)]} size={15} bold />
          <T x={x(i) + bw / 2} y={y + bh + 24} size={12} mono dim>{i === 0 ? '最初の値' : `${vals[i - 1]} + ${i}`}</T>
        </g>
      ))}
      {[1, 2, 3, 4, 5].map((k) => {
        const gx = x(k - 1) + bw + (step - bw) / 2;
        return (
          <g key={k}>
            <Arrow x1={x(k - 1) + bw} y1={mid} x2={x(k)} y2={mid} />
            <rect x={gx - 30} y={22} width={60} height={26} rx={13} fill={tint(ORANGE, '22')} stroke={ORANGE} />
            <T x={gx} y={40} size={12} bold mono>{`i = ${k}`}</T>
            <Arrow x1={gx} y1={48} x2={gx} y2={mid - 3} c={ORANGE} dash w={1.5} head={7} />
          </g>
        );
      })}
    </Fig>
  );
}

// ── while：条件が真の間、繰り返す（break と continue の行き先）──
export function FigWhile() {
  const bh = 64, y = 60, mid = y + bh / 2;
  return (
    <Fig title="while は、条件が真の間、繰り返す（break と continue の行き先）" w={640} h={240} caption="条件が真の間、中身を実行して、条件の確認に戻ります。break は繰り返し全体を終え、continue は今回の残りを飛ばして、次の回（条件の確認）へ進みます。条件を偽にする処理が中に無いと、永遠に終わりません。">
      <Bx x={20} y={y} w={170} h={bh} c={ORANGE} lines={['① 条件を調べる', 'size < 100 ?']} size={12} bold />
      <Bx x={250} y={y} w={170} h={bh} c={GREEN} lines={['② 中身を実行', '{ … }']} size={12} bold />
      <Bx x={470} y={y} w={150} h={bh} c={RED} lines={['繰り返しの外へ', '（次の行へ進む）']} size={12} bold />
      <Arrow x1={190} y1={mid} x2={250} y2={mid} c={GREEN} />
      <T x={220} y={mid - 8} size={11} fill={GREEN} bold>真</T>
      <Arrow x1={420} y1={mid} x2={470} y2={mid} c={RED} dash />
      <T x={445} y={mid - 8} size={11} fill={RED} bold mono>break</T>
      <polyline points={`335,${y} 335,34 105,34`} fill="none" stroke="currentColor" strokeOpacity={0.7} strokeWidth={2} />
      <Arrow x1={105} y1={34} x2={105} y2={y - 1} />
      <T x={220} y={27} size={11} dim>最後まで実行したら ① に戻る</T>
      <polyline points={`300,${y + bh} 300,154 150,154`} fill="none" stroke={PURPLE} strokeWidth={2} strokeDasharray="6 4" />
      <Arrow x1={150} y1={154} x2={150} y2={y + bh + 1} c={PURPLE} dash />
      <T x={225} y={172} size={11} fill={PURPLE} bold>continue：残りを飛ばして ① へ</T>
      <polyline points={`60,${y + bh} 60,208 545,208`} fill="none" stroke={RED} strokeWidth={2} />
      <Arrow x1={545} y1={208} x2={545} y2={y + bh + 1} c={RED} />
      <T x={300} y={227} size={11} fill={RED}>{'偽（条件を満たさなくなった）なら、繰り返しを終える'}</T>
    </Fig>
  );
}

// ── 再帰：下へ呼んで、折り返して、答えが上へ戻る ──
export function FigRecursion() {
  const bh = 42, bw = 200, gy = 62, y0 = 44;
  const y = (k: number) => y0 + k * gy;
  const lx = (k: number) => 10 + k * 46;
  const L: [string, string][] = [
    ['fact(4)', '4 × fact(3) の答えを待つ'],
    ['fact(3)', '3 × fact(2) の答えを待つ'],
    ['fact(2)', '2 × fact(1) の答えを待つ'],
    ['fact(1)', 'n <= 1 なので 1 を返す'],
  ];
  const R = ['fact(4) = 4 × 6 = 24', 'fact(3) = 3 × 2 = 6', 'fact(2) = 2 × 1 = 2', 'fact(1) = 1'];
  return (
    <Fig title="再帰：小さい問題へ下りていき、折り返して答えが戻る" w={640} h={290} caption="fact(4) は fact(3) の答えがないと計算を終えられないので、待ちながら、自分を呼びます。これを、終わりの条件（n <= 1）に着くまで繰り返します。着いたら 1 を返し、その答えが1つずつ上へ戻って、掛け算が完成していきます。">
      <T x={110} y={26} size={13} bold fill={BLUE}>呼ぶ：下へ進む</T>
      <T x={530} y={26} size={13} bold fill={GREEN}>戻る：答えが上へ伝わる</T>
      {L.map(([a, b], k) => (
        <g key={k}>
          <Bx x={lx(k)} y={y(k)} w={bw} h={bh} c={k === 3 ? GREEN : BLUE} lines={[a, b]} size={12} bold />
          <line x1={lx(k) + bw} y1={y(k) + bh / 2} x2={430} y2={y(k) + bh / 2} stroke="currentColor" strokeOpacity={0.3} strokeDasharray="2 4" />
          <Bx x={430} y={y(k)} w={200} h={bh} c={GREEN} lines={[R[k]]} size={12} mono />
          {k < 3 && <Arrow x1={lx(k) + 100} y1={y(k) + bh} x2={lx(k) + 100} y2={y(k + 1)} head={7} />}
          {k < 3 && <Arrow x1={530} y1={y(k + 1)} x2={530} y2={y(k) + bh} c={GREEN} head={7} />}
        </g>
      ))}
    </Fig>
  );
}

// ── map / filter / find：元の配列から、何ができるか ──
export function FigArrayMethods() {
  const src = [3, 12, 7, 20];
  const cx = (i: number) => 190 + i * 70, cw = 56, ch = 36;
  const yIn = 34, yMap = 104, yFil = 174, yFind = 244;
  const first = src.findIndex((n) => n >= 10);
  const cell = (key: string, i: number, y: number, v: string, c: string, dash?: boolean) => <Bx key={key + i} x={cx(i)} y={y} w={cw} h={ch} c={c} lines={[v]} size={14} bold dash={dash} />;
  return (
    <Fig title="map・filter・find：同じ配列から、何が得られるか" w={640} h={300} caption="map は全要素を変換した、同じ長さの配列を作ります。filter は条件に合う要素だけを残します。find は条件に合う最初の1つを見つけた時点で止まり、残りは調べません（×は条件に合わない要素、点線は調べていない要素です）。">
      <T x={10} y={yIn + 24} anchor="start" size={13} bold>元の配列</T>
      {src.map((n, i) => cell('in', i, yIn, String(n), GRAY))}
      <T x={10} y={yMap + 16} anchor="start" size={13} bold>map</T>
      <T x={10} y={yMap + 32} anchor="start" size={11} mono dim>{'n => n * 2'}</T>
      {src.map((n, i) => cell('map', i, yMap, String(n * 2), BLUE))}
      <T x={480} y={yMap + 24} anchor="start" size={13} mono>{`→ [${src.map((n) => n * 2).join(', ')}]`}</T>
      <T x={10} y={yFil + 16} anchor="start" size={13} bold>filter</T>
      <T x={10} y={yFil + 32} anchor="start" size={11} mono dim>{'n => n >= 10'}</T>
      {src.map((n, i) => (n >= 10 ? cell('fil', i, yFil, String(n), GREEN) : cell('fil', i, yFil, '×', RED, true)))}
      <T x={480} y={yFil + 24} anchor="start" size={13} mono>{`→ [${src.filter((n) => n >= 10).join(', ')}]`}</T>
      <T x={10} y={yFind + 16} anchor="start" size={13} bold>find</T>
      <T x={10} y={yFind + 32} anchor="start" size={11} mono dim>{'n => n >= 10'}</T>
      {src.map((n, i) => (i < first ? cell('find', i, yFind, '×', RED, true) : i === first ? cell('find', i, yFind, String(n), GREEN) : cell('find', i, yFind, '—', GRAY, true)))}
      <T x={480} y={yFind + 24} anchor="start" size={13} mono>{`→ ${src[first]}`}</T>
      <T x={480} y={yFind + 42} anchor="start" size={11} dim>最初の1つで止まる</T>
    </Fig>
  );
}

// ── reduce：acc に結果を溜めていく ──
export function FigReduce() {
  const bh = 46, gy = 84, y0 = 44;
  const rows: [number, number, number][] = [[0, 1, 1], [1, 2, 3], [3, 3, 6]];
  const y = (k: number) => y0 + k * gy;
  return (
    <Fig title="reduce：return した値が、次の回の acc になる" w={640} h={334} caption="コールバックは、ここまでの結果（acc）と、いまの要素（n）を受け取ります。return した値が、次の回の acc になり、最後の回の結果が reduce 全体の結果です。最初の acc は、2つ目の引数（初期値）の 0 です。">
      <T x={70} y={24} size={11} dim>ここまでの結果</T>
      <T x={205} y={24} size={11} dim>いまの要素</T>
      <T x={365} y={24} size={11} dim>コールバックの処理</T>
      <T x={545} y={24} size={11} dim>return した値</T>
      {rows.map(([a, n, r], k) => (
        <g key={k}>
          <rect x={2} y={y(k) - 8} width={256} height={bh + 16} rx={10} fill="none" stroke={GRAY} strokeDasharray="4 4" />
          <Bx x={10} y={y(k)} w={120} h={bh} c={k === 0 ? GRAY : BLUE} lines={[k === 0 ? 'acc（初期値）' : 'acc', String(a)]} size={12} bold />
          <Bx x={160} y={y(k)} w={90} h={bh} c={ORANGE} lines={['n', String(n)]} size={12} bold />
          <Arrow x1={258} y1={y(k) + bh / 2} x2={290} y2={y(k) + bh / 2} />
          <Bx x={290} y={y(k)} w={150} h={bh} c={PURPLE} lines={['return acc + n', `= ${a} + ${n}`]} size={12} bold />
          <Arrow x1={440} y1={y(k) + bh / 2} x2={480} y2={y(k) + bh / 2} />
          <Bx x={480} y={y(k)} w={130} h={bh} c={GREEN} lines={['次の acc', String(r)]} size={12} bold />
          {k < 2 && (
            <g>
              <polyline points={`545,${y(k) + bh} 545,${y(k) + bh + 19} 70,${y(k) + bh + 19}`} fill="none" stroke="currentColor" strokeOpacity={0.7} strokeWidth={2} />
              <Arrow x1={70} y1={y(k) + bh + 19} x2={70} y2={y(k + 1) - 9} />
              <T x={385} y={y(k) + bh + 15} size={11} dim>次の回の acc になる</T>
            </g>
          )}
        </g>
      ))}
      <Arrow x1={545} y1={y(2) + bh} x2={545} y2={y(2) + bh + 28} c={GREEN} />
      <Bx x={445} y={y(2) + bh + 30} w={190} h={34} c={GREEN} lines={['reduce の結果：6']} size={13} bold />
    </Fig>
  );
}

// ── リトライ：失敗したら、待ってやり直す ──
export function FigRetry() {
  const bh = 60, y1 = 50, y2 = 170;
  return (
    <Fig title="失敗したら、待ってやり直す（リトライのループ）" w={640} h={250} caption="回数が残っている間、処理を試します。成功したら break で抜けます。失敗（throw）したら catch で受け止め、少し待って、次の回に進みます。回数を使い切ったら、ループは終わります。">
      <T x={10} y={34} anchor="start" size={11} fill={RED}>{'i < 5 が偽（回数切れ）になったら、ループを終える'}</T>
      <Bx x={10} y={y1} w={160} h={bh} c={ORANGE} lines={['① 回数が残っているか', 'i < 5 ?']} size={12} bold />
      <Bx x={230} y={y1} w={170} h={bh} c={BLUE} lines={['② try：処理を実行', 'await unstable()']} size={12} bold />
      <Bx x={460} y={y1} w={170} h={bh} c={GREEN} lines={['③ 成功したら', 'break でループを抜ける']} size={12} bold />
      <Bx x={230} y={y2} w={170} h={bh} c={RED} lines={['④ catch：失敗を受け止める', 'メッセージを表示']} size={12} bold />
      <Bx x={10} y={y2} w={160} h={bh} c={PURPLE} lines={['⑤ await sleep(50)', '少し待つ']} size={12} bold />
      <Arrow x1={170} y1={y1 + bh / 2} x2={230} y2={y1 + bh / 2} c={GREEN} />
      <T x={200} y={y1 + bh / 2 - 8} size={11} fill={GREEN} bold>真</T>
      <Arrow x1={400} y1={y1 + bh / 2} x2={460} y2={y1 + bh / 2} c={GREEN} />
      <T x={430} y={y1 + bh / 2 - 8} size={11} fill={GREEN} bold>成功</T>
      <Arrow x1={315} y1={y1 + bh} x2={315} y2={y2} c={RED} />
      <T x={325} y={140} anchor="start" size={11} fill={RED} bold>throw（失敗）</T>
      <Arrow x1={230} y1={y2 + bh / 2} x2={170} y2={y2 + bh / 2} />
      <Arrow x1={90} y1={y2} x2={90} y2={y1 + bh} />
      <T x={100} y={140} anchor="start" size={11} dim>次の回へ（i++）</T>
    </Fig>
  );
}

// ── 直列と並列：かかる時間の違い ──
export function FigSerialParallel() {
  const x0 = 154, k = 0.8, w300 = 300 * k, bh = 26;
  const bar = (x: number, y: number, w: number, label: string, c: string) => <Bx x={x} y={y} w={w} h={bh} c={c} lines={[label]} size={12} bold />;
  return (
    <Fig title="直列と並列：待ち時間の合計が変わる" w={680} h={262} caption="await を順に書くと、Aが終わってからBが始まるので、時間は足し算になります。Promise.all でまとめると、AとBが同時に進み、長い方の時間で終わります。ただし、Bの処理がAの結果を使うなら、直列にするしかありません。">
      <T x={10} y={62} anchor="start" size={14} bold>直列</T>
      <T x={10} y={80} anchor="start" size={11} mono dim>await A; await B</T>
      {bar(x0, 40, w300, 'A 300ms', BLUE)}
      {bar(x0 + w300, 74, w300, 'B 300ms', ORANGE)}
      <line x1={x0 + 2 * w300} y1={30} x2={x0 + 2 * w300} y2={124} stroke={RED} strokeDasharray="5 4" />
      <T x={x0 + 2 * w300 - 8} y={122} anchor="end" size={12} bold fill={RED}>直列：600ms で完了</T>
      <T x={10} y={162} anchor="start" size={14} bold>並列</T>
      <T x={10} y={180} anchor="start" size={11} mono dim>Promise.all([A, B])</T>
      {bar(x0, 140, w300, 'A 300ms', BLUE)}
      {bar(x0, 174, w300, 'B 300ms', ORANGE)}
      <line x1={x0 + w300} y1={134} x2={x0 + w300} y2={222} stroke={GREEN} strokeDasharray="5 4" />
      <T x={x0 + w300 + 8} y={214} anchor="start" size={12} bold fill={GREEN}>並列：300ms で完了</T>
      <line x1={x0} y1={222} x2={x0 + 2 * w300} y2={222} stroke="currentColor" strokeOpacity={0.4} />
      {[0, 300, 600].map((t) => <T key={t} x={x0 + t * k} y={242} size={11} dim>{t === 0 ? '0' : `${t}ms`}</T>)}
    </Fig>
  );
}

// ── 実行される順番：同期 → Promise の続き → タイマー ──
export function FigEventOrder() {
  const bw = 170, bh = 128, y = 30;
  const col = [10, 230, 450];
  const items: { t: string; c: string; lines: string[]; note: string; out: string }[] = [
    { t: '① 同期のコード', c: BLUE, lines: ['console.log("1: 同期")', 'console.log("2: 同期")'], note: '上から順に、最後まで', out: '表示：1、2' },
    { t: '② Promise の続き', c: GREEN, lines: ['.then(…) の中身', 'await の次の行'], note: '①が全部終わってから', out: '表示：3' },
    { t: '③ タイマー', c: ORANGE, lines: ['setTimeout(…, 0)', 'setInterval(…)'], note: '②も終わってから', out: '表示：4' },
  ];
  return (
    <Fig title="実行される順番：同期 → Promise の続き → タイマー" w={640} h={210} caption="待ち時間のある処理は、いま動いているコードが終わるまで始まりません。setTimeout の待ち時間が 0 でも、同期のコードと、Promise の続き（then、await のあと）が先に済んでから、実行されます。">
      {items.map((it, i) => (
        <g key={i}>
          <rect x={col[i]} y={y} width={bw} height={bh} rx={10} fill={tint(it.c, '1c')} stroke={it.c} strokeWidth={1.5} />
          <T x={col[i] + bw / 2} y={y + 26} size={14} bold fill={it.c}>{it.t}</T>
          {it.lines.map((l, j) => <T key={j} x={col[i] + bw / 2} y={y + 56 + j * 20} size={11} mono>{l}</T>)}
          <T x={col[i] + bw / 2} y={y + 108} size={11} dim>{it.note}</T>
          <T x={col[i] + bw / 2} y={y + bh + 26} size={13} bold fill={it.c}>{it.out}</T>
          {i < 2 && <Arrow x1={col[i] + bw} y1={y + bh / 2} x2={col[i + 1]} y2={y + bh / 2} />}
        </g>
      ))}
    </Fig>
  );
}

// ════════════════════════════════════════════════════════════
// 第6章（NEM）の図解
// ════════════════════════════════════════════════════════════

// ── 6.2 NEMとSymbolの関係 ──
export function FigNemRelation() {
  const rows: [string, string, string][] = [['ブロックチェーン', 'NEM', 'Symbol'], ['通貨', 'XEM', 'XYM'], ['ノードのソフト', 'NIS', 'Symbolのノード']];
  return (
    <Fig title="NEMとSymbolの関係" w={640} h={310} caption="Symbolは、NEMを書き換えたものではなく、別のネットワークです。台帳もアドレスも別で、XEMとXYMは別の通貨です。ただし、Symbolの開始にあたって、事前に申請したXEMの保有者には、同じ量のXYMが配られました。">
      <Bx x={20} y={14} w={270} h={104} c={BLUE} lines={['NEM（NEM1）', '2015年3月に開始', '総量 8,999,999,999 XEM を最初に全部発行', 'PoI ／ ブロックの間隔 約60秒']} size={12} bold />
      <Bx x={350} y={14} w={270} h={104} c={GREEN} lines={['Symbol', '2021年3月にメインネット開始', 'NEMの後継（別のネットワーク）', 'PoS+ ／ ブロックの間隔 約30秒']} size={12} bold />
      <Arrow x1={292} y1={66} x2={348} y2={66} c={ORANGE} dash />
      <T x={320} y={54} size={11} fill={ORANGE}>後継</T>
      <T x={320} y={142} size={12} fill={ORANGE}>事前に申請したXEMの保有者に、同じ量のXYMを配布</T>
      <line x1={20} y1={158} x2={620} y2={158} stroke="currentColor" strokeOpacity={0.2} />
      <T x={320} y={178} size={12} bold>3つの言葉は、別々で、それぞれ対応します</T>
      {rows.map(([k, a, b], i) => (
        <g key={i}>
          <Bx x={20} y={192 + i * 38} w={230} h={30} c={BLUE} lines={[a]} size={13} bold />
          <T x={320} y={212 + i * 38} size={12} dim>{k}</T>
          <Bx x={390} y={192 + i * 38} w={230} h={30} c={GREEN} lines={[b]} size={13} bold />
        </g>
      ))}
    </Fig>
  );
}

// ── 6.3 手数料の違い：送金額に応じた手数料（NEMの送金額の部分）──
export function FigNemFee() {
  const x0 = 70, y0 = 232, cw = 520, ch = 164, amax = 300000, fmax = 1.25;
  const X = (a: number) => x0 + (a / amax) * cw;
  const Y = (f: number) => y0 - (f / fmax) * ch;
  const pts: string[] = [];
  for (let k = 0; k < 30; k++) {
    const f = Math.min(Math.max(k * 0.05, 0.05), 1.25);
    pts.push(`${X(k * 10000)},${Y(f)}`, `${X((k + 1) * 10000)},${Y(f)}`);
  }
  const xt = [0, 100000, 200000, 300000];
  const yt = [0, 0.5, 1.0, 1.25];
  return (
    <Fig title="手数料と送金額（送金額の部分のみ）" w={640} h={300} caption="NEMの手数料のうち、送金額の部分は、1万 XEM ごとに 0.05 XEM ずつ増えます（最低 0.05、最高 1.25 XEM）。メッセージを付けたときは、その分が別に足されます。Symbolの手数料は「サイズ × 倍率」なので、送る金額が大きくても変わりません（点線の高さはイメージです）。">
      <T x={x0} y={22} anchor="start" size={13} bold>手数料（XEM）</T>
      <line x1={x0} y1={y0} x2={x0 + cw} y2={y0} stroke="currentColor" strokeOpacity={0.5} />
      <line x1={x0} y1={Y(fmax)} x2={x0} y2={y0} stroke="currentColor" strokeOpacity={0.5} />
      {yt.map((f) => (
        <g key={f}>
          <line x1={x0 - 4} y1={Y(f)} x2={x0} y2={Y(f)} stroke="currentColor" strokeOpacity={0.5} />
          <T x={x0 - 8} y={Y(f) + 4} anchor="end" size={11} dim>{f}</T>
        </g>
      ))}
      {xt.map((a) => (
        <g key={a}>
          <line x1={X(a)} y1={y0} x2={X(a)} y2={y0 + 4} stroke="currentColor" strokeOpacity={0.5} />
          <T x={X(a)} y={y0 + 18} size={11} dim>{a.toLocaleString('en-US')}</T>
        </g>
      ))}
      <T x={x0 + cw / 2} y={y0 + 38} size={12}>送金額（XEM）</T>
      <line x1={x0} y1={Y(1.25)} x2={x0 + cw} y2={Y(1.25)} stroke={RED} strokeOpacity={0.5} strokeDasharray="4 4" />
      <T x={X(40000)} y={Y(1.25) - 6} anchor="start" size={11} fill={RED}>上限 1.25 XEM（25万 XEM から）</T>
      <polyline points={pts.join(' ')} fill="none" stroke={BLUE} strokeWidth={2.5} />
      <T x={x0 + 16} y={Y(0.9)} anchor="start" size={12} bold fill={BLUE}>NEM：送金額に応じて増える</T>
      <line x1={x0} y1={Y(0.05)} x2={x0 + cw} y2={Y(0.05)} stroke={GREEN} strokeWidth={2} strokeDasharray="7 5" />
      <T x={X(205000)} y={Y(0.05) - 22} size={12} bold fill={GREEN}>Symbol：送金額によらず一定</T>
    </Fig>
  );
}

// ── 6.4 重要度（PoI）の材料 ──
export function FigNemImportance() {
  const items: [string, string, string, string][] = [
    ['ベスト済みの保有量', '未ベスト分は数えない', BLUE, ''],
    ['XEMのやり取り', '直近約30日、1,000 XEM以上の送金', ORANGE, ''],
    ['取引のつながり方', 'NCDawareRank（PageRankに近い）', PURPLE, ''],
  ];
  return (
    <Fig title="重要度（PoI）は、何から決まるか" w={640} h={262} caption="保有量だけでなく、実際に使っているかも見るのが、PoIの特徴です。同じ金額を輪になって回しても、差し引きでゼロになるので、重要度は上がりません。">
      {items.map(([a, b, c], i) => (
        <g key={i}>
          <Bx x={14} y={14 + i * 62} w={260} h={50} c={c} lines={[a, b]} size={12} bold />
          <Arrow x1={274} y1={39 + i * 62} x2={338} y2={100} c={c} />
        </g>
      ))}
      <Bx x={340} y={62} w={130} h={80} c={GREEN} lines={['重要度', '（importance）']} size={13} bold />
      <Arrow x1={470} y1={102} x2={498} y2={102} c={GREEN} />
      <Bx x={500} y={62} w={126} h={80} c={GREEN} lines={['次のブロックを', '作る人に', '選ばれやすい']} size={12} bold />
      <Bx x={14} y={206} w={612} h={44} c={RED} lines={['ハーベストできる（重要度の計算の対象になる）のは、ベスト済みが', '10,000 XEM以上のアカウントだけ']} size={12} />
    </Fig>
  );
}

// ── 6.4 ベスティング：ベスト済み残高の増え方 ──
export function FigNemVesting() {
  const vals = [2000, 3800, 5420, 6878, 8190, 9371, 10434, 11391, 12252, 13026];
  const x0 = 80, y0 = 236, ch = 176, vmax = 14000, bw = 36, step = 50;
  const Y = (v: number) => y0 - (v / vmax) * ch;
  return (
    <Fig title="ベスト済みの残高は、日ごとに増えていく" w={640} h={300} caption="20,000 XEM を受け取ったアカウントの例です。1日ごとに、未ベスト分の10分の1がベスト済みに移ります。ベスト済みが10,000 XEMを超えるのは7日目で、そこからハーベストの対象になります。増え方は、残りの未ベストが減るので、少しずつ鈍くなります（端数や途中の送金は無視した簡単な計算です）。">
      <T x={x0} y={20} anchor="start" size={13} bold>ベスト済みの残高（XEM）</T>
      <line x1={x0} y1={y0} x2={x0 + 10 * step} y2={y0} stroke="currentColor" strokeOpacity={0.5} />
      {[0, 5000, 10000].map((v) => (
        <g key={v}>
          <line x1={x0 - 4} y1={Y(v)} x2={x0} y2={Y(v)} stroke="currentColor" strokeOpacity={0.5} />
          <T x={x0 - 8} y={Y(v) + 4} anchor="end" size={11} dim>{v.toLocaleString('en-US')}</T>
        </g>
      ))}
      {vals.map((v, i) => {
        const ok = v >= 10000;
        const c = ok ? GREEN : ORANGE;
        return (
          <g key={i}>
            <rect x={x0 + 7 + i * step} y={Y(v)} width={bw} height={y0 - Y(v)} rx={3} fill={tint(c, '55')} stroke={c} strokeWidth={1.5} />
            <T x={x0 + 7 + i * step + bw / 2} y={v < 10000 && v >= 9000 ? Y(v) + 14 : Y(v) - 5} size={10} bold fill={c}>{v.toLocaleString('en-US')}</T>
            <T x={x0 + 7 + i * step + bw / 2} y={y0 + 16} size={11} dim>{i + 1}</T>
          </g>
        );
      })}
      <T x={x0 + 5 * step} y={y0 + 36} size={12}>日数（XEMを受け取ってから）</T>
      <line x1={x0} y1={Y(10000)} x2={x0 + 10 * step} y2={Y(10000)} stroke={RED} strokeWidth={1.5} strokeDasharray="6 4" />
      <T x={x0 + 8} y={Y(10000) - 8} anchor="start" size={11} fill={RED}>10,000 XEM（ハーベストできる最低ライン）</T>
    </Fig>
  );
}

// ── 6.4 代理ハーベスト ──
export function FigNemDelegate() {
  return (
    <Fig title="代理ハーベスト（デリゲートハーベスティング）" w={640} h={270} caption="大きな残高を持つアカウントの秘密鍵を、サーバーに置かずに済みます。ハーベストに使われるのは、貸した側（オーナー）の重要度です。有効になるまでには、360ブロック（約6時間）かかります。">
      <Bx x={14} y={30} w={226} h={96} c={BLUE} lines={['オーナーのアカウント', '大きな残高を持つ', '秘密鍵は、手元に置く']} size={12} bold />
      <rect x={374} y={10} width={252} height={148} rx={10} fill="none" stroke={GRAY} strokeWidth={1.5} strokeDasharray="6 4" />
      <T x={386} y={28} anchor="start" size={11} dim>ノード（サーバー）</T>
      <Bx x={388} y={40} w={224} h={96} c={PURPLE} lines={['代理のアカウント', 'ハーベストを行う', '秘密鍵は、サーバーに置く']} size={12} bold />
      <Arrow x1={242} y1={82} x2={386} y2={82} c={ORANGE} />
      <T x={314} y={62} size={11} fill={ORANGE}>重要度転送</T>
      <T x={314} y={76} size={11} fill={ORANGE}>トランザクション</T>
      <T x={314} y={102} size={11} dim>360ブロック</T>
      <T x={314} y={116} size={11} dim>（約6時間）</T>
      <Arrow x1={500} y1={160} x2={500} y2={188} c={PURPLE} />
      <Arrow x1={127} y1={128} x2={127} y2={188} c={BLUE} dash />
      <T x={137} y={166} anchor="start" size={11} fill={BLUE}>重要度を貸す</T>
      <Bx x={14} y={190} w={612} h={64} c={GREEN} lines={['ブロックを作る（ハーベスト）', 'そのとき使われる重要度は、貸した側（オーナー）のアカウントのもの']} size={12} bold />
    </Fig>
  );
}

// ── 6.5 アドレスの作り方：NEMとSymbolの比較 ──
export function FigNemAddress() {
  const rows: { label: string; nem: [string, string]; sym: [string, string]; diff: boolean }[] = [
    { label: '① ハッシュにする', nem: ['Keccak-256', '→ 32バイト'], sym: ['SHA3-256', '→ 32バイト'], diff: true },
    { label: '② 短くする', nem: ['RIPEMD-160', '→ 20バイト'], sym: ['RIPEMD-160', '→ 20バイト'], diff: false },
    { label: '③ 識別子を付ける', nem: ['先頭に0x68／0x98', '→ 21バイト'], sym: ['先頭に0x68／0x98', '→ 21バイト'], diff: false },
    { label: '④ チェックサムを付ける', nem: ['末尾に4バイト', '→ 25バイト'], sym: ['末尾に3バイト', '→ 24バイト'], diff: true },
    { label: '⑤ Base32で書く', nem: ['40文字', 'N始まり／T始まり'], sym: ['39文字', 'N始まり／T始まり'], diff: true },
  ];
  const y0 = 46, st = 56, bh = 40;
  return (
    <Fig title="アドレスの作り方：NEMとSymbol" w={640} h={350} caption="どちらも、32バイトの公開鍵から始めます。手順は同じで、違うのは、①のハッシュ関数と、④のチェックサムの長さです。チェックサムが1バイト違うので、Base32にしたときの文字数も、40文字と39文字で違います。">
      <Bx x={200} y={8} w={200} h={28} c={BLUE} lines={['NEM']} size={14} bold />
      <Bx x={420} y={8} w={200} h={28} c={GREEN} lines={['Symbol']} size={14} bold />
      {rows.map((r, i) => {
        const y = y0 + i * st;
        const c = r.diff ? ORANGE : GRAY;
        return (
          <g key={i}>
            <T x={20} y={y + bh / 2 + 5} anchor="start" size={12} bold={r.diff}>{r.label}</T>
            <Bx x={200} y={y} w={200} h={bh} c={c} lines={[r.nem[0], r.nem[1]]} size={12} bold />
            <Bx x={420} y={y} w={200} h={bh} c={c} lines={[r.sym[0], r.sym[1]]} size={12} bold />
            {i < rows.length - 1 && <Arrow x1={300} y1={y + bh} x2={300} y2={y + st} head={7} />}
            {i < rows.length - 1 && <Arrow x1={520} y1={y + bh} x2={520} y2={y + st} head={7} />}
          </g>
        );
      })}
      <rect x={20} y={y0 + 5 * st + 6} width={14} height={14} rx={3} fill={tint(ORANGE)} stroke={ORANGE} />
      <T x={42} y={y0 + 5 * st + 18} anchor="start" size={12}>オレンジ ＝ NEMとSymbolで違うところ</T>
    </Fig>
  );
}

// ── 6.6 モザイクの識別：NEMとSymbolの比較 ──
export function FigNemMosaic() {
  return (
    <Fig title="モザイクの識別：NEMとSymbol" w={640} h={260} caption="NEMでは、モザイクの名前が、そのまま識別子です。そのため、ネームスペースを持つ人だけが、その中にモザイクを作れます。Symbolでは、識別に使うのは64ビットのIDで、名前（ネームスペース）は、あとから別名（エイリアス）として結びつけます。">
      <line x1={320} y1={10} x2={320} y2={250} stroke="currentColor" strokeOpacity={0.2} />
      <T x={165} y={24} size={15} bold fill={BLUE}>NEM</T>
      <Bx x={95} y={40} w={140} h={46} c={BLUE} lines={['ネームスペース', 'nem']} size={12} bold />
      <Arrow x1={165} y1={88} x2={165} y2={122} c={BLUE} />
      <T x={177} y={110} anchor="start" size={11} dim>この中に定義する</T>
      <Bx x={95} y={124} w={140} h={46} c={BLUE} lines={['モザイク', 'xem']} size={12} bold />
      <Arrow x1={165} y1={172} x2={165} y2={194} c={GREEN} />
      <Bx x={40} y={196} w={250} h={44} c={GREEN} lines={['識別子：nem:xem', '（名前そのものが識別子）']} size={12} bold />
      <T x={475} y={24} size={15} bold fill={GREEN}>Symbol</T>
      <Bx x={380} y={40} w={190} h={46} c={GREEN} lines={['モザイク', 'ID（64ビットの数値）']} size={12} bold />
      <Arrow x1={475} y1={122} x2={475} y2={88} c={ORANGE} dash />
      <T x={487} y={110} anchor="start" size={11} fill={ORANGE}>エイリアス（別名）で結ぶ</T>
      <Bx x={380} y={124} w={190} h={46} c={PURPLE} lines={['ネームスペース', '（名前）']} size={12} bold />
      <Bx x={350} y={196} w={250} h={44} c={GREEN} lines={['識別に使うのは、ID', '（名前は、あとから付ける）']} size={12} bold />
    </Fig>
  );
}

// ── 6.7 NEMのマルチシグの流れ ──
export function FigNemMultisig() {
  const lx = [110, 320, 540];
  return (
    <Fig title="NEMのマルチシグ：送金の流れ" w={640} h={330} caption="NEMでは、起案者の包んだトランザクションと、連署のトランザクションが、別々のトランザクションとして届きます。Symbolでは、1つのアグリゲートトランザクションに、署名を集めます（5.11）。">
      <Bx x={lx[0] - 80} y={8} w={160} h={40} c={BLUE} lines={['起案者', '（連署者の1人）']} size={12} bold />
      <Bx x={lx[1] - 80} y={8} w={160} h={40} c={PURPLE} lines={['ほかの連署者']} size={12} bold />
      <Bx x={lx[2] - 80} y={8} w={160} h={40} c={GRAY} lines={['NIS（ノード）']} size={12} bold />
      {lx.map((x, i) => <line key={i} x1={x} y1={50} x2={x} y2={182} stroke="currentColor" strokeOpacity={0.3} strokeDasharray="4 4" />)}
      <T x={325} y={80} size={12} bold fill={BLUE}>① マルチシグトランザクション</T>
      <T x={325} y={96} size={11} dim>送金（署名者はマルチシグアカウント）を包んで、署名する</T>
      <Arrow x1={lx[0]} y1={106} x2={lx[2]} y2={106} c={BLUE} />
      <T x={430} y={146} size={12} bold fill={PURPLE}>② マルチシグ署名トランザクション</T>
      <T x={430} y={162} size={11} dim>①のハッシュに、連署する</T>
      <Arrow x1={lx[1]} y1={172} x2={lx[2]} y2={172} c={PURPLE} />
      <Bx x={330} y={188} w={290} h={40} c={GREEN} lines={['③ 必要な署名がそろえば、成立', '期限までにそろわなければ、却下']} size={12} bold />
      <Bx x={20} y={190} w={290} h={36} c={ORANGE} lines={['台帳には、①と②が、別々に載る']} size={12} bold />
      <Bx x={20} y={252} w={600} h={62} c={GREEN} lines={['Symbol：アグリゲートトランザクション', '1つのトランザクションに、署名を集める（入れ子もできる）']} size={12} bold dash />
    </Fig>
  );
}

// ── 6.8 SymbolがNEMから引き継いだもの・変えたもの ──
export function FigNemEvolution() {
  const keep = ['楕円曲線Ed25519の鍵と署名', '組み込み機能を組み合わせる設計', 'アドレスの作り方の骨格', '識別子の値（0x68、0x98）', 'ハーベストで手数料が入ること'];
  const change = ['Keccak → SHA3（署名の内部もSHA-512へ）', 'チェックサム 4 → 3バイト（40 → 39文字）', 'ブロックの間隔 約60秒 → 約30秒', '合意形成 PoI → PoS+', '確定 ファイナリティなし → 投票ノードで確定', '連署が別トランザクション → アグリゲート', 'モザイク 名前 → 64ビットのID', 'API NIS独自 → REST API'];
  return (
    <Fig title="SymbolがNEMから引き継いだもの、変えたもの" w={640} h={350} caption="アドレスの骨格や、鍵と署名の方式は、引き継がれました。一方で、ハッシュ関数・合意形成・確定の仕組み・複数人の承認の方式などは、作り直されています。">
      <rect x={10} y={8} width={270} height={330} rx={10} fill="none" stroke={GREEN} strokeWidth={1.5} />
      <Bx x={22} y={18} w={246} h={32} c={GREEN} lines={['引き継いだもの']} size={14} bold />
      {keep.map((s, i) => <Bx key={i} x={22} y={60 + i * 38} w={246} h={32} c={GREEN} lines={[s]} size={12} filled={false} />)}
      <rect x={296} y={8} width={334} height={330} rx={10} fill="none" stroke={ORANGE} strokeWidth={1.5} />
      <Bx x={308} y={18} w={310} h={32} c={ORANGE} lines={['変えたもの（NEM → Symbol）']} size={14} bold />
      {change.map((s, i) => <Bx key={i} x={308} y={60 + i * 34} w={310} h={28} c={ORANGE} lines={[s]} size={11} filled={false} />)}
    </Fig>
  );
}

// ════════════════════════════════════════════════════════════
// JavaScript入門（追加）：条件・スコープ・配列の番号・探索と並べ替え
// ════════════════════════════════════════════════════════════
// 配列の1マス（番号つき）
const ArrCell = ({ x, y, w = 56, h = 40, label, c = BLUE, on = true, idx, dim }: { x: number; y: number; w?: number; h?: number; label: string; c?: string; on?: boolean; idx?: string; dim?: boolean }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx={5} fill={on ? tint(c, '44') : 'rgba(255,255,255,0.07)'} stroke={on ? c : GRAY} strokeWidth={1.5} strokeDasharray={dim ? '4 3' : undefined} />
    <T x={x + w / 2} y={y + h / 2 + 5} size={14} bold mono dim={!on}>{label}</T>
    {idx !== undefined && <T x={x + w / 2} y={y + h + 16} size={11} dim mono>{idx}</T>}
  </g>
);

// スコープ：内側から外側は見える
export function FigScope() {
  return (
    <Fig title="スコープ：内側から外側は見えるが、外側から内側は見えない" w={680} h={270} caption="変数は、宣言した { } の内側（とその中の { }）で使えます。内側のブロックから外側の変数は読めますが、外側から内側の変数は読めません（ReferenceError になります）。">
      <rect x={10} y={10} width={660} height={250} rx={10} fill={tint(BLUE, '18')} stroke={BLUE} strokeWidth={1.5} />
      <T x={24} y={34} anchor="start" size={13} bold fill={BLUE}>外側（プログラム全体）</T>
      <T x={24} y={58} anchor="start" size={12} mono>const rate = 0.1;</T>
      <rect x={40} y={76} width={420} height={170} rx={10} fill={tint(ORANGE, '18')} stroke={ORANGE} strokeWidth={1.5} />
      <T x={54} y={100} anchor="start" size={13} bold fill={ORANGE}>関数の中 ( withTax )</T>
      <T x={54} y={124} anchor="start" size={12} mono>{'const withTax = (price) => {'}</T>
      <rect x={70} y={140} width={260} height={90} rx={8} fill={tint(GREEN, '22')} stroke={GREEN} strokeWidth={1.5} />
      <T x={84} y={162} anchor="start" size={13} bold fill={GREEN}>ブロックの中</T>
      <T x={84} y={186} anchor="start" size={12} mono>let tax = price * rate;</T>
      <T x={84} y={208} anchor="start" size={11} dim>price（関数の引数）と rate（外側）が見える</T>
      <Bx x={490} y={90} w={170} h={64} c={GREEN} lines={['✔ 内側から外側は', '読める（rate, price）']} size={12} bold />
      <Bx x={490} y={170} w={170} h={64} c={RED} lines={['✘ 外側から内側は', '読めない（tax）']} size={12} bold />
    </Fig>
  );
}

// 配列の番号と slice
export function FigArrayIndex() {
  const items = ['りんご', 'みかん', 'ぶどう', 'もも'];
  const x0 = 110, step = 120, w = 100;
  return (
    <Fig title="配列の番号：先頭は 0、後ろからは -1" w={680} h={220} caption="番号は 0 から数えます。at(-1) は最後の要素です。slice(1, 3) は「1番から、3番の手前まで」なので、1番と2番の2つを取り出します（終わりの番号は含まれません）。">
      {items.map((s, i) => (
        <g key={i}>
          <ArrCell x={x0 + i * step} y={70} w={w} h={44} label={s} c={i === 1 || i === 2 ? ORANGE : BLUE} />
          <T x={x0 + i * step + w / 2} y={60} size={12} fill={BLUE} mono bold>{String(i)}</T>
          <T x={x0 + i * step + w / 2} y={146} size={12} fill={PURPLE} mono>{String(i - items.length)}</T>
        </g>
      ))}
      <T x={10} y={60} anchor="start" size={11} fill={BLUE}>前から</T>
      <T x={10} y={146} anchor="start" size={11} fill={PURPLE}>後ろから</T>
      <path d={`M ${x0 + step} 160 v 8 h ${2 * step - 20} v -8`} fill="none" stroke={ORANGE} strokeWidth={2} />
      <T x={x0 + step + (2 * step - 20) / 2} y={190} size={12} fill={ORANGE} bold>slice(1, 3) ＝ ["みかん", "ぶどう"]</T>
    </Fig>
  );
}

// if / else if / else の流れ
export function FigIf() {
  return (
    <Fig title="if / else if / else は、上から順に条件を調べる" w={680} h={230} caption="上の条件から順に調べ、最初に「真」になったところだけを実行して、残りは調べません。どれにも当てはまらないときだけ、else が実行されます。">
      <Bx x={10} y={20} w={170} h={56} c={ORANGE} lines={['score >= 80 ?']} size={13} bold mono />
      <Bx x={260} y={20} w={170} h={56} c={ORANGE} lines={['score >= 60 ?']} size={13} bold mono />
      <Bx x={510} y={20} w={160} h={56} c={RED} lines={['else（どれでもない）']} size={12} bold />
      <Arrow x1={180} y1={48} x2={260} y2={48} c={RED} />
      <T x={220} y={40} size={11} fill={RED}>偽</T>
      <Arrow x1={430} y1={48} x2={510} y2={48} c={RED} />
      <T x={470} y={40} size={11} fill={RED}>偽</T>
      <Arrow x1={95} y1={76} x2={95} y2={140} c={GREEN} />
      <Arrow x1={345} y1={76} x2={345} y2={140} c={GREEN} />
      <Arrow x1={590} y1={76} x2={590} y2={140} c={GRAY} />
      <T x={105} y={112} anchor="start" size={11} fill={GREEN}>真</T>
      <T x={355} y={112} anchor="start" size={11} fill={GREEN}>真</T>
      <Bx x={30} y={142} w={130} h={44} c={GREEN} lines={['「優」を表示']} size={12} bold />
      <Bx x={280} y={142} w={130} h={44} c={GREEN} lines={['「良」を表示']} size={12} bold />
      <Bx x={520} y={142} w={140} h={44} c={GRAY} lines={['「要努力」を表示']} size={12} bold />
      <T x={340} y={214} size={12} dim>score = 72 のとき：80 以上ではない → 60 以上なので「良」</T>
    </Fig>
  );
}

// 二分探索：範囲を半分ずつ狭める
export function FigBinarySearch() {
  const vals = [3, 8, 15, 22, 37, 41, 56];
  const x0 = 120, w = 66, step = 76;
  const rows: { lo: number; hi: number; mid: number; note: string }[] = [
    { lo: 0, hi: 6, mid: 3, note: '22 < 37 → 右半分へ（lo = mid + 1）' },
    { lo: 4, hi: 6, mid: 5, note: '41 > 37 → 左半分へ（hi = mid - 1）' },
    { lo: 4, hi: 4, mid: 4, note: '37 ＝ 37 → 見つかった！' },
  ];
  return (
    <Fig title="二分探索：中央を調べて、範囲を半分ずつ狭める" w={680} h={310} caption="並び替え済みの配列から 37 を探す動き。中央の値と比べて、探す範囲（青）を半分に絞ります。7個でも3回で見つかり、要素が2倍になっても、増える回数は1回だけです（入門4の「対数」の考え方）。">
      {rows.map((r, ri) => (
        <g key={ri}>
          <T x={10} y={52 + ri * 90} anchor="start" size={12} bold>{ri + 1}回目</T>
          <T x={10} y={70 + ri * 90} anchor="start" size={10} mono dim>{`lo=${r.lo} hi=${r.hi}`}</T>
          {vals.map((v, i) => {
            const inr = i >= r.lo && i <= r.hi;
            return <ArrCell key={i} x={x0 + i * step} y={34 + ri * 90} w={w} h={36} label={String(v)} c={i === r.mid ? ORANGE : BLUE} on={inr} />;
          })}
          <T x={x0 + r.mid * step + w / 2} y={86 + ri * 90} size={11} fill={ORANGE} bold>中央 {String(r.mid)}</T>
          <T x={10} y={88 + ri * 90} anchor="start" size={11} dim>{r.note}</T>
        </g>
      ))}
    </Fig>
  );
}

// 並べ替え（バブルソート）：隣どうしを比べて入れ替える
export function FigBubbleSort() {
  const rows: { v: number[]; done: number; note: string }[] = [
    { v: [5, 2, 4, 1], done: 0, note: '最初' },
    { v: [2, 4, 1, 5], done: 1, note: '1周目：5 が右端へ' },
    { v: [2, 1, 4, 5], done: 2, note: '2周目：4 が右から2番目へ' },
    { v: [1, 2, 4, 5], done: 4, note: '3周目：完成' },
  ];
  const x0 = 150, step = 70;
  return (
    <Fig title="バブルソート：隣どうしを比べて、大きいほうを右へ送る" w={680} h={290} caption="左から順に、隣り合う2つを比べて、左が大きければ入れ替えます。1周するごとに、いちばん大きい値が右端に確定します（緑）。これを、確定していない部分に繰り返すと、全体が小さい順に並びます。">
      {rows.map((r, ri) => (
        <g key={ri}>
          <T x={10} y={42 + ri * 66} anchor="start" size={12} bold>{r.note}</T>
          {r.v.map((n, i) => <ArrCell key={i} x={x0 + 200 + i * step} y={22 + ri * 66} label={String(n)} c={i >= 4 - r.done ? GREEN : BLUE} />)}
        </g>
      ))}
    </Fig>
  );
}
