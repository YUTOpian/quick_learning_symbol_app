import { useEffect, useState } from 'react';
import { Alert, Box, Button, Chip, Typography } from '@mui/material';
import { Code, H, H3, P } from './ui';
import { C, Example, Fold, Li, Mission, Pick, PracticeHead, QuizCard, Task, Ul } from './exUi';
import type { Ver } from './Ch02';
import { prepV2, prepV3 } from './ch15/code';
import { statusPrepV2, statusPrepV3 } from './ex02/code';
import * as d from './ex03/code';
import { QUIZZES } from './ex03/quiz';
import { loadEx, saveEx } from './profile';
import type { ExState } from './profile';

const TASK_IDS = ['mo-t1', 'mo-t2', 'mo-t3', 'mo-t4', 'mo-t5'];

// 速習Symbol: 演習編 第3章 モザイク。本編 第5章（モザイク）の内容を、クイズとハンズオンで確かめる。
export default function Ex03({ ver, profile }: { ver: Ver; profile: number }) {
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
      <P>この章は、本編の<strong>第5章 モザイク</strong>に対応する演習です。第5章では、モザイクの定義（フラグ・可分性・有効期限）、供給量の変更、アグリゲートによる生成、モザイクの送信、NFT やポイント運用のヒントを学びました。ここでは、それらを自分の手で使い、理解を確かめます。</P>
      <P>モザイクは、XYM を含む「数量を持つもの」すべてを表す仕組みです。ここで扱う、可分性と整数の関係、4つのフラグ、供給量のルールは、あとの章（メタデータ、制限、マルチシグなど）でも前提になります。</P>

      <H>3.1 この章の進め方</H>
      <P>この章は、次の4つで構成されています。</P>
      <Ul>
        <Li><strong>3.2 確認クイズ</strong>（全{QUIZZES.length}問）: 選択式です。回答するとすぐに解説が表示されます。</Li>
        <Li><strong>3.3 ハンズオン演習</strong>（全{TASK_IDS.length}題）: コンソールで実際にコードを書いて動かします。各演習には、解き方を示した<strong>例題</strong>が付いています。</Li>
        <Li><strong>3.4 設計演習</strong>: コードは書かずに、場面ごとに「どう設計するか」を考えます。</Li>
        <Li><strong>3.5 振り返り</strong>: 第5章の各節と、この章の問題の対応表です。</Li>
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
        <Li>詰まったら「ヒント」を開きます。ヒントには、見直すとよい第5章の節を書いてあります。</Li>
        <Li>最後に「解答例」を開いて、自分のコードと見比べます。解答例のコードは、選択中のSDKバージョンのほうだけが表示されます。</Li>
        <Li>各演習の最後にある「答え合わせ」のコードを実行して、✅ が表示されたら「できた」にチェックを入れます。</Li>
        <Li>クイズの回答と「できた」のチェックは、このプロファイルに保存されます。</Li>
      </Ul>

      <H3>前提</H3>
      <Ul>
        <Li>環境構築（第2章）が済んでいて、第3章で作成した <C>alice</C> を使います。モザイクを作るときには、トランザクション手数料のほかに、<strong>モザイクのレンタル料</strong>がかかります（メインネットの標準は 0.5 XYM 程度で、ネットワークの状況で変わります）。演習2〜5で、モザイクを数個作るので、alice には<strong>10 XYM以上</strong>あると安心です。足りなければ、第3章のFAUCETで補充してください。</Li>
        <Li>トランザクションが承認されるまで、30秒ほどかかります。モザイクを作る演習（演習2〜5）は、実行してから結果が出るまで、1分〜数分ほど待つことがあります。コードの実行中は、そのまま待ってください。</Li>
        <Li>ページを再読み込みすると、コンソールの変数はすべて消えます。演習1〜5は、それぞれ単独で取り組めます（モザイクは、各演習で新しく作ります）。</Li>
        <Li>この章で作るアカウント（bob・carol など）は、テストネットの練習用です。変数名は、ブラウザがもともと持っている名前（<C>status</C> や <C>name</C> など）と重ならないようにしてあります。自分でコードを書くときも、気をつけてください。</Li>
        <Li>モザイクは、一度作ると、フラグや可分性を変えられません。練習用のモザイクが増えていきますが、テストネットなので、そのままにして構いません。</Li>
      </Ul>

      <H3>共通関数の準備</H3>
      <P>演習2〜5では、モザイクの作成や送信、承認待ちなどを、関数にまとめて使います。最初に、次の3つを1度ずつ実行しておいてください。ページを再読み込みしたときは、もう一度実行します。</P>
      <P><strong>① 待つための関数（第1章と同じものです。実行済みなら、もう一度実行する必要はありません）</strong></P>
      <Pick ver={ver} v2={<Code code={prepV2} />} v3={<Code code={prepV3} />} />
      <P><strong>② ステータスを調べる関数（演習編 第2章と同じものです。演習4・5で使います）</strong></P>
      <Pick ver={ver} v2={<Code code={statusPrepV2} />} v3={<Code code={statusPrepV3} />} />
      <P><strong>③ モザイクを扱う関数</strong>（<C>announceTx</C>・<C>makeMosaic</C>・<C>getMosaicInfo</C>・<C>sendMosaics</C>）。本編 第5章のコードを、関数にまとめたものです。まず実行して、そのあとで、中身を読んでみてください。第5章のコードと、見比べられます。</P>
      <Pick ver={ver} v2={<Code code={d.toolsV2} />} v3={<Code code={d.toolsV3} />} />
      <P><C>makeMosaic</C> には、次の項目を指定できます（省略すると、右のとおりです）。<C>divisibility</C>（0）・<C>supply</C>（0）・<C>supplyMutable</C>（false）・<C>transferable</C>（true）・<C>restrictable</C>（false）・<C>revokable</C>（false）・<C>duration</C>（0）。供給量 <C>supply</C> は、可分性を考えた<strong>整数</strong>で指定します。</P>

      <H>3.2 確認クイズ</H>
      <P>第5章の内容から、全{QUIZZES.length}問を出題します。回答するとすぐに正誤と解説が表示されます。間違えた問題は、解説の内容を、第5章の本文で確かめましょう。</P>
      {QUIZZES.map((q, i) => (
        <QuizCard key={`${q.id}-${st.quiz[q.id] === undefined ? 'open' : 'done'}`} q={q} no={i + 1} answered={st.quiz[q.id]} onAnswer={(a) => answer(q.id, a)} />
      ))}
      {answered === QUIZZES.length && (
        <Alert severity={correct === QUIZZES.length ? 'success' : 'info'} sx={{ mt: 2 }}
          action={<Button color="inherit" size="small" onClick={() => setSt((s) => ({ ...s, quiz: Object.fromEntries(Object.entries(s.quiz).filter(([k]) => !QUIZZES.some((q) => q.id === k))) }))}>やり直す</Button>}>
          {correct === QUIZZES.length ? `全問正解です（${correct} / ${QUIZZES.length}）。` : `${correct} / ${QUIZZES.length} 問正解でした。間違えた問題の解説を読んで、もう一度挑戦してみましょう。`}
        </Alert>
      )}

      <H>3.3 ハンズオン演習</H>
      <P>ここからは、コンソールで実際に動かす演習です。難易度は ★ の数で表しています。どの演習も、最初に解き方つきの例題があり、そのあとに練習問題があります。例題のコードは、そのままコンソールで実行できます。</P>

      {/* ---------- 演習1 ---------- */}
      <Task no={1} title="数量とフラグは、整数で持つ" stars={1} chapters={[5]} done={tp.done('mo-t1')} onDone={tp.on('mo-t1')}>
        <Example title="フラグの値と、可分性による数量を確かめる">
          <Mission label="問題">
            「供給量変更○・譲渡×・制限○・回収○」のモザイクフラグを作って、その値を表示してください。また、可分性 2 のモザイクで、1.00 個を表す整数も求めます。どちらも、アナウンスはしません。
          </Mission>
          <P><strong>解き方</strong></P>
          <Box component="ol" sx={{ my: 0.5, pl: 3, lineHeight: 1.95 }}>
            <Li>4つの可否を指定して、モザイクフラグを作ります（5.1「モザイクフラグ」）。v2 は <C>MosaicFlags.create</C> で作って <C>getValue()</C> で値を取り出します。v3 は、各フラグの値を足して <C>MosaicFlags</C> を作ります。</Li>
            <Li>可分性が 2 のとき、1.00 を表す整数は、<C>1 × 10<sup>2</sup></C> です（5.1「divisibility」）。</Li>
          </Box>
          <Pick ver={ver} v2={<Code code={d.e1V2} />} v3={<Code code={d.e1V3} />} />
          <P><C>13</C> と <C>100</C> が表示されれば成功です。フラグの値は、有効なフラグに対応した値（供給量変更 1・譲渡 2・制限 4・回収 8）の合計です。数量は、可分性の分だけ、整数に直して扱います。</P>
        </Example>
        <PracticeHead />
        <Mission>
          画面に出す数とブロックチェーンの整数を行き来する関数と、フラグの値を分解する関数を、作ってください。
        </Mission>
        <Ul>
          <Li><C>toRaw(text, divisibility)</C>: 画面に出す数（文字列）を、整数（数値）にします。<C>toRaw('1.25', 2)</C> は <C>125</C>、<C>toRaw('0.1', 6)</C> は <C>100000</C>、<C>toRaw('3', 0)</C> は <C>3</C> です。小数点以下の桁が、可分性より多いときは、エラーにします。</Li>
          <Li><C>fromRaw(raw, divisibility)</C>: 整数を、画面に出す数（文字列）にします。<C>fromRaw(125, 2)</C> は <C>'1.25'</C>、<C>fromRaw(5, 2)</C> は <C>'0.05'</C>、<C>fromRaw(100, 2)</C> は <C>'1.00'</C>、<C>fromRaw(7, 0)</C> は <C>'7'</C> です。</Li>
          <Li><C>decodeFlags(value)</C>: フラグの値を、<C>supplyMutable</C>・<C>transferable</C>・<C>restrictable</C>・<C>revokable</C> の4つの真偽値を持つオブジェクトにします。<C>decodeFlags(13)</C> は、<C>supplyMutable</C>・<C>restrictable</C>・<C>revokable</C> が <C>true</C>、<C>transferable</C> が <C>false</C> です。</Li>
        </Ul>
        <Fold title="ヒント">
          <P>小数のかけ算（<C>1.15 * 100</C> など）は、<C>114.99999999999999</C> のように、誤差が出ることがあります。お金や数量の計算では、文字列のまま、整数部と小数部に分けて、組み立てるほうが安全です。<C>padEnd</C> と <C>padStart</C> が使えます。フラグの分解は、ビット演算 <C>&amp;</C> が便利です（<C>13 &amp; 4</C> が 0 でなければ、制限が有効）。</P>
        </Fold>
        <Fold title="解答例（まず自分で試してから開きましょう）">
          <Code code={d.t1Func} />
          <P>数量は、ブロックチェーンの中では、すべて整数です。可分性は、「画面に出すときに、小数点をどこに置くか」の決まりにすぎません。そのため、アプリでは、表示と送信のたびに、この換算が必要になります。小数のまま計算すると誤差が出るので、文字列や整数（<C>BigInt</C>）で扱うのが、安全です。</P>
          <P>フラグも、整数1つに、4つの設定がまとまっています。エクスプローラーなどでフラグの値だけが表示されていても、1・2・4・8 の合計だと分かれば、読み取れます。</P>
        </Fold>
        <P>答え合わせ。解答例と同じ関数名を使っています。</P>
        <Code code={d.t1Check} />
        <P>発展: <C>toRaw('1.255', 2)</C> を実行して、エラーになることを確かめましょう。可分性より細かい数量は、指定できません。</P>
      </Task>

      {/* ---------- 演習2 ---------- */}
      <Task no={2} title="モザイクを定義して、供給量を変える" stars={2} chapters={[5]} done={tp.done('mo-t2')} onDone={tp.on('mo-t2')}>
        <Example title="モザイクの定義と供給量の設定を、1つにまとめる">
          <Mission label="問題">
            可分性 2・供給量 100.00 のモザイクを作ってください。モザイクの定義と供給量の設定は、1つのアグリゲートトランザクションにまとめます。承認されたら、モザイクの情報を表示して、供給量などを確かめます。
          </Mission>
          <P><strong>解き方</strong></P>
          <Box component="ol" sx={{ my: 0.5, pl: 3, lineHeight: 1.95 }}>
            <Li>モザイクを定義します。ナンス（乱数）とアカウントから、モザイクIDが決まります。可分性は 2、有効期限は 0（無期限）にします（5.1）。</Li>
            <Li>供給量を増やす（<C>Increase</C>）トランザクションを作ります。可分性が 2 なので、100.00 は整数で <C>10000</C> です。</Li>
            <Li>2つを、1つのアグリゲートトランザクションにまとめて、署名・アナウンスします。モザイクはまだ存在していませんが、アグリゲートの中では、前から順に処理されるので、問題ありません（5.1）。</Li>
            <Li>承認されたら、共通関数の <C>getMosaicInfo</C> で、情報を確かめます。</Li>
          </Box>
          <Pick ver={ver} v2={<Code code={d.e2V2} />} v3={<Code code={d.e2V3} />} />
          <P>モザイクID（16進数）と、<C>supply: '10000'</C>・<C>divisibility: 2</C>・<C>duration: '0'</C>・<C>flags: 3</C>（供給量変更 1 + 譲渡 2）が表示されます。供給量も整数で記録されているので、画面には 100.00 と出したいときは、演習1の <C>fromRaw</C> のように、換算します。</P>
        </Example>
        <PracticeHead />
        <Mission>
          供給量変更が有効なモザイクを作って、供給量を、単独のトランザクションで増やしたり減らしたりしてください。
        </Mission>
        <Ul>
          <Li>可分性 0・供給量 100・供給量変更○のモザイクを、共通関数の <C>makeMosaic</C> で作ります。モザイクIDを <C>supplyId</C> に入れます。</Li>
          <Li>そのモザイクの供給量を、50 増やしてから、30 減らします。それぞれ、承認されるまで待ちます。</Li>
          <Li>最後に、モザイクの情報を <C>supplyInfo</C> に入れて、供給量を確かめます。</Li>
          <Li>上の「共通関数の準備」を、先に実行しておきます。</Li>
        </Ul>
        <Fold title="ヒント">
          <P>供給量の変更には、供給量変更トランザクション（<C>MosaicSupplyChange</C>）を使います。増やすときは <C>Increase</C>、減らすときは <C>Decrease</C> を指定します（5.1「MosaicSupplyChangeAction」）。例題と違い、アグリゲートにはせず、1つずつ、署名・アナウンスして、承認を待ちます。<C>announceTx</C> と <C>waitConfirmed</C> を組み合わせると、短く書けます。</P>
        </Fold>
        <Fold title="解答例（まず自分で試してから開きましょう）">
          <Pick ver={ver} v2={<Code code={d.t2V2} />} v3={<Code code={d.t2V3} />} />
          <P>100 + 50 - 30 で、供給量は 120 になります。供給量変更が有効（<C>supplyMutable: true</C>）なモザイクは、あとから増やすことも、減らすことも、できます。ただし、減らす量は、発行者が持っている量までです。</P>
          <P>この演習では、供給量変更を、定義とは別のトランザクションで送りました。これは、モザイクがすでに存在していて、そのあとに供給量を変えたい場合の、普通のやり方です。</P>
        </Fold>
        <P>答え合わせ。解答例と同じ変数名を使っています。</P>
        <Code code={d.t2Check} />
        <P>発展: 供給量変更が無効（<C>supplyMutable: false</C>）のモザイクを作って、供給量を変更してみましょう。発行者が全数量を持っている間は、変更できます。bob に一部を送ったあとは、変更が失敗します。演習5で、実際に確かめます。</P>
      </Task>

      {/* ---------- 演習3 ---------- */}
      <Task no={3} title="複数のモザイクを、整数で送る" stars={2} chapters={[5]} done={tp.done('mo-t3')} onDone={tp.on('mo-t3')}>
        <Example title="可分性 2 のモザイクを、1.50 個送る">
          <Mission label="問題">
            可分性 2・供給量 100.00 のモザイクを作って、bob へ 1.50 を送ってください。承認されたら、bob の所有量を確かめます。
          </Mission>
          <P><strong>解き方</strong></P>
          <Box component="ol" sx={{ my: 0.5, pl: 3, lineHeight: 1.95 }}>
            <Li>共通関数の <C>makeMosaic</C> で、可分性 2・供給量 <C>10000</C>（100.00）のモザイクを作ります。</Li>
            <Li>送信量は、小数点もすべて整数にして指定します。可分性 2 なので、1.50 は <C>150</C> です（5.2「送信量」）。<C>sendMosaics</C> で、bob へ送ります。</Li>
            <Li>承認されたら、共通関数の <C>getAmount</C> で、bob の所有量を調べます。</Li>
          </Box>
          <Pick ver={ver} v2={<Code code={d.e3V2} />} v3={<Code code={d.e3V3} />} />
          <P><C>'150'</C> と表示されます。所有量も、送信量と同じく、整数で返ってきます。</P>
        </Example>
        <PracticeHead />
        <Mission>
          2種類のモザイクと XYM を、1つの転送トランザクションで、まとめて送ってください。
        </Mission>
        <Ul>
          <Li>モザイクを2つ作ります。<C>pointId</C>（可分性 0・供給量 1000）と、<C>coinId</C>（可分性 3・供給量 5000000。つまり 5000.000）です。</Li>
          <Li>bob へ、XYM 0.5・<C>pointId</C> 25・<C>coinId</C> 1.234 を、<strong>1つの転送トランザクション</strong>で送ります。ハッシュを <C>sendHash</C> に、承認された転送トランザクションを <C>sentTx</C> に入れます。</Li>
          <Li>bob の所有量を、<C>amounts</C>（<C>xym</C>・<C>point</C>・<C>coin</C> の3つを持つオブジェクト。値は、<C>getAmount</C> が返す文字列のまま）にまとめます。</Li>
          <Li>テストネットの XYM のモザイクIDは <C>72C0212E67A08BCE</C> です。上の「共通関数の準備」を、先に実行しておきます。</Li>
        </Ul>
        <Fold title="ヒント">
          <P>5.2「送信モザイクリスト」のとおり、複数のモザイクを一度に送れます。量は、それぞれの可分性に合わせて、整数にします。XYM は可分性 6 なので 0.5 は <C>500000</C>、<C>coinId</C> は可分性 3 なので 1.234 は <C>1234</C> です。<C>sendMosaics</C> は、<C>[[モザイクID, 量], ...]</C> のリストを受け取ります。</P>
        </Fold>
        <Fold title="解答例（まず自分で試してから開きましょう）">
          <Pick ver={ver} v2={<Code code={d.t3V2} />} v3={<Code code={d.t3V3} />} />
          <P>3種類のモザイクが、1つのトランザクション、1回の手数料で送られます。数量は、モザイクごとに可分性が違うので、換算が必要です。取り違えると、1000倍の桁違いになります。</P>
          <P>なお、送信モザイクリストは、<strong>モザイクIDの小さい順</strong>に並べる必要があります（並べ替えていないと、ノードに拒否されることがあります）。共通関数の <C>sendMosaics</C> は、関数の中で並べ替えているので、指定する順番は、自由です。</P>
        </Fold>
        <P>答え合わせ。解答例と同じ変数名を使っています。</P>
        <Pick ver={ver} v2={<Code code={d.t3CheckV2} />} v3={<Code code={d.t3CheckV3} />} />
        <P>発展: <C>amounts.coin</C> を、演習1の <C>fromRaw</C> で、<C>fromRaw(amounts.coin, 3)</C> のように変換して、<C>'1.234'</C> と表示されることを確かめましょう。</P>
      </Task>

      {/* ---------- 演習4 ---------- */}
      <Task no={4} title="回収できるポイントを運用する" stars={3} chapters={[5]} done={tp.done('mo-t4')} onDone={tp.on('mo-t4')}>
        <Example title="送ったモザイクを、相手の署名なしで回収する">
          <Mission label="問題">
            回収可能（<C>revokable</C>）なモザイクを作って、bob へ 10 送ってください。そのあと、alice が bob から 4 を回収して、bob の所有量を確かめます。
          </Mission>
          <P><strong>解き方</strong></P>
          <Box component="ol" sx={{ my: 0.5, pl: 3, lineHeight: 1.95 }}>
            <Li>回収可（<C>revokable: true</C>）のモザイクを、<C>makeMosaic</C> で作り、bob へ 10 送ります。</Li>
            <Li>発行者の alice が、モザイク回収トランザクションを作ります。回収先（bob のアドレス）と、モザイクIDと数量を指定します（5.3「回収可能なポイント運用」）。</Li>
            <Li>署名するのは alice だけです。bob の署名は、要りません。</Li>
          </Box>
          <Pick ver={ver} v2={<Code code={d.e4V2} />} v3={<Code code={d.e4V3} />} />
          <P><C>'6'</C> と表示されます。モザイクを回収できるのは、発行者だけです。ユーザーの秘密鍵を預からなくても、使用分を回収できます。</P>
        </Example>
        <PracticeHead />
        <Mission>
          ポイント運用を、通して試してください。ポイントは、「譲渡できない」「発行者が回収できる」モザイクです。
        </Mission>
        <Ul>
          <Li>可分性 0・供給量 10000 のポイント <C>pointId</C> を、譲渡不可（<C>transferable: false</C>）・回収可（<C>revokable: true</C>）で作ります。</Li>
          <Li>alice から bob へ、ポイント 100 と、手数料のための XYM 1 を送ります。承認まで待ちます。</Li>
          <Li>bob から carol へ、ポイント 5 を送ってみます（bob が署名します）。ステータスを調べて、<C>statusNg</C> に入れます。</Li>
          <Li>alice が、bob からポイント 30 を回収します。bob のポイントの所有量を、<C>amountBob</C>（文字列）に入れます。</Li>
          <Li>上の「共通関数の準備」を、先に実行しておきます。<C>bob</C> と <C>carol</C> は、新しいアカウントを作ります。</Li>
        </Ul>
        <Fold title="ヒント">
          <P>譲渡不可のモザイクは、第三者に送れません（5.3）。bob から carol への送信は、アナウンスは受理されても、承認されずに失敗します（演習編 第2章の演習3）。結果は、ステータスで確かめます。bob が手数料を払えるように、XYM を送っておくことが大切です。回収は、例題のコードを使います。</P>
        </Fold>
        <Fold title="解答例（まず自分で試してから開きましょう）">
          <Pick ver={ver}
            v2={<><Code code={d.t4V2a} /><Code code={d.t4V2b} /><Code code={d.t4V2c} /></>}
            v3={<><Code code={d.t4V3a} /><Code code={d.t4V3b} /><Code code={d.t4V3c} /></>}
          />
          <P>③では、bob から carol への送信が <C>failed</C> になります。<C>code</C> には、多くの場合 <C>Failure_Mosaic_Non_Transferable</C> が表示されます。譲渡不可のモザイクは、発行者とのあいだでしか動かせません。つまり、ユーザー同士での転売ができません。</P>
          <P>④では、bob の署名なしで、alice が 30 を回収できます。100 - 30 で、bob の所有量は 70 になります。ポイントを使った分を回収する、という運用に使えます。</P>
          <P>ただし、回収できる権限は、強い権限です。回収可のモザイクは、受け取る側から見ると、「あとから取り上げられるかもしれない」モザイクです。使い道を、利用者に説明できる範囲で、設計します。</P>
        </Fold>
        <P>答え合わせ。解答例と同じ変数名を使っています。</P>
        <Code code={d.t4Check} />
        <P>発展: bob から alice（発行者）へ、ポイントを送り返してみましょう。譲渡不可でも、発行者宛てなら、送れるはずです。</P>
      </Task>

      {/* ---------- 演習5 ---------- */}
      <Task no={5} title="NFT の数量は、「全部持っている間」は変えられる" stars={3} chapters={[5]} done={tp.done('mo-t5')} onDone={tp.on('mo-t5')}>
        <Example title="NFT を作って、データを記録する">
          <Mission label="問題">
            1つだけのトークン（NFT）を作ってください。モザイクの定義（供給量変更×・可分性 0）、供給量 1、NFT のデータを記録する転送トランザクションを、1つのアグリゲートにまとめます。承認されたら、供給量と、記録された NFT データを確かめます。
          </Mission>
          <P><strong>解き方</strong></P>
          <Box component="ol" sx={{ my: 0.5, pl: 3, lineHeight: 1.95 }}>
            <Li>供給量変更を無効（<C>supplyMutable: false</C>）、可分性 0 で、モザイクを定義します（5.3「NFT」）。</Li>
            <Li>供給量を 1 にするトランザクションと、NFT データを平文メッセージにして alice 自身に送る転送トランザクションを作ります。</Li>
            <Li>3つを、1つのアグリゲートにまとめて、アナウンスします。モザイクの生成と NFT データが、同じブロックに記録されます。</Li>
            <Li>承認されたら取得して、メッセージを表示します。v3 のメッセージは、先頭にメッセージタイプが付いた16進数文字列なので、先頭の1バイトを除いて、文字に戻します。</Li>
          </Box>
          <Pick ver={ver} v2={<Code code={d.e5V2} />} v3={<Code code={d.e5V3} />} />
          <P>供給量 <C>'1'</C> と、NFT データが表示されます。モザイクの情報には、生成されたブロックの高さと、作成したアカウントが記録されています。同じブロックのトランザクションを探せば、NFT のデータにたどりつけます。</P>
        </Example>
        <PracticeHead />
        <Mission>
          供給量変更を無効にした、供給量 1 のモザイク（NFT）は、本当に、数量が固定されているのでしょうか。2つの場合で、試してください。
        </Mission>
        <Ul>
          <Li><strong>①</strong> NFT <C>nftId</C>（可分性 0・供給量 1・供給量変更×）を作ります。alice が持っているまま、供給量を 1 増やしてみます。そのあとの供給量を、<C>supplyAfter</C> に入れます。</Li>
          <Li><strong>②</strong> 別の NFT <C>nft2Id</C> を作って、bob に送ります。そのあと alice が、供給量を 1 増やしてみます。ステータスを <C>statusNg</C> に、そのあとの供給量を <C>supplyKept</C> に入れます。</Li>
          <Li>供給量は、<C>getMosaicInfo</C> で確かめます。上の「共通関数の準備」を、先に実行しておきます。</Li>
        </Ul>
        <Fold title="ヒント">
          <P>5.3「注意事項」と、5.1 の「<C>supplyMutable:false</C> の場合、全モザイクが発行者にある場合だけ数量の変更が可能です」を、もう一度読み返してください。①では、alice が全数量を持っています。②では、bob に渡したので、alice は全数量を持っていません。供給量の変更は、例題や演習2のコード（<C>MosaicSupplyChange</C>）を使います。</P>
        </Fold>
        <Fold title="解答例（まず自分で試してから開きましょう）">
          <Pick ver={ver}
            v2={<><Code code={d.t5V2a} /><Code code={d.t5V2b} /></>}
            v3={<><Code code={d.t5V3a} /><Code code={d.t5V3b} /></>}
          />
          <P>①では、供給量変更を無効にしていても、供給量が 2 になります。発行者が全数量を持っている間は、数量を変えられるからです。これでは、「1つしかない」とは言えません。</P>
          <P>②では、bob に渡したあとなので、供給量の変更が <C>failed</C> になります。<C>code</C> には、多くの場合 <C>Failure_Mosaic_Supply_Immutable</C> が表示されます。供給量は 1 のままです。</P>
          <P>NFT を、「1つしかない」ものとして運用するには、発行したら、すぐに、保有者に渡す（または、発行者の秘密鍵を管理・破棄する）などの運用が必要です。5.3 の注意事項のとおり、トランザクションに分割して記録したデータは、改ざんできませんが、追記は可能な点にも、注意してください。</P>
        </Fold>
        <P>答え合わせ。解答例と同じ変数名を使っています。</P>
        <Code code={d.t5Check} />
        <P>発展: 5.3 では、モザイクにメタデータ（第7章）を登録する方法にも触れています。メタデータは、登録したアカウントとモザイク作成者の連署で更新できます。NFT のデータを、トランザクションに記録する方法と、メタデータに登録する方法とで、どちらが、あとから変えられにくいか、考えてみましょう。</P>
      </Task>

      <H>3.4 設計演習</H>
      <P>最後は、コードを書かない演習です。モザイクは、一度作ると、フラグも可分性も変えられません。作る前に、「何のために、どう使うか」から、設定を決められることが大切です。</P>
      <H3>モザイクの設計</H3>
      <Mission>
        次の7つの場面で、どう設計するか、何に注意するかを考えてください。1つずつ考えてから、解答例を開きます。
      </Mission>
      <Box component="ol" sx={{ my: 0.5, pl: 3, lineHeight: 1.95 }}>
        <Li>社内の「感謝ポイント」を作りたい。社員同士のポイントの売買はさせたくない。退職したら、残ったポイントは回収したい。フラグは、どう設定するか。</Li>
        <Li>イベントの会員証（1人1枚）を発行したい。譲渡は、してよい。どう設計するか。</Li>
        <Li>「1ポイント = 1円」のポイントで、銭（0.01円）の単位まで扱いたい。可分性は、いくつにするか。あとから変えられるか。</Li>
        <Li>期間限定のクーポンを発行したい。有効期限は、どう設定するか。期限が切れたら、モザイクは消えるか。大量に発行するとき、何に注意するか。</Li>
        <Li>モザイクを発行したあとで、「やっぱり、発行数を増やしたい」となるかもしれない。供給量変更は、有効にするか。それとも、無効にするか。</Li>
        <Li>モザイクの定義と、最初の供給量の設定は、別々のトランザクションで送ってもよいか。まとめるとしたら、何がよいか。</Li>
        <Li>ユーザーに、XYM と自作のポイントを、同時に送りたい。送信量は、どう指定するか。テストネットとメインネットで、何が違うか。</Li>
      </Box>
      <Fold title="解答例（まず自分で考えてから開きましょう）">
        <Ul>
          <Li><strong>1.</strong> 譲渡を無効（<C>transferable: false</C>）にして、ユーザー同士の転売を防ぎます。回収を有効（<C>revokable: true</C>）にして、発行者が、ユーザーの秘密鍵なしで、残ったポイントを回収できるようにします（5.3）。数量を増やす運用があるなら、供給量変更も有効にします。フラグは、あとから変えられないので、はじめに決めておきます。</Li>
          <Li><strong>2.</strong> 発行数を 1、供給量変更を無効、可分性を 0 にします（NFT。5.3）。譲渡は有効にします。ただし、発行者が全数量を持っている間は、数量を変えられてしまうので（演習5）、渡したあとに、運用を固めます。会員証が1人1枚なら、人数分のモザイクを作る方法と、1つのモザイクを人数分の数量にする方法があります。</Li>
          <Li><strong>3.</strong> 銭の単位（0.01）まで扱うので、可分性は 2 で足ります。余裕を見て、もう少し大きくしてもかまいません。可分性は、<strong>あとから変えられません</strong>（5.1）。細かすぎても、画面に出す換算が面倒になります。細かい単位が必要になる場面を、あらかじめ、考えておきます。</Li>
          <Li><strong>4.</strong> 有効期限は、ブロックの数で指定します。期限が切れても、モザイクのデータは消えず、残ります（5.1）。ただし、期限が切れたモザイクは、使えなくなります。また、1つのアカウントが所有できるモザイクは、1000 までです。期限切れのモザイクが、そのまま残るので、大量に発行するときは、上限に、注意が必要です。</Li>
          <Li><strong>5.</strong> 増やす可能性があるなら、有効にします。ただし、有効にすると、発行者はあとからいつでも増やせる（信用が下がる）ことになります。無効にしても、発行者が全数量を持っている間は変えられる（演習5）ので、「増えない」と言い切るには、配ったあとであること、または、秘密鍵の管理が必要です。「あとから増やせる」ことと、「増えないことの信頼」は、トレードオフです。</Li>
          <Li><strong>6.</strong> 別々に送ることもできますが、定義だけが承認されて、供給量の設定が失敗する、半端な状態が起こりえます。アグリゲートトランザクションにまとめると、すべて成功するか、すべて失敗するかの、どちらかです（5.1。第4章の演習4）。まだ存在していないモザイクの数量を、同じアグリゲートの中で変更できる点が、ポイントです。</Li>
          <Li><strong>7.</strong> 送信モザイクリストに、XYM とポイントを並べて、1つの転送トランザクションで送れます（5.2）。量は、モザイクごとの可分性に合わせた整数です（XYM は 1 XYM = 1000000）。XYM のモザイクIDは、メインネットが <C>6BED913FA20223F8</C>、テストネットが <C>72C0212E67A08BCE</C> です。ネットワークを切り替えるときに、IDを取り違えないよう、注意します。リストは、ID順に並べます。</Li>
        </Ul>
        <P>場面によって、複数の答えが考えられることもあります。ご自身の考えと違っても、「何が、なぜ必要か」を説明できれば、間違いではありません。</P>
      </Fold>

      <H>3.5 振り返り</H>
      <P>第5章の各節と、この章の問題の対応です。間違えた問題や、解けなかった演習は、対応する節を読み返しましょう。</P>
      <Ul>
        <Li><strong>5.1 モザイク生成</strong>: 問1〜問6、演習1・演習2・演習5、設計演習の問1・問3・問4・問5・問6</Li>
        <Li><strong>5.2 モザイク送信</strong>: 問7・問8、演習3、設計演習の問7</Li>
        <Li><strong>5.3 現場で使えるヒント</strong>: 問6・問9・問10、演習4・演習5、設計演習の問1・問2・問5</Li>
      </Ul>
      <P>モザイクを理解できたら、本編の第6章（ネームスペース）に進みましょう。</P>
    </>
  );
}
