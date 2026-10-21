// 速習Symbol 第11章 制限 のサンプルコードと出力例（11_restriction.md より）。
// コンソールでそのまま実行できるよう、const 宣言は付けていない（ch02〜ch10 と同じ方針）。
const r = String.raw;

export const carolV2 = r`//使い捨てアカウントCarolの生成
carol = sym.Account.generateNewAccount(networkType);
console.log(carol.address);

//FAUCET URL出力
console.log("https://testnet.symbol.tools/?recipient=" + carol.address.plain() +"&amount=100");`;
export const carolV3 = r`// 使い捨てアカウントCarolの生成
carol = facade.createAccount(sdkCore.PrivateKey.random());
console.log(carol.address.toString());

// FAUCET URL出力
console.log("https://testnet.symbol.tools/?recipient=" + carol.address.toString() +"&amount=100");`;
export const addrV2 = r`bob = sym.Account.generateNewAccount(networkType);

tx = sym.AccountRestrictionTransaction.createAddressRestrictionModificationTransaction(
  sym.Deadline.create(epochAdjustment),
  sym.AddressRestrictionFlag.BlockIncomingAddress, //アドレス制限フラグ
  [bob.address],//設定アドレス
  [],　　　　　　//解除アドレス
  networkType
).setMaxFee(100);
signedTx = carol.sign(tx,generationHash);
await txRepo.announce(signedTx).toPromise();`;
export const addrFlagOut = r`{1: 'AllowIncomingAddress', 16385: 'AllowOutgoingAddress', 32769: 'BlockIncomingAddress', 49153: 'BlockOutgoingAddress'}`;
export const addrV3 = r`bob = facade.createAccount(sdkCore.PrivateKey.random());

// 制限設定
f = sdkSymbol.models.AccountRestrictionFlags.ADDRESS.value; // アドレス制限
f += sdkSymbol.models.AccountRestrictionFlags.BLOCK.value; // ブロック
flags = new sdkSymbol.models.AccountRestrictionFlags(f);

// アドレス制限設定Tx作成
descriptor = new sdkSymbol.descriptors.AccountAddressRestrictionTransactionV1Descriptor(  // Txタイプ:アドレス制限設定Tx
  flags,  // アドレス制限フラグ
  [       // 設定アドレス
    bob.address,
  ],
  []      // 解除アドレス
);
tx = facade.createTransactionFromTypedDescriptor(
  descriptor,       // トランザクション Descriptor 設定
  carol.publicKey,  // 署名者公開鍵
  100,                // 手数料乗数
  60 * 60 * 2         // Deadline:有効期限(秒単位)
);

// 署名
sig = carol.signTransaction(tx);
jsonPayload = facade.transactionFactory.static.attachSignature(tx, sig);

// アドレス制限設定Txをアナウンス
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
export const mosV2 = r`mosaicId = new sym.MosaicId("72C0212E67A08BCE"); //テストネット XYM
tx = sym.AccountRestrictionTransaction.createMosaicRestrictionModificationTransaction(
  sym.Deadline.create(epochAdjustment),
  sym.MosaicRestrictionFlag.BlockMosaic, //モザイク制限フラグ
  [mosaicId],//設定モザイク
  [],//解除モザイク
  networkType
).setMaxFee(100);
signedTx = carol.sign(tx,generationHash);
await txRepo.announce(signedTx).toPromise();`;
export const mosFlagOut = r`{2: 'AllowMosaic', 32770: 'BlockMosaic'}`;
export const mosV3 = r`// 制限設定
f = sdkSymbol.models.AccountRestrictionFlags.MOSAIC_ID.value; // モザイク制限
f += sdkSymbol.models.AccountRestrictionFlags.BLOCK.value;    // ブロック
flags = new sdkSymbol.models.AccountRestrictionFlags(f);

