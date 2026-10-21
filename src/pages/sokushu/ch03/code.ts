// 速習Symbol 第3章 アカウント のサンプルコードと出力例（03_account.md より）。
// コンソールでそのまま実行できるよう、const 宣言は付けていない（ch02 と同じ方針）。
const r = String.raw;

// ---------- 3.1 アカウント生成 ----------
export const newV2 = r`alice = sym.Account.generateNewAccount(networkType);
console.log(alice);`;
export const newV2Out = r`> Account
    address: Address {address: 'TBXUTAX6O6EUVPB6X7OBNX6UUXBMPPAFX7KE5TQ', networkType: 152}
    keyPair: {privateKey: Uint8Array(32), publicKey: Uint8Array(32)}`;
export const networkTypes = r`{104: 'MAIN_NET', 152: 'TEST_NET'}`;

export const newV3 = r`alice = facade.createAccount(sdkCore.PrivateKey.random());
console.log(alice);`;
export const newV3Out = r`> SymbolAccount
  > address: Address
      bytes: Uint8Array(24)
  > keyPair: KeyPair
    > publicKey: PublicKey
        bytes: Uint8Array(32)
    > privateKey: PrivateKey
        bytes: Uint8Array(32)
  > publicKey: PublicKey
      bytes: Uint8Array(32)
  > _facade: SymbolFacade
      network: Network
      transactionFactory: TransactionFactory`;
export const newV3Old = r`aliceKey = new sdkSymbol.KeyPair(sdkCore.PrivateKey.random());
console.log(aliceKey);
aliceAddress = facade.network.publicKeyToAddress(aliceKey.publicKey);
console.log(aliceAddress);`;
export const newV3OldOut = r`> KeyPair {_privateKey: PrivateKey, _keyPair: {…}}
    _keyPair: {publicKey: Uint8Array(32), privateKey: Uint8Array(32)}
    _privateKey: PrivateKey {bytes: Uint8Array(32)}
> Address {bytes: Uint8Array(24)}`;

export const keysV2 = r`console.log(alice.privateKey);
console.log(alice.publicKey);`;
export const keysV3 = r`console.log(alice.keyPair.privateKey.toString());
console.log(alice.publicKey.toString());`;
export const keysOut = r`> 1E9139CC1580B4AED6A1FE110085281D4982ED0D89CE07F3380EB83069B1****
> D4933FC1E4C56F9DF9314E9E0533173E1AB727BDB2A04B59F048124E93BEFBD2`;

export const rawAddressV2 = r`aliceRawAddress = alice.address.plain();
console.log(aliceRawAddress);`;
export const rawAddressV3 = r`aliceRawAddress = alice.address.toString();
console.log(aliceRawAddress);`;
export const rawAddressOut = r`> TBXUTAX6O6EUVPB6X7OBNX6UUXBMPPAFX7KE5TQ`;

export const fromKeyV2 = r`alice = sym.Account.createFromPrivateKey(
  "1E9139CC1580B4AED6A1FE110085281D4982ED0D89CE07F3380EB83069B1****",
  networkType
);`;
export const fromKeyV3 = r`alice = facade.createAccount(new sdkCore.PrivateKey("1E9139CC1580B4AED6A1FE110085281D4982ED0D89CE07F3380EB83069B1****"));`;

export const pubAccV2 = r`alicePublicAccount = sym.PublicAccount.createFromPublicKey(
  "D4933FC1E4C56F9DF9314E9E0533173E1AB727BDB2A04B59F048124E93BEFBD2",
  networkType
);
console.log(alicePublicAccount);`;
export const pubAccV2Out = r`> PublicAccount
    address: Address {address: 'TBXUTAX6O6EUVPB6X7OBNX6UUXBMPPAFX7KE5TQ', networkType: 152}
    publicKey: "D4933FC1E4C56F9DF9314E9E0533173E1AB727BDB2A04B59F048124E93BEFBD2"`;
export const pubAccV3 = r`alicePublicAccount = facade.createPublicAccount(new sdkCore.PublicKey("D4933FC1E4C56F9DF9314E9E0533173E1AB727BDB2A04B59F048124E93BEFBD2"));
console.log(alicePublicAccount);`;
export const pubAccV3Out = r`> SymbolPublicAccount
  > address: Address
      bytes: Uint8Array(24)
  > publicKey: PublicKey
      bytes: Uint8Array(32)
  > _facade: SymbolFacade
      network: Network
      transactionFactory: TransactionFactory`;

export const addrV2 = r`aliceAddress = sym.Address.createFromRawAddress(
  "TBXUTAX6O6EUVPB6X7OBNX6UUXBMPPAFX7KE5TQ"
);
console.log(aliceAddress);`;
export const addrV2Out = r`> Address
    address: "TBXUTAX6O6EUVPB6X7OBNX6UUXBMPPAFX7KE5TQ"
    networkType: 152`;
