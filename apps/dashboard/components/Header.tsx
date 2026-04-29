'use client';

import { useMemo } from 'react';
import { Menu, Plus, Search } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { useTeam } from '@/contexts/TeamContext';
import { NotificationBell } from '@/components/notifications/NotificationBell';

const ROUTE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  projects: 'Projects',
  tasks: 'My Tasks',
  messages: 'Inbox',
  chat: 'Chat',
  documentation: 'Documents',
  analytics: 'Analytics',
  invoices: 'Invoices',
  team: 'Team',
  settings: 'Settings',
  'scope-guard': 'AI Scope Guard',
  calendar: 'Calendar',
  timesheets: 'Timesheets',
};

function normalizePath(pathname: string) {
  return pathname.replace(/^\/(en|uk)(?=\/|$)/, '') || '/';
}

function humanizeSegment(segment: string) {
  if (ROUTE_LABELS[segment]) return ROUTE_LABELS[segment];
  if (/^\d+$/.test(segment)) return 'Details';
  return segment
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

interface HeaderProps {
  onMobileMenuToggle?: () => void;
}

export function Header({ onMobileMenuToggle }: HeaderProps) {
  const pathname = usePathname();
  const { selectedTeam, teams } = useTeam();

  const workspaceName = useMemo(() => {
    if (selectedTeam.type === 'single' && selectedTeam.teamId) {
      const team = teams.find((t) => t.id === selectedTeam.teamId);
      return team?.name || 'Workspace';
    }
    return 'Workspace';
  }, [selectedTeam, teams]);

  const { section, detail, sectionHref } = useMemo(() => {
    const normalized = normalizePath(pathname);
    const segments = normalized.split('/').filter(Boolean);
    if (segments[0] === 'dashboard') {
      const sectionSegment = segments[1];
      const section = sectionSegment ? humanizeSegment(sectionSegment) : 'Dashboard';
      const detail = segments[2] ? humanizeSegment(segments[2]) : null;
      const sectionHref = sectionSegment ? `/dashboard/${sectionSegment}` : '/dashboard';
      return { section, detail, sectionHref };
    }
    return { section: 'Dashboard', detail: null, sectionHref: '/dashboard' };
  }, [pathname]);

  return (
    <header className="topbar" data-testid="app-header">
      <button
        type="button"
        className="tb-menu-btn"
        onClick={onMobileMenuToggle}
        aria-label="Open navigation menu"
        aria-expanded={false}
      >
        <Menu />
      </button>
      <div className="bc">
        <Link href="/dashboard" className="bc-i">
          {workspaceName}
        </Link>
        <span className="bc-s">›</span>
        {detail ? (
          <>
            <Link href={sectionHref} className="bc-i">
              {section}
            </Link>
            <span className="bc-s">›</span>
            <span className="bc-i cur">{detail}</span>
          </>
        ) : (
          <span className="bc-i cur">{section}</span>
        )}
      </div>

      <div id="tb-default" className="tb-actions">
        <button
          type="button"
          className="tb-search"
          onClick={() => document.dispatchEvent(new CustomEvent('open-command-palette'))}
          data-testid="app-search"
        >
          <Search />
          <span className="tb-search-placeholder">Search tasks, projects, people…</span>
          <span className="tb-search-kbd">⌘K</span>
        </button>
        <NotificationBell />
        <Link href="/dashboard/tasks" className="btn btn-acc">
          <Plus style={{ width: 14, height: 14 }} />
          New Task
        </Link>
      </div>
    </header>
  );
}
