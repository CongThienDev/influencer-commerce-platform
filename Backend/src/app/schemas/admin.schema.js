import { createAppError } from '../core/errors.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_STATUS = new Set(['active', 'inactive']);
const ALLOWED_COUPON_TYPES = new Set(['percent', 'fixed']);

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

function optionalString(value) {
  const text = normalizeText(value);
  return text || undefined;
}

function optionalNullableString(value) {
  if (value === null) {
    return null;
  }

  const text = normalizeText(value);
  return text || null;
}

function parseEmail(value) {
  const email = requireNonEmptyString(value, 'email').toLowerCase();
  if (!EMAIL_PATTERN.test(email)) {
    throw createAppError(400, 'BAD_REQUEST', 'email is invalid');
  }

  return email;
}

function parseStatus(value, defaultValue, fieldName = 'status') {
  if (value === undefined) {
    return defaultValue;
  }

  const status = optionalString(value)?.toLowerCase();
  if (!status) {
    throw createAppError(400, 'BAD_REQUEST', `${fieldName} is required`);
  }

  if (!ALLOWED_STATUS.has(status)) {
    throw createAppError(400, 'BAD_REQUEST', `${fieldName} must be active or inactive`);
  }

  return status;
}

function parseCouponType(value, fieldName = 'discount_type') {
  const discountType = requireNonEmptyString(value, fieldName).toLowerCase();
  if (!ALLOWED_COUPON_TYPES.has(discountType)) {
    throw createAppError(400, 'BAD_REQUEST', `${fieldName} must be percent or fixed`);
  }

  return discountType;
}

function parseNumber(value, fieldName, { min = Number.NEGATIVE_INFINITY } = {}) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    throw createAppError(400, 'BAD_REQUEST', `${fieldName} must be a number`);
  }

  if (numericValue < min) {
    throw createAppError(400, 'BAD_REQUEST', `${fieldName} must be greater than or equal to ${min}`);
  }

  return numericValue;
}

function parsePositiveInteger(value, fieldName, { allowNull = false } = {}) {
  if (value === null) {
    if (allowNull) {
      return null;
    }

    throw createAppError(400, 'BAD_REQUEST', `${fieldName} is required`);
  }

  if (value === undefined || value === '') {
    return undefined;
  }

  const numericValue = Number(value);
  if (!Number.isInteger(numericValue) || numericValue <= 0) {
    throw createAppError(400, 'BAD_REQUEST', `${fieldName} must be a positive integer`);
  }

  return numericValue;
}

function parseDate(value, fieldName) {
  if (value === null) {
    return null;
  }

  if (value === undefined || value === '') {
    return undefined;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw createAppError(400, 'BAD_REQUEST', `${fieldName} must be a valid date`);
  }

  return date.toISOString();
}

function validateCouponDateRange(validFrom, validTo) {
  if (validFrom && validTo && validTo < validFrom) {
    throw createAppError(400, 'BAD_REQUEST', 'valid_to must be after valid_from');
  }
}

export function assertAdminUser(user) {
  if (!user || user.role !== 'admin') {
    throw createAppError(403, 'FORBIDDEN', 'Admin role required');
  }

  return user;
}

export function validateInfluencerCreatePayload(payload) {
  requirePlainObject(payload, 'Influencer');

  return {
    name: requireNonEmptyString(payload.name, 'name'),
    email: parseEmail(payload.email),
    handle: optionalNullableString(payload.handle),
    status: parseStatus(payload.status, 'active')
  };
}

export function validateInfluencerUpdatePayload(payload) {
  requirePlainObject(payload, 'Influencer');

  const next = {};

  if (payload.name !== undefined) {
    next.name = requireNonEmptyString(payload.name, 'name');
  }

  if (payload.email !== undefined) {
    next.email = parseEmail(payload.email);
  }

  if (payload.handle !== undefined) {
    next.handle = optionalNullableString(payload.handle);
  }

  if (payload.status !== undefined) {
    next.status = parseStatus(payload.status, undefined);
  }

  if (!Object.keys(next).length) {
    throw createAppError(400, 'BAD_REQUEST', 'At least one field is required');
  }

  return next;
}

export function validateCouponCreatePayload(payload) {
  requirePlainObject(payload, 'Coupon');

  const validFrom = parseDate(payload.valid_from, 'valid_from');
  const validTo = parseDate(payload.valid_to, 'valid_to');
  validateCouponDateRange(validFrom, validTo);

  return {
    code: requireNonEmptyString(payload.code, 'code').toUpperCase(),
    influencer_id: requireNonEmptyString(payload.influencer_id, 'influencer_id'),
    discount_type: parseCouponType(payload.discount_type),
    discount_value: parseNumber(payload.discount_value, 'discount_value', { min: 0 }),
    usage_limit: parsePositiveInteger(payload.usage_limit, 'usage_limit', { allowNull: true }),
    valid_from: validFrom ?? null,
    valid_to: validTo ?? null,
    slug: optionalNullableString(payload.slug)?.toLowerCase() || null,
    status: parseStatus(payload.status, 'active')
  };
}

export function validateCouponUpdatePayload(payload) {
  requirePlainObject(payload, 'Coupon');

  if (payload.code !== undefined) {
    throw createAppError(400, 'BAD_REQUEST', 'code cannot be updated');
  }

  const next = {};

  if (payload.influencer_id !== undefined) {
    next.influencer_id = requireNonEmptyString(payload.influencer_id, 'influencer_id');
  }

  if (payload.discount_type !== undefined) {
    next.discount_type = parseCouponType(payload.discount_type);
  }

  if (payload.discount_value !== undefined) {
    next.discount_value = parseNumber(payload.discount_value, 'discount_value', { min: 0 });
  }

  if (payload.usage_limit !== undefined) {
    next.usage_limit = parsePositiveInteger(payload.usage_limit, 'usage_limit', { allowNull: true });
  }

  if (payload.valid_from !== undefined) {
    next.valid_from = parseDate(payload.valid_from, 'valid_from');
  }

  if (payload.valid_to !== undefined) {
    next.valid_to = parseDate(payload.valid_to, 'valid_to');
  }

  if (payload.slug !== undefined) {
    next.slug = optionalNullableString(payload.slug)?.toLowerCase() || null;
  }

  if (payload.status !== undefined) {
    next.status = parseStatus(payload.status, undefined);
  }

  if (!Object.keys(next).length) {
    throw createAppError(400, 'BAD_REQUEST', 'At least one field is required');
  }

  validateCouponDateRange(next.valid_from, next.valid_to);

  return next;
}

export function validateCommissionPaidPayload(payload) {
  requirePlainObject(payload, 'Commission');

  if (payload.note === undefined || payload.note === null) {
    return { note: null };
  }

  const note = normalizeText(payload.note);
  return { note: note || null };
}
