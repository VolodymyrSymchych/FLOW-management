export default function DashboardLoading() {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex h-[73px] flex-shrink-0 items-center justify-between border-b border-[var(--line)] bg-white px-7 dark:border-white/10 dark:bg-[#1A1A1A]">
        <div className="space-y-1.5">
          <div className="h-5 w-32 rounded-md bg-gray-200 dark:bg-white/10" />
          <div className="h-3.5 w-48 rounded-md bg-gray-200 dark:bg-white/10" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gray-200 dark:bg-white/10" />
          <div className="h-8 w-24 rounded-lg bg-gray-200 dark:bg-white/10" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-[96px] rounded-xl border border-[var(--line)] bg-white dark:border-white/[0.07] dark:bg-[#1A1A1A]">
              <div className="p-4 space-y-2">
                <div className="h-2.5 w-16 rounded bg-gray-200 dark:bg-white/10" />
                <div className="h-7 w-12 rounded-md bg-gray-200 dark:bg-white/10" />
                <div className="h-2.5 w-24 rounded bg-gray-200 dark:bg-white/10" />
              </div>
            </div>
          ))}
        </div>

        {/* Widget grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 h-[280px] rounded-xl border border-[var(--line)] bg-white dark:border-white/[0.07] dark:bg-[#1A1A1A]" />
          <div className="h-[280px] rounded-xl border border-[var(--line)] bg-white dark:border-white/[0.07] dark:bg-[#1A1A1A]" />
          <div className="h-[240px] rounded-xl border border-[var(--line)] bg-white dark:border-white/[0.07] dark:bg-[#1A1A1A]" />
          <div className="h-[240px] rounded-xl border border-[var(--line)] bg-white dark:border-white/[0.07] dark:bg-[#1A1A1A]" />
          <div className="h-[240px] rounded-xl border border-[var(--line)] bg-white dark:border-white/[0.07] dark:bg-[#1A1A1A]" />
        </div>
      </div>
    </div>
  );
}
