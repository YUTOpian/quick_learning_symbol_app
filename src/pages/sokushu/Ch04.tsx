import type { ReactNode } from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Box, Typography } from '@mui/material';
import { Code, Ext, H, H3, H4, Out, P, mono } from './ui';
import type { Ver } from './Ch02';
import Exercise from './Exercise';
import * as d from './ch04/code';

// v2 / v3 でコードが違う箇所は、選択中のバージョンだけを表示する。
const Pick = ({ ver, v2, v3 }: { ver: Ver; v2: ReactNode; v3: ReactNode }) => <>{ver === 'v2' ? v2 : v3}</>;
const Fold = ({ title, children }: { title: string; children: ReactNode }) => (
  <Accordion disableGutters variant="outlined" sx={{ my: 1 }}>
    <AccordionSummary><Typography sx={{ fontWeight: 700 }}>{title}</Typography></AccordionSummary>
    <AccordionDetails>{children}</AccordionDetails>
  </Accordion>
);
const Li = ({ children }: { children: ReactNode }) => <Box component="li" sx={{ lineHeight: 1.8 }}>{children}</Box>;
const Ul = ({ children }: { children: ReactNode }) => <Box component="ul" sx={{ my: 0.5, pl: 3 }}>{children}</Box>;
// 本文中のインラインコード。
const C = ({ children }: { children: ReactNode }) => <Box component="code" sx={{ ...mono, bgcolor: 'action.hover', px: 0.6, py: 0.1, borderRadius: 0.5 }}>{children}</Box>;
// md の ##### 見出し（H4 のひとつ下）。
const H5 = ({ children }: { children: ReactNode }) => <Typography component="h5" sx={{ fontSize: '0.95rem', fontWeight: 700, mt: 2.5, mb: 0.5, color: 'text.secondary' }}>{children}</Typography>;
// 引数を省略した断片など、そのままでは実行できないコード（実行ボタンを出さない）。
const Snip = ({ code }: { code: string }) => <Code code={code} runnable={false} />;
// 片方のバージョンでしか動かないコードの注意書き（バージョンを切り替えても表示は変わらない）。
const OnlyV = ({ v }: { v: 'v2' | 'v3' }) => <P>※ このコードは {v} の環境で動作します。</P>;

