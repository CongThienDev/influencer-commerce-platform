# Phase 3: Admin Dashboard MVP (Ưu tiên chính)

## Mục tiêu phase

Xây admin dashboard vận hành đầy đủ cho team nội bộ. Đây là phase ưu tiên cao nhất sau backend core.

## Admin navigation

- Dashboard
- Influencers
- Coupons
- Orders
- Commissions

## Deliverables theo trang

1. Dashboard
   - total revenue (coupon orders)
   - total orders
   - total commission
   - top 5 influencers
2. Influencers page
   - table: `Name | Email | Codes | Revenue | Status`
   - actions: create/edit/deactivate
3. Coupons page
   - table: `Code | Influencer | Discount | Used | Revenue | Status`
   - actions: create/edit/disable
   - modal fields:
     - code
     - influencer dropdown
     - discount type + value
     - usage limit
     - valid until
     - slug
4. Orders page
   - table: `Order ID | Amount | Coupon | Influencer | Date`
5. Commissions page
   - table: `Influencer | Orders | Revenue | Commission | Status`
   - actions: mark as paid, export CSV

## FE implementation guide (React + Ant Design)

1. Layout
   - Antd `Layout` + `Sider` + `Menu` + `Content`
2. Data components
   - Antd `Table`, `Form`, `Modal`, `DatePicker`, `Select`, `Tag`
3. Request layer
   - service module theo domain
   - central error handler
4. UX constraints
   - max 2 clicks cho action chính
   - number-first dashboard, không chart

## BE endpoints bổ sung cho admin

- Influencer:
  - `GET /admin/influencers`
  - `POST /admin/influencers`
  - `PATCH /admin/influencers/:id`
- Coupon:
  - `GET /admin/coupons`
  - `POST /admin/coupons`
  - `PATCH /admin/coupons/:id`
- Order:
  - `GET /admin/orders`
- Commission:
  - `GET /admin/commissions`
  - `PATCH /admin/commissions/:id/pay`
  - `GET /admin/commissions/export.csv`
- Dashboard:
  - `GET /admin/dashboard/summary`

## Permissions

- Chỉ role `admin` được truy cập `/admin/*`
- Bắt buộc auth middleware ở BE

## Definition of Done

- Team ops có thể tự tạo influencer + coupon và vô hiệu hóa khi cần
- Có thể xem order attribution và commission status realtime
- Export CSV dùng được cho finance reconciliation

## Risks

- Thiếu pagination/filter gây nặng bảng
- Thiếu validation khi tạo coupon (trùng code, slug trùng)

## Mitigation

- API hỗ trợ pagination + search + status filter ngay từ đầu
- Unique constraints ở DB cho `coupon.code` và `coupon.slug`

