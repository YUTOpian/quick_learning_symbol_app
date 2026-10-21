// 速習Symbol 演習編 第4章（ネームスペース）のサンプルコード（例題・解答例・答え合わせ用コード）。
// 速習Symbol 第6章で学んだコードを組み合わせて作っている。
// コンソールでそのまま実行できるよう、const 宣言は付けていない（ch02〜ch13 と同じ方針。関数の中の const は付けてよい）。
// 注意: window.status・parent・name など、ブラウザがもともと持っている名前は変数名に使わない。
// 待つための関数（waitConfirmed など）は ch15/code.ts、ステータスを調べる関数（getStatus）は ex02/code.ts、
// モザイクを扱う関数（announceTx・makeMosaic・sendMosaics など）は ex03/code.ts のものを使う。
const r = String.raw;

// ---------- 共通関数の準備（第6章のコードを、関数にまとめたもの） ----------
export const toolsV2 = r`// ① 他の人と重ならない名前を作る関数（ルートネームスペースは早い者勝ちで、重複して取得できない）
randomName = () => 'ex' + Math.random().toString(36).slice(2, 10);

// ② ネームスペースIDの16進数を返す関数。path は 'xembook' や 'xembook.tomato' のように、ドットでつないだ名前
nsIdHex = (path) => new sym.NamespaceId(path).toHex();

// ③ ネームスペースの登録トランザクションをアナウンスする関数（ハッシュを返す）
// path にドットがなければルートネームスペース（days 日分をレンタル）。ドットがあればサブネームスペース（期間は不要）
announceNamespace = async (path, days = 30) => {
  const names = path.split('.');
  const last = names[names.length - 1];
  const tx = names.length === 1
    ? sym.NamespaceRegistrationTransaction.createRootNamespace(
        sym.Deadline.create(epochAdjustment),
        last,
        sym.UInt64.fromUint(days * 24 * 60 * 60 / 30), // 1ブロックを30秒として、日数をブロック数にする
        networkType
      ).setMaxFee(100)
    : sym.NamespaceRegistrationTransaction.createSubNamespace(
        sym.Deadline.create(epochAdjustment),
        last,
        names.slice(0, -1).join('.'), // 親のネームスペース
        networkType
      ).setMaxFee(100);
  return await announceTx(tx);
};

// ④ レンタルして、承認されるまで待つ関数（ネームスペースIDの16進数を返す）
registerNamespace = async (path, days = 30) => {
  await waitConfirmed(await announceNamespace(path, days));
  return nsIdHex(path);
};

// ⑤ ネームスペースの情報を調べる関数
// registrationType は 0: ルート / 1: サブ。aliasType は 0: リンクなし / 1: モザイク / 2: アドレス
getNsInfo = async (path) => {
  const info = await repo.createNamespaceRepository().getNamespace(new sym.NamespaceId(path)).toPromise();
  const a = info.alias;
  return {
    depth: info.levels.length,
    registrationType: info.registrationType,
    endHeight: info.endHeight.compact(),
    owner: info.ownerAddress.plain(),
    aliasType: a.type,
    aliasAddress: a.address ? a.address.plain() : undefined,
    aliasMosaic: a.mosaicId ? a.mosaicId.toHex() : undefined,
  };
};

// ⑥ ネームスペースを、アドレスにリンクする（link: true）・リンクを解除する（link: false）トランザクションをアナウンスする関数（ハッシュを返す）
announceAliasAddress = async (path, address, link = true) => {
  const tx = sym.AliasTransaction.createForAddress(
    sym.Deadline.create(epochAdjustment),
    link ? sym.AliasAction.Link : sym.AliasAction.Unlink,
    new sym.NamespaceId(path),
    address,
    networkType
  ).setMaxFee(100);
  return await announceTx(tx);
};

// ⑦ ネームスペースを、モザイクにリンクする・リンクを解除するトランザクションをアナウンスする関数（ハッシュを返す）。idHex はモザイクIDの16進数
announceAliasMosaic = async (path, idHex, link = true) => {
  const tx = sym.AliasTransaction.createForMosaic(
    sym.Deadline.create(epochAdjustment),
    link ? sym.AliasAction.Link : sym.AliasAction.Unlink,
    new sym.NamespaceId(path),
    new sym.MosaicId(idHex),
    networkType
  ).setMaxFee(100);
  return await announceTx(tx);
};
console.log('ready');`;
export const toolsV3 = r`// ① 他の人と重ならない名前を作る関数（ルートネームスペースは早い者勝ちで、重複して取得できない）
randomName = () => 'ex' + Math.random().toString(36).slice(2, 10);

// ② ネームスペースIDの16進数を返す関数。path は 'xembook' や 'xembook.tomato' のように、ドットでつないだ名前
nsIdHex = (path) => {
  const ids = sdkSymbol.generateNamespacePath(path);
  return ids[ids.length - 1].toString(16).toUpperCase().padStart(16, '0');
};

// ③ ネームスペースの登録トランザクションをアナウンスする関数（ハッシュを返す）
// path にドットがなければルートネームスペース（days 日分をレンタル）。ドットがあればサブネームスペース（期間は不要）
announceNamespace = async (path, days = 30) => {
  const names = path.split('.');
  const last = names[names.length - 1];
  const ids = sdkSymbol.generateNamespacePath(path);
  const isRoot = names.length === 1;
  const descriptor = new sdkSymbol.descriptors.NamespaceRegistrationTransactionV1Descriptor(
    new sdkSymbol.models.NamespaceId(ids[ids.length - 1]),
    isRoot ? sdkSymbol.models.NamespaceRegistrationType.ROOT : sdkSymbol.models.NamespaceRegistrationType.CHILD,
    isRoot ? new sdkSymbol.models.BlockDuration(BigInt(days * 24 * 60 * 60 / 30)) : undefined, // 1ブロックを30秒として、日数をブロック数にする
    isRoot ? undefined : ids[ids.length - 2], // 親のネームスペースID
    last
  );
  const tx = facade.createTransactionFromTypedDescriptor(
    descriptor,
    alice.publicKey,
    100,
    60 * 60 * 2
  );
  return await announceTx(tx);
};

// ④ レンタルして、承認されるまで待つ関数（ネームスペースIDの16進数を返す）
registerNamespace = async (path, days = 30) => {
  await waitConfirmed(await announceNamespace(path, days));
  return nsIdHex(path);
};

// ⑤ ネームスペースの情報を調べる関数
// registrationType は 0: ルート / 1: サブ。aliasType は 0: リンクなし / 1: モザイク / 2: アドレス
getNsInfo = async (path) => {
  const res = await fetch(new URL('/namespaces/' + nsIdHex(path), NODE)).then((res) => res.json());
  const ns = res.namespace;
  return {
    depth: ['level0', 'level1', 'level2'].filter((k) => ns[k] !== undefined).length,
    registrationType: Number(ns.registrationType),
    endHeight: Number(ns.endHeight),
    owner: hexToAddress(ns.ownerAddress),
    aliasType: Number(ns.alias.type),
    aliasAddress: ns.alias.address ? hexToAddress(ns.alias.address) : undefined,
    aliasMosaic: ns.alias.mosaicId,
  };
};

// ⑥ ネームスペースを、アドレスにリンクする（link: true）・リンクを解除する（link: false）トランザクションをアナウンスする関数（ハッシュを返す）
announceAliasAddress = async (path, address, link = true) => {
  const ids = sdkSymbol.generateNamespacePath(path);
  const descriptor = new sdkSymbol.descriptors.AddressAliasTransactionV1Descriptor(
    new sdkSymbol.models.NamespaceId(ids[ids.length - 1]),
    address,
    link ? sdkSymbol.models.AliasAction.LINK : sdkSymbol.models.AliasAction.UNLINK
  );
  const tx = facade.createTransactionFromTypedDescriptor(
    descriptor,
    alice.publicKey,
    100,
    60 * 60 * 2
  );
  return await announceTx(tx);
};

// ⑦ ネームスペースを、モザイクにリンクする・リンクを解除するトランザクションをアナウンスする関数（ハッシュを返す）。idHex はモザイクIDの16進数
announceAliasMosaic = async (path, idHex, link = true) => {
  const ids = sdkSymbol.generateNamespacePath(path);
  const descriptor = new sdkSymbol.descriptors.MosaicAliasTransactionV1Descriptor(
    new sdkSymbol.models.NamespaceId(ids[ids.length - 1]),
    new sdkSymbol.models.MosaicId(BigInt('0x' + idHex)),
    link ? sdkSymbol.models.AliasAction.LINK : sdkSymbol.models.AliasAction.UNLINK
  );
  const tx = facade.createTransactionFromTypedDescriptor(
    descriptor,
    alice.publicKey,
    100,
    60 * 60 * 2
  );
  return await announceTx(tx);
};

// ⑧ ノードが返すアドレス（16進数）を、画面に出すアドレス（文字列）に直す関数
hexToAddress = (hex) => new sdkSymbol.Address(sdkCore.utils.hexToUint8(hex)).toString();
console.log('ready');`;

