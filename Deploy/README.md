# Deploy

Khu vực tách riêng toàn bộ hạ tầng và vận hành.

## Cấu trúc

- `Deploy/infra/`: manifest production cho Kubernetes/Ingress

## Local container run

```bash
cp .env.example .env
docker compose up --build
```

## Production baseline

- Build image từ `Frontend/Dockerfile` và `Backend/Dockerfile`
- Deploy backend trước, sau đó frontend
- Dùng env/secret từ platform thay vì hardcode trong image
