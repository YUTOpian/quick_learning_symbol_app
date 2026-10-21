const NODE = window.origin; //現在開いているページのURLがここに入ります
const Buffer = buffer.Buffer;

fetch(
  new URL('/node/info', NODE),
  {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  }
)
.then((res) => res.json())
.then((json) => {
  networkType = json.networkIdentifier;
  generationHash = json.networkGenerationHashSeed;
});
fetch(
  new URL('/network/properties', NODE),
  {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  }
)
.then((res) => res.json())
.then((json) => {
  e = json.network.epochAdjustment;
  epochAdjustment = Number(e.substring(0, e.length - 1));
  identifier = json.network.identifier;            // v3 only
  facade = new sdkSymbol.SymbolFacade(identifier); // v3 only
});

function clog(signedTx){
  hash = facade.hashTransaction(signedTx).toString();
  console.log(NODE + "/transactionStatus/" + hash);
  console.log(NODE + "/transactions/confirmed/" + hash);
  console.log("https://symbol.fyi/transactions/" + hash);
  console.log("https://testnet.symbol.fyi/transactions/" + hash);
}
