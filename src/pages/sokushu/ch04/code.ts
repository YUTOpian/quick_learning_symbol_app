// 速習Symbol 第4章 トランザクション のサンプルコードと出力例（04_transaction.md より）。
// コンソールでそのまま実行できるよう、const 宣言は付けていない（ch02 / ch03 と同じ方針）。
const r = String.raw;

// ---------- 4.2 トランザクション作成 ----------
export const bobV2 = r`bob = sym.Account.generateNewAccount(networkType);
console.log(bob.address);`;
export const bobV2Out = r`> Address {address: 'TDWBA6L3CZ6VTZAZPAISL3RWM5VKMHM6J6IM3LY', networkType: 152}`;
export const bobV3 = r`bob = facade.createAccount(sdkCore.PrivateKey.random());
console.log(bob.address.toString());`;
export const bobV3Out = r`> TDWBA6L3CZ6VTZAZPAISL3RWM5VKMHM6J6IM3LY`;
export const txV2 = r`tx = sym.TransferTransaction.create(
    sym.Deadline.create(epochAdjustment), //Deadline:有効期限
    bob.address,
    [],
    sym.PlainMessage.create("Hello Symbol!"), //メッセージ
    networkType //テストネット・メインネット区分
).setMaxFee(100); //手数料`;
export const txV3 = r`messageData = "\0Hello, Symbol!"; // 平文メッセージ

// トランザクション Descriptor 設定
descriptor = new sdkSymbol.descriptors.TransferTransactionV1Descriptor(  // Txタイプ:転送Tx
  bob.address,      // 受取アドレス
  [
    //// 1XYM送金
    // new sdkSymbol.descriptors.UnresolvedMosaicDescriptor(
    //   new sdkSymbol.models.UnresolvedMosaicId(0x72C0212E67A08BCEn),
    //   new sdkSymbol.models.Amount(1000000n)
    // )
  ],
  messageData       // メッセージ
);

tx = facade.createTransactionFromTypedDescriptor(
  descriptor,       // トランザクション Descriptor 設定
  alice.publicKey,  // 署名者公開鍵
  100,              // 手数料乗数
  60 * 60 * 2       // Deadline:有効期限(秒単位)
);
console.log(tx);`;
export const txV3Old = r`messageData = new Uint8Array([0x00,...(new TextEncoder('utf-8')).encode('Hello, Symbol!')]); //　平文メッセージ
tx = facade.transactionFactory.create({
  type: 'transfer_transaction_v1',      // Txタイプ:転送Tx
  signerPublicKey: aliceKey.publicKey,  // 署名者公開鍵
  deadline: facade.network.fromDatetime(new Date()).addHours(2).timestamp, //Deadline:有効期限
  recipientAddress: bobAddress.toString(),
  mosaics: [
  // { mosaicId: 0x72C0212E67A08BCEn, amount: 1000000n } // 1XYM送金
  ],
  message: messageData
});
tx.fee = new sdkSymbol.models.Amount(BigInt(tx.size * 100)); //手数料
console.log(tx);`;
export const deadlineV2 = r`sym.Deadline.create(epochAdjustment,6)`;
export const deadlineV3 = r`tx = facade.createTransactionFromTypedDescriptor(
  ,           // Descriptor
  ,           // 署名者公開鍵
  ,           // 手数料乗数
  60 * 60 * 6 // Deadline:有効期限(秒単位)
);`;
export const deadlineV3Old = r`facade.network.fromDatetime(new Date()).addHours(6).timestamp`;
export const deadlineV320 = r`// コミット f183132 相当の処理
differenceMilliseconds = (new Date()).getTime() - facade.network.datetimeConverter.epoch.getTime();
networkTimestamp = new sdkSymbol.NetworkTimestamp(Math.trunc(differenceMilliseconds / facade.network.datetimeConverter.timeUnits));
networkTimestamp.addHours(6).timestamp;`;
export const msgEmptyV2 = r`sym.EmptyMessage`;
export const msgEmptyV3 = r`messageData = new Uint8Array();`;
export const msgPlainV2 = r`sym.PlainMessage.create("Hello Symbol!")`;
export const msgPlainV3 = r`messageData = 'Hello, Symbol!';`;
export const msgPlainV3Type = r`messageData = '\0Hello, Symbol!';`;
export const msgPlainV3Old = r`messageData = new Uint8Array(new TextEncoder('utf-8').encode('Hello, Symbol!'));`;
export const msgEncV2 = r`sym.EncryptedMessage('294C8979156C0D941270BAC191F7C689E93371EDBC36ADD8B920CF494012A97BA2D1A3759F9A6D55D5957E9D');`;
export const msgEncV3 = r`messageData = alice.messageEncoder().encode(bob.publicKey, new TextEncoder().encode('Hello Symbol!'));`;
export const msgRawV2 = r`sym.RawMessage.create(uint8Arrays[i])`;
export const msgRawV3 = r`messageData = new Uint8Array([0xFF,...(new TextEncoder('utf-8')).encode('Hello, Symbol!')]);`;
export const feeMulV2 = r`tx = sym.TransferTransaction.create(
  ,,,,
  networkType
).setMaxFee(100);`;
export const feeMulV3 = r`tx = facade.createTransactionFromTypedDescriptor(
  ,     // Descriptor
  ,     // 署名者公開鍵
  100,  // 手数料乗数
        // Deadline:有効期限(秒単位)
);`;
export const maxFeeV2 = r`tx = sym.TransferTransaction.create(
  ,,,,
  networkType,
  sym.UInt64.fromUint(17600)
);`;
export const maxFeeV3 = r`tx = facade.createTransactionFromTypedDescriptor(
  // 省略
);
tx.fee = new sdkSymbol.models.Amount(BigInt(17600)); //手数料`;

