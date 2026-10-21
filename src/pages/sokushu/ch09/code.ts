// 速習Symbol 第9章 マルチシグ化 のサンプルコードと出力例（09_multisig.md より）。
// コンソールでそのまま実行できるよう、const 宣言は付けていない（ch02〜ch08 と同じ方針）。
const r = String.raw;

export const accV2 = r`bob = sym.Account.generateNewAccount(networkType);
carol1 = sym.Account.generateNewAccount(networkType);
carol2 = sym.Account.generateNewAccount(networkType);
carol3 = sym.Account.generateNewAccount(networkType);
carol4 = sym.Account.generateNewAccount(networkType);
carol5 = sym.Account.generateNewAccount(networkType);

console.log(bob.privateKey);
console.log(carol1.privateKey);
console.log(carol2.privateKey);
console.log(carol3.privateKey);
console.log(carol4.privateKey);
console.log(carol5.privateKey);`;
export const accV3 = r`bob = facade.createAccount(sdkCore.PrivateKey.random());
carol1 = facade.createAccount(sdkCore.PrivateKey.random());
carol2 = facade.createAccount(sdkCore.PrivateKey.random());
carol3 = facade.createAccount(sdkCore.PrivateKey.random());
carol4 = facade.createAccount(sdkCore.PrivateKey.random());
carol5 = facade.createAccount(sdkCore.PrivateKey.random());

console.log(bob.keyPair.privateKey.toString());
console.log(carol1.keyPair.privateKey.toString());
console.log(carol2.keyPair.privateKey.toString());
console.log(carol3.keyPair.privateKey.toString());
console.log(carol4.keyPair.privateKey.toString());
console.log(carol5.keyPair.privateKey.toString());`;
export const faucetV2 = r`console.log("https://testnet.symbol.tools/?recipient=" + bob.address.plain() +"&amount=20");
console.log("https://testnet.symbol.tools/?recipient=" + carol1.address.plain() +"&amount=20");`;
export const faucetV3 = r`console.log("https://testnet.symbol.tools/?recipient=" + bob.address.toString() +"&amount=20");
console.log("https://testnet.symbol.tools/?recipient=" + carol1.address.toString() +"&amount=20");`;
export const regV2 = r`multisigTx = sym.MultisigAccountModificationTransaction.create(
    undefined, 
    3, //minApproval:承認のために必要な最小署名者数増分
    3, //minRemoval:除名のために必要な最小署名者数増分
    [
        carol1.address,carol2.address,carol3.address,carol4.address
    ], //追加対象アドレスリスト
    [],//除名対象アドレスリスト
    networkType
);

aggregateTx = sym.AggregateTransaction.createComplete(
    sym.Deadline.create(epochAdjustment),
    [//マルチシグ化したいアカウントの公開鍵を指定
      multisigTx.toAggregate(bob.publicAccount),
    ],
    networkType,[]
).setMaxFeeForAggregate(100, 4); // 第二引数に連署者の数:4

signedTx =  aggregateTx.signTransactionWithCosignatories(
    bob, //マルチシグ化したいアカウント
    [carol1,carol2,carol3,carol4], //追加・除外対象として指定したアカウント
    generationHash,
);
await txRepo.announce(signedTx).toPromise();`;
export const regV3 = r`// マルチシグ設定Tx作成
multisigDescriptor = new sdkSymbol.descriptors.MultisigAccountModificationTransactionV1Descriptor(  // Txタイプ:マルチシグ設定Tx
  3,  // minRemoval:除名のために必要な最小署名者数増分
  3,  // minApproval:承認のために必要な最小署名者数増分
  [   // 追加対象アドレスリスト
    carol1.address,
    carol2.address,
    carol3.address,
    carol4.address,
  ],
  []  // 除名対象アドレスリスト
);
multisigTx = facade.createEmbeddedTransactionFromTypedDescriptor(
  multisigDescriptor, // トランザクション Descriptor 設定
  bob.publicKey,      // マルチシグ化したいアカウントの公開鍵を指定
);

embeddedTransactions = [
  multisigTx
];

// アグリゲートTx作成
aggregateDescriptor = new sdkSymbol.descriptors.AggregateCompleteTransactionV3Descriptor(
  facade.static.hashEmbeddedTransactions(embeddedTransactions),
  embeddedTransactions
);
aggregateTx = facade.createTransactionFromTypedDescriptor(
  aggregateDescriptor,  // トランザクション Descriptor 設定
  bob.publicKey,        // マルチシグ化したいアカウントの公開鍵を指定
  100,                  // 手数料乗数
  60 * 60 * 2,          // Deadline:有効期限(秒単位)
  4                     // 連署者数
);

// マルチシグ化したいアカウントによる署名
sig = bob.signTransaction(aggregateTx);
jsonPayload = facade.transactionFactory.static.attachSignature(aggregateTx, sig);

// 追加・除外対象として指定したアカウントによる連署
coSig1 = carol1.cosignTransaction(aggregateTx, false);
aggregateTx.cosignatures.push(coSig1);
coSig2 = carol2.cosignTransaction(aggregateTx, false);
aggregateTx.cosignatures.push(coSig2);
coSig3 = carol3.cosignTransaction(aggregateTx, false);
aggregateTx.cosignatures.push(coSig3);
coSig4 = carol4.cosignTransaction(aggregateTx, false);
aggregateTx.cosignatures.push(coSig4);

// アナウンス
await fetch(
  new URL('/transactions', NODE),
  {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({"payload": sdkCore.utils.uint8ToHex(aggregateTx.serialize())}),
  }
)
.then((res) => res.json())
.then((json) => {
  return json;
});`;
export const infoV2 = r`msigRepo = repo.createMultisigRepository();

multisigInfo = await msigRepo.getMultisigAccountInfo(bob.address).toPromise();
console.log(multisigInfo);`;
export const infoV2Out = r`> MultisigAccountInfo 
    accountAddress: Address {address: 'TCOMA5VG67TZH4X55HGZOXOFP7S232CYEQMOS7Q', networkType: 152}
  > cosignatoryAddresses: Array(4)
        0: Address {address: 'TBAFGZOCB7OHZCCYYV64F2IFZL7SOOXNDHFS5NY', networkType: 152}
        1: Address {address: 'TB3XP4GQK6XH2SSA2E2U6UWCESNACK566DS4COY', networkType: 152}
        2: Address {address: 'TCV67BMTD2JMDQOJUDQHBFJHQPG4DAKVKST3YJI', networkType: 152}
	3: Address {address: 'TDWGG6ZWCGS5AHFTF5FDB347HIMII57PK46AIDA', networkType: 152}
    minApproval: 3
    minRemoval: 3
    multisigAddresses: []`;
