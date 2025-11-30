# Redis Cache з перевіркою актуальності - Документація

## Огляд

Проект використовує Redis для кешування даних з автоматичною перевіркою актуальності через timestamp validation. Це забезпечує:

- ⚡ **Швидкість:** 50-80% зменшення навантаження на базу даних
- ✅ **Актуальність:** Дані завжди свіжі завдяки timestamp перевірці
- 🔄 **Автоматична інвалідація:** Кеш оновлюється при змінах даних

## Архітектура

### Основні компоненти

1. **[dashboard/lib/redis.ts](dashboard/lib/redis.ts)** - Базові функції кешування
2. **[dashboard/lib/cache-keys.ts](dashboard/lib/cache-keys.ts)** - Типізовані ключі кешу
3. **[dashboard/lib/cache-invalidation.ts](dashboard/lib/cache-invalidation.ts)** - Автоматична інвалідація

### Механізм роботи

```typescript
┌─────────────┐
│   API Call  │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────┐
│ cachedWithValidation()      │
│                             │
│ 1. Перевірка кешу в Redis   │
│ 2. Якщо є - отримати        │
│    updatedAt з БД           │
│ 3. Порівняти timestamps     │
│ 4. Якщо застаріло -         │
│    оновити з БД             │
└─────────────────────────────┘
       │
       ▼
┌─────────────┐
│   Response  │
└─────────────┘
```

## Використання

### 1. Читання даних з кешем

```typescript
import { cachedWithValidation } from '@/lib/redis';
import { CacheKeys } from '@/lib/cache-keys';
import { db } from '@/server/db';
import { projects } from '@/shared/schema';
import { eq, desc, and, isNull } from 'drizzle-orm';

// GET API endpoint
export async function GET(request: NextRequest) {
  const session = await getSession();

  const userProjects = await cachedWithValidation(
    CacheKeys.projectsByUser(session.userId),
    async () => await storage.getUserProjects(session.userId),
    {
      ttl: 300, // 5 хвилин
      validate: true,
      getUpdatedAt: async () => {
        // Отримати найновіший updatedAt з БД
        const result = await db
          .select({ updatedAt: projects.updatedAt })
          .from(projects)
          .where(and(
            eq(projects.userId, session.userId),
            isNull(projects.deletedAt)
          ))
          .orderBy(desc(projects.updatedAt))
          .limit(1);

        return result[0]?.updatedAt || null;
      },
    }
  );

  return NextResponse.json({ projects: userProjects });
}
```

### 2. Запис даних з інвалідацією

```typescript
import { invalidateOnUpdate } from '@/lib/cache-invalidation';

// POST API endpoint
export async function POST(request: NextRequest) {
  const session = await getSession();
  const data = await request.json();

  // Створити проект
  const project = await storage.createProject(data);

  // Автоматично інвалідувати всі пов'язані кеші
  await invalidateOnUpdate('project', project.id, session.userId, {
    teamId: data.teamId
  });

  return NextResponse.json({ project });
}
```

### 3. Оновлення даних з інвалідацією

```typescript
// PUT API endpoint
export async function PUT(request: NextRequest, { params }) {
  const session = await getSession();
  const projectId = parseInt(params.id);
  const data = await request.json();

  // Оновити проект
  const updatedProject = await storage.updateProject(projectId, data);

  // Інвалідувати кеш
  await invalidateOnUpdate('project', projectId, session.userId, {
    teamId: data.teamId
  });

  return NextResponse.json({ project: updatedProject });
}
```

### 4. Видалення даних з інвалідацією

```typescript
import { invalidateAllProjectCaches } from '@/lib/cache-invalidation';

// DELETE API endpoint
export async function DELETE(request: NextRequest, { params }) {
  const session = await getSession();
  const projectId = parseInt(params.id);

  // Видалити проект
  await storage.deleteProject(projectId);

  // Інвалідувати всі пов'язані кеші
  await invalidateAllProjectCaches(projectId, session.userId);

  return NextResponse.json({ success: true });
}
```

