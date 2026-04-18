'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { Task } from '@/types';
import { useTeam } from '@/contexts/TeamContext';
import { formatDateForInput } from '@/lib/utils';
import {
  X, Square, Calendar, User, Tag, AlignLeft,
  Plus, Check, Send, ChevronDown, Flag, Layers,
  MessageCircle, Clock, Search, FolderOpen,
  Bold, Italic, List, ListOrdered, Code, Strikethrough,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from '@/i18n/routing';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

interface EditTaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

interface FormData {
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

interface Subtask { id: number; title: string; status: string; }
interface Comment { id: number; content: string; createdAt: string; user?: { fullName?: string; username?: string; email?: string; }; }
interface Project { id: number; name: string; }

const STATUS_META: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  todo: { label: 'To Do', color: 'hsl(var(--text-tertiary))', bg: 'hsl(var(--muted) / 0.5)', dot: 'hsl(var(--text-tertiary))' },
  in_progress: { label: 'In Progress', color: 'hsl(var(--info))', bg: 'hsl(var(--info-soft))', dot: 'hsl(var(--info))' },
  done: { label: 'Done', color: 'hsl(var(--success))', bg: 'hsl(var(--success-soft))', dot: 'hsl(var(--success))' },
};

const PRIORITY_META: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  low: { label: 'Low', color: 'hsl(var(--success))', bg: 'hsl(var(--success-soft))', icon: '↓' },
  medium: { label: 'Medium', color: 'hsl(var(--warning))', bg: 'hsl(var(--warning-soft))', icon: '→' },
  high: { label: 'High', color: 'hsl(var(--danger))', bg: 'hsl(var(--danger-soft))', icon: '↑' },
};

