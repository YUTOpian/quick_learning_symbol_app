// 速習Symbol 演習編 第1章（アカウント）のサンプルコード（解答例と答え合わせ用コード）。
// 速習Symbol 第3章で学んだコードを組み合わせて作っている。
// コンソールでそのまま実行できるよう、const 宣言は付けていない（ch02〜ch13 と同じ方針。関数の中の const は付けてよい）。
const r = String.raw;

// ---------- 演習1 鍵とアドレスを「文字列」で受け渡す ----------
export const t1V2a = r`// ① erin を作り、鍵とアドレスを「ただの文字列」として取り出す
erin = sym.Account.generateNewAccount(networkType);
saved = {
  privateKey: erin.privateKey,
  publicKey: erin.publicKey,
  address: erin.address.plain(),
};
console.log(JSON.stringify(saved, null, 2));`;
export const t1V2b = r`// ② 文字列だけから、3つのクラスを作り直す
restored = sym.Account.createFromPrivateKey(saved.privateKey, networkType);
pub = sym.PublicAccount.createFromPublicKey(saved.publicKey, networkType);
addr = sym.Address.createFromRawAddress(saved.address);
console.log(restored.address.plain(), pub.address.plain(), addr.plain());`;
export const t1CheckV2 = r`console.log(restored.publicKey === saved.publicKey ? '✅ 秘密鍵から、同じ公開鍵が導出できました' : '❌ 公開鍵が一致しません');
console.log(restored.address.plain() === saved.address ? '✅ 秘密鍵から、同じアドレスが導出できました' : '❌ 秘密鍵から導出したアドレスが一致しません');
console.log(pub.address.plain() === saved.address ? '✅ 公開鍵から、同じアドレスが導出できました' : '❌ 公開鍵から導出したアドレスが一致しません');
console.log(addr.plain() === saved.address ? '✅ アドレスクラスを作り直せました' : '❌ アドレスが一致しません');`;
export const t1V3a = r`// ① erin を作り、鍵とアドレスを「ただの文字列」として取り出す
erin = facade.createAccount(sdkCore.PrivateKey.random());
saved = {
  privateKey: erin.keyPair.privateKey.toString(),
  publicKey: erin.publicKey.toString(),
  address: erin.address.toString(),
};
console.log(JSON.stringify(saved, null, 2));`;
export const t1V3b = r`// ② 文字列だけから、3つのクラスを作り直す
restored = facade.createAccount(new sdkCore.PrivateKey(saved.privateKey));
pub = facade.createPublicAccount(new sdkCore.PublicKey(saved.publicKey));
addr = new sdkSymbol.Address(saved.address);
console.log(restored.address.toString(), pub.address.toString(), addr.toString());`;
export const t1CheckV3 = r`console.log(restored.publicKey.toString() === saved.publicKey ? '✅ 秘密鍵から、同じ公開鍵が導出できました' : '❌ 公開鍵が一致しません');
console.log(restored.address.toString() === saved.address ? '✅ 秘密鍵から、同じアドレスが導出できました' : '❌ 秘密鍵から導出したアドレスが一致しません');
console.log(pub.address.toString() === saved.address ? '✅ 公開鍵から、同じアドレスが導出できました' : '❌ 公開鍵から導出したアドレスが一致しません');
console.log(addr.toString() === saved.address ? '✅ アドレスクラスを作り直せました' : '❌ アドレスが一致しません');`;

