'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus, Clock, SquareKanban, LayoutList } from 'lucide-react';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import { useTeam } from '@/contexts/TeamContext';
import { useSmartDelayedLoading } from '@/hooks/useSmartDelayedLoading';
import { useProjects, useTasks } from '@/hooks/useQueries';
import { EditTaskModal } from '@/components/EditTaskModal';
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal';

type TaskStatus = 'all' | 'todo' | 'in_progress' | 'done';
type TaskPriority = 'low' | 'medium' | 'high';
type ViewMode = 'list' | 'board';

interface TaskFormState {
  title: string;
  description: string;
  project_id: string | number;
  assignee: string;
  due_date: string;
  priority: TaskPriority;
  status: Exclude<TaskStatus, 'all'>;
}

const initialTaskState: TaskFormState = {
  title: '',
  description: '',
  project_id: '',
  assignee: '',
  due_date: '',
  priority: 'medium',
  status: 'todo',
};

function formatShortDate(value?: string | null) {
  if (!value) return 'No date';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'No date';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function projectDotColor(index: number) {
  return ['#E8753A', '#3D7A5A', '#6941C6', '#B83232', '#2E5DA8', '#B8870A'][index % 6];
}

function initials(value?: string | null) {
  if (!value) return 'FL';
  return value.split(/\s+/).filter(Boolean).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
}

function avatarColor(name: string) {
  const colors = ['#e8753a', '#60a5fa', '#4ade80', '#fbbf24', '#c084fc', '#f87171', '#34d399'];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff;
  return colors[Math.abs(h) % colors.length];
}

function storyPoints(task: any) {
  if (typeof task.story_points === 'number') return `${task.story_points} SP`;
  if (typeof task.estimate === 'number') return `${task.estimate} SP`;
  return '3 SP';
}

function tagTone(tag: string) {
  const value = tag.toLowerCase();
  if (value.includes('high') || value.includes('critical')) return 'tg-re';
  if (value.includes('review')) return 'tg-am';
  if (value.includes('done')) return 'tg-sg';
  if (value.includes('scope')) return 'tg-vi';
  return 'tg-acc';
}

export default function TasksPage() {
  const queryClient = useQueryClient();
  const { selectedTeam, isLoading: teamsLoading } = useTeam();

  const teamId = selectedTeam.type === 'all' ? 'all' : selectedTeam.teamId;
  const { data: projects = [], isLoading: projectsLoading } = useProjects(teamId);
  const { data: tasks = [], isLoading: tasksLoading } = useTasks(teamId);
  const shouldShowLoading = useSmartDelayedLoading(projectsLoading || tasksLoading || teamsLoading, projects.length > 0 || tasks.length > 0, 200);

  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<any | null>(null);
  const [filterView, setFilterView] = useState<'all' | 'today' | 'week'>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; task: any | null }>({ isOpen: false, task: null });
  const [newTask, setNewTask] = useState<TaskFormState>(initialTaskState);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const createTask = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await axios.post('/api/tasks', {
        title: newTask.title,
        description: newTask.description || null,
        project_id: newTask.project_id && newTask.project_id !== '' ? parseInt(newTask.project_id as string, 10) : null,
        assignee: newTask.assignee || null,
        due_date: newTask.due_date || null,
        priority: newTask.priority,
        status: newTask.status,
      });
      setNewTask(initialTaskState);
      setShowNewTaskForm(false);
      await queryClient.invalidateQueries({ queryKey: ['tasks', teamId] });
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to create task');
    }
  };

  const updateTaskStatus = async (taskId: number, status: Exclude<TaskStatus, 'all'>) => {
    try {
      await axios.put(`/api/tasks/${taskId}`, { status });
      await queryClient.invalidateQueries({ queryKey: ['tasks', teamId] });
    } catch (error) {
      console.error('Failed to update task', error);
    }
  };

  const confirmDeleteTask = async () => {
    if (!deleteModal.task) return;
    try {
      await axios.delete(`/api/tasks/${deleteModal.task.id}`);
      setDeleteModal({ isOpen: false, task: null });
      await queryClient.invalidateQueries({ queryKey: ['tasks', teamId] });
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to delete task');
    }
  };

  const filteredTasks = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const weekEnd = new Date(startOfToday);
    weekEnd.setDate(startOfToday.getDate() + 7);
    weekEnd.setHours(23, 59, 59, 999);

    let result = tasks;

    if (selectedProjectId) {
      result = result.filter((task: any) => task.project_id === selectedProjectId);
    }

    return result.filter((task: any) => {
      const due = task.due_date || task.dueDate;
      if (!due) return filterView === 'all';
      const dueDate = new Date(due);
      if (filterView === 'today') return dueDate.toDateString() === startOfToday.toDateString();
      if (filterView === 'week') return dueDate >= startOfToday && dueDate <= weekEnd;
      return true;
    });
  }, [filterView, tasks, selectedProjectId]);

  const grouped = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const weekEnd = new Date(startOfToday);
    weekEnd.setDate(startOfToday.getDate() + 7);
    weekEnd.setHours(23, 59, 59, 999);

    return {
      overdue: filteredTasks.filter((task: any) => (task.status !== 'done') && task.due_date && new Date(task.due_date) < startOfToday),
      thisWeek: filteredTasks.filter((task: any) => task.status !== 'done' && task.due_date && new Date(task.due_date) >= startOfToday && new Date(task.due_date) <= weekEnd),
      upcoming: filteredTasks.filter((task: any) => task.status !== 'done' && (!task.due_date || new Date(task.due_date) > weekEnd)),
      done: filteredTasks.filter((task: any) => task.status === 'done'),
    };
  }, [filteredTasks]);

  const columns = useMemo(() => {
    const review = filteredTasks.filter((task: any) => task.status === 'todo' && ['high', 'critical'].includes((task.priority || '').toLowerCase()));
    const inProgress = filteredTasks.filter((task: any) => task.status === 'in_progress');
    const done = filteredTasks.filter((task: any) => task.status === 'done');
    const backlog = filteredTasks.filter((task: any) => !review.includes(task) && task.status !== 'in_progress' && task.status !== 'done');

    return [
      { key: 'in_progress', label: 'In Progress', color: '#E8753A', items: inProgress },
      { key: 'review', label: 'High Priority', color: '#B83232', items: review },
      { key: 'done', label: 'Done', color: '#3D7A5A', items: done },
      { key: 'backlog', label: 'Backlog', color: '#9A9A92', items: backlog },
    ];
  }, [filteredTasks]);

  const availableProjects = projects.slice(0, 6);

  if (!mounted || shouldShowLoading) {
    return <div style={{ padding: 24, fontSize: 14, color: 'var(--muted)' }}>Loading tasks...</div>;
  }

  const sections = [
    { key: 'overdue', label: 'Overdue', color: 'var(--red)', badgeBg: 'var(--red-bg)', items: grouped.overdue },
    { key: 'thisWeek', label: 'This week', color: 'var(--amber)', badgeBg: 'var(--amber-bg)', items: grouped.thisWeek },
    { key: 'upcoming', label: 'Upcoming', color: 'var(--faint)', badgeBg: 'var(--bg2)', items: grouped.upcoming },
    { key: 'done', label: 'Done', color: 'var(--sage)', badgeBg: 'var(--sage-bg)', items: grouped.done },
  ];

  return (
    <div className="tasks-screen" data-testid="tasks-screen" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, overflow: 'hidden' }}>

        <div className="scr-header" style={{ padding: '12px 28px 0', borderBottom: '1px solid var(--line)', background: 'var(--white)', flexShrink: 0, justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div className="vpills">
            <button type="button" className={`vp ${viewMode === 'list' ? 'on' : ''}`} onClick={() => setViewMode('list')}>
              <LayoutList style={{ width: 14, height: 14 }} />
              List
            </button>
            <button type="button" className={`vp ${viewMode === 'board' ? 'on' : ''}`} onClick={() => setViewMode('board')}>
              <SquareKanban style={{ width: 14, height: 14 }} />
              Board
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="view-tog">
              <button type="button" className={`view-tog-btn ${filterView === 'all' ? 'active' : ''}`} onClick={() => setFilterView('all')}>All</button>
              <button type="button" className={`view-tog-btn ${filterView === 'today' ? 'active' : ''}`} onClick={() => setFilterView('today')}>Today</button>
              <button type="button" className={`view-tog-btn ${filterView === 'week' ? 'active' : ''}`} onClick={() => setFilterView('week')}>This week</button>
            </div>
            <button type="button" className="btn btn-acc" data-testid="tasks-new-trigger" onClick={() => setShowNewTaskForm(true)}>
              <Plus />
              New task
            </button>
          </div>
        </div>

        {/* Toolbar: Project tabs + View mode toggle */}
        <div className="vb" style={{ borderBottom: '1px solid var(--line)', background: 'var(--white)', flexShrink: 0 }}>
          <div className="pb" style={{ borderBottom: 'none', paddingBottom: 0 }}>
            <button
              type="button"
              className={`pt ${!selectedProjectId ? 'on' : ''}`}
              onClick={() => setSelectedProjectId(null)}
            >
              All
            </button>
            {availableProjects.map((project: any, index: number) => (
              <button
                key={project.id}
                type="button"
                className={`pt ${selectedProjectId === project.id ? 'on' : ''}`}
                onClick={() => setSelectedProjectId(project.id)}
              >
                <div className="pt-d" style={{ background: projectDotColor(index) }} />
                {project.name}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {viewMode === 'list' ? (
          <div className="tasks-content" style={{ padding: '16px 28px 40px' }}>
            {sections.map((section) => (
              <div key={section.key} style={{ marginBottom: 20, opacity: section.key === 'done' ? 0.65 : 1 }}>
                <div style={{ fontFamily: "var(--font-inter), Inter, sans-serif", fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: section.color, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>{section.label}</span>
                  <span style={{ background: section.badgeBg, padding: '1px 6px', borderRadius: 99 }}>{section.items.length}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {section.items.map((task: any) => {
                    const projectIndex = projects.findIndex((project: any) => project.id === task.project_id);
                    const project = projects.find((item: any) => item.id === task.project_id);
                    return (
                      <div key={task.id} className="mt-row" onClick={() => setEditingTask(task)}>
                        <button
                          type="button"
                          className={`mt-check ${task.status === 'done' ? 'done' : ''}`}
                          onClick={(event) => { event.stopPropagation(); updateTaskStatus(task.id, task.status === 'done' ? 'todo' : 'done'); }}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                        </button>
                        <div className="mt-prio" style={{ background: task.priority === 'high' ? 'var(--red)' : task.priority === 'medium' ? 'var(--amber)' : 'var(--ghost)' }} />
                        <span className="mt-name" style={task.status === 'done' ? { textDecoration: 'line-through', color: 'var(--muted)' } : undefined}>{task.title}</span>
                        {task.priority ? <span className="mt-tag" style={{ background: task.priority === 'high' ? 'var(--red-bg)' : task.priority === 'medium' ? 'var(--amber-bg)' : 'var(--bg2)', color: task.priority === 'high' ? 'var(--red)' : task.priority === 'medium' ? 'var(--amber)' : 'var(--muted)' }}>{task.priority}</span> : null}
                        {task.status ? <span className="mt-tag" style={{ background: 'var(--violet-bg)', color: 'var(--violet)' }}>{task.status.replace('_', ' ')}</span> : null}
                        <span className="mt-proj"><div style={{ background: projectDotColor(projectIndex >= 0 ? projectIndex : 0) }} />{project?.name || 'General'}</span>
                        <span className={`mt-date ${section.key === 'overdue' ? 'overdue' : ''}`} style={task.status === 'done' ? { color: 'var(--sage)' } : undefined}>{task.status === 'done' ? 'Done' : formatShortDate(task.due_date || task.dueDate)}</span>
                      </div>
                    );
                  })}
                  {section.items.length === 0 ? <div style={{ fontSize: 14, color: 'var(--faint)', padding: '4px 0 8px' }}>No tasks in this group.</div> : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Board view */
          <div id="v-kb" style={{ flex: 1, overflow: 'auto' }}>
            <div className="kb">
              {columns.map((column) => (
                <div key={column.key} className="col">
                  <div className="col-hd">
                    <div className="col-pip" style={{ background: column.color }} />
                    <span className="col-nm">{column.label}</span>
                    <span className="col-ct">{column.items.length}</span>
                    <button type="button" className="col-pl" onClick={() => setShowNewTaskForm(true)}>
                      <Plus />
                    </button>
                  </div>
                  <div className="col-bd">
                    {column.items.map((task: any) => (
                      <button key={task.id} type="button" className="card" onClick={() => setEditingTask(task)}>
                        <div className="c-bar" style={{ background: column.color }} />
                        <div className={`c-pr ${task.priority === 'high' ? 'pr-h' : 'pr-l'}`} />
                        <div className="c-ttl">{task.title}</div>
                        <div className="c-tags">
                          <span className={`tg ${tagTone(task.priority || 'priority')}`}>{task.priority || 'Task'}</span>
                          {task.status ? <span className="tg tg-gy">{task.status.replace('_', ' ')}</span> : null}
                        </div>
                        <div className="c-ft">
                          <span className="c-sp">{storyPoints(task)}</span>
                          <span className="c-du">
                            <Clock style={{ width: 9, height: 9 }} />
                            {formatShortDate(task.due_date || task.dueDate)}
                          </span>
                          <div className="c-avs">
                            <div className="av" style={{ background: avatarColor(task.assignee || 'Flow') }}>{initials(task.assignee || 'Flow')}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                  <button type="button" className="col-a" onClick={() => setShowNewTaskForm(true)}>
                    <Plus style={{ width: 11, height: 11 }} />
                    Add task
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* New Task Modal */}
      {showNewTaskForm ? (
        <div className="modal-overlay open" data-testid="tasks-create-form" onClick={() => setShowNewTaskForm(false)}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-hd">
              <div className="modal-hd-icon">
                <Plus style={{ width: 15, height: 15, color: 'var(--accent)' }} />
              </div>
              <div className="modal-hd-title">New Task</div>
              <button type="button" className="modal-close" onClick={() => setShowNewTaskForm(false)}>×</button>
            </div>
            <form onSubmit={createTask}>
              <div className="modal-body">
                <div className="form-row">
                  <label className="form-lbl">Task name</label>
                  <input className="form-inp" required value={newTask.title} onChange={(event) => setNewTask({ ...newTask, title: event.target.value })} placeholder="Fix login redirect on mobile" />
                </div>
                <div className="form-row">
                  <label className="form-lbl">Description</label>
                  <textarea className="form-ta" value={newTask.description} onChange={(event) => setNewTask({ ...newTask, description: event.target.value })} placeholder="Add context, requirements, or links..." />
                </div>
                <div className="form-row-2">
                  <div className="form-row">
                    <label className="form-lbl">Project</label>
                    <div className="relative">
                      <select
                        className="form-inp w-full appearance-none pr-8 bg-surface border border-border rounded-lg text-text-primary"
                        value={newTask.project_id}
                        onChange={(event) => setNewTask({ ...newTask, project_id: event.target.value })}
                      >
                        <option value="">No project</option>
                        {projects.map((project: any) => (
                          <option key={project.id} value={project.id}>{project.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="form-row">
                    <label className="form-lbl">Priority</label>
                    <div className="flex gap-1.5">
                      {(['low', 'medium', 'high'] as const).map((pri) => (
                        <button
                          key={pri}
                          type="button"
                          className={`px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-all ${
                            newTask.priority === pri
                              ? pri === 'high' ? 'bg-[var(--red-bg)] text-[var(--red)] border-[var(--red)]' :
                                pri === 'medium' ? 'bg-[var(--amber-bg)] text-[var(--amber)] border-[var(--amber)]' :
                                'bg-[var(--sage-bg)] text-[var(--sage)] border-[var(--sage)]'
                              : 'bg-transparent text-[var(--muted)] border-[var(--line)] hover:border-[var(--line2)]'
                          }`}
                          onClick={() => setNewTask({ ...newTask, priority: pri })}
                        >
                          {pri === 'high' ? '↑' : pri === 'medium' ? '→' : '↓'} {pri.charAt(0).toUpperCase() + pri.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="form-row-2">
                  <div className="form-row">
                    <label className="form-lbl">Assignee</label>
                    <input className="form-inp" value={newTask.assignee} onChange={(event) => setNewTask({ ...newTask, assignee: event.target.value })} placeholder="Email or name" />
                  </div>
                  <div className="form-row">
                    <label className="form-lbl">Due date</label>
                    <input className="form-inp" type="date" value={newTask.due_date} onChange={(event) => setNewTask({ ...newTask, due_date: event.target.value })} />
                  </div>
                </div>
              </div>
              <div className="modal-ft">
                <button type="button" className="btn btn-ghost" onClick={() => setShowNewTaskForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-acc">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {editingTask ? (
        <EditTaskModal
          key={editingTask.id}
          isOpen={!!editingTask}
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSave={async () => {
            await queryClient.invalidateQueries({ queryKey: ['tasks', teamId] });
            setEditingTask(null);
          }}
        />
      ) : null}

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        title="Delete Task"
        message="This will permanently remove the selected task."
        itemName={deleteModal.task?.title || ''}
        onConfirm={confirmDeleteTask}
        onCancel={() => setDeleteModal({ isOpen: false, task: null })}
      />
    </div>
  );
}
