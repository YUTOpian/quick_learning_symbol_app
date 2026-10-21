import type { ReactNode } from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Box, Typography } from '@mui/material';
import { Code, Ext, H, H3, H4, Out, P } from './ui';
import type { Ver } from './Ch02';
import Exercise from './Exercise';
import * as c from './ch03/code';

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

// 速習Symbol: 第3章 アカウント。
export default function Ch03({ ver }: { ver: Ver }) {
  return (
    <>
      <P>アカウントは秘密鍵に紐づく情報が記録されたデータ構造体です。アカウントと関連づいた秘密鍵を使って署名することでのみブロックチェーンのデータを更新することができます。</P>

      <H>3.1 アカウント生成</H>
      <P>アカウントには秘密鍵と公開鍵をセットにしたキーペア、アドレスなどの情報が含まれています。まずはランダムにアカウントを作成して、それらの情報を確認してみましょう。</P>

      <H3>新規生成</H3>
      <Pick ver={ver}
        v2={<>
          <Code code={c.newV2} />
          <Out code={c.newV2Out} />
          <P>networkTypeは以下の通りです。</P>
          <Out code={c.networkTypes} />
        </>}
        v3={<>
          <Code code={c.newV3} />
          <Out code={c.newV3Out} />
          <Fold title="SymbolAccount クラス実装前 (symbol-sdk v3.2.1 まで)">
            <P>v3.2.1 までは SymbolAccount クラスが無いため、秘密鍵・公開鍵の鍵セットとアドレスを別々に作成する必要ありました。v3.2.2 以降も別々に作成することはできますが、データを別々に管理する手間やリスクを考慮し、以降は SymbolAccount クラスを利用してコードを記述します。</P>
            <Code code={c.newV3Old} />
            <Out code={c.newV3OldOut} />
          </Fold>
        </>}
      />

      <H3>秘密鍵と公開鍵の導出</H3>
      <Pick ver={ver} v2={<Code code={c.keysV2} />} v3={<Code code={c.keysV3} />} />
      <Out code={c.keysOut} />

      <H4>注意事項</H4>
      <P>秘密鍵を紛失するとそのアカウントに紐づけられたデータを操作することが出来なくなります。また、他人は知らないという秘密鍵の性質を利用してデータ操作の署名を行うので、秘密鍵を他人に教えてはいけません。組織のなかで秘密鍵を譲り受けて運用を続けるといった行為も控えましょう。</P>
      <P>一般的なWebサービスでは「アカウントID」に対してパスワードが割り振られるため、パスワードの変更が可能ですが、ブロックチェーンではパスワードにあたる秘密鍵に対して一意に決まるID(アドレス)が割り振られるため、アカウントに紐づく秘密鍵を変更するということはできません。</P>
      <P>ページを再読み込みすると、コンソールの変数 alice は消えます。コンソール上部の「アカウント」ボタンから、alice や bob などのアカウントを（秘密鍵をパスフレーズで暗号化して）このブラウザに最大10個まで保存し、次回以降に復元できます。アドレスや公開鍵もここで確認できます。</P>

      <H3>アドレスの導出</H3>
      <Pick ver={ver} v2={<Code code={c.rawAddressV2} />} v3={<Code code={c.rawAddressV3} />} />
      <Out code={c.rawAddressOut} />
      <P>これらがブロックチェーンを操作するための最も基本的な情報となります。また、秘密鍵からアカウントを生成したり、公開鍵やアドレスのみを扱うクラスの生成方法も確認しておきましょう。</P>

      <H3>秘密鍵からアカウント生成</H3>
      <Pick ver={ver} v2={<Code code={c.fromKeyV2} />} v3={<Code code={c.fromKeyV3} />} />

      <H3>公開鍵クラスの生成</H3>
      <Pick ver={ver}
        v2={<><Code code={c.pubAccV2} /><Out code={c.pubAccV2Out} /></>}
        v3={<><Code code={c.pubAccV3} /><Out code={c.pubAccV3Out} /></>}
      />

      <H3>アドレスクラスの生成</H3>
      <Pick ver={ver}
        v2={<><Code code={c.addrV2} /><Out code={c.addrV2Out} /></>}
        v3={<><Code code={c.addrV3} /><Out code={c.addrV3Out} /></>}
      />

      <H>3.2 アカウントへの送信</H>
      <P>アカウントを作成しただけでは、ブロックチェーンにデータを送信することはできません。パブリックブロックチェーンはリソースを有効活用するためにデータ送信時に手数料を要求します。Symbolブロックチェーンでは、この手数料をXYMという共通トークンで支払うことになります。アカウントを生成したら、この後の章から説明するトランザクションを実行するために必要な手数料を送信しておきます。</P>

      <H3>フォーセットから送信</H3>
      <P>テストネットではフォーセット（蛇口）サービスから検証用のXYMを入手することができます。メインネットの場合は取引所などでXYMを購入するか、投げ銭サービス(NEMLOG,QUEST)などを利用して寄付を募りましょう。</P>
      <P>テストネット</P>
      <Ul><Li>FAUCET(蛇口)<Ul><Li><Ext href="https://testnet.symbol.tools/" /></Li></Ul></Li></Ul>
      <P>メインネット</P>
      <Ul>
        <Li>NEMLOG<Ul><Li><Ext href="https://nemlog.nem.social/" /></Li></Ul></Li>
        <Li>QUEST<Ul><Li><Ext href="https://quest-bc.com/" /></Li></Ul></Li>
      </Ul>

      <H3>エクスプローラーで確認</H3>
      <P>フォーセットから作成したアカウントへ送信が成功したらエクスプローラーで確認してみましょう。</P>
      <Ul>
        <Li>テストネット<Ul><Li><Ext href="https://testnet.symbol.fyi/" /></Li></Ul></Li>
        <Li>メインネット<Ul><Li><Ext href="https://symbol.fyi/" /></Li></Ul></Li>
      </Ul>

      <H>3.3 アカウント情報の確認</H>
      <P>ノードに保存されているアカウント情報を取得します。</P>

      <H3>所有モザイク一覧の取得</H3>
      <Pick ver={ver}
        v2={<><Code code={c.infoV2} /><Out code={c.infoV2Out} /></>}
        v3={<><Code code={c.infoV3} /><Out code={c.infoV3Out} /></>}
      />

      <H4>publicKey</H4>
      <P>クライアント側で作成しただけで、ブロックチェーンでまだ利用されていないアカウント情報は記録されていません。宛先として指定されて受信することで初めてアカウント情報が記録され、署名したトランザクションを送信することで公開鍵の情報が記録されます。そのため、publicKeyは現在00000...表記となっています。</P>

      <Pick ver={ver}
        v2={<>
          <H4>UInt64 ※v2 のみ</H4>
          <P>JavaScriptでは大きすぎる数値はあふれてしまうため、idやamountはUInt64というsdkの独自フォーマットで管理されています。文字列に変換する場合は toString()、数値に変換する場合は compact()、16進数にする場合は toHex() で変換してください。</P>
          <Code code={c.uint64V2} />
          <P>大きすぎるid値をcompactで数値変換するとエラーが発生することがあります。Compacted value is greater than Number.Max_Value.</P>
        </>}
        v3={<>
          <H4>BigInt</H4>
          <P>v3 では UInt64 は定義されておらず、大きすぎる数値を表現するために JavaScript の BigInt が使用されています。以降の章で登場するため、ここで構文を紹介します。</P>
          <Code code={c.bigint} />
        </>}
      />

      <H3>表示桁数の調整</H3>
      <P>所有するトークンの量は誤差の発生を防ぐため、整数値で扱います。トークンの定義から可分性を取得することができるので、その値を使って正確な所有量を表示してみます。</P>
      <Pick ver={ver} v2={<Code code={c.divV2} />} v3={<Code code={c.divV3} />} />

      <H>3.4 現場で使えるヒント</H>
      <H3>暗号化と署名</H3>
      <P>アカウントとして生成した秘密鍵や公開鍵は、そのまま従来の暗号化や電子署名として活用することができます。信頼性に問題点があるアプリケーションを使用する必要がある場合も、個人間（エンドツーエンド）でデータの秘匿性・正当性を検証することができます。</P>

      <H4>事前準備：対話のためのBobアカウントを生成</H4>
      <Pick ver={ver} v2={<Code code={c.bobV2} />} v3={<Code code={c.bobV3} />} />

      <H4>暗号化</H4>
      <P>Aliceの秘密鍵・Bobの公開鍵で暗号化し、Aliceの公開鍵・Bobの秘密鍵で復号します（AES-GCM形式）。</P>
      <Pick ver={ver}
        v2={<><Code code={c.encV2} /><Out code={c.encV2Out} /></>}
        v3={<><Code code={c.encV3} /><Out code={c.encV3Out} /></>}
      />

      <H4>復号化</H4>
      <Pick ver={ver}
        v2={<Code code={c.decV2} />}
        v3={<>
          <Code code={c.decV3} />
          <Out code={c.decV3Out} />
          <Fold title="symbol-sdk v3.0.7 での注意点">
            <P>v3.0.7 では復号化データの構造が異なります。v3.0.8 以降では、結果とメッセージを持つオブジェクトですが、v3.0.7 では結果とメッセージの配列です。このため、復号化したメッセージへのアクセス方法が異なります。</P>
            <H4>v3.0.7</H4>
            <Code code={c.decV307} />
            <Out code={c.decV307Out} />
          </Fold>
        </>}
      />

      <H4>署名</H4>
      <P>Aliceの秘密鍵でメッセージを署名し、Aliceの公開鍵と署名でメッセージを検証します。</P>
      <Pick ver={ver} v2={<Code code={c.signV2} />} v3={<Code code={c.signV3} />} />
      <Out code={c.signOut} />

      <H4>検証</H4>
      <Pick ver={ver} v2={<Code code={c.verifyV2} />} v3={<Code code={c.verifyV3} />} />
      <Out code={c.verifyOut} />
      <P>ブロックチェーンを使用しない署名は何度も再利用される可能性があることにご注意ください。</P>

      <H3>アカウントの保管</H3>
      <P>アカウントの管理方法について説明しておきます。秘密鍵はそのままで保存しないようにしてください。symbol-qr-libraryを利用して秘密鍵をパスフレーズで暗号化して保存する方法を紹介します。</P>
      <P>※ このコードは v2（browserify版SDK）の環境で動作します。</P>

      <H4>秘密鍵の暗号化</H4>
      <Code code={c.qrEncrypt} />
      <Out code={c.qrEncryptOut} />
      <P>このjsonSignerQRで出力されるQRコード、あるいはテキストを保存しておけばいつでも秘密鍵を復元することができます。</P>

      <H4>暗号化された秘密鍵の復号</H4>
      <Code code={c.qrDecrypt} />
      <Out code={c.qrDecryptOut} />

      <Exercise ver={ver} no={3} />
    </>
  );
}
