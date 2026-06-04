// Runs schema.sql then seed.sql against the configured database.
// Used both for local setup and as the container entrypoint helper.
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { pool } from './db.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function run() {
  const schema = await readFile(join(__dirname, '..', 'db', 'schema.sql'), 'utf8');
  const seed = await readFile(join(__dirname, '..', 'db', 'seed.sql'), 'utf8');

  const client = await pool.connect();
  try {
    console.log('Applying schema...');
    await client.query(schema);
    console.log('Seeding data...');
    await client.query(seed);
    console.log('Migration + seed complete.');
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
