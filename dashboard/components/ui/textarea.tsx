'use client';

import { forwardRef, useId } from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, Info } from 'lucide-react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      fullWidth = false,
      required,
      disabled,
      id: providedId,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const id = providedId || generatedId;
    const errorId = `${id}-error`;
    const helperId = `${id}-helper`;

    const hasError = Boolean(error);
    const hasHelper = Boolean(helperText);

    return (
      <div className={cn('space-y-2', fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-text-primary"
          >
            {label}
            {required && <span className="text-danger ml-1" aria-label="required">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          id={id}
          className={cn(
            'glass-input w-full px-4 py-3 rounded-xl text-text-primary placeholder:text-text-tertiary resize-none',
            'transition-all duration-200',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            hasError && 'border-danger focus:border-danger focus:ring-danger',
            className
          )}
          aria-invalid={hasError}
          aria-describedby={
            hasError ? errorId : hasHelper ? helperId : undefined
          }
          disabled={disabled}
          required={required}
          {...props}
        />

        {hasHelper && !hasError && (
          <div className="flex items-start gap-1.5">
            <Info className="w-4 h-4 text-text-tertiary flex-shrink-0 mt-0.5" aria-hidden="true" />
            <p id={helperId} className="text-xs text-text-tertiary">
              {helperText}
            </p>
          </div>
        )}

        {hasError && (
          <div className="flex items-start gap-1.5">
            <AlertCircle className="w-4 h-4 text-danger flex-shrink-0 mt-0.5" aria-hidden="true" />
            <p id={errorId} role="alert" className="text-xs text-danger">
              {error}
            </p>
          </div>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
