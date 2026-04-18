import { Skeleton } from '@/components/ui/skeleton';

export function ChatListSkeleton() {
  return (
    <div className="divide-y divide-white/10">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="p-4">
          <div className="flex items-start gap-3">
            {/* Avatar Skeleton */}
            <Skeleton className="h-10 w-10 rounded-full" />

            {/* Content Skeleton */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-12" />
              </div>
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ChatMessagesSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}
        >
          <div className={`flex max-w-[70%] gap-2 ${i % 2 === 0 ? 'flex-row-reverse' : ''}`}>
            {/* Avatar */}
            {i % 2 !== 0 && <Skeleton className="h-8 w-8 rounded-full" />}

            {/* Message */}
            <div className="space-y-2">
              {i % 2 !== 0 && <Skeleton className="h-3 w-20" />}
              <Skeleton className="h-16 w-64 rounded-lg" />
              <Skeleton className="h-2 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ChatMembersSkeleton() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-6 w-6 rounded-full ring-2 ring-background" />
        ))}
      </div>
      <Skeleton className="h-4 w-20" />
    </div>
  );
}

