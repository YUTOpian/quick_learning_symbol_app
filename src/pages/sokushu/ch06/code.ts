// 速習Symbol 第6章 ネームスペース のサンプルコードと出力例（06_namespace.md より）。
// コンソールでそのまま実行できるよう、const 宣言は付けていない（ch02〜ch05 と同じ方針）。
const r = String.raw;

// ---------- 6.1 手数料の計算 ----------
export const feeV2 = r`nwRepo = repo.createNetworkRepository();

rentalFees = await nwRepo.getRentalFees().toPromise();
rootNsperBlock = rentalFees.effectiveRootNamespaceRentalFeePerBlock.compact();
rentalDays = 365;
rentalBlock = rentalDays * 24 * 60 * 60 / 30;
rootNsRenatalFeeTotal = rentalBlock * rootNsperBlock;
console.log("rentalBlock:" + rentalBlock);
console.log("rootNsRenatalFeeTotal:" + rootNsRenatalFeeTotal);`;
export const feeV3 = r`rentalFees = await fetch(
  new URL('/network/fees/rental', NODE),
  {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  }
)
.then((res) => res.json())
.then((json) => {
  return json;
});

rootNsperBlock = Number(rentalFees.effectiveRootNamespaceRentalFeePerBlock);
rentalDays = 365;
rentalBlock = rentalDays * 24 * 60 * 60 / 30;
rootNsRenatalFeeTotal = rentalBlock * rootNsperBlock;
console.log("rentalBlock:" + rentalBlock);
console.log("rootNsRenatalFeeTotal:" + rootNsRenatalFeeTotal);`;
export const feeOut = r`> rentalBlock:1051200
> rootNsRenatalFeeTotal:210240000 //約210XYM`;
export const childFeeV2 = r`childNamespaceRentalFee = rentalFees.effectiveChildNamespaceRentalFee.compact()
console.log(childNamespaceRentalFee);`;
export const childFeeV3 = r`childNamespaceRentalFee = Number(rentalFees.effectiveChildNamespaceRentalFee);
console.log(childNamespaceRentalFee);`;
export const childFeeOut = r`> 10000000 //10XYM`;

// ---------- 6.2 レンタル ----------
export const rootV2 = r`tx = sym.NamespaceRegistrationTransaction.createRootNamespace(
    sym.Deadline.create(epochAdjustment),
    "xembook",
    sym.UInt64.fromUint(86400),
    networkType
).setMaxFee(100);
signedTx = alice.sign(tx,generationHash);
await txRepo.announce(signedTx).toPromise();`;
export const rootV3 = r`// ネームスペース設定
name = "xembook";  // 作成するルートネームスペース

// Tx作成
descriptor = new sdkSymbol.descriptors.NamespaceRegistrationTransactionV1Descriptor(  // Txタイプ:ネームスペース登録Tx
  new sdkSymbol.models.NamespaceId(sdkSymbol.generateNamespaceId(name)),  // ネームスペースID
  sdkSymbol.models.NamespaceRegistrationType.ROOT,  // 登録タイプ : ルートネームスペース
  new sdkSymbol.models.BlockDuration(86400n),       // duration:レンタル期間
  undefined,                                        // 親ネームスペース (ルートの場合は省略可)
  name                                              // ネームスペース
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
export const subV2 = r`subNamespaceTx = sym.NamespaceRegistrationTransaction.createSubNamespace(
    sym.Deadline.create(epochAdjustment),
    "tomato",  //作成するサブネームスペース
    "xembook", //紐づけたいルートネームスペース
    networkType,
).setMaxFee(100);
signedTx = alice.sign(subNamespaceTx,generationHash);
await txRepo.announce(signedTx).toPromise();`;
export const subV3 = r`// ネームスペース設定
parentNameId = sdkSymbol.generateNamespaceId("xembook"); // 紐づけたいルートネームスペース
name = "tomato";  // 作成するサブネームスペース
subNamespaceDescriptor = new sdkSymbol.descriptors.NamespaceRegistrationTransactionV1Descriptor(  // Txタイプ:ネームスペース登録Tx
  new sdkSymbol.models.NamespaceId(sdkSymbol.generateNamespaceId(name, parentNameId)),            // ネームスペースID
  sdkSymbol.models.NamespaceRegistrationType.CHILD,   // 登録タイプ : サブネームスペース
  undefined,                                          // duration:レンタル期間 (サブの場合は省略可)
  parentNameId,                                       // 親ネームスペースID
  name                                                // ネームスペース
);
subNamespaceTx = facade.createTransactionFromTypedDescriptor(
  subNamespaceDescriptor, // トランザクション Descriptor 設定
  alice.publicKey,        // 署名者公開鍵
  100,                    // 手数料乗数
  60 * 60 * 2             // Deadline:有効期限(秒単位)
);

