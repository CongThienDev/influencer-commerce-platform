import { env } from './core/env.js';
import { createAuthGuard, createRequireCsrf } from './core/security.js';
import { AuthSessionModel } from './models/auth-session.model.js';
import { AuthService } from './services/auth.service.js';
import { AdminService } from './services/admin.service.js';
import { AuthCookieService } from './services/auth-cookie.service.js';
import { AuthController } from './controllers/auth.controller.js';
import { AdminController } from './controllers/admin.controller.js';
import { HealthController } from './controllers/health.controller.js';

export function buildDependencies() {
  const authSessionModel = new AuthSessionModel();
  const authCookieService = new AuthCookieService({ env });
  const authService = new AuthService({ env, authSessionModel });
  const adminService = new AdminService();

  return {
    env,
    authController: new AuthController({ authService, authCookieService }),
    adminController: new AdminController({ adminService }),
    healthController: new HealthController(),
    authGuard: createAuthGuard({ env }),
    requireCsrf: createRequireCsrf()
  };
}
