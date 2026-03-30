# Current Progress & Gap Audit

Updated: 2026-03-30

## 1) Overall Progress Snapshot

- Estimated completion vs Phase 1 MVP requirement: **~45%**
- Strongest area: **Phase 3 (Admin Dashboard)**
- Biggest gaps: **Phase 1 + Phase 2 public coupon/order attribution flow**

## 2) Phase-by-Phase Status

### Phase 0: Repo Bootstrap & Baseline
Status: **Partial (~65%)**

Done:
- Monorepo structure exists: `Frontend/`, `Backend/`, `Deploy/`
- FE/BE run locally
- Docker files available
- `.env.example` exists
- Basic CI workflow exists (`.github/workflows/ci-cd.yml`)

Missing / gap:
- PostgreSQL service is not wired in current docker-compose
- No DB migration + seed pipeline
- Backend is JS-only (phase doc originally expected TS runtime)
- CI does not run full lint + tests for both apps

### Phase 1: Core Coupon Engine
Status: **Partial (~30%)**

Done:
- Domain data shape for Influencer/Coupon/Order/Commission exists in memory model
- Admin-side CRUD validations exist for influencer/coupon

Missing / gap:
- Public endpoints not implemented in backend routes:
  - `POST /coupon/validate`
  - `POST /order/create`
  - `GET /influencer/:id/stats`
- No payment-success trigger flow for auto commission creation
- No real persistence for coupon usage counting and order attribution
- No core coupon-engine test matrix (expired/inactive/limit/case-insensitive)

### Phase 2: External Checkout Integration & Attribution Contract
Status: **Partial (~25%)**

Done:
- Contract docs exist:
  - `docs/openapi/coupon.yaml`
  - `docs/07-external-frontend-integration-contract.md`

Missing / gap:
- Contract endpoints are not implemented in backend
- Slug resolve endpoint missing:
  - `GET /coupon/slug/:slug`
- No idempotency handling for `POST /order/create`
- No `reason_code` mapping implementation for failed validation
- No contract/integration tests for external checkout flow

### Phase 3: Admin Dashboard MVP
Status: **Mostly done (~90%)**

Done:
- Admin navigation and pages are implemented:
  - Dashboard / Influencers / Coupons / Orders / Commissions
- Required actions implemented:
  - Create/Edit/Deactivate influencer
  - Create/Edit/Disable coupon
  - Mark commission as paid
  - Export commissions CSV
- Admin APIs are implemented and wired with auth guard
- FE + BE lint/tests currently pass locally

Remaining gap:
- Data layer is in-memory; not production-safe persistence

### Phase 4: Hardening & Production
Status: **Early (~20%)**

Done:
- Basic deployment manifests and runbook docs exist
- Basic CI deploy gate placeholder exists

Missing / gap:
- Real staging/prod pipelines
- Monitoring/alerting setup
- Backup/restore execution plan
- Rate limiting for public coupon endpoints
- Performance verification (`/coupon/validate` p95 target)
- Security hardening checklist completion

### Phase 5: Influencer User Dashboard (Deferred)
Status: **Not started (by design)**

Note:
- This phase is out of current Phase 1 MVP scope.

## 3) Tasks You Still Need To Do (Prioritized)

### P0 - Must do to complete Phase 1 MVP core

- [ ] Implement backend public coupon endpoints:
  - `POST /v1/coupon/validate`
  - `POST /v1/order/create`
  - `GET /v1/influencer/:id/stats`
  - `GET /v1/coupon/slug/:slug`
- [ ] Implement coupon validation engine:
  - case-insensitive code
  - active/valid_from/valid_to/usage_limit checks
  - standardized fail reason mapping (`INVALID`, `INACTIVE`, `EXPIRED`, `LIMIT_REACHED`)
- [ ] Implement discount calculation:
  - percent/fixed
  - clamp to avoid negative final total
- [ ] Implement order attribution logic:
  - store `coupon_code`, `influencer_id`, `discount_amount`, `final_amount`
- [ ] Implement auto-commission creation after payment success (or simulated payment confirmation event)
- [ ] Add integration tests covering validate -> create order flow and edge cases

### P1 - Needed to stabilize external checkout integration

- [ ] Add idempotency key support for `POST /order/create`
- [ ] Add contract tests from `docs/openapi/coupon.yaml`
- [ ] Add clear error contract response payload for external FE
- [ ] Add slug resolution tests and response examples

### P1 - Data/persistence hard requirement before production

- [ ] Replace in-memory model with persistent DB (PostgreSQL)
- [ ] Add migration files for influencer/coupon/order/commission schema
- [ ] Add seed data for local/demo environment
- [ ] Ensure unique constraints:
  - `coupon.code`
  - `coupon.slug`
  - (recommended) `commission.order_id` unique

### P2 - CI/ops hardening

- [ ] Update CI to run:
  - Frontend: lint + test + build
  - Backend: lint + test
- [ ] Add basic rate limiting to public coupon APIs
- [ ] Add operational logs for:
  - coupon validate attempt/success/fail
  - order attribution
  - commission creation failure

## 4) Practical Next Execution Plan

1. Build Phase 1+2 backend public APIs first (`coupon/validate`, `order/create`, `coupon/slug`, `influencer stats`).
2. Add test matrix for all coupon edge cases and attribution correctness.
3. Migrate data layer from in-memory to PostgreSQL + migrations.
4. Keep current admin UI mostly unchanged, only switch data source to real backend persistence.
5. Tighten CI gates and add minimum production hardening checklist items.

## 5) Definition of "MVP Done" (Current Repo)

MVP is considered complete only when all items below are true:

- [ ] Coupon validation API works per contract
- [ ] Order creation API returns backend-calculated `discount` and `final_total`
- [ ] Influencer attribution is stored on order when coupon valid
- [ ] Commission record is auto-created from successful payment flow
- [ ] Slug resolve API works for influencer links
- [ ] Admin can operate influencer/coupon/order/commission on persistent data
