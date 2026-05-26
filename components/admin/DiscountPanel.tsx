'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdminStore } from '@/lib/admin-store';
import { getSupabase } from '../../lib/supabase';
import {
  Percent, Plus, Search, RefreshCw, Pencil, Trash2, CheckCircle2,
  X, Save, Calendar, AlertTriangle
} from 'lucide-react';

interface Coupon {
  id: string;
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed_amount' | 'free_shipping';
  discount_value: number;
  min_order_amount: number;
  usage_limit: number;
  used_count: number;
  is_active: boolean;
  expires_at?: string;
  created_at: string;
}

export default function DiscountPanel() {
  const setBreadcrumbs = useAdminStore((s) => s.setBreadcrumbs);

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Dashboard', href: '/admin/dashboard' },
      { label: 'Discounts' },
    ]);
  }, [setBreadcrumbs]);

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);

  // Form state
  const [code, setCode] = useState('');
  const [desc, setDesc] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed_amount' | 'free_shipping'>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  // Fetch Coupons from Database
  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const client = getSupabase();
      const { data, error } = await client
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (data) {
        setCoupons(data as Coupon[]);
      }
    } catch (err) {
      console.error('Error fetching coupons from DB:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const filtered = coupons.filter((c) =>
    !search.trim() || c.code.toLowerCase().includes(search.toLowerCase()) || c.description?.toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () => {
    setCode(''); setDesc(''); setDiscountType('percentage'); setDiscountValue('');
    setMinAmount(''); setUsageLimit(''); setExpiresAt(''); setEditing(null); setShowForm(false);
  };

  const handleEdit = (c: Coupon) => {
    setEditing(c); setCode(c.code); setDesc(c.description || '');
    setDiscountType(c.discount_type); setDiscountValue(c.discount_value.toString());
    setMinAmount(c.min_order_amount.toString()); setUsageLimit(c.usage_limit.toString());
    setExpiresAt(c.expires_at ? c.expires_at.split('T')[0] : ''); setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || (discountType !== 'free_shipping' && !discountValue)) return;
    
    const payload = {
      code: code.toUpperCase().trim(),
      description: desc.trim(),
      discount_type: discountType,
      discount_value: discountType === 'free_shipping' ? 0 : parseFloat(discountValue) || 0,
      min_order_amount: parseFloat(minAmount) || 0,
      usage_limit: parseInt(usageLimit) || 0,
      is_active: editing ? editing.is_active : true,
      expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
    };

    try {
      const client = getSupabase();
      if (editing) {
        const { data, error } = await client
          .from('coupons')
          .update(payload)
          .eq('id', editing.id)
          .select()
          .single();
        if (error) throw error;
        if (data) {
          setCoupons((prev) => prev.map((c) => (c.id === editing.id ? (data as Coupon) : c)));
        }
      } else {
        const { data, error } = await client
          .from('coupons')
          .insert({
            ...payload,
            used_count: 0,
          })
          .select()
          .single();
        if (error) throw error;
        if (data) {
          setCoupons((prev) => [data as Coupon, ...prev]);
        }
      }
      resetForm();
    } catch (err) {
      console.error('Error saving coupon to DB:', err);
      alert('An error occurred while saving the coupon. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    try {
      const client = getSupabase();
      const { error } = await client
        .from('coupons')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setCoupons((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error('Error deleting coupon from DB:', err);
      alert('Failed to delete coupon.');
    }
  };

  const toggleActive = async (id: string) => {
    const coupon = coupons.find((c) => c.id === id);
    if (!coupon) return;
    try {
      const client = getSupabase();
      const { error } = await client
        .from('coupons')
        .update({ is_active: !coupon.is_active })
        .eq('id', id);
      if (error) throw error;
      setCoupons((prev) =>
        prev.map((c) => (c.id === id ? { ...c, is_active: !c.is_active } : c))
      );
    } catch (err) {
      console.error('Error toggling coupon status in DB:', err);
    }
  };

  return (
    <div className="space-y-6 pt-4 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-wider">Discount Codes</h1>
        <p className="text-sm text-[#a1a1a1] mt-1">Create and manage promotional coupons.</p>
      </div>

      {/* Search + Add */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" />
          <input type="text" placeholder="Search coupons..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-[280px] bg-[#0a0a0a] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#ff0000]/40 transition" />
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }}
          className="px-5 py-2.5 rounded-xl bg-[#ff0000] hover:bg-[#d60000] text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition cursor-pointer">
          <Plus className="w-3.5 h-3.5" /> New Coupon
        </button>
      </div>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {showForm && (
          <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSave} className="overflow-hidden">
            <div className="p-6 rounded-3xl bg-[#111111] border border-white/5 space-y-5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">{editing ? 'Edit Coupon' : 'New Coupon'}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Coupon Code" value={code} onChange={setCode} placeholder="e.g. SUMMER20" required />
                <Field label="Description" value={desc} onChange={setDesc} placeholder="20% off summer collection" />
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-[#a1a1a1]">Discount Type</label>
                  <div className="flex flex-wrap gap-2">
                    {(['percentage', 'fixed_amount', 'free_shipping'] as const).map((t) => (
                      <button key={t} type="button" onClick={() => setDiscountType(t)}
                        className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition cursor-pointer ${discountType === t ? 'bg-[#ff0000] text-white' : 'bg-black border border-white/10 text-white/70 hover:border-white/30'}`}>
                        {t === 'percentage' ? '% Off' : t === 'fixed_amount' ? 'Fixed KWD' : 'Free Ship'}
                      </button>
                    ))}
                  </div>
                </div>
                <Field label={discountType === 'percentage' ? 'Discount %' : discountType === 'fixed_amount' ? 'Discount (KWD)' : 'N/A'} value={discountValue} onChange={setDiscountValue} type="number" placeholder="10" required={discountType !== 'free_shipping'} disabled={discountType === 'free_shipping'} />
                <Field label="Min Order (KWD)" value={minAmount} onChange={setMinAmount} type="number" placeholder="0" />
                <Field label="Usage Limit" value={usageLimit} onChange={setUsageLimit} type="number" placeholder="100" />
                <Field label="Expires At" value={expiresAt} onChange={setExpiresAt} type="date" />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button type="submit" className="px-6 py-2.5 bg-[#ff0000] hover:bg-[#d60000] text-white rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer">
                  <Save className="w-3.5 h-3.5" /> {editing ? 'Update Coupon' : 'Create Coupon'}
                </button>
                <button type="button" onClick={resetForm} className="px-6 py-2.5 border border-white/10 rounded-xl text-xs font-bold text-white/70 hover:text-white transition cursor-pointer">
                  Cancel
                </button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Coupon List */}
      {loading ? (
        <div className="h-[30vh] flex flex-col items-center justify-center text-[#a1a1a1]">
          <RefreshCw className="w-8 h-8 text-[#ff0000] animate-spin mb-3" />
          <p className="text-xs uppercase tracking-widest font-bold">Loading Coupons...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="h-[30vh] flex flex-col items-center justify-center text-[#a1a1a1]">
          <Percent className="w-10 h-10 mb-3 opacity-40" />
          <p className="text-xs uppercase tracking-widest font-bold">No coupons found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => (
            <div key={c.id} className="p-5 rounded-2xl bg-[#0a0a0a] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${c.is_active ? 'bg-emerald-500/10' : 'bg-zinc-500/10'}`}>
                  <Percent className={`w-4 h-4 ${c.is_active ? 'text-emerald-400' : 'text-zinc-400'}`} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-white">{c.code}</span>
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${c.is_active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'}`}>
                      {c.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#a1a1a1] truncate">{c.description}</p>
                  <div className="flex items-center gap-3 mt-1 text-[9px] text-[#555]">
                    <span>{c.discount_type === 'percentage' ? `${c.discount_value}%` : c.discount_type === 'fixed_amount' ? `${c.discount_value} KWD` : 'Free Shipping'}</span>
                    <span>{c.used_count}/{c.usage_limit || '∞'} used</span>
                    {c.expires_at && <span className="flex items-center gap-1"><Calendar className="w-2.5 h-2.5" />Exp: {new Date(c.expires_at).toLocaleDateString()}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => toggleActive(c.id)} className="w-8 h-8 rounded-lg border border-white/10 hover:border-white/30 flex items-center justify-center text-[#a1a1a1] hover:text-white transition cursor-pointer" title="Toggle active">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleEdit(c)} className="w-8 h-8 rounded-lg border border-white/10 hover:border-white/30 flex items-center justify-center text-[#a1a1a1] hover:text-white transition cursor-pointer">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDelete(c.id)} className="w-8 h-8 rounded-lg border border-white/10 hover:border-[#ff0000] flex items-center justify-center text-[#a1a1a1] hover:text-[#ff0000] transition cursor-pointer">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, ...props }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] uppercase font-bold tracking-widest text-[#a1a1a1]">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} {...props}
        className="w-full bg-black border border-white/10 rounded-xl py-2.5 px-3.5 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#ff0000]/40 transition" />
    </div>
  );
}
