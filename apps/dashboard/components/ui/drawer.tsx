'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Drawer = DialogPrimitive.Root;
export const DrawerTrigger = DialogPrimitive.Trigger;
export const DrawerClose = DialogPrimitive.Close;

export interface DrawerContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  side?: 'left' | 'right';
  showCloseButton?: boolean;
}

export const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DrawerContentProps
>(({ className, children, side = 'right', showCloseButton = true, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-foreground/22 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 motion-reduce:transition-none" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'surface-elevated fixed top-0 z-50 flex h-screen w-full max-w-xl flex-col shadow-floating motion-reduce:transition-none',
        side === 'right' ? 'right-0 border-l' : 'left-0 border-r',
        side === 'right'
          ? 'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-right-full data-[state=closed]:slide-out-to-right-full data-[state=open]:duration-[220ms] data-[state=closed]:duration-[180ms]'
          : 'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-left-full data-[state=closed]:slide-out-to-left-full data-[state=open]:duration-[220ms] data-[state=closed]:duration-[180ms]',
        'border-border',
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton ? (
        <DialogPrimitive.Close className="absolute right-4 top-4 inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg p-2 text-text-tertiary hover:bg-surface-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/15">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      ) : null}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
DrawerContent.displayName = 'DrawerContent';
