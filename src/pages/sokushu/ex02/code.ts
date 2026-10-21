// 速習Symbol 演習編 第2章（トランザクション）のサンプルコード（例題・解答例・答え合わせ用コード）。
// 速習Symbol 第4章で学んだコードを組み合わせて作っている。
// コンソールでそのまま実行できるよう、const 宣言は付けていない（ch02〜ch13 と同じ方針。関数の中の const は付けてよい）。
// 注意: window.status など、ブラウザがもともと持っている名前（status・name・top など）は変数名に使わない。
const r = String.raw;

// ---------- 共通関数の準備（ステータスの取得） ----------
export const statusPrepV2 = r`// トランザクションのステータスを調べる関数。ノードに受理されていないときは null を返す
tsRepo = repo.createTransactionStatusRepository();
getStatus = async (hash) => {
  try {
    return await tsRepo.getTransactionStatus(hash).toPromise();
  } catch (e) {
    return null;
  }
};
console.log('ready');`;
export const statusPrepV3 = r`// トランザクションのステータスを調べる関数。ノードに受理されていないときは null を返す
getStatus = async (hash) => {
  const list = await fetch(
    new URL('/transactionStatus', NODE),
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hashes: [hash] }),
    }
  ).then((res) => res.json());
  return list.length > 0 ? list[0] : null;
};
console.log('ready');`;

// ---------- 演習1 手数料は、サイズ × 乗数で決まる ----------
export const e1V2 = r`// ① bob 宛ての転送トランザクションを作る（手数料乗数は 100）
bob = sym.Account.generateNewAccount(networkType);
tx = sym.TransferTransaction.create(
  sym.Deadline.create(epochAdjustment),
  bob.address,
  [],
  sym.PlainMessage.create('Hello Symbol!'),
  networkType
).setMaxFee(100);

// ② サイズと最大手数料を表示する（アナウンスしなくても分かる）
console.log('size:', tx.size);
console.log('maxFee:', tx.maxFee.compact());

// ③ 最大手数料 = サイズ × 手数料乗数 になっているか確かめる
console.log(tx.maxFee.compact() === tx.size * 100);`;
export const e1V3 = r`// ① bob 宛ての転送トランザクションを作る（手数料乗数は 100）
bob = facade.createAccount(sdkCore.PrivateKey.random());
descriptor = new sdkSymbol.descriptors.TransferTransactionV1Descriptor(
  bob.address,
  [],
  '\0Hello Symbol!'
);
tx = facade.createTransactionFromTypedDescriptor(
  descriptor,
  alice.publicKey,
  100,
  60 * 60 * 2
);

// ② サイズと最大手数料を表示する（アナウンスしなくても分かる）
console.log('size:', tx.size);
console.log('maxFee:', tx.fee.value);

// ③ 最大手数料 = サイズ × 手数料乗数 になっているか確かめる
console.log(tx.fee.value === BigInt(tx.size) * 100n);`;
export const t1V2 = r`// ① 文字数と手数料乗数を指定して、トランザクションを作る関数
bob = sym.Account.generateNewAccount(networkType);
makeTx = (text, multiplier) => sym.TransferTransaction.create(
  sym.Deadline.create(epochAdjustment),
  bob.address,
  [],
  sym.PlainMessage.create(text),
  networkType
).setMaxFee(multiplier);

// ② 10文字（乗数100）、100文字（乗数100）、100文字（乗数200）の3つを作る
tx10 = makeTx('a'.repeat(10), 100);
tx100 = makeTx('a'.repeat(100), 100);
tx100x2 = makeTx('a'.repeat(100), 200);

// ③ サイズの差と、最大手数料の比を、まとめる
result = {
  sizeDiff: tx100.size - tx10.size,
  feeRatio: tx100x2.maxFee.compact() / tx100.maxFee.compact(),
};
console.log(result);`;
export const t1V3 = r`// ① 文字数と手数料乗数を指定して、トランザクションを作る関数
bob = facade.createAccount(sdkCore.PrivateKey.random());
makeTx = (text, multiplier) => {
  const descriptor = new sdkSymbol.descriptors.TransferTransactionV1Descriptor(
    bob.address,
    [],
    '\0' + text
  );
  return facade.createTransactionFromTypedDescriptor(
    descriptor,
    alice.publicKey,
    multiplier,
    60 * 60 * 2
  );
};

// ② 10文字（乗数100）、100文字（乗数100）、100文字（乗数200）の3つを作る
tx10 = makeTx('a'.repeat(10), 100);
tx100 = makeTx('a'.repeat(100), 100);
tx100x2 = makeTx('a'.repeat(100), 200);

// ③ サイズの差と、最大手数料の比を、まとめる
result = {
  sizeDiff: tx100.size - tx10.size,
  feeRatio: Number(tx100x2.fee.value) / Number(tx100.fee.value),
};
console.log(result);`;
export const t1Check = r`console.log(result.sizeDiff === 90 ? '✅ ① メッセージが90文字長いと、サイズも90バイト増えます' : '❌ ① サイズの差が違います: ' + result.sizeDiff);
console.log(result.feeRatio === 2 ? '✅ ② 手数料乗数を2倍にすると、最大手数料もちょうど2倍です' : '❌ ② 最大手数料の比が違います: ' + result.feeRatio);`;

