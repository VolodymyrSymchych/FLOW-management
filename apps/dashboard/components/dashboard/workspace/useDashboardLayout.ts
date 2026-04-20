'use client';

import { useCallback, useEffect, useState } from 'react';
import { atom, useAtom } from 'jotai';
import type { Layout } from 'react-grid-layout';
import type {
  Breakpoint,
  DashboardLayoutState,
  Density,
  LayoutMap,
  WidgetId,
} from './types';
import { DEFAULT_LAYOUT, WIDGETS } from './registry';

const STORAGE_KEY = 'flow.dashboard.layout.v1';

const layoutAtom = atom<DashboardLayoutState>(DEFAULT_LAYOUT);
const hydratedAtom = atom<boolean>(false);

function readStorage(): DashboardLayoutState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DashboardLayoutState;
    if (parsed.version !== 1) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeStorage(state: DashboardLayoutState) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* quota or privacy mode — ignore */
  }
}

export function useDashboardLayout() {
  const [state, setState] = useAtom(layoutAtom);
  const [hydrated, setHydrated] = useAtom(hydratedAtom);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (hydrated) return;
    const stored = readStorage();
    if (stored) setState(stored);
    setHydrated(true);
  }, [hydrated, setHydrated, setState]);

  const persist = useCallback((next: DashboardLayoutState) => {
    setState(next);
    writeStorage(next);
  }, [setState]);

  const updateLayouts = useCallback((all: LayoutMap) => {
    persist({ ...state, layouts: all });
  }, [persist, state]);

  const hideWidget = useCallback((id: WidgetId) => {
    if (state.hiddenWidgetIds.includes(id)) return;
    persist({ ...state, hiddenWidgetIds: [...state.hiddenWidgetIds, id] });
  }, [persist, state]);

  const showWidget = useCallback((id: WidgetId) => {
    persist({
      ...state,
      hiddenWidgetIds: state.hiddenWidgetIds.filter((w) => w !== id),
    });
  }, [persist, state]);

  const resetWidgetSize = useCallback((id: WidgetId) => {
    const meta = WIDGETS.find((w) => w.id === id);
    if (!meta) return;
    const nextLayouts: LayoutMap = {
      lg: [...state.layouts.lg],
      md: [...state.layouts.md],
      sm: [...state.layouts.sm],
    };
    (['lg', 'md', 'sm'] as Breakpoint[]).forEach((bp) => {
      const idx = nextLayouts[bp].findIndex((l) => l.i === id);
      const def = meta.defaultSize[bp];
      if (idx >= 0) {
        nextLayouts[bp][idx] = {
          ...nextLayouts[bp][idx],
          w: def.w,
          h: def.h,
        };
      }
    });
    persist({ ...state, layouts: nextLayouts });
  }, [persist, state]);

  const setDensity = useCallback((density: Density) => {
    persist({ ...state, density });
  }, [persist, state]);

  const resetAll = useCallback(() => {
    persist(DEFAULT_LAYOUT);
  }, [persist]);

  const visibleLayouts = filterVisible(state.layouts, state.hiddenWidgetIds);

  return {
    hydrated,
    editMode,
    setEditMode,
    density: state.density,
    setDensity,
    layouts: visibleLayouts,
    hiddenWidgetIds: state.hiddenWidgetIds,
    updateLayouts,
    hideWidget,
    showWidget,
    resetWidgetSize,
    resetAll,
  };
}

function filterVisible(layouts: LayoutMap, hidden: WidgetId[]): LayoutMap {
  const hide = new Set<string>(hidden);
  const filter = (arr: Layout[]) => arr.filter((l) => !hide.has(l.i));
  return {
    lg: filter(layouts.lg),
    md: filter(layouts.md),
    sm: filter(layouts.sm),
  };
}
