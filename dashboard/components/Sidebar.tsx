'use client';

import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Settings,
  CheckSquare,
  Clock,
  BarChart3,
  FileText,
  ChevronLeft,
  ChevronRight,
  Receipt,
  MessageSquare,
  TrendingDown,
  Plug,
  Trophy,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { Logo } from './Logo';
import { useSidebar } from './SidebarContext';
import { memo, useCallback, useEffect } from 'react';
import { usePrefetch } from '@/hooks/useQueries';

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Projects', href: '/dashboard/projects', icon: FolderKanban },
  { name: 'Chat', href: '/dashboard/chat', icon: MessageSquare },
  { name: 'Invoices', href: '/dashboard/invoices', icon: Receipt },
  { name: 'Charts', href: '/dashboard/charts', icon: BarChart3 },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Burndown', href: '/dashboard/burndown', icon: TrendingDown },
  { name: 'Integrations', href: '/dashboard/integrations', icon: Plug },
  { name: 'Achievements', href: '/dashboard/achievements', icon: Trophy },
  { name: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare },
  { name: 'Attendance', href: '/dashboard/attendance', icon: Clock },
  { name: 'Documentation', href: '/dashboard/documentation', icon: FileText },
  { name: 'Team', href: '/dashboard/team', icon: Users },
];

export const Sidebar = memo(function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isExpanded, setIsExpanded } = useSidebar();
  const { prefetchChats, prefetchInvoices, prefetchProjects, prefetchTasks, prefetchStats, prefetchTeams, prefetchAttendance, prefetchReports } = usePrefetch();

  const toggleSidebar = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded, setIsExpanded]);

  // Prefetch route pages on mount
  useEffect(() => {
    navigation.forEach((item) => {
      if (item.href && item.href !== pathname) {
        try {
          router.prefetch(item.href);
        } catch (error) {
          // Ignore prefetch errors
        }
      }
    });
  }, [router, pathname]);

  // Prefetch data on hover for instant loading
  const handleNavHover = useCallback((href: string) => {
    if (href === pathname) return;

    switch (href) {
      case '/dashboard/chat':
        prefetchChats();
        break;
      case '/dashboard/invoices':
        prefetchInvoices();
        break;
      case '/dashboard/projects':
        prefetchProjects();
        break;
      case '/dashboard/tasks':
        prefetchTasks();
        prefetchProjects(); // Tasks потребує projects для dropdown
        break;
      case '/dashboard/team':
        prefetchTeams();
        break;
      case '/dashboard/attendance':
        prefetchAttendance();
        prefetchTasks(); // Attendance потребує tasks
        break;
      case '/dashboard/documentation':
        prefetchReports();
        break;
      case '/dashboard':
        prefetchStats();
        prefetchProjects();
        break;
    }
  }, [prefetchChats, prefetchInvoices, prefetchProjects, prefetchTasks, prefetchStats, prefetchTeams, prefetchAttendance, prefetchReports]);

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen glass-medium border-r border-white/10 transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]',
        isExpanded ? 'w-64' : 'w-20'
      )}
    >
      <div className="flex h-full flex-col py-6">
        {/* Logo Section */}
        <div className={cn('mb-8 transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]', isExpanded ? 'px-6' : 'px-4')}>
          {isExpanded ? (
            <div className="flex items-center justify-between gap-3">
              <Logo variant="default" />
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg glass-light hover:glass-medium duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] hover:scale-110 active:scale-95 flex-shrink-0"
                title="Collapse sidebar"
              >
                <ChevronLeft className="w-4 h-4 text-text-primary" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="flex justify-center w-full">
                <Logo variant="icon" />
              </div>
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg glass-light hover:glass-medium duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] hover:scale-110 active:scale-95"
                title="Expand sidebar"
              >
                <ChevronRight className="w-4 h-4 text-text-primary" />
              </button>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 px-3">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const isGantt = item.name === 'Charts';

            return (
              <Link
                key={item.name}
                href={item.href}
                onMouseEnter={() => handleNavHover(item.href)}
                className={cn(
                  'flex items-center rounded-xl duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] group relative overflow-hidden',
                  isExpanded ? 'px-4 py-3 gap-3' : 'justify-center w-14 h-14 mx-auto',
                  isGantt && isActive
                    ? 'glass-medium text-white border-2 border-primary/60 scale-105'
                    : isActive
                      ? 'glass-light text-white border border-primary/40 scale-105'
                      : isGantt
                        ? 'text-white/70 hover:glass-light hover:text-white hover:scale-105 active:scale-95 hover:border hover:border-primary/30'
                        : 'text-white/60 hover:glass-subtle hover:text-white hover:scale-105 active:scale-95'
                )}
                title={!isExpanded ? item.name : undefined}
              >
                <item.icon className={cn(
                  'flex-shrink-0 relative z-10 transition-all duration-200',
                  isExpanded ? 'w-5 h-5' : 'w-6 h-6'
                )} />
                {isExpanded && (
                  <span className={cn(
                    'font-medium text-sm whitespace-nowrap relative z-10',
                    isGantt && isActive && 'font-semibold'
                  )}>
                    {item.name}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Settings - Bottom */}
        <div className="px-3 mt-auto">
          <Link
            href="/dashboard/settings"
            onMouseEnter={() => handleNavHover('/dashboard/settings')}
            className={cn(
              'flex items-center rounded-xl duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] group relative overflow-hidden',
              isExpanded ? 'px-4 py-3 gap-3' : 'justify-center w-14 h-14 mx-auto',
              pathname === '/dashboard/settings'
                ? 'glass-light text-white border border-primary/40 scale-105'
                : 'text-white/60 hover:glass-subtle hover:text-white hover:scale-105 active:scale-95'
            )}
            title={!isExpanded ? 'Settings' : undefined}
          >
            <Settings className={cn(
              'flex-shrink-0 relative z-10 transition-all duration-200',
              isExpanded ? 'w-5 h-5' : 'w-6 h-6'
            )} />
            {isExpanded && (
              <span className="font-medium text-sm whitespace-nowrap relative z-10">
                Settings
              </span>
            )}
          </Link>
        </div>
      </div>
    </aside>
  );
});
