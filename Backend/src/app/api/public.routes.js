import { Router } from 'express';

export function createPublicRoutes({ publicController }) {
  const router = Router();

  router.post('/coupon/validate', publicController.validateCoupon);
  router.post('/order/create', publicController.createOrder);
  router.get('/coupon/slug/:slug', publicController.resolveCouponSlug);
  router.get('/influencer/:id/stats', publicController.getInfluencerStats);

  return router;
}
