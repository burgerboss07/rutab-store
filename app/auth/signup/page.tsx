'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';
import { useStore } from '@/lib/store';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const supabase = getSupabase();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      });

      if (signUpError) throw signUpError;

      if (data.user?.identities?.length === 0) {
        setSuccess('Account already registered. Redirecting to sign in...');
        setTimeout(() => router.push('/auth/login'), 1500);
        return;
      }

      if (data.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          email,
          full_name: name || email.split('@')[0],
        });
        useStore.getState().setAuthUser(data.user);
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
        if (profile) {
          useStore.getState().setUser({
            email: profile.email || email,
            name: profile.full_name || name,
            phone: profile.phone || '',
            address: '',
            area: '',
          });
        }
      }

      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      const supabase = getSupabase();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
      setGoogleLoading(false);
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

      <div className="w-full max-w-md space-y-6 relative z-10 animate-fade-in-up">
        <div className="bg-[#0a0a0a] border border-white/10 rounded-[35px] p-8 space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <span className="text-[#ff0000] text-[10px] font-bold tracking-[0.2em] uppercase">Join Rutab</span>
            <h2 className="text-3xl font-black uppercase tracking-wider">Create Account</h2>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-500 text-xs text-center p-3 rounded-xl font-bold uppercase">{error}</div>
          )}
          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs text-center p-3 rounded-xl font-bold uppercase">{success}</div>
          )}

          <button type="button" onClick={handleGoogleSignup} disabled={googleLoading}
            className="w-full py-3.5 bg-white text-black hover:bg-gray-200 disabled:bg-zinc-700 font-bold text-sm uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 transition cursor-pointer">
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            {googleLoading ? 'Redirecting...' : 'Continue with Google'}
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[10px] text-[#555] uppercase font-bold tracking-widest">Or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-[#a1a1a1] tracking-widest">Full Name</label>
              <div className="relative">
                <User className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-[#ff0000]/50 focus:outline-none transition-colors" placeholder="Your Name" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-[#a1a1a1] tracking-widest">Email</label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-[#ff0000]/50 focus:outline-none transition-colors" placeholder="your@email.com" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-[#a1a1a1] tracking-widest">Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} minLength={6}
                  className="w-full bg-black border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-sm focus:border-[#ff0000]/50 focus:outline-none transition-colors" placeholder="Min. 6 characters" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition cursor-pointer">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading || !!success}
              className="w-full py-4 bg-[#ff0000] text-white hover:bg-[#d60000] disabled:bg-zinc-700 font-bold text-sm uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 transition cursor-pointer shadow-[0_0_30px_rgba(255,0,0,0.3)]">
              {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-[10px] text-[#a1a1a1]">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-[#ff0000] hover:underline font-bold uppercase tracking-wider">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
