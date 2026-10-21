// 速習Symbol 第8章 ロック のサンプルコードと出力例（08_lock.md より）。
// コンソールでそのまま実行できるよう、const 宣言は付けていない（ch02〜ch07 と同じ方針）。
const r = String.raw;

export const aggV2 = r`bob = sym.Account.generateNewAccount(networkType);

tx1 = sym.TransferTransaction.create(
    undefined,
    bob.address,  //Bobへの送信
    [ //1XYM
      new sym.Mosaic(
        new sym.NamespaceId("symbol.xym"),
        sym.UInt64.fromUint(1000000)
      )
    ],
    sym.EmptyMessage, //メッセージ無し
    networkType
);

tx2 = sym.TransferTransaction.create(
    undefined,
    alice.address,  // Aliceへの送信
    [],
    sym.PlainMessage.create('thank you!'), //メッセージ
    networkType
);

aggregateArray = [
    tx1.toAggregate(alice.publicAccount), //Aliceからの送信
    tx2.toAggregate(bob.publicAccount), // Bobからの送信
]

//アグリゲートボンデッドトランザクション
aggregateTx = sym.AggregateTransaction.createBonded(
    sym.Deadline.create(epochAdjustment),
    aggregateArray,
    networkType,
    [],
).setMaxFeeForAggregate(100, 1);

//署名
signedAggregateTx = alice.sign(aggregateTx, generationHash);`;
export const aggV3 = r`bob = facade.createAccount(sdkCore.PrivateKey.random());

namespaceIds = sdkSymbol.generateNamespacePath("symbol.xym");
namespaceId = namespaceIds[namespaceIds.length - 1];

// アグリゲートTxに含めるTxを作成
descriptor1 = new sdkSymbol.descriptors.TransferTransactionV1Descriptor(  // Txタイプ:転送Tx
  bob.address,      // Bobへの送信
  [
    // 1XYM送金
    new sdkSymbol.descriptors.UnresolvedMosaicDescriptor(
      new sdkSymbol.models.UnresolvedMosaicId(namespaceId),
      new sdkSymbol.models.Amount(1000000n)
    )
  ],
  new Uint8Array()  // メッセージ無し
);
tx1 = facade.createEmbeddedTransactionFromTypedDescriptor(
  descriptor1,      // トランザクション Descriptor 設定
  alice.publicKey   // Aliceから
);

descriptor2 = new sdkSymbol.descriptors.TransferTransactionV1Descriptor(  // Txタイプ:転送Tx
  alice.address,    // Aliceへの送信
  [],
  new TextEncoder('utf-8').encode('thank you!') // 平文メッセージ
);
tx2 = facade.createEmbeddedTransactionFromTypedDescriptor(
  descriptor2,      // トランザクション Descriptor 設定
  bob.publicKey     // Bobから
);

embeddedTransactions = [
  tx1,
  tx2
];

// アグリゲートTx作成
aggregateDescriptor = new sdkSymbol.descriptors.AggregateBondedTransactionV3Descriptor(
  facade.static.hashEmbeddedTransactions(embeddedTransactions),
  embeddedTransactions
);
aggregateTx = facade.createTransactionFromTypedDescriptor(
  aggregateDescriptor,  // トランザクション Descriptor 設定
  alice.publicKey,      // 署名者公開鍵
  100,                  // 手数料乗数
  60 * 60 * 2,          // Deadline:有効期限(秒単位)
  1                     // 連署者数
);

// 署名
sig = alice.signTransaction(aggregateTx);
jsonPayload = facade.transactionFactory.static.attachSignature(aggregateTx, sig);`;
export const hashLockV2 = r`//ハッシュロックTX作成
hashLockTx = sym.HashLockTransaction.create(
  sym.Deadline.create(epochAdjustment),
    new sym.Mosaic(new sym.NamespaceId("symbol.xym"),sym.UInt64.fromUint(10 * 1000000)), //10xym固定値
    sym.UInt64.fromUint(480), // ロック有効期限
    signedAggregateTx,// このハッシュ値を登録
    networkType
).setMaxFee(100);

//署名
signedLockTx = alice.sign(hashLockTx, generationHash);

//ハッシュロックTXをアナウンス
await txRepo.announce(signedLockTx).toPromise();`;
export const hashLockV3 = r`// ハッシュロックTx作成
hashLockDescriptor = new sdkSymbol.descriptors.HashLockTransactionV1Descriptor( // Txタイプ:ハッシュロックTx
  new sdkSymbol.descriptors.UnresolvedMosaicDescriptor(
    new sdkSymbol.models.UnresolvedMosaicId(namespaceId), // UnresolvedMosaic:未解決モザイク
    new sdkSymbol.models.Amount(10n * 1000000n)           // 10xym固定値
  ),
  new sdkSymbol.models.BlockDuration(480n),               // ロック有効期限
  facade.hashTransaction(aggregateTx)                     // アグリゲートトランザクションのハッシュ値を登録
);
hashLockTx = facade.createTransactionFromTypedDescriptor(
  hashLockDescriptor, // トランザクション Descriptor 設定
  alice.publicKey,    // 署名者公開鍵
  100,                // 手数料乗数
  60 * 60 * 2         // Deadline:有効期限(秒単位)
);

// 署名
hashLockSig = alice.signTransaction(hashLockTx);
hashLockJsonPayload = facade.transactionFactory.static.attachSignature(hashLockTx, hashLockSig);

// ハッシュロックTXをアナウンス
await fetch(
  new URL('/transactions', NODE),
  {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: hashLockJsonPayload,
  }
)
.then((res) => res.json())
.then((json) => {
  return json;
});`;
export const announceV2 = r`await txRepo.announceAggregateBonded(signedAggregateTx).toPromise();`;
export const announceV3 = r`await fetch(
  new URL('/transactions/partial', NODE), // アグリゲートボンデッドTxはアナウンスする際のURLが違う
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
export const cosignV2 = r`txInfo = await txRepo.getTransaction(signedAggregateTx.hash,sym.TransactionGroup.Partial).toPromise();
cosignatureTx = sym.CosignatureTransaction.create(txInfo);
signedCosTx = bob.signCosignatureTransaction(cosignatureTx);
await txRepo.announceAggregateBondedCosignature(signedCosTx).toPromise();`;
export const cosignV3 = r`// アグリゲートボンデッドトランザクションの取得
txInfo = await fetch(
  new URL('/transactions/partial/' + facade.hashTransaction(aggregateTx).toString(), NODE),
  {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  }
)
.then((res) => res.json())
.then((json) => {
  return json;
});

