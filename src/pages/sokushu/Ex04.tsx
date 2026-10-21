import { useEffect, useState } from 'react';
import { Alert, Box, Button, Chip, Typography } from '@mui/material';
import { Code, H, H3, P } from './ui';
import { C, Example, Fold, Li, Mission, Pick, PracticeHead, QuizCard, Task, Ul } from './exUi';
import type { Ver } from './Ch02';
import { prepV2, prepV3 } from './ch15/code';
import { statusPrepV2, statusPrepV3 } from './ex02/code';
import { toolsV2 as mosaicToolsV2, toolsV3 as mosaicToolsV3 } from './ex03/code';
import * as d from './ex04/code';
import { QUIZZES } from './ex04/quiz';
import { loadEx, saveEx } from './profile';
import type { ExState } from './profile';

const TASK_IDS = ['ns-t1', 'ns-t2', 'ns-t3', 'ns-t4', 'ns-t5'];

// 速習Symbol: 演習編 第4章 ネームスペース。本編 第6章（ネームスペース）の内容を、クイズとハンズオンで確かめる。
export default function Ex04({ ver, profile }: { ver: Ver; profile: number }) {
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
      <P>この章は、本編の<strong>第6章 ネームスペース</strong>に対応する演習です。第6章では、ネームスペースの手数料の計算、ルート・サブネームスペースのレンタル、アドレスやモザイクへのリンク、未解決での使用、参照とレシート、現場で使えるヒントを学びました。ここでは、それらを自分の手で使い、理解を確かめます。</P>
      <P>ネームスペースは、アドレスやモザイクに、読みやすい名前を付ける仕組みです。ただし、<strong>レンタル制</strong>で、リンク先は付け替えられます。「名前が、いつ、何を指していたか」を、あとから確かめる方法（レシート）は、実務でも大切になります。</P>

      <H>4.1 この章の進め方</H>
      <P>この章は、次の4つで構成されています。</P>
      <Ul>
        <Li><strong>4.2 確認クイズ</strong>（全{QUIZZES.length}問）: 選択式です。回答するとすぐに解説が表示されます。</Li>
        <Li><strong>4.3 ハンズオン演習</strong>（全{TASK_IDS.length}題）: コンソールで実際にコードを書いて動かします。各演習には、解き方を示した<strong>例題</strong>が付いています。</Li>
        <Li><strong>4.4 設計演習</strong>: コードは書かずに、場面ごとに「どう設計するか」を考えます。</Li>
        <Li><strong>4.5 振り返り</strong>: 第6章の各節と、この章の問題の対応表です。</Li>
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
        <Li>詰まったら「ヒント」を開きます。ヒントには、見直すとよい第6章の節を書いてあります。</Li>
        <Li>最後に「解答例」を開いて、自分のコードと見比べます。解答例のコードは、選択中のSDKバージョンのほうだけが表示されます。</Li>
        <Li>各演習の最後にある「答え合わせ」のコードを実行して、✅ が表示されたら「できた」にチェックを入れます。</Li>
        <Li>クイズの回答と「できた」のチェックは、このプロファイルに保存されます。</Li>
      </Ul>

      <H3>前提</H3>
      <Ul>
        <Li>環境構築（第2章）が済んでいて、第3章で作成した <C>alice</C> を使います。</Li>
        <Li><strong>ネームスペースのレンタルには、レンタル手数料がかかり、取り消せません。</strong>本編 第6章の例（ルートネームスペース 1ブロックあたり 200 μXYM、サブネームスペース 10 XYM）で計算すると、30日分のルートネームスペースが約 17 XYM、サブネームスペースが 10 XYM です。実際の単価は、演習1の例題で調べられます。</Li>
        <Li>各演習で、新しい名前をレンタルします。必要な XYM の目安は、演習2が約 65 XYM、演習3が約 45 XYM、演習4が約 45 XYM、演習5が約 18 XYM です（演習1は不要です）。全部に取り組むなら、alice に <strong>200 XYM 以上</strong>あると安心です。足りなければ、第3章のFAUCETで補充してください。</Li>
        <Li>ネームスペースは、レンタルのたびに、承認を待ちます（30秒ほど）。演習3・5は、承認を待つ回数が多いので、通して数分かかります。コードの実行中は、そのまま待ってください。</Li>
        <Li>ページを再読み込みすると、コンソールの変数はすべて消えます。演習1〜5は、それぞれ単独で取り組めます（名前は、各演習で新しくレンタルします）。</Li>
        <Li>レンタルしたネームスペースは、30日で期限が切れます。練習用なので、そのままにして構いません。</Li>
        <Li>この章で作るアカウント（bob・carol など）は、テストネットの練習用です。変数名は、ブラウザがもともと持っている名前（<C>status</C>・<C>name</C>・<C>parent</C> など）と重ならないようにしてあります。自分でコードを書くときも、気をつけてください。</Li>
      </Ul>

      <H3>共通関数の準備</H3>
      <P>演習2〜5では、ネームスペースの登録やリンクなどを、関数にまとめて使います。最初に、次の4つを1度ずつ実行しておいてください。ページを再読み込みしたときは、もう一度実行します。</P>
      <P><strong>① 待つための関数（第1章と同じものです。実行済みなら、もう一度実行する必要はありません）</strong></P>
      <Pick ver={ver} v2={<Code code={prepV2} />} v3={<Code code={prepV3} />} />
      <P><strong>② ステータスを調べる関数（演習編 第2章と同じものです。演習2・3で使います）</strong></P>
      <Pick ver={ver} v2={<Code code={statusPrepV2} />} v3={<Code code={statusPrepV3} />} />
      <P><strong>③ モザイクを扱う関数（演習編 第3章と同じものです）</strong>（<C>announceTx</C>・<C>makeMosaic</C>・<C>getMosaicInfo</C>・<C>sendMosaics</C>）。トランザクションの署名・アナウンスと、モザイクの作成・送信に使います。</P>
      <Pick ver={ver} v2={<Code code={mosaicToolsV2} />} v3={<Code code={mosaicToolsV3} />} />
      <P><strong>④ ネームスペースを扱う関数</strong>（<C>randomName</C>・<C>nsIdHex</C>・<C>announceNamespace</C>・<C>registerNamespace</C>・<C>getNsInfo</C>・<C>announceAliasAddress</C>・<C>announceAliasMosaic</C>{ver === 'v3' ? <>・<C>hexToAddress</C></> : null}）。本編 第6章のコードを、関数にまとめたものです。まず実行して、そのあとで、中身を読んでみてください。第6章のコードと、見比べられます。</P>
      <Pick ver={ver} v2={<Code code={d.toolsV2} />} v3={<Code code={d.toolsV3} />} />
      <Ul>
        <Li><C>randomName()</C>: 他の人と重ならない名前を作ります。ルートネームスペースは、早い者勝ちで、同じ名前を重複して取得できないためです。</Li>
        <Li><C>announceNamespace(path, days)</C>・<C>registerNamespace(path, days)</C>: <C>path</C> は、<C>'xembook'</C> や <C>'xembook.tomato'</C> のように、ドットでつないだ名前です。ドットがなければルート（<C>days</C> 日分。省略すると30日）、あればサブです。前者はアナウンスだけ（ハッシュを返す）、後者は承認まで待ちます。</Li>
        <Li><C>announceAliasAddress(path, address, link)</C>・<C>announceAliasMosaic(path, idHex, link)</C>: アドレス・モザイクへのリンクのトランザクションをアナウンスして、ハッシュを返します。<C>link</C> を <C>false</C> にすると、リンクの解除になります。</Li>
        <Li><C>getNsInfo(path)</C>: ネームスペースの階層の数（<C>depth</C>）、ルートかサブか（<C>registrationType</C>。0 がルート、1 がサブ）、終了ブロック高、リンク先（<C>aliasType</C>。0 がなし、1 がモザイク、2 がアドレス）を返します。</Li>
      </Ul>

      <H>4.2 確認クイズ</H>
      <P>第6章の内容から、全{QUIZZES.length}問を出題します。回答するとすぐに正誤と解説が表示されます。間違えた問題は、解説の内容を、第6章の本文で確かめましょう。</P>
      {QUIZZES.map((q, i) => (
        <QuizCard key={`${q.id}-${st.quiz[q.id] === undefined ? 'open' : 'done'}`} q={q} no={i + 1} answered={st.quiz[q.id]} onAnswer={(a) => answer(q.id, a)} />
      ))}
      {answered === QUIZZES.length && (
        <Alert severity={correct === QUIZZES.length ? 'success' : 'info'} sx={{ mt: 2 }}
          action={<Button color="inherit" size="small" onClick={() => setSt((s) => ({ ...s, quiz: Object.fromEntries(Object.entries(s.quiz).filter(([k]) => !QUIZZES.some((q) => q.id === k))) }))}>やり直す</Button>}>
          {correct === QUIZZES.length ? `全問正解です（${correct} / ${QUIZZES.length}）。` : `${correct} / ${QUIZZES.length} 問正解でした。間違えた問題の解説を読んで、もう一度挑戦してみましょう。`}
        </Alert>
      )}

      <H>4.3 ハンズオン演習</H>
      <P>ここからは、コンソールで実際に動かす演習です。難易度は ★ の数で表しています。どの演習も、最初に解き方つきの例題があり、そのあとに練習問題があります。例題のコードは、そのままコンソールで実行できます。</P>

      {/* ---------- 演習1 ---------- */}
      <Task no={1} title="名前・期間・手数料を、計算で確かめる" stars={1} chapters={[6]} done={tp.done('ns-t1')} onDone={tp.on('ns-t1')}>
        <Example title="30日分のレンタル手数料を計算する">
          <Mission label="問題">
            いまのネットワークの、ネームスペースのレンタル手数料の単価を取得して、ルートネームスペース30日分の手数料（XYM）と、サブネームスペース1つの手数料を表示してください。レンタルはしません。
          </Mission>
          <P><strong>解き方</strong></P>
          <Box component="ol" sx={{ my: 0.5, pl: 3, lineHeight: 1.95 }}>
            <Li>ネットワークから、レンタル手数料の単価を取得します。ルートネームスペースは「1ブロックあたり」、サブネームスペースは「1つあたり」の金額です（6.1「手数料の計算」）。</Li>
            <Li>期間はブロック数で指定します。1ブロックを30秒として、30日分は <C>30 × 24 × 60 × 60 ÷ 30</C> ブロックです。</Li>
            <Li>ルートネームスペースの手数料は、<C>ブロック数 × 1ブロックあたりの手数料</C> です。単位は μXYM なので、XYM にするときは、1000000 で割ります。</Li>
          </Box>
          <Pick ver={ver} v2={<Code code={d.e1V2} />} v3={<Code code={d.e1V3} />} />
          <P><C>rentalBlock: 86400</C> と、ルート30日分・サブ1つの手数料が、XYM で表示されます。金額は、ネットワークの活性度で変わるので、レンタルの前には、必ず確認します。</P>
        </Example>
        <PracticeHead />
        <Mission>
          ネームスペースの名前・期間・手数料を、確かめる関数を、作ってください。
        </Mission>
        <Ul>
          <Li><C>isValidNsName(name)</C>: ネームスペースの名前として使えるなら <C>true</C>、使えないなら <C>false</C> を返します。1〜64文字で、使える文字は <C>a-z</C>・<C>0-9</C>・<C>_</C>・<C>-</C> です。<C>isValidNsName('xembook')</C> は <C>true</C>、<C>isValidNsName('Xembook')</C>（大文字）や <C>isValidNsName('a.b')</C>（ドット）は <C>false</C> です。</Li>
          <Li><C>toBlocks(days)</C>: 日数を、期間（ブロック数）にします。<C>toBlocks(30)</C> は <C>86400</C>、<C>toBlocks(365)</C> は <C>1051200</C> です。30日より短い、または1825日より長いときは、エラーを投げます。</Li>
          <Li><C>calcRootFee(days, perBlock)</C>: ルートネームスペースの手数料の合計（μXYM）を返します。<C>perBlock</C> は、1ブロックあたりの手数料（μXYM）です。<C>calcRootFee(365, 200)</C> は <C>210240000</C> です。</Li>
        </Ul>
        <Fold title="ヒント">
          <P>名前の判定は、正規表現 <C>/^[a-z0-9_-]{'{1,64}'}$/</C> と <C>test()</C> で書けます。期間の上限・下限は、第6章 6.1 の「最低で30日分」「最大で1825日分」です。エラーは <C>throw new Error('...')</C> で投げます。</P>
        </Fold>
        <Fold title="解答例（まず自分で試してから開きましょう）">
          <Code code={d.t1Func} />
          <P>期間を日数ではなく、ブロック数で指定することと、手数料が、期間に比例して増えることを、関数にして確かめました。サブネームスペースは、期間の指定がなく、手数料も固定です。そのため、「サブをたくさん作る」ほうが、「ルートを長く借りる」より、費用がかさむことがあります（設計演習の問2）。</P>
          <P>なお、第6章に書かれている条件は、文字の種類と長さです。実際のレンタルでは、ほかにも、ノードが拒否する条件があるので、最後は、ステータスで確かめます。</P>
        </Fold>
        <P>答え合わせ。解答例と同じ関数名を使っています。</P>
        <Code code={d.t1Check} />
        <P>発展: 演習1の例題で調べた単価（<C>perBlock</C>）を使って、<C>calcRootFee(1825, perBlock)</C> を計算してみましょう。5年分のレンタルで、いくらになるでしょうか。</P>
      </Task>

      {/* ---------- 演習2 ---------- */}
      <Task no={2} title="ルートとサブをレンタルして、有効期限を調べる" stars={2} chapters={[6]} done={tp.done('ns-t2')} onDone={tp.on('ns-t2')}>
        <Example title="ルートネームスペースとサブネームスペースを作る">
          <Mission label="問題">
            ルートネームスペースを30日分レンタルして、そのあと、サブネームスペース <C>○○○.shop</C> をレンタルしてください。承認されたら、2つの情報を取得して、ルートかサブか、何階層か、終了ブロック高を確かめます。
          </Mission>
          <P><strong>解き方</strong></P>
          <Box component="ol" sx={{ my: 0.5, pl: 3, lineHeight: 1.95 }}>
            <Li>他の人と重ならないように、共通関数の <C>randomName()</C> で名前を作ります。ルートネームスペースのレンタルは、名前と期間（ブロック数）を指定します。30日分は <C>86400</C> ブロックです（6.2「レンタル」）。</Li>
            <Li>サブネームスペースは、名前と、親のネームスペースを指定します。期間は指定しません。親（ルート）が、先に承認されている必要があります。</Li>
            <Li>共通関数の <C>getNsInfo</C> で、情報を確かめます。ルートは階層が 1、サブは 2 です。サブの終了ブロック高は、ルートと同じです。</Li>
          </Box>
          <Pick ver={ver} v2={<Code code={d.e2V2} />} v3={<Code code={d.e2V3} />} />
          <P><C>0 1</C>（ルート・1階層）、<C>1 2</C>（サブ・2階層）、<C>true</C>（終了ブロック高が同じ）と表示されます。サブネームスペースは、ルートの期限と、一緒に終わります。</P>
        </Example>
        <PracticeHead />
        <Mission>
          ネームスペースを3階層まで作って、有効期限を調べてください。また、すでに存在する名前を取得しようとすると、どうなるかも、確かめます。
        </Mission>
        <Ul>
          <Li>ルートネームスペース <C>shopRoot</C>（<C>randomName()</C> で作った名前）と、その下の <C>shopRoot.tokyo</C>、さらにその下の <C>shopRoot.tokyo.cafe</C> を、レンタルします。共通関数の <C>registerNamespace</C> が使えます。<C>shopRoot.tokyo.cafe</C> の情報を <C>cafeInfo</C> に入れます。</Li>
          <Li>すでに存在する名前の、ルートネームスペース <C>'symbol'</C> を、<C>announceNamespace</C> で取得してみます（alice が署名します）。ステータスを調べて、<C>statusTaken</C> に入れます。</Li>
          <Li>ルートネームスペース <C>shopRoot</C> の有効期限を、<C>Date</C> として求める関数 <C>getEndDate(path)</C> を作って、結果を <C>endDate</C> に入れます。</Li>
          <Li>上の「共通関数の準備」を、先に実行しておきます。<C>sleep</C> と <C>getStatus</C> も使います。</Li>
        </Ul>
        <Fold title="ヒント">
          <P>6.2「有効期限の計算」のとおり、ネームスペース情報の終了ブロック高から、現在のブロック高を引いた「残りブロック数」に、30秒（平均ブロック生成間隔）を掛けて、最新ブロックの時刻に足します。ブロックの時刻は、ネットワークの開始時刻（<C>epochAdjustment</C>）からの経過ミリ秒です。ステータスの調べ方は、演習編 第3章の演習4と同じです（<C>getStatus</C> を、承認か失敗になるまで繰り返します）。</P>
        </Fold>
        <Fold title="解答例（まず自分で試してから開きましょう）">
          <Pick ver={ver}
            v2={<><Code code={d.t2V2a} /><Code code={d.t2V2b} /><Code code={d.t2V2c} /></>}
            v3={<><Code code={d.t2V3a} /><Code code={d.t2V3b} /><Code code={d.t2V3c} /></>}
          />
          <P>①では、ルート・1階層目・2階層目のサブネームスペースを、順に作りました。<C>cafeInfo.depth</C> は 3、<C>registrationType</C> は 1（サブ）です。ネームスペースは、ルートを含めて、<strong>3階層まで</strong>です。サブネームスペースは、1つ作るたびに、サブの手数料がかかります（ここでは 2つで 20 XYM ほどです）。</P>
          <P>②では、ステータスが <C>failed</C> になります。<C>code</C> には、すでに存在する名前であることなどを示すコードが入ります。ルートネームスペースは、重複して取得できません。だから、名前に、ブランド価値が出ます（6.6）。</P>
          <P>③の有効期限は、約30日後です。レンタルを延長するときの目安になります。テストネットでは、設定した有効期限より、1日ほど更新期限に猶予があります。メインネットでは、この猶予が30日です。</P>
        </Fold>
        <P>答え合わせ。解答例と同じ変数名を使っています。</P>
        <Code code={d.t2Check} />
        <P>発展: サブネームスペース <C>shopRoot.tokyo</C> の終了ブロック高（<C>(await getNsInfo(shopRoot + '.tokyo')).endHeight</C>）を調べて、ルートと同じ値になっていることを確かめましょう。</P>
      </Task>

      {/* ---------- 演習3 ---------- */}
      <Task no={3} title="アドレスとモザイクにリンクして、付け替える" stars={2} chapters={[6]} done={tp.done('ns-t3')} onDone={tp.on('ns-t3')}>
        <Example title="ネームスペースを、アドレスにリンクする">
          <Mission label="問題">
            ルートネームスペースをレンタルして、新しく作ったアカウント <C>bob</C> のアドレスに、リンクしてください。承認されたら、ネームスペースの情報で、リンク先を確かめます。
          </Mission>
          <P><strong>解き方</strong></P>
          <Box component="ol" sx={{ my: 0.5, pl: 3, lineHeight: 1.95 }}>
            <Li>共通関数の <C>registerNamespace</C> で、ルートネームスペースをレンタルします。</Li>
            <Li>アドレスエイリアストランザクションを作ります。ネームスペースと、リンク先のアドレスと、リンクの操作（<C>Link</C>）を指定します（6.3「アカウントへのリンク」）。リンク先のアドレスは、自分が所有していなくても問題ありません。</Li>
            <Li>承認されたら、<C>getNsInfo</C> で、リンク先を確かめます。</Li>
          </Box>
          <Pick ver={ver} v2={<Code code={d.e3V2} />} v3={<Code code={d.e3V3} />} />
          <P><C>2 true</C> と表示されます。<C>aliasType</C> が 2 なので、アドレスにリンクしていて、そのアドレスが、bob のアドレスです。</P>
        </Example>
        <PracticeHead />
        <Mission>
          リンク先を、付け替えてください。また、リンクできないケースも、2つ確かめます。
        </Mission>
        <Ul>
          <Li>ルートネームスペース <C>aliasRoot</C> と、サブネームスペース <C>aliasRoot.coin</C> を、レンタルします。<C>bob</C> と <C>carol</C> を新しく作り、共通関数の <C>makeMosaic</C> で、可分性 0・供給量 1000 のモザイクを作って、モザイクIDを <C>coinId</C> に入れます。</Li>
          <Li><C>aliasRoot</C> を、bob のアドレスにリンクします。そのまま、carol のアドレスにもリンクしてみます。ステータスを調べて、<C>statusDup</C> に入れます。</Li>
          <Li>bob とのリンクを解除して、carol にリンクし直します。ネームスペースの情報を、<C>rootInfo</C> に入れます。</Li>
          <Li><C>aliasRoot.coin</C> を、XYM のモザイク（<C>72C0212E67A08BCE</C>）にリンクしてみます。ステータスを <C>statusXym</C> に入れます。そのあと、<C>coinId</C> のモザイクにリンクします。<C>aliasRoot.coin</C> の情報を、<C>coinInfo</C> に入れます。</Li>
          <Li>上の「共通関数の準備」を、先に実行しておきます。リンクには、共通関数の <C>announceAliasAddress</C> と <C>announceAliasMosaic</C> を使います。</Li>
        </Ul>
        <Fold title="ヒント">
          <P>6.3 の注意事項を、もう一度読み返してください。リンクは、ネームスペース1つにつき、1つのリンク先です。リンクを解除するときは、共通関数の第3引数 <C>link</C> を <C>false</C> にして、リンクしているアドレスを、そのまま指定します。モザイクへのリンクは、「モザイクを作成したアドレスと同一の場合のみ」です。XYM のモザイクは、alice が作ったものではありません。失敗を確かめるときの、ステータスの調べ方は、演習2と同じです。</P>
        </Fold>
        <Fold title="解答例（まず自分で試してから開きましょう）">
          <Pick ver={ver}
            v2={<><Code code={d.t3V2a} /><Code code={d.t3V2b} /><Code code={d.t3V2c} /><Code code={d.t3V2d} /></>}
            v3={<><Code code={d.t3V3a} /><Code code={d.t3V3b} /><Code code={d.t3V3c} /><Code code={d.t3V3d} /></>}
          />
          <P>④では、リンク中のネームスペースに、別のアドレスをリンクしようとして、<C>failed</C> になります。リンク先を変えるときは、<strong>いったんリンクを解除してから</strong>、リンクし直します。解除のときも、いま、リンクしているアドレスを指定します。</P>
          <P>⑥では、XYM のモザイクに、リンクできません。モザイクにリンクできるのは、モザイクを作成したアドレスと、ネームスペースの所有者が同じ場合です。⑦では、alice 自身が作ったモザイクなので、リンクできました。</P>
          <P>名前のリンク先は、このように、あとから付け替えられます。名前が指す先は、「いま」のものだと、考えておきます。</P>
        </Fold>
        <P>答え合わせ。解答例と同じ変数名を使っています。</P>
        <Pick ver={ver} v2={<Code code={d.t3CheckV2} />} v3={<Code code={d.t3CheckV3} />} />
        <P>発展: <C>aliasRoot.coin</C> を、モザイクからリンク解除して（<C>announceAliasMosaic(aliasRoot + '.coin', coinId, false)</C>）、<C>coinInfo</C> の <C>aliasType</C> が 0 に戻ることを確かめましょう。</P>
      </Task>

      {/* ---------- 演習4 ---------- */}
      <Task no={4} title="名前のまま送る（未解決で使用）" stars={3} chapters={[6]} done={tp.done('ns-t4')} onDone={tp.on('ns-t4')}>
        <Example title="送信先も、モザイクも、名前で指定して送る">
          <Mission label="問題">
            ネームスペースを bob のアドレスにリンクして、送信先をそのネームスペース、送信するモザイクを <C>symbol.xym</C> として、XYM 0.1 を送ってください。承認されたら、bob の XYM の所有量を確かめます。
          </Mission>
          <P><strong>解き方</strong></P>
          <Box component="ol" sx={{ my: 0.5, pl: 3, lineHeight: 1.95 }}>
            <Li>ルートネームスペースをレンタルして、bob のアドレスにリンクします（演習3）。</Li>
            <Li>転送トランザクションの送信先に、アドレスではなく、ネームスペース（UnresolvedAccount）を指定します（6.4「未解決で使用」）。v3 では、ネームスペースIDから、<C>Address.fromNamespaceId</C> で、未解決のアドレスを作ります。</Li>
            <Li>送信モザイクにも、モザイクIDではなく、ネームスペース（UnresolvedMosaic）を指定します。XYM は、<C>symbol.xym</C> という名前で指定できます。0.1 XYM は、可分性 6 なので、<C>100000</C> です（演習編 第3章）。</Li>
            <Li>アドレスは、チェーン側が、承認のときに解決します。承認されたら、<C>getAmount</C> で、bob の所有量を確かめます。</Li>
          </Box>
          <Pick ver={ver} v2={<Code code={d.e4V2} />} v3={<Code code={d.e4V3} />} />
          <P><C>'100000'</C> と表示されます。アドレスもモザイクIDも、書かずに、名前だけで送れました。</P>
        </Example>
        <PracticeHead />
        <Mission>
          アドレスとモザイクの両方を、名前で指定して、1つの転送トランザクションで、XYM と自作のポイントを送ってください。
        </Mission>
        <Ul>
          <Li>ルートネームスペース <C>payRoot</C> と、サブネームスペース <C>payRoot.point</C> を、レンタルします。</Li>
          <Li><C>bob</C> を新しく作ります。共通関数の <C>makeMosaic</C> で、可分性 0・供給量 10000 のポイントを作り、モザイクIDを <C>pointId</C> に入れます。<C>payRoot</C> を bob のアドレスに、<C>payRoot.point</C> を <C>pointId</C> に、リンクします。</Li>
          <Li>alice から、送信先 <C>payRoot</C>（名前）へ、XYM 0.2（<C>symbol.xym</C>）とポイント 50（<C>payRoot.point</C>）を、<strong>1つの転送トランザクション</strong>で送ります。ハッシュを <C>payHash</C> に入れて、承認まで待ちます。</Li>
          <Li>bob の所有量を、<C>amountsBob</C>（<C>xym</C>・<C>point</C> の2つを持つオブジェクト。値は <C>getAmount</C> が返す文字列のまま）にまとめます。</Li>
          <Li>テストネットの XYM のモザイクIDは <C>72C0212E67A08BCE</C> です。上の「共通関数の準備」を、先に実行しておきます。</Li>
        </Ul>
        <Fold title="ヒント">
          <P>送信モザイクは、モザイクIDの小さい順に並べる必要があります（演習編 第3章の演習3）。名前（ネームスペースID）で指定するときも同じで、ネームスペースIDの数値の小さい順です。共通関数の <C>sendMosaics</C> は、渡された <C>[ID（16進数）, 量]</C> のリストを、関数の中で並べ替えます。ネームスペースIDの16進数は、<C>nsIdHex('symbol.xym')</C> のように、共通関数で求められます。送信先に渡すのは、v2 では <C>new sym.NamespaceId('名前')</C>、v3 では 例題の <C>Address.fromNamespaceId</C> で作った未解決のアドレスです。</P>
        </Fold>
        <Fold title="解答例（まず自分で試してから開きましょう）">
          <Pick ver={ver}
            v2={<><Code code={d.t4V2a} /><Code code={d.t4V2b} /></>}
            v3={<><Code code={d.t4V3a} /><Code code={d.t4V3b} /></>}
          />
          <P>送信先と、2種類のモザイクを、すべて名前で指定して、1つの転送トランザクション、1回の手数料で送りました。bob の所有量は、XYM が <C>'200000'</C>（0.2 XYM）、ポイントが <C>'50'</C> になります。</P>
          <P>名前で指定すると、アドレスやモザイクIDを、アプリやコードの中に、書かなくて済みます。ただし、<strong>名前の指す先は、承認のときに決まります</strong>。リンク先を、付け替えると、同じ名前で送っても、別のアドレスに届きます。次の演習5で、確かめます。</P>
        </Fold>
        <P>答え合わせ。解答例と同じ変数名を使っています。</P>
        <Code code={d.t4Check} />
        <P>発展: 送信先に、リンクしていないネームスペース（たとえば、まだ借りていない名前）を指定すると、どうなるでしょうか。ステータスを調べて、確かめてみましょう。</P>
      </Task>

      {/* ---------- 演習5 ---------- */}
      <Task no={5} title="リンク先を変えても、過去の送信先はレシートで分かる" stars={3} chapters={[6]} done={tp.done('ns-t5')} onDone={tp.on('ns-t5')}>
        <Example title="レシートで、名前の解決結果を確かめる">
          <Mission label="問題">
            まず、XYM のモザイクIDに、リンクしているネームスペースを、逆引きで調べてください。次に、<C>symbol.xym</C> という名前で、bob へ XYM 0.1 を送って、そのトランザクションが取り込まれたブロックの、モザイクのレシートから、名前が何に解決されたかを確かめます。
          </Mission>
          <P><strong>解き方</strong></P>
          <Box component="ol" sx={{ my: 0.5, pl: 3, lineHeight: 1.95 }}>
            <Li>モザイクにリンクしているネームスペースを、すべて調べるには、モザイクIDを指定して、名前の一覧を取得します（6.5「逆引き」）。</Li>
            <Li>名前を使った転送トランザクションを、承認まで待ちます。取り込まれたブロック高は、承認されたトランザクションの情報にあります。</Li>
            <Li>そのブロック高を指定して、モザイクの解決のレシートを取得します（6.5「レシートの参照」）。レシートには、「名前（未解決）→ 何に解決されたか（解決済み）」の記録が残っています。v3 では、モザイクの場合のURLを使います。</Li>
          </Box>
          <Pick ver={ver} v2={<Code code={d.e5V2} />} v3={<Code code={d.e5V3} />} />
          <P>①で、XYM にリンクしている名前の一覧が表示されて、②のあと、③で <C>72C0212E67A08BCE</C> が表示されます。ブロックチェーンは、名前をどう解決したかを、ブロックごとに記録しています。</P>
        </Example>
        <PracticeHead />
        <Mission>
          リンク先を付け替えたあとでも、過去の送信先を、レシートで確かめられることを、確かめてください。
        </Mission>
        <Ul>
          <Li>ルートネームスペース <C>histRoot</C> をレンタルします。<C>bob</C> と <C>carol</C> を新しく作り、<C>histRoot</C> を bob のアドレスにリンクします。</Li>
          <Li>alice から、送信先 <C>histRoot</C>（名前）へ、XYM 0.1 を送ります（1回目）。取り込まれたブロック高を <C>heightA</C> に入れます。</Li>
          <Li>bob とのリンクを解除して、carol にリンクし直します。もう一度、送信先 <C>histRoot</C> へ、XYM 0.1 を送ります（2回目）。ブロック高を <C>heightB</C> に入れます。</Li>
          <Li>ブロック高と名前から、レシートに残っている「解決先のアドレス（文字列）」を調べる関数 <C>resolvedAt(height, path)</C> を作ります。1回目の解決先を <C>resolvedA</C>、2回目を <C>resolvedB</C> に、いまのリンク先を <C>nowAddress</C> に入れます。</Li>
          <Li>上の「共通関数の準備」を、先に実行しておきます。送信には、共通関数の <C>sendMosaics</C> が使えます。</Li>
        </Ul>
        <Fold title="ヒント">
          <P>6.5「レシートの参照」と、例題を見てください。アドレスの解決のレシートは、v2 では <C>searchAddressResolutionStatements</C>、v3 では アドレス用のURL（<C>/statements/resolutions/address</C>）です。1つのブロックには、ほかの名前のレシートも入っているので、「未解決」の名前が、<C>histRoot</C> のものを、探します。送信先に渡すものは、演習4のヒントを見てください。</P>
        </Fold>
        <Fold title="解答例（まず自分で試してから開きましょう）">
          <Pick ver={ver}
            v2={<><Code code={d.t5V2a} /><Code code={d.t5V2b} /><Code code={d.t5V2c} /></>}
            v3={<><Code code={d.t5V3a} /><Code code={d.t5V3b} /><Code code={d.t5V3c} /></>}
          />
          <P>1回目は、レシートに、bob のアドレスが残っています。2回目は、carol のアドレスです。<C>nowAddress</C>（いまのリンク先）は carol なので、<strong>いまのリンク先を見ても、1回目の送信先は分かりません</strong>。</P>
          <P>名前を使った送金の記録を、帳簿や証跡に残すときは、トランザクションのハッシュと、ブロック高も一緒に残して、あとから、レシートで確かめられるようにします。リンク先を調べるだけでは、不十分です（6.5 の注意事項）。</P>
        </Fold>
        <P>答え合わせ。解答例と同じ変数名を使っています。</P>
        <Pick ver={ver} v2={<Code code={d.t5CheckV2} />} v3={<Code code={d.t5CheckV3} />} />
        <P>発展: 逆引き（6.5）で、carol のアドレスにリンクしているネームスペースを調べて、<C>histRoot</C> が含まれていることを確かめましょう。bob のアドレスのほうは、どうなっているでしょうか。</P>
      </Task>

      <H>4.4 設計演習</H>
      <P>最後は、コードを書かない演習です。ネームスペースは、レンタル制で、リンク先も付け替えられます。使い方を決める前に、「何のために、どう使うか」と、「期限が切れたら、どうなるか」を考えられることが大切です。</P>
      <H3>ネームスペースの設計</H3>
      <Mission>
        次の6つの場面で、どう設計するか、何に注意するかを考えてください。1つずつ考えてから、解答例を開きます。
      </Mission>
      <Box component="ol" sx={{ my: 0.5, pl: 3, lineHeight: 1.95 }}>
        <Li>自社のブランド名と同じ名前のネームスペースを取得して、公式サイトから、そのアカウントを案内したい。何に注意するか。</Li>
        <Li>カフェのチェーン店で、店舗ごとに、受け取り用のアドレスに名前を付けたい（東京店、大阪店、…）。ネームスペースを、どう組み立てるか。費用は、どう増えていくか。</Li>
        <Li>ネームスペースを管理する担当者が、交代する可能性がある。どのアカウントで、取得するか。</Li>
        <Li>名前で送金した記録を、1年後の監査で、「このとき、どのアドレスに送ったか」と、説明する必要がある。何を記録しておくか。</Li>
        <Li>レンタルの期間は、短く借りて、こまめに更新するか。長く借りるか。更新を忘れると、どうなるか。</Li>
        <Li>アプリの画面で、ユーザーが、名前を入力して、送金できるようにしたい。どんなリスクがあるか。どう対策するか。</Li>
      </Box>
      <Fold title="解答例（まず自分で考えてから開きましょう）">
        <Ul>
          <Li><strong>1.</strong> ネームスペースは、重複して取得できないので、インターネットのドメインや、周知された商標名と同じ名前を取得して、外部（公式サイトや印刷物）から、その存在を知らせると、ブランド価値を作れます（6.6）。ただし、法的な効力については、調整が必要です。外部ドメイン側が、ハッキングされたり、Symbol 側で、ネームスペースの更新を忘れたりしたときの影響が大きいので、両方の管理に、気をつけます。</Li>
          <Li><strong>2.</strong> ルートネームスペースに、ブランド名（たとえば <C>mycafe</C>）を取得して、店舗ごとに、サブネームスペース（<C>mycafe.tokyo</C>・<C>mycafe.osaka</C>）を作り、それぞれの店舗のアドレスにリンクします。ルートは、期間に応じた手数料、サブは、1つあたり固定（本編の例では 10 XYM）の手数料です。サブネームスペースは、店舗の数だけ、手数料が増えます。サブは、ルートの期限と、一緒に終わります。階層は、ルートを含めて3階層までです。</Li>
          <Li><strong>3.</strong> 取得したネームスペースは、放棄か延長の選択肢しかありません。担当者が交代する可能性があるなら、個人のアカウントではなく、マルチシグ化（第9章）したアカウントで取得して、複数人で管理するのがおすすめです（6.6）。</Li>
          <Li><strong>4.</strong> ネームスペースは、レンタル制で、リンク先も変わるので、いまのリンク先を見ても、過去のリンク先は分かりません。トランザクションのハッシュと、ブロック高を記録して、必要なときに、レシート（名前がどう解決されたか）を参照します（6.5。演習5）。</Li>
          <Li><strong>5.</strong> 期間は、30日から1825日までで、期間が長いほど、手数料が増えます。短く借りると、更新の手間が増えて、更新を忘れるリスクが高まります。長く借りると、前払いが増えます。期限が切れて、猶予期間（テストネットでは約1日、メインネットでは30日）も過ぎると、他の人が、同じ名前を取得できるようになります。そのため、有効期限を定期的に確認する仕組みが必要です（演習2の <C>getEndDate</C>）。</Li>
          <Li><strong>6.</strong> 名前が指す先は、承認のときに決まるので、入力ミスで、別の（他人の）名前に送ってしまう危険があります。また、期限切れのあと、他の人が同じ名前を取得して、別のアドレスにリンクするかもしれません。高額な送金は、送る前に、いまのリンク先を確認して、画面に表示します。アドレスを直接指定する方法も、用意します。送ったあとは、レシートで、どこに解決されたかを、確かめられるようにします（6.5）。</Li>
        </Ul>
        <P>場面によって、複数の答えが考えられることもあります。ご自身の考えと違っても、「何が、なぜ必要か」を説明できれば、間違いではありません。</P>
      </Fold>

      <H>4.5 振り返り</H>
      <P>第6章の各節と、この章の問題の対応です。間違えた問題や、解けなかった演習は、対応する節を読み返しましょう。</P>
      <Ul>
        <Li><strong>6.1 手数料の計算</strong>: 問2〜問5、演習1、設計演習の問2・問5</Li>
        <Li><strong>6.2 レンタル</strong>: 問1・問3・問5、演習2、設計演習の問2・問5</Li>
        <Li><strong>6.3 リンク</strong>: 問6、演習3</Li>
        <Li><strong>6.4 未解決で使用</strong>: 問7、演習4・演習5、設計演習の問6</Li>
        <Li><strong>6.5 参照</strong>: 問8・問9、演習5、設計演習の問4・問6</Li>
        <Li><strong>6.6 現場で使えるヒント</strong>: 問10、設計演習の問1・問3</Li>
      </Ul>
      <P>ネームスペースを理解できたら、本編の第7章（メタデータ）に進みましょう。</P>
    </>
  );
}
