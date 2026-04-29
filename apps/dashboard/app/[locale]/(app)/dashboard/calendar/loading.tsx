export default function CalendarLoading() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-[73px] flex-shrink-0 items-center justify-between border-b border-[var(--line)] bg-white px-7 dark:border-white/10 dark:bg-[#1A1A1A]">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-gray-200 dark:bg-white/10" />
          <div className="h-6 w-40 rounded-md bg-gray-200 dark:bg-white/10" />
          <div className="h-8 w-8 rounded-lg bg-gray-200 dark:bg-white/10" />
        </div>
        <div className="flex gap-2">
          {['Month', 'Week', 'Day'].map((v) => (
            <div key={v} className="h-8 w-16 rounded-lg bg-gray-200 dark:bg-white/10" />
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-hidden p-5">
        <div className="h-full rounded-xl border border-[var(--line)] bg-white dark:border-white/[0.07] dark:bg-[#1A1A1A] overflow-hidden flex flex-col">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-[var(--line)] dark:border-white/[0.07]">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="h-10 flex items-center justify-center">
                <div className="h-3 w-8 rounded bg-gray-200 dark:bg-white/10" />
              </div>
            ))}
          </div>
          {/* Calendar cells */}
          <div className="flex-1 grid grid-cols-7 grid-rows-5">
            {[...Array(35)].map((_, i) => (
              <div key={i} className="border-r border-b border-[var(--line)] dark:border-white/[0.07] p-2 last-of-type:border-r-0 space-y-1">
                <div className="h-5 w-5 rounded-full bg-gray-200 dark:bg-white/10" />
                {i % 5 === 0 && <div className="h-5 rounded bg-primary/20" />}
                {i % 7 === 3 && <div className="h-5 rounded bg-gray-200 dark:bg-white/10" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