// ---------- 演習2 受信して初めて記録される ----------
// 送信用の関数（第4章の内容。この演習では、そのまま実行して使う）
export const t2PrepV2 = r`// 送信用の関数（第4章で学ぶ内容です。この演習では、そのまま実行して使います）
// amount は μXYM 単位（1XYM = 1000000）。0 のときはメッセージだけを送る
sendXym = async (from, toAddress, amount, text) => {
  const tx = sym.TransferTransaction.create(
    sym.Deadline.create(epochAdjustment),
    toAddress,
    amount > 0 ? [new sym.Mosaic(new sym.NamespaceId("symbol.xym"), sym.UInt64.fromUint(amount))] : [],
    sym.PlainMessage.create(text),
    networkType
  ).setMaxFee(100);
  const signedTx = from.sign(tx, generationHash);
  await txRepo.announce(signedTx).toPromise();
  await waitConfirmed(signedTx.hash); // 承認されるまで待つ
  return signedTx.hash;
};
console.log('ready');`;
export const t2PrepV3 = r`// 送信用の関数（第4章で学ぶ内容です。この演習では、そのまま実行して使います）
// amount は μXYM 単位（1XYM = 1000000）。0 のときはメッセージだけを送る
sendXym = async (from, toAddress, amount, text) => {
  const namespaceIds = sdkSymbol.generateNamespacePath("symbol.xym");
  const namespaceId = namespaceIds[namespaceIds.length - 1];
  const mosaics = amount > 0 ? [
    new sdkSymbol.descriptors.UnresolvedMosaicDescriptor(
      new sdkSymbol.models.UnresolvedMosaicId(namespaceId),
      new sdkSymbol.models.Amount(BigInt(amount))
    )
  ] : [];
  const descriptor = new sdkSymbol.descriptors.TransferTransactionV1Descriptor(toAddress, mosaics, '\0' + text);
  const tx = facade.createTransactionFromTypedDescriptor(descriptor, from.publicKey, 100, 60 * 60 * 2);
  const sig = from.signTransaction(tx);
  const jsonPayload = facade.transactionFactory.static.attachSignature(tx, sig);
  await fetch(
    new URL('/transactions', NODE),
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: jsonPayload,
    }
  ).then((res) => res.json());
  const hash = facade.hashTransaction(tx).toString();
  await waitConfirmed(hash); // 承認されるまで待つ
  return hash;
};
console.log('ready');`;
export const t2V2a = r`// ① 作っただけのアカウントは、ノードに記録されていない
frank = sym.Account.generateNewAccount(networkType);
accountRepo = repo.createAccountRepository();
getInfo = async (address) => {
  try {
    return await accountRepo.getAccountInfo(address).toPromise();
  } catch (e) {
    return null; // 記録されていないときは、エラーになる
  }
};
info0 = await getInfo(frank.address);
console.log(info0 === null ? 'まだ記録されていません' : '記録されています');`;
export const t2V2b = r`// ② 1XYM を受信すると、アカウント情報が記録される（公開鍵は、まだ 0 のまま）
await sendXym(alice, frank.address, 1000000, 'welcome');
await sleep(3000); // 承認の直後は、反映まで少し待つ
info1 = await getInfo(frank.address);
console.log(info1.publicKey);
console.log(info1.mosaics[0].amount.toString());`;
export const t2V2c = r`// ③ frank が署名したトランザクションを送信すると、公開鍵が記録される
await sendXym(frank, alice.address, 0, 'hello');
await sleep(3000);
info2 = await getInfo(frank.address);
console.log(info2.publicKey);
console.log(frank.publicKey);`;
export const t2CheckV2 = r`console.log(info0 === null ? '✅ ① 受信する前は、ノードに記録されていません' : '❌ ① 受信前なのに記録されています');
console.log(info1 && info1.publicKey === '0'.repeat(64) && info1.mosaics[0].amount.toString() === '1000000'
  ? '✅ ② 受信すると記録されます。公開鍵は、まだ 0 のままです'
  : '❌ ② 受信後の情報が想定と違います');
console.log(info2 && info2.publicKey.toUpperCase() === frank.publicKey.toUpperCase()
  ? '✅ ③ 署名したトランザクションを送信すると、公開鍵が記録されます'
  : '❌ ③ 公開鍵が記録されていません');`;
