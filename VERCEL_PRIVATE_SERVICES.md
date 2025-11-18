# Деплой приватних мікросервісів на Vercel

## Проблема

1. **Деплой з GitHub**: Як деплоїти окремі сервіси, якщо все в одному репозиторії?
2. **Публічність**: На Vercel сервіси за замовчуванням публічні - як зробити приватними?

## Рішення 1: Monorepo з Vercel (рекомендовано)

### Структура проекту

```
project-scope-analyzer/
├── dashboard/              # Next.js app
├── services/
│   ├── auth-service/
│   ├── user-service/
│   ├── project-service/
│   └── task-service/
└── vercel.json            # Root config
```

### Налаштування `vercel.json` в корені

```json
{
  "version": 2,
  "buildCommand": "echo 'No root build'",
  "ignoreCommand": "git diff --quiet HEAD^ HEAD ./",
  "projects": [
    {
      "name": "dashboard",
      "root": "dashboard",
      "framework": "nextjs"
    },
    {
      "name": "auth-service",
      "root": "services/auth-service",
      "framework": "other"
    },
    {
      "name": "user-service",
      "root": "services/user-service",
      "framework": "other"
    },
    {
      "name": "project-service",
      "root": "services/project-service",
      "framework": "other"
    },
    {
      "name": "task-service",
      "root": "services/task-service",
      "framework": "other"
    }
  ]
}
```

### Налаштування кожного сервісу

#### `services/auth-service/vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

## Рішення 2: Окремі репозиторії (більше контролю)

### Структура

```
github.com/your-org/
├── project-scope-analyzer-dashboard
├── project-scope-analyzer-auth-service
├── project-scope-analyzer-user-service
├── project-scope-analyzer-project-service
└── project-scope-analyzer-task-service
```

### Переваги:
- ✅ Незалежний деплой кожного сервісу
- ✅ Різні права доступу
- ✅ Легше масштабувати

### Недоліки:
- ⚠️ Складніше синхронізувати зміни
- ⚠️ Більше репозиторіїв для підтримки

## Рішення 3: Зробити сервіси приватними (ВАЖЛИВО!)

### Проблема: Vercel за замовчуванням робить проекти публічними

### Рішення A: Service-to-Service Authentication

#### 1. Додати API Key для кожного сервісу

```typescript
// services/auth-service/src/middleware/service-auth.ts
import { Request, Response, NextFunction } from 'express';

const SERVICE_API_KEY = process.env.SERVICE_API_KEY;

export function serviceAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const apiKey = req.headers['x-service-api-key'];
  
  if (!SERVICE_API_KEY || apiKey !== SERVICE_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized service' });
  }
  
  next();
}
```

#### 2. Налаштувати Environment Variables

У кожному сервісі:
```env
SERVICE_API_KEY=your-super-secret-api-key-min-32-chars
```

У Dashboard:
```env
AUTH_SERVICE_API_KEY=your-super-secret-api-key-min-32-chars
USER_SERVICE_API_KEY=your-super-secret-api-key-min-32-chars
PROJECT_SERVICE_API_KEY=your-super-secret-api-key-min-32-chars
TASK_SERVICE_API_KEY=your-super-secret-api-key-min-32-chars
```

#### 3. Оновити клієнти

```typescript
// dashboard/lib/auth-service.ts
const AUTH_SERVICE_URL = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL;
const AUTH_SERVICE_API_KEY = process.env.AUTH_SERVICE_API_KEY; // Server-side only!

export async function proxyToAuthService(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers = new Headers(options.headers);
  
  // Додати API key для service-to-service auth
  if (AUTH_SERVICE_API_KEY) {
    headers.set('X-Service-API-Key', AUTH_SERVICE_API_KEY);
  }
  
  return fetch(`${AUTH_SERVICE_URL}/api${endpoint}`, {
    ...options,
    headers,
  });
}
```

### Рішення B: IP Whitelist (обмежено)

Vercel не підтримує IP whitelist на Hobby плані. Потрібен Pro план.

### Рішення C: Використати Vercel Edge Config + Middleware

