# Agent Task Templates (Dùng để Spawn Agent)

## Cách dùng

- Mỗi agent nhận 1 scope nhỏ, output rõ ràng
- Không giao nhiều domain trong 1 task
- Luôn yêu cầu:
  - files changed
  - test evidence
  - acceptance checklist

## Template 1: Backend domain task

```md
Bạn thực hiện task backend trong repo monorepo này.

Scope:
- [mô tả chính xác endpoint hoặc service]

Yêu cầu:
1. Tuân thủ TypeScript strict
2. Có validation input/output
3. Thêm unit test và integration test liên quan
4. Không phá API hiện tại

Output bắt buộc:
1. Danh sách file đã sửa
2. Mô tả logic đã thêm/sửa
3. Kết quả test (command + pass/fail)
4. Checklist acceptance đã pass
```

## Template 2: Frontend admin task

```md
Bạn thực hiện task frontend React + Ant Design trong admin dashboard.

Scope:
- [trang hoặc component cụ thể]

Yêu cầu:
1. Dùng Ant Design components, ưu tiên table/form/modal
2. UX tối đa 2 click cho action chính
3. Handle loading/error/empty state
4. Hook API theo service layer hiện có

Output bắt buộc:
1. Danh sách file đã sửa
2. Ảnh hưởng UI flow
3. Các edge cases đã xử lý
4. Checklist acceptance đã pass
```

## Template 3: Data migration task

```md
Bạn thực hiện migration schema cho coupon/influencer/order/commission.

Yêu cầu:
1. Migration idempotent, rollback strategy rõ
2. Có index/unique constraints cần thiết
3. Cập nhật seed data tối thiểu để test local
4. Cập nhật tài liệu schema nếu thay đổi

Output bắt buộc:
1. SQL/migration files changed
2. Risk khi deploy production
3. Cách rollback hoặc fix-forward
4. Kết quả chạy migration local
```

## Template 4: QA verification task

```md
Bạn đóng vai QA để verify Phase [X].

Yêu cầu:
1. Test theo checklist trong docs phase tương ứng
2. Báo lỗi theo severity P0/P1/P2
3. Nêu bước reproduce ngắn gọn, rõ ràng
4. Nêu expected vs actual

Output bắt buộc:
1. Danh sách test case đã chạy
2. Danh sách bug theo severity
3. Regression risks
4. Kết luận pass/fail cho phase
```

## Prompt mẫu theo phase

1. Phase 0 prompt
   - "Triển khai Phase 0 theo file `docs/phases/phase-0-repo-bootstrap.md`, commit theo từng deliverable nhỏ."
2. Phase 1 prompt
   - "Triển khai backend coupon core theo `docs/phases/phase-1-core-coupon-engine.md`, ưu tiên test coverage logic."
3. Phase 2 prompt
   - "Triển khai external checkout integration contract theo `docs/phases/phase-2-checkout-attribution.md`, đảm bảo validate/order/slug APIs ổn định cho repo frontend ngoài."
4. Phase 3 prompt
   - "Triển khai admin dashboard MVP theo `docs/phases/phase-3-admin-dashboard-mvp.md`, hoàn thiện CRUD và CSV export."
5. Phase 4 prompt
   - "Thiết lập hardening + production checklist theo `docs/phases/phase-4-hardening-and-production.md`."
