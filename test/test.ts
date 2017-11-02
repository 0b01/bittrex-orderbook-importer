import { expect } from 'chai';
import 'mocha';
import { TectonicPool } from '../src/tectonicdb';

const up = {
        pair: 'btc_eth',
        seq: 0,
        is_bid: true,
        is_trade: true,
        size: 0.1,
        price: 0.1,
        timestamp: 100,
        type: 0,
    };
const shouldbe = {
  ts: 0.1,
  seq: 0,
  is_trade: true,
  is_bid: true,
  price: 0.1,
  size: 0.1,
};

describe('tectonicdb client', () => {
  it('should create database okay', async () => {
    const db = new TectonicPool(10);
    await db.create('btc_eth');
    await db.create('btc_neo');
    let result = await db.use('btc_eth');
    expect(result.success).to.equal(true);
    result = await db.use('btc_neo');
    expect(result.success).to.equal(true);
    db.exit();
  });

  it('should ping okay', async () => {
    const db = new TectonicPool(10);
    const result = await db.ping();
    expect(result.data).to.equal('PONG.\n');
    db.exit();
  });

  it('should exit', async () => {
    const db = new TectonicPool(10);
    await db.use('default');
    await db.exit();
  });

  it('should add okay', async () => {
    const db = new TectonicPool(10);
    await db.use('default');
    const add = await db.add(up);
    expect(add.success).to.equal(true);
    expect(add.data).to.equal('1\n');

    const res = await db.get(1);
    expect(res[0]).to.deep.equal(shouldbe);
    await db.exit();
  });

  it('should bulk insert okay', async () => {
    const db = new TectonicPool(10);
    await db.create('btc_eth');
    await db.create('btc_neo');
    await db.bulkadd_into([up], 'btc_eth');
    await db.bulkadd_into([up], 'btc_neo');

    await db.use('btc_neo');
    const res1 = await db.get(1);
    expect(res1[0]).to.deep.equal(shouldbe);

    await db.use('btc_eth');
    const res2 = await db.get(1);
    expect(res2[0]).to.deep.equal(shouldbe);

    await db.exit();
  });

});
