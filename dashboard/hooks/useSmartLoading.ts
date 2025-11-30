import { useState, useEffect, useCallback } from 'react';

/**
 * Розширений хук для розумного завантаження з кількома станами
 * 
 * @param delay - затримка перед показом індикатора (мс)
 * @returns об'єкт з методами для управління станом завантаження
 */
export function useSmartLoading(delay: number = 200) {
  const [isLoading, setIsLoading] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setShouldShow(false);
      return;
    }

    // Якщо є дані (наприклад, з кешу), не показуємо індикатор
    if (hasData) {
      return;
    }

    const timer = setTimeout(() => {
      setShouldShow(true);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [isLoading, delay, hasData]);

  const startLoading = useCallback(() => {
    setIsLoading(true);
  }, []);

  const stopLoading = useCallback((dataAvailable: boolean = true) => {
    setIsLoading(false);
    setHasData(dataAvailable);
  }, []);

  const reset = useCallback(() => {
    setIsLoading(false);
    setShouldShow(false);
    setHasData(false);
  }, []);

  return {
    isLoading,
    shouldShowLoading: shouldShow,
    hasData,
    startLoading,
    stopLoading,
    reset,
  };
}

/**
 * Хук для завантаження даних з автоматичним управлінням станом
 * 
 * @param fetchFn - функція для завантаження даних
 * @param deps - залежності для перезавантаження
 * @param options - опції
 */
export function useSmartDataFetch<T>(
  fetchFn: () => Promise<T>,
  deps: any[] = [],
  options: {
    delay?: number;
    onSuccess?: (data: T) => void;
    onError?: (error: any) => void;
    skipInitialLoad?: boolean;
  } = {}
) {
  const {
    delay = 200,
    onSuccess,
    onError,
    skipInitialLoad = false,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const smartLoading = useSmartLoading(delay);

  const fetchData = useCallback(async () => {
    smartLoading.startLoading();
    setError(null);

    try {
      const result = await fetchFn();
      setData(result);
      smartLoading.stopLoading(true);
      onSuccess?.(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      smartLoading.stopLoading(false);
      onError?.(error);
    }
  }, [fetchFn, smartLoading, onSuccess, onError]);

  useEffect(() => {
    if (!skipInitialLoad) {
      fetchData();
    }
  }, deps);

  return {
    data,
    error,
    isLoading: smartLoading.isLoading,
    shouldShowLoading: smartLoading.shouldShowLoading,
    refetch: fetchData,
    reset: smartLoading.reset,
  };
}

