// 速習Symbol 演習編 のサンプルコード（解答例と答え合わせ用コード）。
// この章のオリジナルで、第3〜13章で学んだコードを組み合わせて作っている。
// コンソールでそのまま実行できるよう、const 宣言は付けていない（ch02〜ch13 と同じ方針）。
const r = String.raw;

// ---------- 演習の準備 ----------
export const prepV2 = r`// 少し待つための関数
sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// トランザクションが承認されるまで待って、承認済みトランザクションを返す（最大 約2分）
waitConfirmed = async (hash) => {
  for (let i = 0; i < 24; i++) {
    try {
      return await txRepo.getTransaction(hash, sym.TransactionGroup.Confirmed).toPromise();
    } catch (e) {
      await sleep(5000);
    }
  }
  throw new Error('承認されませんでした（hash: ' + hash + '）');
};

// 署名待ちのアグリゲートボンデッドトランザクションがノードに届くまで待つ（最大 約2分）
waitPartial = async (hash) => {
  for (let i = 0; i < 24; i++) {
    try {
      return await txRepo.getTransaction(hash, sym.TransactionGroup.Partial).toPromise();
    } catch (e) {
      await sleep(5000);
    }
  }
  throw new Error('署名待ちになりませんでした（hash: ' + hash + '）');
};

// アカウントが持つモザイクの量を文字列で返す（idHex はモザイクIDの16進数）
getAmount = async (account, idHex) => {
  accountRepo = repo.createAccountRepository();
  const info = await accountRepo.getAccountInfo(account.address).toPromise();
  const m = info.mosaics.find((x) => x.id.toHex() === idHex);
  return m ? m.amount.toString() : '0';
};
console.log('ready');`;
export const prepV3 = r`// 少し待つための関数
sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// パスにGETして、成功するまで待つ（最大 約2分）
waitGet = async (path) => {
  for (let i = 0; i < 24; i++) {
    const res = await fetch(new URL(path, NODE));
    if (res.ok) return await res.json();
    await sleep(5000);
  }
  throw new Error('見つかりませんでした（' + path + '）');
};

// トランザクションが承認されるまで待って、承認済みトランザクションを返す
waitConfirmed = (hash) => waitGet('/transactions/confirmed/' + hash);

// 署名待ちのアグリゲートボンデッドトランザクションがノードに届くまで待つ
waitPartial = (hash) => waitGet('/transactions/partial/' + hash);

// アカウントが持つモザイクの量を文字列で返す（idHex はモザイクIDの16進数）
getAmount = async (account, idHex) => {
  const info = await fetch(new URL('/accounts/' + account.address.toString(), NODE)).then((res) => res.json());
  const m = info.account.mosaics.find((x) => x.id === idHex);
  return m ? m.amount : '0';
};
console.log('ready');`;

// ---------- 演習1 暗号メッセージの往復 ----------
export const ex1V2a = r`// ① Bob を作り、Alice から Bob へ暗号化メッセージを送る
bob = sym.Account.generateNewAccount(networkType);
secretText = 'ひみつの合言葉';
encryptedMessage = alice.encryptMessage(secretText, bob.publicAccount);

tx = sym.TransferTransaction.create(
  sym.Deadline.create(epochAdjustment),
  bob.address,
  [],
  encryptedMessage,
  networkType
).setMaxFee(100);

// 署名とアナウンス
signedTx = alice.sign(tx, generationHash);
await txRepo.announce(signedTx).toPromise();
hash = signedTx.hash;
console.log(hash);`;
export const ex1V2b = r`// ② 承認されたトランザクションを取得し、Bob の秘密鍵で復号する
txInfo = await waitConfirmed(hash);
decrypted = bob.decryptMessage(txInfo.message, alice.publicAccount).payload;
console.log(decrypted);`;
export const ex1V3a = r`// ① Bob を作り、Alice から Bob へ暗号化メッセージを送る
bob = facade.createAccount(sdkCore.PrivateKey.random());
secretText = 'ひみつの合言葉';
encryptedMessage = alice.messageEncoder().encode(bob.publicKey, new TextEncoder().encode(secretText));

// トランザクション Descriptor 設定
descriptor = new sdkSymbol.descriptors.TransferTransactionV1Descriptor(  // Txタイプ:転送Tx
  bob.address,      // 受取アドレス
  [],               // 送信モザイク
  encryptedMessage  // 暗号化メッセージ
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
hash = facade.hashTransaction(tx).toString();
console.log(hash);`;
export const ex1V3b = r`// ② 承認されたトランザクションを取得し、Bob の秘密鍵で復号する
txInfo = await waitConfirmed(hash);
decoded = bob.messageEncoder().tryDecode(alice.publicKey, Buffer.from(txInfo.transaction.message, 'hex'));
decrypted = decoded.isDecoded ? new TextDecoder().decode(decoded.message) : '(復号できませんでした)';
console.log(decrypted);`;
export const ex1Check = r`console.log(decrypted === secretText ? '✅ 一致しました。暗号化と復号に成功です' : '❌ 一致しません: ' + decrypted);`;

