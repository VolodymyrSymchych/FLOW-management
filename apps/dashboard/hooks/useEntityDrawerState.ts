'use client';

import { useCallback, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export interface EntityDrawerState {
  activeId: string | null;
  isOpen: boolean;
  open: (id: string | number, extraParams?: Record<string, string | null | undefined>) => void;
  close: (preserveKeys?: string[]) => void;
}

interface UseEntityDrawerStateOptions {
  param: string;
  replace?: boolean;
}

export function useEntityDrawerState({
  param,
  replace = true,
}: UseEntityDrawerStateOptions): EntityDrawerState {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeId = searchParams.get(param);

  const navigate = useCallback(
    (params: URLSearchParams) => {
      const query = params.toString();
      const target = query ? `${pathname}?${query}` : pathname;

      if (replace) {
        router.replace(target, { scroll: false });
        return;
      }

      router.push(target, { scroll: false });
    },
    [pathname, replace, router]
  );

  const open = useCallback(
    (id: string | number, extraParams?: Record<string, string | null | undefined>) => {
      const nextParams = new URLSearchParams(searchParams.toString());
      nextParams.set(param, String(id));

      if (extraParams) {
        for (const [key, value] of Object.entries(extraParams)) {
          if (!value) {
            nextParams.delete(key);
            continue;
          }
          nextParams.set(key, value);
        }
      }

      navigate(nextParams);
    },
    [navigate, param, searchParams]
  );

  const close = useCallback(
    (preserveKeys: string[] = []) => {
      const nextParams = new URLSearchParams();

      for (const key of preserveKeys) {
        const value = searchParams.get(key);
        if (value) {
          nextParams.set(key, value);
        }
      }

      navigate(nextParams);
    },
    [navigate, searchParams]
  );

  return useMemo(
    () => ({
      activeId,
      isOpen: !!activeId,
      open,
      close,
    }),
    [activeId, close, open]
  );
}
