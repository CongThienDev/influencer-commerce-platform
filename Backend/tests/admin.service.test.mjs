import test from 'node:test';
import assert from 'node:assert/strict';
import { AdminService } from '../src/app/services/admin.service.js';

const adminUser = { id: 'admin-id', role: 'admin' };

test('returns dashboard summary in expected shape', async () => {
  const service = new AdminService();
  const summary = await service.getDashboardSummary(adminUser);

  assert.equal(typeof summary.total_revenue, 'number');
  assert.equal(typeof summary.total_orders, 'number');
  assert.equal(typeof summary.total_commission, 'number');
  assert.ok(Array.isArray(summary.top_influencers));
});

test('creates influencer and coupon with valid payloads', async () => {
  const service = new AdminService();

  const influencer = await service.createInfluencer(adminUser, {
    name: 'Test Creator',
    email: 'test.creator@example.com',
    handle: 'testcreator',
    status: 'active',
  });

  assert.equal(influencer.name, 'Test Creator');
  assert.equal(influencer.status, 'active');
  assert.ok(influencer.id);

  const coupon = await service.createCoupon(adminUser, {
    code: 'TEST20',
    influencer_id: influencer.id,
    discount_type: 'percent',
    discount_value: 20,
    usage_limit: 100,
    status: 'active',
  });

  assert.equal(coupon.code, 'TEST20');
  assert.equal(coupon.influencer_id, influencer.id);
  assert.equal(coupon.discount_type, 'percent');
});

test('marks a pending commission as paid', async () => {
  const service = new AdminService();
  const commissions = await service.listCommissions(adminUser, {
    status: 'pending',
    page: 1,
    limit: 10
  });

  assert.ok(commissions.data.length > 0, 'expected at least one pending commission in seed data');

  const pending = commissions.data[0];
  const updated = await service.markCommissionPaid(adminUser, pending.id, {
    note: 'test payout'
  });

  assert.equal(updated.id, pending.id);
  assert.equal(updated.status, 'paid');
  assert.ok(updated.paid_at);
});