export const addrV3 = r`aliceAddress = new sdkSymbol.Address("TBXUTAX6O6EUVPB6X7OBNX6UUXBMPPAFX7KE5TQ");
console.log(aliceAddress);
console.log(aliceAddress.toString());`;
export const addrV3Out = r`> Address {bytes: Uint8Array(24)}
> TBXUTAX6O6EUVPB6X7OBNX6UUXBMPPAFX7KE5TQ`;

// ---------- 3.3 アカウント情報の確認 ----------
export const infoV2 = r`accountRepo = repo.createAccountRepository();
accountInfo = await accountRepo.getAccountInfo(aliceAddress).toPromise();
console.log(accountInfo);`;
export const infoV2Out = r`> AccountInfo
    address: Address {address: 'TBXUTAX6O6EUVPB6X7OBNX6UUXBMPPAFX7KE5TQ', networkType: 152}
    publicKey: "0000000000000000000000000000000000000000000000000000000000000000"
  > mosaics: Array(1)
      0: Mosaic
        amount: UInt64 {lower: 10000000, higher: 0}
        id: MosaicId
          id: Id {lower: 760461000, higher: 981735131}`;
export const infoV3 = r`accountInfo = await fetch(
  new URL('/accounts/' + aliceAddress.toString(), NODE),
  {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  }
)
.then((res) => res.json())
.then((json) => {
  return json.account;
});
console.log(accountInfo);`;
export const infoV3Out = r`> {version: 1, address: '986F4982FE77894ABC3EBFDC16DFD4A5C2C7BC05BFD44ECE', addressHeight: '52812', publicKey: '0000000000000000000000000000000000000000000000000000000000000000', publicKeyHeight: '0', …}
    address: "986F4982FE77894ABC3EBFDC16DFD4A5C2C7BC05BFD44ECE"
    publicKey: "0000000000000000000000000000000000000000000000000000000000000000"
  > mosaics: Array(1)
      0:
        amount: "3510000000"
        id: "72C0212E67A08BCE"`;

export const uint64V2 = r`console.log("addressHeight:"); //アドレスが記録されたブロック高
console.log(accountInfo.addressHeight.compact()); //数値
accountInfo.mosaics.forEach(mosaic => {
  console.log("id:" + mosaic.id.toHex()); //16進数
  console.log("amount:" + mosaic.amount.toString()); //文字列
});`;
export const bigint = r`12345n;           // 数値の後ろに n を付ける
BigInt(12345);    // BigInt(数値)
0x12345n;         // 16進数も同様
BigInt(0x12345);`;

export const divV2 = r`mosaicRepo = repo.createMosaicRepository();
mosaicAmount = accountInfo.mosaics[0].amount.toString();
mosaicInfo = await mosaicRepo.getMosaic(accountInfo.mosaics[0].id).toPromise();
divisibility = mosaicInfo.divisibility; //可分性
if(divisibility > 0){
  displayAmount = mosaicAmount.slice(0,mosaicAmount.length-divisibility)  
  + "." + mosaicAmount.slice(-divisibility);
}else{
  displayAmount = mosaicAmount;
}
console.log(displayAmount);`;
export const divV3 = r`mosaicAmount = accountInfo.mosaics[0].amount;
mosaicInfo = await fetch(
  new URL('/mosaics/' + accountInfo.mosaics[0].id, NODE),
  {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  }
)
.then((res) => res.json())
.then((json) => {
  return json.mosaic;
});

divisibility = mosaicInfo.divisibility; //可分性
if(divisibility > 0){
  displayAmount = mosaicAmount.slice(0,mosaicAmount.length-divisibility)  
  + "." + mosaicAmount.slice(-divisibility);
}else{
  displayAmount = mosaicAmount;
}
console.log(displayAmount);`;

// ---------- 3.4 現場で使えるヒント ----------
export const bobV2 = r`bob = sym.Account.generateNewAccount(networkType);
bobPublicAccount = bob.publicAccount;`;
export const bobV3 = r`bob = facade.createAccount(sdkCore.PrivateKey.random());`;

export const encV2 = r`message = 'Hello Symbol!';
encryptedMessage = alice.encryptMessage(message ,bob.publicAccount);
console.log(encryptedMessage);`;
export const encV2Out = r`> EncryptedMessage
    payload: "C7451071F843015509C57BAA1C994C73E9FF1302CB2995423932D834A620532F54CF328B1CDA4426F8"
  > recipientPublicAccount: PublicAccount
      address: Address {address: 'TCUNO37PQOBCOTKHF3RXP4X7GOJ6LNRMBC2DFHI', networkType: 152}
      publicKey: "662CEDF69962B1E0F1BF0C43A510DFB12190128B90F7FE9BA48B1249E8E10DBE"`;
export const encV3 = r`message = 'Hello Symbol!';
encryptedMessage = alice.messageEncoder().encode(bob.publicKey, new TextEncoder().encode(message));
console.log(Buffer.from(encryptedMessage).toString("hex").toUpperCase());`;
export const encV3Out = r`> 0167AF68C3E7EFBD7048F6E9140FAA14256B64DD19FD0708EDCF17758A81FCC00084D869D6F1434A77AF`;

