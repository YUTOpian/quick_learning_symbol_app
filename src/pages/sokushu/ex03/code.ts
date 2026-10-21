// 速習Symbol 演習編 第3章（モザイク）のサンプルコード（例題・解答例・答え合わせ用コード）。
// 速習Symbol 第5章で学んだコードを組み合わせて作っている。
// コンソールでそのまま実行できるよう、const 宣言は付けていない（ch02〜ch13 と同じ方針。関数の中の const は付けてよい）。
// 注意: window.status など、ブラウザがもともと持っている名前（status・name・top など）は変数名に使わない。
// 待つための関数（waitConfirmed など）と、ステータスを調べる関数（getStatus）は、ch15/code.ts と ex02/code.ts のものを使う。
const r = String.raw;

// ---------- 共通関数の準備（第5章のコードを、関数にまとめたもの） ----------
export const toolsV2 = r`// ① 署名してアナウンスする関数（ハッシュを返す。signer を省略すると alice が署名する）
announceTx = async (tx, signer = alice) => {
  const signedTx = signer.sign(tx, generationHash);
  await txRepo.announce(signedTx).toPromise();
  return signedTx.hash;
};

// ② モザイクを作って、承認されるまで待つ関数（モザイクIDの16進数を返す）
// 5.1 と同じく、モザイク定義と供給量の設定を、1つのアグリゲートにまとめて送る（供給量が 0 のときは、定義だけ）
makeMosaic = async ({ divisibility = 0, supply = 0, supplyMutable = false, transferable = true, restrictable = false, revokable = false, duration = 0 }) => {
  const nonce = sym.MosaicNonce.createRandom();
  const mosaicId = sym.MosaicId.createFromNonce(nonce, alice.address);
  const innerTxs = [
    sym.MosaicDefinitionTransaction.create(
      undefined,
      nonce,
      mosaicId,
      sym.MosaicFlags.create(supplyMutable, transferable, restrictable, revokable),
      divisibility,
      sym.UInt64.fromUint(duration),
      networkType
    ).toAggregate(alice.publicAccount),
  ];
  if (supply > 0) {
    innerTxs.push(
      sym.MosaicSupplyChangeTransaction.create(
        undefined,
        mosaicId,
        sym.MosaicSupplyChangeAction.Increase,
        sym.UInt64.fromUint(supply),
        networkType
      ).toAggregate(alice.publicAccount)
    );
  }
  const aggregateTx = sym.AggregateTransaction.createComplete(
    sym.Deadline.create(epochAdjustment),
    innerTxs,
    networkType,
    []
  ).setMaxFeeForAggregate(100, 0);
  await waitConfirmed(await announceTx(aggregateTx));
  return mosaicId.toHex();
};

// ③ モザイクの情報（供給量・可分性・有効期限・フラグの値）を調べる関数
getMosaicInfo = async (idHex) => {
  const info = await repo.createMosaicRepository().getMosaic(new sym.MosaicId(idHex)).toPromise();
  const f = info.flags;
  return {
    supply: info.supply.toString(),
    divisibility: info.divisibility,
    duration: info.duration.toString(),
    flags: (f.supplyMutable ? 1 : 0) + (f.transferable ? 2 : 0) + (f.restrictable ? 4 : 0) + (f.revokable ? 8 : 0),
  };
};

// ④ モザイクを送る関数（ハッシュを返す）。list は [[モザイクIDの16進数, 量（整数）], ...] の形
// 送信モザイクリストは、モザイクIDの小さい順に並べる必要があるので、関数の中で並べ替えている
sendMosaics = async (signer, address, list) => {
  const sorted = [...list].sort((a, b) => {
    const x = BigInt('0x' + a[0]);
    const y = BigInt('0x' + b[0]);
    return x < y ? -1 : x > y ? 1 : 0;
  });
  const tx = sym.TransferTransaction.create(
    sym.Deadline.create(epochAdjustment),
    address,
    sorted.map(([id, amount]) => new sym.Mosaic(new sym.MosaicId(id), sym.UInt64.fromUint(amount))),
    sym.EmptyMessage,
    networkType
  ).setMaxFee(100);
  return await announceTx(tx, signer);
};
console.log('ready');`;
export const toolsV3 = r`// ① 署名してアナウンスする関数（ハッシュを返す。signer を省略すると alice が署名する）
// トランザクションを作るときに指定した署名者の公開鍵と、signer が一致している必要がある
announceTx = async (tx, signer = alice) => {
  const sig = signer.signTransaction(tx);
  const jsonPayload = facade.transactionFactory.static.attachSignature(tx, sig);
  await fetch(
    new URL('/transactions', NODE),
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: jsonPayload,
    }
  ).then((res) => res.json());
  return facade.hashTransaction(tx).toString();
};

// ② モザイクを作って、承認されるまで待つ関数（モザイクIDの16進数を返す）
// 5.1 と同じく、モザイク定義と供給量の設定を、1つのアグリゲートにまとめて送る（供給量が 0 のときは、定義だけ）
makeMosaic = async ({ divisibility = 0, supply = 0, supplyMutable = false, transferable = true, restrictable = false, revokable = false, duration = 0 }) => {
  let f = sdkSymbol.models.MosaicFlags.NONE.value;
  if (supplyMutable) f += sdkSymbol.models.MosaicFlags.SUPPLY_MUTABLE.value;
  if (transferable) f += sdkSymbol.models.MosaicFlags.TRANSFERABLE.value;
  if (restrictable) f += sdkSymbol.models.MosaicFlags.RESTRICTABLE.value;
  if (revokable) f += sdkSymbol.models.MosaicFlags.REVOKABLE.value;
  const flags = new sdkSymbol.models.MosaicFlags(f);

  const array = new Uint8Array(sdkSymbol.models.MosaicNonce.SIZE);
  crypto.getRandomValues(array);
  const nonce = sdkSymbol.models.MosaicNonce.deserialize(array);
  const mosaicId = sdkSymbol.generateMosaicId(alice.address, nonce.value);

  const embeddedTransactions = [
    facade.createEmbeddedTransactionFromTypedDescriptor(
      new sdkSymbol.descriptors.MosaicDefinitionTransactionV1Descriptor(
        new sdkSymbol.models.MosaicId(mosaicId),
        new sdkSymbol.models.BlockDuration(BigInt(duration)),
        nonce,
        flags,
        divisibility
      ),
      alice.publicKey
    ),
  ];
  if (supply > 0) {
    embeddedTransactions.push(
      facade.createEmbeddedTransactionFromTypedDescriptor(
        new sdkSymbol.descriptors.MosaicSupplyChangeTransactionV1Descriptor(
          new sdkSymbol.models.UnresolvedMosaicId(mosaicId),
          new sdkSymbol.models.Amount(BigInt(supply)),
          sdkSymbol.models.MosaicSupplyChangeAction.INCREASE
        ),
        alice.publicKey
      )
    );
  }
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
  await waitConfirmed(await announceTx(aggregateTx));
  return mosaicId.toString(16).toUpperCase().padStart(16, '0');
};

// ③ モザイクの情報（供給量・可分性・有効期限・フラグの値）を調べる関数
getMosaicInfo = async (idHex) => {
  const res = await fetch(new URL('/mosaics/' + idHex, NODE)).then((res) => res.json());
  const m = res.mosaic;
  return { supply: m.supply, divisibility: Number(m.divisibility), duration: m.duration, flags: Number(m.flags) };
};

// ④ モザイクを送る関数（ハッシュを返す）。list は [[モザイクIDの16進数, 量（整数）], ...] の形
// 送信モザイクリストは、モザイクIDの小さい順に並べる必要があるので、関数の中で並べ替えている
sendMosaics = async (signer, address, list) => {
  const sorted = [...list].sort((a, b) => {
    const x = BigInt('0x' + a[0]);
    const y = BigInt('0x' + b[0]);
    return x < y ? -1 : x > y ? 1 : 0;
  });
  const descriptor = new sdkSymbol.descriptors.TransferTransactionV1Descriptor(
    address,
    sorted.map(([id, amount]) =>
      new sdkSymbol.descriptors.UnresolvedMosaicDescriptor(
        new sdkSymbol.models.UnresolvedMosaicId(BigInt('0x' + id)),
        new sdkSymbol.models.Amount(BigInt(amount))
      )
    ),
    ''
  );
  const tx = facade.createTransactionFromTypedDescriptor(
    descriptor,
    signer.publicKey,
    100,
    60 * 60 * 2
  );
  return await announceTx(tx, signer);
};
console.log('ready');`;

