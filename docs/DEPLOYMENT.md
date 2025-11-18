# Deployment Guide

Гайд по деплою мікросервісів.

## Локальний деплой

### Використання Docker Compose

```bash
cd infrastructure
docker-compose up -d
```

### Використання скрипта

```bash
./scripts/deploy.sh development
```

## Production деплой

### Підготовка

1. Налаштуйте змінні оточення
2. Побудуйте Docker образи
3. Налаштуйте бази даних
4. Налаштуйте моніторинг

### Docker Compose (для малих проєктів)

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Kubernetes (рекомендовано для production)

1. Створіть Kubernetes manifests
2. Налаштуйте ConfigMaps та Secrets
3. Деплой через kubectl або Helm

## CI/CD

### GitHub Actions

CI/CD pipeline автоматично:
- Лінтує код
- Запускає тести
- Білдить Docker образи
- Пушить образи в Docker Hub

### Налаштування

1. Додайте secrets в GitHub:
   - `DOCKER_USERNAME`
   - `DOCKER_PASSWORD`

2. Pipeline автоматично запускається при push в main/develop

## Моніторинг

### Prometheus

- Збирає метрики з усіх сервісів
- Налаштуйте alerting rules

### Grafana

- Візуалізація метрик
- Дашборди для моніторингу

## Health Checks

Кожен сервіс має:
- `/health` - Health check
- `/ready` - Readiness check
- `/metrics` - Prometheus metrics

## Масштабування

### Горизонтальне масштабування

```bash
docker-compose up -d --scale service-name=3
```

### Вертикальне масштабування

Налаштуйте ресурси в docker-compose.yml:

```yaml
services:
  service-name:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
```

## Backup

### Бази даних

```bash
# PostgreSQL backup
docker exec postgres-service pg_dump -U user db_name > backup.sql
```

### Volumes

```bash
docker run --rm -v volume-name:/data -v $(pwd):/backup alpine tar czf /backup/backup.tar.gz /data
```

## Troubleshooting

### Перевірка логів

```bash
docker-compose logs -f service-name
```

### Перевірка статусу

```bash
docker-compose ps
```

### Перезапуск сервісу

```bash
docker-compose restart service-name
```

## Security

1. Використовуйте secrets для паролів
2. Налаштуйте HTTPS
3. Обмежте доступ до портів
4. Регулярно оновлюйте образи
5. Використовуйте non-root users в Docker

