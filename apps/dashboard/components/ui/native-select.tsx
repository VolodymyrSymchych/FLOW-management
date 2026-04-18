'use client';

import { forwardRef, useId, type ReactNode, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface NativeSelectOption {
  label: string;
  value: string;
}

export interface NativeSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  placeholder?: string;
  options?: NativeSelectOption[];
  fullWidth?: boolean;
  leftIcon?: ReactNode;
}

export const NativeSelect = forwardRef<HTMLSelectElement, NativeSelectProps>(
  ({
    className,
    label,
    helperText,
    error,
    placeholder,
    options,
    children,
    fullWidth = false,
    required,
    disabled,
    leftIcon,
    id: providedId,
    ...props
  }, ref) => {
    const generatedId = useId();
    const id = providedId || generatedId;

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
          <select
            ref={ref}
            id={id}
            className={cn(
              'glass-input h-[33px] w-full appearance-none rounded-[8px] pr-10 text-[0.9375rem] text-text-primary',
              leftIcon ? 'pl-10' : 'pl-3.5',
              disabled && 'cursor-not-allowed opacity-50',
              error && 'border-danger focus:border-danger',
              className
            )}
            required={required}
            disabled={disabled}
            {...props}
          >
            {placeholder ? <option value="">{placeholder}</option> : null}
            {options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
            {children}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
        </div>
        {helperText && !error ? <p className="text-xs text-text-tertiary">{helperText}</p> : null}
        {error ? <p className="text-xs text-danger">{error}</p> : null}
      </div>
    );
  }
);

NativeSelect.displayName = 'NativeSelect';
