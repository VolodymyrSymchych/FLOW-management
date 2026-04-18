import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { cn } from '@/lib/utils';

export interface AvatarGroupItem {
  id: string | number;
  src?: string | null;
  alt?: string;
  label: string;
}

export interface AvatarGroupProps {
  items: AvatarGroupItem[];
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function AvatarGroup({ items, max = 4, size = 'sm', className }: AvatarGroupProps) {
  const visibleItems = items.slice(0, max);
  const remaining = items.length - visibleItems.length;

  return (
    <div className={cn('flex items-center -space-x-2', className)}>
      {visibleItems.map((item) => (
        <Avatar key={item.id} size={size} className="border-2 border-surface bg-primary text-white">
          {item.src ? <AvatarImage src={item.src} alt={item.alt ?? item.label} /> : null}
          <AvatarFallback className="bg-primary text-white">
            {item.label.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      ))}
      {remaining > 0 ? (
        <Avatar size={size} className="border-2 border-surface bg-surface-muted text-text-secondary">
          <AvatarFallback>+{remaining}</AvatarFallback>
        </Avatar>
      ) : null}
    </div>
  );
}
