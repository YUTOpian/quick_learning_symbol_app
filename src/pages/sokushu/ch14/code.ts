// 速習Symbol 第14章 NEM のサンプルコード（Symbol SDK v3 専用）。
// コンソールでそのまま実行できるよう、const 宣言は付けていない（ch02〜ch13 と同じ方針）。
const r = String.raw;

// ---------- 14.2 準備 ----------
export const prep = r`sdkNem = sdk.nem;                         // SDK v3 に同梱されている NEM 用の部品
nemFacade = new sdkNem.NemFacade('testnet'); // NEM 用の facade（'mainnet' も指定できる）
console.log(nemFacade.network.name, nemFacade.network.identifier);`;
export const prepOut = r`> testnet 152`;

// 手数料の目安を計算する関数（XEM送金 + メッセージ）。単位は μXEM（1 XEM = 1,000,000 μXEM）。
export const feeFn = r`function nemFee(amountXem, messageBytes) {
  const amountUnits = Math.max(1, Math.min(25, Math.floor(amountXem / 10000)));         // 送金額: 1万XEMごとに +0.05 XEM（最大 1.25 XEM）
  const messageUnits = messageBytes > 0 ? Math.floor(messageBytes / 32) + 1 : 0;        // メッセージ: 32バイトごとに 0.05 XEM
  return BigInt((amountUnits + messageUnits) * 50000);
}
console.log(nemFee(1, 11));`;
export const feeFnOut = r`> 100000n`;

// ---------- 演習1 アカウント ----------
export const ex1 = r`nemAlice = nemFacade.createAccount(sdkCore.PrivateKey.random());
nemBob = nemFacade.createAccount(sdkCore.PrivateKey.random());
console.log(nemAlice.address.toString());
console.log(nemAlice.address.toString().length);
console.log(nemAlice.publicKey.toString());`;
export const ex1Out = r`> TCVTW447BVIDDAO4P72PJIEPMAXN3GU6JJCDLBAG
> 40
> 2A0FBFE5FD0AE5652706978B40B72CE81DDA30D443250B04BFC7D68C81D2E755`;

// ---------- 演習2 同じ秘密鍵 ----------
export const ex2 = r`pk = sdkCore.PrivateKey.random();
symAcc = new sdkSymbol.SymbolFacade('testnet').createAccount(pk);
nemAcc = nemFacade.createAccount(pk);
console.log(symAcc.publicKey.toString() === nemAcc.publicKey.toString());
console.log(symAcc.address.toString(), symAcc.address.toString().length);
console.log(nemAcc.address.toString(), nemAcc.address.toString().length);`;
export const ex2Out = r`> false
> TAS6XN3CACAZXLBE2RAKZWXAARUL2PSIES7ECRI 39
> TD2WRFVIGO6OVUZG5MMBGQLHADB4FOFSMFDINU3F 40`;

// ---------- 演習3 トランザクション作成 ----------
export const ex3 = r`messageBytes = new TextEncoder().encode('Hello, NEM!');

descriptor = new sdkNem.descriptors.TransferTransactionV1Descriptor( // Txタイプ:転送Tx (V1)
  nemBob.address,                                                    // 受取アドレス
  new sdkNem.models.Amount(1000000n),                                // 1 XEM（単位は μXEM）
  new sdkNem.descriptors.MessageDescriptor(sdkNem.models.MessageType.PLAIN, messageBytes) // 平文メッセージ
);

nemTx = nemFacade.createTransactionFromTypedDescriptor(
  descriptor,
  nemAlice.publicKey,                  // 署名者公開鍵
  nemFee(1, messageBytes.length),      // 手数料（μXEM）。Symbol のような「乗数」ではなく、金額そのもの
  60 * 60 * 2                          // Deadline:有効期限(秒単位)
);
console.log(nemTx.toString());`;

// ---------- 演習4 署名・ペイロード・ハッシュ ----------
export const ex4 = r`nemSig = nemAlice.signTransaction(nemTx);
nemJson = nemFacade.transactionFactory.static.attachSignature(nemTx, nemSig);
console.log(nemJson);
console.log(nemFacade.hashTransaction(nemTx).toString());`;
export const ex4Out = r`> {"data":"0101000001000098...48656C6C6F2C204E454D21", "signature":"28E76D589EBF1E7C...0000"}
> D91C68B1739959402F8D97056AB4658EC239C061D03C8D6F736DEE3A629D531E`;

