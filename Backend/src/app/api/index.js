import { Router } from 'express';
import { createAuthRoutes } from './auth.routes.js';
import { createAdminRoutes } from './admin.routes.js';
import { createHealthRoutes } from './health.routes.js';

export function createApiRouter({
  authController,
  adminController,
  healthController,
  authGuard
}) {
  const router = Router();

  router.use('/health', createHealthRoutes({ healthController }));
  router.use('/auth', createAuthRoutes({ authController, authGuard }));
  router.use('/admin', createAdminRoutes({ adminController, authGuard }));

  return router;
}
