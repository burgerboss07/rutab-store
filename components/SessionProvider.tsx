'use client';

import { useEffect } from 'react';
import { useStore } from '@/lib/store';

export default function SessionProvider({ children }: { children: React.ReactNode }) {
  const refreshSession = useStore((s) => s.refreshSession);

  useEffect(() => {
    refreshSession();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <>{children}</>;
}
