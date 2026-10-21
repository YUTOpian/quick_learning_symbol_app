// 速習Symbol 第7章 メタデータ のサンプルコードと出力例（07_metadata.md より）。
// コンソールでそのまま実行できるよう、const 宣言は付けていない（ch02〜ch06 と同じ方針）。
const r = String.raw;

// ---------- 準備 ----------
export const prepV2 = r`metaRepo = repo.createMetadataRepository();
mosaicRepo = repo.createMosaicRepository();
metaService = new sym.MetadataTransactionService(metaRepo);`;
export const prepV3 = r`sha3_256 = (await import('https://cdn.skypack.dev/@noble/hashes/sha3')).sha3_256;`;

// ---------- 7.1 アカウントに登録 ----------
export const accV2 = r`key = sym.KeyGenerator.generateUInt64Key("key_account");
value = "test";

tx = await metaService.createAccountMetadataTransaction(
    undefined,
    networkType,
    alice.address, //メタデータ記録先アドレス
    key,value, //Key-Value値
    alice.address //メタデータ作成者アドレス
).toPromise();

aggregateTx = sym.AggregateTransaction.createComplete(
  sym.Deadline.create(epochAdjustment),
  [tx.toAggregate(alice.publicAccount)],
  networkType,[]
).setMaxFeeForAggregate(100, 0);

signedTx = alice.sign(aggregateTx,generationHash);
await txRepo.announce(signedTx).toPromise();`;
export const accV3 = r`// ターゲットと作成者アドレスの設定
targetAddress = alice.address;  // メタデータ記録先アドレス
sourceAddress = alice.address;  // メタデータ作成者アドレス

// キーと値の設定
key = sdkSymbol.metadataGenerateKey("key_account");
value = new TextEncoder().encode("test");

// 同じキーのメタデータが登録されているか確認
query = new URLSearchParams({
  "targetAddress": targetAddress.toString(),
  "sourceAddress": sourceAddress.toString(),
  "scopedMetadataKey": key.toString(16).toUpperCase(),
  "metadataType": 0
});
metadataInfo = await fetch(
  new URL('/metadata?' + query.toString(), NODE),
  {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  }
)
.then((res) => res.json())
.then((json) => {
  return json.data;
});
// 登録済の場合は差分データを作成する
sizeDelta = value.length;
if (metadataInfo.length > 0) {
  sizeDelta -= metadataInfo[0].metadataEntry.valueSize;
  value = sdkSymbol.metadataUpdateValue(sdkCore.utils.hexToUint8(metadataInfo[0].metadataEntry.value), value);
}

// アカウントメタデータ登録Tx作成
descriptor = new sdkSymbol.descriptors.AccountMetadataTransactionV1Descriptor(  // Txタイプ:アカウントメタデータ登録Tx
  targetAddress,  // ターゲットアドレス
  key,            // キー
  sizeDelta,      // サイズ差分
  value           // 値
);
tx = facade.createEmbeddedTransactionFromTypedDescriptor(
  descriptor,       // トランザクション Descriptor 設定
  alice.publicKey,  // 署名者公開鍵
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
  alice.publicKey,      // 署名者公開鍵
  100,                  // 手数料乗数
  60 * 60 * 2,          // Deadline:有効期限(秒単位)
  0                     // 連署者数
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
export const accOldKey = r`// キー生成(v2 準拠)
key = "key_account";
hasher = sha3_256.create();
hasher.update((new TextEncoder()).encode(key));
digest = hasher.digest();
lower = [...digest.subarray(0, 4)];
lower.reverse();
lowerValue = BigInt("0x" + sdkCore.utils.uint8ToHex(lower));
higher = [...digest.subarray(4, 8)];
higher.reverse();
higherValue = BigInt("0x" + sdkCore.utils.uint8ToHex(higher)) | 0x80000000n;
keyId = lowerValue + higherValue * 0x100000000n;`;
export const accOldDiff = r`// 同じキーのメタデータが登録されているか確認
// metadataInfo = await fetch(...); の実行

// 登録済の場合は差分データを作成する
value = new TextEncoder().encode("test");
sizeDelta = value.length;
if (metadataInfo.length > 0) {
  sizeDelta -= metadataInfo[0].metadataEntry.valueSize;
  originData = sdkCore.utils.hexToUint8(metadataInfo[0].metadataEntry.value);
  diffData = new Uint8Array(Math.max(originData.length, value.length));
  for (idx = 0; idx < diffData.length; idx++) {
    diffData[idx] = (originData[idx] == undefined ? 0 : originData[idx]) ^ (value[idx] == undefined ? 0 : value[idx]);
  }
  value = diffData;
}`;
export const accBobV2 = r`tx = await metaService.createAccountMetadataTransaction(
    undefined,
    networkType,
    bob.address, //メタデータ記録先アドレス
    key,value, //Key-Value値
    alice.address //メタデータ作成者アドレス
).toPromise();

