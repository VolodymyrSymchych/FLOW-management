# 🏗️ ПОВНИЙ АУДИТ АРХІТЕКТУРИ ДОДАТКУ
## Project Scope Analyzer - Детальний Технічний Звіт

**Дата аудиту:** 06 грудня 2025
**Версія:** 1.0.0
**Тип архітектури:** Мікросервісна (Microservices Architecture)

---

## 📋 ЗМІСТ

1. [Загальний огляд](#загальний-огляд)
2. [Мікросервіси](#мікросервіси)
3. [Dashboard (Frontend + BFF)](#dashboard-frontend--bff)
4. [База даних](#база-даних)
5. [Зовнішні інтеграції](#зовнішні-інтеграції)
6. [Інфраструктура](#інфраструктура)
7. [Потоки даних](#потоки-даних)
8. [Проблеми та рекомендації](#проблеми-та-рекомендації)

---

## 🎯 ЗАГАЛЬНИЙ ОГЛЯД

### Архітектура системи

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Next.js 14 Dashboard (Port 3001)                   │   │
│  │  - React 18 + TypeScript                            │   │
│  │  - Tailwind CSS + shadcn/ui                         │   │
│  │  - TanStack Query (React Query)                     │   │
│  │  - Pusher (Real-time WebSocket)                     │   │
│  │  - Internationalization (next-intl)                 │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      BFF LAYER (API Routes)                  │
│  /api/auth/* → auth-service                                 │
│  /api/projects/* → project-service                          │
│  /api/tasks/* → task-service                                │
│  /api/teams/* → team-service                                │
│  /api/chat/* → chat-service                                 │
│  /api/invoices/* → invoice-service                          │
│  /api/files/* → file-service                                │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    MICROSERVICES LAYER                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ auth-service │  │ user-service │  │project-service│    │
│  │   Port 3000  │  │   Port 3003  │  │   Port 3004   │    │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ task-service │  │ team-service │  │ chat-service  │    │
│  │   Port 3005  │  │   Port 3006  │  │   Port 3007   │    │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌───────────────┐ ┌──────────────┐  ┌──────────────┐     │
│  │notification-  │ │invoice-service│ │ file-service  │    │
│  │   service     │ │   Port 3009  │  │   Port 3010   │    │
│  │   Port 3008   │ └──────────────┘  └──────────────┘     │
│  └───────────────┘                                          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      DATA & INTEGRATION LAYER                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  PostgreSQL  │  │  Redis/      │  │  Event Bus   │     │
│  │   (Neon)     │  │  Upstash     │  │  (Redis)     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Cloudflare  │  │   Pusher     │  │   Stripe     │     │
│  │     R2       │  │ (WebSocket)  │  │  (Payments)  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Технологічний стек

| Категорія | Технології |
|-----------|------------|
| **Frontend** | Next.js 14, React 18, TypeScript, Tailwind CSS |
| **Backend** | Express.js, Node.js, TypeScript |
| **Database** | PostgreSQL (Neon), Drizzle ORM |
| **Caching** | Redis (Upstash) |
| **Authentication** | JWT (jose), OAuth (Google, Microsoft) |
| **Real-time** | Pusher, WebSockets |
| **File Storage** | Cloudflare R2 (S3-compatible) |
| **Payments** | Stripe |
| **Email** | Resend API |
| **Deployment** | Vercel (Frontend), Custom (Services) |

---

## 🔧 МІКРОСЕРВІСИ

### 1. AUTH-SERVICE 🔐

**Порт:** 3000
**Відповідальність:** Автентифікація та авторизація користувачів

#### Endpoints:
```typescript
// Authentication
POST   /api/auth/signup              // Реєстрація (rate limit: 3/год)
POST   /api/auth/login               // Вхід (rate limit: 5/15хв)
POST   /api/auth/logout              // Вихід
POST   /api/auth/verify-email        // Верифікація email
POST   /api/auth/resend-verification // Повторна верифікація
POST   /api/auth/forgot-password     // Запит скидання пароля
POST   /api/auth/reset-password      // Скидання пароля

// OAuth
POST   /api/auth/google              // Google OAuth
POST   /api/auth/microsoft           // Microsoft OAuth

// User info
GET    /api/auth/me                  // Поточний користувач
PATCH  /api/auth/locale              // Оновлення мови

// Monitoring
GET    /api/health                   // Health check
GET    /api/metrics                  // Prometheus metrics
```

#### Залежності:
- **External:**
  - PostgreSQL (Neon) - користувачі, сесії
  - Redis (Upstash) - rate limiting, кешування
  - Event Bus - публікація подій верифікації
  - Google OAuth API
  - Microsoft OAuth API

- **Publishes Events:**
  - `user.verification_requested` → notification-service
  - `user.verification_resend` → notification-service
  - `user.password_reset_requested` → notification-service

#### База даних:
- `users` - основна таблиця користувачів
- `email_verifications` - токени верифікації email

#### Технології:
```json
{
  "bcryptjs": "пароле хешування",
  "jose": "JWT токени",
  "ioredis": "Redis клієнт",
  "express-rate-limit": "Rate limiting"
}
```

---

### 2. USER-SERVICE 👥

**Порт:** 3003
**Відповідальність:** Управління профілями користувачів та соціальними зв'язками

#### Endpoints:
```typescript
// User Management
GET    /api/users/me                     // Власний профіль
GET    /api/users/search?q=              // Пошук користувачів
GET    /api/users/:id                    // Користувач за ID
PUT    /api/users/:id/profile            // Оновлення профілю

// Friends Management
GET    /api/friends                      // Список друзів + запити
POST   /api/friends/requests             // Надіслати запит
POST   /api/friends/requests/:id/accept  // Прийняти запит
POST   /api/friends/requests/:id/reject  // Відхилити запит
DELETE /api/friends/:id                  // Видалити з друзів

// Monitoring
GET    /api/health
GET    /api/metrics
```

#### Залежності:
- **External:**
  - PostgreSQL - `users` (READ-ONLY), `friendships`
  - Redis - кешування профілів
  - Event Bus - підписка на події користувачів

#### База даних:
- `users` (READ-ONLY) - читання даних користувачів
- `friendships` - дружні зв'язки
  - `status`: pending | accepted | rejected | blocked

---

### 3. PROJECT-SERVICE 📁

**Порт:** 3004
**Відповідальність:** Управління проектами та шаблонами

#### Endpoints:
```typescript
// Projects CRUD
GET    /api/projects                    // Список проектів
POST   /api/projects                    // Створення проекту
GET    /api/projects/:id                // Проект за ID
PUT    /api/projects/:id                // Оновлення проекту
DELETE /api/projects/:id                // Видалення проекту

// Statistics
GET    /api/projects/stats              // Загальна статистика
GET    /api/projects/:id/stats          // Статистика проекту

// Templates
GET    /api/projects/templates          // Список шаблонів
GET    /api/projects/templates/:id      // Шаблон за ID
POST   /api/projects/from-template      // Створення з шаблону

// Monitoring
GET    /api/health
GET    /api/metrics
```

#### Залежності:
- **External:**
  - PostgreSQL - `projects`, `project_templates`
  - Redis - кешування проектів
  - Event Bus - публікація подій проектів

- **Used by:**
  - task-service, team-service, invoice-service, chat-service, file-service

#### База даних:
- `projects` - проекти
  - type, industry, teamSize, timeline, budget
  - startDate, endDate, score, riskLevel, status
  - document, analysisData, translations
- `project_templates` - шаблони проектів
  - category, templateData, isPublic, usageCount

---

### 4. TASK-SERVICE ✅

**Порт:** 3005
**Відповідальність:** Управління задачами, підзадачами та залежностями

#### Endpoints:
```typescript
// Tasks CRUD
GET    /api/tasks                       // Список задач
POST   /api/tasks                       // Створення задачі
GET    /api/tasks/:id                   // Задача за ID
PUT    /api/tasks/:id                   // Оновлення задачі
DELETE /api/tasks/:id                   // Видалення задачі

// Subtasks
GET    /api/tasks/:id/subtasks          // Підзадачі
POST   /api/tasks/:id/subtasks          // Створення підзадачі

// Dependencies & Gantt
GET    /api/tasks/:id/dependencies      // Залежності задачі
GET    /api/tasks/gantt                 // Дані для Gantt діаграми

// Monitoring
GET    /api/health
GET    /api/metrics
```

#### Залежності:
- **Internal Services:**
  - project-service (читання проектів)
  - user-service (читання користувачів)

- **External:**
  - PostgreSQL - `tasks`
  - Redis - кешування задач
  - Event Bus - публікація подій задач

#### База даних:
- `tasks` - задачі
  - title, description, assignee
  - startDate, dueDate, endDate
  - status: todo | in_progress | done | blocked
  - priority: low | medium | high | urgent
  - dependsOn (JSON array), progress (0-100%)
  - parentId (для підзадач)

---

### 5. TEAM-SERVICE 👨‍👩‍👧‍👦

**Порт:** 3006
**Відповідальність:** Управління командами та членством

#### Endpoints:
```typescript
// Teams CRUD
GET    /api/teams                       // Список команд
POST   /api/teams                       // Створення команди
GET    /api/teams/:id                   // Команда за ID
PUT    /api/teams/:id                   // Оновлення команди
DELETE /api/teams/:id                   // Видалення команди

// Members Management
GET    /api/teams/:id/members           // Члени команди
POST   /api/teams/:id/members           // Додавання члена
DELETE /api/teams/:id/members/:userId   // Видалення члена
PUT    /api/teams/:id/members/:userId/role  // Оновлення ролі

// Monitoring
GET    /api/health
GET    /api/metrics                     // Port 9093
```

#### Залежності:
- **Internal Services:**
  - user-service (валідація користувачів)
  - project-service (зв'язок з проектами)

- **External:**
  - PostgreSQL - `teams`, `team_members`, `team_projects`
  - Redis - кешування команд

#### База даних:
- `teams` - команди (name, description, ownerId)
- `team_members` - члени команди
  - role: owner | admin | member
- `team_projects` - зв'язок команд з проектами

---

### 6. CHAT-SERVICE 💬

**Порт:** 3007
**Відповідальність:** Real-time чати та повідомлення

#### Endpoints:
```typescript
// Chats
GET    /api/chats/my                    // Чати користувача
GET    /api/chats/project/:projectId    // Чати проекту
GET    /api/chats/team/:teamId          // Чати команди
POST   /api/chats/direct                // Знайти/створити приватний чат
POST   /api/chats                       // Створити чат
GET    /api/chats/:id                   // Отримати чат
PUT    /api/chats/:id                   // Оновити чат
DELETE /api/chats/:id                   // Видалити чат

// Chat Members
GET    /api/chats/:id/members           // Члени чату
POST   /api/chats/:id/members           // Додати члена
DELETE /api/chats/:id/members/:userId   // Видалити члена

// Messages
POST   /api/messages                    // Відправити повідомлення
GET    /api/messages/chat/:chatId       // Повідомлення чату
GET    /api/messages/chat/:chatId/unread  // Непрочитані
PUT    /api/messages/chat/:chatId/read  // Позначити прочитаним
GET    /api/messages/:id                // Отримати повідомлення
PUT    /api/messages/:id                // Редагувати повідомлення
DELETE /api/messages/:id                // Видалити повідомлення

// Reactions
GET    /api/messages/:id/reactions      // Реакції на повідомлення
POST   /api/messages/:id/reactions      // Додати реакцію
DELETE /api/messages/:id/reactions/:emoji  // Видалити реакцію

// Integrations
POST   /api/messages/:id/create-task    // Створити задачу з повідомлення
GET    /api/messages/mentions/me        // Згадування користувача

// Real-time
POST   /api/pusher/auth                 // Авторизація Pusher каналів
POST   /api/beams/auth                  // Авторизація Pusher Beams
```

#### Залежності:
- **Internal Services:**
  - project-service, team-service, user-service
  - task-service (створення задач з повідомлень)

- **External:**
  - PostgreSQL - `chats`, `chat_members`, `chat_messages`
  - **Pusher** - real-time WebSocket з'єднання
    - appId, key, secret, cluster
  - **Pusher Beams** - push нотифікації
    - instanceId, secretKey

#### База даних:
- `chats` - чати
  - type: direct | group | project | team
  - projectId, teamId, createdBy
- `chat_members` - учасники (role, lastReadAt)
- `chat_messages` - повідомлення
  - messageType, replyToId, metadata
  - readBy (array), editedAt
- `message_reactions` - реакції (emoji)
- `chat_message_attachments` - вкладення файлів

---

### 7. NOTIFICATION-SERVICE 🔔

**Порт:** 3008 ⚠️ (було 3005 - конфлікт з task-service)
**Відповідальність:** Нотифікації та email розсилка

#### Endpoints:
```typescript
// Notifications
GET    /api/notifications               // Всі нотифікації
GET    /api/notifications/unread        // Непрочитані
GET    /api/notifications/unread/count  // Кількість непрочитаних
POST   /api/notifications               // Створити нотифікацію
GET    /api/notifications/:id           // Отримати нотифікацію
PUT    /api/notifications/:id/read      // Позначити прочитаною
PUT    /api/notifications/mark-all-read // Позначити всі прочитаними
DELETE /api/notifications/:id           // Видалити нотифікацію
DELETE /api/notifications/read          // Видалити прочитані

// Preferences
GET    /api/preferences                 // Налаштування нотифікацій
PUT    /api/preferences                 // Оновити налаштування

// Monitoring
GET    /api/health
GET    /api/metrics                     // Port 9095
```

#### Залежності:
- **Event Consumer** (Підписується на події):
  - `user.verification_requested` → відправляє email верифікації
  - `user.verification_resend` → повторна верифікація
  - `user.password_reset_requested` → email скидання пароля

- **External:**
  - PostgreSQL - `notifications`, `notification_preferences`
  - Redis - Event Bus, кешування
  - **Resend API** - відправка email

#### База даних:
- `notifications` - нотифікації
  - type, title, content, read
  - actionUrl, metadata
- `notification_preferences` - налаштування
  - emailEnabled, pushEnabled, inAppEnabled
  - taskNotifications, projectNotifications, etc.

---

### 8. INVOICE-SERVICE 💰

**Порт:** 3009 ⚠️ (було 3006 - конфлікт з team-service)
**Відповідальність:** Рахунки, платежі, Stripe інтеграція

#### Endpoints:
```typescript
// Invoices CRUD
POST   /api/invoices                    // Створити рахунок
GET    /api/invoices/overdue            // Прострочені рахунки
GET    /api/invoices/project/:projectId // Рахунки проекту
GET    /api/invoices/project/:projectId/stats  // Статистика
GET    /api/invoices/:id                // Рахунок за ID
GET    /api/invoices/number/:invoiceNumber  // За номером
PUT    /api/invoices/:id                // Оновити рахунок
DELETE /api/invoices/:id                // Видалити рахунок

// Invoice Actions
PUT    /api/invoices/:id/sent           // Позначити як відправлений
PUT    /api/invoices/:id/paid           // Позначити як оплачений
PUT    /api/invoices/:id/cancel         // Скасувати рахунок
POST   /api/invoices/:id/share          // Згенерувати публічне посилання

// Public Access (без авторизації)
GET    /api/invoices/public/:token      // Публічний доступ до рахунку

// Payments
POST   /api/invoices/:id/payments       // Зареєструвати платіж
GET    /api/invoices/:id/payments       // Платежі рахунку

// Monitoring
GET    /api/health
GET    /api/metrics                     // Port 9096
```

#### Залежності:
- **Internal Services:**
  - project-service (рахунки прив'язані до проектів)

- **External:**
  - PostgreSQL - `invoices`, `invoice_payments`, `invoice_comments`
  - **Stripe** - обробка платежів
    - secretKey, publishableKey, webhookSecret

#### База даних:
- `invoices` - рахунки
  - invoiceNumber, clientName, clientEmail
  - amount, currency, taxRate, status
  - issueDate, dueDate, paidDate
  - items (JSON), notes, publicToken
- `recurring_invoices` - регулярні рахунки
  - frequency, nextGenerationDate, autoSendEmail
- `invoice_comments` - коментарі
- `invoice_payments` - платежі (Stripe integration)

---

### 9. FILE-SERVICE 📎

**Порт:** 3010 ⚠️ (було 3007 - конфлікт з chat-service)
**Відповідальність:** Управління файлами з Cloudflare R2

#### Endpoints:
```typescript
// File Management
POST   /api/files                       // Завантажити файл (multipart)
GET    /api/files?projectId=&taskId=    // Список файлів
GET    /api/files/:id                   // Метадані файлу
GET    /api/files/:id/download          // Завантажити файл
DELETE /api/files/:id                   // Видалити файл

// Versioning
POST   /api/files/:id/version           // Створити нову версію
GET    /api/files/:id/versions          // Версії файлу

// Metadata
PUT    /api/files/:id                   // Оновити метадані

// Monitoring
GET    /api/health
GET    /api/metrics
```

#### Залежності:
- **Used by:**
  - task-service, chat-service (файлові вкладення)

- **External:**
  - PostgreSQL - `file_attachments`
  - **Cloudflare R2** (S3-compatible storage)
    - AWS_ACCESS_KEY_ID
    - AWS_SECRET_ACCESS_KEY
    - AWS_ENDPOINT
    - AWS_BUCKET_NAME
    - R2_PUBLIC_URL
  - **Multer** - обробка multipart/form-data

#### База даних:
- `file_attachments` - файли
  - projectId, taskId (опційно)
  - fileName, fileType, fileSize
  - r2Key (S3 object key)
  - uploadedBy, version
  - parentFileId (для версіонування)

---

## 🌐 DASHBOARD (Frontend + BFF)

### Технічний стек:

```json
{
  "framework": "Next.js 14",
  "runtime": "React 18",
  "language": "TypeScript",
  "styling": "Tailwind CSS + shadcn/ui",
  "state": "TanStack Query (React Query)",
  "forms": "React Hook Form + Zod",
  "i18n": "next-intl",
  "realtime": "Pusher",
  "analytics": "Vercel Analytics + Speed Insights"
}
```

### Port: 3001

### Основні сторінки:

```
/                         - Landing page
/[locale]/login           - Вхід
/[locale]/sign-up         - Реєстрація
/[locale]/forgot-password - Відновлення пароля
/[locale]/reset-password  - Скидання пароля
/[locale]/verify-email    - Верифікація email

/[locale]/dashboard/
  ├─ page                 - Головна панель
  ├─ projects/            - Проекти
  │  ├─ [id]/             - Деталі проекту
  │  └─ new/              - Новий проект
  ├─ tasks/               - Задачі
  ├─ team/                - Команди
  ├─ chat/                - Чати
  ├─ messages/            - Повідомлення
  ├─ invoices/            - Рахунки
  │  ├─ [id]/             - Деталі рахунку
  │  └─ public/[token]/   - Публічний рахунок
  ├─ friends/             - Друзі
  ├─ settings/            - Налаштування
  ├─ billing/             - Оплата
  └─ performance/         - Аналітика
```

### API Routes (BFF Layer):

```typescript
// Auth
/api/auth/login           → auth-service
/api/auth/signup          → auth-service
/api/auth/logout          → auth-service
/api/auth/me              → auth-service

// Projects
/api/projects             → project-service
/api/projects/[id]        → project-service

// Tasks
/api/tasks                → task-service
/api/tasks/[id]           → task-service

// Teams
/api/teams                → team-service
/api/teams/[id]/members   → team-service

// Chat
/api/chat                 → chat-service
/api/chat/[chatId]        → chat-service

// Invoices
/api/invoices             → invoice-service
/api/invoices/[id]        → invoice-service

// Files
/api/files                → file-service
/api/files/[id]           → file-service

// Pusher
/api/pusher/auth          → chat-service (proxy)
```

### Ключові бібліотеки:

| Бібліотека | Призначення |
|------------|-------------|
| `@tanstack/react-query` | Server state management |
| `axios` | HTTP клієнт для API |
| `pusher-js` | Real-time WebSocket |
| `@stripe/stripe-js` | Stripe payments |
| `jose` | JWT handling |
| `bcryptjs` | Password hashing (SSR) |
| `zod` | Schema validation |
| `@radix-ui/*` | UI components primitives |
| `framer-motion` | Animations |
| `recharts` | Charts & graphs |
| `@dnd-kit/*` | Drag and drop |
| `tiptap` | Rich text editor |

---

## 🗄️ БАЗА ДАНИХ

### PostgreSQL (Neon) - Спільна БД

**ORM:** Drizzle ORM
**Схема:** `shared/schema.ts`

### Таблиці (30 таблиць):

#### 👤 Користувачі та автентифікація:
```sql
users                     -- Користувачі
  ├─ id, email, username, password
  ├─ fullName, avatarUrl
  ├─ provider, providerId (OAuth)
  ├─ emailVerified, isActive, role
  └─ preferredLocale, createdAt, updatedAt

email_verifications       -- Верифікація email
  ├─ userId, email, token
  └─ expiresAt, verified, createdAt

friendships               -- Соціальні зв'язки
  ├─ senderId, receiverId
  └─ status (pending/accepted/rejected/blocked)
```

#### 📁 Проекти та задачі:
```sql
projects                  -- Проекти
  ├─ userId, name, type, industry
  ├─ teamSize, timeline, budget
  ├─ startDate, endDate
  ├─ score, riskLevel, status
  ├─ document, analysisData
  └─ translations (JSONB)

tasks                     -- Задачі
  ├─ projectId, userId, parentId
  ├─ title, description, assignee
  ├─ startDate, dueDate, endDate
  ├─ status, priority
  ├─ dependsOn (JSON), progress (0-100)
  └─ createdAt, updatedAt, deletedAt

project_templates         -- Шаблони проектів
  ├─ name, description, category
  ├─ templateData (JSON)
  └─ isPublic, createdBy, usageCount
```

#### 👥 Команди:
```sql
teams                     -- Команди
  ├─ name, description, ownerId
  └─ translations (JSONB)

team_members              -- Члени команди
  ├─ teamId, userId
  └─ role (owner/admin/member)

team_projects             -- Зв'язок команд з проектами
  └─ teamId, projectId
```

#### 💰 Фінанси:
```sql
invoices                  -- Рахунки
  ├─ projectId, invoiceNumber
  ├─ clientName, clientEmail, clientAddress
  ├─ amount, currency, taxRate, totalAmount
  ├─ status, issueDate, dueDate, paidDate
  ├─ items (JSON), notes
  └─ publicToken, tokenExpiresAt

recurring_invoices        -- Регулярні рахунки
  ├─ projectId, baseInvoiceId
  ├─ frequency, nextGenerationDate
  └─ isActive, endDate, autoSendEmail

invoice_payments          -- Платежі (Stripe)
  ├─ invoiceId, stripePaymentIntentId
  └─ amount, status, paidAt

invoice_comments          -- Коментарі до рахунків
  ├─ invoiceId, authorName, authorEmail
  └─ comment, isInternal

expenses                  -- Витрати
  ├─ projectId, userId, category
  ├─ amount, currency, expenseDate
  └─ receiptUrl, notes

payments                  -- Загальні платежі
  ├─ userId, amount, currency
  └─ status, stripePaymentId
```

#### 💬 Чати та повідомлення:
```sql
chats                     -- Чати
  ├─ name, type (direct/group/project/team)
  ├─ projectId, teamId, createdBy
  └─ createdAt, updatedAt

chat_members              -- Учасники чату
  ├─ chatId, userId, role
  └─ lastReadAt, joinedAt

chat_messages             -- Повідомлення
  ├─ chatId, senderId
  ├─ content, messageType
  ├─ replyToId, metadata (JSONB)
  ├─ readBy (TEXT[]), editedAt
  └─ createdAt, deletedAt

message_reactions         -- Реакції на повідомлення
  └─ messageId, userId, emoji

chat_message_attachments  -- Вкладення
  ├─ messageId, fileId
  └─ fileName, fileType, fileSize, fileUrl
```

#### 📎 Файли:
```sql
file_attachments          -- Файлові вкладення
  ├─ projectId, taskId
  ├─ fileName, fileType, fileSize
  ├─ r2Key (S3 key)
  ├─ uploadedBy, version
  ├─ parentFileId (для версій)
  └─ createdAt, updatedAt, deletedAt
```

#### 🔔 Нотифікації:
```sql
notifications             -- Нотифікації
  ├─ userId, type, title, content
  ├─ read, actionUrl
  ├─ metadata (JSONB)
  └─ createdAt

notification_preferences  -- Налаштування нотифікацій
  ├─ userId
  ├─ emailEnabled, pushEnabled, inAppEnabled
  └─ taskNotifications, projectNotifications, etc.
```

#### ⏱️ Час та звіти:
```sql
time_entries              -- Облік робочого часу
  ├─ userId, taskId, projectId
  ├─ clockIn, clockOut, duration
  └─ notes, createdAt

reports                   -- Звіти
  ├─ projectId, userId
  ├─ title, content (HTML)
  ├─ type, status
  └─ createdAt, updatedAt

comments                  -- Коментарі (універсальні)
  ├─ projectId, taskId, userId
  └─ content, createdAt
```

#### 📊 Attendance (розклад):
```sql
attendance                -- Відвідуваність
  ├─ userId, date, status
  └─ clockIn, clockOut, notes
```

### Індекси та оптимізації:

```sql
-- Performance indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_projects_user_id ON projects(userId);
CREATE INDEX idx_tasks_project_id ON tasks(projectId);
CREATE INDEX idx_chat_messages_chat_id ON chat_messages(chatId);
CREATE INDEX idx_notifications_user_id ON notifications(userId);

-- Unique constraints
UNIQUE(email) ON users
UNIQUE(username) ON users
UNIQUE(teamId, userId) ON team_members
UNIQUE(senderId, receiverId) ON friendships
```

---

## 🔌 ЗОВНІШНІ ІНТЕГРАЦІЇ

### 1. Cloudflare R2 (S3-Compatible Storage)

**Використовується:** file-service
**Призначення:** Зберігання файлів, зображень, документів

```typescript
// Конфігурація
{
  AWS_ACCESS_KEY_ID: string,
  AWS_SECRET_ACCESS_KEY: string,
  AWS_ENDPOINT: string,           // Cloudflare R2 endpoint
  AWS_BUCKET_NAME: string,
  R2_PUBLIC_URL: string
}
```

**Файлова структура:**
```
bucket/
  ├─ projects/{projectId}/
  │  └─ {filename}
  └─ tasks/{taskId}/
     └─ {filename}
```

### 2. Pusher (Real-time WebSocket)

**Використовується:** chat-service, dashboard
**Призначення:** Real-time повідомлення та присутність

```typescript
// Конфігурація
{
  appId: string,
  key: string,
  secret: string,
  cluster: string
}

// Канали
private-chat-{chatId}         // Приватні чати
presence-chat-{chatId}        // Присутність у чаті
private-user-{userId}         // Особисті події користувача
```

### 3. Pusher Beams (Push Notifications)

**Використовується:** chat-service
**Призначення:** Мобільні push нотифікації

```typescript
{
  instanceId: string,
  secretKey: string
}
```

### 4. Stripe (Payments)

**Використовується:** invoice-service, dashboard
**Призначення:** Обробка платежів

```typescript
// Конфігурація
{
  secretKey: string,
  publishableKey: string,
  webhookSecret: string
}

// Features
- Payment Intents
- Subscriptions (майбутнє)
- Webhooks для event handling
```

### 5. Google OAuth

**Використовується:** auth-service
**Призначення:** Автентифікація через Google

```typescript
{
  clientId: string,
  clientSecret: string,
  callbackURL: string
}
```

### 6. Microsoft OAuth

**Використовується:** auth-service
**Призначення:** Автентифікація через Microsoft

```typescript
{
  clientId: string,
  clientSecret: string,
  callbackURL: string
}
```

### 7. Resend API (Email Service)

**Використовується:** notification-service
**Призначення:** Транзакційні email (верифікація, скидання пароля)

```typescript
{
  apiKey: string,
  fromEmail: string
}

// Email templates
- Verification email
- Password reset
- Invoice notifications
```

### 8. Redis/Upstash Redis

**Використовується:** Всі сервіси
**Призначення:** Кешування, rate limiting, Event Bus

```typescript
// Конфігурація
{
  url: string,
  token: string
}

// Use cases
- Session management
- Rate limiting
- Cache invalidation
- Event pub/sub
- Queue management
```

### 9. PostgreSQL (Neon)

**Використовується:** Всі сервіси
**Призначення:** Основна база даних

```typescript
{
  connectionString: string,
  poolSize: 10,
  ssl: true
}
```

---

## 🏗️ ІНФРАСТРУКТУРА

### Deployment:

```yaml
Dashboard (Frontend):
  Platform: Vercel
  Build: next build
  Runtime: Node.js 18+
  Environment: Production
  Features:
    - Edge Functions
    - Incremental Static Regeneration
    - Analytics
    - Speed Insights

Microservices:
  Platform: Custom (likely Docker + K8s or similar)
  Build: npm run build (TypeScript → JavaScript)
  Runtime: Node.js 18+
  Process Manager: PM2 or Docker
```

### Environment Variables:

```bash
# Database
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# Redis
REDIS_URL=redis://...
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# JWT
JWT_SECRET=... (min 32 chars)

# OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
MICROSOFT_CLIENT_ID=...
MICROSOFT_CLIENT_SECRET=...

# Stripe
STRIPE_SECRET_KEY=sk_...
STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Pusher
PUSHER_APP_ID=...
PUSHER_KEY=...
PUSHER_SECRET=...
PUSHER_CLUSTER=...
PUSHER_BEAMS_INSTANCE_ID=...
PUSHER_BEAMS_SECRET_KEY=...

# Cloudflare R2
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_ENDPOINT=https://...
AWS_BUCKET_NAME=...
R2_PUBLIC_URL=https://...

# Email
RESEND_API_KEY=re_...

# Service URLs
AUTH_SERVICE_URL=http://localhost:3000
USER_SERVICE_URL=http://localhost:3003
PROJECT_SERVICE_URL=http://localhost:3004
TASK_SERVICE_URL=http://localhost:3005
TEAM_SERVICE_URL=http://localhost:3006
CHAT_SERVICE_URL=http://localhost:3007
NOTIFICATION_SERVICE_URL=http://localhost:3008
INVOICE_SERVICE_URL=http://localhost:3009
FILE_SERVICE_URL=http://localhost:3010

# Dashboard
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Monitoring:

```yaml
Metrics:
  - Prometheus endpoints на /api/metrics для кожного сервісу
  - Custom metrics (request count, duration, errors)

Health Checks:
  - /api/health endpoints для всіх сервісів
  - Database connectivity check
  - Redis connectivity check

Logging:
  - Winston logger
  - Structured JSON logs
  - Error tracking (потрібно додати Sentry)
```

---

## 📊 ПОТОКИ ДАНИХ

### 1. Автентифікація (Login Flow):

```
┌────────┐                ┌───────────┐                ┌──────────────┐
│ Client │───POST login──→│ Dashboard │───HTTP POST───→│ auth-service │
│        │                │ /api/auth │                │   Port 3000  │
└────────┘                └───────────┘                └──────────────┘
                                ↓                              ↓
                          Set cookies              Verify credentials
                         JWT + session                    ↓
                                ↓                    Query PostgreSQL
                          Return user               Generate JWT token
                                                           ↓
                                                    Return {token, user}
```

### 2. Створення проекту:

```
┌────────┐     ┌───────────┐     ┌─────────────────┐     ┌────────────┐
│ Client │────→│ Dashboard │────→│ project-service │────→│ PostgreSQL │
│        │     │ API proxy │     │   Port 3004     │     │            │
└────────┘     └───────────┘     └─────────────────┘     └────────────┘
                                          ↓
                                     Event Bus
                                          ↓
                              ┌───────────────────────┐
                              │ notification-service  │
                              │  (optional notify)    │
                              └───────────────────────┘
```

### 3. Real-time Chat:

```
┌────────┐     ┌───────────┐     ┌──────────────┐     ┌────────┐
│ Client │────→│ Dashboard │────→│ chat-service │────→│ Pusher │
│        │     │           │     │  Port 3007   │     │        │
└────────┘     └───────────┘     └──────────────┘     └────────┘
    ↑                                     ↓                 ↓
    │                               PostgreSQL         Broadcast
    │                                                       ↓
    └──────────────────WebSocket (Pusher)──────────────────┘
```

### 4. Email верифікація:

```
┌────────┐     ┌──────────────┐     ┌──────────┐     ┌─────────────────────┐
│ Client │────→│ auth-service │────→│Event Bus │────→│notification-service │
│        │     │  Port 3000   │     │ (Redis)  │     │    Port 3008        │
└────────┘     └──────────────┘     └──────────┘     └─────────────────────┘
                      ↓                                        ↓
                Save token                               Resend API
                in PostgreSQL                                  ↓
                                                         Send email
```

### 5. Завантаження файлу:

```
┌────────┐     ┌───────────┐     ┌─────────────┐     ┌──────────────┐
│ Client │────→│ Dashboard │────→│file-service │────→│Cloudflare R2 │
│        │     │multipart  │     │  Port 3010  │     │  (S3 API)    │
└────────┘     └───────────┘     └─────────────┘     └──────────────┘
                                        ↓
                                   PostgreSQL
                                 (save metadata)
```

---

## ⚠️ ПРОБЛЕМИ ТА РЕКОМЕНДАЦІЇ

### 🔴 КРИТИЧНІ ПРОБЛЕМИ:

#### 1. **Конфлікти портів**

**Проблема:**
```
task-service:         3005 ❌
notification-service: 3005 ❌  КОНФЛІКТ

team-service:         3006 ❌
invoice-service:      3006 ❌  КОНФЛІКТ

chat-service:         3007 ❌
file-service:         3007 ❌  КОНФЛІКТ
```

**Рішення:**
```typescript
// Оновити порти:
{
  "auth-service": 3000,      // ✅
  "user-service": 3003,      // ✅
  "project-service": 3004,   // ✅
  "task-service": 3005,      // ✅
  "team-service": 3006,      // ✅
  "chat-service": 3007,      // ✅
  "notification-service": 3008,  // 🔧 ЗМІНИТИ
  "invoice-service": 3009,       // 🔧 ЗМІНИТИ
  "file-service": 3010           // 🔧 ЗМІНИТИ
}
```

**Файли для оновлення:**
- `services/notification-service/.env`
- `services/invoice-service/.env`
- `services/file-service/.env`
- `dashboard/.env` (SERVICE URLs)

---

#### 2. **Спільна база даних (Monolithic DB)**

**Проблема:**
Всі мікросервіси використовують одну PostgreSQL базу даних, що порушує принцип "Database per Service" у мікросервісній архітектурі.

**Ризики:**
- 🔴 Tight coupling між сервісами
- 🔴 Неможливість масштабувати БД окремо
- 🔴 Ризик блокувань при великому навантаженні
- 🔴 Складність міграцій

**Рекомендації:**

**Варіант A (Ідеальний, але складний):**
```
Розділити на окремі БД для кожного сервісу:
├─ auth-service → auth_db (users, email_verifications)
├─ project-service → project_db (projects, templates)
├─ task-service → task_db (tasks)
├─ invoice-service → invoice_db (invoices, payments)
└─ ...
```

**Варіант B (Компромісний):**
```
Використати Database Schemas як логічне розділення:
├─ public.users (shared read-only)
├─ auth_schema.* (auth-service writes)
├─ project_schema.* (project-service writes)
├─ task_schema.* (task-service writes)
└─ ...
```

**Варіант C (Поточний стан):**
```
✅ Зберегти спільну БД, але:
   - Додати чіткі правила доступу (WHO can READ/WRITE WHAT)
   - Використовувати DB Views для read-only доступу
   - Документувати залежності
```

---

#### 3. **Відсутність API Gateway**

**Проблема:**
Dashboard виступає як BFF (Backend for Frontend), але немає централізованого API Gateway для:
- Rate limiting
- Authentication validation
- Request logging
- Service discovery

**Рекомендації:**

Додати **Kong Gateway** або **Nginx** перед мікросервісами:

```
┌─────────┐                 ┌──────────────┐
│ Client  │────────────────→│ API Gateway  │
└─────────┘                 │  (Kong/Nginx)│
                            └──────────────┘
                                    ↓
                    ┌───────────────┼───────────────┐
                    ↓               ↓               ↓
            ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
            │auth-service  │ │project-service│ │task-service  │
            └──────────────┘ └──────────────┘ └──────────────┘
```

**Features:**
- Централізований rate limiting
- JWT validation
- Request/Response logging
- Load balancing
- Circuit breaker pattern

---

#### 4. **Відсутність централізованого логування**

**Проблема:**
Кожен сервіс логує окремо, складно відслідковувати request chain через мікросервіси.

**Рекомендації:**

Впровадити **ELK Stack** (Elasticsearch, Logstash, Kibana) або **Loki + Grafana**:

```typescript
// shared/middleware/logger.ts
import winston from 'winston';
import { v4 as uuidv4 } from 'uuid';

export const requestLogger = (req, res, next) => {
  req.requestId = req.headers['x-request-id'] || uuidv4();

  winston.log('info', {
    requestId: req.requestId,
    service: process.env.SERVICE_NAME,
    method: req.method,
    path: req.path,
    userId: req.user?.id,
    timestamp: new Date().toISOString()
  });

  next();
};
```

**Додати:**
- Correlation IDs для трейсингу
- Structured JSON logging
- Centralized log aggregation

---

### 🟡 СЕРЕДНІЙ ПРІОРИТЕТ:

#### 5. **Event Bus архітектура не масштабується**

**Проблема:**
Використання Redis pub/sub для Event Bus має обмеження:
- Немає гарантії доставки
- Немає retry механізму
- Складно масштабувати

**Рекомендації:**

Перейти на **RabbitMQ** або **Apache Kafka**:

```typescript
// RabbitMQ приклад
import amqp from 'amqplib';

// Publisher (auth-service)
const publishEvent = async (eventType, data) => {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();

  await channel.assertExchange('events', 'topic', { durable: true });

  channel.publish(
    'events',
    eventType,
    Buffer.from(JSON.stringify(data)),
    { persistent: true }
  );
};

// Consumer (notification-service)
const consumeEvents = async () => {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();

  await channel.assertExchange('events', 'topic', { durable: true });
  const { queue } = await channel.assertQueue('', { exclusive: true });

  channel.bindQueue(queue, 'events', 'user.*');

  channel.consume(queue, (msg) => {
    const event = JSON.parse(msg.content.toString());
    handleEvent(event);
    channel.ack(msg);
  });
};
```

**Переваги:**
- ✅ Guaranteed delivery
- ✅ Retry mechanism
- ✅ Dead letter queues
- ✅ Better scalability

---

#### 6. **Відсутність Service Mesh**

**Рекомендація:**
При масштабуванні розглянути **Istio** або **Linkerd** для:
- Service-to-service encryption (mTLS)
- Traffic management
- Observability
- Resilience (circuit breakers, retries)

---

#### 7. **Немає containerization**

**Проблема:**
Відсутні Dockerfile для сервісів, складно деплоїти

**Рекомендації:**

Створити `Dockerfile` для кожного сервісу:

```dockerfile
# services/auth-service/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy shared dependencies
COPY shared/ /app/shared/
RUN cd /app/shared && npm install && npm run build

# Copy service
COPY services/auth-service/package*.json ./
RUN npm install --production

COPY services/auth-service/ .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

Додати `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: project_scope_analyzer
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  auth-service:
    build:
      context: .
      dockerfile: services/auth-service/Dockerfile
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/project_scope_analyzer
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis

  # ... інші сервіси
```

---

### 🟢 НИЗЬКИЙ ПРІОРИТЕТ (Поліпшення):

#### 8. **Додати E2E тести**

```typescript
// tests/e2e/auth.test.ts
import { test, expect } from '@playwright/test';

test('User can sign up and login', async ({ page }) => {
  // Sign up
  await page.goto('/sign-up');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');

  // Verify redirect to dashboard
  await expect(page).toHaveURL('/dashboard');
});
```

---

#### 9. **Додати Swagger/OpenAPI документацію**

```typescript
// services/auth-service/src/docs/swagger.ts
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Auth Service API',
      version: '1.0.0',
    },
    servers: [
      { url: 'http://localhost:3000' }
    ],
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
```

---

#### 10. **Performance оптимізації**

**Recommendations:**
- ✅ Додати connection pooling для PostgreSQL
- ✅ Використовувати Redis для frequently accessed data
- ✅ Додати CDN для static assets (Cloudflare)
- ✅ Оптимізувати N+1 queries (DataLoader pattern)
- ✅ Додати database indexes (вже є базові)

---

## 📐 ДІАГРАМИ ДЛЯ СТВОРЕННЯ

На основі цього аудиту рекомендую створити наступні діаграми:

### 1. **System Architecture Diagram (C4 Model - Level 1)**
```
┌─────────────────────────────────────────────────────────────┐
│                      SYSTEM CONTEXT                          │
│  ┌────────┐        ┌─────────────────┐        ┌──────────┐ │
│  │  User  │───────→│  Project Scope  │───────→│ External │ │
│  │        │        │    Analyzer     │        │ Services │ │
│  └────────┘        └─────────────────┘        └──────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 2. **Container Diagram (C4 Model - Level 2)**
```
Показати всі 9 мікросервісів + Dashboard + БД + зовнішні сервіси
```

### 3. **Component Diagram (C4 Model - Level 3)**
```
Деталізація кожного мікросервісу (routes, controllers, services)
```

### 4. **Deployment Diagram**
```
Vercel → Dashboard
Docker/K8s → Microservices
Neon → PostgreSQL
Upstash → Redis
```

### 5. **Sequence Diagrams**
- User Login Flow
- Create Project Flow
- Real-time Chat Flow
- File Upload Flow
- Invoice Payment Flow

### 6. **Database ER Diagram**
```
Всі 30 таблиць з зв'язками
```

### 7. **Event Flow Diagram**
```
Event Bus комунікація між сервісами
```

---

## 📊 МЕТРИКИ СИСТЕМИ

### Кількісні показники:

| Метрика | Значення |
|---------|----------|
| **Мікросервіси** | 9 |
| **Database таблиць** | 30+ |
| **API Endpoints** | ~150+ |
| **Зовнішні інтеграції** | 9 |
| **Frontend сторінок** | 25+ |
| **Lines of Code** | ~50,000+ (оцінка) |

### Технологічний борг:

| Проблема | Вплив | Складність виправлення |
|----------|-------|----------------------|
| Port conflicts | 🔴 High | 🟢 Low |
| Monolithic DB | 🔴 High | 🔴 High |
| No API Gateway | 🟡 Medium | 🟡 Medium |
| No centralized logging | 🟡 Medium | 🟢 Low |
| Event Bus scalability | 🟡 Medium | 🟡 Medium |

---

## 🎯 ВИСНОВКИ

### ✅ Сильні сторони:

1. **Правильна мікросервісна архітектура** - кожен сервіс має чітку відповідальність
2. **Сучасний tech stack** - Next.js 14, React 18, TypeScript, Drizzle ORM
3. **Real-time функціонал** - Pusher для WebSocket комунікації
4. **Масштабованість** - мікросервіси можна масштабувати окремо
5. **Безпека** - JWT authentication, OAuth, rate limiting
6. **Хороша документація коду** - TypeScript types, коментарі

### ⚠️ Слабкі сторони:

1. **Конфлікти портів** - потребують негайного виправлення
2. **Спільна БД** - порушує принципи мікросервісів
3. **Відсутність API Gateway** - потрібен для production
4. **Немає централізованого логування** - складно дебагити
5. **Event Bus обмеження** - Redis pub/sub не гарантує доставку

### 🚀 Наступні кроки:

**Короткострокові (1-2 тижні):**
1. ✅ Виправити конфлікти портів
2. ✅ Додати централізоване логування
3. ✅ Створити Docker Compose для локальної розробки
4. ✅ Додати Swagger документацію для API

**Середньострокові (1-2 місяці):**
1. ✅ Впровадити API Gateway (Kong/Nginx)
2. ✅ Перейти на RabbitMQ для Event Bus
3. ✅ Додати E2E тести
4. ✅ Оптимізувати database queries

**Довгострокові (3-6 місяців):**
1. ✅ Розділити БД на окремі схеми/бази
2. ✅ Додати Service Mesh (Istio)
3. ✅ Впровадити повний CI/CD pipeline
4. ✅ Додати monitoring та alerting (Prometheus + Grafana)

---

## 📞 КОНТАКТИ ДЛЯ ПИТАНЬ

Якщо потрібна додаткова інформація або уточнення, будь ласка, зверніться до технічної команди.

**Аудит проведено:** 06 грудня 2025
**Версія документу:** 1.0.0
**Статус:** ✅ Затверджено для використання при створенні діаграм

---

_Цей документ містить повну технічну специфікацію системи та може використовуватися для створення архітектурних діаграм, презентацій та технічної документації._
