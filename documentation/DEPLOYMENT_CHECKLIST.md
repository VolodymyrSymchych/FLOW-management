# ✅ Pre-Deployment Checklist

## 📋 Що вже зроблено:

- [x] Створено `railway.toml` для Dashboard
- [x] Створено `railway.toml` для всіх 9 мікросервісів
- [x] Додано `node_modules/` в `.gitignore`
- [x] Додано `start` script вRoot `package.json`
- [x] Health endpoints існують в сервісах

## 🚀 Наступні кроки:

### 1. Commit та Push змін

```bash
# Перевірити що змінилося
git status

# Додати всі нові конфігурації
git add .
git add railway.toml
git add railway.json
git add services/*/railway.toml
git add .gitignore
git add package.json
git add RAILWAY_DEPLOYMENT.md
git add DEPLOYMENT_CHECKLIST.md

# Commit
git commit -m "feat: add Railway deployment configuration for all services"

# Push
git push origin main
```

### 2. Видалити node_modules з Git (якщо вже закоммічено)

```bash
# Видалити з Git tracking (але залишити локально)
git rm -r --cached node_modules

# Commit
git commit -m "chore: remove node_modules from git tracking"

# Push
git push origin main
```

### 3. Railway Setup

Відкрийте [railway.app](https://railway.app) та виконайте кроки з `RAILWAY_DEPLOYMENT.md`

#### Quick Start версія:

1. **Створіть Railway Project**: "Project Scope Analyzer"

2. **Додайте PostgreSQL**:
   - New → Database → PostgreSQL
   - Скопіюйте `DATABASE_URL`

3. **Додайте Redis**:
   - New → Database → Redis
   - Скопіюйте `REDIS_URL`

4. **Створіть 10 Services** (по порядку):
   
   a. **auth-service** (ПЕРШИМ!)
      - Root Directory: `services/auth-service`
      - Health Check: `/health`
      - Variables: `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`
   
   b. **user-service**
      - Root Directory: `services/user-service`
      - Health Check: `/health`
      - Variables: `DATABASE_URL`, `AUTH_SERVICE_URL`
   
   c. **project-service**
      - Root Directory: `services/project-service`
      - Health Check: `/health`
   
   d. **task-service**
      - Root Directory: `services/task-service`
      - Health Check: `/health`
   
   e. **team-service**
      - Root Directory: `services/team-service`
      - Health Check: `/health`
   
   f. **chat-service**
      - Root Directory: `services/chat-service`
      - Health Check: `/health`
      - Variables: `PUSHER_*`
   
   g. **invoice-service**
      - Root Directory: `services/invoice-service`
      - Health Check: `/health`
      - Variables: `STRIPE_SECRET_KEY`
   
   h. **notification-service**
      - Root Directory: `services/notification-service`
      - Health Check: `/health`
      - Variables: `RESEND_API_KEY`
   
   i. **file-service**
      - Root Directory: `services/file-service`
      - Health Check: `/health`
      - Variables: `AWS_*`, `S3_BUCKET`
   
   j. **dashboard** (ОСТАННІМ!)
      - Root Directory: `dashboard`
      - Health Check: `/`
      - Variables: `NEXT_PUBLIC_*` URLs всіх сервісів

### 4. Environment Variables Template

#### Shared (для всіх backend сервісів):
```bash
NODE_ENV=production
PORT=3000
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
```

#### Dashboard специфічні:
```bash
NODE_ENV=production
NEXT_PUBLIC_AUTH_SERVICE_URL=https://auth-service-production.up.railway.app
NEXT_PUBLIC_USER_SERVICE_URL=https://user-service-production.up.railway.app
NEXT_PUBLIC_PROJECT_SERVICE_URL=https://project-service-production.up.railway.app
NEXT_PUBLIC_TASK_SERVICE_URL=https://task-service-production.up.railway.app
NEXT_PUBLIC_TEAM_SERVICE_URL=https://team-service-production.up.railway.app
NEXT_PUBLIC_CHAT_SERVICE_URL=https://chat-service-production.up.railway.app
NEXT_PUBLIC_INVOICE_SERVICE_URL=https://invoice-service-production.up.railway.app
NEXT_PUBLIC_NOTIFICATION_SERVICE_URL=https://notification-service-production.up.railway.app
NEXT_PUBLIC_FILE_SERVICE_URL=https://file-service-production.up.railway.app

# Pusher (для real-time)
NEXT_PUBLIC_PUSHER_KEY=your-key
NEXT_PUBLIC_PUSHER_CLUSTER=your-cluster

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-key
```

### 5. Database Migrations

Після deploy auth-service, виконайте міграції:

```bash
# Через Railway CLI
railway run npm run db:migrate

# Або через Railway Dashboard → auth-service → Shell
npm run db:migrate
```

### 6. Smoke Testing

Після deployment, перевірте:

- [ ] Всі сервіси показують "Healthy" status
- [ ] Dashboard відкривається
- [ ] Можна зареєструватись
- [ ] Можна залогінитись
- [ ] API calls працюють
- [ ] Real-time chat працює (через Pusher)
- [ ] File uploads працюють (через S3)

## 🐛 Якщо щось не працює:

1. **Перевірте Logs** в Railway Dashboard
2. **Перевірте Environment Variables**
3. **Перевірте Health Checks**
4. **Перевірте Database Connection**
5. **Перевірте що всі сервіси running**

## 📊 Estimated Timeline:

- ⏱️ **Git setup**: 5 хвилин
- ⏱️ **Railway Project + DB**: 10 хвилин  
- ⏱️ **Creating Services**: 30-40 хвилин
- ⏱️ **Environment Variables**: 15-20 хвилин
- ⏱️ **First Deploy**: 10-15 хвилин (build time)
- ⏱️ **Testing**: 10 хвилин

**Total**: ~1.5-2 години для повного deployment

## 🎯 Success Criteria:

✅ Всі 10 services running on Railway
✅ Dashboard accessible via public URL
✅ Users can register and login
✅ All microservices responding to health checks
✅ Database migrations completed
✅ Real-time features working

---

**Готові почати? Виконайте Крок 1! 🚀**
