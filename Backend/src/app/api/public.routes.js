import { Router } from 'express';

export function createPublicRoutes({ publicController }) {
  const router = Router();
  const rateLimit = publicController?.publicRateLimiter || ((_req, _res, next) => next());

  router.post('/coupon/validate', rateLimit, publicController.validateCoupon);
  router.post('/order/create', rateLimit, publicController.createOrder);
  router.get('/coupon/slug/:slug', rateLimit, publicController.resolveCouponSlug);
  router.get('/influencer/:id/stats', publicController.getInfluencerStats);

  return router;
}
