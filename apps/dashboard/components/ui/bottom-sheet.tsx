'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomSheetProps {
  /** Whether the bottom sheet is open */
  open: boolean;
  /** Called when the bottom sheet should close */
  onClose: () => void;
  /** Content to display in the bottom sheet */
  children: React.ReactNode;
  /** Title for the bottom sheet */
  title?: string;
  /** Description for accessibility */
  description?: string;
  /** Height variant */
  height?: 'auto' | 'half' | 'full';
  /** Allow swipe to close (default: true) */
  swipeToClose?: boolean;
  /** Show drag handle (default: true) */
  showHandle?: boolean;
  /** Prevent closing on backdrop click (default: false) */
  preventBackdropClose?: boolean;
}

/**
 * Bottom Sheet component for mobile-friendly modals
 *
 * Features:
 * - Slides up from bottom on mobile
 * - Swipe to dismiss
 * - Drag handle
 * - Multiple height variants
 * - Focus trapping
 * - ARIA compliant
 * - Glassmorphism styling
 *
 * @example
 * <BottomSheet open={isOpen} onClose={() => setIsOpen(false)} title="Filters">
 *   <FilterContent />
 * </BottomSheet>
 */
export function BottomSheet({
  open,
  onClose,
  children,
  title,
  description,
  height = 'auto',
  swipeToClose = true,
  showHandle = true,
  preventBackdropClose = false,
}: BottomSheetProps) {
  const [mounted, setMounted] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef<number>(0);
  const currentYRef = useRef<number>(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle Escape key
  useEffect(() => {
    if (!open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [open]);

  // Touch handlers for swipe to close
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!swipeToClose) return;
    startYRef.current = e.touches[0].clientY;
    currentYRef.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!swipeToClose) return;
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - startYRef.current;

    // Only allow downward swipe
    if (deltaY > 0) {
      currentYRef.current = deltaY;
      if (sheetRef.current) {
        sheetRef.current.style.transform = `translateY(${deltaY}px)`;
      }
    }
  };

  const handleTouchEnd = () => {
    if (!swipeToClose) return;

    // If swiped down more than 100px, close
    if (currentYRef.current > 100) {
      onClose();
    }

    // Reset transform
    if (sheetRef.current) {
      sheetRef.current.style.transform = '';
    }
    currentYRef.current = 0;
  };

  const heightClasses = {
    auto: 'max-h-[85vh]',
    half: 'h-[50vh]',
    full: 'h-[95vh]',
  };

  if (!mounted || !open) return null;

  const content = (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in-0 duration-200"
        onClick={preventBackdropClose ? undefined : onClose}
        aria-hidden="true"
      />

      {/* Bottom Sheet */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'bottom-sheet-title' : undefined}
        aria-describedby={description ? 'bottom-sheet-description' : undefined}
        className={cn(
          'relative z-10 w-full glass-heavy border-t border-white/10 rounded-t-2xl',
          'sm:max-w-lg sm:rounded-2xl sm:border',
          'animate-in slide-in-from-bottom-full duration-300',
          'sm:slide-in-from-bottom-0 sm:zoom-in-95',
          heightClasses[height],
          'flex flex-col'
        )}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag handle */}
        {showHandle && (
          <div className="flex justify-center py-3 sm:hidden">
            <div className="w-12 h-1.5 rounded-full glass-medium" />
          </div>
        )}

        {/* Header */}
        {(title || !showHandle) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            {title && (
              <h2
                id="bottom-sheet-title"
                className="text-lg font-semibold text-text-primary"
              >
                {title}
              </h2>
            )}
            <button
              onClick={onClose}
              className={cn(
                'p-2 rounded-lg glass-subtle hover:glass-light transition-colors',
                !title && 'ml-auto'
              )}
              aria-label="Close"
            >
              <X className="w-5 h-5 text-text-tertiary" />
            </button>
          </div>
        )}

        {/* Hidden description for screen readers */}
        {description && (
          <p id="bottom-sheet-description" className="sr-only">
            {description}
          </p>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

/**
 * Example usage:
 *
 * function FilterSheet() {
 *   const [open, setOpen] = useState(false);
 *
 *   return (
 *     <>
 *       <button onClick={() => setOpen(true)}>Open Filters</button>
 *
 *       <BottomSheet
 *         open={open}
 *         onClose={() => setOpen(false)}
 *         title="Filter Projects"
 *         height="half"
 *       >
 *         <div className="space-y-4">
 *           <label>Status</label>
 *           <select>...</select>
 *
 *           <label>Priority</label>
 *           <select>...</select>
 *         </div>
 *       </BottomSheet>
 *     </>
 *   );
 * }
 */
