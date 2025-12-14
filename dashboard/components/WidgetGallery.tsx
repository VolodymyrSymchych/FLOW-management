'use client';

import { memo, useState, useMemo } from 'react';
import { X, Plus, GripVertical, Search, LayoutGrid, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export type WidgetDefinition = {
    id: string;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
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
        <div
            className={cn(
                'group relative flex flex-col rounded-xl border p-4 transition-all duration-200',
                isActive
                    ? 'border-primary/40 bg-primary/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
            )}
        >
            {/* Drag handle indicator */}
            <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-60 transition-opacity">
                <GripVertical className="h-4 w-4 text-text-tertiary" />
            </div>

            {/* Icon */}
            <div className={cn(
                'flex h-12 w-12 items-center justify-center rounded-xl mb-3',
                isActive ? 'bg-primary/20' : 'bg-white/10'
            )}>
                <Icon className={cn(
                    'h-6 w-6',
                    isActive ? 'text-primary' : 'text-text-secondary'
                )} />
            </div>

            {/* Content */}
            <h4 className="text-sm font-semibold text-text-primary mb-1">
                {widget.label}
            </h4>
            <p className="text-xs text-text-tertiary mb-3 line-clamp-2">
                {widget.description}
            </p>

            {/* Size badge */}
            <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-text-tertiary">
                    {widget.defaultW}×{widget.defaultH}
                </span>
            </div>

            {/* Action button */}
            {isActive ? (
                <button
                    type="button"
                    onClick={onRemove}
                    className="mt-auto flex items-center justify-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-400 transition-all hover:bg-red-500/20"
                >
                    <X className="h-3.5 w-3.5" />
                    Remove
                </button>
            ) : (
                <button
                    type="button"
                    onClick={onAdd}
                    className="mt-auto flex items-center justify-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary transition-all hover:bg-primary/20"
                >
                    <Plus className="h-3.5 w-3.5" />
                    Add to Dashboard
                </button>
            )}
        </div>
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

        // Filter by search
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            widgets = widgets.filter(
                (w) =>
                    w.label.toLowerCase().includes(query) ||
                    w.description.toLowerCase().includes(query)
            );
        }

        // Filter by status
        if (filter === 'active') {
            widgets = widgets.filter((w) => activeWidgetIds.includes(w.id));
        } else if (filter === 'available') {
            widgets = widgets.filter((w) => !activeWidgetIds.includes(w.id));
        }

        return widgets;
    }, [availableWidgets, activeWidgetIds, searchQuery, filter]);

    const activeCount = activeWidgetIds.length;
    const availableCount = availableWidgets.length - activeCount;

    if (!isOpen) return null;

    return (
        <div className="glass-medium rounded-2xl border border-white/10 overflow-hidden animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20">
                        <LayoutGrid className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-text-primary">Widget Gallery</h2>
                        <p className="text-xs text-text-tertiary">
                            Drag widgets onto the grid or click to add
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg p-2 text-text-tertiary transition-colors hover:bg-white/10 hover:text-text-primary"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col gap-4 border-b border-white/10 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                {/* Search */}
                <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
                    <input
                        type="text"
                        placeholder="Search widgets..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/40"
                    />
                </div>

                {/* Filter tabs */}
                <div className="flex items-center gap-1 rounded-lg border border-white/10 p-1">
                    <button
                        type="button"
                        onClick={() => setFilter('all')}
                        className={cn(
                            'rounded-md px-3 py-1.5 text-xs font-semibold transition-all',
                            filter === 'all'
                                ? 'bg-primary/20 text-primary'
                                : 'text-text-tertiary hover:text-text-secondary'
                        )}
                    >
                        All ({availableWidgets.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setFilter('active')}
                        className={cn(
                            'rounded-md px-3 py-1.5 text-xs font-semibold transition-all',
                            filter === 'active'
                                ? 'bg-primary/20 text-primary'
                                : 'text-text-tertiary hover:text-text-secondary'
                        )}
                    >
                        Active ({activeCount})
                    </button>
                    <button
                        type="button"
                        onClick={() => setFilter('available')}
                        className={cn(
                            'rounded-md px-3 py-1.5 text-xs font-semibold transition-all',
                            filter === 'available'
                                ? 'bg-primary/20 text-primary'
                                : 'text-text-tertiary hover:text-text-secondary'
                        )}
                    >
                        Available ({availableCount})
                    </button>
                </div>
            </div>

            {/* Widget Grid */}
            <div className="p-6">
                {filteredWidgets.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Sparkles className="mb-3 h-12 w-12 text-text-tertiary" />
                        <p className="text-sm font-semibold text-text-primary">No widgets found</p>
                        <p className="text-xs text-text-tertiary">
                            Try adjusting your search or filter
                        </p>
                    </div>
                )}
            </div>

            {/* Footer tip */}
            <div className="border-t border-white/10 bg-primary/5 px-6 py-3">
                <p className="text-xs text-text-tertiary text-center">
                    <span className="font-semibold text-primary">Pro tip:</span> You can drag widgets anywhere on the grid and resize them by grabbing the corners.
                </p>
            </div>
        </div>
    );
});

export default WidgetGallery;
