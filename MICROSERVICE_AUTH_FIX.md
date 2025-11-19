# 🔐 Виправлення автентифікації для мікросервісів

## Проблема

При спробі викликати project-service з дешборда виникала помилка:

```
Project service error, falling back to local storage: {
  message: 'Missing or invalid authorization header',
  code: 'UNAUTHORIZED',
  statusCode: 401
}
```

## Причина

Мікросервіс `project-service` вимагає **ОБИДВА** заголовки:

1. **`X-Service-API-Key`** - для service-to-service автентифікації
2. **`Authorization: Bearer <token>`** - для user автентифікації

Проблема була в тому, що:
- `X-Service-API-Key` передавався правильно ✅
- `Authorization` header не передавався або передавався неправильно ❌

## Рішення

### 1. Покращено отримання JWT токену

**Файл:** `dashboard/lib/project-service.ts`

**До:**
```typescript
private async getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('auth_token')?.value || null;
}
```

**Після:**
```typescript
private async getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  
  // Try auth_token first (from auth-service)
  const authToken = cookieStore.get('auth_token')?.value;
  if (authToken) {
    return authToken;
  }
  
  // Fallback to session token (local dashboard session)
  const sessionToken = cookieStore.get('session')?.value;
  if (sessionToken) {
    return sessionToken;
  }
  
  return null;
}
```

### 2. Додано детальне логування

Тепер в логах Vercel ви побачите:

```
✅ Found auth_token cookie
✅ Added Authorization header
✅ Added X-Service-API-Key header
📋 Request headers: { hasAuth: true, hasApiKey: true }
📤 Making request to microservice: ...
```

Або якщо є проблема:

```
⚠️ No auth token found in cookies
⚠️ No auth token available - request may fail
```

## Перевірка

### 1. Переконайтеся, що користувач залогінений

Користувач повинен бути залогінений через `/api/auth/login`, який встановлює cookie `auth_token`.

### 2. Перевірте Environment Variables

В **Dashboard проект на Vercel** мають бути встановлені:

```bash
NEXT_PUBLIC_PROJECT_SERVICE_URL=https://flow-project-service.vercel.app
PROJECT_SERVICE_API_KEY=74e6a18738805e921aca6277c254fec93b27753eca26923803d014654b0f8438
```

### 3. Перевірте логи Vercel

Після запиту до `/api/projects/3`, перевірте **Function Logs**:

**Успішно:**
```
✅ Found auth_token cookie
✅ Added Authorization header
✅ Added X-Service-API-Key header
📤 Making request to microservice: ...
✅ Microservice response received: { status: 200, hasProject: true }
```

**Помилка:**
```
❌ No auth token found in cookies
⚠️ No auth token available - request may fail
❌ Microservice request failed: { message: 'Missing or invalid authorization header' }
```

## Важливо

### JWT Token має бути від auth-service

Мікросервіс очікує JWT токен, який був виданий **auth-service**, а не локальний session token.

Якщо користувач залогінений через:
- ✅ `/api/auth/login` → `auth_token` cookie встановлюється → працює
- ❌ Прямий доступ до dashboard → тільки `session` cookie → може не працювати

### Fallback до session token

Якщо `auth_token` не знайдено, код використовує `session` token як fallback, але він може не працювати з мікросервісом, якщо:
- JWT_SECRET різний між dashboard і мікросервісом
- Формат токену не відповідає очікуваному

## Рекомендації

1. **Завжди логіньтеся через `/api/auth/login`** - це гарантує правильний `auth_token`
2. **Перевіряйте логи** - вони покажуть, який токен використовується
3. **Переконайтеся, що JWT_SECRET однаковий** в dashboard і мікросервісах

## Статус

✅ **Виправлено** в `dashboard/lib/project-service.ts`  
✅ **Додано логування** для діагностики  
✅ **Додано fallback** до session token  

---

**Дата виправлення:** 2024-11-19  
**Файли змінено:** 1  
**Рядків коду:** +25  