// モザイク制限設定Tx作成
descriptor = new sdkSymbol.descriptors.AccountMosaicRestrictionTransactionV1Descriptor(  // Txタイプ:モザイク制限設定Tx
  flags,  // モザイク制限フラグ
  [       // 設定モザイク
    new sdkSymbol.models.UnresolvedMosaicId(0x72C0212E67A08BCEn),
  ],
  []      // 解除モザイク
);
tx = facade.createTransactionFromTypedDescriptor(
  descriptor,       // トランザクション Descriptor 設定
  carol.publicKey,  // 署名者公開鍵
  100,                // 手数料乗数
  60 * 60 * 2         // Deadline:有効期限(秒単位)
);

// 署名
sig = carol.signTransaction(tx);
jsonPayload = facade.transactionFactory.static.attachSignature(tx, sig);

// モザイク制限設定Txをアナウンス
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
export const opV2 = r`tx = sym.AccountRestrictionTransaction.createOperationRestrictionModificationTransaction(
  sym.Deadline.create(epochAdjustment),
  sym.OperationRestrictionFlag.AllowOutgoingTransactionType,
      [sym.TransactionType.ACCOUNT_OPERATION_RESTRICTION],//設定トランザクション
  [],//解除トランザクション
  networkType
).setMaxFee(100);
signedTx = carol.sign(tx,generationHash);
await txRepo.announce(signedTx).toPromise();`;
export const opFlagOut = r`{16388: 'AllowOutgoingTransactionType', 49156: 'BlockOutgoingTransactionType'}`;
export const opV3 = r`// 制限設定
f = sdkSymbol.models.AccountRestrictionFlags.TRANSACTION_TYPE.value;  // トランザクション制限
f += sdkSymbol.models.AccountRestrictionFlags.OUTGOING.value;         // 送信
flags = new sdkSymbol.models.AccountRestrictionFlags(f);

// トランザクション制限設定Tx作成
descriptor = new sdkSymbol.descriptors.AccountOperationRestrictionTransactionV1Descriptor(  // Txタイプ:トランザクション制限設定Tx
  flags,  // トランザクション制限フラグ
  [       // 設定トランザクション
    sdkSymbol.models.TransactionType.ACCOUNT_OPERATION_RESTRICTION.value,
  ],
  []      // 解除トランザクション
);
tx = facade.createTransactionFromTypedDescriptor(
  descriptor,       // トランザクション Descriptor 設定
  carol.publicKey,  // 署名者公開鍵
  100,              // 手数料乗数
  60 * 60 * 2       // Deadline:有効期限(秒単位)
);

// 署名
sig = carol.signTransaction(tx);
jsonPayload = facade.transactionFactory.static.attachSignature(tx, sig);

// トランザクション制限設定Txをアナウンス
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
export const txTypeOut = r`{16705: 'AGGREGATE_COMPLETE', 16707: 'VOTING_KEY_LINK', 16708: 'ACCOUNT_METADATA', 16712: 'HASH_LOCK', 16716: 'ACCOUNT_KEY_LINK', 16717: 'MOSAIC_DEFINITION', 16718: 'NAMESPACE_REGISTRATION', 16720: 'ACCOUNT_ADDRESS_RESTRICTION', 16721: 'MOSAIC_GLOBAL_RESTRICTION', 16722: 'SECRET_LOCK', 16724: 'TRANSFER', 16725: 'MULTISIG_ACCOUNT_MODIFICATION', 16961: 'AGGREGATE_BONDED', 16963: 'VRF_KEY_LINK', 16964: 'MOSAIC_METADATA', 16972: 'NODE_KEY_LINK', 16973: 'MOSAIC_SUPPLY_CHANGE', 16974: 'ADDRESS_ALIAS', 16976: 'ACCOUNT_MOSAIC_RESTRICTION', 16977: 'MOSAIC_ADDRESS_RESTRICTION', 16978: 'SECRET_PROOF', 17220: 'NAMESPACE_METADATA', 17229: 'MOSAIC_SUPPLY_REVOCATION', 17230: 'MOSAIC_ALIAS'}`;
export const infoV2 = r`resAccountRepo = repo.createRestrictionAccountRepository();

