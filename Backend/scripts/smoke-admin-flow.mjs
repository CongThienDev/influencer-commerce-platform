import { createApp } from '../src/app/main.js';
import { env } from '../src/app/core/env.js';

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function parseCookieJar(setCookieHeaders) {
  const jar = new Map();

  for (const raw of setCookieHeaders) {
    const [pair] = String(raw).split(';');
    const index = pair.indexOf('=');
    if (index > 0) {
      const name = pair.slice(0, index).trim();
      const value = pair.slice(index + 1).trim();
      jar.set(name, value);
    }
  }

  return jar;
}

function cookieHeaderFromJar(jar) {
  return [...jar.entries()].map(([name, value]) => `${name}=${value}`).join('; ');
}

async function readJson(response) {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { raw: text };
  }
}

async function runSmoke() {
  const app = createApp();
  const server = await new Promise((resolve) => {
    const instance = app.listen(0, '127.0.0.1', () => resolve(instance));
  });

  try {
    const address = server.address();
    assert(address && typeof address.port === 'number', 'Unable to start local smoke server');
    const base = `http://127.0.0.1:${address.port}/v1`;

    const loginRes = await fetch(`${base}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: env.ADMIN_EMAIL,
        password: env.ADMIN_PASSWORD,
      }),
    });

    const loginPayload = await readJson(loginRes);
    assert(loginRes.ok, `Login failed (${loginRes.status}): ${loginPayload?.message || 'unknown error'}`);

    const setCookieHeaders = typeof loginRes.headers.getSetCookie === 'function'
      ? loginRes.headers.getSetCookie()
      : [loginRes.headers.get('set-cookie')].filter(Boolean);

    const cookieJar = parseCookieJar(setCookieHeaders);
    const cookieHeader = cookieHeaderFromJar(cookieJar);
    const csrfToken = cookieJar.get('csrf_token') || '';

    assert(cookieJar.get('access_token'), 'Missing access_token cookie after login');
    assert(cookieJar.get('refresh_token'), 'Missing refresh_token cookie after login');
    assert(csrfToken, 'Missing csrf_token cookie after login');

    const influencersListRes = await fetch(`${base}/admin/influencers?page=1&limit=5`, {
      headers: { Cookie: cookieHeader },
    });
    const influencersList = await readJson(influencersListRes);
    assert(influencersListRes.ok, `List influencers failed (${influencersListRes.status})`);
    assert(Array.isArray(influencersList.data), 'Influencers list shape is invalid');

    const unique = Date.now();

    const createInfluencerRes = await fetch(`${base}/admin/influencers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookieHeader,
        'X-CSRF-Token': csrfToken,
      },
      body: JSON.stringify({
        name: `Smoke User ${unique}`,
        email: `smoke.user.${unique}@example.com`,
        handle: `smoke-${unique}`,
        status: 'active',
      }),
    });
    const createdInfluencer = await readJson(createInfluencerRes);
    assert(createInfluencerRes.status === 201, `Create influencer failed (${createInfluencerRes.status})`);
    assert(createdInfluencer?.id, 'Created influencer has no id');

    const createCouponRes = await fetch(`${base}/admin/coupons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookieHeader,
        'X-CSRF-Token': csrfToken,
      },
      body: JSON.stringify({
        code: `SMOKE${String(unique).slice(-6)}`,
        influencer_id: createdInfluencer.id,
        discount_type: 'percent',
        discount_value: 10,
        usage_limit: 100,
        status: 'active',
      }),
    });
    const createdCoupon = await readJson(createCouponRes);
    assert(createCouponRes.status === 201, `Create coupon failed (${createCouponRes.status})`);
    assert(createdCoupon?.id, 'Created coupon has no id');

    const commissionsRes = await fetch(`${base}/admin/commissions?page=1&limit=20&status=pending`, {
      headers: { Cookie: cookieHeader },
    });
    const commissions = await readJson(commissionsRes);
    assert(commissionsRes.ok, `List commissions failed (${commissionsRes.status})`);

    const firstPending = Array.isArray(commissions.data)
      ? commissions.data.find((item) => item.status === 'pending')
      : null;
    assert(firstPending?.id, 'No pending commission available for mark-paid smoke step');

    const markPaidRes = await fetch(`${base}/admin/commissions/${firstPending.id}/pay`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookieHeader,
        'X-CSRF-Token': csrfToken,
      },
      body: JSON.stringify({ note: 'Smoke test mark paid' }),
    });
    const markedCommission = await readJson(markPaidRes);
    assert(markPaidRes.ok, `Mark paid failed (${markPaidRes.status})`);
    assert(markedCommission?.status === 'paid', 'Commission was not marked as paid');

    const exportRes = await fetch(`${base}/admin/commissions/export.csv?status=paid`, {
      headers: { Cookie: cookieHeader },
    });
    const csvText = await exportRes.text();
    assert(exportRes.ok, `Export CSV failed (${exportRes.status})`);
    assert(csvText.startsWith('id,order_id,influencer_id'), 'CSV header is invalid');

    console.log('Smoke admin flow passed.');
    console.log(`Created influencer: ${createdInfluencer.id}`);
    console.log(`Created coupon: ${createdCoupon.id}`);
    console.log(`Marked paid commission: ${markedCommission.id}`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

runSmoke().catch((error) => {
  console.error(`Smoke admin flow failed: ${error.message}`);
  process.exit(1);
});
