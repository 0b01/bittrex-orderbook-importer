import * as bittrex from "node.bittrex.api";
import {
    ExchangeState,
    SummaryState,

    ExchangeStateUpdate,
    PairUpdate,

    ExchangeCallback,
    SummaryCallback,

    DBUpdate
} from './typings';

import { 
    saveSnapshot,
    tableExistsForPair,
    createTableForPair,
    saveUpdate
} from './db';

import { toPair } from './utils';

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
    let pairs = markets.map(toPair);

    let create = await Promise.all(
        pairs.map(pair => new Promise(async (resolve, reject) => {
            let exists = await tableExistsForPair(pair);
            if (!exists) {
                console.log(`${pair} table does not exist. Creating...`)
                await createTableForPair(pair);
            }
            resolve(true);
        }))
    );

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
            let updates : DBUpdate[] = formatUpdate(v);
            updates.forEach(update => {
                const { pair, seq, is_trade, is_bid, price, size, timestamp } = update;
                saveUpdate(pair, seq, is_trade, is_bid, price, size, timestamp);
            });
        });

    } catch (e) {
        console.log(e);
        throw e;
    }
}

function formatUpdate(v : ExchangeStateUpdate) {
    let updates : DBUpdate[] = [];
    
    const pair = toPair(v.MarketName);
    const seq = v.Nounce;
    const timestamp = Date.now() / 1000;

    v.Buys.forEach(buy => {
        updates.push(
            {
                pair,
                seq,
                is_trade: false,
                is_bid: true,
                price: buy.Rate,
                size: buy.Quantity,
                timestamp
            }
        );
    });

    v.Sells.forEach(sell => {
        updates.push(
            {
                pair,
                seq,
                is_trade: false,
                is_bid: false,
                price: sell.Rate,
                size: sell.Quantity,
                timestamp
            }
        );
    });

    v.Fills.forEach(fill => {
        updates.push(
            {
                pair,
                seq,
                is_trade: true,
                is_bid: fill.OrderType === "BUY",
                price: fill.Rate,
                size: fill.Quantity,
                timestamp: (new Date(fill.TimeStamp)).getTime()
            }
        );
    })

    return updates;
}


watch();
