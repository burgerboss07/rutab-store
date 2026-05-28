'use client';

import { useEffect, useState } from 'react';
import { useAdminStore } from '@/lib/admin-store';
import { useStore, CURRENCY_CONFIG } from '@/lib/store';
import { getSupabase } from '@/lib/supabase';
import {
  Settings, Globe, Mail, CreditCard, Search, ToggleLeft,
  Save, AlertTriangle, ImageIcon, Trash2, RefreshCw, Loader2
} from 'lucide-react';

const sections = [
  { id: 'general', label: 'General', icon: <Globe className="w-4 h-4" /> },
  { id: 'email', label: 'Email', icon: <Mail className="w-4 h-4" /> },
  { id: 'payment', label: 'Payment', icon: <CreditCard className="w-4 h-4" /> },
  { id: 'seo', label: 'SEO', icon: <Search className="w-4 h-4" /> },
  { id: 'maintenance', label: 'Maintenance', icon: <ToggleLeft className="w-4 h-4" /> },
  { id: 'danger', label: 'Danger Zone', icon: <AlertTriangle className="w-4 h-4" /> },
];

export default function SettingsPanel() {
  const setBreadcrumbs = useAdminStore((s) => s.setBreadcrumbs);
  const [activeSection, setActiveSection] = useState('general');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmReset, setConfirmReset] = useState<string | null>(null);
  const [resetting, setResetting] = useState<string | null>(null);

  const { currency, setCurrency } = useStore();

  const [gateways, setGateways] = useState<Record<string, boolean>>({
    'Cash on Delivery': true,
    'Pickup': true,
    'Wamd': true,
    'Binance': true,
    'PayPal': true,
    'Skrill': true,
    'EasyPaisa': true,
    'Meezan Bank': true
  });

  const handleExecuteReset = async (actionId: string) => {
    setResetting(actionId);
    try {
      const res = await fetch('/api/admin/reset-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: actionId === 'revenue' ? 'revenue_orders' : actionId }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Reset execution successful for action: "${actionId}"`);
      } else {
        alert(`Error executing reset: ${data.error}`);
      }
    } catch (err: any) {
      console.error(err);
      alert(`Network error executing reset: ${err.message || err}`);
    } finally {
      setResetting(null);
      setConfirmReset(null);
    }
  };

  const dangerActions = [
    { id: 'revenue', label: 'Reset All Revenue', desc: 'Clears all revenue data and financial records. Cannot be undone.', icon: <RefreshCw className="w-4 h-4" /> },
    { id: 'orders', label: 'Reset All Orders', desc: 'Permanently deletes all order history from the database.', icon: <Trash2 className="w-4 h-4" /> },
    { id: 'customers', label: 'Reset All Customers', desc: 'Removes all customer profiles and data.', icon: <Trash2 className="w-4 h-4" /> },
    { id: 'products', label: 'Reset All Products', desc: 'Deletes all products and associated inventory.', icon: <Trash2 className="w-4 h-4" /> },
    { id: 'analytics', label: 'Reset Analytics Data', desc: 'Clears all analytics, traffic, and performance data.', icon: <RefreshCw className="w-4 h-4" /> },
    { id: 'all', label: 'Full Store Reset', desc: 'Wipes ALL store data including orders, products, customers, revenue, and settings. This is irreversible.', icon: <AlertTriangle className="w-4 h-4" /> },
  ];

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Dashboard', href: '/admin/dashboard' },
      { label: 'Settings' },
    ]);

    async function loadSettings() {
      try {
        const client = getSupabase();
        const { data } = await client
          .from('settings')
          .select('value')
          .eq('key', 'payment_gateways')
          .maybeSingle();
        if (data && data.value) {
          setGateways(data.value);
        }
      } catch (e) {
        console.error('Failed to load gateways settings:', e);
      }
    }
    loadSettings();
  }, [setBreadcrumbs]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const client = getSupabase();
      const { error } = await client
        .from('settings')
        .upsert({ key: 'payment_gateways', value: gateways }, { onConflict: 'key' });
      if (error) throw error;
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save settings:', err);
      alert('Failed to save settings to the database.');
    } finally {
      setSaving(false);
    }
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
                activeSection === sec.id
                  ? sec.id === 'danger' ? 'bg-red-600 text-white' : 'bg-[#ff0000] text-white'
                  : sec.id === 'danger' ? 'bg-red-900/20 text-red-400 hover:bg-red-900/30 border border-red-900/40' : 'bg-white/5 text-white/70 hover:bg-white/10'
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
                <Field label="Store Name" value="RUTAB رطب" />
                <Field label="Default Language" value="English" />
                <Field label="Timezone" value="Asia/Kuwait (UTC+3)" />
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-[#a1a1a1]">Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:border-[#ff0000]/40 transition cursor-pointer"
                  >
                    {Object.keys(CURRENCY_CONFIG).map((c) => (
                      <option key={c} value={c} className="bg-[#0a0a0a]">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
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
                {Object.entries(gateways).map(([name, enabled]) => (
                  <GatewayCard
                    key={name}
                    name={name}
                    enabled={enabled}
                    onToggle={() => {
                      setGateways((prev) => ({
                        ...prev,
                        [name]: !prev[name],
                      }));
                    }}
                  />
                ))}
              </div>
            </>
          )}

          {activeSection === 'seo' && (
            <>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">SEO & Analytics</h3>
              <div className="grid grid-cols-1 gap-4">
                <Field label="Default Meta Title" value="RUTAB رطب — Luxury Streetwear Kuwait" />
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

          {activeSection === 'danger' && (
            <>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-red-900/20 border border-red-500/30">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                <p className="text-xs text-red-300">Actions in this zone are <strong>irreversible</strong>. Data will be permanently deleted and cannot be recovered. Proceed with extreme caution.</p>
              </div>
              <div className="space-y-3">
                {dangerActions.map((action) => (
                  <div key={action.id} className="flex items-center justify-between p-4 rounded-xl bg-black/40 border border-red-900/30">
                    <div className="flex-1 min-w-0 mr-4">
                      <p className="text-sm font-bold text-white">{action.label}</p>
                      <p className="text-[10px] text-[#a1a1a1] mt-0.5">{action.desc}</p>
                    </div>
                    {confirmReset === action.id ? (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => setConfirmReset(null)}
                          className="px-3 py-1.5 rounded-lg border border-white/10 text-white/70 text-[9px] font-bold uppercase tracking-wider transition cursor-pointer hover:bg-white/5">
                          Cancel
                        </button>
                        <button
                          disabled={resetting !== null}
                          onClick={() => handleExecuteReset(action.id)}
                          className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[9px] font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1 disabled:opacity-50">
                          {resetting === action.id ? (
                            <>
                              <RefreshCw className="w-3 h-3 animate-spin" /> Resetting...
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="w-3 h-3" /> Confirm Reset
                            </>
                          )}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmReset(action.id)}
                        className={`px-4 py-1.5 rounded-lg border text-[9px] font-bold uppercase tracking-wider transition cursor-pointer shrink-0 ${
                          action.id === 'all' ? 'bg-red-900/40 border-red-500/50 text-red-400 hover:bg-red-900/60' : 'bg-transparent border-red-900/50 text-red-400 hover:bg-red-900/20'
                        }`}>
                        {action.icon && <span className="inline-flex mr-1.5">{action.icon}</span>}
                        Reset
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {activeSection !== 'danger' && (
          <div className="flex items-center gap-3 pt-4 border-t border-white/5">
            <button onClick={handleSave} disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-[#ff0000] hover:bg-[#d60000] text-white text-xs font-bold flex items-center gap-2 transition cursor-pointer disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saved ? 'Saved!' : saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
          )}
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

function GatewayCard({ name, enabled, onToggle }: { name: string; enabled: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-black/50 border border-white/5">
      <div className="flex items-center gap-3">
        <CreditCard className="w-4 h-4 text-[#a1a1a1]" />
        <span className="text-xs font-bold text-white">{name}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full ${
          enabled ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
        }`}>{enabled ? 'Active' : 'Inactive'}</span>
        <button
          onClick={onToggle}
          className={`w-9 h-5 rounded-full transition cursor-pointer relative shrink-0 ${enabled ? 'bg-[#ff0000]' : 'bg-white/10'}`}
        >
          <div className={`w-3.5 h-3.5 rounded-full bg-white transition absolute top-[3px] ${enabled ? 'left-[18px]' : 'left-1'}`} />
        </button>
      </div>
    </div>
  );
}
