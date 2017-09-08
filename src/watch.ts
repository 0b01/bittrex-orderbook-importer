import * as bittrex from "node.bittrex.api";
import {
    ExchangeState,
    SummaryState,

    ExchangeStateUpdate,
    PairUpdate,

    ExchangeCallback,
    SummaryCallback
} from './typings';

import { 
    saveSnapshot,
    tableExistsForPair,
    createTableForPair,
} from './db';

function allMarkets() : Promise<[string]> {
    return new Promise((resolve, reject) => {
        bittrex.getmarketsummaries( function( data, err ) {
            if (err) reject(err);
            const ret = data.result.map((market) => market.MarketName)
            resolve(ret);
        });
    });
}


function listen(markets : [string], exchangeCallback?: ExchangeCallback, summaryCallback?: SummaryCallback) : void {
    const websocketsclient = bittrex.websockets.subscribe(markets, (data : ExchangeState | SummaryState ) => {
        if (data.M === "updateExchangeState") {
            data.A.forEach(exchangeCallback);
        } else if (data.M === "updateSummaryState") {
            data.A[0].Deltas.forEach(summaryCallback)
        } else {
            console.log('--------------',data); // <never>
        }
    });
}

async function initTables(markets : string[]) {
    let pairs = markets.map( market => market.replace("-", "_").toLowerCase());

    let create = await Promise.all(pairs.map(pair => new Promise(async (resolve, reject) => {
        let exists = await tableExistsForPair(pair);
        if (!exists) {
            console.log(`${pair} table does not exist. Creating...`)
            await createTableForPair(pair);
        }
        resolve(true);
    })));

    console.log("Double checking...");
    let created = await Promise.all(pairs.map(tableExistsForPair));
    for (let i = 0; i < created.length; i++) {
        if (!created[i]) {
            throw `Table for '${pairs[i]}' cannot be created.`;
        }
    }
}

async function watch() {
    try {
        let mkts = await allMarkets()

        await initTables(mkts);

        console.log("Tables created.");

        listen(["BTC-NEO", "BTC-ETH"], (v, i, a) => {
            console.log(v);
        });
    } catch (e) {
        console.log(e);
        throw e;
    }
}


watch();
