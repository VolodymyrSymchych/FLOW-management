export default function TimesheetsLoading() {
  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex h-[73px] flex-shrink-0 items-center justify-between border-b border-[var(--line)] bg-white px-7 dark:border-white/10 dark:bg-[#1A1A1A]">
        <div className="space-y-1.5">
          <div className="h-5 w-28 rounded-md bg-gray-200 dark:bg-white/10" />
          <div className="h-3.5 w-44 rounded-md bg-gray-200 dark:bg-white/10" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gray-200 dark:bg-white/10" />
          <div className="h-8 w-8 rounded-lg bg-gray-200 dark:bg-white/10" />
          <div className="h-8 w-24 rounded-lg bg-gray-200 dark:bg-white/10" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-7 space-y-4">
        {/* Month header */}
        <div className="flex items-center justify-between">
          <div className="h-6 w-36 rounded-md bg-gray-200 dark:bg-white/10" />
          <div className="flex gap-2">
            <div className="h-8 w-8 rounded-lg bg-gray-200 dark:bg-white/10" />
            <div className="h-8 w-8 rounded-lg bg-gray-200 dark:bg-white/10" />
          </div>
        </div>

        {/* Time grid header */}
        <div className="h-10 rounded-lg bg-gray-100 dark:bg-white/5" />

        {/* Day rows */}
        {[...Array(7)].map((_, i) => (
          <div key={i} className="h-14 rounded-xl border border-[var(--line)] bg-white dark:border-white/[0.07] dark:bg-[#1A1A1A]">
            <div className="flex h-full items-center gap-4 px-4">
              <div className="h-4 w-16 rounded bg-gray-200 dark:bg-white/10" />
              <div className="flex-1 h-6 rounded-md bg-gray-100 dark:bg-white/5" />
              <div className="h-4 w-12 rounded bg-gray-200 dark:bg-white/10" />
            </div>
          </div>
        ))}

        {/* Summary */}
        <div className="h-[88px] rounded-xl border border-[var(--line)] bg-white dark:border-white/[0.07] dark:bg-[#1A1A1A]">
          <div className="p-4 flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-3.5 w-24 rounded bg-gray-200 dark:bg-white/10" />
              <div className="h-6 w-16 rounded-md bg-gray-200 dark:bg-white/10" />
            </div>
            <div className="flex gap-6">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="space-y-2 text-right">
                  <div className="h-3 w-20 rounded bg-gray-200 dark:bg-white/10" />
                  <div className="h-5 w-12 rounded-md bg-gray-200 dark:bg-white/10" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
