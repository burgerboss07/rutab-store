'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabase } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import { CheckCircle2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const supabase = getSupabase();
        const code = new URLSearchParams(window.location.search).get('code');
        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          if (data?.user) {
            useStore.getState().setAuthUser(data.user);
          }
        }
        setStatus('success');
      } catch {
        setStatus('error');
      }
    };
    handleCallback();
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
          {status === 'success' ? (
            <>
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-wider">Email Confirmed</h2>
              <p className="text-sm text-[#a1a1a1]">Your email has been successfully verified. You can now browse and shop.</p>
              <Link href="/"
                className="inline-block px-8 py-3.5 bg-[#ff0000] hover:bg-[#d60000] text-white font-bold text-xs uppercase tracking-widest rounded-2xl transition cursor-pointer">
                Continue Shopping
              </Link>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
                <span className="text-red-500 text-3xl font-black">!</span>
              </div>
              <h2 className="text-2xl font-black uppercase tracking-wider">Confirmation Failed</h2>
              <p className="text-sm text-[#a1a1a1]">The verification link is invalid or expired. Please try signing up again.</p>
              <Link href="/auth/signup"
                className="inline-block px-8 py-3.5 bg-[#ff0000] hover:bg-[#d60000] text-white font-bold text-xs uppercase tracking-widest rounded-2xl transition cursor-pointer">
                Try Again
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
