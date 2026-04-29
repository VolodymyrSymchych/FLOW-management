'use client';

import { useDashboardLayout } from './useDashboardLayout';
import { WorkspaceGrid } from './WorkspaceGrid';
import { WorkspaceToolbar } from './WorkspaceToolbar';
import { useTeam } from '@/contexts/TeamContext';
import { useBootstrap } from '@/hooks/useQueries';

export default function WorkspaceDashboard() {
  const { selectedTeam } = useTeam();
  const teamId = selectedTeam.type === 'all' ? 'all' : selectedTeam.teamId;
  const { isLoading: bootstrapLoading, isSeeded } = useBootstrap(teamId);
  const {
    hydrated,
    editMode,
    setEditMode,
    density,
    setDensity,
    layouts,
    hiddenWidgetIds,
    updateLayouts,
    hideWidget,
    showWidget,
    resetWidgetSize,
    resetAll,
  } = useDashboardLayout();
  const ready = hydrated && !bootstrapLoading && isSeeded;

  return (
    <div className="flex h-full flex-col" data-testid="workspace-dashboard">
      <WorkspaceToolbar
        editMode={editMode}
        setEditMode={setEditMode}
        density={density}
        setDensity={setDensity}
        hiddenWidgetIds={hiddenWidgetIds}
        onAddWidget={showWidget}
        onReset={resetAll}
      />
      <div
        className="flex-1 overflow-y-auto bg-[hsl(var(--background))] px-3 pb-8 pt-2 md:px-5"
        data-edit={editMode || undefined}
      >
        {ready ? (
          <WorkspaceGrid
            layouts={layouts}
            editMode={editMode}
            density={density}
            hiddenWidgetIds={hiddenWidgetIds}
            onLayoutChange={updateLayouts}
            onHide={hideWidget}
            onResetSize={resetWidgetSize}
          />
        ) : (
          <div className="p-6 text-sm text-text-tertiary">Loading workspace…</div>
        )}
      </div>
    </div>
  );
}
