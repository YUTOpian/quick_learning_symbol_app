// 速習Symbol 演習編 第5章（メタデータ）のサンプルコード（例題・解答例・答え合わせ用コード）。
// 速習Symbol 第7章で学んだコードを組み合わせて作っている。
// コンソールでそのまま実行できるよう、const 宣言は付けていない（ch02〜ch13 と同じ方針。関数の中の const は付けてよい）。
// 注意: window.status・parent・name など、ブラウザがもともと持っている名前は変数名に使わない。
// 待つための関数（waitConfirmed など）は ch15/code.ts、モザイクを扱う関数（announceTx・makeMosaic・sendMosaics など）は ex03/code.ts、
// ネームスペースを扱う関数（randomName・registerNamespace・nsIdHex など）は ex04/code.ts のものを使う。
const r = String.raw;

// アカウントを新しく作るコード（v2 / v3）。解答例のコードを、v2 と v3 で共通に書くために使う。
const NA2 = 'sym.Account.generateNewAccount(networkType)';
const NA3 = 'facade.createAccount(sdkCore.PrivateKey.random())';

// ---------- 共通関数の準備（第7章のコードを、関数にまとめたもの） ----------
export const toolsV2 = r`// ① メタデータを扱う準備（第7章の準備と同じ）
metaRepo = repo.createMetadataRepository();
metaService = new sym.MetadataTransactionService(metaRepo);

// ② 検索の条件を作る内部用の関数。kind は 'account' / 'mosaic' / 'namespace'
// target は、アカウントなら記録先の Account、モザイクならモザイクIDの16進数、ネームスペースなら名前（'xembook.tomato' のような path）
metaCriteria = (kind, target, name, source) => {
  const criteria = {
    sourceAddress: source.address, // 作成者
    scopedMetadataKey: sym.KeyGenerator.generateUInt64Key(name).toHex(),
    metadataType: kind === 'account' ? sym.MetadataType.Account : kind === 'mosaic' ? sym.MetadataType.Mosaic : sym.MetadataType.Namespace,
  };
  if (kind === 'account') criteria.targetAddress = target.address;
  else criteria.targetId = kind === 'mosaic' ? new sym.MosaicId(target) : new sym.NamespaceId(target);
  return criteria;
};

// ③ メタデータを登録・更新するトランザクションをアナウンスする関数（ハッシュを返す。承認までは待たない）
// source は作成者（署名して、手数料を払う人。省略すると alice）。
// 記録先の所有者が、作成者と別のときは、所有者の連署が必要。所有者は、アカウントなら記録先の Account 自身、モザイク・ネームスペースなら owner（作成した人。省略すると alice）
// text は文字列。同じキー・同じ作成者のメタデータがあれば、更新になる（差分は、SDK が計算する）
announceMeta = async (kind, target, name, text, source = alice, owner = alice) => {
  const ownerAcc = kind === 'account' ? target : owner;
  const key = sym.KeyGenerator.generateUInt64Key(name);
  let tx;
  if (kind === 'account') {
    tx = await metaService.createAccountMetadataTransaction(
      undefined, networkType, ownerAcc.address, key, text, source.address
    ).toPromise();
  } else if (kind === 'mosaic') {
    tx = await metaService.createMosaicMetadataTransaction(
      undefined, networkType, ownerAcc.address, new sym.MosaicId(target), key, text, source.address
    ).toPromise();
  } else {
    tx = await metaService.createNamespaceMetadataTransaction(
      undefined, networkType, ownerAcc.address, new sym.NamespaceId(target), key, text, source.address
    ).toPromise();
  }
  const cosigners = ownerAcc.address.plain() === source.address.plain() ? [] : [ownerAcc];
  const aggregateTx = sym.AggregateTransaction.createComplete(
    sym.Deadline.create(epochAdjustment),
    [tx.toAggregate(source.publicAccount)],
    networkType,
    []
  ).setMaxFeeForAggregate(100, cosigners.length);
  const signedTx = aggregateTx.signTransactionWithCosignatories(source, cosigners, generationHash);
  await txRepo.announce(signedTx).toPromise();
  return signedTx.hash;
};

// ④ メタデータの、いまの値（文字列）を調べる関数。登録されていなければ undefined。source は作成者（省略すると alice）
readMeta = async (kind, target, name, source = alice) => {
  const res = await metaRepo.search(metaCriteria(kind, target, name, source)).toPromise();
  return res.data.length > 0 ? res.data[0].metadataEntry.value : undefined;
};
console.log('ready');`;
export const toolsV3 = r`// ① メタデータを検索する関数。params は、第7章の検索のクエリ（targetAddress・sourceAddress・scopedMetadataKey・targetId・metadataType）
// 登録されたメタデータの情報（metadataEntry）のリストを返す。value は16進数
searchMeta = async (params) => {
  const res = await fetch(new URL('/metadata?' + new URLSearchParams(params).toString(), NODE)).then((res) => res.json());
  return res.data.map((d) => d.metadataEntry);
};

// ② 検索の条件を作る内部用の関数。kind は 'account' / 'mosaic' / 'namespace'
// target は、アカウントなら記録先の Account、モザイクならモザイクIDの16進数、ネームスペースなら名前（'xembook.tomato' のような path）
metaParams = (kind, target, name, source) => {
  const params = {
    sourceAddress: source.address.toString(), // 作成者
    scopedMetadataKey: sdkSymbol.metadataGenerateKey(name).toString(16).toUpperCase().padStart(16, '0'),
    metadataType: kind === 'account' ? 0 : kind === 'mosaic' ? 1 : 2,
  };
  if (kind === 'account') params.targetAddress = target.address.toString();
  else params.targetId = kind === 'mosaic' ? target : nsIdHex(target);
  return params;
};

// ③ メタデータを登録・更新するトランザクションをアナウンスする関数（ハッシュを返す。承認までは待たない）
// source は作成者（署名して、手数料を払う人。省略すると alice）。
// 記録先の所有者が、作成者と別のときは、所有者の連署が必要。所有者は、アカウントなら記録先の Account 自身、モザイク・ネームスペースなら owner（作成した人。省略すると alice）
// text は文字列。同じキー・同じ作成者のメタデータがあれば、更新になる（7.1 と同じく、差分データを作る）
announceMeta = async (kind, target, name, text, source = alice, owner = alice) => {
  const ownerAcc = kind === 'account' ? target : owner;
  const targetAddress = ownerAcc.address;
  const key = sdkSymbol.metadataGenerateKey(name);
  let value = new TextEncoder().encode(text);

  // 同じキー・同じ作成者のメタデータが、登録済みかを調べる。登録済みなら、差分データを作る
  const found = await searchMeta(metaParams(kind, target, name, source));
  let sizeDelta = value.length;
  if (found.length > 0) {
    sizeDelta -= found[0].valueSize;
    value = sdkSymbol.metadataUpdateValue(sdkCore.utils.hexToUint8(found[0].value), value);
  }

  let descriptor;
  if (kind === 'account') {
    descriptor = new sdkSymbol.descriptors.AccountMetadataTransactionV1Descriptor(
      targetAddress, key, sizeDelta, value
    );
  } else if (kind === 'mosaic') {
    descriptor = new sdkSymbol.descriptors.MosaicMetadataTransactionV1Descriptor(
      targetAddress, key, new sdkSymbol.models.UnresolvedMosaicId(BigInt('0x' + target)), sizeDelta, value
    );
  } else {
    descriptor = new sdkSymbol.descriptors.NamespaceMetadataTransactionV1Descriptor(
      targetAddress, key, new sdkSymbol.models.NamespaceId(BigInt('0x' + nsIdHex(target))), sizeDelta, value
    );
  }
  const embeddedTransactions = [
    facade.createEmbeddedTransactionFromTypedDescriptor(descriptor, source.publicKey),
  ];
  const needCosign = ownerAcc.address.toString() !== source.address.toString();
  const aggregateDescriptor = new sdkSymbol.descriptors.AggregateCompleteTransactionV3Descriptor(
    facade.static.hashEmbeddedTransactions(embeddedTransactions),
    embeddedTransactions
  );
  const aggregateTx = facade.createTransactionFromTypedDescriptor(
    aggregateDescriptor,
    source.publicKey,
    100,
    60 * 60 * 2,
    needCosign ? 1 : 0 // 連署者数
  );

  // 作成者が署名して、必要なら、記録先の所有者が連署する
  const sig = source.signTransaction(aggregateTx);
  let body = facade.transactionFactory.static.attachSignature(aggregateTx, sig);
  if (needCosign) {
    aggregateTx.cosignatures.push(ownerAcc.cosignTransaction(aggregateTx, false));
    body = JSON.stringify({ payload: sdkCore.utils.uint8ToHex(aggregateTx.serialize()) });
  }
  await fetch(
    new URL('/transactions', NODE),
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body,
    }
  ).then((res) => res.json());
  return facade.hashTransaction(aggregateTx).toString();
};

// ④ メタデータの、いまの値（文字列）を調べる関数。登録されていなければ undefined。source は作成者（省略すると alice）
readMeta = async (kind, target, name, source = alice) => {
  const found = await searchMeta(metaParams(kind, target, name, source));
  return found.length > 0 ? new TextDecoder().decode(sdkCore.utils.hexToUint8(found[0].value)) : undefined;
};
console.log('ready');`;