// ---------- 演習1 数量とフラグは、整数で持つ ----------
export const e1V2 = r`// ① モザイクフラグを作って、値（数値）を確かめる
//    供給量変更: ○ / 譲渡: × / 制限: ○ / 回収: ○
flags = sym.MosaicFlags.create(true, false, true, true);
console.log(flags.getValue()); // 1 + 4 + 8 = 13

// ② 可分性 2 のモザイクで、1.00 個 は、整数でいくつか
divisibility = 2;
console.log(1 * 10 ** divisibility); // 100`;
export const e1V3 = r`// ① モザイクフラグを作って、値（数値）を確かめる
//    供給量変更: ○ / 譲渡: × / 制限: ○ / 回収: ○
f = sdkSymbol.models.MosaicFlags.NONE.value;
f += sdkSymbol.models.MosaicFlags.SUPPLY_MUTABLE.value;
f += sdkSymbol.models.MosaicFlags.RESTRICTABLE.value;
f += sdkSymbol.models.MosaicFlags.REVOKABLE.value;
flags = new sdkSymbol.models.MosaicFlags(f);
console.log(flags.value); // 1 + 4 + 8 = 13

// ② 可分性 2 のモザイクで、1.00 個 は、整数でいくつか
divisibility = 2;
console.log(1 * 10 ** divisibility); // 100`;
export const t1Func = r`// ① 画面に出す数（文字列）から、ブロックチェーンに渡す整数へ。小数の計算は使わずに、文字列のまま組み立てる
toRaw = (text, divisibility) => {
  const [intPart, fracPart = ''] = text.split('.');
  if (fracPart.length > divisibility) throw new Error('小数点以下の桁が、可分性より多すぎます');
  return Number(intPart + fracPart.padEnd(divisibility, '0'));
};

// ② ブロックチェーンの整数から、画面に出す数（文字列）へ
fromRaw = (raw, divisibility) => {
  const s = String(raw).padStart(divisibility + 1, '0');
  if (divisibility === 0) return s;
  return s.slice(0, -divisibility) + '.' + s.slice(-divisibility);
};

// ③ フラグの値（1・2・4・8 の合計）から、4つの設定へ
decodeFlags = (value) => ({
  supplyMutable: (value & 1) !== 0,
  transferable: (value & 2) !== 0,
  restrictable: (value & 4) !== 0,
  revokable: (value & 8) !== 0,
});

console.log(toRaw('1.25', 2), fromRaw(5, 2), decodeFlags(13));`;
export const t1Check = r`console.log(toRaw('1.25', 2) === 125 && toRaw('0.1', 6) === 100000 && toRaw('3', 0) === 3 ? '✅ ① 画面に出す数を、整数に直せました' : '❌ ① toRaw の結果が違います');
console.log(fromRaw(125, 2) === '1.25' && fromRaw(5, 2) === '0.05' && fromRaw(100, 2) === '1.00' && fromRaw(7, 0) === '7' ? '✅ ② 整数を、画面に出す数に戻せました' : '❌ ② fromRaw の結果が違います');
d13 = decodeFlags(13);
d3 = decodeFlags(3);
console.log(d13.supplyMutable && !d13.transferable && d13.restrictable && d13.revokable && d3.supplyMutable && d3.transferable && !d3.restrictable && !d3.revokable ? '✅ ③ フラグの値を、4つの設定に分けられました' : '❌ ③ decodeFlags の結果が違います');`;

