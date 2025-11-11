'use client';

import React, { ReactNode, useMemo, useState } from 'react';
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay, useDraggable, useDroppable, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useGantt, GanttFeature } from './gantt-provider';
import { differenceInDays, differenceInWeeks, differenceInMonths, differenceInQuarters, differenceInYears, addDays, format } from 'date-fns';
import { cn } from '@/lib/utils';
import { GripVertical } from 'lucide-react';

interface GanttFeatureRowProps {
  features: GanttFeature[];
  onMove?: (id: string, startAt: Date, endAt: Date | null) => void;
  onResize?: (id: string, startAt: Date, endAt: Date) => void;
  children?: (feature: GanttFeature) => ReactNode;
  className?: string;
}

export function GanttFeatureRow({ features, onMove, onResize, children, className }: GanttFeatureRowProps) {
  const { startDate, endDate, baseStartDate, firstDate, pixelsPerDay, pixelsPerWeek, pixelsPerMonth, pixelsPerQuarter, pixelsPerYear, viewMode, onMoveItem, days, weeks, months, quarters, years } = useGantt();

  // Calculate pixels per day based on view mode
  const pixelsPerUnit = useMemo(() => {
    switch (viewMode) {
      case 'weeks':
        return pixelsPerWeek / 7;
      case 'months':
        return pixelsPerMonth / 30;
      case 'quarters':
        return pixelsPerQuarter / 90;
      case 'years':
        return pixelsPerYear / 365;
      default:
        return pixelsPerDay;
    }
  }, [viewMode, pixelsPerDay, pixelsPerWeek, pixelsPerMonth, pixelsPerQuarter, pixelsPerYear]);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggedFeature, setDraggedFeature] = useState<GanttFeature | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  // Calculate sub-row positions for overlapping features
  const featuresWithPositions = useMemo(() => {
    // Sort features by start date
    const sortedFeatures = [...features].sort((a, b) => 
      a.startAt.getTime() - b.startAt.getTime()
    );

    const featureWithPositions: Array<GanttFeature & { subRow: number }> = [];
    const subRowEndTimes: Date[] = []; // Track when each sub-row becomes free

    for (const feature of sortedFeatures) {
      let subRow = 0;

      // Find the first sub-row that's free (doesn't overlap)
      while (subRow < subRowEndTimes.length && subRowEndTimes[subRow] > feature.startAt) {
        subRow++;
      }

      // Update the end time for this sub-row
      if (subRow === subRowEndTimes.length) {
        subRowEndTimes.push(feature.endAt);
      } else {
        subRowEndTimes[subRow] = feature.endAt;
      }

      featureWithPositions.push({ ...feature, subRow });
    }

    return featureWithPositions;
  }, [features]);

  const handleDragStart = (event: DragStartEvent) => {
    const activeId = event.active.id as string;
    
    // Check if it's a resize handle
    if (activeId.startsWith('resize-start-')) {
      const featureId = activeId.replace('resize-start-', '');
      const feature = features.find(f => f.id === featureId);
      if (feature) {
        setActiveId(featureId);
        setDraggedFeature(feature);
      }
    } else if (activeId.startsWith('resize-end-')) {
      const featureId = activeId.replace('resize-end-', '');
      const feature = features.find(f => f.id === featureId);
      if (feature) {
        setActiveId(featureId);
        setDraggedFeature(feature);
      }
    } else {
      // Regular drag
      const feature = features.find(f => f.id === activeId);
      if (feature) {
        setActiveId(activeId);
        setDraggedFeature(feature);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || !draggedFeature) {
      setActiveId(null);
      setDraggedFeature(null);
      return;
    }

    const activeId = active.id as string;
    const dropDateStr = over.id as string;
    
    if (dropDateStr.startsWith('date-')) {
      const dropDate = new Date(dropDateStr.replace('date-', ''));
      
      // Handle resize
      if (activeId.startsWith('resize-start-')) {
        const featureId = activeId.replace('resize-start-', '');
        // Ensure new start date is before end date
        const newStart = dropDate < draggedFeature.endAt ? dropDate : addDays(draggedFeature.endAt, -1);
        
        if (onResize) {
          onResize(featureId, newStart, draggedFeature.endAt);
        }
      } else if (activeId.startsWith('resize-end-')) {
        const featureId = activeId.replace('resize-end-', '');
        // Ensure new end date is after start date
        const newEnd = dropDate > draggedFeature.startAt ? dropDate : addDays(draggedFeature.startAt, 1);
        
        if (onResize) {
          onResize(featureId, draggedFeature.startAt, newEnd);
        }
      } else {
        // Handle move
        const daysDiff = differenceInDays(dropDate, draggedFeature.startAt);
        
        if (daysDiff !== 0 && onMove) {
          const newStart = addDays(draggedFeature.startAt, daysDiff);
          const newEnd = addDays(draggedFeature.endAt, daysDiff);
          onMove(activeId, newStart, newEnd);
        }
        
        if (daysDiff !== 0 && onMoveItem) {
          const newStart = addDays(draggedFeature.startAt, daysDiff);
          const newEnd = addDays(draggedFeature.endAt, daysDiff);
          onMoveItem(activeId, newStart, newEnd);
        }
      }
    }

    setActiveId(null);
    setDraggedFeature(null);
  };

  // Calculate dimensions - structure as table with date columns
  const maxSubRows = Math.max(1, featuresWithPositions.length > 0 
    ? Math.max(...featuresWithPositions.map(f => f.subRow)) + 1 
    : 1);
  const subRowHeight = 60; // Base row height
  const totalHeight = maxSubRows * subRowHeight;
  
  // Calculate total width - match header width exactly
  // Header width is sum of all date cells, so we need to calculate the same way
  const totalWidth = useMemo(() => {
    switch (viewMode) {
      case 'days':
        return days.length * pixelsPerDay;
      case 'weeks':
        return weeks.length * pixelsPerWeek;
      case 'months':
        return months.length * pixelsPerMonth;
      case 'quarters':
        return quarters.length * pixelsPerQuarter;
      case 'years':
        return years.length * pixelsPerYear;
      default:
        return days.length * pixelsPerDay;
    }
  }, [viewMode, days, weeks, months, quarters, years, pixelsPerDay, pixelsPerWeek, pixelsPerMonth, pixelsPerQuarter, pixelsPerYear]);
  
  // Calculate offset to position background correctly
  // Tasks are positioned relative to firstDate (header start)
  // Container needs to be offset to align with header
  const dateOffset = useMemo(() => {
    // No offset needed since tasks use firstDate as reference point
    return 0;
  }, []);

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className={cn('flex relative transition-colors duration-200', className)} style={{ height: totalHeight, minHeight: 56 }}>
        {/* Full-width background and border - table structure with date columns */}
        <div 
          className="absolute inset-0 bg-black/[0.25] border-b border-white/[0.12]"
          style={{ width: `${totalWidth}px` }}
        />
        {/* Table structure: dates as columns (not visually displayed, but used for structure) */}
        <div className="relative" style={{ width: `${totalWidth}px`, minWidth: `${totalWidth}px` }}>
          {featuresWithPositions.map((feature) => (
            <div
              key={feature.id}
              className="absolute w-full"
              style={{
                top: `${feature.subRow * subRowHeight}px`,
                height: `${subRowHeight}px`,
              }}
            >
              <FeatureBar
                feature={feature}
                startDate={firstDate}
                pixelsPerDay={pixelsPerUnit}
                isDragging={activeId === feature.id}
                onResize={onResize}
                children={children}
              />
            </div>
          ))}
          <DateDropZones startDate={firstDate} pixelsPerDay={pixelsPerUnit} viewMode={viewMode} />
        </div>
      </div>
    </DndContext>
  );
}

