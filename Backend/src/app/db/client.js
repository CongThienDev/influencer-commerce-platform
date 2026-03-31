import { Pool } from 'pg';

export function createDbPool({ env }) {
  if (!env.DATABASE_URL) {
    return null;
  }

  return new Pool({
    connectionString: env.DATABASE_URL,
    ssl: env.DB_SSL ? { rejectUnauthorized: false } : false
  });
}
