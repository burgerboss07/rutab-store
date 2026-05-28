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


