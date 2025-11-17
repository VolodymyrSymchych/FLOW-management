import { useEffect, useState, useRef, useMemo } from 'react';
import { debounce } from '@/lib/utils';
import toast from 'react-hot-toast';

interface AutoSaveOptions<T> {
  /** Debounce delay in milliseconds (default: 2000) */
  delay?: number;
  /** Function to save the data */
  onSave: (data: T) => Promise<void>;
  /** Function called when save succeeds */
  onSuccess?: () => void;
  /** Function called when save fails */
  onError?: (error: Error) => void;
  /** Show success toast (default: true) */
  showSuccessToast?: boolean;
  /** Show error toast (default: true) */
  showErrorToast?: boolean;
  /** Custom success message */
  successMessage?: string;
  /** Custom error message */
  errorMessage?: string;
  /** Enable auto-save (default: true) */
  enabled?: boolean;
}

interface AutoSaveState {
  /** Whether a save is in progress */
  isSaving: boolean;
  /** Timestamp of last successful save */
  lastSaved: Date | null;
  /** Error from last save attempt */
  error: Error | null;
  /** Whether data has changed since last save */
  isDirty: boolean;
}

/**
 * Hook for auto-saving form data
 *
 * Features:
 * - Debounced auto-save
 * - Loading state tracking
 * - Last saved timestamp
 * - Error handling
 * - Toast notifications
 * - Manual save trigger
 * - Dirty state tracking
 *
 * @example
 * const { isSaving, lastSaved, save } = useAutoSave(formData, {
 *   onSave: async (data) => {
 *     await api.updateProject(data);
 *   },
 *   delay: 2000,
 *   successMessage: 'Draft saved'
 * });
 */
export function useAutoSave<T>(
  data: T,
  options: AutoSaveOptions<T>
): AutoSaveState & { save: () => Promise<void> } {
  const {
    delay = 2000,
    onSave,
    onSuccess,
    onError,
    showSuccessToast = true,
    showErrorToast = true,
    successMessage = 'Draft saved',
    errorMessage = 'Failed to save draft',
    enabled = true,
  } = options;

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // Track previous data to detect changes
  const prevDataRef = useRef<T>(data);

  /**
   * Save function
   */
  const save = async () => {
    if (!enabled) return;

    setIsSaving(true);
    setError(null);

    try {
      await onSave(data);
      setLastSaved(new Date());
      setIsDirty(false);
      prevDataRef.current = data;

      if (showSuccessToast) {
        toast.success(successMessage);
      }

      onSuccess?.();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Save failed');
      setError(error);

      if (showErrorToast) {
        toast.error(errorMessage);
      }

      onError?.(error);
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Debounced save function
   */
  const debouncedSave = useMemo(
    () => debounce(save, delay),
    [delay, onSave, enabled]
  );

  /**
   * Auto-save when data changes
   */
  useEffect(() => {
    if (!enabled) return;

    // Check if data actually changed
    if (JSON.stringify(data) === JSON.stringify(prevDataRef.current)) {
      return;
    }

    setIsDirty(true);
    debouncedSave();
  }, [data, enabled, debouncedSave]);

  /**
   * Save before unload if there are unsaved changes
   */
  useEffect(() => {
    if (!enabled || !isDirty) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [enabled, isDirty]);

  return {
    isSaving,
    lastSaved,
    error,
    isDirty,
    save,
  };
}

/**
 * Hook for local storage auto-save
 *
 * @example
 * const formData = useLocalStorageAutoSave('my-form', initialData);
 */
export function useLocalStorageAutoSave<T>(
  key: string,
  initialData: T,
  options: Omit<AutoSaveOptions<T>, 'onSave'> = {}
): [T, (data: T) => void, AutoSaveState] {
  const [data, setData] = useState<T>(() => {
    if (typeof window === 'undefined') return initialData;

    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : initialData;
    } catch {
      return initialData;
    }
  });

  const autoSave = useAutoSave(data, {
    ...options,
    onSave: async (data) => {
      localStorage.setItem(key, JSON.stringify(data));
    },
    showSuccessToast: false, // Don't show toast for localStorage
  });

  return [data, setData, autoSave];
}

/**
 * Example usage:
 *
 * function EditProjectForm({ projectId, initialData }) {
 *   const [formData, setFormData] = useState(initialData);
 *
 *   const { isSaving, lastSaved, isDirty, save } = useAutoSave(formData, {
 *     onSave: async (data) => {
 *       await fetch(`/api/projects/${projectId}`, {
 *         method: 'PUT',
 *         body: JSON.stringify(data)
 *       });
 *     },
 *     delay: 3000,
 *     successMessage: 'Project saved',
 *   });
 *
 *   return (
 *     <form>
 *       <Input
 *         value={formData.name}
 *         onChange={(e) => setFormData({ ...formData, name: e.target.value })}
 *       />
 *
 *       <div className="text-sm text-text-tertiary">
 *         {isSaving && 'Saving...'}
 *         {lastSaved && `Last saved ${formatDistanceToNow(lastSaved)} ago`}
 *         {isDirty && !isSaving && 'Unsaved changes'}
 *       </div>
 *
 *       <button type="button" onClick={save} disabled={!isDirty || isSaving}>
 *         Save Now
 *       </button>
 *     </form>
 *   );
 * }
 */
