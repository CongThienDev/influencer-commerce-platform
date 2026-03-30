# Phase 2: External Checkout Integration & Attribution Contract

## Mục tiêu phase

Chuẩn hóa contract để frontend checkout ở repo khác gọi API repo này một cách ổn định, đảm bảo attribution và commission đúng.

## Deliverables

- API contract document + examples cho frontend ngoài
- Endpoint `POST /coupon/validate` ổn định theo contract
- Endpoint `POST /order/create` ổn định theo contract
- Endpoint slug resolve cho influencer link
- Contract tests cho external FE integration
- Error code dictionary thống nhất

## API contract requirements chi tiết

1. Validate flow
   - input: `{ code, cart_total }`
   - output thành công:
     - `valid`
     - `discount`
     - `final_total`
     - `influencer_id`
   - output thất bại:
     - `valid=false`
     - `reason_code` chuẩn hóa (`INVALID`, `EXPIRED`, `INACTIVE`, `LIMIT_REACHED`)
2. Create order flow
   - input: `{ cart_total, coupon_code? }`
   - output:
     - `order_id`
     - `discount`
     - `final_total`
     - `influencer_id?`
3. Slug resolve flow
   - input: `slug`
   - output:
     - `coupon_code`
     - `influencer_id`
     - optional `landing_url`

## Technical tasks (repo này)

1. Contract-first API
   - define DTO request/response
   - publish example JSON
2. Idempotency và consistency
   - create order có idempotency key (nếu checkout ngoài retry)
   - transaction an toàn cho usage_limit
3. Error handling
   - map mọi lỗi business sang reason_code chuẩn
4. Contract tests
   - test theo JSON fixtures để frontend ngoài verify
5. Integration notes
   - viết hướng dẫn cho repo frontend gọi đúng sequence API

## Edge cases checklist

- `anna10` và `ANNA10` cùng kết quả
- Coupon expired giữa validate và create order
- usage_limit vừa đủ nhưng bị dùng hết trước lúc submit
- fixed discount > cart_total
- frontend ngoài gửi cart_total khác lúc tạo order

## Definition of Done

- Frontend ngoài có thể hoàn tất flow validate -> create order bằng API contract
- Attribution có mặt trong order record khi coupon hợp lệ
- Contract tests pass trên CI
- Slug resolve dùng được cho campaign links

## Recommended observability

- Event logs:
  - `coupon_validate_attempt`
  - `coupon_validate_success`
  - `coupon_validate_failed`
  - `order_attributed_to_influencer`
