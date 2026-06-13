'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSupabase } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import { CheckCircle2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const check = async () => {
      try {
        const supabase = getSupabase();
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          useStore.getState().setAuthUser(session.user);
          const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
          if (profile) {
            useStore.getState().setUser({
              email: profile.email || session.user.email || '',
              name: profile.full_name || '',
              phone: profile.phone || '',
              address: profile.address || '',
              area: '',
              customerSizes: profile.customer_sizes || {},
            });
          }
          setStatus('success');
        } else {
          setStatus('error');
        }
      } catch {
        setStatus('error');
      }
    };
    check();
  }, []);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#ff0000] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(255,0,0,0.15),transparent_45%)] pointer-events-none z-0" />
      <div className="w-full max-w-md relative z-10 animate-fade-in-up">
        <div className="bg-[#0a0a0a] border border-white/10 rounded-[35px] p-8 text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-wider">Signed In</h2>
          <p className="text-sm text-[#a1a1a1]">You have been authenticated successfully.</p>
          <Link href="/"
            className="inline-block px-8 py-3.5 bg-[#ff0000] hover:bg-[#d60000] text-white font-bold text-xs uppercase tracking-widest rounded-2xl transition cursor-pointer">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}