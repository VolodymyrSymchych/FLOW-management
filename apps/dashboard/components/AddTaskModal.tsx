'use client';

import { useState } from 'react';
import axios from 'axios';
import { Modal, ModalFooter } from '@/components/ui/modal';
import { TaskForm } from './TaskForm';
import { Task } from '@/types';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  initialDate?: Date;
  projectId?: number;
  parentTaskId?: number;
}

export function AddTaskModal({ isOpen, onClose, onSave, initialDate, projectId, parentTaskId }: AddTaskModalProps) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: any) => {
    setLoading(true);
    try {
      const taskData = {
        title: formData.title.trim(),
        description: formData.description?.trim() || null,
        project_id: formData.project_id ? parseInt(formData.project_id as string) : null,
        parent_task_id: parentTaskId || null,
        assignee: formData.assignee?.trim() || null,
        start_date: formData.start_date || null,
        due_date: formData.due_date || null,
        end_date: formData.end_date || null,
        priority: formData.priority,
        status: formData.status,
      };
      await axios.post('/api/tasks', taskData);
      onSave();
      onClose();
    } catch (error: any) {
      console.error('Failed to create task:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to create task. Please try again.';
      alert(errorMessage);
      throw error; // Re-throw to prevent form submission
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Task"
      size="2xl"
    >
      <TaskForm
        initialDate={initialDate}
        projectId={projectId}
        parentTaskId={parentTaskId}
        onSubmit={handleSubmit}
        loading={loading}
        submitLabel="Create Task"
      />
      <ModalFooter>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          form="task-form"
          disabled={loading}
          className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Task'}
        </button>
      </ModalFooter>
    </Modal>
  );
}

