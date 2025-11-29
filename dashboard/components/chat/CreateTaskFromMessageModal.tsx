'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Message {
  id: number;
  content: string;
  chatId: number;
}

interface Project {
  id: number;
  name: string;
}

interface CreateTaskFromMessageModalProps {
  open: boolean;
  onClose: () => void;
  message: Message | null;
  onTaskCreated: (taskId: number) => void;
}

export function CreateTaskFromMessageModal({
  open,
  onClose,
  message,
  onTaskCreated,
}: CreateTaskFromMessageModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState<number | null>(null);
  const [priority, setPriority] = useState<string>('medium');
  const [dueDate, setDueDate] = useState('');
  const [assignee, setAssignee] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && message) {
      // Pre-fill with message content
      setTitle(message.content.substring(0, 100));
      setDescription(message.content);
      loadProjects();
    }
  }, [open, message]);

  const loadProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const createTask = async () => {
    if (!message) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/chat/messages/${message.id}/create-task`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            description,
            projectId,
            priority,
            dueDate: dueDate || undefined,
            assignee: assignee || undefined,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        onTaskCreated(data.taskId);
        handleClose();
      }
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setProjectId(null);
    setPriority('medium');
    setDueDate('');
    setAssignee('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Створити завдання з повідомлення</DialogTitle>
          <DialogDescription>
            Заповніть деталі завдання
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Назва завдання *</Label>
            <Input
              id="title"
              placeholder="Введіть назву завдання"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={255}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Опис</Label>
            <Textarea
              id="description"
              placeholder="Опишіть завдання детальніше..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          {/* Project */}
          <div className="space-y-2">
            <Label htmlFor="project">Проект</Label>
            <Select
              value={projectId?.toString()}
              onValueChange={(value) => setProjectId(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Оберіть проект (необов'язково)" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id.toString()}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="priority">Пріоритет</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Низький</SelectItem>
                <SelectItem value="medium">Середній</SelectItem>
                <SelectItem value="high">Високий</SelectItem>
                <SelectItem value="urgent">Термінoвий</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="dueDate">Термін виконання</Label>
            <Input
              id="dueDate"
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          {/* Assignee */}
          <div className="space-y-2">
            <Label htmlFor="assignee">Виконавець</Label>
            <Input
              id="assignee"
              placeholder="Ім'я виконавця (необов'язково)"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Скасувати
          </Button>
          <Button onClick={createTask} disabled={!title.trim() || loading}>
            {loading ? 'Створення...' : 'Створити завдання'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

