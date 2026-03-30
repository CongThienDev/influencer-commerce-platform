# Backend Tasks (API + DB + Tests)

Updated: 2026-03-30
Suggested branch: `codex/backend-phase1-phase2-core`

## Goal

Hoàn tất phần backend core cho Phase 1 + Phase 2:
- Coupon validation
- Order attribution
- Commission auto-create
- Slug resolve
- Persistence bằng PostgreSQL

## P0 - API Implementation

- [ ] Add public routes under `/v1`:
  - [ ] `POST /coupon/validate`
  - [ ] `POST /order/create`
  - [ ] `GET /coupon/slug/:slug`
  - [ ] `GET /influencer/:id/stats`
- [ ] Keep existing admin/auth routes working (no regression)
- [ ] Ensure response shape matches `docs/openapi/coupon.yaml`

## P0 - Business Logic

- [ ] Coupon normalization:
  - [ ] Case-insensitive input (`anna10` == `ANNA10`)
  - [ ] Store/process code in uppercase
- [ ] Coupon validation checks:
  - [ ] Exists
  - [ ] Status active
  - [ ] valid_from/valid_to in range
  - [ ] usage_limit not exceeded
- [ ] Discount calculation:
  - [ ] `percent`: `discount = total * value / 100`
  - [ ] `fixed`: `discount = value`
  - [ ] Clamp: `discount <= cart_total`
  - [ ] `final_total = max(cart_total - discount, 0)`
- [ ] Attribution:
  - [ ] If coupon valid, persist `coupon_code` + `influencer_id` on order
- [ ] Commission:
  - [ ] Auto-create commission on payment success (or simulated payment success flow)
  - [ ] `commission_amount = final_amount * commission_rate`
  - [ ] Default status `pending`

## P1 - Consistency and Contract

- [ ] Add `reason_code` for failed coupon validation:
  - [ ] `INVALID`
  - [ ] `INACTIVE`
  - [ ] `EXPIRED`
  - [ ] `LIMIT_REACHED`
- [ ] Add idempotency support for `POST /order/create` (`Idempotency-Key`)
- [ ] Handle race condition near usage_limit safely
- [ ] Add clear error payloads for external checkout consumers

## P1 - Database & Data Layer

- [ ] Introduce PostgreSQL in backend data layer
- [ ] Create migrations for:
  - [ ] `influencers`
  - [ ] `coupons`
  - [ ] `orders`
  - [ ] `commissions`
- [ ] Add seed data for local/demo
- [ ] Enforce constraints:
  - [ ] Unique `coupon.code`
  - [ ] Unique `coupon.slug` (nullable)
  - [ ] Unique `commission.order_id`
- [ ] Replace current in-memory model for runtime data

## P0/P1 - Test Coverage

- [ ] Unit tests:
  - [ ] Coupon validation success (percent/fixed)
  - [ ] Coupon validation failure (invalid/inactive/expired/limit reached)
  - [ ] Discount clamp and non-negative final total
- [ ] Integration tests:
  - [ ] `POST /coupon/validate`
  - [ ] `POST /order/create` without coupon
  - [ ] `POST /order/create` with coupon attribution
  - [ ] `GET /coupon/slug/:slug`
  - [ ] `GET /influencer/:id/stats`
  - [ ] Idempotency retry path
- [ ] Regression tests for existing admin endpoints

## Definition of Done

- [ ] All public endpoints implemented and contract-compliant
- [ ] Orders persist attribution data correctly
- [ ] Commission auto-created correctly from payment success flow
- [ ] PostgreSQL persistence + migrations working end-to-end
- [ ] Test suite covers edge cases and passes in CI
