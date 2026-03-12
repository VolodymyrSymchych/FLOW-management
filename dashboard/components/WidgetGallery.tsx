'use client';

import { memo, useMemo, useState, type ComponentType } from 'react';
import { GripVertical, LayoutGrid, Plus, Search, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FilterChip } from '@/components/ui/filter-chip';
import { Input } from '@/components/ui/input';
import { SectionHeader } from '@/components/ui/section-header';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type WidgetDefinition = {
  id: string;
  label: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  defaultW: number;
  defaultH: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
};

type WidgetGalleryProps = {
  isOpen: boolean;
  onClose: () => void;
  availableWidgets: WidgetDefinition[];
  activeWidgetIds: string[];
  onAddWidget: (widgetId: string, w: number, h: number) => void;
  onRemoveWidget: (widgetId: string) => void;
};

const WidgetCard = memo(function WidgetCard({
  widget,
  isActive,
  onAdd,
  onRemove,
}: {
  widget: WidgetDefinition;
  isActive: boolean;
  onAdd: () => void;
  onRemove: () => void;
}) {
  const Icon = widget.icon;

  return (
    <Card
      surface={isActive ? 'accent' : 'panel'}
      density="sm"
      className={cn('relative flex h-full flex-col gap-3 border border-border/70', isActive && 'border-accent/30')}
    >
      <div className="absolute right-4 top-4 opacity-40">
        <GripVertical className="h-4 w-4 text-text-tertiary" />
      </div>
      <div className={cn('flex h-11 w-11 items-center justify-center rounded-full', isActive ? 'bg-primary text-white' : 'bg-surface-muted text-text-secondary')}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="space-y-1">
        <h4 className="text-sm font-semibold text-text-primary">{widget.label}</h4>
        <p className="text-sm text-text-secondary">{widget.description}</p>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="soft" tone="neutral" className="normal-case tracking-normal">
          {widget.defaultW} x {widget.defaultH}
        </Badge>
        {isActive ? <Badge variant="soft" tone="primary" className="normal-case tracking-normal">Active</Badge> : null}
      </div>
      <Button variant={isActive ? 'outline' : 'soft'} tone={isActive ? 'danger' : 'primary'} size="sm" className="mt-auto" onClick={isActive ? onRemove : onAdd}>
        {isActive ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        {isActive ? 'Remove' : 'Add widget'}
      </Button>
    </Card>
  );
});

export const WidgetGallery = memo(function WidgetGallery({
  isOpen,
  onClose,
  availableWidgets,
  activeWidgetIds,
  onAddWidget,
  onRemoveWidget,
}: WidgetGalleryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'available'>('all');

  const filteredWidgets = useMemo(() => {
    let widgets = availableWidgets;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      widgets = widgets.filter((widget) => widget.label.toLowerCase().includes(query) || widget.description.toLowerCase().includes(query));
    }

    if (filter === 'active') {
      widgets = widgets.filter((widget) => activeWidgetIds.includes(widget.id));
    } else if (filter === 'available') {
      widgets = widgets.filter((widget) => !activeWidgetIds.includes(widget.id));
    }

    return widgets;
  }, [activeWidgetIds, availableWidgets, filter, searchQuery]);

  if (!isOpen) return null;

  return (
    <Card surface="elevated" density="lg" className="space-y-5 border border-border/70" data-testid="widget-gallery">
      <SectionHeader
        eyebrow="Workspace"
        title="Widget gallery"
        description="Add, remove, and reorganize the modules that shape the dashboard overview."
        action={
          <Button variant="ghost" tone="neutral" size="icon" onClick={onClose} aria-label="Close widget gallery">
            <X className="h-4 w-4" />
          </Button>
        }
      />

      <div className="flex flex-col gap-3 border-y border-border py-4 lg:flex-row lg:items-center lg:justify-between">
        <Input
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search widgets"
          leftIcon={<Search className="h-4 w-4" />}
          className="max-w-md"
        />
        <div className="flex flex-wrap gap-2">
          <FilterChip active={filter === 'all'} onClick={() => setFilter('all')}>
            All ({availableWidgets.length})
          </FilterChip>
          <FilterChip active={filter === 'active'} onClick={() => setFilter('active')}>
            Active ({activeWidgetIds.length})
          </FilterChip>
          <FilterChip active={filter === 'available'} onClick={() => setFilter('available')}>
            Available ({Math.max(availableWidgets.length - activeWidgetIds.length, 0)})
          </FilterChip>
        </div>
      </div>

      {filteredWidgets.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {filteredWidgets.map((widget) => {
            const isActive = activeWidgetIds.includes(widget.id);
            return (
              <WidgetCard
                key={widget.id}
                widget={widget}
                isActive={isActive}
                onAdd={() => onAddWidget(widget.id, widget.defaultW, widget.defaultH)}
                onRemove={() => onRemoveWidget(widget.id)}
              />
            );
          })}
        </div>
      ) : (
        <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-12 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface-muted text-text-tertiary">
            <Sparkles className="h-6 w-6" />
          </div>
          <p className="text-lg font-semibold text-text-primary">No widgets found</p>
          <p className="mt-2 max-w-md text-sm text-text-secondary">Adjust the search or filter to find the module you need.</p>
        </div>
      )}

      <div className="flex items-center gap-2 rounded-xl bg-surface-muted px-4 py-3 text-sm text-text-secondary">
        <LayoutGrid className="h-4 w-4 text-primary" />
        Drag widgets in edit mode and save the layout when the arrangement is final.
      </div>
    </Card>
  );
});
