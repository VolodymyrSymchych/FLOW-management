'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { ArrowLeft, Lock, UserCircle } from 'lucide-react';
import { TaskForm } from '@/components/TaskForm';
import { Task } from '@/types';
import { useQueryClient } from '@tanstack/react-query';

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const taskId = parseInt(params.id as string);

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lockInfo, setLockInfo] = useState<{ isLocked: boolean; lockedBy?: string; lockedAt?: string } | null>(null);

  useEffect(() => {
    loadTask();
    checkLock();

    // Poll for lock status every 5 seconds
    const interval = setInterval(checkLock, 5000);
    return () => clearInterval(interval);
  }, [taskId]);

  const loadTask = async () => {
    try {
      const response = await axios.get(`/api/tasks/${taskId}`);
      setTask(response.data.task);
    } catch (error: any) {
      console.error('Failed to load task:', error);
      alert('Failed to load task');
      router.push('/dashboard/tasks');
    } finally {
      setLoading(false);
    }
  };

  const checkLock = async () => {
    try {
      const response = await axios.get(`/api/tasks/${taskId}/lock`);
      setLockInfo(response.data);
    } catch (error) {
      console.error('Failed to check lock:', error);
    }
  };

  const acquireLock = async () => {
    try {
      await axios.post(`/api/tasks/${taskId}/lock`);
      checkLock();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to acquire lock');
    }
  };

  const releaseLock = async () => {
    try {
      await axios.delete(`/api/tasks/${taskId}/lock`);
      checkLock();
    } catch (error) {
      console.error('Failed to release lock:', error);
    }
  };

  const handleSubmit = async (formData: any) => {
    if (!task) return;

    setSaving(true);
    try {
      const updateData = {
        title: formData.title.trim(),
        description: formData.description?.trim() || null,
        project_id: formData.project_id ? parseInt(formData.project_id as string) : null,
        assignee: formData.assignee?.trim() || null,
        start_date: formData.start_date || null,
        due_date: formData.due_date || null,
        end_date: formData.end_date || null,
        priority: formData.priority,
        status: formData.status,
      };
      await axios.put(`/api/tasks/${task.id}`, updateData);

      // Invalidate queries and go back
      await queryClient.invalidateQueries({ queryKey: ['tasks'] });
      router.push('/dashboard/tasks');
    } catch (error: any) {
      console.error('Failed to update task:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to update task. Please try again.';
      alert(errorMessage);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    // Release lock when leaving page
    return () => {
      if (lockInfo && !lockInfo.isLocked) {
        releaseLock();
      }
    };
  }, [lockInfo]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-white/10 rounded animate-pulse" />
          <div className="h-8 w-64 bg-white/10 rounded animate-pulse" />
        </div>
        <div className="glass-medium rounded-xl p-6 border border-white/10">
          <div className="space-y-4">
            <div className="h-10 bg-white/10 rounded animate-pulse" />
            <div className="h-32 bg-white/10 rounded animate-pulse" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-10 bg-white/10 rounded animate-pulse" />
              <div className="h-10 bg-white/10 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary">Task not found</p>
      </div>
    );
  }

  const isLocked = Boolean(lockInfo?.isLocked && lockInfo.lockedBy);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard/tasks')}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-text-secondary" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Edit Task</h1>
            <p className="text-sm text-text-secondary mt-1">
              Make changes to your task
            </p>
          </div>
        </div>
      </div>

      {/* Lock Warning */}
      {isLocked && (
        <div className="glass-medium rounded-xl p-4 border border-yellow-500/20 bg-yellow-500/10">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-yellow-500" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-500">
                This task is currently being edited
              </p>
              <p className="text-xs text-text-secondary mt-1">
                <UserCircle className="w-3 h-3 inline mr-1" />
                {lockInfo.lockedBy} started editing {new Date(lockInfo.lockedAt!).toLocaleTimeString()}
              </p>
            </div>
            <button
              onClick={acquireLock}
              className="px-3 py-1.5 text-xs bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-500 rounded-lg transition-colors"
            >
              Take over
            </button>
          </div>
        </div>
      )}

      {/* Task Form */}
      <div className="glass-medium rounded-xl p-6 border border-white/10">
        <TaskForm
          task={task}
          onSubmit={handleSubmit}
          loading={saving}
          submitLabel="Save Changes"
          disabled={isLocked}
        />
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={() => router.push('/dashboard/tasks')}
            className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="task-form"
            disabled={saving || isLocked}
            className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
