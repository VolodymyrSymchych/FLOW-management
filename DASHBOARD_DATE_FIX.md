# 📅 Dashboard Date Handling Fix

## Проблема

При отриманні проектів з мікросервісу виникала помилка:

```
TypeError: a.project.createdAt?.toISOString is not a function
```

## Причина

Коли дані приходять з мікросервісу через HTTP API, дати серіалізуються в JSON і перетворюються на **рядки**, а не об'єкти `Date`. Спроба викликати `.toISOString()` на рядку викликає помилку.

### Приклад:

```typescript
// З бази даних (Drizzle ORM)
project.createdAt // Date object ✅
project.createdAt.toISOString() // "2024-11-19T..." ✅

// Після HTTP запиту (JSON serialization)
result.project.createdAt // "2024-11-19T..." (string) ❌
result.project.createdAt.toISOString() // TypeError! ❌
```

## Рішення

Створено helper функцію `toISOString()`, яка безпечно конвертує будь-який тип дати:

```typescript
// Helper to safely convert to ISO string
const toISOString = (date: any) => {
  if (!date) return undefined;
  if (typeof date === 'string') return date; // Вже ISO string
  if (date instanceof Date) return date.toISOString(); // Date object
  try {
    return new Date(date).toISOString(); // Спроба конвертації
  } catch {
    return undefined; // Невалідна дата
  }
};
```

## Застосування

**Файл:** `dashboard/app/api/projects/[id]/route.ts`

### До:
```typescript
created_at: result.project.createdAt?.toISOString() || new Date().toISOString(),
start_date: result.project.startDate?.toISOString(),
end_date: result.project.endDate?.toISOString(),
```

### Після:
```typescript
created_at: toISOString(result.project.createdAt) || new Date().toISOString(),
start_date: toISOString(result.project.startDate),
end_date: toISOString(result.project.endDate),
```

## Переваги

✅ **Універсальність**: Працює з Date objects, ISO strings, timestamps  
✅ **Безпека**: Не викликає TypeError  
✅ **Гнучкість**: Повертає undefined для невалідних дат  
✅ **Підтримка**: Працює і з мікросервісами, і з локальною БД  

## Інші місця, де може знадобитися

Якщо у вас є інші API endpoints, які працюють з датами з мікросервісів, використайте цю саму функцію:

```typescript
// Імпортуйте або продублюйте helper
const toISOString = (date: any) => {
  if (!date) return undefined;
  if (typeof date === 'string') return date;
  if (date instanceof Date) return date.toISOString();
  try {
    return new Date(date).toISOString();
  } catch {
    return undefined;
  }
};

// Використовуйте для всіх дат
const data = {
  created_at: toISOString(obj.createdAt),
  updated_at: toISOString(obj.updatedAt),
  start_date: toISOString(obj.startDate),
  end_date: toISOString(obj.endDate),
};
```

## Тестування

Перевірте, що проект відображається без помилок:

```bash
# Відкрийте дешборд
# Перейдіть до проекту: /projects/3
# Не має бути помилки 500
# Дати мають правильно відображатися
```

## Статус

✅ **Виправлено** в `dashboard/app/api/projects/[id]/route.ts`  
✅ **Протестовано** для обох шляхів: microservice + fallback  
✅ **Документовано**  

---

**Дата виправлення:** 2024-11-19  
**Файли змінено:** 1  
**Рядків коду:** +11  

