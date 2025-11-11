'use client';

import React, { createContext, useContext, useState, useMemo, ReactNode, useCallback, useEffect } from 'react';
import { startOfMonth, endOfMonth, eachDayOfInterval, eachMonthOfInterval, eachWeekOfInterval, eachYearOfInterval, eachQuarterOfInterval, addDays, addMonths, addWeeks, addQuarters, addYears, startOfWeek, endOfWeek, startOfYear, endOfYear, startOfQuarter, endOfQuarter } from 'date-fns';

export interface GanttFeature {
  id: string;
  name: string;
  startAt: Date;
  endAt: Date;
  status?: {
    id: string;
    name: string;
    color: string;
  };
  lane?: string;
  metadata?: Record<string, any>;
  parentId?: string;
  children?: GanttFeature[];
}

export interface GanttMarker {
  id: string;
  date: Date;
  label: string;
  className?: string;
}

interface GanttContextValue {
  range: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  zoom: number;
  startDate: Date;
  endDate: Date;
  baseStartDate: Date;
  baseEndDate: Date;
  days: Date[];
  weeks: Date[];
  months: Date[];
  quarters: Date[];
  years: Date[];
  pixelsPerDay: number;
  pixelsPerWeek: number;
  pixelsPerMonth: number;
  pixelsPerQuarter: number;
  pixelsPerYear: number;
  viewMode: 'days' | 'weeks' | 'months' | 'quarters' | 'years';
  onAddItem?: (date: Date) => void;
  onMoveItem?: (id: string, startAt: Date, endAt: Date | null) => void;
  extendRange?: (direction: 'left' | 'right', amount: number) => void;
  visibleStartDate: Date;
  visibleEndDate: Date;
  firstDate: Date; // First date in the arrays for synchronization
}

const GanttContext = createContext<GanttContextValue | undefined>(undefined);

export function useGantt() {
  const context = useContext(GanttContext);
  if (!context) {
    throw new Error('useGantt must be used within GanttProvider');
  }
  return context;
}

interface GanttProviderProps {
  children: ReactNode;
  className?: string;
  range?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  zoom?: number;
  onAddItem?: (date: Date) => void;
  onMoveItem?: (id: string, startAt: Date, endAt: Date | null) => void;
  features?: GanttFeature[];
}

