# Налаштування Upstash Redis для мікросервісів

## Проблема

У вас є:
- `UPSTASH_REDIS_REST_URL` = `https://supreme-badger-36136.upstash.io`
- `UPSTASH_REDIS_REST_TOKEN` = `AY0oAAIncDI0YzI10TVkY2R1MDE0NDYxO...`

Але це **REST API** URL, а не Redis connection string для ioredis!

## Рішення

### Варіант 1: Використати Redis URL з Upstash Dashboard (рекомендовано)

1. Відкрийте [Upstash Dashboard](https://console.upstash.com/)
2. Виберіть ваш Redis database (`supreme-badger-36136`)
3. Перейдіть в **"Redis"** або **"Details"** вкладку
4. Знайдіть **"Redis URL"** (НЕ REST URL!)
5. Формат буде: `redis://default:TOKEN@HOST:PORT`
6. Скопіюйте цей URL

### Варіант 2: Створити Redis URL вручну

Якщо в Dashboard немає Redis URL, створіть його вручну:

**Формат:**
```
redis://default:TOKEN@HOST:6379
```

**З ваших даних:**
- Host: `supreme-badger-36136.upstash.io` (з REST URL, без `https://`)
- Port: `6379` (стандартний порт Redis)
- Token: значення з `UPSTASH_REDIS_REST_TOKEN`

**Приклад:**
```
redis://default:AY0oAAIncDI0YzI10TVkY2R1MDE0NDYxOWU1YTM5N2JkZTU5YWQ1OHAyMzYxMzY@supreme-badger-36136.upstash.io:6379
```

## Додавання в Vercel Environment Variables

1. Відкрийте Vercel Dashboard
2. Виберіть ваш проект (auth-service)
3. Перейдіть в **Settings** → **Environment Variables**
4. Натисніть **"Add New"**
5. Додайте:
   - **Name:** `REDIS_URL`
   - **Value:** `redis://default:YOUR_FULL_TOKEN@supreme-badger-36136.upstash.io:6379`
   - **Environment:** All Environments (або Production)
6. Натисніть **"Save"**

## Як отримати повний TOKEN

1. В Environment Variables знайдіть `UPSTASH_REDIS_REST_TOKEN`
2. Натисніть на **око** (👁️) щоб показати значення
3. Скопіюйте **повне** значення (не обрізане)
4. Використайте його в `REDIS_URL`

## Перевірка

Після додавання `REDIS_URL`, перезапустіть деплой. Сервіс має підключитися до Redis.

## Важливо

- ❌ `UPSTASH_REDIS_REST_URL` - для REST API, не підходить для ioredis
- ✅ `REDIS_URL` - connection string для ioredis
- ✅ Формат: `redis://default:TOKEN@HOST:6379`

