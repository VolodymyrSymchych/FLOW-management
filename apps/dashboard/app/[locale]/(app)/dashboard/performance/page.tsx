import { notFound } from 'next/navigation';
import { PerformancePageClient } from '@/components/performance/PerformancePageClient';

const INTERNAL_TOOLS_ENABLED =
  process.env.NODE_ENV !== 'production' || process.env.INTERNAL_TOOLS === 'true';

export default function PerformancePage() {
  if (!INTERNAL_TOOLS_ENABLED) {
    notFound();
  }

  return <PerformancePageClient />;
}
