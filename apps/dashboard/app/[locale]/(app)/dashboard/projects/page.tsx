'use client';

import { useMemo, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Trash2, CheckSquare, Clock, AlertCircle, Search,
  LayoutGrid, List, ChevronRight, TrendingUp,
} from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal';
import { useTeam } from '@/contexts/TeamContext';
import { useSmartDelayedLoading } from '@/hooks/useSmartDelayedLoading';
import { useProjects, useTasks, usePrefetch } from '@/hooks/useQueries';
import type { Project } from '@/lib/api';
import { toastError, toastSuccess } from '@/lib/toast';

const CARD_COLORS = ['#E8753A', '#B83232', '#2E5DA8', '#3D7A5A', '#6941C6', '#B8870A'] as const;

function colorAt(index: number) {
  return CARD_COLORS[index % CARD_COLORS.length];
}

function initials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function progress(project: Project, totalTasks: number) {
  if (typeof project.score === 'number' && project.score > 0) return Math.min(100, project.score);
  if (!totalTasks) return 0;
  return Math.min(100, Math.round((totalTasks / Math.max(totalTasks + 3, 1)) * 100));
}

function RiskPill({ risk }: { risk: string }) {
  const map: Record<string, string> = {
    LOW:      'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20',
    MEDIUM:   'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20',
    HIGH:     'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/20',
    CRITICAL: 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/20',
  };
  const cls = map[(risk || '').toUpperCase()] ?? 'bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-white/40';
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${cls}`}>
      {(risk || '—').toLowerCase()} risk
    </span>
  );
}

function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-1 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
      <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, value)}%`, background: color }} />
    </div>
  );
}

