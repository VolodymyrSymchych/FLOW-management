'use client';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

interface GridLayoutWrapperProps {
  children: ReactNode;
}

export function GridLayoutWrapper({ children }: GridLayoutWrapperProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="animate-pulse rounded-2xl bg-white/5 min-h-[400px]" />;
  }

  return <>{children}</>;
}
