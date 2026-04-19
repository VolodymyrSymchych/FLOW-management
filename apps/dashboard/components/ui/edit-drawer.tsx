'use client';

import { useEffect, useMemo, useState, type ReactNode, type RefObject } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BottomSheet } from './bottom-sheet';
import { Drawer, DrawerContent } from './drawer';
import { IconButton } from './icon-button';

export type DrawerSize = 'sm' | 'md' | 'lg';

export interface DrawerTab {
  id: string;
  label: string;
  badge?: ReactNode;
}

export interface EditDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  subtitle?: ReactNode;
  size?: DrawerSize;
  tabs?: DrawerTab[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  footer?: ReactNode;
  dirty?: boolean;
  onAttemptClose?: () => void;
  initialFocusRef?: RefObject<HTMLElement | null>;
  mobileShell?: 'bottom-sheet' | 'drawer';
  onPrimaryAction?: () => void;
  primaryShortcut?: 'mod+enter' | 'enter';
  headerActions?: ReactNode;
  className?: string;
  contentClassName?: string;
  children: ReactNode;
}

const SIZE_CLASSNAMES: Record<DrawerSize, string> = {
  sm: 'max-w-[420px]',
  md: 'max-w-[560px]',
  lg: 'max-w-[720px]',
};

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const update = () => setIsMobile(mediaQuery.matches);

    update();
    mediaQuery.addEventListener('change', update);
    return () => mediaQuery.removeEventListener('change', update);
  }, [breakpoint]);

  return isMobile;
}

export function EditDrawer({
  open,
  onOpenChange,
  title,
  subtitle,
  size = 'md',
  tabs,
  activeTab,
  onTabChange,
  footer,
  dirty = false,
  onAttemptClose,
  initialFocusRef,
  mobileShell = 'bottom-sheet',
  onPrimaryAction,
  primaryShortcut = 'mod+enter',
  headerActions,
  className,
  contentClassName,
  children,
}: EditDrawerProps) {
  const isMobile = useIsMobile();
  const resolvedTitle = useMemo(() => (typeof title === 'string' ? title : undefined), [title]);
  const resolvedSubtitle = useMemo(
    () => (typeof subtitle === 'string' ? subtitle : undefined),
    [subtitle]
  );

  const requestClose = () => {
    if (dirty && onAttemptClose) {
      onAttemptClose();
      return;
    }
    onOpenChange(false);
  };

  useEffect(() => {
    if (!open || !initialFocusRef?.current) return;
    const timer = window.setTimeout(() => initialFocusRef.current?.focus(), 50);
    return () => window.clearTimeout(timer);
  }, [open, initialFocusRef]);

  useEffect(() => {
    if (!open || !onPrimaryAction) return;

    const handler = (event: KeyboardEvent) => {
      const isModifierPressed = event.metaKey || event.ctrlKey;
      const isModEnter = primaryShortcut === 'mod+enter' && isModifierPressed && event.key === 'Enter';
      const isEnter = primaryShortcut === 'enter' && event.key === 'Enter';

      if (!isModEnter && !isEnter) return;

      event.preventDefault();
      onPrimaryAction();
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onPrimaryAction, primaryShortcut]);

  const tabList = tabs?.length ? (
    <div className="border-b border-border px-6">
      <div className="flex flex-wrap gap-2 py-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange?.(tab.id)}
            className={cn(
              'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/15',
              activeTab === tab.id
                ? 'bg-accent-soft text-primary'
                : 'text-text-secondary hover:bg-surface-muted hover:text-text-primary'
            )}
          >
            <span>{tab.label}</span>
            {tab.badge ? <span>{tab.badge}</span> : null}
          </button>
        ))}
      </div>
    </div>
  ) : null;

  const body = (
    <>
      <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
        <div className="min-w-0">
          <div className="text-lg font-semibold text-text-primary">{title}</div>
          {subtitle ? <p className="mt-1 text-sm text-text-secondary">{subtitle}</p> : null}
        </div>
        <div className="flex items-center gap-2">
          {headerActions}
          <IconButton
            icon={<X className="h-4 w-4" />}
            label="Close"
            size="md"
            onClick={requestClose}
          />
        </div>
      </div>
      {tabList}
      <div className={cn('min-h-0 flex-1 overflow-y-auto px-6 py-5', contentClassName)}>{children}</div>
      {footer ? <div className="border-t border-border px-6 py-3">{footer}</div> : null}
    </>
  );

  if (isMobile && mobileShell === 'bottom-sheet') {
    return (
      <BottomSheet
        open={open}
        onClose={requestClose}
        title={resolvedTitle}
        description={resolvedSubtitle}
        height="full"
        preventBackdropClose={dirty}
      >
        <div className={cn('flex min-h-0 flex-col', className)}>
          {tabs?.length ? (
            <div className="-mx-6 mb-4 border-b border-border px-6">{tabList}</div>
          ) : null}
          <div className="min-h-0 flex-1">{children}</div>
          {footer ? <div className="mt-4 border-t border-border pt-4">{footer}</div> : null}
        </div>
      </BottomSheet>
    );
  }

  return (
    <Drawer
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          requestClose();
          return;
        }
        onOpenChange(true);
      }}
    >
      <DrawerContent
        showCloseButton={false}
        className={cn('w-full', SIZE_CLASSNAMES[size], className)}
        onEscapeKeyDown={(event) => {
          event.preventDefault();
          requestClose();
        }}
        onPointerDownOutside={(event) => {
          event.preventDefault();
          requestClose();
        }}
      >
        <div className="flex min-h-0 flex-1 flex-col">{body}</div>
      </DrawerContent>
    </Drawer>
  );
}
