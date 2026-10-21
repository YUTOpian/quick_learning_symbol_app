import type { ReactNode } from 'react';
import { Box } from '@mui/material';
import { Code, H, H3, H4, Out, P, mono } from './ui';
import type { Ver } from './Ch02';
import Exercise from './Exercise';
import * as d from './ch05/code';

// v2 / v3 でコードが違う箇所は、選択中のバージョンだけを表示する。
const Pick = ({ ver, v2, v3 }: { ver: Ver; v2: ReactNode; v3: ReactNode }) => <>{ver === 'v2' ? v2 : v3}</>;
const Li = ({ children }: { children: ReactNode }) => <Box component="li" sx={{ lineHeight: 1.8 }}>{children}</Box>;
const Ul = ({ children }: { children: ReactNode }) => <Box component="ul" sx={{ my: 0.5, pl: 3 }}>{children}</Box>;
// 本文中のインラインコード。
const C = ({ children }: { children: ReactNode }) => <Box component="code" sx={{ ...mono, bgcolor: 'action.hover', px: 0.6, py: 0.1, borderRadius: 0.5 }}>{children}</Box>;
// md の ##### 見出し（H4 のひとつ下）。
const H5 = ({ children }: { children: ReactNode }) => <Box component="h5" sx={{ fontSize: '0.95rem', fontWeight: 700, mt: 2.5, mb: 0.5, color: 'text.secondary' }}>{children}</Box>;
// 引数を省略した断片など、そのままでは実行できないコード（実行ボタンを出さない）。
const Snip = ({ code }: { code: string }) => <Code code={code} runnable={false} />;

