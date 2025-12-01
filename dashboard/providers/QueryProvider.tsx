'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { getQueryClient, persistQueryClient } from '@/lib/queryClient';
import { useEffect, useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => getQueryClient());

  useEffect(() => {
    // Відновити кеш з localStorage тільки на клієнті
    if (typeof window !== 'undefined') {
      try {
        persistQueryClient();
      } catch (error) {
        console.error('Failed to initialize query cache:', error);
      }
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}

