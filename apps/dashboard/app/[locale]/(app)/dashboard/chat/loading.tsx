export default function ChatLoading() {
  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar */}
      <div className="w-[280px] flex-shrink-0 border-r border-[var(--line)] bg-white dark:border-white/10 dark:bg-[#1A1A1A] flex flex-col">
        <div className="p-4 border-b border-[var(--line)] dark:border-white/10">
          <div className="h-9 rounded-lg bg-gray-200 dark:bg-white/10" />
        </div>
        <div className="flex-1 p-3 space-y-1">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg p-2">
              <div className="h-9 w-9 rounded-full bg-gray-200 dark:bg-white/10 flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-24 rounded bg-gray-200 dark:bg-white/10" />
                <div className="h-3 w-32 rounded bg-gray-100 dark:bg-white/[0.05]" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {/* Chat header */}
        <div className="flex h-[73px] flex-shrink-0 items-center gap-3 border-b border-[var(--line)] bg-white px-6 dark:border-white/10 dark:bg-[#1A1A1A]">
          <div className="h-9 w-9 rounded-full bg-gray-200 dark:bg-white/10" />
          <div className="space-y-1.5">
            <div className="h-4 w-28 rounded bg-gray-200 dark:bg-white/10" />
            <div className="h-3 w-20 rounded bg-gray-100 dark:bg-white/[0.05]" />
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-6 space-y-4">
          {[false, true, false, false, true].map((isOwn, i) => (
            <div key={i} className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
              {!isOwn && <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-white/10 flex-shrink-0 mt-1" />}
              <div className={`max-w-[60%] space-y-1 ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                <div className={`h-4 w-16 rounded bg-gray-200 dark:bg-white/10 ${isOwn ? 'self-end' : ''}`} />
                <div className={`rounded-2xl p-3 ${isOwn ? 'bg-primary/20' : 'border border-[var(--line)] bg-white dark:bg-[#1A1A1A]'}`} style={{ width: 120 + (i * 30) }}>
                  <div className="h-3.5 w-full rounded bg-gray-200 dark:bg-white/10" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-[var(--line)] dark:border-white/10">
          <div className="h-12 rounded-xl border border-[var(--line)] bg-white dark:border-white/10 dark:bg-[#1A1A1A]" />
        </div>
      </div>
    </div>
  );
}
