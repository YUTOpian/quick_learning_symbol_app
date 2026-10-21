import type { ReactNode } from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Box, Typography } from '@mui/material';
import { Code, H, H3, H4, Out, P, mono } from './ui';
import type { Ver } from './Ch02';
import Exercise from './Exercise';
import * as d from './ch07/code';

// v2 / v3 でコードが違う箇所は、選択中のバージョンだけを表示する。
const Pick = ({ ver, v2, v3 }: { ver: Ver; v2: ReactNode; v3: ReactNode }) => <>{ver === 'v2' ? v2 : v3}</>;
const Fold = ({ title, children }: { title: string; children: ReactNode }) => (
  <Accordion disableGutters variant="outlined" sx={{ my: 1 }}>
    <AccordionSummary><Typography sx={{ fontWeight: 700 }}>{title}</Typography></AccordionSummary>
    <AccordionDetails>{children}</AccordionDetails>
  </Accordion>
);
// 本文中のインラインコード。
const C = ({ children }: { children: ReactNode }) => <Box component="code" sx={{ ...mono, bgcolor: 'action.hover', px: 0.6, py: 0.1, borderRadius: 0.5 }}>{children}</Box>;
// 引数を省略した断片や、値を自分で埋める必要があるコード（実行ボタンを出さない）。
const Snip = ({ code }: { code: string }) => <Code code={code} runnable={false} />;

// 速習Symbol: 第7章 メタデータ。
export default function Ch07({ ver }: { ver: Ver }) {
  return (
    <>
      <P>アカウント・モザイク・ネームスペースに対してKey-Value形式のデータを登録することができます。Valueの最大値は1024バイトです。本章ではモザイク・ネームスペースの作成アカウントとメタデータの作成アカウントがどちらもAliceであることを前提に説明します。</P>
      <P>本章のサンプルスクリプトを実行する前に以下を実行して必要ライブラリを読み込んでおいてください。</P>
      <Pick ver={ver}
        v2={<Code code={d.prepV2} />}
        v3={<>
          <P>v3 ではキーを生成するメソッドが無いため、 v2 と同様のキーを生成するためにハッシュライブラリをインポートする必要があります。</P>
          <Code code={d.prepV3} />
        </>}
      />

      <H>7.1 アカウントに登録</H>
      <P>アカウントに対して、Key-Value値を登録します。</P>
      <Pick ver={ver}
        v2={<Code code={d.accV2} />}
        v3={<>
          <Code code={d.accV3} />
          <Fold title="symbol-sdk v3.2.1 まで">
            <P>v3.2.2 で <C>metadataGenerateKey()</C> が実装されたことにより、 v2 と同じメタデータキーを生成することができるようになりました。v3.2.1 までにおける、 v2 と同じメタデータキーを導出するプログラムは以下となります。</P>
            <Snip code={d.accOldKey} />
            <P>また、 <C>metadataUpdateValue()</C> が実装されたことにより、メタデータの差分データ生成が簡単になりました。v3.2.1 までにおける、メタデータの差分データ生成プログラムは以下となります。</P>
            <Snip code={d.accOldDiff} />
          </Fold>
        </>}
      />
      <P>メタデータの登録には記録先アカウントが承諾を示す署名が必要です。また、記録先アカウントと記録者アカウントが同一でもアグリゲートトランザクションにする必要があります。</P>
      <P>異なるアカウントのメタデータに登録する場合は署名時に <C>signTransactionWithCosignatories</C> を使用します。</P>
      <Pick ver={ver} v2={<Code code={d.accBobV2} />} v3={<Code code={d.accBobV3} />} />
      <P>bobの秘密鍵が分からない場合はこの後の章で説明するアグリゲートボンデッドトランザクション、あるいはオフライン署名を使用する必要があります。</P>

      <H>7.2 モザイクに登録</H>
      <P>ターゲットとなるモザイクに対して、Key値・ソースアカウントの複合キーでValue値を登録します。登録・更新にはモザイクを作成したアカウントの署名が必要です。</P>
      <P>コード中のモザイクID（<C>1275B0B7511D9161</C>）は例です。第5章で作成した、ご自身のモザイクのIDに置き換えてください。</P>
      <Pick ver={ver} v2={<Snip code={d.mosV2} />} v3={<Snip code={d.mosV3} />} />

      <H>7.3 ネームスペースに登録</H>
      <P>ネームスペースに対して、Key-Value値を登録します。登録・更新にはネームスペースを作成したアカウントの署名が必要です。</P>
      <P>ネームスペース名（<C>xembook</C>）は、第6章でご自身が取得したものに置き換えてください。</P>
      <Pick ver={ver} v2={<Code code={d.nsV2} />} v3={<Code code={d.nsV3} />} />

      <H>7.4 確認</H>
      <P>登録したメタデータを確認します。</P>
      <Pick ver={ver}
        v2={<><Code code={d.listV2} /><Out code={d.listV2Out} /></>}
        v3={<><Code code={d.listV3} /><Out code={d.listV3Out} /></>}
      />
      <P>metadataTypeは以下の通りです。</P>
      <Out code={d.mdTypesOut} />

      <H3>注意事項</H3>
      <P>メタデータはキー値で素早く情報にアクセスできるというメリットがある一方で更新可能であることに注意しておく必要があります。更新には、発行者アカウントと登録先アカウントの署名が必要のため、それらのアカウントの管理状態が信用できる場合のみ使用するようにしてください。</P>

      <H>7.5 現場で使えるヒント</H>
      <H3>有資格証明</H3>
      <P>モザイクの章で所有証明、ネームスペースの章でドメインリンクの説明をしました。実社会で信頼性の高いドメインからリンクされたアカウントが発行したメタデータの付与を受けることでそのドメイン内での有資格情報の所有を証明することができます。</P>

      <H4>DID</H4>
      <P>分散型アイデンティティと呼ばれます。エコシステムは発行者、所有者、検証者に分かれ、例えば大学が発行した卒業証書を学生が所有し、企業は学生から提示された証明書を大学が公表している公開鍵をもとに検証します。このやりとりにプラットフォームに依存する情報はありません。メタデータを活用することで、大学は学生の所有するアカウントにメタデータを発行することができ、企業は大学の公開鍵と学生のモザイク(アカウント)所有証明でメタデータに記載された卒業証明を検証することができます。</P>

      <Exercise ver={ver} no={7} />
    </>
  );
}
