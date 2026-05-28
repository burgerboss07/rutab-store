'use client';

import { useEffect, ReactNode } from 'react';
import { getSupabase } from '@/lib/supabase';
import { useStore } from '@/lib/store';

export default function AuthProvider({ children }: { children: ReactNode }) {
  const setUser = useStore((s) => s.setUser);
  const setCurrency = useStore((s) => s.setCurrency);

  useEffect(() => {
    const client = getSupabase();

    const { data: { subscription } } = client.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        try {
          const { data: profile } = await client
            .from('profiles')
            .select('full_name, phone, preferred_currency')
            .eq('id', session.user.id)
            .maybeSingle();

          const name = profile?.full_name || session.user.user_metadata?.full_name || session.user.user_metadata?.name || 'Rutab Member';
          const phone = profile?.phone || session.user.user_metadata?.phone || '+965 9999 8888';
          const preferred_currency = profile?.preferred_currency;

          if (!profile) {
            await client.from('profiles').upsert({
              id: session.user.id,
              email: session.user.email || '',
              full_name: name,
              phone,
            }, { onConflict: 'id' });
          }

          setUser({
            email: session.user.email || '',
            name,
            phone,
            address: '',
            area: '',
          });

          if (preferred_currency) {
            setCurrency(preferred_currency);
          }
        } catch (err) {
          console.error('AuthProvider: failed to sync user session:', err);
          setUser({
            email: session.user.email || '',
            name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || 'Rutab Member',
            phone: session.user.user_metadata?.phone || '+965 9999 8888',
            address: '',
            area: '',
          });
        }
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <>{children}</>;
}
