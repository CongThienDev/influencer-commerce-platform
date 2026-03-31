import { env } from './core/env.js';
import { createAuthGuard, createRequireCsrf } from './core/security.js';
import { createIpRateLimiter } from './core/rate-limit.js';
import { AuthSessionModel } from './models/auth-session.model.js';
import { AuthService } from './services/auth.service.js';
import { AdminService } from './services/admin.service.js';
import { AuthCookieService } from './services/auth-cookie.service.js';
import { AuthController } from './controllers/auth.controller.js';
import { AdminController } from './controllers/admin.controller.js';
import { HealthController } from './controllers/health.controller.js';
import { PublicService } from './services/public.service.js';
import { PublicController } from './controllers/public.controller.js';
import { AdminDataModel } from './models/admin-data.model.js';
import { PostgresDataModel } from './models/postgres-data.model.js';
import { createDbPool } from './db/client.js';
import { runMigrations } from './db/migrate.js';
import { seedDatabase } from './db/seed.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..');
const migrationsDir = path.join(projectRoot, 'db', 'migrations');

async function buildDataModel() {
  const pool = createDbPool({ env });
  if (!pool) {
    return new AdminDataModel();
  }

  await runMigrations({ pool, migrationsDir });
  if (env.DB_SEED_ON_BOOT) {
    await seedDatabase(pool);
  }

  return new PostgresDataModel({ pool });
}

export async function buildDependencies() {
  const authSessionModel = new AuthSessionModel();
  const authCookieService = new AuthCookieService({ env });
  const authService = new AuthService({ env, authSessionModel });
  const dataModel = await buildDataModel();
  const adminService = new AdminService({ dataModel });
  const publicService = new PublicService({ dataModel, env });
  const publicRateLimiter = createIpRateLimiter({
    max: env.PUBLIC_RATE_LIMIT_MAX,
    windowMs: env.PUBLIC_RATE_LIMIT_WINDOW_MS
  });

  return {
    env,
    authController: new AuthController({ authService, authCookieService }),
    adminController: new AdminController({ adminService }),
    publicController: new PublicController({ publicService, publicRateLimiter }),
    healthController: new HealthController(),
    authGuard: createAuthGuard({ env }),
    requireCsrf: createRequireCsrf()
  };
}