// ---------- 演習5 検証と改ざん検知 ----------
export const ex5 = r`console.log(nemFacade.verifyTransaction(nemTx, nemSig));

nemTx.amount = new sdkNem.models.Amount(2000000n); // 金額を 2 XEM に改ざん
console.log(nemFacade.verifyTransaction(nemTx, nemSig));

nemTx.amount = new sdkNem.models.Amount(1000000n); // 元に戻す
console.log(nemFacade.verifyTransaction(nemTx, nemSig));`;
export const ex5Out = r`> true
> false
> true`;

// ---------- 演習6 暗号化メッセージ ----------
export const ex6 = r`encrypted = nemAlice.messageEncoder().encode(nemBob.publicKey, new TextEncoder().encode('Hello, NEM!'));

descriptor = new sdkNem.descriptors.TransferTransactionV1Descriptor(
  nemBob.address,
  new sdkNem.models.Amount(0n),
  new sdkNem.descriptors.MessageDescriptor(sdkNem.models.MessageType.ENCRYPTED, encrypted.message)
);
encTx = nemFacade.createTransactionFromTypedDescriptor(descriptor, nemAlice.publicKey, nemFee(0, encrypted.message.length), 60 * 60 * 2);

// Bob が復号する（送信者 Alice の公開鍵が必要）
res = nemBob.messageEncoder().tryDecode(nemAlice.publicKey, encTx.message);
console.log(res.isDecoded, new TextDecoder().decode(res.message));`;
export const ex6Out = r`> true Hello, NEM!`;

// ---------- 演習7 アナウンス（NISノードが必要） ----------
export const ex7 = r`NEM_NODE = 'http://NISノードのホスト名:7890'; // ← ご自身が使えるNISノードに書き換える

res = await fetch(
  new URL('/transaction/announce', NEM_NODE),
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: nemJson,
  }
)
.then((res) => res.json());
console.log(res);`;
export const ex7Out = r`> {type: 1, code: 1, message: 'SUCCESS', transactionHash: {data: '…'}, innerTransactionHash: {}}`;
export const ex7Check = r`res = await fetch(new URL('/account/get?address=' + nemAlice.address.toString(), NEM_NODE))
.then((res) => res.json());
console.log(res.account.balance); // 残高（μXEM）`;

// ---------- 演習8 ネームスペース ----------
// 以降の演習は、署名して終わり（アナウンスはしない）。手数料・賃料の送付先は、実際に送る前に最新の情報で確認すること。
export const ex8 = r`nemBytes = (s) => new TextEncoder().encode(s);                       // 名前は文字列ではなくバイト列で渡す
NemAddress = nemFacade.static.Address;
nsSink = new NemAddress('TAMESPACEWH4MKFMBCVFERDPOOP4FK7MTDJEYP35');         // ネームスペース賃料の送付先（テストネット）

// ルートネームスペース（賃料 100 XEM）
rootDesc = new sdkNem.descriptors.NamespaceRegistrationTransactionV1Descriptor(
  nsSink,
  new sdkNem.models.Amount(100000000n), // 賃料（μXEM）
  nemBytes('sokushutest')               // 新しいネームスペース名
);
rootTx = nemFacade.createTransactionFromTypedDescriptor(rootDesc, nemAlice.publicKey, 150000n, 60 * 60 * 2);

// サブネームスペース（賃料 10 XEM）。親の名前を parentName に渡す
subDesc = new sdkNem.descriptors.NamespaceRegistrationTransactionV1Descriptor(
  nsSink,
  new sdkNem.models.Amount(10000000n),
  nemBytes('point'),
  nemBytes('sokushutest')
);
subTx = nemFacade.createTransactionFromTypedDescriptor(subDesc, nemAlice.publicKey, 150000n, 60 * 60 * 2);

console.log(rootTx.toString());
console.log(nemFacade.transactionFactory.static.attachSignature(subTx, nemAlice.signTransaction(subTx)));`;

