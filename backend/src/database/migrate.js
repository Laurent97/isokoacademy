/**
 * Applies DATABASE_SCHEMA.sql to a real PostgreSQL database.
 * Usage: DATABASE_URL=postgres://... npm run migrate
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

async function migrate() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is required for migration');
    process.exit(1);
  }
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });
  const sql = fs.readFileSync(path.join(__dirname, '../../../DATABASE_SCHEMA.sql'), 'utf8');
  try {
    await pool.query(sql);
    console.log('Schema applied successfully');
  } catch (e) {
    console.error('Migration failed:', e.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

migrate();
