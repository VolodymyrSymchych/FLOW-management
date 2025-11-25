# ⚠️ КРИТИЧНО: ВИТІК СЕКРЕТІВ ВИЯВЛЕНО

## 🚨 ЩО СТАЛОСЯ?

Під час аудиту безпеки було виявлено, що наступні секрети **потенційно скомпрометовані** через зберігання в `.env` файлах:

### Скомпрометовані credentials:

1. **Database (Neon PostgreSQL)**
   - Connection string з паролем
   - Файл: `dashboard/.env.local`, `services/auth-service/.env`

2. **OAuth Credentials**
   - Google Client ID & Secret
   - Microsoft Client ID & Secret
   - Файл: `.env`

3. **Stripe API Keys**
   - Secret Key (test mode)
   - Publishable Key
   - Webhook Secret
   - Файл: `dashboard/.env.local`

4. **Cloud Storage (Cloudflare R2)**
   - Access Key ID
   - Secret Access Key
   - Файл: `dashboard/.env.local`

5. **Redis (Upstash)**
   - REST URL
   - REST Token
   - Файл: `dashboard/.env.local`

6. **JWT Secret**
   - Слабкий default secret
   - Файл: `services/auth-service/.env`

---

## ✅ ЩО ВЖЕТО

### Автоматичні захисти додано:

1. ✅ **Оновлено `.gitignore`**
   - Додано всі патерни `.env` файлів
   - Файли більше не будуть комітитись

2. ✅ **Створено pre-commit hook**
   - Автоматична перевірка перед кожним commit
   - Блокує commit з секретами
   - Файл: `.husky/pre-commit`

3. ✅ **Створено скрипт для .env.example**
   - Автоматична генерація безпечних шаблонів
   - Файл: `scripts/create-env-examples.sh`

4. ✅ **Документація безпеки**
   - Повний гайд з безпеки
   - Файл: `SECURITY.md`

---

## 🔥 НЕГАЙНІ ДІЇ (ЗРОБІТЬ ЗАРАЗ!)

### 1. Змініть ВСІ паролі та ключі:

#### A. Neon Database:
```bash
# 1. Зайдіть в Neon Console: https://console.neon.tech/
# 2. Виберіть ваш проект
# 3. Settings → Reset Password
# 4. Скопіюйте новий connection string
# 5. Оновіть .env.local та .env в auth-service
```

#### B. Stripe:
```bash
# 1. Зайдіть в Stripe Dashboard: https://dashboard.stripe.com/
# 2. Developers → API keys
# 3. Roll your secret key (якщо це test key - менш критично)
# 4. Regenerate webhook secret
# 5. Оновіть .env.local
```

#### C. Google OAuth:
```bash
# 1. Google Cloud Console: https://console.cloud.google.com/
# 2. APIs & Services → Credentials
# 3. Знайдіть OAuth 2.0 Client
# 4. Regenerate client secret
# 5. Оновіть .env
```

#### D. Microsoft OAuth:
```bash
# 1. Azure Portal: https://portal.azure.com/
# 2. Azure Active Directory → App registrations
# 3. Знайдіть вашу app
# 4. Certificates & secrets → New client secret
# 5. Видаліть старий secret
# 6. Оновіть .env
```

#### E. Cloudflare R2:
```bash
# 1. Cloudflare Dashboard: https://dash.cloudflare.com/
# 2. R2 → Manage R2 API Tokens
# 3. Revoke старий токен
# 4. Create new API token
# 5. Оновіть .env.local
```

#### F. Upstash Redis:
```bash
# 1. Upstash Console: https://console.upstash.com/
# 2. Виберіть вашу database
# 3. Details → REST API
# 4. Regenerate token (якщо можливо)
# 5. Або створіть нову database
# 6. Оновіть .env.local
```

#### G. JWT Secret:
```bash
# Згенеруйте новий сильний secret:
openssl rand -base64 64

# Оновіть в services/auth-service/.env:
# JWT_SECRET=<новий_secret>
```

### 2. Перевірте логи на підозрілу активність:

```bash
# Neon Database - перевірте Connection logs
# Stripe - перевірте Events log
# Cloudflare R2 - перевірте Access logs
# Google/Microsoft - перевірте Sign-in logs
```

### 3. Сповістіть команду:

```
📢 УВАГА: Виявлено витік credentials!
Всі члени команди повинні:
1. Оновити локальні .env файли
2. Отримати нові credentials
3. Перезапустити локальні сервіси
```

---

## 📋 Checklist дій

- [ ] Змінено Neon Database password
- [ ] Змінено Stripe API keys
- [ ] Змінено Google OAuth credentials
- [ ] Змінено Microsoft OAuth credentials
- [ ] Змінено Cloudflare R2 tokens
- [ ] Змінено Upstash Redis tokens
- [ ] Згенеровано новий JWT secret
- [ ] Перевірено логи всіх сервісів
- [ ] Оновлено .env файли локально
- [ ] Перезапущено всі сервіси
- [ ] Команда сповіщена
- [ ] Документовано інцидент

---

## 📚 Наступні кроки

1. **Прочитайте** [SECURITY.md](./SECURITY.md) - повний гайд з безпеки

2. **Використовуйте pre-commit hook:**
   ```bash
   # Встановіть husky (якщо ще не встановлено)
   npm install -D husky
   npx husky install
   ```

3. **Навчіться генерувати .env.example:**
   ```bash
   # Запустіть скрипт
   ./scripts/create-env-examples.sh
   ```

4. **Налаштуйте production secrets:**
   - Для Vercel: Dashboard → Settings → Environment Variables
   - Для інших платформ: див. [SECURITY.md](./SECURITY.md)

---

## 🆘 Допомога

**Питання?** Зверніться до:
- Security Lead
- DevOps Team
- #security в Slack

**Потрібна допомога з ротацією секретів?**
- Створіть ticket з тегом `security-incident`
- Напишіть в #security

---

**Дата виявлення:** 2025-11-25
**Статус:** 🟡 В процесі виправлення
**Пріоритет:** 🔴 CRITICAL
