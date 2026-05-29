'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getSupabase } from '@/lib/supabase';
import { Mail, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const supabase = getSupabase();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/login`,
      });

      if (resetError) throw resetError;
      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 relative">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(255,0,0,0.15),transparent_45%)] pointer-events-none z-0" />

      <header className="fixed top-0 left-0 w-full z-40 bg-black/80 backdrop-blur-md border-b border-white/10 h-16 flex items-center px-6">
        <Link href="/" className="flex items-center gap-2 text-white/70 hover:text-white transition text-xs font-bold uppercase tracking-widest">
          <ArrowLeft className="w-4 h-4" />
          Back to Store
        </Link>
      </header>

      <div className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[35px] p-8 space-y-6 shadow-2xl relative z-10 animate-fade-in-up">
        <div className="text-center space-y-2">
          <span className="text-[#ff0000] text-[10px] font-bold tracking-[0.2em] uppercase">Reset Password</span>
          <h2 className="text-3xl font-black uppercase tracking-wider">Forgot Password</h2>
          <p className="text-[10px] text-[#a1a1a1]">Enter your email and we&apos;ll send you a reset link</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-500 text-xs text-center p-3 rounded-xl font-bold uppercase">{error}</div>
        )}

        {sent ? (
          <div className="text-center space-y-4">
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs text-center p-4 rounded-xl font-bold uppercase">
              Reset link sent! Check your email inbox.
            </div>
            <Link href="/auth/login"
              className="inline-block px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white hover:bg-white/10 transition uppercase tracking-wider">
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-6">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-[#a1a1a1] tracking-widest">Email</label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-[#ff0000]/50 focus:outline-none transition-colors" placeholder="your@email.com" />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-4 bg-[#ff0000] text-white hover:bg-[#d60000] disabled:bg-zinc-700 font-bold text-sm uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 transition cursor-pointer shadow-[0_0_30px_rgba(255,0,0,0.3)]">
              {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>

            <p className="text-center text-[10px] text-[#a1a1a1]">
              Remember your password?{' '}
              <Link href="/auth/login" className="text-[#ff0000] hover:underline font-bold uppercase tracking-wider">Sign In</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
