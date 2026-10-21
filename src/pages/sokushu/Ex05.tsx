import { useEffect, useState } from 'react';
import { Alert, Box, Button, Chip, Typography } from '@mui/material';
import { Code, H, H3, P } from './ui';
import { C, Example, Fold, Li, Mission, Pick, PracticeHead, QuizCard, Task, Ul } from './exUi';
import type { Ver } from './Ch02';
import { prepV2, prepV3 } from './ch15/code';
import { toolsV2 as mosaicToolsV2, toolsV3 as mosaicToolsV3 } from './ex03/code';
import { toolsV2 as nsToolsV2, toolsV3 as nsToolsV3 } from './ex04/code';
import * as d from './ex05/code';
import { QUIZZES } from './ex05/quiz';
import { loadEx, saveEx } from './profile';
import type { ExState } from './profile';

const TASK_IDS = ['md-t1', 'md-t2', 'md-t3', 'md-t4', 'md-t5'];

// 速習Symbol: 演習編 第5章 メタデータ。本編 第7章（メタデータ）の内容を、クイズとハンズオンで確かめる。
export default function Ex05({ ver, profile }: { ver: Ver; profile: number }) {
  // クイズの回答と「できた」は、プロファイルごとに保存しておく（他の演習の章と同じ保存場所。id が重ならないようにしてある）。
  const [st, setSt] = useState<ExState>(() => loadEx(profile));
  useEffect(() => { saveEx(profile, st); }, [profile, st]);
  const answer = (id: string, a: number) => setSt((s) => ({ ...s, quiz: { ...s.quiz, [id]: a } }));
  const setDone = (id: string, v: boolean) => setSt((s) => ({ ...s, done: { ...s.done, [id]: v } }));

  const answered = QUIZZES.filter((q) => st.quiz[q.id] !== undefined).length;
  const correct = QUIZZES.filter((q) => st.quiz[q.id] === q.answer).length;
  const doneCount = TASK_IDS.filter((id) => st.done[id]).length;
  const tp = { done: (id: string) => !!st.done[id], on: (id: string) => (v: boolean) => setDone(id, v) };

  return (
    <>
      <P>この章は、本編の<strong>第7章 メタデータ</strong>に対応する演習です。第7章では、アカウント・モザイク・ネームスペースへのメタデータの登録、値の確認、使うときの注意、有資格証明（DID）への活用を学びました。ここでは、それらを自分の手で使い、理解を確かめます。</P>
      <P>メタデータは、アカウント・モザイク・ネームスペースに、Key-Value 形式のデータを付ける仕組みです。ただし、<strong>更新できる</strong>ので、「誰が登録した値か」「誰の署名が必要か」を押さえておかないと、信用してよい情報かどうかが決められません。この章では、その見分け方を、手を動かして確かめます。</P>

      <H>5.1 この章の進め方</H>
      <P>この章は、次の4つで構成されています。</P>
      <Ul>
        <Li><strong>5.2 確認クイズ</strong>（全{QUIZZES.length}問）: 選択式です。回答するとすぐに解説が表示されます。</Li>
        <Li><strong>5.3 ハンズオン演習</strong>（全{TASK_IDS.length}題）: コンソールで実際にコードを書いて動かします。各演習には、解き方を示した<strong>例題</strong>が付いています。</Li>
        <Li><strong>5.4 設計演習</strong>: コードは書かずに、場面ごとに「どう設計するか」を考えます。</Li>
        <Li><strong>5.5 振り返り</strong>: 第7章の各節と、この章の問題の対応表です。</Li>
      </Ul>

      <Box sx={{ my: 2, p: 2, border: 1, borderColor: 'divider', borderRadius: 2, display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
        <Typography sx={{ fontWeight: 700, mr: 1 }}>現在の成績</Typography>
        <Chip color={correct === QUIZZES.length ? 'success' : 'default'} label={`クイズ ${correct} / ${QUIZZES.length} 問正解（回答済み ${answered} 問）`} />
        <Chip color={doneCount === TASK_IDS.length ? 'success' : 'default'} label={`ハンズオン ${doneCount} / ${TASK_IDS.length} 題できた`} />
      </Box>

      <H3>進め方のコツ</H3>
      <Ul>
        <Li>各演習は「例題 → 練習問題」の順です。まず例題の解き方を読み、コードを実行して動きを確かめてから、練習問題に進みます。</Li>
        <Li>練習問題は、解答例を開く前に、まず自分でコードを書いて、コンソールで試します。</Li>
        <Li>詰まったら「ヒント」を開きます。ヒントには、見直すとよい第7章の節を書いてあります。</Li>
        <Li>最後に「解答例」を開いて、自分のコードと見比べます。解答例のコードは、選択中のSDKバージョンのほうだけが表示されます。</Li>
        <Li>各演習の最後にある「答え合わせ」のコードを実行して、✅ が表示されたら「できた」にチェックを入れます。</Li>
        <Li>クイズの回答と「できた」のチェックは、このプロファイルに保存されます。</Li>
      </Ul>

      <H3>前提</H3>
      <Ul>
        <Li>環境構築（第2章）が済んでいて、第3章で作成した <C>alice</C> を使います。{ver === 'v3' ? <>SDK v3 では、メタデータのキーを作る <C>metadataGenerateKey()</C> と、差分データを作る <C>metadataUpdateValue()</C> を使うので、<strong>symbol-sdk v3.2.2 以降</strong>が必要です（本編 第7章 7.1）。</> : null}</Li>
        <Li>メタデータの登録は、トランザクション手数料だけで行えます（レンタル料はありません）。ただし、演習3は、モザイクの作成と、ルートネームスペースのレンタルを含むので、<strong>約 20 XYM</strong> ほど使います。演習5は、偽の発行者に渡す XYM 1 と手数料で、約 2 XYM です。演習1・2・4は、手数料だけです。全部に取り組むなら、alice に <strong>50 XYM 以上</strong>あると安心です。足りなければ、第3章のFAUCETで補充してください。</Li>
        <Li>メタデータの登録は、アグリゲートトランザクションで送るので、承認を待つ（30秒ほど）回数が多くなります。演習3〜5は、通して数分かかります。コードの実行中は、そのまま待ってください。</Li>
        <Li>承認された直後は、検索の結果に、まだ反映されていないことがあります。<C>undefined</C> が返ったときは、数秒待って、もう一度、読み取ってみてください。</Li>
        <Li>ページを再読み込みすると、コンソールの変数はすべて消えます。演習1〜5は、それぞれ単独で取り組めます（モザイクやネームスペース、アカウントは、各演習で新しく作ります）。</Li>
        <Li>この章で作るアカウント（bob・faker など）は、テストネットの練習用です。変数名は、ブラウザがもともと持っている名前（<C>status</C>・<C>name</C>・<C>parent</C> など）と重ならないようにしてあります。自分でコードを書くときも、気をつけてください。</Li>
        <Li>登録したメタデータは、ブロックチェーンに残ります。練習用なので、そのままにして構いません。</Li>
      </Ul>

      <H3>共通関数の準備</H3>
      <P>演習2〜5では、メタデータの登録や読み取りを、関数にまとめて使います。最初に、次の4つを1度ずつ実行しておいてください。ページを再読み込みしたときは、もう一度実行します。</P>
      <P><strong>① 待つための関数（第1章と同じものです。実行済みなら、もう一度実行する必要はありません）</strong></P>
      <Pick ver={ver} v2={<Code code={prepV2} />} v3={<Code code={prepV3} />} />
      <P><strong>② モザイクを扱う関数（演習編 第3章と同じものです）</strong>（<C>announceTx</C>・<C>makeMosaic</C>・<C>getMosaicInfo</C>・<C>sendMosaics</C>）。演習3〜5で、モザイクの作成と送信に使います。</P>
      <Pick ver={ver} v2={<Code code={mosaicToolsV2} />} v3={<Code code={mosaicToolsV3} />} />
      <P><strong>③ ネームスペースを扱う関数（演習編 第4章と同じものです）</strong>（<C>randomName</C>・<C>nsIdHex</C>・<C>registerNamespace</C> など）。キー名を毎回新しくするための <C>randomName</C> と、演習3のネームスペースのレンタルに使います。{ver === 'v3' ? <><C>hexToAddress</C> は、演習5で、メタデータの作成者のアドレスを文字列にするときに使います。</> : null}</P>
      <Pick ver={ver} v2={<Code code={nsToolsV2} />} v3={<Code code={nsToolsV3} />} />
      <P><strong>④ メタデータを扱う関数</strong>（<C>announceMeta</C>・<C>readMeta</C>{ver === 'v3' ? <>・<C>searchMeta</C></> : null}）。本編 第7章のコードを、関数にまとめたものです。まず実行して、そのあとで、中身を読んでみてください。第7章のコードと、見比べられます。</P>
      <Pick ver={ver} v2={<Code code={d.toolsV2} />} v3={<Code code={d.toolsV3} />} />
      <Ul>
        <Li><C>announceMeta(kind, target, name, text, source, owner)</C>: メタデータを登録（すでにあれば更新）して、ハッシュを返します。<C>kind</C> は、<C>'account'</C>・<C>'mosaic'</C>・<C>'namespace'</C> のどれかです。<C>target</C> は、記録先で、アカウントなら <C>Account</C>、モザイクならモザイクIDの16進数、ネームスペースなら <C>'xembook.tomato'</C> のような名前です。<C>name</C> はキーの名前、<C>text</C> は値（文字列）です。</Li>
        <Li><C>source</C> は、<strong>作成者</strong>（署名して、手数料を払うアカウント）で、省略すると alice です。<C>owner</C> は、モザイク・ネームスペースを作成したアカウントで、省略すると alice です。記録先の所有者が作成者と別のときは、関数の中で、所有者の連署を集めます（アカウントのときは、記録先のアカウント自身が連署します）。</Li>
        <Li><C>readMeta(kind, target, name, source)</C>: いまの値（文字列）を返します。登録されていなければ <C>undefined</C> です。<C>source</C> は、どの作成者が登録した値を探すかで、省略すると alice です。</Li>
        {ver === 'v3' ? <Li><C>searchMeta(params)</C>: メタデータの検索（第7章 7.4）をして、見つかったメタデータの情報のリストを返します。値（<C>value</C>）は、16進数のままです。</Li> : <Li><C>metaRepo</C>・<C>metaService</C>: 第7章の準備と同じものです。検索は <C>metaRepo.search()</C> で行えます。</Li>}
      </Ul>

      <H>5.2 確認クイズ</H>
      <P>第7章の内容から、全{QUIZZES.length}問を出題します。回答するとすぐに正誤と解説が表示されます。間違えた問題は、解説の内容を、第7章の本文で確かめましょう。</P>
      {QUIZZES.map((q, i) => (
        <QuizCard key={`${q.id}-${st.quiz[q.id] === undefined ? 'open' : 'done'}`} q={q} no={i + 1} answered={st.quiz[q.id]} onAnswer={(a) => answer(q.id, a)} />
      ))}
      {answered === QUIZZES.length && (
        <Alert severity={correct === QUIZZES.length ? 'success' : 'info'} sx={{ mt: 2 }}
          action={<Button color="inherit" size="small" onClick={() => setSt((s) => ({ ...s, quiz: Object.fromEntries(Object.entries(s.quiz).filter(([k]) => !QUIZZES.some((q) => q.id === k))) }))}>やり直す</Button>}>
          {correct === QUIZZES.length ? `全問正解です（${correct} / ${QUIZZES.length}）。` : `${correct} / ${QUIZZES.length} 問正解でした。間違えた問題の解説を読んで、もう一度挑戦してみましょう。`}
        </Alert>
      )}

      <H>5.3 ハンズオン演習</H>
      <P>ここからは、コンソールで実際に動かす演習です。難易度は ★ の数で表しています。どの演習も、最初に解き方つきの例題があり、そのあとに練習問題があります。例題のコードは、そのままコンソールで実行できます。</P>

      {/* ---------- 演習1 ---------- */}
      <Task no={1} title="キー・サイズ・差分を、計算で確かめる" stars={1} chapters={[7]} done={tp.done('md-t1')} onDone={tp.on('md-t1')}>
        <Example title="キーを作って、値のサイズを数える">
          <Mission label="問題">
            キー名 <C>key_account</C> から、メタデータのキー（16進数）を作ってください。さらに、日本語の文字列「あいう」の文字数とバイト数を調べて、値の最大サイズ（1024 バイト）に収まるかを確かめます。登録はしません。
          </Mission>
          <P><strong>解き方</strong></P>
          <Box component="ol" sx={{ my: 0.5, pl: 3, lineHeight: 1.95 }}>
            <Li>キーは、文字列から作る 64 ビットの数値です（7.1）。{ver === 'v2' ? <><C>sym.KeyGenerator.generateUInt64Key()</C> に、名前を渡します。<C>toHex()</C> で、16進数の文字列になります。</> : <><C>sdkSymbol.metadataGenerateKey()</C> に、名前を渡します。結果は BigInt なので、16進数にするときは、16桁にそろえます。</>}</Li>
            <Li>値は、バイト列として記録されます。文字数ではなく、<strong>バイト数</strong>で数えます。<C>TextEncoder</C> で UTF-8 のバイト列にして、長さを調べます。日本語の文字は、1文字が 3 バイトです。</Li>
            <Li>値の最大は 1024 バイトです。ちょうど 1024 バイトなら、登録できます。</Li>
          </Box>
          <Pick ver={ver} v2={<Code code={d.e1V2} />} v3={<Code code={d.e1V3} />} />
          <P><C>9772B71B058127D7</C>、<C>3 9</C>、<C>true</C> と表示されます。このキーは、本編 第7章の出力例（<C>scopedMetadataKey</C>）と同じです。同じ名前からは、いつも同じキーができるので、あとから、名前で探せます。</P>
        </Example>
        <PracticeHead />
        <Mission>
          メタデータの値とキーを確かめる関数を、4つ作ってください。
        </Mission>
        <Ul>
          <Li><C>byteLen(text)</C>: 文字列のバイト数（UTF-8）を返します。<C>byteLen('abc')</C> は <C>3</C>、<C>byteLen('あ')</C> も <C>3</C> です。</Li>
          <Li><C>isValidValue(text)</C>: 値として登録できる（1024 バイト以内）なら <C>true</C>、そうでなければ <C>false</C> を返します。<C>'a'</C> を 1024 個並べると <C>true</C>、1025 個だと <C>false</C> です。<C>'あ'</C> を 342 個並べると 1026 バイトなので <C>false</C> です。</Li>
          <Li><C>calcSizeDelta(oldText, newText)</C>: 値を登録し直すときの、サイズの差分（<C>sizeDelta</C>）を返します。新しい値のバイト数から、いま登録されている値のバイト数を引いた値です。まだ登録されていなければ、<C>oldText</C> は <C>undefined</C> で、新しい値のバイト数そのものです。<C>calcSizeDelta('test', 'ab')</C> は <C>-2</C> です。</Li>
          <Li><C>metaKeyHex(keyName)</C>: キー名から、キーの16進数（16桁・大文字）を返します。<C>metaKeyHex('key_account')</C> は <C>9772B71B058127D7</C> です。</Li>
        </Ul>
        <Fold title="ヒント">
          <P>バイト数は、例題の <C>new TextEncoder().encode(text).length</C> で求められます。<C>calcSizeDelta</C> は、7.1 の v3 のコードにある <C>sizeDelta</C> の計算（登録済みのときは、既存の <C>valueSize</C> を引く）と同じです。キーの16進数は、例題のコードを、関数にまとめます。</P>
        </Fold>
        <Fold title="解答例（まず自分で試してから開きましょう）">
          <Code code={d.t1Func} />
          <Pick ver={ver} v2={<Code code={d.t1KeyV2} />} v3={<Code code={d.t1KeyV3} />} />
          <P>メタデータの値は、文字数ではなく、<strong>バイト数</strong>で制限されます。日本語の文字列は、同じ文字数でも、英数字の3倍のバイト数を使います。1024 バイトに収めるには、日本語なら 341 文字までです。</P>
          <P>サイズの差分（<C>sizeDelta</C>）は、値を登録し直すときに、トランザクションに載せる値です。新しい値のほうが長ければ正、短ければ負になります。演習4で、実際のトランザクションに残る値と、見比べます。</P>
        </Fold>
        <P>答え合わせ。解答例と同じ関数名を使っています。</P>
        <Code code={d.t1Check} />
        <P>発展: <C>metaKeyHex('Key_Account')</C>（大文字小文字を変えた名前）を求めて、<C>key_account</C> のキーと、まったく違う値になることを確かめましょう。キー名は、大文字と小文字も区別されます。</P>
      </Task>

      {/* ---------- 演習2 ---------- */}
      <Task no={2} title="アカウントに登録して、読み取る" stars={2} chapters={[7]} done={tp.done('md-t2')} onDone={tp.on('md-t2')}>
        <Example title="自分自身にメタデータを登録する">
          <Mission label="問題">
            alice 自身のアカウントに、メタデータ（キー <C>nick_○○○</C>、値 <C>alice</C>）を登録してください。承認されたら、登録した値を読み取って、表示します。
          </Mission>
          <P><strong>解き方</strong></P>
          <Box component="ol" sx={{ my: 0.5, pl: 3, lineHeight: 1.95 }}>
            <Li>同じキーに同じ値を登録し直すと、更新になってしまうので、毎回新しいキーを使います。共通関数の <C>randomName()</C> で、後ろに付ける文字列を作ります。</Li>
            <Li>共通関数の <C>announceMeta</C> で、登録します（7.1）。記録先も作成者も alice ですが、メタデータの登録は、<strong>アグリゲートトランザクションに包んで</strong>送る必要があります。関数の中で、そうしています。</Li>
            <Li>承認されたら、共通関数の <C>readMeta</C> で、値を読み取ります。作成者は alice（省略時）です。</Li>
          </Box>
          <Code code={d.e2} />
          <P><C>alice</C> と表示されます。登録されたメタデータは、キーと値と、作成者（ソースアカウント）、記録先で、1件になっています。</P>
        </Example>
        <PracticeHead />
        <Mission>
          自分自身と、別のアカウントに、メタデータを登録して、読み取ってください。
        </Mission>
        <Ul>
          <Li>キーを毎回新しくするための目印を、<C>tag = randomName()</C> で作ります。</Li>
          <Li>alice 自身に、キー <C>'role_' + tag</C>・値 <C>'admin'</C> を登録します。読み取った値を <C>roleValue</C> に入れます。</Li>
          <Li><C>bob</C> を新しく作ります。作成者を <strong>alice</strong> にして、bob に、キー <C>'note_' + tag</C>・値 <C>'from alice'</C> を登録します。記録先の bob の連署が必要ですが、<C>announceMeta</C> が、関数の中で連署します。作成者を alice として読み取った値を <C>noteValue</C> に入れます。</Li>
          <Li>同じキー <C>'note_' + tag</C> を、作成者を <strong>bob</strong> にして読み取ります。結果を <C>noteBySelf</C> に入れます。</Li>
          <Li>上の「共通関数の準備」を、先に実行しておきます。</Li>
        </Ul>
        <Fold title="ヒント">
          <P>登録は、<C>await waitConfirmed(await announceMeta('account', 記録先, キー名, 値, 作成者))</C> の形です。読み取りは、<C>readMeta('account', 記録先, キー名, 作成者)</C> です。作成者を省略すると alice になります。7.1 の「異なるアカウントのメタデータに登録する場合」のとおり、記録先が別のアカウントのときは、記録先の連署が必要です。④では、bob は何も登録していないので、見つかりません。</P>
        </Fold>
        <Fold title="解答例（まず自分で試してから開きましょう）">
          <Pick ver={ver} v2={<Code code={d.t2V2} />} v3={<Code code={d.t2V3} />} />
          <P>①は、自分自身への登録です。②は、別のアカウントへの登録で、作成者の alice が署名して、記録先の bob が連署しています。<strong>登録される側（記録先）の承諾が、署名として必要</strong>になるので、勝手に、他人のアカウントへ書き込むことはできません。</P>
          <P>③では、同じキーでも、作成者が bob だと見つかりません。メタデータは、キーだけでなく、<strong>作成者とのペア</strong>で、1件が決まるからです。演習3・5で、この性質を使います。</P>
        </Fold>
        <P>答え合わせ。解答例と同じ変数名を使っています。</P>
        <Code code={d.t2Check} />
        <P>発展: bob 自身が作成者になって、bob に、同じキー <C>'note_' + tag</C> を登録してみましょう（<C>announceMeta('account', bob, 'note_' + tag, 'from bob', bob)</C>）。bob には、手数料のための XYM が必要です（演習3の③のように、alice から送ります）。そのあと、作成者を alice にした値と、bob にした値を、それぞれ読み取って、別々の値になっていることを確かめましょう。</P>
      </Task>

      {/* ---------- 演習3 ---------- */}
      <Task no={3} title="モザイクとネームスペースに登録する" stars={2} chapters={[7]} done={tp.done('md-t3')} onDone={tp.on('md-t3')}>
        <Example title="モザイクにメタデータを登録する">
          <Mission label="問題">
            モザイクを作って、そのモザイクに、メタデータ（キー <C>title</C>、値 <C>concert</C>）を登録してください。承認されたら、値を読み取って、さらに、検索結果の <C>metadataType</C> を確かめます。
          </Mission>
          <P><strong>解き方</strong></P>
          <Box component="ol" sx={{ my: 0.5, pl: 3, lineHeight: 1.95 }}>
            <Li>共通関数の <C>makeMosaic</C> で、モザイクを作ります（演習編 第3章）。ここでは、可分性 0・供給量 1 です。</Li>
            <Li>共通関数の <C>announceMeta</C> の <C>kind</C> に <C>'mosaic'</C>、<C>target</C> にモザイクIDの16進数を渡します（7.2）。登録・更新には、<strong>モザイクを作成したアカウント（alice）の署名</strong>が必要です。</Li>
            <Li>読み取りは、<C>readMeta('mosaic', モザイクID, キー名)</C> です。検索結果には、<C>metadataType</C> が入っています。アカウントが 0、モザイクが 1、ネームスペースが 2 です（7.4）。</Li>
          </Box>
          <Pick ver={ver} v2={<Code code={d.e3V2} />} v3={<Code code={d.e3V3} />} />
          <P><C>concert</C> と <C>1</C> が表示されます。モザイクのメタデータは、検索するときに、記録先を <C>targetId</C>（モザイクID）で指定します。</P>
        </Example>
        <PracticeHead />
        <Mission>
          モザイクとネームスペースに登録して、さらに、作成者が違う値が、別々に登録されることを確かめてください。
        </Mission>
        <Ul>
          <Li>可分性 0・供給量 1 のモザイクを作って、モザイクIDを <C>badgeId</C> に入れます。ルートネームスペースを、<C>metaRoot = randomName()</C> でレンタルします。</Li>
          <Li>alice が、モザイク <C>badgeId</C> に、キー <C>'grade'</C>・値 <C>'gold'</C> を登録します。ネームスペース <C>metaRoot</C> には、キー <C>'site'</C>・値 <C>'https://example.com'</C> を登録して、読み取った値を <C>siteValue</C> に入れます。</Li>
          <Li><C>bob</C> を新しく作って、alice から XYM 1 を送ります（bob が作成者として署名するので、手数料が必要です）。</Li>
          <Li>bob が<strong>作成者</strong>になって、alice のモザイク <C>badgeId</C> に、同じキー <C>'grade'</C>・値 <C>'silver'</C> を登録します。作成者を alice にして読み取った値を <C>gradeByAlice</C>、bob にして読み取った値を <C>gradeByBob</C> に入れます。</Li>
          <Li>作成者を絞らずに、モザイク <C>badgeId</C> のメタデータを、すべて検索して、件数を <C>mosaicEntryCount</C> に入れます。</Li>
          <Li>上の「共通関数の準備」を、先に実行しておきます。</Li>
        </Ul>
        <Fold title="ヒント">
          <P>ネームスペースには、<C>announceMeta('namespace', metaRoot, ...)</C> と、名前（path）を渡します。作成者が bob のときは、モザイクの作成者（alice）の連署が必要です。<C>announceMeta('mosaic', badgeId, 'grade', 'silver', bob, alice)</C> のように、第5引数に作成者の bob、第6引数にモザイクを作成した alice を渡します。7.2 に、「Key値・ソースアカウントの複合キーでValue値を登録します」とあります。作成者を絞らずに検索するときは、{ver === 'v2' ? <><C>metaRepo.search()</C> に、<C>targetId</C> と <C>metadataType</C> だけを渡します。</> : <><C>searchMeta()</C> に、<C>targetId</C> と <C>metadataType</C> だけを渡します。</>}</P>
        </Fold>
        <Fold title="解答例（まず自分で試してから開きましょう）">
          <Pick ver={ver}
            v2={<><Code code={d.t3V2a} /><Code code={d.t3V2b} /><Code code={d.t3V2c} /></>}
            v3={<><Code code={d.t3V3a} /><Code code={d.t3V3b} /><Code code={d.t3V3c} /></>}
          />
          <P>②では、モザイクとネームスペースの作成者である alice が、自分で登録しました。モザイクとネームスペースへの登録は、作成したアカウントの署名が必要です。</P>
          <P>④では、作成者が bob でも、モザイクの作成者 alice が連署しているので、登録できます。同じキー <C>grade</C> でも、alice が登録した <C>gold</C> と、bob が登録した <C>silver</C> は、<strong>別々の値</strong>です。⑤のように、作成者を絞らないと、2件見つかります。</P>
          <P>誰が登録したメタデータかは、<strong>作成者（ソースアカウント）</strong>で分かります。信用する値を読み取るときは、作成者を指定します（演習5）。</P>
        </Fold>
        <P>答え合わせ。解答例と同じ変数名を使っています。</P>
        <Code code={d.t3Check} />
        <P>発展: ネームスペースの検索結果（<C>metadataType</C>）が 2 になることを、確かめましょう。モザイクのときの <C>targetId</C> には、モザイクIDを渡しましたが、ネームスペースのときは、何を渡せばよいでしょうか（共通関数の <C>nsIdHex</C> が使えます）。</P>
      </Task>

      {/* ---------- 演習4 ---------- */}
      <Task no={4} title="更新と、差分のしくみ" stars={3} chapters={[7]} done={tp.done('md-t4')} onDone={tp.on('md-t4')}>
        <Example title="同じキーに、登録し直す">
          <Mission label="問題">
            新しいキーに、値 <C>draft</C> を登録して、同じキーに、値 <C>published</C> を登録し直してください。読み取った値が <C>published</C> になっていることと、2つのトランザクションに残っている、サイズの差分（<C>sizeDelta</C>）を確かめます。
          </Mission>
          <P><strong>解き方</strong></P>
          <Box component="ol" sx={{ my: 0.5, pl: 3, lineHeight: 1.95 }}>
            <Li>キーは、<C>randomName()</C> で新しくします。そうしないと、1回目の登録が、すでにある値の更新になって、差分が分かりにくくなります。</Li>
            <Li>同じキー・同じ作成者に、<C>announceMeta</C> をもう一度実行します。関数の中で、いま登録されている値を調べて、サイズの差分と差分データを作っています（7.1 の v3 のコードと同じです{ver === 'v2' ? '。v2 では、MetadataTransactionService が、同じことをしています' : ''}）。</Li>
            <Li>承認されたトランザクションの、アグリゲートの中のメタデータ登録トランザクションに、<C>valueSizeDelta</C> が入っています。<C>draft</C> は 5 バイト、<C>published</C> は 9 バイトなので、1回目は 5、2回目は 9 - 5 = 4 です。</Li>
          </Box>
          <Pick ver={ver} v2={<Code code={d.e4V2} />} v3={<Code code={d.e4V3} />} />
          <P><C>published</C> と、<C>5 4</C> が表示されます。値は上書きされますが、ブロックチェーンには、登録と更新の<strong>トランザクションが、すべて残ります</strong>。</P>
        </Example>
        <PracticeHead />
        <Mission>
          差分データのしくみを、自分で作って確かめます。さらに、同じキーに、長さの違う値を、続けて登録してください。
        </Mission>
        <Ul>
          <Li><C>makeDiff(oldBytes, newBytes)</C>: 差分データを作ります。古い値と新しい値（どちらも <C>Uint8Array</C>）を、バイトごとに XOR して、<C>Uint8Array</C> を返します。長さの足りないほうは、足りない部分を 0 として扱います。結果の長さは、長いほうの長さです。</Li>
          <Li><C>applyDiff(oldBytes, diff, newSize)</C>: 差分データを、古い値に当てはめて、新しい値（<C>Uint8Array</C>）を求めます。<C>newSize</C> は、新しい値のバイト数で、その長さに切り詰めます。</Li>
          <Li>キー <C>docKey = 'doc_' + randomName()</C> に、alice 自身の値として、<C>'abc'</C>、<C>'abcdefgh'</C>、<C>'xy'</C> の順に、3回登録します。それぞれ承認を待って、トランザクションの <C>valueSizeDelta</C> を、順に、配列 <C>deltas</C> に入れます。最後に読み取った値を <C>finalValue</C> に入れます。</Li>
          <Li>上の「共通関数の準備」を、先に実行しておきます。</Li>
        </Ul>
        <Fold title="ヒント">
          <P>XOR は <C>^</C> です。足りない部分を 0 にするには、<C>oldBytes[i] ?? 0</C> のように書けます。同じ値を、2回 XOR すると、元に戻ります（<C>a ^ b ^ b</C> は <C>a</C>）。3回の登録では、<C>for...of</C> で値を順に取り出して、承認されたトランザクションから、例題の④と同じ方法で、<C>valueSizeDelta</C> を取り出します。7.1 の「symbol-sdk v3.2.1 まで」の折りたたみに、差分データを作るコードがあります。</P>
        </Fold>
        <Fold title="解答例（まず自分で試してから開きましょう）">
          <Code code={d.t4Func} />
          <Pick ver={ver} v2={<Code code={d.t4V2b} />} v3={<Code code={d.t4V3b} />} />
          <P>差分データは、古い値と新しい値を XOR したものです。古い値にもう一度 XOR すると、新しい値に戻ります。短くなるときは、<C>sizeDelta</C> が負になるので、その長さに切り詰めます。ノードは、いま記録している値に、差分データを当てはめて、新しい値を求めています。</P>
          <P><C>deltas</C> は <C>[3, 5, -6]</C> になります（0 → 3、3 → 8、8 → 2 バイト）。<strong>登録し直しても、トランザクションの履歴は、すべて残る</strong>ので、いつ、誰が、どう書き換えたかは、あとから調べられます。ただし、いま読み取れるのは、いちばん新しい値だけです。</P>
        </Fold>
        <P>答え合わせ。解答例と同じ関数名・変数名を使っています。</P>
        <Code code={d.t4Check} />
        <P>発展: 新しい値が、いまの値と同じ長さで、中身だけが違う場合（たとえば <C>'abc'</C> から <C>'abd'</C>）の、<C>sizeDelta</C> と、差分データ（<C>makeDiff</C> の結果）は、どうなるでしょうか。計算して、予想してから、確かめてみましょう。</P>
      </Task>

      {/* ---------- 演習5 ---------- */}
      <Task no={5} title="資格証明を発行して、検証する" stars={3} chapters={[7]} done={tp.done('md-t5')} onDone={tp.on('md-t5')}>
        <Example title="卒業証明を、メタデータとして発行する">
          <Mission label="問題">
            大学（alice）が、学生（bob）のアカウントに、卒業証明（キー <C>degree</C>、値 <C>BSc 2026</C>）を、メタデータとして発行してください。そのあと、検証者として、大学が発行した卒業証明を読み取ります。さらに、作成者を絞らずに検索して、作成者のアドレスも確かめます。
          </Mission>
          <P><strong>解き方</strong></P>
          <Box component="ol" sx={{ my: 0.5, pl: 3, lineHeight: 1.95 }}>
            <Li>発行者（作成者）は大学の alice、記録先は学生の bob です。bob の連署が必要です（演習2）。<C>announceMeta('account', bob, 'degree', 'BSc 2026', alice)</C> で、発行します。</Li>
            <Li>検証者は、「学生のアカウントに、<strong>大学のアドレスを作成者として</strong>登録された <C>degree</C>」を探します。<C>readMeta</C> の作成者に、大学を指定します。</Li>
            <Li>作成者を絞らずに検索すると、見つかった各メタデータに、作成者のアドレス（<C>sourceAddress</C>）が入っています。</Li>
          </Box>
          <Pick ver={ver} v2={<Code code={d.e5V2} />} v3={<Code code={d.e5V3} />} />
          <P><C>BSc 2026</C> と、作成者のアドレスと値の組が、表示されます。7.5「有資格証明」のとおり、<strong>信頼できる発行者が付与したメタデータ</strong>であることが、証明の根拠になります。</P>
        </Example>
        <PracticeHead />
        <Mission>
          偽の発行者が、同じキーでメタデータを付けても、本物の発行者の証明だけを、取り出せることを確かめてください。
        </Mission>
        <Ul>
          <Li>大学 <C>univ</C>（alice を使います）、学生 <C>student</C>、偽の発行者 <C>faker</C> を用意します。<C>student</C> と <C>faker</C> は新しく作って、<C>faker</C> には、alice から XYM 1 を送ります（手数料のためです）。</Li>
          <Li><C>univ</C> が、<C>student</C> に、キー <C>'degree'</C>・値 <C>'BSc 2026'</C> を発行します。<C>faker</C> も、同じキー <C>'degree'</C> で、値 <C>'PhD 2026'</C> を発行します（どちらも、<C>student</C> の連署が必要です）。</Li>
          <Li>関数 <C>verifyCredential(holder, issuerAddress, keyName)</C> を作ります。<C>holder</C> は学生の <C>Account</C>、<C>issuerAddress</C> は、<strong>発行者のアドレス（文字列）</strong>、<C>keyName</C> はキー名です。学生のアカウントの <C>keyName</C> のメタデータのうち、作成者が <C>issuerAddress</C> のものの値（文字列）を返します。なければ <C>undefined</C> を返します。作成者は、検索の条件に入れず、見つかった結果から、関数の中で、選び出します。</Li>
          <Li>大学のアドレスで検証した結果を <C>byUniv</C>、偽の発行者のアドレスで検証した結果を <C>byFaker</C>、何も登録していない別のアカウント <C>stranger</C>（新しく作ります）のアドレスで検証した結果を <C>byStranger</C> に入れます。</Li>
          <Li>上の「共通関数の準備」を、先に実行しておきます。</Li>
        </Ul>
        <Fold title="ヒント">
          <P>検索の条件には、記録先（<C>targetAddress</C>）、キー（<C>scopedMetadataKey</C>）、種類（アカウントなら 0）を入れます。結果の各メタデータの作成者は、{ver === 'v2' ? <><C>metadataEntry.sourceAddress.plain()</C> で、アドレスの文字列になります。</> : <><C>sourceAddress</C>（16進数）を、共通関数の <C>hexToAddress</C> で、アドレスの文字列にします。値（<C>value</C>）は16進数なので、文字列に戻します（演習2の <C>readMeta</C> と同じです）。</>} 作成者が <C>issuerAddress</C> のものを、<C>find</C> で探します。</P>
        </Fold>
        <Fold title="解答例（まず自分で試してから開きましょう）">
          <Pick ver={ver}
            v2={<><Code code={d.t5V2a} /><Code code={d.t5V2b} /></>}
            v3={<><Code code={d.t5V3a} /><Code code={d.t5V3b} /></>}
          />
          <P>偽の発行者 <C>faker</C> も、同じキー <C>degree</C> で、学生のアカウントにメタデータを付けられます（学生が連署すれば、成立してしまいます）。メタデータの存在だけでは、本物の証明とは言えません。</P>
          <P>だから、検証者は、<strong>発行者のアドレスを、自分で決めて指定します</strong>。大学が公表しているアドレス（第6章のネームスペースや、信頼できるドメインで裏づけます）で絞れば、偽の発行者の値は、取り出されません。<C>byFaker</C> に値が入っているのは、「<C>faker</C> のアドレスを指定すれば、<C>faker</C> の値が返る」という、検証関数の動きを確かめるためで、信用してよいという意味ではありません。</P>
        </Fold>
        <P>答え合わせ。解答例と同じ変数名を使っています。</P>
        <Code code={d.t5Check} />
        <P>発展: 大学が、学生の卒業証明の値を、あとから書き換える（更新する）には、誰の署名が必要でしょうか。<C>announceMeta('account', student, 'degree', 'MSc 2028', univ)</C> を実行して、<C>byUniv</C> が、新しい値になることを確かめましょう。更新できてしまうことは、注意事項（更新には、発行者と登録先の署名が必要で、それらの管理状態が信用できる場合のみ使う）と、つながります。</P>
      </Task>

      <H>5.4 設計演習</H>
      <P>最後は、コードを書かない演習です。メタデータは、1024 バイトまでの Key-Value で、あとから更新でき、作成者ごとに値が分かれます。使い方を決める前に、「何を載せるか」と、「誰の値を信用するか」を考えられることが大切です。</P>
      <H3>メタデータの設計</H3>
      <Mission>
        次の6つの場面で、どう設計するか、何に注意するかを考えてください。1つずつ考えてから、解答例を開きます。
      </Mission>
      <Box component="ol" sx={{ my: 0.5, pl: 3, lineHeight: 1.95 }}>
        <Li>商品券（モザイク）に、利用できる店舗や、有効期限の説明を付けたい。どこに、どう登録するか。誰の署名が必要か。</Li>
        <Li>大学が、卒業生のアカウントに、卒業証明を発行する。企業は、その証明を検証する。企業は、何を確かめるべきか。</Li>
        <Li>商品の詳細な説明（長い文章や、画像）を、メタデータで管理したい。値が 1024 バイトに収まらないとき、どうするか。</Li>
        <Li>複数のアプリや、複数の担当者が、同じアカウントに、メタデータを登録する。キーが、ぶつからないように、どう決めるか。</Li>
        <Li>メタデータは、あとから更新できる。証明や記録として使うときに、どんなリスクがあるか。どう対策するか。</Li>
        <Li>氏名や住所などの個人情報を、メタデータに、そのまま載せてよいか。</Li>
      </Box>
      <Fold title="解答例（まず自分で考えてから開きましょう）">
        <Ul>
          <Li><strong>1.</strong> モザイクのメタデータとして、モザイクを作成したアカウントが登録します（7.2。作成者の署名が必要です）。キーは、用途ごとに分けます（たとえば <C>shops</C>・<C>valid_until</C>）。値は 1024 バイトまでなので、長い説明は、外部のページの URL を載せます。更新できるので、内容が書き換わる前提で、読み取る側は、作成者（発行者）のアドレスを確かめます。</Li>
          <Li><strong>2.</strong> 企業は、メタデータが存在するだけでは、信用できません。「学生のアカウントに、<strong>大学が公表しているアドレスを作成者として</strong>登録された値」かを確かめます（演習5）。大学のアドレスは、第6章のネームスペースや、実社会で信頼できるドメインとのリンクで裏づけます（7.5）。さらに、学生が、そのアカウントを本当に持っていること（所有証明）も、確かめます。</Li>
          <Li><strong>3.</strong> 値は 1024 バイトまでです。長い文章や画像は、外部に保存して、その URL と、内容のハッシュ値を、メタデータに載せます。読み取った人は、ハッシュ値を使って、内容が書き換えられていないかを、確かめられます。どうしてもブロックチェーンに載せたい場合は、複数のキーに分けて登録する方法もあります。ただし、手数料と、扱いの手間が増えます。</Li>
          <Li><strong>4.</strong> メタデータは、キーと作成者のペアで、1件が決まります（7.2）。作成者が違えば、同じキーでも、別の値です。ぶつからないようにするには、キーに、アプリ名や用途の接頭辞を付けます（たとえば <C>myapp_degree</C>）。読み取るときは、作成者のアドレスも条件に入れて、誰の値かを、はっきりさせます。同じ作成者が、同じキーを、別の意味で使うと、更新になって、前の値が見えなくなるので、キーの命名ルールを、あらかじめ決めておきます。</Li>
          <Li><strong>5.</strong> 更新には、発行者アカウントと登録先アカウントの署名が必要です。そのため、どちらかの秘密鍵が漏れたり、悪意のある人の手に渡ったりすると、値を書き換えられます（注意事項）。対策として、発行者のアカウントを、マルチシグ（第9章）にして、複数人で管理します。証明として使うときは、トランザクションのハッシュを控えておくと、「いつ登録された値か」を、あとから、トランザクションで確かめられます。いま読み取れるのは、いちばん新しい値だけです。</Li>
          <Li><strong>6.</strong> 載せないほうがよいです。ブロックチェーンのデータは、誰でも読めて、あとから消せません（トランザクションの履歴が残ります）。個人情報は、ブロックチェーンの外に保存して、メタデータには、内容のハッシュ値や、参照用の ID だけを載せます。どうしても載せるなら、暗号化して載せますが、鍵の管理と、将来の安全性を、よく考える必要があります。</Li>
        </Ul>
        <P>場面によって、複数の答えが考えられることもあります。ご自身の考えと違っても、「何が、なぜ必要か」を説明できれば、間違いではありません。</P>
      </Fold>

      <H>5.5 振り返り</H>
      <P>第7章の各節と、この章の問題の対応です。間違えた問題や、解けなかった演習は、対応する節を読み返しましょう。</P>
      <Ul>
        <Li><strong>7.1 アカウントに登録</strong>: 問1〜問5・問8、演習1・演習2・演習4・演習5、設計演習の問4</Li>
        <Li><strong>7.2 モザイクに登録</strong>: 問6・問7、演習3、設計演習の問1</Li>
        <Li><strong>7.3 ネームスペースに登録</strong>: 問6、演習3</Li>
        <Li><strong>7.4 確認</strong>: 問9、演習2・演習3・演習5</Li>
        <Li><strong>注意事項</strong>: 問10、演習5、設計演習の問5</Li>
        <Li><strong>7.5 現場で使えるヒント</strong>（有資格証明・DID）: 演習5、設計演習の問2・問3・問6</Li>
      </Ul>
      <P>メタデータを理解できたら、本編の第8章（ロック）に進みましょう。</P>
    </>
  );
}