// ---------- 演習1 キー・サイズ・差分を、計算で確かめる ----------
export const e1V2 = r`// ① 名前（文字列）から、キー（64ビットの数値）を作る。同じ名前からは、いつも同じキーができる
keyAccount = sym.KeyGenerator.generateUInt64Key('key_account');
console.log(keyAccount.toHex()); // 9772B71B058127D7

// ② 値は、バイト列として記録される。サイズは「文字数」ではなく「バイト数」で数える（日本語は 1文字 3バイト）
sampleText = 'あいう';
console.log(sampleText.length, new TextEncoder().encode(sampleText).length); // 3 9

// ③ 値の最大は 1024 バイト。ちょうど 1024 バイトなら、登録できる
console.log(new TextEncoder().encode('a'.repeat(1024)).length <= 1024); // true`;
export const e1V3 = r`// ① 名前（文字列）から、キー（64ビットの数値）を作る。同じ名前からは、いつも同じキーができる（symbol-sdk v3.2.2 以降）
keyAccount = sdkSymbol.metadataGenerateKey('key_account');
console.log(keyAccount.toString(16).toUpperCase().padStart(16, '0')); // 9772B71B058127D7

// ② 値は、バイト列として記録される。サイズは「文字数」ではなく「バイト数」で数える（日本語は 1文字 3バイト）
sampleText = 'あいう';
console.log(sampleText.length, new TextEncoder().encode(sampleText).length); // 3 9

// ③ 値の最大は 1024 バイト。ちょうど 1024 バイトなら、登録できる
console.log(new TextEncoder().encode('a'.repeat(1024)).length <= 1024); // true`;
export const t1Func = r`// ① 文字列のバイト数（UTF-8）
byteLen = (text) => new TextEncoder().encode(text).length;

// ② 値として登録できるか（1024 バイト以内）
isValidValue = (text) => byteLen(text) <= 1024;

// ③ 登録し直すときの、サイズの差分（新しい値のバイト数 - いま登録されている値のバイト数）。まだ登録されていなければ、oldText は undefined
calcSizeDelta = (oldText, newText) => byteLen(newText) - (oldText === undefined ? 0 : byteLen(oldText));`;
export const t1KeyV2 = r`// ④ 名前から、キーの16進数（16桁・大文字）を求める
metaKeyHex = (keyName) => sym.KeyGenerator.generateUInt64Key(keyName).toHex();`;
export const t1KeyV3 = r`// ④ 名前から、キーの16進数（16桁・大文字）を求める
metaKeyHex = (keyName) => sdkSymbol.metadataGenerateKey(keyName).toString(16).toUpperCase().padStart(16, '0');`;
export const t1Check = r`console.log(byteLen('abc') === 3 && byteLen('あ') === 3 && byteLen('') === 0 ? '✅ ① バイト数を数えられました' : '❌ ① byteLen の結果が違います');
console.log(isValidValue('a'.repeat(1024)) && !isValidValue('a'.repeat(1025)) && isValidValue('あ'.repeat(341)) && !isValidValue('あ'.repeat(342)) ? '✅ ② 1024 バイトの上限を判定できました' : '❌ ② isValidValue の結果が違います');
console.log(calcSizeDelta(undefined, 'test') === 4 && calcSizeDelta('test', 'ab') === -2 && calcSizeDelta('ab', 'test') === 2 ? '✅ ③ サイズの差分を計算できました' : '❌ ③ calcSizeDelta の結果が違います');
console.log(metaKeyHex('key_account') === '9772B71B058127D7' && metaKeyHex('key_mosaic') === 'CF217E116AA422E2' && metaKeyHex('key_namespace') === '8B6A8A370873D0D9' ? '✅ ④ キーを16進数にできました' : '❌ ④ metaKeyHex の結果が違います');`;

