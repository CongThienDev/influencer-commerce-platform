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
cp .env.example .env
cd Backend && cp .env.example .env && npm install
cd ../Frontend && npm install
```

## Database (PostgreSQL)

Backend supports PostgreSQL when `DATABASE_URL` is set.

```bash
cd Backend
npm run db:migrate
npm run db:seed
```

## Run Backend (local)

Use terminal 1:

```bash
cd Backend
npm run dev
```

Backend runs at `http://localhost:4000`.

## Run Frontend (local)

Use terminal 2:

```bash
cd Frontend
npm run dev
```

Frontend runs at `http://localhost:5173`.

## API contracts

- `docs/openapi/auth.yaml`
- `docs/openapi/coupon.yaml`
- `docs/openapi/admin.yaml`
