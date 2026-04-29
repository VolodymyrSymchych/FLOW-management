import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { getSession } from '@/lib/auth';
import { getBootstrapData } from '@/server/bootstrap';

export default async function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { staleTime: 60 * 1000 },
    },
  });

  const session = await getSession();
  if (session) {
    try {
      await queryClient.prefetchQuery({
        queryKey: ['bootstrap', 'all'],
        queryFn: () => getBootstrapData(session.userId, 'all'),
      });
    } catch {
      // Don't block render; the client will fetch on mount.
    }
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  );
}