aggregateTx = sym.AggregateTransaction.createComplete(
  sym.Deadline.create(epochAdjustment),
  [tx.toAggregate(alice.publicAccount)],
  networkType,[]
).setMaxFeeForAggregate(100, 1); // 第二引数に連署者の数:1

signedTx = aggregateTx.signTransactionWithCosignatories(
  alice,[bob],generationHash,// 第二引数に連署者
);
await txRepo.announce(signedTx).toPromise();`;
export const accBobV3 = r`// ターゲットと作成者アドレスの設定
targetAddress = bob.address;    // メタデータ記録先アドレス
sourceAddress = alice.address;  // メタデータ作成者アドレス

// キーと値の設定
key = sdkSymbol.metadataGenerateKey("key_account");
value = new TextEncoder().encode("test");

// 同じキーのメタデータが登録されているか確認
query = new URLSearchParams({
  "targetAddress": targetAddress.toString(),
  "sourceAddress": sourceAddress.toString(),
  "scopedMetadataKey": key.toString(16).toUpperCase(),
  "metadataType": 0
});
metadataInfo = await fetch(
  new URL('/metadata?' + query.toString(), NODE),
  {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  }
)
.then((res) => res.json())
.then((json) => {
  return json.data;
});
// 登録済の場合は差分データを作成する
sizeDelta = value.length;
if (metadataInfo.length > 0) {
  sizeDelta -= metadataInfo[0].metadataEntry.valueSize;
  value = sdkSymbol.metadataUpdateValue(sdkCore.utils.hexToUint8(metadataInfo[0].metadataEntry.value), value);
}

// アカウントメタデータ登録Tx作成
descriptor = new sdkSymbol.descriptors.AccountMetadataTransactionV1Descriptor(  // Txタイプ:アカウントメタデータ登録Tx
  targetAddress,  // ターゲットアドレス
  key,            // キー
  sizeDelta,      // サイズ差分
  value           // 値
);
tx = facade.createEmbeddedTransactionFromTypedDescriptor(
  descriptor,       // トランザクション Descriptor 設定
  alice.publicKey,  // 署名者公開鍵
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
  alice.publicKey,      // 署名者公開鍵
  100,                  // 手数料乗数
  60 * 60 * 2,          // Deadline:有効期限(秒単位)
  1                     // 連署者数
);

// 作成者による署名
sig = alice.signTransaction(aggregateTx);
jsonPayload = facade.transactionFactory.static.attachSignature(aggregateTx, sig);

// 記録先アカウントによる連署
coSig = bob.cosignTransaction(aggregateTx, false);
aggregateTx.cosignatures.push(coSig);

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

// ---------- 7.2 モザイクに登録 ----------
export const mosV2 = r`mosaicId = new sym.MosaicId("1275B0B7511D9161");
mosaicInfo = await mosaicRepo.getMosaic(mosaicId).toPromise();

key = sym.KeyGenerator.generateUInt64Key('key_mosaic');
value = 'test';

tx = await metaService.createMosaicMetadataTransaction(
  undefined,
  networkType,
  mosaicInfo.ownerAddress, //モザイク作成者アドレス
  mosaicId,
  key,value, //Key-Value値
  alice.address
).toPromise();

aggregateTx = sym.AggregateTransaction.createComplete(
    sym.Deadline.create(epochAdjustment),
    [tx.toAggregate(alice.publicAccount)],
    networkType,[]
).setMaxFeeForAggregate(100, 0);

signedTx = alice.sign(aggregateTx,generationHash);
await txRepo.announce(signedTx).toPromise();`;
export const mosV3 = r`// ターゲットと作成者アドレスの設定
targetMosaic = 0x1275B0B7511D9161n;  // メタデータ記録先モザイク
mosaicInfo = await fetch(
new URL('/mosaics/' + targetMosaic.toString(16).toUpperCase(), NODE),
  {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  }
)
.then((res) => res.json())
.then((json) => {
  return json;
});
targetAddress = new sdkSymbol.Address(sdkCore.utils.hexToUint8(mosaicInfo.mosaic.ownerAddress));  // モザイク作成者アドレス

// キーと値の設定
key = sdkSymbol.metadataGenerateKey("key_mosaic");
value = new TextEncoder().encode("test");

// 同じキーのメタデータが登録されているか確認
query = new URLSearchParams({
  "targetId": targetMosaic.toString(16).toUpperCase(),
  "sourceAddress": targetAddress.toString(),
  "scopedMetadataKey": key.toString(16).toUpperCase(),
  "metadataType": 1
});
metadataInfo = await fetch(
  new URL('/metadata?' + query.toString(), NODE),
  {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  }
)
.then((res) => res.json())
.then((json) => {
  return json.data;
});
// 登録済の場合は差分データを作成する
sizeDelta = value.length;
if (metadataInfo.length > 0) {
  sizeDelta -= metadataInfo[0].metadataEntry.valueSize;
  value = sdkSymbol.metadataUpdateValue(sdkCore.utils.hexToUint8(metadataInfo[0].metadataEntry.value), value);
}

// モザイクメタデータ登録Tx作成
descriptor = new sdkSymbol.descriptors.MosaicMetadataTransactionV1Descriptor(  // Txタイプ:モザイクメタデータ登録Tx
  targetAddress,  // ターゲットアドレス
  key,            // キー
  new sdkSymbol.models.UnresolvedMosaicId(targetMosaic),  // メタデータ記録先モザイク
  sizeDelta,      // サイズ差分
  value           // 値
);
tx = facade.createEmbeddedTransactionFromTypedDescriptor(
  descriptor,       // トランザクション Descriptor 設定
  alice.publicKey,  // 署名者公開鍵
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
  alice.publicKey,      // 署名者公開鍵
  100,                  // 手数料乗数
  60 * 60 * 2,          // Deadline:有効期限(秒単位)
  0                     // 連署者数
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

// ---------- 7.3 ネームスペースに登録 ----------
export const nsV2 = r`nsRepo = repo.createNamespaceRepository();
namespaceId = new sym.NamespaceId("xembook");
namespaceInfo = await nsRepo.getNamespace(namespaceId).toPromise();

