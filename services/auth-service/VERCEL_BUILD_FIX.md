# Виправлення помилок build на Vercel

## Проблема 1: Invalid 'main' field

**Помилка:** `Invalid 'main' field in '/var/task/services/auth-service/node_modules/@project-scope-analyzer/shared/package.json' of 'dist/index.js'`

**Причина:** Файл `dist/index.js` не існує після build, або шлях неправильний.

**Рішення:**
- Переконайтеся, що `shared` пакет зібрано перед build сервісу
- Build command тепер автоматично збирає shared: `cd ../../shared && npm install && npm run build`

## Проблема 2: Cannot find module './lib/modern' в redis-errors

**Помилка:** `Cannot find module './lib/modern'` в redis-errors

**Причина:** `redis-errors` не встановлений як залежність, або версія ioredis несумісна.

**Рішення:**
- Додано `redis-errors: ^1.2.0` в dependencies shared пакету
- Додано `redis-errors: ^1.2.0` в dependencies auth-service
- Переконайтеся, що версії сумісні

## Проблема 3: Deprecated warnings

**Помилки:** 
- `rimraf@3.0.2` deprecated
- `inflight@1.0.6` deprecated
- `glob@7.2.3` deprecated
- `eslint@8.57.1` deprecated

**Рішення:**
- Це warnings, не критичні помилки
- Можна оновити залежності пізніше
- Не впливають на роботу додатку

## Build Process на Vercel

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build shared package:**
   ```bash
   cd ../../shared
   npm install
   npm run build
   ```

3. **Build auth-service:**
   ```bash
   cd ../../services/auth-service
   npm install
   npm run build
   ```

4. **Vercel автоматично:**
   - Компілює TypeScript
   - Створює serverless function з `api/index.ts`

## Перевірка після build

Переконайтеся, що існують:
- `shared/dist/index.js` ✅
- `shared/dist/index.d.ts` ✅
- `services/auth-service/dist/api/index.js` ✅
- `services/auth-service/dist/src/app.js` ✅

## Environment Variables

Не забудьте додати в Vercel:
- `DATABASE_URL`
- `JWT_SECRET`
- `REDIS_URL`
- `SERVICE_API_KEY`
- `NODE_ENV=production`