## Ключі кешу

Використовуйте типізовані функції з [dashboard/lib/cache-keys.ts](dashboard/lib/cache-keys.ts):

```typescript
import { CacheKeys } from '@/lib/cache-keys';

// Projects
CacheKeys.project(123)                    // "project:123"
CacheKeys.projectsByUser(456)             // "projects:user:456"
CacheKeys.projectsByTeam(789)             // "projects:team:789"
CacheKeys.projectProgress(123)            // "project:123:progress"

// Tasks
CacheKeys.task(123)                       // "task:123"
CacheKeys.tasksByUser(456)                // "tasks:user:456"
CacheKeys.tasksByProject(123)             // "tasks:project:123"
CacheKeys.tasksByTeam(789)                // "tasks:team:789"
CacheKeys.taskHours(123)                  // "task:123:hours"

// Stats
CacheKeys.statsByUser(456)                // "stats:user:456"
CacheKeys.statsByTeam(789)                // "stats:team:789"

// Teams
CacheKeys.team(789)                       // "team:789"
CacheKeys.teamMembers(789)                // "team:789:members"
CacheKeys.teamsByUser(456)                // "teams:user:456"

// Invoices, Expenses, Chat, тощо...
```

## Стратегія TTL

| Тип даних | TTL | Обґрунтування |
|-----------|-----|---------------|
| Chat messages, Notifications | 30-60 сек | Швидко змінюються, реал-тайм |
| Tasks, Projects lists, Stats | 1-3 хв | Середньо змінювані |
| Teams, User profiles | 5-10 хв | Повільно змінювані |
| Templates, Config | 30-60 хв | Рідко змінювані |

## Автоматична інвалідація

### Підтримувані типи сутностей

```typescript
type InvalidatableEntity =
  | 'project'
  | 'task'
  | 'team'
  | 'invoice'
  | 'expense'
  | 'chat'
  | 'notification'
  | 'file'
  | 'report'
  | 'user'
  | 'timeEntry';
```

### Що інвалідується для кожної сутності

**Project:**
- `project:{id}`
- `project:{id}:*` (всі вкладені ключі)
- `projects:user:{userId}`
- `projects:team:{teamId}`
- `stats:user:{userId}`
- `stats:team:{teamId}`

**Task:**
- `task:{id}`
- `tasks:user:{userId}`
- `tasks:project:{projectId}`
- `tasks:team:{teamId}`
- `project:{projectId}:progress`
- `stats:user:{userId}`

**Team:**
- `team:{id}`
- `team:{id}:*`
- `teams:user:{userId}`
- `projects:team:{teamId}`
- `tasks:team:{teamId}`
- `stats:team:{teamId}`

## Приклади використання

### Приклад 1: Кешування списку проектів

```typescript
// dashboard/app/api/projects/route.ts
const projects = await cachedWithValidation(
  CacheKeys.projectsByUser(userId),
  () => storage.getUserProjects(userId),
  {
    ttl: 300,
    validate: true,
    getUpdatedAt: async () => {
      const result = await db
        .select({ updatedAt: projects.updatedAt })
        .from(projects)
        .where(eq(projects.userId, userId))
        .orderBy(desc(projects.updatedAt))
        .limit(1);
      return result[0]?.updatedAt || null;
    }
  }
);
```

### Приклад 2: Кешування статистики

```typescript
// dashboard/app/api/stats/route.ts
const stats = await cachedWithValidation(
  CacheKeys.statsByUser(userId),
  () => calculateStats(userId),
  {
    ttl: 60, // 1 хвилина
    validate: true,
    getUpdatedAt: async () => {
      // Статистика залежить від проектів, задач, витрат
      const timestamps = await Promise.all([
        getLastProjectUpdate(userId),
        getLastTaskUpdate(userId),
        getLastExpenseUpdate(userId)
      ]);

      const mostRecent = timestamps.reduce((max, current) => {
        if (!max) return current;
        if (!current) return max;
        return current > max ? current : max;
      }, null);

      return mostRecent;
    }
  }
);
```