// 署名とアナウンス
sig = alice.signTransaction(subNamespaceTx);
jsonPayload = facade.transactionFactory.static.attachSignature(subNamespaceTx, sig);
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
export const sub2V2 = r`subNamespaceTx = sym.NamespaceRegistrationTransaction.createSubNamespace(
    ,
    "morning",  //作成するサブネームスペース
    "xembook.tomato", //紐づけたいルートネームスペース
    ,
)`;
export const sub2V3 = r`// ネームスペース設定
rootNameId = sdkSymbol.generateNamespaceId("xembook"); // ルートネームスペース
parentNameId = sdkSymbol.generateNamespaceId("tomato", rootNameId);  // 紐づけたい1階層目のサブネームスペース
name = "morning";  // 作成するサブネームスペース

// 以下はサブネームスペース作成と同じ`;
export const expV2 = r`nsRepo = repo.createNamespaceRepository();
chainRepo = repo.createChainRepository();
blockRepo = repo.createBlockRepository();

namespaceId = new sym.NamespaceId("xembook");
nsInfo = await nsRepo.getNamespace(namespaceId).toPromise();
lastHeight = (await chainRepo.getChainInfo().toPromise()).height;
lastBlock = await blockRepo.getBlockByHeight(lastHeight).toPromise();
remainHeight = nsInfo.endHeight.compact() - lastHeight.compact();

endDate = new Date(lastBlock.timestamp.compact() + remainHeight * 30000 + epochAdjustment * 1000)
console.log(endDate);`;
export const expV3 = r`namespaceIds = sdkSymbol.generateNamespacePath("xembook"); // ルートネームスペース
namespaceId = namespaceIds[namespaceIds.length - 1];

nsInfo = await fetch(
  new URL('/namespaces/' + namespaceId.toString(16).toUpperCase(), NODE),
  {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  }
)
.then((res) => res.json())
.then((json) => {
  return json.namespace;
});

chainInfo = await fetch(
  new URL('/chain/info', NODE),
  {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  }
)
.then((res) => res.json())
.then((json) => {
  return json;
});
lastHeight = chainInfo.height;

lastBlock = await fetch(
  new URL('/blocks/' + lastHeight, NODE),
  {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  }
)
.then((res) => res.json())
.then((json) => {
  return json.block;
});
remainHeight = nsInfo.endHeight - lastHeight;

endDate = new Date(Number(lastBlock.timestamp) + remainHeight * 30000 + epochAdjustment * 1000);
console.log(endDate);`;
export const expOut = r`> Tue Mar 29 2022 18:17:06 GMT+0900 (日本標準時)`;