// ---------- 演習9 モザイク定義と供給量 ----------
export const ex9 = r`prop = (name, value) => new sdkNem.descriptors.SizePrefixedMosaicPropertyDescriptor(
  new sdkNem.descriptors.MosaicPropertyDescriptor(nemBytes(name), nemBytes(value))
);
mosaicId = new sdkNem.descriptors.MosaicIdDescriptor(
  new sdkNem.descriptors.NamespaceIdDescriptor(nemBytes('sokushutest')), // 所属するネームスペース
  nemBytes('coin')                                                       // モザイク名
);
mosaicSink = new NemAddress('TBMOSAICOD4F54EE5CDMR23CCBGOAM2XSJBR5OLC'); // モザイク賃料の送付先（テストネット）

definition = new sdkNem.descriptors.MosaicDefinitionDescriptor(
  nemAlice.publicKey,                    // 作成者の公開鍵
  mosaicId,
  nemBytes('sokushu coin'),              // 説明
  [
    prop('divisibility', '0'),           // 可分性
    prop('initialSupply', '1000'),       // 初期供給量（整数単位）
    prop('supplyMutable', 'true'),       // 供給量を後から変えられる
    prop('transferable', 'true'),        // 作成者以外にも送れる
  ]
);
mosaicTx = nemFacade.createTransactionFromTypedDescriptor(
  new sdkNem.descriptors.MosaicDefinitionTransactionV1Descriptor(definition, mosaicSink, new sdkNem.models.Amount(10000000n)), // 賃料 10 XEM
  nemAlice.publicKey, 150000n, 60 * 60 * 2
);

// 供給量を 500 増やす（整数単位）
supplyTx = nemFacade.createTransactionFromTypedDescriptor(
  new sdkNem.descriptors.MosaicSupplyChangeTransactionV1Descriptor(mosaicId, sdkNem.models.MosaicSupplyChangeAction.INCREASE, new sdkNem.models.Amount(500n)),
  nemAlice.publicKey, 150000n, 60 * 60 * 2
);
console.log(nemFacade.transactionFactory.static.attachSignature(mosaicTx, nemAlice.signTransaction(mosaicTx)));
console.log(nemFacade.transactionFactory.static.attachSignature(supplyTx, nemAlice.signTransaction(supplyTx)));`;

// ---------- 演習10 転送V2でモザイクを送る ----------
export const ex10 = r`mosaicTransfer = new sdkNem.descriptors.TransferTransactionV2Descriptor(
  nemBob.address,
  new sdkNem.models.Amount(1000000n),    // 数量の「倍率」: 1000000 で 1 倍（XEMを送る額ではない点に注意）
  undefined,                             // メッセージなし
  [
    new sdkNem.descriptors.SizePrefixedMosaicDescriptor(
      new sdkNem.descriptors.MosaicDescriptor(mosaicId, new sdkNem.models.Amount(5n)) // 5 枚（整数単位）
    )
  ]
);
mosaicSendTx = nemFacade.createTransactionFromTypedDescriptor(mosaicTransfer, nemAlice.publicKey, 500000n, 60 * 60 * 2);
console.log(mosaicSendTx.mosaics.length, mosaicSendTx.amount.toString());
console.log(nemFacade.transactionFactory.static.attachSignature(mosaicSendTx, nemAlice.signTransaction(mosaicSendTx)));`;

// ---------- 演習11 マルチシグ化 ----------
export const ex11 = r`nemCarol = nemFacade.createAccount(sdkCore.PrivateKey.random());
addCosigner = (account) => new sdkNem.descriptors.SizePrefixedMultisigAccountModificationDescriptor(
  new sdkNem.descriptors.MultisigAccountModificationDescriptor(
    sdkNem.models.MultisigAccountModificationType.ADD_COSIGNATORY,
    account.publicKey
  )
);

// nemAlice を、nemBob と nemCarol の 2 人が連署者のマルチシグにする（承認に必要な人数: 2）
modTx = nemFacade.createTransactionFromTypedDescriptor(
  new sdkNem.descriptors.MultisigAccountModificationTransactionV2Descriptor(
    2,                                   // 必要な承認数の増減（0 → 2 なので +2）
    [addCosigner(nemBob), addCosigner(nemCarol)]
  ),
  nemAlice.publicKey, 500000n, 60 * 60 * 2
);
console.log(nemFacade.transactionFactory.static.attachSignature(modTx, nemAlice.signTransaction(modTx)));`;

