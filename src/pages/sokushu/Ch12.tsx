import type { ReactNode } from 'react';
import { Code, H, H3, Out, P } from './ui';
import type { Ver } from './Ch02';
import Exercise from './Exercise';
import * as d from './ch12/code';

// v2 / v3 でコードが違う箇所は、選択中のバージョンだけを表示する。
const Pick = ({ ver, v2, v3 }: { ver: Ver; v2: ReactNode; v3: ReactNode }) => <>{ver === 'v2' ? v2 : v3}</>;

// 速習Symbol: 第12章 オフライン署名。
export default function Ch12({ ver }: { ver: Ver }) {
  return (
    <>
      <P>ロック機構の章で、アナウンスしたトランザクションをハッシュ値指定でロックして、複数の署名（オンライン署名）を集めるアグリゲートトランザクションを紹介しました。この章では、トランザクションを事前に署名を集めてノードにアナウンスするオフライン署名について説明します。</P>

      <H>手順</H>
      <P>Aliceが起案者となりトランザクションを作成し、署名します。次にBobが署名してAliceに返します。最後にAliceがトランザクションを結合してネットワークにアナウンスします。</P>

      <H>12.1 トランザクション作成</H>
      <Pick ver={ver} v2={<Code code={d.createV2} />} v3={<Code code={d.createV3} />} />
      <Out code={d.createOut} />
      <P>署名を行い、signedHash,signedPayloadを出力します。signedPayloadをBobに渡して署名を促します。</P>

      <H>12.2 Bobによる連署</H>
      <P>Aliceから受け取ったsignedPayloadでトランザクションを復元します。</P>
      <Pick ver={ver}
        v2={<><Code code={d.restoreV2} /><Out code={d.restoreV2Out} /></>}
        v3={<><Code code={d.restoreV3} /><Out code={d.restoreV3Out} /></>}
      />
      <P>念のため、Aliceがすでに署名したトランザクション（ペイロード）かどうかを検証します。</P>
      <Pick ver={ver} v2={<Code code={d.verifyV2} />} v3={<Code code={d.verifyV3} />} />
      <Out code={d.verifyOut} />
      <P>ペイロードがsigner、つまりAliceによって署名されたものであることが確認できました。次にBobが連署します。</P>
      <Pick ver={ver} v2={<Code code={d.cosignV2} />} v3={<Code code={d.cosignV3} />} />
      <P>CosignatureTransactionで署名を行い、bobSignedTxSignature,bobSignedTxSignerPublicKeyを出力しAliceに返却します。Bobが全ての署名を揃えられる場合は、Aliceに返却しなくてもBobがアナウンスすることも可能です。</P>

      <H>12.3 Aliceによるアナウンス</H>
      <P>AliceはBobからbobSignedTxSignature,bobSignedTxSignerPublicKeyを受け取ります。また事前にAlice自身で作成したsignedPayloadを用意します。</P>
      <Pick ver={ver}
        v2={<>
          <Code code={d.announceV2} />
          <P>後半部分の連署を追加する部分がPayload(サイズ値)を直接操作しているので少し難しいかもしれません。Aliceの秘密鍵で再度署名できる場合はcosignSignedTxsを生成した後、以下のように連署済みトランザクションを生成することも可能です。</P>
          <Code code={d.resignV2} />
        </>}
        v3={<Code code={d.announceV3} />}
      />

      <H>12.4 現場で使えるヒント</H>
      <H3>マーケットプレイスレス</H3>
      <P>ボンデッドトランザクションと異なりハッシュロックのための手数料(10XYM)を気にする必要がありません。ペイロードを共有できる場が存在する場合、売り手は考えられるすべての買い手候補に対してペイロードを作成して交渉開始を待つことができます。（複数のトランザクションが個別に実行されないように、1つしか存在しない領収書NFTをアグリゲートトランザクションに混ぜ込むなどして排他制御をしてください）。この交渉に専用のマーケットプレイスを構築する必要はありません。SNSのタイムラインをマーケットプレイスにしたり、必要に応じて任意の時間や空間でワンタイムマーケットプレイスを展開することができます。</P>
      <P>ただ、オフラインで署名を交換するため、なりすましのハッシュ署名要求には気を付けましょう。（必ず検証可能なペイロードからハッシュを生成して署名するようにしてください）</P>

      <Exercise ver={ver} no={12} />
    </>
  );
}