// ---------- 演習2 メッセージの種類を見分ける ----------
export const e2V2 = r`bob = sym.Account.generateNewAccount(networkType);

// 3種類のメッセージを作る
plain = sym.PlainMessage.create('Hello Symbol!');
encrypted = alice.encryptMessage('Hello Symbol!', bob.publicAccount);
raw = sym.RawMessage.create([0x10, 0x20, 0x30]);

// メッセージの種類（type）を表示する
console.log('平文:', plain.type);
console.log('暗号文:', encrypted.type);
console.log('生データ:', raw.type);`;
export const e2V3 = r`bob = facade.createAccount(sdkCore.PrivateKey.random());

// 3種類のメッセージを作る（v3 では、先頭の1バイトがメッセージタイプ）
plain = new TextEncoder().encode('\0Hello Symbol!');
encrypted = alice.messageEncoder().encode(bob.publicKey, new TextEncoder().encode('Hello Symbol!'));
raw = new Uint8Array([0xFF, 0x10, 0x20, 0x30]);

// 先頭の1バイトを表示する
console.log('平文:', plain[0]);
console.log('暗号文:', encrypted[0]);
console.log('生データ:', raw[0]);`;
export const t2SamplesV2 = r`// テスト用のデータ（4種類のメッセージ）と、期待する答え
bob = sym.Account.generateNewAccount(networkType);
samples = [
  sym.PlainMessage.create('Hello Symbol!'),
  alice.encryptMessage('Hello Symbol!', bob.publicAccount),
  sym.RawMessage.create([0x10, 0x20, 0x30]),
  sym.EmptyMessage,
];
expected = ['plain', 'encrypted', 'raw', 'empty'];
console.log(samples.map((m) => m.type));`;
export const t2SamplesV3 = r`// テスト用のデータ（4種類のメッセージ）と、期待する答え
// ノードから取得したメッセージは16進数文字列なので、同じ形にしておく
bob = facade.createAccount(sdkCore.PrivateKey.random());
samples = [
  new TextEncoder().encode('\0Hello Symbol!'),
  alice.messageEncoder().encode(bob.publicKey, new TextEncoder().encode('Hello Symbol!')),
  new Uint8Array([0xFF, 0x10, 0x20, 0x30]),
  new Uint8Array(),
].map((m) => sdkCore.utils.uint8ToHex(m));
expected = ['plain', 'encrypted', 'raw', 'empty'];
console.log(samples.map((hex) => hex.substring(0, 2)));`;
export const t2FuncV2 = r`// ① メッセージの種類を、文字で答える関数
describeMessage = (message) => {
  if (message.payload === '') return 'empty';  // 空メッセージ
  if (message.type === 0) return 'plain';      // 平文
  if (message.type === 1) return 'encrypted';  // 暗号文
  if (message.type === -1) return 'raw';       // 生データ
  return 'other';                              // それ以外
};
console.log(samples.map(describeMessage));`;
export const t2FuncV3 = r`// ① メッセージの種類を、文字で答える関数（hex は16進数文字列）
describeMessage = (hex) => {
  if (hex === '') return 'empty';                // 空メッセージ
  const type = parseInt(hex.substring(0, 2), 16);
  if (type === 0x00) return 'plain';             // 平文
  if (type === 0x01) return 'encrypted';         // 暗号文
  if (type === 0xFF) return 'raw';               // 生データ
  return 'other';                                // それ以外
};
console.log(samples.map(describeMessage));`;
export const t2ApplyV2 = r`// ② alice の承認済みトランザクションから、転送トランザクションのメッセージの種類を数える
res = await txRepo.search({
  group: sym.TransactionGroup.Confirmed,
  embedded: true,
  address: alice.address,
}).toPromise();
transfers = res.data.filter((tx) => tx.type === sym.TransactionType.TRANSFER);

counts = { empty: 0, plain: 0, encrypted: 0, raw: 0, other: 0 };
transfers.forEach((tx) => {
  counts[describeMessage(tx.message)]++;
});
console.log(counts);`;
export const t2ApplyV3 = r`// ② alice の承認済みトランザクションから、転送トランザクションのメッセージの種類を数える
params = new URLSearchParams({
  address: alice.address.toString(),
  embedded: true,
});
res = await fetch(
  new URL('/transactions/confirmed?' + params.toString(), NODE),
  {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  }
)
.then((res) => res.json());
transfers = res.data.filter((tx) => tx.transaction.type === 16724); // 16724: 転送トランザクション

counts = { empty: 0, plain: 0, encrypted: 0, raw: 0, other: 0 };
transfers.forEach((tx) => {
  counts[describeMessage(tx.transaction.message ?? '')]++; // メッセージが空のときは、項目がないこともある
});
console.log(counts);`;
export const t2Check = r`found = JSON.stringify(samples.map(describeMessage));
console.log(found === JSON.stringify(expected) ? '✅ ① 4種類のメッセージを、見分けられました' : '❌ ① 見分けた結果が違います: ' + found);
console.log(transfers.length > 0 && Object.values(counts).reduce((a, b) => a + b, 0) === transfers.length
  ? '✅ ② ' + transfers.length + ' 件の転送トランザクションを、種類ごとに数えられました'
  : '❌ ② 数えた合計が、転送トランザクションの件数と合いません');`;