// ---------- 4.3 署名とアナウンス ----------
export const signV2 = r`signedTx = alice.sign(tx,generationHash);
console.log(signedTx);`;
export const signV2Out = r`> SignedTransaction
    hash: "3BD00B0AF24DE70C7F1763B3FD64983C9668A370CB96258768B715B117D703C2"
    networkType: 152
    payload:
"AE00000000000000CFC7A36C17060A937AFE1191BC7D77E33D81F3CC48DF9A0FFE892858DFC08C9911221543D687813ECE3D36836458D2569084298C09223F9899DF6ABD41028D0AD4933FC1E4C56F9DF9314E9E0533173E1AB727BDB2A04B59F048124E93BEFBD20000000001985441F843000000000000879E76C702000000986F4982FE77894ABC3EBFDC16DFD4A5C2C7BC05BFD44ECE0E000000000000000048656C6C6F2053796D626F6C21"
    signerPublicKey: "D4933FC1E4C56F9DF9314E9E0533173E1AB727BDB2A04B59F048124E93BEFBD2"
    type: 16724`;
export const signV3 = r`sig = alice.signTransaction(tx);
jsonPayload = facade.transactionFactory.static.attachSignature(tx, sig);`;
export const signV3Out = r`> '{"payload": "AF0000000000000041EE9F8B3EB4D54F069B1CD47A79656DCE4C85B486D1735DF054B91838ECF6E06B6F371BB986E676A5F5BF091A5DEF5230BC6E6112F7D2104BE24923355B890869A31A837EB7DE323F08CA52495A57BA0A95B52D1BB54CEA9A94C12A87B1CADB00000000019854415C44000000000000426B07250500000098A8D76FEF8382274D472EE377F2FF3393E5B62C08B4329D0F00000000000000FF48656C6C6F2C2053796D626F6C21"}'`;
export const announceV2 = r`res = await txRepo.announce(signedTx).toPromise();
console.log(res);`;
export const announceV2Out = r`> TransactionAnnounceResponse {message: 'packet 9 was pushed to the network via /transactions'}`;
export const announceV3 = r`res = await fetch(
  new URL('/transactions', NODE),
  {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: jsonPayload,
  }
)
.then((res) => res.json())
.then((json) => {
  return json;
});
console.log(res);`;
export const announceV3Out = r`> {message: 'packet 9 was pushed to the network via /transactions'}`;
export const failV2Out = r`Uncaught Error: {"statusCode":409,"statusMessage":"Unknown Error","body":"{\"code\":\"InvalidArgument\",\"message\":\"payload has an invalid format\"}"}`;
export const failV3Out = r`> {code: 'InvalidArgument', message: 'payload has an invalid format'}`;

