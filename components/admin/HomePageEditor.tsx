'use client';

import { useEffect, useState } from 'react';
import { useAdminStore } from '@/lib/admin-store';
import { getSupabase } from '@/lib/supabase';
import {
  LayoutTemplate, ArrowUp, ArrowDown, Eye, EyeOff, Save,
  RefreshCw, Smartphone, Monitor, HelpCircle, Plus, Trash2
} from 'lucide-react';

interface SectionConfig {
  active: boolean;
  title?: string;
  subtitle?: string;
  slogan?: string;
  sloganHighlight?: string;
  description?: string;
}

interface HomeSettings {
  layout: string[];
  sections: Record<string, SectionConfig>;
}

const SECTION_LABELS: Record<string, { name: string; desc: string }> = {
  hero: { name: 'Hero Banner (3D Gun & Slogans)', desc: 'The top landing screen with 3D product view' },
  collections: { name: 'Featured Collections (Shop by Category)', desc: 'Grid of product categories fetched from database' },
  trending: { name: 'Trending Slider (Hot Right Now)', desc: 'Horizontal carousel of featured products' },
  feed: { name: 'Social Seen in Rutab (Seen in Rutab)', desc: 'Grid of community style and video fits' },
  footer: { name: 'Footer Information', desc: 'Bottom contact links, newsletter, and copyright' }
};

const DEFAULT_FEEDS = [
  {
    username: '@cyber_rutab',
    views: '18.4K',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600',
    videoUrl: '',
    productId: '550e8400-e29b-41d4-a716-446655440102',
    productName: 'Neo-Noir Acid Wash Hoodie',
  },
  {
    username: '@yousef_fits',
    views: '34.2K',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=600',
    videoUrl: '',
    productId: '550e8400-e29b-41d4-a716-446655440107',
    productName: 'Technical Cargo Trousers',
  },
  {
    username: '@sara.style',
    views: '11.1K',
    image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=600',
    videoUrl: '',
    productId: '550e8400-e29b-41d4-a716-446655440104',
    productName: 'Ghost-Shell Oversized Tee',
  },
  {
    username: '@gcc_dripper',
    views: '56.9K',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=600',
    videoUrl: '',
    productId: '550e8400-e29b-41d4-a716-446655440109',
    productName: 'Cyber-Luxe Strapback Cap',
  },
];

