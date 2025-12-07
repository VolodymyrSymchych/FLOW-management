# Виправлення фільтрування по командах - 7 грудня 2025

## Проблема

Після додавання 404 handlers до мікросервісів, виникли наступні проблеми:
1. ❌ Team service повертає 401 Unauthorized
2. ❌ Фільтрування тасків по команді (team) не працює в Kanban Board
3. ❌ Таски не відображаються при виборі конкретної команди

## Виправлення

### 1. Додано підтримку фільтрування по team_id в Tasks API ✅

**Файл**: `/dashboard/app/api/tasks/route.ts`

**Зміни**:
- Додано обробку параметра `team_id` з query string
- Додано виклик `taskService.getTasksByTeam(teamId)` для фільтрування по команді
- Додано логування для debug

**Код**:
```typescript
const searchParams = request.nextUrl.searchParams;
const projectId = searchParams.get('project_id');
const teamId = searchParams.get('team_id');

let result;
if (projectId) {
  result = await taskService.getTasks(parseInt(projectId));
} else if (teamId && teamId !== 'all') {
  result = await taskService.getTasksByTeam(parseInt(teamId));
} else {
  result = await taskService.getTasks();
}
```

---

### 2. Додано метод getTasksByTeam в Task Service Client ✅

**Файл**: `/dashboard/lib/task-service.ts`

**Зміни**:
- Додано новий метод `getTasksByTeam(teamId: number)`
- Метод передає `teamId` як query параметр до task-service мікросервісу

**Код**:
```typescript
async getTasksByTeam(teamId: number): Promise<{ tasks?: any[]; total?: number; error?: string }> {
  try {
    const headers = await this.getHeaders();
    const params = { teamId: teamId.toString() };
    const response = await this.client.get(`/api/tasks`, { headers, params });
    return { tasks: response.data.tasks, total: response.data.total };
  } catch (error: any) {
    return {
      error: error.response?.data?.error || error.message || 'Failed to get tasks by team',
    };
  }
}
```

---

### 3. Додано debug логування для діагностики 401 помилок 🔍

**Файли**:
- `/services/team-service/src/middleware/auth.ts`
- `/dashboard/lib/team-service.ts`

**Зміни**:
- Додано детальне логування в auth middleware team-service
- Додано логування в team-service client для відстеження передачі токенів
- Логи показують:
  - Чи присутній Authorization header
  - Всі headers запиту
  - Довжину токена
  - Результат верифікації токена

---

## Як працює фільтрування

### Frontend (KanbanBoard.tsx)

1. Користувач вибирає команду через TeamContext
2. `selectedTeam` змінюється
3. `useEffect` викликає `loadTasks()` і `loadProjects()`
4. Формується URL з параметром `team_id`:
   ```typescript
   const url = teamId !== 'all'
     ? `/api/tasks?team_id=${teamId}`
     : '/api/tasks';
   ```

### Backend (Dashboard API Routes)

1. `/api/tasks` отримує запит з `team_id`
2. Викликає `taskService.getTasksByTeam(teamId)`
3. Task service client робить запит до task-service мікросервісу з параметром `teamId`

### Microservice (Task Service)

1. Отримує запит з параметром `teamId`
2. Фільтрує таски по команді в базі даних
3. Повертає відфільтровані таски

---

## Діагностика 401 помилок

Для діагностики проблем з автентифікацією:

1. **Перевірте логи dashboard**:
   ```bash
   # Шукайте рядки з [Team Service Client]
   [Team Service Client] Calling /api/teams
   [Team Service Client] Headers: { "Authorization": "Bearer ..." }
   ```

2. **Перевірте логи team-service**:
   ```bash
   # Шукайте рядки з [Auth Middleware]
   [Auth Middleware] Request to: /api/teams
   [Auth Middleware] Authorization header: Present/Missing
   [Auth Middleware] Token verified successfully for user: 123
   ```

3. **Перевірте environment variables**:
   - `JWT_SECRET` - має бути однаковим у dashboard і всіх сервісах
   - `JWT_ISSUER` - має бути однаковим (за замовчуванням: 'project-scope-analyzer')
   - `TEAM_SERVICE_API_KEY` - для service-to-service автентифікації

---

## Тестування

### 1. Перевірка фільтрування по команді

```bash
# В браузері:
1. Відкрийте Kanban Board
2. Виберіть конкретну команду з dropdown
3. Перевірте, що відображаються тільки таски цієї команди
4. Виберіть "All Teams"
5. Перевірте, що відображаються всі таски
```

### 2. Перевірка API endpoints

```bash
# Тести з curl (замініть TOKEN на ваш JWT токен):

# Всі таски
curl -H "Authorization: Bearer TOKEN" \
  https://your-dashboard.vercel.app/api/tasks

# Таски конкретної команди
curl -H "Authorization: Bearer TOKEN" \
  https://your-dashboard.vercel.app/api/tasks?team_id=1

# Всі команди
curl -H "Authorization: Bearer TOKEN" \
  https://your-dashboard.vercel.app/api/teams
```

---

## Файли змінені

### Dashboard
- ✅ `/dashboard/app/api/tasks/route.ts` - додано підтримку team_id
- ✅ `/dashboard/lib/task-service.ts` - додано getTasksByTeam()
- ✅ `/dashboard/lib/team-service.ts` - додано debug логування

### Services
- ✅ `/services/team-service/src/middleware/auth.ts` - додано debug логування

---

## Наступні кроки

### Якщо фільтрування працює ✅
1. Видалити debug логування з production коду
2. Перевірити, що всі інші компоненти (CalendarView, UpcomingTasks) також працюють з фільтруванням

### Якщо 401 помилки продовжуються ❌
1. Перевірити логи з debug інформацією
2. Перевірити, що JWT_SECRET однаковий у всіх сервісах
3. Перевірити, що токен правильно передається з dashboard до мікросервісів
4. Можливо, потрібно налаштувати Service API Keys для service-to-service комунікації

---

**Дата**: 7 грудня 2025  
**Статус**: ✅ Фільтрування по team_id додано  
**Статус**: 🔍 401 помилки під діагностикою
