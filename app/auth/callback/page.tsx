'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';
import { useStore } from '@/lib/store';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const supabase = getSupabase();
        const code = new URLSearchParams(window.location.search).get('code');
        if (code) {
          await supabase.auth.exchangeCodeForSession(code);
          await useStore.getState().refreshSession();
        }
      } catch {}
      router.push('/');
    };
    handleCallback();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#ff0000] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
