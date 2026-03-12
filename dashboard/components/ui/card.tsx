import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const cardVariants = cva('rounded-[10px] text-text-primary', {
  variants: {
    surface: {
      panel: 'surface-panel',
      elevated: 'surface-elevated',
      muted: 'surface-muted',
      accent: 'surface-accent',
      success: 'surface-success',
      warning: 'surface-warning',
      danger: 'surface-danger',
      info: 'surface-info',
    },
    density: {
      sm: '',
      md: '',
      lg: '',
    },
  },
  defaultVariants: {
    surface: 'panel',
    density: 'md',
  },
});

export interface CardProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {}

const paddingMap = {
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
} as const;

const headerPaddingMap = {
  sm: 'p-3 pb-0',
  md: 'p-4 pb-0',
  lg: 'p-5 pb-0',
} as const;

const contentPaddingMap = {
  sm: 'p-3 pt-0',
  md: 'p-4 pt-0',
  lg: 'p-5 pt-0',
} as const;

const footerPaddingMap = {
  sm: 'p-3 pt-0',
  md: 'p-4 pt-0',
  lg: 'p-5 pt-0',
} as const;

const Card = React.forwardRef<HTMLDivElement, CardProps>(({ className, surface, density = 'md', ...props }, ref) => (
  <div ref={ref} className={cn(cardVariants({ surface, density }), paddingMap[density], className)} {...props} />
));
Card.displayName = 'Card';

const Panel = Card;

interface SectionProps extends React.HTMLAttributes<HTMLDivElement> {
  density?: keyof typeof headerPaddingMap;
}

const CardHeader = React.forwardRef<HTMLDivElement, SectionProps>(({ className, density = 'md', ...props }, ref) => (
  <div ref={ref} className={cn('flex flex-col gap-1.5', headerPaddingMap[density], className)} {...props} />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn('text-lg font-semibold text-text-primary', className)} {...props} />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-sm text-text-secondary', className)} {...props} />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<HTMLDivElement, SectionProps>(({ className, density = 'md', ...props }, ref) => (
  <div ref={ref} className={cn(contentPaddingMap[density], className)} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<HTMLDivElement, SectionProps>(({ className, density = 'md', ...props }, ref) => (
  <div ref={ref} className={cn('flex items-center', footerPaddingMap[density], className)} {...props} />
));
CardFooter.displayName = 'CardFooter';

export { Card, Panel, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, cardVariants };