```typescript
// dashboard/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Перевірити, чи запит йде з нашого домену
  const origin = request.headers.get('origin');
  const allowedOrigins = [
    'https://your-app.vercel.app',
    'https://yourdomain.com',
  ];
  
  if (origin && !allowedOrigins.includes(origin)) {
    return new NextResponse('Forbidden', { status: 403 });
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
```

### Рішення D: Використати альтернативні платформи

#### Railway (рекомендовано для приватних сервісів)

- ✅ Приватні сервіси за замовчуванням
- ✅ Легкий деплой з GitHub
- ✅ Docker підтримка
- ✅ Дешевше за Vercel для постійно працюючих сервісів

#### Render

- ✅ Приватні сервіси
- ✅ Docker підтримка
- ✅ Автоматичний деплой з GitHub

#### Fly.io

- ✅ Приватні сервіси
- ✅ Глобальне розповсюдження
- ✅ Docker підтримка

## Рекомендована архітектура для Vercel

### Гібридний підхід:

```
┌─────────────────────────────────┐
│   Dashboard (Vercel)            │
│   https://your-app.vercel.app   │
│   Публічний                     │
└─────────────────────────────────┘
              │
              │ (Service-to-Service Auth)
              │
    ┌─────────┼─────────┐
    │         │         │
    ▼         ▼         ▼
┌────────┐ ┌────────┐ ┌────────┐
│ Auth   │ │ User   │ │ Project│
│ Service│ │ Service│ │ Service│
│        │ │        │ │        │
│ Railway│ │ Railway│ │ Railway│
│ (приват)│ │ (приват)│ │ (приват)│
└────────┘ └────────┘ └────────┘
```

**Dashboard на Vercel** (публічний, з CDN)  
**Мікросервіси на Railway** (приватні, з service-to-service auth)

## Покрокова інструкція для Railway

### 1. Створити Railway проект

```bash
# Встановити Railway CLI
npm i -g @railway/cli

# Логін
railway login

# Створити проект
railway init
```

### 2. Налаштувати деплой з GitHub

1. Підключити GitHub репозиторій
2. Вказати root директорію: `services/auth-service`
3. Railway автоматично визначить Dockerfile

### 3. Налаштувати Environment Variables

```env
DATABASE_URL=postgresql://...
JWT_SECRET=...
SERVICE_API_KEY=...
ALLOWED_ORIGINS=https://your-app.vercel.app
```

### 4. Отримати приватний URL

Railway надає приватний URL типу:
```
https://auth-service-production.up.railway.app
```

Цей URL доступний тільки з ваших інших сервісів (якщо налаштувати правильно).

## Налаштування для Dashboard на Vercel

```env
# Vercel Environment Variables
NEXT_PUBLIC_AUTH_SERVICE_URL=https://auth-service-production.up.railway.app
AUTH_SERVICE_API_KEY=your-secret-api-key

NEXT_PUBLIC_USER_SERVICE_URL=https://user-service-production.up.railway.app
USER_SERVICE_API_KEY=your-secret-api-key

# ... тощо
```

## Додаткова безпека

### 1. Використати mTLS (mutual TLS)

Для production - налаштувати mTLS між сервісами.

### 2. Використати Vercel Edge Config

Зберігати API keys в Edge Config (зашифровано).

### 3. Rate Limiting

Додати rate limiting на кожен сервіс.

### 4. Monitoring

Налаштувати monitoring для виявлення підозрілих запитів.

## Чеклист безпеки

- [ ] Додати Service-to-Service Authentication (API keys)
- [ ] Використати HTTPS для всіх з'єднань
- [ ] Налаштувати CORS правильно
- [ ] Додати rate limiting
- [ ] Використати приватні сервіси (Railway/Render) або захистити публічні
- [ ] Налаштувати monitoring та алерти
- [ ] Регулярно ротувати API keys
- [ ] Використати environment variables для секретів (не хардкодити)

## Висновок

**Для production рекомендую:**

1. **Dashboard** → Vercel (публічний, з CDN)
2. **Мікросервіси** → Railway/Render (приватні)
3. **Service-to-Service Auth** → API keys + HTTPS
4. **Monitoring** → Vercel Analytics + Railway Metrics

Це дає найкращий баланс між продуктивністю, безпекою та вартістю.