export const t2V3a = r`// ① 作っただけのアカウントは、ノードに記録されていない
frank = facade.createAccount(sdkCore.PrivateKey.random());
getInfo = async (address) => {
  const res = await fetch(new URL('/accounts/' + address.toString(), NODE));
  if (!res.ok) return null; // 記録されていないときは、404 になる
  return (await res.json()).account;
};
info0 = await getInfo(frank.address);
console.log(info0 === null ? 'まだ記録されていません' : '記録されています');`;
export const t2V3b = r`// ② 1XYM を受信すると、アカウント情報が記録される（公開鍵は、まだ 0 のまま）
await sendXym(alice, frank.address, 1000000, 'welcome');
await sleep(3000); // 承認の直後は、反映まで少し待つ
info1 = await getInfo(frank.address);
console.log(info1.publicKey);
console.log(info1.mosaics[0].amount);`;
export const t2V3c = r`// ③ frank が署名したトランザクションを送信すると、公開鍵が記録される
await sendXym(frank, alice.address, 0, 'hello');
await sleep(3000);
info2 = await getInfo(frank.address);
console.log(info2.publicKey);
console.log(frank.publicKey.toString());`;
export const t2CheckV3 = r`console.log(info0 === null ? '✅ ① 受信する前は、ノードに記録されていません' : '❌ ① 受信前なのに記録されています');
console.log(info1 && info1.publicKey === '0'.repeat(64) && info1.mosaics[0].amount === '1000000'
  ? '✅ ② 受信すると記録されます。公開鍵は、まだ 0 のままです'
  : '❌ ② 受信後の情報が想定と違います');
console.log(info2 && info2.publicKey.toUpperCase() === frank.publicKey.toString().toUpperCase()
  ? '✅ ③ 署名したトランザクションを送信すると、公開鍵が記録されます'
  : '❌ ③ 公開鍵が記録されていません');`;

// ---------- 演習3 可分性を考えて、所有量を正しく表示する ----------
export const t3Tests = r`// テスト用のデータ: [所有量（文字列）, 可分性, 期待する表示]
tests = [
  ['3510000000', 6, '3510.000000'],
  ['1000000', 6, '1.000000'],
  ['5', 6, '0.000005'],
  ['0', 6, '0.000000'],
  ['100', 0, '100'],
  ['12345', 2, '123.45'],
];`;
export const t3Naive = r`// 3.3「表示桁数の調整」と同じやり方を、関数にしたもの
naiveFormat = (amount, divisibility) => {
  if (divisibility > 0) {
    return amount.slice(0, amount.length - divisibility) + '.' + amount.slice(-divisibility);
  }
  return amount;
};
tests.forEach(([amount, divisibility, expected]) => {
  const actual = naiveFormat(amount, divisibility);
  console.log((actual === expected ? '✅ ' : '❌ ') + amount + ' → ' + actual + '（期待: ' + expected + '）');
});`;
export const t3Func = r`formatAmount = (amount, divisibility) => {
  if (divisibility === 0) return String(amount);
  // 桁数が足りないときは、左を 0 で埋めて、整数部の 0 を確保する
  const s = String(amount).padStart(divisibility + 1, '0');
  return s.slice(0, -divisibility) + '.' + s.slice(-divisibility);
};
tests.forEach(([amount, divisibility, expected]) => {
  console.log(amount + ' → ' + formatAmount(amount, divisibility));
});`;
export const t3ApplyV2 = r`// 所有しているモザイクを、すべて表示する
accountRepo = repo.createAccountRepository();
mosaicRepo = repo.createMosaicRepository();
accountInfo = await accountRepo.getAccountInfo(alice.address).toPromise();
for (const m of accountInfo.mosaics) {
  mosaicInfo = await mosaicRepo.getMosaic(m.id).toPromise();
  console.log(m.id.toHex() + ' : ' + formatAmount(m.amount.toString(), mosaicInfo.divisibility));
}`;
export const t3ApplyV3 = r`// 所有しているモザイクを、すべて表示する
accountInfo = await fetch(
  new URL('/accounts/' + alice.address.toString(), NODE),
  {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  }
)
.then((res) => res.json())
.then((json) => {
  return json.account;
});
for (const m of accountInfo.mosaics) {
  mosaicInfo = await fetch(
    new URL('/mosaics/' + m.id, NODE),
    {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    }
  )
  .then((res) => res.json())
  .then((json) => {
    return json.mosaic;
  });
  console.log(m.id + ' : ' + formatAmount(m.amount, mosaicInfo.divisibility));
}`;
export const t3Check = r`failed = tests.filter(([amount, divisibility, expected]) => formatAmount(amount, divisibility) !== expected);
console.log(failed.length === 0 ? '✅ すべてのテストに合格しました' : '❌ 合格しなかったテスト: ' + JSON.stringify(failed));`;

