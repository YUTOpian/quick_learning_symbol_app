NODE = window.origin; //現在開いているページのURLがここに入ります
sym = require("/node_modules/symbol-sdk");
repo = new sym.RepositoryFactoryHttp(NODE);
txRepo = repo.createTransactionRepository();
(async() =>{
    networkType = await repo.getNetworkType().toPromise();
    generationHash = await repo.getGenerationHash().toPromise();
    epochAdjustment = await repo.getEpochAdjustment().toPromise();
})();

function clog(signedTx){
    console.log(NODE + "/transactionStatus/" + signedTx.hash);
    console.log(NODE + "/transactions/confirmed/" + signedTx.hash);
    console.log("https://symbol.fyi/transactions/" + signedTx.hash);
    console.log("https://testnet.symbol.fyi/transactions/" + signedTx.hash);
}