export const decV2 = r`decryptMessage = bob.decryptMessage(
  new sym.EncryptedMessage(
    "C7451071F843015509C57BAA1C994C73E9FF1302CB2995423932D834A620532F54CF328B1CDA4426F8"
  ),
  alice.publicAccount
).payload
console.log(decryptMessage);`;
export const decV3 = r`decryptMessageData = bob.messageEncoder().tryDecode(alice.publicKey, Uint8Array.from(Buffer.from("0167AF68C3E7EFBD7048F6E9140FAA14256B64DD19FD0708EDCF17758A81FCC00084D869D6F1434A77AF", "hex"))); // 暗号化時のデータに置き換えてください
console.log(decryptMessageData);
if (decryptMessageData.isDecoded) {
  decryptMessage = new TextDecoder().decode(decryptMessageData.message);
  console.log(decryptMessage);
} else {
  console.log("decrypt failed!");
}`;
export const decV3Out = r`> {isDecoded: true, message: Uint8Array(13)}
> "Hello Symbol!"`;
export const decV307 = r`if (decryptMessageData[0]) {
  decryptMessage = new TextDecoder().decode(decryptMessageData[1]);
  console.log(decryptMessage);
} else {
  console.log("decrypt failed!");
}`;
export const decV307Out = r`> [true, Uint8Array(13)]
> "Hello Symbol!"`;

export const signV2 = r`Buffer = require("/node_modules/buffer").Buffer;
payload = Buffer.from("Hello Symbol!", 'utf-8');
signature = Buffer.from(sym.KeyPair.sign(alice.keyPair, payload)).toString("hex").toUpperCase();
console.log(signature);`;
export const signV3 = r`payload = Buffer.from("Hello Symbol!", 'utf-8');
signature = alice.keyPair.sign(payload);
console.log(signature.toString());`;
export const signOut = r`> B8A9BCDE9246BB5780A8DED0F4D5DFC80020BBB7360B863EC1F9C62CAFA8686049F39A9F403CB4E66104754A6AEDEF8F6B4AC79E9416DEEDC176FDD24AFEC60E`;

export const verifyV2 = r`isVerified = sym.KeyPair.verify(
  alice.keyPair.publicKey,
  Buffer.from("Hello Symbol!", 'utf-8'),
  Buffer.from(signature, 'hex')
)
console.log(isVerified);`;
export const verifyV3 = r`v = new sdkSymbol.Verifier(alice.publicKey);
isVerified = v.verify(Buffer.from("Hello Symbol!", 'utf-8'), signature);
console.log(isVerified);`;
export const verifyOut = r`> true`;

export const qrEncrypt = r`qr = require("/node_modules/symbol-qr-library");

//パスフレーズでロックされたアカウント生成
signerQR = qr.QRCodeGenerator.createExportAccount(
  alice.privateKey, networkType, generationHash, "パスフレーズ"
);

//QRコード表示
signerQR.toBase64().subscribe(x =>{

  //HTML body上にQRコードを表示する例
  (tag= document.createElement('img')).src = x;
  document.getElementsByTagName('body')[0].appendChild(tag);
});

//アカウントを暗号化したJSONデータとして表示
jsonSignerQR = signerQR.toJSON();
console.log(jsonSignerQR);`;
export const qrEncryptOut = r`> {"v":3,"type":2,"network_id":152,"chain_id":"7FCCD304802016BEBBCD342A332F91FF1F3BB5E902988B352697BE245F48E836","data":{"ciphertext":"e9e2f76cb482fd054bc13b7ca7c9d086E7VxeGS/N8n1WGTc5MwshNMxUiOpSV2CNagtc6dDZ7rVZcnHXrrESS06CtDTLdD7qrNZEZAi166ucDUgk4Yst0P/XJfesCpXRxlzzNgcK8Q=","salt":"54de9318a44cc8990e01baba1bcb92fa111d5bcc0b02ffc6544d2816989dc0e9"}}`;
export const qrDecrypt = r`//保存しておいたテキスト、あるいはQRコードスキャンで得られたテキストをjsonSignerQRに代入
jsonSignerQR = '{"v":3,"type":2,"network_id":152,"chain_id":"7FCCD304802016BEBBCD342A332F91FF1F3BB5E902988B352697BE245F48E836","data":{"ciphertext":"e9e2f76cb482fd054bc13b7ca7c9d086E7VxeGS/N8n1WGTc5MwshNMxUiOpSV2CNagtc6dDZ7rVZcnHXrrESS06CtDTLdD7qrNZEZAi166ucDUgk4Yst0P/XJfesCpXRxlzzNgcK8Q=","salt":"54de9318a44cc8990e01baba1bcb92fa111d5bcc0b02ffc6544d2816989dc0e9"}}';

qr = require("/node_modules/symbol-qr-library");
signerQR = qr.AccountQR.fromJSON(jsonSignerQR,"パスフレーズ");
console.log(signerQR.accountPrivateKey);`;
export const qrDecryptOut = r`> 1E9139CC1580B4AED6A1FE110085281D4982ED0D89CE07F3380EB83069B1****`;
