'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import { useLocale } from 'next-intl';
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
  const locale = useLocale();

  // Toggle with Cmd/Ctrl + K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Open when search bar is clicked (HTML behavior)
  useEffect(() => {
    const handler = () => setOpen(true);
    document.addEventListener('open-command-palette', handler);
    return () => document.removeEventListener('open-command-palette', handler);
  }, []);

  const navigate = useCallback((path: string) => {
    setOpen(false);
    router.push(`/${locale}${path}`);
  }, [locale, router]);

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Global command menu"
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
    >
      {/* Backdrop - HTML modal-overlay style */}
      {open && (
        <div
          className="cmd-overlay"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
      <div className="cmd-dialog relative z-50 mx-4">
        {/* Search Input - HTML tb-search style */}
        <div className="cmd-search">
          <Search aria-hidden="true" />
          <Command.Input placeholder="Search tasks, projects, people…" />
          <span className="cmd-search-kbd">ESC</span>
        </div>

        {/* Commands List */}
        <Command.List className="cmd-list">
          <Command.Empty className="cmd-empty">No results found.</Command.Empty>

          <Command.Group heading="Quick Actions">
            <CommandGroupLabel>Quick Actions</CommandGroupLabel>
            <CommandItem
              onSelect={() => navigate('/dashboard/tasks')}
              icon={<Plus />}
            >
              Create New Task
            </CommandItem>
            <CommandItem
              onSelect={() => navigate('/dashboard/projects')}
              icon={<FileText />}
            >
              Create New Project
            </CommandItem>
            <CommandItem
              onSelect={() => navigate('/dashboard/invoices/new')}
              icon={<DollarSign />}
            >
              Create New Invoice
            </CommandItem>
            <CommandItem
              onSelect={() => navigate('/dashboard/team')}
              icon={<Users />}
            >
              Invite Team Member
            </CommandItem>
          </Command.Group>

          <Command.Group heading="Navigation">
            <CommandGroupLabel>Navigation</CommandGroupLabel>
            <CommandItem
              onSelect={() => navigate('/dashboard')}
              icon={<Home />}
              shortcut="⌘H"
            >
              Dashboard
            </CommandItem>
            <CommandItem
              onSelect={() => navigate('/dashboard/projects')}
              icon={<FileText />}
              shortcut="⌘P"
            >
              Projects
            </CommandItem>
            <CommandItem
              onSelect={() => navigate('/dashboard/tasks')}
              icon={<CheckSquare />}
              shortcut="⌘T"
            >
              Tasks
            </CommandItem>
            <CommandItem
              onSelect={() => navigate('/dashboard/calendar')}
              icon={<Calendar />}
              shortcut="⌘G"
            >
              Calendar
            </CommandItem>
            <CommandItem
              onSelect={() => navigate('/dashboard/settings?pane=billing')}
              icon={<DollarSign />}
              shortcut="⌘I"
            >
              Billing
            </CommandItem>
            <CommandItem
              onSelect={() => navigate('/dashboard/documentation')}
              icon={<File />}
              shortcut="⌘D"
            >
              Documentation
            </CommandItem>
            <CommandItem
              onSelect={() => navigate('/dashboard/team')}
              icon={<Users />}
            >
              Team
            </CommandItem>
            <CommandItem
              onSelect={() => navigate('/dashboard/settings')}
              icon={<Settings />}
              shortcut="⌘,"
            >
              Settings
            </CommandItem>
          </Command.Group>

          <Command.Group heading="Reports">
            <CommandGroupLabel>Reports</CommandGroupLabel>
            <CommandItem
              onSelect={() => navigate('/dashboard/analytics')}
              icon={<BarChart3 />}
            >
              View Analytics
            </CommandItem>
          </Command.Group>
        </Command.List>

        {/* Footer - HTML style */}
        <div className="cmd-footer">
          <span className="flex items-center gap-1.5">
            <kbd>↑↓</kbd> Navigate
          </span>
          <span className="flex items-center gap-1.5">
            <kbd>↵</kbd> Select
          </span>
          <span className="flex items-center gap-1.5">
            <kbd>ESC</kbd> Close
          </span>
        </div>
      </div>
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
      className="cmd-item"
    >
      {icon}
      <span>{children}</span>
      {shortcut && <span className="cmd-item-kbd">{shortcut}</span>}
    </Command.Item>
  );
}

/**
 * Command Group Label component
 */
function CommandGroupLabel({ children }: { children: React.ReactNode }) {
  return <div className="cmd-group-label">{children}</div>;
}

/**
 * Hook to add additional keyboard shortcuts
 */
export function useKeyboardShortcuts() {
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    const handleShortcut = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;

      switch (e.key) {
        case 'h':
          e.preventDefault();
          router.push(`/${locale}/dashboard`);
          break;
        case 'p':
          e.preventDefault();
          router.push(`/${locale}/dashboard/projects`);
          break;
        case 't':
          e.preventDefault();
          router.push(`/${locale}/dashboard/tasks`);
          break;
        case 'g':
          e.preventDefault();
          router.push(`/${locale}/dashboard/projects-timeline`);
          break;
        case 'i':
          e.preventDefault();
          router.push(`/${locale}/dashboard/settings?pane=billing`);
          break;
        case 'd':
          e.preventDefault();
          router.push(`/${locale}/dashboard/documentation`);
          break;
        case ',':
          e.preventDefault();
          router.push(`/${locale}/dashboard/settings`);
          break;
      }
    };

    document.addEventListener('keydown', handleShortcut);
    return () => document.removeEventListener('keydown', handleShortcut);
  }, [locale, router]);
}
