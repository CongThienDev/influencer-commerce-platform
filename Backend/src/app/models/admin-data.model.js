import { createAppError } from '../core/errors.js';

function deepClone(value) {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value));
}

function createUuidFromCounter(counter) {
  const suffix = String(counter).padStart(12, '0');
  return `00000000-0000-4000-8000-${suffix}`;
}

function nowIso() {
  return new Date().toISOString();
}

function normalizeText(value) {
  return String(value ?? '').trim();
}

function normalizeLowerText(value) {
  return normalizeText(value).toLowerCase();
}

function normalizeUpperText(value) {
  return normalizeText(value).toUpperCase();
}

function toMoney(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.round(numericValue);
}

function toPositiveInteger(value, fallback = 0) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return fallback;
  }

  return Math.max(0, Math.trunc(numericValue));
}

function parseDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function paginate(items, page, limit) {
  const currentPage = Math.max(1, page);
  const currentLimit = Math.max(1, limit);
  const total = items.length;
  const start = (currentPage - 1) * currentLimit;
  const end = start + currentLimit;

  return {
    data: items.slice(start, end).map((item) => deepClone(item)),
    meta: {
      page: currentPage,
      limit: currentLimit,
      total
    }
  };
}

function containsText(haystack, needle) {
  if (!needle) {
    return true;
  }

  return normalizeLowerText(haystack).includes(needle);
}

function roundMoney(value) {
  return Math.round(Number(value) || 0);
}

