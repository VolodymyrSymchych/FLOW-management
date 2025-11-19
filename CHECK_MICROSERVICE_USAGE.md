# 🔍 Як перевірити, чи використовується мікросервіс

## Проблема

Якщо в логах Vercel ви бачите:
```
External APIs: No outgoing requests
```

Це означає, що **мікросервіс НЕ використовується**, і дешборд використовує локальну базу даних (fallback).

## ✅ Як перевірити

### 1. Перевірте Environment Variables в Vercel

Зайдіть в **Dashboard проект на Vercel** → **Settings** → **Environment Variables**

Перевірте, чи встановлено:
```bash
NEXT_PUBLIC_PROJECT_SERVICE_URL=https://your-project-service.vercel.app
PROJECT_SERVICE_API_KEY=74e6a18738805e921aca6277c254fec93b27753eca26923803d014654b0f8438
```

### 2. Перевірте логи Vercel

Після запиту до `/api/projects/3`, перевірте **Function Logs** в Vercel:

**Якщо використовується мікросервіс:**
```
🔗 Using project-service microservice: https://your-project-service.vercel.app
🔍 ProjectService.getProject called: { projectId: 3, serviceUrl: '...', baseURL: '...' }
📤 Making request to microservice: { url: '...', hasAuthToken: true, hasApiKey: true }
✅ Microservice response received: { status: 200, hasProject: true }
✅ Got project from microservice: 3
```

**Якщо НЕ використовується мікросервіс:**
```
⚠️ NEXT_PUBLIC_PROJECT_SERVICE_URL not set, using local storage
📦 Using local database storage (fallback)
```

АБО

```
🔗 Using project-service microservice: http://localhost:3004
❌ Microservice request failed: { message: '...', code: 'ECONNREFUSED' }
⚠️ Project service error, falling back to local storage: ...
📦 Using local database storage (fallback)
```

### 3. Перевірте Network Tab в браузері

Відкрийте **Developer Tools** → **Network Tab** і зробіть запит до проекту.

**Якщо використовується мікросервіс:**
- Ви побачите запит до `https://your-project-service.vercel.app/api/projects/3`
- Заголовок `X-Service-API-Key` буде присутній

**Якщо НЕ використовується:**
- Всі запити йдуть на `/api/projects/3` (той самий домен)
- Немає зовнішніх запитів

### 4. Перевірте в коді

Відкрийте `dashboard/app/api/projects/[id]/route.ts` і подивіться на логи:

```typescript
// Рядок 34-36
const projectServiceUrl = process.env.NEXT_PUBLIC_PROJECT_SERVICE_URL;

if (projectServiceUrl) {
  console.log('🔗 Using project-service microservice:', projectServiceUrl);
  // ...
} else {
  console.log('⚠️ NEXT_PUBLIC_PROJECT_SERVICE_URL not set, using local storage');
}
```

## 🔧 Як виправити

### Крок 1: Додайте Environment Variables в Vercel

1. Зайдіть в **Dashboard проект** на Vercel
2. **Settings** → **Environment Variables**
3. Додайте:

```bash
NEXT_PUBLIC_PROJECT_SERVICE_URL=https://your-project-service.vercel.app
PROJECT_SERVICE_API_KEY=74e6a18738805e921aca6277c254fec93b27753eca26923803d014654b0f8438
```

**Важливо:** Замініть `https://your-project-service.vercel.app` на реальний URL вашого project-service!

### Крок 2: Перезапустіть Deployment

Після додавання змінних:
1. Перейдіть в **Deployments**
2. Натисніть **Redeploy** на останньому deployment
3. Або зробіть новий commit і push

### Крок 3: Перевірте логи

Після redeploy, зробіть запит до `/api/projects/3` і перевірте логи:
- Має з'явитися `🔗 Using project-service microservice`
- Має з'явитися `✅ Got project from microservice`

## 📊 Очікувані результати

### ✅ Успішне використання мікросервісу:

**Vercel Logs:**
```
External APIs: 1 outgoing request
  → GET https://your-project-service.vercel.app/api/projects/3 (200ms)
```

**Console Logs:**
```
🔗 Using project-service microservice: https://your-project-service.vercel.app
🔍 ProjectService.getProject called: ...
📤 Making request to microservice: ...
✅ Microservice response received: ...
✅ Got project from microservice: 3
```

### ❌ Fallback до локальної БД:

**Vercel Logs:**
```
External APIs: No outgoing requests
```

**Console Logs:**
```
⚠️ NEXT_PUBLIC_PROJECT_SERVICE_URL not set, using local storage
📦 Using local database storage (fallback)
```

АБО

```
🔗 Using project-service microservice: http://localhost:3004
❌ Microservice request failed: ...
⚠️ Project service error, falling back to local storage: ...
📦 Using local database storage (fallback)
```

## 🎯 Чому це важливо

1. **Мікросервіси** = масштабованість, незалежне розгортання
2. **Локальна БД** = fallback, працює, але не масштабується
3. **Перевірка** = впевненість, що архітектура працює правильно

## 📝 Checklist

- [ ] `NEXT_PUBLIC_PROJECT_SERVICE_URL` встановлено в Vercel
- [ ] `PROJECT_SERVICE_API_KEY` встановлено в Vercel
- [ ] URL вказує на правильний домен (не localhost!)
- [ ] Deployment перезапущено після додавання змінних
- [ ] Логи показують використання мікросервісу
- [ ] Network Tab показує зовнішні запити
- [ ] Vercel Logs показують "External APIs: 1 outgoing request"

---

**Останнє оновлення:** 2024-11-19  
**Файли з логуванням:** 
- `dashboard/app/api/projects/[id]/route.ts`
- `dashboard/lib/project-service.ts`

