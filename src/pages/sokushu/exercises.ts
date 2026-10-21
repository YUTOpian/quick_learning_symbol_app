// 速習Symbol 各章の章末問題（例題1つ + 練習問題1つ）。
// コードは const 宣言を付けず、コンソールでそのまま実行できる形にしている（ch02〜ch13 と同じ方針）。
const r = String.raw;

export type Item = {
  title: string;
  q: string;            // 問題文
  conds?: string[];     // 条件（箇条書き）
  hint?: string;        // 練習問題のヒント
  v2: string | string[]; // 解答コード（SDK v2）。配列は手順ごとに分けて表示する
  v3: string | string[]; // 解答コード（SDK v3）
  note?: string;        // 解説
  runnable?: boolean;   // false のとき実行ボタンを出さない（URLの書き換えが必要なコード用）
};
export type Pair = { example: Item; practice: Item };

// v3 でノードへアナウンスする共通部分。
const ann = r`await fetch(
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

export const EX: Record<number, Pair> = {
  // ---------- 第3章 アカウント ----------
  3: {
    example: {
      title: '秘密鍵からアカウントを復元する',
      q: '新しいアカウント dave をランダムに生成してください。次に、dave の秘密鍵だけを使ってアカウントを作り直し、元のアカウントとアドレスが一致することを確認してください。',
      v2: r`dave = sym.Account.generateNewAccount(networkType);
restored = sym.Account.createFromPrivateKey(dave.privateKey, networkType);
console.log(dave.address.plain() === restored.address.plain());`,
      v3: r`dave = facade.createAccount(sdkCore.PrivateKey.random());
restored = facade.createAccount(new sdkCore.PrivateKey(dave.keyPair.privateKey.toString()));
console.log(dave.address.toString() === restored.address.toString());`,
      note: '秘密鍵が同じなら、公開鍵もアドレスも必ず同じになります。true と表示されれば、秘密鍵さえ安全に保管しておけばアカウントをいつでも復元できることが確認できます。',
    },
    practice: {
      title: '署名の改ざん検知',
      q: 'alice の秘密鍵で "Hello Symbol!" に署名してください。その署名を、元のメッセージと、1文字だけ変えたメッセージ "Hello Symbol?" のそれぞれで検証し、結果が true と false になることを確認してください。',
      hint: '3.4「署名」と「検証」のコードを組み合わせます。検証には署名者の公開鍵だけが必要です。',
      v2: r`Buffer = require("/node_modules/buffer").Buffer;
payload = Buffer.from("Hello Symbol!", 'utf-8');
signature = Buffer.from(sym.KeyPair.sign(alice.keyPair, payload)).toString("hex").toUpperCase();

// 元のメッセージで検証
console.log(sym.KeyPair.verify(alice.keyPair.publicKey, payload, Buffer.from(signature, 'hex')));

// 1文字変えたメッセージで検証
tampered = Buffer.from("Hello Symbol?", 'utf-8');
console.log(sym.KeyPair.verify(alice.keyPair.publicKey, tampered, Buffer.from(signature, 'hex')));`,
      v3: r`payload = Buffer.from("Hello Symbol!", 'utf-8');
signature = alice.keyPair.sign(payload);
v = new sdkSymbol.Verifier(alice.publicKey);

// 元のメッセージで検証
console.log(v.verify(payload, signature));

// 1文字変えたメッセージで検証
tampered = Buffer.from("Hello Symbol?", 'utf-8');
console.log(v.verify(tampered, signature));`,
      note: '署名の対象が1文字でも変わると、検証は false になります。これが「データが改ざんされていないこと」を確かめる仕組みの基本です。',
    },
  },

  // ---------- 第4章 トランザクション ----------
  4: {
    example: {
      title: 'XYMとメッセージを送る',
      q: '新しいアカウント bob を作り、alice から bob へ 1XYM とメッセージ "Thanks!" を送るトランザクションを、署名してアナウンスしてください。最後にトランザクションハッシュを表示します。',
      conds: ['手数料乗数は 100 とする', 'XYM は symbol.xym のネームスペースで指定してよい'],
      v2: r`bob = sym.Account.generateNewAccount(networkType);

tx = sym.TransferTransaction.create(
  sym.Deadline.create(epochAdjustment),
  bob.address,
  [new sym.Mosaic(new sym.NamespaceId("symbol.xym"), sym.UInt64.fromUint(1000000))], // 1XYM
  sym.PlainMessage.create("Thanks!"),
  networkType
).setMaxFee(100);

signedTx = alice.sign(tx, generationHash);
await txRepo.announce(signedTx).toPromise();
console.log(signedTx.hash);`,
      v3: [r`bob = facade.createAccount(sdkCore.PrivateKey.random());
namespaceIds = sdkSymbol.generateNamespacePath("symbol.xym");
namespaceId = namespaceIds[namespaceIds.length - 1];

