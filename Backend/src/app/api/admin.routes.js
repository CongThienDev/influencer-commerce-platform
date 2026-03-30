import { Router } from 'express';

export function createAdminRoutes({ adminController, authGuard }) {
  const router = Router();

  router.get('/dashboard/summary', authGuard, adminController.getDashboardSummary);

  return router;
}
