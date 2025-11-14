'use client';

import { useState } from 'react';
import axios from 'axios';
import { Modal, ModalFooter } from '@/components/ui/modal';
import { TaskForm } from './TaskForm';
import { Task } from '@/types';

interface EditTaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function EditTaskModal({ task, isOpen, onClose, onSave }: EditTaskModalProps) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: any) => {
    if (!task) return;

    setLoading(true);
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
      onSave();
      onClose();
    } catch (error: any) {
      console.error('Failed to update task:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to update task. Please try again.';
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
      title="Edit Task"
      size="2xl"
    >
      <TaskForm
        task={task}
        onSubmit={handleSubmit}
        loading={loading}
        submitLabel="Save Changes"
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
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </ModalFooter>
    </Modal>
  );
}