// ---------- 演習1 名前・期間・手数料を、計算で確かめる ----------
export const e1V2 = r`// ① ネットワークから、レンタル手数料の単価を取得する
rentalFees = await repo.createNetworkRepository().getRentalFees().toPromise();
perBlock = rentalFees.effectiveRootNamespaceRentalFeePerBlock.compact(); // ルートネームスペース 1ブロックあたり（μXYM）
childFee = rentalFees.effectiveChildNamespaceRentalFee.compact();       // サブネームスペース 1つあたり（μXYM）

// ② 30日分のブロック数と、ルートネームスペースの手数料（1ブロックを30秒として計算）
rentalBlock = 30 * 24 * 60 * 60 / 30;
rootFee = rentalBlock * perBlock;
console.log('rentalBlock:', rentalBlock);
console.log('ルート30日分:', rootFee / 1000000, 'XYM');
console.log('サブ1つ:', childFee / 1000000, 'XYM');`;
export const e1V3 = r`// ① ネットワークから、レンタル手数料の単価を取得する
rentalFees = await fetch(new URL('/network/fees/rental', NODE)).then((res) => res.json());
perBlock = Number(rentalFees.effectiveRootNamespaceRentalFeePerBlock); // ルートネームスペース 1ブロックあたり（μXYM）
childFee = Number(rentalFees.effectiveChildNamespaceRentalFee);       // サブネームスペース 1つあたり（μXYM）

// ② 30日分のブロック数と、ルートネームスペースの手数料（1ブロックを30秒として計算）
rentalBlock = 30 * 24 * 60 * 60 / 30;
rootFee = rentalBlock * perBlock;
console.log('rentalBlock:', rentalBlock);
console.log('ルート30日分:', rootFee / 1000000, 'XYM');
console.log('サブ1つ:', childFee / 1000000, 'XYM');`;
export const t1Func = r`// ① ネームスペースの名前として使えるか（1〜64文字。使える文字は a-z, 0-9, _, -）
isValidNsName = (name) => /^[a-z0-9_-]{1,64}$/.test(name);

// ② 日数から、期間（ブロック数）へ。1ブロックを30秒とする。30日より短い・1825日より長いときは、エラーにする
toBlocks = (days) => {
  if (days < 30 || days > 1825) throw new Error('期間は、30日以上1825日以下にしてください');
  return days * 24 * 60 * 60 / 30;
};

// ③ ルートネームスペースの手数料の合計（μXYM）。perBlock は 1ブロックあたりの手数料（μXYM）
calcRootFee = (days, perBlock) => toBlocks(days) * perBlock;

console.log(isValidNsName('xembook'), toBlocks(365), calcRootFee(365, 200));`;
export const t1Check = r`console.log(isValidNsName('xembook') && isValidNsName('a_b-c1') && isValidNsName('a'.repeat(64)) && !isValidNsName('Xembook') && !isValidNsName('a'.repeat(65)) && !isValidNsName('a.b') && !isValidNsName('') ? '✅ ① 使える名前かどうかを判定できました' : '❌ ① isValidNsName の結果が違います');
errOf = (days) => { try { toBlocks(days); return false; } catch (e) { return true; } };
console.log(toBlocks(30) === 86400 && toBlocks(365) === 1051200 && errOf(29) && errOf(1826) && !errOf(1825) ? '✅ ② 日数をブロック数に直せました' : '❌ ② toBlocks の結果が違います');
console.log(calcRootFee(365, 200) === 210240000 && calcRootFee(30, 200) === 17280000 ? '✅ ③ 手数料を計算できました（365日分で 210.24 XYM）' : '❌ ③ calcRootFee の結果が違います');`;

