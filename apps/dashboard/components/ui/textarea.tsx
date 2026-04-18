'use client';

import { forwardRef, useId, type TextareaHTMLAttributes } from 'react';
import { AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, fullWidth = false, required, disabled, id: providedId, ...props }, ref) => {
    const generatedId = useId();
    const id = providedId || generatedId;
    const errorId = `${id}-error`;
    const helperId = `${id}-helper`;
    const hasError = Boolean(error);
    const hasHelper = Boolean(helperText);

    return (
      <div className={cn('space-y-2', fullWidth && 'w-full')}>
        {label ? (
          <label htmlFor={id} className="app-label text-text-secondary">
            {label}
            {required ? <span className="ml-1 text-danger">*</span> : null}
          </label>
        ) : null}
        <textarea
          ref={ref}
          id={id}
          className={cn(
            'glass-input min-h-[108px] w-full rounded-[8px] px-[11px] py-[8px] text-[0.9375rem] text-text-primary placeholder:text-text-tertiary',
            'resize-y',
            hasError && 'border-danger focus:border-danger',
            disabled && 'cursor-not-allowed opacity-50',
            className
          )}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : hasHelper ? helperId : undefined}
          required={required}
          disabled={disabled}
          {...props}
        />
        {hasHelper && !hasError ? (
          <div className="flex items-start gap-1.5 text-xs text-text-tertiary">
            <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
            <p id={helperId}>{helperText}</p>
          </div>
        ) : null}
        {hasError ? (
          <div className="flex items-start gap-1.5 text-xs text-danger">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
            <p id={errorId}>{error}</p>
          </div>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