res = await resAccountRepo.getAccountRestrictions(carol.address).toPromise();
console.log(res);`;
export const infoV2Out = r`> AccountRestrictions
    address: Address {address: 'TBXUTAX6O6EUVPB6X7OBNX6UUXBMPPAFX7KE5TQ', networkType: 152}
  > restrictions: Array(2)
      0: AccountRestriction
        restrictionFlags: 32770
        values: Array(1)
          0: MosaicId
            id: Id {lower: 1360892257, higher: 309702839}
      1: AccountRestriction
        restrictionFlags: 49153
        values: Array(1)
          0: Address {address: 'TCW2ZW7LVJMS4LWUQ7W6NROASRE2G2QKSBVCIQY', networkType: 152}`;
export const infoV3 = r`res = await fetch(
  new URL('/restrictions/account/' + carol.address.toString(), NODE),
  {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  }
)
.then((res) => res.json())
.then((json) => {
  return json.accountRestrictions;
});
console.log(res);`;
export const infoV3Out = r`> {version: 1, address: '98A3670EF79748312687154D5B92AFED6B7C5E5A7560A423', restrictions: Array(3)}
    address: "98A3670EF79748312687154D5B92AFED6B7C5E5A7560A423"
  > restrictions: Array(3)
    > 0:
        restrictionFlags: 32769
      > values: Array(1)
          0: "98676BDA0CC03FFA5897BA9706005D119F0C240F71F587B9"
          length: 1
    > 1: 
        restrictionFlags: 32770
      > values: Array(1)
          0: "72C0212E67A08BCE"
          length: 1
    > 2: 
        restrictionFlags: 16388
      > values: Array(1)
          0: 17232
          length: 1
      length: 3
    version: 1`;
export const prepV2 = r`nsRepo = repo.createNamespaceRepository();
resMosaicRepo = repo.createRestrictionMosaicRepository();
mosaicResService = new sym.MosaicRestrictionTransactionService(resMosaicRepo,nsRepo);`;
export const prepV3 = r`// 必要ライブラリの設定
sha3_256 = (await import('https://cdn.skypack.dev/@noble/hashes/sha3')).sha3_256;`;
export const createV2 = r`supplyMutable = true; //供給量変更の可否
transferable = true; //第三者への譲渡可否
restrictable = true; //グローバル制限設定の可否
revokable = true; //発行者からの還収可否

nonce = sym.MosaicNonce.createRandom();
mosaicDefTx = sym.MosaicDefinitionTransaction.create(
    undefined,
    nonce,
    sym.MosaicId.createFromNonce(nonce, carol.address),
    sym.MosaicFlags.create(supplyMutable, transferable, restrictable, revokable),
    0,//divisibility
    sym.UInt64.fromUint(0), //duration
    networkType
);

//モザイク変更
mosaicChangeTx = sym.MosaicSupplyChangeTransaction.create(
    undefined,
    mosaicDefTx.mosaicId,
    sym.MosaicSupplyChangeAction.Increase,
    sym.UInt64.fromUint(1000000),
    networkType
);

//グローバルモザイク制限
key = sym.KeyGenerator.generateUInt64Key("KYC") // restrictionKey 
mosaicGlobalResTx = await mosaicResService.createMosaicGlobalRestrictionTransaction(
    undefined,
    networkType,
    mosaicDefTx.mosaicId,
    key,
    '1',
    sym.MosaicRestrictionType.EQ,
).toPromise();

aggregateTx = sym.AggregateTransaction.createComplete(
    sym.Deadline.create(epochAdjustment),
    [
      mosaicDefTx.toAggregate(carol.publicAccount),
      mosaicChangeTx.toAggregate(carol.publicAccount),
      mosaicGlobalResTx.toAggregate(carol.publicAccount)
    ],
    networkType,[],
).setMaxFeeForAggregate(100, 0);