export class AdminDataModel {
  constructor(seed = {}) {
    this.state = {
      influencers: seed.influencers || [
        {
          id: createUuidFromCounter(1),
          name: 'Anna Lee',
          email: 'anna@example.com',
          handle: 'anna',
          status: 'active',
          created_at: '2026-03-01T09:00:00.000Z',
          updated_at: '2026-03-01T09:00:00.000Z'
        },
        {
          id: createUuidFromCounter(2),
          name: 'Bao Nguyen',
          email: 'bao@example.com',
          handle: 'bao',
          status: 'active',
          created_at: '2026-03-02T09:00:00.000Z',
          updated_at: '2026-03-02T09:00:00.000Z'
        },
        {
          id: createUuidFromCounter(3),
          name: 'Chi Tran',
          email: 'chi@example.com',
          handle: 'chi',
          status: 'inactive',
          created_at: '2026-03-03T09:00:00.000Z',
          updated_at: '2026-03-03T09:00:00.000Z'
        }
      ],
      coupons: seed.coupons || [
        {
          id: createUuidFromCounter(101),
          code: 'ANNA10',
          influencer_id: createUuidFromCounter(1),
          discount_type: 'percent',
          discount_value: 10,
          usage_limit: 120,
          used_count: 28,
          valid_from: '2026-01-01T00:00:00.000Z',
          valid_to: '2026-12-31T23:59:59.000Z',
          slug: 'anna',
          status: 'active',
          created_at: '2026-03-01T09:30:00.000Z',
          updated_at: '2026-03-10T10:00:00.000Z'
        },
        {
          id: createUuidFromCounter(102),
          code: 'ANNA50K',
          influencer_id: createUuidFromCounter(1),
          discount_type: 'fixed',
          discount_value: 50000,
          usage_limit: 50,
          used_count: 12,
          valid_from: '2026-02-01T00:00:00.000Z',
          valid_to: '2026-12-31T23:59:59.000Z',
          slug: 'anna-50k',
          status: 'active',
          created_at: '2026-03-01T10:00:00.000Z',
          updated_at: '2026-03-08T08:00:00.000Z'
        },
        {
          id: createUuidFromCounter(103),
          code: 'BAO15',
          influencer_id: createUuidFromCounter(2),
          discount_type: 'percent',
          discount_value: 15,
          usage_limit: 80,
          used_count: 16,
          valid_from: '2026-02-15T00:00:00.000Z',
          valid_to: '2026-11-30T23:59:59.000Z',
          slug: 'bao',
          status: 'active',
          created_at: '2026-03-02T10:00:00.000Z',
          updated_at: '2026-03-09T11:00:00.000Z'
        },
        {
          id: createUuidFromCounter(104),
          code: 'BAO30K',
          influencer_id: createUuidFromCounter(2),
          discount_type: 'fixed',
          discount_value: 30000,
          usage_limit: 30,
          used_count: 5,
          valid_from: '2026-02-20T00:00:00.000Z',
          valid_to: '2026-10-31T23:59:59.000Z',
          slug: 'special-bao',
          status: 'inactive',
          created_at: '2026-03-02T10:30:00.000Z',
          updated_at: '2026-03-12T08:00:00.000Z'
        },
        {
          id: createUuidFromCounter(105),
          code: 'CHI20',
          influencer_id: createUuidFromCounter(3),
          discount_type: 'percent',
          discount_value: 20,
          usage_limit: 25,
          used_count: 4,
          valid_from: '2026-03-01T00:00:00.000Z',
          valid_to: '2026-09-30T23:59:59.000Z',
          slug: 'chi',
          status: 'inactive',
          created_at: '2026-03-03T10:00:00.000Z',
          updated_at: '2026-03-11T11:00:00.000Z'
        }
      ],
      orders: seed.orders || [
        {
          id: createUuidFromCounter(201),
          total_amount: 500000,
          discount_amount: 50000,
          final_amount: 450000,
          coupon_code: 'ANNA10',
          influencer_id: createUuidFromCounter(1),
          created_at: '2026-03-20T09:15:00.000Z'
        },
        {
          id: createUuidFromCounter(202),
          total_amount: 250000,
          discount_amount: 50000,
          final_amount: 200000,
          coupon_code: 'ANNA50K',
          influencer_id: createUuidFromCounter(1),
          created_at: '2026-03-21T10:20:00.000Z'
        },
        {
          id: createUuidFromCounter(203),
          total_amount: 800000,
          discount_amount: 120000,
          final_amount: 680000,
          coupon_code: 'BAO15',
          influencer_id: createUuidFromCounter(2),
          created_at: '2026-03-22T14:00:00.000Z'
        },
        {
          id: createUuidFromCounter(204),
          total_amount: 150000,
          discount_amount: 30000,
          final_amount: 120000,
          coupon_code: 'BAO15',
          influencer_id: createUuidFromCounter(2),
          created_at: '2026-03-23T08:45:00.000Z'
        },
        {
          id: createUuidFromCounter(205),
          total_amount: 900000,
          discount_amount: 30000,
          final_amount: 870000,
          coupon_code: 'BAO30K',
          influencer_id: createUuidFromCounter(2),
          created_at: '2026-03-24T12:30:00.000Z'
        },
        {
          id: createUuidFromCounter(206),
          total_amount: 120000,
          discount_amount: 0,
          final_amount: 120000,
          coupon_code: null,
          influencer_id: null,
          created_at: '2026-03-25T16:00:00.000Z'
        }
      ],
      commissions: seed.commissions || [
        {
          id: createUuidFromCounter(301),
          order_id: createUuidFromCounter(201),
          influencer_id: createUuidFromCounter(1),
          commission_rate: 0.1,
          commission_amount: 45000,
          status: 'pending',
          paid_at: null,
          note: null,
          created_at: '2026-03-20T09:20:00.000Z',
          updated_at: '2026-03-20T09:20:00.000Z'
        },
        {
          id: createUuidFromCounter(302),
          order_id: createUuidFromCounter(202),
          influencer_id: createUuidFromCounter(1),
          commission_rate: 0.1,
          commission_amount: 20000,
          status: 'paid',
          paid_at: '2026-03-28T15:00:00.000Z',
          note: 'March payout batch',
          created_at: '2026-03-21T10:25:00.000Z',
          updated_at: '2026-03-28T15:00:00.000Z'
        },
        {
          id: createUuidFromCounter(303),
          order_id: createUuidFromCounter(203),
          influencer_id: createUuidFromCounter(2),
          commission_rate: 0.1,
          commission_amount: 68000,
          status: 'pending',
          paid_at: null,
          note: null,
          created_at: '2026-03-22T14:05:00.000Z',
          updated_at: '2026-03-22T14:05:00.000Z'
        },
        {
          id: createUuidFromCounter(304),
          order_id: createUuidFromCounter(204),
          influencer_id: createUuidFromCounter(2),
          commission_rate: 0.1,
          commission_amount: 12000,
          status: 'pending',
          paid_at: null,
          note: null,
          created_at: '2026-03-23T08:50:00.000Z',
          updated_at: '2026-03-23T08:50:00.000Z'
        },
        {
          id: createUuidFromCounter(305),
          order_id: createUuidFromCounter(205),
          influencer_id: createUuidFromCounter(2),
          commission_rate: 0.1,
          commission_amount: 87000,
          status: 'pending',
          paid_at: null,
          note: null,
          created_at: '2026-03-24T12:35:00.000Z',
          updated_at: '2026-03-24T12:35:00.000Z'
        }
      ]
    };

    this.sequences = {
      influencer: 3,
      coupon: 105,
      order: 206,
      commission: 305
    };
  }

