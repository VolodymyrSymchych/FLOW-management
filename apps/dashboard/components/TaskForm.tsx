'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useProjects } from '@/hooks/useProjects';
import { formatDateForInput } from '@/lib/utils';
import { Task, Project } from '@/types';
import { useTeam } from '@/contexts/TeamContext';

interface TaskFormData {
  title: string;
  description: string;
  project_id: string | number;
  assignee: string;
  start_date: string;
  due_date: string;
  end_date: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'done';
}

interface TaskFormProps {
  task?: Task | null;
  initialDate?: Date;
  projectId?: number;
  parentTaskId?: number;
  onSubmit: (data: TaskFormData) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  disabled?: boolean;
  submitLabel?: string;
}

export function TaskForm({
  task,
  initialDate,
  projectId,
  parentTaskId,
  onSubmit,
  onCancel,
  loading = false,
  disabled = false,
  submitLabel = 'Save',
}: TaskFormProps) {
  const { projects, loading: projectsLoading } = useProjects();
  const { selectedTeam } = useTeam();
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    project_id: projectId || '',
    assignee: '',
    start_date: '',
    due_date: '',
    end_date: '',
    priority: 'medium',
    status: 'todo',
  });

  // Load team members if project is selected
  useEffect(() => {
    const loadTeamMembers = async () => {
      const selectedProjectId = formData.project_id
        ? (typeof formData.project_id === 'string' ? parseInt(formData.project_id) : formData.project_id)
        : null;

      if (!selectedProjectId) {
        setTeamMembers([]);
        return;
      }

      const selectedProject = projects.find(p => p.id === selectedProjectId);
      if (!selectedProject?.team_id) {
        setTeamMembers([]);
        return;
      }

      setLoadingMembers(true);
      try {
        const response = await fetch(`/api/teams/${selectedProject.team_id}/members`);
        if (response.ok) {
          const data = await response.json();
          setTeamMembers(data.members || []);
        }
      } catch (error) {
        console.error('Failed to load team members:', error);
      } finally {
        setLoadingMembers(false);
      }
    };

    loadTeamMembers();
  }, [formData.project_id, projects]);

  // Initialize form data
  useEffect(() => {
    if (task) {
      // Edit mode
      setFormData({
        title: task.title || '',
        description: task.description || '',
        project_id: task.project_id || '',
        assignee: task.assignee || '',
        start_date: formatDateForInput(task.start_date),
        due_date: formatDateForInput(task.due_date),
        end_date: formatDateForInput(task.end_date),
        priority: task.priority || 'medium',
        status: task.status || 'todo',
      });
    } else if (initialDate) {
      // Create mode with initial date
      const dateStr = formatDateForInput(initialDate);
      setFormData(prev => ({
        ...prev,
        start_date: dateStr,
        due_date: dateStr,
        project_id: projectId || '',
      }));
    } else {
      // Create mode - reset form
      setFormData({
        title: '',
        description: '',
        project_id: projectId || '',
        assignee: '',
        start_date: '',
        due_date: '',
        end_date: '',
        priority: 'medium',
        status: 'todo',
      });
    }
  }, [task, initialDate, projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  const selectedProject = projects.find(p => p.id === (typeof formData.project_id === 'string' ? parseInt(formData.project_id) : formData.project_id));
  const hasTeamMembers = teamMembers.length > 0;

  const isDisabled = loading || disabled;

  return (
    <form id="task-form" onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Title"
        required
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        disabled={isDisabled}
      />

      <Textarea
        label="Description"
        rows={3}
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        disabled={isDisabled}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            Project
          </label>
          <select
            value={formData.project_id}
            onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
            className="w-full px-3 py-2.5 rounded-lg glass-medium border border-white/10 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary bg-surface"
            disabled={isDisabled || projectsLoading}
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
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            Priority
          </label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
            className="w-full px-3 py-2.5 rounded-lg glass-medium border border-white/10 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary bg-surface"
            disabled={isDisabled}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            className="w-full px-3 py-2.5 rounded-lg glass-medium border border-white/10 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary bg-surface"
            disabled={isDisabled}
          >
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            Assignee
          </label>
          {hasTeamMembers ? (
            <select
              value={formData.assignee}
              onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg glass-medium border border-white/10 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary bg-surface"
              disabled={isDisabled || loadingMembers}
            >
              <option value="">No Assignee</option>
              {teamMembers.map((member) => (
                <option key={member.userId} value={member.user?.email || member.user?.username || ''}>
                  {member.user?.fullName || member.user?.username || member.user?.email} {member.role && `(${member.role})`}
                </option>
              ))}
            </select>
          ) : (
            <Input
              type="text"
              value={formData.assignee}
              onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
              placeholder="Email or username"
              disabled={isDisabled}
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          type="date"
          label="Start Date"
          value={formData.start_date}
          onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
          disabled={isDisabled}
        />
        <Input
          type="date"
          label="Due Date"
          value={formData.due_date}
          onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
          disabled={isDisabled}
        />
        <Input
          type="date"
          label="End Date"
          value={formData.end_date}
          onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
          disabled={isDisabled}
        />
      </div>
    </form>
  );
}