signedTx = carol.sign(aggregateTx,generationHash);
await txRepo.announce(signedTx).toPromise();`;
export const createV3 = r`// モザイクフラグ設定
f = sdkSymbol.models.MosaicFlags.NONE.value;
f += sdkSymbol.models.MosaicFlags.SUPPLY_MUTABLE.value; // 供給量変更の可否
f += sdkSymbol.models.MosaicFlags.TRANSFERABLE.value;   // 第三者への譲渡可否
f += sdkSymbol.models.MosaicFlags.RESTRICTABLE.value;   // グローバル制限設定の可否
f += sdkSymbol.models.MosaicFlags.REVOKABLE.value;      // 発行者からの還収可否
flags = new sdkSymbol.models.MosaicFlags(f);

// ナンス設定
array = new Uint8Array(sdkSymbol.models.MosaicNonce.SIZE);
crypto.getRandomValues(array);
nonce = sdkSymbol.models.MosaicNonce.deserialize(array);

// モザイク定義
mosaicDefDescriptor = new sdkSymbol.descriptors.MosaicDefinitionTransactionV1Descriptor(  // Txタイプ:モザイク定義Tx
  new sdkSymbol.models.MosaicId(sdkSymbol.generateMosaicId(carol.address, nonce)),
  new sdkSymbol.models.BlockDuration(0n), // duration:有効期限
  nonce,  // ナンス
  flags,  // モザイクフラグ
  0       // divisibility:可分性
);
mosaicDefTx = facade.createEmbeddedTransactionFromTypedDescriptor(
  mosaicDefDescriptor,  // トランザクション Descriptor 設定
  carol.publicKey,      // 署名者公開鍵
);

// モザイク変更
mosaicChangeDescriptor = new sdkSymbol.descriptors.MosaicSupplyChangeTransactionV1Descriptor( // Txタイプ:モザイク変更Tx
  new sdkSymbol.models.UnresolvedMosaicId(mosaicDefTx.id.value),
  new sdkSymbol.models.Amount(1000000n),              // 数量
  sdkSymbol.models.MosaicSupplyChangeAction.INCREASE  // アクション
);
mosaicChangeTx = facade.createEmbeddedTransactionFromTypedDescriptor(
  mosaicChangeDescriptor, // トランザクション Descriptor 設定
  carol.publicKey,        // 署名者公開鍵
);

// キー生成(v2 準拠)
// メタデータキー生成と同じロジックのため、metadataGenerateKey()を利用する
key = sdkSymbol.metadataGenerateKey("KYC"); // restrictionKey 

// グローバルモザイク制限
mosaicGlobalResDescriptor = new sdkSymbol.descriptors.MosaicGlobalRestrictionTransactionV1Descriptor( // Txタイプ:グローバルモザイク制限Tx
  new sdkSymbol.models.UnresolvedMosaicId(mosaicDefTx.id.value),  // 制限をかけるモザイクID
  new sdkSymbol.models.UnresolvedMosaicId(0n),                    // 参照するモザイクID。制限をかけるモザイクIDと一致する場合は 0 を指定する
  key,  // restriction key 
  0n,   // 現在の restriction value
  1n,   // 新しく設定する restriction value
  sdkSymbol.models.MosaicRestrictionType.NONE,  // 現在の restriction type
  sdkSymbol.models.MosaicRestrictionType.EQ     // 新しく設定する restriction type
);
mosaicGlobalResTx = facade.createEmbeddedTransactionFromTypedDescriptor(
  mosaicGlobalResDescriptor,  // トランザクション Descriptor 設定
  carol.publicKey,            // 署名者公開鍵
);
// 更新する場合は以下も設定する必要あり
//   - mosaicGlobalResTx.previousRestrictionValue
//   - mosaicGlobalResTx.previousRestrictionType