// ---------- 演習2 アカウントに登録して、読み取る ----------
export const e2 = r`// ① キーの名前を作る（毎回、新しいキーにするため、名前の後ろに、ランダムな文字列を付ける）
nickKey = 'nick_' + randomName();

// ② alice 自身に、メタデータを登録して、承認まで待つ（作成者も記録先も alice）
// 同じアカウントでも、メタデータの登録は、アグリゲートトランザクションに包んで送る（関数の中で、そうしている）
await waitConfirmed(await announceMeta('account', alice, nickKey, 'alice'));

// ③ 登録した値を、読み取る（作成者は alice。省略すると alice）
console.log(await readMeta('account', alice, nickKey)); // alice`;
const t2a = (na: string) => r`// ① キーを毎回新しくするための目印を作る
tag = randomName();

// ② alice 自身に、role = admin を登録して、読み取る（作成者も記録先も alice）
roleKey = 'role_' + tag;
await waitConfirmed(await announceMeta('account', alice, roleKey, 'admin'));
roleValue = await readMeta('account', alice, roleKey);

// ③ bob を作り、作成者を alice にして、bob に note = from alice を登録する（記録先の bob の連署が必要。関数の中で、連署している）
bob = ${na};
noteKey = 'note_' + tag;
await waitConfirmed(await announceMeta('account', bob, noteKey, 'from alice', alice));
noteValue = await readMeta('account', bob, noteKey, alice);

// ④ 作成者を bob にして、同じキーを探す（bob は何も登録していないので、見つからない）
noteBySelf = await readMeta('account', bob, noteKey, bob);
console.log(roleValue, noteValue, noteBySelf);`;
export const t2V2 = t2a(NA2);
export const t2V3 = t2a(NA3);
export const t2Check = r`console.log(roleValue === 'admin' ? '✅ ② 自分自身に登録した値を読み取れました' : '❌ ② roleValue が違います: ' + roleValue);
console.log(noteValue === 'from alice' ? '✅ ③ bob に、alice を作成者として登録できました' : '❌ ③ noteValue が違います: ' + noteValue);
console.log(noteBySelf === undefined ? '✅ ④ 作成者が違うと、別のメタデータとして扱われます' : '❌ ④ noteBySelf が違います: ' + noteBySelf);`;