// ---------- 演習3 「受理された」と「承認された」は違う ----------
export const e3V2 = r`// ① bob 宛てに 1XYM を送るトランザクションを作って、署名・アナウンスする
bob = sym.Account.generateNewAccount(networkType);
tx = sym.TransferTransaction.create(
  sym.Deadline.create(epochAdjustment),
  bob.address,
  [new sym.Mosaic(new sym.NamespaceId('symbol.xym'), sym.UInt64.fromUint(1000000))], // 1XYM
  sym.PlainMessage.create('status'),
  networkType
).setMaxFee(100);
signedTx = alice.sign(tx, generationHash);
res = await txRepo.announce(signedTx).toPromise();
console.log(res.message);

// ② 承認（confirmed）か失敗（failed）になるまで、5秒ごとにステータスを表示する
for (let i = 0; i < 24; i++) {
  const s = await getStatus(signedTx.hash);
  console.log(s ? s.group + ' / ' + s.code : 'まだ見つかりません');
  if (s && (s.group === 'confirmed' || s.group === 'failed')) break;
  await sleep(5000);
}`;
export const e3V3 = r`// ① bob 宛てに 1XYM を送るトランザクションを作って、署名・アナウンスする
bob = facade.createAccount(sdkCore.PrivateKey.random());
namespaceIds = sdkSymbol.generateNamespacePath('symbol.xym');
namespaceId = namespaceIds[namespaceIds.length - 1];

descriptor = new sdkSymbol.descriptors.TransferTransactionV1Descriptor(
  bob.address,
  [
    new sdkSymbol.descriptors.UnresolvedMosaicDescriptor(
      new sdkSymbol.models.UnresolvedMosaicId(namespaceId),
      new sdkSymbol.models.Amount(1000000n) // 1XYM
    )
  ],
  '\0status'
);
tx = facade.createTransactionFromTypedDescriptor(
  descriptor,
  alice.publicKey,
  100,
  60 * 60 * 2
);
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
.then((res) => res.json());
console.log(res.message);
hash = facade.hashTransaction(tx).toString();

// ② 承認（confirmed）か失敗（failed）になるまで、5秒ごとにステータスを表示する
for (let i = 0; i < 24; i++) {
  const s = await getStatus(hash);
  console.log(s ? s.group + ' / ' + s.code : 'まだ見つかりません');
  if (s && (s.group === 'confirmed' || s.group === 'failed')) break;
  await sleep(5000);
}`;
export const t3V2a = r`// ① XYM を持っていない dave が、alice へ 1XYM を送る
dave = sym.Account.generateNewAccount(networkType);
tx = sym.TransferTransaction.create(
  sym.Deadline.create(epochAdjustment),
  alice.address,
  [new sym.Mosaic(new sym.NamespaceId('symbol.xym'), sym.UInt64.fromUint(1000000))], // 1XYM
  sym.PlainMessage.create('no money'),
  networkType
).setMaxFee(100);
signedTx = dave.sign(tx, generationHash);
res = await txRepo.announce(signedTx).toPromise();
console.log(res.message);`;
export const t3V2b = r`// ② 承認か失敗になるまで、ステータスを調べる
txStatus = null;
for (let i = 0; i < 24; i++) {
  txStatus = await getStatus(signedTx.hash);
  if (txStatus && (txStatus.group === 'confirmed' || txStatus.group === 'failed')) break;
  await sleep(5000);
}
console.log(txStatus ? txStatus.group + ' / ' + txStatus.code : '見つかりませんでした');`;
export const t3V3a = r`// ① XYM を持っていない dave が、alice へ 1XYM を送る
dave = facade.createAccount(sdkCore.PrivateKey.random());
namespaceIds = sdkSymbol.generateNamespacePath('symbol.xym');
namespaceId = namespaceIds[namespaceIds.length - 1];

descriptor = new sdkSymbol.descriptors.TransferTransactionV1Descriptor(
  alice.address,
  [
    new sdkSymbol.descriptors.UnresolvedMosaicDescriptor(
      new sdkSymbol.models.UnresolvedMosaicId(namespaceId),
      new sdkSymbol.models.Amount(1000000n) // 1XYM
    )
  ],
  '\0no money'
);
tx = facade.createTransactionFromTypedDescriptor(
  descriptor,
  dave.publicKey,
  100,
  60 * 60 * 2
);
sig = dave.signTransaction(tx);
jsonPayload = facade.transactionFactory.static.attachSignature(tx, sig);
res = await fetch(
  new URL('/transactions', NODE),
  {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: jsonPayload,
  }
)
.then((res) => res.json());
console.log(res.message);
hash = facade.hashTransaction(tx).toString();`;
export const t3V3b = r`// ② 承認か失敗になるまで、ステータスを調べる
txStatus = null;
for (let i = 0; i < 24; i++) {
  txStatus = await getStatus(hash);
  if (txStatus && (txStatus.group === 'confirmed' || txStatus.group === 'failed')) break;
  await sleep(5000);
}
console.log(txStatus ? txStatus.group + ' / ' + txStatus.code : '見つかりませんでした');`;
export const t3Check = r`console.log(res.message && res.message.includes('pushed') ? '✅ ① アナウンスは、ノードに受理されました' : '❌ ① アナウンスが受理されていません');
console.log(txStatus && txStatus.group === 'failed'
  ? '✅ ② ステータスは failed です（' + txStatus.code + '）。受理されても、承認されるとは限りません'
  : '❌ ② ステータスが failed になっていません');`;

