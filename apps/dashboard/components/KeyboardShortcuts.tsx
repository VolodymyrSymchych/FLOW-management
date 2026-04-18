'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Global keyboard shortcuts component
 *
 * Shortcuts:
 * - Cmd/Ctrl + H: Go to Dashboard
 * - Cmd/Ctrl + P: Go to Projects
 * - Cmd/Ctrl + T: Go to Tasks
 * - Cmd/Ctrl + G: Go to Gantt/Timeline
 * - Cmd/Ctrl + I: Go to Invoices
 * - Cmd/Ctrl + D: Go to Documentation
 * - Cmd/Ctrl + ,: Go to Settings
 * - Cmd/Ctrl + K: Command Palette (handled in CommandPalette component)
 */
export function KeyboardShortcuts() {
  const router = useRouter();

  useEffect(() => {
    const handleShortcut = (e: KeyboardEvent) => {
      // Only handle Cmd/Ctrl shortcuts
      if (!(e.metaKey || e.ctrlKey)) return;

      // Ignore if user is typing in an input field
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'h':
          e.preventDefault();
          router.push('/');
          break;
        case 'p':
          // Don't prevent default for Cmd+P (print)
          if (e.shiftKey) return;
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
        // Cmd+K is handled by CommandPalette component
      }
    };

    document.addEventListener('keydown', handleShortcut);
    return () => document.removeEventListener('keydown', handleShortcut);
  }, [router]);

  // This component doesn't render anything
  return null;
}
