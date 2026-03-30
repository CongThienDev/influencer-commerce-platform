# Target Architecture (Service Repo + External Checkout FE)

## 1) Monorepo structure đề xuất

```text
influencer-platform-system/
  Frontend/              # React + Vite + Ant Design
  Backend/               # Express API + layer architecture
  Deploy/                # Docker Compose, Kubernetes, CI/CD
  docs/                  # product + architecture docs
  .github/workflows/     # CI/CD workflows
```

## 2) Frontend architecture (trong repo này)

- React + Vite
- Ant Design component system
- React Router:
  - Admin routes: `/admin/*`
- State/data:
  - TanStack Query cho server state
- UI principle:
  - table-centric
  - 2-click max cho thao tác thường dùng

## 3) External checkout integration

- Checkout/public FE nằm ở repo khác, gọi API của repo này
- Integration mode:
  - validate coupon trước checkout confirm
  - tạo order với coupon_code để attribution
  - nhận final_total từ backend làm source of truth
- Repo này cần cung cấp API stable + versioning nhẹ (`/v1/...`)

## 4) Backend architecture

- Node.js + Express
- Layer architecture:
  - `api/`
  - `controllers/`
  - `services/`
  - `models/`
  - `schemas/`
  - `core/`
- PostgreSQL
- ORM: Prisma (khuyến nghị nếu mở rộng sang dữ liệu thật)
- API pattern:
  - REST JSON
  - Validation ở input boundary
  - Service layer tách business logic

## 5) Domain model (MVP)

- Influencer
- Coupon
- Order
- Commission

Quan hệ:

- `influencer 1 - n coupon`
- `influencer 1 - n order` (thông qua coupon attribution)
- `order 1 - 0..1 commission`

## 6) Dữ liệu và tính toán quan trọng

- Coupon code unique + normalize uppercase trước khi xử lý
- `discount_type`:
  - `percent`
  - `fixed`
- Formula:
  - percent: `discount = cart_total * value / 100`
  - fixed: `discount = value`
  - clamp: `discount <= cart_total`
- Commission:
  - `commission_amount = final_amount * commission_rate`

## 7) Security baseline

- Admin endpoints bắt buộc auth + role check
- Input validation tất cả API
- Audit fields:
  - `created_at`, `updated_at`, `created_by` (nếu có)
- CSV export chống CSV injection

## 8) Observability baseline

- Structured logs (json)
- Correlation/request id
- Error tracking (Sentry hoặc tương đương)
- Metrics cơ bản:
  - coupon validation success/fail
  - order attribution rate
  - commission creation failures
