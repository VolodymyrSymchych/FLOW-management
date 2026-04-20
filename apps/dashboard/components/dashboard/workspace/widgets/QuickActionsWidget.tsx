'use client';

import Link from 'next/link';
import { Clock, FilePlus2, FolderPlus, ListTodo, MessagesSquare, Receipt } from 'lucide-react';
import { WidgetShell } from '../WidgetShell';
import { useWidgetContext } from '../widget-context';
import { WIDGETS } from '../registry';

const ACTIONS = [
  { href: '/dashboard/tasks', icon: ListTodo, label: 'New task', tone: 'text-primary bg-accent-soft' },
  { href: '/dashboard/projects', icon: FolderPlus, label: 'New project', tone: 'text-[hsl(var(--info))] bg-info-soft' },
  { href: '/dashboard/invoices/new', icon: FilePlus2, label: 'Draft invoice', tone: 'text-warning bg-warning-soft' },
  { href: '/dashboard/attendance', icon: Clock, label: 'Log time', tone: 'text-success bg-success-soft' },
  { href: '/dashboard/chat', icon: MessagesSquare, label: 'Open chat', tone: 'text-[hsl(var(--info))] bg-info-soft' },
  { href: '/dashboard/billing', icon: Receipt, label: 'Billing', tone: 'text-text-secondary bg-surface-muted' },
];

export default function QuickActionsWidget() {
  const { editMode, onHide, onResetSize } = useWidgetContext();
  const meta = WIDGETS.find((w) => w.id === 'quick-actions')!;

  return (
    <WidgetShell meta={meta} editMode={editMode} onHide={onHide} onResetSize={onResetSize}>
      <div className="grid grid-cols-3 gap-2 p-3">
        {ACTIONS.map((a) => {
          const Icon = a.icon;
          return (
            <Link
              key={a.href}
              href={a.href}
              className="group flex flex-col items-start gap-2 rounded-[10px] border border-[var(--line)] bg-[hsl(var(--surface-muted))]/60 p-2.5 transition-colors hover:border-[var(--line-strong)] hover:bg-[hsl(var(--surface-muted))]"
            >
              <span className={`flex h-7 w-7 items-center justify-center rounded-md ${a.tone}`}>
                <Icon className="h-4 w-4" />
              </span>
              <span className="text-[12px] font-medium text-text-primary group-hover:text-primary">
                {a.label}
              </span>
            </Link>
          );
        })}
      </div>
    </WidgetShell>
  );
}
