'use client';

import { useEffect } from 'react';
import { getSupabase } from '@/lib/supabase';

export default function FaviconUpdater() {
  useEffect(() => {
    (async () => {
      try {
        const { data } = await getSupabase()
          .from('settings')
          .select('value')
          .eq('key', 'store_settings')
          .maybeSingle();
        const logo = data?.value?.store_logo;
        if (!logo) return;
        const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
        if (link) link.href = logo;
        const apple = document.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"]');
        if (apple) apple.href = logo;
      } catch {}
    })();
  }, []);

  return null;
}
