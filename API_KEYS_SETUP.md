# 🔐 API Keys для Vercel - Швидка інструкція

## Згенеровані ключі

### 📱 Dashboard (Vercel Environment Variables)

Додайте ці 4 змінні в **Dashboard** проект на Vercel:

```
AUTH_SERVICE_API_KEY=ea2a45bbaa25e45f2bb8f1cb2d7997f19524a5edbae5f9d476053577e17bd8c9
USER_SERVICE_API_KEY=661256d92f7f92dc2ca4041fc22501e1fba2cb0e7a76d2d94b3a94b6da580fdb
PROJECT_SERVICE_API_KEY=74e6a18738805e921aca6277c254fec93b27753eca26923803d014654b0f8438
TASK_SERVICE_API_KEY=d4e53b8990758895c08c46d2d270d7b0e3c00d17f6b9ef473d40580b0afb0f58
```

### 🔧 Auth Service (Vercel Environment Variables)

Додайте цю змінну в **Auth Service** проект на Vercel:

```
SERVICE_API_KEY=ea2a45bbaa25e45f2bb8f1cb2d7997f19524a5edbae5f9d476053577e17bd8c9
```

**Важливо:** Значення має збігатися з `AUTH_SERVICE_API_KEY` з Dashboard!

### 👤 User Service (Vercel Environment Variables)

Додайте цю змінну в **User Service** проект на Vercel:

```
SERVICE_API_KEY=661256d92f7f92dc2ca4041fc22501e1fba2cb0e7a76d2d94b3a94b6da580fdb
```

**Важливо:** Значення має збігатися з `USER_SERVICE_API_KEY` з Dashboard!

### 📁 Project Service (Vercel Environment Variables)

Додайте цю змінну в **Project Service** проект на Vercel:

```
SERVICE_API_KEY=74e6a18738805e921aca6277c254fec93b27753eca26923803d014654b0f8438
```

**Важливо:** Значення має збігатися з `PROJECT_SERVICE_API_KEY` з Dashboard!

### ✅ Task Service (Vercel Environment Variables)

Додайте цю змінну в **Task Service** проект на Vercel:

```
SERVICE_API_KEY=d4e53b8990758895c08c46d2d270d7b0e3c00d17f6b9ef473d40580b0afb0f58
```

**Важливо:** Значення має збігатися з `TASK_SERVICE_API_KEY` з Dashboard!

---

## 📋 Покрокова інструкція

### Крок 1: Dashboard

1. Перейдіть на [Vercel Dashboard](https://vercel.com/dashboard)
2. Виберіть ваш **Dashboard** проект
3. Перейдіть в **Settings** → **Environment Variables**
4. Додайте 4 змінні (див. вище)
5. Оберіть **Production**, **Preview**, та **Development** (якщо потрібно)
6. Натисніть **Save**

### Крок 2: Auth Service

1. Виберіть ваш **Auth Service** проект на Vercel
2. Перейдіть в **Settings** → **Environment Variables**
3. Додайте змінну `SERVICE_API_KEY` зі значенням `ea2a45bbaa25e45f2bb8f1cb2d7997f19524a5edbae5f9d476053577e17bd8c9`
4. Натисніть **Save**

### Крок 3: User Service

1. Виберіть ваш **User Service** проект на Vercel
2. Перейдіть в **Settings** → **Environment Variables**
3. Додайте змінну `SERVICE_API_KEY` зі значенням `661256d92f7f92dc2ca4041fc22501e1fba2cb0e7a76d2d94b3a94b6da580fdb`
4. Натисніть **Save**

### Крок 4: Project Service

1. Виберіть ваш **Project Service** проект на Vercel
2. Перейдіть в **Settings** → **Environment Variables**
3. Додайте змінну `SERVICE_API_KEY` зі значенням `74e6a18738805e921aca6277c254fec93b27753eca26923803d014654b0f8438`
4. Натисніть **Save**

### Крок 5: Task Service

1. Виберіть ваш **Task Service** проект на Vercel
2. Перейдіть в **Settings** → **Environment Variables**
3. Додайте змінну `SERVICE_API_KEY` зі значенням `d4e53b8990758895c08c46d2d270d7b0e3c00d17f6b9ef473d40580b0afb0f58`
4. Натисніть **Save**

### Крок 6: Перезапуск

Після додавання всіх змінних:

1. Перезапустіть всі проекти на Vercel (Redeploy)
2. Перевірте, що всі сервіси працюють
3. Перевірте health checks:
   - `https://auth-service.vercel.app/health`
   - `https://user-service.vercel.app/health`
   - `https://project-service.vercel.app/health`
   - `https://task-service.vercel.app/health`

---

## ⚠️ Безпека

- ✅ Файл `API_KEYS.env` вже додано в `.gitignore`
- ✅ Ключі не будуть закомічені в Git
- ⚠️ НЕ діліться цими ключами
- ⚠️ Використовуйте різні ключі для production та development (якщо потрібно)

---

## 🧪 Тестування

Після налаштування перевірте, що API authentication працює:

### Тест 1: Без API key (має повернути 401)

```bash
curl https://auth-service.vercel.app/api/auth/me
# Очікуваний результат: {"error":"Unauthorized","message":"Service API key is required"}
```

### Тест 2: З API key (має працювати)

```bash
curl https://auth-service.vercel.app/api/auth/me \
  -H "X-Service-API-Key: ea2a45bbaa25e45f2bb8f1cb2d7997f19524a5edbae5f9d476053577e17bd8c9" \
  -H "Authorization: Bearer <your-jwt-token>"
```

### Тест 3: Health check (має працювати без API key)

```bash
curl https://auth-service.vercel.app/health
# Очікуваний результат: {"status":"healthy",...}
```

---

## 📝 Примітки

- Всі ключі мають довжину 64 символи (32 bytes в hex)
- Кожен сервіс має свій унікальний ключ
- Dashboard знає всі ключі для комунікації з усіма сервісами
- Кожен сервіс знає тільки свій ключ

---

## 🔄 Якщо потрібно згенерувати нові ключі

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Повторіть команду для кожного нового ключа.

