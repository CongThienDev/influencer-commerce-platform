import 'dotenv/config';
import { createDbPool } from '../src/app/db/client.js';
import { seedDatabase } from '../src/app/db/seed.js';

const env = {
  DATABASE_URL: process.env.DATABASE_URL,
  DB_SSL: process.env.DB_SSL === 'true'
};

const pool = createDbPool({ env });

if (!pool) {
  throw new Error('DATABASE_URL is required for seed');
}

try {
  await seedDatabase(pool);
  console.log('Seed completed');
} finally {
  await pool.end();
}
