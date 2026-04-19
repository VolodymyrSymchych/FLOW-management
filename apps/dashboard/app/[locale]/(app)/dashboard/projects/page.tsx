'use client';

import { useMemo, useState } from 'react';
import { Plus, Trash2, CheckSquare, Clock, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal';
import { useTeam } from '@/contexts/TeamContext';
import { useSmartDelayedLoading } from '@/hooks/useSmartDelayedLoading';
import { useProjects, useTasks, usePrefetch } from '@/hooks/useQueries';
import type { Project } from '@/lib/api';
import { toastError, toastSuccess } from '@/lib/toast';

function colorAt(index: number) {
  return ['#E8753A', '#B83232', '#2E5DA8', '#3D7A5A', '#6941C6', '#B8870A'][index % 6];
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

export default function ProjectsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { selectedTeam, teams, isLoading: teamsLoading } = useTeam();
  const teamId = selectedTeam.type === 'all' ? 'all' : selectedTeam.teamId;
  const { data: projects = [], isLoading } = useProjects(teamId);
  const { data: tasks = [] } = useTasks(teamId);
  const { prefetchProject } = usePrefetch();

  const [teamFilter, setTeamFilter] = useState<'all' | string>('all');
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; project: Project | null }>({ isOpen: false, project: null });

  const shouldShowLoading = useSmartDelayedLoading(isLoading || teamsLoading, projects.length > 0, 250);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      if (teamFilter === 'all') return true;
      return (project.industry || '').toLowerCase().includes(teamFilter.toLowerCase()) || (project.type || '').toLowerCase().includes(teamFilter.toLowerCase());
    });
  }, [projects, teamFilter]);

  const activeProjects = filteredProjects.filter((project) => project.status !== 'done').length;
  const openTasks = tasks.filter((t: { status: string }) => t.status !== 'done').length;
  const overdue = tasks.filter((t: { status: string; due_date?: string }) => t.status !== 'done' && t.due_date && new Date(t.due_date) < new Date()).length;
  const averageProgress = filteredProjects.length
    ? Math.round(filteredProjects.reduce((sum, project) => sum + progress(project, tasks.filter((t: any) => (t.projectId ?? t.project_id) === project.id).length), 0) / filteredProjects.length)
    : 0;

  const filterPills = ['All teams', ...teams.slice(0, 3).map((team) => team.name)];
  const teamPillColors = ['#E8753A', '#2E5DA8', '#3D7A5A', '#6941C6'];
  const teamBgColors = ['#FDF1EB', '#EBF0F9', '#EAF2ED', '#F4F0FF'];

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
    return <div style={{ padding: 24, fontSize: 14, color: 'var(--muted)' }}>Loading projects...</div>;
  }

  const avgPct = averageProgress;
  return (
    <div className="proj-screen" data-testid="projects-screen">
      <div className="scr-inner">
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          <div className="scr-header" style={{ padding: '0 28px', borderBottom: '1px solid var(--line)', background: 'var(--white)', flexShrink: 0, justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <h1 style={{ fontFamily: 'var(--font-inter), Inter, sans-serif', fontSize: 26, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-.02em', margin: 0 }}>Projects</h1>
              <div style={{ fontSize: 14, color: 'var(--muted)', marginTop: 2 }}>{activeProjects} active · {openTasks} open tasks · {overdue} overdue</div>
            </div>
            <button type="button" className="btn btn-acc" onClick={() => router.push('/dashboard/projects/new')}>
              <Plus />
              New analysis
            </button>
          </div>
          <div style={{ padding: '20px 28px 40px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
              <div className="stat-card"><div className="stat-lbl">Active</div><div className="stat-val">{activeProjects}</div><div className="stat-hint">projects</div></div>
              <div className="stat-card"><div className="stat-lbl">Open tasks</div><div className="stat-val">{openTasks}</div><div className="stat-hint">across all projects</div></div>
              <div className="stat-card"><div className="stat-lbl">Overdue</div><div className="stat-val" style={{ color: 'var(--red)' }}>{overdue}</div><div className="stat-hint" style={{ color: 'var(--red)' }}>needs attention</div></div>
              <div className="stat-card">
                <div className="stat-lbl">Avg progress</div>
                <div className="stat-val">{averageProgress}<span style={{ fontSize: 16, color: 'var(--faint)' }}>%</span></div>
                <div style={{ height: 3, background: 'var(--bg3)', borderRadius: 99, marginTop: 6, overflow: 'hidden' }}>
                  <div style={{ width: avgPct + '%', height: '100%', background: 'var(--accent)', borderRadius: 99 }} />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {filterPills.map((pill, pillIndex) => {
                const active = (pill === 'All teams' && teamFilter === 'all') || teamFilter === pill;
                const teamColor = pillIndex > 0 ? teamPillColors[(pillIndex - 1) % teamPillColors.length] : null;
                const teamBg = pillIndex > 0 ? teamBgColors[(pillIndex - 1) % teamBgColors.length] : null;
                return (
                  <button key={pill} type="button" className={`filter-pill ${active ? 'active' : ''}`} onClick={() => setTeamFilter(pill === 'All teams' ? 'all' : pill)}>
                    {teamColor && teamBg ? (
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: teamBg, border: '1.5px solid ' + teamColor, flexShrink: 0 }} />
                    ) : null}
                    {pill}
                  </button>
                );
              })}
            </div>

            <div id="projGrid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
              {filteredProjects.map((project, index) => {
                const projectTasks = tasks.filter((t: any) => (t.projectId ?? t.project_id) === project.id && t.status !== 'done');
                const projectOverdue = tasks.filter((t: any) => (t.projectId ?? t.project_id) === project.id && t.status !== 'done' && (t.dueDate || t.due_date) && new Date(t.dueDate || t.due_date) < new Date()).length;
                const pct = progress(project, projectTasks.length);
                const cardColor = colorAt(index);
                return (
                  <div
                    key={project.id}
                    className="proj-card"
                    onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                    onMouseEnter={() => prefetchProject(project.id)}
                  >
                    <div className="proj-card-hd">
                      <div className="proj-card-dot" style={{ background: cardColor }} />
                      <div className="proj-card-name">{project.name}</div>
                      {project.risk_level ? <span className={`bg ${project.risk_level === 'HIGH' || project.risk_level === 'CRITICAL' ? 'bg-r' : 'bg-hot'}`}>{project.risk_level}</span> : null}
                      {pct >= 90 && !project.risk_level ? <span className="bg bg-ok">{pct}%</span> : null}
                    </div>
                    <div className="proj-card-meta">
                      <span className="proj-card-team">{(project as any).teams?.[0]?.name || project.type || 'Project'}</span>
                      <span className="proj-card-sprint">{project.timeline || 'Active phase'}</span>
                    </div>
                    <div className="proj-card-stats">
                      <div className="proj-card-stat">
                        {projectTasks.length > 0 ? (
                          <>
                            <CheckSquare style={{ width: 11, height: 11, display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                            {projectTasks.length} open
                          </>
                        ) : (
                          <span style={{ color: 'var(--faint)' }}>No tasks</span>
                        )}
                      </div>
                      <div className="proj-card-stat" style={projectOverdue > 0 ? { color: 'var(--red)' } : {}}>
                        {projectOverdue > 0 ? (
                          <>
                            <AlertCircle style={{ width: 11, height: 11, display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                            {projectOverdue} overdue
                          </>
                        ) : (
                          <>
                            <Clock style={{ width: 11, height: 11, display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                            {project.industry || '—'}
                          </>
                        )}
                      </div>
                    </div>
                    <div className="proj-prog-row">
                      <div className="proj-prog-bar"><div style={{ width: pct + '%', height: '100%', background: cardColor, borderRadius: 99 }} /></div>
                      <span className="proj-prog-pct">{pct}%</span>
                    </div>
                    <div className="proj-card-members">
                      <div className="proj-av" style={{ background: cardColor }}>{initials(project.name)}</div>
                      <div className="proj-av" style={{ background: '#B83232' }}>{initials(project.type || 'PR')}</div>
                      <div className="proj-av" style={{ background: '#2E5DA8' }}>{initials(project.industry || 'IN')}</div>
                      {project.isOwner ? (
                        <button
                          type="button"
                          className="proj-av"
                          style={{ background: 'var(--bg3)', color: 'var(--muted)', border: 'none', cursor: 'pointer' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteModal({ isOpen: true, project });
                          }}
                        >
                          <Trash2 style={{ width: 10, height: 10 }} />
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
              <div className="proj-card proj-card-new" onClick={() => router.push('/dashboard/projects/new')}>
                <Plus style={{ width: 24, height: 24, color: 'var(--ghost)' }} />
                <span style={{ fontSize: 14, color: 'var(--faint)', marginTop: 6 }}>New project</span>
              </div>
            </div>
          </div>
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
