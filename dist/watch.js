"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var bittrex = require("node.bittrex.api");
var db_1 = require("./db");
function allMarkets() {
    return new Promise(function (resolve, reject) {
        bittrex.getmarketsummaries(function (data, err) {
            if (err)
                reject(err);
            var ret = data.result.map(function (market) { return market.MarketName; });
            resolve(ret);
        });
    });
}
function listen(markets, exchangeCallback, summaryCallback) {
    var websocketsclient = bittrex.websockets.subscribe(markets, function (data) {
        if (data.M === "updateExchangeState") {
            data.A.forEach(exchangeCallback);
        }
        else if (data.M === "updateSummaryState") {
            data.A[0].Deltas.forEach(summaryCallback);
        }
        else {
            console.log('--------------', data); // <never>
        }
    });
}
function initTables(markets) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        var pairs, create, created, i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    pairs = markets.map(function (market) { return market.replace("-", "_").toLowerCase(); });
                    return [4 /*yield*/, Promise.all(pairs.map(function (pair) { return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                            var exists;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, db_1.tableExistsForPair(pair)];
                                    case 1:
                                        exists = _a.sent();
                                        if (!!exists) return [3 /*break*/, 3];
                                        console.log(pair + " table does not exist. Creating...");
                                        return [4 /*yield*/, db_1.createTableForPair(pair)];
                                    case 2:
                                        _a.sent();
                                        _a.label = 3;
                                    case 3:
                                        resolve(true);
                                        return [2 /*return*/];
                                }
                            });
                        }); }); }))];
                case 1:
                    create = _a.sent();
                    console.log("Double checking...");
                    return [4 /*yield*/, Promise.all(pairs.map(db_1.tableExistsForPair))];
                case 2:
                    created = _a.sent();
                    console.log(created);
                    for (i = 0; i < created.length; i++) {
                        if (!created[i]) {
                            throw "Table for '" + pairs[i] + "' cannot be created.";
                        }
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function watch() {
    return __awaiter(this, void 0, void 0, function () {
        var mkts, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, allMarkets()];
                case 1:
                    mkts = _a.sent();
                    return [4 /*yield*/, initTables(mkts)];
                case 2:
                    _a.sent();
                    console.log("Tables created.");
                    listen(["BTC-NEO", "BTC-ETH"], function (v, i, a) {
                        console.log(v);
                    });
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _a.sent();
                    console.log(e_1);
                    throw e_1;
                case 4: return [2 /*return*/];
            }
        });
    });
}
watch();
//# sourceMappingURL=watch.js.map