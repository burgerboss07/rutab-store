'use client';

import { useEffect, useState } from 'react';
import { useAdminStore } from '@/lib/admin-store';
import { useStore, CURRENCY_CONFIG } from '@/lib/store';
import { getSupabase } from '@/lib/supabase';
import {
  Settings, Globe, Mail, CreditCard, Search, Truck, Ruler,
  Save, AlertTriangle, ImageIcon, Trash2, RefreshCw, Loader2, Plus, X, ChevronDown
} from 'lucide-react';

const sections = [
  { id: 'general', label: 'General', icon: <Globe className="w-4 h-4" /> },
  { id: 'email', label: 'Email', icon: <Mail className="w-4 h-4" /> },
  { id: 'payment', label: 'Payment', icon: <CreditCard className="w-4 h-4" /> },
  { id: 'seo', label: 'SEO', icon: <Search className="w-4 h-4" /> },

  { id: 'shipping', label: 'Shipping', icon: <Truck className="w-4 h-4" /> },
  { id: 'sizing', label: 'Sizing Chart', icon: <Ruler className="w-4 h-4" /> },
  { id: 'fabric', label: 'Fabric & Materials', icon: <span className="text-xs font-bold w-4 h-4 flex items-center justify-center">F</span> },
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

  interface GatewayConfig {
    enabled: boolean;
    details: string;
    image?: string;
  }

  const defaultGateways: Record<string, GatewayConfig> = {
    'Cash on Delivery': { enabled: true, details: '' },
    'Pickup': { enabled: true, details: '' },
    'Wamd': { enabled: true, details: '' },
    'Binance': { enabled: true, details: '' },
    'PayPal': { enabled: true, details: '' },
    'Skrill': { enabled: true, details: '' },
    'EasyPaisa': { enabled: true, details: '' },
    'Meezan Bank': { enabled: true, details: '' },
  };

  const [gateways, setGateways] = useState<Record<string, GatewayConfig>>(defaultGateways);
  const [newGatewayName, setNewGatewayName] = useState('');
  const [expandedGateway, setExpandedGateway] = useState<string | null>(null);

  const [storeName, setStoreName] = useState('RUTAB رطب');
  const [defaultLang, setDefaultLang] = useState('English');
  const [timezone, setTimezone] = useState('Asia/Kuwait (UTC+3)');
  const [metaTitle, setMetaTitle] = useState('RUTAB رطب — Luxury Streetwear Kuwait');
  const [metaDesc, setMetaDesc] = useState('Premium streetwear for the GCC...');
  const [storeLogo, setStoreLogo] = useState('');
  const [smtpHost, setSmtpHost] = useState('smtp.sendgrid.net');
  const [smtpPort, setSmtpPort] = useState('587');
  const [fromName, setFromName] = useState('RUTAB Store');
  const [fromEmail, setFromEmail] = useState('noreply@rutab.store');
  const [shippingPolicy, setShippingPolicy] = useState('• **Kuwait**: Same day or next day delivery (Free of charge)\n• **GCC Countries**: 2-3 business days via DHL/SMSA (5 KWD)');
  const [returnPolicy, setReturnPolicy] = useState('• Free 14-day local returns in original unworn state');
  const [socialTitle, setSocialTitle] = useState('Seen in Rutab');
  const [socialSubtitle, setSocialSubtitle] = useState('Community Style');
  const [socialDesc, setSocialDesc] = useState('Tag @RutabStore on Instagram or TikTok for a chance to be featured and receive 10% off your next drop.');

  // Sizing chart state
  const defaultSizingRows = [
    { size: 'S', chest: '118', length: '68', sleeve: '59' },
    { size: 'M', chest: '124', length: '71', sleeve: '61' },
    { size: 'L', chest: '130', length: '74', sleeve: '63' },
    { size: 'XL', chest: '136', length: '77', sleeve: '65' },
  ];
  const [sizingRows, setSizingRows] = useState(defaultSizingRows);
  const [sizingNote, setSizingNote] = useState('* Note: All garments are designed for a relaxed, oversized drape. If you prefer a closer, traditional fit, we recommend ordering one size down.');

  // Fabric & materials state
  const defaultFabricCare = [
    '100% Premium Combed Cotton Loopback',
    'Heavyweight build (Hoodies: 450GSM, T-Shirts: 300GSM)',
    'Pre-shrunk fabric to preserve structural fitting',
    'Screen-printed matte silicone graphics',
  ];
  const [fabricCare, setFabricCare] = useState(defaultFabricCare);

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
        localStorage.removeItem('rutab-store-storage');
        alert(`Reset successful for "${actionId}". Reloading...`);
        window.location.reload();
      } else {
        alert(`Reset failed: ${data.error}`);
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
          const val = data.value;
          // Handle old format (Record<string, boolean>) migration
          const first = Object.values(val)[0];
          if (typeof first === 'boolean') {
            const migrated: Record<string, GatewayConfig> = {};
            for (const [k, v] of Object.entries(val)) {
              migrated[k] = { enabled: v as boolean, details: '' };
            }
            setGateways(migrated);
          } else {
            setGateways(val);
          }
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
      const allSettings = {
        store_name: storeName,
        default_language: defaultLang,
        timezone,
        meta_title: metaTitle,
        meta_description: metaDesc,
        store_logo: storeLogo,
        smtp_host: smtpHost,
        smtp_port: smtpPort,
        from_name: fromName,
        from_email: fromEmail,
        payment_gateways: gateways,
        shipping_policy: shippingPolicy,
        return_policy: returnPolicy,

        fabric_care: fabricCare,

        sizing_chart: {
          rows: sizingRows,
          note: sizingNote,
        },
      };
      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: 'settings',
          action: 'upsert',
          data: { key: 'store_settings', value: allSettings },
          onConflict: 'key',
        }),
      });
      if (!res.ok) throw new Error((await res.json())?.error || 'Save failed');
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save settings:', err);
      alert('Failed to save settings to the database.');
    } finally {
      setSaving(false);
    }
  };

  // Load saved settings on mount
  useEffect(() => {
    async function loadAllSettings() {
      try {
        const client = getSupabase();
        const { data } = await client
          .from('settings')
          .select('value')
          .eq('key', 'store_settings')
          .maybeSingle();
        if (data?.value) {
          const v = data.value;
          if (v.store_name) setStoreName(v.store_name);
          if (v.default_language) setDefaultLang(v.default_language);
          if (v.timezone) setTimezone(v.timezone);
          if (v.meta_title) setMetaTitle(v.meta_title);
          if (v.meta_description) setMetaDesc(v.meta_description);
          if (v.store_logo) setStoreLogo(v.store_logo);
          if (v.smtp_host) setSmtpHost(v.smtp_host);
          if (v.smtp_port) setSmtpPort(v.smtp_port);
          if (v.from_name) setFromName(v.from_name);
          if (v.from_email) setFromEmail(v.from_email);
          if (v.payment_gateways) {
            const pg = v.payment_gateways;
            const first = Object.values(pg)[0] as any;
            if (typeof first === 'boolean') {
              const migrated: Record<string, GatewayConfig> = {};
              for (const [k, val] of Object.entries(pg)) {
                migrated[k] = { enabled: val as boolean, details: '' };
              }
              setGateways(migrated);
            } else {
              setGateways(pg);
            }
          }
          if (v.shipping_policy) setShippingPolicy(v.shipping_policy);
          if (v.return_policy) setReturnPolicy(v.return_policy);

          if (v.fabric_care) setFabricCare(v.fabric_care);

          if (v.sizing_chart) {
            const sc = v.sizing_chart;
            if (sc.rows) setSizingRows(sc.rows);
            if (sc.note) setSizingNote(sc.note);
          }
        }
      } catch (e) {
        console.error('Failed to load settings:', e);
      }
    }
    loadAllSettings();
  }, []);

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
                <Field label="Store Name" value={storeName} onChange={setStoreName} />
                <Field label="Default Language" value={defaultLang} onChange={setDefaultLang} />
                <Field label="Timezone" value={timezone} onChange={setTimezone} />
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
                <label className="text-[10px] uppercase font-bold tracking-widest text-[#a1a1a1]">Favicon</label>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-black border border-white/10 flex items-center justify-center text-white/30 overflow-hidden shrink-0">
                    {storeLogo ? (
                      <img src={storeLogo} alt="favicon" className="w-full h-full object-contain" />
                    ) : (
                      <ImageIcon className="w-5 h-5" />
                    )}
                  </div>
                  <input type="file" accept="image/*" id="favicon-upload" className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const client = getSupabase();
                      const path = `logos/${Date.now()}-${file.name}`;
                      const { error: uploadErr } = await client.storage.from('public').upload(path, file);
                      if (uploadErr) { alert('Upload failed: ' + uploadErr.message); return; }
                      const { data: urlData } = client.storage.from('public').getPublicUrl(path);
                      setStoreLogo(urlData.publicUrl);
                    }} />
                  <label htmlFor="favicon-upload" className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-[9px] font-bold uppercase tracking-wider text-white hover:bg-white/10 transition cursor-pointer whitespace-nowrap">
                    Upload
                  </label>
                  {storeLogo && (
                    <button onClick={() => setStoreLogo('')} className="text-[9px] text-red-400 hover:text-red-300 font-bold uppercase tracking-wider cursor-pointer whitespace-nowrap">
                      Remove
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input value={storeLogo} onChange={(e) => setStoreLogo(e.target.value)}
                    placeholder="Or paste favicon image URL..."
                    className="flex-1 bg-black border border-white/10 rounded-lg py-1.5 px-2.5 text-[11px] text-white placeholder:text-[#555] focus:outline-none focus:border-[#ff0000]/40 transition" />
                </div>
                <p className="text-[9px] text-[#555]">Upload a PNG or SVG, or paste a URL. Recommended size: 512×512. Used as site favicon.</p>
              </div>
            </>
          )}

          {activeSection === 'email' && (
            <>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Email Configuration</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="SMTP Host" value={smtpHost} onChange={setSmtpHost} />
                <Field label="SMTP Port" value={smtpPort} onChange={setSmtpPort} />
                <Field label="From Name" value={fromName} onChange={setFromName} />
                <Field label="From Email" value={fromEmail} onChange={setFromEmail} />
              </div>
            </>
          )}

          {activeSection === 'payment' && (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Payment Gateways</h3>
              </div>
              <div className="space-y-3">
                {Object.entries(gateways).map(([name, config]) => (
                  <GatewayCard
                    key={name}
                    name={name}
                    config={config}
                    isExpanded={expandedGateway === name}
                    onToggleExpand={() => setExpandedGateway(expandedGateway === name ? null : name)}
                    onToggle={() => {
                      setGateways((prev) => ({
                        ...prev,
                        [name]: { ...prev[name], enabled: !prev[name].enabled },
                      }));
                    }}
                    onUpdate={(field, value) => {
                      setGateways((prev) => ({
                        ...prev,
                        [name]: { ...prev[name], [field]: value },
                      }));
                    }}
                    onRemove={() => {
                      const next = { ...gateways };
                      delete next[name];
                      setGateways(next);
                    }}
                  />
                ))}
              </div>
              {/* Add new gateway */}
              <div className="flex items-center gap-2 pt-2">
                <input value={newGatewayName} onChange={(e) => setNewGatewayName(e.target.value)}
                  placeholder="New gateway name..."
                  className="flex-1 bg-black border border-white/10 rounded-xl py-2 px-3.5 text-xs text-white placeholder:text-[#555] focus:outline-none focus:border-[#ff0000]/40 transition" />
                <button onClick={() => {
                  const trimmed = newGatewayName.trim();
                  if (!trimmed || gateways[trimmed]) return;
                  setGateways((prev) => ({ ...prev, [trimmed]: { enabled: true, details: '' } }));
                  setNewGatewayName('');
                }}
                  className="px-4 py-2 rounded-xl bg-[#ff0000] hover:bg-[#d60000] text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer">
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
            </>
          )}

          {activeSection === 'seo' && (
            <>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">SEO & Analytics</h3>
              <div className="grid grid-cols-1 gap-4">
                <Field label="Default Meta Title" value={metaTitle} onChange={setMetaTitle} />
                <Field label="Default Meta Description" value={metaDesc} onChange={setMetaDesc} />
              </div>
            </>
          )}

          {activeSection === 'shipping' && (
            <>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Shipping &amp; Returns</h3>
              <p className="text-[10px] text-[#a1a1a1] -mt-4">These appear in the product detail page accordion.</p>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-[#a1a1a1]">Shipping Policy</label>
                  <textarea value={shippingPolicy} onChange={(e) => setShippingPolicy(e.target.value)}
                    rows={4} placeholder="Enter shipping policy details..."
                    className="w-full bg-black border border-white/10 rounded-xl py-2.5 px-3.5 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#ff0000]/40 transition resize-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-[#a1a1a1]">Return Policy</label>
                  <textarea value={returnPolicy} onChange={(e) => setReturnPolicy(e.target.value)}
                    rows={3} placeholder="Enter return policy details..."
                    className="w-full bg-black border border-white/10 rounded-xl py-2.5 px-3.5 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#ff0000]/40 transition resize-none" />
                </div>
              </div>
            </>
          )}

          {activeSection === 'sizing' && (
            <>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Streetwear Sizing Chart</h3>
              <p className="text-[10px] text-[#a1a1a1] -mt-4">Edits the sizing guide modal in the product detail page.</p>

              <div className="space-y-4">
                {sizingRows.map((row, idx) => (
                  <div key={idx} className="flex items-center gap-2 flex-wrap">
                    <input value={row.size} onChange={(e) => {
                      const arr = [...sizingRows]; arr[idx] = { ...arr[idx], size: e.target.value }; setSizingRows(arr);
                    }} placeholder="Size" className="w-16 bg-black border border-white/10 rounded-lg py-2 px-2.5 text-xs text-white placeholder:text-[#555] focus:outline-none focus:border-[#ff0000]/40 transition" />
                    <input value={row.chest} onChange={(e) => {
                      const arr = [...sizingRows]; arr[idx] = { ...arr[idx], chest: e.target.value }; setSizingRows(arr);
                    }} placeholder="Chest" className="w-24 bg-black border border-white/10 rounded-lg py-2 px-2.5 text-xs text-white placeholder:text-[#555] focus:outline-none focus:border-[#ff0000]/40 transition" />
                    <input value={row.length} onChange={(e) => {
                      const arr = [...sizingRows]; arr[idx] = { ...arr[idx], length: e.target.value }; setSizingRows(arr);
                    }} placeholder="Length" className="w-24 bg-black border border-white/10 rounded-lg py-2 px-2.5 text-xs text-white placeholder:text-[#555] focus:outline-none focus:border-[#ff0000]/40 transition" />
                    <input value={row.sleeve} onChange={(e) => {
                      const arr = [...sizingRows]; arr[idx] = { ...arr[idx], sleeve: e.target.value }; setSizingRows(arr);
                    }} placeholder="Sleeve" className="w-24 bg-black border border-white/10 rounded-lg py-2 px-2.5 text-xs text-white placeholder:text-[#555] focus:outline-none focus:border-[#ff0000]/40 transition" />
                    <button onClick={() => setSizingRows(sizingRows.filter((_, i) => i !== idx))}
                      className="text-red-400 hover:text-red-300 cursor-pointer"><X className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
                <button onClick={() => setSizingRows([...sizingRows, { size: '', chest: '', length: '', sleeve: '' }])}
                  className="text-[10px] font-bold uppercase tracking-widest text-[#ff0000] hover:text-white transition cursor-pointer">+ Add Row</button>
              </div>

              <div className="space-y-1.5 pt-4 border-t border-white/5">
                <label className="text-[10px] uppercase font-bold tracking-widest text-[#a1a1a1]">Sizing Note</label>
                <textarea value={sizingNote} onChange={(e) => setSizingNote(e.target.value)}
                  rows={3} className="w-full bg-black border border-white/10 rounded-xl py-2.5 px-3.5 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#ff0000]/40 transition resize-none" />
              </div>
            </>
          )}

          {activeSection === 'fabric' && (
            <>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Fabric & Materials</h3>
              <p className="text-[10px] text-[#a1a1a1] -mt-4">Edit the fabric & materials info shown in the product detail accordion.</p>

              <div className="space-y-2">
                {fabricCare.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-[#ff0000] text-xs">•</span>
                    <input value={item} onChange={(e) => {
                      const arr = [...fabricCare]; arr[idx] = e.target.value; setFabricCare(arr);
                    }} placeholder="e.g. 100% Premium Combed Cotton"
                      className="flex-1 bg-black border border-white/10 rounded-lg py-2 px-3 text-xs text-white placeholder:text-[#555] focus:outline-none focus:border-[#ff0000]/40 transition" />
                    <button onClick={() => setFabricCare(fabricCare.filter((_, i) => i !== idx))}
                      className="text-red-400 hover:text-red-300 cursor-pointer"><X className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
                <button onClick={() => setFabricCare([...fabricCare, ''])}
                  className="text-[10px] font-bold uppercase tracking-widest text-[#ff0000] hover:text-white transition cursor-pointer">+ Add Item</button>
              </div>
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

function Field({ label, value, onChange }: { label: string; value: string; onChange?: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] uppercase font-bold tracking-widest text-[#a1a1a1]">{label}</label>
      <input value={value} onChange={(e) => onChange?.(e.target.value)}
        className="w-full bg-black border border-white/10 rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:border-[#ff0000]/40 transition" />
    </div>
  );
}

function GatewayCard({ name, config, isExpanded, onToggleExpand, onToggle, onUpdate, onRemove }: {
  name: string; config: { enabled: boolean; details: string; image?: string };
  isExpanded: boolean; onToggleExpand: () => void; onToggle: () => void;
  onUpdate: (field: string, value: string) => void; onRemove: () => void;
}) {
  const [imgError, setImgError] = useState(false);
  return (
    <div className="rounded-xl bg-black/50 border border-white/5 overflow-hidden">
      <div className="flex items-center justify-between p-4">
        <button onClick={onToggleExpand} className="flex items-center gap-3 flex-1 text-left cursor-pointer">
          {config.image && !imgError ? (
            <img src={config.image} alt={name} className="w-6 h-6 object-contain rounded"
              onError={() => setImgError(true)} />
          ) : (
            <CreditCard className="w-4 h-4 text-[#a1a1a1]" />
          )}
          <span className="text-xs font-bold text-white">{name}</span>
        </button>
        <div className="flex items-center gap-3">
          <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full ${
            config.enabled ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
          }`}>{config.enabled ? 'Active' : 'Inactive'}</span>
          <button onClick={onToggle}
            className={`w-9 h-5 rounded-full transition cursor-pointer relative shrink-0 ${config.enabled ? 'bg-[#ff0000]' : 'bg-white/10'}`}>
            <div className={`w-3.5 h-3.5 rounded-full bg-white transition absolute top-[3px] ${config.enabled ? 'left-[18px]' : 'left-1'}`} />
          </button>
          <button onClick={onToggleExpand} className="cursor-pointer text-[#a1a1a1] hover:text-white transition">
            <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
          <button onClick={onRemove} className="cursor-pointer text-[#a1a1a1] hover:text-red-400 transition">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      {isExpanded && (
        <div className="px-4 pb-4 pt-0 space-y-2 border-t border-white/5">
          <div className="pt-3 space-y-3">
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold tracking-widest text-[#a1a1a1]">Image URL (logo/icon)</label>
              <input value={config.image || ''} onChange={(e) => { setImgError(false); onUpdate('image', e.target.value); }}
                placeholder="https://example.com/logo.png"
                className="w-full bg-black border border-white/10 rounded-lg py-2 px-3 text-[11px] text-white placeholder:text-[#555] focus:outline-none focus:border-[#ff0000]/40 transition" />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold tracking-widest text-[#a1a1a1]">Account Details</label>
              <input value={config.details} onChange={(e) => onUpdate('details', e.target.value)}
                placeholder="Gateway details (account email, wallet address, etc.)"
                className="w-full bg-black border border-white/10 rounded-lg py-2 px-3 text-[11px] text-white placeholder:text-[#555] focus:outline-none focus:border-[#ff0000]/40 transition" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
