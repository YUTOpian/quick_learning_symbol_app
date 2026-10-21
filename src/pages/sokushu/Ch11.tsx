import type { ReactNode } from 'react';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { Code, H, H3, Out, P, mono } from './ui';
import type { Ver } from './Ch02';
import Exercise from './Exercise';
import * as d from './ch11/code';

// v2 / v3 でコードが違う箇所は、選択中のバージョンだけを表示する。
const Pick = ({ ver, v2, v3 }: { ver: Ver; v2: ReactNode; v3: ReactNode }) => <>{ver === 'v2' ? v2 : v3}</>;
// 本文中のインラインコード。
const C = ({ children }: { children: ReactNode }) => <Box component="code" sx={{ ...mono, bgcolor: 'action.hover', px: 0.6, py: 0.1, borderRadius: 0.5 }}>{children}</Box>;
// md の ##### 見出し（H3 のひとつ下）。
const H5 = ({ children }: { children: ReactNode }) => <Box component="h5" sx={{ fontSize: '0.95rem', fontWeight: 700, mt: 2.5, mb: 0.5, color: 'text.secondary' }}>{children}</Box>;
// 箇条書き（入れ子は Ul をそのまま入れ子にする）。
const Ul = ({ children }: { children: ReactNode }) => <Box component="ul" sx={{ my: 0.5, pl: 3, lineHeight: 1.95 }}>{children}</Box>;
const Li = ({ children }: { children: ReactNode }) => <Box component="li">{children}</Box>;

const OPERATORS = [
  ['=', 'EQ', 'equal to'],
  ['!=', 'NE', 'not equal to'],
  ['<', 'LT', 'less than'],
  ['<=', 'LE', 'less than or equal to'],
  ['>', 'GT', 'greater than'],
  ['>=', 'GE', 'greater than or equal to'],
];