// ---------- 4.4 確認 ----------
export const statusV2 = r`tsRepo = repo.createTransactionStatusRepository();
transactionStatus = await tsRepo.getTransactionStatus(signedTx.hash).toPromise();
console.log(transactionStatus);`;
export const statusV2Out = r`> TransactionStatus
    group: "confirmed"
    code: "Success"
    deadline: Deadline {adjustedValue: 11989512431}
    hash: "661360E61C37E156B0BE18E52C9F3ED1022DCE846A4609D72DF9FA8A5B667747"
    height: undefined`;
export const statusV3 = r`body = {
  "hashes": facade.hashTransaction(tx).toString()
};
transactionStatus = await fetch(
  new URL('/transactionStatus', NODE),
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }
)
.then((res) => res.json())
.then((json) => {
  return json;
});
if (transactionStatus.length <= 0) {
  console.error("not exist tx.");
} else {
  console.log(transactionStatus[0]);
}`;
export const statusV3Out = r`> {group: 'confirmed', code: 'Success', hash: '02DC42E10B3E51B49AA9CD1074481C4B0764D8DA4BE7F33F83DC1DC9ED84C79D', deadline: '22164976452', height: '636865'}`;
export const statusFailOut = r`> TransactionStatus
    group: "failed"
    code: "Failure_Core_Insufficient_Balance"
    deadline: Deadline {adjustedValue: 11990156766}
    hash: "A82507C6C46DF444E36AC94391EA2D0D7DD1A218948DED465A7A4F9D1B53CA0E"
    height: undefined`;
export const notFoundOut = r`Uncaught Error: {"statusCode":404,"statusMessage":"Unknown Error","body":"{\"code\":\"ResourceNotFound\",\"message\":\"no resource exists with id '18AEBC9866CD1C15270F18738D577CB1BD4B2DF3EFB28F270B528E3FE583F42D'\"}"}`;
export const hashV2 = r`console.log(signedTx.hash);`;
export const hashV3 = r`console.log(facade.hashTransaction(tx).toString());`;
export const hashOut = r`> "661360E61C37E156B0BE18E52C9F3ED1022DCE846A4609D72DF9FA8A5B667747"`;
export const infoV2 = r`txInfo = await txRepo.getTransaction(signedTx.hash,sym.TransactionGroup.Confirmed).toPromise();
console.log(txInfo);`;
export const infoV2Out = r`> TransferTransaction
    deadline: Deadline {adjustedValue: 12883929118}
    maxFee: UInt64 {lower: 17400, higher: 0}
    message: PlainMessage {type: 0, payload: 'Hello Symbol!'}
    mosaics: []
    networkType: 152
    payloadSize: 174
    recipientAddress: Address {address: 'TDWBA6L3CZ6VTZAZPAISL3RWM5VKMHM6J6IM3LY', networkType: 152}
    signature: "7A3562DCD7FEE4EE9CB456E48EFEEC687647119DC053DE63581FD46CA9D16A829FA421B39179AABBF4DE0C1D987B58490E3F95C37327358E6E461832E3B3A60D"
    signer: PublicAccount {publicKey: '0E5C72B0D5946C1EFEE7E5317C5985F106B739BB0BC07E4F9A288417B3CD6D26', address: Address}
  > transactionInfo: TransactionInfo
        hash: "DA4B672E68E6561EAE560FB89B144AFE1EF75D2BE0D9B6755D90388F8BCC4709"
        height: UInt64 {lower: 330012, higher: 0}
        id: "626413050A21EB5CD286E17D"
        index: 1
        merkleComponentHash: "DA4B672E68E6561EAE560FB89B144AFE1EF75D2BE0D9B6755D90388F8BCC4709"
    type: 16724
    version: 1`;
export const infoV3 = r`txInfo = await fetch(
  new URL('/transactions/confirmed/' + facade.hashTransaction(tx).toString(), NODE),
  {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  }
)
.then((res) => res.json())
.then((json) => {
  return json;
});
console.log(txInfo);`;
export const infoV3Out = r`> {meta: {…}, transaction: {…}, id: '64B253382F7CE156B01031C1'}
    id: "64B253382F7CE156B01031C1"
  > meta:
      feeMultiplier: 100
      hash: "02DC42E10B3E51B49AA9CD1074481C4B0764D8DA4BE7F33F83DC1DC9ED84C79D"
      height: "636865"
      index: 0
      merkleComponentHash: "02DC42E10B3E51B49AA9CD1074481C4B0764D8DA4BE7F33F83DC1DC9ED84C79D"
      timestamp: "22157844926"
  > transaction:
      deadline: "22164976452"
      maxFee: "17500"
      message: "0048656C6C6F2C2053796D626F6C21"
      mosaics: []
      network: 152
      recipientAddress: "98A8D76FEF8382274D472EE377F2FF3393E5B62C08B4329D"
      signature: "29783E718E414D2A2B62821FC53E66DCFEBDC1EF10FFD35F7662263FA7332F01CD47676429A982A85FEC7F2E7983D36F4BCE5C5AB1BB4A591BC54979AF906D0A"
      signerPublicKey: "69A31A837EB7DE323F08CA52495A57BA0A95B52D1BB54CEA9A94C12A87B1CADB"
      size: 175
      type: 16724
      version: 1`;