// ---------- 演習12 マルチシグアカウントからの送金 ----------
export const ex12 = r`// ① マルチシグ化した nemAlice から nemCarol へ 1 XEM。署名者（signerPublicKey）は nemAlice のまま、署名はしない
innerTx = nemFacade.transactionFactory.static.toNonVerifiableTransaction(
  nemFacade.createTransactionFromTypedDescriptor(
    new sdkNem.descriptors.TransferTransactionV1Descriptor(nemCarol.address, new sdkNem.models.Amount(1000000n)),
    nemAlice.publicKey, 50000n, 60 * 60 * 2
  )
);

// ② 起案者 nemBob が、①を包む「マルチシグトランザクション」に署名する
wrapTx = nemFacade.createTransactionFromTypedDescriptor(
  new sdkNem.descriptors.MultisigTransactionV1Descriptor(innerTx),
  nemBob.publicKey, 150000n, 60 * 60 * 2
);
wrapJson = nemFacade.transactionFactory.static.attachSignature(wrapTx, nemBob.signTransaction(wrapTx));

// ③ もう1人の連署者 nemCarol が、①のハッシュを指定して連署する
innerHash = nemFacade.hashTransaction(innerTx);
cosignTx = nemFacade.createTransactionFromTypedDescriptor(
  new sdkNem.descriptors.CosignatureV1Descriptor(innerHash, nemAlice.address), // 対象のハッシュと、マルチシグアカウントのアドレス
  nemCarol.publicKey, 150000n, 60 * 60 * 2
);
cosignJson = nemFacade.transactionFactory.static.attachSignature(cosignTx, nemCarol.signTransaction(cosignTx));

console.log(innerHash.toString());
console.log(wrapJson);
console.log(cosignJson);`;

// ---------- 監視（NISノードが必要） ----------
export const monPoll = r`NEM_NODE = 'http://NISノードのホスト名:7890'; // ← ご自身が使えるNISノードに書き換える

// チェーンの高さと、最新のブロック
height = await fetch(new URL('/chain/height', NEM_NODE)).then((res) => res.json());
console.log(height.height);
lastBlock = await fetch(new URL('/chain/last-block', NEM_NODE)).then((res) => res.json());
console.log(lastBlock.height, lastBlock.timeStamp);

// nemAlice が受信したトランザクション（承認済み）と、承認待ちのトランザクション
addr = nemAlice.address.toString();
incoming = await fetch(new URL('/account/transfers/incoming?address=' + addr, NEM_NODE)).then((res) => res.json());
console.log(incoming.data.length);
unconfirmed = await fetch(new URL('/account/unconfirmedTransactions?address=' + addr, NEM_NODE)).then((res) => res.json());
console.log(unconfirmed.data.length);`;

export const monLoop = r`seen = new Set();
first = true;
nemWatch = setInterval(async () => {
  res = await fetch(new URL('/account/transfers/incoming?address=' + nemAlice.address.toString(), NEM_NODE)).then((res) => res.json());
  res.data.forEach((t) => {
    h = t.meta.hash.data;
    if (!seen.has(h)) {
      seen.add(h);
      if (!first) console.log('受信', t.transaction.amount, h); // 最初の1回は、すでにあるものを覚えるだけ
    }
  });
  first = false;
}, 10000); // 10秒ごとに確認
// 止めるとき: clearInterval(nemWatch);`;