export const infoV3 = r`multisigInfo = await fetch(
  new URL('/account/' + bob.address.toString() + '/multisig', NODE),
  {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  }
)
.then((res) => res.json())
.then((json) => {
  return json.multisig;
});
console.log(multisigInfo);`;
export const infoV3Out = r`> {version: 1, accountAddress: '9828118AF434E834DD45D3E449C3DA49804964416E254B7F', minApproval: 3, minRemoval: 3, cosignatoryAddresses: Array(4), …}
    accountAddress: "9828118AF434E834DD45D3E449C3DA49804964416E254B7F"
  > cosignatoryAddresses: Array(4)
      0: "9874440B7EF2C407445B05A0D8F3253D82F0D39FAA9CF1F6"
      1: "9877E194AC74C47FFDFEF6A5035CA7806F6EB5258377B6F4"
      2: "9898C50E14AF3AB8869A3A72D5C67BD31BF32EFFF3D6CA2E"
      3: "98E76E4AD1623DC4B3F357A29C9496EDD48E2830ABE0CFC3"
      length: 4
    minApproval: 3
    minRemoval: 3
    multisigAddresses: []
    version: 1`;
export const cosInfoV2 = r`msigRepo = repo.createMultisigRepository();

multisigInfo = await msigRepo.getMultisigAccountInfo(carol1.address).toPromise();
console.log(multisigInfo);`;
export const cosInfoV2Out = r`> MultisigAccountInfo
    accountAddress: Address {address: 'TCV67BMTD2JMDQOJUDQHBFJHQPG4DAKVKST3YJI', networkType: 152}
    cosignatoryAddresses: []
    minApproval: 0
    minRemoval: 0
  > multisigAddresses: Array(1)
        0: Address {address: 'TCOMA5VG67TZH4X55HGZOXOFP7S232CYEQMOS7Q', networkType: 152}`;