export const watchV2 = r`hash = signedTx.hash;
tsRepo = repo.createTransactionStatusRepository();
transactionStatus = await tsRepo.getTransactionStatus(hash).toPromise();
console.log(transactionStatus);
txInfo = await txRepo.getTransaction(hash,sym.TransactionGroup.Confirmed).toPromise();
console.log(txInfo);`;
export const watchV3 = r`hash = facade.hashTransaction(tx).toString();
// ステータスの確認
body = {
  "hashes": hash
};
transactionStatus = await fetch(
  new URL('/transactionStatus', NODE),
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }
)
.then((res) => res.json())
.then((json) => {
  return json;
});
if (transactionStatus.length <= 0) {
  console.error("not exist tx.");
} else {
  console.log(transactionStatus[0]);
}
console.log(transactionStatus);
// 承認確認
txInfo = await fetch(
  new URL('/transactions/confirmed/' + hash, NODE),
  {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  }
)
.then((res) => res.json())
.then((json) => {
  return json;
});
console.log(txInfo);`;

// ---------- 4.5 トランザクション履歴 ----------
export const histV2 = r`result = await txRepo.search(
  {
    group:sym.TransactionGroup.Confirmed,
    embedded:true,
    address:alice.address
  }
).toPromise();

txes = result.data;
txes.forEach(tx => {
  console.log(tx);
})`;
export const histV2Out = r`> TransferTransaction
    type: 16724
    networkType: 152
    payloadSize: 176
    deadline: Deadline {adjustedValue: 11905303680}
    maxFee: UInt64 {lower: 200000000, higher: 0}
    recipientAddress: Address {address: 'TBXUTAX6O6EUVPB6X7OBNX6UUXBMPPAFX7KE5TQ', networkType: 152}
    signature: "E5924A1EB653240A7220405A4DD4E221E71E43327B3BA691D267326FEE3F57458E8721907188DB33A3F2A9CB1D0293845B4D0F1D7A93C8A3389262D1603C7108"
    signer: PublicAccount {publicKey: 'BDFAF3B090270920A30460AA943F9D8D4FCFF6741C2CB58798DBF7A2ED6B75AB', address: Address}
  > message: RawMessage
      payload: ""
      type: -1
  > mosaics: Array(1)
      0: Mosaic
        amount: UInt64 {lower: 10000000, higher: 0}
        id: MosaicId
          id: Id {lower: 760461000, higher: 981735131}
  > transactionInfo: TransactionInfo
      hash: "308472D34BE1A58B15A83B9684278010F2D69B59E39127518BE38A4D22EEF31D"
      height: UInt64 {lower: 301717, higher: 0}
      id: "6255242053E0E706653116F9"
      index: 0
      merkleComponentHash: "308472D34BE1A58B15A83B9684278010F2D69B59E39127518BE38A4D22EEF31D"`;
