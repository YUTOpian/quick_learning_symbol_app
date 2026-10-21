import type { ReactNode } from 'react';
import { Box } from '@mui/material';
import { Code, Ext, H, H3, Out, P, mono } from './ui';
import type { Ver } from './Ch02';
import Exercise from './Exercise';
import * as d from './ch09/code';

// v2 / v3 でコードが違う箇所は、選択中のバージョンだけを表示する。
const Pick = ({ ver, v2, v3 }: { ver: Ver; v2: ReactNode; v3: ReactNode }) => <>{ver === 'v2' ? v2 : v3}</>;
// 本文中のインラインコード。
const C = ({ children }: { children: ReactNode }) => <Box component="code" sx={{ ...mono, bgcolor: 'action.hover', px: 0.6, py: 0.1, borderRadius: 0.5 }}>{children}</Box>;
// md の ##### 見出し（H3 のひとつ下）。
const H5 = ({ children }: { children: ReactNode }) => <Box component="h5" sx={{ fontSize: '0.95rem', fontWeight: 700, mt: 2.5, mb: 0.5, color: 'text.secondary' }}>{children}</Box>;
// 箇条書き（入れ子は Ul をそのまま入れ子にする）。
const Ul = ({ children }: { children: ReactNode }) => <Box component="ul" sx={{ my: 0.5, pl: 3, lineHeight: 1.95 }}>{children}</Box>;
const Li = ({ children }: { children: ReactNode }) => <Box component="li">{children}</Box>;

