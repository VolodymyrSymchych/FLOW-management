export default function SettingsLoading() {
  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex h-[73px] flex-shrink-0 items-center border-b border-[var(--line)] bg-white px-7 dark:border-white/10 dark:bg-[#1A1A1A]">
        <div className="space-y-1.5">
          <div className="h-5 w-24 rounded-md bg-gray-200 dark:bg-white/10" />
          <div className="h-3.5 w-48 rounded-md bg-gray-200 dark:bg-white/10" />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Settings nav */}
        <div className="w-56 flex-shrink-0 border-r border-[var(--line)] bg-white p-4 space-y-1 dark:border-white/10 dark:bg-[#1A1A1A]">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-9 rounded-lg bg-gray-100 dark:bg-white/[0.05]" />
          ))}
        </div>

        {/* Settings content */}
        <div className="flex-1 overflow-y-auto p-7 space-y-6">
          {/* Section */}
          <div className="space-y-4">
            <div className="h-5 w-32 rounded-md bg-gray-200 dark:bg-white/10" />
            <div className="rounded-xl border border-[var(--line)] bg-white dark:border-white/[0.07] dark:bg-[#1A1A1A] divide-y divide-[var(--line)] dark:divide-white/[0.05]">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-5">
                  <div className="space-y-1.5">
                    <div className="h-4 w-28 rounded bg-gray-200 dark:bg-white/10" />
                    <div className="h-3 w-48 rounded bg-gray-100 dark:bg-white/[0.05]" />
                  </div>
                  <div className="h-6 w-10 rounded-full bg-gray-200 dark:bg-white/10" />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="h-5 w-36 rounded-md bg-gray-200 dark:bg-white/10" />
            <div className="rounded-xl border border-[var(--line)] bg-white dark:border-white/[0.07] dark:bg-[#1A1A1A] divide-y divide-[var(--line)] dark:divide-white/[0.05]">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-5">
                  <div className="space-y-1.5">
                    <div className="h-4 w-32 rounded bg-gray-200 dark:bg-white/10" />
                    <div className="h-3 w-56 rounded bg-gray-100 dark:bg-white/[0.05]" />
                  </div>
                  <div className="h-8 w-20 rounded-lg bg-gray-200 dark:bg-white/10" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
