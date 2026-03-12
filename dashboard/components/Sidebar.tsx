'use client';

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BarChart3,
  Bot,
  Calendar,
  CheckSquare,
  ChevronDown,
  Clock,
  FileText,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Plus,
  Receipt,
  Settings,
  Shield,
  Users,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { usePrefetch, useProjects } from '@/hooks/useQueries';
import { useTeam } from '@/contexts/TeamContext';
import { useUser } from '@/hooks/useUser';
import { Logo as ActualLogo } from './Logo';

type NavItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  guard?: boolean;
  badge?: string;
};

type NavSection = {
  label: string;
  items: NavItem[];
};

const navigation: NavSection[] = [
  {
    label: 'Overview',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'My Tasks', href: '/dashboard/tasks', icon: CheckSquare },
      { name: 'Inbox', href: '/dashboard/messages', icon: MessageSquare },
      { name: 'Calendar', href: '/dashboard/calendar', icon: Calendar },
      { name: 'Team', href: '/dashboard/team', icon: Users },
    ],
  },
  {
    label: 'Work',
    items: [
      { name: 'Projects', href: '/dashboard/projects', icon: FolderKanban },
      { name: 'Documents', href: '/dashboard/documentation', icon: FileText },
      { name: 'Timesheets', href: '/dashboard/timesheets', icon: Clock },
      { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
      { name: 'Invoices', href: '/dashboard/invoices', icon: Receipt },
    ],
  },
  {
    label: 'AI Tools',
    items: [
      { name: 'AI Scope Guard', href: '/dashboard/scope-guard', icon: Shield, guard: true, badge: 'New' },
      { name: 'Chat', href: '/dashboard/chat', icon: Bot },
    ],
  },
];

function normalizePath(pathname: string) {
  return pathname.replace(/^\/(en|uk)(?=\/|$)/, '') || '/';
}

function isActivePath(pathname: string, href: string) {
  const normalized = normalizePath(pathname);
  if (href === '/dashboard') {
    return normalized === '/dashboard';
  }
  return normalized === href || normalized.startsWith(`${href}/`);
}

function getWorkspaceColor(index: number) {
  const colors = [
    ['#0F0F0E', '#fff'],
    ['#E8753A', '#fff'],
    ['#2E5DA8', '#fff'],
    ['#3D7A5A', '#fff'],
    ['#6941C6', '#fff'],
  ] as const;
  return colors[index % colors.length];
}

