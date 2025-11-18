# Shared Libraries

Спільні бібліотеки для мікросервісів.

## Структура

- `types/` - TypeScript типи для всіх сервісів
- `utils/` - Утиліти (logger, validator, errors, metrics)
- `database/` - Database connection helpers
- `events/` - Event types та Event Bus

## Використання

### Встановлення

```bash
cd shared
npm install
npm run build
```

### Імпорт в сервісах

```typescript
import { logger, AppError, createDatabaseConnection, createEventBus } from '@project-scope-analyzer/shared';
```

## Компоненти

### Logger

Structured logging з Winston:

```typescript
import { logger } from '@project-scope-analyzer/shared';

logger.info('Message', { context: 'data' });
logger.error('Error', { error });
```

### Validator

Валідація з Zod:

```typescript
import { validate, createValidator } from '@project-scope-analyzer/shared';
import { z } from 'zod';

const schema = z.object({ name: z.string() });
const data = validate(schema, input);
```

### Errors

Кастомні помилки:

```typescript
import { NotFoundError, ValidationError } from '@project-scope-analyzer/shared';

throw new NotFoundError('User', userId);
```

### Database

Database connection:

```typescript
import { createDatabaseConnection } from '@project-scope-analyzer/shared';

const db = createDatabaseConnection('service-name');
const users = await db.query('SELECT * FROM users');
```

### Event Bus

Event-driven communication:

```typescript
import { createEventBus } from '@project-scope-analyzer/shared';

const eventBus = await createEventBus('service-name', 'redis');
await eventBus.connect();

await eventBus.publish({ type: 'user.created', userId: 1 });

eventBus.subscribe('user.created', async (event) => {
  // Handle event
});
```

## Розробка

```bash
npm run build    # Build TypeScript
npm run watch    # Watch mode
```