// ---------- 演習2 モザイクを定義して、供給量を変える ----------
export const e2V2 = r`// ① モザイクを定義する（供給量変更○・譲渡○・制限×・回収×、可分性2、無期限）
nonce = sym.MosaicNonce.createRandom();
mosaicId = sym.MosaicId.createFromNonce(nonce, alice.address);
mosaicDefTx = sym.MosaicDefinitionTransaction.create(
  undefined,
  nonce,
  mosaicId,
  sym.MosaicFlags.create(true, true, false, false),
  2, // 可分性
  sym.UInt64.fromUint(0), // 有効期限（0 は無期限）
  networkType
);

// ② 供給量を 100.00 にする（可分性 2 なので、整数で 10000）
mosaicChangeTx = sym.MosaicSupplyChangeTransaction.create(
  undefined,
  mosaicId,
  sym.MosaicSupplyChangeAction.Increase,
  sym.UInt64.fromUint(10000),
  networkType
);

// ③ 2つを1つのアグリゲートにまとめて、署名・アナウンスして、承認を待つ
aggregateTx = sym.AggregateTransaction.createComplete(
  sym.Deadline.create(epochAdjustment),
  [
    mosaicDefTx.toAggregate(alice.publicAccount),
    mosaicChangeTx.toAggregate(alice.publicAccount),
  ],
  networkType,
  []
).setMaxFeeForAggregate(100, 0);
await waitConfirmed(await announceTx(aggregateTx));

// ④ モザイクの情報を確かめる
mosaicHex = mosaicId.toHex();
console.log(mosaicHex, await getMosaicInfo(mosaicHex));`;
export const e2V3 = r`// ① モザイクを定義する（供給量変更○・譲渡○・制限×・回収×、可分性2、無期限）
f = sdkSymbol.models.MosaicFlags.NONE.value;
f += sdkSymbol.models.MosaicFlags.SUPPLY_MUTABLE.value;
f += sdkSymbol.models.MosaicFlags.TRANSFERABLE.value;
flags = new sdkSymbol.models.MosaicFlags(f);

array = new Uint8Array(sdkSymbol.models.MosaicNonce.SIZE);
crypto.getRandomValues(array);
nonce = sdkSymbol.models.MosaicNonce.deserialize(array);
mosaicId = sdkSymbol.generateMosaicId(alice.address, nonce.value);

mosaicDefTx = facade.createEmbeddedTransactionFromTypedDescriptor(
  new sdkSymbol.descriptors.MosaicDefinitionTransactionV1Descriptor(
    new sdkSymbol.models.MosaicId(mosaicId),
    new sdkSymbol.models.BlockDuration(0n), // 有効期限（0 は無期限）
    nonce,
    flags,
    2 // 可分性
  ),
  alice.publicKey
);

// ② 供給量を 100.00 にする（可分性 2 なので、整数で 10000）
mosaicChangeTx = facade.createEmbeddedTransactionFromTypedDescriptor(
  new sdkSymbol.descriptors.MosaicSupplyChangeTransactionV1Descriptor(
    new sdkSymbol.models.UnresolvedMosaicId(mosaicId),
    new sdkSymbol.models.Amount(10000n),
    sdkSymbol.models.MosaicSupplyChangeAction.INCREASE
  ),
  alice.publicKey
);

// ③ 2つを1つのアグリゲートにまとめて、署名・アナウンスして、承認を待つ
embeddedTransactions = [mosaicDefTx, mosaicChangeTx];
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
await waitConfirmed(await announceTx(aggregateTx));

// ④ モザイクの情報を確かめる
mosaicHex = mosaicId.toString(16).toUpperCase().padStart(16, '0');
console.log(mosaicHex, await getMosaicInfo(mosaicHex));`;
export const t2V2 = r`// ① 供給量変更○のモザイクを、供給量 100 で作る
supplyId = await makeMosaic({ divisibility: 0, supply: 100, supplyMutable: true });

// ② 供給量を変更する関数（承認まで待つ）
changeSupply = async (action, delta) => {
  const tx = sym.MosaicSupplyChangeTransaction.create(
    sym.Deadline.create(epochAdjustment),
    new sym.MosaicId(supplyId),
    action,
    sym.UInt64.fromUint(delta),
    networkType
  ).setMaxFee(100);
  await waitConfirmed(await announceTx(tx));
};

// ③ 50 増やして、30 減らす
await changeSupply(sym.MosaicSupplyChangeAction.Increase, 50);
await changeSupply(sym.MosaicSupplyChangeAction.Decrease, 30);

// ④ 供給量を確かめる
supplyInfo = await getMosaicInfo(supplyId);
console.log(supplyInfo.supply);`;
export const t2V3 = r`// ① 供給量変更○のモザイクを、供給量 100 で作る
supplyId = await makeMosaic({ divisibility: 0, supply: 100, supplyMutable: true });

// ② 供給量を変更する関数（承認まで待つ）
changeSupply = async (action, delta) => {
  const descriptor = new sdkSymbol.descriptors.MosaicSupplyChangeTransactionV1Descriptor(
    new sdkSymbol.models.UnresolvedMosaicId(BigInt('0x' + supplyId)),
    new sdkSymbol.models.Amount(BigInt(delta)),
    action
  );
  const tx = facade.createTransactionFromTypedDescriptor(
    descriptor,
    alice.publicKey,
    100,
    60 * 60 * 2
  );
  await waitConfirmed(await announceTx(tx));
};

// ③ 50 増やして、30 減らす
await changeSupply(sdkSymbol.models.MosaicSupplyChangeAction.INCREASE, 50);
await changeSupply(sdkSymbol.models.MosaicSupplyChangeAction.DECREASE, 30);

// ④ 供給量を確かめる
supplyInfo = await getMosaicInfo(supplyId);
console.log(supplyInfo.supply);`;
export const t2Check = r`console.log(supplyInfo.supply === '120' ? '✅ ① 100 + 50 - 30 = 120 になりました' : '❌ ① 供給量が違います: ' + supplyInfo.supply);
console.log((supplyInfo.flags & 1) === 1 ? '✅ ② 供給量変更のフラグが、有効です' : '❌ ② 供給量変更のフラグが、有効になっていません');`;

