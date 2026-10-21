import { Chip } from '@mui/material';
import { Code, Ext, H, P } from './ui';
import v2Load from './ch02/v2-load.js?raw';
import v3Load from './ch02/v3-load.js?raw';
import v2Common from './ch02/v2-common.js?raw';
import v3Common from './ch02/v3-common.js?raw';
import check from './ch02/check.js?raw';

export type Ver = 'v2' | 'v3';
// 環境構築の進み具合（Sokushu.tsx が、読み込み済みのグローバル変数を見て判定する）。
export type Setup = { sdk: boolean; common: boolean };

const Status = ({ done }: { done: boolean }) => <Chip size="small" color={done ? 'success' : 'default'} label={done ? '完了' : '未実行'} sx={{ ml: 1 }} />;

// 速習Symbol: 第2章 環境構築。
export default function Ch02({ ver, setup }: { ver: Ver; setup: Setup }) {
  return (
    <>
      <P>本書の読み進め方を解説します。コードはコンソールで、そのまま実行できます。</P>

      <H>2.1 使用言語</H>
      <P>JavaScriptを使用します。SDKは symbol-sdk-typescript-javascript v2.0.4 です。これをbrowserify化したものをブラウザの開発者コンソールに読み込ませて使います。</P>
      <P>※ 現在はsymbol-sdk v3.0.0がリリースされており、v2.0.4はdeprecatedです。v3ではrxjsに依存した多くの機能が削除されるため、REST APIへの直接アクセスが推奨されます。</P>
      <P>リファレンス: Symbol SDK for TypeScript and JavaScript / Catapult REST Endpoints (1.0.3)</P>

      <H>2.2 サンプルソースコード</H>
      <P>■ 変数宣言: コンソール上で何度も書き直して検証できるよう、あえてconst宣言を行いません。アプリケーション開発時はconst宣言するなどしてセキュリティを確保してください。</P>
      <P>■ 出力値確認: console.log()で変数の内容を出力します。出力内容は「&gt;」以下に記述されているので、サンプルを実行する場合はこの部分を含めずに試してください。</P>
      <P>■ 同期・非同期: 特に問題が無い限り、非同期処理を使わずに解説します。</P>
      <P>■ アカウント: 主にAliceを中心に解説します（3章で作成したAliceを、十分なXYMを送信した状態で使い続けます）。BobはAliceとの送受信用に各章で必要に応じて作成し、マルチシグの章などではCarolなども使います。</P>
      <P>■ 手数料: 手数料乗数は100でトランザクションを作成します。</P>

      <H>2.3 事前準備</H>
      <P>ノード一覧から任意のノードを選び、そのURLをコンソールの「ノードURL」に入力します。本書ではテストネットを前提とします（テストネット: <Ext href="https://symbolnodes.org/nodes_testnet/" />　メインネット: <Ext href="https://symbolnodes.org/nodes/" />）。この画面のコンソールが、ブラウザの開発者コンソール（F12）の代わりになります。以下の①〜③を、順番に実行してください。</P>
      <P>※ このプロファイルは SDK {ver} で学習します（最初に選んだバージョンです）。以降の章のコードも {ver} のものが表示されます。</P>

      <P>① SDKを読み込みます。<Status done={setup.sdk} /></P>
      <Code code={ver === 'v2' ? v2Load : v3Load} />
      <P>読み込みには数秒かかります。上の表示が「完了」になってから、次へ進んでください。</P>

      <P>② ほぼすべての章で使う共通ロジックを実行します。<Status done={setup.common} /></P>
      <P>NODEは接続先ノードのURLです（このコンソールでは、コンソールの「ノードURL」の値に置き換えて実行します）。clog()は、送信したトランザクションの状態確認・確認済みトランザクション・エクスプローラーのURLを出力する関数です。</P>
      <Code code={ver === 'v2' ? v2Common : v3Common} />

      <P>③ 準備ができたか確認します。</P>
      <Code code={check} />
      <P>ネットワーク種別（テストネットは152）、ジェネレーションハッシュ（64桁の16進数）、エポック調整値が表示されれば、環境構築は完了です。undefined と表示される場合は、②が完了していないか、ノードURLが正しくない可能性があります。ノードURLを確認して、②からやり直してください。</P>

      <P>※ ご自身のブラウザで試す場合は、ノード一覧から選んだノードのページをChromeなどで開き、F12キーで開発者コンソールを開いて、同じスクリプトを入力します。この場合、NODEは現在開いているページのURLになります。</P>
    </>
  );
}
