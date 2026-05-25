'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdminStore } from '@/lib/admin-store';
import {
  Image, Plus, Trash2, Pencil, GripVertical, Eye, EyeOff,
  Save, X, ArrowUp, ArrowDown
} from 'lucide-react';

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image_url: string;
  mobile_image_url: string;
  cta_text: string;
  cta_link: string;
  is_active: boolean;
  sort_order: number;
}

const mockBanners: Banner[] = [
  { id: '1', title: 'New Collection Drop', subtitle: 'Summer 2026 — Kuwait Exclusive', image_url: '/max_payne_bg.png', mobile_image_url: '', cta_text: 'Shop Now', cta_link: '/shop', is_active: true, sort_order: 1 },
  { id: '2', title: 'Ramadan Sale', subtitle: 'Up to 30% off selected items', image_url: '/max_payne_bg.png', mobile_image_url: '', cta_text: 'Explore', cta_link: '/shop?sale=ramadan', is_active: true, sort_order: 2 },
];

export default function BannerPanel() {
  const setBreadcrumbs = useAdminStore((s) => s.setBreadcrumbs);

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Dashboard', href: '/admin/dashboard' },
      { label: 'Banners' },
    ]);
  }, [setBreadcrumbs]);

  const [banners, setBanners] = useState<Banner[]>(mockBanners);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [ctaLink, setCtaLink] = useState('');

  const resetForm = () => {
    setTitle(''); setSubtitle(''); setImageUrl('');
    setCtaText(''); setCtaLink(''); setEditing(null); setShowForm(false);
  };

  const handleEdit = (b: Banner) => {
    setEditing(b); setTitle(b.title); setSubtitle(b.subtitle || '');
    setImageUrl(b.image_url); setCtaText(b.cta_text || ''); setCtaLink(b.cta_link || '');
    setShowForm(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !imageUrl) return;
    const payload: Banner = {
      id: editing?.id || Date.now().toString(),
      title, subtitle, image_url: imageUrl, mobile_image_url: '',
      cta_text: ctaText, cta_link: ctaLink,
      is_active: editing?.is_active ?? true,
      sort_order: editing?.sort_order ?? banners.length + 1,
    };
    if (editing) {
      setBanners((prev) => prev.map((b) => (b.id === editing.id ? payload : b)));
    } else {
      setBanners((prev) => [...prev, payload]);
    }
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this banner?')) return;
    setBanners((prev) => prev.filter((b) => b.id !== id));
  };

  const toggleActive = (id: string) => {
    setBanners((prev) => prev.map((b) => b.id === id ? { ...b, is_active: !b.is_active } : b));
  };

  const moveBanner = (id: string, dir: 'up' | 'down') => {
    setBanners((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      if (idx === -1) return prev;
      const newIdx = dir === 'up' ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const arr = [...prev];
      [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
      return arr.map((b, i) => ({ ...b, sort_order: i + 1 }));
    });
  };

  const activeBanners = banners.filter((b) => b.is_active).length;

  return (
    <div className="space-y-6 pt-4 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-wider">Banner Management</h1>
        <p className="text-sm text-[#a1a1a1] mt-1">{activeBanners} of {banners.length} banners active on the homepage.</p>
      </div>

      <div className="flex justify-end">
        <button onClick={() => { resetForm(); setShowForm(true); }}
          className="px-5 py-2.5 rounded-xl bg-[#ff0000] hover:bg-[#d60000] text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition cursor-pointer">
          <Plus className="w-3.5 h-3.5" /> Add Banner
        </button>
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSave} className="overflow-hidden">
            <div className="p-6 rounded-3xl bg-[#111111] border border-white/5 space-y-5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">{editing ? 'Edit Banner' : 'New Banner'}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Title" value={title} onChange={setTitle} placeholder="New Collection" required />
                <Field label="Subtitle" value={subtitle} onChange={setSubtitle} placeholder="Summer 2026" />
                <div className="sm:col-span-2">
                  <Field label="Image URL" value={imageUrl} onChange={setImageUrl} placeholder="https://..." required />
                </div>
                <Field label="CTA Text" value={ctaText} onChange={setCtaText} placeholder="Shop Now" />
                <Field label="CTA Link" value={ctaLink} onChange={setCtaLink} placeholder="/shop" />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button type="submit" className="px-6 py-2.5 bg-[#ff0000] hover:bg-[#d60000] text-white rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer">
                  <Save className="w-3.5 h-3.5" /> {editing ? 'Update' : 'Create'}
                </button>
                <button type="button" onClick={resetForm} className="px-6 py-2.5 border border-white/10 rounded-xl text-xs font-bold text-white/70 hover:text-white transition cursor-pointer">
                  Cancel
                </button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Banner List */}
      <div className="space-y-4">
        {banners.length === 0 ? (
          <div className="h-[30vh] flex flex-col items-center justify-center text-[#a1a1a1]">
            <Image className="w-10 h-10 mb-3 opacity-40" />
            <p className="text-xs uppercase tracking-widest font-bold">No banners yet</p>
          </div>
        ) : (
          banners.sort((a, b) => a.sort_order - b.sort_order).map((b, i) => (
            <div key={b.id} className={`p-4 rounded-2xl border flex items-start gap-4 ${b.is_active ? 'bg-[#0a0a0a] border-white/5' : 'bg-[#050505] border-white/5 opacity-60'}`}>
              {/* Preview */}
              <div className="w-32 h-20 rounded-xl bg-black border border-white/10 overflow-hidden relative shrink-0 hidden sm:block">
                <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-black flex items-center justify-center text-[8px] text-[#555] uppercase font-bold">
                  Banner
                </div>
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white">{b.title}</h4>
                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${b.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-500/10 text-zinc-400'}`}>
                    {b.is_active ? 'Active' : 'Draft'}
                  </span>
                </div>
                {b.subtitle && <p className="text-[10px] text-[#a1a1a1]">{b.subtitle}</p>}
                <div className="flex items-center gap-3 text-[9px] text-[#555]">
                  <span>Order: #{b.sort_order}</span>
                  {b.cta_text && <span>CTA: {b.cta_text}</span>}
                  {b.cta_link && <span>→ {b.cta_link}</span>}
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => moveBanner(b.id, 'up')} disabled={i === 0}
                  className="w-7 h-7 rounded-lg border border-white/10 disabled:opacity-20 flex items-center justify-center text-[#a1a1a1] hover:text-white transition cursor-pointer">
                  <ArrowUp className="w-3 h-3" />
                </button>
                <button onClick={() => moveBanner(b.id, 'down')} disabled={i === banners.length - 1}
                  className="w-7 h-7 rounded-lg border border-white/10 disabled:opacity-20 flex items-center justify-center text-[#a1a1a1] hover:text-white transition cursor-pointer">
                  <ArrowDown className="w-3 h-3" />
                </button>
                <button onClick={() => toggleActive(b.id)} className="w-7 h-7 rounded-lg border border-white/10 flex items-center justify-center text-[#a1a1a1] hover:text-white transition cursor-pointer">
                  {b.is_active ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </button>
                <button onClick={() => handleEdit(b)} className="w-7 h-7 rounded-lg border border-white/10 flex items-center justify-center text-[#a1a1a1] hover:text-white transition cursor-pointer">
                  <Pencil className="w-3 h-3" />
                </button>
                <button onClick={() => handleDelete(b.id)} className="w-7 h-7 rounded-lg border border-white/10 hover:border-[#ff0000] flex items-center justify-center text-[#a1a1a1] hover:text-[#ff0000] transition cursor-pointer">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
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
