// 速習Symbol 第5章 モザイク のサンプルコードと出力例（05_mosaic.md より）。
// コンソールでそのまま実行できるよう、const 宣言は付けていない（ch02 / ch03 / ch04 と同じ方針）。
const r = String.raw;

// ---------- 5.1 モザイク生成 ----------
export const defV2 = r`supplyMutable = true; //供給量変更の可否
transferable = false; //第三者への譲渡可否
restrictable = true; //制限設定の可否
revokable = true; //発行者からの還収可否

//モザイク定義
nonce = sym.MosaicNonce.createRandom();
mosaicDefTx = sym.MosaicDefinitionTransaction.create(
    undefined,
    nonce,
    sym.MosaicId.createFromNonce(nonce, alice.address), //モザイクID
    sym.MosaicFlags.create(supplyMutable, transferable, restrictable, revokable),
    2,//divisibility:可分性
    sym.UInt64.fromUint(0), //duration:有効期限
    networkType
);`;
export const defV3 = r`// モザイクフラグ設定
f = sdkSymbol.models.MosaicFlags.NONE.value;
f += sdkSymbol.models.MosaicFlags.SUPPLY_MUTABLE.value; // 供給量変更の可否
// f += sdkSymbol.models.MosaicFlags.TRANSFERABLE.value;   // 第三者への譲渡可否
f += sdkSymbol.models.MosaicFlags.RESTRICTABLE.value;   // 制限設定の可否
f += sdkSymbol.models.MosaicFlags.REVOKABLE.value;      // 発行者からの還収可否
flags = new sdkSymbol.models.MosaicFlags(f);

// ナンス設定
array = new Uint8Array(sdkSymbol.models.MosaicNonce.SIZE);
crypto.getRandomValues(array);
nonce = sdkSymbol.models.MosaicNonce.deserialize(array);

//モザイク定義
mosaicDefDescriptor = new sdkSymbol.descriptors.MosaicDefinitionTransactionV1Descriptor(  // Txタイプ:モザイク定義Tx
  new sdkSymbol.models.MosaicId(sdkSymbol.generateMosaicId(alice.address, nonce.value)),  // モザイクID
  new sdkSymbol.models.BlockDuration(0n), // duration:有効期限
  nonce,  // ナンス
  flags,  // モザイクフラグ
  2       // divisibility:可分性
);
mosaicDefTx = facade.createEmbeddedTransactionFromTypedDescriptor(
  mosaicDefDescriptor,  // トランザクション Descriptor 設定
  alice.publicKey,      // 署名者公開鍵
);`;
export const flagsOut = r`MosaicFlags {
  supplyMutable: false, transferable: false, restrictable: false, revokable: false
}`;
export const changeV2 = r`//モザイク変更
mosaicChangeTx = sym.MosaicSupplyChangeTransaction.create(
    undefined,
    mosaicDefTx.mosaicId,
    sym.MosaicSupplyChangeAction.Increase,
    sym.UInt64.fromUint(1000000), //数量
    networkType
);`;
export const changeV3 = r`//モザイク変更
mosaicChangeDescriptor = new sdkSymbol.descriptors.MosaicSupplyChangeTransactionV1Descriptor( // Txタイプ:モザイク変更Tx
  new sdkSymbol.models.UnresolvedMosaicId(mosaicDefTx.id.value),  // モザイクID
  new sdkSymbol.models.Amount(10000n),                // 数量
  sdkSymbol.models.MosaicSupplyChangeAction.INCREASE  // アクション
);
mosaicChangeTx = facade.createEmbeddedTransactionFromTypedDescriptor(
  mosaicChangeDescriptor, // トランザクション Descriptor 設定
  alice.publicKey,        // 署名者公開鍵
);`;
export const actionOut = r`{0: 'Decrease', 1: 'Increase'}`;
export const aggV2 = r`aggregateTx = sym.AggregateTransaction.createComplete(
    sym.Deadline.create(epochAdjustment),
    [
      mosaicDefTx.toAggregate(alice.publicAccount),
      mosaicChangeTx.toAggregate(alice.publicAccount),
    ],
    networkType,[],
).setMaxFeeForAggregate(100, 0);

signedTx = alice.sign(aggregateTx,generationHash);
await txRepo.announce(signedTx).toPromise();`;
export const aggV3 = r`embeddedTransactions = [
  mosaicDefTx,
  mosaicChangeTx
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
export const infoV2 = r`mosaicRepo = repo.createMosaicRepository();
accountInfo.mosaics.forEach(async mosaic => {
  mosaicInfo = await mosaicRepo.getMosaic(mosaic.id).toPromise();
  console.log(mosaicInfo);
});`;
export const infoV2Out = r`> MosaicInfo {version: 1, recordId: '622988B12A6128903FC10496', id: MosaicId, supply: UInt64, startHeight: UInt64, …}
> MosaicInfo
    divisibility: 2 //可分性
    duration: UInt64 {lower: 0, higher: 0} //有効期限
  > flags: MosaicFlags
        restrictable: true //制限設定の可否
        revokable: true //発行者からの還収可否
        supplyMutable: true //供給量変更の可否
        transferable: false //第三者への譲渡可否
  > id: MosaicId
        id: Id {lower: 207493124, higher: 890137608} //モザイクID
    ownerAddress: Address {address: 'TBIL6D6RURP45YQRWV6Q7YVWIIPLQGLZQFHWFEQ', networkType: 152} //作成者アドレス
    recordId: "62626E3C741381859AFAD4D5"
    supply: UInt64 {lower: 1000000, higher: 0} //供給量`;
