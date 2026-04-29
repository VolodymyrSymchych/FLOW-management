export default function AttendanceLoading() {
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
          <div className="h-8 w-32 rounded-lg bg-gray-200 dark:bg-white/10" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-7 space-y-5">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-[96px] rounded-xl border border-[var(--line)] bg-white dark:border-white/[0.07] dark:bg-[#1A1A1A]">
              <div className="p-4 space-y-2">
                <div className="h-2.5 w-24 rounded bg-gray-200 dark:bg-white/10" />
                <div className="h-7 w-16 rounded-md bg-gray-200 dark:bg-white/10" />
                <div className="h-2.5 w-20 rounded bg-gray-200 dark:bg-white/10" />
              </div>
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="rounded-xl border border-[var(--line)] bg-white dark:border-white/[0.07] dark:bg-[#1A1A1A] overflow-hidden">
          {/* Week header */}
          <div className="grid grid-cols-7 border-b border-[var(--line)] dark:border-white/[0.07]">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-10 flex items-center justify-center">
                <div className="h-3 w-8 rounded bg-gray-200 dark:bg-white/10" />
              </div>
            ))}
          </div>
          {/* Calendar cells */}
          {[...Array(5)].map((_, row) => (
            <div key={row} className="grid grid-cols-7 border-b border-[var(--line)] dark:border-white/[0.07] last:border-0">
              {[...Array(7)].map((_, col) => (
                <div key={col} className="h-20 border-r border-[var(--line)] dark:border-white/[0.07] last:border-0 p-2">
                  <div className="h-4 w-4 rounded-full bg-gray-200 dark:bg-white/10" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
