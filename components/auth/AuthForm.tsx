'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-browser';
import {
  Mail, Lock, User, Phone, Key, Eye, EyeOff, Loader2, ArrowLeft,
} from 'lucide-react';

interface AuthFormProps {
  mode: 'login' | 'signup' | 'forgot';
}

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/');
        router.refresh();
      } else if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email, password,
          options: {
            data: { full_name: name, phone },
          },
        });
        if (error) throw error;
        if (data.session) {
          await supabase.from('profiles').insert({
            id: data.user!.id, email, full_name: name, phone,
          });
          router.push('/');
          router.refresh();
        } else {
          setSuccess('Account created! Check your email to verify.');
        }
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        });
        if (error) throw error;
        setSuccess('Password reset link sent to your email.');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google') => {
    setLoading(true);
    setError('');
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 relative">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(255,0,0,0.15),transparent_45%)] pointer-events-none z-0" />

      <header className="fixed top-0 left-0 w-full z-40 bg-black/80 backdrop-blur-md border-b border-white/10 h-16 flex items-center px-6">
        <Link href="/" className="flex items-center gap-2 text-white/70 hover:text-white transition text-xs font-bold uppercase tracking-widest">
          <ArrowLeft className="w-4 h-4" /> Back to Store
        </Link>
      </header>

      <form onSubmit={handleSubmit} className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[35px] p-8 space-y-6 shadow-2xl relative z-10 animate-fade-in-up">
        <div className="text-center space-y-2">
          <span className="text-[#ff0000] text-[10px] font-bold tracking-[0.2em] uppercase">Rutab Vault</span>
          <h2 className="text-3xl font-black uppercase tracking-wider">
            {mode === 'login' ? 'Welcome Back' : mode === 'signup' ? 'Join the Vault' : 'Reset Password'}
          </h2>
          <p className="text-[10px] text-[#a1a1a1]">
            {mode === 'login' ? 'Sign in to your Rutab account' :
             mode === 'signup' ? 'Create your premium streetwear account' :
             'Enter your email to receive a reset link'}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] text-center p-3 rounded-xl font-bold uppercase">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] text-center p-3 rounded-xl font-bold uppercase">
            {success}
          </div>
        )}

        <div className="space-y-4">
          {mode === 'signup' && (
            <>
              <Input icon={<User className="w-4 h-4" />} type="text" placeholder="Full Name" required
                value={name} onChange={(e) => setName(e.target.value)} />
              <Input icon={<Phone className="w-4 h-4" />} type="tel" placeholder="+965 9000 0000" required
                value={phone} onChange={(e) => setPhone(e.target.value)} />
            </>
          )}

          <Input icon={<Mail className="w-4 h-4" />} type="email" placeholder="name@domain.com" required
            value={email} onChange={(e) => setEmail(e.target.value)} />

          {mode !== 'forgot' && (
            <div className="relative">
              <Input icon={<Lock className="w-4 h-4" />}
                type={showPass ? 'text' : 'password'} placeholder="••••••••" required
                value={password} onChange={(e) => setPassword(e.target.value)}
                className="pr-10" />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition cursor-pointer">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          )}

          {mode === 'login' && (
            <div className="flex justify-end">
              <Link href="/auth/forgot-password"
                className="text-[10px] text-[#a1a1a1] hover:text-white uppercase font-bold tracking-wider transition">
                Forgot Password?
              </Link>
            </div>
          )}
        </div>

        <button type="submit" disabled={loading}
          className="w-full py-4 bg-[#ff0000] text-white hover:bg-[#d60000] disabled:bg-zinc-700 font-bold text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 transition cursor-pointer shadow-[0_0_30px_rgba(255,0,0,0.3)]">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
          {mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
        </button>

        {/* Social Login (login + signup only) */}
        {mode !== 'forgot' && (
          <>
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5" /></div>
              <div className="relative flex justify-center"><span className="bg-[#0a0a0a] px-4 text-[9px] text-[#555] uppercase tracking-wider">or continue with</span></div>
            </div>

            <div className="w-full">
              <SocialButton icon={
                <svg viewBox="0 0 24 24" className="w-4 h-4"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              } label="Google" onClick={() => handleSocialLogin('google')} disabled={loading} />
            </div>
          </>
        )}

        <div className="text-center">
          {mode === 'login' ? (
            <Link href="/auth/signup"
              className="text-[10px] text-white/50 hover:text-white transition uppercase font-bold tracking-wider">
              New to Rutab? <span className="text-[#ff0000] underline">Join the Vault</span>
            </Link>
          ) : mode === 'signup' ? (
            <Link href="/auth/login"
              className="text-[10px] text-white/50 hover:text-white transition uppercase font-bold tracking-wider">
              Already a member? <span className="text-[#ff0000] underline">Sign In</span>
            </Link>
          ) : (
            <Link href="/auth/login"
              className="text-[10px] text-white/50 hover:text-white transition uppercase font-bold tracking-wider">
              Remember your password? <span className="text-[#ff0000] underline">Sign In</span>
            </Link>
          )}
        </div>
      </form>
    </div>
  );
}

function Input({ icon, className = '', onChange, ...props }: { icon?: React.ReactNode; className?: string; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; [key: string]: any }) {
  return (
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">{icon}</div>
      <input onChange={onChange} {...props}
        className={`w-full bg-black border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#ff0000]/40 transition ${className}`} />
    </div>
  );
}

function SocialButton({ icon, label, onClick, disabled }: { icon: React.ReactNode; label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      className="flex items-center justify-center gap-2 py-3 rounded-xl border border-white/10 hover:border-white/30 bg-black text-white/80 hover:text-white text-[10px] font-bold uppercase tracking-wider transition cursor-pointer disabled:opacity-50 w-full">
      {icon} {label}
    </button>
  );
}
