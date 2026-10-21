import type { ReactNode } from 'react';
import { Box } from '@mui/material';
import { Code, H, H3, H4, Out, P, mono } from './ui';
import type { Ver } from './Ch02';
import Exercise from './Exercise';
import * as d from './ch06/code';

// v2 / v3 でコードが違う箇所は、選択中のバージョンだけを表示する。
const Pick = ({ ver, v2, v3 }: { ver: Ver; v2: ReactNode; v3: ReactNode }) => <>{ver === 'v2' ? v2 : v3}</>;
// 本文中のインラインコード。
const C = ({ children }: { children: ReactNode }) => <Box component="code" sx={{ ...mono, bgcolor: 'action.hover', px: 0.6, py: 0.1, borderRadius: 0.5 }}>{children}</Box>;
// md の ##### 見出し（H4 のひとつ下）。
const H5 = ({ children }: { children: ReactNode }) => <Box component="h5" sx={{ fontSize: '0.95rem', fontWeight: 700, mt: 2.5, mb: 0.5, color: 'text.secondary' }}>{children}</Box>;
// 引数を省略した断片や、値を自分で埋める必要があるコード（実行ボタンを出さない）。
const Snip = ({ code }: { code: string }) => <Code code={code} runnable={false} />;

// 速習Symbol: 第6章 ネームスペース。
export default function Ch06({ ver }: { ver: Ver }) {
  return (
    <>
      <P>Symbolブロックチェーンではネームスペースをレンタルしてアドレスやモザイクに視認性の高い単語をリンクさせることができます。ネームスペースは最大64文字、利用可能な文字は <C>a, b, c, …, z, 0, 1, 2, …, 9, _ , -</C> です。</P>

      <H>6.1 手数料の計算</H>
      <P>ネームスペースのレンタルにはネットワーク手数料とは別にレンタル手数料が発生します。ネットワークの活性度に比例して価格が変動しますので、取得前に確認するようにしてください。</P>
      <P>ルートネームスペースを365日レンタルする場合の手数料を計算します。</P>
      <Pick ver={ver} v2={<Code code={d.feeV2} />} v3={<Code code={d.feeV3} />} />
      <Out code={d.feeOut} />
      <P>期間はブロック数で指定します。1ブロックを30秒として計算しました。最低で30日分はレンタルする必要があります（最大で1825日分）。</P>

      <P>サブネームスペースの取得手数料を計算します。</P>
      <Pick ver={ver} v2={<Code code={d.childFeeV2} />} v3={<Code code={d.childFeeV3} />} />
      <Out code={d.childFeeOut} />
      <P>サブネームスペースに期間指定はありません。ルートネームスペースをレンタルしている限り使用できます。</P>

      <H>6.2 レンタル</H>
      <P>ルートネームスペースをレンタルします(例:xembook)。</P>
      <Pick ver={ver} v2={<Code code={d.rootV2} />} v3={<Code code={d.rootV3} />} />

      <P>サブネームスペースをレンタルします(例:xembook.tomato)。</P>
      <Pick ver={ver} v2={<Code code={d.subV2} />} v3={<Code code={d.subV3} />} />

      <P>2階層目のサブネームスペースを作成したい場合は、例えば、xembook.tomato.morningを定義したい場合は以下のようにします。</P>
      <Pick ver={ver} v2={<Snip code={d.sub2V2} />} v3={<Snip code={d.sub2V3} />} />

      <H3>有効期限の計算</H3>
      <P>レンタル済みルートネームスペースの有効期限を計算します。</P>
      <Pick ver={ver} v2={<Code code={d.expV2} />} v3={<Code code={d.expV3} />} />
      <P>ネームスペース情報の終了ブロックを取得し、現在のブロック高から差し引いた残ブロック数に30秒(平均ブロック生成間隔)を掛け合わせた日時を出力します。テストネットでは設定した有効期限よりも1日程度更新期限が猶予されます。メインネットはこの値が30日となっていますのでご留意ください。</P>
      <Out code={d.expOut} />

      <H>6.3 リンク</H>
      <H3>アカウントへのリンク</H3>
      <Pick ver={ver} v2={<Code code={d.linkAddrV2} />} v3={<Code code={d.linkAddrV3} />} />
      <P>リンク先のアドレスは自分が所有していなくても問題ありません。</P>

      <H3>モザイクへリンク</H3>
      <P>モザイクIDの <C>xxxx</C> の部分は、ご自身が作成したモザイクのIDに置き換えてください。</P>
      <Pick ver={ver} v2={<Snip code={d.linkMosV2} />} v3={<Snip code={d.linkMosV3} />} />
      <P>モザイクを作成したアドレスと同一の場合のみリンクできるようです。</P>

      <H>6.4 未解決で使用</H>
      <P>送信先にUnresolvedAccountとして指定して、アドレスを特定しないままトランザクションを署名・アナウンスします。チェーン側で解決されたアカウントに対しての送信が実施されます。</P>
      <Pick ver={ver} v2={<Code code={d.unrAddrV2} />} v3={<Code code={d.unrAddrV3} />} />

      <P>送信モザイクにUnresolvedMosaicとして指定して、モザイクIDを特定しないままトランザクションを署名・アナウンスします。</P>
      <P><C>address</C> には送信先のアドレスを設定しておいてください。</P>
      <Pick ver={ver} v2={<Snip code={d.unrMosV2} />} v3={<Snip code={d.unrMosV3} />} />

      <P>XYMをネームスペースで使用する場合は以下のように指定します。</P>
      <Pick ver={ver}
        v2={<>
          <Code code={d.xymV2} />
          <Out code={d.xymV2Out} />
          <P>Idは内部ではUint64と呼ばれる数値 <C>{'{lower: 1106554862, higher: 3880491450}'}</C> で保持されています。</P>
        </>}
        v3={<><Code code={d.xymV3} /><Out code={d.xymV3Out} /></>}
      />

      <H>6.5 参照</H>
      <P>アドレスへリンクしたネームスペースを参照します。</P>
      <Pick ver={ver}
        v2={<><Code code={d.refAddrV2} /><Out code={d.refAddrV2Out} /></>}
        v3={<><Code code={d.refAddrV3} /><Out code={d.refAddrV3Out} /></>}
      />
      <P>AliasTypeは以下の通りです。</P>
      <Out code={d.aliasTypes} />
      <P>NamespaceRegistrationTypeは以下の通りです。</P>
      <Out code={d.nsRegTypes} />

      <P>モザイクへリンクしたネームスペースを参照します。</P>
      <Pick ver={ver}
        v2={<><Code code={d.refMosV2} /><Out code={d.refMosV2Out} /></>}
        v3={<><Code code={d.refMosV3} /><Out code={d.refMosV3Out} /></>}
      />

      <H3>逆引き</H3>
      <P>アドレスに紐づけられたネームスペースを全て調べます。</P>
      <Pick ver={ver} v2={<Code code={d.revAddrV2} />} v3={<Code code={d.revAddrV3} />} />
      <P>モザイクに紐づけられたネームスペースを全て調べます。</P>
      <Pick ver={ver} v2={<Code code={d.revMosV2} />} v3={<Code code={d.revMosV3} />} />

      <H3>レシートの参照</H3>
      <P>トランザクションに使用されたネームスペースをブロックチェーン側がどう解決したかを確認します。</P>
      <Pick ver={ver}
        v2={<>
          <Code code={d.rcpV2} />
          <Out code={d.rcpV2Out} />
          <P>ResolutionTypeは以下の通りです。</P>
          <Out code={d.resTypes} />
        </>}
        v3={<>
          <P>v3 では、ネームスペースを紐づけている対象によってアクセスする際のURLが異なります。</P>
          <H5>アドレスの場合</H5>
          <Code code={d.rcpAddrV3} />
          <H5>モザイクの場合</H5>
          <Code code={d.rcpMosV3} />
          <Out code={d.rcpV3Out} />
        </>}
      />
      <P>コード中の <C>height</C> には、6.4 で作成したトランザクションが取り込まれたブロック高を指定してください（例の 179401 は仮の値です）。</P>

      <H5>注意事項</H5>
      <P>ネームスペースはレンタル制のため、過去のトランザクションで使用したネームスペースのリンク先と現在のネームスペースのリンク先が異なる可能性があります。過去のデータを参照する際などに、その時どのアカウントにリンクしていたかなどを知りたい場合は必ずレシートを参照するようにしてください。</P>

      <H>6.6 現場で使えるヒント</H>
      <H3>外部ドメインとの相互リンク</H3>
      <P>ネームスペースは重複取得がプロトコル上制限されているため、インターネットドメインや実世界で周知されている商標名と同一のネームスペースを取得し、外部(公式サイトや印刷物など)からネームスペース存在の認知を公表することで、Symbol上のアカウントのブランド価値を構築することができます(法的な効力については調整が必要です)。外部ドメイン側のハッキングあるいは、Symbol側でのネームスペース更新忘れにはご注意ください。</P>

      <H4>ネームスペースを取得するアカウントについての注意</H4>
      <P>ネームスペースはレンタル期限という概念をもつ機能です。今のところ、取得したネームスペースは放棄か延長の選択肢しかありません。運用譲渡などが発生する可能性のあるシステムでネームスペース活用を検討する場合はマルチシグ化(9章)したアカウントでネームスペースを取得することをおすすめします。</P>

      <Exercise ver={ver} no={6} />
    </>
  );
}
