# 🚀 Railway Deployment Guide для Project Scope Analyzer

## 📋 Архітектура проєкту

Цей проєкт складається з:
- **1 Frontend**: Dashboard (Next.js) на порті 3001
- **9 Backend Microservices**: 
  - auth-service (Authentication)
  - user-service (User Management)
  - project-service (Projects)
  - task-service (Tasks)
  - team-service (Teams)
  - chat-service (Real-time Chat)
  - invoice-service (Invoices)
  - notification-service (Notifications)
  - file-service (File Storage)

---

## 🎯 Стратегія Deployment

**Monorepo → Multiple Railway Services**

Всі сервіси в одному GitHub репозиторії, але кожен деплоїться як окремий Railway Service.

---

## 📝 Покрокова інструкція

### Крок 1: Підготовка Railway Project

1. Зайдіть на [railway.app](https://railway.app)
2. Створіть новий Project: **"Project Scope Analyzer"**
3. Підключіть ваш GitHub репозиторій

### Крок 2: Додавання Database (якщо потрібно)

Якщо ви ще не маєте PostgreSQL:
1. В Railway Project натисніть **"+ New"**
2. Виберіть **"Database" → "PostgreSQL"**
3. Railway автоматично створить `DATABASE_URL`

### Крок 3: Додавання Redis (якщо потрібно)

1. В Railway Project натисніть **"+ New"**
2. Виберіть **"Database" → "Redis"**
3. Railway автоматично створить `REDIS_URL`

### Крок 4: Створення Services

#### 4.1 Dashboard (Frontend)

1. **New Service** → **GitHub Repo** → вибрати репо
2. **Settings** → **Root Directory**: `dashboard`
3. **Variables** (додати):
   ```
   NODE_ENV=production
   NEXT_PUBLIC_API_URL=https://auth-service.railway.app
   # ... інші змінні
   ```
4. **Deploy** - Railway автоматично знайде `railway.toml` в корені

#### 4.2 Auth Service

1. **New Service** → **GitHub Repo** → вибрати репо
2. **Settings** → **Root Directory**: `services/auth-service`
3. **Settings** → **Health Check Path**: `/health`
4. **Variables**:
   ```
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   REDIS_URL=${{Redis.REDIS_URL}}
   JWT_SECRET=your-secret-here
   ```
5. **Generate Domain** - скопіюйте URL сервісу

#### 4.3 User Service

1. **New Service** → **GitHub Repo** → вибрати репо
2. **Settings** → **Root Directory**: `services/user-service`
3. **Settings** → **Health Check Path**: `/health`
4. **Variables**:
   ```
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   AUTH_SERVICE_URL=${{auth-service.RAILWAY_PUBLIC_DOMAIN}}
   ```

#### 4.4 Project Service

1. **New Service** → **GitHub Repo** → вибрати репо
2. **Settings** → **Root Directory**: `services/project-service`
3. **Settings** → **Health Check Path**: `/health`
4. **Variables**:
   ```
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   AUTH_SERVICE_URL=${{auth-service.RAILWAY_PUBLIC_DOMAIN}}
   ```

#### 4.5 Task Service

1. **New Service** → **GitHub Repo** → вибрати репо
2. **Settings** → **Root Directory**: `services/task-service`
3. **Settings** → **Health Check Path**: `/health`
4. **Variables**:
   ```
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   PROJECT_SERVICE_URL=${{project-service.RAILWAY_PUBLIC_DOMAIN}}
   ```

#### 4.6 Team Service

1. **New Service** → **GitHub Repo** → вибрати репо
2. **Settings** → **Root Directory**: `services/team-service`
3. **Settings** → **Health Check Path**: `/health`
4. **Variables**:
   ```
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   ```

#### 4.7 Chat Service

1. **New Service** → **GitHub Repo** → вибрати репо
2. **Settings** → **Root Directory**: `services/chat-service`
3. **Settings** → **Health Check Path**: `/health`
4. **Variables**:
   ```
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   PUSHER_APP_ID=your-app-id
   PUSHER_KEY=your-key
   PUSHER_SECRET=your-secret
   PUSHER_CLUSTER=your-cluster
   ```

#### 4.8 Invoice Service

1. **New Service** → **GitHub Repo** → вибрати репо
2. **Settings** → **Root Directory**: `services/invoice-service`
3. **Settings** → **Health Check Path**: `/health`
4. **Variables**:
   ```
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   STRIPE_SECRET_KEY=your-stripe-key
   ```

#### 4.9 Notification Service

1. **New Service** → **GitHub Repo** → вибрати репо
2. **Settings** → **Root Directory**: `services/notification-service`
3. **Settings** → **Health Check Path**: `/health`
4. **Variables**:
   ```
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   RESEND_API_KEY=your-resend-key
   ```

#### 4.10 File Service

1. **New Service** → **GitHub Repo** → вибрати репо
2. **Settings** → **Root Directory**: `services/file-service`
3. **Settings** → **Health Check Path**: `/health`
4. **Variables**:
   ```
   NODE_ENV=production
   PORT=3000
   AWS_ACCESS_KEY_ID=your-key
   AWS_SECRET_ACCESS_KEY=your-secret
   AWS_REGION=us-east-1
   S3_BUCKET=your-bucket
   ```

---

## 🔗 Service Communication

### Internal URLs (між сервісами):

Railway автоматично створює внутрішні DNS для кожного сервісу:

```
auth-service.railway.internal:3000
user-service.railway.internal:3000
project-service.railway.internal:3000
...
```

### Public URLs (для фронтенду):

```
https://auth-service-production.up.railway.app
https://user-service-production.up.railway.app
...
```

**Важливо**: Оновіть `NEXT_PUBLIC_*` змінні в Dashboard з публічними URL сервісів!

---

## ✅ Deployment Checklist

- [ ] Всі 10 Railway Services створені
- [ ] PostgreSQL database підключена
- [ ] Redis підключений
- [ ] Environment variables налаштовані для кожного сервісу
- [ ] Health checks працюють (`/health` endpoints)
- [ ] Dashboard має правильні `NEXT_PUBLIC_` URLs
- [ ] Міграції бази даних виконані
- [ ] GitHub Auto-Deploy увімкнений
- [ ] Custom domains налаштовані (опціонально)

---

## 🐛 Troubleshooting

### Build fails: "Cannot find module 'shared'"

**Рішення**: Переконайтеся що `shared` package збілдився:
```bash
# В кожному сервісі є:
"build": "npm run build:shared && tsc"
```

### Service crashes: "Database connection failed"

**Рішення**: Перевірте що `DATABASE_URL` правильно налаштована:
```
${{Postgres.DATABASE_URL}}
```

### Health check fails

**Рішення**: Додайте `/health` endpoint в кожен сервіс:
```typescript
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});
```

---

## 📊 Monitoring

Railway надає автоматичний моніторинг:
- CPU/Memory usage
- Request logs
- Deployments history
- Metrics dashboard

Перевіряйте **Metrics** tab в кожному сервісі.

---

## 💰 Pricing Estimate

Railway pricing (станом на 2026):
- **Free Tier**: $5 worth of credits
- **Pro Plan**: $20/month + usage

**Estimated costs** для вашого проєкту:
- 1 Frontend: ~$5-10/month
- 9 Microservices: ~$3-5/month кожен
- PostgreSQL: ~$5/month
- Redis: ~$2/month

**Total**: ~$40-70/month залежно від traffic

---

## 🚀 Auto-Deploy

Railway автоматично деплоїть при push to GitHub:

1. Push до `main` branch
2. Railway детектує зміни в папках
3. Білдить тільки змінені сервіси
4. Zero-downtime deployment

---

## 📚 Додаткові ресурси

- [Railway Docs](https://docs.railway.app)
- [Railway CLI](https://docs.railway.app/develop/cli)
- [Monorepo Guide](https://docs.railway.app/guides/monorepo)

---

**Готово! Тепер ви можете задеплоїти весь проєкт на Railway! 🎉**