// 速習Symbol: 第11章 制限。
export default function Ch11({ ver }: { ver: Ver }) {
  return (
    <>
      <P>アカウントに対する制限とモザイクのグローバル制限についての方法を紹介します。本章では、既存アカウントの権限を制限してしまうので、使い捨てのアカウントを新規に作成してお試しください。</P>
      <Pick ver={ver} v2={<Code code={d.carolV2} />} v3={<Code code={d.carolV3} />} />

      <H>11.1 アカウント制限</H>
      <H3>指定アドレスからの受信制限・指定アドレスへの送信制限</H3>
      <Pick ver={ver}
        v2={<>
          <Code code={d.addrV2} />
          <P>AddressRestrictionFlagについては以下の通りです。</P>
          <Out code={d.addrFlagOut} />
          <P>AddressRestrictionFlagにはBlockIncomingAddressのほか、上記のようなフラグが使用できます。</P>
          <Ul>
            <Li>AllowIncomingAddress：指定アドレスからのみ受信許可</Li>
            <Li>AllowOutgoingAddress：指定アドレス宛のみ送信許可</Li>
            <Li>BlockIncomingAddress：指定アドレスからの受信受拒否</Li>
            <Li>BlockOutgoingAddress：指定アドレス宛への送信禁止</Li>
          </Ul>
        </>}
        v3={<>
          <Code code={d.addrV3} />
          <P><C>restrictionFlags</C> は v2 の <C>AddressRestrictionFlag</C> に相当します。<C>AddressRestrictionFlag</C> との対応は以下の通りです。</P>
          <Ul>
            <Li>AllowIncomingAddress：指定アドレスからのみ受信許可<Ul><Li><C>sdkSymbol.models.AccountRestrictionFlags.ADDRESS</C></Li></Ul></Li>
            <Li>AllowOutgoingAddress：指定アドレス宛のみ送信許可<Ul><Li><C>sdkSymbol.models.AccountRestrictionFlags.ADDRESS + sdkSymbol.models.AccountRestrictionFlags.OUTGOING</C></Li></Ul></Li>
            <Li>BlockIncomingAddress：指定アドレスからの受信受拒否<Ul><Li><C>sdkSymbol.models.AccountRestrictionFlags.ADDRESS + sdkSymbol.models.AccountRestrictionFlags.BLOCK</C></Li></Ul></Li>
            <Li>BlockOutgoingAddress：指定アドレス宛への送信禁止<Ul><Li><C>sdkSymbol.models.AccountRestrictionFlags.ADDRESS + sdkSymbol.models.AccountRestrictionFlags.BLOCK + sdkSymbol.models.AccountRestrictionFlags.OUTGOING</C></Li></Ul></Li>
          </Ul>
        </>}
      />

      <H3>指定モザイクの受信制限</H3>
      <Pick ver={ver}
        v2={<>
          <Code code={d.mosV2} />
          <P>MosaicRestrictionFlagについては以下の通りです。</P>
          <Out code={d.mosFlagOut} />
          <Ul>
            <Li>AllowMosaic：指定モザイクを含むトランザクションのみ受信許可</Li>
            <Li>BlockMosaic：指定モザイクを含むトランザクションを受信拒否</Li>
          </Ul>
        </>}
        v3={<>
          <Code code={d.mosV3} />
          <P>アカウント制限と同様、 <C>restrictionFlags</C> は v2 の <C>MosaicRestrictionFlag</C> に相当します。<C>MosaicRestrictionFlag</C> との対応は以下の通りです。</P>
          <Ul>
            <Li>AllowMosaic：指定モザイクを含むトランザクションのみ受信許可<Ul><Li><C>sdkSymbol.models.AccountRestrictionFlags.MOSAIC_ID</C></Li></Ul></Li>
            <Li>BlockMosaic：指定モザイクを含むトランザクションを受信拒否<Ul><Li><C>sdkSymbol.models.AccountRestrictionFlags.MOSAIC_ID + sdkSymbol.models.AccountRestrictionFlags.BLOCK</C></Li></Ul></Li>
          </Ul>
        </>}
      />
      <P>モザイク送信の制限機能はありません。また、後述するモザイクのふるまいを制限するグローバルモザイク制限と混同しないようにご注意ください。</P>

      <H3>指定トランザクションの送信制限</H3>
      <Pick ver={ver}
        v2={<>
          <Code code={d.opV2} />
          <P>OperationRestrictionFlagについては以下の通りです。</P>
          <Out code={d.opFlagOut} />
          <Ul>
            <Li>AllowOutgoingTransactionType：指定トランザクションの送信のみ許可</Li>
            <Li>BlockOutgoingTransactionType：指定トランザクションの送信を禁止</Li>
          </Ul>
        </>}
        v3={<>
          <Code code={d.opV3} />
          <P>アカウント制限やモザイク制限と同様、 <C>restrictionFlags</C> は v2 の <C>OperationRestrictionFlag</C> に相当します。<C>OperationRestrictionFlag</C> との対応は以下の通りです。</P>
          <Ul>
            <Li>AllowOutgoingTransactionType：指定トランザクションの送信のみ許可<Ul><Li><C>sdkSymbol.models.AccountRestrictionFlags.TRANSACTION_TYPE + sdkSymbol.models.AccountRestrictionFlags.OUTGOING</C></Li></Ul></Li>
            <Li>BlockOutgoingTransactionType：指定トランザクションの送信を禁止<Ul><Li><C>sdkSymbol.models.AccountRestrictionFlags.TRANSACTION_TYPE + sdkSymbol.models.AccountRestrictionFlags.OUTGOING + sdkSymbol.models.AccountRestrictionFlags.BLOCK</C></Li></Ul></Li>
          </Ul>
          <P>TransactionTypeについては以下の通りです。</P>
          <Out code={d.txTypeOut} />
        </>}
      />
      <P>トランザクション受信の制限機能はありません。</P>
      <H5>注意事項</H5>
      <P><C>17232: 'ACCOUNT_OPERATION_RESTRICTION'</C> の制限は許可されていません。つまり、AllowOutgoingTransactionTypeを指定する場合は、ACCOUNT_OPERATION_RESTRICTIONを必ず含める必要があり、BlockOutgoingTransactionTypeを指定する場合は、ACCOUNT_OPERATION_RESTRICTIONを含めることはできません。</P>

      <H3>確認</H3>
      <P>設定した制限情報を確認します。</P>
      <Pick ver={ver}
        v2={<><Code code={d.infoV2} /><Out code={d.infoV2Out} /></>}
        v3={<><Code code={d.infoV3} /><Out code={d.infoV3Out} /></>}
      />

      <H>11.2 グローバルモザイク制限</H>
      <P>グローバルモザイク制限はモザイクに対して送信可能な条件を設定します。その後、各アカウントに対してグローバルモザイク制限専用の数値メタデータを付与します。送信アカウント・受信アカウントの両方が条件を満たした場合のみ、該当モザイクを送信することができます。</P>
      <P>最初に必要ライブラリの設定を行います。併せて、前項の操作で制限がかかってしまっているため、必要に応じて新しい使い捨てのアカウントを作成してください（章の冒頭の Carol 生成のコードをもう一度実行すれば、新しい Carol になります）。</P>
      <Pick ver={ver} v2={<Code code={d.prepV2} />} v3={<Code code={d.prepV3} />} />

      <H3>グローバル制限機能つきモザイクの作成</H3>
      <P>restrictableをtrueにしてCarolでモザイクを作成します。</P>
      <Pick ver={ver} v2={<Code code={d.createV2} />} v3={<Code code={d.createV3} />} />
      <P>MosaicRestrictionTypeについては以下の通りです。</P>
      <Out code={d.resTypeOut} />
      <TableContainer sx={{ my: 2, maxWidth: 520 }}>
        <Table size="small">
          <TableHead>
            <TableRow><TableCell>演算子</TableCell><TableCell>略称</TableCell><TableCell>英語</TableCell></TableRow>
          </TableHead>
          <TableBody>
            {OPERATORS.map(([op, abbr, en]) => (
              <TableRow key={abbr}><TableCell sx={mono}>{op}</TableCell><TableCell sx={mono}>{abbr}</TableCell><TableCell>{en}</TableCell></TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <H3>アカウントへのモザイク制限適用</H3>
      <P>Carol,Bobに対してグローバル制限モザイクに対しての適格情報を追加します。送信・受信についてかかる制限なので、すでに所有しているモザイクについての制限はありません。送信を成功させるためには、送信者・受信者双方が条件をクリアしている必要があります。モザイク作成者の秘密鍵があればどのアカウントに対しても承諾の署名を必要とせずに制限をつけることができます。</P>
      <Pick ver={ver} v2={<Code code={d.applyV2} />} v3={<Code code={d.applyV3} />} />

      <H3>制限状態確認</H3>
      <P>ノードに問い合わせて制限状態を確認します。</P>
      <Pick ver={ver}
        v2={<><Code code={d.checkV2} /><Out code={d.checkV2Out} /></>}
        v3={<><Code code={d.checkV3} /><Out code={d.checkV3Out} /></>}
      />

      <H3>送信確認</H3>
      <P>実際にモザイクを送信してみて、制限状態を確認します。</P>
      <Pick ver={ver} v2={<Code code={d.sendV2} />} v3={<Code code={d.sendV3} />} />
      <P>失敗した場合以下のようなエラーステータスになります。</P>
      <Out code={d.failOut} />

      <H>11.3 現場で使えるヒント</H>
      <P>ブロックチェーンの社会実装などを考えたときに、法律や信頼性の見地から一つの役割のみを持たせたいアカウント、関係ないアカウントを巻き込みたくないと思うことがあります。そんな場合にアカウント制限とグローバルモザイク制限を使いこなすことで、モザイクのふるまいを柔軟にコントロールすることができます。</P>

      <H3>アカウントバーン</H3>
      <P>AllowIncomingAddressによって指定アドレスからのみ受信可能にしておいて、XYMを全量送信すると、秘密鍵を持っていても自力では操作困難なアカウントを明示的に作成することができます。（最小手数料を0に設定したノードによって承認されることもあり、その可能性はゼロではありません）</P>

      <H3>モザイクロック</H3>
      <P>譲渡不可設定のモザイクを配布し、配布者側のアカウントで受け取り拒否を行うとモザイクをロックさせることができます。</P>

      <H3>所属証明</H3>
      <P>モザイクの章で所有の証明について説明しました。グローバルモザイク制限を活用することで、KYCが済んだアカウント間でのみ所有・流通させることが可能なモザイクを作り、所有者のみが所属できる独自経済圏を構築することが可能です。</P>

      <Exercise ver={ver} no={11} />
    </>
  );
}
