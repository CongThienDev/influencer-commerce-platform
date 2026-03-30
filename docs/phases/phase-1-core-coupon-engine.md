# Phase 1: Core Coupon Engine (Backend Domain)

## Mục tiêu phase

Hoàn thiện business core cho coupon attribution và commission ở backend, chưa cần admin UI.

## Deliverables

- DB schema đầy đủ 4 entities
- API:
  - `POST /coupon/validate`
  - `POST /order/create`
  - `GET /influencer/:id/stats`
- Business service:
  - validate coupon
  - calculate discount
  - create order attribution
  - create commission record
- Unit test cho logic cốt lõi

## Data model chi tiết

1. Influencer
   - `id`, `name`, `email`, `handle`, `status`, `created_at`
2. Coupon
   - `id`, `code`, `influencer_id`, `discount_type`, `discount_value`
   - `usage_limit`, `used_count`, `valid_from`, `valid_to`, `status`, `slug`
3. Order
   - `id`, `total_amount`, `discount_amount`, `final_amount`
   - `coupon_code`, `influencer_id`, `created_at`
4. Commission
   - `id`, `order_id`, `influencer_id`, `commission_rate`
   - `commission_amount`, `status`, `created_at`

## Business rules bắt buộc

- Coupon input normalize uppercase trước khi query
- Reject nếu:
  - không tồn tại
  - status inactive
  - ngoài khung valid_from/valid_to
  - vượt usage_limit
- Discount:
  - percent/fixed
  - clamp để không vượt cart_total
- Commission:
  - tạo record khi order payment success
  - status mặc định `pending`

## API contract gợi ý

1. `POST /coupon/validate`
   - input: `{ code, cart_total }`
   - output: `{ valid, discount, final_total, influencer_id, reason? }`
2. `POST /order/create`
   - input: `{ cart_total, coupon_code? }`
   - output: `{ order_id, discount, final_total }`
3. `GET /influencer/:id/stats`
   - output: `{ total_orders, total_revenue, total_commission }`

## Test matrix tối thiểu

- validate success:
  - percent coupon
  - fixed coupon
- validate fail:
  - expired
  - inactive
  - usage_limit reached
  - invalid code
- order create:
  - without coupon
  - with coupon
- commission:
  - tạo đúng final_amount * commission_rate

## Definition of Done

- Migration chạy sạch trên DB trống
- Tất cả endpoint pass integration tests
- Case insensitive đã được test
- Không có đường nào tạo final_amount âm

## Risks

- Double counting `used_count` nếu order fail sau create
- Race condition usage_limit khi concurrent checkout

## Mitigation

- Chỉ tăng `used_count` sau payment success hoặc có trạng thái order rõ ràng
- Dùng DB transaction + row lock với coupon khi confirm order