// ---------- 演習3 複数のモザイクを、整数で送る ----------
export const e3V2 = r`// ① 可分性 2 のモザイクを、供給量 100.00（整数で 10000）で作る
moneyId = await makeMosaic({ divisibility: 2, supply: 10000 });

// ② bob へ 1.50 を送る。可分性 2 なので、整数で 150 と指定する
bob = sym.Account.generateNewAccount(networkType);
await waitConfirmed(await sendMosaics(alice, bob.address, [[moneyId, 150]]));

// ③ bob の所有量を確かめる
console.log(await getAmount(bob, moneyId)); // '150'`;
export const e3V3 = r`// ① 可分性 2 のモザイクを、供給量 100.00（整数で 10000）で作る
moneyId = await makeMosaic({ divisibility: 2, supply: 10000 });

// ② bob へ 1.50 を送る。可分性 2 なので、整数で 150 と指定する
bob = facade.createAccount(sdkCore.PrivateKey.random());
await waitConfirmed(await sendMosaics(alice, bob.address, [[moneyId, 150]]));

// ③ bob の所有量を確かめる
console.log(await getAmount(bob, moneyId)); // '150'`;
export const t3V2 = r`// ① 2種類のモザイクを作る
pointId = await makeMosaic({ divisibility: 0, supply: 1000 });
coinId = await makeMosaic({ divisibility: 3, supply: 5000000 }); // 5000.000

// ② bob へ、XYM 0.5・pointId 25・coinId 1.234 を、1つの転送トランザクションで送る
bob = sym.Account.generateNewAccount(networkType);
sendHash = await sendMosaics(alice, bob.address, [
  ['72C0212E67A08BCE', 500000], // XYM（テストネット）0.5
  [pointId, 25],
  [coinId, 1234], // 1.234（可分性 3）
]);
sentTx = await waitConfirmed(sendHash);

// ③ bob の所有量を調べる
amounts = {
  xym: await getAmount(bob, '72C0212E67A08BCE'),
  point: await getAmount(bob, pointId),
  coin: await getAmount(bob, coinId),
};
console.log(sentTx.mosaics.length, amounts);`;
export const t3V3 = r`// ① 2種類のモザイクを作る
pointId = await makeMosaic({ divisibility: 0, supply: 1000 });
coinId = await makeMosaic({ divisibility: 3, supply: 5000000 }); // 5000.000

// ② bob へ、XYM 0.5・pointId 25・coinId 1.234 を、1つの転送トランザクションで送る
bob = facade.createAccount(sdkCore.PrivateKey.random());
sendHash = await sendMosaics(alice, bob.address, [
  ['72C0212E67A08BCE', 500000], // XYM（テストネット）0.5
  [pointId, 25],
  [coinId, 1234], // 1.234（可分性 3）
]);
sentTx = await waitConfirmed(sendHash);

// ③ bob の所有量を調べる
amounts = {
  xym: await getAmount(bob, '72C0212E67A08BCE'),
  point: await getAmount(bob, pointId),
  coin: await getAmount(bob, coinId),
};
console.log(sentTx.transaction.mosaics.length, amounts);`;
export const t3CheckV2 = r`console.log(sentTx.mosaics.length === 3 ? '✅ ① 3種類のモザイクが、1つのトランザクションで送られました' : '❌ ① 送ったモザイクの種類の数が違います');
console.log(amounts.xym === '500000' && amounts.point === '25' && amounts.coin === '1234' ? '✅ ② bob の所有量は、XYM 0.5・point 25・coin 1.234 です' : '❌ ② bob の所有量が違います: ' + JSON.stringify(amounts));`;
export const t3CheckV3 = r`console.log(sentTx.transaction.mosaics.length === 3 ? '✅ ① 3種類のモザイクが、1つのトランザクションで送られました' : '❌ ① 送ったモザイクの種類の数が違います');
console.log(amounts.xym === '500000' && amounts.point === '25' && amounts.coin === '1234' ? '✅ ② bob の所有量は、XYM 0.5・point 25・coin 1.234 です' : '❌ ② bob の所有量が違います: ' + JSON.stringify(amounts));`;

