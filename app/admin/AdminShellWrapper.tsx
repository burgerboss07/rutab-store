'use client';

import { useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Key, Mail, Lock } from 'lucide-react';
import AdminShell from '@/components/admin/AdminShell';
import { getSupabase } from '@/lib/supabase';
import { useStore } from '@/lib/store';

const AUTH_KEY = 'rutab-admin-auth';

export default function AdminShellWrapper({
  initialAuthenticated,
  children,
}: {
  initialAuthenticated: boolean;
  children: ReactNode;
}) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(initialAuthenticated);
  const [hydrated, setHydrated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_KEY);
    if (stored === 'true' && !isAuthenticated) {
      setIsAuthenticated(true);
    }
    if (isAuthenticated) {
      localStorage.setItem(AUTH_KEY, 'true');
    }

    setHydrated(true);
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'abd@rutab.store' && password === 'Urmine456') {
      try {
        await fetch('/api/admin/auth', { method: 'POST' });
      } catch {
        // fallback
      }
      setIsAuthenticated(true);
      localStorage.setItem(AUTH_KEY, 'true');
      setError('');
      router.refresh();
    } else {
      setError('Invalid admin credentials.');
    }
  };

  const handleLock = async () => {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
    } catch {
      // ignore
    }
    setIsAuthenticated(false);
    localStorage.removeItem(AUTH_KEY);
    router.refresh();
  };

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#ff0000] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 relative">
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(255,0,0,0.15),transparent_45%)] pointer-events-none z-0" />

        <header className="fixed top-0 left-0 w-full z-40 bg-black/80 backdrop-blur-md border-b border-white/10 h-16 flex items-center px-6">
          <Link href="/" className="flex items-center gap-2 text-white/70 hover:text-white transition text-xs font-bold uppercase tracking-widest">
            <ArrowLeft className="w-4 h-4" />
            Back to Store
          </Link>
        </header>

        <form onSubmit={handleLogin} className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[35px] p-8 space-y-6 shadow-2xl relative z-10 animate-fade-in-up">
          <div className="text-center space-y-2">
            <span className="text-[#ff0000] text-[10px] font-bold tracking-[0.2em] uppercase">Restricted Area</span>
            <h2 className="text-3xl font-black uppercase tracking-wider">Admin Portal</h2>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-500 text-xs text-center p-3 rounded-xl font-bold uppercase">{error}</div>
          )}

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-[#a1a1a1] tracking-widest">Admin Email</label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-[#ff0000]/50 focus:outline-none transition-colors" placeholder="admin@domain.com" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-[#a1a1a1] tracking-widest">Master Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-[#ff0000]/50 focus:outline-none transition-colors" placeholder="••••••••" />
              </div>
            </div>
          </div>

          <button type="submit"
            className="w-full py-4 bg-[#ff0000] text-white hover:bg-[#d60000] font-bold text-sm uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 transition cursor-pointer shadow-[0_0_30px_rgba(255,0,0,0.3)]">
            <Key className="w-4 h-4" /> Authenticate
          </button>

          <div className="text-center pt-2">
            <p className="text-[9px] text-[#555] uppercase tracking-wider leading-relaxed">
              Demo: <span className="text-white/60">abd@rutab.store</span> / <span className="text-white/60">Urmine456</span>
            </p>
          </div>
        </form>
      </div>
    );
  }

  return (
    <AdminShell onLock={handleLock}>
      {children}
    </AdminShell>
  );
}