export const cosInfoV3 = r`multisigInfo = await fetch(
  new URL('/account/' + carol1.address.toString() + '/multisig', NODE),
  {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  }
)
.then((res) => res.json())
.then((json) => {
  return json.multisig;
});
console.log(multisigInfo);`;
export const cosInfoV3Out = r`> {version: 1, accountAddress: '9898C50E14AF3AB8869A3A72D5C67BD31BF32EFFF3D6CA2E', minApproval: 0, minRemoval: 0, cosignatoryAddresses: Array(0), …}
    accountAddress: "9898C50E14AF3AB8869A3A72D5C67BD31BF32EFFF3D6CA2E"
    cosignatoryAddresses: []
    minApproval: 0
    minRemoval: 0
  > multisigAddresses: Array(1)
      0: "9828118AF434E834DD45D3E449C3DA49804964416E254B7F"
      length: 1
    version: 1`;
export const completeV2 = r`tx = sym.TransferTransaction.create(
    undefined,
    alice.address, 
    [new sym.Mosaic(new sym.NamespaceId("symbol.xym"),sym.UInt64.fromUint(1000000))],
    sym.PlainMessage.create('test'),
    networkType
);

aggregateTx = sym.AggregateTransaction.createComplete(
    sym.Deadline.create(epochAdjustment),
     [//マルチシグ化したアカウントの公開鍵を指定
       tx.toAggregate(bob.publicAccount)
     ],
    networkType,[],
).setMaxFeeForAggregate(100, 2); // 第二引数に連署者の数:2

signedTx =  aggregateTx.signTransactionWithCosignatories(
    carol1, //起案者
    [carol2,carol3],　//連署者
    generationHash,
);
await txRepo.announce(signedTx).toPromise();`;
export const completeV3 = r`namespaceIds = sdkSymbol.generateNamespacePath("symbol.xym");
namespaceId = namespaceIds[namespaceIds.length - 1];

// アグリゲートTxに含めるTxを作成
descriptor = new sdkSymbol.descriptors.TransferTransactionV1Descriptor( // Txタイプ:転送Tx
  alice.address.toString(), // 受取アドレス
  [
    // 1XYM送金
    new sdkSymbol.descriptors.UnresolvedMosaicDescriptor(
      new sdkSymbol.models.UnresolvedMosaicId(namespaceId),
      new sdkSymbol.models.Amount(1000000n)
    )
  ],
  '\0test'  // 平文メッセージ
);
tx = facade.createEmbeddedTransactionFromTypedDescriptor(
  descriptor,     // トランザクション Descriptor 設定
  bob.publicKey,  // マルチシグ化したアカウントの公開鍵
);

embeddedTransactions = [
  tx
];

// アグリゲートTx作成
aggregateDescriptor = new sdkSymbol.descriptors.AggregateCompleteTransactionV3Descriptor(
  facade.static.hashEmbeddedTransactions(embeddedTransactions),
  embeddedTransactions
);
aggregateTx = facade.createTransactionFromTypedDescriptor(
  aggregateDescriptor,  // トランザクション Descriptor 設定
  carol1.publicKey,     // 起案者アカウントの公開鍵を指定
  100,                  // 手数料乗数
  60 * 60 * 2,          // Deadline:有効期限(秒単位)
  2                     // 連署者数
);

// 起案者アカウントによる署名
sig = carol1.signTransaction(aggregateTx);
jsonPayload = facade.transactionFactory.static.attachSignature(aggregateTx, sig);

// 連署者アカウントによる連署
coSig2 = carol2.cosignTransaction(aggregateTx, false);
aggregateTx.cosignatures.push(coSig2);
coSig3 = carol3.cosignTransaction(aggregateTx, false);
aggregateTx.cosignatures.push(coSig3);

// アナウンス
await fetch(
  new URL('/transactions', NODE),
  {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({"payload": sdkCore.utils.uint8ToHex(aggregateTx.serialize())}),
  }
)
.then((res) => res.json())
.then((json) => {
  return json;
});`;
export const bondedV2 = r`tx = sym.TransferTransaction.create(
    undefined,
    alice.address, //Aliceへの送信
    [new sym.Mosaic(new sym.NamespaceId("symbol.xym"),sym.UInt64.fromUint(1000000))], //1XYM
    sym.PlainMessage.create('test'),
    networkType
);

aggregateTx = sym.AggregateTransaction.createBonded(
    sym.Deadline.create(epochAdjustment),
     [ //マルチシグ化したアカウントの公開鍵を指定
       tx.toAggregate(bob.publicAccount)
     ],
    networkType,[],
).setMaxFeeForAggregate(100, 2); // 第二引数に連署者の数:2

signedAggregateTx = carol1.sign(aggregateTx, generationHash);

hashLockTx = sym.HashLockTransaction.create(
  sym.Deadline.create(epochAdjustment),
	new sym.Mosaic(new sym.NamespaceId("symbol.xym"),sym.UInt64.fromUint(10 * 1000000)), //固定値:10XYM
	sym.UInt64.fromUint(480),
	signedAggregateTx,
	networkType
).setMaxFee(100);

signedLockTx = carol1.sign(hashLockTx, generationHash);

//ハッシュロックTXをアナウンス
await txRepo.announce(signedLockTx).toPromise();`;
export const bondedAnnV2 = r`//ハッシュロックの承認を確認した後、ボンデッドTXをアナウンス
await txRepo.announceAggregateBonded(signedAggregateTx).toPromise();`;
export const bondedV3 = r`namespaceIds = sdkSymbol.generateNamespacePath("symbol.xym");
namespaceId = namespaceIds[namespaceIds.length - 1];

// アグリゲートTxに含めるTxを作成
descriptor = new sdkSymbol.descriptors.TransferTransactionV1Descriptor( // Txタイプ:転送Tx
  alice.address.toString(), // Aliceへの送信
  [
    // 1XYM送金
    new sdkSymbol.descriptors.UnresolvedMosaicDescriptor(
      new sdkSymbol.models.UnresolvedMosaicId(namespaceId),
      new sdkSymbol.models.Amount(1000000n)
    )
  ],
  '\0test' // 平文メッセージ
);
tx = facade.createEmbeddedTransactionFromTypedDescriptor(
  descriptor,     // トランザクション Descriptor 設定
  bob.publicKey,  // マルチシグ化したアカウントの公開鍵
);

embeddedTransactions = [
  tx
];

// アグリゲートTx作成
aggregateDescriptor = new sdkSymbol.descriptors.AggregateBondedTransactionV3Descriptor(
  facade.static.hashEmbeddedTransactions(embeddedTransactions),
  embeddedTransactions
);
aggregateTx = facade.createTransactionFromTypedDescriptor(
  aggregateDescriptor,  // トランザクション Descriptor 設定
  carol1.publicKey,     // 起案者アカウントの公開鍵を指定
  100,                  // 手数料乗数
  60 * 60 * 2,          // Deadline:有効期限(秒単位)
  2                     // 連署者数
);

// 署名
sig = carol1.signTransaction(aggregateTx);
jsonPayload = facade.transactionFactory.static.attachSignature(aggregateTx, sig);

// ハッシュロックTx作成
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
  carol1.publicKey,   // 起案者アカウントの公開鍵を指定
  100,                // 手数料乗数
  60 * 60 * 2         // Deadline:有効期限(秒単位)
);

// 署名
hashLockSig = carol1.signTransaction(hashLockTx);
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
export const bondedAnnV3 = r`//ハッシュロックの承認を確認した後、ボンデッドTXをアナウンス
await fetch(
  new URL('/transactions/partial', NODE),
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
console.log(txInfo);`;
export const confirmV2Out = r`> AggregateTransaction
  > cosignatures: Array(2)
        0: AggregateTransactionCosignature
            signature: "554F3C7017C32FD4FE67C1E5E35DD21D395D44742B43BD1EF99BC8E9576845CDC087B923C69DB2D86680279253F2C8A450F97CC7D3BCD6E86FE4E70135D44B06"
            signer: PublicAccount
                address: Address {address: 'TB3XP4GQK6XH2SSA2E2U6UWCESNACK566DS4COY', networkType: 152}
                publicKey: "A1BA266B56B21DC997D637BCC539CCFFA563ABCB34EAA52CF90005429F5CB39C"
        1: AggregateTransactionCosignature
            signature: "AD753E23D3D3A4150092C13A410D5AB373B871CA74D1A723798332D70AD4598EC656F580CB281DB3EB5B9A7A1826BAAA6E060EEA3CC5F93644136E9B52006C05"
            signer: PublicAccount
                address: Address {address: 'TBAFGZOCB7OHZCCYYV64F2IFZL7SOOXNDHFS5NY', networkType: 152}
                publicKey: "B00721EDD76B24E3DDCA13555F86FC4BDA89D413625465B1BD7F347F74B82FF0"
    deadline: Deadline {adjustedValue: 12619660047}
  > innerTransactions: Array(1)
      > 0: TransferTransaction
            deadline: Deadline {adjustedValue: 12619660047}
            maxFee: UInt64 {lower: 48000, higher: 0}
            message: PlainMessage {type: 0, payload: 'test'}
            mosaics: [Mosaic]
            networkType: 152
            payloadSize: undefined
            recipientAddress: Address {address: 'TBXUTAX6O6EUVPB6X7OBNX6UUXBMPPAFX7KE5TQ', networkType: 152}
            signature: "670EA8CFA4E35604DEE20877A6FC95C2786D748A8449CE7EEA7CB941FE5EC181175B0D6A08AF9E99955640C872DAD0AA68A37065C866EE1B651C3CE28BA95404"
            signer: PublicAccount
                address: Address {address: 'TCOMA5VG67TZH4X55HGZOXOFP7S232CYEQMOS7Q', networkType: 152}
                publicKey: "4667BC99B68B6CA0878CD499CE89CDEB7AAE2EE8EB96E0E8656386DECF0AD657"
            transactionInfo: AggregateTransactionInfo {height: UInt64, index: 0, id: '62600A8C0A21EB5CD28679A4', hash: undefined, merkleComponentHash: undefined, …}
            type: 16724
    maxFee: UInt64 {lower: 48000, higher: 0}
    networkType: 152
    payloadSize: 480
    signature: "670EA8CFA4E35604DEE20877A6FC95C2786D748A8449CE7EEA7CB941FE5EC181175B0D6A08AF9E99955640C872DAD0AA68A37065C866EE1B651C3CE28BA95404"
  > signer: PublicAccount
        address: Address {address: 'TCV67BMTD2JMDQOJUDQHBFJHQPG4DAKVKST3YJI', networkType: 152}
        publicKey: "FF9595FDCD983F46FF9AE0F7D86D94E9B164E385BD125202CF16528F53298656"
  > transactionInfo: 
        hash: "AA99F8F4000F989E6F135228829DB66AEB3B3C4B1F06BA77D373D042EAA4C8DA"
        height: UInt64 {lower: 322376, higher: 0}
        id: "62600A8C0A21EB5CD28679A3"
        merkleComponentHash: "1FD6340BCFEEA138CC6305137566B0B1E98DEDE70E79CC933665FE93E10E0E3E"
    type: 16705`;
export const confirmV3 = r`txInfo = await fetch(
  new URL('/transactions/confirmed/' + facade.hashTransaction(aggregateTx).toString(), NODE),
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
export const confirmV3Out = r`> {meta: {…}, transaction: {…}, id: '64BBE4CD2F7CE156B010FA51'}
    id: "64BBE4CD2F7CE156B010FA51"
  > meta: 
      feeMultiplier: 100
      hash: "199CD5B4930FCFA59F7FEA33B20C5A9578CE6EFBE117FC99F598CB348A2D9F9A"
      height: "657690"
      index: 1
      merkleComponentHash: "6FA299CD333E512C92E40F36BA08B5E273D5F5264C9F346A21E4F734D4F46A74"
      timestamp: "22784938399"
  > transaction: 
    > cosignatures: Array(2)
      > 0: 
          signature: "67836FE1FE4C4EF5B09A54DF0FBC206F6A1C3B636A0BF2A51DE24ABD5B9D61C54C0632DE335D8A25D34BDB89EBAEADD6F61ED57ADED5BEE25F8C329139570101"
          signerPublicKey: "0ABC3E2B403C9E1597DF04C8E9AE1E9D3F22D70D87A0A7BDC8D1B16BB9D324DD"
          version: "0"
      > 1: 
          signature: "80C6C30A12CDDF94E634006750D7DB60ED714417A39C6E070AE78FB2189D4D9F2A5C936F50FBBA0AD9CAC2CF82339892FB62101A5529DC49762219C886D6EF08"
          signerPublicKey: "A33F1B26DE7498EAE8D27A084323BB9D3AA95486F879F248B679A3DEB06D6431"
          version: "0"
        length: 2
      deadline: "22791898323"
      maxFee: "48000"
      network: 152
      signature: "F1415D6DAB1DAC90AE44FB182BFF7568D0924AC5D63837A8CCFF66A0A284B3F4881F259B1B0C5845F99CA82284AD435DBB4CC6C69BBCC161B798061A4BE8800E"
      signerPublicKey: "E20A3B5BC132EBE9B075F1B326FE1C4C8827ACEF0DF7F24082D6C6A4A708980B"
      size: 480
    > transactions: Array(1)
      > 0: 
          id: "64BBE4CD2F7CE156B010FA52"
        > meta: 
            aggregateHash: "199CD5B4930FCFA59F7FEA33B20C5A9578CE6EFBE117FC99F598CB348A2D9F9A"
            aggregateId: "64BBE4CD2F7CE156B010FA51"
            feeMultiplier: 100
            height: "657690"
            index: 0
            timestamp: "22784938399"
        > transaction: 
            message: "0074657374"
            mosaics: Array(1)
            > 0: 
                amount: "1000000"
                id: "E74B99BA41F4AFEE"
              length: 1
            network: 152
            recipientAddress: "982B2AA2295B5C23528ADDEE7F29F6521944E9F2340428AB"
            signerPublicKey: "09F81ED97EBB0A85C6DFEACF2B518EFB471BEDA18709EF4C60823B21698B7B22"
            type: 16724
            version: 1
          length: 1
      transactionsHash: "CEEC5B3AA2E47265AA68DB5BEDAC9AFE27345055F2D7BFFBD889CE4DA67454C1"
      type: 16961
      version: 2`;
export const shrinkV2 = r`multisigTx = sym.MultisigAccountModificationTransaction.create(
    undefined, 
    -1, //承認のために必要な最小署名者数増分
    -1, //除名のために必要な最小署名者数増分
    [], //追加対象アドレス
    [carol3.address],//除名対象アドレス
    networkType
);

aggregateTx = sym.AggregateTransaction.createComplete(
    sym.Deadline.create(epochAdjustment),
    [ //構成変更したいマルチシグアカウントの公開鍵を指定
      multisigTx.toAggregate(bob.publicAccount),
    ],
    networkType,[]    
).setMaxFeeForAggregate(100, 2); // 第二引数に連署者の数:2

signedTx =  aggregateTx.signTransactionWithCosignatories(
    carol1,
    [carol2,carol4],
    generationHash,
);
await txRepo.announce(signedTx).toPromise();`;
export const shrinkV3 = r`// マルチシグ設定Tx作成
multisigDescriptor = new sdkSymbol.descriptors.MultisigAccountModificationTransactionV1Descriptor(  // Txタイプ:マルチシグ設定Tx
  -1, // 承認のために必要な最小署名者数増分
  -1, // 除名のために必要な最小署名者数増分
  [], // 追加対象アドレスリスト
  [   // 除名対象アドレスリスト
    carol3.address,
  ]
);
multisigTx = facade.createEmbeddedTransactionFromTypedDescriptor(
  multisigDescriptor, // トランザクション Descriptor 設定
  bob.publicKey,      // 構成変更したいマルチシグアカウントの公開鍵を指定
);

embeddedTransactions = [
  multisigTx
];

// アグリゲートTx作成
aggregateDescriptor = new sdkSymbol.descriptors.AggregateCompleteTransactionV3Descriptor(
  facade.static.hashEmbeddedTransactions(embeddedTransactions),
  embeddedTransactions
);
aggregateTx = facade.createTransactionFromTypedDescriptor(
  aggregateDescriptor,  // トランザクション Descriptor 設定
  carol1.publicKey,     // 起案者アカウントの公開鍵を指定
  100,                  // 手数料乗数
  60 * 60 * 2,          // Deadline:有効期限(秒単位)
  2                     // 連署者数
);

// 起案者アカウントによる署名
sig = carol1.signTransaction(aggregateTx);
jsonPayload = facade.transactionFactory.static.attachSignature(aggregateTx, sig);

// 連署者アカウントによる連署
coSig2 = carol2.cosignTransaction(aggregateTx, false);
aggregateTx.cosignatures.push(coSig2);
coSig4 = carol4.cosignTransaction(aggregateTx, false);
aggregateTx.cosignatures.push(coSig4);

// アナウンス
await fetch(
  new URL('/transactions', NODE),
  {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({"payload": sdkCore.utils.uint8ToHex(aggregateTx.serialize())}),
  }
)
.then((res) => res.json())
.then((json) => {
  return json;
});`;
export const swapV2 = r`multisigTx = sym.MultisigAccountModificationTransaction.create(
    undefined, 
    0, //承認のために必要な最小署名者数増分
    0, //除名のために必要な最小署名者数増分
    [carol5.address], //追加対象アドレス
    [carol4.address], //除名対象アドレス
    networkType
);

aggregateTx = sym.AggregateTransaction.createComplete(
    sym.Deadline.create(epochAdjustment),
    [ //構成変更したいマルチシグアカウントの公開鍵を指定
      multisigTx.toAggregate(bob.publicAccount),
    ],
    networkType,[]    
).setMaxFeeForAggregate(100, 2); // 第二引数に連署者の数:2

signedTx =  aggregateTx.signTransactionWithCosignatories(
    carol1, //起案者
    [carol2,carol5], //連署者+承諾アカウント
    generationHash,
);
await txRepo.announce(signedTx).toPromise();`;
export const swapV3 = r`// マルチシグ設定Tx作成
multisigDescriptor = new sdkSymbol.descriptors.MultisigAccountModificationTransactionV1Descriptor(  // Txタイプ:マルチシグ設定Tx
  0,  // 承認のために必要な最小署名者数増分
  0,  // 除名のために必要な最小署名者数増分
  [   // 追加対象アドレスリスト
    carol5.address,
  ],
  [   // 除名対象アドレスリスト
    carol4.address,
  ]
);
multisigTx = facade.createEmbeddedTransactionFromTypedDescriptor(
  multisigDescriptor, // トランザクション Descriptor 設定
  bob.publicKey,      // 構成変更したいマルチシグアカウントの公開鍵を指定
);

embeddedTransactions = [
  multisigTx
];

// アグリゲートTx作成
aggregateDescriptor = new sdkSymbol.descriptors.AggregateCompleteTransactionV3Descriptor(
  facade.static.hashEmbeddedTransactions(embeddedTransactions),
  embeddedTransactions
);
aggregateTx = facade.createTransactionFromTypedDescriptor(
  aggregateDescriptor,  // トランザクション Descriptor 設定
  carol1.publicKey,     // 起案者アカウントの公開鍵を指定
  100,                  // 手数料乗数
  60 * 60 * 2,          // Deadline:有効期限(秒単位)
  2                     // 連署者数
);

// 起案者アカウントによる署名
sig = carol1.signTransaction(aggregateTx);
jsonPayload = facade.transactionFactory.static.attachSignature(aggregateTx, sig);

// 連署者アカウントによる連署
coSig2 = carol2.cosignTransaction(aggregateTx, false);
aggregateTx.cosignatures.push(coSig2);

// 承諾アカウントによる連署
coSig5 = carol5.cosignTransaction(aggregateTx, false);
aggregateTx.cosignatures.push(coSig5);

// アナウンス
await fetch(
  new URL('/transactions', NODE),
  {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({"payload": sdkCore.utils.uint8ToHex(aggregateTx.serialize())}),
  }
)
.then((res) => res.json())
.then((json) => {
  return json;
});`;
