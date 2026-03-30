import { Router } from 'express';

export function createAdminRoutes({ adminController, authGuard }) {
  const router = Router();

  router.use(authGuard);

  router.get('/dashboard/summary', adminController.getDashboardSummary);

  router.get('/influencers', adminController.listInfluencers);
  router.post('/influencers', adminController.createInfluencer);
  router.patch('/influencers/:id', adminController.updateInfluencer);

  router.get('/coupons', adminController.listCoupons);
  router.post('/coupons', adminController.createCoupon);
  router.patch('/coupons/:id', adminController.updateCoupon);

  router.get('/orders', adminController.listOrders);

  router.get('/commissions', adminController.listCommissions);
  router.patch('/commissions/:id/pay', adminController.markCommissionPaid);
  router.get('/commissions/export.csv', adminController.exportCommissionsCsv);

  return router;
}
