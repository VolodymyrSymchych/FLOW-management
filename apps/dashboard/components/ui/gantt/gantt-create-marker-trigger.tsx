'use client';

import React, { useState } from 'react';
import { useGantt } from './gantt-provider';
import { Plus, Calendar, Flag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GanttCreateMarkerTriggerProps {
  onCreateMarker?: (date: Date) => void;
  onCreateTask?: (date: Date) => void;
  className?: string;
}

export function GanttCreateMarkerTrigger({ onCreateMarker, onCreateTask, className }: GanttCreateMarkerTriggerProps) {
  const { days, pixelsPerDay, startDate, onAddItem } = useGantt();
  const [showTooltip, setShowTooltip] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = () => {
    setIsDragging(false);
  };

  const handleMouseMove = () => {
    setIsDragging(true);
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Don't handle click if user was dragging
    if (isDragging) {
      setIsDragging(false);
      return;
    }

    // Don't handle click if clicking on a draggable element or its children
    const target = e.target as HTMLElement;
    if (
      target.closest('[role="button"]') ||
      target.closest('.cursor-grab') ||
      target.closest('[data-draggable="true"]') ||
      target.closest('[style*="cursor: grab"]')
    ) {
      return;
    }

    // Only handle clicks directly on the overlay (empty areas)
    if (target !== e.currentTarget && !target.classList.contains('gantt-timeline-overlay')) {
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const dayIndex = Math.floor(x / pixelsPerDay);
    const date = days[dayIndex];

    if (date) {
      // Priority: onCreateTask > onAddItem > onCreateMarker
      if (onCreateTask) {
        onCreateTask(date);
      } else if (onAddItem) {
        onAddItem(date);
      } else if (onCreateMarker) {
        onCreateMarker(date);
      }
    }
  };

  return (
    <>
      {/* Background overlay - allows drag events to pass through */}
      <div
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        className={cn(
          'absolute inset-0 bg-transparent transition-colors duration-200 gantt-timeline-overlay',
          className
        )}
        style={{ zIndex: 0 }}
      >
        {/* Floating Action Button */}
        <div
          className="absolute top-4 right-4 z-20 pointer-events-auto"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <button className="group relative glass-button rounded-xl p-3">
            <Plus className="w-5 h-5 text-white relative z-10 transition-transform duration-200" />

            {/* Tooltip */}
            {showTooltip && (
              <div className="absolute top-full right-0 mt-2 w-48 glass-medium rounded-lg border border-white/[0.15] p-3  animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-xs text-text-primary">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    <span className="font-medium">Click anywhere to add task</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-text-tertiary">
                    <Flag className="w-3.5 h-3.5" />
                    <span>Or use this button</span>
                  </div>
                </div>
                <div className="absolute -top-1 right-4 w-2 h-2 bg-surface-elevated border-l border-t border-white/[0.15] rotate-45" />
              </div>
            )}
          </button>
        </div>

        {/* Subtle grid lines on hover - gradient removed */}
      </div>
    </>
  );
}