export const infoV3 = r`// 3.3 アカウント情報の確認 - 所有モザイク一覧の取得 を事前に実施する

accountInfo.mosaics.forEach(async mosaic => {
  mosaicInfo = await fetch(
    new URL('/mosaics/' + mosaic.id, NODE),
    {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    }
  )
  .then((res) => res.json())
  .then((json) => {
    return json;
  });
  console.log(mosaicInfo);
});`;
export const infoV3Out = r`> {mosaic: {…}, id: '64B3E2336FFE587B6D24CE90'}
    id: "64B3E2336FFE587B6D24CE90"
  > mosaic:
        divisibility: 2         // 可分性
        duration: "0"           // 有効期限
        flags: 13               // モザイクフラグ、有効なフラグに対応した値の合計
                                //   供給量変更の可否(1)
                                //   第三者への譲渡可否(2)
                                //   制限設定の可否(4)
                                //   発行者からの還収可否(8)
        id: "663B178E904CADB8"  // モザイクID
        ownerAddress: "982B2AA2295B5C23528ADDEE7F29F6521944E9F2340428AB" // 作成者アドレス
        revision: 1
        startHeight: "640252"
        supply: "10000"         // 供給量
        version: 1`;

// ---------- 5.2 モザイク送信 ----------
export const sendV2 = r`//受信アカウント作成
bob = sym.Account.generateNewAccount(networkType);

tx = sym.TransferTransaction.create(
    sym.Deadline.create(epochAdjustment),
    bob.address,  //送信先アドレス
    // 送信モザイクリスト
    [
      new sym.Mosaic(
        new sym.MosaicId("72C0212E67A08BCE"), //テストネットXYM
        sym.UInt64.fromUint(1000000) //1XYM(divisibility:6)
      ),
      new sym.Mosaic(
        mosaicDefTx.mosaicId, // 5.1 で作成したモザイク
        sym.UInt64.fromUint(1)  // 数量:0.01(divisibility:2 の場合)
      )
    ],
    sym.EmptyMessage,
    networkType
).setMaxFee(100);
signedTx = alice.sign(tx,generationHash);
await txRepo.announce(signedTx).toPromise();
`;
export const sendV3 = r`//受信アカウント作成
bob = facade.createAccount(sdkCore.PrivateKey.random());

// Tx作成
descriptor = new sdkSymbol.descriptors.TransferTransactionV1Descriptor(  // Txタイプ:転送Tx
  bob.address,      // 受取アドレス
  [
    // 1XYM送金
    new sdkSymbol.descriptors.UnresolvedMosaicDescriptor(
      new sdkSymbol.models.UnresolvedMosaicId(0x72C0212E67A08BCEn),
      new sdkSymbol.models.Amount(1000000n)
    ),
    // 5.1 で作成したモザイク
    new sdkSymbol.descriptors.UnresolvedMosaicDescriptor(
      new sdkSymbol.models.UnresolvedMosaicId(mosaicDefTx.id.value),
      new sdkSymbol.models.Amount(1n)
    )
  ],
  new Uint8Array()  // メッセージ
);
tx = facade.createTransactionFromTypedDescriptor(
  descriptor,       // トランザクション Descriptor 設定
  alice.publicKey,  // 署名者公開鍵
  100,              // 手数料乗数
  60 * 60 * 2       // Deadline:有効期限(秒単位)
);

// 署名とアナウンス
sig = alice.signTransaction(tx);
jsonPayload = facade.transactionFactory.static.attachSignature(tx, sig);
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
export const confirmV2 = r`txInfo = await txRepo.getTransaction(signedTx.hash,sym.TransactionGroup.Confirmed).toPromise();
console.log(txInfo); `;
export const confirmV2Out = r`> TransferTransaction
    deadline: Deadline {adjustedValue: 12776690385}
    maxFee: UInt64 {lower: 19200, higher: 0}
    message: RawMessage {type: -1, payload: ''}
  > mosaics: Array(2)
      > 0: Mosaic
            amount: UInt64 {lower: 1, higher: 0}
          > id: MosaicId
                id: Id {lower: 207493124, higher: 890137608}
      > 1: Mosaic
            amount: UInt64 {lower: 1000000, higher: 0}
          > id: MosaicId
                id: Id {lower: 760461000, higher: 981735131}
    networkType: 152
    payloadSize: 192
    recipientAddress: Address {address: 'TAR6ERCSTDJJ7KCN4BJNJTK7LBBL5JPPVSHUNGY', networkType: 152}
    signature: "7C4E9E80D250C6D09352FB8EC80175719D59787DE67446896A73AABCFE6C420AF7DD707E6D4D2B2987B8BAD775F2989DCB6F738D39C48C1239FC8CC900A6740D"
    signer: PublicAccount {publicKey: '0E5C72B0D5946C1EFEE7E5317C5985F106B739BB0BC07E4F9A288417B3CD6D26', address: Address}
  > transactionInfo: TransactionInfo
        hash: "DE479C001E9736976BDA55E560AB1A5DE526236D9E1BCE24941CF8ED8884289E"
        height: UInt64 {lower: 326922, higher: 0}
        id: "626270069F1D5202A10AE93E"
        index: 0
        merkleComponentHash: "DE479C001E9736976BDA55E560AB1A5DE526236D9E1BCE24941CF8ED8884289E"
    type: 16724
    version: 1`;
export const confirmV3 = r`txInfo = await fetch(
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
export const confirmV3Out = r`> {meta: {…}, transaction: {…}, id: '64B3E87B2F7CE156B0104ED5'}
    id: "64B3E87B2F7CE156B0104ED5"
  > meta:
      feeMultiplier: 100
      hash: "5712450621C086E383B2A22E9936E434DF36DE4F13D49B5003C93E731414E98F"
      height: "640304"
      index: 0
      merkleComponentHash: "5712450621C086E383B2A22E9936E434DF36DE4F13D49B5003C93E731414E98F"
      timestamp: "22261591734"
  > transaction:
      deadline: "22268781776"
      maxFee: "19200"
    > mosaics: Array(2)
        0:
          amount: "1"
          id: "663B178E904CADB8"
        1:
          amount: "1000000"
          id: "72C0212E67A08BCE"
      network: 152
      recipientAddress: "98A8D76FEF8382274D472EE377F2FF3393E5B62C08B4329D"
      signature: "99CD1E706E7D105F21804B1A614098E49E90803E935EB33A20C9C77DCA4532D654FDAF91C05C4B78F3640F27B15AD301D305197E4BF317F55CC5B7A9311B4D03"
      signerPublicKey: "69A31A837EB7DE323F08CA52495A57BA0A95B52D1BB54CEA9A94C12A87B1CADB"
      size: 192
      type: 16724
      version: 1`;

// ---------- 5.3 現場で使えるヒント ----------
export const nftV2 = r`supplyMutable = false; //供給量変更の可否

//モザイク定義
mosaicDefTx = sym.MosaicDefinitionTransaction.create(
    undefined, nonce,mosaicId,
    sym.MosaicFlags.create(supplyMutable, transferable, restrictable, revokable),
    0,//divisibility:可分性
    sym.UInt64.fromUint(0), //duration:無期限
    networkType
);

//モザイク数量固定
mosaicChangeTx = sym.MosaicSupplyChangeTransaction.create(
    undefined,mosaicId,
    sym.MosaicSupplyChangeAction.Increase, //増やす
    sym.UInt64.fromUint(1), //数量1
    networkType
);

//NFTデータ
nftTx  = sym.TransferTransaction.create(
    undefined, //Deadline:有効期限
    alice.address,
    [],
    sym.PlainMessage.create("Hello Symbol!"), //NFTデータ実体
    networkType
)

//モザイクの生成とNFTデータをアグリゲートしてブロックに登録
aggregateTx = sym.AggregateTransaction.createComplete(
    sym.Deadline.create(epochAdjustment),
    [
      mosaicDefTx.toAggregate(alice.publicAccount),
      mosaicChangeTx.toAggregate(alice.publicAccount),
      nftTx.toAggregate(alice.publicAccount)
    ],
    networkType,[],
).setMaxFeeForAggregate(100, 0);`;
export const nftV3 = r`// モザイクフラグ設定
f = sdkSymbol.models.MosaicFlags.NONE.value;
// f += sdkSymbol.models.MosaicFlags.SUPPLY_MUTABLE.value; // 供給量変更の可否
f += sdkSymbol.models.MosaicFlags.TRANSFERABLE.value;   // 第三者への譲渡可否
f += sdkSymbol.models.MosaicFlags.RESTRICTABLE.value;   // 制限設定の可否
f += sdkSymbol.models.MosaicFlags.REVOKABLE.value;      // 発行者からの還収可否
flags = new sdkSymbol.models.MosaicFlags(f);

// ナンス設定
array = new Uint8Array(sdkSymbol.models.MosaicNonce.SIZE);
crypto.getRandomValues(array);
nonce = sdkSymbol.models.MosaicNonce.deserialize(array);

//モザイク定義
mosaicDefDescriptor = new sdkSymbol.descriptors.MosaicDefinitionTransactionV1Descriptor(  // Txタイプ:モザイク定義Tx
  new sdkSymbol.models.MosaicId(sdkSymbol.generateMosaicId(alice.address, nonce.value)),  // モザイクID
  new sdkSymbol.models.BlockDuration(0n), // duration:有効期限
  nonce,  // ナンス
  flags,  // モザイクフラグ
  0       // divisibility:可分性
);
mosaicDefTx = facade.createEmbeddedTransactionFromTypedDescriptor(
  mosaicDefDescriptor,  // トランザクション Descriptor 設定
  alice.publicKey,      // 署名者公開鍵
);

//モザイク数量固定
mosaicChangeDescriptor = new sdkSymbol.descriptors.MosaicSupplyChangeTransactionV1Descriptor( // Txタイプ:モザイク変更Tx
  new sdkSymbol.models.UnresolvedMosaicId(mosaicDefTx.id.value),  // モザイクID
  new sdkSymbol.models.Amount(1n),                    // 数量
  sdkSymbol.models.MosaicSupplyChangeAction.INCREASE  // アクション
);
mosaicChangeTx = facade.createEmbeddedTransactionFromTypedDescriptor(
  mosaicChangeDescriptor, // トランザクション Descriptor 設定
  alice.publicKey,        // 署名者公開鍵
);

// NFTデータ
descriptor = new sdkSymbol.descriptors.TransferTransactionV1Descriptor(  // Txタイプ:転送Tx
  alice.address,    // 受取アドレス
  [],               // モザイク
  '\0Hello Symbol!' // メッセージ
);
nftTx = facade.createEmbeddedTransactionFromTypedDescriptor(
  descriptor,       // トランザクション Descriptor 設定
  alice.publicKey,  // 署名者公開鍵
);

embeddedTransactions = [
  mosaicDefTx,
  mosaicChangeTx,
  nftTx
];

// モザイクの生成とNFTデータをアグリゲートしてブロックに登録
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
);`;
export const pointFlagsV2 = r`transferable = false; //第三者への譲渡可否
revokable = true; //発行者からの還収可否`;
export const pointFlagsV3 = r`// モザイクフラグ設定
f = sdkSymbol.models.MosaicFlags.NONE.value;
f += sdkSymbol.models.MosaicFlags.SUPPLY_MUTABLE.value; // 供給量変更の可否
// f += sdkSymbol.models.MosaicFlags.TRANSFERABLE.value;   // 第三者への譲渡可否
f += sdkSymbol.models.MosaicFlags.RESTRICTABLE.value;   // 制限設定の可否
f += sdkSymbol.models.MosaicFlags.REVOKABLE.value;      // 発行者からの還収可否
flags = new sdkSymbol.models.MosaicFlags(f);`;
export const revokeV2 = r`mosaicId = mosaicDefTx.mosaicId; // 回収したいモザイクのID（5.1 で作成したモザイク）
revocationTx = sym.MosaicSupplyRevocationTransaction.create(
    sym.Deadline.create(epochAdjustment),
    bob.address, //回収先アドレス
    new sym.Mosaic(mosaicId, sym.UInt64.fromUint(1)), //回収モザイクIDと数量
    networkType
).setMaxFee(100);`;
export const revokeV3 = r`mosaicId = mosaicDefTx.id.value; // 回収したいモザイクのID（5.1 で作成したモザイク）
revocationDescriptor = new sdkSymbol.descriptors.MosaicSupplyRevocationTransactionV1Descriptor(  // Txタイプ:モザイク回収Tx
  bob.address,                                          // 回収先アドレス
  new sdkSymbol.descriptors.UnresolvedMosaicDescriptor(
    new sdkSymbol.models.UnresolvedMosaicId(mosaicId),  // 回収モザイクID
    new sdkSymbol.models.Amount(1n),                    // 数量
  )
);
revocationTx = facade.createTransactionFromTypedDescriptor(
  revocationDescriptor, // トランザクション Descriptor 設定
  alice.publicKey,      // 署名者公開鍵
  100,              // 手数料乗数
  60 * 60 * 2       // Deadline:有効期限(秒単位)
);`;
