# 🔗 Підключення Dashboard до Auth Service на Vercel

## Швидке налаштування

### 1. Додайте змінні оточення в Dashboard проект на Vercel

Перейдіть в **Settings** → **Environment Variables** вашого Dashboard проекту на Vercel і додайте:

```env
# URL Auth Service (публічна змінна)
NEXT_PUBLIC_AUTH_SERVICE_URL=https://flow-auth-service.vercel.app

# API Key для service-to-service аутентифікації (приватна, server-side only)
AUTH_SERVICE_API_KEY=ea2a45bbaa25e45f2bb8f1cb2d7997f19524a5edbae5f9d476053577e17bd8c9
```

**Важливо:**
- `NEXT_PUBLIC_AUTH_SERVICE_URL` - публічна змінна (доступна в браузері)
- `AUTH_SERVICE_API_KEY` - **НЕ** має префікс `NEXT_PUBLIC_` (приватна, тільки server-side)

### 2. Перезапустіть Dashboard проект

Після додавання змінних:
1. Перейдіть в **Deployments**
2. Натисніть **Redeploy** на останньому deployment
3. Або зробіть новий commit і push

### 3. Перевірте підключення

Відкрийте консоль браузера на вашому Dashboard і перевірте, що запити йдуть на правильний URL:

```javascript
// В консолі браузера
console.log(process.env.NEXT_PUBLIC_AUTH_SERVICE_URL);
// Має показати: https://flow-auth-service.vercel.app
```

## Локальна розробка

Для локальної розробки створіть файл `dashboard/.env.local`:

```env
# Локальна розробка - використовує локальний auth-service
NEXT_PUBLIC_AUTH_SERVICE_URL=http://localhost:3002

# API Key (той самий, що на Vercel)
AUTH_SERVICE_API_KEY=ea2a45bbaa25e45f2bb8f1cb2d7997f19524a5edbae5f9d476053577e17bd8c9
```

**Примітка:** Для локальної розробки потрібно запустити auth-service локально на порту 3002.

## Як це працює

### Архітектура підключення:

```
Dashboard (Next.js)
    │
    ├─► NEXT_PUBLIC_AUTH_SERVICE_URL=https://flow-auth-service.vercel.app
    ├─► AUTH_SERVICE_API_KEY (server-side only)
    │
    ▼
Auth Service (Vercel)
    │
    ├─► Перевіряє X-Service-API-Key header ✅
    ├─► Перевіряє JWT Token (якщо потрібно) ✅
    │
    ▼
Відповідь
```

### Код підключення:

Dashboard використовує `dashboard/lib/auth-service.ts`:

```typescript
const AUTH_SERVICE_URL = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost:3002';

// Server-side запити автоматично додають API key
const serviceApiKey = typeof window === 'undefined' 
  ? process.env.AUTH_SERVICE_API_KEY 
  : undefined;
```

## Доступні endpoints

Після налаштування, Dashboard може викликати:

- `POST /api/auth/signup` - Реєстрація
- `POST /api/auth/login` - Вхід
- `POST /api/auth/logout` - Вихід
- `GET /api/auth/me` - Отримати поточного користувача
- `POST /api/auth/verify-email` - Підтвердити email

## Troubleshooting

### Проблема: "Service API key is required"

**Рішення:**
1. Перевірте, що `AUTH_SERVICE_API_KEY` додано в Vercel Environment Variables
2. Перевірте, що змінна **НЕ** має префікс `NEXT_PUBLIC_`
3. Перезапустіть Dashboard проект

### Проблема: "Failed to fetch" або CORS помилки

**Рішення:**
1. Перевірте, що `NEXT_PUBLIC_AUTH_SERVICE_URL` правильно встановлено
2. Перевірте, що auth-service доступний: `https://flow-auth-service.vercel.app/health`
3. Перевірте, що URL не має trailing slash: `https://flow-auth-service.vercel.app` (не `/` в кінці)

### Проблема: Запити йдуть на localhost замість Vercel

**Рішення:**
1. Перевірте, що `NEXT_PUBLIC_AUTH_SERVICE_URL` встановлено в Vercel
2. Перевірте, що змінна має префікс `NEXT_PUBLIC_` (для публічних змінних)
3. Перезапустіть проект після додавання змінних

## Перевірка роботи

### 1. Health check

```bash
curl https://flow-auth-service.vercel.app/health
```

Очікуваний результат:
```json
{
  "status": "healthy",
  "service": "auth-service",
  "timestamp": "..."
}
```

### 2. Тест з API key (має повернути 401 без JWT)

```bash
curl https://flow-auth-service.vercel.app/api/auth/me \
  -H "X-Service-API-Key: ea2a45bbaa25e45f2bb8f1cb2d7997f19524a5edbae5f9d476053577e17bd8c9"
```

Очікуваний результат: 401 (бо немає JWT token, але API key прийнято)

### 3. Тест без API key (має повернути 401)

```bash
curl https://flow-auth-service.vercel.app/api/auth/me
```

Очікуваний результат:
```json
{
  "error": "Unauthorized",
  "message": "Service API key is required"
}
```

## Додаткові ресурси

- [API Keys Setup](./API_KEYS_SETUP.md) - Детальна інструкція по API keys
- [Vercel API Auth Setup](./VERCEL_API_AUTH_SETUP.md) - Загальна інформація про аутентифікацію

