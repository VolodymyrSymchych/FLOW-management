# Виправлення конфлікту конфігураційних файлів Vercel

## Помилка: Conflicting configuration files

Vercel підтримує два формати конфігураційних файлів для зворотної сумісності:
- **Новий формат**: `vercel.json`, `.vercel`, `.vercelignore`
- **Старий формат**: `now.json`, `.now`, `.nowignore`

**Важливо:** Можна використовувати тільки один формат одночасно!

## Перевірка та виправлення

### 1. Перевірте наявність конфліктуючих файлів

#### В root директорії:
```bash
ls -la | grep -E "now\.json|\.now|\.nowignore"
```

#### В services/auth-service:
```bash
cd services/auth-service
ls -la | grep -E "now\.json|\.now|\.nowignore"
```

### 2. Видаліть старі файли (якщо знайдено)

#### Якщо знайдено `now.json`:
```bash
rm now.json
# або
rm services/auth-service/now.json
```

#### Якщо знайдено `.now` директорію:
```bash
rm -rf .now
# або
rm -rf services/auth-service/.now
```

#### Якщо знайдено `.nowignore`:
```bash
rm .nowignore
# або
rm services/auth-service/.nowignore
```

### 3. Перевірте Environment Variables

У Vercel Dashboard перевірте, чи немає Environment Variables з префіксом `NOW_`:

- ❌ `NOW_*` - видаліть
- ✅ `VERCEL_*` - залиште

**Приклад:**
- ❌ `NOW_ENV` → видаліть
- ✅ `VERCEL_ENV` → залиште

### 4. Переконайтеся, що використовується правильний формат

#### ✅ Правильно (новий формат):
- `vercel.json` - конфігурація проекту
- `.vercel/` - локальна конфігурація (не комітиться в git)
- `.vercelignore` - файли для ігнорування

#### ❌ Неправильно (старий формат):
- `now.json` - видаліть
- `.now/` - видаліть
- `.nowignore` - видаліть

## Поточна структура проекту

### Root директорія:
- ✅ `vercel.json` - немає (не потрібен для monorepo)
- ✅ `.vercelignore` - є (правильно)

### services/auth-service:
- ✅ `vercel.json` - є (правильно)
- ✅ `.vercelignore` - є (правильно)

## Якщо помилка залишається

1. **Перевірте на Vercel Dashboard:**
   - Settings → Environment Variables
   - Видаліть всі змінні з префіксом `NOW_`

2. **Перевірте .gitignore:**
   - Переконайтеся, що `.vercel/` та `.now/` в .gitignore
   - Переконайтеся, що `now.json` не в .gitignore (щоб не комітитися)

3. **Очистіть кеш Vercel:**
   - В Dashboard: Settings → General → Clear Build Cache

4. **Перезапустіть деплой:**
   - Redeploy проект на Vercel

## Примітка

Якщо ви не знайдете конфліктуючі файли локально, але помилка все ще виникає на Vercel:
- Можливо, файли були видалені, але Vercel все ще має їх в кеші
- Спробуйте очистити кеш та перезапустити деплой
- Перевірте Environment Variables на Vercel Dashboard

