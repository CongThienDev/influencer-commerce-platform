import { createAppError } from '../core/errors.js';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function normalizeText(value) {
  return String(value ?? '').trim();
}

function requirePlainObject(payload, entityName) {
  if (!isPlainObject(payload)) {
    throw createAppError(400, 'BAD_REQUEST', `${entityName} payload must be an object`);
  }
}

function requireNonEmptyString(value, fieldName) {
  const text = normalizeText(value);
  if (!text) {
    throw createAppError(400, 'BAD_REQUEST', `${fieldName} is required`);
  }

  return text;
}

function parseMoney(value, fieldName) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    throw createAppError(400, 'BAD_REQUEST', `${fieldName} must be a number`);
  }

  if (numericValue < 0) {
    throw createAppError(400, 'BAD_REQUEST', `${fieldName} must be greater than or equal to 0`);
  }

  return numericValue;
}

function parseUuid(value, fieldName) {
  const text = requireNonEmptyString(value, fieldName);
  if (!UUID_PATTERN.test(text)) {
    throw createAppError(400, 'BAD_REQUEST', `${fieldName} must be a valid uuid`);
  }

  return text;
}

export function validateCouponValidatePayload(payload) {
  requirePlainObject(payload, 'Coupon validate');

  return {
    code: requireNonEmptyString(payload.code, 'code'),
    cart_total: parseMoney(payload.cart_total, 'cart_total')
  };
}

export function validateCreateOrderPayload(payload) {
  requirePlainObject(payload, 'Order');

  const next = {
    cart_total: parseMoney(payload.cart_total, 'cart_total')
  };

  if (payload.coupon_code !== undefined) {
    next.coupon_code = requireNonEmptyString(payload.coupon_code, 'coupon_code');
  }

  return next;
}

export function validateSlugParam(slug) {
  return requireNonEmptyString(slug, 'slug');
}

export function validateInfluencerIdParam(id) {
  return parseUuid(id, 'id');
}
