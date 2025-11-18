# Деплой мікросервісів на Vercel

## Як працює Vercel

Vercel - це **serverless платформа**, яка працює інакше, ніж Docker:

- ❌ **НЕ використовуються порти** (3002, 3003, 3004, тощо)
- ✅ **Кожен сервіс - окремий Vercel проект** зі своїм URL
- ✅ **Автоматичне масштабування** та CDN
- ✅ **Serverless функції** замість постійно працюючих серверів

## Архітектура на Vercel

```
┌─────────────────────────────────────────┐
│         Vercel Dashboard                │
│  (Next.js App - ваш основний проект)    │
│  https://your-app.vercel.app            │
└─────────────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
        ▼           ▼           ▼
┌──────────┐ ┌──────────┐ ┌──────────┐
│ Auth     │ │ User     │ │ Project  │
│ Service  │ │ Service  │ │ Service  │
│          │ │          │ │          │
│ vercel   │ │ vercel   │ │ vercel   │
│ .app/    │ │ .app/    │ │ .app/    │
│ auth     │ │ user     │ │ project  │
└──────────┘ └──────────┘ └──────────┘
```

## Крок 1: Створити окремі Vercel проекти для кожного сервісу

### Варіант A: Окремі репозиторії (рекомендовано)

1. **Auth Service** → окремий репозиторій → Vercel проект
2. **User Service** → окремий репозиторій → Vercel проект
3. **Project Service** → окремий репозиторій → Vercel проект
4. **Task Service** → окремий репозиторій → Vercel проект

### Варіант B: Monorepo з Vercel (складніше)

Використовувати Vercel Monorepo з `vercel.json` для кожного сервісу.

## Крок 2: Налаштувати Environment Variables

### У Dashboard проекті (Next.js):

```env
# Vercel Environment Variables
NEXT_PUBLIC_AUTH_SERVICE_URL=https://auth-service.vercel.app
NEXT_PUBLIC_USER_SERVICE_URL=https://user-service.vercel.app
NEXT_PUBLIC_PROJECT_SERVICE_URL=https://project-service.vercel.app
NEXT_PUBLIC_TASK_SERVICE_URL=https://task-service.vercel.app

# Або якщо використовуєте custom domains:
# NEXT_PUBLIC_AUTH_SERVICE_URL=https://auth.yourdomain.com
# NEXT_PUBLIC_USER_SERVICE_URL=https://user.yourdomain.com
```

### У кожному мікросервісі:

```env
# Auth Service
DATABASE_URL=postgresql://...
JWT_SECRET=...
REDIS_URL=...

# User Service
DATABASE_URL=postgresql://...
JWT_SECRET=...
REDIS_URL=...

# Project Service
DATABASE_URL=postgresql://...
JWT_SECRET=...
REDIS_URL=...

# Task Service
DATABASE_URL=postgresql://...
JWT_SECRET=...
REDIS_URL=...
```

## Крок 3: Адаптувати сервіси для Vercel

### Проблема: Express.js не працює на Vercel

Vercel використовує **serverless functions**, а не Express сервери.

### Рішення: Створити API Routes для кожного сервісу

Замість Express, створити Next.js API Routes або використати адаптер:

#### Варіант 1: Переписати на Next.js API Routes (рекомендовано)

Створити `api/` папку в кожному сервісі:

```
services/auth-service/
├── api/
│   ├── login/
│   │   └── route.ts
│   ├── signup/
│   │   └── route.ts
│   └── me/
│       └── route.ts
└── package.json
```

#### Варіант 2: Використати Vercel Serverless Functions адаптер

```typescript
// vercel.json
{
  "functions": {
    "src/index.ts": {
      "runtime": "nodejs18.x"
    }
  },
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    }
  ]
}
```

#### Варіант 3: Використати Hono або інший lightweight framework

Hono працює добре з Vercel Edge Functions.

## Крок 4: Налаштувати CORS

Оскільки сервіси на різних доменах, потрібно налаштувати CORS:

```typescript
// У кожному сервісі
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || 'https://your-app.vercel.app',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
};
```

## Крок 5: Налаштувати API Gateway (опціонально)

### Варіант A: Використати Next.js API Routes як Gateway

У Dashboard проекті створити проксі:

```typescript
// dashboard/app/api/proxy/auth/[...path]/route.ts
export async function GET(request: Request, { params }: { params: { path: string[] } }) {
  const path = params.path.join('/');
  const authServiceUrl = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL;
  
  const response = await fetch(`${authServiceUrl}/api/${path}`, {
    headers: {
      'Authorization': request.headers.get('Authorization') || '',
    },
  });
  
  return response;
}
```

### Варіант B: Використати Cloudflare Workers або AWS API Gateway

Для більш складних випадків.

## Крок 6: Database та Redis

### Database (PostgreSQL)

- ✅ **Neon** - serverless PostgreSQL, працює з Vercel
- ✅ **Supabase** - альтернатива
- ✅ **PlanetScale** - MySQL (якщо потрібно)

### Redis

- ✅ **Upstash** - serverless Redis, працює з Vercel
- ✅ **Redis Cloud** - managed Redis

## Приклад конфігурації для Vercel

### `vercel.json` для Auth Service:

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

## Переваги Vercel

✅ **Автоматичне масштабування** - не потрібно налаштовувати  
✅ **CDN** - швидкий доступ з будь-якої точки світу  
✅ **HTTPS** - автоматичний SSL  
✅ **Zero-config** - мінімум налаштувань  
✅ **Edge Functions** - дуже швидкі  

## Недоліки Vercel

⚠️ **Cold starts** - перший запит може бути повільним  
⚠️ **Timeout** - максимум 60 секунд для Hobby плану  
⚠️ **Вартість** - може бути дорожче за власний сервер при високому навантаженні  
⚠️ **Vendor lock-in** - прив'язка до Vercel  

## Рекомендації

1. **Для початку**: Використати Vercel для всіх сервісів
2. **Для production**: Розглянути гібридний підхід:
   - Dashboard на Vercel
   - Мікросервіси на Railway, Render, або AWS Lambda
3. **Для масштабування**: Використати Kubernetes (GKE, EKS) або Docker Swarm

## Чеклист деплою

- [ ] Створити окремі Vercel проекти для кожного сервісу
- [ ] Налаштувати environment variables
- [ ] Адаптувати Express сервіси для Vercel (або переписати на API Routes)
- [ ] Налаштувати CORS
- [ ] Налаштувати Database (Neon/Supabase)
- [ ] Налаштувати Redis (Upstash)
- [ ] Протестувати всі endpoints
- [ ] Налаштувати monitoring (Vercel Analytics)
- [ ] Налаштувати custom domains (опціонально)