export const txTypes = r`{0: 'RESERVED', 16705: 'AGGREGATE_COMPLETE', 16707: 'VOTING_KEY_LINK', 16708: 'ACCOUNT_METADATA', 16712: 'HASH_LOCK', 16716: 'ACCOUNT_KEY_LINK', 16717: 'MOSAIC_DEFINITION', 16718: 'NAMESPACE_REGISTRATION', 16720: 'ACCOUNT_ADDRESS_RESTRICTION', 16721: 'MOSAIC_GLOBAL_RESTRICTION', 16722: 'SECRET_LOCK', 16724: 'TRANSFER', 16725: 'MULTISIG_ACCOUNT_MODIFICATION', 16961: 'AGGREGATE_BONDED', 16963: 'VRF_KEY_LINK', 16964: 'MOSAIC_METADATA', 16972: 'NODE_KEY_LINK', 16973: 'MOSAIC_SUPPLY_CHANGE', 16974: 'ADDRESS_ALIAS', 16976: 'ACCOUNT_MOSAIC_RESTRICTION', 16977: 'MOSAIC_ADDRESS_RESTRICTION', 16978: 'SECRET_PROOF', 17220: 'NAMESPACE_METADATA', 17229: 'MOSAIC_SUPPLY_REVOCATION', 17230: 'MOSAIC_ALIAS', 17232: 'ACCOUNT_OPERATION_RESTRICTION'}`;
export const msgTypes = r`{0: 'PlainMessage', 1: 'EncryptedMessage', 254: 'PersistentHarvestingDelegationMessage', -1: 'RawMessage'}`;
export const histV3 = r`params = new URLSearchParams({
  "address": alice.address.toString(),
  "embedded": true,
});
result = await fetch(
  new URL('/transactions/confirmed?' + params.toString(), NODE),
  {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  }
)
.then((res) => res.json())
.then((json) => {
  return json;
});

txes = result.data;
txes.forEach(tx => {
  console.log(tx);
});`;
export const histV3Out = r`// 取得できたTx数分表示されます
> {meta: {…}, transaction: {…}, id: '636EF1EF8EFA5A777403DEDA'}
    id: "636EF1EF8EFA5A777403DEDA"
  > meta:
      feeMultiplier: 1136363
      hash: "EFDD7A4D419CAC459DA034089DF7F25E416A4782A1A6D9DBEC4ECF9AC3AAF1A9"
      height: "18925"
      index: 0
      merkleComponentHash: "EFDD7A4D419CAC459DA034089DF7F25E416A4782A1A6D9DBEC4ECF9AC3AAF1A9"
      timestamp: "964811467"
  > transaction:
      deadline: "971971235"
      maxFee: "200000000"
    > mosaics: Array(1)
        0:
          amount: "100000000"
          id: "72C0212E67A08BCE"
      network: 152
      recipientAddress: "982B2AA2295B5C23528ADDEE7F29F6521944E9F2340428AB"
      signature: "17104B0B8C9CB34C4FC42E448488A6608387841715921160F81C0FD60054CFACAE7200E3F41D911AA914D431197D923D6D98566E711DDC13C4BF0C768AAB3A04"
      signerPublicKey: "81EA7C15E7EC06261C9F654F54EAC4748CFCF00E09A8FE47779ACD14A7602004"
      size: 176
      type: 16724
      version: 1`;

// ---------- 4.5.1 Txペイロード作成時のメッセージの差異 ----------
export const payloadMsgV2 = r`plainMessage = sym.PlainMessage.create("Hello Symbol!");
console.log(plainMessage);
encryptedMessage = alice.encryptMessage("Hello Symbol!", bob.publicAccount);
console.log(encryptedMessage);
rawMessage = sym.RawMessage.create([0x10, 0x20, 0x30]);
console.log(rawMessage);`;
export const payloadMsgV2Out = r`> PlainMessage
    payload: "Hello Symbol!"
    type: 0
> EncryptedMessage
    payload: "629937CEDFA1083DA326BC7FB431BFF2976BDBD1AD68197DF728D834083D2D25D1825D332DE2DDE388"
    recipientPublicAccount: PublicAccount {publicKey: '662CEDF69962B1E0F1BF0C43A510DFB12190128B90F7FE9BA48B1249E8E10DBE', address: Address}
    type: 1
> RawMessage
    payload: "102030"
    type: -1`;
export const payloadMsgV3 = r`message = 'Hello Symbol!';
plainMessage = new Uint8Array(new TextEncoder('utf-8').encode('\0Hello, Symbol!'));
console.log(plainMessage);
encryptedMessage = alice.messageEncoder().encode(bob.publicKey, new TextEncoder().encode(message));
console.log(encryptedMessage);
rawMessage = new Uint8Array([0xFF, 0x10, 0x20, 0x30]);
console.log(rawMessage);`;
export const payloadMsgV3Out = r`> Uint8Array(15) [...]
    0: 0    // メッセージタイプ 0x00 (平文メッセージ)
    1: 72   // 'H'
    2: 101  // 'e'
    3: 108  // 'l'
    // 以下省略
> Uint8Array(42) [...]
    0: 1    // メッセージタイプ 0x01 (暗号化メッセージ)
    1: 163
    2: 55
    3: 105
    // 以下省略
> Uint8Array(4) [...]
    0: 255  // メッセージタイプ 0xFF (生データ)
    1: 16   // 0x10
    2: 32   // 0x20
    3: 48   // 0x30`;