embeddedTransactions = [
  mosaicDefTx,
  mosaicChangeTx,
  mosaicGlobalResTx
];

// アグリゲートTx作成
aggregateDescriptor = new sdkSymbol.descriptors.AggregateCompleteTransactionV3Descriptor(
  facade.static.hashEmbeddedTransactions(embeddedTransactions),
  embeddedTransactions
);
aggregateTx = facade.createTransactionFromTypedDescriptor(
  aggregateDescriptor,  // トランザクション Descriptor 設定
  carol.publicKey,      // 署名者公開鍵
  100,                  // 手数料乗数
  60 * 60 * 2,          // Deadline:有効期限(秒単位)
  0                     // 連署者数
);

// 署名とアナウンス
sig = carol.signTransaction(aggregateTx);
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
export const resTypeOut = r`{0: 'NONE', 1: 'EQ', 2: 'NE', 3: 'LT', 4: 'LE', 5: 'GT', 6: 'GE'}`;
export const applyV2 = r`//Carolに適用
carolMosaicAddressResTx =  sym.MosaicAddressRestrictionTransaction.create(
    sym.Deadline.create(epochAdjustment),
    mosaicDefTx.mosaicId, // mosaicId
    sym.KeyGenerator.generateUInt64Key("KYC"), // restrictionKey
    carol.address, // address
    sym.UInt64.fromUint(1), // newRestrictionValue
    networkType,
    sym.UInt64.fromHex('FFFFFFFFFFFFFFFF') //previousRestrictionValue
).setMaxFee(100);
signedTx = carol.sign(carolMosaicAddressResTx,generationHash);
await txRepo.announce(signedTx).toPromise();

//Bobに適用
bob = sym.Account.generateNewAccount(networkType);
bobMosaicAddressResTx =  sym.MosaicAddressRestrictionTransaction.create(
    sym.Deadline.create(epochAdjustment),
    mosaicDefTx.mosaicId, // mosaicId
    sym.KeyGenerator.generateUInt64Key("KYC"), // restrictionKey
    bob.address, // address
    sym.UInt64.fromUint(1), // newRestrictionValue
    networkType,
    sym.UInt64.fromHex('FFFFFFFFFFFFFFFF') //previousRestrictionValue
).setMaxFee(100);
signedTx = carol.sign(bobMosaicAddressResTx,generationHash);
await txRepo.announce(signedTx).toPromise();`;
export const applyV3 = r`// Carolに適用
carolMosaicAddressResDescriptor = new sdkSymbol.descriptors.MosaicAddressRestrictionTransactionV1Descriptor( // Txタイプ:モザイク制限適用Tx
  new sdkSymbol.models.UnresolvedMosaicId(mosaicDefTx.id.value),  // 適用するモザイクID
  key,                  // restriction key 
  0xFFFFFFFFFFFFFFFFn,  // 現在の restriction value (制限がかけられていない場合は 0xFFFFFFFFFFFFFFFF)
  1n,                   // 新しく設定する restriction value
  carol.address
);
carolMosaicAddressResTx = facade.createTransactionFromTypedDescriptor(
  carolMosaicAddressResDescriptor,  // トランザクション Descriptor 設定
  carol.publicKey,                  // 署名者公開鍵
  100,                              // 手数料乗数
  60 * 60 * 2                       // Deadline:有効期限(秒単位)
);

// 署名とアナウンス
carolSig = carol.signTransaction(carolMosaicAddressResTx);
carolJsonPayload = facade.transactionFactory.static.attachSignature(carolMosaicAddressResTx, carolSig);
await fetch(
  new URL('/transactions', NODE),
  {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: carolJsonPayload,
  }
)
.then((res) => res.json())
.then((json) => {
  return json;
});

bob = facade.createAccount(sdkCore.PrivateKey.random());

// Bobに適用
bobMosaicAddressResDescriptor = new sdkSymbol.descriptors.MosaicAddressRestrictionTransactionV1Descriptor( // Txタイプ:モザイク制限適用Tx
  new sdkSymbol.models.UnresolvedMosaicId(mosaicDefTx.id.value),  // 適用するモザイクID
  key,                  // restriction key 
  0xFFFFFFFFFFFFFFFFn,  // 現在の restriction value (制限がかけられていない場合は 0xFFFFFFFFFFFFFFFF)
  1n,                   // 新しく設定する restriction value
  bob.address
);
bobMosaicAddressResTx = facade.createTransactionFromTypedDescriptor(
  bobMosaicAddressResDescriptor,  // トランザクション Descriptor 設定
  carol.publicKey,                // 署名者公開鍵
  100,                            // 手数料乗数
  60 * 60 * 2                     // Deadline:有効期限(秒単位)
);

// 署名とアナウンス
bobSig = carol.signTransaction(bobMosaicAddressResTx);
bobJsonPayload = facade.transactionFactory.static.attachSignature(bobMosaicAddressResTx, bobSig);
await fetch(
  new URL('/transactions', NODE),
  {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: bobJsonPayload,
  }
)
.then((res) => res.json())
.then((json) => {
  return json;
});`;
export const checkV2 = r`res = await resMosaicRepo.search({mosaicId:mosaicDefTx.mosaicId}).toPromise();
console.log(res);`;
export const checkV2Out = r`> data
    > 0: MosaicGlobalRestriction
      compositeHash: "68FBADBAFBD098C157D42A61A7D82E8AF730D3B8C3937B1088456432CDDB8373"
      entryType: 1
    > mosaicId: MosaicId
        id: Id {lower: 2467167064, higher: 973862467}
    > restrictions: Array(1)
        0: MosaicGlobalRestrictionItem
          key: UInt64 {lower: 2424036727, higher: 2165465980}
          restrictionType: 1
          restrictionValue: UInt64 {lower: 1, higher: 0}
    > 1: MosaicAddressRestriction
      compositeHash: "920BFD041B6D30C0799E06585EC5F3916489E2DDF47FF6C30C569B102DB39F4E"
      entryType: 0
    > mosaicId: MosaicId
        id: Id {lower: 2467167064, higher: 973862467}
    > restrictions: Array(1)
        0: MosaicAddressRestrictionItem
          key: UInt64 {lower: 2424036727, higher: 2165465980}
          restrictionValue: UInt64 {lower: 1, higher: 0}
          targetAddress: Address {address: 'TAZCST2RBXDSD3227Y4A6ZP3QHFUB2P7JQVRYEI', networkType: 152}
  > 2: MosaicAddressRestriction
  ...`;
