# Phase 0: Repo Bootstrap & Engineering Baseline

## Mục tiêu phase

Tạo nền tảng kỹ thuật chắc chắn để các phase sau chỉ tập trung business logic, tránh sửa lại hạ tầng giữa chừng.

## Deliverables

- Repo khởi tạo xong với 3 khối chính (`Frontend/`, `Backend/`, `Deploy/`)
- Admin FE React + Ant Design chạy local
- BE API chạy local
- PostgreSQL local qua Docker
- Migration + seed chạy được
- CI tối thiểu: lint + test + build
- `.env.example` đầy đủ

## Task breakdown

1. Repo scaffolding
   - setup workspace (`pnpm` hoặc `npm workspaces`)
   - tạo package scripts root
2. FE bootstrap
   - create React app bằng Vite cho admin
   - setup Ant Design + global theme token
   - setup admin router skeleton
3. BE bootstrap
   - setup TypeScript runtime
   - setup REST server + health check endpoint
   - setup validation library
4. DB setup
   - docker compose cho postgres
   - ORM init + migration baseline
5. Engineering standards
   - ESLint + Prettier + Husky (optional)
   - shared tsconfig
6. CI baseline
   - GitHub Actions: install -> lint -> test -> build

## Definition of Done

- Chạy local bằng 1 command cho từng app
- `npm run lint` pass
- `npm run test` pass (ít nhất smoke tests)
- `npm run build` pass cho FE + BE
- Có README root hướng dẫn setup < 10 phút

## Risks

- Không chốt sớm ORM/tooling -> mất thời gian migrate
- Thiếu chuẩn env naming -> dễ sai config khi deploy

## Agent spawn chunks đề xuất

- Agent A: bootstrap `Backend/` + DB migration
- Agent B: bootstrap `Frontend/` + Ant Design + router
- Agent C: CI + lint + workspace scripts
