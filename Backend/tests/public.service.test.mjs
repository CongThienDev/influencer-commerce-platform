import test from 'node:test';
import assert from 'node:assert/strict';
import { AdminDataModel } from '../src/app/models/admin-data.model.js';
import { PublicService } from '../src/app/services/public.service.js';
import { PublicController } from '../src/app/controllers/public.controller.js';
import { createPublicRoutes } from '../src/app/api/public.routes.js';

const fixedClock = () => new Date('2026-03-30T12:00:00.000Z');
const env = { FRONTEND_ORIGIN: 'http://localhost:5173' };

function createService(seed = {}) {
  const dataModel = new AdminDataModel(seed);
  return new PublicService({ dataModel, env, clock: fixedClock });
}

test('validates coupons case-insensitively and clamps discount math', async () => {
  const service = createService();

  const success = await service.validateCoupon({
    code: 'anna10',
    cart_total: 100000
  });

  assert.equal(success.valid, true);
  assert.equal(success.discount_amount, 10000);
  assert.equal(success.final_total, 90000);
  assert.equal(success.coupon_code, 'ANNA10');
  assert.equal(success.influencer_id, '00000000-0000-4000-8000-000000000001');

  const clamped = await service.validateCoupon({
    code: 'anna50k',
    cart_total: 1000
  });

  assert.equal(clamped.valid, true);
  assert.equal(clamped.discount_amount, 1000);
  assert.equal(clamped.final_total, 0);
});

test('returns standardized coupon validation failures', async () => {
  const service = createService();
  const now = '2026-03-30T12:00:00.000Z';

  service.dataModel.state.coupons.unshift(
    {
      id: '00000000-0000-4000-8000-000000000900',
      code: 'EXPIRED1',
      influencer_id: '00000000-0000-4000-8000-000000000001',
      discount_type: 'fixed',
      discount_value: 5000,
      usage_limit: null,
      used_count: 0,
      valid_from: '2026-01-01T00:00:00.000Z',
      valid_to: '2026-01-31T23:59:59.000Z',
      slug: 'expired',
      status: 'active',
      created_at: now,
      updated_at: now
    },
    {
      id: '00000000-0000-4000-8000-000000000901',
      code: 'LIMIT1',
      influencer_id: '00000000-0000-4000-8000-000000000001',
      discount_type: 'fixed',
      discount_value: 5000,
      usage_limit: 1,
      used_count: 1,
      valid_from: '2026-01-01T00:00:00.000Z',
      valid_to: '2026-12-31T23:59:59.000Z',
      slug: 'limit',
      status: 'active',
      created_at: now,
      updated_at: now
    }
  );

  assert.deepEqual(
    await service.validateCoupon({ code: 'missing', cart_total: 1000 }),
    {
      valid: false,
      discount_amount: 0,
      final_total: 1000,
      reason_code: 'INVALID',
      message: 'Coupon not found'
    }
  );

  assert.equal((await service.validateCoupon({ code: 'chi20', cart_total: 1000 })).reason_code, 'INACTIVE');
  assert.equal(
    (await service.validateCoupon({ code: 'expired1', cart_total: 1000 })).reason_code,
    'EXPIRED'
  );
  assert.equal(
    (await service.validateCoupon({ code: 'limit1', cart_total: 1000 })).reason_code,
    'LIMIT_REACHED'
  );
});

test('creates attributed orders and replays idempotent requests', async () => {
  const service = createService();
  const beforeOrders = service.dataModel.state.orders.length;
  const beforeCommissions = service.dataModel.state.commissions.length;
  const beforeUsedCount = service.dataModel.findCouponByCode('ANNA10').used_count;

  const first = await service.createOrder(
    {
      cart_total: 100000,
      coupon_code: 'anna10'
    },
    'idem-key-1'
  );

  assert.equal(first.discount_amount, 10000);
  assert.equal(first.final_total, 90000);
  assert.equal(first.coupon_code, 'ANNA10');
  assert.equal(first.influencer_id, '00000000-0000-4000-8000-000000000001');
  assert.equal(service.dataModel.state.orders.length, beforeOrders + 1);
  assert.equal(service.dataModel.state.commissions.length, beforeCommissions + 1);
  assert.equal(service.dataModel.findCouponByCode('ANNA10').used_count, beforeUsedCount + 1);

  const second = await service.createOrder(
    {
      cart_total: 100000,
      coupon_code: 'ANNA10'
    },
    'idem-key-1'
  );

  assert.deepEqual(second, first);
  assert.equal(service.dataModel.state.orders.length, beforeOrders + 1);
  assert.equal(service.dataModel.state.commissions.length, beforeCommissions + 1);

  await assert.rejects(
    () =>
      service.createOrder(
        {
          cart_total: 120000,
          coupon_code: 'ANNA10'
        },
        'idem-key-1'
      ),
    /Duplicate order request/
  );
});

