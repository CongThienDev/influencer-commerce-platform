# External Frontend Integration Contract

## Bối cảnh

Frontend checkout nằm ở repo khác. Repo này cung cấp API cho:

1. Validate coupon
2. Tạo order có attribution
3. Resolve influencer slug sang coupon

## Base principles

- API là source of truth cho discount/final total
- Coupon code xử lý case-insensitive
- Chỉ 1 coupon cho mỗi order
- Không cho final total âm

## Endpoint 1: POST `/coupon/validate`

### Request

```json
{
  "code": "anna10",
  "cart_total": 100000
}
```

### Response success

```json
{
  "valid": true,
  "discount": 10000,
  "final_total": 90000,
  "influencer_id": "uuid"
}
```

### Response invalid

```json
{
  "valid": false,
  "discount": 0,
  "final_total": 100000,
  "reason_code": "EXPIRED"
}
```

### `reason_code` enum

- `INVALID`
- `INACTIVE`
- `EXPIRED`
- `LIMIT_REACHED`

## Endpoint 2: POST `/order/create`

### Request

```json
{
  "cart_total": 100000,
  "coupon_code": "ANNA10"
}
```

### Response

```json
{
  "order_id": "uuid",
  "discount": 10000,
  "final_total": 90000,
  "influencer_id": "uuid"
}
```

## Endpoint 3: GET `/coupon/slug/:slug`

### Response success

```json
{
  "slug": "anna",
  "coupon_code": "ANNA10",
  "influencer_id": "uuid"
}
```

### Response not found

```json
{
  "found": false
}
```

## Integration sequence cho frontend checkout repo khác

1. User nhập coupon hoặc vào từ link có coupon
2. Gọi `POST /coupon/validate`
3. Hiển thị discount/final_total từ response
4. Khi submit checkout, gọi `POST /order/create`
5. Dùng `order_id` cho bước payment tiếp theo

## Retry & idempotency khuyến nghị

- Frontend gửi `Idempotency-Key` cho `POST /order/create` để tránh tạo duplicate order khi retry network.

## Error handling guidelines

- Nếu API timeout/network error:
  - FE hiển thị "Không thể xác thực coupon, vui lòng thử lại"
- Nếu `valid=false`:
  - FE hiển thị message theo `reason_code`

## Contract ownership

- Mọi thay đổi payload phải tăng version hoặc có backward compatibility
- Không đổi tên field đột ngột khi chưa thông báo team frontend repo ngoài