key = sym.KeyGenerator.generateUInt64Key('key_namespace');
value = 'test';

tx = await metaService.createNamespaceMetadataTransaction(
    undefined,networkType,
    namespaceInfo.ownerAddress, //ネームスペースの作成者アドレス
    namespaceId,
    key,value, //Key-Value値
    alice.address //メタデータの登録者
).toPromise();

aggregateTx = sym.AggregateTransaction.createComplete(
    sym.Deadline.create(epochAdjustment),
    [tx.toAggregate(alice.publicAccount)],
    networkType,[]
).setMaxFeeForAggregate(100, 0);

signedTx = alice.sign(aggregateTx,generationHash);
await txRepo.announce(signedTx).toPromise();`;
export const nsV3 = r`// ターゲットと作成者アドレスの設定
namespaceIds = sdkSymbol.generateNamespacePath("xembook");  // メタデータ記録先ネームスペース
targetNamespace = namespaceIds[namespaceIds.length - 1];
namespaceInfo = await fetch(
  new URL('/namespaces/' + targetNamespace.toString(16).toUpperCase(), NODE),
  {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  }
)
.then((res) => res.json())
.then((json) => {
  return json;
});
targetAddress = new sdkSymbol.Address(sdkCore.utils.hexToUint8(namespaceInfo.namespace.ownerAddress));  // ネームスペース作成者アドレス

// キーと値の設定
key = sdkSymbol.metadataGenerateKey("key_namespace");
value = new TextEncoder().encode("test");

// 同じキーのメタデータが登録されているか確認
query = new URLSearchParams({
  "targetId": targetNamespace.toString(16).toUpperCase(),
  "sourceAddress": targetAddress.toString(),
  "scopedMetadataKey": key.toString(16).toUpperCase(),
  "metadataType": 2
});
metadataInfo = await fetch(
  new URL('/metadata?' + query.toString(), NODE),
  {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  }
)
.then((res) => res.json())
.then((json) => {
  return json.data;
});
// 登録済の場合は差分データを作成する
sizeDelta = value.length;
if (metadataInfo.length > 0) {
  sizeDelta -= metadataInfo[0].metadataEntry.valueSize;
  value = sdkSymbol.metadataUpdateValue(sdkCore.utils.hexToUint8(metadataInfo[0].metadataEntry.value), value);
}

