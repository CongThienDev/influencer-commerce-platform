import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createDbPool } from '../src/app/db/client.js';
import { runMigrations } from '../src/app/db/migrate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const migrationsDir = path.join(rootDir, 'db', 'migrations');

const env = {
  DATABASE_URL: process.env.DATABASE_URL,
  DB_SSL: process.env.DB_SSL === 'true'
};

const pool = createDbPool({ env });

if (!pool) {
  throw new Error('DATABASE_URL is required for migrations');
}

try {
  await runMigrations({ pool, migrationsDir });
  console.log('Migrations completed');
} finally {
  await pool.end();
}
