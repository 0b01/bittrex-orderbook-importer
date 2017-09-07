import * as bittrex from "node.bittrex.api";

function allMarkets() : Promise<[string]> {
    return new Promise((resolve, reject) => {
        bittrex.getmarketsummaries( function( data, err ) {
            if (err) reject(err);
            const ret = data.result.map((market) => market.MarketName)
            resolve(ret);
        });
    });
}


// types
//================================

interface ExchangeState {
     H: string, // Hub
     M: "updateExchangeState",
     A: [ExchangeStateUpdate]
}

type Side = "SELL" | "BUY";
type UpdateType = 0 // new order entries at matching price, add to orderbook
                | 1 // cancelled / filled order entries at matching price, delete from orderbook
                | 2 // changed order entries at matching price (partial fills, cancellations), edit in orderbook
                ;

interface ExchangeStateUpdate {
    MarketName: string,
    Nounce: number,
    Buys: [Buy],
    Sells: [Sell],
    Fills: [Fill]
}

type Sell = Buy;

interface Buy {
    Type: UpdateType,
    Rate: number,
    Quantity: number
}

interface Fill {
    OrderType: Side,
    Rate: number,
    Quantity: number,
    TimeStamp: string,
}

//================================

interface SummaryState {
    H: string,
    M: "updateSummaryState",
    A: [SummaryStateUpdate]
}

interface SummaryStateUpdate {
    Nounce: number,
    Deltas: [PairUpdate] 
}

interface PairUpdate {
    MarketName: string,
    High: number
    Low: number,
    Volume: number,
    Last: number,
    BaseVolume: number,
    TimeStamp: string,
    Bid: number,
    Ask: number,
    OpenBuyOrders: number,
    OpenSellOrders: number,
    PrevDay: number,
    Created: string
}

//================================

interface UnhandledData {
    unhandled_data: {
        R: boolean, // true, 
        I: string,  // '1'
    }
}

//================================


function listen(markets : [string]) : void {
    const websocketsclient = bittrex.websockets.subscribe(markets, (data : ExchangeState | SummaryState ) => {
        if (data.M === "updateExchangeState") {
            data.A.forEach((mkt : ExchangeStateUpdate) => {
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
    listen(["BTC-NEO"])
}

watch();




// function readMarketsFromFile() {
//     const markets = fs.readFileSync("./markets.txt", 'utf-8').split("\n");
//     return markets;
// }