// 連署者の署名
txHash = new sdkCore.Hash256(sdkCore.utils.hexToUint8(txInfo.meta.hash));
cosignature = bob.cosignTransactionHash(txHash, true);

// アナウンス
body= {
  "parentHash": cosignature.parentHash.toString(),
  "signature": cosignature.signature.toString(),
  "signerPublicKey": cosignature.signerPublicKey.toString(),
  "version": cosignature.version.toString()
};
await fetch(
  new URL('/transactions/cosignature', NODE),
  {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }
)
.then((res) => res.json())
.then((json) => {
  return json;
});`;
export const bobV2 = r`bob = sym.Account.generateNewAccount(networkType);
console.log(bob.address);

//FAUCET URL出力
console.log("https://testnet.symbol.tools/?recipient=" + bob.address.plain() +"&amount=10");`;
export const bobV3 = r`bob = facade.createAccount(sdkCore.PrivateKey.random());
console.log(bob.address.toString());

//FAUCET URL出力
console.log("https://testnet.symbol.tools/?recipient=" + bob.address.toString() +"&amount=10");`;
export const secretV2 = r`sha3_256 = require('/node_modules/js-sha3').sha3_256;

random = sym.Crypto.randomBytes(20);
hash = sha3_256.create();
secret = hash.update(random).hex(); //ロック用キーワード
proof = random.toString('hex'); //解除用キーワード
console.log("secret:" + secret);
console.log("proof:" + proof);`;
export const secretOutV2 = r`> secret:f260bfb53478f163ee61ee3e5fb7cfcaf7f0b663bc9dd4c537b958d4ce00e240
  proof:7944496ac0f572173c2549baf9ac18f893aab6d0`;
export const secretV3 = r`sha3_256 = (await import('https://cdn.skypack.dev/@noble/hashes/sha3')).sha3_256;

