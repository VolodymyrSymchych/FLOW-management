'use client';

import { AlertTriangle } from 'lucide-react';
import { AlertDialog, AlertDialogContent } from '@/components/ui/alert-dialog';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  itemName?: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

export function DeleteConfirmModal({
  isOpen,
  title,
  message,
  itemName,
  onConfirm,
  onCancel,
  confirmText = 'Delete',
  cancelText = 'Cancel',
}: DeleteConfirmModalProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent
        title={
        <div className="flex items-center space-x-2">
          <div className="w-9 h-9 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <span>{title}</span>
        </div>
        }
        description={
          <div className="space-y-3">
            <p className="text-xs text-text-secondary">{message}</p>
            {itemName ? (
              <div className="glass-subtle rounded-lg p-2">
                <p className="text-xs font-medium text-text-primary">{itemName}</p>
              </div>
            ) : null}
          </div>
        }
        cancelText={cancelText}
        actionText={confirmText}
        tone="danger"
        onAction={onConfirm}
        className="max-w-sm"
      >
        {itemName && (
          <span className="sr-only">{itemName}</span>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
