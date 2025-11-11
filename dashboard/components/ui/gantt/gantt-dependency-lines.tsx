'use client';

import React, { useMemo } from 'react';
import { differenceInDays } from 'date-fns';
import { useGantt, GanttFeature } from './gantt-provider';

interface DependencyLine {
  id: string;
  fromTaskId: string;
  toTaskId: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  color: string;
}

interface GanttDependencyLinesProps {
  features: GanttFeature[];
  className?: string;
}

export function GanttDependencyLines({ features, className }: GanttDependencyLinesProps) {
  const { startDate, pixelsPerDay } = useGantt();

  // Calculate dependency lines
  const dependencyLines = useMemo<DependencyLine[]>(() => {
    const lines: DependencyLine[] = [];
    const taskPositions = new Map<string, { x: number; y: number; width: number; row: number }>();

    // First, calculate positions for all tasks
    features.forEach((feature, index) => {
      const left = differenceInDays(feature.startAt, startDate) * pixelsPerDay;
      const width = differenceInDays(feature.endAt, feature.startAt) * pixelsPerDay;
      const rowHeight = 60; // Same as in feature-row
      const taskHeight = 44; // Height of task bar
      const topOffset = 8; // Top margin of task bar
      const y = (index % 5) * rowHeight + topOffset + taskHeight / 2; // Center of task bar

      taskPositions.set(feature.id, { x: left, y, width, row: index % 5 });
    });

    // Now create lines based on dependencies
    features.forEach((feature) => {
      if (feature.metadata?.task?.dependsOn) {
        // Parse dependsOn field (can be comma-separated string or single ID)
        const dependsOnIds = feature.metadata.task.dependsOn
          .toString()
          .split(',')
          .map((id: string) => id.trim())
          .filter((id: string) => id);

        dependsOnIds.forEach((dependsOnId: string) => {
          const fromPos = taskPositions.get(dependsOnId);
          const toPos = taskPositions.get(feature.id);

          if (fromPos && toPos) {
            // Line goes from end of source task to start of target task
            const fromX = fromPos.x + fromPos.width;
            const fromY = fromPos.y;
            const toX = toPos.x;
            const toY = toPos.y;

            // Use source task color for the line
            const sourceFeature = features.find(f => f.id === dependsOnId);
            const color = sourceFeature?.status?.color || 'hsl(var(--primary) / 0.6)';

            lines.push({
              id: `${dependsOnId}-${feature.id}`,
              fromTaskId: dependsOnId,
              toTaskId: feature.id,
              fromX,
              fromY,
              toX,
              toY,
              color,
            });
          }
        });
      }
    });

    return lines;
  }, [features, startDate, pixelsPerDay]);

  if (dependencyLines.length === 0) {
    return null;
  }

  return (
    <svg
      className={`absolute inset-0 pointer-events-none ${className || ''}`}
      style={{ zIndex: 5 }}
    >
      <defs>
        {/* Define arrow markers for each color */}
        {Array.from(new Set(dependencyLines.map(line => line.color))).map((color) => {
          const colorId = color.replace(/[^a-z0-9]/gi, '');
          return (
            <marker
              key={colorId}
              id={`arrowhead-${colorId}`}
              markerWidth="10"
              markerHeight="10"
              refX="8"
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path
                d="M0,0 L0,6 L9,3 z"
                fill={color}
                opacity="0.8"
              />
            </marker>
          );
        })}
      </defs>

      {/* Draw dependency lines */}
      {dependencyLines.map((line) => {
        const colorId = line.color.replace(/[^a-z0-9]/gi, '');

        // Calculate path with elbow connector
        const midX = (line.fromX + line.toX) / 2;
        const pathData = `
          M ${line.fromX} ${line.fromY}
          L ${midX} ${line.fromY}
          L ${midX} ${line.toY}
          L ${line.toX - 8} ${line.toY}
        `;

        return (
          <g key={line.id} className="dependency-line group">
            {/* Invisible wider line for easier hovering */}
            <path
              d={pathData}
              fill="none"
              stroke="transparent"
              strokeWidth="12"
              className="pointer-events-auto cursor-pointer"
            />

            {/* Visible line */}
            <path
              d={pathData}
              fill="none"
              stroke={line.color}
              strokeWidth="2"
              strokeOpacity="0.6"
              markerEnd={`url(#arrowhead-${colorId})`}
              className="transition-all duration-200 group-hover:stroke-opacity-100 group-hover:stroke-[3]"
            />
          </g>
        );
      })}
    </svg>
  );
}