export const checkV3 = r`query = new URLSearchParams({
  "mosaicId": mosaicDefTx.id.toString().substr(2),
});
res = await fetch(
  new URL('/restrictions/mosaic?' + query.toString(), NODE),
  {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  }
)
.then((res) => res.json())
.then((json) => {
  return json.data;
});
console.log(res);`;
export const checkV3Out = r`> (3) [{…}, {…}, {…}]
  > 0: 
      id: "64BD2ADC6FFE587B6D446083"
    > mosaicRestrictionEntry: 
        compositeHash: "5A697731C9F459E1693B0ECA633FD19E050975A787F8F0E3528662FA187DDC50"
        entryType: 1
        mosaicId: "69594C1564469E28"
      > restrictions: Array(1)
        > 0: 
            key: "9300605567124626807"
          > restriction: 
              referenceMosaicId: "0000000000000000"
              restrictionType: 1
              restrictionValue: "1"
          length: 1
        version: 1
  > 1: 
      id: "64BD3B4C6FFE587B6D4497E5"
    > mosaicRestrictionEntry: 
        compositeHash: "986A5008C27D92E0BEC10D36694BDD7D6514035D115E8CA4224CAAF8F789BAF2"
        entryType: 0
        mosaicId: "69594C1564469E28"
      > restrictions: Array(1)
        > 0: 
            key: "9300605567124626807"
            value: "1"
          length: 1
        targetAddress: "98A3670EF79748312687154D5B92AFED6B7C5E5A7560A423"
        version: 1
  > 2: 
    ...
    length: 3`;
