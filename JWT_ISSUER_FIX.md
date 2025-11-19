# 🔐 Виправлення JWT Issuer Claim

## Проблема

Мікросервіси повертали помилку 500 з повідомленням:
```
"error":{"claim":"iss","code":"ERR_JWT_CLAIM_VALIDATION_FAILED","reason":"missing"}
```

## Причина

1. **Auth-service** генерує токени з `iss` (issuer) claim ✅
2. **Project-service** перевіряє токени з `iss` claim ✅
3. **Dashboard** створював локальні session токени **БЕЗ** `iss` claim ❌

Коли dashboard використовував `session` token як fallback замість `auth_token`, мікросервіс не міг валідувати токен через відсутність `iss` claim.

## Рішення

### 1. Додано `iss` claim до session токенів

**Файл:** `dashboard/lib/auth.ts`

**До:**
```typescript
const token = await new SignJWT({ ...data })
  .setProtectedHeader({ alg: 'HS256' })
  .setIssuedAt()
  .setExpirationTime('1h')
  .sign(JWT_SECRET);
```

**Після:**
```typescript
const JWT_ISSUER = process.env.JWT_ISSUER || 'project-scope-analyzer';

const token = await new SignJWT({ ...data })
  .setProtectedHeader({ alg: 'HS256' })
  .setIssuedAt()
  .setExpirationTime('1h')
  .setIssuer(JWT_ISSUER) // Add issuer claim for microservice compatibility
  .sign(JWT_SECRET);
```

### 2. Додано перевірку `iss` claim при валідації

**До:**
```typescript
const { payload } = await jwtVerify(token, JWT_SECRET);
```

**Після:**
```typescript
const JWT_ISSUER = process.env.JWT_ISSUER || 'project-scope-analyzer';
const { payload } = await jwtVerify(token, JWT_SECRET, {
  issuer: JWT_ISSUER, // Verify issuer claim matches
});
```

## Environment Variables

Переконайтеся, що `JWT_ISSUER` встановлено однаково в усіх сервісах:

### Dashboard (Vercel):
```bash
JWT_ISSUER=project-scope-analyzer
```

### Auth Service (Vercel):
```bash
JWT_ISSUER=project-scope-analyzer
```

### Project Service (Vercel):
```bash
JWT_ISSUER=project-scope-analyzer
```

**Важливо:** Значення має бути **однаковим** в усіх сервісах!

## Перевірка

Після виправлення:

1. **Нові session токени** будуть мати `iss` claim
2. **Мікросервіси** зможуть валідувати session токени
3. **Fallback до session token** буде працювати

### Очікувані логи:

**Успішно:**
```
✅ Found auth_token cookie
✅ Added Authorization header
✅ Added X-Service-API-Key header
📤 Making request to microservice: ...
✅ Microservice response received: { status: 200, hasProject: true }
```

**Або з fallback:**
```
⚠️ Using session token as fallback (may not work with microservice)
✅ Added Authorization header
✅ Added X-Service-API-Key header
📤 Making request to microservice: ...
✅ Microservice response received: { status: 200, hasProject: true }
```

## Важливо

### Старі токени не працюватимуть

Якщо користувач має старий `session` token без `iss` claim, йому потрібно:
1. Вийти з системи
2. Увійти знову
3. Отримати новий токен з `iss` claim

### JWT_SECRET має бути однаковим

Також переконайтеся, що `JWT_SECRET` однаковий в:
- Dashboard
- Auth Service
- Project Service
- User Service
- Task Service

## Статус

✅ **Виправлено** в `dashboard/lib/auth.ts`  
✅ **Додано `iss` claim** до session токенів  
✅ **Додано перевірку `iss` claim** при валідації  
⚠️ **Потрібно встановити `JWT_ISSUER`** в Vercel environment variables  

---

**Дата виправлення:** 2024-11-19  
**Файли змінено:** 1  
**Рядків коду:** +4  

