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
var pg = require("pg");
var config = require("../config/db.json");
var pool = new pg.Pool(config);
pool.on('error', function (err, client) {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});
function createDB() {
    return __awaiter(this, void 0, void 0, function () {
        var client, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, pool.connect()];
                case 1:
                    client = _a.sent();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, , 4, 5]);
                    return [4 /*yield*/, client.query('CREATE DATABASE bittrex;')];
                case 3:
                    res = _a.sent();
                    console.log(res.rows[0]);
                    return [3 /*break*/, 5];
                case 4:
                    client.release();
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.createDB = createDB;
function createTableForPair(pair) {
    return __awaiter(this, void 0, void 0, function () {
        var client;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, pool.connect()];
                case 1:
                    client = _a.sent();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, , 4, 5]);
                    return [4 /*yield*/, client.query("\n    CREATE TABLE IF NOT EXISTS orderbook_" + pair + "\n    (\n        id SERIAL PRIMARY KEY NOT NULL,\n        seq INTEGER NOT NULL,\n        is_trade BOOLEAN,\n        is_bid BOOLEAN,\n        price DOUBLE PRECISION,\n        size DOUBLE PRECISION,\n        ts DOUBLE PRECISION,\n        trade_id INTEGER\n    );\n    CREATE UNIQUE INDEX IF NOT EXISTS orderbook_" + pair + "_id_uindex ON orderbook_" + pair + " (id);\n\n    CREATE TABLE IF NOT EXISTS orderbook_snapshot_" + pair + "\n    (\n        id SERIAL PRIMARY KEY NOT NULL,\n        seq INTEGER NOT NULL,\n        snapshot JSON NOT NULL\n    );\n    CREATE UNIQUE INDEX IF NOT EXISTS orderbook_snapshot_" + pair + "_id_uindex ON orderbook_snapshot_" + pair + " (id);\n    ")];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    client.release();
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/, true];
            }
        });
    });
}
exports.createTableForPair = createTableForPair;
function tableExistsForPair(pair) {
    return __awaiter(this, void 0, void 0, function () {
        var client, res, exists, res2, exists2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, pool.connect()];
                case 1:
                    client = _a.sent();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, , 5, 6]);
                    return [4 /*yield*/, client.query("\n      SELECT EXISTS (\n        SELECT 1\n        FROM   information_schema.tables\n        WHERE  table_schema = 'public'\n        AND    table_name = 'orderbook_snapshot_" + pair + "'\n      );\n    ")];
                case 3:
                    res = _a.sent();
                    exists = res.rows[0].exists;
                    return [4 /*yield*/, client.query("\n      SELECT EXISTS (\n        SELECT 1\n        FROM   information_schema.tables\n        WHERE  table_schema = 'public'\n        AND    table_name = 'orderbook_" + pair + "'\n      );\n    ")];
                case 4:
                    res2 = _a.sent();
                    exists2 = res.rows[0].exists;
                    return [2 /*return*/, exists && exists2];
                case 5:
                    client.release();
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    });
}
exports.tableExistsForPair = tableExistsForPair;
function saveUpdate(pair, seq, is_trade, is_bid, price, size, timestamp) {
    return __awaiter(this, void 0, void 0, function () {
        var client, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, pool.connect()];
                case 1:
                    client = _a.sent();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, , 4, 5]);
                    return [4 /*yield*/, client.query("\n      INSERT INTO orderbook_" + pair + "\n        (seq, is_trade, is_bid, price, size, ts)\n      VALUES\n        (" + seq + ", " + is_trade + ", " + is_bid + ", " + price + ", " + size + ", " + timestamp + ");\n    ")];
                case 3:
                    res = _a.sent();
                    console.log(res.rows[0]);
                    return [3 /*break*/, 5];
                case 4:
                    client.release();
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.saveUpdate = saveUpdate;
function saveSnapshot(pair, seq, bids, asks) {
    return __awaiter(this, void 0, void 0, function () {
        var client, json, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, pool.connect()];
                case 1:
                    client = _a.sent();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, , 4, 5]);
                    json = JSON.stringify({ "bids": bids, "asks": asks });
                    return [4 /*yield*/, client.query("\n      INSERT INTO orderbook_snapshot_" + pair + "\n        (seq, snapshot)\n      VALUES\n        (" + seq + ", '" + json + "');\n    ")];
                case 3:
                    res = _a.sent();
                    console.log(res.rows[0]);
                    return [3 /*break*/, 5];
                case 4:
                    client.release();
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.saveSnapshot = saveSnapshot;
//# sourceMappingURL=db.js.map