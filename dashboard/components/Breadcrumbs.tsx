'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  className?: string;
  homeLabel?: string;
  separator?: React.ReactNode;
}

/**
 * Breadcrumbs navigation component with ARIA support
 *
 * Features:
 * - Auto-generates from pathname
 * - ARIA navigation landmark
 * - Semantic HTML with nav and ol
 * - Current page indicator (aria-current)
 * - Customizable separator
 * - Home link with icon
 * - Responsive (hides on mobile if needed)
 */
export function Breadcrumbs({
  className,
  homeLabel = 'Home',
  separator = <ChevronRight className="w-4 h-4" aria-hidden="true" />
}: BreadcrumbsProps) {
  const pathname = usePathname();

  // Don't show breadcrumbs on home page or auth pages
  if (pathname === '/' || pathname.startsWith('/sign-') || pathname.startsWith('/verify')) {
    return null;
  }

  // Parse pathname to create breadcrumb items
  const segments = pathname.split('/').filter(Boolean);

  const breadcrumbs: BreadcrumbItem[] = segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/');
    // Decode URI and capitalize
    const label = decodeURIComponent(segment)
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    return { label, href };
  });

  return (
    <nav
      aria-label="Breadcrumb navigation"
      className={cn('mb-6', className)}
    >
      <ol className="flex items-center gap-2 text-sm">
        {/* Home Link */}
        <li>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-text-tertiary hover:text-primary transition-colors group"
          >
            <Home className="w-4 h-4 group-hover:scale-110 transition-transform" aria-hidden="true" />
            <span className="hidden sm:inline">{homeLabel}</span>
            <span className="sr-only sm:not-sr-only">{homeLabel}</span>
          </Link>
        </li>

        {/* Breadcrumb Items */}
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;

          return (
            <Fragment key={item.href}>
              {/* Separator */}
              <li className="flex items-center text-text-tertiary" aria-hidden="true">
                {separator}
              </li>

              {/* Breadcrumb Link */}
              <li>
                {isLast ? (
                  <span
                    className="text-text-primary font-medium"
                    aria-current="page"
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="text-text-tertiary hover:text-primary transition-colors"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * Custom breadcrumbs with manual items
 */
interface CustomBreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  separator?: React.ReactNode;
}

export function CustomBreadcrumbs({
  items,
  className,
  separator = <ChevronRight className="w-4 h-4" aria-hidden="true" />
}: CustomBreadcrumbsProps) {
  if (items.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb navigation"
      className={cn('mb-6', className)}
    >
      <ol className="flex items-center gap-2 text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <Fragment key={item.href}>
              {index > 0 && (
                <li className="flex items-center text-text-tertiary" aria-hidden="true">
                  {separator}
                </li>
              )}

              <li>
                {isLast ? (
                  <span
                    className="text-text-primary font-medium"
                    aria-current="page"
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="text-text-tertiary hover:text-primary transition-colors"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