export const sendV2 = r`//成功（CarolからBobに送信）
trTx = sym.TransferTransaction.create(
        sym.Deadline.create(epochAdjustment),
        bob.address, 
        [new sym.Mosaic(mosaicDefTx.mosaicId, sym.UInt64.fromUint(1))],
        sym.PlainMessage.create(""),
        networkType
      ).setMaxFee(100);
signedTx = carol.sign(trTx,generationHash);
await txRepo.announce(signedTx).toPromise();

//失敗（CarolからDaveに送信）
dave = sym.Account.generateNewAccount(networkType);
trTx = sym.TransferTransaction.create(
        sym.Deadline.create(epochAdjustment),
        dave.address, 
        [new sym.Mosaic(mosaicDefTx.mosaicId, sym.UInt64.fromUint(1))],
        sym.PlainMessage.create(""),
        networkType
      ).setMaxFee(100);
signedTx = carol.sign(trTx,generationHash);
await txRepo.announce(signedTx).toPromise();`;
export const sendV3 = r`// 成功（CarolからBobに送信）
trDescriptor = new sdkSymbol.descriptors.TransferTransactionV1Descriptor(  // Txタイプ:転送Tx
  bob.address,      // 受取アドレス
  [
    // グローバルモザイク制限をかけたモザイクID
    new sdkSymbol.descriptors.UnresolvedMosaicDescriptor(
      new sdkSymbol.models.UnresolvedMosaicId(mosaicDefTx.id.value),
      new sdkSymbol.models.Amount(1n)
    )
  ],
  new Uint8Array()  // メッセージ
);
trTx = facade.createTransactionFromTypedDescriptor(
  trDescriptor,     // トランザクション Descriptor 設定
  carol.publicKey,  // 署名者公開鍵
  100,              // 手数料乗数
  60 * 60 * 2       // Deadline:有効期限(秒単位)
);
// 署名とアナウンス
sig = carol.signTransaction(trTx);
jsonPayload = facade.transactionFactory.static.attachSignature(trTx, sig);
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
});

// 失敗（CarolからDaveに送信）
dave = facade.createAccount(sdkCore.PrivateKey.random());
// Tx作成
trDescriptor = new sdkSymbol.descriptors.TransferTransactionV1Descriptor(  // Txタイプ:転送Tx
  dave.address,     // 受取アドレス
  [
    // グローバルモザイク制限をかけたモザイクID
    new sdkSymbol.descriptors.UnresolvedMosaicDescriptor(
      new sdkSymbol.models.UnresolvedMosaicId(mosaicDefTx.id.value),
      new sdkSymbol.models.Amount(1n)
    )
  ],
  new Uint8Array()  // メッセージ
);
trTx = facade.createTransactionFromTypedDescriptor(
  trDescriptor,     // トランザクション Descriptor 設定
  carol.publicKey,  // 署名者公開鍵
  100,              // 手数料乗数
  60 * 60 * 2       // Deadline:有効期限(秒単位)
);

// 署名とアナウンス
sig = carol.signTransaction(trTx);
jsonPayload = facade.transactionFactory.static.attachSignature(trTx, sig);
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
});

// ステータス確認URL表示
console.log(NODE + "/transactionStatus/" + facade.hashTransaction(trTx).toString());`;
export const failOut = r`{"hash":"E3402FB7AE21A6A64838DDD0722420EC67E61206C148A73B0DFD7F8C098062FA","code":"Failure_RestrictionMosaic_Account_Unauthorized","deadline":"12371602742","group":"failed"}`;