export const sendEncV2 = r`// 暗号化メッセージの作成
encryptedMessage = alice.encryptMessage("Hello Symbol!", bob.publicAccount);

// Tx 作成
tx = sym.TransferTransaction.create(
    sym.Deadline.create(epochAdjustment), //Deadline:有効期限
    bob.address,
    [],
    encryptedMessage, //メッセージ
    networkType //テストネット・メインネット区分
).setMaxFee(100); //手数料

// 署名とアナウンス
signedTx = alice.sign(tx,generationHash);
res = await txRepo.announce(signedTx).toPromise();
// Txハッシュの表示
console.log(signedTx.hash);`;
export const sendEncV2Out = r`> DE663D99BC9E2EEC408E255055CC4DA18CCEEEEF57CE97E607B2C47E9C725085`;
export const sendEncV3 = r`// 暗号化メッセージの作成
encryptedMessage = alice.messageEncoder().encode(bob.publicKey, new TextEncoder().encode("Hello Symbol!"));

// トランザクション Descriptor 設定
descriptor = new sdkSymbol.descriptors.TransferTransactionV1Descriptor(  // Txタイプ:転送Tx
  bob.address,      // 受取アドレス
  [],               // 送信モザイク
  encryptedMessage // メッセージ
);

// Tx 作成
tx = facade.createTransactionFromTypedDescriptor(
  descriptor,       // トランザクション Descriptor 設定
  alice.publicKey,  // 署名者公開鍵
  100,              // 手数料乗数
  60 * 60 * 2       // Deadline:有効期限(秒単位)
);

// 署名とアナウンス
sig = alice.signTransaction(tx);
jsonPayload = facade.transactionFactory.static.attachSignature(tx, sig);
res = await fetch(
  new URL('/transactions', NODE),
  {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: jsonPayload,
  }
)
.then((res) => res.json())
.then((json) => {
  return json;
});
// Txハッシュの表示
console.log(facade.hashTransaction(tx).toString());`;
export const sendEncV3Out = r`> AB6146ADBC96DAF58741F98FB2BACE7D96AAEBFA20416458AE7EF4253FB40ECF`;
export const readV2 = r`// v3 でアナウンスしたTxのハッシュ値を指定してTx取得
txInfo = await txRepo.getTransaction("AB6146ADBC96DAF58741F98FB2BACE7D96AAEBFA20416458AE7EF4253FB40ECF",sym.TransactionGroup.Confirmed).toPromise();

// メッセージを復号化して表示
console.log(bob.decryptMessage(txInfo.message, alice.publicAccount));`;
export const readV2Out = r`> Uncaught Error: unrecognized hex char, char1:D, char2:�`;
export const readV3 = r`// v2 でアナウンスしたTxのハッシュ値を指定してTx取得
txInfo = await fetch(
  new URL('/transactions/confirmed/DE663D99BC9E2EEC408E255055CC4DA18CCEEEEF57CE97E607B2C47E9C725085', NODE),
  {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  }
)
.then((res) => res.json())
.then((json) => {
  return json;
});

// メッセージを復号化して表示
console.log(bob.messageEncoder().tryDecode(alice.publicKey, Buffer.from(txInfo.transaction.message, "hex")));`;
export const readV3Out = r`> (2) [false, Uint8Array(82)]
    0: false
    1: Uint8Array(82)`;
export const v2toV3 = r`messageV2 = txInfo.transaction.message.substr(2); // メッセージタイプを取り除く
hex1 = Buffer.from(messageV2, "hex");             // 1回目の16進数文字列から戻す変換
hex2 = Buffer.from(hex1.toString(), "hex");       // 2回目の16進数文字列から戻す変換
console.log(bob.messageEncoder().tryDecode(alice.publicKey, new Uint8Array([0x01, ...hex2])));  // メッセージタイプ 0x01 を付けてメッセージを復号する`;
export const v2toV3Out = r`> (2) [true, Uint8Array(13)]
    0: true
    1: Uint8Array(13)`;
