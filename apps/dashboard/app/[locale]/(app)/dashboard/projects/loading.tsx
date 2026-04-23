export default function ProjectsLoading() {
  return (
    <div className="flex h-full flex-col">
      {/* toolbar skeleton */}
      <div className="flex h-[73px] flex-shrink-0 items-center justify-between border-b border-[var(--line)] bg-white px-7 dark:border-white/10 dark:bg-[#1A1A1A]">
        <div className="space-y-1.5">
          <div className="h-5 w-28 rounded-md bg-gray-200 dark:bg-white/10" />
          <div className="h-3.5 w-44 rounded-md bg-gray-200 dark:bg-white/10" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-36 rounded-lg bg-gray-200 dark:bg-white/10" />
          <div className="h-8 w-20 rounded-lg bg-gray-200 dark:bg-white/10" />
          <div className="h-8 w-28 rounded-lg bg-gray-200 dark:bg-white/10" />
        </div>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-7">
        {/* stats strip */}
        <div className="grid grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-[88px] rounded-xl border border-[var(--line)] bg-white dark:border-white/[0.07] dark:bg-[#1A1A1A]">
              <div className="p-4 space-y-2">
                <div className="h-2.5 w-20 rounded bg-gray-200 dark:bg-white/10" />
                <div className="h-7 w-16 rounded-md bg-gray-200 dark:bg-white/10" />
                <div className="h-2.5 w-28 rounded bg-gray-200 dark:bg-white/10" />
              </div>
            </div>
          ))}
        </div>

        {/* filter pills */}
        <div className="flex items-center gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-7 w-20 rounded-full bg-gray-200 dark:bg-white/10" />
          ))}
        </div>

        {/* cards grid */}
        <div className="grid grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="relative h-[210px] overflow-hidden rounded-xl border border-[var(--line)] bg-white dark:border-white/[0.07] dark:bg-[#1A1A1A]"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl bg-gray-300 dark:bg-white/10" />
              <div className="p-5 pl-6 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="h-5 w-32 rounded bg-gray-200 dark:bg-white/10" />
                  <div className="h-5 w-16 rounded-full bg-gray-200 dark:bg-white/10" />
                </div>
                <div className="h-3.5 w-24 rounded bg-gray-200 dark:bg-white/10" />
                <div className="flex gap-4">
                  <div className="h-3.5 w-20 rounded bg-gray-200 dark:bg-white/10" />
                  <div className="h-3.5 w-16 rounded bg-gray-200 dark:bg-white/10" />
                </div>
                <div className="space-y-1">
                  <div className="h-1 w-full rounded-full bg-gray-200 dark:bg-white/10" />
                  <div className="h-3 w-16 rounded bg-gray-200 dark:bg-white/10" />
                </div>
                <div className="flex items-center justify-between border-t border-[var(--line)] pt-3 dark:border-white/[0.05]">
                  <div className="flex -space-x-1.5">
                    {[...Array(3)].map((_, j) => (
                      <div key={j} className="h-6 w-6 rounded-full bg-gray-200 dark:bg-white/10" />
                    ))}
                  </div>
                  <div className="h-4 w-20 rounded bg-gray-200 dark:bg-white/10" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