  getDashboardSummary() {
    const orders = this.state.orders;
    const commissions = this.state.commissions;

    const influencerStats = new Map();

    for (const influencer of this.state.influencers) {
      influencerStats.set(influencer.id, {
        influencer_id: influencer.id,
        name: influencer.name,
        orders: 0,
        revenue: 0,
        commission: 0
      });
    }

    for (const order of orders) {
      if (!order.influencer_id || !influencerStats.has(order.influencer_id)) {
        continue;
      }

      const entry = influencerStats.get(order.influencer_id);
      entry.orders += 1;
      entry.revenue += toMoney(order.final_amount);
    }

    for (const commission of commissions) {
      if (!commission.influencer_id || !influencerStats.has(commission.influencer_id)) {
        continue;
      }

      const entry = influencerStats.get(commission.influencer_id);
      entry.commission += toMoney(commission.commission_amount);
    }

    const topInfluencers = [...influencerStats.values()]
      .filter((entry) => entry.orders > 0 || entry.revenue > 0 || entry.commission > 0)
      .sort((a, b) => {
        if (b.revenue !== a.revenue) {
          return b.revenue - a.revenue;
        }

        return b.orders - a.orders;
      })
      .slice(0, 5);

    return {
      total_revenue: orders.reduce((sum, order) => sum + toMoney(order.final_amount), 0),
      total_orders: orders.length,
      total_commission: commissions.reduce(
        (sum, commission) => sum + toMoney(commission.commission_amount),
        0
      ),
      top_influencers: topInfluencers
    };
  }

  listInfluencers(filters = {}) {
    const normalizedSearch = normalizeLowerText(filters.search);
    const normalizedStatus = normalizeLowerText(filters.status);

    const records = this.state.influencers
      .filter((influencer) => {
        if (normalizedStatus && influencer.status !== normalizedStatus) {
          return false;
        }

        if (!normalizedSearch) {
          return true;
        }

        return (
          containsText(influencer.name, normalizedSearch) ||
          containsText(influencer.email, normalizedSearch) ||
          containsText(influencer.handle, normalizedSearch) ||
          containsText(influencer.id, normalizedSearch)
        );
      })
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .map((influencer) => this.buildInfluencerDto(influencer));

    return paginate(records, filters.page, filters.limit);
  }

  createInfluencer(payload) {
    const email = normalizeLowerText(payload.email);
    const name = normalizeText(payload.name);
    const handle = payload.handle === null ? null : normalizeText(payload.handle);

    this.assertUniqueInfluencer({ email, handle });

    const record = {
      id: createUuidFromCounter(++this.sequences.influencer),
      name,
      email,
      handle: handle || null,
      status: payload.status || 'active',
      created_at: nowIso(),
      updated_at: nowIso()
    };

    this.state.influencers.unshift(record);
    return this.buildInfluencerDto(record);
  }

