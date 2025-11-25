'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Plus, Calendar, Edit, Trash2, ArrowUpDown, Search, Filter, CheckCircle2, Circle, Clock } from 'lucide-react';
import axios from 'axios';
import { useTeam } from '@/contexts/TeamContext';
import { cn } from '@/lib/utils';
import { useLocale } from 'next-intl';

// Lazy load modals
const EditTaskModal = dynamic(() => import('@/components/EditTaskModal').then(m => ({ default: m.EditTaskModal })), {
  ssr: false
});

const DeleteConfirmModal = dynamic(() => import('@/components/DeleteConfirmModal').then(m => ({ default: m.DeleteConfirmModal })), {
  ssr: false
});

interface Project {
  id: number;
  name: string;
}

export default function TasksPage() {
  const locale = useLocale();
  const { selectedTeam, isLoading: teamsLoading } = useTeam();
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<any | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterStatus, setFilterStatus] = useState<'all' | 'todo' | 'in_progress' | 'done'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; task: any | null }>({
    isOpen: false,
    task: null,
  });
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    project_id: '' as string | number,
    assignee: '',
    due_date: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    status: 'todo' as 'todo' | 'in_progress' | 'done'
  });

  useEffect(() => {
    // Wait for teams to load before loading data
    if (!teamsLoading) {
      loadProjects();
      loadTasks();
    }
  }, [selectedTeam, teamsLoading]); // Reload when team changes

  const loadProjects = async () => {
    try {
      // Build query params for team filtering
      const teamId = selectedTeam.type === 'single' && selectedTeam.teamId
        ? selectedTeam.teamId
        : 'all';
      const url = teamId !== 'all'
        ? `/api/projects?team_id=${teamId}`
        : '/api/projects';

      const response = await axios.get(url);
      setProjects(response.data.projects || []);
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const loadTasks = async () => {
    try {
      setLoading(true);
      // Build query params for team filtering
      const teamId = selectedTeam.type === 'single' && selectedTeam.teamId
        ? selectedTeam.teamId
        : 'all';
      const url = teamId !== 'all'
        ? `/api/tasks?team_id=${teamId}`
        : '/api/tasks';

      const response = await axios.get(url);
      const tasksData = response.data?.tasks || [];
      if (Array.isArray(tasksData)) {
        setTasks(tasksData);
      } else {
        setTasks([]);
      }
    } catch (error: any) {
      console.error('Failed to load tasks:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const taskData = {
        title: newTask.title,
        description: newTask.description || null,
        project_id: newTask.project_id && newTask.project_id !== '' ? parseInt(newTask.project_id as string) : null,
        assignee: newTask.assignee || null,
        due_date: newTask.due_date || null,
        priority: newTask.priority,
        status: newTask.status,
      };
      await axios.post('/api/tasks', taskData);
      setNewTask({
        title: '',
        description: '',
        project_id: '',
        assignee: '',
        due_date: '',
        priority: 'medium',
        status: 'todo'
      });
      setShowNewTaskForm(false);
      loadTasks();
    } catch (error: any) {
      console.error('Failed to create task:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to create task. Please try again.';
      alert(errorMessage);
    }
  };

  const updateTaskStatus = async (taskId: number, status: 'todo' | 'in_progress' | 'done') => {
    try {
      await axios.put(`/api/tasks/${taskId}`, { status });
      loadTasks();
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const deleteTask = async (taskId: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setDeleteModal({ isOpen: true, task });
    }
  };

  const confirmDeleteTask = async () => {
    if (!deleteModal.task) return;

    try {
      await axios.delete(`/api/tasks/${deleteModal.task.id}`);
      setDeleteModal({ isOpen: false, task: null });
      loadTasks();
    } catch (error: any) {
      console.error('Failed to delete task:', error);
      alert(error.response?.data?.error || 'Failed to delete task. Please try again.');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'low': return 'bg-green-500/10 text-green-500 border-green-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'in_progress': return <Clock className="w-5 h-5 text-blue-500" />;
      default: return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const filteredTasks = tasks
    .filter(task => {
      if (filterStatus !== 'all' && task.status !== filterStatus) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          task.title.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query) ||
          task.assignee?.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .sort((a, b) => {
      const aTitle = (a.title || '').toLowerCase();
      const bTitle = (b.title || '').toLowerCase();
      return sortOrder === 'asc' ? aTitle.localeCompare(bTitle) : bTitle.localeCompare(aTitle);
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Tasks List</h1>
          <p className="text-text-secondary mt-1">
            Manage your tasks in a simple list view
          </p>
        </div>
        <button
          onClick={() => setShowNewTaskForm(!showNewTaskForm)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/25"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-medium border border-white/10 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="pl-10 pr-8 py-2.5 rounded-xl glass-medium border border-white/10 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer min-w-[140px]"
            >
              <option value="all">All Status</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
          <button
            onClick={toggleSortOrder}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-medium border border-white/10 text-text-primary hover:glass-light transition-colors"
            title={`Sort by name ${sortOrder === 'asc' ? 'A-Z' : 'Z-A'}`}
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* New Task Form */}
      {showNewTaskForm && (
        <div className="glass-medium rounded-xl p-6 border border-white/10 animate-in fade-in slide-in-from-top-4">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Create New Task</h3>
          <form onSubmit={createTask} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-text-primary mb-1.5">
                Title *
              </label>
              <input
                type="text"
                required
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg glass-medium border border-white/10 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-primary mb-1.5">
                Description
              </label>
              <textarea
                rows={2}
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg glass-medium border border-white/10 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-primary mb-1.5">
                  Project
                </label>
                <select
                  value={newTask.project_id}
                  onChange={(e) => setNewTask({ ...newTask, project_id: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg glass-medium border border-white/10 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">No Project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-primary mb-1.5">
                  Priority
                </label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                  className="w-full px-3 py-2 text-sm rounded-lg glass-medium border border-white/10 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-primary mb-1.5">
                  Assignee
                </label>
                <input
                  type="text"
                  value={newTask.assignee}
                  onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg glass-medium border border-white/10 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Initials (e.g., AR)"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-primary mb-1.5">
                  Due Date
                </label>
                <input
                  type="date"
                  value={newTask.due_date}
                  onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg glass-medium border border-white/10 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowNewTaskForm(false)}
                className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:opacity-90 transition-colors"
              >
                Create Task
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tasks List */}
      <div className="glass-medium rounded-xl border border-white/10 overflow-hidden">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-text-tertiary" />
            </div>
            <h3 className="text-lg font-medium text-text-primary mb-2">No tasks found</h3>
            <p className="text-text-secondary">
              {searchQuery || filterStatus !== 'all'
                ? "Try adjusting your filters or search query"
                : "Create a new task to get started"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Title</th>
                  <th className="px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Project</th>
                  <th className="px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Assignee</th>
                  <th className="px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredTasks.map((task) => (
                  <tr
                    key={task.id}
                    className="group hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => updateTaskStatus(task.id, task.status === 'done' ? 'todo' : 'done')}
                        className="focus:outline-none hover:scale-110 transition-transform"
                      >
                        {getStatusIcon(task.status)}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className={cn(
                          "text-sm font-medium text-text-primary",
                          task.status === 'done' && "line-through text-text-tertiary"
                        )}>
                          {task.translations?.title?.[locale] || task.title}
                        </span>
                        {(task.translations?.description?.[locale] || task.description) && (
                          <span className="text-xs text-text-tertiary line-clamp-1 mt-0.5">
                            {task.translations?.description?.[locale] || task.description}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {task.project_id ? (
                        <span className="text-xs text-text-secondary px-2 py-1 rounded-full bg-white/5 border border-white/10">
                          {projects.find(p => p.id === task.project_id)?.name || 'Unknown Project'}
                        </span>
                      ) : (
                        <span className="text-xs text-text-tertiary">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cn(
                        "text-xs px-2 py-1 rounded-full border font-medium capitalize",
                        getPriorityColor(task.priority)
                      )}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {task.assignee ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-[10px] font-bold">
                            {task.assignee.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="text-sm text-text-secondary">{task.assignee}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-text-tertiary">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {task.due_date ? (
                        <div className="flex items-center gap-1.5 text-text-secondary">
                          <Calendar className="w-3.5 h-3.5" />
                          <span className="text-sm">
                            {new Date(task.due_date).toLocaleDateString()}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-text-tertiary">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditingTask(task)}
                          className="p-1.5 hover:bg-white/10 rounded-lg text-text-secondary hover:text-primary transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="p-1.5 hover:bg-white/10 rounded-lg text-text-secondary hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Task Modal */}
      <EditTaskModal
        task={editingTask}
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        onSave={() => {
          loadTasks();
          setEditingTask(null);
        }}
      />

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        title="Delete Task"
        message="This will mark the task as deleted. This action can be undone by restoring the task from the deleted tasks list."
        itemName={deleteModal.task?.title || ''}
        onConfirm={confirmDeleteTask}
        onCancel={() => setDeleteModal({ isOpen: false, task: null })}
      />
    </div>
  );
}
