import dynamic from 'next/dynamic';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';

// Dynamically import the main dashboard view with SSR disabled
const DashboardView = dynamic(() => import('@/components/dashboard/DashboardView'), {
  ssr: false,
  loading: () => <DashboardSkeleton />
});

export default function DashboardPage() {
  return <DashboardView />;
}
