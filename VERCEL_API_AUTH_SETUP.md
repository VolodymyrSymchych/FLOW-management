# Налаштування API Authentication для Vercel

## Що було зроблено

✅ Додано Service Authentication middleware до всіх мікросервісів  
✅ Оновлено всі service clients в Dashboard для відправки API keys  
✅ Захищено всі API routes (крім health/metrics)  

## Як це працює

### Двошаровий захист:

1. **Service-to-Service Authentication** (X-Service-API-Key)
   - Захищає від публічного доступу
   - Тільки Dashboard може викликати сервіси

2. **User Authentication** (JWT Bearer Token)
   - Захищає від неавторизованих користувачів
   - Тільки авторизовані користувачі можуть використовувати endpoints

### Архітектура:

```
Dashboard (Vercel)
    │
    ├─► X-Service-API-Key: your-secret-key
    ├─► Authorization: Bearer <user-jwt-token>
    │
    ▼
Auth Service (Vercel)
    │
    ├─► Перевіряє X-Service-API-Key ✅
    ├─► Перевіряє JWT Token ✅
    │
    ▼
Відповідь
```

## Налаштування Environment Variables

### 1. У Dashboard проекті (Vercel)

```env
# Service URLs (публічні)
NEXT_PUBLIC_AUTH_SERVICE_URL=https://auth-service.vercel.app
NEXT_PUBLIC_USER_SERVICE_URL=https://user-service.vercel.app
NEXT_PUBLIC_PROJECT_SERVICE_URL=https://project-service.vercel.app
NEXT_PUBLIC_TASK_SERVICE_URL=https://task-service.vercel.app

# Service API Keys (приватні, server-side only)
AUTH_SERVICE_API_KEY=your-super-secret-api-key-min-32-chars
USER_SERVICE_API_KEY=your-super-secret-api-key-min-32-chars
PROJECT_SERVICE_API_KEY=your-super-secret-api-key-min-32-chars
TASK_SERVICE_API_KEY=your-super-secret-api-key-min-32-chars
```

**Важливо:** API keys НЕ повинні мати префікс `NEXT_PUBLIC_`, щоб не бути доступними в браузері!

### 2. У кожному мікросервісі (Vercel)

#### Auth Service:
```env
SERVICE_API_KEY=your-super-secret-api-key-min-32-chars
DATABASE_URL=postgresql://...
JWT_SECRET=...
REDIS_URL=...
```

#### User Service:
```env
SERVICE_API_KEY=your-super-secret-api-key-min-32-chars
DATABASE_URL=postgresql://...
JWT_SECRET=...
REDIS_URL=...
```

#### Project Service:
```env
SERVICE_API_KEY=your-super-secret-api-key-min-32-chars
DATABASE_URL=postgresql://...
JWT_SECRET=...
REDIS_URL=...
```

#### Task Service:
```env
SERVICE_API_KEY=your-super-secret-api-key-min-32-chars
DATABASE_URL=postgresql://...
JWT_SECRET=...
REDIS_URL=...
```

## Генерація безпечних API Keys

### Варіант 1: Використати Node.js

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Варіант 2: Використати OpenSSL

```bash
openssl rand -hex 32
```

### Варіант 3: Онлайн генератор

https://randomkeygen.com/ (використати "CodeIgniter Encryption Keys")

## Рекомендації для безпеки

### 1. Використати один API key для всіх сервісів

**Простий варіант:**
```env
# У всіх сервісах
SERVICE_API_KEY=your-super-secret-api-key-min-32-chars

# У Dashboard
AUTH_SERVICE_API_KEY=your-super-secret-api-key-min-32-chars
USER_SERVICE_API_KEY=your-super-secret-api-key-min-32-chars
PROJECT_SERVICE_API_KEY=your-super-secret-api-key-min-32-chars
TASK_SERVICE_API_KEY=your-super-secret-api-key-min-32-chars
```

### 2. Або використати різні API keys (більш безпечно)

```env
# Auth Service
SERVICE_API_KEY=auth-service-key-32-chars-min

# User Service
SERVICE_API_KEY=user-service-key-32-chars-min

# Project Service
SERVICE_API_KEY=project-service-key-32-chars-min

# Task Service
SERVICE_API_KEY=task-service-key-32-chars-min

# Dashboard
AUTH_SERVICE_API_KEY=auth-service-key-32-chars-min
USER_SERVICE_API_KEY=user-service-key-32-chars-min
PROJECT_SERVICE_API_KEY=project-service-key-32-chars-min
TASK_SERVICE_API_KEY=task-service-key-32-chars-min
```

## Тестування

### 1. Перевірити без API key (має повернути 401)

```bash
curl https://auth-service.vercel.app/api/auth/me
# Має повернути: {"error":"Unauthorized","message":"Service API key is required"}
```

### 2. Перевірити з API key (має працювати)

```bash
curl https://auth-service.vercel.app/api/auth/me \
  -H "X-Service-API-Key: your-secret-key" \
  -H "Authorization: Bearer <user-jwt-token>"
```

### 3. Health check (має працювати без API key)

```bash
curl https://auth-service.vercel.app/health
# Має повернути: {"status":"healthy",...}
```

## Важливі моменти

### ✅ Що захищено:

- Всі `/api/*` routes в усіх сервісах
- Потрібен `X-Service-API-Key` header
- Потрібен `Authorization: Bearer <token>` для user endpoints

### ✅ Що НЕ захищено (і не повинно бути):

- `/health` - потрібен для моніторингу
- `/api/health` - потрібен для моніторингу
- `/api/metrics` - потрібен для моніторингу

### ⚠️ Development mode:

Якщо `SERVICE_API_KEY` не встановлено, middleware дозволяє всі запити (для локальної розробки).

## Troubleshooting

### Проблема: "Service API key is required"

**Рішення:**
1. Перевірити, що `SERVICE_API_KEY` встановлено в мікросервісі
2. Перевірити, що `*_SERVICE_API_KEY` встановлено в Dashboard
3. Перевірити, що API key передається в header `X-Service-API-Key`

### Проблема: "Invalid service API key"

**Рішення:**
1. Переконатися, що API key в Dashboard збігається з API key в мікросервісі
2. Перевірити, що немає зайвих пробілів
3. Перевірити, що використовується правильний environment (production vs development)

### Проблема: API key видно в браузері

**Рішення:**
1. Переконатися, що environment variable НЕ має префікс `NEXT_PUBLIC_`
2. Перевірити, що API key додається тільки server-side (`typeof window === 'undefined'`)

## Production Checklist

- [ ] Згенеровано безпечні API keys (32+ символів)
- [ ] Додано `SERVICE_API_KEY` в усі мікросервіси на Vercel
- [ ] Додано `*_SERVICE_API_KEY` в Dashboard на Vercel
- [ ] Перевірено, що health checks працюють без API key
- [ ] Перевірено, що API routes повертають 401 без API key
- [ ] Перевірено, що API routes працюють з правильним API key
- [ ] Налаштовано monitoring для виявлення підозрілих запитів

## Додаткова безпека (опціонально)

### 1. Rate Limiting на рівні сервісів

Додати rate limiting для захисту від DDoS.

### 2. IP Whitelist (Vercel Pro)

Якщо є Vercel Pro, можна додати IP whitelist.

### 3. Monitoring та Alerting

Налаштувати алерти при підозрілих запитах (багато 401 помилок).

### 4. Ротація API Keys

Регулярно змінювати API keys (наприклад, раз на квартал).