// ---------- 演習4 アグリゲートは、全部成功か、全部失敗 ----------
export const e4V2 = r`// ① 送信先の bob と carol を作る
bob = sym.Account.generateNewAccount(networkType);
carol = sym.Account.generateNewAccount(networkType);

// ② bob と carol へ 0.1XYM ずつ送る、2つの転送トランザクションを作る（有効期限は、アグリゲート側に指定する）
innerTx1 = sym.TransferTransaction.create(
  undefined,
  bob.address,
  [new sym.Mosaic(new sym.NamespaceId('symbol.xym'), sym.UInt64.fromUint(100000))], // 0.1XYM
  sym.EmptyMessage,
  networkType
);
innerTx2 = sym.TransferTransaction.create(
  undefined,
  carol.address,
  [new sym.Mosaic(new sym.NamespaceId('symbol.xym'), sym.UInt64.fromUint(100000))], // 0.1XYM
  sym.EmptyMessage,
  networkType
);

// ③ 2つを、1つのアグリゲートトランザクションにまとめて、署名・アナウンスする
aggregateTx = sym.AggregateTransaction.createComplete(
  sym.Deadline.create(epochAdjustment),
  [
    innerTx1.toAggregate(alice.publicAccount), // 送信元アカウントの公開鍵
    innerTx2.toAggregate(alice.publicAccount),
  ],
  networkType,
  []
).setMaxFeeForAggregate(100, 0);
signedTx = alice.sign(aggregateTx, generationHash);
await txRepo.announce(signedTx).toPromise();

// ④ 承認されたら取得して、まとめたトランザクションの数と、送った額を表示する
confirmed = await waitConfirmed(signedTx.hash);
console.log('内包トランザクション数:', confirmed.innerTransactions.length);
confirmed.innerTransactions.forEach((t) => {
  console.log(t.recipientAddress.plain(), t.mosaics[0].amount.compact());
});`;
export const e4V3 = r`// ① 送信先の bob と carol を作る
bob = facade.createAccount(sdkCore.PrivateKey.random());
carol = facade.createAccount(sdkCore.PrivateKey.random());
namespaceIds = sdkSymbol.generateNamespacePath('symbol.xym');
namespaceId = namespaceIds[namespaceIds.length - 1];

// ② bob と carol へ 0.1XYM ずつ送る、2つの転送トランザクションを作る
innerTx1 = facade.createEmbeddedTransactionFromTypedDescriptor(
  new sdkSymbol.descriptors.TransferTransactionV1Descriptor(
    bob.address,
    [
      new sdkSymbol.descriptors.UnresolvedMosaicDescriptor(
        new sdkSymbol.models.UnresolvedMosaicId(namespaceId),
        new sdkSymbol.models.Amount(100000n) // 0.1XYM
      )
    ],
    ''
  ),
  alice.publicKey // 送信元アカウントの公開鍵
);
innerTx2 = facade.createEmbeddedTransactionFromTypedDescriptor(
  new sdkSymbol.descriptors.TransferTransactionV1Descriptor(
    carol.address,
    [
      new sdkSymbol.descriptors.UnresolvedMosaicDescriptor(
        new sdkSymbol.models.UnresolvedMosaicId(namespaceId),
        new sdkSymbol.models.Amount(100000n) // 0.1XYM
      )
    ],
    ''
  ),
  alice.publicKey
);

// ③ 2つを、1つのアグリゲートトランザクションにまとめて、署名・アナウンスする
embeddedTransactions = [innerTx1, innerTx2];
descriptor = new sdkSymbol.descriptors.AggregateCompleteTransactionV3Descriptor(
  facade.static.hashEmbeddedTransactions(embeddedTransactions),
  embeddedTransactions
);
aggregateTx = facade.createTransactionFromTypedDescriptor(
  descriptor,
  alice.publicKey,
  100,
  60 * 60 * 2,
  0 // 連署者数
);
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
.then((res) => res.json());

// ④ 承認されたら取得して、まとめたトランザクションの数と、送った額を表示する
confirmed = await waitConfirmed(facade.hashTransaction(aggregateTx).toString());
console.log('内包トランザクション数:', confirmed.transaction.transactions.length);
confirmed.transaction.transactions.forEach((t) => {
  console.log(t.transaction.recipientAddress, t.transaction.mosaics[0].amount);
});`;
export const t4V2a = r`// ① 宛先と金額の組のリストから、アグリゲートトランザクションをアナウンスする関数（ハッシュを返す）
announceAgg = async (list) => {
  const innerTxs = list.map(([address, amount]) =>
    sym.TransferTransaction.create(
      undefined,
      address,
      [new sym.Mosaic(new sym.NamespaceId('symbol.xym'), sym.UInt64.fromUint(amount))],
      sym.EmptyMessage,
      networkType
    ).toAggregate(alice.publicAccount)
  );
  const aggregateTx = sym.AggregateTransaction.createComplete(
    sym.Deadline.create(epochAdjustment),
    innerTxs,
    networkType,
    []
  ).setMaxFeeForAggregate(100, 0);
  const signedTx = alice.sign(aggregateTx, generationHash);
  await txRepo.announce(signedTx).toPromise();
  return signedTx.hash;
};`;
export const t4V2b = r`// ② 3人へ 0.1 / 0.2 / 0.3XYM を、1つのアグリゲートで送る
r1 = sym.Account.generateNewAccount(networkType);
r2 = sym.Account.generateNewAccount(networkType);
r3 = sym.Account.generateNewAccount(networkType);
hashOk = await announceAgg([
  [r1.address, 100000],
  [r2.address, 200000],
  [r3.address, 300000],
]);
confirmedOk = await waitConfirmed(hashOk);
total = confirmedOk.innerTransactions.reduce((sum, t) => sum + t.mosaics[0].amount.compact(), 0);
console.log(confirmedOk.innerTransactions.length, total);`;
export const t4V2c = r`// ③ 3件目を、alice が持っていない額（100万XYM）にして、同じように送る
hashNg = await announceAgg([
  [r1.address, 100000],
  [r2.address, 200000],
  [r3.address, 1000000000000], // 100万XYM
]);
statusNg = null;
for (let i = 0; i < 24; i++) {
  statusNg = await getStatus(hashNg);
  if (statusNg && (statusNg.group === 'confirmed' || statusNg.group === 'failed')) break;
  await sleep(5000);
}
console.log(statusNg ? statusNg.group + ' / ' + statusNg.code : '見つかりませんでした');

// r1 の所有量は、②で受け取った 0.1XYM のまま？
amount1 = await getAmount(r1, '72C0212E67A08BCE'); // 72C0212E67A08BCE: XYM のモザイクID（テストネット）
console.log(amount1);`;
export const t4V3a = r`// ① 宛先と金額の組のリストから、アグリゲートトランザクションをアナウンスする関数（ハッシュを返す）
announceAgg = async (list) => {
  const namespaceIds = sdkSymbol.generateNamespacePath('symbol.xym');
  const namespaceId = namespaceIds[namespaceIds.length - 1];
  const embeddedTransactions = list.map(([address, amount]) =>
    facade.createEmbeddedTransactionFromTypedDescriptor(
      new sdkSymbol.descriptors.TransferTransactionV1Descriptor(
        address,
        [
          new sdkSymbol.descriptors.UnresolvedMosaicDescriptor(
            new sdkSymbol.models.UnresolvedMosaicId(namespaceId),
            new sdkSymbol.models.Amount(BigInt(amount))
          )
        ],
        ''
      ),
      alice.publicKey
    )
  );
  const descriptor = new sdkSymbol.descriptors.AggregateCompleteTransactionV3Descriptor(
    facade.static.hashEmbeddedTransactions(embeddedTransactions),
    embeddedTransactions
  );
  const aggregateTx = facade.createTransactionFromTypedDescriptor(
    descriptor,
    alice.publicKey,
    100,
    60 * 60 * 2,
    0 // 連署者数
  );
  const sig = alice.signTransaction(aggregateTx);
  const jsonPayload = facade.transactionFactory.static.attachSignature(aggregateTx, sig);
  await fetch(
    new URL('/transactions', NODE),
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: jsonPayload,
    }
  ).then((res) => res.json());
  return facade.hashTransaction(aggregateTx).toString();
};`;
export const t4V3b = r`// ② 3人へ 0.1 / 0.2 / 0.3XYM を、1つのアグリゲートで送る
r1 = facade.createAccount(sdkCore.PrivateKey.random());
r2 = facade.createAccount(sdkCore.PrivateKey.random());
r3 = facade.createAccount(sdkCore.PrivateKey.random());
hashOk = await announceAgg([
  [r1.address, 100000],
  [r2.address, 200000],
  [r3.address, 300000],
]);
confirmedOk = await waitConfirmed(hashOk);
total = confirmedOk.transaction.transactions.reduce((sum, t) => sum + Number(t.transaction.mosaics[0].amount), 0);
console.log(confirmedOk.transaction.transactions.length, total);`;
export const t4V3c = r`// ③ 3件目を、alice が持っていない額（100万XYM）にして、同じように送る
hashNg = await announceAgg([
  [r1.address, 100000],
  [r2.address, 200000],
  [r3.address, 1000000000000], // 100万XYM
]);
statusNg = null;
for (let i = 0; i < 24; i++) {
  statusNg = await getStatus(hashNg);
  if (statusNg && (statusNg.group === 'confirmed' || statusNg.group === 'failed')) break;
  await sleep(5000);
}
console.log(statusNg ? statusNg.group + ' / ' + statusNg.code : '見つかりませんでした');

// r1 の所有量は、②で受け取った 0.1XYM のまま？
amount1 = await getAmount(r1, '72C0212E67A08BCE'); // 72C0212E67A08BCE: XYM のモザイクID（テストネット）
console.log(amount1);`;
export const t4CheckV2 = r`console.log(confirmedOk.innerTransactions.length === 3 ? '✅ ② 3件のトランザクションが、1つのアグリゲートにまとまりました' : '❌ ② 内包トランザクション数が違います');
console.log(total === 600000 ? '✅ ② 送った額の合計は 0.6XYM です' : '❌ ② 送った額の合計が違います: ' + total);
console.log(statusNg && statusNg.group === 'failed' ? '✅ ③ 3件目が失敗したので、アグリゲート全体が failed になりました（' + statusNg.code + '）' : '❌ ③ アグリゲートが failed になっていません');
console.log(amount1 === '100000' ? '✅ ③ r1 は、③では何も受け取っていません（所有量は 0.1XYM のまま）' : '❌ ③ r1 の所有量が違います: ' + amount1);`;
export const t4CheckV3 = r`console.log(confirmedOk.transaction.transactions.length === 3 ? '✅ ② 3件のトランザクションが、1つのアグリゲートにまとまりました' : '❌ ② 内包トランザクション数が違います');
console.log(total === 600000 ? '✅ ② 送った額の合計は 0.6XYM です' : '❌ ② 送った額の合計が違います: ' + total);
console.log(statusNg && statusNg.group === 'failed' ? '✅ ③ 3件目が失敗したので、アグリゲート全体が failed になりました（' + statusNg.code + '）' : '❌ ③ アグリゲートが failed になっていません');
console.log(amount1 === '100000' ? '✅ ③ r1 は、③では何も受け取っていません（所有量は 0.1XYM のまま）' : '❌ ③ r1 の所有量が違います: ' + amount1);`;

