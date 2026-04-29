export default function InvoicesLoading() {
  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex h-[73px] flex-shrink-0 items-center justify-between border-b border-[var(--line)] bg-white px-7 dark:border-white/10 dark:bg-[#1A1A1A]">
        <div className="space-y-1.5">
          <div className="h-5 w-24 rounded-md bg-gray-200 dark:bg-white/10" />
          <div className="h-3.5 w-40 rounded-md bg-gray-200 dark:bg-white/10" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-36 rounded-lg bg-gray-200 dark:bg-white/10" />
          <div className="h-8 w-28 rounded-lg bg-gray-200 dark:bg-white/10" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-7 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-[88px] rounded-xl border border-[var(--line)] bg-white dark:border-white/[0.07] dark:bg-[#1A1A1A]">
              <div className="p-4 space-y-2">
                <div className="h-2.5 w-20 rounded bg-gray-200 dark:bg-white/10" />
                <div className="h-7 w-24 rounded-md bg-gray-200 dark:bg-white/10" />
                <div className="h-2.5 w-16 rounded bg-gray-200 dark:bg-white/10" />
              </div>
            </div>
          ))}
        </div>

        {/* Table header */}
        <div className="rounded-xl border border-[var(--line)] bg-white dark:border-white/[0.07] dark:bg-[#1A1A1A] overflow-hidden">
          <div className="h-11 bg-gray-50 dark:bg-white/[0.03] border-b border-[var(--line)] dark:border-white/[0.07] flex items-center px-5 gap-4">
            {[120, 80, 100, 80, 80, 72].map((w, i) => (
              <div key={i} className="h-3 rounded bg-gray-200 dark:bg-white/10" style={{ width: w }} />
            ))}
          </div>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-[52px] border-b border-[var(--line)] dark:border-white/[0.05] flex items-center px-5 gap-4 last:border-0">
              <div className="h-3.5 w-28 rounded bg-gray-200 dark:bg-white/10" />
              <div className="h-3.5 w-16 rounded bg-gray-200 dark:bg-white/10" />
              <div className="h-3.5 w-20 rounded bg-gray-200 dark:bg-white/10" />
              <div className="h-5 w-16 rounded-full bg-gray-200 dark:bg-white/10" />
              <div className="h-3.5 w-20 rounded bg-gray-200 dark:bg-white/10" />
              <div className="h-3.5 w-16 rounded bg-gray-200 dark:bg-white/10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
