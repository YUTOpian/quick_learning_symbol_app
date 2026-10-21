import type { ReactNode } from 'react';
import { Box } from '@mui/material';
import { Code, H, H3, Out, P, mono } from './ui';
import type { Ver } from './Ch02';
import Exercise from './Exercise';
import * as d from './ch08/code';

// v2 / v3 でコードが違う箇所は、選択中のバージョンだけを表示する。
const Pick = ({ ver, v2, v3 }: { ver: Ver; v2: ReactNode; v3: ReactNode }) => <>{ver === 'v2' ? v2 : v3}</>;
// 本文中のインラインコード。
const C = ({ children }: { children: ReactNode }) => <Box component="code" sx={{ ...mono, bgcolor: 'action.hover', px: 0.6, py: 0.1, borderRadius: 0.5 }}>{children}</Box>;

// 速習Symbol: 第8章 ロック。
export default function Ch08({ ver }: { ver: Ver }) {
  return (
    <>
      <P>Symbolブロックチェーンにはハッシュロックとシークレットロックの２種類のロック機構があります。</P>

      <H>8.1 ハッシュロック</H>
      <P>ハッシュロックは後でアナウンスされる予定のトランザクションを事前にハッシュ値で登録しておくことで、該当トランザクションがアナウンスされた場合に、そのトランザクションをAPIノード上で処理せずにロックさせて、署名が集まってから処理を行うことができます。アカウントが所有するモザイクを操作できないようにロックするわけではなく、ロックされるのはハッシュ値の対象となるトランザクションとなります。ハッシュロックにかかる費用は10XYM、有効期限は最大約48時間です。ロックしたトランザクションが承認されれば10XYMは返却されます。</P>

      <H3>アグリゲートボンデッドトランザクションの作成</H3>
      <Pick ver={ver} v2={<Code code={d.aggV2} />} v3={<Code code={d.aggV3} />} />
      <P>tx1,tx2の2つのトランザクションをaggregateArrayで配列にする時に、送信元アカウントの公開鍵を指定します。公開鍵はアカウントの章を参考に事前にAPIで取得しておきましょう。配列化されたトランザクションはブロック承認時にその順序で整合性を検証されます。例えば、tx1でNFTをAliceからBobへ送信した後、tx2でBobからCarolへ同じNFTを送信することは可能ですが、tx2,tx1の順序でアグリゲートトランザクションを通知するとエラーになります。また、アグリゲートトランザクションの中に1つでも整合性の合わないトランザクションが存在していると、アグリゲートトランザクション全体がエラーとなってチェーンに承認されることはありません。</P>

      <H3>ハッシュロックトランザクションの作成と署名、アナウンス</H3>
      <Pick ver={ver} v2={<Code code={d.hashLockV2} />} v3={<Code code={d.hashLockV3} />} />

      <H3>アグリゲートボンデッドトランザクションのアナウンス</H3>
      <P>エクスプローラーなどで確認した後、ボンデッドトランザクションをネットワークにアナウンスします。</P>
      <Pick ver={ver} v2={<Code code={d.announceV2} />} v3={<Code code={d.announceV3} />} />

      <H3>連署</H3>
      <P>ロックされたトランザクションを指定されたアカウント(Bob)で連署します。</P>
      <Pick ver={ver} v2={<Code code={d.cosignV2} />} v3={<Code code={d.cosignV3} />} />

      <H3>注意点</H3>
      <P>ハッシュロックトランザクションは起案者(トランザクションを作成し最初に署名するアカウント)に限らず、誰が作成してアナウンスしても大丈夫ですが、アグリゲートトランザクションにそのアカウントがsignerとなるトランザクションを含めるようにしてください。モザイク送信無し＆メッセージ無しのダミートランザクションでも問題ありません（パフォーマンスに影響が出るための仕様とのことです）。また、ハッシュロックトランザクションが承認された直後にボンデッドトランザクションをアナウンスした場合、ハッシュロックの承認がネットワーク全体に伝播する前にボンデッドトランザクションを受け取ってしまうノードが出てくる可能性があります。そのような状態を防ぐために、ボンデッドトランザクションはハッシュロックトランザクションが承認された後しばらく待ってからアナウンスするようにしてください。</P>

      <H>8.2 シークレットロック・シークレットプルーフ</H>
      <P>シークレットロックは事前に共通パスワードを作成しておき、指定モザイクをロックします。受信者が有効期限内にパスワードの所有を証明することができればロックされたモザイクを受け取ることができる仕組みです。</P>
      <P>ここではAliceが1XYMをロックしてBobが解除することで受信する方法を説明します。</P>
      <P>まずはAliceとやり取りするBobアカウントを作成します。ロック解除にBob側からトランザクションをアナウンスする必要があるのでFAUCETで10XYMほど受信しておきます。</P>
      <Pick ver={ver} v2={<Code code={d.bobV2} />} v3={<Code code={d.bobV3} />} />

      <H3>シークレットロック</H3>
      <P>ロック・解除にかかわる共通暗号を作成します。</P>
      <Pick ver={ver}
        v2={<><Code code={d.secretV2} /><Out code={d.secretOutV2} /></>}
        v3={<><Code code={d.secretV3} /><Out code={d.secretOutV3} /></>}
      />
      <P>トランザクションを作成・署名・アナウンスします。</P>
      <Pick ver={ver} v2={<Code code={d.lockV2} />} v3={<Code code={d.lockV3} />} />
      <P>LockHashAlgorithmは以下の通りです。</P>
      <Out code={d.algoOut} />
      <P>ロック時に解除先を指定するのでBob以外のアカウントが解除しても転送先（Bob）を変更することはできません。ロック期間は最長で365日(ブロック数を日換算)までです。</P>
      <P>承認されたトランザクションを確認します。</P>
      <Pick ver={ver}
        v2={<><Code code={d.lockInfoV2} /><Out code={d.lockInfoV2Out} /></>}
        v3={<><Code code={d.lockInfoV3} /><Out code={d.lockInfoV3Out} /></>}
      />
      <P>ロックしたAliceがownerAddress、受信予定のBobがrecipientAddressに記録されています。secret情報が公開されていて、これに対応するproofをBobがネットワークに通知します。</P>

      <H3>シークレットプルーフ</H3>
      <P>解除用キーワードを使用してロック解除します。Bobは事前に解除用キーワードを入手しておく必要があります。</P>
      <Pick ver={ver} v2={<Code code={d.proofV2} />} v3={<Code code={d.proofV3} />} />
      <P>承認結果を確認します。</P>
      <Pick ver={ver}
        v2={<><Code code={d.proofInfoV2} /><Out code={d.proofInfoV2Out} /></>}
        v3={<><Code code={d.proofInfoV3} /><Out code={d.proofInfoV3Out} /></>}
      />
      <P>SecretProofTransactionにはモザイクの受信量の情報は含まれていません。ブロック生成時に作成されるレシートで受信量を確認します。レシートタイプ:LockSecret_Completed でBob宛のレシートを検索してみます。</P>
      <Pick ver={ver}
        v2={<><Code code={d.rcpV2} /><Out code={d.rcpV2Out} /></>}
        v3={<><Code code={d.rcpV3} /><Out code={d.rcpV3Out} /></>}
      />
      <P>ReceiptTypeは以下の通りです。</P>
      <Out code={d.rcpTypesOut} />
      <P><C>8786: 'LockSecret_Completed'</C> はロック解除完了、<C>9042: 'LockSecret_Expired'</C> はロック期限切れを表します。</P>

      <H>8.3 現場で使えるヒント</H>
      <H3>手数料代払い</H3>
      <P>一般的にブロックチェーンはトランザクション送信に手数料を必要とします。そのため、ブロックチェーンを利用しようとするユーザは事前に手数料を取引所から入手しておく必要があります。このユーザが企業である場合はその管理方法も加えてさらにハードルの高い問題となります。アグリゲートトランザクションを使用することでハッシュロック費用とネットワーク手数料をサービス提供者が代理で負担することができます。</P>

      <H3>タイマー送信</H3>
      <P>シークレットロックは指定ブロック数を経過すると元のアカウントへ払い戻されます。この原理を利用して、シークレットロックしたアカウントにたいしてロック分の費用をサービス提供者が充足しておけば、期限が過ぎた後ユーザ側がロック分のトークン所有量が増加することになります。一方で、期限が過ぎる前にシークレット証明トランザクションをアナウンスすると、送信が完了し、サービス提供者に充当戻るためキャンセル扱いとなります。</P>

      <H3>アトミックスワップ</H3>
      <P>シークレットロックを使用して、他のチェーンとのトークン・モザイクの交換を行うことができます。他のチェーンではハッシュタイムロックコントラクト(HTLC)と呼ばれているためハッシュロックと間違えないようにご注意ください。</P>

      <Exercise ver={ver} no={8} />
    </>
  );
}