// ---------- 演習3 モザイクとネームスペースに登録する ----------
export const e3V2 = r`// ① モザイクを作って（可分性0・供給量1）、そのモザイクに、メタデータを登録する
// 登録・更新には、モザイクを作成したアカウント（alice）の署名が必要
ticketId = await makeMosaic({ divisibility: 0, supply: 1 });
await waitConfirmed(await announceMeta('mosaic', ticketId, 'title', 'concert'));

// ② 読み取る
console.log(await readMeta('mosaic', ticketId, 'title')); // concert

// ③ 検索結果の metadataType は、モザイクなら 1（アカウント 0、モザイク 1、ネームスペース 2）
found = await metaRepo.search({ targetId: new sym.MosaicId(ticketId), metadataType: sym.MetadataType.Mosaic }).toPromise();
console.log(found.data[0].metadataEntry.metadataType); // 1`;
export const e3V3 = r`// ① モザイクを作って（可分性0・供給量1）、そのモザイクに、メタデータを登録する
// 登録・更新には、モザイクを作成したアカウント（alice）の署名が必要
ticketId = await makeMosaic({ divisibility: 0, supply: 1 });
await waitConfirmed(await announceMeta('mosaic', ticketId, 'title', 'concert'));

// ② 読み取る
console.log(await readMeta('mosaic', ticketId, 'title')); // concert

// ③ 検索結果の metadataType は、モザイクなら 1（アカウント 0、モザイク 1、ネームスペース 2）
found = await searchMeta({ targetId: ticketId, metadataType: 1 });
console.log(Number(found[0].metadataType)); // 1`;
const t3a = r`// ① モザイクと、ルートネームスペースを作る（作成者は alice）
badgeId = await makeMosaic({ divisibility: 0, supply: 1 });
metaRoot = randomName();
await registerNamespace(metaRoot);

// ② alice が、モザイクとネームスペースに、メタデータを登録する
await waitConfirmed(await announceMeta('mosaic', badgeId, 'grade', 'gold'));
await waitConfirmed(await announceMeta('namespace', metaRoot, 'site', 'https://example.com'));
siteValue = await readMeta('namespace', metaRoot, 'site');`;
const t3b = (na: string) => r`// ③ bob を作り、alice から XYM 1 を送る（作成者として署名するので、手数料が必要）
bob = ${na};
await waitConfirmed(await sendMosaics(alice, bob.address, [['72C0212E67A08BCE', 1000000]]));

// ④ bob が作成者になって、alice のモザイクに、同じキー 'grade' で登録する
// モザイクの作成者 alice の連署が必要（関数の第6引数に alice を渡している。省略時も alice）
await waitConfirmed(await announceMeta('mosaic', badgeId, 'grade', 'silver', bob, alice));
gradeByAlice = await readMeta('mosaic', badgeId, 'grade', alice);
gradeByBob = await readMeta('mosaic', badgeId, 'grade', bob);`;
export const t3V2a = t3a;
export const t3V3a = t3a;
export const t3V2b = t3b(NA2);
export const t3V3b = t3b(NA3);
export const t3V2c = r`// ⑤ 作成者を絞らずに、このモザイクのメタデータを、すべて探す
mosaicEntries = await metaRepo.search({ targetId: new sym.MosaicId(badgeId), metadataType: sym.MetadataType.Mosaic }).toPromise();
mosaicEntryCount = mosaicEntries.data.length;
console.log(gradeByAlice, gradeByBob, siteValue, mosaicEntryCount);`;
export const t3V3c = r`// ⑤ 作成者を絞らずに、このモザイクのメタデータを、すべて探す
mosaicEntries = await searchMeta({ targetId: badgeId, metadataType: 1 });
mosaicEntryCount = mosaicEntries.length;
console.log(gradeByAlice, gradeByBob, siteValue, mosaicEntryCount);`;
export const t3Check = r`console.log(siteValue === 'https://example.com' ? '✅ ② ネームスペースのメタデータを読み取れました' : '❌ ② siteValue が違います: ' + siteValue);
console.log(gradeByAlice === 'gold' && gradeByBob === 'silver' ? '✅ ④ 同じキーでも、作成者が違えば、別々の値として登録されました' : '❌ ④ gradeByAlice / gradeByBob が違います: ' + gradeByAlice + ' / ' + gradeByBob);
console.log(mosaicEntryCount === 2 ? '✅ ⑤ 作成者を絞らないと、2 件見つかりました' : '❌ ⑤ mosaicEntryCount が違います: ' + mosaicEntryCount);`;