// ---------- 演習2 自分だけのポイントを発行して配る ----------
export const ex2V2a = r`// ① Bob・Carol を作り、モザイクを定義して 100 枚発行する（アグリゲートTx）
bob = sym.Account.generateNewAccount(networkType);
carol = sym.Account.generateNewAccount(networkType);

nonce = sym.MosaicNonce.createRandom();
mosaicDefTx = sym.MosaicDefinitionTransaction.create(
  undefined,
  nonce,
  sym.MosaicId.createFromNonce(nonce, alice.address), //モザイクID
  sym.MosaicFlags.create(true, false, true, true),    //供給量変更:可 / 譲渡:不可 / 制限:可 / 回収:可
  0,                      //divisibility:可分性（小数なし）
  sym.UInt64.fromUint(0), //duration:有効期限
  networkType
);
mosaicChangeTx = sym.MosaicSupplyChangeTransaction.create(
  undefined,
  mosaicDefTx.mosaicId,
  sym.MosaicSupplyChangeAction.Increase,
  sym.UInt64.fromUint(100), //数量
  networkType
);
aggregateTx = sym.AggregateTransaction.createComplete(
  sym.Deadline.create(epochAdjustment),
  [
    mosaicDefTx.toAggregate(alice.publicAccount),
    mosaicChangeTx.toAggregate(alice.publicAccount),
  ],
  networkType, []
).setMaxFeeForAggregate(100, 0);

signedTx = alice.sign(aggregateTx, generationHash);
await txRepo.announce(signedTx).toPromise();
hash = signedTx.hash;
mosaicIdHex = mosaicDefTx.mosaicId.toHex();
console.log(hash);
console.log(mosaicIdHex);`;
export const ex2V2b = r`// ② 承認を待ってから、Bob に 10 枚・Carol に 5 枚を同時に配る
await waitConfirmed(hash);

tx1 = sym.TransferTransaction.create(
  undefined,
  bob.address,
  [new sym.Mosaic(mosaicDefTx.mosaicId, sym.UInt64.fromUint(10))],
  sym.EmptyMessage,
  networkType
);
tx2 = sym.TransferTransaction.create(
  undefined,
  carol.address,
  [new sym.Mosaic(mosaicDefTx.mosaicId, sym.UInt64.fromUint(5))],
  sym.EmptyMessage,
  networkType
);
aggregateTx = sym.AggregateTransaction.createComplete(
  sym.Deadline.create(epochAdjustment),
  [
    tx1.toAggregate(alice.publicAccount),
    tx2.toAggregate(alice.publicAccount),
  ],
  networkType, []
).setMaxFeeForAggregate(100, 0);

signedTx = alice.sign(aggregateTx, generationHash);
await txRepo.announce(signedTx).toPromise();
hash = signedTx.hash;
console.log(hash);`;
export const ex2V3a = r`// ① Bob・Carol を作り、モザイクを定義して 100 枚発行する（アグリゲートTx）
bob = facade.createAccount(sdkCore.PrivateKey.random());
carol = facade.createAccount(sdkCore.PrivateKey.random());

// モザイクフラグ設定（供給量変更:可 / 譲渡:不可 / 制限:可 / 回収:可）
f = sdkSymbol.models.MosaicFlags.NONE.value;
f += sdkSymbol.models.MosaicFlags.SUPPLY_MUTABLE.value; // 供給量変更の可否
f += sdkSymbol.models.MosaicFlags.RESTRICTABLE.value;   // 制限設定の可否
f += sdkSymbol.models.MosaicFlags.REVOKABLE.value;      // 発行者からの還収可否
flags = new sdkSymbol.models.MosaicFlags(f);

// ナンス設定
array = new Uint8Array(sdkSymbol.models.MosaicNonce.SIZE);
crypto.getRandomValues(array);
nonce = sdkSymbol.models.MosaicNonce.deserialize(array);

// モザイク定義
mosaicDefDescriptor = new sdkSymbol.descriptors.MosaicDefinitionTransactionV1Descriptor(  // Txタイプ:モザイク定義Tx
  new sdkSymbol.models.MosaicId(sdkSymbol.generateMosaicId(alice.address, nonce.value)),  // モザイクID
  new sdkSymbol.models.BlockDuration(0n), // duration:有効期限
  nonce,  // ナンス
  flags,  // モザイクフラグ
  0       // divisibility:可分性（小数なし）
);
mosaicDefTx = facade.createEmbeddedTransactionFromTypedDescriptor(
  mosaicDefDescriptor,  // トランザクション Descriptor 設定
  alice.publicKey,      // 署名者公開鍵
);

// モザイク変更（100 枚発行）
mosaicChangeDescriptor = new sdkSymbol.descriptors.MosaicSupplyChangeTransactionV1Descriptor( // Txタイプ:モザイク変更Tx
  new sdkSymbol.models.UnresolvedMosaicId(mosaicDefTx.id.value),  // モザイクID
  new sdkSymbol.models.Amount(100n),                  // 数量
  sdkSymbol.models.MosaicSupplyChangeAction.INCREASE  // アクション
);
mosaicChangeTx = facade.createEmbeddedTransactionFromTypedDescriptor(
  mosaicChangeDescriptor, // トランザクション Descriptor 設定
  alice.publicKey,        // 署名者公開鍵
);

// アグリゲートTx作成
embeddedTransactions = [
  mosaicDefTx,
  mosaicChangeTx
];
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
});
hash = facade.hashTransaction(aggregateTx).toString();
mosaicIdHex = mosaicDefTx.id.value.toString(16).toUpperCase().padStart(16, '0');
console.log(hash);
console.log(mosaicIdHex);`;
export const ex2V3b = r`// ② 承認を待ってから、Bob に 10 枚・Carol に 5 枚を同時に配る
await waitConfirmed(hash);

descriptor1 = new sdkSymbol.descriptors.TransferTransactionV1Descriptor(  // Txタイプ:転送Tx
  bob.address,      // Bobへの送信
  [
    new sdkSymbol.descriptors.UnresolvedMosaicDescriptor(
      new sdkSymbol.models.UnresolvedMosaicId(mosaicDefTx.id.value),
      new sdkSymbol.models.Amount(10n)
    )
  ],
  new Uint8Array()  // メッセージ無し
);
tx1 = facade.createEmbeddedTransactionFromTypedDescriptor(
  descriptor1,      // トランザクション Descriptor 設定
  alice.publicKey   // Aliceから
);

descriptor2 = new sdkSymbol.descriptors.TransferTransactionV1Descriptor(  // Txタイプ:転送Tx
  carol.address,    // Carolへの送信
  [
    new sdkSymbol.descriptors.UnresolvedMosaicDescriptor(
      new sdkSymbol.models.UnresolvedMosaicId(mosaicDefTx.id.value),
      new sdkSymbol.models.Amount(5n)
    )
  ],
  new Uint8Array()  // メッセージ無し
);
tx2 = facade.createEmbeddedTransactionFromTypedDescriptor(
  descriptor2,      // トランザクション Descriptor 設定
  alice.publicKey   // Aliceから
);

embeddedTransactions = [
  tx1,
  tx2
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
});
hash = facade.hashTransaction(aggregateTx).toString();
console.log(hash);`;
export const ex2Check = r`// ③ 承認を待ってから、Bob と Carol の所有量を確認する
await waitConfirmed(hash);
bobAmount = await getAmount(bob, mosaicIdHex);
carolAmount = await getAmount(carol, mosaicIdHex);
console.log('Bob:', bobAmount, ' Carol:', carolAmount);
console.log(bobAmount === '10' && carolAmount === '5' ? '✅ 配布できました' : '❌ 数量を確認してください');`;