// ---------- 6.3 リンク ----------
export const linkAddrV2 = r`namespaceId = new sym.NamespaceId("xembook");
address = sym.Address.createFromRawAddress("TBIL6D6RURP45YQRWV6Q7YVWIIPLQGLZQFHWFEQ");
tx = sym.AliasTransaction.createForAddress(
    sym.Deadline.create(epochAdjustment),
    sym.AliasAction.Link,
    namespaceId,
    address,
    networkType
).setMaxFee(100);
signedTx = alice.sign(tx,generationHash);
await txRepo.announce(signedTx).toPromise();`;
export const linkAddrV3 = r`// リンクするネームスペースとアドレスの設定
namespaceIds = sdkSymbol.generateNamespacePath("xembook");
namespaceId = new sdkSymbol.models.NamespaceId(namespaceIds[namespaceIds.length - 1]);
address = new sdkSymbol.Address("TBIL6D6RURP45YQRWV6Q7YVWIIPLQGLZQFHWFEQ");

// Tx作成
descriptor = new sdkSymbol.descriptors.AddressAliasTransactionV1Descriptor(  // Txタイプ:アドレスエイリアスTx
  namespaceId,      // ネームスペースID
  address,          // リンク先アドレス
  sdkSymbol.models.AliasAction.LINK
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
export const linkMosV2 = r`namespaceId = new sym.NamespaceId("xembook.tomato");
mosaicId = new sym.MosaicId("3A8416DB2D53xxxx");
tx = sym.AliasTransaction.createForMosaic(
    sym.Deadline.create(epochAdjustment),
    sym.AliasAction.Link,
    namespaceId,
    mosaicId,
    networkType
).setMaxFee(100);
signedTx = alice.sign(tx,generationHash);
await txRepo.announce(signedTx).toPromise();`;
export const linkMosV3 = r`// リンクするネームスペースとモザイクの設定
namespaceIds = sdkSymbol.generateNamespacePath("xembook.tomato");
namespaceId = new sdkSymbol.models.NamespaceId(namespaceIds[namespaceIds.length - 1]);
mosaicId = new sdkSymbol.models.MosaicId(0x3A8416DB2D53xxxxn);