// ---------- 演習4 更新と、差分のしくみ ----------
const e4Common = r`// ① キーを作って、'draft'（5バイト）を登録する
statusKey = 'st_' + randomName();
confirmedA = await waitConfirmed(await announceMeta('account', alice, statusKey, 'draft'));

// ② 同じキーに、'published'（9バイト）を登録し直す
// 関数の中で、いま登録されている値を調べて、差分データを作っている（7.1 と同じ）
confirmedB = await waitConfirmed(await announceMeta('account', alice, statusKey, 'published'));

// ③ 読み取ると、上書きされている
console.log(await readMeta('account', alice, statusKey)); // published
`;
export const e4V2 = e4Common + r`
// ④ 承認されたトランザクションに残っている、サイズの差分（sizeDelta）。最初は 5、2回目は 9 - 5 = 4
console.log(confirmedA.innerTransactions[0].valueSizeDelta, confirmedB.innerTransactions[0].valueSizeDelta); // 5 4`;
export const e4V3 = e4Common + r`
// ④ 承認されたトランザクションに残っている、サイズの差分（sizeDelta）。最初は 5、2回目は 9 - 5 = 4
console.log(
  Number(confirmedA.transaction.transactions[0].transaction.valueSizeDelta),
  Number(confirmedB.transaction.transactions[0].transaction.valueSizeDelta)
); // 5 4`;
export const t4Func = r`// ① 差分データを作る。古い値と新しい値を、バイトごとに XOR する。短いほうの足りない部分は 0 として扱う（長さは、長いほうにそろう）
makeDiff = (oldBytes, newBytes) => {
  const diff = new Uint8Array(Math.max(oldBytes.length, newBytes.length));
  for (let i = 0; i < diff.length; i++) {
    diff[i] = (oldBytes[i] ?? 0) ^ (newBytes[i] ?? 0);
  }
  return diff;
};

// ② 差分データを、古い値に当てはめて、新しい値を求める。newSize は、新しい値のバイト数
applyDiff = (oldBytes, diff, newSize) => {
  const result = new Uint8Array(diff.length);
  for (let i = 0; i < result.length; i++) {
    result[i] = (oldBytes[i] ?? 0) ^ diff[i];
  }
  return result.slice(0, newSize);
};`;
export const t4V2b = r`// ③ 同じキーに、3回続けて登録して、サイズの差分（sizeDelta）を並べる（'abc' → 'abcdefgh' → 'xy'）
docKey = 'doc_' + randomName();
deltas = [];
for (const text of ['abc', 'abcdefgh', 'xy']) {
  confirmed = await waitConfirmed(await announceMeta('account', alice, docKey, text));
  deltas.push(confirmed.innerTransactions[0].valueSizeDelta);
}
finalValue = await readMeta('account', alice, docKey);
console.log(deltas, finalValue);`;
export const t4V3b = r`// ③ 同じキーに、3回続けて登録して、サイズの差分（sizeDelta）を並べる（'abc' → 'abcdefgh' → 'xy'）
docKey = 'doc_' + randomName();
deltas = [];
for (const text of ['abc', 'abcdefgh', 'xy']) {
  confirmed = await waitConfirmed(await announceMeta('account', alice, docKey, text));
  deltas.push(Number(confirmed.transaction.transactions[0].transaction.valueSizeDelta));
}
finalValue = await readMeta('account', alice, docKey);
console.log(deltas, finalValue);`;
export const t4Check = r`bytesA = new TextEncoder().encode('abc');
bytesB = new TextEncoder().encode('abcdefgh');
bytesC = new TextEncoder().encode('xy');
okGrow = new TextDecoder().decode(applyDiff(bytesA, makeDiff(bytesA, bytesB), bytesB.length)) === 'abcdefgh';
okShrink = new TextDecoder().decode(applyDiff(bytesB, makeDiff(bytesB, bytesC), bytesC.length)) === 'xy';
console.log(okGrow && okShrink ? '✅ ①② 差分データを作って、古い値に当てはめると、新しい値に戻りました' : '❌ ①② makeDiff / applyDiff の結果が違います');
console.log(JSON.stringify(deltas) === '[3,5,-6]' && finalValue === 'xy' ? '✅ ③ サイズの差分は 3、+5、-6 で、最後の値は xy でした' : '❌ ③ deltas / finalValue が違います: ' + JSON.stringify(deltas) + ' / ' + finalValue);`;

