# 🔐 Environment Variables для всіх проектів

## 📱 Dashboard (Next.js)

### Обов'язкові змінні:

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# JWT (має збігатися з усіма сервісами!)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-CHANGE-THIS

# App URLs
NEXT_PUBLIC_APP_URL=https://your-dashboard.vercel.app
NEXT_PUBLIC_BASE_URL=https://your-dashboard.vercel.app

# Microservices URLs
NEXT_PUBLIC_AUTH_SERVICE_URL=https://flow-auth-service.vercel.app
NEXT_PUBLIC_USER_SERVICE_URL=https://user-service.vercel.app
NEXT_PUBLIC_PROJECT_SERVICE_URL=https://project-service.vercel.app
NEXT_PUBLIC_TASK_SERVICE_URL=https://task-service.vercel.app

# Service API Keys (приватні, server-side only)
AUTH_SERVICE_API_KEY=ea2a45bbaa25e45f2bb8f1cb2d7997f19524a5edbae5f9d476053577e17bd8c9
USER_SERVICE_API_KEY=661256d92f7f92dc2ca4041fc22501e1fba2cb0e7a76d2d94b3a94b6da580fdb
PROJECT_SERVICE_API_KEY=74e6a18738805e921aca6277c254fec93b27753eca26923803d014654b0f8438
TASK_SERVICE_API_KEY=d4e53b8990758895c08c46d2d270d7b0e3c00d17f6b9ef473d40580b0afb0f58

# Stripe
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (Resend)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Cloudflare R2 (File Storage)
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=auto
AWS_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
AWS_BUCKET_NAME=your-bucket-name

# Production only
CRON_SECRET=your-cron-secret-min-32-chars
```

### Опціональні змінні:

```env
# Redis (якщо використовується)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
REDIS_URL=redis://...

# OAuth (якщо використовується)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
MICROSOFT_CLIENT_ID=...
MICROSOFT_CLIENT_SECRET=...

# AI (якщо використовується)
OPENAI_API_KEY=sk-...

# Migration (якщо потрібно)
MIGRATION_SECRET=your-migration-secret-min-32-chars
```

---

## 🔧 Auth Service

### Обов'язкові змінні:

```env
# Service Authentication
SERVICE_API_KEY=ea2a45bbaa25e45f2bb8f1cb2d7997f19524a5edbae5f9d476053577e17bd8c9

# Database (використовуйте DATABASE_URL для Neon/serverless)
DATABASE_URL=postgresql://user:password@host:5432/auth_db
# АБО індивідуальні змінні:
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=auth_db
# DB_USER=user
# DB_PASSWORD=password

# JWT (має збігатися з Dashboard!)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-CHANGE-THIS

# Redis (використовуйте REDIS_URL для Redis Labs/Upstash)
REDIS_URL=redis://default:password@host:port
# АБО індивідуальні змінні:
# REDIS_HOST=localhost
# REDIS_PORT=6379
# REDIS_PASSWORD=password

# Environment
NODE_ENV=production
```

### Опціональні змінні:

```env
# Service Configuration
SERVICE_NAME=auth-service
PORT=3000

# Event Bus
EVENT_BUS_TYPE=redis
# АБО для RabbitMQ:
# EVENT_BUS_TYPE=rabbitmq
# RABBITMQ_URL=amqp://admin:password@localhost:5672
# RABBITMQ_EXCHANGE=events

# JWT Configuration
JWT_ISSUER=project-scope-analyzer
JWT_EXPIRES_IN=1h

# Logging
LOG_LEVEL=info
LOG_FORMAT=json

# Metrics
METRICS_PORT=9091
```

---

## 👤 User Service

### Обов'язкові змінні:

```env
# Service Authentication
SERVICE_API_KEY=661256d92f7f92dc2ca4041fc22501e1fba2cb0e7a76d2d94b3a94b6da580fdb

# Database
DATABASE_URL=postgresql://user:password@host:5432/user_db
# АБО індивідуальні змінні:
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=user_db
# DB_USER=user
# DB_PASSWORD=password

# JWT (має збігатися з Dashboard!)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-CHANGE-THIS

# Redis
REDIS_URL=redis://default:password@host:port
# АБО індивідуальні змінні:
# REDIS_HOST=localhost
# REDIS_PORT=6379
# REDIS_PASSWORD=password

# Environment
NODE_ENV=production
```

### Опціональні змінні:

```env
SERVICE_NAME=user-service
PORT=3003
EVENT_BUS_TYPE=redis
JWT_ISSUER=project-scope-analyzer
JWT_EXPIRES_IN=1h
LOG_LEVEL=info
LOG_FORMAT=json
METRICS_PORT=9091
```

---

## 📁 Project Service

### Обов'язкові змінні:

```env
# Service Authentication
SERVICE_API_KEY=74e6a18738805e921aca6277c254fec93b27753eca26923803d014654b0f8438

# Database
DATABASE_URL=postgresql://user:password@host:5432/project_db
# АБО індивідуальні змінні:
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=project_db
# DB_USER=user
# DB_PASSWORD=password

# JWT (має збігатися з Dashboard!)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-CHANGE-THIS

# Redis
REDIS_URL=redis://default:password@host:port
# АБО індивідуальні змінні:
# REDIS_HOST=localhost
# REDIS_PORT=6379
# REDIS_PASSWORD=password