  updateInfluencer(id, payload) {
    const record = this.findInfluencerOrThrow(id);
    const nextEmail = payload.email !== undefined ? normalizeLowerText(payload.email) : record.email;
    const nextHandle =
      payload.handle === undefined ? record.handle : payload.handle === null ? null : normalizeText(payload.handle);

    this.assertUniqueInfluencer({
      email: nextEmail,
      handle: nextHandle,
      ignoreId: record.id
    });

    if (payload.name !== undefined) {
      record.name = normalizeText(payload.name);
    }

    if (payload.email !== undefined) {
      record.email = nextEmail;
    }

    if (payload.handle !== undefined) {
      record.handle = nextHandle || null;
    }

    if (payload.status !== undefined) {
      record.status = payload.status;
    }

    record.updated_at = nowIso();
    return this.buildInfluencerDto(record);
  }

  listCoupons(filters = {}) {
    const normalizedSearch = normalizeLowerText(filters.search);
    const normalizedStatus = normalizeLowerText(filters.status);

    const records = this.state.coupons
      .filter((coupon) => {
        if (normalizedStatus && coupon.status !== normalizedStatus) {
          return false;
        }

        const influencer = this.findInfluencerById(coupon.influencer_id);

        if (!normalizedSearch) {
          return true;
        }

        return (
          containsText(coupon.code, normalizedSearch) ||
          containsText(coupon.slug, normalizedSearch) ||
          containsText(coupon.id, normalizedSearch) ||
          containsText(influencer?.name, normalizedSearch) ||
          containsText(influencer?.email, normalizedSearch)
        );
      })
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .map((coupon) => this.buildCouponDto(coupon));

    return paginate(records, filters.page, filters.limit);
  }

  createCoupon(payload) {
    const influencer = this.findInfluencerOrThrow(payload.influencer_id);
    const code = normalizeUpperText(payload.code);
    const slug = payload.slug === undefined || payload.slug === null ? null : normalizeLowerText(payload.slug);

    this.assertUniqueCoupon({
      code,
      slug
    });

    if (payload.valid_from && payload.valid_to && payload.valid_to < payload.valid_from) {
      throw createAppError(400, 'BAD_REQUEST', 'valid_to must be after valid_from');
    }

    const record = {
      id: createUuidFromCounter(++this.sequences.coupon),
      code,
      influencer_id: influencer.id,
      discount_type: payload.discount_type,
      discount_value: payload.discount_value,
      usage_limit: payload.usage_limit ?? null,
      used_count: 0,
      valid_from: payload.valid_from ?? null,
      valid_to: payload.valid_to ?? null,
      slug,
      status: payload.status || 'active',
      created_at: nowIso(),
      updated_at: nowIso()
    };

    this.state.coupons.unshift(record);
    return this.buildCouponDto(record);
  }

  updateCoupon(id, payload) {
    const record = this.findCouponOrThrow(id);
    const nextInfluencer = payload.influencer_id
      ? this.findInfluencerOrThrow(payload.influencer_id)
      : null;

    const nextValidFrom =
      payload.valid_from !== undefined ? payload.valid_from : record.valid_from;
    const nextValidTo =
      payload.valid_to !== undefined ? payload.valid_to : record.valid_to;
    const nextSlug =
      payload.slug === undefined ? record.slug : payload.slug === null ? null : normalizeLowerText(payload.slug);

    this.assertUniqueCoupon({
      code: record.code,
      slug: nextSlug,
      ignoreId: record.id
    });

    if (nextValidFrom && nextValidTo && nextValidTo < nextValidFrom) {
      throw createAppError(400, 'BAD_REQUEST', 'valid_to must be after valid_from');
    }

    if (payload.influencer_id !== undefined) {
      record.influencer_id = nextInfluencer.id;
    }

    if (payload.discount_type !== undefined) {
      record.discount_type = payload.discount_type;
    }

    if (payload.discount_value !== undefined) {
      record.discount_value = payload.discount_value;
    }

    if (payload.usage_limit !== undefined) {
      if (payload.usage_limit !== null && payload.usage_limit < record.used_count) {
        throw createAppError(409, 'CONFLICT', 'usage_limit cannot be lower than used_count');
      }
      record.usage_limit = payload.usage_limit;
    }

    if (payload.valid_from !== undefined) {
      record.valid_from = nextValidFrom;
    }

    if (payload.valid_to !== undefined) {
      record.valid_to = nextValidTo;
    }

    if (payload.slug !== undefined) {
      record.slug = nextSlug;
    }

    if (payload.status !== undefined) {
      record.status = payload.status;
    }

    record.updated_at = nowIso();
    return this.buildCouponDto(record);
  }