proof = crypto.getRandomValues(new Uint8Array(20)); // 解除用キーワード
hash = sha3_256.create();
hash.update(proof);
secret = hash.digest();                             // ロック用キーワード  
console.log("secret:" + sdkCore.utils.uint8ToHex(secret));
console.log("proof:" + sdkCore.utils.uint8ToHex(proof));`;
export const secretOutV3 = r`> secret:D5543DD80B973DCBD0ED792667242DF301E83383367A49B30E926272EA915E24
> proof:065949369A849D5D5B7B8BC2F948508228D67BCD`;
export const lockV2 = r`lockTx = sym.SecretLockTransaction.create(
    sym.Deadline.create(epochAdjustment),
    new sym.Mosaic(
      new sym.NamespaceId("symbol.xym"),
      sym.UInt64.fromUint(1000000) //1XYM
    ), //ロックするモザイク
    sym.UInt64.fromUint(480), //ロック期間(ブロック数)
    sym.LockHashAlgorithm.Op_Sha3_256, //ロックキーワード生成に使用したアルゴリズム
    secret, //ロック用キーワード
    bob.address, //解除時の転送先:Bob
    networkType
).setMaxFee(100);

signedLockTx = alice.sign(lockTx,generationHash);
await txRepo.announce(signedLockTx).toPromise();`;
export const lockV3 = r`// シークレットロックTx作成
lockDescriptor = new sdkSymbol.descriptors.SecretLockTransactionV1Descriptor( // Txタイプ:シークレットロックTx
  bob.address,                                // 解除時の転送先:Bob
  secret,                                     // ロック用キーワード
  new sdkSymbol.descriptors.UnresolvedMosaicDescriptor( // ロックするモザイク
    new sdkSymbol.models.UnresolvedMosaicId(namespaceId),
    new sdkSymbol.models.Amount(1000000n)
  ),
  new sdkSymbol.models.BlockDuration(480n),   // ロック期間(ブロック数)
  sdkSymbol.models.LockHashAlgorithm.SHA3_256 // ロックキーワード生成に使用したアルゴリズム
);
lockTx = facade.createTransactionFromTypedDescriptor(
  lockDescriptor,   // トランザクション Descriptor 設定
  alice.publicKey,  // 署名者公開鍵
  100,              // 手数料乗数
  60 * 60 * 2       // Deadline:有効期限(秒単位)
);

// 署名
sig = alice.signTransaction(lockTx);
jsonPayload = facade.transactionFactory.static.attachSignature(lockTx, sig);

// シークレットロックTXをアナウンス
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
export const algoOut = r`{0: 'Op_Sha3_256', 1: 'Op_Hash_160', 2: 'Op_Hash_256'}`;
export const lockInfoV2 = r`slRepo = repo.createSecretLockRepository();
res = await slRepo.search({secret:secret}).toPromise();
console.log(res.data[0]);`;
export const lockInfoV2Out = r`> SecretLockInfo
    amount: UInt64 {lower: 1000000, higher: 0}
    compositeHash: "770F65CB0CC0CA17370DE961B2AA5B48B8D86D6DB422171AB00DF34D19DEE2F1"
    endHeight: UInt64 {lower: 323495, higher: 0}
    hashAlgorithm: 0
    mosaicId: MosaicId {id: Id}
    ownerAddress: Address {address: 'TBXUTAX6O6EUVPB6X7OBNX6UUXBMPPAFX7KE5TQ', networkType: 152}
    recipientAddress: Address {address: 'TBTWKXCNROT65CJHEBPL7F6DRHX7UKSUPD7EUGA', networkType: 152}
    recordId: "6260A1D3205E94BEA3D9E3E9"
    secret: "F260BFB53478F163EE61EE3E5FB7CFCAF7F0B663BC9DD4C537B958D4CE00E240"
    status: 0
    version: 1`;
