'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import {
  Search,
  Plus,
  FileText,
  CheckSquare,
  Calendar,
  Users,
  Settings,
  BarChart3,
  File,
  Home,
  DollarSign,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Command Palette component with Cmd+K support
 *
 * Features:
 * - Keyboard shortcut (Cmd/Ctrl + K)
 * - Quick actions (create project, task, invoice)
 * - Navigation shortcuts
 * - Recent items
 * - Search functionality
 * - Glassmorphism styling
 * - Accessibility (ARIA, keyboard navigation)
 */
export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // Toggle with Cmd/Ctrl + K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const navigate = useCallback((path: string) => {
    setOpen(false);
    router.push(path);
  }, [router]);

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Global command menu"
      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl"
    >
      <div className="glass-heavy rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
          <Search className="w-5 h-5 text-text-tertiary" aria-hidden="true" />
          <Command.Input
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent text-text-primary placeholder:text-text-tertiary outline-none text-base"
          />
          <kbd className="hidden sm:inline-flex px-2 py-1 text-xs glass-subtle rounded-md text-text-tertiary">
            ESC
          </kbd>
        </div>

        {/* Commands List */}
        <Command.List className="max-h-96 overflow-y-auto p-2">
          <Command.Empty className="px-4 py-8 text-center text-text-secondary text-sm">
            No results found.
          </Command.Empty>

          {/* Quick Actions */}
          <Command.Group heading="Quick Actions" className="mb-2">
            <CommandGroupLabel>Quick Actions</CommandGroupLabel>

            <CommandItem
              onSelect={() => navigate('/projects/new')}
              icon={<Plus className="w-4 h-4" />}
            >
              Create New Project
            </CommandItem>

            <CommandItem
              onSelect={() => navigate('/tasks')}
              icon={<CheckSquare className="w-4 h-4" />}
            >
              Create New Task
            </CommandItem>

            <CommandItem
              onSelect={() => navigate('/invoices')}
              icon={<DollarSign className="w-4 h-4" />}
            >
              Create New Invoice
            </CommandItem>

            <CommandItem
              onSelect={() => navigate('/team')}
              icon={<Users className="w-4 h-4" />}
            >
              Invite Team Member
            </CommandItem>
          </Command.Group>

          {/* Navigation */}
          <Command.Group heading="Navigation" className="mb-2">
            <CommandGroupLabel>Navigation</CommandGroupLabel>

            <CommandItem
              onSelect={() => navigate('/')}
              icon={<Home className="w-4 h-4" />}
              shortcut="⌘H"
            >
              Dashboard
            </CommandItem>

            <CommandItem
              onSelect={() => navigate('/projects')}
              icon={<FileText className="w-4 h-4" />}
              shortcut="⌘P"
            >
              Projects
            </CommandItem>

            <CommandItem
              onSelect={() => navigate('/tasks')}
              icon={<CheckSquare className="w-4 h-4" />}
              shortcut="⌘T"
            >
              Tasks
            </CommandItem>

            <CommandItem
              onSelect={() => navigate('/timeline')}
              icon={<Calendar className="w-4 h-4" />}
              shortcut="⌘G"
            >
              Gantt Chart
            </CommandItem>

            <CommandItem
              onSelect={() => navigate('/invoices')}
              icon={<DollarSign className="w-4 h-4" />}
              shortcut="⌘I"
            >
              Invoices
            </CommandItem>

            <CommandItem
              onSelect={() => navigate('/documentation')}
              icon={<File className="w-4 h-4" />}
              shortcut="⌘D"
            >
              Documentation
            </CommandItem>

            <CommandItem
              onSelect={() => navigate('/team')}
              icon={<Users className="w-4 h-4" />}
            >
              Team
            </CommandItem>

            <CommandItem
              onSelect={() => navigate('/settings')}
              icon={<Settings className="w-4 h-4" />}
              shortcut="⌘,"
            >
              Settings
            </CommandItem>
          </Command.Group>

          {/* Reports */}
          <Command.Group heading="Reports">
            <CommandGroupLabel>Reports</CommandGroupLabel>

            <CommandItem
              onSelect={() => navigate('/billing')}
              icon={<BarChart3 className="w-4 h-4" />}
            >
              View Analytics
            </CommandItem>

            <CommandItem
              onSelect={() => navigate('/billing')}
              icon={<DollarSign className="w-4 h-4" />}
            >
              Financial Reports
            </CommandItem>
          </Command.Group>
        </Command.List>

        {/* Footer with hint */}
        <div className="px-4 py-2 border-t border-white/10 flex items-center justify-between text-xs text-text-tertiary">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="glass-subtle px-1.5 py-0.5 rounded">↑↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="glass-subtle px-1.5 py-0.5 rounded">↵</kbd>
              Select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="glass-subtle px-1.5 py-0.5 rounded">ESC</kbd>
              Close
            </span>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in-0 duration-200"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
    </Command.Dialog>
  );
}

/**
 * Command Item component
 */
interface CommandItemProps {
  children: React.ReactNode;
  onSelect: () => void;
  icon?: React.ReactNode;
  shortcut?: string;
}

function CommandItem({ children, onSelect, icon, shortcut }: CommandItemProps) {
  return (
    <Command.Item
      onSelect={onSelect}
      className={cn(
        'flex items-center justify-between gap-3 px-3 py-2 rounded-lg cursor-pointer',
        'text-text-primary text-sm',
        'transition-colors duration-150',
        'aria-selected:glass-medium aria-selected:text-text-primary',
        'hover:glass-light',
        'outline-none'
      )}
    >
      <div className="flex items-center gap-3">
        {icon && <span className="text-text-tertiary">{icon}</span>}
        <span>{children}</span>
      </div>
      {shortcut && (
        <kbd className="hidden sm:inline-block text-xs text-text-tertiary glass-subtle px-2 py-1 rounded">
          {shortcut}
        </kbd>
      )}
    </Command.Item>
  );
}

/**
 * Command Group Label component
 */
function CommandGroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-3 py-2 text-xs font-semibold text-text-tertiary uppercase tracking-wider">
      {children}
    </div>
  );
}

/**
 * Hook to add additional keyboard shortcuts
 */
export function useKeyboardShortcuts() {
  const router = useRouter();

  useEffect(() => {
    const handleShortcut = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;

      switch (e.key) {
        case 'h':
          e.preventDefault();
          router.push('/');
          break;
        case 'p':
          e.preventDefault();
          router.push('/dashboard/projects');
          break;
        case 't':
          e.preventDefault();
          router.push('/dashboard/tasks');
          break;
        case 'g':
          e.preventDefault();
          router.push('/timeline');
          break;
        case 'i':
          e.preventDefault();
          router.push('/invoices');
          break;
        case 'd':
          e.preventDefault();
          router.push('/documentation');
          break;
        case ',':
          e.preventDefault();
          router.push('/dashboard/settings');
          break;
      }
    };

    document.addEventListener('keydown', handleShortcut);
    return () => document.removeEventListener('keydown', handleShortcut);
  }, [router]);
}
