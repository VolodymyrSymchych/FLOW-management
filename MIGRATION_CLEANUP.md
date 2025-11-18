# План очищення дублювання коду після міграції на мікросервіси

## Поточний стан дублювання

### ✅ User Service (новий мікросервіс)
- `services/user-service/src/services/user.service.ts` - getUser, updateUser, searchUsers
- `services/user-service/src/services/friends.service.ts` - getFriends, sendRequest, acceptRequest, rejectRequest

### ⚠️ Dashboard API Routes (з fallback)
- `dashboard/app/api/users/[id]/route.ts` - викликає user-service + fallback на `storage.getUser`
- `dashboard/app/api/users/search/route.ts` - викликає user-service + fallback на DB query
- `dashboard/app/api/friends/route.ts` - викликає user-service + fallback на `storage.getFriends`
- `dashboard/app/api/friends/[id]/accept/route.ts` - потрібно оновити
- `dashboard/app/api/friends/[id]/reject/route.ts` - потрібно оновити

### 📦 Storage Layer (старий код)
- `server/storage.ts` - `getUser`, `getUserByEmail`, `getFriends`, `sendFriendRequest` - **використовується в інших місцях** (teams, projects, chat, invoices)

## План очищення

### Фаза 1: Оновити всі user-related routes (без fallback)
1. ✅ `/api/users/[id]` - видалити fallback
2. ✅ `/api/users/search` - видалити fallback
3. ✅ `/api/friends` - видалити fallback
4. ⏳ `/api/friends/[id]/accept` - додати виклик user-service
5. ⏳ `/api/friends/[id]/reject` - додати виклик user-service

### Фаза 2: Створити helper для отримання користувачів
Створити `dashboard/lib/user-helper.ts` для використання user-service в інших сервісах (teams, projects, chat).

### Фаза 3: Видалити user-related методи з storage (опціонально)
Після того, як всі місця використовують user-service, можна видалити:
- `storage.getUser()` - **НЕ видаляти**, використовується в teams, projects, chat
- `storage.getUserByEmail()` - можна видалити після міграції
- `storage.getUserByUsername()` - можна видалити після міграції
- `storage.getFriends()` - можна видалити після міграції
- `storage.sendFriendRequest()` - можна видалити після міграції

## Важливо!

**НЕ видаляти `storage.getUser()`** - він використовується в:
- `/api/teams` - для отримання інформації про учасників
- `/api/projects` - для отримання інформації про власників
- `/api/chat` - для отримання інформації про учасників чату
- `/api/invoices` - для отримання інформації про користувачів
- `/api/comments` - для отримання інформації про авторів

Ці місця використовують `getUser` для отримання даних користувача в контексті своїх сутностей - це нормально.

## Рекомендація

**Залишити fallback на 1-2 тижні** після запуску user-service для:
1. Тестування стабільності
2. Моніторингу помилок
3. Плавного переходу

Після цього можна видалити fallback код.

