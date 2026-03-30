# Phase 4: Hardening, Security, Release to Production

## Mục tiêu phase

Đưa hệ thống từ trạng thái "chạy được" sang "vận hành production an toàn".

## Deliverables

- Staging + Production environments
- CI/CD deploy tự động có gate
- Monitoring + alerting cơ bản
- Backup/restore DB plan
- Security baseline checklist pass
- Runbook sự cố

## Infra & deployment

1. Environment setup
   - `dev`, `staging`, `prod`
   - secret management rõ ràng
2. Database
   - production postgres managed service
   - backup hằng ngày, giữ ít nhất 7-14 ngày
3. Deploy
   - frontend static hosting/CDN
   - backend container deploy
4. Migration safety
   - pre-deploy migration check
   - rollback strategy cho migration breaking

## Security checklist

- Auth token expiry + refresh policy
- RBAC cho admin endpoints
- Rate limit cho public coupon endpoints
- Validation và sanitization input
- CORS chặt chẽ
- CSV export an toàn

## Reliability checklist

- Retry policy cho external services
- Idempotency key cho order/payment callbacks
- Dead-letter hoặc retry queue nếu commission creation fail

## Production quality gates

- Test pass:
  - unit
  - integration
  - smoke e2e
- Performance pass:
  - `/coupon/validate` p95 < 300ms
- Error budget:
  - 5xx rate trong staging < 1%

## Launch plan

1. Staging sign-off
2. Dry run với data giả
3. Production deploy off-peak
4. Post-deploy verification (30-60 phút)
5. Hypercare 48h đầu

## Rollback plan

- FE rollback qua previous artifact
- BE rollback qua previous image tag
- DB rollback theo migration strategy (forward-fix ưu tiên)

