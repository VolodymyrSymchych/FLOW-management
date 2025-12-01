import { QueryClient } from '@tanstack/react-query';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Кеш на 1 хвилину за замовчуванням
        staleTime: 60 * 1000,
        // Зберігати неактивні дані 10 хвилин
        gcTime: 10 * 60 * 1000,
        // НЕ рефетчити автоматично при фокусі - тільки якщо дані застарілі
        refetchOnWindowFocus: 'always',
        // Рефетчити при відновленні з'єднання
        refetchOnReconnect: true,
        // Повторні спроби при помилці
        retry: 1,
        // НЕ рефетчити при монтуванні якщо дані свіжі (в межах staleTime)
        refetchOnMount: false,
        // Показувати кешовані дані миттєво, навіть якщо вони застарілі
        // Нові дані завантажуються в фоні
        networkMode: 'online',
      },
    },
  });
}

// Браузер: створюємо новий queryClient для кожного запиту
// SSR: створюємо новий queryClient для кожного запиту
let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: завжди новий queryClient
    return makeQueryClient();
  } else {
    // Browser: використовуємо один queryClient для всіх запитів
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

// Для зворотної сумісності
export const queryClient = typeof window !== 'undefined'
  ? (browserQueryClient ||= makeQueryClient())
  : makeQueryClient();

// Персистентний кеш в localStorage
export function persistQueryClient() {
  if (typeof window === 'undefined') return;

  const client = getQueryClient();

  try {
    // Відновлювати кеш при старті
    const savedCache = localStorage.getItem('react-query-cache');
    if (savedCache) {
      try {
        const parsed = JSON.parse(savedCache);
        if (Array.isArray(parsed)) {
          parsed.forEach((item: any) => {
            if (item?.queryKey && item?.state?.data !== undefined) {
              client.setQueryData(item.queryKey, item.state.data);
            }
          });
        }
      } catch (error) {
        console.error('Failed to restore query cache:', error);
        // Очистити пошкоджений кеш
        localStorage.removeItem('react-query-cache');
      }
    }

    // Зберігати кеш при закритті
    const saveCache = () => {
      try {
        const cache = client.getQueryCache().getAll();
        const serializable = cache
          .filter(query => query.state.data !== undefined)
          .map(query => ({
            queryKey: query.queryKey,
            state: {
              data: query.state.data,
              dataUpdatedAt: query.state.dataUpdatedAt,
            },
          }));
        localStorage.setItem('react-query-cache', JSON.stringify(serializable));
      } catch (error) {
        console.error('Failed to save query cache:', error);
      }
    };

    window.addEventListener('beforeunload', saveCache);

    // Також зберігати кожні 30 секунд
    const interval = setInterval(saveCache, 30000);

    // Cleanup при unmount (якщо потрібно)
    return () => {
      window.removeEventListener('beforeunload', saveCache);
      clearInterval(interval);
    };
  } catch (error) {
    console.error('Failed to initialize persistQueryClient:', error);
  }
}

