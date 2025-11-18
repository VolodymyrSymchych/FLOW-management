# Development Guide

Гайд по розробці мікросервісів.

## Передумови

- Node.js 20+
- Docker та Docker Compose
- npm або yarn

## Початок роботи

### 1. Клонування репозиторію

```bash
git clone <repository-url>
cd project-scope-analyzer
```

### 2. Запуск інфраструктури

```bash
cd infrastructure
docker-compose up -d
```

Це запустить:
- PostgreSQL databases
- Redis
- RabbitMQ
- Prometheus
- Grafana
- Nginx (API Gateway)

### 3. Налаштування shared libraries

```bash
cd shared
npm install
npm run build
```

### 4. Створення нового сервісу

```bash
cd services
cp -r _template my-service
cd my-service

# Оновіть package.json
# Змініть SERVICE_NAME в .env.example
npm install
```

### 5. Запуск сервісу

```bash
npm run dev
```

## Структура проєкту

```
project-scope-analyzer/
├── services/          # Мікросервіси
├── shared/            # Спільні бібліотеки
├── infrastructure/    # Docker, моніторинг, nginx
├── scripts/           # Допоміжні скрипти
└── docs/              # Документація
```

## Розробка сервісу

### Додавання нових routes

1. Створіть controller в `src/controllers/`
2. Створіть route в `src/routes/`
3. Додайте route в `src/routes/index.ts`

### Додавання middleware

Додайте middleware в `src/app.ts`:

```typescript
app.use(yourMiddleware);
```

### Підключення до бази даних

```typescript
import { createDatabaseConnection } from '@project-scope-analyzer/shared';

const db = createDatabaseConnection('service-name');
const users = await db.query('SELECT * FROM users');
```

### Публікація подій

```typescript
import { createEventBus } from '@project-scope-analyzer/shared';

const eventBus = createEventBus('service-name');
await eventBus.connect();

await eventBus.publish({
  type: 'user.created',
  userId: 1,
  timestamp: new Date(),
});
```

### Підписка на події

```typescript
eventBus.subscribe('user.created', async (event, metadata) => {
  // Handle event
});
```

## Тестування

### Unit тести

```bash
npm test
```

### Integration тести

Створіть тести в `tests/` директорії.

## Логування

Використовуйте structured logging:

```typescript
import { logger } from '@project-scope-analyzer/shared';

logger.info('User created', { userId: 1 });
logger.error('Error occurred', { error });
```

## Метрики

Метрики автоматично збираються через Prometheus. Доступні на `/metrics` endpoint.

## Налагодження

### Локальне налагодження

```bash
npm run dev
```

### Docker налагодження

```bash
docker-compose logs -f service-name
```

## Best Practices

1. Завжди використовуйте shared libraries для спільних функцій
2. Додавайте health check та metrics endpoints
3. Використовуйте structured logging
4. Валідуйте вхідні дані
5. Обробляйте помилки правильно
6. Публікуйте події для важливих дій
7. Пишіть тести