// ---------- 演習2 ルートとサブをレンタルして、有効期限を調べる ----------
export const e2V2 = r`// ① 他の人と重ならない名前を作って、ルートネームスペースを30日分（86400 ブロック）レンタルする
rootName = randomName();
rootTx = sym.NamespaceRegistrationTransaction.createRootNamespace(
  sym.Deadline.create(epochAdjustment),
  rootName,
  sym.UInt64.fromUint(86400),
  networkType
).setMaxFee(100);
await waitConfirmed(await announceTx(rootTx));

// ② サブネームスペース rootName.shop をレンタルする（サブには、期間の指定がない）
subTx = sym.NamespaceRegistrationTransaction.createSubNamespace(
  sym.Deadline.create(epochAdjustment),
  'shop',
  rootName, // 親のネームスペース
  networkType
).setMaxFee(100);
await waitConfirmed(await announceTx(subTx));

// ③ 情報を確かめる（共通関数の getNsInfo を使う）
rootInfo = await getNsInfo(rootName);
subInfo = await getNsInfo(rootName + '.shop');
console.log(rootInfo.registrationType, rootInfo.depth); // 0 1
console.log(subInfo.registrationType, subInfo.depth);   // 1 2
console.log(rootInfo.endHeight === subInfo.endHeight);  // true`;
export const e2V3 = r`// ① 他の人と重ならない名前を作って、ルートネームスペースを30日分（86400 ブロック）レンタルする
rootName = randomName();
rootDescriptor = new sdkSymbol.descriptors.NamespaceRegistrationTransactionV1Descriptor(
  new sdkSymbol.models.NamespaceId(sdkSymbol.generateNamespaceId(rootName)),
  sdkSymbol.models.NamespaceRegistrationType.ROOT,
  new sdkSymbol.models.BlockDuration(86400n),
  undefined,
  rootName
);
rootTx = facade.createTransactionFromTypedDescriptor(rootDescriptor, alice.publicKey, 100, 60 * 60 * 2);
await waitConfirmed(await announceTx(rootTx));

// ② サブネームスペース rootName.shop をレンタルする（サブには、期間の指定がない）
parentNameId = sdkSymbol.generateNamespaceId(rootName); // 親のネームスペース
subDescriptor = new sdkSymbol.descriptors.NamespaceRegistrationTransactionV1Descriptor(
  new sdkSymbol.models.NamespaceId(sdkSymbol.generateNamespaceId('shop', parentNameId)),
  sdkSymbol.models.NamespaceRegistrationType.CHILD,
  undefined,
  parentNameId,
  'shop'
);
subTx = facade.createTransactionFromTypedDescriptor(subDescriptor, alice.publicKey, 100, 60 * 60 * 2);
await waitConfirmed(await announceTx(subTx));

// ③ 情報を確かめる（共通関数の getNsInfo を使う）
rootInfo = await getNsInfo(rootName);
subInfo = await getNsInfo(rootName + '.shop');
console.log(rootInfo.registrationType, rootInfo.depth); // 0 1
console.log(subInfo.registrationType, subInfo.depth);   // 1 2
console.log(rootInfo.endHeight === subInfo.endHeight);  // true`;
export const t2V2a = r`// ① ルートネームスペースと、2階層のサブネームスペースを、レンタルする（共通関数の registerNamespace を使う）
shopRoot = randomName();
await registerNamespace(shopRoot);
await registerNamespace(shopRoot + '.tokyo');
await registerNamespace(shopRoot + '.tokyo.cafe');
cafeInfo = await getNsInfo(shopRoot + '.tokyo.cafe');
console.log(cafeInfo.depth, cafeInfo.registrationType);`;
export const t2V2b = r`// ② すでに他の人（や、予約済み）の名前を、ルートネームスペースとして、取得してみる（失敗するはず）
hashTaken = await announceNamespace('symbol');
statusTaken = null;
for (let i = 0; i < 24; i++) {
  statusTaken = await getStatus(hashTaken);
  if (statusTaken && (statusTaken.group === 'confirmed' || statusTaken.group === 'failed')) break;
  await sleep(5000);
}
console.log(statusTaken ? statusTaken.group + ' / ' + statusTaken.code : '見つかりませんでした');`;
export const t2V2c = r`// ③ ルートネームスペースの有効期限（日時）を調べる関数
getEndDate = async (path) => {
  const nsInfo = await repo.createNamespaceRepository().getNamespace(new sym.NamespaceId(path)).toPromise();
  const lastHeight = (await repo.createChainRepository().getChainInfo().toPromise()).height;
  const lastBlock = await repo.createBlockRepository().getBlockByHeight(lastHeight).toPromise();
  const remainHeight = nsInfo.endHeight.compact() - lastHeight.compact(); // 終了までの、残りブロック数
  return new Date(lastBlock.timestamp.compact() + remainHeight * 30000 + epochAdjustment * 1000);
};
endDate = await getEndDate(shopRoot);
console.log(endDate);`;
export const t2V3a = r`// ① ルートネームスペースと、2階層のサブネームスペースを、レンタルする（共通関数の registerNamespace を使う）
shopRoot = randomName();
await registerNamespace(shopRoot);
await registerNamespace(shopRoot + '.tokyo');
await registerNamespace(shopRoot + '.tokyo.cafe');
cafeInfo = await getNsInfo(shopRoot + '.tokyo.cafe');
console.log(cafeInfo.depth, cafeInfo.registrationType);`;
export const t2V3b = r`// ② すでに他の人（や、予約済み）の名前を、ルートネームスペースとして、取得してみる（失敗するはず）
hashTaken = await announceNamespace('symbol');
statusTaken = null;
for (let i = 0; i < 24; i++) {
  statusTaken = await getStatus(hashTaken);
  if (statusTaken && (statusTaken.group === 'confirmed' || statusTaken.group === 'failed')) break;
  await sleep(5000);
}
console.log(statusTaken ? statusTaken.group + ' / ' + statusTaken.code : '見つかりませんでした');`;
export const t2V3c = r`// ③ ルートネームスペースの有効期限（日時）を調べる関数
getEndDate = async (path) => {
  const nsInfo = await getNsInfo(path);
  const chainInfo = await fetch(new URL('/chain/info', NODE)).then((res) => res.json());
  const lastHeight = Number(chainInfo.height);
  const lastBlock = await fetch(new URL('/blocks/' + lastHeight, NODE)).then((res) => res.json());
  const remainHeight = nsInfo.endHeight - lastHeight; // 終了までの、残りブロック数
  return new Date(Number(lastBlock.block.timestamp) + remainHeight * 30000 + epochAdjustment * 1000);
};
endDate = await getEndDate(shopRoot);
console.log(endDate);`;
export const t2Check = r`console.log(cafeInfo.depth === 3 && cafeInfo.registrationType === 1 ? '✅ ① 2階層のサブネームスペース（全部で3階層）を作れました' : '❌ ① cafeInfo が違います');
console.log(statusTaken && statusTaken.group === 'failed' ? '✅ ② すでにある名前は、ルートネームスペースとして取得できませんでした（' + statusTaken.code + '）' : '❌ ② ステータスが failed になっていません');
daysLeft = (endDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000);
console.log(daysLeft > 28 && daysLeft < 32 ? '✅ ③ 有効期限は、約 ' + daysLeft.toFixed(1) + ' 日後です' : '❌ ③ 有効期限が違います（約 ' + daysLeft.toFixed(1) + ' 日後）');`;

