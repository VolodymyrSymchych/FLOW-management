'use client';

import { useEffect, useState } from 'react';
import { Plus, Calendar, Edit } from 'lucide-react';
import axios from 'axios';
import { Task } from '@/lib/tasks-api';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { EditTaskModal } from '@/components/EditTaskModal';

interface Project {
  id: number;
  name: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<any | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    project_id: '' as string | number,
    assignee: '',
    due_date: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    status: 'todo' as 'todo' | 'in_progress' | 'done'
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadProjects();
    loadTasks();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await axios.get('/api/projects');
      setProjects(response.data.projects || []);
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const loadTasks = async () => {
    try {
      const response = await axios.get('/api/tasks');
      setTasks(response.data.tasks);
    } catch (error) {
      console.error('Failed to load tasks:', error);
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

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as number;
    const overId = over.id;

    // Find the task being dragged
    const activeTask = tasks.find(t => t.id === activeId);
    if (!activeTask) return;

    // Determine the new status based on the drop zone
    let newStatus: 'todo' | 'in_progress' | 'done' = 'todo';
    
    // Check if dropped on a column
    if (overId === 'todo' || overId === 'in_progress' || overId === 'done') {
      newStatus = overId as 'todo' | 'in_progress' | 'done';
    } else {
      // If dropped on another task, use that task's status
      const overTask = tasks.find(t => t.id === parseInt(String(overId)));
      if (overTask) {
        const status = overTask.status;
        if (status === 'todo' || status === 'Todo') newStatus = 'todo';
        else if (status === 'in_progress' || status === 'In Progress') newStatus = 'in_progress';
        else if (status === 'done' || status === 'Done') newStatus = 'done';
      }
    }

    // Only update if status changed
    const currentStatus = activeTask.status === 'todo' || activeTask.status === 'Todo' ? 'todo' :
                         activeTask.status === 'in_progress' || activeTask.status === 'In Progress' ? 'in_progress' :
                         'done';
    
    if (currentStatus !== newStatus) {
      await updateTaskStatus(activeId, newStatus);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
      case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low': return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const todoTasks = tasks.filter(t => t.status === 'todo' || t.status === 'Todo');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress' || t.status === 'In Progress');
  const doneTasks = tasks.filter(t => t.status === 'done' || t.status === 'Done');

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Tasks</h1>
          <p className="text-text-secondary mt-1">
            Manage and track your tasks
          </p>
        </div>
        <button
          onClick={() => setShowNewTaskForm(!showNewTaskForm)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>New Task</span>
        </button>
      </div>

      {/* New Task Form */}
      {showNewTaskForm && (
        <div className="glass-medium rounded-2xl p-6 border border-white/10">
          <form onSubmit={createTask} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Title *
              </label>
              <input
                type="text"
                required
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="w-full px-4 py-3 rounded-lg glass-medium border border-white/10 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Description
              </label>
              <textarea
                rows={3}
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                className="w-full px-4 py-3 rounded-lg glass-medium border border-white/10 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Project
                </label>
                <select
                  value={newTask.project_id}
                  onChange={(e) => setNewTask({ ...newTask, project_id: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg glass-medium border border-white/10 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
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
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                  className="w-full px-4 py-3 rounded-lg glass-medium border border-white/10 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
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
                  Assignee
                </label>
                <input
                  type="text"
                  value={newTask.assignee}
                  onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg glass-medium border border-white/10 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Initials (e.g., AR)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={newTask.due_date}
                  onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg glass-medium border border-white/10 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowNewTaskForm(false)}
                className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-colors"
              >
                Create Task
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* To Do Column */}
          <KanbanColumn
            id="todo"
            title="To Do"
            tasks={todoTasks}
            color="bg-gray-400"
            onStatusChange={updateTaskStatus}
            getPriorityColor={getPriorityColor}
            onEdit={(task) => setEditingTask(task)}
          />

          {/* In Progress Column */}
          <KanbanColumn
            id="in_progress"
            title="In Progress"
            tasks={inProgressTasks}
            color="bg-blue-500"
            onStatusChange={updateTaskStatus}
            getPriorityColor={getPriorityColor}
            onEdit={(task) => setEditingTask(task)}
          />

          {/* Done Column */}
          <KanbanColumn
            id="done"
            title="Done"
            tasks={doneTasks}
            color="bg-green-500"
            onStatusChange={updateTaskStatus}
            getPriorityColor={getPriorityColor}
            onEdit={(task) => setEditingTask(task)}
          />
        </div>
        <DragOverlay>
          {activeId ? (
            <div className="glass-medium rounded-xl p-4 border border-white/10 opacity-90 rotate-2">
              <div className="font-semibold text-text-primary">
                {tasks.find(t => t.id === activeId)?.title}
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

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
    </div>
  );
}

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: any[];
  color: string;
  onStatusChange: (taskId: number, status: 'todo' | 'in_progress' | 'done') => void;
  getPriorityColor: (priority: string) => string;
  onEdit: (task: any) => void;
}

function KanbanColumn({ id, title, tasks, color, onStatusChange, getPriorityColor, onEdit }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text-primary flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${color}`}></div>
          <span>{title}</span>
          <span className="text-text-tertiary text-sm">({tasks.length})</span>
        </h3>
      </div>
      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={`space-y-3 min-h-[200px] rounded-lg p-2 transition-colors ${
            isOver ? 'bg-primary/10 border-2 border-primary border-dashed' : ''
          }`}
        >
          {tasks.map((task) => (
            <SortableTaskCard
              key={task.id}
              task={task}
              onStatusChange={onStatusChange}
              getPriorityColor={getPriorityColor}
              onEdit={onEdit}
            />
          ))}
          {tasks.length === 0 && (
            <div className="text-center py-8 text-text-tertiary">
              No tasks
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

interface TaskCardProps {
  task: any;
  onStatusChange: (taskId: number, status: 'todo' | 'in_progress' | 'done') => void;
  getPriorityColor: (priority: string) => string;
  onEdit: (task: any) => void;
}

function SortableTaskCard({ task, onStatusChange, getPriorityColor, onEdit }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="glass-medium rounded-xl p-4 border border-white/10 hover:glass-light transition-all duration-200 hover:scale-[1.02]"
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          {/* Draggable area - title and content */}
          <div 
            {...listeners}
            className="flex-1 min-w-0 cursor-grab active:cursor-grabbing"
          >
            <h4 className="font-semibold text-text-primary break-words">{task.title}</h4>
          </div>
          {/* Non-draggable area - edit button and priority */}
          <div className="flex items-center gap-2 flex-shrink-0 pointer-events-auto">
            <button
              onClick={() => onEdit(task)}
              className="p-1.5 hover:bg-white/10 rounded transition-colors flex-shrink-0 cursor-pointer"
              title="Edit task"
            >
              <Edit className="w-4 h-4 text-text-secondary hover:text-primary" />
            </button>
            <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${getPriorityColor(task.priority || 'medium')}`}>
              {task.priority || 'medium'}
            </span>
          </div>
        </div>

        {/* Draggable area - description */}
        {task.description && (
          <div {...listeners} className="cursor-grab active:cursor-grabbing">
            <p className="text-sm text-text-secondary line-clamp-2">
              {task.description}
            </p>
          </div>
        )}

        {/* Draggable area - metadata */}
        <div 
          {...listeners}
          className="flex items-center justify-between text-sm cursor-grab active:cursor-grabbing"
        >
          {(task.dueDate || task.due_date) && (
            <div className="flex items-center space-x-2 text-text-tertiary">
              <Calendar className="w-4 h-4" />
              <span>{new Date((task.dueDate || task.due_date) as string).toLocaleDateString()}</span>
            </div>
          )}
          {task.assignee && (
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-semibold">
                {task.assignee}
              </div>
            </div>
          )}
        </div>

        {/* Non-draggable area - status buttons */}
        <div className="flex gap-2 pt-2 border-t border-white/10 pointer-events-auto">
          {task.status !== 'todo' && (
            <button
              onClick={() => onStatusChange(task.id, 'todo')}
              className="flex-1 px-3 py-2 text-xs font-semibold rounded-lg glass-light text-text-primary hover:glass-medium transition-all hover:scale-105 cursor-pointer"
            >
              📋 To Do
            </button>
          )}
          {task.status !== 'in_progress' && (
            <button
              onClick={() => onStatusChange(task.id, 'in_progress')}
              className="flex-1 px-3 py-2 text-xs font-semibold rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30 transition-all hover:scale-105 cursor-pointer"
            >
              ⚡ In Progress
            </button>
          )}
          {task.status !== 'done' && (
            <button
              onClick={() => onStatusChange(task.id, 'done')}
              className="flex-1 px-3 py-2 text-xs font-semibold rounded-lg bg-green-500/20 text-green-300 border border-green-500/30 hover:bg-green-500/30 transition-all hover:scale-105 cursor-pointer"
            >
              ✓ Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
