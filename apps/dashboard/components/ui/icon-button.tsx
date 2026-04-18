'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Button, type ButtonProps } from './button';

export interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>,
    Pick<ButtonProps, 'variant' | 'tone' | 'density'> {
  icon: ReactNode;
  label: string;
  size?: 'sm' | 'md' | 'lg';
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, label, size = 'md', variant = 'ghost', tone = 'neutral', density, ...props }, ref) => {
    const buttonSize = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'icon';
    return (
      <Button
        ref={ref}
        variant={variant}
        tone={tone}
        size={buttonSize as ButtonProps['size']}
        density={density}
        aria-label={label}
        title={label}
        {...props}
      >
        {icon}
      </Button>
    );
  }
);

IconButton.displayName = 'IconButton';