// Tx作成
descriptor = new sdkSymbol.descriptors.MosaicAliasTransactionV1Descriptor(  // Txタイプ:モザイクエイリアスTx
  namespaceId,      // ネームスペースID
  mosaicId,         // リンク先モザイク
  sdkSymbol.models.AliasAction.LINK
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

// ---------- 6.4 未解決で使用 ----------
export const unrAddrV2 = r`namespaceId = new sym.NamespaceId("xembook");
tx = sym.TransferTransaction.create(
    sym.Deadline.create(epochAdjustment),
    namespaceId, //UnresolvedAccount:未解決アカウントアドレス
    [],
    sym.EmptyMessage,
    networkType
).setMaxFee(100);
signedTx = alice.sign(tx,generationHash);
await txRepo.announce(signedTx).toPromise();`;
export const unrAddrV3 = r`// UnresolvedAccount 導出
namespaceIds = sdkSymbol.generateNamespacePath("xembook");
namespaceId = new sdkSymbol.models.NamespaceId(namespaceIds[namespaceIds.length - 1]);
unresolvecAccount = sdkSymbol.Address.fromNamespaceId(namespaceId, networkType);

// Tx作成
descriptor = new sdkSymbol.descriptors.TransferTransactionV1Descriptor(  // Txタイプ:転送Tx
  unresolvecAccount,  // UnresolvedAccount:未解決アカウントアドレス
  [],
  new Uint8Array()    // メッセージ
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
export const unrMosV2 = r`namespaceId = new sym.NamespaceId("xembook.tomato");
tx = sym.TransferTransaction.create(
    sym.Deadline.create(epochAdjustment),
    address,
    [
        new sym.Mosaic(
          namespaceId,//UnresolvedMosaic:未解決モザイク
          sym.UInt64.fromUint(1) //送信量
        )
    ],
    sym.EmptyMessage,
    networkType
).setMaxFee(100);
signedTx = alice.sign(tx,generationHash);
await txRepo.announce(signedTx).toPromise();`;
export const unrMosV3 = r`// address = new sdkSymbol.Address("*****");
namespaceIds = sdkSymbol.generateNamespacePath("xembook.tomato");
namespaceId = namespaceIds[namespaceIds.length - 1];

// Tx作成
descriptor = new sdkSymbol.descriptors.TransferTransactionV1Descriptor(  // Txタイプ:転送Tx
  address,          // 受取アドレス
  [
    new sdkSymbol.descriptors.UnresolvedMosaicDescriptor(
      new sdkSymbol.models.UnresolvedMosaicId(namespaceId), // UnresolvedMosaic:未解決モザイク
      new sdkSymbol.models.Amount(1n)                       // 送信量
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
export const xymV2 = r`namespaceId = new sym.NamespaceId("symbol.xym");`;
export const xymV2Out = r`> NamespaceId {fullName: 'symbol.xym', id: Id}
    fullName: "symbol.xym"
    id: Id {lower: 1106554862, higher: 3880491450}`;
export const xymV3 = r`namespaceIds = sdkSymbol.generateNamespacePath("symbol.xym");
namespaceId = namespaceIds[namespaceIds.length - 1];`;
export const xymV3Out = r`> 16666583871264174062n`;

// ---------- 6.5 参照 ----------
export const refAddrV2 = r`nsRepo = repo.createNamespaceRepository();

namespaceInfo = await nsRepo.getNamespace(new sym.NamespaceId("xembook")).toPromise();
console.log(namespaceInfo);`;
export const refAddrV2Out = r`NamespaceInfo
    active: true
  > alias: AddressAlias
        address: Address {address: 'TBIL6D6RURP45YQRWV6Q7YVWIIPLQGLZQFHWFEQ', networkType: 152}
        mosaicId: undefined
        type: 2 //AliasType
    depth: 1
    endHeight: UInt64 {lower: 500545, higher: 0}
    index: 1
    levels: [NamespaceId]
    ownerAddress: Address {address: 'TBIL6D6RURP45YQRWV6Q7YVWIIPLQGLZQFHWFEQ', networkType: 152}
    parentId: NamespaceId {id: Id}
    registrationType: 0 //NamespaceRegistrationType
    startHeight: UInt64 {lower: 324865, higher: 0}`;
export const refAddrV3 = r`namespaceIds = sdkSymbol.generateNamespacePath("xembook");
nameId = namespaceIds[namespaceIds.length - 1];
namespaceInfo = await fetch(
  new URL('/namespaces/' + nameId.toString(16).toUpperCase(), NODE),
  {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  }
)
.then((res) => res.json())
.then((json) => {
  return json;
});
console.log(namespaceInfo);`;
export const refAddrV3Out = r`> {meta: {…}, namespace: {…}, id: '6492E0242F7CE156B00D7580'}
    id: "6492E0242F7CE156B00D7580"
  > meta:
      active: true
      index: 9
  > namespace:
    > alias:
        address: "981CFF6235B50FEAB020C824D5E0EBD4894F8D605DD2DF93"
        type: 2 //AliasType
      depth: 1
      endHeight: "1432950"
      level0: "A43415EB268C7385"
      ownerAddress: "981CFF6235B50FEAB020C824D5E0EBD4894F8D605DD2DF93"
      parentId: "0000000000000000"
      registrationType: 0 // NamespaceRegistrationType
      startHeight: "393270"
      version: 1`;
export const aliasTypes = r`{0: 'None', 1: 'Mosaic', 2: 'Address'}`;
export const nsRegTypes = r`{0: 'RootNamespace', 1: 'SubNamespace'}`;
export const refMosV2 = r`nsRepo = repo.createNamespaceRepository();

namespaceInfo = await nsRepo.getNamespace(new sym.NamespaceId("xembook.tomato")).toPromise();
console.log(namespaceInfo);`;
export const refMosV2Out = r`NamespaceInfo
  > active: true
    alias: MosaicAlias
        address: undefined
        mosaicId: MosaicId
        id: Id {lower: 1360892257, higher: 309702839}
        type: 1 //AliasType
    depth: 2
    endHeight: UInt64 {lower: 500545, higher: 0}
    index: 1
    levels: (2) [NamespaceId, NamespaceId]
    ownerAddress: Address {address: 'TBIL6D6RURP45YQRWV6Q7YVWIIPLQGLZQFHWFEQ', networkType: 152}
    parentId: NamespaceId {id: Id}
    registrationType: 1 //NamespaceRegistrationType
    startHeight: UInt64 {lower: 324865, higher: 0}`;
export const refMosV3 = r`namespaceIds = sdkSymbol.generateNamespacePath("xembook.tomato");
nameId = namespaceIds[namespaceIds.length - 1];
namespaceInfo = await fetch(
  new URL('/namespaces/' + nameId.toString(16).toUpperCase(), NODE),
  {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  }
)
.then((res) => res.json())
.then((json) => {
  return json;
});
console.log(namespaceInfo);`;
export const refMosV3Out = r`> {meta: {…}, namespace: {…}, id: '6492E0242F7CE156B00D758B'}
    id: "6492E0242F7CE156B00D758B"
  > meta:
      active: true
      index: 9
  > namespace:
    > alias:
        mosaicId: "663B178E904CADB8"
        type: 1 //AliasType
      depth: 1
      endHeight: "1432950"
      level0: "A43415EB268C7385"
      level1: "FA547FD28C836431"
      ownerAddress: "981CFF6235B50FEAB020C824D5E0EBD4894F8D605DD2DF93"
      parentId: "A43415EB268C7385"
      registrationType: 1 // NamespaceRegistrationType
      startHeight: "393270"
      version: 1`;
export const revAddrV2 = r`nsRepo = repo.createNamespaceRepository();

accountNames = await nsRepo.getAccountsNames(
  [sym.Address.createFromRawAddress("TBIL6D6RURP45YQRWV6Q7YVWIIPLQGLZQFHWFEQ")]
).toPromise();

namespaceIds = accountNames[0].names.map(name=>{
  return name.namespaceId;
});
console.log(namespaceIds);`;
export const revAddrV3 = r`body = {
  "addresses": [
    "TBIL6D6RURP45YQRWV6Q7YVWIIPLQGLZQFHWFEQ"
  ]
};
accountNames = await fetch(
  new URL('/namespaces/account/names', NODE),
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }
)
.then((res) => res.json())
.then((json) => {
  return json.accountNames;
});

namespaceIds = accountNames[0].names;
console.log(namespaceIds);`;
export const revMosV2 = r`nsRepo = repo.createNamespaceRepository();

mosaicNames = await nsRepo.getMosaicsNames(
  [new sym.MosaicId("72C0212E67A08BCE")]
).toPromise();

namespaceIds = mosaicNames[0].names.map(name=>{
  return name.namespaceId;
});
console.log(namespaceIds);`;
export const revMosV3 = r`body = {
  "mosaicIds": [
    "72C0212E67A08BCE"
  ]
};
mosaicNames = await fetch(
  new URL('/namespaces/mosaic/names', NODE),
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }
)
.then((res) => res.json())
.then((json) => {
  return json.mosaicNames;
});

namespaceIds = mosaicNames[0].names;
console.log(namespaceIds);`;
export const rcpV2 = r`receiptRepo = repo.createReceiptRepository();
state = await receiptRepo.searchAddressResolutionStatements({height:179401}).toPromise();`;
export const rcpV2Out = r`data: Array(1)
  0: ResolutionStatement
    height: UInt64 {lower: 179401, higher: 0}
    resolutionEntries: Array(1)
      0: ResolutionEntry
        resolved: Address {address: 'TBIL6D6RURP45YQRWV6Q7YVWIIPLQGLZQFHWFEQ', networkType: 152}
        source: ReceiptSource {primaryId: 1, secondaryId: 0}
    resolutionType: 0 //ResolutionType
    unresolved: NamespaceId
      id: Id {lower: 646738821, higher: 2754876907}`;
export const resTypes = r`{0: 'Address', 1: 'Mosaic'}`;
export const rcpAddrV3 = r`query = new URLSearchParams({
  "height": 179401  // 6.4 で作成したTxが取り込まれたブロック高
});
state = await fetch(
  new URL('/statements/resolutions/address?' + query.toString(), NODE), // アドレス用のURI
  {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  }
)
.then((res) => res.json())
.then((json) => {
  return json.data;
});`;
export const rcpMosV3 = r`query = new URLSearchParams({
  "height": 179401  // 6.4 で作成したTxが取り込まれたブロック高
});
state = await fetch(
  new URL('/statements/resolutions/mosaic?' + query.toString(), NODE), // モザイク用のURI
  {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  }
)
.then((res) => res.json())
.then((json) => {
  return json.data;
});`;
export const rcpV3Out = r`> data: Array(1)
  > 0:
      id: "64B6A3742F7CE156B0108826"
    > meta:
        timestamp: "22440529194"
    > statement:
        height: "646246"
        resolutionEntries: Array(1)
        > 0:
            resolved: "986A4B98552007D13947E6F4F1202604BD26CC4018BACACC"
          > source:
              primaryId: 1
              secondaryId: 0
        unresolved: "99534C3F83755AD3D9000000000000000000000000000000"`;
