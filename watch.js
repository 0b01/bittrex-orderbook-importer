const fs = require('fs');
const bittrex = require("node.bittrex.api");

function printAllMarkets() {
    bittrex.getmarketsummaries( function( data, err ) {
    if (err) {
        return console.error(err);
    }
    for( var market of data.result ) {
        console.log(market.MarketName);
        // bittrex.getticker( { market : data.result[i].MarketName }, function( ticker ) {
        //   console.log( ticker );
        // });
    }
    });
}

function getMarkets() {
    const markets = fs.readFileSync("./markets.txt", 'utf-8').split();
    return markets;
}

function listen() {
    bittrex.websockets.subscribe(['BTC-NEO'], function(data) {
        console.log(data);
    });
}

listen();