// ---------- 演習4 暗号メッセージは、誰が読めるか ----------
export const t4V2 = r`// 登場人物: alice（送信者）、bob（受取人）、carol（第三者）
bob = sym.Account.generateNewAccount(networkType);
carol = sym.Account.generateNewAccount(networkType);

secretText = 'ひみつの合言葉';
encrypted = alice.encryptMessage(secretText, bob.publicAccount);

// 復号を試みる関数。復号できて、元のメッセージと一致したときだけ true
tryDecrypt = (account, otherPublicAccount, payload) => {
  try {
    return account.decryptMessage(new sym.EncryptedMessage(payload), otherPublicAccount).payload === secretText;
  } catch (e) {
    return false; // 復号に失敗すると、エラーになることもある
  }
};

// 暗号文の最後の1文字だけを変える
last = encrypted.payload.slice(-1);
tampered = encrypted.payload.slice(0, -1) + (last === '0' ? '1' : '0');

results = {
  bob: tryDecrypt(bob, alice.publicAccount, encrypted.payload),     // 受取人
  alice: tryDecrypt(alice, bob.publicAccount, encrypted.payload),   // 送信者自身
  carol: tryDecrypt(carol, alice.publicAccount, encrypted.payload), // 第三者
  tampered: tryDecrypt(bob, alice.publicAccount, tampered),         // 1文字だけ改ざんされた暗号文
};
console.log(results);`;
export const t4V3 = r`// 登場人物: alice（送信者）、bob（受取人）、carol（第三者）
bob = facade.createAccount(sdkCore.PrivateKey.random());
carol = facade.createAccount(sdkCore.PrivateKey.random());

secretText = 'ひみつの合言葉';
encrypted = alice.messageEncoder().encode(bob.publicKey, new TextEncoder().encode(secretText));

// 復号を試みる関数。復号できて、元のメッセージと一致したときだけ true
tryDecrypt = (account, otherPublicKey, data) => {
  const decoded = account.messageEncoder().tryDecode(otherPublicKey, data);
  return decoded.isDecoded && new TextDecoder().decode(decoded.message) === secretText;
};

// 暗号文の最後の1バイトだけを変える
tampered = Uint8Array.from(encrypted);
tampered[tampered.length - 1] ^= 1;

results = {
  bob: tryDecrypt(bob, alice.publicKey, encrypted),     // 受取人
  alice: tryDecrypt(alice, bob.publicKey, encrypted),   // 送信者自身
  carol: tryDecrypt(carol, alice.publicKey, encrypted), // 第三者
  tampered: tryDecrypt(bob, alice.publicKey, tampered), // 1バイトだけ改ざんされた暗号文
};
console.log(results);`;
export const t4Check = r`expected = { bob: true, alice: true, carol: false, tampered: false };
console.log(JSON.stringify(results) === JSON.stringify(expected)
  ? '✅ 受取人と送信者だけが復号でき、第三者と改ざんされた暗号文は復号できませんでした'
  : '❌ 想定と違います: ' + JSON.stringify(results));`;

