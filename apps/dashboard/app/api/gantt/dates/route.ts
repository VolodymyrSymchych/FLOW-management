import { NextResponse } from 'next/server';
import { eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, eachQuarterOfInterval, eachYearOfInterval } from 'date-fns';

const baseStartDate = new Date(2000, 0, 1);
const baseEndDate = new Date(2100, 11, 31);

// Generate all dates once and cache them
const allDays = eachDayOfInterval({ start: baseStartDate, end: baseEndDate });
const allWeeks = eachWeekOfInterval({ start: baseStartDate, end: baseEndDate });
const allMonths = eachMonthOfInterval({ start: baseStartDate, end: baseEndDate });
const allQuarters = eachQuarterOfInterval({ start: baseStartDate, end: baseEndDate });
const allYears = eachYearOfInterval({ start: baseStartDate, end: baseEndDate });

export async function GET() {
  return NextResponse.json({
    baseStartDate: baseStartDate.toISOString(),
    baseEndDate: baseEndDate.toISOString(),
    days: allDays.map(d => d.toISOString()),
    weeks: allWeeks.map(d => d.toISOString()),
    months: allMonths.map(d => d.toISOString()),
    quarters: allQuarters.map(d => d.toISOString()),
    years: allYears.map(d => d.toISOString()),
  });
}

