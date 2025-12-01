import { Skeleton } from '@/components/ui/skeleton';

// Скелетон для карток (Dashboard, Projects)
export function CardSkeleton() {
  return (
    <div className="glass-medium rounded-lg p-6 border border-white/10">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-16" />
        </div>
      </div>
    </div>
  );
}

// Скелетон для сітки карток
export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" suppressHydrationWarning>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

// Скелетон для таблиці
export function TableSkeleton({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="glass-medium rounded-lg border border-white/10 overflow-hidden" suppressHydrationWarning>
      {/* Header */}
      <div className="border-b border-white/10 p-4">
        <div className="flex gap-4">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
      </div>
      
      {/* Rows */}
      <div className="divide-y divide-white/10">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="p-4">
            <div className="flex gap-4 items-center">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton 
                  key={colIndex} 
                  className={`h-4 flex-1 ${colIndex === 0 ? 'h-8 w-8 rounded-full' : ''}`} 
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Скелетон для списку
export function ListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="glass-medium rounded-lg p-4 border border-white/10">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Скелетон для профілю
export function ProfileSkeleton() {
  return (
    <div className="glass-medium rounded-lg border border-white/10 overflow-hidden">
      {/* Header/Banner */}
      <Skeleton className="h-32 w-full rounded-none" />
      
      <div className="p-6 space-y-6">
        {/* Avatar and Name */}
        <div className="flex items-start gap-4 -mt-16">
          <Skeleton className="h-24 w-24 rounded-full ring-4 ring-background" />
          <div className="mt-16 space-y-2 flex-1">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-10 w-32 mt-16" />
        </div>
        
        {/* Bio */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        
        {/* Stats */}
        <div className="flex gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Скелетон для форми
export function FormSkeleton({ fields = 5 }: { fields?: number }) {
  return (
    <div className="glass-medium rounded-lg border border-white/10 p-6 space-y-6">
      <Skeleton className="h-8 w-48" />
      
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      ))}
      
      <div className="flex gap-3 pt-4">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}

// Скелетон для статистичних карток (Dashboard)
export function StatCardSkeleton() {
  return (
    <div className="glass-medium rounded-lg p-6 border border-white/10">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-32" />
        </div>
        <Skeleton className="h-12 w-12 rounded-lg" />
      </div>
      <div className="mt-4 flex items-center gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

// Скелетон для сітки статистичних карток
export function StatCardGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4" suppressHydrationWarning>
      {Array.from({ length: count }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Скелетон для графіків/чартів
export function ChartSkeleton() {
  return (
    <div className="glass-medium rounded-lg border border-white/10 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-8 w-32" />
      </div>
      <Skeleton className="h-64 w-full" />
      <div className="flex gap-4 justify-center">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Скелетон для Kanban дошки
export function KanbanSkeleton({ columns = 3 }: { columns?: number }) {
  return (
    <div className="flex gap-6 overflow-x-auto pb-4">
      {Array.from({ length: columns }).map((_, colIndex) => (
        <div key={colIndex} className="flex-shrink-0 w-80 space-y-4">
          {/* Column Header */}
          <div className="glass-medium rounded-lg p-4 border border-white/10">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-6 w-6 rounded-full" />
            </div>
          </div>
          
          {/* Cards */}
          {Array.from({ length: 3 }).map((_, cardIndex) => (
            <div key={cardIndex} className="glass-medium rounded-lg p-4 border border-white/10 space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-3/4" />
              <div className="flex items-center justify-between pt-2">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// Скелетон для Timeline/Gantt
export function TimelineSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="glass-medium rounded-lg border border-white/10 p-6 space-y-4">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-4 w-32" />
          <div className="flex-1 flex items-center gap-2">
            <Skeleton className="h-8 flex-1 rounded" />
          </div>
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  );
}

// Скелетон для документації
export function DocumentationSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[250px_1fr]">
      {/* Sidebar */}
      <div className="glass-medium rounded-lg border border-white/10 p-4 space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
      
      {/* Content */}
      <div className="glass-medium rounded-lg border border-white/10 p-6 space-y-6">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        
        <Skeleton className="h-48 w-full rounded" />
      </div>
    </div>
  );
}

// Скелетон для Invoice/Payment
export function InvoiceSkeleton() {
  return (
    <div className="glass-medium rounded-lg border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
      
      {/* Details */}
      <div className="p-6 space-y-4">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
        
        {/* Items */}
        <TableSkeleton rows={3} columns={4} />
        
        {/* Total */}
        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-32" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Скелетон для сторінки налаштувань
export function SettingsSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[200px_1fr]">
      {/* Sidebar Navigation */}
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-md" />
        ))}
      </div>
      
      {/* Settings Content */}
      <div className="space-y-6">
        <FormSkeleton fields={4} />
        <FormSkeleton fields={3} />
      </div>
    </div>
  );
}

// Скелетон для календаря/розкладу
export function CalendarSkeleton() {
  return (
    <div className="glass-medium rounded-lg border border-white/10 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-10 rounded" />
          <Skeleton className="h-10 w-10 rounded" />
        </div>
      </div>
      
      {/* Week days */}
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 35 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded" />
        ))}
      </div>
    </div>
  );
}

// Універсальний скелетон для сторінки
export function PageSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-32" />
      </div>
      <CardGridSkeleton count={6} />
    </div>
  );
}

