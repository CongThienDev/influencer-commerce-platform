# Delivery Phases Overview (to Production)

## Tổng timeline gợi ý

- Phase 0: Repo bootstrap và technical baseline
- Phase 1: Core coupon engine + domain model
- Phase 2: External checkout integration contract + attribution flow
- Phase 3: Admin dashboard MVP
- Phase 4: Hardening + production release
- Phase 5: User dashboard v1 (defer, làm sau)

## Phase goals (ngắn gọn)

1. Phase 0:
   - Có service repo chạy được local (admin FE + BE + DB), CI tối thiểu, DB migration pipeline
2. Phase 1:
   - Coupon/influencer/order/commission chạy end-to-end ở backend
3. Phase 2:
   - API contract cho repo frontend ngoài: validate coupon + create order attribution + resolve slug
4. Phase 3:
   - Admin có thể vận hành toàn bộ nghiệp vụ Phase 1
5. Phase 4:
   - Hệ thống đạt mức release production đầu tiên
6. Phase 5:
   - Xây user dashboard cho influencer

## Exit criteria từng phase

- Phase 0:
  - Admin FE + BE + DB up bằng 1 lệnh local
  - Có lint/test cơ bản pass
- Phase 1:
  - API `/coupon/validate`, `/order/create`, `/influencer/:id/stats` hoạt động
  - Commission auto-create sau payment success giả lập
- Phase 2:
  - External FE tích hợp thành công bằng contract tests
  - slug resolve endpoint hoạt động
- Phase 3:
  - Admin pages và actions đầy đủ theo requirement
- Phase 4:
  - Có staging + production deploy flow, backup, monitoring, runbook
- Phase 5:
  - User dashboard v1 có auth + số liệu cá nhân

## Suggested branch strategy

- `main`: production-ready
- `develop` (optional): integration branch
- feature branches: `codex/phase-x-...`

## Suggested delivery cadence

- Mỗi phase chia thành ticket nhỏ <= 1 ngày
- Mỗi ticket phải có:
  - clear output
  - clear acceptance checklist
  - rollback note nếu ảnh hưởng dữ liệu
