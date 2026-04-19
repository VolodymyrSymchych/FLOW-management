'use client';

import * as React from 'react';
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import { cn } from '@/lib/utils';
import { Button } from './button';

export const AlertDialog = AlertDialogPrimitive.Root;
export const AlertDialogTrigger = AlertDialogPrimitive.Trigger;
export const AlertDialogPortal = AlertDialogPrimitive.Portal;
export const AlertDialogCancel = AlertDialogPrimitive.Cancel;
export const AlertDialogAction = AlertDialogPrimitive.Action;

export interface AlertDialogContentProps
  extends Omit<React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>, 'title' | 'description'> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  cancelText?: string;
  actionText?: string;
  tone?: 'danger' | 'neutral';
  onAction?: () => void;
}

export const AlertDialogOverlay = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-foreground/28 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 motion-reduce:transition-none',
      className
    )}
    {...props}
  />
));
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName;

export const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Content>,
  AlertDialogContentProps
>(
  (
    {
      className,
      children,
      title,
      description,
      cancelText = 'Cancel',
      actionText = 'Confirm',
      tone = 'danger',
      onAction,
      ...props
    },
    ref
  ) => (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        ref={ref}
        className={cn(
          'surface-elevated fixed left-1/2 top-1/2 z-50 grid w-full max-w-md -translate-x-1/2 -translate-y-1/2 gap-4 rounded-2xl p-6 text-text-primary shadow-floating data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 motion-reduce:transition-none',
          className
        )}
        {...props}
      >
        {title ? (
          <AlertDialogPrimitive.Title className="text-lg font-semibold text-text-primary">
            {title}
          </AlertDialogPrimitive.Title>
        ) : null}
        {description ? (
          <AlertDialogPrimitive.Description className="text-sm leading-6 text-text-secondary">
            {description}
          </AlertDialogPrimitive.Description>
        ) : null}
        {children}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <AlertDialogCancel asChild>
            <Button variant="outline" tone="neutral">
              {cancelText}
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant={tone === 'danger' ? 'danger' : 'primary'}
              onClick={onAction}
            >
              {actionText}
            </Button>
          </AlertDialogAction>
        </div>
      </AlertDialogPrimitive.Content>
    </AlertDialogPortal>
  )
);
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName;
