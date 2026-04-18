'use client';

import { AlertTriangle } from 'lucide-react';
import { Modal, ModalFooter } from '@/components/ui/modal';

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
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={
        <div className="flex items-center space-x-2">
          <div className="w-9 h-9 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <span>{title}</span>
        </div>
      }
      size="sm"
      className="max-w-sm"
    >
      <div className="mb-4">
        <p className="text-xs text-text-secondary mb-2">{message}</p>
        {itemName && (
          <div className="glass-subtle rounded-lg p-2 mt-2">
            <p className="text-xs font-medium text-text-primary">{itemName}</p>
          </div>
        )}
      </div>

      <ModalFooter className="flex-col sm:flex-row gap-2">
        <button
          onClick={onCancel}
          className="flex-1 px-3 py-1.5 text-sm rounded-lg glass-light hover:glass-medium text-text-primary font-medium transition-all hover:scale-105"
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 px-3 py-1.5 text-sm rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-all hover:scale-105"
        >
          {confirmText}
        </button>
      </ModalFooter>
    </Modal>
  );
}
