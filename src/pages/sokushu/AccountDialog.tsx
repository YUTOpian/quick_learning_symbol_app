import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Tooltip, Typography } from '@mui/material';
import { MAX_ACCOUNTS, MIN_PASS, clearSaved, listLive, loadAccount, loadSaved, networkOf, readAccount, saveAccount } from './account';
import type { LiveEntry, SavedAccount, Ver } from './account';
import AccountDetail from './AccountDetail';
import type { Known } from './AccountDetail';
import { fetchBalances } from './balance';
import type { BalanceResult } from './balance';
import { mono } from './ui';

type Msg = { sev: 'success' | 'error' | 'warning'; text: string };
type Bal = { loading: true } | { error: string } | { result: BalanceResult };

const Field = ({ label, value, secret }: { label: string; value: string; secret?: boolean }) => (
  <Box sx={{ mb: 1 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>{label}</Typography>
      {!secret && <Button size="small" sx={{ minWidth: 0, py: 0, fontSize: '0.75rem' }} onClick={() => { navigator.clipboard?.writeText(value).catch(() => {}); }}>コピー</Button>}
    </Box>
    <Box sx={{ ...mono, wordBreak: 'break-all', bgcolor: '#12002a', color: secret ? '#f0c674' : '#f0e8ff', p: 1, borderRadius: 1 }}>{value}</Box>
  </Box>
);

// モザイク残高（XYM を先頭に、持っているモザイクを全部）。
const Balance = ({ b }: { b?: Bal }) => {
  let body: ReactNode;
  if (!b || 'loading' in b) body = <Box sx={{ color: '#b9a6dc' }}>取得中…</Box>;
  else if ('error' in b) body = <Box sx={{ color: '#f48771' }}>{b.error}</Box>;
  else if (b.result.kind === 'unused') body = <Box sx={{ color: '#b9a6dc' }}>ブロックチェーンに未記録のアカウントです（XYMを受信すると記録されます）。XYM 0</Box>;
  else if (b.result.kind === 'mismatch') body = <Box sx={{ color: '#f0c674' }}>接続先ノードは{b.result.nodeNet}、このアカウントは{b.result.accountNet}のため、残高を取得できません。</Box>;
  else {
    const rows = b.result.mosaics.some((m) => m.isXym) ? b.result.mosaics : [{ id: 'XYM', label: 'XYM', amount: '0', isXym: true }, ...b.result.mosaics];
    body = rows.map((m) => (
      <Box key={m.id} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
        <Box sx={{ wordBreak: 'break-all', fontWeight: m.isXym ? 700 : 400 }}>{m.label}</Box>
        <Box sx={{ textAlign: 'right', whiteSpace: 'nowrap', fontWeight: m.isXym ? 700 : 400 }}>{m.amount}</Box>
      </Box>
    ));
  }
  return (
    <Box sx={{ mb: 1 }}>
      <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>残高</Typography>
      <Box sx={{ ...mono, bgcolor: '#12002a', color: '#f0e8ff', p: 1, borderRadius: 1 }}>{body}</Box>
    </Box>
  );
};

// 変数名（alice など）を見出しにした、アカウント1件ぶんの枠。
const Card = ({ name, chip, actions, children }: { name: string; chip?: ReactNode; actions?: ReactNode; children: ReactNode }) => (
  <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1.5, p: 1.5, mb: 1.5 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 1 }}>
      <Typography sx={{ ...mono, fontSize: 15, fontWeight: 700 }}>{name}</Typography>
      {chip}
      <Box sx={{ flex: 1 }} />
      {actions}
    </Box>
    {children}
  </Box>
);