export const lockInfoV3 = r`params = new URLSearchParams({
  "secret": sdkCore.utils.uint8ToHex(secret),
});
result = await fetch(
  new URL('/lock/secret?' + params.toString(), NODE),
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
export const lockInfoV3Out = r`> {lock: {…}, id: '64BBC4CD6FFE587B6D3F7D80'}
    id: "64BBC4CD6FFE587B6D3F7D80"
    lock: 
      amount: "1000000"
      compositeHash: "905CDD9755A0B30E1AFE4395482DB0673E3FE9CEA3445861BE56B044A9CF212D"
      endHeight: "657898"
      hashAlgorithm: 0
      mosaicId: "72C0212E67A08BCE"
      ownerAddress: "982B2AA2295B5C23528ADDEE7F29F6521944E9F2340428AB"
      recipientAddress: "98A8D76FEF8382274D472EE377F2FF3393E5B62C08B4329D"
      secret: "079FEC44B889EF6E96A4B614930B1271B7BB8EE9412596C4BECB199DE6A7D30E"
      status: 0
      version: 1`;
export const proofV2 = r`proofTx = sym.SecretProofTransaction.create(
    sym.Deadline.create(epochAdjustment),
    sym.LockHashAlgorithm.Op_Sha3_256, //ロック作成に使用したアルゴリズム
    secret, //ロックキーワード
    bob.address, //解除アカウント（受信アカウント）
    proof, //解除用キーワード
    networkType
).setMaxFee(100);

signedProofTx = bob.sign(proofTx,generationHash);
await txRepo.announce(signedProofTx).toPromise();`;
export const proofV3 = r`// シークレットプルーフTx作成
proofDescriptor = new sdkSymbol.descriptors.SecretProofTransactionV1Descriptor( // Txタイプ:シークレットプルーフTx
  bob.address,                                  // 解除アカウント（受信アカウント）
  secret,                                       // ロックキーワード
  sdkSymbol.models.LockHashAlgorithm.SHA3_256,  // ロックキーワード生成に使用したアルゴリズム
  proof                                         // 解除用キーワード
);
proofTx = facade.createTransactionFromTypedDescriptor(
  proofDescriptor,  // トランザクション Descriptor 設定
  bob.publicKey,    // 署名者公開鍵
  100,              // 手数料乗数
  60 * 60 * 2       // Deadline:有効期限(秒単位)
);

// 署名
sig = bob.signTransaction(proofTx);
jsonPayload = facade.transactionFactory.static.attachSignature(proofTx, sig);

// シークレットプルーフTXをアナウンス
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
export const proofInfoV2 = r`txInfo = await txRepo.getTransaction(signedProofTx.hash,sym.TransactionGroup.Confirmed).toPromise();
console.log(txInfo);`;
export const proofInfoV2Out = r`> SecretProofTransaction
  > deadline: Deadline {adjustedValue: 12669305546}
    hashAlgorithm: 0
    maxFee: UInt64 {lower: 20700, higher: 0}
    networkType: 152
    payloadSize: 207
    proof: "A6431E74005585779AD5343E2AC5E9DC4FB1C69E"
    recipientAddress: Address {address: 'TBTWKXCNROT65CJHEBPL7F6DRHX7UKSUPD7EUGA', networkType: 152}
    secret: "4C116F32D986371D6BCC44CE64C970B6567686E79850E4A4112AF869580B7C3C"
    signature: "951F440860E8F24F6F3AB8EC670A3D448B12D75AB954012D9DB70030E31DA00B965003D88B7B94381761234D5A66BE989B5A8009BB234716CA3E5847C33F7005"
    signer: PublicAccount {publicKey: '9DC9AE081DF2E76554084DFBCCF2BC992042AA81E8893F26F8504FCED3692CFB', address: Address}
  > transactionInfo: TransactionInfo
        hash: "85044FF702A6966AB13D05DBE4AC4C3A13520C7381F32540429987C207B2056B"
        height: UInt64 {lower: 323805, higher: 0}
        id: "6260CC7F60EE2B0EA10CCEDA"
        merkleComponentHash: "85044FF702A6966AB13D05DBE4AC4C3A13520C7381F32540429987C207B2056B"
    type: 16978`;
