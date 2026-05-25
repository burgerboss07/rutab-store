'use client';

import { useEffect, useState } from 'react';
import { useAdminStore } from '@/lib/admin-store';
import {
  Settings, Globe, Mail, CreditCard, Search, ToggleLeft,
  Save, AlertTriangle, ImageIcon
} from 'lucide-react';

const sections = [
  { id: 'general', label: 'General', icon: <Globe className="w-4 h-4" /> },
  { id: 'email', label: 'Email', icon: <Mail className="w-4 h-4" /> },
  { id: 'payment', label: 'Payment', icon: <CreditCard className="w-4 h-4" /> },
  { id: 'seo', label: 'SEO', icon: <Search className="w-4 h-4" /> },
  { id: 'maintenance', label: 'Maintenance', icon: <ToggleLeft className="w-4 h-4" /> },
];

export default function SettingsPanel() {
  const setBreadcrumbs = useAdminStore((s) => s.setBreadcrumbs);
  const [activeSection, setActiveSection] = useState('general');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Dashboard', href: '/admin/dashboard' },
      { label: 'Settings' },
    ]);
  }, [setBreadcrumbs]);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 pt-4 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-wider">System Settings</h1>
        <p className="text-sm text-[#a1a1a1] mt-1">Configure your store&apos;s global preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-6 items-start">
        {/* Section Nav */}
        <div className="flex md:flex-col gap-2">
          {sections.map((sec) => (
            <button key={sec.id} onClick={() => setActiveSection(sec.id)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-[10px] uppercase font-bold tracking-wider transition cursor-pointer ${
                activeSection === sec.id ? 'bg-[#ff0000] text-white' : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}>
              {sec.icon} {sec.label}
            </button>
          ))}
        </div>

        {/* Settings Form */}
        <div className="rounded-3xl bg-[#0a0a0a] border border-white/5 p-6 space-y-6">
          {activeSection === 'general' && (
            <>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">General Settings</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Store Name" value="RUTAB 2.0" />
                <Field label="Default Language" value="English" />
                <Field label="Timezone" value="Asia/Kuwait (UTC+3)" />
                <Field label="Currency" value="KWD (K.D)" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold tracking-widest text-[#a1a1a1]">Store Logo</label>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl bg-black border border-white/10 flex items-center justify-center text-white/30">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <button className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-white/10 transition cursor-pointer">Upload</button>
                </div>
              </div>
            </>
          )}

          {activeSection === 'email' && (
            <>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Email Configuration</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="SMTP Host" value="smtp.sendgrid.net" />
                <Field label="SMTP Port" value="587" />
                <Field label="From Name" value="RUTAB Store" />
                <Field label="From Email" value="noreply@rutab.store" />
              </div>
            </>
          )}

          {activeSection === 'payment' && (
            <>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Payment Gateways</h3>
              <div className="space-y-4">
                <GatewayCard name="Stripe" enabled />
                <GatewayCard name="KNET" enabled />
                <GatewayCard name="Tabby (BNPL)" enabled={false} />
                <GatewayCard name="Cash on Delivery" enabled />
              </div>
            </>
          )}

          {activeSection === 'seo' && (
            <>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">SEO & Analytics</h3>
              <div className="grid grid-cols-1 gap-4">
                <Field label="Default Meta Title" value="RUTAB 2.0 — Luxury Streetwear Kuwait" />
                <Field label="Default Meta Description" value="Premium streetwear for the GCC..." />
                <Field label="Google Analytics ID" value="G-XXXXXXXXXX" />
              </div>
            </>
          )}

          {activeSection === 'maintenance' && (
            <>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Maintenance Mode</h3>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                <p className="text-xs text-amber-200">When enabled, visitors will see a 503 maintenance page. Admins can still access the panel.</p>
              </div>
              <Toggle label="Maintenance Mode" enabled={false} />
            </>
          )}

          <div className="flex items-center gap-3 pt-4 border-t border-white/5">
            <button onClick={handleSave}
              className="px-6 py-2.5 rounded-xl bg-[#ff0000] hover:bg-[#d60000] text-white text-xs font-bold flex items-center gap-2 transition cursor-pointer">
              <Save className="w-4 h-4" /> {saved ? 'Saved!' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] uppercase font-bold tracking-widest text-[#a1a1a1]">{label}</label>
      <input defaultValue={value}
        className="w-full bg-black border border-white/10 rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:border-[#ff0000]/40 transition" />
    </div>
  );
}

function Toggle({ label, enabled }: { label: string; enabled: boolean }) {
  const [on, setOn] = useState(enabled);
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-white font-bold">{label}</span>
      <button onClick={() => setOn(!on)}
        className={`w-9 h-5 rounded-full transition cursor-pointer ${on ? 'bg-[#ff0000]' : 'bg-white/10'}`}>
        <div className={`w-3.5 h-3.5 rounded-full bg-white transition mt-0.5 ${on ? 'ml-[18px]' : 'ml-1'}`} />
      </button>
    </div>
  );
}

function GatewayCard({ name, enabled }: { name: string; enabled: boolean }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-black/50 border border-white/5">
      <div className="flex items-center gap-3">
        <CreditCard className="w-4 h-4 text-[#a1a1a1]" />
        <span className="text-xs font-bold text-white">{name}</span>
      </div>
      <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full ${
        enabled ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
      }`}>{enabled ? 'Active' : 'Inactive'}</span>
    </div>
  );
}
