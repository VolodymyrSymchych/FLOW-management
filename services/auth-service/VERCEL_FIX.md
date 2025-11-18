# Виправлення помилок деплою на Vercel

## Проблеми та рішення

### 1. Помилка: Cannot find module './lib/modern' в redis-errors

**Причина:** Проблема з залежностями ioredis/redis-errors

**Рішення:** 
- Переконайтеся, що всі залежності встановлені
- Додано `@vercel/node` в devDependencies
- Створено адаптер `api/index.ts` для Vercel

### 2. Помилка: Invalid 'main' field в shared package.json

**Причина:** Неправильний шлях до main файлу

**Рішення:**
- Змінено `"main": "dist/index.js"` на `"main": "./dist/index.js"`
- Додано `exports` field для кращої підтримки

### 3. Express.js не працює на Vercel

**Причина:** Vercel використовує serverless functions, а не Express сервери

**Рішення:**
- Створено адаптер `api/index.ts` який конвертує Express app в Vercel function
- Додано `vercel.json` з правильними налаштуваннями

## Налаштування на Vercel

1. **Root Directory:** `services/auth-service`
2. **Build Command:** `npm run build`
3. **Output Directory:** `dist`
4. **Install Command:** `npm install`

## Environment Variables

Додайте в Vercel:
- `DATABASE_URL`
- `JWT_SECRET`
- `REDIS_URL`
- `SERVICE_API_KEY`
- `NODE_ENV=production`

## Важливо

- Переконайтеся, що `shared` пакет зібрано перед build сервісу
- Build command автоматично збирає shared: `npm run build:shared && tsc`
