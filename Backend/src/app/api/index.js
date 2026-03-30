import { Router } from 'express';
import { createAuthRoutes } from './auth.routes.js';
import { createAdminRoutes } from './admin.routes.js';
import { createHealthRoutes } from './health.routes.js';
import { createPublicRoutes } from './public.routes.js';

export function createApiRouter({
  authController,
  adminController,
  healthController,
  authGuard,
  publicController
}) {
  const router = Router();

  router.use('/health', createHealthRoutes({ healthController }));
  router.use('/auth', createAuthRoutes({ authController, authGuard }));
  router.use('/', createPublicRoutes({ publicController }));
  router.use('/admin', createAdminRoutes({ adminController, authGuard }));

  return router;
}
