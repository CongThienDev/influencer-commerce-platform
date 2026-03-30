import { Router } from 'express';

export function createHealthRoutes({ healthController }) {
  const router = Router();

  router.get('/', healthController.check);

  return router;
}