// ---------- 演習3 アドレスとモザイクにリンクする ----------
export const e3V2 = r`// ① ルートネームスペースをレンタルする
aliasName = randomName();
await registerNamespace(aliasName);

// ② bob のアドレスにリンクする（リンク先のアドレスは、自分が所有していなくてもよい）
bob = sym.Account.generateNewAccount(networkType);
linkTx = sym.AliasTransaction.createForAddress(
  sym.Deadline.create(epochAdjustment),
  sym.AliasAction.Link,
  new sym.NamespaceId(aliasName),
  bob.address,
  networkType
).setMaxFee(100);
await waitConfirmed(await announceTx(linkTx));

// ③ ネームスペースの情報で、リンク先を確かめる
linkInfo = await getNsInfo(aliasName);
console.log(linkInfo.aliasType, linkInfo.aliasAddress === bob.address.plain()); // 2 true`;
export const e3V3 = r`// ① ルートネームスペースをレンタルする
aliasName = randomName();
await registerNamespace(aliasName);

// ② bob のアドレスにリンクする（リンク先のアドレスは、自分が所有していなくてもよい）
bob = facade.createAccount(sdkCore.PrivateKey.random());
aliasIds = sdkSymbol.generateNamespacePath(aliasName);
linkDescriptor = new sdkSymbol.descriptors.AddressAliasTransactionV1Descriptor(
  new sdkSymbol.models.NamespaceId(aliasIds[aliasIds.length - 1]),
  bob.address,
  sdkSymbol.models.AliasAction.LINK
);
linkTx = facade.createTransactionFromTypedDescriptor(linkDescriptor, alice.publicKey, 100, 60 * 60 * 2);
await waitConfirmed(await announceTx(linkTx));

// ③ ネームスペースの情報で、リンク先を確かめる
linkInfo = await getNsInfo(aliasName);
console.log(linkInfo.aliasType, linkInfo.aliasAddress === bob.address.toString()); // 2 true`;
export const t3V2a = r`// ① ルートネームスペース aliasRoot と、サブネームスペース aliasRoot.coin を、レンタルする
aliasRoot = randomName();
await registerNamespace(aliasRoot);
await registerNamespace(aliasRoot + '.coin');

// ② bob・carol と、alice が作ったモザイクを用意する
bob = sym.Account.generateNewAccount(networkType);
carol = sym.Account.generateNewAccount(networkType);
coinId = await makeMosaic({ divisibility: 0, supply: 1000 });

// ③ aliasRoot を、bob のアドレスにリンクする
await waitConfirmed(await announceAliasAddress(aliasRoot, bob.address));`;
export const t3V2b = r`// ④ bob にリンクしたまま、carol にもリンクしてみる（失敗するはず）
hashDup = await announceAliasAddress(aliasRoot, carol.address);
statusDup = null;
for (let i = 0; i < 24; i++) {
  statusDup = await getStatus(hashDup);
  if (statusDup && (statusDup.group === 'confirmed' || statusDup.group === 'failed')) break;
  await sleep(5000);
}
console.log(statusDup ? statusDup.group + ' / ' + statusDup.code : '見つかりませんでした');`;
export const t3V2c = r`// ⑤ bob とのリンクを解除（link を false に）してから、carol にリンクし直す
await waitConfirmed(await announceAliasAddress(aliasRoot, bob.address, false));
await waitConfirmed(await announceAliasAddress(aliasRoot, carol.address));
rootInfo = await getNsInfo(aliasRoot);
console.log(rootInfo.aliasAddress === carol.address.plain());`;
export const t3V2d = r`// ⑥ aliasRoot.coin を、XYM のモザイクにリンクしてみる（失敗するはず。XYM を作ったのは、alice ではない）
hashXym = await announceAliasMosaic(aliasRoot + '.coin', '72C0212E67A08BCE');
statusXym = null;
for (let i = 0; i < 24; i++) {
  statusXym = await getStatus(hashXym);
  if (statusXym && (statusXym.group === 'confirmed' || statusXym.group === 'failed')) break;
  await sleep(5000);
}
console.log(statusXym ? statusXym.group + ' / ' + statusXym.code : '見つかりませんでした');

// ⑦ aliasRoot.coin を、alice が作ったモザイクにリンクする
await waitConfirmed(await announceAliasMosaic(aliasRoot + '.coin', coinId));
coinInfo = await getNsInfo(aliasRoot + '.coin');
console.log(coinInfo.aliasType, coinInfo.aliasMosaic === coinId);`;
export const t3V3a = r`// ① ルートネームスペース aliasRoot と、サブネームスペース aliasRoot.coin を、レンタルする
aliasRoot = randomName();
await registerNamespace(aliasRoot);
await registerNamespace(aliasRoot + '.coin');

// ② bob・carol と、alice が作ったモザイクを用意する
bob = facade.createAccount(sdkCore.PrivateKey.random());
carol = facade.createAccount(sdkCore.PrivateKey.random());
coinId = await makeMosaic({ divisibility: 0, supply: 1000 });

// ③ aliasRoot を、bob のアドレスにリンクする
await waitConfirmed(await announceAliasAddress(aliasRoot, bob.address));`;
export const t3V3b = t3V2b;
export const t3V3c = r`// ⑤ bob とのリンクを解除（link を false に）してから、carol にリンクし直す
await waitConfirmed(await announceAliasAddress(aliasRoot, bob.address, false));
await waitConfirmed(await announceAliasAddress(aliasRoot, carol.address));
rootInfo = await getNsInfo(aliasRoot);
console.log(rootInfo.aliasAddress === carol.address.toString());`;
export const t3V3d = t3V2d;
export const t3CheckV2 = r`console.log(statusDup && statusDup.group === 'failed' ? '✅ ④ リンク中のネームスペースを、そのまま別のアドレスにリンクすることはできませんでした（' + statusDup.code + '）' : '❌ ④ statusDup が failed になっていません');
console.log(rootInfo.aliasType === 2 && rootInfo.aliasAddress === carol.address.plain() ? '✅ ⑤ リンクを解除して、carol にリンクし直せました' : '❌ ⑤ rootInfo のリンク先が carol になっていません');
console.log(statusXym && statusXym.group === 'failed' ? '✅ ⑥ 他の人が作ったモザイクには、リンクできませんでした（' + statusXym.code + '）' : '❌ ⑥ statusXym が failed になっていません');
console.log(coinInfo.aliasType === 1 && coinInfo.aliasMosaic === coinId ? '✅ ⑦ 自分が作ったモザイクにリンクできました' : '❌ ⑦ coinInfo のリンク先が coinId になっていません');`;
export const t3CheckV3 = r`console.log(statusDup && statusDup.group === 'failed' ? '✅ ④ リンク中のネームスペースを、そのまま別のアドレスにリンクすることはできませんでした（' + statusDup.code + '）' : '❌ ④ statusDup が failed になっていません');
console.log(rootInfo.aliasType === 2 && rootInfo.aliasAddress === carol.address.toString() ? '✅ ⑤ リンクを解除して、carol にリンクし直せました' : '❌ ⑤ rootInfo のリンク先が carol になっていません');
console.log(statusXym && statusXym.group === 'failed' ? '✅ ⑥ 他の人が作ったモザイクには、リンクできませんでした（' + statusXym.code + '）' : '❌ ⑥ statusXym が failed になっていません');
console.log(coinInfo.aliasType === 1 && coinInfo.aliasMosaic === coinId ? '✅ ⑦ 自分が作ったモザイクにリンクできました' : '❌ ⑦ coinInfo のリンク先が coinId になっていません');`;

