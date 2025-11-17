'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  animation?: 'pulse' | 'wave' | 'none';
  width?: string | number;
  height?: string | number;
}

/**
 * Skeleton loader component
 *
 * Features:
 * - Multiple variants (text, circular, rectangular)
 * - Multiple animations (pulse, wave, none)
 * - Customizable dimensions
 * - Glassmorphism styling
 * - Accessibility (aria-busy, aria-live)
 *
 * @example
 * <Skeleton variant="text" width="100%" />
 * <Skeleton variant="circular" width={40} height={40} />
 * <Skeleton variant="rectangular" height={200} />
 */
export function Skeleton({
  className,
  variant = 'rectangular',
  animation = 'pulse',
  width,
  height,
}: SkeletonProps) {
  const baseStyles = 'glass-subtle';

  const variants = {
    text: 'h-4 rounded-md',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const animations = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: '',
  };

  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div
      className={cn(
        baseStyles,
        variants[variant],
        animations[animation],
        className
      )}
      style={style}
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label="Loading..."
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

/**
 * Project Card Skeleton
 */
export function ProjectCardSkeleton() {
  return (
    <div className="glass-medium rounded-xl p-6 border border-white/10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" className="h-3" />
        </div>
      </div>

      {/* Content */}
      <div className="space-y-3 mb-4">
        <Skeleton variant="rectangular" height={80} />
        <Skeleton variant="text" width="80%" />
        <Skeleton variant="text" width="60%" />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <Skeleton variant="text" width={100} className="h-6" />
        <Skeleton variant="text" width={60} className="h-6" />
      </div>
    </div>
  );
}

/**
 * Task List Skeleton
 */
export function TaskListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-light rounded-lg p-4 border border-white/10">
          <div className="flex items-start gap-3">
            <Skeleton variant="circular" width={20} height={20} />
            <div className="flex-1 space-y-2">
              <Skeleton variant="text" width="70%" />
              <Skeleton variant="text" width="40%" className="h-3" />
            </div>
            <Skeleton variant="rectangular" width={60} height={24} className="rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Table Row Skeleton
 */
export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <tr className="border-b border-white/10">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton variant="text" />
        </td>
      ))}
    </tr>
  );
}

/**
 * Stats Card Skeleton
 */
export function StatsCardSkeleton() {
  return (
    <div className="glass-medium rounded-xl p-6 border border-white/10">
      <div className="flex items-center gap-4 mb-4">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1">
          <Skeleton variant="text" width="40%" className="h-3 mb-2" />
          <Skeleton variant="text" width="60%" className="h-8" />
        </div>
      </div>
      <Skeleton variant="rectangular" height={4} className="rounded-full" />
    </div>
  );
}

/**
 * Page Header Skeleton
 */
export function PageHeaderSkeleton() {
  return (
    <div className="mb-8">
      <Skeleton variant="text" width="30%" className="h-10 mb-3" />
      <Skeleton variant="text" width="50%" className="h-4" />
    </div>
  );
}

/**
 * Form Skeleton
 */
export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton variant="text" width={120} className="h-4" />
          <Skeleton variant="rectangular" height={48} />
        </div>
      ))}
      <div className="flex gap-3 pt-4">
        <Skeleton variant="rectangular" width={100} height={40} />
        <Skeleton variant="rectangular" width={100} height={40} />
      </div>
    </div>
  );
}

/**
 * Avatar Skeleton
 */
export function AvatarSkeleton({ size = 40 }: { size?: number }) {
  return <Skeleton variant="circular" width={size} height={size} />;
}

/**
 * Button Skeleton
 */
export function ButtonSkeleton({ width = 100 }: { width?: number }) {
  return <Skeleton variant="rectangular" width={width} height={40} className="rounded-xl" />;
}