export default function HomePageEditor() {
  const setBreadcrumbs = useAdminStore((s) => s.setBreadcrumbs);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [activeSectionEdit, setActiveSectionEdit] = useState<string>('hero');

  // State matching database structure
  const [layout, setLayout] = useState<string[]>([]);
  const [sections, setSections] = useState<Record<string, SectionConfig>>({});
  const [dbProducts, setDbProducts] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Dashboard', href: '/admin/dashboard' },
      { label: 'Home Page Editor' },
    ]);
    loadSettings();
    fetchProducts();
  }, [setBreadcrumbs]);

  const fetchProducts = async () => {
    try {
      const client = getSupabase();
      const { data } = await client
        .from('products')
        .select('id, name')
        .order('name', { ascending: true });
      if (data) {
        setDbProducts(data);
      }
    } catch (err) {
      console.error('Failed to fetch products for editor:', err);
    }
  };

  const loadSettings = async () => {
    setLoading(true);
    try {
      const client = getSupabase();
      const { data, error } = await client
        .from('settings')
        .select('value')
        .eq('key', 'home_settings')
        .single();
      
      if (data && data.value) {
        const val = data.value as HomeSettings;
        setLayout(val.layout || []);
        setSections(val.sections || {});
      } else {
        // Fallback default structure
        setLayout(['hero', 'collections', 'trending', 'feed', 'footer']);
        setSections({
          hero: {
            active: true,
            title: 'رُطب',
            subtitle: 'Los Santos · Kuwait Drop',
            slogan: 'FUTURE ARAB STREETWEAR.',
            sloganHighlight: 'BOLD. FRESH STYLE. REAL COMFORT.',
            description: 'RUTAB—YOUR EVERYDAY CHOICE.'
          },
          collections: {
            active: true,
            title: 'Shop by Category',
            subtitle: 'Collections',
            description: 'Premium streetwear essentials designed for oversized silhouettes, technical wear, and bold statements.'
          },
          trending: {
            active: true,
            title: 'Trending Drops',
            subtitle: 'Hot Right Now'
          },
          feed: {
            active: true,
            title: 'Seen in Rutab',
            subtitle: 'Community Style',
            description: 'Tag @RutabStore on Instagram or TikTok for a chance to be featured and receive 10% off your next drop.'
          },
          footer: {
            active: true
          }
        });
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const nextIndex = direction === 'up' ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= layout.length) return;

    const newLayout = [...layout];
    const [movedItem] = newLayout.splice(index, 1);
    newLayout.splice(nextIndex, 0, movedItem);
    setLayout(newLayout);
  };

  const handleToggleActive = (sectionId: string) => {
    setSections(prev => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        active: !prev[sectionId]?.active
      }
    }));
  };

  const handleTextChange = (sectionId: string, field: keyof SectionConfig, value: string) => {
    setSections(prev => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const client = getSupabase();
      const payload = { layout, sections };
      const { error } = await client
        .from('settings')
        .upsert({ key: 'home_settings', value: payload }, { onConflict: 'key' });
      
      if (error) throw error;
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Save failed:', err);
      alert('Failed to save settings. Check console.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center pt-10">
        <RefreshCw className="w-8 h-8 text-[#ff0000] animate-spin mb-4" />
        <p className="text-[#a1a1a1] text-xs uppercase tracking-widest">Loading Layout Workspace...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-4 animate-fade-in-up">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-wider flex items-center gap-2">
            <LayoutTemplate className="w-7 h-7 text-[#ff0000]" />
            Home Layout Studio
          </h1>
          <p className="text-sm text-[#a1a1a1] mt-1">Reorder home page sections, toggle visibility, and customize slogan copy.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 rounded-xl bg-[#ff0000] hover:bg-[#d60000] disabled:bg-zinc-700 text-white font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition cursor-pointer shadow-[0_0_20px_rgba(255,0,0,0.2)]"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saved ? 'Settings Saved!' : 'Save Layout'}
        </button>
      </div>

      {/* Main Studio Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 items-start">
        
        {/* LEFT PANEL: Editing Controls */}
        <div className="space-y-6">
          
          {/* Section 1: Ordering & Visibility */}
          <div className="rounded-3xl bg-[#0a0a0a] border border-white/5 p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white border-b border-white/5 pb-3">
              1. Section Sequence & Visibility
            </h3>
            
            <div className="space-y-2.5">
              {layout.map((secId, index) => {
                const info = SECTION_LABELS[secId] || { name: secId, desc: '' };
                const config = sections[secId] || { active: true };
                const isFirst = index === 0;
                const isLast = index === layout.length - 1;

                return (
                  <div
                    key={secId}
                    className={`p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-4 ${
                      config.active
                        ? activeSectionEdit === secId
                          ? 'bg-[#ff0000]/5 border-[#ff0000]/30'
                          : 'bg-[#0d0d0d] border-white/5 hover:border-white/10'
                        : 'bg-[#050505] border-white/5 opacity-55'
                    }`}
                  >
                    {/* Left: Drag Handle Simulated + Info */}
                    <div className="min-w-0 flex items-center gap-3">
                      <button
                        onClick={() => handleToggleActive(secId)}
                        className={`p-2 rounded-xl transition cursor-pointer ${
                          config.active
                            ? 'bg-[#ff0000]/10 text-[#ff0000] border border-[#ff0000]/20'
                            : 'bg-white/5 text-[#a1a1a1] border border-transparent'
                        }`}
                        title={config.active ? 'Hide Section' : 'Show Section'}
                      >
                        {config.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <div className="min-w-0">
                        <span className="font-bold text-xs text-white block uppercase tracking-wide truncate">
                          {info.name}
                        </span>
                        <span className="text-[10px] text-[#a1a1a1] truncate block mt-0.5">
                          {info.desc}
                        </span>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      {/* Arrow Up */}
                      <button
                        disabled={isFirst}
                        onClick={() => handleMove(index, 'up')}
                        className="p-1.5 rounded-lg hover:bg-white/5 text-white/50 hover:text-white disabled:opacity-20 transition cursor-pointer"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      
                      {/* Arrow Down */}
                      <button
                        disabled={isLast}
                        onClick={() => handleMove(index, 'down')}
                        className="p-1.5 rounded-lg hover:bg-white/5 text-white/50 hover:text-white disabled:opacity-20 transition cursor-pointer"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>

                      {/* Customize Text Indicator */}
                      {['hero', 'collections', 'trending', 'feed'].includes(secId) && (
                        <button
                          onClick={() => setActiveSectionEdit(secId)}
                          className={`ml-2 px-3 py-1.5 rounded-lg text-[9px] uppercase tracking-wider font-black transition cursor-pointer border ${
                            activeSectionEdit === secId
                              ? 'bg-[#ff0000] text-white border-[#ff0000]'
                              : 'bg-white/5 text-white/70 border-white/5 hover:border-white/10'
                          }`}
                        >
                          Copy
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Copy Content Editing Panel */}
          {activeSectionEdit && SECTION_LABELS[activeSectionEdit] && (
            <div className="rounded-3xl bg-[#0a0a0a] border border-white/5 p-6 shadow-xl space-y-5 animate-fade-in-up">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  2. Customize Copy: <span className="text-[#ff0000]">{SECTION_LABELS[activeSectionEdit]?.name?.split(' ')[0]}</span>
                </h3>
                <span className="text-[9px] uppercase bg-white/5 text-[#a1a1a1] px-2 py-0.5 rounded-full border border-white/5 font-mono">
                  {activeSectionEdit}
                </span>
              </div>

              {/* Render Inputs dynamically depending on section editing */}
              {activeSectionEdit === 'hero' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field
                      label="Logo Arabic Heading"
                      value={sections.hero?.title || 'رُطب'}
                      onChange={(val) => handleTextChange('hero', 'title', val)}
                    />
                    <Field
                      label="Subtitle Label Tag"
                      value={sections.hero?.subtitle || 'Los Santos · Kuwait Drop'}
                      onChange={(val) => handleTextChange('hero', 'subtitle', val)}
                    />
                  </div>
                  <Field
                    label="Primary Slogan text"
                    value={sections.hero?.slogan || 'FUTURE ARAB STREETWEAR.'}
                    onChange={(val) => handleTextChange('hero', 'slogan', val)}
                  />
                  <Field
                    label="Highlighted Slogan text"
                    value={sections.hero?.sloganHighlight || 'BOLD. FRESH STYLE. REAL COMFORT.'}
                    onChange={(val) => handleTextChange('hero', 'sloganHighlight', val)}
                  />
                  <Field
                    label="Description details"
                    value={sections.hero?.description || 'RUTAB—YOUR EVERYDAY CHOICE.'}
                    onChange={(val) => handleTextChange('hero', 'description', val)}
                  />
                </div>
              )}

              {activeSectionEdit === 'collections' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field
                      label="Main Grid Title"
                      value={sections.collections?.title || 'Shop by Category'}
                      onChange={(val) => handleTextChange('collections', 'title', val)}
                    />
                    <Field
                      label="Tag Subtitle label"
                      value={sections.collections?.subtitle || 'Collections'}
                      onChange={(val) => handleTextChange('collections', 'subtitle', val)}
                    />
                  </div>
                  <Field
                    label="Paragraph Description"
                    value={sections.collections?.description || 'Premium streetwear essentials designed for oversized silhouettes, technical wear, and bold statements.'}
                    onChange={(val) => handleTextChange('collections', 'description', val)}
                  />
                </div>
              )}

              {activeSectionEdit === 'trending' && (
                <div className="space-y-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field
                    label="Heading title"
                    value={sections.trending?.title || 'Trending Drops'}
                    onChange={(val) => handleTextChange('trending', 'title', val)}
                  />
                  <Field
                    label="Category subtitle Tag"
                    value={sections.trending?.subtitle || 'Hot Right Now'}
                    onChange={(val) => handleTextChange('trending', 'subtitle', val)}
                  />
                </div>
              )}

              {activeSectionEdit === 'feed' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field
                      label="Seen in Title"
                      value={sections.feed?.title || 'Seen in Rutab'}
                      onChange={(val) => handleTextChange('feed', 'title', val)}
                    />
                    <Field
                      label="Subtitle label tag"
                      value={sections.feed?.subtitle || 'Community Style'}
                      onChange={(val) => handleTextChange('feed', 'subtitle', val)}
                    />
                  </div>
                  <Field
                    label=" Seen in Description copy"
                    value={sections.feed?.description || 'Tag @RutabStore on Instagram or TikTok for a chance to be featured and receive 10% off your next drop.'}
                    onChange={(val) => handleTextChange('feed', 'description', val)}
                  />

                  {/* Edit Feed Cards */}
                  <div className="mt-6 pt-6 border-t border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase tracking-wider text-white">Social Feed Cards (Reels)</h4>
                      <button type="button" onClick={() => {
                        const currentFeeds = (sections.feed as any)?.feeds || DEFAULT_FEEDS;
                        const newFeeds = [...currentFeeds, { username: '', views: '', image: '', videoUrl: '', productId: '', productName: '' }];
                        handleTextChange('feed', 'feeds' as any, newFeeds as any);
                      }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#ff0000] hover:bg-[#d60000] text-white text-[9px] uppercase font-bold tracking-wider transition cursor-pointer">
                        <Plus className="w-3 h-3" /> Add Card
                      </button>
                    </div>
                    {((sections.feed as any)?.feeds || DEFAULT_FEEDS).length === 0 && (
                      <p className="text-xs text-[#555] italic">No feed cards. Click &quot;Add Card&quot; to create one.</p>
                    )}
                    <div className="grid grid-cols-1 gap-4">
                      {((sections.feed as any)?.feeds || DEFAULT_FEEDS).map((feed: any, idx: number) => (
                        <div key={idx} className="p-4 rounded-2xl bg-black border border-white/10 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Card #{idx + 1}</span>
                            <button type="button" onClick={() => {
                              const currentFeeds = [...((sections.feed as any)?.feeds || DEFAULT_FEEDS)];
                              currentFeeds.splice(idx, 1);
                              handleTextChange('feed', 'feeds' as any, currentFeeds as any);
                            }}
                              className="flex items-center gap-1 text-[9px] text-red-400 hover:text-red-300 font-bold uppercase tracking-wider transition cursor-pointer">
                              <Trash2 className="w-3 h-3" /> Remove
                            </button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                            <Field
                              label="Username"
                              value={feed.username}
                              onChange={(val) => {
                                const newFeeds = [...((sections.feed as any)?.feeds || DEFAULT_FEEDS)];
                                newFeeds[idx] = { ...newFeeds[idx], username: val };
                                handleTextChange('feed', 'feeds' as any, newFeeds as any);
                              }}
                            />
                            <Field
                              label="Views Count"
                              value={feed.views}
                              onChange={(val) => {
                                const newFeeds = [...((sections.feed as any)?.feeds || DEFAULT_FEEDS)];
                                newFeeds[idx] = { ...newFeeds[idx], views: val };
                                handleTextChange('feed', 'feeds' as any, newFeeds as any);
                              }}
                            />
                            <Field
                              label="Image URL"
                              value={feed.image}
                              onChange={(val) => {
                                const newFeeds = [...((sections.feed as any)?.feeds || DEFAULT_FEEDS)];
                                newFeeds[idx] = { ...newFeeds[idx], image: val };
                                handleTextChange('feed', 'feeds' as any, newFeeds as any);
                              }}
                            />
                            <Field
                              label="Video URL"
                              value={feed.videoUrl || ''}
                              onChange={(val) => {
                                const newFeeds = [...((sections.feed as any)?.feeds || DEFAULT_FEEDS)];
                                newFeeds[idx] = { ...newFeeds[idx], videoUrl: val };
                                handleTextChange('feed', 'feeds' as any, newFeeds as any);
                              }}
                            />
                          </div>
                          
                          {/* Product Selection */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-bold tracking-widest text-[#a1a1a1]">
                              Linked Product
                            </label>
                            <select
                              value={feed.productId || ''}
                              onChange={(e) => {
                                const prodId = e.target.value;
                                const prodName = dbProducts.find(p => p.id === prodId)?.name || '';
                                const newFeeds = [...((sections.feed as any)?.feeds || DEFAULT_FEEDS)];
                                newFeeds[idx] = { ...newFeeds[idx], productId: prodId, productName: prodName };
                                handleTextChange('feed', 'feeds' as any, newFeeds as any);
                              }}
                              className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-3 px-3.5 text-xs text-white focus:outline-none focus:border-[#ff0000]/40 transition cursor-pointer"
                            >
                              <option value="">Select a product...</option>
                              {dbProducts.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT PANEL: Live Simulator Preview */}
        <div className="space-y-4 lg:sticky lg:top-24">
          <div className="flex items-center justify-between">
            <h3 className="text-xs uppercase font-bold tracking-widest text-[#a1a1a1] flex items-center gap-1.5">
              Live Preview Workspace
              <span title="Mock rendering of how visitor homepage looks"><HelpCircle className="w-3.5 h-3.5 text-[#555]" /></span>
            </h3>
            
            <div className="flex bg-[#0a0a0a] border border-white/5 p-1 rounded-xl">
              <button
                onClick={() => setPreviewDevice('desktop')}
                className={`p-2 rounded-lg transition cursor-pointer ${
                  previewDevice === 'desktop' ? 'bg-[#ff0000] text-white' : 'text-white/40 hover:text-white'
                }`}
                title="Desktop View"
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPreviewDevice('mobile')}
                className={`p-2 rounded-lg transition cursor-pointer ${
                  previewDevice === 'mobile' ? 'bg-[#ff0000] text-white' : 'text-white/40 hover:text-white'
                }`}
                title="Mobile View"
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Responsive simulator body container */}
          <div
            className={`mx-auto bg-black border border-white/10 rounded-[35px] shadow-2xl relative transition-all duration-500 overflow-hidden ${
              previewDevice === 'mobile' ? 'w-[320px] h-[550px]' : 'w-full h-[550px]'
            }`}
          >
            {/* Simulator screen viewport */}
            <div className="w-full h-full overflow-y-auto no-scrollbar p-4 space-y-6 select-none relative">
              {/* Header Navbar Simulator */}
              <div className="sticky top-0 bg-[#0a0a0a]/80 backdrop-blur border border-white/5 rounded-xl px-3 py-2 flex items-center justify-between z-10">
                <span className="text-red-600 font-black text-xs tracking-widest">RUTAB</span>
                <div className="flex items-center gap-1.5 text-[9px] text-[#a1a1a1] uppercase font-bold">
                  <span>Shop</span>
                  <span>Cart</span>
                </div>
              </div>

              {/* Dynamic Live Rendering Preview Block */}
              {layout.map((secId) => {
                const config = sections[secId] || { active: true };
                if (!config.active) return null;

                if (secId === 'hero') {
                  return (
                    <div key="preview-hero" className="p-4 bg-[#0a0a0a] border border-[#ff0000]/10 rounded-2xl space-y-2 relative overflow-hidden">
                      <div className="absolute top-2 right-2 w-16 h-16 rounded-full bg-[#ff0000]/5 blur-md" />
                      <span className="text-[7px] text-[#ff0000] uppercase tracking-[0.2em] font-black">
                        {config.subtitle || 'Los Santos · Kuwait Drop'}
                      </span>
                      <h4 className="text-xl font-black uppercase text-white font-heading">
                        {config.title || 'رُطب'}
                      </h4>
                      <p className="text-[9px] font-bold text-red-500 tracking-wide uppercase">
                        {config.slogan || 'FUTURE ARAB STREETWEAR.'}
                      </p>
                      <p className="text-[8px] text-[#a1a1a1]">
                        {config.description || 'RUTAB—YOUR EVERYDAY CHOICE.'}
                      </p>
                      <div className="flex gap-1.5 pt-1">
                        <span className="px-3 py-1 bg-red-600 text-white rounded text-[7px] uppercase font-bold">Shop Drop</span>
                        <span className="px-3 py-1 bg-white/5 border border-white/10 text-white rounded text-[7px] uppercase font-bold">Catalog</span>
                      </div>
                    </div>
                  );
                }

                if (secId === 'collections') {
                  return (
                    <div key="preview-collections" className="p-4 bg-[#0a0a0a] border border-white/5 rounded-2xl space-y-3">
                      <div className="flex justify-between items-end border-b border-white/5 pb-2">
                        <div>
                          <span className="text-[7px] text-[#ff0000] uppercase font-black tracking-widest">{config.subtitle || 'Collections'}</span>
                          <h4 className="text-sm font-bold uppercase text-white">{config.title || 'Shop by Category'}</h4>
                        </div>
                      </div>
                      <p className="text-[8px] text-[#a1a1a1] leading-relaxed">
                        {config.description || 'Premium streetwear essentials designed for oversized silhouettes.'}
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {['Arabic Poetry', 'Brand Shirts'].map((cat) => (
                          <div key={cat} className="h-20 bg-white/5 border border-white/5 rounded-xl flex flex-col justify-end p-2 relative overflow-hidden">
                            <span className="text-[9px] font-bold text-white uppercase relative z-10">{cat}</span>
                            <span className="text-[7px] text-red-500 uppercase relative z-10">Explore Drop →</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }

                if (secId === 'trending') {
                  return (
                    <div key="preview-trending" className="p-4 bg-[#0a0a0a] border border-white/5 rounded-2xl space-y-3">
                      <div className="flex justify-between items-end">
                        <div>
                          <span className="text-[7px] text-[#ff0000] uppercase font-black tracking-widest">{config.subtitle || 'Hot Right Now'}</span>
                          <h4 className="text-sm font-bold uppercase text-white">{config.title || 'Trending Drops'}</h4>
                        </div>
                      </div>
                      <div className="flex gap-2 overflow-x-hidden">
                        {[1, 2].map((i) => (
                          <div key={i} className="min-w-[110px] bg-white/5 border border-white/5 rounded-xl p-2 space-y-1">
                            <div className="h-16 bg-black border border-white/5 rounded-lg" />
                            <p className="text-[8px] font-bold uppercase truncate">STREETWEAR FIT {i}</p>
                            <p className="text-[7px] text-red-500 font-bold">12.000 KWD</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }

                if (secId === 'feed') {
                  const feedItems = (config as any).feeds || DEFAULT_FEEDS;
                  return (
                    <div key="preview-feed" className="p-4 bg-[#0a0a0a] border border-white/5 rounded-2xl space-y-2">
                      <div>
                        <span className="text-[7px] text-[#ff0000] uppercase font-black tracking-widest">{config.subtitle || 'Community Style'}</span>
                        <h4 className="text-sm font-bold uppercase text-white">{config.title || 'Seen in Rutab'}</h4>
                      </div>
                      <p className="text-[8px] text-[#a1a1a1]">
                        {config.description || 'Tag @RutabStore...'}
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {feedItems.slice(0, 2).map((f: any, i: number) => (
                          <div key={i} className="h-24 bg-white/5 border border-white/5 rounded-xl flex items-end p-2 relative overflow-hidden">
                            <span className="text-[7px] font-bold text-white relative z-10">{f.username}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }

                if (secId === 'footer') {
                  return (
                    <div key="preview-footer" className="p-4 bg-[#050505] border border-white/10 rounded-2xl text-center space-y-2 text-[#a1a1a1]">
                      <span className="text-[#ff0000] font-black text-xs tracking-widest uppercase">RUTAB</span>
                      <p className="text-[7px]">© 2026 RUTAB — GCC STREETWEAR</p>
                    </div>
                  );
                }

                return null;
              })}

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
}

function Field({ label, value, onChange }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] uppercase font-bold tracking-widest text-[#a1a1a1]">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-black border border-white/10 rounded-xl py-3 px-3.5 text-xs text-white focus:outline-none focus:border-[#ff0000]/40 transition"
      />
    </div>
  );
}