// ---------- 演習3 名前で呼べるポイント ----------
export const ex3V2 = r`// ルートネームスペース名は、第6章で取得したご自身のものに置き換えてください
rootName = 'xembook';
subName = 'point';
bobBefore = await getAmount(bob, mosaicIdHex); // 送る前の Bob の所有量

// ① サブネームスペース <rootName>.point を作成する
subNamespaceTx = sym.NamespaceRegistrationTransaction.createSubNamespace(
  sym.Deadline.create(epochAdjustment),
  subName,   //作成するサブネームスペース
  rootName,  //紐づけたいルートネームスペース
  networkType,
).setMaxFee(100);
signedTx = alice.sign(subNamespaceTx, generationHash);
await txRepo.announce(signedTx).toPromise();
await waitConfirmed(signedTx.hash);

// ② 演習2のモザイクにエイリアスをリンクする
namespaceId = new sym.NamespaceId(rootName + '.' + subName);
aliasTx = sym.AliasTransaction.createForMosaic(
  sym.Deadline.create(epochAdjustment),
  sym.AliasAction.Link,
  namespaceId,
  mosaicDefTx.mosaicId,
  networkType
).setMaxFee(100);
signedTx = alice.sign(aliasTx, generationHash);
await txRepo.announce(signedTx).toPromise();
await waitConfirmed(signedTx.hash);

// ③ エイリアス名（未解決モザイク）を指定して、Bob に 1 枚送る
tx = sym.TransferTransaction.create(
  sym.Deadline.create(epochAdjustment),
  bob.address,
  [
    new sym.Mosaic(
      namespaceId,  //UnresolvedMosaic:未解決モザイク
      sym.UInt64.fromUint(1)
    )
  ],
  sym.EmptyMessage,
  networkType
).setMaxFee(100);
signedTx = alice.sign(tx, generationHash);
await txRepo.announce(signedTx).toPromise();
hash = signedTx.hash;
console.log(hash);`;
export const ex3V3 = r`// ルートネームスペース名は、第6章で取得したご自身のものに置き換えてください
rootName = 'xembook';
subName = 'point';
bobBefore = await getAmount(bob, mosaicIdHex); // 送る前の Bob の所有量

// ① サブネームスペース <rootName>.point を作成する
parentNameId = sdkSymbol.generateNamespaceId(rootName); // 紐づけたいルートネームスペース
subNamespaceDescriptor = new sdkSymbol.descriptors.NamespaceRegistrationTransactionV1Descriptor(  // Txタイプ:ネームスペース登録Tx
  new sdkSymbol.models.NamespaceId(sdkSymbol.generateNamespaceId(subName, parentNameId)),         // ネームスペースID
  sdkSymbol.models.NamespaceRegistrationType.CHILD,   // 登録タイプ : サブネームスペース
  undefined,                                          // duration:レンタル期間 (サブの場合は省略可)
  parentNameId,                                       // 親ネームスペースID
  subName                                             // ネームスペース
);
subNamespaceTx = facade.createTransactionFromTypedDescriptor(
  subNamespaceDescriptor, // トランザクション Descriptor 設定
  alice.publicKey,        // 署名者公開鍵
  100,                    // 手数料乗数
  60 * 60 * 2             // Deadline:有効期限(秒単位)
);
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
});
await waitConfirmed(facade.hashTransaction(subNamespaceTx).toString());

// ② 演習2のモザイクにエイリアスをリンクする
namespaceIds = sdkSymbol.generateNamespacePath(rootName + '.' + subName);
nsIdValue = namespaceIds[namespaceIds.length - 1];
namespaceId = new sdkSymbol.models.NamespaceId(nsIdValue);
descriptor = new sdkSymbol.descriptors.MosaicAliasTransactionV1Descriptor(  // Txタイプ:モザイクエイリアスTx
  namespaceId,      // ネームスペースID
  mosaicDefTx.id,   // リンク先モザイク
  sdkSymbol.models.AliasAction.LINK
);
tx = facade.createTransactionFromTypedDescriptor(
  descriptor,       // トランザクション Descriptor 設定
  alice.publicKey,  // 署名者公開鍵
  100,              // 手数料乗数
  60 * 60 * 2       // Deadline:有効期限(秒単位)
);
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
});
await waitConfirmed(facade.hashTransaction(tx).toString());

// ③ エイリアス名（未解決モザイク）を指定して、Bob に 1 枚送る
descriptor = new sdkSymbol.descriptors.TransferTransactionV1Descriptor(  // Txタイプ:転送Tx
  bob.address,      // 受取アドレス
  [
    new sdkSymbol.descriptors.UnresolvedMosaicDescriptor(
      new sdkSymbol.models.UnresolvedMosaicId(nsIdValue), // UnresolvedMosaic:未解決モザイク
      new sdkSymbol.models.Amount(1n)                     // 送信量
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
});
hash = facade.hashTransaction(tx).toString();
console.log(hash);`;
export const ex3CheckV2 = r`// 承認を待ってから、エイリアスの状態と Bob の所有量を確認する
await waitConfirmed(hash);
nsRepo = repo.createNamespaceRepository();
nsInfo = await nsRepo.getNamespace(namespaceId).toPromise();
console.log(nsInfo.alias);
bobAmount = await getAmount(bob, mosaicIdHex);
console.log('Bob:', bobBefore, '→', bobAmount);
console.log(nsInfo.alias.type === sym.AliasType.Mosaic && nsInfo.alias.mosaicId.toHex() === mosaicIdHex && BigInt(bobAmount) === BigInt(bobBefore) + 1n ? '✅ 名前で送れました' : '❌ リンクと数量を確認してください');`;
export const ex3CheckV3 = r`// 承認を待ってから、エイリアスの状態と Bob の所有量を確認する
await waitConfirmed(hash);
nsInfo = await fetch(new URL('/namespaces/' + nsIdValue.toString(16).toUpperCase(), NODE)).then((res) => res.json());
console.log(nsInfo.namespace.alias);
bobAmount = await getAmount(bob, mosaicIdHex);
console.log('Bob:', bobBefore, '→', bobAmount);
console.log(nsInfo.namespace.alias.type === 1 && nsInfo.namespace.alias.mosaicId === mosaicIdHex && BigInt(bobAmount) === BigInt(bobBefore) + 1n ? '✅ 名前で送れました' : '❌ リンクと数量を確認してください');`;

