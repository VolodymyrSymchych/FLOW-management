export default function ProjectDetailLoading() {
  return (
    <div className="flex h-full flex-col">
      {/* header */}
      <div className="flex h-[73px] flex-shrink-0 items-center justify-between border-b border-[var(--line)] bg-white px-7 dark:border-white/10 dark:bg-[#1A1A1A]">
        <div className="flex items-center gap-3">
          <div className="h-4 w-4 rounded bg-gray-200 dark:bg-white/10" />
          <div className="h-4 w-px bg-gray-200 dark:bg-white/10" />
          <div className="h-5 w-40 rounded-md bg-gray-200 dark:bg-white/10" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-24 rounded-lg bg-gray-200 dark:bg-white/10" />
          <div className="h-8 w-28 rounded-lg bg-gray-200 dark:bg-white/10" />
          <div className="h-8 w-8 rounded-lg bg-gray-200 dark:bg-white/10" />
        </div>
      </div>

      {/* tab bar */}
      <div className="flex h-11 flex-shrink-0 items-center gap-1 border-b border-[var(--line)] bg-white px-5 dark:border-white/10 dark:bg-[#1A1A1A]">
        {[...Array(6)].map((_, i) => (
          <div key={i} className={`h-7 rounded-md bg-gray-200 dark:bg-white/10 ${i === 0 ? 'w-20' : i === 1 ? 'w-14' : i === 2 ? 'w-16' : i === 3 ? 'w-14' : i === 4 ? 'w-12' : 'w-16'}`} />
        ))}
      </div>

      {/* content */}
      <div className="flex-1 overflow-y-auto p-7">
        <div className="grid grid-cols-3 gap-6">
          {/* main column */}
          <div className="col-span-2 space-y-5">
            {/* stats row */}
            <div className="grid grid-cols-3 gap-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="rounded-xl border border-[var(--line)] bg-white p-4 dark:border-white/[0.07] dark:bg-[#1A1A1A]">
                  <div className="space-y-2">
                    <div className="h-2.5 w-16 rounded bg-gray-200 dark:bg-white/10" />
                    <div className="h-7 w-12 rounded-md bg-gray-200 dark:bg-white/10" />
                    <div className="h-2.5 w-20 rounded bg-gray-200 dark:bg-white/10" />
                  </div>
                </div>
              ))}
            </div>

            {/* description block */}
            <div className="rounded-xl border border-[var(--line)] bg-white p-5 dark:border-white/[0.07] dark:bg-[#1A1A1A]">
              <div className="mb-3 h-4 w-24 rounded bg-gray-200 dark:bg-white/10" />
              <div className="space-y-2">
                <div className="h-3 w-full rounded bg-gray-200 dark:bg-white/10" />
                <div className="h-3 w-5/6 rounded bg-gray-200 dark:bg-white/10" />
                <div className="h-3 w-4/6 rounded bg-gray-200 dark:bg-white/10" />
              </div>
            </div>

            {/* tasks block */}
            <div className="rounded-xl border border-[var(--line)] bg-white dark:border-white/[0.07] dark:bg-[#1A1A1A]">
              <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-3.5 dark:border-white/[0.05]">
                <div className="h-4 w-16 rounded bg-gray-200 dark:bg-white/10" />
                <div className="h-7 w-20 rounded-lg bg-gray-200 dark:bg-white/10" />
              </div>
              <div className="divide-y divide-[var(--line)] dark:divide-white/[0.05]">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-5 py-3">
                    <div className="h-4 w-4 rounded bg-gray-200 dark:bg-white/10" />
                    <div className={`h-3.5 rounded bg-gray-200 dark:bg-white/10 ${i % 3 === 0 ? 'w-48' : i % 3 === 1 ? 'w-56' : 'w-40'}`} />
                    <div className="ml-auto h-5 w-14 rounded-full bg-gray-200 dark:bg-white/10" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* sidebar */}
          <div className="space-y-4">
            {/* details card */}
            <div className="rounded-xl border border-[var(--line)] bg-white p-5 dark:border-white/[0.07] dark:bg-[#1A1A1A]">
              <div className="mb-4 h-4 w-16 rounded bg-gray-200 dark:bg-white/10" />
              <div className="space-y-3.5">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="h-3 w-20 rounded bg-gray-200 dark:bg-white/10" />
                    <div className={`h-3 rounded bg-gray-200 dark:bg-white/10 ${i === 1 ? 'w-24' : i === 3 ? 'w-16' : 'w-20'}`} />
                  </div>
                ))}
              </div>
            </div>

            {/* team card */}
            <div className="rounded-xl border border-[var(--line)] bg-white p-5 dark:border-white/[0.07] dark:bg-[#1A1A1A]">
              <div className="mb-4 h-4 w-12 rounded bg-gray-200 dark:bg-white/10" />
              <div className="space-y-2.5">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-full bg-gray-200 dark:bg-white/10" />
                    <div>
                      <div className="h-3 w-24 rounded bg-gray-200 dark:bg-white/10" />
                      <div className="mt-1 h-2.5 w-16 rounded bg-gray-200 dark:bg-white/10" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* progress card */}
            <div className="rounded-xl border border-[var(--line)] bg-white p-5 dark:border-white/[0.07] dark:bg-[#1A1A1A]">
              <div className="mb-3 h-4 w-20 rounded bg-gray-200 dark:bg-white/10" />
              <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-white/10" />
              <div className="mt-1.5 h-3 w-12 rounded bg-gray-200 dark:bg-white/10" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