// ---------- 演習4 名前のまま送る（未解決で使用） ----------
export const e4V2 = r`// ① ルートネームスペースをレンタルして、bob のアドレスにリンクする（演習3と同じ）
nameRoot = randomName();
await registerNamespace(nameRoot);
bob = sym.Account.generateNewAccount(networkType);
await waitConfirmed(await announceAliasAddress(nameRoot, bob.address));

// ② 送信先も、送信モザイクも、名前のまま指定する（UnresolvedAccount・UnresolvedMosaic）
tx = sym.TransferTransaction.create(
  sym.Deadline.create(epochAdjustment),
  new sym.NamespaceId(nameRoot), // 送信先: 名前（アドレスは、チェーン側で解決される）
  [
    new sym.Mosaic(
      new sym.NamespaceId('symbol.xym'), // 送信モザイク: XYM の名前
      sym.UInt64.fromUint(100000)         // 0.1 XYM
    ),
  ],
  sym.EmptyMessage,
  networkType
).setMaxFee(100);
await waitConfirmed(await announceTx(tx));

// ③ bob の XYM を確かめる（テストネットの XYM のモザイクIDは 72C0212E67A08BCE）
console.log(await getAmount(bob, '72C0212E67A08BCE')); // '100000'`;
export const e4V3 = r`// ① ルートネームスペースをレンタルして、bob のアドレスにリンクする（演習3と同じ）
nameRoot = randomName();
await registerNamespace(nameRoot);
bob = facade.createAccount(sdkCore.PrivateKey.random());
await waitConfirmed(await announceAliasAddress(nameRoot, bob.address));

// ② 送信先も、送信モザイクも、名前のまま指定する（UnresolvedAccount・UnresolvedMosaic）
nameIds = sdkSymbol.generateNamespacePath(nameRoot);
unresolvedAccount = sdkSymbol.Address.fromNamespaceId(
  new sdkSymbol.models.NamespaceId(nameIds[nameIds.length - 1]),
  networkType
); // 送信先: 名前（アドレスは、チェーン側で解決される）
xymIds = sdkSymbol.generateNamespacePath('symbol.xym');
descriptor = new sdkSymbol.descriptors.TransferTransactionV1Descriptor(
  unresolvedAccount,
  [
    new sdkSymbol.descriptors.UnresolvedMosaicDescriptor(
      new sdkSymbol.models.UnresolvedMosaicId(xymIds[xymIds.length - 1]), // 送信モザイク: XYM の名前
      new sdkSymbol.models.Amount(100000n)                                  // 0.1 XYM
    )
  ],
  new Uint8Array()
);
tx = facade.createTransactionFromTypedDescriptor(descriptor, alice.publicKey, 100, 60 * 60 * 2);
await waitConfirmed(await announceTx(tx));

// ③ bob の XYM を確かめる（テストネットの XYM のモザイクIDは 72C0212E67A08BCE）
console.log(await getAmount(bob, '72C0212E67A08BCE')); // '100000'`;
export const t4V2a = r`// ① ルートネームスペース payRoot と、サブネームスペース payRoot.point を、レンタルする
payRoot = randomName();
await registerNamespace(payRoot);
await registerNamespace(payRoot + '.point');

// ② bob と、ポイント（可分性 0・供給量 10000）を用意して、名前をリンクする
bob = sym.Account.generateNewAccount(networkType);
pointId = await makeMosaic({ divisibility: 0, supply: 10000 });
await waitConfirmed(await announceAliasAddress(payRoot, bob.address));
await waitConfirmed(await announceAliasMosaic(payRoot + '.point', pointId));`;
export const t4V2b = r`// ③ 送信先も、ポイントも、XYM も、名前のまま指定して、1つの転送トランザクションで送る
// sendMosaics は、IDの小さい順に並べ替えてくれる。送信先には、ネームスペースIDを渡す
payHash = await sendMosaics(alice, new sym.NamespaceId(payRoot), [
  [nsIdHex('symbol.xym'), 200000],         // XYM 0.2
  [nsIdHex(payRoot + '.point'), 50],        // ポイント 50
]);
await waitConfirmed(payHash);

// ④ bob の所有量を確かめる
amountsBob = {
  xym: await getAmount(bob, '72C0212E67A08BCE'),
  point: await getAmount(bob, pointId),
};
console.log(amountsBob);`;
export const t4V3a = r`// ① ルートネームスペース payRoot と、サブネームスペース payRoot.point を、レンタルする
payRoot = randomName();
await registerNamespace(payRoot);
await registerNamespace(payRoot + '.point');

// ② bob と、ポイント（可分性 0・供給量 10000）を用意して、名前をリンクする
bob = facade.createAccount(sdkCore.PrivateKey.random());
pointId = await makeMosaic({ divisibility: 0, supply: 10000 });
await waitConfirmed(await announceAliasAddress(payRoot, bob.address));
await waitConfirmed(await announceAliasMosaic(payRoot + '.point', pointId));`;
export const t4V3b = r`// ③ 送信先も、ポイントも、XYM も、名前のまま指定して、1つの転送トランザクションで送る
// sendMosaics は、IDの小さい順に並べ替えてくれる。送信先には、名前から作った UnresolvedAccount を渡す
payIds = sdkSymbol.generateNamespacePath(payRoot);
unresolvedPay = sdkSymbol.Address.fromNamespaceId(new sdkSymbol.models.NamespaceId(payIds[payIds.length - 1]), networkType);
payHash = await sendMosaics(alice, unresolvedPay, [
  [nsIdHex('symbol.xym'), 200000],         // XYM 0.2
  [nsIdHex(payRoot + '.point'), 50],        // ポイント 50
]);
await waitConfirmed(payHash);

// ④ bob の所有量を確かめる
amountsBob = {
  xym: await getAmount(bob, '72C0212E67A08BCE'),
  point: await getAmount(bob, pointId),
};
console.log(amountsBob);`;
export const t4Check = r`console.log(amountsBob.xym === '200000' && amountsBob.point === '50'
  ? '✅ ③④ 名前のまま送った XYM 0.2 と ポイント 50 が、bob に届きました'
  : '❌ ③④ bob の所有量が違います: ' + JSON.stringify(amountsBob));`;