descriptor = new sdkSymbol.descriptors.TransferTransactionV1Descriptor(
  bob.address,
  [
    new sdkSymbol.descriptors.UnresolvedMosaicDescriptor(
      new sdkSymbol.models.UnresolvedMosaicId(namespaceId),
      new sdkSymbol.models.Amount(1000000n) // 1XYM
    )
  ],
  '\0Thanks!'
);
tx = facade.createTransactionFromTypedDescriptor(
  descriptor,
  alice.publicKey,
  100,
  60 * 60 * 2
);

sig = alice.signTransaction(tx);
jsonPayload = facade.transactionFactory.static.attachSignature(tx, sig);
${ann}
console.log(facade.hashTransaction(tx).toString());`],
      note: 'モザイクの数量は、可分性を含めた整数で指定します。XYM の可分性は6なので、1XYM は 1000000 です。表示されたハッシュは、次の練習問題で使います。',
    },
    practice: {
      title: '承認済みトランザクションの中身を読む',
      q: '例題のトランザクションが承認されたら、承認済みトランザクションを取得して、メッセージと送金額（数量）を表示してください。',
      hint: '4.4「承認確認」のコードで取得できます。v3 ではメッセージが、先頭にメッセージタイプ(平文は 00)が付いた16進数文字列で返ります。',
      v2: r`txInfo = await txRepo.getTransaction(signedTx.hash, sym.TransactionGroup.Confirmed).toPromise();