// ---------- 演習5 署名でログインする ----------
export const t5V2 = r`Buffer = require("/node_modules/buffer").Buffer;

// ① サービス（Bob）が、毎回ちがう challenge（お題）を作る
challenge = 'login:' + Date.now() + ':' + Math.random().toString(36).slice(2);

// ② alice が challenge に署名して、公開鍵と署名を返す
signature = Buffer.from(sym.KeyPair.sign(alice.keyPair, Buffer.from(challenge, 'utf-8'))).toString('hex').toUpperCase();
answer = { publicKey: alice.publicKey, signature: signature };

// ③ サービス（Bob）が検証する。登録済みのアドレスは registeredAddress
registeredAddress = alice.address.plain();

verifyLogin = (challenge, answer) => {
  // 受け取った公開鍵から導出したアドレスが、登録済みのアドレスと同じか
  const pub = sym.PublicAccount.createFromPublicKey(answer.publicKey, networkType);
  const sameAddress = pub.address.plain() === registeredAddress;
  // 署名は、challenge に対するものか
  const validSig = sym.KeyPair.verify(
    sym.Convert.hexToUint8(answer.publicKey),
    Buffer.from(challenge, 'utf-8'),
    Buffer.from(answer.signature, 'hex')
  );
  return sameAddress && validSig;
};

console.log(verifyLogin(challenge, answer));        // 正しい challenge
console.log(verifyLogin(challenge + '!', answer));  // 別の challenge`;
export const t5V3 = r`// ① サービス（Bob）が、毎回ちがう challenge（お題）を作る
challenge = 'login:' + Date.now() + ':' + Math.random().toString(36).slice(2);

// ② alice が challenge に署名して、公開鍵と署名を返す
//    （v3 では、署名を Signature オブジェクトのまま渡す）
answer = {
  publicKey: alice.publicKey.toString(),
  signature: alice.keyPair.sign(Buffer.from(challenge, 'utf-8')),
};

// ③ サービス（Bob）が検証する。登録済みのアドレスは registeredAddress
registeredAddress = alice.address.toString();

verifyLogin = (challenge, answer) => {
  // 受け取った公開鍵から導出したアドレスが、登録済みのアドレスと同じか
  const publicKey = new sdkCore.PublicKey(answer.publicKey);
  const sameAddress = facade.network.publicKeyToAddress(publicKey).toString() === registeredAddress;
  // 署名は、challenge に対するものか
  const validSig = new sdkSymbol.Verifier(publicKey).verify(Buffer.from(challenge, 'utf-8'), answer.signature);
  return sameAddress && validSig;
};

console.log(verifyLogin(challenge, answer));        // 正しい challenge
console.log(verifyLogin(challenge + '!', answer));  // 別の challenge`;
export const t5Check = r`r1 = verifyLogin(challenge, answer);
r2 = verifyLogin(challenge + '!', answer);
console.log(r1 === true ? '✅ 正しい challenge では true になりました' : '❌ 正しい challenge なのに false になっています');
console.log(r2 === false ? '✅ 別の challenge では false になりました（署名の使い回しを防げます）' : '❌ 別の challenge でも true になっています');`;

// ---------- 各演習の例題（解き方を示すコード） ----------
// 例題1 公開鍵の文字列から、アドレスを取り出す
export const e1V2 = r`// ① 公開鍵を、ただの文字列にする
publicKeyText = alice.publicKey;

// ② 文字列だけから、公開鍵クラスを作る
alicePub = sym.PublicAccount.createFromPublicKey(publicKeyText, networkType);

// ③ アドレスを文字列にして、alice のアドレスと比べる
console.log(alicePub.address.plain() === alice.address.plain());`;
export const e1V3 = r`// ① 公開鍵を、ただの文字列にする
publicKeyText = alice.publicKey.toString();

// ② 文字列だけから、公開鍵クラスを作る
alicePub = facade.createPublicAccount(new sdkCore.PublicKey(publicKeyText));

// ③ アドレスを文字列にして、alice のアドレスと比べる
console.log(alicePub.address.toString() === alice.address.toString());`;

// 例題2 アカウントがノードに記録されているか調べる
export const e2V2 = r`accountRepo = repo.createAccountRepository();

// 取得に失敗したら null を返す関数（記録されていないアカウントは、取得するとエラーになる）
getInfo = async (address) => {
  try {
    return await accountRepo.getAccountInfo(address).toPromise();
  } catch (e) {
    return null;
  }
};

// 記録の状態を、文字で返す関数
describeAccount = async (address) => {
  const info = await getInfo(address);
  if (info === null) return 'ノードに記録されていません';
  if (info.publicKey === '0'.repeat(64)) return '記録されています（公開鍵は未記録）';
  return '記録されています（公開鍵も記録済み）';
};

console.log(await describeAccount(alice.address));
// 作っただけのアカウントも調べてみる
console.log(await describeAccount(sym.Account.generateNewAccount(networkType).address));`;
export const e2V3 = r`// 取得に失敗したら null を返す関数（記録されていないアカウントは、404 になる）
getInfo = async (address) => {
  const res = await fetch(new URL('/accounts/' + address.toString(), NODE));
  if (!res.ok) return null;
  return (await res.json()).account;
};

// 記録の状態を、文字で返す関数
describeAccount = async (address) => {
  const info = await getInfo(address);
  if (info === null) return 'ノードに記録されていません';
  if (info.publicKey === '0'.repeat(64)) return '記録されています（公開鍵は未記録）';
  return '記録されています（公開鍵も記録済み）';
};

console.log(await describeAccount(alice.address));
// 作っただけのアカウントも調べてみる
console.log(await describeAccount(facade.createAccount(sdkCore.PrivateKey.random()).address));`;

