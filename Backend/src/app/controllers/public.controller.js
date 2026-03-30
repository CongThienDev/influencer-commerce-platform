import { sendError } from '../core/response.js';

export class PublicController {
  constructor({ publicService }) {
    this.publicService = publicService;
  }

  respondJson = async (req, res, methodName, statusCode = 200, ...args) => {
    try {
      const handler = this.publicService?.[methodName];
      if (typeof handler !== 'function') {
        throw new Error(`PublicService.${methodName} is not implemented`);
      }

      const payload = await handler.call(this.publicService, ...args);
      return res.status(statusCode).json(payload);
    } catch (error) {
      return sendError(res, error);
    }
  };

  validateCoupon = (req, res) =>
    this.respondJson(req, res, 'validateCoupon', 200, req.body || {});

  createOrder = (req, res) =>
    this.respondJson(
      req,
      res,
      'createOrder',
      200,
      req.body || {},
      req.get('Idempotency-Key')
    );

  resolveCouponSlug = (req, res) =>
    this.respondJson(req, res, 'resolveCouponSlug', 200, req.params.slug);

  getInfluencerStats = (req, res) =>
    this.respondJson(req, res, 'getInfluencerStats', 200, req.params.id);
}
