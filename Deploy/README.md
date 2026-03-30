# Deploy

Khu vực tách riêng toàn bộ hạ tầng và vận hành.

## Cấu trúc

- `Deploy/app/`: compose và cấu hình chạy local bằng container
- `Deploy/infra/`: manifest production cho Kubernetes/Ingress

## Local container run

```bash
docker compose -f Deploy/app/docker-compose.yml up --build
```

## Production baseline

- Build image từ `Frontend/Dockerfile` và `Backend/Dockerfile`
- Deploy backend trước, sau đó frontend
- Dùng env/secret từ platform thay vì hardcode trong image
