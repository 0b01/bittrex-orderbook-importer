import { DBUpdate } from '../typings';
import TectonicDB from './tectonic';

const THREADS = 20;
const PORT = 9001;
const HOST = 'localhost';

export default class TectonicPool {
    threads: number;
    port : number;
    address : string;
    sockets: TectonicDB[];

    constructor(threads=THREADS, port=PORT, address=HOST) {
        this.port = port;
        this.address = address;
        this.threads = threads;
        this.sockets = [];
        for (let i = 0; i < this.threads; i++) {
            this.sockets.push(new TectonicDB(this.port, this.address));
        }
    }

    bestSocket(): TectonicDB {
        const lens = this.sockets.map((sock) => sock.getQueueLen());
        console.log('Queue len: ', lens.reduce(
            (acc, i) => acc + i,
            0,
        ));
        const j = lens.indexOf(Math.max(...lens));
        return this.sockets[j];
    }

    async info() {
        return this.bestSocket().info();
    }

    async ping() {
        return this.bestSocket().ping();
    }

    async help() {
        return this.bestSocket().help();
    }

    async add(update : DBUpdate) {
        return this.bestSocket().add(update);
    }

    async bulkadd(updates : DBUpdate[]) {
        return this.bestSocket().bulkadd(updates);
    }

    async bulkadd_into(updates : DBUpdate[], db: string) {
        this.bestSocket().bulkadd_into(updates, db);
    }

    async insert(update: DBUpdate, db : string) {
        this.bestSocket().insert(update, db);
    }

    async getall() {
        return this.bestSocket().getall();
    }

    async get(n : number) {
        return this.bestSocket().get(n);
    }

    async clear() {
        return this.bestSocket().clear();
    }

    async clearall() {
        return this.bestSocket().clearall();
    }

    async flush() {
        return this.bestSocket().flush();
    }

    async flushall() {
        return this.bestSocket().flushall();
    }

    async create(dbname: string) {
        return this.bestSocket().create(dbname);
    }

    async use(dbname: string) {
        return this.bestSocket().use(dbname);
    }

    async exit() {
        await Promise.all(this.sockets.map((db) => db.exit()));
    }
}
