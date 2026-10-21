import type { ReactNode } from 'react';
import { Box } from '@mui/material';
import { Code, H, H3, Out, P, mono } from './ui';
import type { Ver } from './Ch02';
import Exercise from './Exercise';
import * as d from './ch13/code';

// v2 / v3 でコードが違う箇所は、選択中のバージョンだけを表示する。
const Pick = ({ ver, v2, v3 }: { ver: Ver; v2: ReactNode; v3: ReactNode }) => <>{ver === 'v2' ? v2 : v3}</>;
// 本文中のインラインコード。
const C = ({ children }: { children: ReactNode }) => <Box component="code" sx={{ ...mono, bgcolor: 'action.hover', px: 0.6, py: 0.1, borderRadius: 0.5 }}>{children}</Box>;
// 箇条書き。
const Ul = ({ children }: { children: ReactNode }) => <Box component="ul" sx={{ my: 0.5, pl: 3, lineHeight: 1.95 }}>{children}</Box>;
const Li = ({ children }: { children: ReactNode }) => <Box component="li">{children}</Box>;

// 速習Symbol: 第13章 検証。
export default function Ch13({ ver }: { ver: Ver }) {
  return (
    <>
      <P>ブロックチェーン上に記録されたさまざまな情報を検証します。ブロックチェーンへのデータ記録は全ノードの合意を持って行われますが、ブロックチェーンへの<strong>データ参照</strong>はノード単体からの情報取得であるため、信用できないノードの情報を元にして新たな取引を行いたい場合は、ノードから取得したデータに対して検証を行う必要があります。</P>

      <H>13.1 トランザクションの検証</H>
      <P>トランザクションがブロックヘッダーに含まれていることを検証します。この検証が成功すれば、トランザクションがブロックチェーンの合意によって承認されたものとみなすことができます。</P>
      <P>本章のサンプルスクリプトを実行する前に以下を実行して必要ライブラリを読み込んでおいてください。</P>
      <Pick ver={ver} v2={<Code code={d.prepV2} />} v3={<Code code={d.prepV3} />} />

      <H3>検証するペイロード</H3>
      <P>今回検証するトランザクションペイロードとそのトランザクションが記録されているとされるブロック高です。</P>
      <Code code={d.payload} />
      <P>※後の工程で署名者の検証も行うため、前章までに alice や bob で実際に発行したトランザクションペイロードとブロック高を使用してください。</P>

      <H3>payload確認</H3>
      <P>トランザクションの内容を確認します。</P>
      <Pick ver={ver}
        v2={<><Code code={d.checkV2} /><Out code={d.checkV2Out} /></>}
        v3={<><Code code={d.checkV3} /><Out code={d.checkV3Out} /></>}
      />

      <H3>署名者の検証</H3>
      <P>トランザクションがブロックに含まれていることが確認できれば自明ですが、念のため、アカウントの公開鍵でトランザクションの署名を検証しておきます。</P>
      <Pick ver={ver}
        v2={<>
          <Code code={d.signerV2} />
          <Out code={d.signerV2Out} />
          <P>getSigningBytesで署名の対象となる部分だけを取り出しています。通常のトランザクションとアグリゲートトランザクションでは取り出す部分が異なるので注意が必要です。</P>
        </>}
        v3={<>
          <Code code={d.signerV3} />
          <Out code={d.signerV3Out} />
          <P>v3 でも <C>verifyTransaction()</C> で署名の対象となる部分だけを取り出しています。</P>
        </>}
      />

      <H3>マークルコンポーネントハッシュの計算</H3>
      <P>トランザクションのハッシュ値には連署者の情報が含まれていません。一方でブロックヘッダーに格納されるマークルルートはトランザクションのハッシュに連署者の情報が含めたものが格納されます。そのためトランザクションがブロック内部に存在しているかどうかを検証する場合は、トランザクションハッシュをマークルコンポーネントハッシュに変換しておく必要があります。</P>
      <Pick ver={ver} v2={<Code code={d.merkleV2} />} v3={<Code code={d.merkleV3} />} />
      <Out code={d.merkleOut} />

      <H3>InBlockの検証</H3>
      <P>ノードからマークルツリーを取得し、先ほど計算したmerkleComponentHashからブロックヘッダーのマークルルートが導出できることを確認します。</P>
      <Pick ver={ver} v2={<Code code={d.inBlockV2} />} v3={<Code code={d.inBlockV3} />} />
      <Out code={d.inBlockOut} />
      <P>トランザクションの情報がブロックヘッダーに含まれていることが確認できました。</P>

      <H>13.2 ブロックヘッダーの検証</H>
      <P>既知のブロックハッシュ値（例：ファイナライズブロック）から、検証中のブロックヘッダーまでたどれることを検証します。</P>

      <H3>normalブロックの検証</H3>
      <Pick ver={ver} v2={<Code code={d.normalV2} />} v3={<Code code={d.normalV3} />} />
      <P>true が出力されればこのブロックハッシュは前ブロックハッシュ値の存在を認知していることになります。同様にしてn番目のブロックがn-1番目のブロックを存在を確認し、最後に検証中のブロックにたどり着きます。</P>
      <P>これで、どのノードに問い合わせても確認可能な既知のファイナライズブロックが、検証したいブロックの存在に支えられていることが分かりました。</P>

      <H3>importanceブロックの検証</H3>
      <P>importanceBlockは、importance値の再計算が行われるブロック(720ブロック毎、テストネットは180ブロック毎)です。NormalBlockに加えて以下の情報が追加されています。</P>
      <Ul>
        <Li>votingEligibleAccountsCount</Li>
        <Li>harvestingEligibleAccountsCount</Li>
        <Li>totalVotingBalance</Li>
        <Li>previousImportanceBlockHash</Li>
      </Ul>
      <Pick ver={ver} v2={<Code code={d.importV2} />} v3={<Code code={d.importV3} />} />
      <P>後述するアカウントやメタデータの検証のために、stateHashSubCacheMerkleRootsを検証しておきます。</P>

      <H3>stateHashの検証</H3>
      <Pick ver={ver}
        v2={<>
          <Code code={d.stateShowV2} />
          <Out code={d.stateShowV2Out} />
          <Code code={d.stateCalcV2} />
          <Out code={d.stateCalcV2Out} />
        </>}
        v3={<>
          <Code code={d.stateShowV3} />
          <Out code={d.stateShowV3Out} />
          <Code code={d.stateCalcV3} />
          <Out code={d.stateCalcV3Out} />
        </>}
      />
      <P>ブロックヘッダーの検証に利用した9個のstateがstateHashSubCacheMerkleRootsから構成されていることがわかります。</P>

      <H>13.3 アカウント・メタデータの検証</H>
      <P>マークルパトリシアツリーを利用して、トランザクションに紐づくアカウントやメタデータの存在を検証します。サービス提供者がマークルパトリシアツリーを提供すれば、利用者は自分の意志で選択したノードを使ってその真偽を検証することができます。</P>
      <P>以降のコードの、アドレス・メタデータキー・モザイクIDは例です。前章までにご自身が登録したものに置き換えてください。</P>

      <H3>検証用共通関数</H3>
      <Pick ver={ver} v2={<Code code={d.funcsV2} />} v3={<Code code={d.funcsV3} />} />

      <H3>13.3.1 アカウント情報の検証</H3>
      <P>アカウント情報を葉として、マークルツリー上の分岐する枝をアドレスでたどり、ルートに到着できるかを確認します。</P>
      <Pick ver={ver} v2={<Code code={d.accV2} />} v3={<Code code={d.accV3} />} />

      <H3>13.3.2 モザイクへ登録したメタデータの検証</H3>
      <P>モザイクに登録したメタデータValue値を葉として、マークルツリー上の分岐する枝をメタデータキーで構成されるハッシュ値でたどり、ルートに到着できるかを確認します。</P>
      <Pick ver={ver} v2={<Code code={d.mosV2} />} v3={<Code code={d.mosV3} />} />

      <H3>13.3.3 アカウントへ登録したメタデータの検証</H3>
      <P>アカウントに登録したメタデータValue値を葉として、マークルツリー上の分岐する枝をメタデータキーで構成されるハッシュ値でたどり、ルートに到着できるかを確認します。</P>
      <Pick ver={ver} v2={<Code code={d.accMetaV2} />} v3={<Code code={d.accMetaV3} />} />

      <H>13.4 現場で使えるヒント</H>
      <H3>トラステッドウェブ</H3>
      <P>トラステッドウェブを簡単に説明すると、全てをプラットフォーマーに依存せず、かつ全てを検証せずに済むWebの実現です。</P>
      <P>本章の検証で分かることは、ブロックチェーンが持つすべての情報はブロックヘッダーのハッシュ値によって検証可能ということです。ブロックチェーンはみんなが認め合うブロックヘッダーの共有とそれを再現できるフルノードの存在で成り立っています。しかし、ブロックチェーンを活用したいあらゆるシーンでこれらを検証するための環境を維持しておくことは非常に困難です。最新のブロックヘッダーが複数の信頼できる機関から常時ブロードキャストされていれば、検証の手間を大きく省くことができます。このようなインフラが整えば、都会などの数千万人が密集する超過密地帯、あるいは基地局が十分に配置できない僻地や災害時の広域ネットワーク遮断時などブロックチェーンの能力を超えた場所においても信頼できる情報にアクセスできるようになります。</P>

      <Exercise ver={ver} no={13} />
    </>
  );
}
