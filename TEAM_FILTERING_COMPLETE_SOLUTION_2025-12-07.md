# Виправлення фільтрування по командах - ПОВНЕ РІШЕННЯ

## Проблема

Фільтрування по командах не працювало, бо:
1. ❌ В базі даних не було поля `team_id` в таблиці `projects`
2. ❌ Мікросервіси не підтримували фільтрування по `teamId`
3. ❌ Tasks фільтрувались неправильно

## Рішення

### 1. ✅ Додано team_id в схему projects

**Файл**: `/services/project-service/src/db/schema.ts`

```typescript
export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  teamId: integer('team_id'), // ← ДОДАНО
  name: varchar('name', { length: 255 }).notNull(),
  // ... інші поля
});
```

### 2. ✅ Створено міграцію бази даних

**Файл**: `/services/project-service/migrations/add_team_id_to_projects.sql`

```sql
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS team_id INTEGER;

CREATE INDEX IF NOT EXISTS idx_projects_team_id ON projects(team_id);
CREATE INDEX IF NOT EXISTS idx_projects_user_team ON projects(user_id, team_id);
```

**Як застосувати міграцію**:
```bash
# Підключитись до бази даних і виконати:
psql $DATABASE_URL < services/project-service/migrations/add_team_id_to_projects.sql
```

### 3. ✅ Додано метод getProjectsByTeam

**Файл**: `/services/project-service/src/services/project.service.ts`

```typescript
async getProjectsByTeam(userId: number, teamId: number): Promise<Project[]> {
  const teamProjects = await db()
    .select()
    .from(projects)
    .where(and(
      eq(projects.userId, userId),
      eq(projects.teamId, teamId),
      isNull(projects.deletedAt)
    ))
    .orderBy(desc(projects.createdAt));

  return teamProjects.map(this.mapToProject);
}
```

### 4. ✅ Оновлено контролер для обробки teamId

**Файл**: `/services/project-service/src/controllers/project.controller.ts`

```typescript
async getProjects(req: AuthenticatedRequest, res: Response) {
  const userId = req.userId;
  const teamId = req.query.teamId ? parseInt(req.query.teamId as string, 10) : undefined;
  
  const projects = teamId
    ? await projectService.getProjectsByTeam(userId, teamId)
    : await projectService.getUserProjects(userId);

  res.json({ projects, total: projects.length });
}
```

### 5. ✅ Оновлено інтерфейси

```typescript
export interface Project {
  // ...
  teamId: number | null; // ← ДОДАНО
  // ...
}

export interface CreateProjectInput {
  name: string;
  teamId?: number; // ← ДОДАНО
  // ...
}
```

---

## Як працює фільтрування тепер

### Projects
```
User selects team (teamId=1)
       ↓
Dashboard: GET /api/projects?team_id=1
       ↓
Dashboard API: projectService.getProjects(teamId=1)
       ↓
Project Service: GET /api/projects?teamId=1
       ↓
Controller: getProjects(teamId=1)
       ↓
Service: getProjectsByTeam(userId, teamId)
       ↓
Database: SELECT * FROM projects WHERE user_id=X AND team_id=1
       ↓
Return filtered projects
```

### Tasks
Tasks фільтруються через projectId:
1. Спочатку отримуємо проекти команди
2. Потім фільтруємо таски по цих проектах

Або можна зробити JOIN:
```sql
SELECT tasks.* 
FROM tasks 
JOIN projects ON tasks.project_id = projects.id 
WHERE projects.team_id = 1 AND tasks.user_id = X
```

---

## Deployment Checklist

### 1. Застосувати міграцію бази даних

```bash
# Production database
psql $DATABASE_URL < services/project-service/migrations/add_team_id_to_projects.sql

# Verify
psql $DATABASE_URL -c "\d projects"
```

### 2. Deploy project-service

```bash
cd services/project-service
npm run build
# Deploy to Vercel
```

### 3. Оновити існуючі проекти (опціонально)

Якщо у вас вже є проекти без team_id, можна їх оновити:

```sql
-- Приклад: прив'язати всі проекти користувача до його першої команди
UPDATE projects p
SET team_id = (
  SELECT team_id 
  FROM team_members tm 
  WHERE tm.user_id = p.user_id 
  LIMIT 1
)
WHERE team_id IS NULL;
```

---

## Тестування

### 1. Перевірка через API

```bash
# Get all projects
curl -H "Authorization: Bearer $TOKEN" \
  https://your-project-service.vercel.app/api/projects

# Get projects for team 1
curl -H "Authorization: Bearer $TOKEN" \
  https://your-project-service.vercel.app/api/projects?teamId=1
```

### 2. Перевірка через Dashboard

1. Відкрити https://flow-managment.vercel.app/
2. Залогінитись
3. Вибрати команду з dropdown
4. Перевірити що показуються тільки проекти цієї команди
5. Вибрати "All Teams"
6. Перевірити що показуються всі проекти

---

## Наступні кроки (опціонально)

### Task Service - JOIN з projects

Для кращої продуктивності можна додати фільтрування тасків по teamId через JOIN:

**Файл**: `/services/task-service/src/services/task.service.ts`

```typescript
async getTasksByTeam(userId: number, teamId: number): Promise<Task[]> {
  const tasks = await db()
    .select({
      task: tasks,
    })
    .from(tasks)
    .innerJoin(projects, eq(tasks.projectId, projects.id))
    .where(and(
      eq(tasks.userId, userId),
      eq(projects.teamId, teamId),
      isNull(tasks.deletedAt)
    ))
    .orderBy(desc(tasks.createdAt));

  return tasks.map(row => this.mapToTask(row.task));
}
```

---

## Troubleshooting

### Проблема: Timeout при запиті з team_id

**Причина**: Міграція не застосована, поле team_id не існує

**Рішення**:
```bash
psql $DATABASE_URL < services/project-service/migrations/add_team_id_to_projects.sql
```

### Проблема: Порожні результати

**Причина**: Проекти не мають team_id

**Рішення**: Оновити існуючі проекти (див. вище)

### Проблема: 401 Unauthorized

**Причина**: Токен не передається

**Рішення**: Перевірити логи (debug logging вже додано)

---

## Файли змінені

### Project Service
- ✅ `/services/project-service/src/db/schema.ts` - додано team_id
- ✅ `/services/project-service/src/services/project.service.ts` - додано getProjectsByTeam
- ✅ `/services/project-service/src/controllers/project.controller.ts` - додано обробку teamId
- ✅ `/services/project-service/migrations/add_team_id_to_projects.sql` - міграція

### Dashboard
- ✅ `/dashboard/lib/project-service.ts` - вже підтримує team_id
- ✅ `/dashboard/app/api/projects/route.ts` - вже підтримує team_id

---

**Дата**: 7 грудня 2025  
**Статус**: ✅ Код готовий, потрібно застосувати міграцію БД  
**Критично**: Застосуйте міграцію перед deployment!
