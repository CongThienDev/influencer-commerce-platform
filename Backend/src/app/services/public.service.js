import { createAppError } from '../core/errors.js';
import {
  validateCouponValidatePayload,
  validateCreateOrderPayload,
  validateInfluencerIdParam,
  validateSlugParam
} from '../schemas/public.schema.js';

function normalizeCode(value) {
  return String(value ?? '').trim().toUpperCase();
}

function normalizeIdempotencyKey(value) {
  const text = String(value ?? '').trim();
  return text || undefined;
}

function clone(value) {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value));
}

function nowDate(clock) {
  const value = clock();
  return value instanceof Date ? value : new Date(value);
}

function toIsoOrNow(value) {
  if (!value) {
    return new Date().toISOString();
  }

  return value;
}

export class PublicService {
  constructor({ dataModel, env, clock = () => new Date() } = {}) {
    this.dataModel = dataModel;
    this.env = env;
    this.clock = clock;
    this.idempotencyCache = new Map();
  }

  validateCoupon(payload = {}) {
    const input = validateCouponValidatePayload(payload);
    const coupon = this.dataModel.findCouponByCode(input.code);
    const current = nowDate(this.clock);

    return this.evaluateCoupon(coupon, input.cart_total, current);
  }

  createOrder(payload = {}, idempotencyKey) {
    const input = validateCreateOrderPayload(payload);
    const normalizedIdempotencyKey = normalizeIdempotencyKey(idempotencyKey);
    const fingerprint = JSON.stringify({
      cart_total: input.cart_total,
      coupon_code: input.coupon_code ? normalizeCode(input.coupon_code) : null
    });

    if (normalizedIdempotencyKey) {
      const cached = this.idempotencyCache.get(normalizedIdempotencyKey);
      if (cached) {
        if (cached.fingerprint !== fingerprint) {
          throw createAppError(409, 'CONFLICT', 'Duplicate order request');
        }

        return clone(cached.response);
      }
    }

    const current = nowDate(this.clock);
    const coupon = input.coupon_code
      ? this.dataModel.findCouponByCode(input.coupon_code)
      : null;
    const validation = this.evaluateCoupon(coupon, input.cart_total, current);
    const appliedCoupon = validation.valid ? coupon : null;
    const discount = validation.valid ? validation.discount_amount : 0;
    const finalTotal = validation.valid ? validation.final_total : input.cart_total;

    const { order } = this.dataModel.createPublicOrder({
      total_amount: input.cart_total,
      discount_amount: discount,
      final_amount: finalTotal,
      coupon: appliedCoupon,
      commission_rate: 0.1
    });

    const response = {
      order_id: order.id,
      discount_amount: discount,
      final_total: order.final_amount,
      influencer_id: order.influencer_id ?? null,
      coupon_code: order.coupon_code ?? null
    };

    if (normalizedIdempotencyKey) {
      this.idempotencyCache.set(normalizedIdempotencyKey, {
        fingerprint,
        response: clone(response)
      });
    }

    return response;
  }

  resolveCouponSlug(slug) {
    const normalizedSlug = validateSlugParam(slug).toLowerCase();
    const coupon = this.dataModel.findCouponBySlug(normalizedSlug);

    if (!coupon) {
      throw createAppError(404, 'NOT_FOUND', 'Slug not found');
    }

    return {
      slug: coupon.slug ?? normalizedSlug,
      coupon_code: coupon.code,
      influencer_id: coupon.influencer_id,
      landing_url: this.buildLandingUrl(coupon.code)
    };
  }

  getInfluencerStats(id) {
    const influencerId = validateInfluencerIdParam(id);
    return this.dataModel.getInfluencerStats(influencerId);
  }

  evaluateCoupon(coupon, cartTotal, currentDate) {
    if (!coupon) {
      return this.buildFailure('INVALID', cartTotal, 'Coupon not found');
    }

    if (coupon.status !== 'active') {
      return this.buildFailure('INACTIVE', cartTotal, 'Coupon is inactive');
    }

    const nowTime = currentDate.getTime();
    const validFromTime = coupon.valid_from ? new Date(coupon.valid_from).getTime() : null;
    const validToTime = coupon.valid_to ? new Date(coupon.valid_to).getTime() : null;

    if ((validFromTime !== null && nowTime < validFromTime) || (validToTime !== null && nowTime > validToTime)) {
      return this.buildFailure('EXPIRED', cartTotal, 'Coupon is expired');
    }

    if (
      coupon.usage_limit !== null &&
      coupon.usage_limit !== undefined &&
      coupon.used_count >= coupon.usage_limit
    ) {
      return this.buildFailure('LIMIT_REACHED', cartTotal, 'Coupon usage limit reached');
    }

    const discount = this.calculateDiscount(coupon, cartTotal);
    const finalTotal = Math.max(cartTotal - discount, 0);

    return {
      valid: true,
      discount_amount: discount,
      final_total: finalTotal,
      influencer_id: coupon.influencer_id,
      coupon_code: coupon.code
    };
  }

  calculateDiscount(coupon, cartTotal) {
    const value = Number(coupon.discount_value);
    if (coupon.discount_type === 'percent') {
      return Math.min(cartTotal, Math.max(0, (cartTotal * value) / 100));
    }

    return Math.min(cartTotal, Math.max(0, value));
  }

  buildFailure(reasonCode, cartTotal, message) {
    return {
      valid: false,
      discount_amount: 0,
      final_total: cartTotal,
      reason_code: reasonCode,
      message
    };
  }

  buildLandingUrl(code) {
    const origin = toIsoOrNow(this.env?.FRONTEND_ORIGIN || 'http://localhost:5173');
    return `${origin.replace(/\/$/, '')}/?coupon=${encodeURIComponent(code)}`;
  }
}
