# Influencer Platform System Docs

## Mục tiêu tài liệu

Bộ tài liệu này chia toàn bộ lộ trình từ `idea -> production` thành các phase rõ ràng để bạn có thể spawn agent triển khai tuần tự, giảm mơ hồ và giảm rework.

Nguyên tắc ưu tiên:

1. Attribution đúng (coupon -> influencer -> order -> commission)
2. Hệ thống ổn định, dễ vận hành
3. Tốc độ ra production

Không ưu tiên giai đoạn đầu:

1. SEO
2. User dashboard nâng cao
3. Analytics phức tạp

## Tech direction (đã chốt)

- Frontend trong repo này: React + Ant Design (Admin Dashboard nội bộ)
- Frontend checkout/public: ở repo khác, gọi API của repo này
- Backend: Node.js + TypeScript + PostgreSQL (khuyến nghị)
- Repo này: service repo cho coupon/attribution + admin FE + BE API

## Cấu trúc tài liệu

1. [00-roadmap-production.md](/Users/lecongthien/Documents/GitHub/influencer-platform-system/docs/00-roadmap-production.md)
2. [01-product-scope-and-priorities.md](/Users/lecongthien/Documents/GitHub/influencer-platform-system/docs/01-product-scope-and-priorities.md)
3. [02-target-architecture.md](/Users/lecongthien/Documents/GitHub/influencer-platform-system/docs/02-target-architecture.md)
4. [03-delivery-phases-overview.md](/Users/lecongthien/Documents/GitHub/influencer-platform-system/docs/03-delivery-phases-overview.md)
5. [phase-0-repo-bootstrap.md](/Users/lecongthien/Documents/GitHub/influencer-platform-system/docs/phases/phase-0-repo-bootstrap.md)
6. [phase-1-core-coupon-engine.md](/Users/lecongthien/Documents/GitHub/influencer-platform-system/docs/phases/phase-1-core-coupon-engine.md)
7. [phase-2-checkout-attribution.md](/Users/lecongthien/Documents/GitHub/influencer-platform-system/docs/phases/phase-2-checkout-attribution.md)
8. [phase-3-admin-dashboard-mvp.md](/Users/lecongthien/Documents/GitHub/influencer-platform-system/docs/phases/phase-3-admin-dashboard-mvp.md)
9. [phase-4-hardening-and-production.md](/Users/lecongthien/Documents/GitHub/influencer-platform-system/docs/phases/phase-4-hardening-and-production.md)
10. [phase-5-user-dashboard-v1-later.md](/Users/lecongthien/Documents/GitHub/influencer-platform-system/docs/phases/phase-5-user-dashboard-v1-later.md)
11. [04-quality-gates-and-test-plan.md](/Users/lecongthien/Documents/GitHub/influencer-platform-system/docs/04-quality-gates-and-test-plan.md)
12. [05-release-and-operations-runbook.md](/Users/lecongthien/Documents/GitHub/influencer-platform-system/docs/05-release-and-operations-runbook.md)
13. [06-agent-task-templates.md](/Users/lecongthien/Documents/GitHub/influencer-platform-system/docs/06-agent-task-templates.md)
14. [07-external-frontend-integration-contract.md](/Users/lecongthien/Documents/GitHub/influencer-platform-system/docs/07-external-frontend-integration-contract.md)
15. [08-auth-api-contract.md](/Users/lecongthien/Documents/GitHub/influencer-platform-system/docs/08-auth-api-contract.md)
16. [openapi/auth.yaml](/Users/lecongthien/Documents/GitHub/influencer-platform-system/docs/openapi/auth.yaml)
17. [openapi/coupon.yaml](/Users/lecongthien/Documents/GitHub/influencer-platform-system/docs/openapi/coupon.yaml)
18. [openapi/admin.yaml](/Users/lecongthien/Documents/GitHub/influencer-platform-system/docs/openapi/admin.yaml)
