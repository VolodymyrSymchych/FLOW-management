export default function AnalyticsLoading() {
  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex h-[73px] flex-shrink-0 items-center justify-between border-b border-[var(--line)] bg-white px-7 dark:border-white/10 dark:bg-[#1A1A1A]">
        <div className="space-y-1.5">
          <div className="h-5 w-24 rounded-md bg-gray-200 dark:bg-white/10" />
          <div className="h-3.5 w-40 rounded-md bg-gray-200 dark:bg-white/10" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-32 rounded-lg bg-gray-200 dark:bg-white/10" />
          <div className="h-8 w-24 rounded-lg bg-gray-200 dark:bg-white/10" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-7 space-y-5">
        {/* KPI row */}
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-[96px] rounded-xl border border-[var(--line)] bg-white dark:border-white/[0.07] dark:bg-[#1A1A1A]">
              <div className="p-4 space-y-2">
                <div className="h-2.5 w-20 rounded bg-gray-200 dark:bg-white/10" />
                <div className="h-7 w-16 rounded-md bg-gray-200 dark:bg-white/10" />
                <div className="h-2.5 w-28 rounded bg-gray-200 dark:bg-white/10" />
              </div>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="h-[300px] rounded-xl border border-[var(--line)] bg-white dark:border-white/[0.07] dark:bg-[#1A1A1A]">
            <div className="p-5 space-y-4">
              <div className="h-4 w-36 rounded bg-gray-200 dark:bg-white/10" />
              <div className="h-[220px] rounded-lg bg-gray-100 dark:bg-white/[0.04]" />
            </div>
          </div>
          <div className="h-[300px] rounded-xl border border-[var(--line)] bg-white dark:border-white/[0.07] dark:bg-[#1A1A1A]">
            <div className="p-5 space-y-4">
              <div className="h-4 w-28 rounded bg-gray-200 dark:bg-white/10" />
              <div className="h-[220px] rounded-lg bg-gray-100 dark:bg-white/[0.04]" />
            </div>
          </div>
        </div>

        {/* Bottom chart */}
        <div className="h-[240px] rounded-xl border border-[var(--line)] bg-white dark:border-white/[0.07] dark:bg-[#1A1A1A]">
          <div className="p-5 space-y-4">
            <div className="h-4 w-40 rounded bg-gray-200 dark:bg-white/10" />
            <div className="h-[160px] rounded-lg bg-gray-100 dark:bg-white/[0.04]" />
          </div>
        </div>
      </div>
    </div>
  );
}
