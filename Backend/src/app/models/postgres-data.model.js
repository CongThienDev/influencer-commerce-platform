import { randomUUID } from 'node:crypto';
import { createAppError } from '../core/errors.js';

function toMoney(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.round(numericValue);
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

function mapCouponRow(row) {
  if (!row) {
    return null;
  }

  return {
    ...row,
    discount_value: Number(row.discount_value),
    usage_limit: row.usage_limit === null ? null : Number(row.usage_limit),
    used_count: Number(row.used_count)
  };
}

function mapOrderRow(row) {
  if (!row) {
    return null;
  }

  return {
    ...row,
    total_amount: Number(row.total_amount),
    discount_amount: Number(row.discount_amount),
    final_amount: Number(row.final_amount)
  };
}

function mapCommissionRow(row) {
  if (!row) {
    return null;
  }

  return {
    ...row,
    commission_rate: Number(row.commission_rate),
    commission_amount: Number(row.commission_amount)
  };
}

export class PostgresDataModel {
  constructor({ pool }) {
    this.pool = pool;
  }

  async getDashboardSummary() {
    const totals = await this.pool.query(`
      SELECT
        COALESCE(SUM(final_amount), 0)::bigint AS total_revenue,
        COUNT(*)::bigint AS total_orders
      FROM orders
    `);

    const commissionTotals = await this.pool.query(`
      SELECT COALESCE(SUM(commission_amount), 0)::bigint AS total_commission
      FROM commissions
    `);

    const top = await this.pool.query(`
      SELECT
        i.id AS influencer_id,
        i.name,
        COALESCE(o.orders, 0)::bigint AS orders,
        COALESCE(o.revenue, 0)::bigint AS revenue,
        COALESCE(c.commission, 0)::bigint AS commission
      FROM influencers i
      LEFT JOIN (
        SELECT influencer_id, COUNT(*) AS orders, SUM(final_amount)::bigint AS revenue
        FROM orders
        GROUP BY influencer_id
      ) o ON o.influencer_id = i.id
      LEFT JOIN (
        SELECT influencer_id, SUM(commission_amount)::bigint AS commission
        FROM commissions
        GROUP BY influencer_id
      ) c ON c.influencer_id = i.id
      WHERE COALESCE(o.orders, 0) > 0 OR COALESCE(o.revenue, 0) > 0 OR COALESCE(c.commission, 0) > 0
      ORDER BY revenue DESC, orders DESC
      LIMIT 5
    `);

    return {
      total_revenue: Number(totals.rows[0]?.total_revenue || 0),
      total_orders: Number(totals.rows[0]?.total_orders || 0),
      total_commission: Number(commissionTotals.rows[0]?.total_commission || 0),
      top_influencers: top.rows.map((row) => ({
        influencer_id: row.influencer_id,
        name: row.name,
        orders: Number(row.orders),
        revenue: Number(row.revenue),
        commission: Number(row.commission)
      }))
    };
  }

  async listInfluencers(filters = {}) {
    const conditions = [];
    const params = [];

    if (filters.status) {
      params.push(normalizeLowerText(filters.status));
      conditions.push(`i.status = $${params.length}`);
    }

    if (filters.search) {
      params.push(`%${normalizeLowerText(filters.search)}%`);
      const idx = params.length;
      conditions.push(
        `(LOWER(i.name) LIKE $${idx} OR LOWER(i.email) LIKE $${idx} OR LOWER(COALESCE(i.handle, '')) LIKE $${idx} OR CAST(i.id AS TEXT) LIKE $${idx})`
      );
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const page = Math.max(1, Number(filters.page || 1));
    const limit = Math.max(1, Number(filters.limit || 10));
    const offset = (page - 1) * limit;

    const countResult = await this.pool.query(
      `SELECT COUNT(*)::bigint AS total FROM influencers i ${where}`,
      params
    );

    params.push(limit, offset);

    const result = await this.pool.query(
      `
      SELECT
        i.id,
        i.name,
        i.email,
        i.handle,
        i.status,
        i.created_at,
        i.updated_at,
        COALESCE(cp.total_codes, 0)::bigint AS total_codes,
        COALESCE(o.total_revenue, 0)::bigint AS total_revenue
      FROM influencers i
      LEFT JOIN (
        SELECT influencer_id, COUNT(*) AS total_codes
        FROM coupons
        GROUP BY influencer_id
      ) cp ON cp.influencer_id = i.id
      LEFT JOIN (
        SELECT influencer_id, SUM(final_amount)::bigint AS total_revenue
        FROM orders
        GROUP BY influencer_id
      ) o ON o.influencer_id = i.id
      ${where}
      ORDER BY i.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
      `,
      params
    );

    return {
      data: result.rows.map((row) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        handle: row.handle,
        status: row.status,
        total_codes: Number(row.total_codes),
        total_revenue: Number(row.total_revenue),
        created_at: row.created_at,
        updated_at: row.updated_at
      })),
      meta: {
        page,
        limit,
        total: Number(countResult.rows[0]?.total || 0)
      }
    };
  }

  async createInfluencer(payload) {
    const values = [
      randomUUID(),
      normalizeText(payload.name),
      normalizeLowerText(payload.email),
      payload.handle === null ? null : normalizeText(payload.handle) || null,
      payload.status || 'active'
    ];

    try {
      await this.pool.query(
        `INSERT INTO influencers (id, name, email, handle, status) VALUES ($1, $2, $3, $4, $5)`,
        values
      );
    } catch (error) {
      this.handleConstraintError(error);
    }

    return this.getInfluencerById(values[0]);
  }

  async updateInfluencer(id, payload) {
    const existing = await this.getInfluencerRow(id);
    if (!existing) {
      throw createAppError(404, 'NOT_FOUND', 'Influencer not found');
    }

    const next = {
      name: payload.name !== undefined ? normalizeText(payload.name) : existing.name,
      email:
        payload.email !== undefined ? normalizeLowerText(payload.email) : existing.email,
      handle:
        payload.handle !== undefined
          ? payload.handle === null
            ? null
            : normalizeText(payload.handle) || null
          : existing.handle,
      status: payload.status !== undefined ? payload.status : existing.status
    };

    try {
      await this.pool.query(
        `
        UPDATE influencers
        SET name = $2, email = $3, handle = $4, status = $5, updated_at = NOW()
        WHERE id = $1
        `,
        [id, next.name, next.email, next.handle, next.status]
      );
    } catch (error) {
      this.handleConstraintError(error);
    }

    return this.getInfluencerById(id);
  }

  async listCoupons(filters = {}) {
    const conditions = [];
    const params = [];

    if (filters.status) {
      params.push(normalizeLowerText(filters.status));
      conditions.push(`c.status = $${params.length}`);
    }

    if (filters.search) {
      params.push(`%${normalizeLowerText(filters.search)}%`);
      const idx = params.length;
      conditions.push(
        `(LOWER(c.code) LIKE $${idx} OR LOWER(COALESCE(c.slug, '')) LIKE $${idx} OR CAST(c.id AS TEXT) LIKE $${idx} OR LOWER(COALESCE(i.name, '')) LIKE $${idx} OR LOWER(COALESCE(i.email, '')) LIKE $${idx})`
      );
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const page = Math.max(1, Number(filters.page || 1));
    const limit = Math.max(1, Number(filters.limit || 10));
    const offset = (page - 1) * limit;

    const totalResult = await this.pool.query(
      `SELECT COUNT(*)::bigint AS total FROM coupons c LEFT JOIN influencers i ON i.id = c.influencer_id ${where}`,
      params
    );

    params.push(limit, offset);
    const result = await this.pool.query(
      `
      SELECT
        c.*,
        i.name AS influencer_name,
        COALESCE(SUM(o.final_amount), 0)::bigint AS revenue
      FROM coupons c
      LEFT JOIN influencers i ON i.id = c.influencer_id
      LEFT JOIN orders o ON UPPER(o.coupon_code) = UPPER(c.code)
      ${where}
      GROUP BY c.id, i.name
      ORDER BY c.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
      `,
      params
    );

    return {
      data: result.rows.map((row) => ({
        id: row.id,
        code: row.code,
        influencer_id: row.influencer_id,
        influencer_name: row.influencer_name,
        discount_type: row.discount_type,
        discount_value: Number(row.discount_value),
        usage_limit: row.usage_limit === null ? null : Number(row.usage_limit),
        used_count: Number(row.used_count),
        valid_from: row.valid_from,
        valid_to: row.valid_to,
        slug: row.slug,
        status: row.status,
        revenue: Number(row.revenue),
        total_revenue: Number(row.revenue),
        created_at: row.created_at,
        updated_at: row.updated_at
      })),
      meta: {
        page,
        limit,
        total: Number(totalResult.rows[0]?.total || 0)
      }
    };
  }

  async createCoupon(payload) {
    const influencer = await this.getInfluencerRow(payload.influencer_id);
    if (!influencer) {
      throw createAppError(404, 'NOT_FOUND', 'Influencer not found');
    }

    if (payload.valid_from && payload.valid_to && payload.valid_to < payload.valid_from) {
      throw createAppError(400, 'BAD_REQUEST', 'valid_to must be after valid_from');
    }

    const values = [
      randomUUID(),
      normalizeUpperText(payload.code),
      influencer.id,
      payload.discount_type,
      toMoney(payload.discount_value),
      payload.usage_limit ?? null,
      payload.valid_from ?? null,
      payload.valid_to ?? null,
      payload.slug === undefined || payload.slug === null ? null : normalizeLowerText(payload.slug),
      payload.status || 'active'
    ];

    try {
      await this.pool.query(
        `
        INSERT INTO coupons
          (id, code, influencer_id, discount_type, discount_value, usage_limit, valid_from, valid_to, slug, status)
        VALUES
          ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `,
        values
      );
    } catch (error) {
      this.handleConstraintError(error);
    }

    return this.getCouponById(values[0]);
  }

  async updateCoupon(id, payload) {
    const existing = await this.getCouponRow(id);
    if (!existing) {
      throw createAppError(404, 'NOT_FOUND', 'Coupon not found');
    }

    const nextInfluencerId = payload.influencer_id ?? existing.influencer_id;
    const influencer = await this.getInfluencerRow(nextInfluencerId);
    if (!influencer) {
      throw createAppError(404, 'NOT_FOUND', 'Influencer not found');
    }

    const next = {
      influencer_id: influencer.id,
      discount_type: payload.discount_type ?? existing.discount_type,
      discount_value:
        payload.discount_value !== undefined
          ? toMoney(payload.discount_value)
          : Number(existing.discount_value),
      usage_limit:
        payload.usage_limit !== undefined
          ? payload.usage_limit
          : existing.usage_limit === null
            ? null
            : Number(existing.usage_limit),
      valid_from: payload.valid_from !== undefined ? payload.valid_from : existing.valid_from,
      valid_to: payload.valid_to !== undefined ? payload.valid_to : existing.valid_to,
      slug:
        payload.slug !== undefined
          ? payload.slug === null
            ? null
            : normalizeLowerText(payload.slug)
          : existing.slug,
      status: payload.status ?? existing.status
    };

    if (next.valid_from && next.valid_to && next.valid_to < next.valid_from) {
      throw createAppError(400, 'BAD_REQUEST', 'valid_to must be after valid_from');
    }

    if (next.usage_limit !== null && next.usage_limit < Number(existing.used_count)) {
      throw createAppError(409, 'CONFLICT', 'usage_limit cannot be lower than used_count');
    }

    try {
      await this.pool.query(
        `
        UPDATE coupons
        SET influencer_id = $2,
            discount_type = $3,
            discount_value = $4,
            usage_limit = $5,
            valid_from = $6,
            valid_to = $7,
            slug = $8,
            status = $9,
            updated_at = NOW()
        WHERE id = $1
        `,
        [
          id,
          next.influencer_id,
          next.discount_type,
          next.discount_value,
          next.usage_limit,
          next.valid_from,
          next.valid_to,
          next.slug,
          next.status
        ]
      );
    } catch (error) {
      this.handleConstraintError(error);
    }

    return this.getCouponById(id);
  }

  async listOrders(filters = {}) {
    const conditions = [];
    const params = [];

    if (filters.coupon_code) {
      params.push(normalizeUpperText(filters.coupon_code));
      conditions.push(`UPPER(COALESCE(o.coupon_code, '')) = $${params.length}`);
    }

    if (filters.influencer_id) {
      params.push(filters.influencer_id);
      conditions.push(`o.influencer_id = $${params.length}`);
    }

    if (filters.from) {
      params.push(filters.from);
      conditions.push(`o.created_at >= $${params.length}`);
    }

    if (filters.to) {
      params.push(filters.to);
      conditions.push(`o.created_at <= $${params.length}`);
    }

    if (filters.search) {
      params.push(`%${normalizeLowerText(filters.search)}%`);
      const idx = params.length;
      conditions.push(
        `(CAST(o.id AS TEXT) LIKE $${idx} OR LOWER(COALESCE(o.coupon_code, '')) LIKE $${idx} OR LOWER(COALESCE(i.name, '')) LIKE $${idx} OR LOWER(COALESCE(i.email, '')) LIKE $${idx} OR LOWER(COALESCE(i.handle, '')) LIKE $${idx})`
      );
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const page = Math.max(1, Number(filters.page || 1));
    const limit = Math.max(1, Number(filters.limit || 10));
    const offset = (page - 1) * limit;

    const totalResult = await this.pool.query(
      `SELECT COUNT(*)::bigint AS total FROM orders o LEFT JOIN influencers i ON i.id = o.influencer_id ${where}`,
      params
    );

    params.push(limit, offset);

    const result = await this.pool.query(
      `
      SELECT o.*, i.name AS influencer_name
      FROM orders o
      LEFT JOIN influencers i ON i.id = o.influencer_id
      ${where}
      ORDER BY o.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
      `,
      params
    );

    return {
      data: result.rows.map((row) => ({
        ...mapOrderRow(row),
        influencer_name: row.influencer_name
      })),
      meta: {
        page,
        limit,
        total: Number(totalResult.rows[0]?.total || 0)
      }
    };
  }

  async listCommissions(filters = {}) {
    const conditions = [];
    const params = [];

    if (filters.status) {
      params.push(normalizeLowerText(filters.status));
      conditions.push(`c.status = $${params.length}`);
    }

    if (filters.influencer_id) {
      params.push(filters.influencer_id);
      conditions.push(`c.influencer_id = $${params.length}`);
    }

    if (filters.search) {
      params.push(`%${normalizeLowerText(filters.search)}%`);
      const idx = params.length;
      conditions.push(
        `(CAST(c.id AS TEXT) LIKE $${idx} OR CAST(c.order_id AS TEXT) LIKE $${idx} OR LOWER(COALESCE(i.name, '')) LIKE $${idx} OR LOWER(COALESCE(i.email, '')) LIKE $${idx})`
      );
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const page = Math.max(1, Number(filters.page || 1));
    const limit = Math.max(1, Number(filters.limit || 10));
    const offset = (page - 1) * limit;

    const totalResult = await this.pool.query(
      `SELECT COUNT(*)::bigint AS total FROM commissions c LEFT JOIN influencers i ON i.id = c.influencer_id ${where}`,
      params
    );

    params.push(limit, offset);
    const result = await this.pool.query(
      `
      SELECT
        c.*,
        i.name AS influencer_name,
        o.final_amount AS revenue,
        o.total_amount AS order_total
      FROM commissions c
      LEFT JOIN influencers i ON i.id = c.influencer_id
      LEFT JOIN orders o ON o.id = c.order_id
      ${where}
      ORDER BY c.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
      `,
      params
    );

    return {
      data: result.rows.map((row) => ({
        ...mapCommissionRow(row),
        influencer_name: row.influencer_name,
        revenue: row.revenue === null ? null : Number(row.revenue),
        order_total: row.order_total === null ? null : Number(row.order_total)
      })),
      meta: {
        page,
        limit,
        total: Number(totalResult.rows[0]?.total || 0)
      }
    };
  }

  async markCommissionPaid(id, payload = {}) {
    const current = await this.getCommissionRow(id);
    if (!current) {
      throw createAppError(404, 'NOT_FOUND', 'Commission not found');
    }

    if (current.status === 'paid') {
      throw createAppError(409, 'CONFLICT', 'Commission already paid');
    }

    await this.pool.query(
      `
      UPDATE commissions
      SET status = 'paid', paid_at = NOW(), note = $2, updated_at = NOW()
      WHERE id = $1
      `,
      [id, payload.note || current.note || null]
    );

    return this.getCommissionById(id);
  }

  async findCouponByCode(code) {
    const result = await this.pool.query(
      `SELECT * FROM coupons WHERE UPPER(code) = UPPER($1) LIMIT 1`,
      [normalizeUpperText(code)]
    );
    return mapCouponRow(result.rows[0] || null);
  }

  async findCouponBySlug(slug) {
    const result = await this.pool.query(
      `SELECT * FROM coupons WHERE LOWER(slug) = LOWER($1) LIMIT 1`,
      [normalizeLowerText(slug)]
    );
    return mapCouponRow(result.rows[0] || null);
  }

  async getInfluencerStats(id) {
    const influencer = await this.getInfluencerRow(id);
    if (!influencer) {
      throw createAppError(404, 'NOT_FOUND', 'Influencer not found');
    }

    const orders = await this.pool.query(
      `SELECT COUNT(*)::bigint AS total_orders, COALESCE(SUM(final_amount), 0)::bigint AS total_revenue
       FROM orders WHERE influencer_id = $1`,
      [id]
    );
    const commissions = await this.pool.query(
      `SELECT COALESCE(SUM(commission_amount), 0)::bigint AS total_commission
       FROM commissions WHERE influencer_id = $1`,
      [id]
    );

    return {
      total_orders: Number(orders.rows[0]?.total_orders || 0),
      total_revenue: Number(orders.rows[0]?.total_revenue || 0),
      total_commission: Number(commissions.rows[0]?.total_commission || 0)
    };
  }

  async createPublicOrder({
    total_amount,
    discount_amount,
    final_amount,
    coupon = null,
    commission_rate = 0.1
  } = {}) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      let couponRecord = null;
      if (coupon) {
        const couponResult = await client.query(
          `SELECT * FROM coupons WHERE id = $1 FOR UPDATE`,
          [coupon.id]
        );
        couponRecord = mapCouponRow(couponResult.rows[0] || null);

        if (!couponRecord) {
          throw createAppError(404, 'NOT_FOUND', 'Coupon not found');
        }

        if (
          couponRecord.usage_limit !== null &&
          couponRecord.used_count >= couponRecord.usage_limit
        ) {
          throw createAppError(409, 'CONFLICT', 'Coupon usage limit reached');
        }

        await client.query(
          `UPDATE coupons SET used_count = used_count + 1, updated_at = NOW() WHERE id = $1`,
          [couponRecord.id]
        );
      }

      const order = mapOrderRow(
        (
          await client.query(
            `
          INSERT INTO orders (id, total_amount, discount_amount, final_amount, coupon_code, influencer_id)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING *
          `,
            [
              randomUUID(),
              toMoney(total_amount),
              toMoney(discount_amount),
              toMoney(final_amount),
              couponRecord ? couponRecord.code : null,
              couponRecord ? couponRecord.influencer_id : null
            ]
          )
        ).rows[0]
      );

      let commission = null;
      if (order.influencer_id) {
        commission = mapCommissionRow(
          (
            await client.query(
              `
              INSERT INTO commissions
                (id, order_id, influencer_id, commission_rate, commission_amount, status, note)
              VALUES
                ($1, $2, $3, $4, $5, 'pending', NULL)
              RETURNING *
              `,
              [
                randomUUID(),
                order.id,
                order.influencer_id,
                commission_rate,
                toMoney(order.final_amount * commission_rate)
              ]
            )
          ).rows[0]
        );
      }

      await client.query('COMMIT');
      return { order, commission };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getInfluencerRow(id) {
    const result = await this.pool.query(`SELECT * FROM influencers WHERE id = $1 LIMIT 1`, [id]);
    return result.rows[0] || null;
  }

  async getCouponRow(id) {
    const result = await this.pool.query(`SELECT * FROM coupons WHERE id = $1 LIMIT 1`, [id]);
    return mapCouponRow(result.rows[0] || null);
  }

  async getCommissionRow(id) {
    const result = await this.pool.query(`SELECT * FROM commissions WHERE id = $1 LIMIT 1`, [id]);
    return mapCommissionRow(result.rows[0] || null);
  }

  async getInfluencerById(id) {
    const result = await this.listInfluencers({ page: 1, limit: 1, search: id });
    return result.data.find((item) => item.id === id) || null;
  }

  async getCouponById(id) {
    const result = await this.pool.query(
      `
      SELECT c.*, i.name AS influencer_name, COALESCE(SUM(o.final_amount), 0)::bigint AS revenue
      FROM coupons c
      LEFT JOIN influencers i ON i.id = c.influencer_id
      LEFT JOIN orders o ON UPPER(o.coupon_code) = UPPER(c.code)
      WHERE c.id = $1
      GROUP BY c.id, i.name
      `,
      [id]
    );
    const row = result.rows[0];
    if (!row) {
      throw createAppError(404, 'NOT_FOUND', 'Coupon not found');
    }
    return {
      id: row.id,
      code: row.code,
      influencer_id: row.influencer_id,
      influencer_name: row.influencer_name,
      discount_type: row.discount_type,
      discount_value: Number(row.discount_value),
      usage_limit: row.usage_limit === null ? null : Number(row.usage_limit),
      used_count: Number(row.used_count),
      valid_from: row.valid_from,
      valid_to: row.valid_to,
      slug: row.slug,
      status: row.status,
      revenue: Number(row.revenue),
      total_revenue: Number(row.revenue),
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }

  async getCommissionById(id) {
    const result = await this.pool.query(
      `
      SELECT
        c.*,
        i.name AS influencer_name,
        o.final_amount AS revenue,
        o.total_amount AS order_total
      FROM commissions c
      LEFT JOIN influencers i ON i.id = c.influencer_id
      LEFT JOIN orders o ON o.id = c.order_id
      WHERE c.id = $1
      LIMIT 1
      `,
      [id]
    );

    const row = result.rows[0];
    if (!row) {
      throw createAppError(404, 'NOT_FOUND', 'Commission not found');
    }

    return {
      ...mapCommissionRow(row),
      influencer_name: row.influencer_name,
      revenue: row.revenue === null ? null : Number(row.revenue),
      order_total: row.order_total === null ? null : Number(row.order_total)
    };
  }

  handleConstraintError(error) {
    if (error?.code !== '23505') {
      throw error;
    }

    const message = String(error.constraint || '');
    if (message.includes('influencers') && message.includes('email')) {
      throw createAppError(409, 'CONFLICT', 'Influencer email already exists');
    }
    if (message.includes('influencers') && message.includes('handle')) {
      throw createAppError(409, 'CONFLICT', 'Influencer handle already exists');
    }
    if (message.includes('coupons') && message.includes('code')) {
      throw createAppError(409, 'CONFLICT', 'Coupon code already exists');
    }
    if (message.includes('coupons') && message.includes('slug')) {
      throw createAppError(409, 'CONFLICT', 'Coupon slug already exists');
    }
    if (message.includes('commissions') && message.includes('order_id')) {
      throw createAppError(409, 'CONFLICT', 'Commission for this order already exists');
    }

    throw createAppError(409, 'CONFLICT', 'Duplicate record');
  }
}
