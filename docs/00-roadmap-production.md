# Roadmap Production - Influencer Coupon & Commission Service

## 1) Mục tiêu roadmap

Xây hệ thống production-ready cho:

1. Coupon validation cho frontend checkout ở repo ngoài
2. Attribution order -> influencer
3. Commission calculation
4. Admin dashboard vận hành nội bộ
5. Auth bảo mật bằng JWT + cookie

## 2) Trạng thái hiện tại

- Đã có bộ docs phase
- Chưa có roadmap tổng hợp dạng "step-by-step execution"
- Auth mới ở mức yêu cầu chung, chưa chốt flow kỹ thuật chi tiết

## 3) Kiến trúc đích (rõ phạm vi)

- Repo này:
  - `Backend/`: Coupon/Order/Commission/Admin APIs
  - `Frontend/`: Admin dashboard React + Ant Design
  - `Deploy/`: Docker Compose, Kubernetes, CI/CD
- Repo khác:
  - frontend checkout/public gọi API repo này

## 4) Auth roadmap (JWT + HttpOnly Cookie) - bắt buộc

### 4.1 Cơ chế đăng nhập đề xuất

- Login bằng email/password cho admin
- Server cấp:
  - `access_token` (JWT sống ngắn, ví dụ 15 phút)
  - `refresh_token` (JWT sống dài hơn, ví dụ 7-30 ngày)
- Lưu token trong cookie:
  - `HttpOnly`
  - `Secure` (bật ở production HTTPS)
  - `SameSite=Lax` (hoặc `Strict` tùy flow)

### 4.2 Endpoints auth cần có

1. `POST /auth/login`
   - verify credential
   - set access + refresh cookie
2. `POST /auth/refresh`
   - đọc refresh cookie
   - rotate refresh token
   - set lại cookie mới
3. `POST /auth/logout`
   - revoke refresh token (DB/blacklist)
   - clear cookies
4. `GET /auth/me`
   - trả user profile hiện tại từ access token

### 4.3 Middleware/Guard

- `authGuard`:
  - đọc access token từ cookie
  - verify JWT signature + expiry
- `roleGuard`:
  - chặn mọi route `/admin/*` nếu không phải role admin

### 4.4 Bảo mật bổ sung

- CSRF protection cho cookie-based auth:
  - double-submit cookie hoặc CSRF token header
- Brute-force protection:
  - rate limit `POST /auth/login`
- Session control:
  - lưu refresh token hash trong DB
  - revoke theo user/device khi logout

## 5) Phase execution plan

### Phase A - Foundation (1-2 tuần)

Mục tiêu:

- Bootstrap `api` + `admin-web` + Postgres + CI
- Chuẩn hóa DTO/contracts

Output:

- repo chạy local
- migration + seed
- lint/test/build pass

### Phase B - Auth & Access Control (1 tuần)

Mục tiêu:

- Hoàn chỉnh auth JWT + cookie cho admin
- RBAC cho admin endpoints

Output:

- login/refresh/logout/me APIs
- auth middleware + role guard
- tests cho auth success/fail/expired/refresh rotate

### Phase C - Coupon Core Backend (1-2 tuần)

Mục tiêu:

- Implement domain Influencer/Coupon/Order/Commission
- API `POST /coupon/validate`, `POST /order/create`, `GET /influencer/:id/stats`

Output:

- business rules edge cases đầy đủ
- transaction cho usage_limit
- commission auto-create sau payment success

### Phase D - External Checkout Integration (1 tuần)

Mục tiêu:

- Chốt contract cho frontend repo ngoài
- slug resolve + error code chuẩn hóa

Output:

- contract doc + fixtures
- integration tests mô phỏng client checkout ngoài

### Phase E - Admin Dashboard MVP (1-2 tuần)

Mục tiêu:

- Dashboard/Influencers/Coupons/Orders/Commissions pages
- CRUD + mark paid + export CSV

Output:

- Admin vận hành đủ nghiệp vụ không cần dev support

### Phase F - Hardening & Production (1 tuần)

Mục tiêu:

- Deploy staging/prod
- monitoring + alerting + backup
- runbook sự cố

Output:

- production go-live checklist pass

## 6) Milestone checklist

1. M1: local env + CI ready
2. M2: auth JWT-cookie ready
3. M3: coupon/order/commission APIs ready
4. M4: external checkout contract verified
5. M5: admin dashboard ready
6. M6: production launch

## 7) Definition of Done (production)

- Admin login an toàn bằng JWT cookie
- External checkout repo gọi API không lệch contract
- Attribution chính xác cho order dùng coupon
- Commission tạo đúng và có thể mark paid
- Monitoring + backup + rollback plan hoạt động

## 8) Next steps ngay bây giờ

1. Chốt thời lượng token (`access`, `refresh`)
2. Chốt chính sách cookie (`SameSite`, domain, secure)
3. Triển khai Phase B trước để khóa bảo mật sớm
4. Sau đó mới song song Phase C và Phase E
