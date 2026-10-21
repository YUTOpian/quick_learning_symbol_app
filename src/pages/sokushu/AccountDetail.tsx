import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Alert, Box, Button, Chip, Table, TableBody, TableCell, TableHead, TableRow, Tab, Tabs, Tooltip, Typography } from '@mui/material';
import { HISTORY_MAX, LIST_MAX, fetchInfo } from './accountInfo';
import type { Info, Party, Sec } from './accountInfo';
import { mono } from './ui';

// アカウント1件ぶんの「詳細」。学習で使うモザイク・ネームスペース・マルチシグ・署名待ち・ロック・制限・メタデータ・取引履歴を、タブで切り替えて見られる。
// known は「アドレス・公開鍵 → 変数名（alice など）」の対応表。連署者や宛先が alice や bob のときに、名前で表示するために使う。

export type Known = Record<string, string>;

const short = (s: string): string => (s.length > 22 ? `${s.slice(0, 8)}…${s.slice(-6)}` : s);
const copy = (v: string) => { navigator.clipboard?.writeText(v).catch(() => {}); };
const nameOf = (known: Known, v: string): string | undefined => known[v] ?? known[v.toUpperCase()];

// アドレス・公開鍵・ハッシュなどの長い文字列。短く表示して、クリックでコピーできる。コンソールの変数名がわかるものは名前も付ける。
const Val = ({ v, known }: { v: string; known?: Known }) => {
  const n = known ? nameOf(known, v) : undefined;
  return (
    <Tooltip title={`${v}（クリックでコピー）`}>
      <Box component="span" onClick={() => copy(v)} sx={{ ...mono, fontSize: 12.5, cursor: 'pointer', wordBreak: 'break-all' }}>
        {n && <Chip size="small" color="secondary" label={n} sx={{ mr: 0.5, height: 20, fontWeight: 700 }} />}
        {short(v)}
      </Box>
    </Tooltip>
  );
};

const PartyView = ({ p, known }: { p: Party; known: Known }) =>
  p.kind === 'ns' ? <Box component="span" sx={{ ...mono, fontSize: 12.5 }}>@{p.value}</Box> : <Val v={p.value} known={known} />;

const Hint = ({ children }: { children: ReactNode }) => (
  <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary', mb: 1 }}>{children}</Typography>
);
const Empty = ({ children }: { children: ReactNode }) => (
  <Typography sx={{ fontSize: '0.9rem', color: 'text.secondary', py: 1 }}>{children}</Typography>
);
const Grid = ({ head, children }: { head: string[]; children: ReactNode }) => (
  <Box sx={{ overflowX: 'auto' }}>
    <Table size="small">
      <TableHead><TableRow>{head.map((h) => <TableCell key={h} sx={{ whiteSpace: 'nowrap' }}>{h}</TableCell>)}</TableRow></TableHead>
      <TableBody>{children}</TableBody>
    </Table>
  </Box>
);
const cellSx = { verticalAlign: 'top', fontSize: '0.85rem' } as const;

// 取得に失敗したセクションはエラーを、成功したセクションは中身を表示する。
const view = <T,>(s: Sec<T>, f: (d: T) => ReactNode): ReactNode =>
  s.ok ? f(s.data) : <Alert severity="error" sx={{ my: 1 }}>{s.error}</Alert>;

const count = (s: Sec<unknown[]>): number | null => (s.ok ? s.data.length : null);

type TabDef = { id: string; label: string; n: number | null; err: boolean };

