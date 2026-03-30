# Auth API Contract (JWT + HttpOnly Cookie)

## File nguồn OpenAPI

- [docs/openapi/auth.yaml](/Users/lecongthien/Documents/GitHub/influencer-platform-system/docs/openapi/auth.yaml)

## 1) Mục tiêu

Chuẩn hóa đăng nhập admin cho repo này bằng JWT cookie-based auth, để backend và admin-web triển khai đồng nhất.

## 2) Endpoints

1. `POST /v1/auth/login`
2. `POST /v1/auth/refresh`
3. `POST /v1/auth/logout`
4. `GET /v1/auth/me`

## 3) Cookie policy (production)

- `access_token`:
  - `HttpOnly=true`
  - `Secure=true`
  - `SameSite=Lax`
  - `Path=/`
  - `Max-Age=900` (15 phút)
- `refresh_token`:
  - `HttpOnly=true`
  - `Secure=true`
  - `SameSite=Lax`
  - `Path=/v1/auth`
  - `Max-Age=2592000` (30 ngày)

## 4) CSRF policy

Vì dùng cookie auth, bắt buộc CSRF protection cho request thay đổi state:

- Dùng double-submit token:
  - server set thêm cookie `csrf_token` (không HttpOnly)
  - client gửi header `X-CSRF-Token`
  - server so sánh cookie và header

Áp dụng cho:

- `POST /v1/auth/logout`
- tất cả `POST/PATCH/DELETE` admin endpoints

## 5) Error format chuẩn

```json
{
  "error": "UNAUTHORIZED",
  "message": "Invalid credentials or session",
  "statusCode": 401
}
```

## 6) Login flow

1. Client gửi email/password vào `POST /v1/auth/login`
2. Server verify credential
3. Server set cookies `access_token`, `refresh_token`
4. Server trả JSON `success + user`

## 7) Refresh flow

1. Client gọi `POST /v1/auth/refresh` khi 401 hoặc trước khi access hết hạn
2. Server verify refresh token từ cookie
3. Server rotate refresh token
4. Server set lại cookies mới

## 8) Logout flow

1. Client gọi `POST /v1/auth/logout`
2. Server revoke refresh token session trong DB
3. Server clear `access_token` và `refresh_token` cookie

## 9) RBAC

- Tất cả `/v1/admin/*` yêu cầu role `admin`
- `GET /v1/auth/me` yêu cầu access token hợp lệ

## 10) Notes cho implementer

- Không trả token trong JSON body
- Chỉ truyền qua Set-Cookie header
- Refresh token phải lưu hash ở DB để revoke/rotate an toàn
- Login endpoint bắt buộc rate limit để giảm brute-force

