'use client';

import { createContext, useContext } from 'react';
import type { WidgetId } from './types';

export interface WidgetContextValue {
  editMode: boolean;
  onHide: (id: WidgetId) => void;
  onResetSize: (id: WidgetId) => void;
}

export const WidgetContext = createContext<WidgetContextValue>({
  editMode: false,
  onHide: () => {},
  onResetSize: () => {},
});

export function useWidgetContext() {
  return useContext(WidgetContext);
}