# Environment
NODE_ENV=production
```

### Опціональні змінні:

```env
SERVICE_NAME=project-service
PORT=3004
EVENT_BUS_TYPE=redis
JWT_ISSUER=project-scope-analyzer
JWT_EXPIRES_IN=1h
LOG_LEVEL=info
LOG_FORMAT=json
METRICS_PORT=9091
```

---

## ✅ Task Service

### Обов'язкові змінні:

```env
# Service Authentication
SERVICE_API_KEY=d4e53b8990758895c08c46d2d270d7b0e3c00d17f6b9ef473d40580b0afb0f58

# Database
DATABASE_URL=postgresql://user:password@host:5432/task_db
# АБО індивідуальні змінні:
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=task_db
# DB_USER=user
# DB_PASSWORD=password

# JWT (має збігатися з Dashboard!)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-CHANGE-THIS

# Redis
REDIS_URL=redis://default:password@host:port
# АБО індивідуальні змінні:
# REDIS_HOST=localhost
# REDIS_PORT=6379
# REDIS_PASSWORD=password

# Environment
NODE_ENV=production
```

### Опціональні змінні:

```env
SERVICE_NAME=task-service
PORT=3005
EVENT_BUS_TYPE=redis
JWT_ISSUER=project-scope-analyzer
JWT_EXPIRES_IN=1h
LOG_LEVEL=info
LOG_FORMAT=json
METRICS_PORT=9091
```

---

## 🔑 Важливі примітки

### 1. JWT_SECRET
- **Має бути однаковим** у всіх проектах (Dashboard + всі сервіси)
- Мінімум 32 символи
- Використовуйте безпечний випадковий рядок

### 2. SERVICE_API_KEY
- Кожен сервіс має свій унікальний ключ
- Значення в Dashboard (`*_SERVICE_API_KEY`) має **збігатися** з `SERVICE_API_KEY` у відповідному сервісі
- Мінімум 32 символи (рекомендовано 64)

### 3. DATABASE_URL vs індивідуальні змінні
- **Рекомендовано:** використовувати `DATABASE_URL` (для Neon, Supabase, тощо)
- **Альтернатива:** використовувати `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`

### 4. REDIS_URL vs індивідуальні змінні
- **Рекомендовано:** використовувати `REDIS_URL` (для Redis Labs, Upstash, тощо)
- **Альтернатива:** використовувати `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`
- **Примітка:** Auth Service підтримує `REDIS_URL`, інші сервіси можуть потребувати оновлення

### 5. NEXT_PUBLIC_* змінні
- Змінні з префіксом `NEXT_PUBLIC_` доступні в браузері
- **НЕ** додавайте `NEXT_PUBLIC_` до API keys та секретів!

---

## 📋 Швидкий чеклист для Vercel

### Dashboard:
- [ ] `DATABASE_URL`
- [ ] `JWT_SECRET`
- [ ] `NEXT_PUBLIC_APP_URL`
- [ ] `NEXT_PUBLIC_BASE_URL`
- [ ] `NEXT_PUBLIC_AUTH_SERVICE_URL`
- [ ] `NEXT_PUBLIC_USER_SERVICE_URL`
- [ ] `NEXT_PUBLIC_PROJECT_SERVICE_URL`
- [ ] `NEXT_PUBLIC_TASK_SERVICE_URL`
- [ ] `AUTH_SERVICE_API_KEY`
- [ ] `USER_SERVICE_API_KEY`
- [ ] `PROJECT_SERVICE_API_KEY`
- [ ] `TASK_SERVICE_API_KEY`
- [ ] `STRIPE_SECRET_KEY`
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] `RESEND_API_KEY`
- [ ] `RESEND_FROM_EMAIL`
- [ ] `AWS_ACCESS_KEY_ID`
- [ ] `AWS_SECRET_ACCESS_KEY`
- [ ] `AWS_ENDPOINT`
- [ ] `AWS_BUCKET_NAME`
- [ ] `CRON_SECRET` (production)

### Auth Service:
- [ ] `SERVICE_API_KEY`
- [ ] `DATABASE_URL`
- [ ] `JWT_SECRET`
- [ ] `REDIS_URL`
- [ ] `NODE_ENV=production`

### User Service:
- [ ] `SERVICE_API_KEY`
- [ ] `DATABASE_URL`
- [ ] `JWT_SECRET`
- [ ] `REDIS_URL` (або індивідуальні змінні)
- [ ] `NODE_ENV=production`

### Project Service:
- [ ] `SERVICE_API_KEY`
- [ ] `DATABASE_URL`
- [ ] `JWT_SECRET`
- [ ] `REDIS_URL` (або індивідуальні змінні)
- [ ] `NODE_ENV=production`

### Task Service:
- [ ] `SERVICE_API_KEY`
- [ ] `DATABASE_URL`
- [ ] `JWT_SECRET`
- [ ] `REDIS_URL` (або індивідуальні змінні)
- [ ] `NODE_ENV=production`

---

## 🔄 Генерація секретів

### JWT_SECRET (64 символи):
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### SERVICE_API_KEY (64 символи):
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### CRON_SECRET (64 символи):
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 📚 Додаткові ресурси

- [API Keys Setup](./API_KEYS_SETUP.md) - Детальна інструкція по API keys
- [Dashboard Auth Service Setup](./DASHBOARD_AUTH_SERVICE_SETUP.md) - Підключення Dashboard до Auth Service
- [Vercel API Auth Setup](./VERCEL_API_AUTH_SETUP.md) - Загальна інформація про аутентифікацію

