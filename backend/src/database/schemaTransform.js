const fs = require('fs');
const path = require('path');

/**
 * Transforms DATABASE_SCHEMA.sql into SQL that pg-mem can execute.
 * Strips features not supported by pg-mem (extensions, RLS, plpgsql,
 * triggers, policies). These are enforced in application code in dev mode.
 */
function transformSchema(sql) {
  return sql
    // CREATE EXTENSION statements
    .replace(/CREATE EXTENSION[^;]*;/gi, '')
    // Row-level security
    .replace(/ALTER TABLE[^;]*ENABLE ROW LEVEL SECURITY;/gi, '')
    // CREATE POLICY ... ; (no semicolons inside policy bodies)
    .replace(/CREATE POLICY[^;]*;/gs, '')
    // CREATE OR REPLACE FUNCTION ... $$ ... $$ LANGUAGE plpgsql;
    .replace(/CREATE OR REPLACE FUNCTION[\s\S]*?LANGUAGE plpgsql;/gi, '')
    // CREATE TRIGGER ... ; (no semicolons inside trigger statements)
    .replace(/CREATE TRIGGER[^;]*;/gi, '')
    // Indexes are unnecessary in dev (pg-mem supports them but skip for speed)
    .replace(/CREATE INDEX[^;]*;/gi, '')
    // pg-mem rejects precision/scale on numeric types
    .replace(/\bDECIMAL\s*\(\s*\d+\s*,\s*\d+\s*\)/gi, 'DECIMAL')
    .replace(/\bNUMERIC\s*\(\s*\d+\s*,\s*\d+\s*\)/gi, 'NUMERIC');
}

function loadTransformedSchema() {
  const schemaPath = path.join(__dirname, '../../../DATABASE_SCHEMA.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');
  return transformSchema(sql);
}

module.exports = { transformSchema, loadTransformedSchema };
