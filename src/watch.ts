const bittrex = require("./node.bittrex.api");

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
    db,
    tableExistsForPair,
    createTableForPair
} from './db';

import { toPair } from './utils';

function allMarkets() : Promise<[string]> {
    return new Promise((resolve, reject) => {
        bittrex.getmarketsummaries( function( data : any, err : never) {
            if (err) reject(err);
            const ret = data.result.map((market : PairUpdate) => market.MarketName)
            resolve(ret);
        });
    });
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
                timestamp,
                type: buy.Type
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
                timestamp,
                type: sell.Type
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
                timestamp: (new Date(fill.TimeStamp)).getTime() / 1000,
                type: null
            }
        );
    })

    return updates;
}

function listen(markets : string[], exchangeCallback?: ExchangeCallback, summaryCallback?: SummaryCallback) : void {
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
        let mkts = ["BTC-NEO", "BTC-ETH"]; 
        // let mkts = await allMarkets();
        console.log(mkts);
        await initTables(mkts);
        console.log("Tables created.");
        listen(mkts, (v, i, a) => {
            let updates : DBUpdate[] = formatUpdate(v);
            db.bulkadd_into(updates, updates[0].pair);
        });

    } catch (e) {
        console.log(e);
        throw e;
    }
}

let main = watch;

main();
// test();


function test() {
    db.bulkadd_into([{
        pair: 'default',
        seq: 0,
        is_bid: true,
        is_trade: true,
        size: 0.1,
        price: 0.1,
        timestamp: 100,
        type: 0
    }], "default");
}