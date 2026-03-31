# Current Progress & Gap Audit

Updated: 2026-03-31

## 1) Overall Progress Snapshot

- Estimated completion vs Phase 1 MVP requirement: **~70%**
- Strongest areas: **Phase 3 (Admin Dashboard)** and **Phase 1+2 API surface**
- Biggest production blocker: **still in-memory data model, no PostgreSQL persistence yet**

## 2) Phase-by-Phase Status

### Phase 0: Repo Bootstrap & Baseline
Status: **Mostly done (~80%)**

Done:
- Monorepo structure exists: `Frontend/`, `Backend/`, `Deploy/`
- FE/BE run locally
- Docker files available
- `.env.example` exists
- CI workflow runs lint/test/build gates for FE + BE

Remaining gap:
- PostgreSQL service/migration pipeline not yet wired as default runtime

### Phase 1: Core Coupon Engine
Status: **Mostly done (~80%)**

Done:
- Public endpoints implemented under `/v1`:
  - `POST /coupon/validate`
  - `POST /order/create`
  - `GET /influencer/:id/stats`
  - `GET /coupon/slug/:slug`
- Coupon validation engine implemented:
  - case-insensitive coupon code
  - active/valid_from/valid_to/usage_limit checks
  - standardized reason mapping (`INVALID`, `INACTIVE`, `EXPIRED`, `LIMIT_REACHED`)
- Discount calculation implemented:
  - percent/fixed + clamp + non-negative final total
- Order attribution + coupon usage update implemented
- Auto commission creation on order creation flow implemented (simulated payment success path)
- Unit/integration-style service tests exist and pass for public flow

Remaining gap:
- Runtime data still in-memory (not durable)
- Need DB transaction guarantees for production race conditions at scale

### Phase 2: External Checkout Integration & Attribution Contract
Status: **Mostly done (~75%)**

Done:
- Contract docs exist:
  - `docs/openapi/coupon.yaml`
  - `docs/07-external-frontend-integration-contract.md`
- Contract endpoints implemented in backend
- Slug resolve endpoint implemented
- Idempotency support implemented for `POST /order/create` via `Idempotency-Key`

Remaining gap:
- Need contract tests directly against OpenAPI examples/cases
- Need to validate payload compatibility with external checkout repo in staging integration pass

### Phase 3: Admin Dashboard MVP
Status: **Mostly done (~90%)**

Done:
- Admin navigation and pages implemented:
  - Dashboard / Influencers / Coupons / Orders / Commissions
- Required actions implemented:
  - Create/Edit/Deactivate influencer
  - Create/Edit/Disable coupon
  - Mark commission as paid
  - Export commissions CSV
- Admin APIs wired with auth guard

Remaining gap:
- Data source is still in-memory, so admin data is not persistent across restarts

### Phase 4: Hardening & Production
Status: **Early (~25%)**

Done:
- Basic deployment manifests and runbook docs exist
- Basic CI deploy gate placeholder exists

Missing / gap:
- PostgreSQL-first runtime and migration/seed process
- Public API rate limiting
- Structured operational logs for coupon/order/commission critical flows
- Monitoring/alerting/backup execution readiness

### Phase 5: Influencer User Dashboard (Deferred)
Status: **Not started (by design)**

## 3) Priority Tasks You Still Need To Do

### P0 - Production blocker (do now)

- [x] Replace in-memory model with PostgreSQL-backed data layer (runtime supports PostgreSQL via `DATABASE_URL`)
- [x] Add migration files for influencer/coupon/order/commission schema
- [x] Add seed data for local/demo
- [x] Ensure unique constraints:
  - `coupon.code`
  - `coupon.slug`
  - `commission.order_id`

### P1 - Hardening after persistence

- [x] Add public API rate limiting (focus on coupon endpoints)
- [x] Add structured logs for:
  - coupon validate attempt/success/fail
  - order attribution
  - commission creation result
- [ ] Add contract tests mapped to `docs/openapi/coupon.yaml`

### P2 - Production operations

- [ ] Staging/prod DB migration rollout process
- [ ] Monitoring/alerting and backup/restore drills

## 4) Practical Next Execution Plan

1. Complete PostgreSQL integration (schema + migrations + seed + runtime wiring).
2. Keep existing API/FE contracts unchanged while switching storage backend.
3. Add hardening baseline (rate limit + structured logs) immediately after DB cutover.
4. Run regression tests for admin + public APIs.

## 5) Definition of "MVP Done" (Current Repo)

MVP is complete only when all items below are true:

- [x] Coupon validation API works per contract shape
- [x] Order creation API returns backend-calculated `discount_amount` and `final_total`
- [x] Influencer attribution is stored on order when coupon valid
- [x] Commission record is auto-created from successful order flow
- [x] Slug resolve API works for influencer links
- [x] Admin and public flows can run on persistent PostgreSQL data
- [x] Hardening baseline (rate limit + operational logs) is enabled