// ---------- 演習4 自己紹介カードをメタデータに ----------
export const ex4V2 = r`metaRepo = repo.createMetadataRepository();
metaService = new sym.MetadataTransactionService(metaRepo);
key = sym.KeyGenerator.generateUInt64Key('profile_card');

// カード（JSON）をアカウントメタデータに登録する。登録済みなら更新になる
writeCard = async (card) => {
  const tx = await metaService.createAccountMetadataTransaction(
    undefined,
    networkType,
    alice.address, //メタデータ記録先アドレス
    key, JSON.stringify(card), //Key-Value値
    alice.address //メタデータ作成者アドレス
  ).toPromise();

  const aggregateTx = sym.AggregateTransaction.createComplete(
    sym.Deadline.create(epochAdjustment),
    [tx.toAggregate(alice.publicAccount)],
    networkType, []
  ).setMaxFeeForAggregate(100, 0);

  const signedTx = alice.sign(aggregateTx, generationHash);
  await txRepo.announce(signedTx).toPromise();
  return signedTx.hash;
};

// ノードからメタデータを取得して、JSON に戻す
readCard = async () => {
  const res = await metaRepo.search({
    targetAddress: alice.address,
    sourceAddress: alice.address,
    scopedMetadataKey: key.toHex()
  }).toPromise();
  return JSON.parse(res.data[0].metadataEntry.value);
};

// 登録 → 確認 → 更新 → 確認
await waitConfirmed(await writeCard({ name: 'Alice', level: 1 }));
card1 = await readCard();
console.log(card1);

await waitConfirmed(await writeCard({ name: 'Alice', level: 2 }));
card2 = await readCard();
console.log(card2);`;
export const ex4V3 = r`key = sdkSymbol.metadataGenerateKey('profile_card');

// カード（JSON）をアカウントメタデータに登録する。登録済みなら差分を作って更新になる
writeCard = async (card) => {
  const targetAddress = alice.address;  // メタデータ記録先アドレス
  const sourceAddress = alice.address;  // メタデータ作成者アドレス
  let value = new TextEncoder().encode(JSON.stringify(card));

  // 同じキーのメタデータが登録されているか確認
  const query = new URLSearchParams({
    "targetAddress": targetAddress.toString(),
    "sourceAddress": sourceAddress.toString(),
    "scopedMetadataKey": key.toString(16).toUpperCase(),
    "metadataType": 0
  });
  const metadataInfo = await fetch(
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
  let sizeDelta = value.length;
  if (metadataInfo.length > 0) {
    sizeDelta -= metadataInfo[0].metadataEntry.valueSize;
    value = sdkSymbol.metadataUpdateValue(sdkCore.utils.hexToUint8(metadataInfo[0].metadataEntry.value), value);
  }

  // アカウントメタデータ登録Tx作成
  const descriptor = new sdkSymbol.descriptors.AccountMetadataTransactionV1Descriptor(  // Txタイプ:アカウントメタデータ登録Tx
    targetAddress,  // ターゲットアドレス
    key,            // キー
    sizeDelta,      // サイズ差分
    value           // 値
  );
  const metadataTx = facade.createEmbeddedTransactionFromTypedDescriptor(
    descriptor,       // トランザクション Descriptor 設定
    alice.publicKey,  // 署名者公開鍵
  );
  const embeddedTransactions = [
    metadataTx
  ];

  // アグリゲートTx作成
  const aggregateDescriptor = new sdkSymbol.descriptors.AggregateCompleteTransactionV3Descriptor(
    facade.static.hashEmbeddedTransactions(embeddedTransactions),
    embeddedTransactions
  );
  const aggregateTx = facade.createTransactionFromTypedDescriptor(
    aggregateDescriptor,  // トランザクション Descriptor 設定
    alice.publicKey,      // 署名者公開鍵
    100,                  // 手数料乗数
    60 * 60 * 2,          // Deadline:有効期限(秒単位)
    0                     // 連署者数
  );

  // 署名とアナウンス
  const sig = alice.signTransaction(aggregateTx);
  const payload = facade.transactionFactory.static.attachSignature(aggregateTx, sig);
  await fetch(
    new URL('/transactions', NODE),
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
    }
  )
  .then((res) => res.json());
  return facade.hashTransaction(aggregateTx).toString();
};

// ノードからメタデータを取得して、JSON に戻す
readCard = async () => {
  const query = new URLSearchParams({
    "targetAddress": alice.address.toString(),
    "sourceAddress": alice.address.toString(),
    "scopedMetadataKey": key.toString(16).toUpperCase(),
    "metadataType": 0
  });
  const data = await fetch(new URL('/metadata?' + query.toString(), NODE))
    .then((res) => res.json())
    .then((json) => json.data);
  return JSON.parse(new TextDecoder().decode(sdkCore.utils.hexToUint8(data[0].metadataEntry.value)));
};

// 登録 → 確認 → 更新 → 確認
await waitConfirmed(await writeCard({ name: 'Alice', level: 1 }));
card1 = await readCard();
console.log(card1);

await waitConfirmed(await writeCard({ name: 'Alice', level: 2 }));
card2 = await readCard();
console.log(card2);`;
export const ex4Check = r`console.log(card1.level === 1 && card2.level === 2 ? '✅ 登録と更新に成功です' : '❌ level の値を確認してください: ' + card1.level + ' → ' + card2.level);`;

