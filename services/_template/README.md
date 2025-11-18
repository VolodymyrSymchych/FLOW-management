# Service Template

Шаблон для створення нових мікросервісів.

## Структура

```
_template/
├── src/
│   ├── index.ts              # Entry point
│   ├── app.ts                # Express app
│   ├── routes/               # API routes
│   ├── controllers/          # Controllers
│   ├── services/             # Business logic
│   ├── models/               # Database models
│   ├── middleware/           # Middleware
│   └── config/               # Configuration
├── tests/                    # Тести
├── Dockerfile
├── package.json
└── tsconfig.json
```

## Використання

### Створення нового сервісу

```bash
cp -r services/_template services/my-service
cd services/my-service
# Оновіть package.json, .env.example та конфігурацію
```

### Розробка

```bash
npm install
npm run dev  # Development mode з hot reload
```

### Білд

```bash
npm run build
npm start
```

### Тестування

```bash
npm test
```

## Компоненти

### Health Check

- `GET /health` - Health check endpoint
- `GET /ready` - Readiness check endpoint

### Metrics

- `GET /metrics` - Prometheus metrics endpoint

### Middleware

- `requestLogger` - Request logging
- `metricsMiddleware` - Metrics collection
- `authMiddleware` - JWT authentication
- `errorHandler` - Error handling

## Конфігурація

Скопіюйте `.env.example` в `.env` та налаштуйте змінні оточення.

## Docker

```bash
docker build -t my-service .
docker run -p 3000:3000 my-service
```