// コンソールにあるアカウント（alice / bob / carol など）の保存・表示・復元。最大10個。秘密鍵はパスフレーズで暗号化して、このブラウザにだけ保存する。
export default function AccountDialog({ open, onClose, ready, ver, node, profileName }: { open: boolean; onClose: () => void; ready: boolean; ver: Ver; node: string; profileName: string }) {
  const [live, setLive] = useState<LiveEntry[]>([]); // 今コンソールにあるアカウント（秘密鍵は state に持たない）
  const [saved, setSaved] = useState<SavedAccount[]>([]);
  const [pass, setPass] = useState('');
  const [pass2, setPass2] = useState('');
  const [revealed, setRevealed] = useState<string[]>([]); // 秘密鍵を表示している変数名
  const [msg, setMsg] = useState<Msg | null>(null);
  const [busy, setBusy] = useState(false);
  const [bal, setBal] = useState<Record<string, Bal>>({}); // アドレスごとの残高
  const [tick, setTick] = useState(0); // 「残高を更新」を押した回数
  const balRef = useRef<Record<string, Bal>>({});
  const gen = useRef({ node: '', tick: -1, n: 0 }); // ノードを変えたり更新したら古い取得結果を捨てるための世代
  const setBalance = (fn: (p: Record<string, Bal>) => Record<string, Bal>) => { balRef.current = fn(balRef.current); setBal(balRef.current); };

  // 開いている間だけ、コンソールのアカウントを見張る（作り直したらすぐ反映する）。
  useEffect(() => {
    if (!open) return;
    const tick = () => setLive((p) => { const n = listLive(); return JSON.stringify(p) === JSON.stringify(n) ? p : n; });
    setSaved(loadSaved());
    tick();
    const t = setInterval(tick, 700);
    return () => clearInterval(t);
  }, [open]);

  // 表示中のアカウント（コンソール上 + 保存済み）の残高を取得する。新しく表示されたものだけ取得し、更新ボタン・ノード変更では全部取り直す。
  const addrKey = [...new Set([...live.map((e) => e.address), ...saved.map((s) => s.address)])].join(',');
  useEffect(() => {
    if (!open || !addrKey) return;
    const force = gen.current.node !== node || gen.current.tick !== tick;
    if (force) gen.current = { node, tick, n: gen.current.n + 1 };
    const myGen = gen.current.n;
    const targets = addrKey.split(',').filter((a) => force || !balRef.current[a]);
    if (targets.length === 0) return;
    setBalance((p) => { const n = force ? {} : { ...p }; targets.forEach((a) => { n[a] = { loading: true }; }); return n; });
    targets.forEach((a) => {
      fetchBalances(node, a)
        .then((result): Bal => ({ result }), (e: unknown): Bal => ({ error: e instanceof Error ? e.message : String(e) }))
        .then((v) => { if (gen.current.n === myGen) setBalance((p) => ({ ...p, [a]: v })); });
    });
  }, [open, addrKey, node, tick]);

  const close = () => { setPass(''); setPass2(''); setRevealed([]); setMsg(null); balRef.current = {}; setBal({}); onClose(); };
  const fail = (e: unknown) => setMsg({ sev: 'error', text: e instanceof Error ? e.message : String(e) });
  const toggleReveal = (name: string) => setRevealed((r) => (r.includes(name) ? r.filter((n) => n !== name) : [...r, name]));

  // アドレス・公開鍵 → 変数名（alice など）。詳細の連署者や宛先を、名前で表示するために使う。
  const known = useMemo<Known>(() => {
    const k: Known = {};
    for (const a of [...saved, ...live]) { k[a.address] = a.name; k[a.publicKey.toUpperCase()] = a.name; }
    return k;
  }, [live, saved]);

  const full = saved.length >= MAX_ACCOUNTS;
  const passOk = pass.length >= MIN_PASS && pass === pass2;

  const save = async (e: LiveEntry) => {
    const a = readAccount(e.name);
    if (!a) { setMsg({ sev: 'error', text: `コンソールに ${e.name} が見つかりません。` }); return; }
    if (networkOf(a.address) === 'メインネット' && !window.confirm('メインネットのアカウントです。実際の資産が入っているアカウントの秘密鍵は、ブラウザに保存しないでください。それでも保存しますか？')) return;
    const same = saved.find((s) => s.name === e.name);
    if (same && same.address !== a.address && !window.confirm(`保存済みの ${e.name} を、今の ${e.name} で上書きします。よろしいですか？`)) return;
    setBusy(true); setMsg(null);
    try { setSaved(await saveAccount(e.name, a, pass)); setPass(''); setPass2(''); setMsg({ sev: 'success', text: `${e.name} を暗号化して保存しました。` }); }
    catch (err) { fail(err); }
    finally { setBusy(false); }
  };

  const load = async (s: SavedAccount) => {
    const cur = readAccount(s.name);
    if (cur && cur.address !== s.address && !window.confirm(`コンソールの ${s.name} を、保存したアカウントで置き換えます。よろしいですか？`)) return;
    setBusy(true); setMsg(null);
    try {
      const address = await loadAccount(ver, s.name, pass);
      console.log(`${s.name} を復元しました: ${address}`); // コンソールにも表示する
      setPass(''); setPass2('');
      setLive(listLive());
      setMsg(address === s.address
        ? { sev: 'success', text: `${s.name} を復元しました。コンソールの変数 ${s.name}（と ${s.name}Address）に入っています。` }
        : { sev: 'warning', text: `${s.name} を復元しましたが、アドレスが保存時と違います（${address}）。接続先ネットワークが保存時と異なる可能性があります。` });
    } catch (err) { fail(err); }
    finally { setBusy(false); }
  };

  const remove = (s: SavedAccount) => {
    if (!window.confirm(`保存した ${s.name} を削除します。秘密鍵を別に控えていない場合、もう復元できません。よろしいですか？`)) return;
    try { setSaved(clearSaved(s.name)); setMsg({ sev: 'success', text: `保存した ${s.name} を削除しました。` }); } catch (err) { fail(err); }
  };

  return (
    <Dialog open={open} onClose={close} fullWidth maxWidth="lg">
      <DialogTitle>アカウントの保存と表示<Typography component="span" sx={{ ml: 1.5, fontSize: '0.9rem', color: 'text.secondary' }}>プロファイル: {profileName}</Typography></DialogTitle>
      <DialogContent dividers>
        <Alert severity="info" sx={{ mb: 2 }}>
          コンソールにある alice や bob などのアカウントを、最大{MAX_ACCOUNTS}個まで保存できます。秘密鍵はパスフレーズで暗号化して、このブラウザの、このプロファイル（{profileName}）にだけ保存します（アドレスと公開鍵は暗号化しません）。学習用のテストネットのアカウントでお使いください。パスフレーズを忘れると復元できません。各アカウントの「詳細を表示」では、モザイク・ネームスペース・マルチシグ・署名待ち・ロック・制限・メタデータ・取引履歴を、ノードから取得して確認できます（トランザクションを試しながら、結果を見比べるのに使ってください）。
        </Alert>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2, maxWidth: 420 }}>
          <TextField size="small" type="password" label="パスフレーズ" autoComplete="off" value={pass} onChange={(e) => setPass(e.target.value)}
            helperText={`保存・復元の両方で使います。保存するときは${MIN_PASS}文字以上`} />
          <TextField size="small" type="password" label="パスフレーズ（確認・保存するときのみ）" autoComplete="off" value={pass2} onChange={(e) => setPass2(e.target.value)}
            error={pass2.length > 0 && pass !== pass2} helperText={pass2.length > 0 && pass !== pass2 ? '一致しません' : ' '} />
        </Box>
        {msg && <Alert severity={msg.sev} sx={{ mb: 2 }}>{msg.text}</Alert>}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary', wordBreak: 'break-all' }}>残高の取得先ノード: {node}</Typography>
          <Button size="small" variant="outlined" onClick={() => setTick((t) => t + 1)}>残高・詳細を更新</Button>
        </Box>

        <Typography sx={{ fontWeight: 700, mb: 1 }}>コンソール上のアカウント</Typography>
        {live.length === 0 && <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem', mb: 1 }}>アカウントがありません。第3章 3.1 で alice を作成するか、下の「保存済みのアカウント」から復元してください。</Typography>}
        {live.map((e) => {
          const byAddr = saved.find((s) => s.address === e.address);
          const byName = saved.find((s) => s.name === e.name);
          const savedAlready = !!byAddr && byAddr.name === e.name;
          const otherName = !!byAddr && byAddr.name !== e.name;
          const blockedByFull = full && !byName;
          const disabled = busy || !passOk || savedAlready || otherName || blockedByFull;
          const why = savedAlready ? '保存済みです' : otherName ? `「${byAddr?.name}」として保存済みです` : blockedByFull ? `保存できるのは最大${MAX_ACCOUNTS}個です` : !passOk ? `パスフレーズ（${MIN_PASS}文字以上・確認入力と一致）を入力してください` : '';
          const pk = revealed.includes(e.name) ? readAccount(e.name)?.privateKey : undefined;
          return (
            <Card key={e.name} name={e.name}
              chip={savedAlready ? <Chip size="small" color="success" label="保存済み" /> : otherName ? <Chip size="small" label={`「${byAddr?.name}」として保存済み`} /> : undefined}
              actions={<>
                <Button size="small" onClick={() => toggleReveal(e.name)}>{revealed.includes(e.name) ? '秘密鍵を隠す' : '秘密鍵を表示'}</Button>
                <Tooltip title={why}><span><Button size="small" variant="contained" disabled={disabled} onClick={() => save(e)}>{byName && !savedAlready ? '上書き保存' : '保存'}</Button></span></Tooltip>
              </>}>
              <Field label={`アドレス（${networkOf(e.address)}）`} value={e.address} />
              <Field label="公開鍵" value={e.publicKey} />
              <Balance b={bal[e.address]} />
              {pk && <Field label="秘密鍵（他人に見せないでください）" value={pk} secret />}
              <AccountDetail node={node} address={e.address} publicKey={e.publicKey} rev={tick} known={known} />
            </Card>
          );
        })}

        <Typography sx={{ fontWeight: 700, mt: 3, mb: 1 }}>保存済みのアカウント（{saved.length} / {MAX_ACCOUNTS}）</Typography>
        {saved.length === 0 && <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>保存されていません。</Typography>}
        {saved.map((s) => {
          const liveSame = live.some((e) => e.name === s.name && e.address === s.address);
          return (
            <Card key={s.name} name={s.name}
              chip={liveSame ? <Chip size="small" color="success" label="コンソールにあります" /> : undefined}
              actions={<>
                <Button size="small" color="error" disabled={busy} onClick={() => remove(s)}>削除</Button>
                <Tooltip title={!ready ? '環境構築（第2章 2.3）が完了していません' : pass.length === 0 ? 'パスフレーズを入力してください' : ''}>
                  <span><Button size="small" variant="outlined" disabled={busy || !ready || pass.length === 0} onClick={() => load(s)}>復元</Button></span>
                </Tooltip>
              </>}>
              <Field label={`アドレス（${networkOf(s.address)}）`} value={s.address} />
              <Field label="公開鍵" value={s.publicKey} />
              <Balance b={bal[s.address]} />
              <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>保存日時: {new Date(s.savedAt).toLocaleString('ja-JP')}</Typography>
              <AccountDetail node={node} address={s.address} publicKey={s.publicKey} rev={tick} known={known} />
            </Card>
          );
        })}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 1.5 }}>
        <Button onClick={close}>閉じる</Button>
      </DialogActions>
    </Dialog>
  );
}