export default function AccountDetail({ node, address, publicKey, rev, known }: { node: string; address: string; publicKey: string; rev: number; known: Known }) {
  const [open, setOpen] = useState(false);
  const [info, setInfo] = useState<Info | null>(null);
  const [fail, setFail] = useState('');
  const [tab, setTab] = useState('mosaics');

  // 開いている間だけ取得する。ノード変更・「残高を更新」で取り直す。
  useEffect(() => {
    if (!open) return;
    let alive = true;
    setFail('');
    fetchInfo(node, address, publicKey, rev).then(
      (r) => { if (alive) setInfo(r); },
      (e: unknown) => { if (alive) { setInfo(null); setFail(e instanceof Error ? e.message : String(e)); } },
    );
    return () => { alive = false; };
  }, [open, node, address, publicKey, rev]);

  const tabs: TabDef[] = info ? [
    { id: 'mosaics', label: 'モザイク', n: count(info.mosaics), err: !info.mosaics.ok },
    { id: 'namespaces', label: 'ネームスペース', n: count(info.namespaces), err: !info.namespaces.ok },
    { id: 'multisig', label: 'マルチシグ', n: info.multisig.ok ? info.multisig.data.cosigners.length + info.multisig.data.parents.length : null, err: !info.multisig.ok },
    { id: 'pending', label: '署名待ち・未承認', n: count(info.pending), err: !info.pending.ok },
    { id: 'locks', label: 'ロック', n: count(info.locks), err: !info.locks.ok },
    { id: 'restrictions', label: '制限', n: info.restrictions.ok ? info.restrictions.data.account.length + info.restrictions.data.mosaic.length : null, err: !info.restrictions.ok },
    { id: 'metadata', label: 'メタデータ', n: count(info.metadata), err: !info.metadata.ok },
    { id: 'history', label: '取引履歴', n: count(info.history), err: !info.history.ok },
  ] : [];

  const panel = (i: Info): ReactNode => {
    switch (tab) {
      case 'mosaics': return (<>
        <Hint>このアカウントが持っているモザイクと、このアカウントが作成したモザイクです（第5章）。「作成者」が「このアカウント」のものは、自分で作ったモザイクです。</Hint>
        {view(i.mosaics, (rows) => rows.length === 0 ? <Empty>モザイクはありません。</Empty> : (
          <Grid head={['モザイク', '保有量', '供給量', '可分性', 'フラグ', '有効期限', '作成者']}>
            {rows.map((m) => (
              <TableRow key={m.id}>
                <TableCell sx={cellSx}>
                  {m.name && <Box sx={{ fontWeight: 700 }}>{m.name}</Box>}
                  {!m.isXym && <Val v={m.id} />}
                </TableCell>
                <TableCell sx={{ ...cellSx, textAlign: 'right', whiteSpace: 'nowrap' }}>{m.held}</TableCell>
                <TableCell sx={{ ...cellSx, textAlign: 'right', whiteSpace: 'nowrap' }}>{m.supply}</TableCell>
                <TableCell sx={{ ...cellSx, textAlign: 'right' }}>{m.divisibility}</TableCell>
                <TableCell sx={cellSx}>{m.flags.length === 0 ? 'なし' : m.flags.map((f) => <Chip key={f} size="small" variant="outlined" label={f} sx={{ mr: 0.5, mb: 0.5 }} />)}</TableCell>
                <TableCell sx={cellSx}>{m.expiry}</TableCell>
                <TableCell sx={cellSx}>{m.owner === '' ? '' : m.mine ? <Chip size="small" color="success" label="このアカウント" /> : <Val v={m.owner} known={known} />}</TableCell>
              </TableRow>
            ))}
          </Grid>
        ))}
        <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', mt: 0.5 }}>作成したモザイクは最大{LIST_MAX}件まで表示します。</Typography>
      </>);
      case 'namespaces': return (<>
        <Hint>このアカウントが所有しているネームスペースです（第6章）。エイリアスは、そのネームスペースが指しているアドレスまたはモザイクです。</Hint>
        {view(i.namespaces, (rows) => rows.length === 0 ? <Empty>所有しているネームスペースはありません。</Empty> : (
          <Grid head={['名前', '種類', '有効期限', 'エイリアス']}>
            {rows.map((n) => (
              <TableRow key={n.name}>
                <TableCell sx={{ ...cellSx, ...mono, fontSize: 13, fontWeight: 700 }}>{n.name}</TableCell>
                <TableCell sx={cellSx}>{n.kind}</TableCell>
                <TableCell sx={{ ...cellSx, color: n.active ? undefined : 'error.main' }}>{n.expiry}</TableCell>
                <TableCell sx={{ ...cellSx, wordBreak: 'break-all' }}>{n.alias === '' ? 'なし' : n.alias}</TableCell>
              </TableRow>
            ))}
          </Grid>
        ))}
      </>);
      case 'multisig': return (<>
        <Hint>マルチシグの構成です（第9章）。このアカウントがマルチシグ（複数人の署名で動かす口座）か、他のマルチシグの連署者になっているかが分かります。</Hint>
        {view(i.multisig, (m) => (!m.isMultisig && m.parents.length === 0) ? <Empty>マルチシグではなく、他のマルチシグの連署者にもなっていません。</Empty> : (<>
          {m.isMultisig && (
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ fontWeight: 700, mb: 0.5 }}>このアカウントはマルチシグです</Typography>
              <Typography sx={{ fontSize: '0.9rem' }}>承認に必要な署名の数: {m.minApproval} ／ 連署者の削除に必要な署名の数: {m.minRemoval}</Typography>
              <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary', mt: 1 }}>連署者（{m.cosigners.length}人）</Typography>
              {m.cosigners.map((a) => <Box key={a} sx={{ py: 0.25 }}><Val v={a} known={known} /></Box>)}
            </Box>
          )}
          {m.parents.length > 0 && (
            <Box>
              <Typography sx={{ fontWeight: 700, mb: 0.5 }}>連署者として登録されているマルチシグアカウント（{m.parents.length}件）</Typography>
              {m.parents.map((a) => <Box key={a} sx={{ py: 0.25 }}><Val v={a} known={known} /></Box>)}
            </Box>
          )}
        </>))}
      </>);
      case 'pending': return (<>
        <Hint>署名が足りずに待っているアグリゲートボンデッドと、まだ承認されていないトランザクションです（第8章・第9章・第12章）。承認されると取引履歴に移ります。</Hint>
        {view(i.pending, (rows) => rows.length === 0 ? <Empty>署名待ち・未承認のトランザクションはありません。</Empty> : (
          <Grid head={['状態', '種類', '署名者', '署名済みの連署者', '期限', 'ハッシュ']}>
            {rows.map((r) => (
              <TableRow key={`${r.kind}${r.hash}`}>
                <TableCell sx={cellSx}><Chip size="small" color={r.kind === '署名待ち' ? 'warning' : 'info'} label={r.kind} /></TableCell>
                <TableCell sx={cellSx}>{r.type}{r.inner.length > 0 && <Box sx={{ color: 'text.secondary' }}>内容: {r.inner.join('、')}</Box>}</TableCell>
                <TableCell sx={cellSx}><Val v={r.signer} known={known} /></TableCell>
                <TableCell sx={cellSx}>{r.cosigners.length === 0 ? 'なし' : r.cosigners.map((c) => <Box key={c}><Val v={c} known={known} /></Box>)}</TableCell>
                <TableCell sx={{ ...cellSx, whiteSpace: 'nowrap' }}>{r.deadline}</TableCell>
                <TableCell sx={cellSx}><Val v={r.hash} /></TableCell>
              </TableRow>
            ))}
          </Grid>
        ))}
      </>);
      case 'locks': return (<>
        <Hint>このアカウントが作ったハッシュロック（ボンデッドの預け金）とシークレットロックです（第8章）。使用済みでも、期限が切れるまで記録に残ります。</Hint>
        {view(i.locks, (rows) => rows.length === 0 ? <Empty>ロックはありません。</Empty> : (
          <Grid head={['種類', 'モザイク', '数量', '状態', '期限', 'ハッシュ / シークレット', '受取人']}>
            {rows.map((l, k) => (
              <TableRow key={`${l.kind}${l.value}${k}`}>
                <TableCell sx={cellSx}>{l.kind}</TableCell>
                <TableCell sx={{ ...cellSx, wordBreak: 'break-all' }}>{l.mosaic}</TableCell>
                <TableCell sx={{ ...cellSx, textAlign: 'right', whiteSpace: 'nowrap' }}>{l.amount}</TableCell>
                <TableCell sx={cellSx}><Chip size="small" color={l.status.startsWith('有効') ? 'success' : 'default'} label={l.status} /></TableCell>
                <TableCell sx={cellSx}>{l.expiry}</TableCell>
                <TableCell sx={cellSx}>{l.value && <Val v={l.value} />}</TableCell>
                <TableCell sx={cellSx}>{l.recipient && <Val v={l.recipient} known={known} />}</TableCell>
              </TableRow>
            ))}
          </Grid>
        ))}
      </>);
      case 'restrictions': return (<>
        <Hint>このアカウントに設定されている制限です（第11章）。「許可」は列挙したものだけ、「ブロック」は列挙したものだけを拒否します。</Hint>
        {view(i.restrictions, (r) => (r.account.length === 0 && r.mosaic.length === 0) ? <Empty>制限は設定されていません。</Empty> : (<>
          {r.account.length > 0 && (
            <Grid head={['対象', '方向', '方式', '値']}>
              {r.account.map((x, k) => (
                <TableRow key={`${x.kind}${x.direction}${k}`}>
                  <TableCell sx={cellSx}>{x.kind}</TableCell>
                  <TableCell sx={cellSx}>{x.direction}</TableCell>
                  <TableCell sx={cellSx}><Chip size="small" color={x.mode === '許可' ? 'success' : 'warning'} label={x.mode} /></TableCell>
                  <TableCell sx={cellSx}>{x.values.length === 0 ? 'なし' : x.values.map((v) => <Box key={v} sx={{ wordBreak: 'break-all' }}>{/^[NT][A-Z2-7]{38}$/.test(v) ? <Val v={v} known={known} /> : v}</Box>)}</TableCell>
                </TableRow>
              ))}
            </Grid>
          )}
          {r.mosaic.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography sx={{ fontWeight: 700, mb: 0.5 }}>モザイク制限（このアドレスに設定された値）</Typography>
              {r.mosaic.map((m) => (
                <Box key={m.mosaic} sx={{ py: 0.25, fontSize: '0.85rem' }}><Box component="span" sx={{ wordBreak: 'break-all' }}>{m.mosaic}</Box>：{m.entries.join('、')}</Box>
              ))}
            </Box>
          )}
        </>))}
      </>);
      case 'metadata': return (<>
        <Hint>このアカウントを対象に登録されているメタデータです（第7章）。アカウント・モザイク・ネームスペースの Key-Value が並びます。キーは16進数で表示します。</Hint>
        {view(i.metadata, (rows) => rows.length === 0 ? <Empty>メタデータはありません。</Empty> : (
          <Grid head={['対象', 'キー', '値', '登録した人', '対象ID']}>
            {rows.map((m, k) => (
              <TableRow key={`${m.kind}${m.key}${m.source}${k}`}>
                <TableCell sx={cellSx}>{m.kind}</TableCell>
                <TableCell sx={{ ...cellSx, ...mono, fontSize: 12.5 }}>{m.key}</TableCell>
                <TableCell sx={{ ...cellSx, wordBreak: 'break-all' }}>{m.value}</TableCell>
                <TableCell sx={cellSx}><Val v={m.source} known={known} /></TableCell>
                <TableCell sx={cellSx}>{m.target && <Val v={m.target} />}</TableCell>
              </TableRow>
            ))}
          </Grid>
        ))}
      </>);
      default: return (<>
        <Hint>承認されたトランザクションの新しい順の{HISTORY_MAX}件です（第4章）。どのトランザクションが、いつ、何をしたかを確認できます。</Hint>
        {view(i.history, (rows) => rows.length === 0 ? <Empty>承認済みのトランザクションはありません。</Empty> : (
          <Grid head={['日時', '種類', '内容', '署名者', 'ハッシュ']}>
            {rows.map((t) => (
              <TableRow key={t.hash}>
                <TableCell sx={{ ...cellSx, whiteSpace: 'nowrap' }}>{t.time}<Box sx={{ color: 'text.secondary' }}>ブロック高 {t.height}</Box></TableCell>
                <TableCell sx={cellSx}>{t.type}<Box><Chip size="small" variant="outlined" color={t.role === '受信' ? 'success' : t.role === '送信' ? 'info' : 'default'} label={t.role} sx={{ mt: 0.5 }} /></Box></TableCell>
                <TableCell sx={cellSx}>
                  {t.recipient && <Box>宛先: <PartyView p={t.recipient} known={known} /></Box>}
                  {t.mosaics.map((m) => <Box key={m.label} sx={{ wordBreak: 'break-all' }}>{m.label} {m.amount}</Box>)}
                  {t.message !== undefined && <Box sx={{ wordBreak: 'break-all' }}>メッセージ: {t.message}</Box>}
                  {t.inner.length > 0 && <Box>内容: {t.inner.join('、')}</Box>}
                </TableCell>
                <TableCell sx={cellSx}><Val v={t.signer} known={known} /></TableCell>
                <TableCell sx={cellSx}><Val v={t.hash} /></TableCell>
              </TableRow>
            ))}
          </Grid>
        ))}
      </>);
    }
  };

  return (
    <Box sx={{ mt: 1 }}>
      <Button size="small" variant={open ? 'contained' : 'outlined'} onClick={() => setOpen((v) => !v)}>
        {open ? '詳細を閉じる' : '詳細を表示（モザイク・ネームスペース・マルチシグなど）'}
      </Button>
      {open && (
        <Box sx={{ mt: 1.5, p: 1.5, bgcolor: 'rgba(0,0,0,0.18)', borderRadius: 1 }}>
          {fail && <Alert severity="warning">{fail}</Alert>}
          {!fail && !info && <Typography sx={{ color: 'text.secondary' }}>取得中…</Typography>}
          {info && (<>
            {info.height !== null && <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary', mb: 0.5 }}>現在のブロック高: {info.height.toLocaleString('en-US')}</Typography>}
            <Tabs value={tabs.some((t) => t.id === tab) ? tab : 'mosaics'} onChange={(_, v: string) => setTab(v)} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile sx={{ mb: 1.5, minHeight: 40 }}>
              {tabs.map((t) => <Tab key={t.id} value={t.id} sx={{ minHeight: 40, py: 0.5 }} label={`${t.label}${t.err ? ' ⚠' : t.n !== null ? `（${t.n}）` : ''}`} />)}
            </Tabs>
            {panel(info)}
          </>)}
        </Box>
      )}
    </Box>
  );
}
