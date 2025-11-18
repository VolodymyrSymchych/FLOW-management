# Infrastructure

Інфраструктурні компоненти для мікросервісів.

## Компоненти

### Docker Compose

`docker-compose.yml` - конфігурація для локальної розробки з усіма необхідними сервісами:

- PostgreSQL (окремі БД для кожного сервісу)
- Redis (кешування та pub/sub)
- RabbitMQ (message queue)
- Prometheus (метрики)
- Grafana (візуалізація)
- Nginx (API Gateway)

### Запуск

```bash
cd infrastructure
docker-compose up -d
```

### Зупинка

```bash
docker-compose down
```

### Очищення

```bash
docker-compose down -v  # Видаляє volumes
```

## Моніторинг

### Prometheus

- URL: http://localhost:9090
- Конфігурація: `monitoring/prometheus.yml`
- Alerting rules: `monitoring/prometheus-rules.yml`

### Grafana

- URL: http://localhost:3000
- Логін: admin / admin
- Дашборди: `monitoring/grafana/dashboards/`

## API Gateway

Nginx конфігурація в `nginx/nginx.conf`:

- Маршрутизація до сервісів
- Rate limiting
- Load balancing
- CORS

## Порти

- 80 - Nginx (API Gateway)
- 5432-5436 - PostgreSQL databases
- 6379 - Redis
- 5672 - RabbitMQ AMQP
- 15672 - RabbitMQ Management UI
- 9090 - Prometheus
- 3000 - Grafana

