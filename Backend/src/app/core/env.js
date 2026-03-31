const PORT = Number(process.env.PORT || 4000);
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET || 'dev-secret';
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || ACCESS_TOKEN_SECRET;
const ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '6h';
const REFRESH_TOKEN_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';
const ACCESS_TOKEN_MAX_AGE_MS =
  Number(process.env.ACCESS_TOKEN_MAX_AGE_MS) || 6 * 60 * 60 * 1000;
const REFRESH_TOKEN_MAX_AGE_MS =
  Number(process.env.REFRESH_TOKEN_MAX_AGE_MS) || 30 * 24 * 60 * 60 * 1000;
const CSRF_TOKEN_MAX_AGE_MS =
  Number(process.env.CSRF_TOKEN_MAX_AGE_MS) || REFRESH_TOKEN_MAX_AGE_MS;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123456';
const IS_PROD = process.env.NODE_ENV === 'production';
const DATABASE_URL = process.env.DATABASE_URL || '';
const DB_SSL = process.env.DB_SSL === 'true';
const DB_SEED_ON_BOOT = process.env.DB_SEED_ON_BOOT === 'true';
const PUBLIC_RATE_LIMIT_MAX = Number(process.env.PUBLIC_RATE_LIMIT_MAX || 120);
const PUBLIC_RATE_LIMIT_WINDOW_MS = Number(process.env.PUBLIC_RATE_LIMIT_WINDOW_MS || 60_000);

export const env = {
  PORT,
  FRONTEND_ORIGIN,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN,
  ACCESS_TOKEN_MAX_AGE_MS,
  REFRESH_TOKEN_MAX_AGE_MS,
  CSRF_TOKEN_MAX_AGE_MS,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  IS_PROD,
  DATABASE_URL,
  DB_SSL,
  DB_SEED_ON_BOOT,
  PUBLIC_RATE_LIMIT_MAX,
  PUBLIC_RATE_LIMIT_WINDOW_MS
};
