/**
 * Patch @expo/cli <= 0.17.x for Node >= 20 where builtinModules contains
 * 'node:'-prefixed entries (e.g. node:sea). Metro externals mkdir fails on
 * those names on Windows. Filters them out. Idempotent.
 */
const fs = require('fs');
const path = require('path');

const file = path.join(
  __dirname, '..', 'node_modules', '@expo', 'cli', 'build', 'src', 'start', 'server', 'metro', 'externals.js'
);

try {
  let src = fs.readFileSync(file, 'utf8');
  const needle = '.test(x) && ![';
  const patched = '.test(x) && !x.includes(":") && ![';
  if (src.includes(patched)) {
    console.log('[patch] @expo/cli externals already patched');
    return;
  }
  if (!src.includes(needle)) {
    console.log('[patch] @expo/cli externals pattern not found - skipping');
    return;
  }
  src = src.replace(needle, patched);
  fs.writeFileSync(file, src);
  console.log('[patch] Applied node: prefix fix to @expo/cli externals.js');
} catch (e) {
  console.log('[patch] Could not patch @expo/cli:', e.message);
}