export const decDeprecatedV3 = r`console.log(bob.messageEncoder().tryDecodeDeprecated(alice.publicKey, Buffer.from(txInfo.transaction.message, "hex")));`;
export const v3toV2Make = r`// 暗号化メッセージの作成
encrypted = alice.messageEncoder().encode(bob.publicKey, new TextEncoder().encode("Hello Symbol!"));
hex1 = Buffer.from(encrypted).subarray(1).toString("hex").toUpperCase();
encryptedMessage = new Uint8Array([0x01, ...(new TextEncoder().encode(hex1))]);
// Tx作成、アナウンス`;
export const v3toV2Read = r`txInfo = await txRepo.getTransaction("B50B7D51AE9401C364799EAC1E0FFE9CB1F4B8F531B03AD39658BD4FB5245A7F",sym.TransactionGroup.Confirmed).toPromise();
console.log(bob.decryptMessage(txInfo.message, alice.publicAccount));`;
export const v3toV2Out = r`> PlainMessage {type: 0, payload: 'Hello Symbol!'}
    payload: "Hello Symbol!"
    type: 0`;
export const encDeprecatedV3 = r`console.log(alice.messageEncoder().encodeDeprecated(bob.publicKey, new TextEncoder().encode("Hello Symbol!")));`;

// ---------- 4.6 アグリゲートトランザクション ----------
export const aggV2 = r`bob = sym.Account.generateNewAccount(networkType);
carol = sym.Account.generateNewAccount(networkType);

innerTx1 = sym.TransferTransaction.create(
    undefined, //Deadline
    bob.address,  //送信先
    [],
    sym.PlainMessage.create("tx1"),
    networkType
);

innerTx2 = sym.TransferTransaction.create(
    undefined, //Deadline
    carol.address,  //送信先
    [],
    sym.PlainMessage.create("tx2"),
    networkType
);

aggregateTx = sym.AggregateTransaction.createComplete(
    sym.Deadline.create(epochAdjustment),
    [
      innerTx1.toAggregate(alice.publicAccount), //送信元アカウントの公開鍵
      innerTx2.toAggregate(alice.publicAccount)  //送信元アカウントの公開鍵
    ],
    networkType,
    [],
    sym.UInt64.fromUint(1000000)
);
signedTx = alice.sign(aggregateTx,generationHash);
await txRepo.announce(signedTx).toPromise();`;
export const aggV3 = r`bob = facade.createAccount(sdkCore.PrivateKey.random());
carol = facade.createAccount(sdkCore.PrivateKey.random());

// アグリゲートTxに含めるTxを作成
descriptor1 = new sdkSymbol.descriptors.TransferTransactionV1Descriptor(  // Txタイプ:転送Tx
  bob.address,      // 送信先アドレス
  [],               // 送信モザイク
  'tx1'             // 平文メッセージ
);
innerTx1 = facade.createEmbeddedTransactionFromTypedDescriptor(
  descriptor1,      // トランザクション Descriptor 設定
  alice.publicKey,  // 署名者公開鍵
);

descriptor2 = new sdkSymbol.descriptors.TransferTransactionV1Descriptor(  // Txタイプ:転送Tx
  carol.address,    // 送信先アドレス
  [],               // 送信モザイク
  'tx2'             // 平文メッセージ
);
innerTx2 = facade.createEmbeddedTransactionFromTypedDescriptor(
  descriptor2,      // トランザクション Descriptor 設定
  alice.publicKey,  // 署名者公開鍵
);

embeddedTransactions = [
  innerTx1,
  innerTx2
];

// アグリゲートTx作成
descriptor = new sdkSymbol.descriptors.AggregateCompleteTransactionV3Descriptor(
  facade.static.hashEmbeddedTransactions(embeddedTransactions),
  embeddedTransactions
);
aggregateTx = facade.createTransactionFromTypedDescriptor(
  descriptor,       // トランザクション Descriptor 設定
  alice.publicKey,  // 署名者公開鍵
  100,              // 手数料乗数
  60 * 60 * 2,      // Deadline:有効期限(秒単位)
  0                 // 連署者数
);

// 署名とアナウンス
sig = alice.signTransaction(aggregateTx);
jsonPayload = facade.transactionFactory.static.attachSignature(aggregateTx, sig);
await fetch(
  new URL('/transactions', NODE),
  {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: jsonPayload,
  }
)
.then((res) => res.json())
.then((json) => {
  return json;
});`;
export const aggFeeV2 = r`aggregateTx = sym.AggregateTransaction.createComplete(
  sym.Deadline.create(epochAdjustment),
  [tx.toAggregate(alice.publicAccount)],
  networkType,[]
).setMaxFeeForAggregate(100, 1); // 第二引数に必要な連署者の数を指定`;
export const aggFeeV3 = r`tx = facade.createTransactionFromTypedDescriptor(
  ,     // Descriptor
  ,     // 署名者公開鍵
  100,  // 手数料乗数
  ,     // Deadline:有効期限(秒単位)
  1     // 必要な連署者の数を指定
);`;
export const aggFeeV3Old = r`// アグリゲートTx作成
aggregateTx = facade.transactionFactory.create({
  type: 'aggregate_complete_transaction_v2',
  signerPublicKey: aliceKey.publicKey,  // 署名者公開鍵
  deadline: facade.network.fromDatetime(new Date()).addHours(2).timestamp, //Deadline:有効期限
  transactionsHash: merkleHash,
  transactions: embeddedTransactions
});

// 連署により追加される連署情報のサイズを追加して最終的なTxサイズを算出する
requiredCosignatures = 1; // 必要な連署者の数を指定
calculatedCosignatures = requiredCosignatures > aggregateTx.cosignatures.length ? requiredCosignatures : aggregateTx.cosignatures.length;
sizePerCosignature = 8 + 32 + 64;
calculatedSize = aggregateTx.size - aggregateTx.cosignatures.length * sizePerCosignature + calculatedCosignatures * sizePerCosignature;
aggregateTx.fee = new sdkSymbol.models.Amount(BigInt(calculatedSize * 100)); //手数料`;

