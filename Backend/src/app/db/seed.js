const now = '2026-03-30T12:00:00.000Z';

const influencers = [
  {
    id: '00000000-0000-4000-8000-000000000001',
    name: 'Anna Lee',
    email: 'anna@example.com',
    handle: 'anna',
    status: 'active',
    created_at: '2026-03-01T09:00:00.000Z',
    updated_at: '2026-03-01T09:00:00.000Z'
  },
  {
    id: '00000000-0000-4000-8000-000000000002',
    name: 'Bao Nguyen',
    email: 'bao@example.com',
    handle: 'bao',
    status: 'active',
    created_at: '2026-03-02T09:00:00.000Z',
    updated_at: '2026-03-02T09:00:00.000Z'
  },
  {
    id: '00000000-0000-4000-8000-000000000003',
    name: 'Chi Tran',
    email: 'chi@example.com',
    handle: 'chi',
    status: 'inactive',
    created_at: '2026-03-03T09:00:00.000Z',
    updated_at: '2026-03-03T09:00:00.000Z'
  }
];

const coupons = [
  {
    id: '00000000-0000-4000-8000-000000000101',
    code: 'ANNA10',
    influencer_id: '00000000-0000-4000-8000-000000000001',
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
    id: '00000000-0000-4000-8000-000000000102',
    code: 'ANNA50K',
    influencer_id: '00000000-0000-4000-8000-000000000001',
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
    id: '00000000-0000-4000-8000-000000000103',
    code: 'BAO15',
    influencer_id: '00000000-0000-4000-8000-000000000002',
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
    id: '00000000-0000-4000-8000-000000000104',
    code: 'BAO30K',
    influencer_id: '00000000-0000-4000-8000-000000000002',
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
    id: '00000000-0000-4000-8000-000000000105',
    code: 'CHI20',
    influencer_id: '00000000-0000-4000-8000-000000000003',
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
];

const orders = [
  {
    id: '00000000-0000-4000-8000-000000000201',
    total_amount: 500000,
    discount_amount: 50000,
    final_amount: 450000,
    coupon_code: 'ANNA10',
    influencer_id: '00000000-0000-4000-8000-000000000001',
    created_at: '2026-03-20T09:15:00.000Z'
  },
  {
    id: '00000000-0000-4000-8000-000000000202',
    total_amount: 250000,
    discount_amount: 50000,
    final_amount: 200000,
    coupon_code: 'ANNA50K',
    influencer_id: '00000000-0000-4000-8000-000000000001',
    created_at: '2026-03-21T10:20:00.000Z'
  },
  {
    id: '00000000-0000-4000-8000-000000000203',
    total_amount: 800000,
    discount_amount: 120000,
    final_amount: 680000,
    coupon_code: 'BAO15',
    influencer_id: '00000000-0000-4000-8000-000000000002',
    created_at: '2026-03-22T14:00:00.000Z'
  },
  {
    id: '00000000-0000-4000-8000-000000000204',
    total_amount: 150000,
    discount_amount: 30000,
    final_amount: 120000,
    coupon_code: 'BAO15',
    influencer_id: '00000000-0000-4000-8000-000000000002',
    created_at: '2026-03-23T08:45:00.000Z'
  },
  {
    id: '00000000-0000-4000-8000-000000000205',
    total_amount: 900000,
    discount_amount: 30000,
    final_amount: 870000,
    coupon_code: 'BAO30K',
    influencer_id: '00000000-0000-4000-8000-000000000002',
    created_at: '2026-03-24T12:30:00.000Z'
  },
  {
    id: '00000000-0000-4000-8000-000000000206',
    total_amount: 120000,
    discount_amount: 0,
    final_amount: 120000,
    coupon_code: null,
    influencer_id: null,
    created_at: '2026-03-25T16:00:00.000Z'
  }
];

const commissions = [
  {
    id: '00000000-0000-4000-8000-000000000301',
    order_id: '00000000-0000-4000-8000-000000000201',
    influencer_id: '00000000-0000-4000-8000-000000000001',
    commission_rate: 0.1,
    commission_amount: 45000,
    status: 'pending',
    paid_at: null,
    note: null,
    created_at: '2026-03-20T09:20:00.000Z',
    updated_at: '2026-03-20T09:20:00.000Z'
  },
  {
    id: '00000000-0000-4000-8000-000000000302',
    order_id: '00000000-0000-4000-8000-000000000202',
    influencer_id: '00000000-0000-4000-8000-000000000001',
    commission_rate: 0.1,
    commission_amount: 20000,
    status: 'paid',
    paid_at: '2026-03-28T15:00:00.000Z',
    note: 'March payout batch',
    created_at: '2026-03-21T10:25:00.000Z',
    updated_at: '2026-03-28T15:00:00.000Z'
  },
  {
    id: '00000000-0000-4000-8000-000000000303',
    order_id: '00000000-0000-4000-8000-000000000203',
    influencer_id: '00000000-0000-4000-8000-000000000002',
    commission_rate: 0.1,
    commission_amount: 68000,
    status: 'pending',
    paid_at: null,
    note: null,
    created_at: '2026-03-22T14:05:00.000Z',
    updated_at: '2026-03-22T14:05:00.000Z'
  },
  {
    id: '00000000-0000-4000-8000-000000000304',
    order_id: '00000000-0000-4000-8000-000000000204',
    influencer_id: '00000000-0000-4000-8000-000000000002',
    commission_rate: 0.1,
    commission_amount: 12000,
    status: 'pending',
    paid_at: null,
    note: null,
    created_at: '2026-03-23T08:50:00.000Z',
    updated_at: '2026-03-23T08:50:00.000Z'
  },
  {
    id: '00000000-0000-4000-8000-000000000305',
    order_id: '00000000-0000-4000-8000-000000000205',
    influencer_id: '00000000-0000-4000-8000-000000000002',
    commission_rate: 0.1,
    commission_amount: 87000,
    status: 'pending',
    paid_at: null,
    note: null,
    created_at: '2026-03-24T12:35:00.000Z',
    updated_at: '2026-03-24T12:35:00.000Z'
  }
];

export async function seedDatabase(pool) {
  await pool.query('BEGIN');
  try {
    await pool.query('TRUNCATE TABLE commissions, orders, coupons, influencers RESTART IDENTITY CASCADE');

    for (const influencer of influencers) {
      await pool.query(
        `INSERT INTO influencers (id, name, email, handle, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          influencer.id,
          influencer.name,
          influencer.email,
          influencer.handle,
          influencer.status,
          influencer.created_at,
          influencer.updated_at
        ]
      );
    }

    for (const coupon of coupons) {
      await pool.query(
        `INSERT INTO coupons
           (id, code, influencer_id, discount_type, discount_value, usage_limit, used_count, valid_from, valid_to, slug, status, created_at, updated_at)
         VALUES
           ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
          coupon.id,
          coupon.code,
          coupon.influencer_id,
          coupon.discount_type,
          coupon.discount_value,
          coupon.usage_limit,
          coupon.used_count,
          coupon.valid_from,
          coupon.valid_to,
          coupon.slug,
          coupon.status,
          coupon.created_at,
          coupon.updated_at
        ]
      );
    }

    for (const order of orders) {
      await pool.query(
        `INSERT INTO orders
           (id, total_amount, discount_amount, final_amount, coupon_code, influencer_id, created_at)
         VALUES
           ($1, $2, $3, $4, $5, $6, $7)`,
        [
          order.id,
          order.total_amount,
          order.discount_amount,
          order.final_amount,
          order.coupon_code,
          order.influencer_id,
          order.created_at
        ]
      );
    }

    for (const commission of commissions) {
      await pool.query(
        `INSERT INTO commissions
           (id, order_id, influencer_id, commission_rate, commission_amount, status, paid_at, note, created_at, updated_at)
         VALUES
           ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          commission.id,
          commission.order_id,
          commission.influencer_id,
          commission.commission_rate,
          commission.commission_amount,
          commission.status,
          commission.paid_at,
          commission.note,
          commission.created_at,
          commission.updated_at
        ]
      );
    }

    await pool.query('COMMIT');
  } catch (error) {
    await pool.query('ROLLBACK');
    throw error;
  }
}

export const seedMeta = { now };