export default function ProjectsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { selectedTeam, teams, isLoading: teamsLoading } = useTeam();
  const teamId = selectedTeam.type === 'all' ? 'all' : selectedTeam.teamId;
  const { data: projects = [], isLoading } = useProjects(teamId);
  const { data: tasks = [] } = useTasks(teamId);
  const { prefetchProject } = usePrefetch();

  const [teamFilter, setTeamFilter] = useState<'all' | string>('all');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; project: Project | null }>({ isOpen: false, project: null });
  const [navigatingId, setNavigatingId] = useState<number | null>(null);

  const navigateTo = useCallback((id: number) => {
    setNavigatingId(id);
    router.push(`/dashboard/projects/${id}`);
  }, [router]);

  const shouldShowLoading = useSmartDelayedLoading(isLoading || teamsLoading, projects.length > 0, 250);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesTeam =
        teamFilter === 'all' ||
        (project.industry || '').toLowerCase().includes(teamFilter.toLowerCase()) ||
        (project.type || '').toLowerCase().includes(teamFilter.toLowerCase());
      const matchesSearch =
        !search ||
        project.name.toLowerCase().includes(search.toLowerCase()) ||
        (project.type || '').toLowerCase().includes(search.toLowerCase());
      return matchesTeam && matchesSearch;
    });
  }, [projects, teamFilter, search]);

  const activeProjects  = filteredProjects.filter((p) => p.status !== 'done').length;
  const openTasks       = tasks.filter((t: { status: string }) => t.status !== 'done').length;
  const overdue         = tasks.filter((t: { status: string; due_date?: string }) => t.status !== 'done' && t.due_date && new Date(t.due_date) < new Date()).length;
  const avgProgress     = filteredProjects.length
    ? Math.round(filteredProjects.reduce((sum, p) => sum + progress(p, tasks.filter((t: any) => (t.projectId ?? t.project_id) === p.id).length), 0) / filteredProjects.length)
    : 0;

  const filterPills = ['All teams', ...teams.slice(0, 3).map((t) => t.name)];

  const confirmDelete = async () => {
    if (!deleteModal.project) return;
    try {
      await axios.delete(`/api/projects/${deleteModal.project.id}`);
      setDeleteModal({ isOpen: false, project: null });
      await queryClient.invalidateQueries({ queryKey: ['projects'] });
      await queryClient.invalidateQueries({ queryKey: ['stats'] });
      toastSuccess('Project deleted');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      toastError(err.response?.data?.error || 'Failed to delete project');
    }
  };

  if (shouldShowLoading) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex h-16 flex-shrink-0 items-center justify-between border-b border-[var(--line)] bg-white px-7 dark:border-white/10 dark:bg-[#1A1A1A]">
          <div className="h-5 w-32 animate-pulse rounded bg-gray-100 dark:bg-white/10" />
          <div className="h-8 w-28 animate-pulse rounded-lg bg-gray-100 dark:bg-white/10" />
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto p-7">
          <div className="grid grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-100 dark:bg-white/5" />)}
          </div>
          <div className="grid grid-cols-3 gap-3 pt-2">
            {[...Array(6)].map((_, i) => <div key={i} className="h-44 animate-pulse rounded-xl bg-gray-100 dark:bg-white/5" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden" data-testid="projects-screen">
      {/* ── Toolbar ── */}
      <div className="flex flex-shrink-0 items-center justify-between gap-4 border-b border-[var(--line)] bg-white px-7 py-4 dark:border-white/[0.07] dark:bg-[#1A1A1A]">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-[var(--ink)] dark:text-white">Projects</h1>
          <p className="mt-0.5 text-[13px] text-[var(--muted)]">
            {activeProjects} active · {openTasks} open tasks
            {overdue > 0 && <span className="text-rose-600 dark:text-rose-400"> · {overdue} overdue</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* search */}
          <div className="flex items-center gap-1.5 rounded-lg border border-[var(--line2)] bg-[var(--bg)] px-3 py-1.5 dark:border-white/10 dark:bg-white/[0.04]">
            <Search className="h-3.5 w-3.5 text-[var(--ghost)] dark:text-white/30" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects…"
              className="w-40 bg-transparent text-[13px] text-[var(--ink)] placeholder:text-[var(--ghost)] outline-none dark:text-white dark:placeholder:text-white/30"
            />
          </div>
          {/* view toggle */}
          <div className="flex items-center rounded-lg border border-[var(--line2)] bg-[var(--bg)] p-0.5 dark:border-white/10 dark:bg-white/[0.04]">
            {(['grid', 'list'] as const).map((v) => {
              const Icon = v === 'grid' ? LayoutGrid : List;
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => setView(v)}
                  className={`flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[12px] font-semibold capitalize transition-all ${
                    view === v
                      ? 'bg-white text-[var(--ink)] shadow-sm dark:bg-white/10 dark:text-white'
                      : 'text-[var(--muted)] hover:text-[var(--ink)] dark:text-white/40 dark:hover:text-white/70'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {v}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => router.push('/dashboard/projects/new')}
            className="flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3.5 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            New project
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-7 space-y-5">
          {/* ── Stats strip ── */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Active projects', value: activeProjects, hint: `${projects.length} total`, color: '' },
              { label: 'Open tasks',      value: openTasks,       hint: 'across all projects', color: '' },
              { label: 'Overdue',         value: overdue,          hint: 'needs attention', color: overdue > 0 ? 'text-rose-600 dark:text-rose-400' : '' },
              { label: 'Avg progress',    value: null,             hint: null, color: '', progress: avgProgress },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-[var(--line)] bg-white p-4 dark:border-white/[0.07] dark:bg-[#1A1A1A]">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--faint)]">{s.label}</p>
                {s.progress !== undefined ? (
                  <>
                    <p className="mt-1.5 text-[26px] font-bold leading-none text-[var(--ink)] dark:text-white">
                      {s.progress}<span className="text-[16px] font-normal text-[var(--ghost)] dark:text-white/30">%</span>
                    </p>
                    <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
                      <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${s.progress}%` }} />
                    </div>
                  </>
                ) : (
                  <>
                    <p className={`mt-1.5 text-[26px] font-bold leading-none dark:text-white ${s.color || 'text-[var(--ink)]'}`}>{s.value}</p>
                    {s.hint && <p className={`mt-1 text-[12px] ${s.color || 'text-[var(--muted)]'}`}>{s.hint}</p>}
                  </>
                )}
              </div>
            ))}
          </div>

          {/* ── Filters ── */}
          <div className="flex items-center gap-2">
            {filterPills.map((pill, i) => {
              const active = (pill === 'All teams' && teamFilter === 'all') || teamFilter === pill;
              return (
                <button
                  key={pill}
                  type="button"
                  onClick={() => setTeamFilter(pill === 'All teams' ? 'all' : pill)}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold transition-all ${
                    active
                      ? 'bg-[var(--ink)] text-white dark:bg-white dark:text-[var(--ink)]'
                      : 'border border-[var(--line2)] bg-white text-[var(--muted)] hover:border-[var(--line2)] hover:text-[var(--ink)] dark:border-white/10 dark:bg-transparent dark:text-white/50 dark:hover:text-white'
                  }`}
                >
                  {i > 0 && (
                    <span
                      className="h-2 w-2 rounded-sm flex-shrink-0"
                      style={{ background: ['#E8753A', '#2E5DA8', '#3D7A5A'][i - 1] ?? '#E8753A' }}
                    />
                  )}
                  {pill}
                </button>
              );
            })}
          </div>

          {/* ── Grid view ── */}
          {view === 'grid' && (
            <div className="grid grid-cols-3 gap-4">
              {filteredProjects.map((project, index) => {
                const projectTasks = tasks.filter((t: any) => (t.projectId ?? t.project_id) === project.id && t.status !== 'done');
                const projectOverdue = tasks.filter((t: any) => (t.projectId ?? t.project_id) === project.id && t.status !== 'done' && (t.dueDate || t.due_date) && new Date(t.dueDate || t.due_date) < new Date()).length;
                const pct = progress(project, projectTasks.length);
                const cardColor = colorAt(index);
                const isNavigating = navigatingId === project.id;

                return (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.03, ease: [0.4, 0, 0.2, 1] }}
                    onClick={() => navigateTo(project.id)}
                    onMouseEnter={() => prefetchProject(project.id)}
                    className={`group relative cursor-pointer overflow-hidden rounded-xl border border-[var(--line)] bg-white transition-all duration-150 hover:border-[var(--line2)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.07)] active:scale-[0.98] dark:border-white/[0.07] dark:bg-[#1A1A1A] dark:hover:border-white/[0.12] dark:hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)] ${isNavigating ? 'opacity-60 pointer-events-none' : ''}`}
                  >
                    {/* color accent bar */}
                    <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl" style={{ background: cardColor }} />

                    <div className="p-5 pl-6">
                      {/* header */}
                      <div className="mb-3 flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: cardColor }} />
                          <h3 className="line-clamp-1 text-[14px] font-semibold text-[var(--ink)] dark:text-white">
                            {project.name}
                          </h3>
                        </div>
                        {project.risk_level && <RiskPill risk={project.risk_level} />}
                      </div>

                      {/* meta */}
                      <p className="mb-3 text-[12px] text-[var(--faint)]">
                        {(project as any).teams?.[0]?.name || project.type || 'Project'}
                        {project.timeline && <span className="before:mx-1.5 before:content-['·']">{project.timeline}</span>}
                      </p>

                      {/* task stats */}
                      <div className="mb-4 flex items-center gap-4 text-[12px] text-[var(--muted)]">
                        <span className="flex items-center gap-1">
                          <CheckSquare className="h-3.5 w-3.5" />
                          {projectTasks.length > 0 ? `${projectTasks.length} open` : 'No tasks'}
                        </span>
                        {projectOverdue > 0 ? (
                          <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
                            <AlertCircle className="h-3.5 w-3.5" />
                            {projectOverdue} overdue
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {project.industry || '—'}
                          </span>
                        )}
                      </div>

                      {/* progress */}
                      <div className="mb-4">
                        <ProgressBar value={pct} color={cardColor} />
                        <p className="mt-1 text-[11px] text-[var(--faint)]">{pct}% complete</p>
                      </div>

                      {/* footer */}
                      <div className="flex items-center justify-between border-t border-[var(--line)] pt-3">
                        <div className="flex -space-x-1.5">
                          {[project.name, project.type || 'PR', project.industry || 'IN'].map((name, i) => (
                            <div
                              key={i}
                              className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white text-[8px] font-bold text-white dark:border-[#1A1A1A]"
                              style={{ background: colorAt(i) }}
                            >
                              {initials(name)}
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          {project.isOwner && (
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setDeleteModal({ isOpen: true, project }); }}
                              className="rounded-md p-1 text-[var(--ghost)] transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <ChevronRight className="h-4 w-4 text-[var(--ghost)] transition-transform group-hover:translate-x-0.5 dark:text-white/20" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Add new card */}
              <button
                type="button"
                onClick={() => router.push('/dashboard/projects/new')}
                className="flex min-h-[200px] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--bg3)] bg-transparent text-[13px] font-medium text-[var(--ghost)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] dark:border-white/[0.08] dark:text-white/25 dark:hover:border-[var(--accent)] dark:hover:text-[var(--accent)]"
              >
                <Plus className="h-6 w-6" />
                New project
              </button>
            </div>
          )}

          {/* ── List view ── */}
          {view === 'list' && (
            <div className="overflow-hidden rounded-xl border border-[var(--line)] bg-white dark:border-white/[0.07] dark:bg-[#1A1A1A]">
              {/* column headers */}
              <div className="grid border-b border-[var(--line)] bg-[var(--bg)] px-5 py-2 dark:border-white/[0.06] dark:bg-white/[0.02]"
                   style={{ gridTemplateColumns: '8px 1fr 120px 100px 60px 60px 36px' }}>
                {['', 'Project', 'Risk', 'Progress', 'Tasks', 'Industry', ''].map((h) => (
                  <span key={h} className="text-[9px] font-bold uppercase tracking-wider text-[var(--faint)]">{h}</span>
                ))}
              </div>

              {filteredProjects.map((project, index) => {
                const projectTasks = tasks.filter((t: any) => (t.projectId ?? t.project_id) === project.id && t.status !== 'done');
                const projectOverdue = tasks.filter((t: any) => (t.projectId ?? t.project_id) === project.id && t.status !== 'done' && (t.dueDate || t.due_date) && new Date(t.dueDate || t.due_date) < new Date()).length;
                const pct = progress(project, projectTasks.length);
                const cardColor = colorAt(index);

                const isNavigatingRow = navigatingId === project.id;
                return (
                  <div
                    key={project.id}
                    onClick={() => navigateTo(project.id)}
                    onMouseEnter={() => prefetchProject(project.id)}
                    className={`group grid cursor-pointer items-center border-b border-[var(--line)] px-5 py-3 last:border-b-0 transition-all hover:bg-[var(--bg)] active:scale-[0.99] dark:border-white/[0.05] dark:hover:bg-white/[0.02] ${isNavigatingRow ? 'opacity-60 pointer-events-none' : ''}`}
                    style={{ gridTemplateColumns: '8px 1fr 120px 100px 60px 60px 36px' }}
                  >
                    <span className="h-2 w-2 rounded-full" style={{ background: cardColor }} />

                    <div className="min-w-0 pr-4">
                      <p className="truncate text-[13px] font-semibold text-[var(--ink)] dark:text-white">{project.name}</p>
                      <p className="truncate text-[11px] text-[var(--faint)]">
                        {(project as any).teams?.[0]?.name || project.type || 'Project'}
                      </p>
                    </div>

                    {project.risk_level ? <RiskPill risk={project.risk_level} /> : <span className="text-[11px] text-[var(--ghost)]">—</span>}

                    <div className="pr-4">
                      <ProgressBar value={pct} color={cardColor} />
                      <span className="text-[10px] text-[var(--faint)]">{pct}%</span>
                    </div>

                    <span className={`text-[12px] font-medium ${projectOverdue > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-[var(--muted)]'}`}>
                      {projectTasks.length}
                      {projectOverdue > 0 && <span className="ml-1 text-[10px]">({projectOverdue}↑)</span>}
                    </span>

                    <span className="truncate text-[11px] text-[var(--faint)]">{project.industry || '—'}</span>

                    <div className="flex items-center justify-end gap-1">
                      {project.isOwner && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setDeleteModal({ isOpen: true, project }); }}
                          className="rounded p-1 text-[var(--ghost)] opacity-0 transition-all hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <ChevronRight className="h-4 w-4 text-[var(--ghost)] dark:text-white/20" />
                    </div>
                  </div>
                );
              })}

              {filteredProjects.length === 0 && (
                <div className="flex flex-col items-center gap-2 py-16 text-center">
                  <TrendingUp className="h-8 w-8 text-[var(--ghost)] dark:text-white/20" />
                  <p className="text-[13px] font-medium text-[var(--muted)]">No projects match your filter</p>
                  <button type="button" onClick={() => { setTeamFilter('all'); setSearch(''); }} className="text-[12px] text-[var(--accent)] hover:underline">
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        title="Delete Project"
        message="This will mark the project as deleted."
        itemName={deleteModal.project?.name || ''}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, project: null })}
      />
    </div>
  );
}