// ---------- 4.7 現場で使えるヒント ----------
export const hashSh = r`#Windows
certutil -hashfile WINファイルパス SHA256
#Mac
shasum -a 256 MACファイルパス
#Linux
sha256sum Linuxファイルパス`;
export const bigdata = r`bigdata = 'C00200000000000093B0B985101C1BDD1BC2BF30D72F35E34265B3F381ECA464733E147A4F0A6B9353547E2E08189EF37E50D271BEB5F09B81CE5816BB34A153D2268520AF630A0A0E5C72B0D5946C1EFEE7E5317C5985F106B739BB0BC07E4F9A288417B3CD6D26000000000198414140770200000000002A769FB40000000076B455CFAE2CCDA9C282BF8556D3E9C9C0DE18B0CBE6660ACCF86EB54AC51B33B001000000000000DB000000000000000E5C72B0D5946C1EFEE7E5317C5985F106B739BB0BC07E4F9A288417B3CD6D26000000000198544198205C1A4CE06C45B3A896B1B2360E03633B9F36BF7F22338B000000000000000066653465353435393833444430383935303645394533424446434235313637433046394232384135344536463032413837364535303734423641303337414643414233303344383841303630353343353345354235413835323835443639434132364235343233343032364244444331443133343139464435353438323930334242453038423832304100000000006800000000000000B2D4FD84B2B63A96AA37C35FC6E0A2341CEC1FD19C8FFC8D93CCCA2B028D1E9D000000000198444198205C1A4CE06C45B3A896B1B2360E03633B9F36BF7F2233BC089179EBBE01A81400140035383435344434373631364336433635373237396800000000000000B2D4FD84B2B63A96AA37C35FC6E0A2341CEC1FD19C8FFC8D93CCCA2B028D1E9D000000000198444198205C1A4CE06C45B3A896B1B2360E03633B9F36BF7F223345ECB996EDDB9BEB1400140035383435344434373631364336433635373237390000000000000000B2D4FD84B2B63A96AA37C35FC6E0A2341CEC1FD19C8FFC8D93CCCA2B028D1E9D5A71EBA9C924EFA146897BE6C9BB3DACEFA26A07D687AC4A83C9B03087640E2D1DDAE952E9DDBC33312E2C8D021B4CC0435852C0756B1EBD983FCE221A981D02';

let payloads = [];
for (let i = 0; i < bigdata.length / 1023; i++) {
    payloads.push(bigdata.substr(i * 1023, 1023));
}
console.log(payloads);`;
