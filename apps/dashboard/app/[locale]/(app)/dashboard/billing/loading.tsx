export default function BillingLoading() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-[73px] flex-shrink-0 items-center border-b border-[var(--line)] bg-white px-7 dark:border-white/10 dark:bg-[#1A1A1A]">
        <div className="space-y-1.5">
          <div className="h-5 w-20 rounded-md bg-gray-200 dark:bg-white/10" />
          <div className="h-3.5 w-40 rounded-md bg-gray-200 dark:bg-white/10" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-7 space-y-5">
        {/* Current plan */}
        <div className="h-[160px] rounded-xl border border-[var(--line)] bg-white dark:border-white/[0.07] dark:bg-[#1A1A1A] p-6">
          <div className="flex justify-between">
            <div className="space-y-3">
              <div className="h-3.5 w-24 rounded bg-gray-200 dark:bg-white/10" />
              <div className="h-6 w-20 rounded-md bg-gray-200 dark:bg-white/10" />
              <div className="h-3 w-48 rounded bg-gray-100 dark:bg-white/[0.05]" />
            </div>
            <div className="h-8 w-24 rounded-lg bg-gray-200 dark:bg-white/10" />
          </div>
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-[280px] rounded-xl border border-[var(--line)] bg-white dark:border-white/[0.07] dark:bg-[#1A1A1A] p-5 space-y-4">
              <div className="h-5 w-20 rounded-md bg-gray-200 dark:bg-white/10" />
              <div className="h-8 w-24 rounded-md bg-gray-200 dark:bg-white/10" />
              <div className="space-y-2">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-gray-200 dark:bg-white/10" />
                    <div className="h-3 w-32 rounded bg-gray-100 dark:bg-white/[0.05]" />
                  </div>
                ))}
              </div>
              <div className="h-9 rounded-lg bg-gray-200 dark:bg-white/10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