// ---------- 演習5 リンク先を変えても、過去の送信先はレシートで分かる ----------
export const e5V2 = r`// ① 逆引き: XYM のモザイクIDに、リンクしているネームスペースを調べる
mosaicNames = await repo.createNamespaceRepository().getMosaicsNames([new sym.MosaicId('72C0212E67A08BCE')]).toPromise();
console.log(mosaicNames[0].names.map((n) => n.namespaceId.toHex()));
console.log(mosaicNames[0].names.some((n) => n.namespaceId.toHex() === nsIdHex('symbol.xym'))); // true

// ② symbol.xym という名前で、bob へ XYM 0.1 を送る（送信先は、アドレスのまま）
bob = sym.Account.generateNewAccount(networkType);
tx = sym.TransferTransaction.create(
  sym.Deadline.create(epochAdjustment),
  bob.address,
  [new sym.Mosaic(new sym.NamespaceId('symbol.xym'), sym.UInt64.fromUint(100000))],
  sym.EmptyMessage,
  networkType
).setMaxFee(100);
confirmed = await waitConfirmed(await announceTx(tx));
txHeight = confirmed.transactionInfo.height.compact(); // 取り込まれたブロック高

// ③ そのブロックの、モザイクのレシート（名前が、何に解決されたかの記録）を調べる
page = await repo.createReceiptRepository()
  .searchMosaicResolutionStatements({ height: sym.UInt64.fromUint(txHeight) }).toPromise();
statement = page.data.find((s) => s.unresolved.toHex() === nsIdHex('symbol.xym'));
console.log(statement.resolutionEntries[0].resolved.toHex()); // 72C0212E67A08BCE`;
export const e5V3 = r`// ① 逆引き: XYM のモザイクIDに、リンクしているネームスペースを調べる
mosaicNames = await fetch(
  new URL('/namespaces/mosaic/names', NODE),
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mosaicIds: ['72C0212E67A08BCE'] }),
  }
).then((res) => res.json()).then((json) => json.mosaicNames);
console.log(mosaicNames[0].names); // XYM にリンクしている名前の一覧

// ② symbol.xym という名前で、bob へ XYM 0.1 を送る（送信先は、アドレスのまま）
bob = facade.createAccount(sdkCore.PrivateKey.random());
xymIds = sdkSymbol.generateNamespacePath('symbol.xym');
descriptor = new sdkSymbol.descriptors.TransferTransactionV1Descriptor(
  bob.address,
  [
    new sdkSymbol.descriptors.UnresolvedMosaicDescriptor(
      new sdkSymbol.models.UnresolvedMosaicId(xymIds[xymIds.length - 1]),
      new sdkSymbol.models.Amount(100000n)
    )
  ],
  new Uint8Array()
);
tx = facade.createTransactionFromTypedDescriptor(descriptor, alice.publicKey, 100, 60 * 60 * 2);
confirmed = await waitConfirmed(await announceTx(tx));
txHeight = Number(confirmed.meta.height); // 取り込まれたブロック高

// ③ そのブロックの、モザイクのレシート（名前が、何に解決されたかの記録）を調べる
query = new URLSearchParams({ height: String(txHeight) });
state = await fetch(new URL('/statements/resolutions/mosaic?' + query.toString(), NODE)).then((res) => res.json());
statement = state.data.map((d) => d.statement).find((s) => s.unresolved.toUpperCase() === nsIdHex('symbol.xym'));
console.log(statement.resolutionEntries[0].resolved); // 72C0212E67A08BCE`;
export const t5V2a = r`// ① ルートネームスペース histRoot をレンタルして、bob のアドレスにリンクする
histRoot = randomName();
await registerNamespace(histRoot);
bob = sym.Account.generateNewAccount(networkType);
carol = sym.Account.generateNewAccount(networkType);
await waitConfirmed(await announceAliasAddress(histRoot, bob.address));

// ② 名前を送信先にして、XYM 0.1 を送る（1回目）
confirmedA = await waitConfirmed(await sendMosaics(alice, new sym.NamespaceId(histRoot), [['72C0212E67A08BCE', 100000]]));
heightA = confirmedA.transactionInfo.height.compact();`;
export const t5V2b = r`// ③ bob とのリンクを解除して、carol にリンクし直してから、同じ名前に、もう一度送る（2回目）
await waitConfirmed(await announceAliasAddress(histRoot, bob.address, false));
await waitConfirmed(await announceAliasAddress(histRoot, carol.address));
confirmedB = await waitConfirmed(await sendMosaics(alice, new sym.NamespaceId(histRoot), [['72C0212E67A08BCE', 100000]]));
heightB = confirmedB.transactionInfo.height.compact();`;
export const t5V2c = r`// ④ ブロック高と名前から、レシートに残っている「解決先のアドレス」を調べる関数
resolvedAt = async (height, path) => {
  const page = await repo.createReceiptRepository()
    .searchAddressResolutionStatements({ height: sym.UInt64.fromUint(height) }).toPromise();
  const found = page.data.find((s) => s.unresolved.toHex() === nsIdHex(path));
  return found.resolutionEntries[0].resolved.plain();
};
resolvedA = await resolvedAt(heightA, histRoot); // 1回目に解決されたアドレス
resolvedB = await resolvedAt(heightB, histRoot); // 2回目に解決されたアドレス
nowAddress = (await getNsInfo(histRoot)).aliasAddress; // いまのリンク先
console.log(resolvedA, resolvedB, nowAddress);`;
export const t5V3a = r`// ① ルートネームスペース histRoot をレンタルして、bob のアドレスにリンクする
histRoot = randomName();
await registerNamespace(histRoot);
bob = facade.createAccount(sdkCore.PrivateKey.random());
carol = facade.createAccount(sdkCore.PrivateKey.random());
await waitConfirmed(await announceAliasAddress(histRoot, bob.address));

// ② 名前を送信先にして、XYM 0.1 を送る（1回目）。名前から、UnresolvedAccount を作る関数を使う
unresolvedOf = (path) => {
  const ids = sdkSymbol.generateNamespacePath(path);
  return sdkSymbol.Address.fromNamespaceId(new sdkSymbol.models.NamespaceId(ids[ids.length - 1]), networkType);
};
confirmedA = await waitConfirmed(await sendMosaics(alice, unresolvedOf(histRoot), [['72C0212E67A08BCE', 100000]]));
heightA = Number(confirmedA.meta.height);`;
export const t5V3b = r`// ③ bob とのリンクを解除して、carol にリンクし直してから、同じ名前に、もう一度送る（2回目）
await waitConfirmed(await announceAliasAddress(histRoot, bob.address, false));
await waitConfirmed(await announceAliasAddress(histRoot, carol.address));
confirmedB = await waitConfirmed(await sendMosaics(alice, unresolvedOf(histRoot), [['72C0212E67A08BCE', 100000]]));
heightB = Number(confirmedB.meta.height);`;
export const t5V3c = r`// ④ ブロック高と名前から、レシートに残っている「解決先のアドレス」を調べる関数
resolvedAt = async (height, path) => {
  const query = new URLSearchParams({ height: String(height) });
  const state = await fetch(new URL('/statements/resolutions/address?' + query.toString(), NODE)).then((res) => res.json());
  const unresolvedHex = sdkCore.utils.uint8ToHex(unresolvedOf(path).bytes);
  const found = state.data.map((d) => d.statement).find((s) => s.unresolved.toUpperCase() === unresolvedHex);
  return hexToAddress(found.resolutionEntries[0].resolved);
};
resolvedA = await resolvedAt(heightA, histRoot); // 1回目に解決されたアドレス
resolvedB = await resolvedAt(heightB, histRoot); // 2回目に解決されたアドレス
nowAddress = (await getNsInfo(histRoot)).aliasAddress; // いまのリンク先
console.log(resolvedA, resolvedB, nowAddress);`;
export const t5CheckV2 = r`console.log(heightA < heightB ? '✅ ② ③ 1回目と2回目は、別のブロックに取り込まれました' : '❌ ② ③ heightA と heightB が違います');
console.log(resolvedA === bob.address.plain() ? '✅ ④ 1回目は、レシートに bob のアドレスが残っています' : '❌ ④ resolvedA が bob のアドレスではありません');
console.log(resolvedB === carol.address.plain() ? '✅ ④ 2回目は、レシートに carol のアドレスが残っています' : '❌ ④ resolvedB が carol のアドレスではありません');
console.log(nowAddress === carol.address.plain() && resolvedA !== nowAddress ? '✅ いまのリンク先（carol）は、1回目の解決先（bob）とは違います。過去の送信先は、レシートで調べます' : '❌ nowAddress が違います');`;
export const t5CheckV3 = r`console.log(heightA < heightB ? '✅ ② ③ 1回目と2回目は、別のブロックに取り込まれました' : '❌ ② ③ heightA と heightB が違います');
console.log(resolvedA === bob.address.toString() ? '✅ ④ 1回目は、レシートに bob のアドレスが残っています' : '❌ ④ resolvedA が bob のアドレスではありません');
console.log(resolvedB === carol.address.toString() ? '✅ ④ 2回目は、レシートに carol のアドレスが残っています' : '❌ ④ resolvedB が carol のアドレスではありません');
console.log(nowAddress === carol.address.toString() && resolvedA !== nowAddress ? '✅ いまのリンク先（carol）は、1回目の解決先（bob）とは違います。過去の送信先は、レシートで調べます' : '❌ nowAddress が違います');`;
