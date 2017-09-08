import * as pg from 'pg';
let config = require("../config/db.json");

const pool = new pg.Pool(config);

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
});

export async function createDB() : Promise<void> {
  const client = await pool.connect()
  try {
    const res = await client.query('CREATE DATABASE bittrex;')
    console.log(res.rows[0])
  } finally {
    client.release();
  }
}

export async function createTableForPair(pair: string) : Promise<boolean> {
  const client = await pool.connect()
  try {
    await client.query(`
    CREATE TABLE IF NOT EXISTS orderbook_${pair}
    (
        id SERIAL PRIMARY KEY NOT NULL,
        seq INTEGER NOT NULL,
        is_trade BOOLEAN,
        is_bid BOOLEAN,
        price DOUBLE PRECISION,
        size DOUBLE PRECISION,
        ts DOUBLE PRECISION,
        trade_id INTEGER
    );
    CREATE UNIQUE INDEX IF NOT EXISTS orderbook_${pair}_id_uindex ON orderbook_${pair} (id);

    CREATE TABLE IF NOT EXISTS orderbook_snapshot_${pair}
    (
        id SERIAL PRIMARY KEY NOT NULL,
        seq INTEGER NOT NULL,
        snapshot JSON NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS orderbook_snapshot_${pair}_id_uindex ON orderbook_snapshot_${pair} (id);
    `);

  } finally {
    client.release()
  }

  return true;
}

export async function tableExistsForPair(pair: string) : Promise<boolean> {
  const client = await pool.connect()

  try {
    const res = await client.query(`
      SELECT EXISTS (
        SELECT 1
        FROM   information_schema.tables
        WHERE  table_schema = 'public'
        AND    table_name = 'orderbook_snapshot_${pair}'
      );
    `)
    let exists = res.rows[0].exists;

    const res2 = await client.query(`
      SELECT EXISTS (
        SELECT 1
        FROM   information_schema.tables
        WHERE  table_schema = 'public'
        AND    table_name = 'orderbook_${pair}'
      );
    `);
    let exists2 = res.rows[0].exists;

    return exists && exists2;

  } finally {
    client.release()
  }
}


export async function saveUpdate(
  pair: string, seq: number, is_trade: boolean,
  is_bid: boolean, price: number, size: number, timestamp: number
) : Promise<void> {
  const client = await pool.connect()
  try {
    const res = await client.query(`
      INSERT INTO orderbook_${pair}
        (seq, is_trade, is_bid, price, size, ts)
      VALUES
        (${seq}, ${is_trade}, ${is_bid}, ${price}, ${size}, ${timestamp});
    `);
    console.log(res.rows[0]);
  } finally {
    client.release();
  }
}

export async function saveSnapshot(pair, seq, bids, asks) : Promise<void> {
  const client = await pool.connect();
  try {
    const json = JSON.stringify({ "bids": bids, "asks": asks });

    const res = await client.query(`
      INSERT INTO orderbook_snapshot_${pair}
        (seq, snapshot)
      VALUES
        (${seq}, '${json}');
    `);

    console.log(res.rows[0]);
  } finally {
    client.release();
  }
}

