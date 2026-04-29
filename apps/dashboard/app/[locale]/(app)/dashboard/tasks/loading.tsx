export default function TasksLoading() {
  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex h-[73px] flex-shrink-0 items-center justify-between border-b border-[var(--line)] bg-white px-7 dark:border-white/10 dark:bg-[#1A1A1A]">
        <div className="space-y-1.5">
          <div className="h-5 w-20 rounded-md bg-gray-200 dark:bg-white/10" />
          <div className="h-3.5 w-40 rounded-md bg-gray-200 dark:bg-white/10" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-36 rounded-lg bg-gray-200 dark:bg-white/10" />
          <div className="h-8 w-24 rounded-lg bg-gray-200 dark:bg-white/10" />
          <div className="h-8 w-28 rounded-lg bg-gray-200 dark:bg-white/10" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-7 space-y-5">
        {/* Filter pills */}
        <div className="flex items-center gap-2">
          {[80, 64, 72, 56].map((w, i) => (
            <div key={i} className={`h-7 w-${w} rounded-full bg-gray-200 dark:bg-white/10`} style={{ width: w }} />
          ))}
        </div>

        {/* Kanban columns */}
        <div className="grid grid-cols-4 gap-4">
          {['To Do', 'In Progress', 'Review', 'Done'].map((col, i) => (
            <div key={col} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-4 w-16 rounded bg-gray-200 dark:bg-white/10" />
                <div className="h-5 w-6 rounded-full bg-gray-200 dark:bg-white/10" />
              </div>
              {[...Array(i === 1 ? 3 : 2)].map((_, j) => (
                <div
                  key={j}
                  className="rounded-xl border border-[var(--line)] bg-white p-4 space-y-3 dark:border-white/[0.07] dark:bg-[#1A1A1A]"
                >
                  <div className="h-4 w-full rounded bg-gray-200 dark:bg-white/10" />
                  <div className="h-3.5 w-3/4 rounded bg-gray-200 dark:bg-white/10" />
                  <div className="flex items-center justify-between pt-1">
                    <div className="h-5 w-16 rounded-full bg-gray-200 dark:bg-white/10" />
                    <div className="h-5 w-5 rounded-full bg-gray-200 dark:bg-white/10" />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