// ネームスペースメタデータ登録Tx作成
descriptor = new sdkSymbol.descriptors.NamespaceMetadataTransactionV1Descriptor(  // Txタイプ:ネームスペースメタデータ登録Tx
  targetAddress,  // ターゲットアドレス
  key,            // キー
  new sdkSymbol.models.NamespaceId(targetNamespace),   // メタデータ記録先ネームスペース
  sizeDelta,      // サイズ差分
  value           // 値
);
tx = facade.createEmbeddedTransactionFromTypedDescriptor(
  descriptor,       // トランザクション Descriptor 設定
  alice.publicKey,  // 署名者公開鍵
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
  alice.publicKey,      // 署名者公開鍵
  100,                  // 手数料乗数
  60 * 60 * 2,          // Deadline:有効期限(秒単位)
  0                     // 連署者数
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

// ---------- 7.4 確認 ----------
export const listV2 = r`res = await metaRepo.search({
  targetAddress:alice.address,
  sourceAddress:alice.address}
).toPromise();
console.log(res);`;
export const listV2Out = r`data: Array(3)
  0: Metadata
    id: "62471DD2BF42F221DFD309D9"
    metadataEntry: MetadataEntry
      compositeHash: "617B0F9208753A1080F93C1CEE1A35ED740603CE7CFC21FBAE3859B7707A9063"
      metadataType: 0
      scopedMetadataKey: UInt64 {lower: 92350423, higher: 2540877595}
      sourceAddress: Address {address: 'TBIL6D6RURP45YQRWV6Q7YVWIIPLQGLZQFHWFEQ', networkType: 152}
      targetAddress: Address {address: 'TBIL6D6RURP45YQRWV6Q7YVWIIPLQGLZQFHWFEQ', networkType: 152}
      targetId: undefined
      value: "test"
  1: Metadata
    id: "62471F87BF42F221DFD30CC8"
    metadataEntry: MetadataEntry
      compositeHash: "D9E2019D7BD5BA58245320392A68B51752E35A35DA349B08E141DCE99AC3655A"
      metadataType: 1
      scopedMetadataKey: UInt64 {lower: 1789141730, higher: 3475078673}
      sourceAddress: Address {address: 'TBIL6D6RURP45YQRWV6Q7YVWIIPLQGLZQFHWFEQ', networkType: 152}
      targetAddress: Address {address: 'TBIL6D6RURP45YQRWV6Q7YVWIIPLQGLZQFHWFEQ', networkType: 152}
      targetId: MosaicId
      id: Id {lower: 1360892257, higher: 309702839}
      value: "test"
  2: Metadata
    id: "62616372BF42F221DF00A88C"
    metadataEntry: MetadataEntry
      compositeHash: "D8E597C7B491BF7F9990367C1798B5C993E1D893222F6FC199F98915339D92D5"
      metadataType: 2
      scopedMetadataKey: UInt64 {lower: 141807833, higher: 2339015223}
      sourceAddress: Address {address: 'TBIL6D6RURP45YQRWV6Q7YVWIIPLQGLZQFHWFEQ', networkType: 152}
      targetAddress: Address {address: 'TBIL6D6RURP45YQRWV6Q7YVWIIPLQGLZQFHWFEQ', networkType: 152}
      targetId: NamespaceId
      id: Id {lower: 646738821, higher: 2754876907}
      value: "test"`;
export const listV3 = r`query = new URLSearchParams({
  "targetAddress": alice.address,
  "sourceAddress": alice.address,
});
res = await fetch(
  new URL('/metadata?' + query.toString(), NODE),
  {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  }
)
.then((res) => res.json())
.then((json) => {
  return json;
});
console.log(res);`;
export const listV3Out = r`> {data: Array(3), pagination: {…}}
  data: Array(3)
  > 0:
      id: "64B918B76FFE587B6D3625C9"
    > metadataEntry:
        compositeHash: "D2C53CF2F4601F9BD367C2BB4B15CD250D6E21EF59BE99B9D368C25B8A0CF1E1"
        metadataType: 0
        scopedMetadataKey: "9772B71B058127D7"
        sourceAddress: "982B2AA2295B5C23528ADDEE7F29F6521944E9F2340428AB"
        targetAddress: "982B2AA2295B5C23528ADDEE7F29F6521944E9F2340428AB"
        targetId: "0000000000000000"
        value: "74657374"
        valueSize: 4
        version: 1
  > 1:
      id: "64B9191C6FFE587B6D36266A"
    > metadataEntry:
        compositeHash: "6B95280F23224CA0A8D02C586C8E0E5043DC339EA6F3EC9EB3CBEBB12D8C5971"
        metadataType: 1
        scopedMetadataKey: "CF217E116AA422E2"
        sourceAddress: "982B2AA2295B5C23528ADDEE7F29F6521944E9F2340428AB"
        targetAddress: "982B2AA2295B5C23528ADDEE7F29F6521944E9F2340428AB"
        targetId: "3D86CF283C1C547D"
        value: "74657374"
        valueSize: 4
        version: 1
  > 2:
      id: "64B919576FFE587B6D3626D5"
    > metadataEntry:
        compositeHash: "C92EF86FA799EF32364164584BCFB66A0A874C70C7A8495FA869A8C2E936B99A"
        metadataType: 2
        scopedMetadataKey: "8B6A8A370873D0D9"
        sourceAddress: "982B2AA2295B5C23528ADDEE7F29F6521944E9F2340428AB"
        targetAddress: "982B2AA2295B5C23528ADDEE7F29F6521944E9F2340428AB"
        targetId: "D9D35A75833F4C53"
        value: "74657374"
        valueSize: 4
        version: 1`;
export const mdTypesOut = r`sym.MetadataType
{0: 'Account', 1: 'Mosaic', 2: 'Namespace'}`;
