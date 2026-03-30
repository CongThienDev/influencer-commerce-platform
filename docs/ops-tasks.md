# Ops Tasks (CI + Hardening)

Updated: 2026-03-30
Suggested branch: `codex/ops-ci-hardening`

## Goal

Nâng hệ thống từ trạng thái "chạy được" lên mức sẵn sàng production MVP:
- CI quality gates rõ ràng
- Security/hardening tối thiểu
- Release/reliability baseline

## P0 - CI Pipeline

- [ ] Update GitHub Actions to enforce quality gates:
  - [ ] Frontend: `lint` + `test` + `build`
  - [ ] Backend: `lint` + `test`
- [ ] Fail fast on any failing gate
- [ ] Ensure PR checks required before merge to `main`
- [ ] Keep deploy job dependent on quality jobs passing

## P0 - Runtime Baseline

- [ ] Wire PostgreSQL in compose for local integration path
- [ ] Add migration/seed command execution in startup docs/scripts
- [ ] Validate local end-to-end startup for FE + BE + DB

## P1 - Security Hardening

- [ ] Add rate limiting to public endpoints:
  - [ ] `POST /v1/coupon/validate`
  - [ ] `POST /v1/order/create`
  - [ ] `GET /v1/coupon/slug/:slug`
- [ ] Validate CORS policy for environment separation (dev/staging/prod)
- [ ] Review CSRF/auth middleware behavior with external checkout usage
- [ ] Ensure CSV export safety (escaping already present, keep covered by tests)

## P1 - Observability

- [ ] Add structured logs/events:
  - [ ] `coupon_validate_attempt`
  - [ ] `coupon_validate_success`
  - [ ] `coupon_validate_failed`
  - [ ] `order_attributed_to_influencer`
  - [ ] `commission_create_failed`
- [ ] Add basic error monitoring hooks
- [ ] Define alerting thresholds for 5xx spikes

## P1 - Performance and Reliability

- [ ] Add performance checks for:
  - [ ] `/coupon/validate` p95 target (<300ms in test profile)
  - [ ] `/order/create` p95 target (<500ms, excluding payment gateway)
- [ ] Add retry/idempotency verification tests
- [ ] Define rollback procedure for deploy + migrations

## P2 - Environments & Release

- [ ] Formalize env configs: `dev`, `staging`, `prod`
- [ ] Secret management strategy (non-plain-text in repo)
- [ ] Staging sign-off checklist before production deployment
- [ ] Post-deploy verification checklist (30-60 min)

## Definition of Done

- [ ] CI gates enforce lint/test/build before merge
- [ ] Public endpoints are protected by rate limit and observable logs
- [ ] Basic staging/prod release process exists with rollback steps
- [ ] Team can run and verify FE + BE + DB locally and in staging
