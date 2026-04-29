export default function TeamLoading() {
  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex h-[73px] flex-shrink-0 items-center justify-between border-b border-[var(--line)] bg-white px-7 dark:border-white/10 dark:bg-[#1A1A1A]">
        <div className="space-y-1.5">
          <div className="h-5 w-20 rounded-md bg-gray-200 dark:bg-white/10" />
          <div className="h-3.5 w-36 rounded-md bg-gray-200 dark:bg-white/10" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-28 rounded-lg bg-gray-200 dark:bg-white/10" />
          <div className="h-8 w-24 rounded-lg bg-gray-200 dark:bg-white/10" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-7 space-y-5">
        {/* Team cards */}
        <div className="grid grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-xl border border-[var(--line)] bg-white p-5 space-y-4 dark:border-white/[0.07] dark:bg-[#1A1A1A]">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-white/10" />
                <div className="space-y-1.5">
                  <div className="h-4 w-24 rounded bg-gray-200 dark:bg-white/10" />
                  <div className="h-3 w-16 rounded bg-gray-100 dark:bg-white/[0.05]" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full rounded bg-gray-100 dark:bg-white/[0.05]" />
                <div className="h-3 w-4/5 rounded bg-gray-100 dark:bg-white/[0.05]" />
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-[var(--line)] dark:border-white/[0.05]">
                <div className="flex -space-x-1.5">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="h-6 w-6 rounded-full bg-gray-200 dark:bg-white/10 border-2 border-white dark:border-[#1A1A1A]" />
                  ))}
                </div>
                <div className="h-4 w-16 rounded bg-gray-200 dark:bg-white/10" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
