import type { ReactNode } from 'react';
import { Box } from '@mui/material';
import { Code, H, H3, Out, P, mono } from './ui';
import type { Ver } from './Ch02';
import Exercise from './Exercise';
import * as d from './ch10/code';

// v2 / v3 でコードが違う箇所は、選択中のバージョンだけを表示する。
const Pick = ({ ver, v2, v3 }: { ver: Ver; v2: ReactNode; v3: ReactNode }) => <>{ver === 'v2' ? v2 : v3}</>;
// 本文中のインラインコード。
const C = ({ children }: { children: ReactNode }) => <Box component="code" sx={{ ...mono, bgcolor: 'action.hover', px: 0.6, py: 0.1, borderRadius: 0.5 }}>{children}</Box>;
// md の ##### 見出し（H3 のひとつ下）。
const H5 = ({ children }: { children: ReactNode }) => <Box component="h5" sx={{ fontSize: '0.95rem', fontWeight: 700, mt: 2.5, mb: 0.5, color: 'text.secondary' }}>{children}</Box>;
// 箇条書き。
const Ul = ({ children }: { children: ReactNode }) => <Box component="ul" sx={{ my: 0.5, pl: 3, lineHeight: 1.95 }}>{children}</Box>;
const Li = ({ children }: { children: ReactNode }) => <Box component="li">{children}</Box>;
// 引数を省略した断片や、値を自分で埋める必要があるコード（実行ボタンを出さない）。
const Snip = ({ code }: { code: string }) => <Code code={code} runnable={false} />;

// 速習Symbol: 第10章 監視。
export default function Ch10({ ver }: { ver: Ver }) {
  return (
    <>
      <P>SymbolのノードはWebSocket通信でブロックチェーンの状態変化を監視することが可能です。</P>

      <H>10.1 リスナー設定</H>
      <P>WebSocketを生成してリスナーの設定を行います。</P>
      <Pick ver={ver}
        v2={<>
          <Code code={d.listenerV2} />
          <P>エンドポイントのフォーマットは以下の通りです。</P>
          <Ul><Li><C>wss://{'{node url}'}:3001/ws</C></Li></Ul>
          <P>何も通信が無ければ、listenerは1分で切断されます。</P>
        </>}
        v3={<>
          <P>v2 におけるリスナーは rxjs に依存した機能であるため、 v3 ではリスナーの機能はありません。したがって、実装者がWebSocketクライアントをプログラミングする必要があります。本章では、 v2 の実装を参考にした一例を示します。</P>
          <Code code={d.listenerV3} />
        </>}
      />

      <H>10.2 受信検知</H>
      <P>アカウントが受信したトランザクションを検知します。</P>
      <Pick ver={ver}
        v2={<>
          <Code code={d.recvV2} />
          <P>上記リスナーを実行後、aliceへの送信トランザクションをアナウンスしてください。</P>
          <Out code={d.recvV2Out} />
        </>}
        v3={<><Code code={d.recvV3} /><Out code={d.recvV3Out} /></>}
      />
      <P>未承認トランザクションは <C>transactionInfo.height=0</C> で受信します。</P>
      <H5>注意事項</H5>
      <P>受信先アドレスやモザイクIDで受信検知をする場合は送信者がネームスペースを利用して送信している場合もあるのでご注意ください。たとえば、メインネットでXYMのモザイクIDは <C>6BED913FA20223F8</C> ですが、ユーザーがネームスペースID(symbol.xym)で送信した場合はトランザクションには <C>E74B99BA41F4AFEE</C> というIDが記録されています。</P>

      <H>10.3 ブロック監視</H>
      <P>新規に生成されたブロックを検知します。</P>
      <Pick ver={ver}
        v2={<>
          <Code code={d.blockV2} />
          <Out code={d.blockV2Out} />
          <P>listener.newBlock()をしておくと、約30秒ごとに通信が発生するのでWebSocketの切断が起こりにくくなります。まれに、ブロック生成が1分を超える場合があるのでその場合はリスナーを再接続する必要があります。（その他の事象で切断される可能性もあるので、万全を期したい場合は後述するoncloseで補足しましょう）</P>
        </>}
        v3={<><Code code={d.blockV3} /><Out code={d.blockV3Out} /></>}
      />

      <H>10.4 署名要求</H>
      <P>署名が必要なトランザクションが発生すると検知します。</P>
      <Pick ver={ver}
        v2={<><Code code={d.signV2} /><Out code={d.signV2Out} /></>}
        v3={<><Code code={d.signV3} /><Out code={d.signV3Out} /></>}
      />
      <P>指定アドレスが関係するすべてのアグリゲートトランザクションが検知されます。連署が必要かどうかは別途フィルターして判断します。</P>

      <H>10.5 現場で使えるヒント</H>
      <H3>常時コネクション</H3>
      <P>一覧からランダムに選択し、接続を試みます。</P>

      <H5>ノードへの接続</H5>
      <P>以下は v2・v3 共通です。ノード一覧（<C>NODES</C>）はご自身で用意するものなので、最初のコードは参考用です。</P>
      <Snip code={d.nodesList} />
      <P>このコンソールで試す場合は、接続中のノードだけを一覧にして、次のように設定してください。</P>
      <Code code={d.nodesTry} />
      <Code code={d.connectNode} />
      <P>タイムアウト値を設定しておき、応答の悪いノードに接続した場合は選びなおします。エンドポイント <C>/node/health</C> を確認してステータス異常の場合はノードを選びなおします。</P>

      <H5>レポジトリの作成, ノードURLの取得</H5>
      <Pick ver={ver}
        v2={<>
          <Code code={d.repoV2} />
          <P>まれに /network/properties のエンドポイントが解放されていないノードが存在するため、getEpochAdjustment() の情報を取得してチェックを行います。取得できない場合は再帰的にcreateRepoを読み込みます。</P>
        </>}
        v3={<>
          <P>v3 ではリポジトリがないため、接続できるノードのURLを返却します。</P>
          <Code code={d.urlV3} />
        </>}
      />

      <H5>リスナーの常時接続</H5>
      <Pick ver={ver} v2={<Code code={d.keepV2} />} v3={<Code code={d.keepV3} />} />
      <P>リスナーがcloseした場合は再接続します。</P>

      <H5>リスナー開始</H5>
      <P>以下は v2・v3 共通です。</P>
      <Code code={d.startKeep} />

      <H3>未署名トランザクション自動連署</H3>
      <P>未署名のトランザクションを検知して、署名＆ネットワークにアナウンスします。初期画面表示時と画面閲覧中の受信と２パターンの検知が必要です。</P>
      <Pick ver={ver} v2={<Code code={d.autoV2} />} v3={<Code code={d.autoV3} />} />

      <H5>注意事項</H5>
      <P>スキャムトランザクションを自動署名しないように、送信元のアカウントを確認するなどのチェック処理を必ず実施するようにしてください。</P>

      <Exercise ver={ver} no={10} />
    </>
  );
}
