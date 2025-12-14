'use client';

import dynamic from 'next/dynamic';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';

// Dynamically import the main dashboard view with SSR disabled
// This prevents ANY hydration mismatch because the server only renders the skeleton, and the client renders the real view.
const DashboardView = dynamic(() => import('@/components/dashboard/DashboardView'), {
  ssr: false,
  loading: () => <DashboardSkeleton />
});

export default function DashboardPage() {
  return (
    <div className="h-full w-full" suppressHydrationWarning>
      <DashboardView />
    </div>
  );
}
