import { createAppError } from '../core/errors.js';
import { sendError } from '../core/response.js';

export class AdminController {
  constructor({ adminService }) {
    this.adminService = adminService;
  }

  invokeAdminService(methodName, user, ...args) {
    const handler = this.adminService?.[methodName];
    if (typeof handler !== 'function') {
      throw createAppError(
        501,
        'NOT_IMPLEMENTED',
        `AdminService.${methodName} is not implemented`
      );
    }

    return handler.call(this.adminService, user, ...args);
  }

  respondJson = async (req, res, methodName, statusCode = 200, ...args) => {
    try {
      const payload = await this.invokeAdminService(
        methodName,
        req.user,
        ...args
      );
      return res.status(statusCode).json(payload);
    } catch (error) {
      return sendError(res, error);
    }
  };

  getDashboardSummary = (req, res) =>
    this.respondJson(req, res, 'getDashboardSummary');

  listInfluencers = (req, res) =>
    this.respondJson(req, res, 'listInfluencers', 200, req.query || {});

  createInfluencer = (req, res) =>
    this.respondJson(req, res, 'createInfluencer', 201, req.body || {});

  updateInfluencer = (req, res) =>
    this.respondJson(
      req,
      res,
      'updateInfluencer',
      200,
      req.params.id,
      req.body || {}
    );

  listCoupons = (req, res) =>
    this.respondJson(req, res, 'listCoupons', 200, req.query || {});

  createCoupon = (req, res) =>
    this.respondJson(req, res, 'createCoupon', 201, req.body || {});

  updateCoupon = (req, res) =>
    this.respondJson(
      req,
      res,
      'updateCoupon',
      200,
      req.params.id,
      req.body || {}
    );

  listOrders = (req, res) =>
    this.respondJson(req, res, 'listOrders', 200, req.query || {});

  listCommissions = (req, res) =>
    this.respondJson(req, res, 'listCommissions', 200, req.query || {});

  markCommissionPaid = (req, res) =>
    this.respondJson(
      req,
      res,
      'markCommissionPaid',
      200,
      req.params.id,
      req.body || {}
    );

  exportCommissionsCsv = async (req, res) => {
    try {
      const result = await this.invokeAdminService(
        'exportCommissionsCsv',
        req.user,
        req.query || {}
      );
      const csv = typeof result === 'string' ? result : result?.csv || '';

      return res
        .status(200)
        .set('Content-Type', 'text/csv; charset=utf-8')
        .set('Content-Disposition', 'attachment; filename="commissions.csv"')
        .send(csv);
    } catch (error) {
      return sendError(res, error);
    }
  };
}
