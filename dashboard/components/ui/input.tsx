'use client';

import { forwardRef, InputHTMLAttributes, useId } from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, Info } from 'lucide-react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

/**
 * Accessible Input component with ARIA support
 *
 * Features:
 * - Full ARIA compliance (aria-invalid, aria-describedby)
 * - Label association with htmlFor
 * - Error and helper text support
 * - Icon support (left and right)
 * - Glassmorphism styling
 * - Focus states
 * - Required field indicator
 */
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
        {/* Label */}
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-text-primary"
          >
            {label}
            {required && <span className="text-danger ml-1" aria-label="required">*</span>}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none">
              {leftIcon}
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            id={id}
            className={cn(
              'glass-input w-full px-4 py-3 rounded-xl text-text-primary placeholder:text-text-tertiary',
              'transition-all duration-200',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              hasError && 'border-danger focus:border-danger focus:ring-danger',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
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

          {/* Right Icon or Error Icon */}
          {(rightIcon || hasError) && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {hasError ? (
                <AlertCircle className="w-5 h-5 text-danger" aria-hidden="true" />
              ) : (
                <span className="text-text-tertiary">{rightIcon}</span>
              )}
            </div>
          )}
        </div>

        {/* Helper Text */}
        {hasHelper && !hasError && (
          <div className="flex items-start gap-1.5">
            <Info className="w-4 h-4 text-text-tertiary flex-shrink-0 mt-0.5" aria-hidden="true" />
            <p id={helperId} className="text-xs text-text-tertiary">
              {helperText}
            </p>
          </div>
        )}

        {/* Error Message */}
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

Input.displayName = 'Input';