console.log(txInfo.message.payload);
console.log(txInfo.mosaics[0].amount.toString());`,
      v3: r`txInfo = await fetch(
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

msgHex = txInfo.transaction.message;
console.log(new TextDecoder().decode(sdkCore.utils.hexToUint8(msgHex.substring(2)))); // 先頭の1バイト(タイプ)を除く
console.log(txInfo.transaction.mosaics[0].amount);`,
      note: 'Thanks! と 1000000 が表示されれば成功です。承認されるまでは取得できないので、エラーになったら少し待ってからもう一度実行してください。',
    },
  },

  // ---------- 第5章 モザイク ----------
  5: {
    example: {
      title: '譲渡できるチケットモザイクを発行する',
      q: '供給量変更不可・譲渡可能・可分性 0 のモザイク「チケット」を、供給量 100 で発行してください。モザイク定義と供給量変更を、アグリゲートトランザクションにまとめてアナウンスします。',
      conds: ['制限設定・回収のフラグは設定しない', '有効期限は無期限とする'],
      v2: r`supplyMutable = false;  // 供給量変更の可否
transferable = true;   // 第三者への譲渡可否
restrictable = false;  // 制限設定の可否
revokable = false;     // 発行者からの還収可否

nonce = sym.MosaicNonce.createRandom();
mosaicDefTx = sym.MosaicDefinitionTransaction.create(
  undefined,
  nonce,
  sym.MosaicId.createFromNonce(nonce, alice.address),
  sym.MosaicFlags.create(supplyMutable, transferable, restrictable, revokable),
  0,                      // divisibility:可分性
  sym.UInt64.fromUint(0), // duration:無期限
  networkType
);
mosaicChangeTx = sym.MosaicSupplyChangeTransaction.create(
  undefined,
  mosaicDefTx.mosaicId,
  sym.MosaicSupplyChangeAction.Increase,
  sym.UInt64.fromUint(100), // 数量
  networkType
);

aggregateTx = sym.AggregateTransaction.createComplete(
  sym.Deadline.create(epochAdjustment),
  [
    mosaicDefTx.toAggregate(alice.publicAccount),
    mosaicChangeTx.toAggregate(alice.publicAccount),
  ],
  networkType, [],
).setMaxFeeForAggregate(100, 0);

signedTx = alice.sign(aggregateTx, generationHash);
await txRepo.announce(signedTx).toPromise();`,
      v3: [r`// モザイクフラグ設定（譲渡可のみ）
f = sdkSymbol.models.MosaicFlags.NONE.value;
f += sdkSymbol.models.MosaicFlags.TRANSFERABLE.value;
flags = new sdkSymbol.models.MosaicFlags(f);

// ナンス設定
array = new Uint8Array(sdkSymbol.models.MosaicNonce.SIZE);
crypto.getRandomValues(array);
nonce = sdkSymbol.models.MosaicNonce.deserialize(array);

// モザイク定義
mosaicDefDescriptor = new sdkSymbol.descriptors.MosaicDefinitionTransactionV1Descriptor(
  new sdkSymbol.models.MosaicId(sdkSymbol.generateMosaicId(alice.address, nonce.value)),
  new sdkSymbol.models.BlockDuration(0n), // 無期限
  nonce,
  flags,
  0 // divisibility:可分性
);
mosaicDefTx = facade.createEmbeddedTransactionFromTypedDescriptor(
  mosaicDefDescriptor,
  alice.publicKey,
);

// 供給量変更（100枚）
mosaicChangeDescriptor = new sdkSymbol.descriptors.MosaicSupplyChangeTransactionV1Descriptor(
  new sdkSymbol.models.UnresolvedMosaicId(mosaicDefTx.id.value),
  new sdkSymbol.models.Amount(100n),
  sdkSymbol.models.MosaicSupplyChangeAction.INCREASE
);
mosaicChangeTx = facade.createEmbeddedTransactionFromTypedDescriptor(
  mosaicChangeDescriptor,
  alice.publicKey,
);

embeddedTransactions = [
  mosaicDefTx,
  mosaicChangeTx
];

// アグリゲートTx作成
descriptor = new sdkSymbol.descriptors.AggregateCompleteTransactionV3Descriptor(
  facade.static.hashEmbeddedTransactions(embeddedTransactions),
  embeddedTransactions
);
aggregateTx = facade.createTransactionFromTypedDescriptor(
  descriptor,
  alice.publicKey,
  100,
  60 * 60 * 2,
  0
);

// 署名とアナウンス
sig = alice.signTransaction(aggregateTx);
jsonPayload = facade.transactionFactory.static.attachSignature(aggregateTx, sig);
${ann}`],
      note: 'チケットのように「数えられるもの」は、可分性を 0 にします。供給量変更不可にして最初に 100 だけ発行すれば、あとから増やすことはできません。譲渡可（transferable）にしたので、bob など第三者へ送ることもできます。',
    },
    practice: {
      title: 'モザイク情報を取得して確認する',
      q: '例題のアグリゲートトランザクションが承認されたら、作成したモザイクの情報を取得して、可分性・供給量・譲渡可否を表示してください。',
      hint: '5.1「モザイク情報の確認」を参考にします。モザイクIDは、例題の mosaicDefTx から取り出せます。v3 の flags は、有効なフラグの値の合計です（譲渡可は 2）。',
      v2: r`mosaicRepo = repo.createMosaicRepository();
mosaicInfo = await mosaicRepo.getMosaic(mosaicDefTx.mosaicId).toPromise();
console.log(mosaicInfo.divisibility);
console.log(mosaicInfo.supply.toString());
console.log(mosaicInfo.flags.transferable);`,
      v3: r`mosaicIdHex = mosaicDefTx.id.value.toString(16).toUpperCase().padStart(16, '0');
mosaicInfo = await fetch(
  new URL('/mosaics/' + mosaicIdHex, NODE),
  {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  }
)
.then((res) => res.json())
.then((json) => {
  return json.mosaic;
});
console.log(mosaicInfo.divisibility);
console.log(mosaicInfo.supply);
console.log(mosaicInfo.flags);`,
      note: '可分性 0、供給量 100、譲渡可（v2 は true、v3 は 2）と表示されれば成功です。',
    },
  },

  // ---------- 第6章 ネームスペース ----------
  6: {
    example: {
      title: 'ルートネームスペースを30日借りる手数料',
      q: 'ルートネームスペースを30日間レンタルする場合の手数料を、ノードから取得したレンタル手数料をもとに計算し、XYM 単位で表示してください。',
      conds: ['1ブロックは30秒として計算する'],
      v2: r`nwRepo = repo.createNetworkRepository();
rentalFees = await nwRepo.getRentalFees().toPromise();
rootNsPerBlock = rentalFees.effectiveRootNamespaceRentalFeePerBlock.compact();

rentalDays = 30;
rentalBlock = rentalDays * 24 * 60 * 60 / 30; // 1ブロック30秒
rootNsRentalFeeTotal = rentalBlock * rootNsPerBlock;
console.log("rentalBlock:" + rentalBlock);
console.log("XYM:" + rootNsRentalFeeTotal / 1000000);`,
      v3: r`rentalFees = await fetch(
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

rootNsPerBlock = Number(rentalFees.effectiveRootNamespaceRentalFeePerBlock);
rentalDays = 30;
rentalBlock = rentalDays * 24 * 60 * 60 / 30; // 1ブロック30秒
rootNsRentalFeeTotal = rentalBlock * rootNsPerBlock;
console.log("rentalBlock:" + rentalBlock);
console.log("XYM:" + rootNsRentalFeeTotal / 1000000);`,
      note: '手数料は借りるブロック数に比例します。30日は 86400 ブロックです。手数料は可分性を含めた整数で返ってくるので、XYM の可分性 6 にあわせて 1000000 で割って XYM 単位にしています。',
    },
    practice: {
      title: 'symbol.xym がリンクしているモザイクを調べる',
      q: 'ネームスペース symbol.xym の情報を取得し、リンクされているモザイクIDを表示してください。テストネットでは 72C0212E67A08BCE と表示されれば成功です。',
      hint: '6.5「参照」のコードを使います。モザイクにリンクしたエイリアスの情報は、ネームスペース情報の alias に入っています。',
      v2: r`nsRepo = repo.createNamespaceRepository();
nsInfo = await nsRepo.getNamespace(new sym.NamespaceId("symbol.xym")).toPromise();
console.log(nsInfo.alias.mosaicId.toHex());`,
      v3: r`namespaceIds = sdkSymbol.generateNamespacePath("symbol.xym");
nameId = namespaceIds[namespaceIds.length - 1];
nsInfo = await fetch(
  new URL('/namespaces/' + nameId.toString(16).toUpperCase(), NODE),
  {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  }
)
.then((res) => res.json())
.then((json) => {
  return json.namespace;
});
console.log(nsInfo.alias.mosaicId);`,
      note: 'symbol.xym は、XYM のモザイクIDにリンクされたネームスペースです。送信時に symbol.xym と書けば、IDを覚えていなくてもXYMを指定できるのは、このリンクがあるからです。',
    },
  },

  // ---------- 第7章 メタデータ ----------
  7: {
    example: {
      title: 'アカウントにメタデータを登録する',
      q: 'alice 自身に、キー "nickname"、値 "alice" のメタデータを登録してください。',
      conds: ['記録先も作成者も alice とする'],
      v2: r`metaRepo = repo.createMetadataRepository();
metaService = new sym.MetadataTransactionService(metaRepo);

key = sym.KeyGenerator.generateUInt64Key("nickname");
value = "alice";

tx = await metaService.createAccountMetadataTransaction(
  undefined,
  networkType,
  alice.address, // メタデータ記録先アドレス
  key, value,    // Key-Value値
  alice.address  // メタデータ作成者アドレス
).toPromise();

aggregateTx = sym.AggregateTransaction.createComplete(
  sym.Deadline.create(epochAdjustment),
  [tx.toAggregate(alice.publicAccount)],
  networkType, []
).setMaxFeeForAggregate(100, 0);

signedTx = alice.sign(aggregateTx, generationHash);
await txRepo.announce(signedTx).toPromise();`,
      v3: r`targetAddress = alice.address;  // メタデータ記録先アドレス
sourceAddress = alice.address;  // メタデータ作成者アドレス

key = sdkSymbol.metadataGenerateKey("nickname");
value = new TextEncoder().encode("alice");

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
// 登録済みの場合は差分データを作成する
sizeDelta = value.length;
if (metadataInfo.length > 0) {
  sizeDelta -= metadataInfo[0].metadataEntry.valueSize;
  value = sdkSymbol.metadataUpdateValue(sdkCore.utils.hexToUint8(metadataInfo[0].metadataEntry.value), value);
}

descriptor = new sdkSymbol.descriptors.AccountMetadataTransactionV1Descriptor(
  targetAddress,
  key,
  sizeDelta,
  value
);
tx = facade.createEmbeddedTransactionFromTypedDescriptor(
  descriptor,
  alice.publicKey,
);

embeddedTransactions = [
  tx
];

aggregateDescriptor = new sdkSymbol.descriptors.AggregateCompleteTransactionV3Descriptor(
  facade.static.hashEmbeddedTransactions(embeddedTransactions),
  embeddedTransactions
);
aggregateTx = facade.createTransactionFromTypedDescriptor(
  aggregateDescriptor,
  alice.publicKey,
  100,
  60 * 60 * 2,
  0
);

sig = alice.signTransaction(aggregateTx);
jsonPayload = facade.transactionFactory.static.attachSignature(aggregateTx, sig);
${ann}`,
      note: 'キーは文字列から作る64ビットの数値で、値は文字列（v3 ではバイト列）です。メタデータの登録は、アグリゲートトランザクションに包んでアナウンスします。同じキーに登録し直すと、値が上書きされます。',
    },
    practice: {
      title: '登録されたメタデータを一覧にする',
      q: 'alice が登録したメタデータを一覧取得し、キー（16進数）と値（文字列）を1件ずつ表示してください。例題で登録した nickname の値が表示されれば成功です。',
      hint: '7.4「確認」のコードを使います。v3 では値が16進数で返ってくるので、文字列に戻して表示します。',
      v2: r`metaRepo = repo.createMetadataRepository();
res = await metaRepo.search({
  targetAddress: alice.address,
  sourceAddress: alice.address
}).toPromise();
res.data.forEach(m => {
  console.log(m.metadataEntry.scopedMetadataKey.toHex(), m.metadataEntry.value);
});`,
      v3: r`query = new URLSearchParams({
  "targetAddress": alice.address.toString(),
  "sourceAddress": alice.address.toString(),
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
res.data.forEach(m => {
  console.log(
    m.metadataEntry.scopedMetadataKey,
    new TextDecoder().decode(sdkCore.utils.hexToUint8(m.metadataEntry.value))
  );
});`,
      note: 'キーは数値なので、一覧では16進数で表示されます。例題と同じ方法で "nickname" のキーを16進数にして見比べると、どの行が nickname か分かります。モザイクやネームスペースに登録したメタデータも、同じ一覧に含まれます。',
    },
  },

  // ---------- 第8章 ロック ----------
  8: {
    example: {
      title: 'シークレットとプルーフを作る',
      q: 'シークレットロックに使う、ロック用キーワード（secret）と解除用キーワード（proof）をランダムに作ってください。さらに、proof から計算し直したハッシュが secret と一致することを確認してください。',
      conds: ['ハッシュアルゴリズムは SHA3-256', 'proof は 20 バイトのランダムなデータ'],
      v2: r`sha3_256 = require('/node_modules/js-sha3').sha3_256;

random = sym.Crypto.randomBytes(20);
secret = sha3_256.create().update(random).hex(); // ロック用キーワード
proof = random.toString('hex');                  // 解除用キーワード

// proof（16進数文字列）から計算し直す
proofBytes = Uint8Array.from(proof.match(/../g).map(h => parseInt(h, 16)));
check = sha3_256.create().update(proofBytes).hex();
console.log(secret === check);`,
      v3: r`sha3_256 = (await import('https://cdn.skypack.dev/@noble/hashes/sha3')).sha3_256;

proof = crypto.getRandomValues(new Uint8Array(20));      // 解除用キーワード
secret = sha3_256.create().update(proof).digest();       // ロック用キーワード

// proof（16進数文字列）から計算し直す
proofHex = sdkCore.utils.uint8ToHex(proof);
check = sha3_256.create().update(sdkCore.utils.hexToUint8(proofHex)).digest();
console.log(sdkCore.utils.uint8ToHex(secret) === sdkCore.utils.uint8ToHex(check));`,
      note: 'secret は proof のハッシュ値です。ハッシュ値から元の proof を求めることはできないので、secret を公開してロックしても、proof を知っている人だけが解除できます。この secret と proof は、次の練習問題で使います。',
    },
    practice: {
      title: 'シークレットロックを作って解除する',
      q: '例題で作った secret を使って、alice が bob 宛てに 2XYM をシークレットロックしてください（期間は100ブロック）。ロックが承認されたら、bob が proof でロックを解除します。',
      conds: ['bob は解除のトランザクションの手数料を払うため、事前に 10XYM ほど持っていること（8.2 の bob を使う）'],
      hint: '8.2「シークレットロック・シークレットプルーフ」のコードを、金額と期間だけ変えて使います。解除（プルーフ）は、ロックが承認されてから実行します。',
      v2: [
        r`// ① alice が bob 宛てに 2XYM をシークレットロック
lockTx = sym.SecretLockTransaction.create(
  sym.Deadline.create(epochAdjustment),
  new sym.Mosaic(new sym.NamespaceId("symbol.xym"), sym.UInt64.fromUint(2000000)), // 2XYM
  sym.UInt64.fromUint(100), // ロック期間(ブロック数)
  sym.LockHashAlgorithm.Op_Sha3_256,
  secret,
  bob.address, // 解除時の転送先
  networkType
).setMaxFee(100);

signedLockTx = alice.sign(lockTx, generationHash);
await txRepo.announce(signedLockTx).toPromise();`,
        r`// ② ロックが承認されたら、bob がプルーフで解除
proofTx = sym.SecretProofTransaction.create(
  sym.Deadline.create(epochAdjustment),
  sym.LockHashAlgorithm.Op_Sha3_256,
  secret,
  bob.address,
  proof,
  networkType
).setMaxFee(100);

signedProofTx = bob.sign(proofTx, generationHash);
await txRepo.announce(signedProofTx).toPromise();`,
      ],
      v3: [
        r`// ① alice が bob 宛てに 2XYM をシークレットロック
namespaceIds = sdkSymbol.generateNamespacePath("symbol.xym");
namespaceId = namespaceIds[namespaceIds.length - 1];

lockDescriptor = new sdkSymbol.descriptors.SecretLockTransactionV1Descriptor(
  bob.address,
  secret,
  new sdkSymbol.descriptors.UnresolvedMosaicDescriptor(
    new sdkSymbol.models.UnresolvedMosaicId(namespaceId),
    new sdkSymbol.models.Amount(2000000n) // 2XYM
  ),
  new sdkSymbol.models.BlockDuration(100n), // ロック期間(ブロック数)
  sdkSymbol.models.LockHashAlgorithm.SHA3_256
);
lockTx = facade.createTransactionFromTypedDescriptor(
  lockDescriptor,
  alice.publicKey,
  100,
  60 * 60 * 2
);

sig = alice.signTransaction(lockTx);
jsonPayload = facade.transactionFactory.static.attachSignature(lockTx, sig);
${ann}`,
        r`// ② ロックが承認されたら、bob がプルーフで解除
proofDescriptor = new sdkSymbol.descriptors.SecretProofTransactionV1Descriptor(
  bob.address,
  secret,
  sdkSymbol.models.LockHashAlgorithm.SHA3_256,
  proof
);
proofTx = facade.createTransactionFromTypedDescriptor(
  proofDescriptor,
  bob.publicKey,
  100,
  60 * 60 * 2
);

sig = bob.signTransaction(proofTx);
jsonPayload = facade.transactionFactory.static.attachSignature(proofTx, sig);
${ann}`,
      ],
      note: 'ロック期間（100ブロック、約50分）を過ぎるとロックは失効し、2XYM は alice に戻ります。解除は、期間内に proof を知っている bob がプルーフをアナウンスしたときだけ成功します。',
    },
  },

  // ---------- 第9章 マルチシグ化 ----------
  9: {
    example: {
      title: 'マルチシグの構成を確認する',
      q: 'マルチシグ化した bob の情報を取得して、承認に必要な署名数（minApproval）と、連署者の人数を表示してください。',
      v2: r`msigRepo = repo.createMultisigRepository();
multisigInfo = await msigRepo.getMultisigAccountInfo(bob.address).toPromise();
console.log(multisigInfo.minApproval);
console.log(multisigInfo.cosignatoryAddresses.length);`,
      v3: r`multisigInfo = await fetch(
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
console.log(multisigInfo.minApproval);
console.log(multisigInfo.cosignatoryAddresses.length);`,
      note: '9.1 の構成では、連署者が4人（carol1〜carol4）、承認に必要な署名数が3なので、3 と 4 が表示されます。連署者のうち3人が署名すれば、bob の名前でトランザクションを実行できます。',
    },
    practice: {
      title: 'マルチシグアカウントから送信する',
      q: 'carol1 が起案者となり、carol2 と carol3 の連署を集めて、マルチシグアカウント bob から carol5 へ 2XYM を、メッセージ "practice" つきで送ってください。',
      conds: ['アグリゲートコンプリートトランザクションを使う', 'bob には、送金額と手数料をまかなえる XYM があること'],
      hint: '9.3「マルチシグ署名」のコードを、宛先・金額・メッセージだけ変えて使います。承認に必要な署名数は3です。起案者の署名も1人分に数えます。',
      v2: r`tx = sym.TransferTransaction.create(
  undefined,
  carol5.address,
  [new sym.Mosaic(new sym.NamespaceId("symbol.xym"), sym.UInt64.fromUint(2000000))], // 2XYM
  sym.PlainMessage.create('practice'),
  networkType
);

aggregateTx = sym.AggregateTransaction.createComplete(
  sym.Deadline.create(epochAdjustment),
  [tx.toAggregate(bob.publicAccount)], // 送信元はマルチシグアカウント bob
  networkType, [],
).setMaxFeeForAggregate(100, 2); // 連署者の数:2

signedTx = aggregateTx.signTransactionWithCosignatories(
  carol1,            // 起案者
  [carol2, carol3],  // 連署者
  generationHash,
);
await txRepo.announce(signedTx).toPromise();`,
      v3: r`namespaceIds = sdkSymbol.generateNamespacePath("symbol.xym");
namespaceId = namespaceIds[namespaceIds.length - 1];

descriptor = new sdkSymbol.descriptors.TransferTransactionV1Descriptor(
  carol5.address,
  [
    new sdkSymbol.descriptors.UnresolvedMosaicDescriptor(
      new sdkSymbol.models.UnresolvedMosaicId(namespaceId),
      new sdkSymbol.models.Amount(2000000n) // 2XYM
    )
  ],
  '\0practice'
);
tx = facade.createEmbeddedTransactionFromTypedDescriptor(
  descriptor,
  bob.publicKey, // 送信元はマルチシグアカウント bob
);

embeddedTransactions = [
  tx
];

aggregateDescriptor = new sdkSymbol.descriptors.AggregateCompleteTransactionV3Descriptor(
  facade.static.hashEmbeddedTransactions(embeddedTransactions),
  embeddedTransactions
);
aggregateTx = facade.createTransactionFromTypedDescriptor(
  aggregateDescriptor,
  carol1.publicKey, // 起案者
  100,
  60 * 60 * 2,
  2                 // 連署者数
);

// 起案者による署名
sig = carol1.signTransaction(aggregateTx);
jsonPayload = facade.transactionFactory.static.attachSignature(aggregateTx, sig);

// 連署者による連署
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
});`,
      note: '起案者 carol1 と連署者 2 人の合計 3 署名で、必要な署名数に届きます。連署者を carol2 の 1 人だけにすると署名数が足りず、トランザクションは承認されません。',
    },
  },

  // ---------- 第10章 監視 ----------
  10: {
    example: {
      title: '受信したトランザクションの送信者を表示する',
      q: 'alice 宛てのトランザクションが承認されたら、その送信者のアドレスを表示するようにしてください。',
      conds: ['10.1 のリスナー設定を実行済みであること', '確認は、bob などから alice へ少額を送って行う'],
      v2: r`listener.open().then(() => {
  listener.confirmed(alice.address).subscribe(tx => {
    console.log("from:", tx.signer.address.plain());
  });
});`,
      v3: r`channelName = ListenerChannelName.confirmedAdded + "/" + alice.address.toString();
addCallback(channelName, (data) => {
  signerPublicKey = new sdkCore.PublicKey(data.transaction.signerPublicKey);
  console.log("from:", facade.network.publicKeyToAddress(signerPublicKey).toString());
});
listener.send(JSON.stringify({
  uid: uid,
  subscribe: channelName,
}));`,
      note: '受信したトランザクションに入っているのは、送信者の「公開鍵」です。v2 は署名者の情報からアドレスを取り出せますが、v3 では公開鍵からアドレスを計算しています。見覚えのない送信者からの受信は、アドレスを確認してから扱いましょう。',
    },
    practice: {
      title: 'ブロックを3回だけ検知して監視をやめる',
      q: '新しいブロックが生成されたら高さを表示し、3回表示したら監視を終了（接続を閉じる）してください。',
      conds: ['10.1 のリスナー設定を実行済みであること'],
      hint: '10.3「ブロック監視」のコードに、回数を数える変数を足します。v2 は subscribe の戻り値の unsubscribe() と listener.close()、v3 は listener.close() で終了できます。',
      v2: r`count = 0;
listener.open().then(() => {
  sub = listener.newBlock().subscribe(block => {
    console.log(block.height.compact());
    count++;
    if (count >= 3) {
      sub.unsubscribe();
      listener.close();
    }
  });
});`,
      v3: r`count = 0;
addCallback(ListenerChannelName.block, (data) => {
  count++;
  if (count <= 3) {
    console.log("height:", data.block.height);
  }
  if (count === 3) {
    listener.close();
  }
});
listener.send(JSON.stringify({
  uid: uid,
  subscribe: ListenerChannelName.block,
}));`,
      note: '約30秒ごとにブロックが生成されるので、高さが3つ表示されたら終了です。常時接続し続ける必要がなければ、使い終わった接続は閉じておきましょう。閉じたあとにもう一度監視したいときは、10.1 のリスナー設定からやり直します。',
    },
  },

  // ---------- 第11章 制限 ----------
  11: {
    example: {
      title: '特定アドレスからの受信を拒否する',
      q: '使い捨てアカウント carol に、alice からの受信を拒否する設定をしてください。',
      conds: ['アドレス制限のブロックリスト（受信）を使う', '署名するのは carol（手数料用の XYM が必要）'],
      v2: r`tx = sym.AccountRestrictionTransaction.createAddressRestrictionModificationTransaction(
  sym.Deadline.create(epochAdjustment),
  sym.AddressRestrictionFlag.BlockIncomingAddress, // アドレス制限フラグ
  [alice.address], // 設定アドレス
  [],              // 解除アドレス
  networkType
).setMaxFee(100);
signedTx = carol.sign(tx, generationHash);
await txRepo.announce(signedTx).toPromise();`,
      v3: r`// 制限設定（アドレス・ブロック）
f = sdkSymbol.models.AccountRestrictionFlags.ADDRESS.value;
f += sdkSymbol.models.AccountRestrictionFlags.BLOCK.value;
flags = new sdkSymbol.models.AccountRestrictionFlags(f);

descriptor = new sdkSymbol.descriptors.AccountAddressRestrictionTransactionV1Descriptor(
  flags,
  [alice.address], // 設定アドレス
  []               // 解除アドレス
);
tx = facade.createTransactionFromTypedDescriptor(
  descriptor,
  carol.publicKey,
  100,
  60 * 60 * 2
);

sig = carol.signTransaction(tx);
jsonPayload = facade.transactionFactory.static.attachSignature(tx, sig);
${ann}`,
      note: '設定が承認されると、carol は alice からの受信ができなくなります。制限をかけるのは、制限を受ける側ではなく、制限を設定したいアカウント（ここでは carol）自身の署名です。',
    },
    practice: {
      title: '設定した制限を解除する',
      q: '例題で carol に設定した「alice からの受信拒否」を解除してください。',
      conds: ['署名するのは carol'],
      hint: '設定アドレスと解除アドレスの引数を入れ替えます。解除するときも、設定したときと同じフラグを指定します。',
      v2: r`tx = sym.AccountRestrictionTransaction.createAddressRestrictionModificationTransaction(
  sym.Deadline.create(epochAdjustment),
  sym.AddressRestrictionFlag.BlockIncomingAddress, // 設定したときと同じフラグ
  [],              // 設定アドレス
  [alice.address], // 解除アドレス
  networkType
).setMaxFee(100);
signedTx = carol.sign(tx, generationHash);
await txRepo.announce(signedTx).toPromise();`,
      v3: r`// 設定したときと同じフラグ
f = sdkSymbol.models.AccountRestrictionFlags.ADDRESS.value;
f += sdkSymbol.models.AccountRestrictionFlags.BLOCK.value;
flags = new sdkSymbol.models.AccountRestrictionFlags(f);

descriptor = new sdkSymbol.descriptors.AccountAddressRestrictionTransactionV1Descriptor(
  flags,
  [],              // 設定アドレス
  [alice.address]  // 解除アドレス
);
tx = facade.createTransactionFromTypedDescriptor(
  descriptor,
  carol.publicKey,
  100,
  60 * 60 * 2
);

sig = carol.signTransaction(tx);
jsonPayload = facade.transactionFactory.static.attachSignature(tx, sig);
${ann}`,
      note: '解除が承認されると、carol は alice から再び受信できるようになります。確かめるには、alice から carol へ少額を送ってみましょう。',
    },
  },

  // ---------- 第12章 オフライン署名 ----------
  12: {
    example: {
      title: 'ペイロードを復元して中身を確認する',
      q: '12.1 で作った署名済みペイロードからトランザクションを復元し、署名者の公開鍵と、アグリゲートに含まれるトランザクションの数を表示してください。',
      conds: ['12.1 のコードを実行済みであること'],
      v2: r`tx = sym.TransactionMapping.createFromPayload(signedPayload);
console.log(tx.signer.publicKey);
console.log(tx.innerTransactions.length);`,
      v3: r`tx = facade.transactionFactory.static.deserialize(sdkCore.utils.hexToUint8(JSON.parse(jsonPayload).payload));
console.log(tx.signerPublicKey.toString());
console.log(tx.transactions.length);`,
      note: '署名者の公開鍵は alice のもの、含まれるトランザクションは2つ（tx1 と tx2）です。オフライン署名では、連署者は受け取ったペイロードを復元して、中身を確かめてから署名します。',
    },
    practice: {
      title: '受け取ったペイロードのハッシュを確かめる',
      q: '復元したトランザクションから、ハッシュを自分で計算し直してください。そのハッシュが、alice が署名したときのハッシュと一致することを確認してください。',
      conds: ['12.1 のコードと、例題の復元を実行済みであること'],
      hint: '連署者は、起案者が署名したハッシュを知っていれば、ペイロードが途中で差し替えられていないかを確かめられます。v2 の計算には generationHash が必要です。',
      v2: r`Buffer = require("/node_modules/buffer").Buffer;
recalculated = sym.Transaction.createTransactionHash(signedPayload, Buffer.from(generationHash, 'hex'));
console.log(recalculated.toUpperCase() === signedHash.toUpperCase());`,
      v3: r`recalculated = facade.hashTransaction(tx).toString();
console.log(recalculated === facade.hashTransaction(aggregateTx).toString());`,
      note: 'true と表示されれば、受け取ったペイロードは、起案者が署名したものと同じ内容です。内容が1か所でも違えばハッシュは変わるので、すり替えを見つけられます。',
    },
  },

  // ---------- 第13章 検証 ----------
  13: {
    example: {
      title: '自分で計算したハッシュでノードに問い合わせる',
      q: '13.1 のペイロードからハッシュを自分で計算し、そのハッシュで承認済みトランザクションを取得してください。ノードが返したトランザクションのハッシュが、自分で計算した値と一致することを確認します。',
      conds: ['13.1 のペイロードの確認コードを実行済みであること（hash が計算済み）'],
      v2: r`txInfo = await txRepo.getTransaction(hash, sym.TransactionGroup.Confirmed).toPromise();
console.log(txInfo.transactionInfo.hash === hash);`,
      v3: r`txInfo = await fetch(
  new URL('/transactions/confirmed/' + hash.toString(), NODE),
  {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  }
)
.then((res) => res.json())
.then((json) => {
  return json;
});
console.log(txInfo.meta.hash === hash.toString());`,
      note: 'ノードに「このトランザクションを見せて」と頼むとき、見分けるための鍵を自分で計算しておくのが検証の出発点です。ただし、ノードが返した内容そのものが正しいかは、まだ確認できていません。それを確かめるのが、続く13.2 のブロックヘッダーの検証です。',
    },
    practice: {
      title: '2つのノードでブロックヘッダーを比べる',
      q: '13.1 のブロック高 height のブロックについて、接続中のノードと、別のノードから、それぞれトランザクションハッシュのルート（transactionsHash）を取得して、一致するか比べてください。',
      conds: ['otherNode は、動いている別のテストネットノードのURLに書き換える'],
      hint: 'ブロックヘッダーは、ノードを信用しなくても確かめられるように、複数のノードから取得して突き合わせるのが基本です。',
      runnable: false,
      v2: r`otherNode = "https://（別のテストネットノード）:3001"; // 書き換える
otherBlockRepo = new sym.RepositoryFactoryHttp(otherNode).createBlockRepository();

hashA = (await blockRepo.getBlockByHeight(height).toPromise()).blockTransactionsHash;
hashB = (await otherBlockRepo.getBlockByHeight(height).toPromise()).blockTransactionsHash;
console.log(hashA);
console.log(hashB);
console.log(hashA === hashB);`,
      v3: r`otherNode = "https://（別のテストネットノード）:3001"; // 書き換える

getTransactionsHash = async (baseUrl) => {
  return await fetch(
    new URL('/blocks/' + height, baseUrl),
    {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    }
  )
  .then((res) => res.json())
  .then((json) => {
    return json.block.transactionsHash;
  });
};

hashA = await getTransactionsHash(NODE);
hashB = await getTransactionsHash(otherNode);
console.log(hashA);
console.log(hashB);
console.log(hashA === hashB);`,
      note: '2つのノードで値が一致すれば、片方のノードだけが嘘をついている可能性は小さくなります。ブロックヘッダーが信用できれば、そこに含まれるルートのハッシュを手がかりに、トランザクションの存在も検証できます。',
    },
  },
};