// 速習Symbol: 第5章 モザイク。
export default function Ch05({ ver }: { ver: Ver }) {
  return (
    <>
      <P>本章ではモザイクの設定とその生成方法について解説します。Symbolではトークンのことをモザイクと表現します。</P>
      <Box component="blockquote" sx={{ m: 0, my: 2, pl: 2, borderLeft: 4, borderColor: 'divider', color: 'text.secondary' }}>
        <P>Wikipediaによると、トークンとは「紀元前8000年頃から紀元前3000年までのメソポタミアの地層から出土する直径が1cm前後の粘土で作られたさまざまな形状の物体」のことを指します。一方でモザイクとは「小片を寄せあわせ埋め込んで、絵（図像）や模様を表す装飾美術の技法。石、陶磁器（モザイクタイル）、有色無色のガラス、貝殻、木などが使用され、建築物の床や壁面、あるいは工芸品の装飾のために施される。」とあります。SymbolにおいてモザイクとはSymbolが作りなすエコシステムの様相を表すさまざまな構成要素、と考えることができます。</P>
      </Box>

      <H>5.1 モザイク生成</H>
      <P>モザイクを生成するには、まず作成するモザイクを定義します。</P>
      <Pick ver={ver} v2={<Code code={d.defV2} />} v3={<Code code={d.defV3} />} />

      <P>MosaicFlagsは以下の通りです。</P>
      <Out code={d.flagsOut} />
      <P>数量変更、第三者への譲渡、モザイクグローバル制限の適用、発行者からの還収の可否について指定します。この項目は後で変更することはできません。</P>

      <H4>divisibility:可分性</H4>
      <P>可分性は小数点第何位まで数量の単位とするかを決めます。データは整数値として保持されます。</P>
      <Ul>
        <Li><C>divisibility:0</C> = 1</Li>
        <Li><C>divisibility:1</C> = 1.0</Li>
        <Li><C>divisibility:2</C> = 1.00</Li>
      </Ul>

      <H4>duration:有効期限</H4>
      <P>0を指定した場合、無期限に使用することができます。モザイク有効期限を設定した場合、期限が切れた後も消滅することはなくデータとしては残ります。アカウント1つにつき1000までしか所有することはできませんのでご注意ください。</P>

      <P>次に数量を変更します。</P>
      <Pick ver={ver} v2={<Code code={d.changeV2} />} v3={<Code code={d.changeV3} />} />
      <P><C>supplyMutable:false</C> の場合、全モザイクが発行者にある場合だけ数量の変更が可能です。<C>divisibility &gt; 0</C> の場合は、最小単位を1として整数値で定義してください。（<C>divisibility:2</C> で 1.00 作成したい場合は100と指定）</P>
      <P>MosaicSupplyChangeActionは以下の通りです。</P>
      <Out code={d.actionOut} />
      <P>増やしたい場合はIncreaseを指定します。上記2つのトランザクションをまとめてアグリゲートトランザクションを作成します。</P>
      <Pick ver={ver} v2={<Code code={d.aggV2} />} v3={<Code code={d.aggV3} />} />
      <P>アグリゲートトランザクションの特徴として、まだ存在していないモザイクの数量を変更しようとしている点に注目してください。配列化した時に、矛盾点がなければ1つのブロック内で問題なく処理することができます。</P>

      <H3>確認</H3>
      <P>モザイク作成したアカウントが持つモザイク情報を確認します。</P>
      <Pick ver={ver}
        v2={<><Code code={d.infoV2} /><Out code={d.infoV2Out} /></>}
        v3={<>
          <P>事前に第3章 3.3「アカウント情報の確認 - 所有モザイク一覧の取得」を実施して、<C>accountInfo</C> を取得しておいてください。</P>
          <Code code={d.infoV3} />
          <Out code={d.infoV3Out} />
        </>}
      />

      <H>5.2 モザイク送信</H>
      <P>作成したモザイクを送信します。よく、ブロックチェーンに初めて触れる方は、モザイク送信について「クライアント端末に保存されたモザイクを別のクライアント端末へ送信」することとイメージされている人がいますが、モザイク情報はすべてのノードで常に共有・同期化されており、送信先に未知のモザイク情報を届けることではありません。正確にはブロックチェーンへ「トランザクションを送信」することにより、アカウント間でのトークン残量を組み替える操作のことを言います。</P>
      <Pick ver={ver} v2={<Code code={d.sendV2} />} v3={<Code code={d.sendV3} />} />

      <H5>送信モザイクリスト</H5>
      <P>複数のモザイクを一度に送信できます。XYMを送信するには以下のモザイクIDを指定します。</P>
      <Ul>
        <Li>メインネット：<C>6BED913FA20223F8</C></Li>
        <Li>テストネット：<C>72C0212E67A08BCE</C></Li>
      </Ul>

      <H4>送信量</H4>
      <P>小数点もすべて整数にして指定します。XYMは可分性6なので、1XYM=1000000で指定します。</P>

      <H3>送信確認</H3>
      <Pick ver={ver}
        v2={<><Code code={d.confirmV2} /><Out code={d.confirmV2Out} /></>}
        v3={<><Code code={d.confirmV3} /><Out code={d.confirmV3Out} /></>}
      />
      <P>TransferTransactionのmosaicsに2種類のモザイクが送信されていることが確認できます。また、TransactionInfoに承認されたブロックの情報が記載されています。</P>

      <H>5.3 現場で使えるヒント</H>
      <H3>所有証明</H3>
      <P>前章でトランザクションによる存在証明について説明しました。アカウントの作成した送信指示が消せない形で残せるので、絶対につじつまの合う台帳を作ることができます。すべてのアカウントの「絶対に消せない送信指示」の蓄積結果として、各アカウントは自分のモザイク所有を証明することができます。</P>
      <P>（本ドキュメントでは所有を「自分の意思で手放すことができる状態」とします。少し話題がそれますが、法律的にはデジタルデータに所有権が認められていないのも、一度知ってしまったデータは自分の意志では忘れたことを他人に証明することができない点に注目すると「手放すことができる状態」の意味に納得がいくかもしれません。ブロックチェーンによりそのデータの放棄を明確に示すことができるのですが、詳しくは法律の専門の方にお任せします。）</P>

      <H4>NFT(non fungible token)</H4>
      <P>発行枚数を1に限定し、<C>supplyMutable</C> をfalseに設定することで、1つだけしか存在しないトークンを発行できます。モザイクは作成したアカウントアドレスを改ざんできない情報として保有しているので、そのアカウントの送信トランザクションをメタ情報として利用できます。7章で説明するメタデータをモザイクに登録する方法もありますが、その方法は登録アカウントとモザイク作成者の連署によって更新可能なことにご注意ください。</P>
      <P>NFTの実現方法はいろいろありますが、その一例の処理概要を以下に例示します（実行するためにはnonceやフラグ情報を適切に設定してください）。</P>
      <Pick ver={ver}
        v2={<Snip code={d.nftV2} />}
        v3={<>
          <P>モザイク作成から NFT データまでをまとめたアグリゲートトランザクションを作成します（署名・アナウンスは5.1と同じです）。</P>
          <Code code={d.nftV3} />
        </>}
      />
      <P>モザイク生成時のブロック高と作成アカウントがモザイク情報に含まれているので同ブロック内のトランザクションを検索することにより、紐づけられたNFTデータを取得することができます。</P>

      <H5>注意事項</H5>
      <P>モザイクの作成者が全数量を所有している場合、供給量を変更することが可能です。またトランザクションに分割してデータを記録した場合、改ざんできませんがデータの追記は可能です。NFTを運用する場合はモザイク作成者の秘密鍵を厳重に管理・あるいは破棄するなど、適切な運用にご注意ください。</P>

      <H4>回収可能なポイント運用</H4>
      <P><C>transferable</C> をfalseに設定することで転売が制限されるため、資金決済法の影響を受けにくいポイントを定義することができます。また <C>revokable</C> をtrueに設定することで、ユーザ側が秘密鍵を管理しなくても使用分を回収できるような中央管理型のポイント運用を行うことができます。</P>
      <Pick ver={ver} v2={<Snip code={d.pointFlagsV2} />} v3={<Code code={d.pointFlagsV3} />} />
      <P>トランザクションは以下のように記述します。回収するモザイクは5.1で作成したもの、回収先は5.2で送信した Bob です。</P>
      <Pick ver={ver} v2={<Code code={d.revokeV2} />} v3={<Code code={d.revokeV3} />} />

      <Exercise ver={ver} no={5} />
    </>
  );
}
