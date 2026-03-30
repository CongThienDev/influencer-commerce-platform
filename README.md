# influencer-platform-system

Monorepo gồm:

- `Backend/`: Express API
- `Frontend/`: React + Vite admin app
- `Deploy/`: Kubernetes baseline

## Quick start

```bash
cp .env.example .env
docker compose -f docker-compose.yml up --build
```

- Backend: `http://localhost:4000`
- Frontend: `http://localhost:5173`

## Dev mode (hot reload in containers)

```bash
cp .env.example .env
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

## Local run without Docker

```bash
cd Backend && cp .env.example .env && npm install && npm run dev
cd Frontend && npm install && npm run dev
```

## API contracts

- `docs/openapi/auth.yaml`
- `docs/openapi/coupon.yaml`
- `docs/openapi/admin.yaml`
