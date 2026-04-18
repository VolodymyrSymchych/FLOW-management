'use client';

import { useMemo } from 'react';
import {
  ArrowUpRight, CheckCircle2, AlertTriangle,
  FolderOpen, Users, TrendingUp, Plus, Zap,
  BarChart3, CalendarDays, Target,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useProjects, useTasks } from '@/hooks/useQueries';
import { useTeam } from '@/contexts/TeamContext';
import { useSmartDelayedLoading } from '@/hooks/useSmartDelayedLoading';

interface DashboardViewProps {
  onOpenTasks?: () => void;
  onCreateTask?: () => void;
}

function avatarColor(name: string) {
  const colors = ['#e8753a', '#60a5fa', '#4ade80', '#fbbf24', '#c084fc', '#f87171', '#34d399'];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff;
  return colors[Math.abs(h) % colors.length];
}

function getInitials(value?: string | null) {
  if (!value) return 'FL';
  return value.split(/\s+/).filter(Boolean).map((p) => p[0]).join('').slice(0, 2).toUpperCase();
}

function formatShortDate(value?: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const PROJECT_COLORS = ['#E8753A', '#3D7A5A', '#6941C6', '#B83232', '#2E5DA8', '#B8870A'];

export default function DashboardView({ onOpenTasks, onCreateTask }: DashboardViewProps) {
  const router = useRouter();
  const { selectedTeam, isLoading: teamsLoading } = useTeam();
  const teamId = selectedTeam.type === 'all' ? 'all' : selectedTeam.teamId;
  const { data: projects = [], isLoading: projectsLoading } = useProjects(teamId);
  const { data: tasks = [], isLoading: tasksLoading } = useTasks(teamId);
  const shouldShowLoading = useSmartDelayedLoading(projectsLoading || tasksLoading || teamsLoading, projects.length > 0 || tasks.length > 0, 200);
  const openTasks = () => {
    if (onOpenTasks) {
      onOpenTasks();
      return;
    }
    router.push('/dashboard/tasks');
  };
  const createTask = () => {
    if (onCreateTask) {
      onCreateTask();
      return;
    }
    router.push('/dashboard/tasks');
  };

  const stats = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const weekEnd = new Date(startOfToday);
    weekEnd.setDate(startOfToday.getDate() + 7);
    weekEnd.setHours(23, 59, 59, 999);

    const total = tasks.length;
    const done = tasks.filter((t: any) => t.status === 'done').length;
    const inProgress = tasks.filter((t: any) => t.status === 'in_progress').length;
    const overdue = tasks.filter((t: any) => t.status !== 'done' && t.due_date && new Date(t.due_date) < startOfToday).length;
    const dueThisWeek = tasks.filter((t: any) => t.status !== 'done' && t.due_date && new Date(t.due_date) >= startOfToday && new Date(t.due_date) <= weekEnd).length;
    const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

    return { total, done, inProgress, overdue, dueThisWeek, completionRate };
  }, [tasks]);

  const recentTasks = useMemo(() => {
    return [...tasks]
      .filter((t: any) => t.status !== 'done')
      .sort((a: any, b: any) => {
        const dateA = a.updatedAt || a.createdAt || '';
        const dateB = b.updatedAt || b.createdAt || '';
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      })
      .slice(0, 5);
  }, [tasks]);

  const upcomingDeadlines = useMemo(() => {
    const now = new Date();
    return [...tasks]
      .filter((t: any) => t.status !== 'done' && t.due_date && new Date(t.due_date) >= now)
      .sort((a: any, b: any) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
      .slice(0, 5);
  }, [tasks]);

  const projectStats = useMemo(() => {
    return projects.slice(0, 4).map((project: any, index: number) => {
      const projectTasks = tasks.filter((t: any) => (t.projectId ?? t.project_id) === project.id);
      const doneCount = projectTasks.filter((t: any) => t.status === 'done').length;
      const progress = projectTasks.length > 0 ? Math.round((doneCount / projectTasks.length) * 100) : 0;
      return { ...project, taskCount: projectTasks.length, doneCount, progress, color: PROJECT_COLORS[index % PROJECT_COLORS.length] };
    });
  }, [projects, tasks]);

  if (shouldShowLoading) {
    return <div style={{ padding: 24, fontSize: 14, color: 'var(--muted)' }}>Loading dashboard...</div>;
  }

  return (
    <div className="scr-inner" data-testid="dashboard-screen" style={{ padding: '24px 28px 40px' }}>

      {/* Welcome & Quick Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-inter), Inter, sans-serif', fontSize: 26, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-.02em' }}>
            Dashboard
          </h1>
          <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 4 }} suppressHydrationWarning>
            {tasks.filter((t: any) => t.status !== 'done').length} open tasks · {stats.dueThisWeek} due this week · {projects.length} projects
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="btn btn-ghost" onClick={openTasks}>
            View all tasks <ArrowUpRight style={{ width: 14, height: 14 }} />
          </button>
          <button type="button" className="btn btn-acc" onClick={createTask}>
            <Plus style={{ width: 14, height: 14 }} />
            New task
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard
          icon={<Target style={{ width: 18, height: 18 }} />}
          label="Total Tasks"
          value={stats.total}
          color="var(--accent)"
          bg="var(--acc-bg)"
        />
        <StatCard
          icon={<TrendingUp style={{ width: 18, height: 18 }} />}
          label="In Progress"
          value={stats.inProgress}
          color="var(--info, #3b82f6)"
          bg="var(--info-bg, rgba(59,130,246,0.08))"
        />
        <StatCard
          icon={<CheckCircle2 style={{ width: 18, height: 18 }} />}
          label="Completed"
          value={stats.done}
          suffix={`(${stats.completionRate}%)`}
          color="var(--sage)"
          bg="var(--sage-bg)"
        />
        <StatCard
          icon={<AlertTriangle style={{ width: 18, height: 18 }} />}
          label="Overdue"
          value={stats.overdue}
          color="var(--red)"
          bg="var(--red-bg)"
          alert={stats.overdue > 0}
        />
      </div>

      {/* Main Grid: Projects + Recent Tasks + Upcoming */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>

        {/* Projects Overview */}
        <div className="surface-panel" style={{ borderRadius: 12, padding: '20px 24px', border: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--violet-bg, rgba(105,65,198,0.08))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--violet, #6941C6)' }}>
                <FolderOpen style={{ width: 14, height: 14 }} />
              </div>
              <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>Projects</span>
            </div>
            <button type="button" className="chip" onClick={() => router.push('/dashboard/projects')}>
              View all <ArrowUpRight style={{ width: 10, height: 10 }} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {projectStats.length === 0 && (
              <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--faint)', fontSize: 13 }}>No projects yet</div>
            )}
            {projectStats.map((project: any) => (
              <button
                key={project.id}
                type="button"
                onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                  borderRadius: 10, border: '1px solid var(--line)', background: 'var(--white)',
                  cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--line2)'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-subtle)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--line)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
              >
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: project.color, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{project.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--faint)', marginTop: 1 }}>{project.taskCount} tasks · {project.doneCount} done</div>
                </div>
                <div style={{ width: 48, height: 4, borderRadius: 2, background: 'var(--bg2)', overflow: 'hidden', flexShrink: 0 }}>
                  <div style={{ width: `${project.progress}%`, height: '100%', borderRadius: 2, background: project.color, transition: 'width 0.3s' }} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', minWidth: 28, textAlign: 'right' }}>{project.progress}%</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="surface-panel" style={{ borderRadius: 12, padding: '20px 24px', border: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--acc-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                <Zap style={{ width: 14, height: 14 }} />
              </div>
              <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>Recent Tasks</span>
            </div>
            <button type="button" className="chip" onClick={openTasks}>
              View all <ArrowUpRight style={{ width: 10, height: 10 }} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {recentTasks.length === 0 && (
              <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--faint)', fontSize: 13 }}>No recent tasks</div>
            )}
            {recentTasks.map((task: any) => {
              return (
                <button
                  key={task.id}
                  type="button"
                  onClick={openTasks}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
                    borderRadius: 8, cursor: 'pointer', transition: 'background 0.12s', textAlign: 'left',
                    border: 'none', background: 'transparent', width: '100%',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--bg2)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <div style={{
                    width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                    background: task.status === 'in_progress' ? '#60a5fa' : task.status === 'done' ? '#4ade80' : '#9A9A92',
                  }} />
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {task.title}
                  </span>
                  {task.priority && (
                    <span style={{
                      fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 4,
                      background: task.priority === 'high' ? 'var(--red-bg)' : task.priority === 'medium' ? 'var(--amber-bg)' : 'var(--bg2)',
                      color: task.priority === 'high' ? 'var(--red)' : task.priority === 'medium' ? 'var(--amber)' : 'var(--muted)',
                    }}>
                      {task.priority}
                    </span>
                  )}
                  {task.assignee && (
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: avatarColor(task.assignee), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                      {getInitials(task.assignee)}
                    </div>
                  )}
                  <span style={{ fontSize: 11, color: 'var(--faint)', flexShrink: 0 }}>
                    {formatShortDate(task.due_date || task.dueDate)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Upcoming Deadlines + Team Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* Upcoming Deadlines */}
        <div className="surface-panel" style={{ borderRadius: 12, padding: '20px 24px', border: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--amber-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--amber)' }}>
              <CalendarDays style={{ width: 14, height: 14 }} />
            </div>
            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>Upcoming Deadlines</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {upcomingDeadlines.length === 0 && (
              <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--faint)', fontSize: 13 }}>No upcoming deadlines</div>
            )}
            {upcomingDeadlines.map((task: any) => {
              const daysUntil = Math.ceil((new Date(task.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              const isUrgent = daysUntil <= 2;
              return (
                <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, flexShrink: 0,
                    background: isUrgent ? 'var(--red-bg)' : 'var(--bg2)',
                    color: isUrgent ? 'var(--red)' : 'var(--muted)',
                  }}>
                    {daysUntil}d
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--faint)', marginTop: 1 }}>{formatShortDate(task.due_date)}</div>
                  </div>
                  {task.assignee && (
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: avatarColor(task.assignee), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                      {getInitials(task.assignee)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Overview */}
        <div className="surface-panel" style={{ borderRadius: 12, padding: '20px 24px', border: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--sage-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--sage)' }}>
              <BarChart3 style={{ width: 14, height: 14 }} />
            </div>
            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>Quick Overview</span>
          </div>

          {/* Progress bar */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: 'var(--faint)' }}>Completion rate</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink)' }}>{stats.completionRate}%</span>
            </div>
            <div style={{ width: '100%', height: 8, borderRadius: 4, background: 'var(--bg2)', overflow: 'hidden' }}>
              <div style={{ width: `${stats.completionRate}%`, height: '100%', borderRadius: 4, background: 'linear-gradient(90deg, var(--sage), var(--accent))', transition: 'width 0.5s ease' }} />
            </div>
          </div>

          {/* Quick nav links */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { label: 'Tasks', icon: <Target style={{ width: 14, height: 14 }} />, href: '/dashboard/tasks', color: 'var(--accent)' },
              { label: 'Projects', icon: <FolderOpen style={{ width: 14, height: 14 }} />, href: '/dashboard/projects', color: 'var(--violet, #6941C6)' },
              { label: 'Team', icon: <Users style={{ width: 14, height: 14 }} />, href: '/dashboard/team', color: 'var(--info, #3b82f6)' },
              { label: 'Analytics', icon: <BarChart3 style={{ width: 14, height: 14 }} />, href: '/dashboard/analytics', color: 'var(--sage)' },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  if (item.href === '/dashboard/tasks') {
                    openTasks();
                    return;
                  }
                  router.push(item.href);
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px',
                  borderRadius: 8, border: '1px solid var(--line)', background: 'var(--white)',
                  cursor: 'pointer', transition: 'all 0.12s', textAlign: 'left',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--line2)'; (e.currentTarget as HTMLElement).style.background = 'var(--bg2)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--line)'; (e.currentTarget as HTMLElement).style.background = 'var(--white)'; }}
              >
                <span style={{ color: item.color }}>{item.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>{item.label}</span>
                <ArrowUpRight style={{ width: 10, height: 10, color: 'var(--faint)', marginLeft: 'auto' }} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon, label, value, suffix, color, bg, alert,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
  color: string;
  bg: string;
  alert?: boolean;
}) {
  return (
    <div className="surface-panel" style={{
      borderRadius: 12, padding: '16px 20px', border: `1px solid ${alert ? 'var(--red)' : 'var(--line)'}`,
      background: alert ? 'var(--red-bg)' : undefined,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
          {icon}
        </div>
        <span style={{ fontSize: 12, color: 'var(--faint)', fontWeight: 500 }}>{label}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span suppressHydrationWarning style={{ fontSize: 28, fontWeight: 700, color, letterSpacing: '-0.02em', fontFamily: 'var(--font-inter), Inter, sans-serif' }}>
          {value}
        </span>
        {suffix && <span style={{ fontSize: 13, color: 'var(--faint)', fontWeight: 500 }}>{suffix}</span>}
      </div>
    </div>
  );
}
