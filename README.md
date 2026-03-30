# influencer-platform-system

Repo này được chuẩn hóa theo 3 khối chính:

- `Frontend/`: ứng dụng admin web
- `Backend/`: API Express
- `Deploy/`: Docker Compose, Kubernetes, CI/CD

## Cấu trúc

```text
Frontend/
Backend/
Deploy/
docs/
.github/workflows/
```

## Chạy local

### Backend

```bash
cd Backend
cp .env.example .env
npm install
npm run dev
```

API mặc định chạy ở `http://localhost:4000`.

### Frontend

```bash
cd Frontend
npm install
npm run dev
```

UI mặc định chạy ở `http://localhost:5173`.

### Chạy cả hệ thống bằng container

```bash
docker compose -f Deploy/app/docker-compose.yml up --build
```

## CI/CD

- Workflow: `.github/workflows/ci-cd.yml`
- Deploy baseline: `Deploy/infra/k8s/`

## API chính

- `POST /v1/auth/login`
- `GET /v1/auth/me`
- `POST /v1/auth/logout`
- `GET /v1/admin/dashboard/summary`

## Contracts

- `docs/openapi/auth.yaml`
- `docs/openapi/coupon.yaml`
- `docs/openapi/admin.yaml`