// ---------- 演習4 回収できるポイントを運用する ----------
export const e4V2 = r`// ① 回収できる（revokable）モザイクを作る
revId = await makeMosaic({ divisibility: 0, supply: 1000, revokable: true });

// ② bob へ 10 送る
bob = sym.Account.generateNewAccount(networkType);
await waitConfirmed(await sendMosaics(alice, bob.address, [[revId, 10]]));

// ③ alice が、bob から 4 を回収する（bob の署名は要らない）
revocationTx = sym.MosaicSupplyRevocationTransaction.create(
  sym.Deadline.create(epochAdjustment),
  bob.address, // 回収先アドレス
  new sym.Mosaic(new sym.MosaicId(revId), sym.UInt64.fromUint(4)),
  networkType
).setMaxFee(100);
await waitConfirmed(await announceTx(revocationTx));

// ④ bob の所有量を確かめる
console.log(await getAmount(bob, revId)); // '6'`;
export const e4V3 = r`// ① 回収できる（revokable）モザイクを作る
revId = await makeMosaic({ divisibility: 0, supply: 1000, revokable: true });

// ② bob へ 10 送る
bob = facade.createAccount(sdkCore.PrivateKey.random());
await waitConfirmed(await sendMosaics(alice, bob.address, [[revId, 10]]));

// ③ alice が、bob から 4 を回収する（bob の署名は要らない）
revocationDescriptor = new sdkSymbol.descriptors.MosaicSupplyRevocationTransactionV1Descriptor(
  bob.address, // 回収先アドレス
  new sdkSymbol.descriptors.UnresolvedMosaicDescriptor(
    new sdkSymbol.models.UnresolvedMosaicId(BigInt('0x' + revId)),
    new sdkSymbol.models.Amount(4n)
  )
);
revocationTx = facade.createTransactionFromTypedDescriptor(
  revocationDescriptor,
  alice.publicKey,
  100,
  60 * 60 * 2
);
await waitConfirmed(await announceTx(revocationTx));

// ④ bob の所有量を確かめる
console.log(await getAmount(bob, revId)); // '6'`;
export const t4V2a = r`// ① 譲渡不可（transferable: false）で、回収可（revokable: true）のポイントを作る
pointId = await makeMosaic({ divisibility: 0, supply: 10000, transferable: false, revokable: true });
bob = sym.Account.generateNewAccount(networkType);
carol = sym.Account.generateNewAccount(networkType);

// ② bob へ、ポイント 100 と、手数料のための XYM 1 を送る
await waitConfirmed(await sendMosaics(alice, bob.address, [
  ['72C0212E67A08BCE', 1000000], // XYM（テストネット）1
  [pointId, 100],
]));`;
export const t4V2b = r`// ③ bob が、carol へポイント 5 を送ってみる（失敗するはず）
hashNg = await sendMosaics(bob, carol.address, [[pointId, 5]]);
statusNg = null;
for (let i = 0; i < 24; i++) {
  statusNg = await getStatus(hashNg);
  if (statusNg && (statusNg.group === 'confirmed' || statusNg.group === 'failed')) break;
  await sleep(5000);
}
console.log(statusNg ? statusNg.group + ' / ' + statusNg.code : '見つかりませんでした');`;
export const t4V2c = r`// ④ alice が、bob からポイント 30 を回収する
revocationTx = sym.MosaicSupplyRevocationTransaction.create(
  sym.Deadline.create(epochAdjustment),
  bob.address,
  new sym.Mosaic(new sym.MosaicId(pointId), sym.UInt64.fromUint(30)),
  networkType
).setMaxFee(100);
await waitConfirmed(await announceTx(revocationTx));

// ⑤ bob の所有量を確かめる
amountBob = await getAmount(bob, pointId);
console.log(amountBob);`;
export const t4V3a = r`// ① 譲渡不可（transferable: false）で、回収可（revokable: true）のポイントを作る
pointId = await makeMosaic({ divisibility: 0, supply: 10000, transferable: false, revokable: true });
bob = facade.createAccount(sdkCore.PrivateKey.random());
carol = facade.createAccount(sdkCore.PrivateKey.random());

// ② bob へ、ポイント 100 と、手数料のための XYM 1 を送る
await waitConfirmed(await sendMosaics(alice, bob.address, [
  ['72C0212E67A08BCE', 1000000], // XYM（テストネット）1
  [pointId, 100],
]));`;
export const t4V3b = r`// ③ bob が、carol へポイント 5 を送ってみる（失敗するはず）
hashNg = await sendMosaics(bob, carol.address, [[pointId, 5]]);
statusNg = null;
for (let i = 0; i < 24; i++) {
  statusNg = await getStatus(hashNg);
  if (statusNg && (statusNg.group === 'confirmed' || statusNg.group === 'failed')) break;
  await sleep(5000);
}
console.log(statusNg ? statusNg.group + ' / ' + statusNg.code : '見つかりませんでした');`;
export const t4V3c = r`// ④ alice が、bob からポイント 30 を回収する
revocationDescriptor = new sdkSymbol.descriptors.MosaicSupplyRevocationTransactionV1Descriptor(
  bob.address,
  new sdkSymbol.descriptors.UnresolvedMosaicDescriptor(
    new sdkSymbol.models.UnresolvedMosaicId(BigInt('0x' + pointId)),
    new sdkSymbol.models.Amount(30n)
  )
);
revocationTx = facade.createTransactionFromTypedDescriptor(
  revocationDescriptor,
  alice.publicKey,
  100,
  60 * 60 * 2
);
await waitConfirmed(await announceTx(revocationTx));

// ⑤ bob の所有量を確かめる
amountBob = await getAmount(bob, pointId);
console.log(amountBob);`;
export const t4Check = r`console.log(statusNg && statusNg.group === 'failed'
  ? '✅ ③ bob から carol への送信は、failed になりました（' + statusNg.code + '）。譲渡不可のモザイクは、発行者とのあいだでしか動かせません'
  : '❌ ③ ステータスが failed になっていません');
console.log(amountBob === '70' ? '✅ ⑤ 100 - 30 = 70。bob の署名なしで、alice が回収できました' : '❌ ⑤ bob の所有量が違います: ' + amountBob);`;

