# Product Scope & Priorities (Phase 1 MVP)

## 1) Product Vision

Xây dựng 1 service repo để xử lý coupon attribution + commission và cung cấp admin dashboard nội bộ; frontend checkout/public ở repo khác sẽ gọi API của service này.

## 2) Scope hiện tại (phải làm)

- Coupon validation và discount calculation
- Influencer attribution theo coupon
- Order lưu thông tin coupon/influencer/discount/final amount
- Commission auto-create sau payment success
- Admin dashboard vận hành nội bộ:
  - Dashboard số liệu tổng
  - CRUD Influencers
  - CRUD Coupons
  - Orders list
  - Commissions list + mark paid + export CSV
- API contract rõ ràng để frontend checkout repo khác có thể:
  - validate coupon
  - nhận discount/final total
  - biết coupon thuộc influencer nào
- Influencer short link ở mức service:
  - endpoint resolve slug để frontend ngoài redirect theo logic của họ

## 3) Scope chưa làm ngay (defer)

- User dashboard cho influencer (v2)
- SEO optimization
- Affiliate cookie tracking
- Multi-level commission
- Payment automation
- Tax handling

## 4) KPI thành công cho Phase 1

- 100% orders dùng coupon được attribution đúng influencer
- Không có order final amount âm
- Coupon case-insensitive hoạt động ổn định
- Admin tạo/sửa/tắt coupon không cần dev support
- Commission records tự sinh sau payment success

## 5) Functional requirements cứng

- Chỉ 1 coupon/order
- Coupon code không phân biệt hoa thường
- Check validity gồm:
  - tồn tại
  - active
  - valid_from/valid_to
  - usage_limit
- Prevent negative total:
  - `final_total = max(cart_total - discount, 0)`

## 6) Non-functional requirements (MVP level)

- UI load nhanh, dùng table, tránh biểu đồ nặng
- API response thời gian mục tiêu:
  - `/coupon/validate`: p95 < 300ms
  - `/order/create`: p95 < 500ms (không tính payment gateway)
- Có logs đủ để audit attribution
- Có seed data để demo nội bộ

## 7) User roles giai đoạn này

- Admin/Internal Operator:
  - full quyền với influencer/coupon/order/commission backend
- Influencer:
  - chưa có dashboard riêng ở Phase 1
  - chỉ dùng link + coupon