// 速習Symbol: 第4章 トランザクション。
export default function Ch04({ ver }: { ver: Ver }) {
  return (
    <>
      <P>ブロックチェーン上のデータ更新はトランザクションをネットワークにアナウンスすることによって行います。</P>

      <H>4.1 トランザクションのライフサイクル</H>
      <P>トランザクションを作成してから、改ざんが困難なデータとなるまでを順に説明します。</P>
      <Ul>
        <Li>トランザクション作成<Ul><Li>ブロックチェーンが受理できるフォーマットでトランザクションを作成します。</Li></Ul></Li>
        <Li>署名<Ul><Li>アカウントの秘密鍵でトランザクションを署名します。</Li></Ul></Li>
        <Li>アナウンス<Ul><Li>任意のノードに署名済みトランザクションを通知します。</Li></Ul></Li>
        <Li>未承認トランザクション
          <Ul>
            <Li>ノードに受理されたトランザクションは、未承認トランザクションとして全ノードに伝播します
              <Ul><Li>トランザクションに設定した最大手数料が、各ノード毎に設定されている最低手数料を満たさない場合はそのノードへは伝播しません。</Li></Ul>
            </Li>
          </Ul>
        </Li>
        <Li>承認済みトランザクション<Ul><Li>約30秒に1度ごとに生成されるブロックに未承認トランザクションが取り込まれると、承認済みトランザクションとなります。</Li></Ul></Li>
        <Li>ロールバック
          <Ul>
            <Li>ノード間の合意に達することができずロールバックされたブロックに含まれていたトランザクションは、未承認トランザクションに差し戻されます。
              <Ul><Li>有効期限切れや、キャッシュからあふれたトランザクションは切り捨てられます。</Li></Ul>
            </Li>
          </Ul>
        </Li>
        <Li>ファイナライズ<Ul><Li>投票ノードによるファイナライズプロセスによりブロックが確定するとトランザクションはロールバック不可なデータとして扱うことができます。</Li></Ul></Li>
      </Ul>

      <H3>ブロックとは</H3>
      <P>ブロックは約30秒ごとに生成され、高い手数料を支払ったトランザクションから優先に取り込まれ、ブロック単位で他のノードと同期します。同期に失敗するとロールバックして、ネットワークが全体で合意が取れるまでこの作業を繰り返します。</P>

      <H>4.2 トランザクション作成</H>
      <P>まずは最も基本的な転送トランザクションを作成してみます。</P>

      <H3>Bobへの転送トランザクション</H3>
      <P>送信先のBobアドレスを作成しておきます。</P>
      <Pick ver={ver}
        v2={<><Code code={d.bobV2} /><Out code={d.bobV2Out} /></>}
        v3={<><Code code={d.bobV3} /><Out code={d.bobV3Out} /></>}
      />

      <P>トランザクションを作成します。</P>
      <Pick ver={ver}
        v2={<Code code={d.txV2} />}
        v3={<>
          <P>v3 では <C>Descriptor</C> によりトランザクションのタイプや必要な情報を指定します。</P>
          <Code code={d.txV3} />
          <Fold title="Descriptor 実装前 (symbol-sdk v3.2.1 まで)">
            <P>v3.2.1 までは <C>Descriptor</C> が無く、トランザクションの情報を Object 型で指定してトランザクションを作成する必要がありました。v3.2.2 以降も Object 型で指定して作成することはできますが、タイプ名の誤りやキー指定誤り等のリスクをなくすため、以降は <C>Descriptor</C> を利用してコードを記述します。</P>
            <Snip code={d.txV3Old} />
          </Fold>
        </>}
      />
      <P>各設定項目について説明します。</P>

      <H4>有効期限</H4>
      <P>sdk v2 ではデフォルトで2時間後に設定されます。最大6時間まで指定可能です。</P>
      <Pick ver={ver}
        v2={<Snip code={d.deadlineV2} />}
        v3={<>
          <P><C>facade.createTransactionFromTypedDescriptor()</C> の第4引数に秒単位で指定します。</P>
          <Snip code={d.deadlineV3} />
          <Fold title="createTransactionFromTypedDescriptor() 実装前 (symbol-sdk v3.2.1 まで)">
            <P>v3.2.1 までは <C>facade.network.fromDatetime()</C> を利用して有効期間を指定していました。</P>
            <Snip code={d.deadlineV3Old} />
            <Fold title="symbol-sdk v3.2.0 での注意点">
              <P>v3.2.0 では、facade.network.fromDatetime()でネットワークのタイムスタンプを取得すると、内部処理でオーバーフローしてエラーとなってしまいます。このため、 v3.2.0 を使用する場合は、事前にネットワークのタイムスタンプを算出しておきます。</P>
              <Snip code={d.deadlineV320} />
            </Fold>
          </Fold>
        </>}
      />

      <H4>メッセージ</H4>
      <P>トランザクションに最大1023バイトのメッセージを添付することができます。バイナリデータであってもrawdataとして送信することが可能です。</P>

      <H5>空メッセージ</H5>
      <Pick ver={ver} v2={<Snip code={d.msgEmptyV2} />} v3={<Code code={d.msgEmptyV3} />} />

      <H5>平文メッセージ</H5>
      <Pick ver={ver}
        v2={<Snip code={d.msgPlainV2} />}
        v3={<>
          <P>v3 では、平文メッセージの場合は文字列そのままで指定することができます。</P>
          <Code code={d.msgPlainV3} />
          <P>先頭にメッセージタイプ <C>0x00</C> を付加する場合は以下のように指定します。</P>
          <Code code={d.msgPlainV3Type} />
          <P>エクスプローラーやデスクトップウォレットはこのフラグで判別してメッセージを表示しています。</P>
          <Fold title="symbol-sdk v3.2.1 まで">
            <P>v3.2.1 までは他のメッセージタイプと同様、 Uint8Array 型で指定する必要があります。v3.2.2 以降も Uint8Array 型で指定できます。</P>
            <Code code={d.msgPlainV3Old} />
          </Fold>
        </>}
      />

      <H5>暗号文メッセージ</H5>
      <Pick ver={ver}
        v2={<>
          <Snip code={d.msgEncV2} />
          <P>EncryptedMessageを使用すると、「指定したメッセージが暗号化されています」という意味のフラグ（目印）がつきます。エクスプローラーやウォレットはそのフラグを参考にメッセージを無用にデコードしなかったり、非表示にしたりなどの処理を行います。このメソッドが暗号化をするわけではありません。</P>
        </>}
        v3={<>
          <P><C>MessageEncoder</C> を使用して暗号化すると、自動で暗号文メッセージを表すメッセージタイプ <C>0x01</C> が付加されます。</P>
          <Code code={d.msgEncV3} />
        </>}
      />

      <H5>生データ</H5>
      <Pick ver={ver}
        v2={<Snip code={d.msgRawV2} />}
        v3={<>
          <P>v3 では先頭に生データを表すメッセージタイプ <C>0xFF</C> を付加します。</P>
          <Code code={d.msgRawV3} />
        </>}
      />

      <H4>最大手数料</H4>
      <P>ネットワーク手数料については、常に少し多めに払っておけば問題はないのですが、最低限の知識は持っておく必要があります。アカウントはトランザクションを作成するときに、ここまでは手数料として払ってもいいという最大手数料を指定します。一方で、ノードはその時々で最も高い手数料となるトランザクションのみブロックにまとめて収穫しようとします。つまり、多く払ってもいいというトランザクションが他に多く存在すると承認されるまでの時間が長くなります。逆に、より少なく払いたいというトランザクションが多く存在し、その総額が大きい場合は、設定した最大額に満たない手数料額で送信が実現します。</P>
      <P>トランザクションサイズ x feeMultiprierというもので決定されます。176バイトだった場合 maxFee を100で設定すると 17600μXYM = 0.0176XYMを手数料として支払うことを許容します。feeMultiprier = 100として指定する方法とmaxFee = 17600 として指定する方法があります。</P>

      <H5>feeMultiprier = 100として指定する方法</H5>
      <Pick ver={ver}
        v2={<Snip code={d.feeMulV2} />}
        v3={<>
          <P><C>facade.createTransactionFromTypedDescriptor()</C> の第3引数で指定します。</P>
          <Snip code={d.feeMulV3} />
        </>}
      />

      <H5>maxFee = 17600 として指定する方法</H5>
      <Pick ver={ver} v2={<Snip code={d.maxFeeV2} />} v3={<Snip code={d.maxFeeV3} />} />
      <P>本書では以後、feeMultiprier = 100として指定する方法で統一して説明します。</P>

      <H>4.3 署名とアナウンス</H>
      <P>作成したトランザクションを秘密鍵で署名して、任意のノードを通じてアナウンスします。</P>

      <H3>署名</H3>
      <Pick ver={ver}
        v2={<>
          <Code code={d.signV2} />
          <Out code={d.signV2Out} />
          <P>トランザクションの署名にはAccountクラスとgenerationHash値が必要です。</P>
          <P>generationHash</P>
          <Ul>
            <Li>テストネット<Ul><Li><Box component="code" sx={{ ...mono, wordBreak: 'break-all' }}>49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4</Box></Li></Ul></Li>
            <Li>メインネット<Ul><Li><Box component="code" sx={{ ...mono, wordBreak: 'break-all' }}>57F7DA205008026C776CB6AED843393F04CD458E0AA2D9F1D5F31A402072B2D6</Box></Li></Ul></Li>
          </Ul>
          <P>generationHash値はそのブロックチェーンネットワークを一意に識別するための値です。同じ秘密鍵をもつ他のネットワークに使いまわされないようにそのネットワーク個別のハッシュ値を織り交ぜて署名済みトランザクションを作成します。</P>
        </>}
        v3={<><Code code={d.signV3} /><Out code={d.signV3Out} /></>}
      />

      <H3>アナウンス</H3>
      <Pick ver={ver}
        v2={<><Code code={d.announceV2} /><Out code={d.announceV2Out} /></>}
        v3={<><Code code={d.announceV3} /><Out code={d.announceV3Out} /></>}
      />
      <P>上記のスクリプトのように <C>packet n was pushed to the network</C> というレスポンスがあれば、トランザクションはノードに受理されたことになります。これはトランザクションのフォーマット等に異常が無かった程度の意味しかありません。Symbolではノードの応答速度を極限に高めるため、トランザクションの内容を検証するまえに受信結果の応答を返し接続を切断します。レスポンス値はこの情報を受け取ったにすぎません。フォーマットに異常があった場合は以下のようなメッセージ応答があります。</P>

      <H5>アナウンスに失敗した場合の応答例</H5>
      <Pick ver={ver} v2={<Out code={d.failV2Out} />} v3={<Out code={d.failV3Out} />} />

      <H>4.4 確認</H>
      <H3>ステータスの確認</H3>
      <P>ノードに受理されたトランザクションのステータスを確認</P>
      <Pick ver={ver}
        v2={<><Code code={d.statusV2} /><Out code={d.statusV2Out} /></>}
        v3={<><Code code={d.statusV3} /><Out code={d.statusV3Out} /></>}
      />
      <P>承認されると <C>group: "confirmed"</C> となっています。</P>
      <P>受理されたものの、エラーが発生していた場合は以下のような出力となります。トランザクションを書き直して再度アナウンスしてみてください。</P>
      <Out code={d.statusFailOut} />
      <P>以下のようにResourceNotFoundエラーが発生した場合はトランザクションが受理されていません。</P>
      <Out code={d.notFoundOut} />
      <P>考えられる可能性としては、トランザクションで指定した最大手数料が、ノードで設定された最低手数料に満たない場合や、アグリゲートトランザクションとしてアナウンスすることが求められているトランザクションを単体のトランザクションでアナウンスした場合に発生するようです。</P>

      <H3>承認確認</H3>
      <P>トランザクションがブロックに承認されるまでに30秒程度かかります。</P>

      <H4>エクスプローラーで確認</H4>
      <P>signedTx.hash で取得できるハッシュ値を使ってエクスプローラーで検索してみましょう。</P>
      <Pick ver={ver} v2={<Code code={d.hashV2} />} v3={<Code code={d.hashV3} />} />
      <Out code={d.hashOut} />
      <Ul>
        <Li>メインネット<Ul><Li><Ext href="https://symbol.fyi/transactions/661360E61C37E156B0BE18E52C9F3ED1022DCE846A4609D72DF9FA8A5B667747" /></Li></Ul></Li>
        <Li>テストネット<Ul><Li><Ext href="https://testnet.symbol.fyi/transactions/661360E61C37E156B0BE18E52C9F3ED1022DCE846A4609D72DF9FA8A5B667747" /></Li></Ul></Li>
      </Ul>

      <H4>SDKで確認</H4>
      <Pick ver={ver}
        v2={<><Code code={d.infoV2} /><Out code={d.infoV2Out} /></>}
        v3={<><Code code={d.infoV3} /><Out code={d.infoV3Out} /></>}
      />

      <H5>注意点</H5>
      <P>トランザクションはブロックで承認されたとしても、ロールバックが発生するとトランザクションの承認が取り消される場合があります。ブロックが承認された後、数ブロックの承認が進むと、ロールバックの発生する確率は減少していきます。また、Votingノードの投票で実施されるファイナライズブロックを待つことで、記録されたデータは確実なものとなります。</P>

      <H5>スクリプト例</H5>
      <P>トランザクションをアナウンスした後は以下のようなスクリプトを流すと、チェーンの状態を把握しやすくて便利です。</P>
      <Pick ver={ver} v2={<Code code={d.watchV2} />} v3={<Code code={d.watchV3} />} />

      <H>4.5 トランザクション履歴</H>
      <P>Aliceが送受信したトランザクション履歴を一覧で取得します。</P>
      <Pick ver={ver}
        v2={<>
          <Code code={d.histV2} />
          <Out code={d.histV2Out} />
          <P>TransactionTypeは以下の通りです。</P>
          <Out code={d.txTypes} />
          <P>MessageTypeは以下の通りです。</P>
          <Out code={d.msgTypes} />
        </>}
        v3={<>
          <Code code={d.histV3} />
          <Out code={d.histV3Out} />
          <P><C>transaction.type</C> は v2 の <C>TransactionType</C> と同じです。</P>
        </>}
      />

      <H>4.5.1 Txペイロード作成時のメッセージの差異</H>
      <Pick ver={ver}
        v2={<>
          <P>v2 ではメッセージは文字列で表されます。平文メッセージはそのままの文字列となり、暗号化メッセージや生データのようなバイナリデータのメッセージは16進数文字列に変換されます。</P>
          <Code code={d.payloadMsgV2} />
          <Out code={d.payloadMsgV2Out} />
        </>}
        v3={<>
          <P>一方で、 v3 ではメッセージはバイナリデータで表されます。平文メッセージはバイナリデータに変換され、暗号化メッセージや生データのようなバイナリデータはそのままのバイナリデータとなります。</P>
          <Code code={d.payloadMsgV3} />
          <Out code={d.payloadMsgV3Out} />
        </>}
      />
      <P>署名時にTxのペイロードを作成する際には、メッセージデータを16進数文字列に変換します。v2 では文字列データ、 v3 ではバイナリデータがメッセージデータとなりますが、 v2 における暗号化メッセージや生データは16進数文字列に変換されたものですので、元のデータから2回変換されることとなります。また、ブロックチェーン上のTxを取得して表示する際も同様に、 v2 では16進数文字列から戻すための変換が2回行われます。</P>
      <P>このようなメッセージデータの変換方法の違いから、Txを作成したSDKとバージョンが異なるSDKで読み込む際に正しく読み込まれない場合があります。</P>

      <H3>標準の方法でメッセージを読み込む</H3>
      <P>実際に異なるSDKバージョンでTxを読み込んでみます。まずはそれぞれのバージョンでTxを作成し、ブロックチェーン上にアナウンスします。</P>
      <Pick ver={ver}
        v2={<><Code code={d.sendEncV2} /><Out code={d.sendEncV2Out} /></>}
        v3={<><Code code={d.sendEncV3} /><Out code={d.sendEncV3Out} /></>}
      />
      <P>次に、Txを作成したバージョンと異なるバージョンのSDKでTxを読み込み、メッセージを表示してみます。</P>
      <P>※ このプロファイルでは SDK のバージョンを切り替えられません。もう一方のバージョンで読み込むには、別のプロファイルをそのバージョンで始めて、第2章の①〜③を実行し、Alice・Bobもそのバージョンで作り直してください。コード中のTxハッシュは例ですので、ご自身でアナウンスしたTxのハッシュに置き換えてください。</P>
      <Pick ver={ver}
        v2={<><Code code={d.readV2} /><Out code={d.readV2Out} /></>}
        v3={<><Code code={d.readV3} /><Out code={d.readV3Out} /></>}
      />

      <H3>v2 で作成したメッセージを v3 で読み込む</H3>
      <P>v2 で作成したメッセージを v3 で読み込むためには、16進数文字列から戻すための変換を2回行う必要があります。</P>
      <OnlyV v="v3" />
      <Code code={d.v2toV3} />
      <Out code={d.v2toV3Out} />
      <P>なお、v3.0.8 以降であれば、自動判別して復号を行うための関数 <C>tryDecodeDeprecated()</C> が用意されています。</P>
      <OnlyV v="v3" />
      <Code code={d.decDeprecatedV3} />

      <H3>v2 で読み込めるように v3 でメッセージを作成する</H3>
      <P>v2 で読み込めるようにするため、 v3 でメッセージを作成する際に16進数文字列への変換を2回行います。</P>
      <OnlyV v="v3" />
      <Code code={d.v3toV2Make} />
      <OnlyV v="v2" />
      <Code code={d.v3toV2Read} />
      <Out code={d.v3toV2Out} />
      <P>こちらも v3.0.8 以降であれば、 v2 向けに暗号化を行うための関数 <C>encodeDeprecated()</C> が用意されています。</P>
      <OnlyV v="v3" />
      <Code code={d.encDeprecatedV3} />

      <H>4.6 アグリゲートトランザクション</H>
      <P>Symbolでは複数のトランザクションを1ブロックにまとめてアナウンスすることができます。最大で100件のトランザクションをまとめることができます（連署者が異なる場合は25アカウントまでを連署指定可能）。以降の章で扱う内容にアグリゲートトランザクションへの理解が必要な機能が含まれますので、本章ではアグリゲートトランザクションのうち、簡単なものだけを紹介します。</P>

      <H3>起案者の署名だけが必要な場合</H3>
      <Pick ver={ver} v2={<Code code={d.aggV2} />} v3={<Code code={d.aggV3} />} />
      <P>まず、アグリゲートトランザクションに含めるトランザクションを作成します。このときDeadlineを指定する必要はありません。リスト化するときに、生成したトランザクションにtoAggregateを追加して送信元アカウントの公開鍵を指定します。ちなみに送信元アカウントと署名アカウントが <b>必ずしも一致するとは限りません</b> 。後の章での解説で「Bobの送信トランザクションをAliceが署名する」といった事が起こり得るためこのような書き方をします。これはSymbolブロックチェーンでトランザクションを扱ううえで最も重要な概念になります。なお、本章で扱うトランザクションは同じAliceですので、アグリゲートボンデッドトランザクションへの署名もAliceを指定します。</P>

      <H3>アグリゲートトランザクションにおける最大手数料</H3>
      <P>アグリゲートトランザクションも通常のトランザクション同様、最大手数料を直接指定する方法とfeeMultiprierで指定する方法があります。先の例では最大手数料を直接指定する方法を使用しました。ここではfeeMultiprierで指定する方法を紹介します。</P>
      <Pick ver={ver}
        v2={<Snip code={d.aggFeeV2} />}
        v3={<>
          <P><C>facade.createTransactionFromTypedDescriptor()</C> の第3引数に feeMultiprier、第5引数に連署者の数を指定します。</P>
          <Snip code={d.aggFeeV3} />
          <Fold title="createTransactionFromTypedDescriptor() 実装前 (symbol-sdk v3.2.1 まで)">
            <P>v3.2.1 までは連署により追加される連署情報のサイズを算出し、最終的なTxサイズから手数料を設定する必要があります。</P>
            <Snip code={d.aggFeeV3Old} />
          </Fold>
        </>}
      />

      <H>4.7 現場で使えるヒント</H>
      <H3>存在証明</H3>
      <P>アカウントの章でアカウントによるデータの署名と検証する方法について説明しました。このデータをトランザクションに載せてブロックチェーンが承認することで、アカウントがある時刻にあるデータの存在を認知したことを消すことができなくなります。タイムスタンプの刻印された電子署名を利害関係者間で所有することと同じ意味があると考えることもできます。（法律的な判断は他の方にお任せします）</P>
      <P>ブロックチェーンは、この消せない「アカウントが認知したという事実」の存在をもって送信などのデータ更新を行います。また、誰もがまだ知らないはずの事実を知っていたことの証明としてブロックチェーンを利用することもできます。ここでは、その存在が証明されたデータをトランザクションに載せる２つの方法について説明します。</P>

      <H4>デジタルデータのハッシュ値(SHA256)出力方法</H4>
      <P>ファイルの要約値をブロックチェーンに記録することでそのファイルの存在を証明することができます。</P>
      <P>各OSごとのファイルのSHA256でハッシュ値を計算する方法は下記の通りです。</P>
      <Snip code={d.hashSh} />

      <H4>大きなデータの分割</H4>
      <P>トランザクションのペイロードには1023バイトしか格納できないため、大きなデータは分割してペイロードに詰め込んでアグリゲートトランザクションにします。</P>
      <Code code={d.bigdata} />

      <Exercise ver={ver} no={4} />
    </>
  );
}