// ---------- 演習5 NFT は、「全部持っている間」は変えられる ----------
export const e5V2 = r`// ① NFT を作る。モザイク定義（供給量変更×・可分性0）、供給量 1、NFT データを、1つのアグリゲートにまとめる
nonce = sym.MosaicNonce.createRandom();
nftId = sym.MosaicId.createFromNonce(nonce, alice.address);
mosaicDefTx = sym.MosaicDefinitionTransaction.create(
  undefined,
  nonce,
  nftId,
  sym.MosaicFlags.create(false, true, false, false), // 供給量変更×・譲渡○
  0, // 可分性
  sym.UInt64.fromUint(0),
  networkType
);
mosaicChangeTx = sym.MosaicSupplyChangeTransaction.create(
  undefined,
  nftId,
  sym.MosaicSupplyChangeAction.Increase,
  sym.UInt64.fromUint(1), // 数量 1
  networkType
);
nftDataTx = sym.TransferTransaction.create(
  undefined,
  alice.address,
  [],
  sym.PlainMessage.create('NFT data: Hello Symbol!'), // NFT データ
  networkType
);
aggregateTx = sym.AggregateTransaction.createComplete(
  sym.Deadline.create(epochAdjustment),
  [
    mosaicDefTx.toAggregate(alice.publicAccount),
    mosaicChangeTx.toAggregate(alice.publicAccount),
    nftDataTx.toAggregate(alice.publicAccount),
  ],
  networkType,
  []
).setMaxFeeForAggregate(100, 0);
nftConfirmed = await waitConfirmed(await announceTx(aggregateTx));

// ② 供給量と、記録された NFT データを確かめる
nftHex = nftId.toHex();
console.log((await getMosaicInfo(nftHex)).supply); // '1'
console.log(nftConfirmed.innerTransactions[2].message.payload);`;
export const e5V3 = r`// ① NFT を作る。モザイク定義（供給量変更×・可分性0）、供給量 1、NFT データを、1つのアグリゲートにまとめる
f = sdkSymbol.models.MosaicFlags.NONE.value;
f += sdkSymbol.models.MosaicFlags.TRANSFERABLE.value; // 供給量変更×・譲渡○
flags = new sdkSymbol.models.MosaicFlags(f);

array = new Uint8Array(sdkSymbol.models.MosaicNonce.SIZE);
crypto.getRandomValues(array);
nonce = sdkSymbol.models.MosaicNonce.deserialize(array);
nftId = sdkSymbol.generateMosaicId(alice.address, nonce.value);

mosaicDefTx = facade.createEmbeddedTransactionFromTypedDescriptor(
  new sdkSymbol.descriptors.MosaicDefinitionTransactionV1Descriptor(
    new sdkSymbol.models.MosaicId(nftId),
    new sdkSymbol.models.BlockDuration(0n),
    nonce,
    flags,
    0 // 可分性
  ),
  alice.publicKey
);
mosaicChangeTx = facade.createEmbeddedTransactionFromTypedDescriptor(
  new sdkSymbol.descriptors.MosaicSupplyChangeTransactionV1Descriptor(
    new sdkSymbol.models.UnresolvedMosaicId(nftId),
    new sdkSymbol.models.Amount(1n), // 数量 1
    sdkSymbol.models.MosaicSupplyChangeAction.INCREASE
  ),
  alice.publicKey
);
nftDataTx = facade.createEmbeddedTransactionFromTypedDescriptor(
  new sdkSymbol.descriptors.TransferTransactionV1Descriptor(
    alice.address,
    [],
    '\0NFT data: Hello Symbol!' // NFT データ
  ),
  alice.publicKey
);
embeddedTransactions = [mosaicDefTx, mosaicChangeTx, nftDataTx];
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
nftConfirmed = await waitConfirmed(await announceTx(aggregateTx));

// ② 供給量と、記録された NFT データを確かめる
nftHex = nftId.toString(16).toUpperCase().padStart(16, '0');
console.log((await getMosaicInfo(nftHex)).supply); // '1'
console.log(new TextDecoder().decode(sdkCore.utils.hexToUint8(nftConfirmed.transaction.transactions[2].transaction.message.substring(2)))); // 先頭の1バイト(タイプ)を除く`;
export const t5V2a = r`// ① 供給量変更を、トランザクションにして送る関数（ハッシュを返す）
changeSupply = (idHex, action, delta) => announceTx(
  sym.MosaicSupplyChangeTransaction.create(
    sym.Deadline.create(epochAdjustment),
    new sym.MosaicId(idHex),
    action,
    sym.UInt64.fromUint(delta),
    networkType
  ).setMaxFee(100)
);

// ② NFT（供給量 1・供給量変更×）を作る。alice は全数量を持っているまま、供給量を 1 増やしてみる
nftId = await makeMosaic({ divisibility: 0, supply: 1, supplyMutable: false });
await waitConfirmed(await changeSupply(nftId, sym.MosaicSupplyChangeAction.Increase, 1));
supplyAfter = (await getMosaicInfo(nftId)).supply;
console.log(supplyAfter);`;
export const t5V2b = r`// ③ 別の NFT を作って、bob に送る。そのあと alice が、供給量を 1 増やしてみる
bob = sym.Account.generateNewAccount(networkType);
nft2Id = await makeMosaic({ divisibility: 0, supply: 1, supplyMutable: false });
await waitConfirmed(await sendMosaics(alice, bob.address, [[nft2Id, 1]]));

hashNg = await changeSupply(nft2Id, sym.MosaicSupplyChangeAction.Increase, 1);
statusNg = null;
for (let i = 0; i < 24; i++) {
  statusNg = await getStatus(hashNg);
  if (statusNg && (statusNg.group === 'confirmed' || statusNg.group === 'failed')) break;
  await sleep(5000);
}
console.log(statusNg ? statusNg.group + ' / ' + statusNg.code : '見つかりませんでした');
supplyKept = (await getMosaicInfo(nft2Id)).supply;
console.log(supplyKept);`;
export const t5V3a = r`// ① 供給量変更を、トランザクションにして送る関数（ハッシュを返す）
changeSupply = (idHex, action, delta) => announceTx(
  facade.createTransactionFromTypedDescriptor(
    new sdkSymbol.descriptors.MosaicSupplyChangeTransactionV1Descriptor(
      new sdkSymbol.models.UnresolvedMosaicId(BigInt('0x' + idHex)),
      new sdkSymbol.models.Amount(BigInt(delta)),
      action
    ),
    alice.publicKey,
    100,
    60 * 60 * 2
  )
);

// ② NFT（供給量 1・供給量変更×）を作る。alice は全数量を持っているまま、供給量を 1 増やしてみる
nftId = await makeMosaic({ divisibility: 0, supply: 1, supplyMutable: false });
await waitConfirmed(await changeSupply(nftId, sdkSymbol.models.MosaicSupplyChangeAction.INCREASE, 1));
supplyAfter = (await getMosaicInfo(nftId)).supply;
console.log(supplyAfter);`;
export const t5V3b = r`// ③ 別の NFT を作って、bob に送る。そのあと alice が、供給量を 1 増やしてみる
bob = facade.createAccount(sdkCore.PrivateKey.random());
nft2Id = await makeMosaic({ divisibility: 0, supply: 1, supplyMutable: false });
await waitConfirmed(await sendMosaics(alice, bob.address, [[nft2Id, 1]]));

hashNg = await changeSupply(nft2Id, sdkSymbol.models.MosaicSupplyChangeAction.INCREASE, 1);
statusNg = null;
for (let i = 0; i < 24; i++) {
  statusNg = await getStatus(hashNg);
  if (statusNg && (statusNg.group === 'confirmed' || statusNg.group === 'failed')) break;
  await sleep(5000);
}
console.log(statusNg ? statusNg.group + ' / ' + statusNg.code : '見つかりませんでした');
supplyKept = (await getMosaicInfo(nft2Id)).supply;
console.log(supplyKept);`;
export const t5Check = r`console.log(supplyAfter === '2' ? '✅ ② 供給量変更×でも、発行者が全数量を持っている間は、供給量を増やせてしまいました（供給量: 2）' : '❌ ② 供給量が違います: ' + supplyAfter);
console.log(statusNg && statusNg.group === 'failed' ? '✅ ③ bob に渡したあとは、供給量を増やせず failed になりました（' + statusNg.code + '）' : '❌ ③ ステータスが failed になっていません');
console.log(supplyKept === '1' ? '✅ ③ 供給量は 1 のままです' : '❌ ③ 供給量が違います: ' + supplyKept);`;