// ---------- 演習5 資格証明を発行して、検証する ----------
const e5a = (na: string) => r`// ① 大学（alice）が、学生（bob）に、卒業証明を、メタデータとして発行する（記録先の bob の連署が必要）
bob = ${na};
await waitConfirmed(await announceMeta('account', bob, 'degree', 'BSc 2026', alice));

// ② 検証者は、「学生のアカウントに、大学のアドレスを作成者として登録された 'degree'」を探す
console.log(await readMeta('account', bob, 'degree', alice)); // BSc 2026
`;
export const e5V2 = e5a(NA2) + r`
// ③ 作成者を絞らずに探すと、作成者のアドレスも、一緒に分かる
found = await metaRepo.search({ targetAddress: bob.address, metadataType: sym.MetadataType.Account }).toPromise();
console.log(found.data.map((m) => m.metadataEntry.sourceAddress.plain() + ' : ' + m.metadataEntry.value));`;
export const e5V3 = e5a(NA3) + r`
// ③ 作成者を絞らずに探すと、作成者のアドレスも、一緒に分かる
found = await searchMeta({ targetAddress: bob.address.toString(), metadataType: 0 });
console.log(found.map((m) => hexToAddress(m.sourceAddress) + ' : ' + new TextDecoder().decode(sdkCore.utils.hexToUint8(m.value))));`;
const t5a = (na: string) => r`// ① 大学（alice）、学生、偽の発行者を用意する。偽の発行者には、手数料のための XYM 1 を送る
univ = alice;
student = ${na};
faker = ${na};
await waitConfirmed(await sendMosaics(alice, faker.address, [['72C0212E67A08BCE', 1000000]]));

// ② 大学が、学生に、degree = BSc 2026 を発行する。偽の発行者も、同じキーで、degree = PhD 2026 を発行する（どちらも、学生の連署が必要）
await waitConfirmed(await announceMeta('account', student, 'degree', 'BSc 2026', univ));
await waitConfirmed(await announceMeta('account', student, 'degree', 'PhD 2026', faker));`;
export const t5V2a = t5a(NA2);
export const t5V3a = t5a(NA3);
export const t5V2b = r`// ③ 検証する関数。学生と、発行者のアドレス（文字列）と、キー名から、その発行者が登録した値を返す（なければ undefined）
verifyCredential = async (holder, issuerAddress, keyName) => {
  const res = await metaRepo.search({
    targetAddress: holder.address,
    scopedMetadataKey: sym.KeyGenerator.generateUInt64Key(keyName).toHex(),
    metadataType: sym.MetadataType.Account,
  }).toPromise();
  const hit = res.data.find((m) => m.metadataEntry.sourceAddress.plain() === issuerAddress);
  return hit ? hit.metadataEntry.value : undefined;
};

// ④ 検証する。大学のアドレスを指定すると、大学が発行した値だけが返る
byUniv = await verifyCredential(student, univ.address.plain(), 'degree');
byFaker = await verifyCredential(student, faker.address.plain(), 'degree');
stranger = ${NA2};
byStranger = await verifyCredential(student, stranger.address.plain(), 'degree');
console.log(byUniv, byFaker, byStranger);`;
export const t5V3b = r`// ③ 検証する関数。学生と、発行者のアドレス（文字列）と、キー名から、その発行者が登録した値を返す（なければ undefined）
verifyCredential = async (holder, issuerAddress, keyName) => {
  const entries = await searchMeta({
    targetAddress: holder.address.toString(),
    scopedMetadataKey: sdkSymbol.metadataGenerateKey(keyName).toString(16).toUpperCase().padStart(16, '0'),
    metadataType: 0,
  });
  const hit = entries.find((e) => hexToAddress(e.sourceAddress) === issuerAddress);
  return hit ? new TextDecoder().decode(sdkCore.utils.hexToUint8(hit.value)) : undefined;
};

// ④ 検証する。大学のアドレスを指定すると、大学が発行した値だけが返る
byUniv = await verifyCredential(student, univ.address.toString(), 'degree');
byFaker = await verifyCredential(student, faker.address.toString(), 'degree');
stranger = ${NA3};
byStranger = await verifyCredential(student, stranger.address.toString(), 'degree');
console.log(byUniv, byFaker, byStranger);`;
export const t5Check = r`console.log(byUniv === 'BSc 2026' ? '✅ ④ 大学のアドレスを指定すると、大学が発行した卒業証明が返りました' : '❌ ④ byUniv が違います: ' + byUniv);
console.log(byFaker === 'PhD 2026' ? '✅ ④ 偽の発行者のアドレスを指定すると、偽の発行者が登録した値が返りました（発行者を、検証側が決めて指定する理由です）' : '❌ ④ byFaker が違います: ' + byFaker);
console.log(byStranger === undefined ? '✅ ④ 何も登録していないアドレスを指定すると、見つかりません' : '❌ ④ byStranger が違います: ' + byStranger);`;
