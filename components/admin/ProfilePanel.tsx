'use client';

import { useEffect, useState } from 'react';
import { useAdminStore } from '@/lib/admin-store';
import {
  User, Camera, Save, Lock, Eye, EyeOff,
  ShieldCheck
} from 'lucide-react';

export default function ProfilePanel() {
  const setBreadcrumbs = useAdminStore((s) => s.setBreadcrumbs);
  const [tab, setTab] = useState<'profile' | 'password'>('profile');
  const [showPass, setShowPass] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Dashboard', href: '/admin/dashboard' },
      { label: 'Profile' },
    ]);
  }, [setBreadcrumbs]);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 pt-4 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-wider">My Profile</h1>
        <p className="text-sm text-[#a1a1a1] mt-1">Manage your account details and preferences.</p>
      </div>

      {/* Avatar Section */}
      <div className="flex items-center gap-6 p-6 rounded-3xl bg-[#0a0a0a] border border-white/5">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-[#ff0000]/10 border border-[#ff0000]/20 flex items-center justify-center text-[#ff0000] text-2xl font-black">
            A
          </div>
          <button className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#ff0000] border-2 border-black flex items-center justify-center text-white hover:bg-[#d60000] transition cursor-pointer">
            <Camera className="w-3.5 h-3.5" />
          </button>
        </div>
        <div>
          <p className="text-lg font-black text-white">Admin</p>
          <p className="text-xs text-[#a1a1a1]">abd@rutab.store</p>
          <p className="text-[9px] text-[#ff0000] font-bold uppercase tracking-wider mt-1 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Super Admin
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-3">
        {(['profile', 'password'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2.5 rounded-xl text-[10px] uppercase font-bold tracking-[0.25em] transition cursor-pointer ${
              tab === t ? 'bg-[#ff0000] text-white' : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}>
            {t === 'profile' ? 'Profile Details' : 'Change Password'}
          </button>
        ))}
      </div>

      <div className="rounded-3xl bg-[#0a0a0a] border border-white/5 p-6 space-y-6">
        {tab === 'profile' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Full Name" value="Administrator" />
              <Field label="Email" value="abd@rutab.store" />
              <Field label="Phone" value="+965 9000 0000" />
              <Field label="Timezone" value="Asia/Kuwait (UTC+3)" />
            </div>

            <button onClick={handleSave}
              className="px-6 py-2.5 rounded-xl bg-[#ff0000] hover:bg-[#d60000] text-white text-xs font-bold flex items-center gap-2 transition cursor-pointer">
              <Save className="w-4 h-4" /> {saved ? 'Saved!' : 'Update Profile'}
            </button>
          </>
        )}

        {tab === 'password' && (
          <>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-widest text-[#a1a1a1]">Current Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} defaultValue="••••••••"
                  className="w-full bg-black border border-white/10 rounded-xl py-2.5 px-3.5 pr-10 text-sm text-white focus:outline-none focus:border-[#ff0000]/40 transition" />
                <button onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition cursor-pointer">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="New Password" type="password" />
              <Field label="Confirm Password" type="password" />
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
              <Lock className="w-4 h-4 text-blue-400 shrink-0" />
              <p className="text-[10px] text-blue-200">Password must be at least 8 characters, include a number and a special character.</p>
            </div>

            <button onClick={handleSave}
              className="px-6 py-2.5 rounded-xl bg-[#ff0000] hover:bg-[#d60000] text-white text-xs font-bold flex items-center gap-2 transition cursor-pointer">
              <Save className="w-4 h-4" /> {saved ? 'Password Updated!' : 'Change Password'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, type }: { label: string; value?: string; type?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] uppercase font-bold tracking-widest text-[#a1a1a1]">{label}</label>
      <input defaultValue={value} type={type || 'text'}
        className="w-full bg-black border border-white/10 rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:border-[#ff0000]/40 transition" />
    </div>
  );
}
