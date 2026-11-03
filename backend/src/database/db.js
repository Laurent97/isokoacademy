const crypto = require('crypto');

/**
 * Database connection.
 *
 * - If DATABASE_URL is set and reachable, uses a real PostgreSQL pool.
 * - Otherwise (local dev), boots an in-memory PostgreSQL via pg-mem,
 *   loads DATABASE_SCHEMA.sql (transformed) and seeds demo data.
 *
 * The exported object matches the `pg` Pool query API, so controllers
 * work unchanged against either backend.
 */

let pool;
let usingMemoryDb = false;

async function initMemoryDb() {
  const { newDb, DataType } = require('pg-mem');
  const { loadTransformedSchema } = require('./schemaTransform');

  const mem = newDb();

  // uuid_generate_v4 is provided by the uuid-ossp extension in real Postgres
  mem.public.registerFunction({
    name: 'uuid_generate_v4',
    returns: DataType.uuid,
    implementation: () => crypto.randomUUID(),
    impure: true,
  });
  // functions used in CHECK constraints / queries that pg-mem lacks
  mem.public.registerFunction({
    name: 'length',
    args: [DataType.text],
    returns: DataType.integer,
    implementation: (s) => (s == null ? null : String(s).length),
  });
  mem.public.registerFunction({
    name: 'greatest',
    args: [DataType.integer, DataType.integer],
    returns: DataType.integer,
    implementation: (a, b) => Math.max(a, b),
    isVariadic: true,
  });
  mem.public.registerFunction({
    name: 'least',
    args: [DataType.integer, DataType.integer],
    returns: DataType.integer,
    implementation: (a, b) => Math.min(a, b),
    isVariadic: true,
  });

  mem.public.none(loadTransformedSchema());

  const adapter = mem.adapters.createPg();
  pool = new adapter.Pool();
  usingMemoryDb = true;

  const { seedIfEmpty } = require('./seed');
  await seedIfEmpty(pool);

  console.log('[db] Using in-memory PostgreSQL (pg-mem) - data resets on restart');
  return pool;
}

function initRealDb() {
  const { Pool } = require('pg');
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });
  pool.on('error', (err) => {
    console.error('Unexpected error on idle pg client', err);
  });
  return pool;
}

/**
 * Initializes the database. Called once at server startup.
 */
async function init() {
  const serverless = !!process.env.VERCEL;
  if (process.env.DATABASE_URL) {
    try {
      initRealDb();
      await pool.query('SELECT 1');
      console.log('[db] Connected to PostgreSQL at DATABASE_URL');
      return module.exports;
    } catch (err) {
      if (serverless || process.env.NODE_ENV === 'production') {
        // never serve an empty dev DB in production — surface the real error
        throw new Error(`Database connection failed: ${err.message}`);
      }
      console.warn(`[db] Could not connect to DATABASE_URL (${err.message}). Falling back to in-memory dev DB.`);
      pool = undefined;
    }
  } else if (serverless || process.env.NODE_ENV === 'production') {
    throw new Error('DATABASE_URL is not set');
  }
  await initMemoryDb();
  return module.exports;
}

module.exports = {
  init,
  get isMemory() { return usingMemoryDb; },
  query: (...args) => pool.query(...args),
  connect: (...args) => pool.connect(...args),
};
