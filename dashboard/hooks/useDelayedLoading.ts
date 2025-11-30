import { useState, useEffect } from 'react';

/**
 * Hook для відкладеного показу індикатора завантаження
 * Показує завантаження тільки якщо воно триває довше певного часу
 * 
 * @param isLoading - чи відбувається завантаження
 * @param delay - затримка перед показом індикатора (мс), за замовчуванням 200ms
 * @returns shouldShowLoading - чи показувати індикатор завантаження
 */
export function useDelayedLoading(isLoading: boolean, delay: number = 200): boolean {
  const [shouldShowLoading, setShouldShowLoading] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setShouldShowLoading(false);
      return;
    }

    // Встановлюємо таймер на затримку
    const timer = setTimeout(() => {
      setShouldShowLoading(true);
    }, delay);

    // Очищаємо таймер при розмонтуванні або зміні isLoading
    return () => {
      clearTimeout(timer);
    };
  }, [isLoading, delay]);

  return shouldShowLoading;
}