function formatDisplayDate(val: string) {
  if (!val) return '';
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function relativeTime(dateStr: string) {
  const d = new Date(dateStr);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return Math.floor(hrs / 24) + 'd ago';
}

function getInitials(name: string) {
  return (name || '?').split(/\s+/).filter(Boolean).map((p) => p[0]).join('').slice(0, 2).toUpperCase();
}

function avatarColor(name: string) {
  const colors = ['#e8753a', '#60a5fa', '#4ade80', '#fbbf24', '#c084fc', '#f87171', '#34d399'];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff;
  return colors[Math.abs(h) % colors.length];
}

const PROJECT_COLORS = ['#E8753A', '#3D7A5A', '#6941C6', '#B83232', '#2E5DA8', '#B8870A'];

// --- Custom Dropdown ---
interface DropdownOption {
  value: string;
  label: string;
  avatar?: { initials: string; color: string };
  dotColor?: string;
}

function CustomDropdown({
  options,
  value,
  onChange,
  placeholder,
  searchable = false,
  icon,
  disabled,
}: {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  searchable?: boolean;
  icon?: React.ReactNode;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.value === value);
  const filtered = search
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  useEffect(() => {
    if (open && searchable) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
    if (!open) setSearch('');
  }, [open, searchable]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={containerRef} className="relative flex-1 min-w-0">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center gap-2 w-full rounded-lg px-3 py-[7px] text-[13px] font-medium',
          'border border-transparent transition-all duration-150',
          'hover:bg-surface-muted hover:border-border',
          'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          open && 'bg-surface-muted border-border shadow-sm',
          !selected && 'text-text-tertiary'
        )}
      >
        {selected?.avatar && (
          <span
            className="inline-flex items-center justify-center w-[22px] h-[22px] rounded-full text-[9px] font-bold text-white flex-shrink-0"
            style={{ background: selected.avatar.color }}
          >
            {selected.avatar.initials}
          </span>
        )}
        {selected?.dotColor && (
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: selected.dotColor }} />
        )}
        {icon && !selected?.avatar && !selected?.dotColor && (
          <span className="text-text-tertiary flex-shrink-0">{icon}</span>
        )}
        <span className="truncate text-text-primary">
          {selected?.label || placeholder}
        </span>
        <ChevronDown className={cn('w-3.5 h-3.5 ml-auto text-text-tertiary transition-transform flex-shrink-0', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 rounded-xl border border-border bg-surface shadow-floating overflow-hidden animate-fadeIn">
          {searchable && (
            <div className="p-2 border-b border-border">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-tertiary" />
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-8 pr-3 py-1.5 text-[13px] bg-transparent border-none outline-none text-text-primary placeholder:text-text-tertiary"
                />
              </div>
            </div>
          )}
          <div className="max-h-[200px] overflow-y-auto py-1">
            <button
              type="button"
              onClick={() => { onChange(''); setOpen(false); }}
              className={cn(
                'flex items-center gap-2 w-full px-3 py-2 text-[13px] text-left transition-colors',
                'hover:bg-surface-muted',
                !value && 'bg-primary/5 text-primary font-medium'
              )}
            >
              <span className="text-text-tertiary">{placeholder}</span>
            </button>
            {filtered.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => { onChange(option.value); setOpen(false); }}
                className={cn(
                  'flex items-center gap-2 w-full px-3 py-2 text-[13px] text-left transition-colors',
                  'hover:bg-surface-muted',
                  value === option.value && 'bg-primary/5 text-primary font-medium'
                )}
              >
                {option.avatar && (
                  <span
                    className="inline-flex items-center justify-center w-[22px] h-[22px] rounded-full text-[9px] font-bold text-white flex-shrink-0"
                    style={{ background: option.avatar.color }}
                  >
                    {option.avatar.initials}
                  </span>
                )}
                {option.dotColor && (
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: option.dotColor }} />
                )}
                <span className="truncate">{option.label}</span>
                {value === option.value && <Check className="w-3.5 h-3.5 ml-auto text-primary flex-shrink-0" />}
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="px-3 py-4 text-[13px] text-text-tertiary text-center">No results found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// --- Compact Rich Text Editor for the panel ---
function DescriptionEditor({
  content,
  onChange,
  disabled,
}: {
  content: string;
  onChange: (html: string) => void;
  disabled?: boolean;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit],
    content,
    editable: !disabled,
    onUpdate: ({ editor: e }) => onChange(e.getHTML()),
    editorProps: {
      attributes: {
        class: 'prose-editor-compact outline-none min-h-[100px] max-h-[300px] overflow-y-auto px-3 py-2.5 text-[14px] leading-relaxed text-text-primary',
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) return null;

  const ToolBtn = ({ onClick, active, children, title }: any) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        'p-1 rounded transition-colors',
        active
          ? 'bg-primary/10 text-primary'
          : 'text-text-tertiary hover:bg-surface-muted hover:text-text-secondary'
      )}
    >
      {children}
    </button>
  );

  return (
    <div className="rounded-lg border border-border bg-surface overflow-hidden">
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-border bg-surface-muted/50">
        <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold">
          <Bold className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic">
          <Italic className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough">
          <Strikethrough className="w-3.5 h-3.5" />
        </ToolBtn>
        <div className="w-px h-4 bg-border mx-1" />
        <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet list">
          <List className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered list">
          <ListOrdered className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Code">
          <Code className="w-3.5 h-3.5" />
        </ToolBtn>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

export function EditTaskModal({ task, isOpen, onClose, onSave }: EditTaskModalProps) {
  const { selectedTeam, teams } = useTeam();
  const [loading, setLoading] = useState(false);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeTab, setActiveTab] = useState<'subtasks' | 'comments' | 'activity'>('subtasks');
  const [mounted, setMounted] = useState(false);

  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [subtasksLoading, setSubtasksLoading] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [addingSubtask, setAddingSubtask] = useState(false);
  const subtaskInputRef = useRef<HTMLInputElement>(null);

  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [sendingComment, setSendingComment] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    title: '', description: '', project_id: '', assignee: '',
    start_date: '', due_date: '', end_date: '', priority: 'medium', status: 'todo',
  });

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    if (!task) return;
    setFormData({
      title: task.title || '',
      description: task.description || '',
      project_id: (task as any).projectId ?? task.project_id ?? '',
      assignee: task.assignee || '',
      start_date: formatDateForInput(task.start_date),
      due_date: formatDateForInput(task.due_date),
      end_date: formatDateForInput(task.end_date),
      priority: (task.priority as any) || 'medium',
      status: (task.status as any) || 'todo',
    });
    setSubtasks([]);
    setComments([]);
    setNewSubtaskTitle('');
    setNewComment('');
    setAddingSubtask(false);
    setActiveTab('subtasks');
  }, [task, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    fetch('/api/projects')
      .then((r) => r.ok ? r.json() : { projects: [] })
      .then((d) => setProjects(d.projects || []))
      .catch(() => { });
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;

    const loadMembers = async () => {
      let teamsToLoad = teams.length > 0 ? teams : [];

      if (teamsToLoad.length === 0) {
        try {
          const res = await fetch('/api/teams');
          if (res.ok) {
            const data = await res.json();
            teamsToLoad = data.teams || [];
          }
        } catch { /* ignore */ }
      }

      if (teamsToLoad.length === 0 || cancelled) return;

      const results = await Promise.all(
        teamsToLoad.map((t: any) =>
          fetch(`/api/teams/${t.id}/members`)
            .then((r) => (r.ok ? r.json() : { members: [] }))
            .then((d) => d.members || [])
            .catch(() => [])
        )
      );

      if (cancelled) return;

      const seen = new Set<number>();
      const merged: any[] = [];
      for (const list of results)
        for (const m of list)
          if (m.user && !seen.has(m.userId)) { seen.add(m.userId); merged.push(m); }
      setTeamMembers(merged);
    };

    loadMembers();
    return () => { cancelled = true; };
  }, [isOpen, teams]);

  const loadSubtasks = useCallback(async () => {
    if (!task) return;
    setSubtasksLoading(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}/subtasks`);
      if (res.ok) setSubtasks((await res.json()).subtasks || []);
    } finally { setSubtasksLoading(false); }
  }, [task]);

  const loadComments = useCallback(async () => {
    if (!task) return;
    setCommentsLoading(true);
    try {
      const res = await fetch(`/api/comments?entityType=task&entityId=${task.id}`);
      if (res.ok) setComments((await res.json()).comments || []);
    } finally { setCommentsLoading(false); }
  }, [task]);

  useEffect(() => {
    if (!isOpen) return;
    if (activeTab === 'subtasks') loadSubtasks();
    if (activeTab === 'comments') loadComments();
  }, [isOpen, activeTab, loadSubtasks, loadComments]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (addingSubtask) setTimeout(() => subtaskInputRef.current?.focus(), 50);
  }, [addingSubtask]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;
    setLoading(true);
    try {
      await axios.put(`/api/tasks/${task.id}`, {
        title: formData.title.trim(),
        description: formData.description?.trim() || null,
        project_id: formData.project_id ? parseInt(String(formData.project_id)) : null,
        assignee: formData.assignee?.trim() || null,
        start_date: formData.start_date || null,
        due_date: formData.due_date || null,
        end_date: formData.end_date || null,
        priority: formData.priority,
        status: formData.status,
      });
      onSave(); onClose();
    } catch (err: any) {
      alert(err.response?.data?.error || err.message || 'Failed to update task.');
    } finally { setLoading(false); }
  };

  const addSubtask = async () => {
    const title = newSubtaskTitle.trim();
    if (!title || !task) return;
    try {
      const res = await axios.post(`/api/tasks/${task.id}/subtasks`, { title });
      setSubtasks((prev) => [...prev, res.data.subtask]);
      setNewSubtaskTitle('');
    } catch (err: any) { alert(err.response?.data?.error || 'Failed to create subtask'); }
  };

  const toggleSubtask = async (subtask: Subtask) => {
    if (!task) return;
    const newStatus = subtask.status === 'done' ? 'todo' : 'done';
    try {
      await axios.put(`/api/tasks/${task.id}/subtasks/${subtask.id}`, { status: newStatus });
      setSubtasks((prev) => prev.map((s) => s.id === subtask.id ? { ...s, status: newStatus } : s));
    } catch { /* ignore */ }
  };

  const sendComment = async () => {
    const content = newComment.trim();
    if (!content || !task) return;
    setSendingComment(true);
    try {
      const res = await axios.post('/api/comments', { entityType: 'task', entityId: task.id, content });
      setComments((prev) => [...prev, res.data.comment]);
      setNewComment('');
    } catch (err: any) { alert(err.response?.data?.error || 'Failed to post comment'); }
    finally { setSendingComment(false); }
  };

  if (!mounted || !task) return null;

  const selectedProject = projects.find((p) => p.id === (formData.project_id ? parseInt(String(formData.project_id)) : -1));
  const statusMeta = STATUS_META[formData.status] ?? STATUS_META.todo;
  const priorityMeta = PRIORITY_META[formData.priority] ?? PRIORITY_META.medium;
  const doneSubs = subtasks.filter((s) => s.status === 'done').length;

  const assigneeOptions: DropdownOption[] = teamMembers.map((m) => {
    const name = m.user?.fullName || m.user?.username || m.user?.email || '';
    const val = m.user?.email || m.user?.username || '';
    return {
      value: val,
      label: name,
      avatar: { initials: getInitials(name), color: avatarColor(name) },
    };
  });

  const projectOptions: DropdownOption[] = projects.map((p, i) => ({
    value: String(p.id),
    label: p.name,
    dotColor: PROJECT_COLORS[i % PROJECT_COLORS.length],
  }));

  const tabs = [
    { key: 'subtasks' as const, label: 'Subtasks', icon: Layers, badge: subtasks.length > 0 ? `${doneSubs}/${subtasks.length}` : null },
    { key: 'comments' as const, label: 'Comments', icon: MessageCircle, badge: comments.length > 0 ? String(comments.length) : null },
    { key: 'activity' as const, label: 'Activity', icon: Clock, badge: null },
  ];

  const panel = (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-[99998] bg-black/0 pointer-events-none transition-all duration-300',
          isOpen && 'bg-black/40 backdrop-blur-[2px] pointer-events-auto'
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={cn(
          'fixed top-0 right-0 bottom-0 z-[99999] w-[620px] max-w-[96vw]',
          'bg-surface border-l border-border shadow-floating',
          'flex flex-col',
          'transform transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Edit task"
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

          {/* Top bar */}
          <div className="flex-none flex items-center justify-between px-5 py-3.5 border-b border-border">
            <div className="flex items-center gap-2 min-w-0 text-[12px] font-medium text-text-tertiary">
              <FolderOpen className="w-3.5 h-3.5 flex-shrink-0" />
              <Link href={`/dashboard/tasks/${task.id}`} className="hover:text-text-primary transition-colors truncate max-w-[160px]" onClick={onClose}>
                {selectedProject?.name || 'Task'}
              </Link>
              <span className="text-border">/</span>
              <span
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold"
                style={{ background: statusMeta.bg, color: statusMeta.color }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusMeta.dot }} />
                {statusMeta.label}
              </span>
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
                style={{ background: priorityMeta.bg, color: priorityMeta.color }}
              >
                {priorityMeta.icon} {priorityMeta.label}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-muted transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 min-h-0 overflow-y-auto px-6 pt-6 pb-3">

            {/* Title */}
            <input
              className="w-full text-[24px] font-bold text-text-primary tracking-[-0.02em] leading-tight bg-transparent border-none outline-none mb-6 placeholder:text-text-tertiary"
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              disabled={loading}
              placeholder="Task title"
            />

            {/* Properties grid */}
            <div className="flex flex-col mb-6">

              {/* Status */}
              <div className="flex items-start py-2.5 border-b border-border">
                <div className="flex items-center gap-2 w-[110px] flex-shrink-0 text-[13px] text-text-tertiary pt-1">
                  <Square className="w-3.5 h-3.5" />Status
                </div>
                <div className="flex-1 flex items-center gap-1.5 flex-wrap">
                  {(['todo', 'in_progress', 'done'] as const).map((s) => {
                    const m = STATUS_META[s];
                    const active = formData.status === s;
                    return (
                      <button key={s} type="button"
                        className={cn(
                          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium border transition-all',
                          active
                            ? 'border-current font-semibold'
                            : 'border-transparent text-text-tertiary hover:bg-surface-muted hover:text-text-secondary'
                        )}
                        style={active ? { background: m.bg, color: m.color, borderColor: m.dot } : {}}
                        onClick={() => setFormData({ ...formData, status: s })}
                        disabled={loading}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: m.dot }} />
                        {m.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Priority */}
              <div className="flex items-start py-2.5 border-b border-border">
                <div className="flex items-center gap-2 w-[110px] flex-shrink-0 text-[13px] text-text-tertiary pt-1">
                  <Flag className="w-3.5 h-3.5" />Priority
                </div>
                <div className="flex-1 flex items-center gap-1.5 flex-wrap">
                  {(['low', 'medium', 'high'] as const).map((pri) => {
                    const pm = PRIORITY_META[pri];
                    const active = formData.priority === pri;
                    return (
                      <button key={pri} type="button"
                        className={cn(
                          'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[12px] font-medium border transition-all',
                          active
                            ? 'font-semibold'
                            : 'border-transparent text-text-tertiary hover:bg-surface-muted hover:text-text-secondary'
                        )}
                        style={active ? { background: pm.bg, color: pm.color, borderColor: `${pm.color}40` } : {}}
                        onClick={() => setFormData({ ...formData, priority: pri })}
                        disabled={loading}
                      >
                        {pm.icon} {pm.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Due date */}
              <div className="flex items-start py-2.5 border-b border-border">
                <div className="flex items-center gap-2 w-[110px] flex-shrink-0 text-[13px] text-text-tertiary pt-1">
                  <Calendar className="w-3.5 h-3.5" />Due date
                </div>
                <div className="flex-1 flex items-center gap-2">
                  <div className="relative">
                    {formData.due_date && (
                      <span className="text-[13px] font-medium text-text-primary mr-1">{formatDisplayDate(formData.due_date)}</span>
                    )}
                    <input
                      type="date"
                      className={cn(
                        'text-[13px] bg-transparent border border-transparent rounded-lg px-2 py-1 outline-none',
                        'hover:border-border hover:bg-surface-muted focus:border-primary/30 focus:ring-2 focus:ring-primary/10',
                        'text-text-primary transition-all',
                        !formData.due_date && 'text-text-tertiary'
                      )}
                      value={formData.due_date}
                      onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* Assignee */}
              <div className="flex items-start py-2.5 border-b border-border">
                <div className="flex items-center gap-2 w-[110px] flex-shrink-0 text-[13px] text-text-tertiary pt-1">
                  <User className="w-3.5 h-3.5" />Assignee
                </div>
                <div className="flex-1">
                  <CustomDropdown
                    options={assigneeOptions}
                    value={formData.assignee}
                    onChange={(val) => setFormData({ ...formData, assignee: val })}
                    placeholder="Unassigned"
                    searchable
                    icon={<User className="w-3.5 h-3.5" />}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Project */}
              <div className="flex items-start py-2.5 border-b border-border">
                <div className="flex items-center gap-2 w-[110px] flex-shrink-0 text-[13px] text-text-tertiary pt-1">
                  <Tag className="w-3.5 h-3.5" />Project
                </div>
                <div className="flex-1">
                  <CustomDropdown
                    options={projectOptions}
                    value={String(formData.project_id)}
                    onChange={(val) => setFormData({ ...formData, project_id: val })}
                    placeholder="No Project"
                    searchable
                    icon={<FolderOpen className="w-3.5 h-3.5" />}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <div className="flex items-center gap-2 text-[13px] text-text-tertiary mb-2">
                <AlignLeft className="w-3.5 h-3.5" />
                Description
                <span className="ml-auto text-[11px] text-text-tertiary/60">Rich text supported</span>
              </div>
              <DescriptionEditor
                content={formData.description}
                onChange={(html) => setFormData({ ...formData, description: html })}
                disabled={loading}
              />
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 border-b border-border mb-4">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium border-b-2 transition-colors -mb-px',
                      activeTab === tab.key
                        ? 'border-primary text-primary'
                        : 'border-transparent text-text-tertiary hover:text-text-secondary hover:border-border'
                    )}
                    onClick={() => setActiveTab(tab.key)}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                    {tab.badge && (
                      <span className={cn(
                        'text-[10px] font-semibold px-1.5 py-0.5 rounded-full',
                        activeTab === tab.key ? 'bg-primary/10 text-primary' : 'bg-surface-muted text-text-tertiary'
                      )}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Tab: Subtasks */}
            {activeTab === 'subtasks' && (
              <div className="space-y-1">
                {subtasksLoading ? <div className="py-6 text-center text-[13px] text-text-tertiary">Loading…</div> : (
                  <>
                    {subtasks.length === 0 && !addingSubtask && (
                      <div className="py-6 text-center text-[13px] text-text-tertiary">No subtasks yet.</div>
                    )}
                    {subtasks.map((st) => (
                      <div key={st.id} className="flex items-center gap-2 py-1.5 group">
                        <button type="button"
                          className={cn(
                            'flex items-center justify-center w-[18px] h-[18px] rounded border transition-all',
                            st.status === 'done'
                              ? 'bg-success border-success text-white'
                              : 'border-border text-transparent hover:border-success/50 hover:text-success/50'
                          )}
                          onClick={() => toggleSubtask(st)}>
                          <Check className="w-3 h-3" />
                        </button>
                        <span className={cn('text-[13px]', st.status === 'done' ? 'text-text-tertiary line-through' : 'text-text-primary')}>
                          {st.title}
                        </span>
                      </div>
                    ))}
                    {addingSubtask ? (
                      <div className="flex items-center gap-2 py-1">
                        <span className="flex items-center justify-center w-[18px] h-[18px] rounded border border-border text-text-tertiary">
                          <Square className="w-3 h-3" />
                        </span>
                        <input ref={subtaskInputRef}
                          className="flex-1 text-[13px] bg-transparent border-none outline-none text-text-primary placeholder:text-text-tertiary"
                          value={newSubtaskTitle}
                          onChange={(e) => setNewSubtaskTitle(e.target.value)}
                          placeholder="Subtask title…"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') { e.preventDefault(); addSubtask(); }
                            if (e.key === 'Escape') { setAddingSubtask(false); setNewSubtaskTitle(''); }
                          }}
                          onBlur={() => { if (!newSubtaskTitle.trim()) setAddingSubtask(false); }}
                        />
                        <button type="button"
                          className="text-[12px] font-medium text-primary hover:text-primary-dark px-2 py-0.5 rounded transition-colors"
                          onClick={addSubtask}>Add</button>
                      </div>
                    ) : (
                      <button type="button"
                        className="flex items-center gap-1.5 text-[13px] text-text-tertiary hover:text-text-primary transition-colors py-1"
                        onClick={() => setAddingSubtask(true)}>
                        <Plus className="w-3.5 h-3.5" />Add subtask
                      </button>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Tab: Comments */}
            {activeTab === 'comments' && (
              <div className="space-y-3">
                {commentsLoading ? <div className="py-6 text-center text-[13px] text-text-tertiary">Loading…</div> : (
                  <>
                    {comments.length === 0 && <div className="py-6 text-center text-[13px] text-text-tertiary">No comments yet. Start the conversation!</div>}
                    {comments.map((c) => {
                      const name = c.user?.fullName || c.user?.username || c.user?.email || 'User';
                      return (
                        <div key={c.id} className="flex gap-2.5">
                          <span
                            className="inline-flex items-center justify-center w-7 h-7 rounded-full text-[10px] font-bold text-white flex-shrink-0 mt-0.5"
                            style={{ background: avatarColor(name) }}
                          >
                            {getInitials(name)}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[13px] font-semibold text-text-primary">{name}</span>
                              <span className="text-[11px] text-text-tertiary">{relativeTime(c.createdAt)}</span>
                            </div>
                            <div className="text-[13px] text-text-secondary mt-0.5 leading-relaxed">{c.content}</div>
                          </div>
                        </div>
                      );
                    })}
                    <div className="flex items-end gap-2 pt-2">
                      <textarea
                        className={cn(
                          'flex-1 text-[13px] bg-surface-muted border border-border rounded-lg px-3 py-2 resize-none outline-none',
                          'text-text-primary placeholder:text-text-tertiary',
                          'focus:border-primary/30 focus:ring-2 focus:ring-primary/10 transition-all'
                        )}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment… (Ctrl+Enter to send)"
                        rows={2}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                            e.preventDefault(); sendComment();
                          }
                        }}
                      />
                      <button type="button"
                        className={cn(
                          'p-2 rounded-lg transition-colors',
                          newComment.trim()
                            ? 'bg-primary text-white hover:bg-primary-dark'
                            : 'bg-surface-muted text-text-tertiary cursor-not-allowed'
                        )}
                        onClick={sendComment} disabled={sendingComment || !newComment.trim()}>
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Tab: Activity */}
            {activeTab === 'activity' && (
              <div className="space-y-3">
                {(task as any).createdAt ? (
                  <>
                    <ActivityRow
                      dotColor="hsl(var(--success))"
                      text="Task created"
                      time={`${formatDisplayDate((task as any).createdAt || '')} · ${relativeTime((task as any).createdAt)}`}
                    />
                    {(task as any).updatedAt && (task as any).updatedAt !== (task as any).createdAt && (
                      <ActivityRow
                        dotColor="hsl(var(--info))"
                        text="Last updated"
                        time={`${formatDisplayDate((task as any).updatedAt || '')} · ${relativeTime((task as any).updatedAt)}`}
                      />
                    )}
                    <ActivityRow
                      dotColor={statusMeta.color}
                      text={<>Status is <span style={{ color: statusMeta.color, fontWeight: 600 }}>{statusMeta.label}</span></>}
                      time="current"
                    />
                    <ActivityRow
                      dotColor={priorityMeta.color}
                      text={<>Priority set to <span style={{ color: priorityMeta.color, fontWeight: 600 }}>{priorityMeta.label}</span></>}
                      time="current"
                    />
                    {comments.length > 0 && (
                      <ActivityRow
                        dotColor="hsl(var(--primary))"
                        text={`${comments.length} comment${comments.length !== 1 ? 's' : ''} posted`}
                        time="total"
                      />
                    )}
                    {subtasks.length > 0 && (
                      <ActivityRow
                        dotColor="hsl(var(--text-tertiary))"
                        text={`${doneSubs}/${subtasks.length} subtasks completed`}
                        time="progress"
                      />
                    )}
                  </>
                ) : (
                  <div className="py-6 text-center text-[13px] text-text-tertiary">No activity available.</div>
                )}
              </div>
            )}

          </div>

          {/* Footer */}
          <div className="flex-none flex items-center justify-end gap-2 px-6 py-3.5 border-t border-border">
            <button type="button"
              className="px-4 py-2 text-[13px] font-medium text-text-secondary rounded-lg hover:bg-surface-muted transition-colors"
              onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit"
              className={cn(
                'px-4 py-2 text-[13px] font-semibold rounded-lg transition-colors',
                'bg-primary text-white hover:bg-primary-dark',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
              disabled={loading}>
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
          </div>

        </form>
      </div>
    </>
  );

  return createPortal(panel, document.body);
}

function ActivityRow({ dotColor, text, time }: { dotColor: string; text: React.ReactNode; time: string }) {
  return (
    <div className="flex items-start gap-3 py-1">
      <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: dotColor }} />
      <div className="flex-1 min-w-0">
        <div className="text-[13px] text-text-primary">{text}</div>
        <div className="text-[11px] text-text-tertiary mt-0.5">{time}</div>
      </div>
    </div>
  );
}
