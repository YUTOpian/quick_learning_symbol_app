import { useEffect, useState } from 'react';
import { Alert, Box, Button, Chip, Typography } from '@mui/material';
import { Code, H, H3, P } from './ui';
import { C, Example, Fold, Li, Mission, Pick, PracticeHead, QuizCard, Task, Ul } from './exUi';
import type { Ver } from './Ch02';
import { prepV2, prepV3 } from './ch15/code';
import * as d from './ex01/code';
import { QUIZZES } from './ex01/quiz';
import { loadEx, saveEx } from './profile';
import type { ExState } from './profile';

const TASK_IDS = ['ac-t1', 'ac-t2', 'ac-t3', 'ac-t4', 'ac-t5'];

// 速習Symbol: 演習編 第1章 アカウント。本編 第3章（アカウント）の内容を、クイズとハンズオンで確かめる。
export default function Ex01({ ver, profile }: { ver: Ver; profile: number }) {
  // クイズの回答と「できた」は、プロファイルごとに保存しておく（総合演習と同じ保存場所。id が重ならないようにしてある）。
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
      <P>この章は、本編の<strong>第3章 アカウント</strong>に対応する演習です。第3章では、アカウントの生成、秘密鍵・公開鍵・アドレスの関係、アカウント情報の確認、暗号化と署名を学びました。ここでは、それらを自分の手で使い、理解を確かめます。</P>
      <P>アカウントは、これから先のすべての章の土台です。トランザクションも、モザイクも、マルチシグも、アカウントの秘密鍵で署名することから始まります。この章でしっかり固めておきましょう。</P>

      <H>1.1 この章の進め方</H>
      <P>この章は、次の4つで構成されています。</P>
      <Ul>
        <Li><strong>1.2 確認クイズ</strong>（全{QUIZZES.length}問）: 選択式です。回答するとすぐに解説が表示されます。</Li>
        <Li><strong>1.3 ハンズオン演習</strong>（全{TASK_IDS.length}題）: コンソールで実際にコードを書いて動かします。各演習には、解き方を示した<strong>例題</strong>が付いています。</Li>
        <Li><strong>1.4 設計演習</strong>: コードは書かずに、場面ごとに「何を渡すか」「どうするか」を考えます。</Li>
        <Li><strong>1.5 振り返り</strong>: 第3章の各節と、この章の問題の対応表です。</Li>
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
        <Li>詰まったら「ヒント」を開きます。ヒントには、見直すとよい第3章の節を書いてあります。</Li>
        <Li>最後に「解答例」を開いて、自分のコードと見比べます。解答例のコードは、選択中のSDKバージョンのほうだけが表示されます。</Li>
        <Li>各演習の最後にある「答え合わせ」のコードを実行して、✅ が表示されたら「できた」にチェックを入れます。</Li>
        <Li>クイズの回答と「できた」のチェックは、このプロファイルに保存されます。</Li>
      </Ul>

      <H3>前提</H3>
      <Ul>
        <Li>環境構築（第2章）が済んでいて、第3章で作成した <C>alice</C> を使います。演習2で alice から他のアカウントへ XYM を送るので、alice には<strong>5 XYM以上</strong>あると安心です。足りなければ、第3章のFAUCETで補充してください。</Li>
        <Li>ページを再読み込みすると、コンソールの変数はすべて消えます。演習1〜5は、それぞれ単独で取り組めます。</Li>
        <Li>この章で作るアカウント（erin・frank など）は、テストネットの練習用です。本番で使う秘密鍵は、画面に表示したり、人に見せたりしないようにします。</Li>
      </Ul>

      <H3>共通関数の準備</H3>
      <P>演習2では、トランザクションの承認を待つ関数を使います。最初に1度だけ実行しておいてください。ページを再読み込みしたときは、もう一度実行します。</P>
      <Pick ver={ver} v2={<Code code={prepV2} />} v3={<Code code={prepV3} />} />

      <H>1.2 確認クイズ</H>
      <P>第3章の内容から、全{QUIZZES.length}問を出題します。回答するとすぐに正誤と解説が表示されます。間違えた問題は、解説の内容を、第3章の本文で確かめましょう。</P>
      {QUIZZES.map((q, i) => (
        <QuizCard key={`${q.id}-${st.quiz[q.id] === undefined ? 'open' : 'done'}`} q={q} no={i + 1} answered={st.quiz[q.id]} onAnswer={(a) => answer(q.id, a)} />
      ))}
      {answered === QUIZZES.length && (
        <Alert severity={correct === QUIZZES.length ? 'success' : 'info'} sx={{ mt: 2 }}
          action={<Button color="inherit" size="small" onClick={() => setSt((s) => ({ ...s, quiz: Object.fromEntries(Object.entries(s.quiz).filter(([k]) => !QUIZZES.some((q) => q.id === k))) }))}>やり直す</Button>}>
          {correct === QUIZZES.length ? `全問正解です（${correct} / ${QUIZZES.length}）。` : `${correct} / ${QUIZZES.length} 問正解でした。間違えた問題の解説を読んで、もう一度挑戦してみましょう。`}
        </Alert>
      )}

      <H>1.3 ハンズオン演習</H>
      <P>ここからは、コンソールで実際に動かす演習です。難易度は ★ の数で表しています。どの演習も、最初に解き方つきの例題があり、そのあとに練習問題があります。例題のコードは、そのままコンソールで実行できます。</P>

      {/* ---------- 演習1 ---------- */}
      <Task no={1} title="鍵とアドレスを「文字列」で受け渡す" stars={1} chapters={[3]} done={tp.done('ac-t1')} onDone={tp.on('ac-t1')}>
        <Example title="公開鍵の文字列から、アドレスを取り出す">
          <Mission label="問題">
            alice の公開鍵を文字列として取り出し、その文字列だけから公開鍵クラスを作ってください。そのクラスから取り出したアドレスが、alice のアドレスと一致することを確認します。
          </Mission>
          <P><strong>解き方</strong></P>
          <Box component="ol" sx={{ my: 0.5, pl: 3, lineHeight: 1.95 }}>
            <Li>公開鍵を、ただの文字列にします。</Li>
            <Li>その文字列から、公開鍵クラスを作ります（3.1「公開鍵クラスの生成」）。</Li>
            <Li>クラスからアドレスを取り出し、<strong>文字列にして</strong>比べます。クラスどうしを <C>===</C> で比べると、中身が同じでも別のオブジェクトなので false になってしまいます。</Li>
          </Box>
          <Pick ver={ver} v2={<Code code={d.e1V2} />} v3={<Code code={d.e1V3} />} />
          <P><C>true</C> と表示されれば成功です。この「文字列にしてから比べる」やり方は、答え合わせでも使います。</P>
        </Example>
        <PracticeHead />
        <Mission>
          新しいアカウント <C>erin</C> を作り、秘密鍵・公開鍵・アドレスを、ただの<strong>文字列</strong>として取り出して、オブジェクト <C>saved</C> にまとめてください。次に、<C>saved</C> の文字列だけから、アカウント・公開鍵クラス・アドレスクラスを作り直し、すべて同じアドレスになることを確認します。
        </Mission>
        <Ul>
          <Li>変数名は、<C>erin</C>（アカウント）、<C>saved</C>（文字列のオブジェクト）、<C>restored</C>（秘密鍵から作り直したアカウント）、<C>pub</C>（公開鍵クラス）、<C>addr</C>（アドレスクラス）とします。</Li>
          <Li><C>saved</C> は <C>privateKey</C>・<C>publicKey</C>・<C>address</C> の3つを持ちます。</Li>
        </Ul>
        <Fold title="ヒント">
          <P>第3章3.1の「秘密鍵と公開鍵の導出」「アドレスの導出」で文字列を取り出し、「秘密鍵からアカウント生成」「公開鍵クラスの生成」「アドレスクラスの生成」で作り直します。アドレスは、秘密鍵からも、公開鍵からも導出できます。</P>
        </Fold>
        <Fold title="解答例（まず自分で試してから開きましょう）">
          <Pick ver={ver}
            v2={<><Code code={d.t1V2a} /><Code code={d.t1V2b} /></>}
            v3={<><Code code={d.t1V3a} /><Code code={d.t1V3b} /></>}
          />
          <P>3つの情報は、どれもただの文字列なので、JSONにして保存したり、他の人に渡したりできます。ただし、渡してよいのは<strong>公開鍵とアドレスだけ</strong>です。秘密鍵は、そのまま保存せず、パスフレーズで暗号化します（3.4「アカウントの保管」）。</P>
        </Fold>
        <P>答え合わせ。解答例と同じ変数名を使っています。</P>
        <Pick ver={ver} v2={<Code code={d.t1CheckV2} />} v3={<Code code={d.t1CheckV3} />} />
        <P>発展: <C>saved.publicKey</C> の先頭の1文字だけを書き換えて、公開鍵クラスを作ってみましょう。アドレスが、まったく別のものになります。</P>
      </Task>

      {/* ---------- 演習2 ---------- */}
      <Task no={2} title="受信して初めて、アカウントは記録される" stars={2} chapters={[3, 4]} done={tp.done('ac-t2')} onDone={tp.on('ac-t2')}>
        <Example title="アカウントがノードに記録されているか調べる">
          <Mission label="問題">
            アドレスを渡すと、そのアカウントがノードに記録されているかを、文字で答える関数 <C>describeAccount</C> を作ってください。記録されている場合は、公開鍵が記録済みかどうかも答えます。
          </Mission>
          <P><strong>解き方</strong></P>
          <Box component="ol" sx={{ my: 0.5, pl: 3, lineHeight: 1.95 }}>
            <Li>記録されていないアカウントは、取得するとエラー（v3 は 404）になります。そこで、失敗したら <C>null</C> を返す関数 <C>getInfo</C> を作ります。</Li>
            <Li><C>null</C> なら「記録されていない」と答えます。</Li>
            <Li><C>publicKey</C> が 0 だけなら「公開鍵は未記録」、そうでなければ「公開鍵も記録済み」と答えます（3.3「publicKey」）。</Li>
          </Box>
          <Pick ver={ver} v2={<Code code={d.e2V2} />} v3={<Code code={d.e2V3} />} />
          <P>alice の結果は、alice がこれまでに署名したトランザクションを送信したかどうかで変わります。作っただけのアカウントは、必ず「記録されていません」になります。練習問題では、この <C>getInfo</C> と同じ考え方を使います。</P>
        </Example>
        <PracticeHead />
        <Mission>
          新しいアカウント <C>frank</C> を作り、ブロックチェーンに記録されていく様子を、3段階で観察してください。
        </Mission>
        <Box component="ol" sx={{ my: 0.5, pl: 3, lineHeight: 1.95 }}>
          <Li>作っただけの frank は、ノードに記録されていません。アカウント情報を取得できないことを確認します（結果を <C>info0</C> に入れます）。</Li>
          <Li>alice から frank へ 1 XYM を送ります。受信した frank は記録されますが、<C>publicKey</C> は 0 が並んだままです。所有量が 1000000 であることも確認します（結果を <C>info1</C> に入れます）。</Li>
          <Li>frank が署名したトランザクションを alice に送ります。これで、frank の公開鍵が記録されます（結果を <C>info2</C> に入れます）。</Li>
        </Box>
        <P>送信のコードは、第4章で学ぶ内容です。この演習の目的は「記録のされ方を観察する」ことなので、次の送信用の関数を、そのまま実行して使ってください。</P>
        <Pick ver={ver} v2={<Code code={d.t2PrepV2} />} v3={<Code code={d.t2PrepV3} />} />
        <Ul>
          <Li>上の「共通関数の準備」を、先に実行しておきます。</Li>
          <Li>アカウント情報の取得は、記録されていないアカウントに対して失敗します。失敗しても止まらないよう、失敗したら <C>null</C> を返す関数にしておくと便利です。</Li>
          <Li>承認の直後は、アカウント情報に反映されるまで、少し時間がかかることがあります。</Li>
        </Ul>
        <Fold title="ヒント">
          <P>アカウント情報の取得は、第3章3.3「所有モザイク一覧の取得」のコードです。記録されていないアカウントの取得は、v2 ではエラー（例外）に、v3 では 404（<C>res.ok</C> が false）になります。<C>publicKey</C> の仕組みは、3.3の「publicKey」の説明を読み返してください。</P>
        </Fold>
        <Fold title="解答例（まず自分で試してから開きましょう）">
          <Pick ver={ver}
            v2={<><Code code={d.t2V2a} /><Code code={d.t2V2b} /><Code code={d.t2V2c} /></>}
            v3={<><Code code={d.t2V3a} /><Code code={d.t2V3b} /><Code code={d.t2V3c} /></>}
          />
          <P>②で表示される <C>publicKey</C> は、64文字の 0 です。受信しただけでは、ブロックチェーンは相手の公開鍵を知りません。③のように、署名したトランザクションを送信すると、署名の検証のために公開鍵が必要になるので、そこで初めて記録されます。</P>
        </Fold>
        <P>答え合わせ。</P>
        <Pick ver={ver} v2={<Code code={d.t2CheckV2} />} v3={<Code code={d.t2CheckV3} />} />
        <P>発展: 相手のアドレスしか分からないとき、暗号化メッセージを送れるでしょうか。1.4の設計演習の問4で考えてみましょう。</P>
      </Task>

      {/* ---------- 演習3 ---------- */}
      <Task no={3} title="可分性を考えて、所有量を正しく表示する" stars={2} chapters={[3]} done={tp.done('ac-t3')} onDone={tp.on('ac-t3')}>
        <Example title="秒数を「分:秒」の形に直す">
          <Mission label="問題">
            秒数から「分:秒」の形の文字列を作る関数 <C>formatTime(sec)</C> を作ってください。たとえば 5 秒は <C>0:05</C>、65 秒は <C>1:05</C> です。
          </Mission>
          <P><strong>解き方</strong></P>
          <Box component="ol" sx={{ my: 0.5, pl: 3, lineHeight: 1.95 }}>
            <Li>先に、テスト用のデータ（秒数と、期待する表示）を用意します。0 や 5 のような、境界のケースを入れておくのがコツです。</Li>
            <Li>関数を作ります。「秒」の部分は、1桁のときに <C>05</C> のように 2桁にそろえたいので、<C>padStart(2, '0')</C> で左を 0 で埋めます。</Li>
            <Li>テストにかけて、合格しなかったものがないか確かめます。</Li>
          </Box>
          <Code code={d.e3} />
          <P>練習問題でも、同じ流れ（テストを用意する → 関数を作る → テストで確かめる）で進めます。桁をそろえたいときは <C>padStart</C> が使えます。</P>
        </Example>
        <PracticeHead />
        <Mission>
          所有量（可分性を含めた整数の文字列）と可分性から、人が読む表示量を作る関数 <C>formatAmount(amount, divisibility)</C> を作ってください。次に、alice が持っているモザイクを<strong>すべて</strong>、「モザイクID : 表示量」の形で表示します。
        </Mission>
        <Ul>
          <Li>まず、下の「テスト用のデータ」を実行して、<C>tests</C> を用意します。</Li>
          <Li>第3章3.3「表示桁数の調整」のやり方を関数にした <C>naiveFormat</C> を、テストにかけてみます。うまくいかないケースを見つけてください。</Li>
          <Li>すべてのテストに合格する <C>formatAmount</C> を作ります。</Li>
          <Li>alice の所有モザイクを1つずつ取り出して、モザイクごとの可分性で表示します。</Li>
        </Ul>
        <Code code={d.t3Tests} />
        <Code code={d.t3Naive} />
        <P>実行すると、所有量 <C>5</C> や <C>0</C> のケースが ❌ になります。所有量の桁数が、可分性より少ないときです。どうすれば直せるか、考えてみましょう。</P>
        <Fold title="ヒント">
          <P>所有量の文字列が可分性より短いと、<C>slice</C> で整数部を切り出せません。<C>padStart</C> で、左を <C>0</C> で埋めてから切り分けます。「整数部が 0 になる」ケースのために、少なくとも（可分性 + 1）桁を確保します。可分性が 0 のときは、小数点を付けません。</P>
          <P>モザイクごとの可分性は、第3章3.3のとおり、モザイク情報から取得します。所有モザイクの一覧は <C>accountInfo.mosaics</C> に入っています。</P>
        </Fold>
        <Fold title="解答例（まず自分で試してから開きましょう）">
          <Code code={d.t3Func} />
          <Pick ver={ver} v2={<Code code={d.t3ApplyV2} />} v3={<Code code={d.t3ApplyV3} />} />
          <P>お金や数量を扱うときは、小数の計算を避けて、整数のまま持ち、表示するときだけ小数点を入れます。表示の関数は、実際のアカウントを使わなくても、テストデータで確かめられます。境界のケース（0、桁が足りない、可分性が 0）を最初にテストに入れておくと、間違いに気づけます。</P>
        </Fold>
        <P>答え合わせ。</P>
        <Code code={d.t3Check} />
      </Task>

      {/* ---------- 演習4 ---------- */}
      <Task no={4} title="暗号メッセージは、誰が読めるのか" stars={2} chapters={[3]} done={tp.done('ac-t4')} onDone={tp.on('ac-t4')}>
        <Example title="暗号化して、受取人が復号する">
          <Mission label="問題">
            alice が bob 宛てに <C>Hello Symbol!</C> を暗号化し、bob が復号して、元のメッセージと一致することを確認してください。
          </Mission>
          <P><strong>解き方</strong></P>
          <Box component="ol" sx={{ my: 0.5, pl: 3, lineHeight: 1.95 }}>
            <Li>alice が、「自分の秘密鍵」と「bob の公開鍵」で暗号化します（3.4「暗号化」）。</Li>
            <Li>bob が、「自分の秘密鍵」と「alice の公開鍵」で復号します（3.4「復号化」）。</Li>
            <Li>復号した結果が、元のメッセージと同じかを <C>===</C> で比べます。</Li>
          </Box>
          <Pick ver={ver} v2={<Code code={d.e4V2} />} v3={<Code code={d.e4V3} />} />
          <P>復号に使う鍵は、いつも「自分の秘密鍵」と「相手の公開鍵」の組み合わせです。練習問題では、この組み合わせを変えると、復号できる人・できない人がどう変わるかを試します。</P>
        </Example>
        <PracticeHead />
        <Mission>
          alice が bob 宛てに、メッセージ「ひみつの合言葉」を暗号化します。次の4つのケースで復号を試み、結果（成功なら <C>true</C>、失敗なら <C>false</C>）をオブジェクト <C>results</C> にまとめてください。
        </Mission>
        <Box component="ol" sx={{ my: 0.5, pl: 3, lineHeight: 1.95 }}>
          <Li><C>bob</C>（受取人）が復号する。</Li>
          <Li><C>alice</C>（送信者）が、あとから自分で復号する。</Li>
          <Li><C>carol</C>（第三者）が復号する。</Li>
          <Li>暗号文を、最後の1文字（v3 は1バイト）だけ変えて、bob が復号する。</Li>
        </Box>
        <Ul>
          <Li><C>bob</C> と <C>carol</C> は、新しく作ります。</Li>
          <Li><C>results</C> のキーは、<C>bob</C>・<C>alice</C>・<C>carol</C>・<C>tampered</C> とします。</Li>
          <Li>復号に失敗したときは、v2 ではエラーになることがあり、v3 では <C>isDecoded</C> が false になります。どちらの場合も <C>false</C> として扱います。</Li>
        </Ul>
        <Fold title="ヒント">
          <P>暗号化と復号は、第3章3.4「暗号化」「復号化」のコードです。復号に使うのは、「自分の秘密鍵」と「相手の公開鍵」の組み合わせでした。送信者の alice も、この考え方で復号できます。復号を試す部分は、関数にまとめると、4回同じコードを書かずに済みます。</P>
        </Fold>
        <Fold title="解答例（まず自分で試してから開きましょう）">
          <Pick ver={ver} v2={<Code code={d.t4V2} />} v3={<Code code={d.t4V3} />} />
          <P>期待どおりなら、<C>bob</C> と <C>alice</C> が <C>true</C>、<C>carol</C> と <C>tampered</C> が <C>false</C> です。暗号化はAES-GCM形式なので、鍵が違う場合だけでなく、暗号文が1か所でも書き換えられた場合も、復号に失敗します。つまり暗号化は「秘密にする」だけでなく、「改ざんに気づく」役割も持っています。</P>
        </Fold>
        <P>答え合わせ。</P>
        <Code code={d.t4Check} />
      </Task>

      {/* ---------- 演習5 ---------- */}
      <Task no={5} title="署名でログインする" stars={3} chapters={[3]} done={tp.done('ac-t5')} onDone={tp.on('ac-t5')}>
        <Example title="署名を検証する関数を作る">
          <Mission label="問題">
            メッセージ・公開鍵・署名を受け取り、署名が正しければ <C>true</C> を返す関数 <C>verifyMessage</C> を作ってください。元のメッセージでは true、1文字変えたメッセージでは false になることを確認します。
          </Mission>
          <P><strong>解き方</strong></P>
          <Box component="ol" sx={{ my: 0.5, pl: 3, lineHeight: 1.95 }}>
            <Li>alice が秘密鍵で署名します（3.4「署名」）。</Li>
            <Li>検証には、メッセージ・公開鍵・署名の3つだけを使います。秘密鍵は使いません（3.4「検証」）。公開鍵は文字列で受け取り、関数の中でクラスに直します。</Li>
            <Li>元のメッセージと、1文字変えたメッセージで、それぞれ検証します。</Li>
          </Box>
          <Pick ver={ver} v2={<Code code={d.e5V2} />} v3={<Code code={d.e5V3} />} />
          <P>この関数が、練習問題の土台になります。練習問題では、さらに「公開鍵が、登録済みのアドレスのものか」の確認と、「毎回ちがうお題（challenge）」を加えて、ログインの仕組みにします。</P>
        </Example>
        <PracticeHead />
        <Mission>
          パスワードを使わずに、アカウントの署名で本人確認をする仕組みを作ります。サービス側（bob）は、毎回ちがう文字列 <C>challenge</C>（お題）を出します。alice は、それに署名して、公開鍵と署名を返します。サービス側は、次の2つを確認して、両方満たしたときだけログインを許可します。
        </Mission>
        <Ul>
          <Li>受け取った公開鍵から導出したアドレスが、登録済みのアドレス（<C>registeredAddress</C>）と同じこと。</Li>
          <Li>署名が、その <C>challenge</C> に対する、その公開鍵のものであること。</Li>
        </Ul>
        <P>この確認をする関数 <C>verifyLogin(challenge, answer)</C> を作り、次の2つを確かめてください。<C>answer</C> は、<C>publicKey</C> と <C>signature</C> を持つオブジェクトです。</P>
        <Ul>
          <Li>正しい <C>challenge</C> のとき、<C>true</C> になる。</Li>
          <Li>別の <C>challenge</C>（たとえば末尾に <C>!</C> を足したもの）のとき、<C>false</C> になる。</Li>
        </Ul>
        <Fold title="ヒント">
          <P>署名は3.4「署名」、検証は3.4「検証」のコードです。公開鍵だけから署名を検証できます。アドレスの導出は、3.1「公開鍵クラスの生成」で作った公開鍵クラスから取り出せます。</P>
          <P>なぜ <C>challenge</C> を毎回変えるのでしょうか。3.4の最後に書かれている、「ブロックチェーンを使用しない署名は、何度も再利用される可能性がある」という注意を、読み返してみましょう。</P>
        </Fold>
        <Fold title="解答例（まず自分で試してから開きましょう）">
          <Pick ver={ver} v2={<Code code={d.t5V2} />} v3={<Code code={d.t5V3} />} />
          <P>アドレスの確認が必要なのは、署名が有効でも、それが「登録した本人」の署名とは限らないからです。別の人が自分の鍵で署名して、自分の公開鍵を添えても、署名そのものは有効になります。公開鍵からアドレスを導出して、登録済みのアドレスと突き合わせることで、本人であることを確かめます。</P>
          <P><C>challenge</C> を毎回変えるのは、一度使われた署名を、あとから誰かが使い回すことを防ぐためです。同じ署名は、同じ <C>challenge</C> でなら、何度でも検証に成功してしまいます。</P>
        </Fold>
        <P>答え合わせ。</P>
        <Code code={d.t5Check} />
        <P>発展: carol を新しく作り、carol が自分の鍵で <C>challenge</C> に署名して、<C>publicKey</C> に alice の公開鍵を入れた <C>answer</C> を作ってみましょう。<C>false</C> になります。次に、<C>publicKey</C> も carol のものにしてみます。署名は有効ですが、アドレスが違うので、やはり <C>false</C> になります。</P>
      </Task>

      <H>1.4 設計演習</H>
      <P>最後は、コードを書かない演習です。アカウントの扱いで大切なのは、「どの情報を、誰に渡してよいか」を、場面ごとに判断できることです。</P>
      <H3>鍵の取り扱い</H3>
      <Mission>
        次の7つの場面で、何を渡すか、どうするかを考えてください。1つずつ考えてから、解答例を開きます。
      </Mission>
      <Box component="ol" sx={{ my: 0.5, pl: 3, lineHeight: 1.95 }}>
        <Li>友人に、テストネットのXYMを送ってもらいたい。友人に伝える情報は何か。</Li>
        <Li>取引先から、自分宛てに暗号化したメッセージを送ってもらいたい。取引先に伝える情報は何か。</Li>
        <Li>「このメッセージは、確かに自分が書いた」と、第三者に示したい。何を渡せばよいか。</Li>
        <Li>相手のアドレスしか分からない。その相手に、暗号化したメッセージを送りたい。どうすればよいか。</Li>
        <Li>秘密鍵を、スマートフォンとパソコンの両方で使いたい。どのように持ち運ぶか。</Li>
        <Li>組織の担当者が交代する。前任者が使っていたアカウントの秘密鍵を、後任者に引き継いでもらいたい。どうするか。</Li>
        <Li>秘密鍵をなくしてしまった。パスワードの再発行のように、同じアドレスを使い続けられるか。</Li>
      </Box>
      <Fold title="解答例（まず自分で考えてから開きましょう）">
        <Ul>
          <Li><strong>1.</strong> アドレスだけです。送信先の指定にはアドレスを使います。公開鍵も秘密鍵も、渡す必要はありません（3.2）。</Li>
          <Li><strong>2.</strong> 公開鍵です。取引先は、自分の秘密鍵と、あなたの公開鍵で暗号化します。あなたは、自分の秘密鍵と取引先の公開鍵で復号します（3.4）。</Li>
          <Li><strong>3.</strong> メッセージと、署名と、公開鍵です。検証には公開鍵だけが必要で、秘密鍵は渡しません（3.4）。使い回しを防ぎたいときは、メッセージに有効期限や使い捨ての値を入れて署名します。</Li>
          <Li><strong>4.</strong> 暗号化には、相手の公開鍵が必要です。アドレスから公開鍵は求められません。相手が一度でも署名したトランザクションを送信していれば、ノードのアカウント情報から、公開鍵を取得できます（3.3の publicKey）。まだ送信していないアカウントは、公開鍵が 0 のままなので、本人に公開鍵を教えてもらいます。</Li>
          <Li><strong>5.</strong> 秘密鍵をそのまま送らず、パスフレーズで暗号化して持ち運びます。symbol-qr-library で、QRコードやテキストにできます（3.4「アカウントの保管」）。パスフレーズは、暗号化した秘密鍵とは別の手段で伝えます。</Li>
          <Li><strong>6.</strong> 秘密鍵を譲り受けて運用を続けることは、控えます（3.1の注意事項）。担当者ごとに、自分のアカウントを持ちます。組織のアカウントは、マルチシグ（第9章）にして、担当者を連署者にしておけば、担当者の入れ替えにも対応しやすくなります。</Li>
          <Li><strong>7.</strong> できません。ブロックチェーンでは、秘密鍵に対してアドレスが決まるので、秘密鍵を変更することも、再発行することもできません（3.1の注意事項）。秘密鍵を紛失すると、そのアカウントのデータは操作できなくなります。新しいアカウントを作り、必要なものは別の手段で移します。バックアップの大切さが分かります。</Li>
        </Ul>
        <P>場面によって、複数の答えが考えられることもあります。ご自身の考えと違っても、「どの情報が、なぜ必要か」を説明できれば、間違いではありません。</P>
      </Fold>

      <H>1.5 振り返り</H>
      <P>第3章の各節と、この章の問題の対応です。間違えた問題や、解けなかった演習は、対応する節を読み返しましょう。</P>
      <Ul>
        <Li><strong>3.1 アカウント生成</strong>: 問1・問2、演習1、設計演習の問7</Li>
        <Li><strong>3.2 アカウントへの送信</strong>: 問3、演習2、設計演習の問1</Li>
        <Li><strong>3.3 アカウント情報の確認</strong>: 問4・問5・問10、演習2・演習3、設計演習の問4</Li>
        <Li><strong>3.4 暗号化と署名</strong>: 問6・問7・問8、演習4・演習5、設計演習の問2・問3</Li>
        <Li><strong>3.4 アカウントの保管</strong>: 問9、設計演習の問5・問6</Li>
      </Ul>
      <P>アカウントを理解できたら、次は、トランザクションの演習に進みます。</P>
    </>
  );
}
