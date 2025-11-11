'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';

interface Project {
  id: number;
  name: string;
}

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  initialDate?: Date;
  projectId?: number;
  parentTaskId?: number;
}

export function AddTaskModal({ isOpen, onClose, onSave, initialDate, projectId, parentTaskId }: AddTaskModalProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project_id: '' as string | number,
    parent_task_id: '' as string | number,
    assignee: '',
    start_date: '',
    due_date: '',
    end_date: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    status: 'todo' as 'todo' | 'in_progress' | 'done'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadProjects();
      // Pre-fill dates if initialDate is provided
      if (initialDate) {
        const dateStr = initialDate.toISOString().split('T')[0];
        setFormData(prev => ({
          ...prev,
          start_date: dateStr,
          due_date: dateStr,
          project_id: projectId || '',
          parent_task_id: parentTaskId || ''
        }));
      } else {
        // Reset form when opening without initial date
        setFormData({
          title: '',
          description: '',
          project_id: projectId || '',
          parent_task_id: parentTaskId || '',
          assignee: '',
          start_date: '',
          due_date: '',
          end_date: '',
          priority: 'medium',
          status: 'todo'
        });
      }
    }
  }, [isOpen, initialDate, projectId, parentTaskId]);

  const loadProjects = async () => {
    try {
      const response = await axios.get('/api/projects');
      setProjects(response.data.projects || []);
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      const taskData = {
        title: formData.title,
        description: formData.description || null,
        project_id: formData.project_id ? parseInt(formData.project_id as string) : null,
        parent_task_id: formData.parent_task_id ? parseInt(formData.parent_task_id as string) : null,
        assignee: formData.assignee || null,
        start_date: formData.start_date || null,
        due_date: formData.due_date || null,
        end_date: formData.end_date || null,
        priority: formData.priority,
        status: formData.status,
      };
      await axios.post('/api/tasks', taskData);
      onSave();
      onClose();
      // Reset form
      setFormData({
        title: '',
        description: '',
        project_id: '',
        parent_task_id: '',
        assignee: '',
        start_date: '',
        due_date: '',
        end_date: '',
        priority: 'medium',
        status: 'todo'
      });
    } catch (error: any) {
      console.error('Failed to create task:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to create task. Please try again.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-md">
      <div className="glass-medium rounded-2xl p-6 border border-white/5 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-text-primary">Add New Task</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-text-primary" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 rounded-lg glass-medium border border-white/5 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Description
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 rounded-lg glass-medium border border-white/5 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Project
              </label>
              <select
                value={formData.project_id}
                onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                className="w-full px-4 py-3 rounded-lg glass-medium border border-white/5 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
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
              <label className="block text-sm font-medium text-text-primary mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full px-4 py-3 rounded-lg glass-medium border border-white/5 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-4 py-3 rounded-lg glass-medium border border-white/5 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Assignee
              </label>
              <input
                type="text"
                value={formData.assignee}
                onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                className="w-full px-4 py-3 rounded-lg glass-medium border border-white/5 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Initials (e.g., AR)"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-4 py-3 rounded-lg glass-medium border border-white/5 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Due Date
              </label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full px-4 py-3 rounded-lg glass-medium border border-white/5 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                End Date
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-4 py-3 rounded-lg glass-medium border border-white/5 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

