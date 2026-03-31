CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS influencers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  handle TEXT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_influencers_email_lower
  ON influencers ((LOWER(email)));

CREATE UNIQUE INDEX IF NOT EXISTS uq_influencers_handle_lower
  ON influencers ((LOWER(handle)))
  WHERE handle IS NOT NULL;

CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,
  influencer_id UUID NOT NULL REFERENCES influencers(id),
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percent', 'fixed')),
  discount_value INTEGER NOT NULL,
  usage_limit INTEGER NULL,
  used_count INTEGER NOT NULL DEFAULT 0,
  valid_from TIMESTAMPTZ NULL,
  valid_to TIMESTAMPTZ NULL,
  slug TEXT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_coupon_usage_limit CHECK (usage_limit IS NULL OR usage_limit >= 0),
  CONSTRAINT chk_coupon_used_count CHECK (used_count >= 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_coupons_code_upper
  ON coupons ((UPPER(code)));

CREATE UNIQUE INDEX IF NOT EXISTS uq_coupons_slug_lower
  ON coupons ((LOWER(slug)))
  WHERE slug IS NOT NULL;

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  total_amount INTEGER NOT NULL,
  discount_amount INTEGER NOT NULL,
  final_amount INTEGER NOT NULL,
  coupon_code TEXT NULL,
  influencer_id UUID NULL REFERENCES influencers(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL UNIQUE REFERENCES orders(id),
  influencer_id UUID NOT NULL REFERENCES influencers(id),
  commission_rate NUMERIC(10, 4) NOT NULL,
  commission_amount INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'paid')),
  paid_at TIMESTAMPTZ NULL,
  note TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS schema_migrations (
  id SERIAL PRIMARY KEY,
  filename TEXT NOT NULL UNIQUE,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