// 例題3 秒数を m:ss の形に直す（テストデータを先に用意して、関数を作る流れの見本）
export const e3 = r`// ① テスト用のデータを先に用意する: [秒数, 期待する表示]
timeTests = [
  [0, '0:00'],
  [5, '0:05'],
  [65, '1:05'],
  [600, '10:00'],
];

// ② 関数を作る。秒の部分は 2桁にそろえたいので、padStart で左を 0 で埋める
formatTime = (sec) => {
  const m = Math.floor(sec / 60);
  const s = String(sec % 60).padStart(2, '0');
  return m + ':' + s;
};

// ③ すべてのテストに合格するか確かめる
timeFailed = timeTests.filter(([sec, expected]) => formatTime(sec) !== expected);
console.log(timeFailed.length === 0 ? '✅ すべてのテストに合格しました' : '❌ 合格しなかったテスト: ' + JSON.stringify(timeFailed));`;

// 例題4 暗号化して、受取人が復号する
export const e4V2 = r`bob = sym.Account.generateNewAccount(networkType);
message = 'Hello Symbol!';

// ① alice が、bob の公開鍵で暗号化する
encrypted = alice.encryptMessage(message, bob.publicAccount);

// ② bob が、自分の秘密鍵と alice の公開鍵で復号する
decrypted = bob.decryptMessage(new sym.EncryptedMessage(encrypted.payload), alice.publicAccount).payload;

// ③ 元のメッセージと一致するか確かめる
console.log(decrypted === message);`;
export const e4V3 = r`bob = facade.createAccount(sdkCore.PrivateKey.random());
message = 'Hello Symbol!';

// ① alice が、bob の公開鍵で暗号化する
encrypted = alice.messageEncoder().encode(bob.publicKey, new TextEncoder().encode(message));

// ② bob が、自分の秘密鍵と alice の公開鍵で復号する
decoded = bob.messageEncoder().tryDecode(alice.publicKey, encrypted);

// ③ 復号できて、元のメッセージと一致するか確かめる
console.log(decoded.isDecoded && new TextDecoder().decode(decoded.message) === message);`;

// 例題5 署名を検証する関数
export const e5V2 = r`Buffer = require("/node_modules/buffer").Buffer;

// 署名する関数（署名は16進数の文字列にする）
signMessage = (account, message) =>
  Buffer.from(sym.KeyPair.sign(account.keyPair, Buffer.from(message, 'utf-8'))).toString('hex').toUpperCase();

// 検証する関数（必要なのは、メッセージ・公開鍵・署名だけ）
verifyMessage = (message, publicKey, signature) =>
  sym.KeyPair.verify(
    sym.Convert.hexToUint8(publicKey),
    Buffer.from(message, 'utf-8'),
    Buffer.from(signature, 'hex')
  );

sig = signMessage(alice, 'Hello Symbol!');
console.log(verifyMessage('Hello Symbol!', alice.publicKey, sig)); // true
console.log(verifyMessage('Hello Symbol?', alice.publicKey, sig)); // false`;
export const e5V3 = r`// 検証する関数（必要なのは、メッセージ・公開鍵・署名だけ）
verifyMessage = (message, publicKeyText, signature) =>
  new sdkSymbol.Verifier(new sdkCore.PublicKey(publicKeyText)).verify(Buffer.from(message, 'utf-8'), signature);

sig = alice.keyPair.sign(Buffer.from('Hello Symbol!', 'utf-8'));
console.log(verifyMessage('Hello Symbol!', alice.publicKey.toString(), sig)); // true
console.log(verifyMessage('Hello Symbol?', alice.publicKey.toString(), sig)); // false`;
