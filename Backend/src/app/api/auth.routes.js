import { Router } from 'express';

export function createAuthRoutes({ authController, authGuard }) {
  const router = Router();

  router.post('/login', authController.login);
  router.post('/refresh', authController.refresh);
  router.get('/me', authGuard, authController.me);
  router.post('/logout', authGuard, authController.logout);

  return router;
}
