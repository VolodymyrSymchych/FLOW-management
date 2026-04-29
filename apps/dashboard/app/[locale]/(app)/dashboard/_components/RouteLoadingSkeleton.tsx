interface RouteLoadingSkeletonProps {
  variant?: 'default' | 'detail' | 'form' | 'list';
}

export function RouteLoadingSkeleton({ variant = 'default' }: RouteLoadingSkeletonProps) {
  const cards = variant === 'form' ? 2 : variant === 'detail' ? 3 : 6;

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-[73px] flex-shrink-0 items-center justify-between border-b border-[var(--line)] bg-white px-7 dark:border-white/10 dark:bg-[#1A1A1A]">
        <div className="space-y-1.5">
          <div className="h-5 w-36 rounded-md bg-gray-200 dark:bg-white/10" />
          <div className="h-3.5 w-52 rounded-md bg-gray-200 dark:bg-white/10" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-24 rounded-lg bg-gray-200 dark:bg-white/10" />
          <div className="h-8 w-8 rounded-lg bg-gray-200 dark:bg-white/10" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-7">
        {variant === 'form' ? (
          <div className="max-w-3xl space-y-5">
            {[...Array(cards)].map((_, i) => (
              <div key={i} className="rounded-xl border border-[var(--line)] bg-white p-5 dark:border-white/[0.07] dark:bg-[#1A1A1A]">
                <div className="mb-5 h-4 w-28 rounded bg-gray-200 dark:bg-white/10" />
                <div className="space-y-4">
                  {[...Array(4)].map((__, j) => (
                    <div key={j} className="space-y-2">
                      <div className="h-3 w-20 rounded bg-gray-200 dark:bg-white/10" />
                      <div className="h-10 rounded-lg bg-gray-100 dark:bg-white/[0.05]" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-[92px] rounded-xl border border-[var(--line)] bg-white p-4 dark:border-white/[0.07] dark:bg-[#1A1A1A]">
                  <div className="h-2.5 w-20 rounded bg-gray-200 dark:bg-white/10" />
                  <div className="mt-3 h-6 w-16 rounded-md bg-gray-200 dark:bg-white/10" />
                  <div className="mt-2 h-2.5 w-28 rounded bg-gray-100 dark:bg-white/[0.05]" />
                </div>
              ))}
            </div>

            <div className={variant === 'detail' ? 'grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]' : 'grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3'}>
              {[...Array(cards)].map((_, i) => (
                <div key={i} className="h-[180px] rounded-xl border border-[var(--line)] bg-white p-5 dark:border-white/[0.07] dark:bg-[#1A1A1A]">
                  <div className="h-5 w-32 rounded-md bg-gray-200 dark:bg-white/10" />
                  <div className="mt-4 space-y-2">
                    <div className="h-3 w-full rounded bg-gray-100 dark:bg-white/[0.05]" />
                    <div className="h-3 w-5/6 rounded bg-gray-100 dark:bg-white/[0.05]" />
                    <div className="h-3 w-2/3 rounded bg-gray-100 dark:bg-white/[0.05]" />
                  </div>
                  <div className="mt-6 h-8 w-24 rounded-lg bg-gray-200 dark:bg-white/10" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
