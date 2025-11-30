# Розумний патерн завантаження (Smart Loading Pattern)

## Концепція

Замість того, щоб показувати індикатор завантаження одразу при кожному запиті, ми показуємо його **тільки якщо завантаження займає більше певного часу** (зазвичай 150-300ms).

### Чому це важливо?

1. **Краще UX**: Якщо дані завантажуються швидко (з кешу, CDN, або швидкого API), користувач не бачить "мигання" індикатора
2. **Менше візуального шуму**: Уникаємо ситуації коли екран "стрибає" від постійних індикаторів
3. **Відчуття швидкості**: Додаток відчувається швидшим, бо не показує зайві лоадери

## Реалізація

### 1. Хук `useDelayedLoading`

```typescript
// hooks/useDelayedLoading.ts
import { useState, useEffect } from 'react';

export function useDelayedLoading(isLoading: boolean, delay: number = 200): boolean {
  const [shouldShowLoading, setShouldShowLoading] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setShouldShowLoading(false);
      return;
    }

    const timer = setTimeout(() => {
      setShouldShowLoading(true);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [isLoading, delay]);

  return shouldShowLoading;
}
```

### 2. Використання

```tsx
function MyComponent() {
  const [loading, setLoading] = useState(true);
  
  // Показувати індикатор тільки якщо завантаження > 200ms
  const shouldShowLoading = useDelayedLoading(loading, 200);

  useEffect(() => {
    fetchData().finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {shouldShowLoading ? (
        <LoadingSkeleton />
      ) : (
        <ActualContent />
      )}
    </div>
  );
}
```

## Skeleton UI

Замість простого тексту "Завантаження..." використовуємо **skeleton screens** - візуальні заповнювачі, які нагадують фінальний контент.

### Переваги:

- ✅ Краще показують структуру майбутнього контенту
- ✅ Менш відволікаючі ніж спінери
- ✅ Створюють відчуття що контент "майже готовий"
- ✅ Плавніші переходи

### Приклад Skeleton компонента:

```tsx
// components/ui/skeleton.tsx
export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-white/10", className)}
      {...props}
    />
  );
}
```

## Рекомендовані затримки

| Тип контенту | Рекомендована затримка |
|--------------|------------------------|
| Список чатів | 200ms |
| Повідомлення | 200ms |
| Члени команди | 150ms |
| Профіль користувача | 250ms |
| Складна таблиця | 300ms |

### Логіка вибору затримки:

- **100-150ms**: Для невеликих елементів UI (аватари, badges)
- **200ms**: Стандартна затримка для більшості випадків
- **250-300ms**: Для складного контенту або коли очікуєте повільніше з'єднання

## Приклади використання в проекті

### ChatList.tsx

```tsx
const [loading, setLoading] = useState(true);
const shouldShowLoading = useDelayedLoading(loading, 200);

return (
  <ScrollArea>
    {shouldShowLoading ? (
      <ChatListSkeleton />
    ) : filteredChats.length === 0 ? (
      <EmptyState />
    ) : (
      <ChatItems />
    )}
  </ScrollArea>
);
```

### ChatWindow.tsx

```tsx
const [loadingMembers, setLoadingMembers] = useState(true);
const shouldShowLoadingMembers = useDelayedLoading(loadingMembers, 150);

return (
  <div>
    {shouldShowLoadingMembers ? (
      <ChatMembersSkeleton />
    ) : (
      <ChatMembers />
    )}
  </div>
);
```

## Поєднання з іншими патернами

### 1. Оптимістичні оновлення

Для дій користувача (відправка повідомлення, лайк) - оновлюємо UI одразу, не чекаючи відповіді сервера:

```tsx
const sendMessage = async (content: string) => {
  // Додаємо повідомлення одразу (оптимістично)
  const tempMessage = { id: 'temp', content, senderId: currentUserId };
  setMessages(prev => [...prev, tempMessage]);

  try {
    const response = await api.sendMessage(content);
    // Замінюємо тимчасове повідомлення на реальне
    setMessages(prev => prev.map(m => 
      m.id === 'temp' ? response.message : m
    ));
  } catch (error) {
    // Видаляємо тимчасове повідомлення при помилці
    setMessages(prev => prev.filter(m => m.id !== 'temp'));
  }
};
```

### 2. Кешування даних

Поєднайте з Redis/React Query для миттєвого показу кешованих даних:

```tsx
const { data, isLoading, isFetching } = useQuery({
  queryKey: ['chats'],
  queryFn: fetchChats,
  staleTime: 30000, // 30 секунд
});

// isLoading - тільки при першому завантаженні
// isFetching - при будь-якому запиті (включно з оновленням)
const shouldShowLoading = useDelayedLoading(isLoading && !data, 200);
```

### 3. Пріоритизація завантаження

Завантажуйте критичний контент першим:

```tsx
useEffect(() => {
  // Критичний контент - завантажуємо одразу
  Promise.all([
    loadMessages(),
    loadChatMembers()
  ]);

  // Некритичний контент - завантажуємо з затримкою
  setTimeout(() => {
    loadChatHistory();
    loadMediaGallery();
  }, 500);
}, [chatId]);
```

## Метрики та моніторинг

Відстежуйте як часто показується індикатор завантаження:

```tsx
const shouldShowLoading = useDelayedLoading(loading, 200);

useEffect(() => {
  if (shouldShowLoading) {
    // Записуємо метрику - завантаження > 200ms
    analytics.track('slow_loading', {
      component: 'ChatList',
      threshold: 200
    });
  }
}, [shouldShowLoading]);
```

## Best Practices

### ✅ Робити:

1. Використовуйте skeleton screens замість спінерів
2. Встановлюйте затримку 150-300ms
3. Скидайте стан при зміні контексту (перехід між чатами)
4. Показуйте частковий контент якщо є (наприклад, кешовані дані)
5. Тестуйте на повільних з'єднаннях

### ❌ Не робити:

1. Не використовуйте затримку < 100ms (занадто швидко)
2. Не використовуйте затримку > 500ms (занадто повільно)
3. Не показуйте індикатор для оптимістичних оновлень
4. Не забувайте скидати стан завантаження
5. Не використовуйте одночасно спінер і skeleton

## Діаграма потоку

```
Користувач → Клік на чат
    ↓
Початок завантаження (loading = true)
    ↓
Таймер 200ms починається
    ↓
    ├── Дані прийшли < 200ms
    │   → Показуємо дані одразу
    │   → Індикатор НЕ показується ✨
    │
    └── Дані не прийшли за 200ms
        → Показуємо skeleton
        → Дані приходять
        → Плавний перехід до контенту
```

## Результати впровадження

### Було (without delay):
- ❌ Мигання індикатора при швидкому з'єднанні
- ❌ Відчуття що додаток повільний
- ❌ Стрибки інтерфейсу

### Стало (with delay + skeleton):
- ✅ Плавні переходи
- ✅ Відчуття що додаток швидкий
- ✅ Skeleton показує структуру майбутнього контенту
- ✅ Індикатор показується тільки коли справді потрібно

## Подальші покращення

1. **Adaptive delays**: Змінювати затримку залежно від швидкості з'єднання
2. **Progressive loading**: Показувати контент поступово (спочатку найважливіше)
3. **Preloading**: Передзавантажувати дані для передбачуваних дій
4. **Service Worker**: Кешувати дані офлайн для миттєвого показу