  listOrders(filters = {}) {
    const normalizedSearch = normalizeLowerText(filters.search);
    const couponCode = normalizeUpperText(filters.coupon_code);
    const influencerId = normalizeText(filters.influencer_id);
    const from = filters.from ? parseDate(filters.from) : null;
    const to = filters.to ? parseDate(filters.to) : null;

    const records = this.state.orders
      .filter((order) => {
        if (couponCode && order.coupon_code !== couponCode) {
          return false;
        }

        if (influencerId && order.influencer_id !== influencerId) {
          return false;
        }

        if (from) {
          const createdAt = parseDate(order.created_at);
          if (!createdAt || createdAt < from) {
            return false;
          }
        }

        if (to) {
          const createdAt = parseDate(order.created_at);
          if (!createdAt || createdAt > to) {
            return false;
          }
        }

        if (!normalizedSearch) {
          return true;
        }

        const influencer = this.findInfluencerById(order.influencer_id);
        return (
          containsText(order.id, normalizedSearch) ||
          containsText(order.coupon_code, normalizedSearch) ||
          containsText(influencer?.name, normalizedSearch) ||
          containsText(influencer?.email, normalizedSearch) ||
          containsText(influencer?.handle, normalizedSearch)
        );
      })
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .map((order) => this.buildOrderDto(order));

    return paginate(records, filters.page, filters.limit);
  }

  listCommissions(filters = {}) {
    const normalizedSearch = normalizeLowerText(filters.search);
    const normalizedStatus = normalizeLowerText(filters.status);
    const influencerId = normalizeText(filters.influencer_id);

    const records = this.state.commissions
      .filter((commission) => {
        if (normalizedStatus && commission.status !== normalizedStatus) {
          return false;
        }

        if (influencerId && commission.influencer_id !== influencerId) {
          return false;
        }

        if (!normalizedSearch) {
          return true;
        }

        const influencer = this.findInfluencerById(commission.influencer_id);
        return (
          containsText(commission.id, normalizedSearch) ||
          containsText(commission.order_id, normalizedSearch) ||
          containsText(influencer?.name, normalizedSearch) ||
          containsText(influencer?.email, normalizedSearch)
        );
      })
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .map((commission) => this.buildCommissionDto(commission));

    return paginate(records, filters.page, filters.limit);
  }

  markCommissionPaid(id, payload = {}) {
    const record = this.findCommissionOrThrow(id);

    if (record.status === 'paid') {
      throw createAppError(409, 'CONFLICT', 'Commission already paid');
    }

    record.status = 'paid';
    record.paid_at = nowIso();
    record.updated_at = nowIso();
    record.note = payload.note || record.note || null;

    return this.buildCommissionDto(record);
  }

  buildInfluencerDto(influencer) {
    const relatedCoupons = this.state.coupons.filter(
      (coupon) => coupon.influencer_id === influencer.id
    );
    const relatedOrders = this.state.orders.filter(
      (order) => order.influencer_id === influencer.id
    );

    return {
      id: influencer.id,
      name: influencer.name,
      email: influencer.email,
      handle: influencer.handle ?? null,
      status: influencer.status,
      total_codes: relatedCoupons.length,
      total_revenue: relatedOrders.reduce((sum, order) => sum + toMoney(order.final_amount), 0),
      created_at: influencer.created_at,
      updated_at: influencer.updated_at
    };
  }

  buildCouponDto(coupon) {
    const influencer = this.findInfluencerById(coupon.influencer_id);
    const relatedOrders = this.state.orders.filter(
      (order) => normalizeUpperText(order.coupon_code) === normalizeUpperText(coupon.code)
    );
    const revenue = relatedOrders.reduce((sum, order) => sum + toMoney(order.final_amount), 0);

    return {
      id: coupon.id,
      code: coupon.code,
      influencer_id: coupon.influencer_id,
      influencer_name: influencer?.name ?? null,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      usage_limit: coupon.usage_limit ?? null,
      used_count: coupon.used_count,
      valid_from: coupon.valid_from ?? null,
      valid_to: coupon.valid_to ?? null,
      slug: coupon.slug ?? null,
      status: coupon.status,
      revenue,
      total_revenue: revenue,
      created_at: coupon.created_at,
      updated_at: coupon.updated_at
    };
  }

