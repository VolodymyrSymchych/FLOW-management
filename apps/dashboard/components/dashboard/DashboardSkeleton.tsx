import { StatCardGridSkeleton, CardGridSkeleton } from '@/components/skeletons';

export function DashboardSkeleton() {
    return (
        <div className="space-y-6" suppressHydrationWarning>
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <h1 className="h-8 w-64 bg-white/10 rounded animate-pulse" />
                    <div className="h-4 w-96 bg-white/10 rounded animate-pulse" />
                </div>
                <div className="h-10 w-48 bg-white/10 rounded animate-pulse" />
            </div>
            <StatCardGridSkeleton count={4} />
            <CardGridSkeleton count={4} />
        </div>
    );
}