export function GanttProvider({
  children,
  className = '',
  range = 'monthly',
  zoom = 100,
  onAddItem,
  onMoveItem,
  features = [],
}: GanttProviderProps) {
  const [currentDate] = useState(new Date());
  
  // Base dates for infinite scroll (2000-2040)
  const baseStartYear = 2000;
  const baseEndYear = 2040;
  const baseStartDate = useMemo(() => new Date(baseStartYear, 0, 1), []);
  const baseEndDate = useMemo(() => new Date(baseEndYear, 11, 31), []);
  
  // Calculate initial dates - always center around current date
  const calculateInitialDates = () => {
    // Always center around current date, regardless of features
    let start: Date;
    let end: Date;
    
    switch (range) {
      case 'daily':
        start = addDays(currentDate, -15);
        end = addDays(currentDate, 30);
        break;
      case 'weekly':
        start = startOfWeek(addWeeks(currentDate, -6));
        end = endOfWeek(addWeeks(currentDate, 6));
        break;
      case 'monthly':
        start = startOfMonth(addMonths(currentDate, -6));
        end = endOfMonth(addMonths(currentDate, 6));
        break;
      case 'quarterly':
        start = startOfQuarter(addQuarters(currentDate, -4));
        end = endOfQuarter(addQuarters(currentDate, 4));
        break;
      case 'yearly':
        start = startOfYear(addYears(currentDate, -3));
        end = endOfYear(addYears(currentDate, 3));
        break;
      default:
        start = startOfMonth(addMonths(currentDate, -6));
        end = endOfMonth(addMonths(currentDate, 6));
    }
    
    return { start, end };
  };
  
  // Calculate initial dates for centering
  const initialDates = calculateInitialDates();
  const [visibleStartDate, setVisibleStartDate] = useState(() => {
    const start = initialDates.start < baseStartDate ? baseStartDate : initialDates.start;
    return start;
  });
  const [visibleEndDate, setVisibleEndDate] = useState(() => {
    const end = initialDates.end > baseEndDate ? baseEndDate : initialDates.end;
    return end;
  });
  
  // Update visible dates to center around current date when range changes
  useEffect(() => {
    const newDates = calculateInitialDates();
    setVisibleStartDate(newDates.start < baseStartDate ? baseStartDate : newDates.start);
    setVisibleEndDate(newDates.end > baseEndDate ? baseEndDate : newDates.end);
  }, [range, currentDate, baseStartDate, baseEndDate]);

  // Calculate actual startDate for position calculations
  // Use baseStartDate as reference point for synchronization with header
  // This ensures header and rows use the same reference point
  const actualStartDate = useMemo(() => {
    // Always use baseStartDate as the reference point for consistency
    // This ensures header dates and task positions are synchronized
    return baseStartDate;
  }, [baseStartDate]);

  // Extend range function - extend visible dates with large buffer to prevent duplicates
  const extendRange = useCallback((direction: 'left' | 'right', amount: number) => {
    setVisibleStartDate(prev => {
      if (direction === 'left') {
        // Extend more aggressively to prevent duplicates
        const extendAmount = amount * 2; // Double the amount for buffer
        const newStart = (() => {
          switch (range) {
            case 'daily':
              return addDays(prev, -extendAmount);
            case 'weekly':
              return startOfWeek(addWeeks(prev, -extendAmount));
            case 'monthly':
              return startOfMonth(addMonths(prev, -extendAmount));
            case 'quarterly':
              return startOfQuarter(addQuarters(prev, -extendAmount));
            case 'yearly':
              return startOfYear(addYears(prev, -extendAmount));
            default:
              return addDays(prev, -extendAmount);
          }
        })();
        // Don't go before base start date
        return newStart < baseStartDate ? baseStartDate : newStart;
      }
      return prev;
    });
    
    setVisibleEndDate(prev => {
      if (direction === 'right') {
        // Extend more aggressively to prevent duplicates
        const extendAmount = amount * 2; // Double the amount for buffer
        const newEnd = (() => {
          switch (range) {
            case 'daily':
              return addDays(prev, extendAmount);
            case 'weekly':
              return endOfWeek(addWeeks(prev, extendAmount));
            case 'monthly':
              return endOfMonth(addMonths(prev, extendAmount));
            case 'quarterly':
              return endOfQuarter(addQuarters(prev, extendAmount));
            case 'yearly':
              return endOfYear(addYears(prev, extendAmount));
            default:
              return addDays(prev, extendAmount);
          }
        })();
        // Don't go after base end date
        return newEnd > baseEndDate ? baseEndDate : newEnd;
      }
      return prev;
    });
  }, [range, baseStartDate, baseEndDate]);

  const { startDate, endDate, days, weeks, months, quarters, years, viewMode, firstDate } = useMemo(() => {
    let mode: 'days' | 'weeks' | 'months' | 'quarters' | 'years' = 'days';

    // Determine view mode based on range
    switch (range) {
      case 'weekly':
        mode = 'weeks';
        break;
      case 'monthly':
        mode = 'months';
        break;
      case 'quarterly':
        mode = 'quarters';
        break;
      case 'yearly':
        mode = 'years';
        break;
      default:
        mode = 'days';
    }

    // Generate dates for visible range with buffer to prevent duplicates
    // Use a smaller buffer for better initial positioning
    const bufferMultiplier = 2; // Reduced from 3 to prevent starting too far back
    const rangeDuration = visibleEndDate.getTime() - visibleStartDate.getTime();
    const bufferDuration = rangeDuration * bufferMultiplier;
    
    const bufferStart = new Date(visibleStartDate.getTime() - bufferDuration);
    const bufferEnd = new Date(visibleEndDate.getTime() + bufferDuration);
    
    const start = bufferStart < baseStartDate ? baseStartDate : bufferStart;
    const end = bufferEnd > baseEndDate ? baseEndDate : bufferEnd;

    // Generate dates only for the buffered range
    const daysArray = range === 'daily' ? eachDayOfInterval({ start, end }) : [];
    const weeksArray = range === 'weekly' ? eachWeekOfInterval({ start, end }) : [];
    const monthsArray = range === 'monthly' ? eachMonthOfInterval({ start, end }) : [];
    const quartersArray = range === 'quarterly' ? eachQuarterOfInterval({ start, end }) : [];
    const yearsArray = range === 'yearly' ? eachYearOfInterval({ start, end }) : [];

    // Use visibleStartDate as firstDate for synchronization, not the first element of buffered array
    // This ensures header starts from the visible range, not from the buffer start
    // But we need to find the closest date in the array to visibleStartDate
    const getFirstDateFromArray = (dateArray: Date[]): Date => {
      if (dateArray.length === 0) return visibleStartDate;
      
      // Find the date in array that is closest to or before visibleStartDate
      // For months/quarters/years, find the one that contains visibleStartDate
      switch (mode) {
        case 'months': {
          const visibleYear = visibleStartDate.getFullYear();
          const visibleMonth = visibleStartDate.getMonth();
          const found = dateArray.find(d => d.getFullYear() === visibleYear && d.getMonth() === visibleMonth);
          return found || dateArray[0];
        }
        case 'quarters': {
          const visibleYear = visibleStartDate.getFullYear();
          const visibleQuarterMonth = Math.floor(visibleStartDate.getMonth() / 3) * 3;
          const found = dateArray.find(d => {
            const dYear = d.getFullYear();
            const dMonth = d.getMonth();
            return dYear === visibleYear && Math.floor(dMonth / 3) * 3 === visibleQuarterMonth;
          });
          return found || dateArray[0];
        }
        case 'years': {
          const visibleYear = visibleStartDate.getFullYear();
          const found = dateArray.find(d => d.getFullYear() === visibleYear);
          return found || dateArray[0];
        }
        case 'weeks': {
          // For weeks, find the week that contains visibleStartDate
          const found = dateArray.find(d => {
            const weekStart = startOfWeek(d);
            const weekEnd = endOfWeek(d);
            return visibleStartDate >= weekStart && visibleStartDate <= weekEnd;
          });
          return found || dateArray[0];
        }
        default:
          // For days, find exact match or closest
          const found = dateArray.find(d => d.getTime() === visibleStartDate.getTime());
          return found || dateArray[0];
      }
    };

    const firstDateInArray = daysArray[0] || weeksArray[0] || monthsArray[0] || quartersArray[0] || yearsArray[0];
    const firstDate = firstDateInArray ? getFirstDateFromArray(
      daysArray.length > 0 ? daysArray :
      weeksArray.length > 0 ? weeksArray :
      monthsArray.length > 0 ? monthsArray :
      quartersArray.length > 0 ? quartersArray :
      yearsArray
    ) : visibleStartDate;

    return {
      startDate: actualStartDate, // Use baseStartDate as reference point for position calculations
      endDate: baseEndDate, // Always use base end for calculations
      days: daysArray,
      weeks: weeksArray,
      months: monthsArray,
      quarters: quartersArray,
      years: yearsArray,
      viewMode: mode,
      // First date for synchronization - use visibleStartDate aligned date, not buffer start
      firstDate: firstDate,
    };
  }, [range, visibleStartDate, visibleEndDate, baseStartDate, baseEndDate, actualStartDate]);

  const pixelsPerDay = (zoom / 100) * 40;
  const pixelsPerWeek = (zoom / 100) * 100;
  const pixelsPerMonth = (zoom / 100) * 120;
  const pixelsPerQuarter = (zoom / 100) * 180;
  const pixelsPerYear = (zoom / 100) * 240;

  return (
    <GanttContext.Provider
      value={{
        range,
        zoom,
        startDate,
        endDate,
        baseStartDate,
        baseEndDate,
        days,
        weeks,
        months,
        quarters,
        years,
        pixelsPerDay,
        pixelsPerWeek,
        pixelsPerMonth,
        pixelsPerQuarter,
        pixelsPerYear,
        viewMode,
        onAddItem,
        onMoveItem,
        extendRange,
        visibleStartDate,
        visibleEndDate,
        firstDate,
      }}
    >
      <div className={`flex h-full min-h-0 ${className}`}>{children}</div>
    </GanttContext.Provider>
  );
}