// 速習Symbol: 第9章 マルチシグ化。
export default function Ch09({ ver }: { ver: Ver }) {
  return (
    <>
      <P>アカウントのマルチシグ化について説明します。</P>

      <H3>注意事項</H3>
      <P>一つのマルチシグアカウントに登録できる連署者の数は25個です。一つのアカウントは最大25個のマルチシグの連署者になれます。マルチシグは最大3階層まで構成できます。本書では1階層のマルチシグのみ解説します。</P>

      <H>9.0 アカウントの準備</H>
      <P>この章のサンプルソースコードで使用するアカウントを作成し、それぞれの秘密鍵を出力しておきます。本章でマルチシグ化したアカウントBobは、Carolの秘密鍵を紛失すると使えなくなってしまうのでご注意ください。</P>
      <Pick ver={ver} v2={<Code code={d.accV2} />} v3={<Code code={d.accV3} />} />
      <P>テストネットの場合はFAUCETでネットワーク手数料分をbobとcarol1に補給しておきます。</P>
      <Ul><Li>Faucet<Ul><Li><Ext href="https://testnet.symbol.tools/" /></Li></Ul></Li></Ul>
      <H5>URL出力</H5>
      <Pick ver={ver} v2={<Code code={d.faucetV2} />} v3={<Code code={d.faucetV3} />} />
      <P>※2024/4 現在、FAUCETは X(旧:Twitter) 認証が必要となります。また、数量(amount)の指定は受け付けないため、サインイン後に入力する必要があります。</P>

      <H>9.1 マルチシグの登録</H>
      <P>Symbolではマルチシグアカウントを新規に作成するのではなく、既存アカウントについて連署者を指定してマルチシグ化します。マルチシグ化には連署者に指定されたアカウントの承諾署名(オプトイン)が必要なため、アグリゲートトランザクションを使用します。</P>
      <Pick ver={ver} v2={<Code code={d.regV2} />} v3={<Code code={d.regV3} />} />

      <H>9.2 確認</H>
      <H3>マルチシグ化したアカウントの確認</H3>
      <Pick ver={ver}
        v2={<><Code code={d.infoV2} /><Out code={d.infoV2Out} /></>}
        v3={<><Code code={d.infoV3} /><Out code={d.infoV3Out} /></>}
      />
      <P>cosignatoryAddressesが連署者として登録されていることがわかります。また、minApproval:3 によりトランザクションが成立するために必要な署名数3、minRemoval: 3により連署者を取り外すために必要な署名者数は3であることがわかります。</P>

      <H3>連署者アカウントの確認</H3>
      <Pick ver={ver}
        v2={<><Code code={d.cosInfoV2} /><Out code={d.cosInfoV2Out} /></>}
        v3={<><Code code={d.cosInfoV3} /><Out code={d.cosInfoV3Out} /></>}
      />
      <P>multisigAddresses に対して連署する権利を持っていることが分かります。</P>

      <H>9.3 マルチシグ署名</H>
      <P>マルチシグ化したアカウントからモザイクを送信します。</P>

      <H3>アグリゲートコンプリートトランザクションで送信</H3>
      <P>アグリゲートコンプリートトランザクションの場合、ノードにアナウンスする前に連署者の署名を全て集めてからトランザクションを作成します。</P>
      <Pick ver={ver} v2={<Code code={d.completeV2} />} v3={<Code code={d.completeV3} />} />

      <H3>アグリゲートボンデッドトランザクションで送信</H3>
      <P>アグリゲートボンデッドトランザクションの場合は連署者を指定せずにアナウンスできます。事前にハッシュロックでトランザクションを留め置きしておくことを宣言しておき、連署者がネットワーク上に留め置きされたトランザクションに追加署名することで完成となります。</P>
      <Pick ver={ver}
        v2={<><Code code={d.bondedV2} /><Code code={d.bondedAnnV2} /></>}
        v3={<><Code code={d.bondedV3} /><Code code={d.bondedAnnV3} /></>}
      />
      <P>ボンデッドトランザクションがノードに取り込まれるとパーシャル署名状態となるので、8.ロックで紹介した連署を使用して、マルチシグアカウントで連署します。連署をサポートするウォレットで承認することもできます。</P>

      <H>9.4 マルチシグ送信の確認</H>
      <P>マルチシグで行った送信トランザクションの結果を確認してみます。</P>
      <Pick ver={ver}
        v2={<>
          <Code code={d.confirmV2} />
          <Out code={d.confirmV2Out} />
          <Ul>
            <Li>マルチシグアカウント<Ul><Li>Bob<Ul><Li><C>AggregateTransaction.innerTransactions[0].signer.address</C><Ul><Li>TCOMA5VG67TZH4X55HGZOXOFP7S232CYEQMOS7Q</Li></Ul></Li></Ul></Li></Ul></Li>
            <Li>起案者アカウント<Ul><Li>Carol1<Ul><Li><C>AggregateTransaction.signer.address</C><Ul><Li>TCV67BMTD2JMDQOJUDQHBFJHQPG4DAKVKST3YJI</Li></Ul></Li></Ul></Li></Ul></Li>
            <Li>連署者アカウント<Ul>
              <Li>Carol2<Ul><Li><C>AggregateTransaction.cosignatures[0].signer.address</C><Ul><Li>TB3XP4GQK6XH2SSA2E2U6UWCESNACK566DS4COY</Li></Ul></Li></Ul></Li>
              <Li>Carol3<Ul><Li><C>AggregateTransaction.cosignatures[1].signer.address</C><Ul><Li>TBAFGZOCB7OHZCCYYV64F2IFZL7SOOXNDHFS5NY</Li></Ul></Li></Ul></Li>
            </Ul></Li>
          </Ul>
        </>}
        v3={<>
          <Code code={d.confirmV3} />
          <Out code={d.confirmV3Out} />
          <Ul>
            <Li>マルチシグアカウント<Ul><Li>Bob<Ul>
              <Li><C>txInfo.transaction.transactions[0].transaction.signerPublicKey</C><Ul><Li>09F81ED97EBB0A85C6DFEACF2B518EFB471BEDA18709EF4C60823B21698B7B22</Li></Ul></Li>
              <Li><C>facade.network.publicKeyToAddress(new sdkSymbol.models.PublicKey(txInfo.transaction.transactions[0].transaction.signerPublicKey)).toString()</C><Ul><Li>TAUBDCXUGTUDJXKF2PSETQ62JGAESZCBNYSUW7Y</Li></Ul></Li>
            </Ul></Li></Ul></Li>
            <Li>起案者アカウント<Ul><Li>Carol1<Ul>
              <Li><C>txInfo.transaction.signerPublicKey</C><Ul><Li>E20A3B5BC132EBE9B075F1B326FE1C4C8827ACEF0DF7F24082D6C6A4A708980B</Li></Ul></Li>
              <Li><C>facade.network.publicKeyToAddress(new sdkSymbol.models.PublicKey(txInfo.transaction.signerPublicKey)).toString()</C><Ul><Li>TCMMKDQUV45LRBU2HJZNLRT32MN7GLX76PLMULQ</Li></Ul></Li>
            </Ul></Li></Ul></Li>
            <Li>連署者アカウント<Ul>
              <Li>Carol3<Ul>
                <Li><C>txInfo.transaction.cosignatures[1].signerPublicKey</C><Ul><Li>A33F1B26DE7498EAE8D27A084323BB9D3AA95486F879F248B679A3DEB06D6431</Li></Ul></Li>
                <Li><C>facade.network.publicKeyToAddress(new sdkSymbol.models.PublicKey(txInfo.transaction.cosignatures[1].signerPublicKey)).toString()</C><Ul><Li>TB2EIC366LCAORC3AWQNR4ZFHWBPBU47VKOPD5Q</Li></Ul></Li>
              </Ul></Li>
              <Li>Carol2<Ul>
                <Li><C>txInfo.transaction.cosignatures[0].signerPublicKey</C><Ul><Li>0ABC3E2B403C9E1597DF04C8E9AE1E9D3F22D70D87A0A7BDC8D1B16BB9D324DD</Li></Ul></Li>
                <Li><C>facade.network.publicKeyToAddress(new sdkSymbol.models.PublicKey(txInfo.transaction.cosignatures[0].signerPublicKey)).toString()</C><Ul><Li>TDTW4SWRMI64JM7TK6RJZFEW5XKI4KBQVPQM7QY</Li></Ul></Li>
              </Ul></Li>
            </Ul></Li>
          </Ul>
        </>}
      />

      <H>9.5 マルチシグ構成変更</H>
      <H3>マルチシグ構成の縮小</H3>
      <P>連署者を減らすには除名対象アドレスに指定するとともに最小署名者数を連署者数が超えてしまわないように調整してトランザクションをアナウンスします。除名対象者を連署者に含む必要はありません。</P>
      <Pick ver={ver} v2={<Code code={d.shrinkV2} />} v3={<Code code={d.shrinkV3} />} />

      <H3>連署者構成の差替え</H3>
      <P>連署者を差し替えるには、追加対象アドレスと除名対象アドレスを指定します。新たに追加指定するアカウントの連署は必ず必要です。</P>
      <Pick ver={ver} v2={<Code code={d.swapV2} />} v3={<Code code={d.swapV3} />} />

      <H>9.6 現場で使えるヒント</H>
      <H3>多要素認証</H3>
      <P>秘密鍵の管理を複数の端末に分散させることができます。セキュリティ用の鍵を用意しておけば、紛失・漏洩時にも安全に回復することができます。また、マルチシグの安全運用については盗難時と紛失時の2パターンを検討しておく必要があるのでご注意ください。</P>
      <Ul>
        <Li>盗難時：ほかにも秘密鍵を使える人がいる。</Li>
        <Li>紛失時：だれもその秘密鍵を使えなくなる。</Li>
      </Ul>

      <H3>アカウントの所有</H3>
      <P>マルチシグ化したアカウントの秘密鍵は無効化し、マルチシグを解除しない限りたとえ秘密鍵を知っていたとしてもモザイク送信などはできなくなります。モザイクの章で説明した通り、所有を「自分の意思で手放すことができる状態」だとすると、マルチシグ化したアカウントがもつモザイク等の所有者は連署者になります。また、Symbolではマルチシグの構成変更が可能ですのでアカウントの所有を他の連署者に安全に移転することができます。</P>

      <H3>ワークフロー</H3>
      <P>Symbolではマルチシグを3階層まで構成することができます(マルチレベルマルチシグ)。マルチレベルマルチシグを用いることで、バックアップ鍵を不正に持ち出して連署を完成させたり、承認者と監査役だけで署名を完成させるといったことを防ぐことができます。これによって、ブロックチェーン上にトランザクションが存在することが現実社会のワークフローなどの条件を満たした証拠として提示することができます。</P>

      <Exercise ver={ver} no={9} />
    </>
  );
}