export const monWs = r`ws = new WebSocket('ws://NISノードのホスト名:7778/w/messages/websocket'); // STOMP を話す WebSocket
ws.onopen = () => ws.send('CONNECT\naccept-version:1.1,1.0\nheart-beat:10000,10000\n\n\0');
ws.onmessage = (e) => {
  if (e.data.startsWith('CONNECTED')) {
    ws.send('SUBSCRIBE\nid:sub-0\ndestination:/blocks/new\n\n\0');                                               // 新しいブロック
    ws.send('SUBSCRIBE\nid:sub-1\ndestination:/unconfirmed/' + nemAlice.address.toString() + '\n\n\0');         // 承認待ちのトランザクション
    ws.send('SUBSCRIBE\nid:sub-2\ndestination:/transactions/' + nemAlice.address.toString() + '\n\n\0');        // 承認されたトランザクション
    ws.send('SUBSCRIBE\nid:sub-3\ndestination:/errors\n\n\0');                                                   // エラー
  } else {
    console.log(e.data);
  }
};
// 止めるとき: ws.close();`;

// ---------- オフライン署名 ----------
export const ex13 = r`// ① オフラインの環境で、Alice が署名する（ノードには接続しない）
offlineTx = nemFacade.createTransactionFromTypedDescriptor(
  new sdkNem.descriptors.TransferTransactionV1Descriptor(
    nemBob.address,
    new sdkNem.models.Amount(1000000n),
    new sdkNem.descriptors.MessageDescriptor(sdkNem.models.MessageType.PLAIN, new TextEncoder().encode('Offline NEM!'))
  ),
  nemAlice.publicKey,
  nemFee(1, 12),
  60 * 60 * 2
);
offlineJson = nemFacade.transactionFactory.static.attachSignature(offlineTx, nemAlice.signTransaction(offlineTx));
console.log(offlineJson); // この文字列を、オンラインの環境に持っていく`;

export const ex13Cosign = r`// ② マルチシグの連署も、オフラインでできる。Bob が作った wrapJson（14.10）を Carol が受け取った、とする
wrapPayload = JSON.parse(wrapJson);
wrapRestored = sdkNem.models.NonVerifiableTransactionFactory.deserialize(sdkCore.utils.hexToUint8(wrapPayload.data));
innerRestored = wrapRestored.innerTransaction;

// 連署する前に、包まれている送金の中身を確かめる
console.log(new TextDecoder().decode(innerRestored.recipientAddress.bytes), innerRestored.amount.value);

cosign2 = nemFacade.createTransactionFromTypedDescriptor(
  new sdkNem.descriptors.CosignatureV1Descriptor(nemFacade.hashTransaction(innerRestored), nemAlice.address),
  nemCarol.publicKey, 150000n, 60 * 60 * 2
);
cosignJson2 = nemFacade.transactionFactory.static.attachSignature(cosign2, nemCarol.signTransaction(cosign2));
console.log(cosignJson2);`;

// ---------- 検証 ----------
export const ex14 = r`// 受け取った文字列（offlineJson）を、信用せずに検証する
received = JSON.parse(offlineJson);
data = sdkCore.utils.hexToUint8(received.data);
restoredTx = sdkNem.models.NonVerifiableTransactionFactory.deserialize(data);

// ① 中身を読む
console.log(new TextDecoder().decode(restoredTx.recipientAddress.bytes), restoredTx.amount.value, new TextDecoder().decode(restoredTx.message.message));

// ② 署名者は、期待した相手か
console.log(restoredTx.signerPublicKey.toString() === nemAlice.publicKey.toString());

// ③ 署名は正しいか（署名者の公開鍵だけで確かめられる）
verifier = new nemFacade.static.Verifier(restoredTx.signerPublicKey);
console.log(verifier.verify(data, new sdkCore.Signature(received.signature)));

// ④ 1バイトだけ書き換えると、どうなるか
tampered = data.slice();
tampered[tampered.length - 1] ^= 1;
console.log(verifier.verify(tampered, new sdkCore.Signature(received.signature)));

// ⑤ トランザクションのハッシュを、自分で計算する
console.log(nemFacade.hashTransaction(restoredTx).toString());`;
export const ex14Out = r`> TAS6XN3CACAZXLBE2RAKZWXAARUL2PSIES7ECRI... 1000000n Offline NEM!
> true
> true
> false
> B07EC2F13E3E0D9D35CE7DBFABB636B9D4D42A286B4886A9F4B4508756D7385D`;
