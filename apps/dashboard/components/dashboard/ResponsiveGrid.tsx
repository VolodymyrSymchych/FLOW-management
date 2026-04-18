'use client';

import * as React from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import type { Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

// Create the responsive grid layout with width provider
const ResponsiveGridLayout = WidthProvider(Responsive);

interface ResponsiveGridProps {
    className?: string;
    layouts: Record<string, Layout[]>;
    breakpoints: Record<string, number>;
    cols: Record<string, number>;
    rowHeight: number;
    onLayoutChange: (currentLayout: Layout[], allLayouts: Record<string, Layout[]>) => void;
    onBreakpointChange: (newBreakpoint: string) => void;
    isDraggable: boolean;
    isResizable: boolean;
    compactType: null;
    preventCollision: boolean;
    margin: [number, number];
    draggableHandle: string;
    useCSSTransforms: boolean;
    children: React.ReactNode;
}

function ResponsiveGrid(props: ResponsiveGridProps) {
    return <ResponsiveGridLayout {...props} />;
}

export default ResponsiveGrid;
export { ResponsiveGrid };
