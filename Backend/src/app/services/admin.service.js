import { createAppError } from '../core/errors.js';
import { AdminDataModel } from '../models/admin-data.model.js';
import {
  assertAdminUser,
  validateCommissionPaidPayload,
  validateCouponCreatePayload,
  validateCouponUpdatePayload,
  validateInfluencerCreatePayload,
  validateInfluencerUpdatePayload
} from '../schemas/admin.schema.js';

function normalizeSearchTerm(value) {
  const text = String(value ?? '').trim().toLowerCase();
  return text || undefined;
}

function normalizeOptionalString(value) {
  const text = String(value ?? '').trim();
  return text || undefined;
}

function normalizeNullableString(value) {
  const text = String(value ?? '').trim();
  return text || null;
}

function parsePositiveInteger(value, fallback, { min = 1, max = Number.MAX_SAFE_INTEGER } = {}) {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed)) {
    throw createAppError(400, 'BAD_REQUEST', 'Invalid pagination value');
  }

  if (parsed < min || parsed > max) {
    throw createAppError(400, 'BAD_REQUEST', 'Invalid pagination value');
  }

  return parsed;
}

function parseDateOrThrow(value, fieldName) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw createAppError(400, 'BAD_REQUEST', `Invalid ${fieldName}`);
  }

  return date.toISOString();
}

function parseDateRange(query = {}) {
  return {
    from: parseDateOrThrow(query.from, 'from'),
    to: parseDateOrThrow(query.to, 'to')
  };
}

function parseListQuery(query = {}, { defaultLimit = 10 } = {}) {
  return {
    page: parsePositiveInteger(query.page, 1, { min: 1 }),
    limit: parsePositiveInteger(query.limit, defaultLimit, { min: 1, max: 100 }),
    search: normalizeSearchTerm(query.search),
    status: normalizeOptionalString(query.status)?.toLowerCase(),
    coupon_code: normalizeOptionalString(query.coupon_code)?.toUpperCase(),
    influencer_id: normalizeNullableString(query.influencer_id),
    ...parseDateRange(query)
  };
}

export class AdminService {
  constructor({ dataModel } = {}) {
    this.dataModel = dataModel || new AdminDataModel();
  }

  async getDashboardSummary(user) {
    assertAdminUser(user);
    return this.dataModel.getDashboardSummary();
  }

  async listInfluencers(user, query = {}) {
    assertAdminUser(user);
    const filters = parseListQuery(query, { defaultLimit: 10 });
    return this.dataModel.listInfluencers(filters);
  }

  async createInfluencer(user, payload = {}) {
    assertAdminUser(user);
    const input = validateInfluencerCreatePayload(payload);
    return this.dataModel.createInfluencer(input);
  }

  async updateInfluencer(user, id, payload = {}) {
    assertAdminUser(user);
    const input = validateInfluencerUpdatePayload(payload);
    return this.dataModel.updateInfluencer(id, input);
  }

  async listCoupons(user, query = {}) {
    assertAdminUser(user);
    const filters = parseListQuery(query, { defaultLimit: 10 });
    return this.dataModel.listCoupons(filters);
  }

  async createCoupon(user, payload = {}) {
    assertAdminUser(user);
    const input = validateCouponCreatePayload(payload);
    return this.dataModel.createCoupon(input);
  }

  async updateCoupon(user, id, payload = {}) {
    assertAdminUser(user);
    const input = validateCouponUpdatePayload(payload);
    return this.dataModel.updateCoupon(id, input);
  }

  async listOrders(user, query = {}) {
    assertAdminUser(user);
    const filters = parseListQuery(query, { defaultLimit: 10 });
    return this.dataModel.listOrders(filters);
  }

  async listCommissions(user, query = {}) {
    assertAdminUser(user);
    const filters = parseListQuery(query, { defaultLimit: 10 });
    return this.dataModel.listCommissions(filters);
  }

  async markCommissionPaid(user, id, payload = {}) {
    assertAdminUser(user);
    const input = validateCommissionPaidPayload(payload);
    return this.dataModel.markCommissionPaid(id, input);
  }

  async exportCommissionsCsv(user, query = {}) {
    assertAdminUser(user);
    const filters = parseListQuery(query, { defaultLimit: 100 });
    const { data } = await this.dataModel.listCommissions({
      ...filters,
      page: 1,
      limit: Number.MAX_SAFE_INTEGER
    });

    const headers = [
      'id',
      'order_id',
      'influencer_id',
      'influencer_name',
      'commission_rate',
      'commission_amount',
      'status',
      'paid_at',
      'created_at',
      'note'
    ];

    const escapeCsv = (value) => {
      if (value === null || value === undefined || value === '') {
        return '';
      }

      const text = String(value).replace(/"/g, '""');
      return /[",\n\r]/.test(text) ? `"${text}"` : text;
    };

    const rows = data.map((commission) =>
      [
        commission.id,
        commission.order_id,
        commission.influencer_id,
        commission.influencer_name || '',
        commission.commission_rate,
        commission.commission_amount,
        commission.status,
        commission.paid_at || '',
        commission.created_at,
        commission.note || ''
      ]
        .map(escapeCsv)
        .join(',')
    );

    return [headers.join(','), ...rows].join('\n');
  }
}
