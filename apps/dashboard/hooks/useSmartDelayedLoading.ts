import { useState, useEffect } from 'react';

/**
 * Розумний хук для відкладеного показу skeleton
 * НЕ показує skeleton якщо вже є дані (навіть якщо йде рефетч)
 * При першому завантаженні (немає даних) - показує skeleton швидко (50ms)
 * При поверненні на сторінку (є кеш) - skeleton не показується взагалі
 *
 * @param isLoading - чи відбувається завантаження
 * @param hasData - чи є вже дані (наприклад, з кешу)
 * @param delay - затримка перед показом індикатора для фонового оновлення (мс), за замовчуванням 200ms
 * @returns shouldShowLoading - чи показувати skeleton
 */
export function useSmartDelayedLoading(
  isLoading: boolean,
  hasData: boolean,
  delay: number = 200
): boolean {
  // Початкове значення завжди false для SSR консистентності
  const [shouldShowLoading, setShouldShowLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Відслідковуємо монтування компонента
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Не показуємо skeleton поки не змонтувався
    if (!isMounted) {
      return;
    }

    // Якщо вже є дані - НЕ показувати skeleton навіть під час завантаження
    if (hasData) {
      setShouldShowLoading(false);
      return;
    }

    // Якщо немає даних і завантаження завершено - не показувати
    if (!isLoading) {
      setShouldShowLoading(false);
      return;
    }

    // При першому завантаженні (немає даних) - показуємо skeleton швидко (50ms)
    // Це дає користувачу миттєвий фідбек, що сторінка завантажується
    const actualDelay = 50; // Завжди швидко при першому завантаженні

    const timer = setTimeout(() => {
      setShouldShowLoading(true);
    }, actualDelay);

    return () => {
      clearTimeout(timer);
    };
  }, [isLoading, hasData, delay, isMounted]);

  // Повертаємо false поки не змонтувався (для SSR консистентності)
  return isMounted && shouldShowLoading;
}