test('resolves slugs and returns influencer stats', async () => {
  const service = createService();

  const slug = await service.resolveCouponSlug('Anna');
  assert.equal(slug.slug, 'anna');
  assert.equal(slug.coupon_code, 'ANNA10');
  assert.equal(slug.influencer_id, '00000000-0000-4000-8000-000000000001');
  assert.equal(slug.landing_url, 'http://localhost:5173/?coupon=ANNA10');

  assert.deepEqual(await service.getInfluencerStats('00000000-0000-4000-8000-000000000001'), {
    total_orders: 2,
    total_revenue: 650000,
    total_commission: 65000
  });
});

test('public routes are registered and controller responses match the contract', async () => {
  const service = createService();
  const controller = new PublicController({ publicService: service });
  const router = createPublicRoutes({ publicController: controller });

  const routeSummary = router.stack
    .filter((layer) => layer.route)
    .map((layer) => ({
      path: layer.route.path,
      methods: Object.keys(layer.route.methods).sort()
    }));

  assert.deepEqual(routeSummary, [
    { path: '/coupon/validate', methods: ['post'] },
    { path: '/order/create', methods: ['post'] },
    { path: '/coupon/slug/:slug', methods: ['get'] },
    { path: '/influencer/:id/stats', methods: ['get'] }
  ]);

  const createMockResponse = () => ({
    statusCode: 200,
    headers: {},
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    set(name, value) {
      if (typeof name === 'string') {
        this.headers[name] = value;
      } else {
        Object.assign(this.headers, name);
      }

      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
    send(payload) {
      this.body = payload;
      return this;
    }
  });

  const validateRes = createMockResponse();
  await controller.validateCoupon(
    {
      body: { code: 'anna10', cart_total: 100000 }
    },
    validateRes
  );

  assert.equal(validateRes.statusCode, 200);
  assert.equal(validateRes.body.valid, true);
  assert.equal(validateRes.body.coupon_code, 'ANNA10');

  const createRes = createMockResponse();
  await controller.createOrder(
    {
      body: { cart_total: 100000, coupon_code: 'anna10' },
      get: (name) => (name === 'Idempotency-Key' ? 'route-idem-1' : undefined)
    },
    createRes
  );

  assert.equal(createRes.statusCode, 200);
  assert.ok(createRes.body.order_id);
  assert.equal(createRes.body.discount_amount, 10000);
  assert.equal(createRes.body.final_total, 90000);
  assert.equal(createRes.body.coupon_code, 'ANNA10');

  const duplicateRes = createMockResponse();
  await controller.createOrder(
    {
      body: { cart_total: 100000, coupon_code: 'anna10' },
      get: (name) => (name === 'Idempotency-Key' ? 'route-idem-1' : undefined)
    },
    duplicateRes
  );

  assert.deepEqual(duplicateRes.body, createRes.body);

  const slugRes = createMockResponse();
  await controller.resolveCouponSlug({ params: { slug: 'anna' } }, slugRes);

  assert.equal(slugRes.statusCode, 200);
  assert.equal(slugRes.body.coupon_code, 'ANNA10');

  const statsRes = createMockResponse();
  await controller.getInfluencerStats(
    { params: { id: '00000000-0000-4000-8000-000000000001' } },
    statsRes
  );

  assert.equal(statsRes.statusCode, 200);
  assert.equal(statsRes.body.total_orders >= 2, true);
});