export const Sidebar = memo(function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { selectedTeam, setSelectedTeam, teams, isLoading: teamsLoading } = useTeam();
  const teamId = selectedTeam.type === 'all' ? 'all' : selectedTeam.teamId;
  const { data: projects = [] } = useProjects(teamId);
  const { user } = useUser();
  const { prefetchChats, prefetchInvoices, prefetchProjects, prefetchTasks, prefetchStats, prefetchTeams, prefetchReports, prefetchProject } = usePrefetch();
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (workspaceRef.current && !workspaceRef.current.contains(event.target as Node)) {
        setShowWorkspaceMenu(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showWorkspaceMenu || showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showWorkspaceMenu, showUserMenu]);

  const handleNavHover = useCallback(
    (href: string) => {
      switch (href) {
        case '/dashboard':
          prefetchStats();
          prefetchProjects();
          break;
        case '/dashboard/projects':
        case '/dashboard/scope-guard':
          prefetchProjects();
          break;
        case '/dashboard/tasks':
          prefetchTasks();
          prefetchProjects();
          break;
        case '/dashboard/messages':
        case '/dashboard/chat':
          prefetchChats();
          break;
        case '/dashboard/invoices':
          prefetchInvoices();
          break;
        case '/dashboard/team':
          prefetchTeams();
          break;
        case '/dashboard/documentation':
          prefetchReports();
          break;
        case '/dashboard/calendar':
        case '/dashboard/projects-timeline':
          prefetchProjects();
          break;
        case '/dashboard/timesheets':
        case '/dashboard/attendance':
          break;
        default:
          break;
      }
    },
    [prefetchChats, prefetchInvoices, prefetchProjects, prefetchReports, prefetchStats, prefetchTasks, prefetchTeams]
  );

  const workspaceLabel = useMemo(() => {
    if (teamsLoading) return 'Loading workspace';
    if (selectedTeam.type === 'all') return 'All workspaces';
    return teams.find((team) => team.id === selectedTeam.teamId)?.name || 'Select workspace';
  }, [selectedTeam, teams, teamsLoading]);

  const workspaceMeta = useMemo(() => {
    if (teamsLoading) return 'Syncing team data';
    if (selectedTeam.type === 'all') return `${teams.length} teams connected`;
    return teams.find((team) => team.id === selectedTeam.teamId)?.description || 'Focused team view';
  }, [selectedTeam, teams, teamsLoading]);

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : user?.username?.slice(0, 2).toUpperCase() || 'FL';

  const handleSignOut = async () => {
    setShowUserMenu(false);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      router.push('/sign-in');
      router.refresh();
    }
  };

  return (
    <aside className="sb" data-testid="app-shell-sidebar">
      <div className="sb-logo">
        <ActualLogo compact={false} />
      </div>

      <div className="ws" ref={workspaceRef}>
        <div className="ws-lbl">Workspace</div>
        <button type="button" className="ws-btn" title={workspaceLabel} data-testid="team-selector" onClick={() => setShowWorkspaceMenu((current) => !current)}>
          <div className="ws-ico" style={{ background: selectedTeam.type === 'all' ? '#0F0F0E' : getWorkspaceColor(1)[0], color: '#fff' }}>
            {selectedTeam.type === 'all' ? 'A' : workspaceLabel.slice(0, 1).toUpperCase()}
          </div>
          <div className="ws-inf">
            <div className="ws-nm">{workspaceLabel}</div>
            <div className="ws-mt">{workspaceMeta}</div>
          </div>
          <div className={`ws-cv ${showWorkspaceMenu ? 'open' : ''}`}>
            <ChevronDown />
          </div>
        </button>

        <div className={`ws-dd ${showWorkspaceMenu ? 'open' : ''}`}>
            <button
              type="button"
              className={`ws-opt ${selectedTeam.type === 'all' ? 'sel' : ''}`}
              onClick={() => {
                setSelectedTeam({ type: 'all' });
                setShowWorkspaceMenu(false);
              }}
            >
              <div className="ws-oi" style={{ background: '#0F0F0E', color: '#fff' }}>A</div>
              <div>
                <div className="ws-on">All workspaces</div>
                <div className="ws-om">Cross-team overview</div>
              </div>
            </button>
            {teams.map((team, index) => {
              const [background, color] = getWorkspaceColor(index + 1);
              const selected = selectedTeam.type === 'single' && selectedTeam.teamId === team.id;
              return (
                <button
                  key={team.id}
                  type="button"
                  className={`ws-opt ${selected ? 'sel' : ''}`}
                  onClick={() => {
                    setSelectedTeam({ type: 'single', teamId: team.id });
                    setShowWorkspaceMenu(false);
                  }}
                >
                  <div className="ws-oi" style={{ background, color }}>{team.name.slice(0, 1).toUpperCase()}</div>
                  <div>
                    <div className="ws-on">{team.name}</div>
                    <div className="ws-om">{team.description || 'Workspace view'}</div>
                  </div>
                </button>
              );
            })}
            <button type="button" className="ws-add" onClick={() => setShowWorkspaceMenu(false)}>
              <Plus />
              <span>Add workspace</span>
            </button>
          </div>
      </div>

      <div className="nav">
        {navigation.map((section) => (
          <div key={section.label}>
            <div className="nav-s">{section.label}</div>
            {section.items.map((item) => {
              const active = isActivePath(pathname, item.href);
              const Icon = item.icon;
              const className = item.guard ? `ni-guard ${active ? 'on' : ''}` : `ni ${active ? 'on' : ''}`;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={className}
                  title={item.name}
                  onMouseEnter={() => handleNavHover(item.href)}
                  data-testid={`sidebar-link-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <Icon />
                  <span className="ni-n">{item.name}</span>
                  {item.badge ? <span className={`bg ${item.guard ? 'bg-ai' : 'bg-hot'}`}>{item.badge}</span> : null}
                </Link>
              );
            })}
          </div>
        ))}
        <div className="sb-projects">
          <div className="nav-s">Projects</div>
          <div className="sb-projects-list">
            {projects.slice(0, 6).map((project) => {
              const active = isActivePath(pathname, `/dashboard/projects/${project.id}`);
              return (
                <Link
                  key={project.id}
                  href={`/dashboard/projects/${project.id}`}
                  className={`ni ${active ? 'on' : ''}`}
                  title={project.name}
                  onMouseEnter={() => prefetchProject(project.id)}
                  data-testid={`sidebar-project-${project.id}`}
                >
                  <FolderKanban />
                  <span className="ni-n">{project.name}</span>
                </Link>
              );
            })}
            <Link href="/dashboard/projects" className="ni ni-more" data-testid="sidebar-projects-all" onMouseEnter={() => prefetchProjects()}>
              <FolderKanban />
              <span className="ni-n">{projects.length > 6 ? `View all (${projects.length})` : projects.length > 0 ? 'All projects' : 'Projects'}</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="sb-ft" ref={userMenuRef}>
        <button
          type="button"
          className="usr"
          title={user?.fullName || user?.username || 'User menu'}
          onClick={() => setShowUserMenu((v) => !v)}
          data-testid="user-menu-trigger"
          aria-expanded={showUserMenu}
          aria-haspopup="true"
        >
          <div className="usr-av">{initials}</div>
          <div>
            <div className="usr-n">{user?.fullName || user?.username || 'Flow user'}</div>
            <div className="usr-r">Workspace member</div>
          </div>
          <div className="usr-dot" />
          <div className={`usr-cv ${showUserMenu ? 'open' : ''}`}>
            <ChevronDown />
          </div>
        </button>
        <div className={`usr-dd ${showUserMenu ? 'open' : ''}`}>
          <Link
            href="/dashboard/settings"
            className="usr-dd-opt"
            onClick={() => setShowUserMenu(false)}
            data-testid="sidebar-settings"
          >
            <Settings />
            <span>Settings</span>
          </Link>
          <button
            type="button"
            className="usr-dd-opt"
            onClick={handleSignOut}
            data-testid="sidebar-sign-out"
          >
            <LogOut />
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </aside>
  );
});
