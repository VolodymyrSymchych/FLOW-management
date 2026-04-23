'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-[8px] font-medium transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/15 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]',
  {
    variants: {
      variant: {
        solid: '',
        soft: '',
        outline: 'border bg-transparent',
        ghost: 'border border-transparent bg-transparent',
      },
      tone: {
        primary: '',
        neutral: '',
        success: '',
        danger: '',
      },
      size: {
        sm: 'h-8 px-3 text-[0.875rem] gap-1.5',
        md: 'h-[33px] px-[13px] text-[0.9375rem] gap-1.5',
        lg: 'h-10 px-4 text-[0.9375rem] gap-2',
        icon: 'h-10 w-10 p-0',
      },
      density: {
        default: '',
        compact: 'h-7 px-2.5 text-[0.8125rem]',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    compoundVariants: [
      {
        variant: 'solid',
        tone: 'primary',
        className:
          'border border-primary-dark bg-primary text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.16)] hover:bg-primary-dark',
      },
      {
        variant: 'solid',
        tone: 'neutral',
        className:
          'border border-border bg-foreground text-background hover:bg-foreground/90',
      },
      {
        variant: 'solid',
        tone: 'success',
        className: 'border border-success bg-success text-white hover:bg-success/90',
      },
      {
        variant: 'solid',
        tone: 'danger',
        className: 'border border-danger bg-danger text-white hover:bg-danger/90',
      },
      {
        variant: 'soft',
        tone: 'primary',
        className: 'border border-accent/20 bg-accent-soft text-primary hover:border-accent/35 hover:bg-accent-soft/80',
      },
      {
        variant: 'soft',
        tone: 'neutral',
        className: 'border border-border bg-surface-muted text-text-primary hover:bg-surface',
      },
      {
        variant: 'soft',
        tone: 'success',
        className: 'border border-success/20 bg-success-soft text-success hover:bg-success-soft/80',
      },
      {
        variant: 'soft',
        tone: 'danger',
        className: 'border border-danger/20 bg-danger-soft text-danger hover:bg-danger-soft/80',
      },
      {
        variant: 'outline',
        tone: 'primary',
        className: 'border-accent/30 text-primary hover:bg-accent-soft',
      },
      {
        variant: 'outline',
        tone: 'neutral',
        className: 'border-border text-text-primary hover:bg-surface-muted',
      },
      {
        variant: 'outline',
        tone: 'success',
        className: 'border-success/30 text-success hover:bg-success-soft',
      },
      {
        variant: 'outline',
        tone: 'danger',
        className: 'border-danger/30 text-danger hover:bg-danger-soft',
      },
      {
        variant: 'ghost',
        tone: 'primary',
        className: 'text-primary hover:bg-accent-soft',
      },
      {
        variant: 'ghost',
        tone: 'neutral',
        className: 'text-text-secondary hover:bg-surface-muted hover:text-text-primary',
      },
      {
        variant: 'ghost',
        tone: 'success',
        className: 'text-success hover:bg-success-soft',
      },
      {
        variant: 'ghost',
        tone: 'danger',
        className: 'text-danger hover:bg-danger-soft',
      },
      {
        density: 'compact',
        size: 'sm',
        className: 'h-7 px-2.5 text-[0.8125rem]',
      },
      {
        density: 'compact',
        size: 'md',
        className: 'h-7 px-2.5 text-[0.8125rem]',
      },
      {
        density: 'compact',
        size: 'lg',
        className: 'h-8 px-3 text-[0.875rem]',
      },
    ],
    defaultVariants: {
      variant: 'solid',
      tone: 'primary',
      size: 'md',
      density: 'default',
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    Omit<VariantProps<typeof buttonVariants>, 'fullWidth' | 'variant'> {
  variant?: VariantProps<typeof buttonVariants>['variant'] | 'primary' | 'secondary' | 'danger' | 'ghost' | 'glass' | 'outline';
  tone?: VariantProps<typeof buttonVariants>['tone'];
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

function resolveLegacyVariant(
  variant: ButtonProps['variant'],
  tone: ButtonProps['tone']
): Pick<Required<ButtonProps>, 'variant' | 'tone'> {
  switch (variant) {
    case 'primary':
      return { variant: 'solid', tone: tone ?? 'primary' };
    case 'secondary':
      return { variant: 'soft', tone: tone ?? 'neutral' };
    case 'danger':
      return { variant: 'solid', tone: 'danger' };
    case 'ghost':
      return { variant: 'ghost', tone: tone ?? 'neutral' };
    case 'glass':
      return { variant: 'soft', tone: tone ?? 'primary' };
    case 'outline':
      return { variant: 'outline', tone: tone ?? 'neutral' };
    default:
      return {
        variant: (variant as Required<ButtonProps>['variant']) ?? 'solid',
        tone: tone ?? 'primary',
      };
  }
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'solid',
      tone,
      size = 'md',
      density = 'default',
      loading = false,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const resolved = resolveLegacyVariant(variant, tone);

    return (
      <button
        ref={ref}
        className={cn(
          buttonVariants({
            variant: resolved.variant as VariantProps<typeof buttonVariants>['variant'],
            tone: resolved.tone,
            size,
            density,
            fullWidth,
          }),
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4Z" />
          </svg>
        )}
        {!loading && icon && iconPosition === 'left' && <span className="inline-flex">{icon}</span>}
        {children}
        {!loading && icon && iconPosition === 'right' && <span className="inline-flex">{icon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
