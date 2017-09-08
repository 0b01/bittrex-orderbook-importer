import * as bittrex from "node.bittrex.api";
import {ExchangeState, SummaryState} from './typings';

function allMarkets() : Promise<[string]> {
    return new Promise((resolve, reject) => {
        bittrex.getmarketsummaries( function( data, err ) {
            if (err) reject(err);
            const ret = data.result.map((market) => market.MarketName)
            resolve(ret);
        });
    });
}


function listen(markets : [string]) : void {
    const websocketsclient = bittrex.websockets.subscribe(markets, (data : ExchangeState | SummaryState ) => {
        if (data.M === "updateExchangeState") {
            data.A.forEach((mkt) => {
                console.log(mkt.MarketName);
                console.log(mkt.Buys);
            })
        } else if (data.M === "updateSummaryState") {
            // data.A[0].Deltas.forEach((pair : PairUpdate ) => {
            //     console.log(pair.MarketName)
            // })
        } else {
            console.log('--------------',data); // <never>
        }
    });
}


async function watch() {
    const markets = await allMarkets();

    // listen(markets);

    listen(["BTC-NEO", "BTC-ETH"]);
}


watch();

// function readMarketsFromFile() {
//     const markets = fs.readFileSync("./markets.txt", 'utf-8').split("\n");
//     return markets;
// }