// ---------- 演習5 ポイント交換所 ----------
export const ex5V2 = r`// ① アグリゲートボンデッドTxを作る（Alice → Bob: 1XYM ／ Bob → Alice: 5ポイント）
bobPointBefore = await getAmount(bob, mosaicIdHex);     // 交換前の Bob のポイント
alicePointBefore = await getAmount(alice, mosaicIdHex); // 交換前の Alice のポイント

tx1 = sym.TransferTransaction.create(
  undefined,
  bob.address,  //Bobへの送信
  [
    new sym.Mosaic(
      new sym.NamespaceId("symbol.xym"),
      sym.UInt64.fromUint(1000000) //1XYM
    )
  ],
  sym.EmptyMessage,
  networkType
);
tx2 = sym.TransferTransaction.create(
  undefined,
  alice.address,  //Aliceへの送信
  [
    new sym.Mosaic(
      mosaicDefTx.mosaicId, //演習2のポイント
      sym.UInt64.fromUint(5)
    )
  ],
  sym.EmptyMessage,
  networkType
);
aggregateTx = sym.AggregateTransaction.createBonded(
  sym.Deadline.create(epochAdjustment),
  [
    tx1.toAggregate(alice.publicAccount), //Aliceからの送信
    tx2.toAggregate(bob.publicAccount),   //Bobからの送信
  ],
  networkType,
  [],
).setMaxFeeForAggregate(100, 1);
signedAggregateTx = alice.sign(aggregateTx, generationHash);
aggHash = signedAggregateTx.hash;

// ② ハッシュロック（10XYM）を Alice が払い、承認を待つ
hashLockTx = sym.HashLockTransaction.create(
  sym.Deadline.create(epochAdjustment),
  new sym.Mosaic(new sym.NamespaceId("symbol.xym"), sym.UInt64.fromUint(10 * 1000000)),
  sym.UInt64.fromUint(480), // ロック有効期限
  signedAggregateTx,        // このハッシュ値を登録
  networkType
).setMaxFee(100);
signedLockTx = alice.sign(hashLockTx, generationHash);
await txRepo.announce(signedLockTx).toPromise();
await waitConfirmed(signedLockTx.hash);

// ③ ボンデッドTxをアナウンスし、署名待ちになるのを待つ
await txRepo.announceAggregateBonded(signedAggregateTx).toPromise();
txInfo = await waitPartial(aggHash);

// ④ Bob が連署する（Bob は XYM を持っていなくてもよい）
cosignatureTx = sym.CosignatureTransaction.create(txInfo);
signedCosTx = bob.signCosignatureTransaction(cosignatureTx);
await txRepo.announceAggregateBondedCosignature(signedCosTx).toPromise();

await waitConfirmed(aggHash);
console.log(aggHash);`;
export const ex5V3 = r`// ① アグリゲートボンデッドTxを作る（Alice → Bob: 1XYM ／ Bob → Alice: 5ポイント）
bobPointBefore = await getAmount(bob, mosaicIdHex);     // 交換前の Bob のポイント
alicePointBefore = await getAmount(alice, mosaicIdHex); // 交換前の Alice のポイント

namespaceIds = sdkSymbol.generateNamespacePath("symbol.xym");
namespaceId = namespaceIds[namespaceIds.length - 1];

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
  [
    // 演習2のポイント 5 枚
    new sdkSymbol.descriptors.UnresolvedMosaicDescriptor(
      new sdkSymbol.models.UnresolvedMosaicId(mosaicDefTx.id.value),
      new sdkSymbol.models.Amount(5n)
    )
  ],
  new Uint8Array()  // メッセージ無し
);
tx2 = facade.createEmbeddedTransactionFromTypedDescriptor(
  descriptor2,      // トランザクション Descriptor 設定
  bob.publicKey     // Bobから
);

embeddedTransactions = [
  tx1,
  tx2
];

// アグリゲートボンデッドTx作成
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
sig = alice.signTransaction(aggregateTx);
jsonPayload = facade.transactionFactory.static.attachSignature(aggregateTx, sig);
aggHash = facade.hashTransaction(aggregateTx).toString();

// ② ハッシュロック（10XYM）を Alice が払い、承認を待つ
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
hashLockSig = alice.signTransaction(hashLockTx);
hashLockJsonPayload = facade.transactionFactory.static.attachSignature(hashLockTx, hashLockSig);
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
});
await waitConfirmed(facade.hashTransaction(hashLockTx).toString());

// ③ ボンデッドTxをアナウンスし、署名待ちになるのを待つ
await fetch(
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
});
txInfo = await waitPartial(aggHash);

// ④ Bob が連署する（Bob は XYM を持っていなくてもよい）
txHash = new sdkCore.Hash256(sdkCore.utils.hexToUint8(txInfo.meta.hash));
cosignature = bob.cosignTransactionHash(txHash, true);
body = {
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
});

await waitConfirmed(aggHash);
console.log(aggHash);`;
export const ex5Check = r`// 交換後の所有量を確認する（Bob の XYM は 1、ポイントは Bob が 5 枚減って Alice が 5 枚増える）
bobXym = await getAmount(bob, '72C0212E67A08BCE'); // テストネットXYM
bobPoint = await getAmount(bob, mosaicIdHex);
alicePoint = await getAmount(alice, mosaicIdHex);
console.log('Bob XYM:', bobXym);
console.log('Bob ポイント:', bobPointBefore, '→', bobPoint, ' Alice ポイント:', alicePointBefore, '→', alicePoint);
console.log(bobXym === '1000000' && BigInt(bobPoint) === BigInt(bobPointBefore) - 5n && BigInt(alicePoint) === BigInt(alicePointBefore) + 5n ? '✅ 交換できました' : '❌ 数量を確認してください');`;

