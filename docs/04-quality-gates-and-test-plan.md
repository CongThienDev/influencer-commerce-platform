# Quality Gates & Test Plan

## 1) Quality gate bắt buộc trước merge

- Lint pass (FE + BE)
- Type check pass
- Unit tests pass
- Integration tests pass cho API core
- Không có migration phá vỡ dữ liệu production

## 2) Test layers

1. Unit tests
   - discount calculator
   - coupon validator
   - commission calculator
2. Integration tests
   - `POST /coupon/validate`
   - `POST /order/create`
   - admin CRUD coupon/influencer
3. E2E smoke tests
   - external checkout flow (mock client) validate -> create order
   - slug resolve
   - admin tạo coupon mới và thấy ở list

## 3) Critical test cases

- Coupon case insensitive
- Coupon expired
- Coupon inactive
- usage_limit reached
- final_total không âm
- concurrent order gần chạm usage_limit

## 4) Data integrity checks

- `order.coupon_code` null khi không dùng coupon
- `order.influencer_id` phải có nếu coupon valid
- `commission.order_id` unique (1 order chỉ có 1 commission)

## 5) Performance checks (MVP)

- `/coupon/validate` p95 < 300ms với data volume giả lập
- Admin list endpoints trả về < 1s ở page đầu tiên

## 6) Regression checklist cho release

- Contract response khớp tài liệu integration
- Các bảng admin không lỗi sort/filter/pagination
- Export CSV mở được và dữ liệu đúng cột