interface FeatureBarProps {
  feature: GanttFeature;
  startDate: Date;
  pixelsPerDay: number;
  isDragging: boolean;
  onResize?: (id: string, startAt: Date, endAt: Date) => void;
  children?: (feature: GanttFeature) => ReactNode;
}

const FeatureBar = React.memo(function FeatureBar({ feature, startDate, pixelsPerDay, isDragging, onResize, children }: FeatureBarProps) {
  const { viewMode, pixelsPerWeek, pixelsPerMonth, pixelsPerQuarter, pixelsPerYear, days, weeks, months, quarters, years } = useGantt();
  
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: feature.id,
    data: { feature },
  });

  const { attributes: startResizeAttrs, listeners: startResizeListeners, setNodeRef: setStartResizeRef } = useDraggable({
    id: `resize-start-${feature.id}`,
    data: { feature, type: 'start' },
  });

  const { attributes: endResizeAttrs, listeners: endResizeListeners, setNodeRef: setEndResizeRef } = useDraggable({
    id: `resize-end-${feature.id}`,
    data: { feature, type: 'end' },
  });
  
  // Helper function to find index in date array
  const findDateIndex = (date: Date, dateArray: Date[], viewMode: string): number => {
    switch (viewMode) {
      case 'months': {
        // Find the month that contains this date
        const year = date.getFullYear();
        const month = date.getMonth();
        return dateArray.findIndex(d => d.getFullYear() === year && d.getMonth() === month);
      }
      case 'quarters': {
        // Find the quarter that contains this date
        const year = date.getFullYear();
        const quarterMonth = Math.floor(date.getMonth() / 3) * 3;
        return dateArray.findIndex(d => {
          const dYear = d.getFullYear();
          const dMonth = d.getMonth();
          return dYear === year && Math.floor(dMonth / 3) * 3 === quarterMonth;
        });
      }
      case 'years': {
        // Find the year that contains this date
        const year = date.getFullYear();
        return dateArray.findIndex(d => d.getFullYear() === year);
      }
      default:
        return -1;
    }
  };
  
  // Memoize position calculations - use array indices for months/quarters/years
  const { left, width } = useMemo(() => {
    let leftPx: number;
    let widthPx: number;
    
    switch (viewMode) {
      case 'days':
        leftPx = differenceInDays(feature.startAt, startDate) * pixelsPerDay;
        widthPx = differenceInDays(feature.endAt, feature.startAt) * pixelsPerDay;
        break;
      case 'weeks':
        leftPx = differenceInWeeks(feature.startAt, startDate) * pixelsPerWeek;
        widthPx = differenceInWeeks(feature.endAt, feature.startAt) * pixelsPerWeek;
        break;
      case 'months': {
        // Find index of start month and end month in the months array
        const startIndex = findDateIndex(feature.startAt, months, 'months');
        const endIndex = findDateIndex(feature.endAt, months, 'months');
        
        // Always use firstDate (first date in array) as reference point for synchronization
        // This ensures header and rows are perfectly aligned
        if (startIndex >= 0) {
          // Use array index directly - firstDate is at index 0
          leftPx = startIndex * pixelsPerMonth;
        } else {
          // Fallback: find the month that contains startDate (which is firstDate)
          const monthStart = new Date(feature.startAt.getFullYear(), feature.startAt.getMonth(), 1);
          const firstMonthStart = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
          leftPx = differenceInMonths(monthStart, firstMonthStart) * pixelsPerMonth;
        }
        
        if (startIndex >= 0 && endIndex >= 0 && endIndex >= startIndex) {
          // Calculate width based on number of months spanned
          widthPx = (endIndex - startIndex + 1) * pixelsPerMonth;
        } else if (startIndex >= 0) {
          // Start found but end not found - use minimum width
          widthPx = pixelsPerMonth;
        } else {
          // Fallback to differenceInMonths if index not found
          const monthStart = new Date(feature.startAt.getFullYear(), feature.startAt.getMonth(), 1);
          const monthEnd = new Date(feature.endAt.getFullYear(), feature.endAt.getMonth(), 1);
          widthPx = Math.max(pixelsPerMonth, (differenceInMonths(monthEnd, monthStart) + 1) * pixelsPerMonth);
        }
        break;
      }
      case 'quarters': {
        // Find index of start quarter and end quarter in the quarters array
        const startIndex = findDateIndex(feature.startAt, quarters, 'quarters');
        const endIndex = findDateIndex(feature.endAt, quarters, 'quarters');
        
        // Always use firstDate (first date in array) as reference point for synchronization
        if (startIndex >= 0) {
          // Use array index directly - firstDate is at index 0
          leftPx = startIndex * pixelsPerQuarter;
        } else {
          // Fallback: find the quarter that contains startDate (which is firstDate)
          const quarterStart = new Date(feature.startAt.getFullYear(), Math.floor(feature.startAt.getMonth() / 3) * 3, 1);
          const firstQuarterStart = new Date(startDate.getFullYear(), Math.floor(startDate.getMonth() / 3) * 3, 1);
          leftPx = differenceInQuarters(quarterStart, firstQuarterStart) * pixelsPerQuarter;
        }
        
        if (startIndex >= 0 && endIndex >= 0 && endIndex >= startIndex) {
          // Calculate width based on number of quarters spanned
          widthPx = (endIndex - startIndex + 1) * pixelsPerQuarter;
        } else if (startIndex >= 0) {
          // Start found but end not found - use minimum width
          widthPx = pixelsPerQuarter;
        } else {
          // Fallback to differenceInQuarters if index not found
          const quarterStart = new Date(feature.startAt.getFullYear(), Math.floor(feature.startAt.getMonth() / 3) * 3, 1);
          const quarterEnd = new Date(feature.endAt.getFullYear(), Math.floor(feature.endAt.getMonth() / 3) * 3, 1);
          widthPx = Math.max(pixelsPerQuarter, (differenceInQuarters(quarterEnd, quarterStart) + 1) * pixelsPerQuarter);
        }
        break;
      }
      case 'years': {
        // Find index of start year and end year in the years array
        const startIndex = findDateIndex(feature.startAt, years, 'years');
        const endIndex = findDateIndex(feature.endAt, years, 'years');
        
        // Always use firstDate (first date in array) as reference point for synchronization
        if (startIndex >= 0) {
          // Use array index directly - firstDate is at index 0
          leftPx = startIndex * pixelsPerYear;
        } else {
          // Fallback: find the year that contains startDate (which is firstDate)
          const yearStart = new Date(feature.startAt.getFullYear(), 0, 1);
          const firstYearStart = new Date(startDate.getFullYear(), 0, 1);
          leftPx = differenceInYears(yearStart, firstYearStart) * pixelsPerYear;
        }
        
        if (startIndex >= 0 && endIndex >= 0 && endIndex >= startIndex) {
          // Calculate width based on number of years spanned
          widthPx = (endIndex - startIndex + 1) * pixelsPerYear;
        } else if (startIndex >= 0) {
          // Start found but end not found - use minimum width
          widthPx = pixelsPerYear;
        } else {
          // Fallback to differenceInYears if index not found
          const yearStart = new Date(feature.startAt.getFullYear(), 0, 1);
          const yearEnd = new Date(feature.endAt.getFullYear(), 0, 1);
          widthPx = Math.max(pixelsPerYear, (differenceInYears(yearEnd, yearStart) + 1) * pixelsPerYear);
        }
        break;
      }
      default:
        leftPx = differenceInDays(feature.startAt, startDate) * pixelsPerDay;
        widthPx = differenceInDays(feature.endAt, feature.startAt) * pixelsPerDay;
    }
    
    return { left: leftPx, width: widthPx };
  }, [feature.startAt, feature.endAt, startDate, viewMode, pixelsPerDay, pixelsPerWeek, pixelsPerMonth, pixelsPerQuarter, pixelsPerYear, days, weeks, months, quarters, years]);

  const style = {
    left: `${left}px`,
    width: `${width}px`,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 10,
    transform: transform ? `translate3d(${transform.x}px, 0, 0)` : undefined,
  };

  const statusColor = feature.status?.color || 'hsl(var(--text-tertiary) / 0.7)';

  // Create brighter, more visible colors using task status colors
  const getLightColor = (color: string) => {
    if (color.includes('hsl')) {
      const match = color.match(/hsl\(([^)]+)\)/);
      if (match) {
        const hslValues = match[1];
        // Handle CSS variables like var(--secondary) or direct HSL values
        if (hslValues.includes('var(')) {
          // Extract CSS variable name (e.g., --secondary from var(--secondary))
          const varMatch = hslValues.match(/var\(([^)]+)\)/);
          if (varMatch) {
            const varName = varMatch[1].trim();
            // Use high opacity for bright, visible status color
            return `hsl(var(${varName}) / 0.80)`;
          }
        } else {
          // Direct HSL values - extract base color
          const baseColor = hslValues.split('/')[0].trim();
          // Use higher opacity (0.75-0.85) for brighter task bars
          return `hsl(${baseColor} / 0.80)`;
        }
      }
    }
    // Fallback to primary color with high opacity
    return 'hsl(var(--primary) / 0.75)';
  };

  const getBorderColor = (color: string) => {
    if (color.includes('hsl')) {
      const match = color.match(/hsl\(([^)]+)\)/);
      if (match) {
        const hslValues = match[1];
        // Handle CSS variables like var(--secondary) or direct HSL values
        if (hslValues.includes('var(')) {
          // Extract CSS variable name
          const varMatch = hslValues.match(/var\(([^)]+)\)/);
          if (varMatch) {
            const varName = varMatch[1].trim();
            return `hsl(var(${varName}) / 0.95)`;
          }
        } else {
          // Direct HSL values - extract base color
          const baseColor = hslValues.split('/')[0].trim();
          return `hsl(${baseColor} / 0.95)`;
        }
      }
    }
    return 'hsl(var(--primary) / 0.90)';
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'absolute top-2 left-0 h-11 rounded-lg transition-opacity duration-200 cursor-grab active:cursor-grabbing group',
        isDragging && 'z-50 opacity-40'
      )}
      data-draggable="true"
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      {...listeners}
      {...attributes}
    >
      <div
        className="h-full rounded-lg flex items-center px-3 backdrop-blur-md transition-colors duration-200 relative"
        style={{
          background: getLightColor(statusColor),
          border: `1.5px solid ${getBorderColor(statusColor)}`,
        }}
      >
        {/* Left resize handle - for changing start date (draggable) */}
        {onResize && (
          <div
            ref={setStartResizeRef}
            {...startResizeListeners}
            {...startResizeAttrs}
            className="absolute -left-1 top-0 bottom-0 w-3 cursor-ew-resize z-20 flex items-center justify-center group/handle hover:w-4 transition-all duration-200"
            title="Drag to change start date"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-full w-full bg-white/10 group-hover/handle:bg-white/20 border-l-2 border-white/30 group-hover/handle:border-white/50 rounded-l-lg transition-all duration-200 flex items-center justify-center">
              <div className="flex flex-col gap-0.5 opacity-60 group-hover/handle:opacity-100 transition-opacity">
                <div className="w-0.5 h-1 bg-white rounded-full"></div>
                <div className="w-0.5 h-1 bg-white rounded-full"></div>
                <div className="w-0.5 h-1 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        )}

        {/* Right resize handle - for changing end date (draggable) */}
        {onResize && (
          <div
            ref={setEndResizeRef}
            {...endResizeListeners}
            {...endResizeAttrs}
            className="absolute -right-1 top-0 bottom-0 w-3 cursor-ew-resize z-20 flex items-center justify-center group/handle hover:w-4 transition-all duration-200"
            title="Drag to change end date"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-full w-full bg-white/10 group-hover/handle:bg-white/20 border-r-2 border-white/30 group-hover/handle:border-white/50 rounded-r-lg transition-all duration-200 flex items-center justify-center">
              <div className="flex flex-col gap-0.5 opacity-60 group-hover/handle:opacity-100 transition-opacity">
                <div className="w-0.5 h-1 bg-white rounded-full"></div>
                <div className="w-0.5 h-1 bg-white rounded-full"></div>
                <div className="w-0.5 h-1 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        )}

        {children ? (
          children(feature)
        ) : (
          <div className="flex-1 min-w-0 relative z-10">
            <GripVertical className="w-3 h-3 text-white/60 mr-2 flex-shrink-0 transition-colors duration-200 inline-block" />
            <div className="inline-block flex-1 min-w-0">
              <div className="text-xs font-semibold text-white/90 truncate">{feature.name}</div>
              <div className="text-[10px] text-white/50 font-medium">
                {format(feature.startAt, 'MMM d')} - {format(feature.endAt, 'MMM d')}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

function DateDropZones({ startDate, pixelsPerDay, viewMode }: { startDate: Date; pixelsPerDay: number; viewMode: string }) {
  const { days, weeks, months, quarters, years, pixelsPerWeek, pixelsPerMonth, pixelsPerQuarter, pixelsPerYear } = useGantt();

  // Select appropriate time units and pixel width based on view mode
  const { timeUnits, pixelWidth } = useMemo(() => {
    switch (viewMode) {
      case 'weeks':
        return { timeUnits: weeks, pixelWidth: pixelsPerWeek };
      case 'months':
        return { timeUnits: months, pixelWidth: pixelsPerMonth };
      case 'quarters':
        return { timeUnits: quarters, pixelWidth: pixelsPerQuarter };
      case 'years':
        return { timeUnits: years, pixelWidth: pixelsPerYear };
      default:
        return { timeUnits: days, pixelWidth: pixelsPerDay };
    }
  }, [viewMode, days, weeks, months, quarters, years, pixelsPerDay, pixelsPerWeek, pixelsPerMonth, pixelsPerQuarter, pixelsPerYear]);

  return (
    <>
      {timeUnits.map((date) => (
        <DateDropZone key={`date-${date.toISOString()}`} date={date} startDate={startDate} viewMode={viewMode} pixelWidth={pixelWidth} pixelsPerDay={pixelsPerDay} pixelsPerWeek={pixelsPerWeek} pixelsPerMonth={pixelsPerMonth} pixelsPerQuarter={pixelsPerQuarter} pixelsPerYear={pixelsPerYear} />
      ))}
    </>
  );
}

function DateDropZone({ date, startDate, viewMode, pixelWidth, pixelsPerDay, pixelsPerWeek, pixelsPerMonth, pixelsPerQuarter, pixelsPerYear }: { date: Date; startDate: Date; viewMode: string; pixelWidth: number; pixelsPerDay: number; pixelsPerWeek: number; pixelsPerMonth: number; pixelsPerQuarter: number; pixelsPerYear: number }) {
  const { days, weeks, months, quarters, years } = useGantt();
  const { setNodeRef, isOver } = useDroppable({
    id: `date-${date.toISOString()}`,
  });

  // Helper function to find index in date array (same as in FeatureBar)
  const findDateIndex = (targetDate: Date, dateArray: Date[], mode: string): number => {
    switch (mode) {
      case 'months': {
        const year = targetDate.getFullYear();
        const month = targetDate.getMonth();
        return dateArray.findIndex(d => d.getFullYear() === year && d.getMonth() === month);
      }
      case 'quarters': {
        const year = targetDate.getFullYear();
        const quarterMonth = Math.floor(targetDate.getMonth() / 3) * 3;
        return dateArray.findIndex(d => {
          const dYear = d.getFullYear();
          const dMonth = d.getMonth();
          return dYear === year && Math.floor(dMonth / 3) * 3 === quarterMonth;
        });
      }
      case 'years': {
        const year = targetDate.getFullYear();
        return dateArray.findIndex(d => d.getFullYear() === year);
      }
      default:
        return -1;
    }
  };

  // Calculate left position based on view mode
  // Use array indices for months/quarters/years for perfect synchronization with header
  const left = useMemo(() => {
    switch (viewMode) {
      case 'days': {
        const index = days.findIndex(d => d.getTime() === date.getTime());
        return index >= 0 ? index * pixelsPerDay : differenceInDays(date, startDate) * pixelsPerDay;
      }
      case 'weeks': {
        const index = weeks.findIndex(d => d.getTime() === date.getTime());
        return index >= 0 ? index * pixelsPerWeek : differenceInWeeks(date, startDate) * pixelsPerWeek;
      }
      case 'months': {
        const index = findDateIndex(date, months, 'months');
        return index >= 0 ? index * pixelsPerMonth : differenceInMonths(date, startDate) * pixelsPerMonth;
      }
      case 'quarters': {
        const index = findDateIndex(date, quarters, 'quarters');
        return index >= 0 ? index * pixelsPerQuarter : differenceInQuarters(date, startDate) * pixelsPerQuarter;
      }
      case 'years': {
        const index = findDateIndex(date, years, 'years');
        return index >= 0 ? index * pixelsPerYear : differenceInYears(date, startDate) * pixelsPerYear;
      }
      default:
        return differenceInDays(date, startDate) * pixelsPerDay;
    }
  }, [date, startDate, viewMode, pixelsPerDay, pixelsPerWeek, pixelsPerMonth, pixelsPerQuarter, pixelsPerYear, days, weeks, months, quarters, years]);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'absolute top-0 bottom-0 transition-all duration-150',
        isOver && 'bg-primary/[0.15] border-x border-primary/40'
      )}
      style={{
        left: `${left}px`,
        width: `${pixelWidth}px`,
      }}
    />
  );
}

function FeatureBarOverlay({ feature, startDate, pixelsPerDay }: { feature: GanttFeature; startDate: Date; pixelsPerDay: number }) {
  const width = differenceInDays(feature.endAt, feature.startAt) * pixelsPerDay;
  const statusColor = feature.status?.color || 'hsl(var(--text-tertiary) / 0.7)';

  const getLightColor = (color: string) => {
    if (color.includes('hsl')) {
      const match = color.match(/hsl\(([^)]+)\)/);
      if (match) {
        const hslValues = match[1];
        if (hslValues.includes('var(')) {
          const varMatch = hslValues.match(/var\(([^)]+)\)/);
          if (varMatch) {
            const varName = varMatch[1].trim();
            return `hsl(var(${varName}) / 0.85)`;
          }
        } else {
          const baseColor = hslValues.split('/')[0].trim();
          return `hsl(${baseColor} / 0.85)`;
        }
      }
    }
    return 'hsl(var(--primary) / 0.80)';
  };

  const getBorderColor = (color: string) => {
    if (color.includes('hsl')) {
      const match = color.match(/hsl\(([^)]+)\)/);
      if (match) {
        const hslValues = match[1];
        if (hslValues.includes('var(')) {
          const varMatch = hslValues.match(/var\(([^)]+)\)/);
          if (varMatch) {
            const varName = varMatch[1].trim();
            return `hsl(var(${varName}) / 1.0)`;
          }
        } else {
          const baseColor = hslValues.split('/')[0].trim();
          return `hsl(${baseColor} / 1.0)`;
        }
      }
    }
    return 'hsl(var(--primary) / 1.0)';
  };

  return (
    <div
      className="h-11 rounded-lg flex items-center px-3 opacity-95 backdrop-blur-xl"
      style={{
        width: `${width}px`,
        background: getLightColor(statusColor),
        border: `2px solid ${getBorderColor(statusColor)}`,
      }}
    >
      <GripVertical className="w-3 h-3 text-white/70 mr-2 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-white/95 truncate">{feature.name}</div>
        <div className="text-[10px] text-white/60 font-medium">
          {format(feature.startAt, 'MMM d')} - {format(feature.endAt, 'MMM d')}
        </div>
      </div>
    </div>
  );
}


