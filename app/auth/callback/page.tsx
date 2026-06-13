'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabase } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const supabase = getSupabase();
        const params = new URLSearchParams(window.location.search);
        const hash = window.location.hash;

        // 1. PKCE flow: ?code=...
        const code = params.get('code');
        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          if (data?.user) {
            useStore.getState().setAuthUser(data.user);
            // Fetch profile
            const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
            if (profile) {
              useStore.getState().setUser({
                email: profile.email || data.user.email || '',
                name: profile.full_name || '',
                phone: profile.phone || '',
                address: profile.address || '',
                area: '',
                customerSizes: profile.customer_sizes || {},
              });
            }
          }
          setStatus('success');
          return;
        }

        // 2. Implicit flow: #access_token=...&refresh_token=...
        if (hash) {
          const hashParams = new URLSearchParams(hash.replace('#', '?'));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          if (accessToken && refreshToken) {
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (error) throw error;
            if (data?.user) {
              useStore.getState().setAuthUser(data.user);
            }
            setStatus('success');
            return;
          }
        }

        // 3. No code or tokens found — check if session already exists
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          useStore.getState().setAuthUser(session.user);
          setStatus('success');
          return;
        }

        setStatus('error');
      } catch {
        // Try session check as final fallback
        try {
          const supabase = getSupabase();
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            useStore.getState().setAuthUser(session.user);
            setStatus('success');
            return;
          }
        } catch {}
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

  if (status === 'success') {
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

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(255,0,0,0.15),transparent_45%)] pointer-events-none z-0" />
      <div className="w-full max-w-md relative z-10 animate-fade-in-up">
        <div className="bg-[#0a0a0a] border border-white/10 rounded-[35px] p-8 text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-wider">Sign In Failed</h2>
          <p className="text-sm text-[#a1a1a1]">Could not complete the authentication. Please try again.</p>
          <Link href="/auth/login"
            className="inline-block px-8 py-3.5 bg-[#ff0000] hover:bg-[#d60000] text-white font-bold text-xs uppercase tracking-widest rounded-2xl transition cursor-pointer">
            Try Again
          </Link>
        </div>
      </div>
    </div>
  );
}