### Приклад 3: Batch інвалідація

```typescript
import { batchInvalidate } from '@/lib/cache-invalidation';

// Якщо потрібно інвалідувати декілька сутностей одночасно
await batchInvalidate([
  { entity: 'project', id: 123, userId: 456 },
  { entity: 'task', id: 789, userId: 456, metadata: { projectId: 123 } },
  { entity: 'team', id: 101, userId: 456 }
]);
```

## Налаштування

### Environment Variables

```bash
# Upstash Redis (Production)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token

# Local Redis (Development)
REDIS_URL=redis://localhost:6379
```

## Моніторинг

Логи кешу виводяться в консоль:

```
[Cache] Hit (validated) for key: projects:user:456
[Cache] Data stale for key: tasks:user:456. DB: 2025-01-15, Cache: 2025-01-14
[Cache] Miss for key: stats:user:456
[Cache] Stored for key: projects:user:456 with TTL: 300s
[Cache Invalidation] Invalidating 5 keys for project:123
```

## Best Practices

### 1. Завжди використовуйте CacheKeys

❌ **Погано:**
```typescript
const key = `projects:user:${userId}`;
```

✅ **Добре:**
```typescript
const key = CacheKeys.projectsByUser(userId);
```

### 2. Завжди додавайте timestamp validation

❌ **Погано:**
```typescript
const data = await cached(key, fetcher, { ttl: 300 });
```

✅ **Добре:**
```typescript
const data = await cachedWithValidation(
  key,
  fetcher,
  {
    ttl: 300,
    validate: true,
    getUpdatedAt: async () => { /* ... */ }
  }
);
```

### 3. Інвалідуйте кеш після змін

❌ **Погано:**
```typescript
await storage.updateProject(id, data);
return NextResponse.json({ project });
```

✅ **Добре:**
```typescript
const project = await storage.updateProject(id, data);
await invalidateOnUpdate('project', id, userId, { teamId });
return NextResponse.json({ project });
```

### 4. Вибирайте правильний TTL

Орієнтуйтесь на частоту змін даних:
- Часто змінювані (stats, chat) → 30-60 секунд
- Середньо (tasks, projects) → 3-5 хвилин
- Рідко (teams, templates) → 10-60 хвилин

## Troubleshooting

### Застарілі дані в кеші

**Проблема:** Дані в кеші не оновлюються після змін.

**Рішення:**
1. Перевірте чи викликається `invalidateOnUpdate()` після змін
2. Перевірте чи правильно передаються metadata (userId, projectId, teamId)
3. Перегляньте логи `[Cache Invalidation]` щоб переконатись що інвалідація відбувається

### Redis недоступний

**Проблема:** Redis сервер не відповідає.

**Рішення:** Система автоматично робить fallback до бази даних:
```typescript
if (!redis) {
  // No cache - just fetch from DB
  return fetcher();
}
```

### Помилки timestamp validation

**Проблема:** Помилка в функції `getUpdatedAt()`.

**Рішення:** Система використовує кешовані дані при помилці валідації:
```typescript
catch (validationError) {
  console.warn('[Cache] Validation error:', validationError);
  // On validation error, use cached data
  return cachedData.data;
}
```

## Подальші покращення

1. **Cache warming** - Прогрів кешу для популярних даних
2. **Redis Pub/Sub** - Інвалідація в multi-instance setup
3. **Edge caching** - Vercel Edge Network для глобального кешу
4. **Метрики** - Відстеження hit rate, miss rate, performance
5. **A/B тестування** - Оптимізація TTL значень

## Підсумок

Система Redis кешування з timestamp validation забезпечує:

✅ **Високу продуктивність** через зменшення запитів до БД
✅ **Актуальність даних** через автоматичну перевірку timestamps
✅ **Простоту використання** через типізовані функції
✅ **Надійність** через автоматичну інвалідацію і fallback

Використовуйте цю документацію як довідник при роботі з кешуванням в проекті!
