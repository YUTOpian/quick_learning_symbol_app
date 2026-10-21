import { useEffect, useState } from 'react';
import { Alert, Box, Button, Chip, Typography } from '@mui/material';
import { Code, H, H3, P } from './ui';
import { C, Fold, Li, Mission, Pick, QuizCard, Task, Ul } from './exUi';
import type { Ver } from './Ch02';
import * as d from './ch15/code';
import { QUIZZES } from './ch15/quiz';
import { loadEx, saveEx } from './profile';
import type { ExState } from './profile';

const TASK_IDS = ['ex1', 'ex2', 'ex3', 'ex4', 'ex5', 'ex6'];

// 速習Symbol: 演習編（オリジナル）。章番号 no は、SDKバージョンで変わる（v3 は NEM 付録があるので第15章、v2 は第14章）。第3〜13章で学んだことを組み合わせて、定着を図る。
export default function Ch15({ ver, profile, no }: { ver: Ver; profile: number; no: number }) {
  // クイズの回答と「できた」は、プロファイルごとに保存しておく。
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
      <P>これまでの章では、アカウント、トランザクション、モザイク、ネームスペース、メタデータ、ロック、マルチシグ、監視、制限、オフライン署名、検証を、1つずつ学んできました。各章の章末問題は、その章の内容を確かめるものでした。この章では、それらを<strong>組み合わせて使う</strong>演習に取り組みます。</P>
      <P>実際の開発では、1つの機能だけで完結することはほとんどありません。たとえば「ポイントを発行して、名前を付けて、手数料を肩代わりして配る」には、第5章・第6章・第8章が同時に必要です。知識を、必要なときに引き出して組み合わせる練習をして、内容の定着を図りましょう。</P>

      <H>{`${no}.1 この章の進め方`}</H>
      <P>この章は、次の3つで構成されています。</P>
      <Ul>
        <Li><strong>{no}.2 確認クイズ</strong>（全{QUIZZES.length}問）: 選択式です。章をまたいで出題します。</Li>
        <Li><strong>{no}.3 ハンズオン演習</strong>（全{TASK_IDS.length}題）: 複数の章の機能を組み合わせて、コンソールで実際にトランザクションを送ります。</Li>
        <Li><strong>{no}.4 総合設計演習</strong>: コードは書かずに、実際のサービスの要望にどの機能を使うかを考えます。</Li>
      </Ul>

      <Box sx={{ my: 2, p: 2, border: 1, borderColor: 'divider', borderRadius: 2, display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
        <Typography sx={{ fontWeight: 700, mr: 1 }}>現在の成績</Typography>
        <Chip color={correct === QUIZZES.length ? 'success' : 'default'} label={`クイズ ${correct} / ${QUIZZES.length} 問正解（回答済み ${answered} 問）`} />
        <Chip color={doneCount === TASK_IDS.length ? 'success' : 'default'} label={`ハンズオン ${doneCount} / ${TASK_IDS.length} 題できた`} />
      </Box>

      <H3>進め方のコツ</H3>
      <Ul>
        <Li>解答例を開く前に、まず自分でコードを書いて、コンソールで試します。</Li>
        <Li>詰まったら「ヒント」を開きます。ヒントには、見直すとよい章の節を書いてあります。</Li>
        <Li>最後に「解答例」を開いて、自分のコードと見比べます。解答例のコードは、選択中のSDKバージョンのほうだけが表示されます。</Li>
        <Li>クイズの回答と「できた」のチェックは、このプロファイルに保存されます。</Li>
      </Ul>

      <H3>前提</H3>
      <Ul>
        <Li>環境構築（第2章）が済んでいて、第3章で作成した Alice を使います。演習5では10 XYMを預けるので、Alice には<strong>30 XYM以上</strong>あると安心です。足りなければ、第3章のFAUCETで補充してください。</Li>
        <Li>演習2で作る <C>bob</C>・<C>carol</C>・<C>mosaicDefTx</C> を、演習3と演習5でも使います。ページを再読み込みするとこれらの変数は消えるので、続きの演習をするときは、演習2からやり直してください。</Li>
        <Li>演習3では、第6章で取得したご自身のルートネームスペースを使います。まだ取得していなければ、6.2の手順で先に取得してください。</Li>
      </Ul>

      <H3>共通関数の準備</H3>
      <P>承認を待つ処理や、所有量を取得する処理は、どの演習でも使います。最初に1度だけ実行しておいてください。ページを再読み込みしたときは、もう一度実行します。</P>
      <Pick ver={ver} v2={<Code code={d.prepV2} />} v3={<Code code={d.prepV3} />} />

      <H>{`${no}.2 確認クイズ`}</H>
      <P>第3〜13章の内容から、全{QUIZZES.length}問を出題します。回答するとすぐに正誤と解説が表示されます。間違えた問題は、解説に書かれた章を見直しましょう。</P>
      {QUIZZES.map((q, i) => (
        <QuizCard key={`${q.id}-${st.quiz[q.id] === undefined ? 'open' : 'done'}`} q={q} no={i + 1} answered={st.quiz[q.id]} onAnswer={(a) => answer(q.id, a)} />
      ))}
      {answered === QUIZZES.length && (
        <Alert severity={correct === QUIZZES.length ? 'success' : 'info'} sx={{ mt: 2 }} action={<Button color="inherit" size="small" onClick={() => setSt((s) => ({ ...s, quiz: Object.fromEntries(Object.entries(s.quiz).filter(([k]) => !QUIZZES.some((q) => q.id === k))) }))}>やり直す</Button>}>
          {correct === QUIZZES.length ? `全問正解です（${correct} / ${QUIZZES.length}）。` : `${correct} / ${QUIZZES.length} 問正解でした。間違えた問題の章を見直して、もう一度挑戦してみましょう。`}
        </Alert>
      )}

      <H>{`${no}.3 ハンズオン演習`}</H>
      <P>ここからは、コンソールで実際に動かす演習です。いずれも複数の章の機能を組み合わせます。難易度は ★ の数で表しています。</P>

      <Task no={1} title="暗号メッセージの往復" stars={1} chapters={[3, 4]} done={tp.done('ex1')} onDone={tp.on('ex1')}>
        <Mission>
          Alice が Bob に宛てて、暗号化したメッセージ「ひみつの合言葉」を添えたトランザクションを送ります。承認されたら、そのトランザクションをノードから取得し、Bob の秘密鍵で復号して、元のメッセージと一致することを確認してください。
        </Mission>
        <Ul>
          <Li>Bob を新しく作ります（Bob は XYM を持っていなくて構いません）。</Li>
          <Li>暗号化は Alice 側で、復号は Bob 側で行います。</Li>
          <Li>承認されるのを待ってから、トランザクションを取得します。</Li>
        </Ul>
        <Fold title="ヒント">
          <P>暗号化と復号は第3章3.5、送信は第4章4.1、承認後の取得は第4章の「承認確認」のコードが使えます。復号に必要なのは、Bob の秘密鍵と Alice の公開鍵です。承認される前に取得するとエラーになるので、準備で作った <C>waitConfirmed</C> で待ちます。</P>
        </Fold>
        <Fold title="解答例（まず自分で試してから開きましょう）">
          <Pick ver={ver}
            v2={<><Code code={d.ex1V2a} /><Code code={d.ex1V2b} /></>}
            v3={<><Code code={d.ex1V3a} /><Code code={d.ex1V3b} /></>}
          />
        </Fold>
        <P>答え合わせ。解答例と同じ変数名（<C>secretText</C>・<C>decrypted</C>）を使っています。自分のコードで試した場合は、これらの変数に結果を入れてから実行してください。</P>
        <Code code={d.ex1Check} />
        <P>発展: 第三者の Carol を作り、Carol の鍵で同じメッセージの復号を試してみましょう。復号に失敗することが確認できます。</P>
      </Task>

      <Task no={2} title="自分だけのポイントを発行して配る" stars={2} chapters={[4, 5]} done={tp.done('ex2')} onDone={tp.on('ex2')}>
        <Mission>
          Alice が「譲渡できない・供給量を変えられる・小数を持たない」モザイクを定義して、100枚発行してください。続いて、Bob に10枚、Carol に5枚を、<strong>1つのアグリゲートトランザクション</strong>で同時に配り、それぞれの所有量を確認します。
        </Mission>
        <Ul>
          <Li>モザイクの定義と、供給量の変更（100枚の発行）を、1つのアグリゲートトランザクションにまとめます。</Li>
          <Li>配布は、発行が承認された後に、別のアグリゲートトランザクションで行います。</Li>
          <Li>Bob と Carol の所有量を、ノードから取得して確認します。</Li>
        </Ul>
        <Fold title="ヒント">
          <P>モザイクの定義と供給量の変更は、第5章5.1と同じ流れです。可分性を0にすると、1枚、2枚と数えるポイントになります。配布は、定義が承認される前に送るとモザイクがまだ存在せず失敗するので、承認を待ってから作ります。複数の宛先への同時送信は、第4章のアグリゲートトランザクションです。</P>
        </Fold>
        <Fold title="解答例（まず自分で試してから開きましょう）">
          <Pick ver={ver}
            v2={<><Code code={d.ex2V2a} /><Code code={d.ex2V2b} /></>}
            v3={<><Code code={d.ex2V3a} /><Code code={d.ex2V3b} /></>}
          />
          <P>譲渡不可（transferable=false）にしているので、このポイントは発行者の Alice が絡む送受信しかできません。第5章の「回収可能なポイント運用」と同じ考え方です。</P>
        </Fold>
        <P>答え合わせ。</P>
        <Code code={d.ex2Check} />
        <P>発展: Bob から Carol にポイントを1枚送ってみましょう。失敗することを、第4章のトランザクションステータスのエラーコードで確かめます。</P>
      </Task>

      <Task no={3} title="名前で呼べるポイント" stars={2} chapters={[5, 6]} done={tp.done('ex3')} onDone={tp.on('ex3')}>
        <Mission>
          演習2のモザイクに、ご自身のルートネームスペースの下のサブネームスペース <C>point</C> をリンクしてください。そのうえで、モザイクIDではなくその<strong>名前</strong>を指定して、Bob にポイントを1枚送ります。
        </Mission>
        <Ul>
          <Li>サブネームスペースを作成します。</Li>
          <Li>モザイクエイリアスで、サブネームスペースとモザイクをリンクします。</Li>
          <Li>未解決モザイクとして名前を指定し、Bob へ1枚送ります。</Li>
          <Li>エイリアスの状態と、Bob の所有量が1枚増えたことを確認します。</Li>
        </Ul>
        <Fold title="ヒント">
          <P>サブネームスペースを作れるのは、親のルートネームスペースを持つアカウントです（6.2）。モザイクにリンクするには、モザイクとネームスペースが同じアカウントのものである必要があります（6.3）。送るときは、モザイクIDの代わりにネームスペースIDを指定します（6.4）。サブネームスペースの作成とリンクは、前のトランザクションが承認されてから次へ進みます。</P>
        </Fold>
        <Fold title="解答例（まず自分で試してから開きましょう）">
          <Pick ver={ver} v2={<Code code={d.ex3V2} />} v3={<Code code={d.ex3V3} />} />
        </Fold>
        <P>答え合わせ。</P>
        <Pick ver={ver} v2={<Code code={d.ex3CheckV2} />} v3={<Code code={d.ex3CheckV3} />} />
      </Task>

      <Task no={4} title="自己紹介カードをメタデータに" stars={2} chapters={[3, 7]} done={tp.done('ex4')} onDone={tp.on('ex4')}>
        <Mission>
          Alice のアカウントメタデータに、自己紹介カード（JSON。<C>name</C> と <C>level</C> を持つ）を登録し、ノードから読み出して元のJSONに戻してください。次に <C>level</C> を 2 に更新し、更新後の値が読み出せることを確認します。
        </Mission>
        <Ul>
          <Li>JSON を文字列にして、メタデータの値として登録します。</Li>
          <Li>ノードから取得した値を、JSON に戻します。</Li>
          <Li>同じキーを更新します。登録と更新は、同じ関数で扱えるようにします。</Li>
        </Ul>
        <Fold title="ヒント">
          <P>メタデータは Key-Value で、登録にはアグリゲートトランザクションを使います（7.1）。同じキーへの更新は、古い値との差分（XOR）とサイズの差分で表します。v2 では <C>MetadataTransactionService</C> が自動で作ってくれます。v3 では <C>metadataUpdateValue</C> で値の差分を作り、サイズの差分は自分で計算します。</P>
        </Fold>
        <Fold title="解答例（まず自分で試してから開きましょう）">
          <Pick ver={ver} v2={<Code code={d.ex4V2} />} v3={<Code code={d.ex4V3} />} />
          <P>登録と更新を <C>writeCard</C> 関数にまとめているのがポイントです。ノードに同じキーのメタデータがなければ新規登録に、あれば差分を作って更新になります。</P>
        </Fold>
        <P>答え合わせ。</P>
        <Code code={d.ex4Check} />
      </Task>

      <Task no={5} title="ポイント交換所" stars={3} chapters={[5, 8]} done={tp.done('ex5')} onDone={tp.on('ex5')}>
        <Mission>
          Alice は Bob に 1 XYM を渡し、その代わりに Bob は Alice にポイントを5枚渡します。この交換を、<strong>どちらか一方だけが実行されることがないように</strong>、1つのトランザクションとして成立させてください。Bob は XYM を持っていませんが、手数料は Alice が負担して実現します。
        </Mission>
        <Ul>
          <Li>演習2の Bob と、ポイントを使います。Alice には12 XYM以上が必要です（ハッシュロックの10 XYMと手数料）。</Li>
          <Li>2つの送金を、アグリゲートボンデッドトランザクションにまとめます。</Li>
          <Li>Bob は連署だけを行います。</Li>
          <Li>交換後に、Bob の XYM が 1 になり、ポイントが Bob で5枚減って Alice で5枚増えたことを確認します。</Li>
        </Ul>
        <Fold title="ヒント">
          <P>流れは第8章8.1と同じです。ボンデッドを作って署名し、ハッシュロックを払って承認を待ち、アナウンスして、署名待ちになったところで Bob が連署します。Bob は連署するだけなので XYM は不要です。ポイントは譲渡不可ですが、受取先が発行者の Alice なので、Bob から返せます。</P>
        </Fold>
        <Fold title="解答例（まず自分で試してから開きましょう）">
          <Pick ver={ver} v2={<Code code={d.ex5V2} />} v3={<Code code={d.ex5V3} />} />
        </Fold>
        <P>答え合わせ。</P>
        <Code code={d.ex5Check} />
        <P>発展: 第10章のリスナーで署名待ちのトランザクションを検知して、Bob が自動で連署するようにしてみましょう。</P>
      </Task>

      <Task no={6} title="3人の署名をオフラインで集める" stars={3} chapters={[4, 12, 13]} done={tp.done('ex6')} onDone={tp.on('ex6')}>
        <Mission>
          Alice が起案して、Alice → Bob、Bob → Carol、Carol → Alice のメッセージを、1つのアグリゲートトランザクションにまとめます。Bob と Carol は、署名する前にペイロードから内容を復元して、Alice の署名を検証してから連署してください。集めた署名を結合してアナウンスし、承認されたことを確認します。
        </Mission>
        <Ul>
          <Li>連署者は Bob と Carol の2人です。手数料の計算にも反映します。</Li>
          <Li>Bob と Carol は、秘密鍵を渡さず、署名だけを Alice に返します。</Li>
          <Li>署名の前に、含まれるトランザクションの数と、起案者の署名を確認します。</Li>
          <Li>承認されたトランザクションの連署が2つあることを確認します。</Li>
        </Ul>
        <Fold title="ヒント">
          <P>ペイロードの受け渡しは第12章12.1〜12.3の流れです。署名の検証は、12.2と第13章13.1の「署名者の検証」と同じ考え方です。連署者の数は、v2 では <C>setMaxFeeForAggregate(100, 2)</C> の第2引数、v3 ではトランザクション作成時の連署者数に指定します。</P>
        </Fold>
        <Fold title="解答例（まず自分で試してから開きましょう）">
          <Pick ver={ver}
            v2={<><Code code={d.ex6V2a} /><Code code={d.ex6V2b} /><Code code={d.ex6V2c} /></>}
            v3={<><Code code={d.ex6V3a} /><Code code={d.ex6V3b} /><Code code={d.ex6V3c} /></>}
          />
          <P>実際には、②は Bob と Carol がそれぞれの端末で行います。この演習では1つのコンソールで続けて実行していますが、やり取りするのは <C>signedPayload</C> と連署の署名だけで、秘密鍵は受け渡していません。</P>
        </Fold>
        <P>答え合わせ。</P>
        <Pick ver={ver} v2={<Code code={d.ex6CheckV2} />} v3={<Code code={d.ex6CheckV3} />} />
        <P>発展: 連署をBobの分だけにしてアナウンスすると、どうなるでしょうか。試して、ステータスの内容を読んでみましょう。</P>
      </Task>

      <H>{`${no}.4 総合設計演習`}</H>
      <P>最後は、コードを書かない演習です。実際のサービスでは、要望を聞いたうえで、どの機能を組み合わせるかを決める力が求められます。</P>
      <H3>ポイントカードの設計</H3>
      <Mission>
        ある店舗が、ブロックチェーンで会員向けのポイントカードを作ります。次の8つの要望を実現するには、どの章の機能を使えばよいでしょうか。1つずつ考えてから、解答例を開いてください。
      </Mission>
      <Box component="ol" sx={{ my: 0.5, pl: 3, lineHeight: 1.95 }}>
        <Li>ポイントは、お客さん同士で転売できないようにしたい。</Li>
        <Li>不正な利用が見つかったら、店舗側でポイントを回収したい。</Li>
        <Li>会員登録（本人確認）が済んだお客さんだけが、ポイントを受け取れるようにしたい。</Li>
        <Li>店舗のアカウントは、店長と経理の2人が承認しないと操作できないようにしたい。</Li>
        <Li>お客さんが XYM を持っていなくても、ポイントを使えるようにしたい。</Li>
        <Li>レジの画面に、ポイントを受け取ったことをすぐに表示したい。</Li>
        <Li>会員ランクを、提携店が自分で確かめられるようにしたい。</Li>
        <Li>ポイントを「shop.point」のような分かりやすい名前で扱いたい。</Li>
      </Box>
      <Fold title="解答例（まず自分で考えてから開きましょう）">
        <Ul>
          <Li><strong>1.</strong> モザイクを譲渡不可（transferable=false）で作ります。発行者である店舗との間だけでやり取りできます（第5章）。</Li>
          <Li><strong>2.</strong> モザイクを回収可能（revokable=true）にして、必要なときにモザイク回収トランザクションで回収します（第5章）。</Li>
          <Li><strong>3.</strong> グローバルモザイク制限を使います。会員になったアカウントにだけ適格情報を付与すれば、条件を満たしたアカウント間でしか動かせません。発行者の秘密鍵だけで付与でき、お客さんの署名は要りません（第11章 11.2。モザイクの制限設定を可能にしておく必要があります）。</Li>
          <Li><strong>4.</strong> 店舗のアカウントをマルチシグ化し、店長と経理を連署者にします（第9章）。</Li>
          <Li><strong>5.</strong> アグリゲートボンデッドトランザクションとハッシュロックで、店舗が手数料を負担します（第8章。演習5と同じ考え方です）。ハッシュロックの10 XYMを避けたい場合は、オフライン署名も選べます（第12章）。</Li>
          <Li><strong>6.</strong> WebSocketのリスナーで、店舗アドレス宛の承認済みトランザクションを検知します（第10章）。</Li>
          <Li><strong>7.</strong> 会員ランクをアカウントメタデータに記録し、提携店は第13章13.3.3の方法で、ノードを信用せずに検証します（第7章・第13章）。</Li>
          <Li><strong>8.</strong> ルートネームスペースを取得し、サブネームスペースをポイントのモザイクにリンクします（第6章。演習3と同じ考え方です）。</Li>
        </Ul>
        <P>1つの要望に、複数の機能が考えられることもあります。たとえば5は、ボンデッドとオフライン署名のどちらでも実現できるので、ハッシュロックの費用や、ペイロードを受け渡す手段が用意できるかどうかで選びます。ご自身の考えと違っても、理由を説明できれば間違いではありません。</P>
      </Fold>

      <H>{`${no}.5 現場で使えるヒント`}</H>
      <H3>小さく分けて、1つずつ確かめる</H3>
      <P>複数の機能を組み合わせるときは、一度に全部を作らず、1つの機能ごとに動作を確かめながら進めます。この章の解答例が「① → ② → ③」と分かれているのは、そのためです。途中で失敗したときに、どこが原因か切り分けやすくなります。</P>
      <H3>失敗から学ぶ</H3>
      <P>各演習の「発展」には、わざと失敗させる課題があります。失敗したときのトランザクションステータスのエラーコードは、仕様を理解する手がかりになります。成功する手順だけでなく、どんなときに失敗するのかも知っておくと、実際のサービスでの不具合の調査が早くなります。</P>
      <H3>自分の題材に置き換える</H3>
      <P>演習のポイントは、イベントのチケットや、地域通貨、社内の表彰バッジなどに置き換えられます。自分が作りたいサービスの題材で演習をやり直し、{no}.4のように要望を機能に対応づけてみてください。それが、学んだことを現場で使える形にする、いちばんの近道です。</P>
    </>
  );
}