  buildOrderDto(order) {
    const influencer = this.findInfluencerById(order.influencer_id);

    return {
      id: order.id,
      total_amount: order.total_amount,
      discount_amount: order.discount_amount,
      final_amount: order.final_amount,
      coupon_code: order.coupon_code ?? null,
      influencer_id: order.influencer_id ?? null,
      influencer_name: influencer?.name ?? null,
      created_at: order.created_at
    };
  }

  buildCommissionDto(commission) {
    const influencer = this.findInfluencerById(commission.influencer_id);
    const order = this.findOrderById(commission.order_id);

    return {
      id: commission.id,
      order_id: commission.order_id,
      influencer_id: commission.influencer_id,
      influencer_name: influencer?.name ?? null,
      commission_rate: commission.commission_rate,
      commission_amount: commission.commission_amount,
      status: commission.status,
      paid_at: commission.paid_at ?? null,
      revenue: order ? order.final_amount : null,
      order_total: order ? order.total_amount : null,
      note: commission.note ?? null,
      created_at: commission.created_at,
      updated_at: commission.updated_at
    };
  }

  findInfluencerById(id) {
    return this.state.influencers.find((item) => item.id === id) || null;
  }

  findOrderById(id) {
    return this.state.orders.find((item) => item.id === id) || null;
  }

  findCouponById(id) {
    return this.state.coupons.find((item) => item.id === id) || null;
  }

  findCommissionById(id) {
    return this.state.commissions.find((item) => item.id === id) || null;
  }

  findInfluencerOrThrow(id) {
    const record = this.findInfluencerById(id);
    if (!record) {
      throw createAppError(404, 'NOT_FOUND', 'Influencer not found');
    }

    return record;
  }

  findCouponOrThrow(id) {
    const record = this.findCouponById(id);
    if (!record) {
      throw createAppError(404, 'NOT_FOUND', 'Coupon not found');
    }

    return record;
  }

  findCommissionOrThrow(id) {
    const record = this.findCommissionById(id);
    if (!record) {
      throw createAppError(404, 'NOT_FOUND', 'Commission not found');
    }

    return record;
  }

  assertUniqueInfluencer({ email, handle, ignoreId } = {}) {
    const normalizedEmail = normalizeLowerText(email);
    const normalizedHandle = handle === null || handle === undefined ? null : normalizeLowerText(handle);

    const emailCollision = this.state.influencers.find(
      (item) =>
        normalizeLowerText(item.email) === normalizedEmail &&
        item.id !== ignoreId
    );

    if (emailCollision) {
      throw createAppError(409, 'CONFLICT', 'Influencer email already exists');
    }

    if (normalizedHandle) {
      const handleCollision = this.state.influencers.find(
        (item) =>
          normalizeLowerText(item.handle) === normalizedHandle &&
          item.id !== ignoreId
      );

      if (handleCollision) {
        throw createAppError(409, 'CONFLICT', 'Influencer handle already exists');
      }
    }
  }

  assertUniqueCoupon({ code, slug, ignoreId } = {}) {
    const normalizedCode = normalizeUpperText(code);
    const normalizedSlug = slug === null || slug === undefined ? null : normalizeLowerText(slug);

    const codeCollision = this.state.coupons.find(
      (item) => normalizeUpperText(item.code) === normalizedCode && item.id !== ignoreId
    );

    if (codeCollision) {
      throw createAppError(409, 'CONFLICT', 'Coupon code already exists');
    }

    if (normalizedSlug) {
      const slugCollision = this.state.coupons.find(
        (item) => normalizeLowerText(item.slug) === normalizedSlug && item.id !== ignoreId
      );

      if (slugCollision) {
        throw createAppError(409, 'CONFLICT', 'Coupon slug already exists');
      }
    }
  }
}