// ---------- 演習6 3人の署名をオフラインで集める ----------
export const ex6V2a = r`// ① Alice が起案して署名し、signedPayload を Bob と Carol に渡す
bob = sym.Account.generateNewAccount(networkType);
carol = sym.Account.generateNewAccount(networkType);

innerTx1 = sym.TransferTransaction.create(undefined, bob.address, [], sym.PlainMessage.create("tx1"), networkType);   // Alice → Bob
innerTx2 = sym.TransferTransaction.create(undefined, carol.address, [], sym.PlainMessage.create("tx2"), networkType); // Bob → Carol
innerTx3 = sym.TransferTransaction.create(undefined, alice.address, [], sym.PlainMessage.create("tx3"), networkType); // Carol → Alice

aggregateTx = sym.AggregateTransaction.createComplete(
  sym.Deadline.create(epochAdjustment),
  [
    innerTx1.toAggregate(alice.publicAccount),
    innerTx2.toAggregate(bob.publicAccount),
    innerTx3.toAggregate(carol.publicAccount)
  ],
  networkType,
  [],
).setMaxFeeForAggregate(100, 2); // 連署者は2人

signedTx = alice.sign(aggregateTx, generationHash);
signedHash = signedTx.hash;
signedPayload = signedTx.payload;
console.log(signedPayload);`;
export const ex6V2b = r`// ② Bob と Carol が、それぞれ payload を復元・検証して連署する
Buffer = require("/node_modules/buffer").Buffer;

restoredTx = sym.TransactionMapping.createFromPayload(signedPayload);
console.log(restoredTx.innerTransactions.length); // 含まれるTxの数（3のはず）
console.log(restoredTx.signer.address.plain());   // 起案者（Alice のはず）

// Alice の署名であることを検証
res = restoredTx.signer.verifySignature(
  restoredTx.getSigningBytes([...Buffer.from(signedPayload, 'hex')], [...Buffer.from(generationHash, 'hex')]),
  restoredTx.signature
);
console.log(res);

// 連署（それぞれの端末で、自分の秘密鍵だけを使う）
bobSignedTx = sym.CosignatureTransaction.signTransactionPayload(bob, signedPayload, generationHash);
carolSignedTx = sym.CosignatureTransaction.signTransactionPayload(carol, signedPayload, generationHash);`;
export const ex6V2c = r`// ③ Alice が連署を結合してアナウンスする
cosignSignedTxs = [
  new sym.CosignatureSignedTransaction(signedHash, bobSignedTx.signature, bobSignedTx.signerPublicKey),
  new sym.CosignatureSignedTransaction(signedHash, carolSignedTx.signature, carolSignedTx.signerPublicKey)
];

recreatedTx = sym.TransactionMapping.createFromPayload(signedPayload);

joinedPayload = signedPayload;
cosignSignedTxs.forEach((cosignedTx) => {
  joinedPayload += cosignedTx.version.toHex() + cosignedTx.signerPublicKey + cosignedTx.signature;
});

// 先頭のサイズ値（4バイト・リトルエンディアン）を、連署が増えたぶんに書き換える
size = ('00000000' + (joinedPayload.length / 2).toString(16)).slice(-8);
littleEndianSize = size.substr(6, 2) + size.substr(4, 2) + size.substr(2, 2) + size.substr(0, 2);
joinedPayload = littleEndianSize + joinedPayload.substr(8);

joinedTx = new sym.SignedTransaction(joinedPayload, signedHash, alice.publicKey, recreatedTx.type, recreatedTx.networkType);
await txRepo.announce(joinedTx).toPromise();

txInfo = await waitConfirmed(signedHash);
console.log(txInfo.cosignatures.length);`;
export const ex6V3a = r`// ① Alice が起案して署名し、signedPayload を Bob と Carol に渡す
bob = facade.createAccount(sdkCore.PrivateKey.random());
carol = facade.createAccount(sdkCore.PrivateKey.random());

// アグリゲートTxに含めるTxを作成
innerTxDescriptor1 = new sdkSymbol.descriptors.TransferTransactionV1Descriptor(  // Txタイプ:転送Tx
  bob.address,    // Bobへの送信
  [],
  '\0tx1'         // メッセージ
);
innerTx1 = facade.createEmbeddedTransactionFromTypedDescriptor(
  innerTxDescriptor1, // トランザクション Descriptor 設定
  alice.publicKey,    // Aliceから
);

innerTxDescriptor2 = new sdkSymbol.descriptors.TransferTransactionV1Descriptor(  // Txタイプ:転送Tx
  carol.address,  // Carolへの送信
  [],
  '\0tx2'         // メッセージ
);
innerTx2 = facade.createEmbeddedTransactionFromTypedDescriptor(
  innerTxDescriptor2, // トランザクション Descriptor 設定
  bob.publicKey,      // Bobから
);

innerTxDescriptor3 = new sdkSymbol.descriptors.TransferTransactionV1Descriptor(  // Txタイプ:転送Tx
  alice.address,  // Aliceへの送信
  [],
  '\0tx3'         // メッセージ
);
innerTx3 = facade.createEmbeddedTransactionFromTypedDescriptor(
  innerTxDescriptor3, // トランザクション Descriptor 設定
  carol.publicKey,    // Carolから
);

embeddedTransactions = [
  innerTx1,
  innerTx2,
  innerTx3
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
  2                     // 連署者数
);

// 署名
sig = alice.signTransaction(aggregateTx);
jsonPayload = facade.transactionFactory.static.attachSignature(aggregateTx, sig);

signedHash = facade.hashTransaction(aggregateTx).toString();
signedPayload = JSON.parse(jsonPayload).payload;
console.log(signedPayload);`;
export const ex6V3b = r`// ② Bob と Carol が、それぞれ payload を復元・検証して連署する
restoredTx = facade.transactionFactory.static.deserialize(sdkCore.utils.hexToUint8(signedPayload));
console.log(restoredTx.transactions.length);  // 含まれるTxの数（3のはず）

// 中身を確認（誰から誰宛か）
restoredTx.transactions.forEach((t) => {
  console.log(facade.network.publicKeyToAddress(t.signerPublicKey).toString(), '→', new sdkSymbol.Address(t.recipientAddress.bytes).toString());
});

// Alice の署名であることを検証
res = facade.verifyTransaction(restoredTx, restoredTx.signature);
console.log(res);

// 連署（それぞれの端末で、自分の秘密鍵だけを使う）
bobCosignature = bob.cosignTransaction(restoredTx, true);
carolCosignature = carol.cosignTransaction(restoredTx, true);`;
export const ex6V3c = r`// ③ Alice が連署を結合してアナウンスする
recreatedTx = facade.transactionFactory.static.deserialize(sdkCore.utils.hexToUint8(signedPayload));

// 連署者の署名を追加
[bobCosignature, carolCosignature].forEach((c) => {
  const cosignature = new sdkSymbol.models.Cosignature();
  cosignature.parentHash = facade.hashTransaction(aggregateTx);
  cosignature.version = 0n;
  cosignature.signerPublicKey = c.signerPublicKey;
  cosignature.signature = c.signature;
  recreatedTx.cosignatures.push(cosignature);
});

joinedPayload = sdkCore.utils.uint8ToHex(recreatedTx.serialize());

// アナウンス
await fetch(
  new URL('/transactions', NODE),
  {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({"payload": joinedPayload}),
  }
)
.then((res) => res.json())
.then((json) => {
  return json;
});

txInfo = await waitConfirmed(signedHash);
console.log(txInfo.transaction.cosignatures.length);`;
export const ex6CheckV2 = r`console.log(txInfo.cosignatures.length === 2 ? '✅ 3人の署名が揃って承認されました' : '❌ 連署の数を確認してください: ' + txInfo.cosignatures.length);`;
export const ex6CheckV3 = r`console.log(txInfo.transaction.cosignatures.length === 2 ? '✅ 3人の署名が揃って承認されました' : '❌ 連署の数を確認してください: ' + txInfo.transaction.cosignatures.length);`;
