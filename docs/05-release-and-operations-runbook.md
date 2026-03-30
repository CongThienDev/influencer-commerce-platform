# Release & Operations Runbook

## 1) Release checklist (staging -> production)

1. Confirm commit/tag release
2. Run full CI
3. Apply DB migrations
4. Deploy API
5. Deploy Web
6. Run smoke tests
7. Announce release + theo dõi logs

## 2) Smoke tests sau deploy

- External checkout integration:
  - validate coupon success
  - validate coupon fail case
- Attribution:
  - tạo order có coupon -> verify influencer_id
- Commission:
  - verify commission record được tạo
- Admin:
  - mở dashboard summary
  - tạo/sửa/tắt coupon thành công

## 3) Monitoring cần có

- API 5xx rate
- response time `/coupon/validate`
- DB connections
- commission creation failed count

## 4) Incident runbook (ngắn)

1. Identify impact
2. Freeze risky operations (nếu cần)
3. Rollback service nếu lỗi release
4. Fix-forward với patch nhỏ
5. Viết postmortem trong 24h

## 5) Data correction runbook

Khi phát hiện attribution sai:

1. Xác định phạm vi order bị ảnh hưởng
2. Backup snapshot bảng liên quan
3. Chạy script correction có transaction
4. Recompute commission records
5. Audit lại bằng report trước/sau

## 6) Operational ownership

- Product owner: xác nhận behavior đúng requirement
- Engineering owner: chịu trách nhiệm release
- Ops/Finance owner: xác nhận báo cáo commission