// ---------- 演習5 大きなデータを、分けて載せる ----------
export const e5V2 = r`// ① 文章のハッシュ値（SHA-256、16進数）を計算する関数
sha256Hex = async (text) => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();
};
text = '速習Symbol 演習 存在証明のためのメモ';
hashText = await sha256Hex(text);
console.log(hashText);

// ② ハッシュ値をメッセージにして、alice 自身へ送る（XYM は送らない）
tx = sym.TransferTransaction.create(
  sym.Deadline.create(epochAdjustment),
  alice.address,
  [],
  sym.PlainMessage.create(hashText),
  networkType
).setMaxFee(100);
signedTx = alice.sign(tx, generationHash);
await txRepo.announce(signedTx).toPromise();

// ③ 承認されたら取得して、記録されたハッシュ値と、文章から計算し直したハッシュ値を比べる
txInfo = await waitConfirmed(signedTx.hash);
console.log(txInfo.message.payload === await sha256Hex(text));`;
export const e5V3 = r`// ① 文章のハッシュ値（SHA-256、16進数）を計算する関数
sha256Hex = async (text) => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();
};
text = '速習Symbol 演習 存在証明のためのメモ';
hashText = await sha256Hex(text);
console.log(hashText);

// ② ハッシュ値をメッセージにして、alice 自身へ送る（XYM は送らない）
descriptor = new sdkSymbol.descriptors.TransferTransactionV1Descriptor(
  alice.address,
  [],
  '\0' + hashText
);
tx = facade.createTransactionFromTypedDescriptor(
  descriptor,
  alice.publicKey,
  100,
  60 * 60 * 2
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
.then((res) => res.json());

// ③ 承認されたら取得して、記録されたハッシュ値と、文章から計算し直したハッシュ値を比べる
txInfo = await waitConfirmed(facade.hashTransaction(tx).toString());
saved = new TextDecoder().decode(sdkCore.utils.hexToUint8(txInfo.transaction.message.substring(2))); // 先頭の1バイト(タイプ)を除く
console.log(saved === await sha256Hex(text));`;
export const t5Data = r`// テスト用のデータ（ランダムな16進数の文字列、2500文字）
bigData = Array.from(crypto.getRandomValues(new Uint8Array(1250))).map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();
console.log(bigData.length);`;
export const t5V2 = r`// ① 1000文字ずつに分割する
chunks = [];
for (let i = 0; i < bigData.length; i += 1000) {
  chunks.push(bigData.substring(i, i + 1000));
}
console.log(chunks.length);

// ② 分割したデータを、alice 自身宛ての転送トランザクションにして、アグリゲートにまとめて送る
innerTxs = chunks.map((chunk) =>
  sym.TransferTransaction.create(
    undefined,
    alice.address,
    [],
    sym.PlainMessage.create(chunk),
    networkType
  ).toAggregate(alice.publicAccount)
);
aggregateTx = sym.AggregateTransaction.createComplete(
  sym.Deadline.create(epochAdjustment),
  innerTxs,
  networkType,
  []
).setMaxFeeForAggregate(100, 0);
signedTx = alice.sign(aggregateTx, generationHash);
await txRepo.announce(signedTx).toPromise();

// ③ 承認されたら取得して、メッセージを順番につなげて、元のデータに戻す
confirmed = await waitConfirmed(signedTx.hash);
restored = confirmed.innerTransactions.map((t) => t.message.payload).join('');
console.log(restored === bigData);`;
export const t5V3 = r`// ① 1000文字ずつに分割する
chunks = [];
for (let i = 0; i < bigData.length; i += 1000) {
  chunks.push(bigData.substring(i, i + 1000));
}
console.log(chunks.length);

// ② 分割したデータを、alice 自身宛ての転送トランザクションにして、アグリゲートにまとめて送る
embeddedTransactions = chunks.map((chunk) =>
  facade.createEmbeddedTransactionFromTypedDescriptor(
    new sdkSymbol.descriptors.TransferTransactionV1Descriptor(
      alice.address,
      [],
      '\0' + chunk
    ),
    alice.publicKey
  )
);
descriptor = new sdkSymbol.descriptors.AggregateCompleteTransactionV3Descriptor(
  facade.static.hashEmbeddedTransactions(embeddedTransactions),
  embeddedTransactions
);
aggregateTx = facade.createTransactionFromTypedDescriptor(
  descriptor,
  alice.publicKey,
  100,
  60 * 60 * 2,
  0 // 連署者数
);
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
.then((res) => res.json());

// ③ 承認されたら取得して、メッセージを順番につなげて、元のデータに戻す
confirmed = await waitConfirmed(facade.hashTransaction(aggregateTx).toString());
restored = confirmed.transaction.transactions
  .map((t) => new TextDecoder().decode(sdkCore.utils.hexToUint8(t.transaction.message.substring(2)))) // 先頭の1バイト(タイプ)を除く
  .join('');
console.log(restored === bigData);`;
export const t5Check = r`console.log(chunks.length === 3 && chunks.every((c) => c.length <= 1000) ? '✅ ① 2500文字を、1000文字以下の3つに分けられました' : '❌ ① 分割の結果が違います');
console.log(restored === bigData ? '✅ ③ つなげたデータが、元のデータと一致しました' : '❌ ③ 元のデータと一致しません');`;