export const proofInfoV3 = r`// 承認確認
txInfo = await fetch(
  new URL('/transactions/confirmed/' + facade.hashTransaction(proofTx).toString(), NODE),
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
export const proofInfoV3Out = r`> {meta: {…}, transaction: {…}, id: '64BBC85E2F7CE156B010F80E'}
    id: "64BBC85E2F7CE156B010F80E"
  > meta: 
      feeMultiplier: 100
      hash: "68526EBA094A8F4D8FB6118C04FDB44CCA321F278AF93D54203FFBDB7672C255"
      height: "657450"
      index: 0
      merkleComponentHash: "68526EBA094A8F4D8FB6118C04FDB44CCA321F278AF93D54203FFBDB7672C255"
      timestamp: "22777659619"
  > transaction: 
      deadline: "22784827324"
      hashAlgorithm: 0
      maxFee: "20700"
      network: 152
      proof: "11E7035AC7269DAF9551078987CCEF359BB851BA"
      recipientAddress: "98A8D76FEF8382274D472EE377F2FF3393E5B62C08B4329D"
      secret: "079FEC44B889EF6E96A4B614930B1271B7BB8EE9412596C4BECB199DE6A7D30E"
      signature: "5EBF2281D4557ED8ECF6B3A63AE5284E42BDD379AE671CEA7A5F4A758C74FB2AA3101F80654FD98DE301100A09E9B524C49C1E00998CAA0817F95029A5372A0C"
      signerPublicKey: "662CEDF69962B1E0F1BF0C43A510DFB12190128B90F7FE9BA48B1249E8E10DBE"
      size: 207
      type: 16978
      version: 1`;
export const rcpV2 = r`receiptRepo = repo.createReceiptRepository();

receiptInfo = await receiptRepo.searchReceipts({
    receiptTypes:[sym.ReceiptType.LockSecret_Completed],
    targetAddress:bob.address
}).toPromise();
console.log(receiptInfo.data);`;
export const rcpV2Out = r`> data: Array(1)
  >  0: TransactionStatement
        height: UInt64 {lower: 323805, higher: 0}
     >  receipts: Array(1)
          > 0: BalanceChangeReceipt
                amount: UInt64 {lower: 1000000, higher: 0}
            > mosaicId: MosaicId
                  id: Id {lower: 760461000, higher: 981735131}
              targetAddress: Address {address: 'TBTWKXCNROT65CJHEBPL7F6DRHX7UKSUPD7EUGA', networkType: 152}
              type: 8786`;
export const rcpV3 = r`params = new URLSearchParams({
  "receiptType": sdkSymbol.models.ReceiptType.LOCK_SECRET_COMPLETED.value,
  "targetAddress": bob.address.toString(),
});
result = await fetch(
  new URL('/statements/transaction?' + params.toString(), NODE),
  {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  }
)
.then((res) => res.json())
.then((json) => {
  return json;
});
console.log(result.data);`;
export const rcpV3Out = r`> (1) [{…}]
  > 0: 
      id: "64BBC7952F7CE156B010F7FD"
    > meta: 
        timestamp: "22777457773"
    > statement: 
        height: "657444"
      > receipts: Array(1)
        > 0: 
            amount: "1000000"
            mosaicId: "72C0212E67A08BCE"
            targetAddress: "98A8D76FEF8382274D472EE377F2FF3393E5B62C08B4329D"
            type: 8786
            version: 1
          length: 1
      > source: 
          primaryId: 1
          secondaryId: 0`;
export const rcpTypesOut = r`{4685: 'Mosaic_Rental_Fee', 4942: 'Namespace_Rental_Fee', 8515: 'Harvest_Fee', 8776: 'LockHash_Completed', 8786: 'LockSecret_Completed', 9032: 'LockHash_Expired', 9042: 'LockSecret_Expired', 12616: 'LockHash_Created', 12626: 'LockSecret_Created', 16717: 'Mosaic_Expired', 16718: 'Namespace_Expired', 16974: 'Namespace_Deleted', 20803: 'Inflation', 57667: 'Transaction_Group', 61763: 'Address_Alias_Resolution', 62019: 'Mosaic_Alias_Resolution'}`;
