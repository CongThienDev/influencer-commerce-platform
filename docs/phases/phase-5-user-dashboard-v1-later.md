# Phase 5: User Dashboard v1 (Influencer) - Deferred

## Trạng thái

Phase này chưa ưu tiên. Chỉ bắt đầu sau khi admin dashboard và production ổn định.

## Mục tiêu phase

Cung cấp dashboard tối thiểu cho influencer xem hiệu quả coupon của chính họ.

## Scope v1 đề xuất

- Login influencer
- Overview cards:
  - total orders
  - total revenue attributed
  - total commission pending/paid
- Orders list theo influencer
- Commission history + payment status
- Copy link nhanh:
  - coupon link
  - slug link

## Không làm trong v1 user dashboard

- Withdraw automation
- Nhiều role phức tạp
- Analytics charts nâng cao

## Phụ thuộc

- RBAC tách role `influencer`
- API scope theo influencer identity
- Audit và data privacy hoàn chỉnh

## Exit criteria

- Influencer chỉ xem được data của họ
- Các số liệu khớp với admin dashboard
- Có pagination/filter cho bảng order/commission

