import type { ReactNode } from 'react';
import { Alert, Box, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { Code, H, H3, Out, P, mono } from './ui';
import * as d from './ch14/code';

// 本文中のインラインコード。
const C = ({ children }: { children: ReactNode }) => <Box component="code" sx={{ ...mono, bgcolor: 'action.hover', px: 0.6, py: 0.1, borderRadius: 0.5 }}>{children}</Box>;
const Ul = ({ children }: { children: ReactNode }) => <Box component="ul" sx={{ my: 0.5, pl: 3, lineHeight: 1.95 }}>{children}</Box>;
const Li = ({ children }: { children: ReactNode }) => <Box component="li">{children}</Box>;

const DIFF: [string, string, string][] = [
  ['facade', 'new sdkSymbol.SymbolFacade(identifier)', "new sdkNem.NemFacade('testnet')"],
  ['アドレス', '39文字（テストネットは T）', '40文字（テストネットは T、メインネットは N）'],
  ['秘密鍵 → 公開鍵', '同じ秘密鍵でも、NEMとは別の公開鍵になる', '同じ秘密鍵でも、Symbolとは別の公開鍵になる'],
  ['Descriptor', 'sdkSymbol.descriptors.*', 'sdkNem.descriptors.*（引数の並びが違う）'],
  ['金額', 'モザイクの Amount（可分性に応じる）', '1 XEM = 1,000,000 μXEM の Amount'],
  ['手数料', '「手数料乗数」を渡す（第4章）', '手数料そのもの（μXEM）を渡す'],
  ['署名・検証', 'alice.signTransaction / facade.verifyTransaction', '同じ'],
  ['ペイロード', 'JSON は {"payload": ...}', 'JSON は {"data": ..., "signature": ...}'],
  ['ノードのAPI', 'Symbol REST（PUT /transactions など）', 'NIS（POST /transaction/announce など。ポートも別）'],
  ['環境構築', 'generationHash と epochAdjustment が必要', '不要（facade を作るだけ）'],
  ['モザイクの識別', 'モザイクID（数値）', 'ネームスペース名:モザイク名'],
  ['複数署名', 'アグリゲートトランザクション', 'マルチシグトランザクション + 連署（別のトランザクション）'],
];

// 速習Symbol: 第14章 NEM（付録。Symbol SDK v3 専用）。SDK v3 を使って、NEM（NEM1 / NIS1）を扱う方法を説明する。
export default function Ch14() {
  return (
    <>
      <P>この章は、本編の<strong>付録</strong>です。Symbol SDK v3 を使って、NEM（NEM1 / NIS1）のアカウントやトランザクションを扱う方法を説明します。NEMは、Symbolの前身にあたるブロックチェーンで、いまも使われています。Symbol向けに書いたコードの知識を、そのままNEMにも活かせると便利なので、ここでまとめておきます。</P>
      <P>Symbol SDK v3 は、Symbol用の部品（<C>sdk.symbol</C>）のほかに、NEM用の部品（<C>sdk.nem</C>）も同梱しています。そのため、新しくライブラリを読み込む必要はありません。第2章で読み込んだ <C>sdk</C> の中に、すでにNEM用の部品が入っています。</P>
      <P>この章のコードは、<strong>上から順に</strong>実行してください。前の節で作った変数（<C>nemAlice</C> や <C>mosaicId</C> など）を、後の節で使います。ページを再読み込みすると変数が消えるので、続きから試すときは、必要な節からやり直します。</P>

      <H>14.1 SymbolとNEMの違い</H>
      <P>Symbolを扱ってきた基本の流れは、NEMでもほとんど同じです。facade を作り、アカウントを作り、Descriptor でトランザクションを組み立て、署名して、ペイロードをノードに送ります。違うのは、<strong>部品の名前</strong>と、<strong>NEMならではの決まり</strong>です。先に、つまずきやすい違いを一覧にします。<strong>そのまま同じ書き方で動く部分</strong>と、<strong>書き換える部分</strong>を意識しながら読んでください。</P>
      <Table size="small" sx={{ my: 2 }}>
        <TableHead>
          <TableRow><TableCell>項目</TableCell><TableCell>Symbol（第3〜14章）</TableCell><TableCell>NEM（この章）</TableCell></TableRow>
        </TableHead>
        <TableBody>
          {DIFF.map(([a, b, c]) => (
            <TableRow key={a}><TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{a}</TableCell><TableCell>{b}</TableCell><TableCell>{c}</TableCell></TableRow>
          ))}
        </TableBody>
      </Table>

      <H>14.2 準備</H>
      <P>NEM用の facade を用意します。NEMは、Symbolのようにノードからネットワーク情報（<C>generationHash</C> や <C>epochAdjustment</C>）を取得する必要がなく、ネットワーク名（<C>'testnet'</C> か <C>'mainnet'</C>）を渡すだけで作れます。</P>
      <Code code={d.prep} />
      <Out code={d.prepOut} />
      <P>以降のNEM用の変数は、<C>nemFacade</C>・<C>nemAlice</C> のように、<strong>名前に nem を付けて</strong>区別します。第3章までのSymbolの変数（<C>facade</C> や <C>alice</C>）と混ざらないようにするためです。</P>

      <H>14.3 アカウント</H>
      <H3>アカウントの作成</H3>
      <P>アカウントの作り方は、第3章と同じです。<C>nemFacade.createAccount</C> に、秘密鍵を渡します。秘密鍵は <C>sdkCore.PrivateKey</C> で、Symbolと共通の部品です。ここで作る <C>nemAlice</C> と <C>nemBob</C> を、以降の節で使い続けます。</P>
      <Code code={d.ex1} />
      <Out code={d.ex1Out} />
      <P>NEMのアドレスは<strong>40文字</strong>で、テストネットは T、メインネットは N から始まります。Symbolのアドレスは39文字なので、文字数でも見分けられます。</P>

      <H3>同じ秘密鍵でも、別のアカウントになる</H3>
      <P>SymbolとNEMは、どちらも楕円曲線の署名方式（Ed25519）を使っていますが、内部で使うハッシュ関数が異なります（Symbolは SHA3、NEMは Keccak）。そのため、<strong>同じ秘密鍵から作っても、公開鍵もアドレスも別物</strong>になります。実際に確かめてみましょう。</P>
      <Code code={d.ex2} />
      <Out code={d.ex2Out} />
      <P>公開鍵が一致しない（false）ことと、アドレスの文字数が違うことが分かります。なお、同じ秘密鍵をSymbolとNEMで使い回すことは、おすすめしません。片方で鍵が漏れると、もう片方のアカウントも危険になるためです。</P>

      <H>14.4 トランザクションの作成</H>
      <H3>手数料の考え方</H3>
      <P>Symbolでは、トランザクションを作るときに「手数料乗数」を渡しました。NEMでは、乗数ではなく<strong>手数料の金額そのもの</strong>（μXEM。1 XEM = 1,000,000 μXEM）を渡します。XEMを送る転送トランザクションの手数料は、おおよそ次のように決まります。</P>
      <Ul>
        <Li>送金額の部分: 1万 XEM ごとに 0.05 XEM（最低 0.05 XEM、最高 1.25 XEM）</Li>
        <Li>メッセージの部分: 32バイトごとに 0.05 XEM（メッセージがあるときだけ）</Li>
      </Ul>
      <P>これを計算する関数を作っておきます。</P>
      <Code code={d.feeFn} />
      <Out code={d.feeFnOut} />
      <P>1 XEM に 11バイトのメッセージを付けると、送金額の部分が 0.05 XEM、メッセージの部分が 0.05 XEM で、合計 0.1 XEM（100000 μXEM）になります。この関数はあくまで<strong>目安</strong>です。手数料が足りないと、ノードに拒否されます。実際に送る前に、最新の手数料のルールを確認してください。</P>

      <H3>転送トランザクション</H3>
      <P>第4章と同じ流れで、Descriptor を作り、<C>createTransactionFromTypedDescriptor</C> に渡します。NEMでは、Descriptor は <C>sdkNem.descriptors.TransferTransactionV1Descriptor</C> です。引数は、受取アドレス、金額、メッセージの順です。</P>
      <Code code={d.ex3} />
      <P>Symbolとの違いは、次の3点です。</P>
      <Ul>
        <Li><strong>金額</strong>は <C>Amount</C>（μXEM）で、Descriptor の第2引数に置きます。Symbolのように、モザイクの配列にはしません。</Li>
        <Li><strong>メッセージ</strong>は、<C>MessageDescriptor</C> でメッセージの種類（平文なら <C>MessageType.PLAIN</C>）と内容を包みます。Symbolのように、先頭に <C>0x00</C> を付ける必要はありません。</Li>
        <Li><strong>手数料</strong>は、乗数ではなく、金額そのもの（上の <C>nemFee()</C> の結果）を渡します。</Li>
      </Ul>
      <P>また、<C>generationHash</C> は不要で、有効期限（第4引数の秒数）も、Symbolと同じ感覚で指定できます。</P>

      <H>14.5 署名・ペイロード・ハッシュ</H>
      <P>署名は、第4章とまったく同じ書き方です。<C>signTransaction</C> で署名し、<C>attachSignature</C> でアナウンス用のペイロードを作ります。トランザクションのハッシュも、<C>hashTransaction</C> で同様に求められます。</P>
      <Code code={d.ex4} />
      <Out code={d.ex4Out} />
      <P>ただし、出てくるJSONの形は違います。Symbolは <C>{'{"payload": ...}'}</C> でしたが、NEMは <C>data</C>（トランザクションの中身）と <C>signature</C>（署名）の2つです。NEMのノード（NIS）は、この形を期待しています。</P>

      <H>14.6 署名の検証</H>
      <P>署名の検証も、Symbolと同じです。<C>verifyTransaction</C> に、トランザクションと署名を渡します。署名は「中身が1か所でも変わると成り立たない」ので、トランザクションが改ざんされていないことを確かめられます。検証に必要なのは、署名者の公開鍵だけです（トランザクションの中に入っています）。</P>
      <Code code={d.ex5} />
      <Out code={d.ex5Out} />
      <P>1つ目は、署名どおりのトランザクションなので true です。2つ目は、金額を 2 XEM に書き換えたので false になり、改ざんが検知できます。3つ目は、金額を元に戻したので、また true になります。</P>

      <H>14.7 暗号化メッセージ</H>
      <P>メッセージを、受取人だけが読めるように暗号化することもできます。<C>nemAlice.messageEncoder().encode(受取人の公開鍵, メッセージのバイト列)</C> で暗号化します。復号は、受け取った側が <C>tryDecode</C> に、<strong>送信者の公開鍵</strong>とトランザクションの <C>message</C> を渡して行います。</P>
      <Code code={d.ex6} />
      <Out code={d.ex6Out} />
      <P><C>encode</C> が返す <C>encrypted</C> は <C>Message</C> オブジェクトです。Descriptor には、メッセージの種類として <C>MessageType.ENCRYPTED</C>、内容として <C>encrypted.message</C>（暗号化済みのバイト列）を渡します。暗号化するとメッセージが長くなるため、手数料の計算には <C>encrypted.message.length</C> を使っています。</P>

      <H>14.8 ノードへのアナウンスと残高の確認</H>
      <P>署名したペイロードを、NEMのノード（NIS）に送ります。Symbolでは <C>PUT /transactions</C> でしたが、NISでは <C>POST /transaction/announce</C> です。本文には、14.5 で作った <C>nemJson</C> をそのまま渡します。</P>
      <Code code={d.ex7} />
      <Out code={d.ex7Out} />
      <P>送ったあとは、<C>GET /account/get</C> でアカウントの情報（残高など）を取得できます。残高の単位は μXEM です。</P>
      <Code code={d.ex7Check} />
      <Alert severity="warning" sx={{ my: 2 }}>
        この節のコードは、<strong>実際に使えるNISノード</strong>と、送金できるだけのテストネットXEMが必要です。NISは、SymbolのRESTとは別物（パスもポートも違います）なので、<C>NEM_NODE</C> をご自身の環境に合わせて書き換えます（「コンソールに入力」を使うと編集できます）。また、このページが https で開かれている場合は、http のノードにはブラウザが接続させてくれません。https に対応したノードを使うか、手元の環境で実行してください。
      </Alert>

      <H>14.9 ネームスペースとモザイク</H>
      <P>NEMにも、ネームスペースとモザイクがあります。Symbolとの大きな違いは、モザイクを<strong>ネームスペースに属する名前</strong>（例：<C>sokushutest:coin</C>）で識別することです。Symbolのように、数値のモザイクIDは使いません。この節のトランザクションは、署名してペイロードを作るところまでを確認します。</P>
      <H3>ネームスペースの登録</H3>
      <P>ネームスペースの登録には、<C>NamespaceRegistrationTransactionV1Descriptor</C> を使います。引数は、賃料の送付先アドレス、賃料、名前、親の名前（サブネームスペースのときだけ）の順です。</P>
      <Code code={d.ex8} />
      <Ul>
        <Li>名前は、文字列ではなく、<C>TextEncoder</C> で作った<strong>バイト列</strong>で渡します。文字列のままだと、<C>toString()</C> で表示するときにエラーになる場合があります。</Li>
        <Li>NEMのネームスペースは、取得すると<strong>賃料</strong>（ルート 100 XEM、サブ 10 XEM）を、専用のアドレスに支払う仕組みです。</Li>
        <Li>賃料の送付先アドレスと金額は、SDKには含まれていません。上のコードのアドレスはテストネット用です。実際に送る前に、公式の最新の情報で確認してください。</Li>
      </Ul>

      <H3>モザイクの定義と供給量の変更</H3>
      <P>モザイクの定義には、<C>MosaicDefinitionTransactionV1Descriptor</C> を使います。モザイクは、所属するネームスペース（<C>NamespaceIdDescriptor</C>）と名前から作るID（<C>MosaicIdDescriptor</C>）で識別します。性質（可分性、初期供給量など）は、名前と値のペア（<C>MosaicPropertyDescriptor</C>）を並べて指定します。値は、すべて文字列です。</P>
      <Code code={d.ex9} />
      <Ul>
        <Li>モザイクの定義にも、賃料（10 XEM）がかかります。</Li>
        <Li>供給量の増減（<C>MosaicSupplyChangeTransactionV1Descriptor</C>）は、可分性を掛けない<strong>整数単位</strong>で指定します。</Li>
        <Li>ここで作った <C>mosaicId</C> は、次の節でも使います。</Li>
        <Li>ネームスペースを実際に取得していないと、モザイクの定義はノードに拒否されます。</Li>
      </Ul>

      <H3>モザイクを添付して送る</H3>
      <P>モザイクを添付して送れるのは、転送トランザクションの V2（<C>TransferTransactionV2Descriptor</C>）です。第4引数に、モザイクの配列を渡します。<C>MosaicDescriptor</C>（モザイクIDと数量）を、<C>SizePrefixedMosaicDescriptor</C> で包んで並べます。</P>
      <Code code={d.ex10} />
      <P>NEMのモザイクの送信には、独特の決まりがあります。<strong>転送の <C>amount</C> は、「XEMの金額」ではなく、モザイクの数量にかける倍率</strong>です（1000000 で1倍）。実際に送られる数量は、「モザイクの数量 × 倍率」になります。上の例では、倍率が1倍なので、5枚が送られます。なお、モザイクを添付したときの手数料は、モザイクの供給量や可分性によって変わります。上のコードの手数料は、余裕を見た仮の値です。足りなければ、ノードに拒否されます。</P>

      <H>14.10 マルチシグ</H>
      <P>NEMで複数人の署名が必要な操作をするには、マルチシグを使います。Symbolのアグリゲートトランザクション（1つのトランザクションに署名を集める）とは、仕組みが違います。NEMのマルチシグは、次の2つのステップで考えます。</P>
      <Ul>
        <Li><strong>マルチシグ化</strong>: アカウントを、複数の連署者が必要なマルチシグアカウントに変える。</Li>
        <Li><strong>マルチシグアカウントからの送信</strong>: 連署者の1人（起案者）が、トランザクションを包んで署名し、ほかの連署者が、別のトランザクションとして連署する。</Li>
      </Ul>

      <H3>アカウントをマルチシグにする</H3>
      <P>マルチシグ化には、<C>MultisigAccountModificationTransactionV2Descriptor</C> を使います。連署者の追加は、<C>MultisigAccountModificationDescriptor</C>（<C>ADD_COSIGNATORY</C> と公開鍵）を <C>SizePrefixedMultisigAccountModificationDescriptor</C> で包んで並べます。</P>
      <Code code={d.ex11} />
      <P>第1引数は、承認に必要な人数そのものではなく、<strong>現在の値からの増減</strong>です。最初は0なので、2人の承認を必要にするなら +2 を渡します。このコードは、<C>nemAlice</C> を、<C>nemBob</C> と <C>nemCarol</C> を連署者とするマルチシグにするトランザクションを作って、署名します。なお、実際にNISで受理されるには、NEM独自の条件（連署者側の署名など）が加わります。この節は、組み立てと署名までを説明するもので、その条件は実ノードでは確かめていません。実際に行うときは、NEMの公式ドキュメントで手順を確認してください。</P>

      <H3>マルチシグアカウントから送金する</H3>
      <P>マルチシグ化した <C>nemAlice</C> から送金する流れを、3つに分けて作ります。</P>
      <Ul>
        <Li><strong>① 送金トランザクション</strong>: 署名者（<C>signerPublicKey</C>）を <C>nemAlice</C> にして作ります。このトランザクションには、署名しません。<C>toNonVerifiableTransaction</C> で、署名のない形にします。</Li>
        <Li><strong>② 起案者の署名</strong>: 連署者の1人（ここでは <C>nemBob</C>）が、①を <C>MultisigTransactionV1Descriptor</C> で包み、そのトランザクションに署名します。</Li>
        <Li><strong>③ 連署</strong>: ほかの連署者（<C>nemCarol</C>）が、①のハッシュとマルチシグアカウントのアドレスを指定した <C>CosignatureV1Descriptor</C> で、連署のトランザクションを作って署名します。</Li>
      </Ul>
      <Code code={d.ex12} />
      <P>Symbolのアグリゲートのように、1つのトランザクションに署名を集めるのではなく、<strong>連署が別のトランザクション</strong>になるのが、NEMのマルチシグの特徴です。手数料は、包んだトランザクションも、連署のトランザクションも、それぞれ必要です（上のコードの値は目安です）。この節も、実ノードへのアナウンスまでは確かめていません。</P>

      <H>14.11 監視</H>
      <P>第10章では、ノードのWebSocketでトランザクションの受信やブロックの更新を監視しました。NEMでも、ノードの状態を監視できます。ただし、Symbol SDK v3 には、NEM用の監視の部品（リスナー）はありません。NISのAPIを、直接呼び出して使います。方法は2つあります。</P>
      <Ul>
        <Li><strong>REST を一定の間隔で呼ぶ（ポーリング）</strong>: 手軽で、仕組みも単純です。</Li>
        <Li><strong>WebSocket で購読する</strong>: 変化があったときに、ノードから通知が届きます。</Li>
      </Ul>
      <H3>REST で状態を調べる</H3>
      <P>チェーンの高さは <C>GET /chain/height</C>、最新のブロックは <C>GET /chain/last-block</C> で取得できます。アカウントが受信した承認済みのトランザクションは <C>GET /account/transfers/incoming</C>、承認待ちのトランザクションは <C>GET /account/unconfirmedTransactions</C> です。どちらも <C>address</C> を渡します。</P>
      <Code code={d.monPoll} />
      <P>受信したトランザクションを、10秒ごとに確認して、新しいものだけ表示する例です。ハッシュを覚えておいて、すでに見たものは表示しません。</P>
      <Code code={d.monLoop} />
      <H3>WebSocket で購読する</H3>
      <P>NISのWebSocket（既定のポートは 7778）は、<strong>STOMP</strong> というプロトコルで通信します。接続したあと、購読したいチャンネルを <C>SUBSCRIBE</C> で指定します。主なチャンネルは、次のとおりです。</P>
      <Ul>
        <Li><C>/blocks/new</C>: 新しいブロック</Li>
        <Li><C>/unconfirmed/アドレス</C>: そのアドレスに関する、承認待ちのトランザクション</Li>
        <Li><C>/transactions/アドレス</C>: そのアドレスに関する、承認されたトランザクション</Li>
        <Li><C>/errors</C>: エラー（常に購読しておくことが推奨されています）</Li>
      </Ul>
      <Code code={d.monWs} />

      <H>14.12 オフライン署名</H>
      <P>第12章では、署名をあらかじめ集めておいて、あとからまとめてアナウンスする方法を説明しました。NEMでも、<strong>署名はオフラインでできます</strong>。署名に必要なのは、秘密鍵とトランザクションのデータだけで、ノードへの接続は要らないからです。ノードに接続するのは、アナウンスのときだけです。</P>
      <H3>署名だけをオフラインで行う</H3>
      <P>オフラインの環境で、トランザクションを作って署名し、ペイロード（JSON）の文字列を取り出します。この文字列を、オンラインの環境に持っていって、14.8 の方法でアナウンスします。秘密鍵が、オンラインの環境に出ないのが利点です。</P>
      <Code code={d.ex13} />
      <P>注意点は、有効期限です。NEMのトランザクションには、作成した時刻（<C>timestamp</C>）と有効期限（<C>deadline</C>）が入ります。時刻は、署名する環境の時計から取るので、<strong>オフラインの環境の時計が正確である</strong>ことが必要です。また、有効期限が切れる前にアナウンスしなければなりません。</P>
      <H3>マルチシグの連署を、オフラインで行う</H3>
      <P>マルチシグの連署も、オフラインでできます。起案者が作った、包んだトランザクションのペイロードを受け取り、そこから元のトランザクションを復元します。復元には、<C>sdkNem.models.NonVerifiableTransactionFactory.deserialize</C> を使います。復元したトランザクションの中身を確かめてから、そのハッシュを指定して連署します。</P>
      <Code code={d.ex13Cosign} />
      <P>連署する前に、<strong>中身（送り先と金額）を必ず確認します</strong>。連署は、署名したハッシュのトランザクションを承認する意味を持つので、内容を見ずに署名してはいけません。ここで求めたハッシュは、14.10 で起案者が包んだ送金のハッシュと同じものです。</P>

      <H>14.13 検証</H>
      <P>第13章では、ノードを信用せずに、トランザクションやブロックを自分で検証しました。NEMでは、<strong>受け取ったペイロードを、自分で検証する</strong>ことができます。他人から渡されたペイロードを、そのまま信用して署名・アナウンスしないために、次の手順で確かめます。</P>
      <Ul>
        <Li><strong>① 中身を読む</strong>: ペイロードからトランザクションを復元して、送り先・金額・メッセージを読みます。</Li>
        <Li><strong>② 署名者を確かめる</strong>: 署名者の公開鍵が、期待した相手のものか確認します。</Li>
        <Li><strong>③ 署名を検証する</strong>: 署名者の公開鍵で、署名が正しいか確かめます。</Li>
        <Li><strong>④ ハッシュを計算する</strong>: トランザクションのハッシュを、自分で計算します。ノードが返すハッシュと照らし合わせるときに使えます。</Li>
      </Ul>
      <Code code={d.ex14} />
      <Out code={d.ex14Out} />
      <P>3つ目の結果が true で、4つ目（1バイトだけ書き換えたもの）が false です。署名は、中身が1バイトでも変わると成り立たないので、ペイロードが改ざんされていないことを確かめられます。</P>

      <H>14.14 実際に送るときの注意</H>
      <P>この章のコードのうち、14.9 と 14.10 のトランザクションは、署名してペイロードを作るところまでです。14.11 の監視と、14.8 のアナウンスは、実際のNISノードが必要です。実際にNEMのネットワークに送るときは、次の点に注意してください。</P>
      <Ul>
        <Li>賃料の送付先アドレス・賃料の金額・手数料は、SDKには含まれていません。送る前に、必ず公式の最新の情報で確認しましょう。手数料が少なすぎると、ノードに拒否されます。</Li>
        <Li>まずテストネットで試してください。メインネットで使うときは、<C>NemFacade('mainnet')</C> に替え、送付先アドレスもメインネット用に替えます。</Li>
        <Li>Descriptor の引数の並びは、Symbolとは異なります。迷ったら、SDKの型定義や、公式のドキュメントで確認しましょう。</Li>
        <Li>マルチシグは、NEM独自の仕組み（連署が別のトランザクションになる）です。Symbolのアグリゲートの感覚で組み立てると、うまくいきません。</Li>
      </Ul>
    </>
  );
}
