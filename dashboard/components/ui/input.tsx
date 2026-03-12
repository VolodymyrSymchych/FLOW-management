'use client';

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  density?: 'default' | 'compact';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      density = 'default',
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
        {label ? (
          <label htmlFor={id} className="app-label text-text-secondary">
            {label}
            {required ? <span className="ml-1 text-danger">*</span> : null}
          </label>
        ) : null}

        <div className="relative">
          {leftIcon ? <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">{leftIcon}</div> : null}
          <input
            ref={ref}
            id={id}
            className={cn(
              'glass-input w-full rounded-lg text-text-primary placeholder:text-text-tertiary',
              density === 'compact' ? 'h-8 px-3 text-[0.875rem]' : 'h-[33px] px-3 text-[0.9375rem]',
              leftIcon && 'pl-10',
              (rightIcon || hasError) && 'pr-10',
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
          {(rightIcon || hasError) ? (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary">
              {hasError ? <AlertCircle className="h-4 w-4 text-danger" /> : rightIcon}
            </div>
          ) : null}
        </div>

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

Input.displayName = 'Input';
