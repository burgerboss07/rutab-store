'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSupabase } from '@/lib/supabase';
import { Product, Order, useStore } from '@/lib/store';
import { useAdminStore, Catalog } from '@/lib/admin-store';
import Image from 'next/image';
import DataTable from './ui/DataTable';
import {
  Package, Search, Download, RefreshCw, CheckCircle2,
  ShoppingBag, Plus, Pencil, Trash2, Save, X, ChevronDown, ChevronUp,
  AlertTriangle, Edit
} from 'lucide-react';

function formatKWD(v: number) { return `${v.toFixed(3)} KWD`; }
function uid() { return Math.random().toString(36).slice(2, 10); }

interface ProductFormData {
  name: string; sku: string; price: string; stock: string;
  image_url: string; is_featured: boolean;
  catalog: string; subCatalog: string;
  sizes: string[]; colors: string[];
  images: string[];
  stockPerSize: Record<string, string>;
}

const emptyForm: ProductFormData = {
  name: '', sku: '', price: '', stock: '0',
  image_url: '/placeholder.svg', is_featured: false,
  catalog: '', subCatalog: '',
  sizes: [], colors: [],
  images: [],
  stockPerSize: {},
};

interface BulkEditFormData {
  price: string;
}

const emptyBulkForm: BulkEditFormData = {
  price: '',
};
const orderStatuses = ['pending', 'shipped', 'delivered', 'cancelled', 'refunded'];

export default function ContentPanel() {
  const setBreadcrumbs = useAdminStore((s) => s.setBreadcrumbs);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'products' | 'orders'>('products');
  const [search, setSearch] = useState('');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [bulkEditForm, setBulkEditForm] = useState<BulkEditFormData>(emptyBulkForm);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormData>(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [orderStatusEdit, setOrderStatusEdit] = useState('');

  const [catalogsState, setCatalogsState] = useState<Catalog[]>([]);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [categoryImagePreview, setCategoryImagePreview] = useState('/placeholder.svg');
  const [subCatalogName, setSubCatalogName] = useState('');
  const [subCatalogDesc, setSubCatalogDesc] = useState('');
  const [selectedCategoryForSub, setSelectedCategoryForSub] = useState('');
  const [sizeEntry, setSizeEntry] = useState('');
  const [colorEntry, setColorEntry] = useState('#000000');
  const [colorLabelEntry, setColorLabelEntry] = useState('');
  const [productImageFile, setProductImageFile] = useState<File | null>(null);
  const [secondaryImageEntry, setSecondaryImageEntry] = useState('');

  // Premium color swatches for quick selection
  const PRESET_COLORS = [
    { name: 'Black', hex: '#0a0a0a' },
    { name: 'White', hex: '#ffffff' },
    { name: 'Charcoal', hex: '#374151' },
    { name: 'Grey', hex: '#6b7280' },
    { name: 'Red', hex: '#dc2626' },
    { name: 'Crimson', hex: '#991b1b' },
    { name: 'Blue', hex: '#2563eb' },
    { name: 'Navy', hex: '#1e3a8a' },
    { name: 'Green', hex: '#16a34a' },
    { name: 'Olive', hex: '#556b2f' },
    { name: 'Brown', hex: '#78350f' },
    { name: 'Beige', hex: '#f5f5dc' },
    { name: 'Cream', hex: '#fffdd0' },
    { name: 'Tan', hex: '#d2b48c' },
    { name: 'Yellow', hex: '#eab308' },
    { name: 'Purple', hex: '#7c3aed' },
    { name: 'Pink', hex: '#db2777' },
    { name: 'Orange', hex: '#ea580c' },
    { name: 'Sand', hex: '#c2b280' },
    { name: 'Wash', hex: '#4b5563' },
  ];

  const filteredSubCatalogs = catalogsState.find((c) => c.name === form.catalog)?.subCatalogs || [];

  const handleAddSize = (sizeName?: string) => {
    const value = (sizeName || sizeEntry).trim();
    if (!value || form.sizes.includes(value)) return;
    setForm((prev) => ({ ...prev, sizes: [...prev.sizes, value] }));
    setSizeEntry('');
  };

  const handleAddColor = (nameOrHex?: string) => {
    const value = nameOrHex || colorLabelEntry.trim();
    if (!value || form.colors.includes(value)) return;
    setForm((prev) => ({ ...prev, colors: [...prev.colors, value] }));
    setColorLabelEntry('');
    setColorEntry('#000000');
  };

  const handleAddPresetColor = (name: string) => {
    if (form.colors.includes(name)) {
      setForm((prev) => ({ ...prev, colors: prev.colors.filter((c) => c !== name) }));
    } else {
      setForm((prev) => ({ ...prev, colors: [...prev.colors, name] }));
    }
  };

  const handleRemoveSize = (size: string) => setForm((prev) => {
    const { [size]: _, ...restStock } = prev.stockPerSize;
    return { ...prev, sizes: prev.sizes.filter((s) => s !== size), stockPerSize: restStock };
  });
  const handleRemoveColor = (color: string) => setForm((prev) => ({ ...prev, colors: prev.colors.filter((c) => c !== color) }));

  const handleProductImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProductImageFile(file);
    setForm((prev) => ({ ...prev, image_url: URL.createObjectURL(file) }));
  };

  const handleAddSecondaryImage = () => {
    const value = secondaryImageEntry.trim();
    if (!value || form.images.includes(value)) return;
    setForm((prev) => ({ ...prev, images: [...prev.images, value] }));
    setSecondaryImageEntry('');
  };

  const handleRemoveSecondaryImage = (img: string) => {
    setForm((prev) => ({ ...prev, images: prev.images.filter((i) => i !== img) }));
  };

  const handleSecondaryImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newImages = Array.from(files).map(file => URL.createObjectURL(file));
    setForm((prev) => ({ ...prev, images: [...prev.images, ...newImages] }));
  };

  const handleCategoryImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCategoryImagePreview(URL.createObjectURL(file));
  };

  const handleAddCatalog = async () => {
    if (!categoryName.trim()) return;
    const newId = crypto.randomUUID();
    const newCatalog: Catalog = {
      id: newId,
      name: categoryName.trim(),
      description: categoryDescription.trim(),
      image_url: categoryImagePreview,
      subCatalogs: [],
      created_at: new Date().toISOString(),
    };

    try {
      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: 'categories',
          action: 'insert',
          data: { id: newId, name: newCatalog.name, description: newCatalog.description, image_url: newCatalog.image_url, sub_categories: [] },
        }),
      });
      if (!res.ok) throw new Error((await res.json())?.error || 'Insert failed');
      setCatalogsState((prev) => [newCatalog, ...prev]);
    } catch (err) {
      console.error('Error adding catalog to Supabase:', err);
      alert('Failed to save catalog to Supabase');
    }

    setCategoryName('');
    setCategoryDescription('');
    setCategoryImagePreview('/placeholder.svg');
    setSelectedCategoryForSub(newCatalog.name);
  };

  const handleAddSubCatalog = async () => {
    if (!subCatalogName.trim()) return;
    const targetCat = catalogsState.find((c) => c.name === selectedCategoryForSub);
    if (!targetCat) return;

    const newSub = {
      id: crypto.randomUUID(),
      name: subCatalogName.trim(),
      description: subCatalogDesc.trim(),
      catalogId: targetCat.id,
      created_at: new Date().toISOString(),
    };

    const updatedSubCatalogs = [...targetCat.subCatalogs, newSub];

    try {
      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: 'categories',
          action: 'update',
          id: targetCat.id,
          data: { sub_categories: updatedSubCatalogs },
        }),
      });
      if (!res.ok) throw new Error((await res.json())?.error || 'Update failed');

      setCatalogsState((prev) =>
        prev.map((cat) =>
          cat.name === selectedCategoryForSub
            ? { ...cat, subCatalogs: updatedSubCatalogs }
            : cat
        )
      );
    } catch (err) {
      console.error('Error adding subcategory to Supabase:', err);
      alert('Failed to save subcategory to Supabase');
    }

    setSubCatalogName('');
    setSubCatalogDesc('');
  };

  const didFetch = useRef(false);

  useEffect(() => {
    setBreadcrumbs([{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Content' }]);
  }, [setBreadcrumbs]);

  useEffect(() => {
    if (!didFetch.current) { didFetch.current = true; fetchData(); }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const client = getSupabase();
      const [prodRes, ordRes, catRes] = await Promise.all([
        client.from('products').select('*').order('created_at', { ascending: false }),
        client.from('orders').select('*').order('created_at', { ascending: false }),
        client.from('categories').select('*').order('name', { ascending: true })
      ]);

      // Always trust the DB — never fall back to mock data after initial load
      if (!catRes.error) {
        const mappedCats = (catRes.data || []).map((c: any) => ({
          id: c.id,
          name: c.name,
          description: c.description || '',
          image_url: c.image_url || '/placeholder.svg',
          subCatalogs: Array.isArray(c.sub_categories)
            ? c.sub_categories.map((sc: any) => typeof sc === 'string' ? { id: crypto.randomUUID(), name: sc, catalogId: c.id, created_at: new Date().toISOString() } : sc)
            : [],
          created_at: c.created_at || new Date().toISOString()
        }));
        setCatalogsState(mappedCats);
        // Set default selected category for sub-catalog creation
        if (mappedCats.length > 0) {
          setSelectedCategoryForSub(prev => prev || mappedCats[0].name);
        }
      }

      if (!prodRes.error) {
        const mappedProds = (prodRes.data || []).map((p: any) => ({
          ...p,
          catalog: p.catalog || p.category,
          subCatalog: p.subCatalog || p.subcategory
        }));
        setProducts(mappedProds);
      }

      if (!ordRes.error) setOrders((ordRes.data || []) as Order[]);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally { setLoading(false); }
  };

  const filteredProds = products.filter((p) =>
    !search.trim() || p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku?.toLowerCase().includes(search.toLowerCase()) ||
    p.catalog?.toLowerCase().includes(search.toLowerCase()) ||
    p.subCatalog?.toLowerCase().includes(search.toLowerCase()) ||
    p.sizes?.some(size => size.toLowerCase().includes(search.toLowerCase())) ||
    p.colors?.some(color => color.toLowerCase().includes(search.toLowerCase()))
  );
  const filteredOrders = orders.filter((o) =>
    !search.trim() || o.id.toLowerCase().includes(search.toLowerCase()) ||
    o.address?.toLowerCase().includes(search.toLowerCase()) ||
    o.phone?.toLowerCase().includes(search.toLowerCase())
  );

  // ─── Selection ───
  const toggleRow = (id: string) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
    setSelectAll(false);
  };

  const toggleSelectAll = () => {
    if (selectAll) { setSelectedRows(new Set()); setSelectAll(false); }
    else {
      const items = tab === 'products' ? filteredProds : filteredOrders;
      setSelectedRows(new Set(items.map((i) => i.id)));
      setSelectAll(true);
    }
  };

  // ─── Bulk Delete ───
  const handleBulkDelete = async () => {
    if (selectedRows.size === 0) return;
    try {
      const table = tab === 'products' ? 'products' : 'orders';
      for (const id of selectedRows) {
        const res = await fetch('/api/admin/data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ table, action: 'delete', id }),
        });
        if (!res.ok) throw new Error((await res.json())?.error || 'Delete failed');
      }
      if (tab === 'products') {
        setProducts((prev) => prev.filter((p) => !selectedRows.has(p.id)));
      } else {
        setOrders((prev) => prev.filter((o) => !selectedRows.has(o.id)));
      }
      setSelectedRows(new Set());
      setSelectAll(false);
      setBulkDeleteConfirm(false);
    } catch (err) {
      console.error('Error executing bulk delete:', err);
      alert(`Failed to delete selected ${tab} from Supabase`);
    }
  };

  // ─── Product Form ───
  const resetForm = () => {
    setForm(emptyForm);
    setEditingProduct(null);
    setShowForm(false);
  };

  const resetBulkForm = () => {
    setBulkEditForm(emptyBulkForm);
    setBulkEditMode(false);
  };

  const handleSaveBulkEdit = async (ids: string[]) => {
    if (ids.length === 0 || tab !== 'products') return;
    const priceVal = bulkEditForm.price ? parseFloat(bulkEditForm.price) : undefined;
    if (priceVal === undefined || isNaN(priceVal)) return;
    console.log('Bulk edit starting:', { ids: ids, priceVal });
    try {
      let successCount = 0;
      for (const id of ids) {
        const res = await fetch('/api/admin/data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ table: 'products', action: 'update', id, data: { price: priceVal } }),
        });
        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          console.error(`Bulk update failed for product ${id}:`, errBody);
          continue;
        }
        successCount++;
      }
      
      setProducts(prev => prev.map(p => {
        if (!ids.includes(p.id)) return p;
        return { ...p, price: priceVal };
      }));
      
      useStore.getState().setToast(`Updated ${successCount} product(s) to ${formatKWD(priceVal)}`);
    } catch (err) {
      console.error('Error during bulk update:', err);
      alert('Failed to perform bulk update in Supabase');
    }
    
    setSelectedRows(new Set());
    setSelectAll(false);
    resetBulkForm();
  };

  const handleEditProduct = (p: Product) => {
    setEditingProduct(p);
    const rawStockPerSize = p.stock_per_size || {};
    const stockPerSize: Record<string, string> = {};
    for (const [k, v] of Object.entries(rawStockPerSize)) {
      stockPerSize[k] = String(v ?? '');
    }
    setForm({
      ...form,
      name: p.name, sku: p.sku || '',
      price: String(p.price), stock: String(p.stock ?? 0),
      image_url: p.image_url || '/placeholder.svg',
      is_featured: p.is_featured || false,
      catalog: p.catalog || '',
      subCatalog: p.subCatalog || '',
      sizes: p.sizes || [],
      colors: p.colors || [],
      images: p.images || [],
      stockPerSize,
    });
    setShowForm(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) return;

    const isNew = !editingProduct;
    const prodId = editingProduct?.id || crypto.randomUUID();

    const stockPerSize: Record<string, number> = {};
    for (const [k, v] of Object.entries(form.stockPerSize)) {
      const n = parseInt(v);
      if (!isNaN(n)) stockPerSize[k] = n;
    }

    const payload: Product = {
      id: prodId,
      name: form.name, sku: form.sku,
      price: parseFloat(form.price), stock: parseInt(form.stock) || 0,
      image_url: form.image_url,
      is_featured: form.is_featured,
      catalog: form.catalog,
      subCatalog: form.subCatalog,
      sizes: form.sizes,
      colors: form.colors,
      images: form.images || [],
      stock_per_size: stockPerSize,
      created_at: editingProduct?.created_at || new Date().toISOString(),
    };

    const dbPayload = {
      id: payload.id,
      name: payload.name,
      sku: payload.sku || null,
      price: payload.price,
      stock: payload.stock,
      image_url: payload.image_url || null,
      category: payload.catalog,
      subcategory: payload.subCatalog || null,
      sizes: payload.sizes,
      colors: payload.colors,
      stock_per_size: stockPerSize,
      is_featured: payload.is_featured,
      category_id: catalogsState.find(c => c.name === payload.catalog)?.id || null
    };

    try {
      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: 'products',
          action: isNew ? 'insert' : 'update',
          ...(isNew ? {} : { id: editingProduct.id }),
          data: dbPayload,
        }),
      });
      if (!res.ok) throw new Error((await res.json())?.error || 'Save failed');
      if (isNew) {
        setProducts((prev) => [payload, ...prev]);
      } else {
        setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? payload : p)));
      }
    } catch (err) {
      console.error('Error saving product to Supabase:', err);
      alert('Failed to save product to Supabase');
    }

    resetForm();
  };

  // ─── Order Status Edit ───
  const handleOrderStatusChange = (orderId: string, newStatus: string) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
    setEditingOrderId(null);
  };

  // ─── CSV Export ───
  const exportCSV = () => {
    const data = tab === 'products' ? filteredProds : filteredOrders;
    const rows = selectedRows.size > 0 ? data.filter((d) => selectedRows.has(d.id)) : data;
      const headers = tab === 'products'
      ? ['Name', 'SKU', 'Catalog', 'Sub Catalog', 'Price', 'Stock', 'Size', 'Colors', 'Featured']
      : ['ID', 'Total', 'Status', 'Payment', 'Date', 'Phone'];
    const csv = [
      headers.join(','),
      ...rows.map((d: any) => {
        if (tab === 'products') return `"${d.name}","${d.sku}","${d.catalog}","${d.subCatalog}",${d.price},${d.stock},"${d.sizes?.join(';') || ''}","${d.colors?.join(';') || ''}",${d.is_featured}`;
        return `"${d.id}",${d.total_price},"${d.status}","${d.payment_method}","${d.created_at}","${d.phone}"`;
      }),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `rutab-${tab}-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pt-4 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-wider">Content Management</h1>
        <p className="text-sm text-[#a1a1a1] mt-1">Manage products, fulfil orders, bulk operations.</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-3">
        {(['products', 'orders'] as const).map((t) => (
          <button key={t} onClick={() => { setTab(t); setSelectedRows(new Set()); setSelectAll(false); setBulkDeleteConfirm(false); }}
            className={`px-5 py-2.5 rounded-xl text-[10px] uppercase font-bold tracking-[0.25em] transition cursor-pointer ${
              tab === t ? 'bg-[#ff0000] text-white' : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}>
            {t === 'products' ? `Products (${products.length})` : `Orders (${orders.length})`}
          </button>
        ))}
      </div>

      {/* Search + Bulk Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" />
          <input type="text" placeholder={tab === 'products' ? 'Search products by name, SKU, category...' : 'Search orders by ID, address, phone...'}
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-[320px] bg-[#0a0a0a] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#ff0000]/40 transition" />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <AnimatePresence>
            {selectedRows.size > 0 && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-2">
                <span className="text-[10px] text-white font-bold bg-[#ff0000]/10 px-3 py-1.5 rounded-full border border-[#ff0000]/20">
                  {selectedRows.size} selected
                </span>
                {/* Bulk Edit Button (only for products tab) */}
                {tab === 'products' && (
                  <button onClick={() => setBulkEditMode(true)}
                    className="px-4 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition cursor-pointer">
                    <Edit className="w-3.5 h-3.5" /> Bulk Edit
                  </button>
                )}
                {!bulkDeleteConfirm ? (
                  <button onClick={() => setBulkDeleteConfirm(true)}
                    className="px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition cursor-pointer">
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                ) : (
                  <>
                    <button onClick={handleBulkDelete}
                      className="px-4 py-2.5 rounded-xl bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition cursor-pointer">
                      <AlertTriangle className="w-3.5 h-3.5" /> Confirm Delete
                    </button>
                    <button onClick={() => { setBulkDeleteConfirm(false); setSelectedRows(new Set()); setSelectAll(false); }}
                      className="px-4 py-2.5 rounded-xl border border-white/10 text-white/70 text-[10px] font-bold uppercase tracking-widest transition cursor-pointer">
                      Cancel
                    </button>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          {tab === 'products' && (
            <button
              onClick={() => {
                const allIds = filteredProds.map((p) => p.id);
                if (selectedRows.size === filteredProds.length && filteredProds.length > 0) {
                  setSelectedRows(new Set());
                  setSelectAll(false);
                } else {
                  setSelectedRows(new Set(allIds));
                  setSelectAll(true);
                }
              }}
              className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {selectedRows.size === filteredProds.length && filteredProds.length > 0 ? 'Deselect All' : 'Select All'}
            </button>
          )}
          {tab === 'products' && (
            <button onClick={() => { resetForm(); setShowForm(true); }}
              className="px-4 py-2.5 rounded-xl bg-[#ff0000] hover:bg-[#d60000] text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition cursor-pointer">
              <Plus className="w-3.5 h-3.5" /> Add Product
            </button>
          )}
          <button onClick={exportCSV}
            className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition cursor-pointer">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button onClick={fetchData}
            className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition cursor-pointer">
            <RefreshCw className="w-3.5 h-3.5" /> Sync
          </button>
        </div>
      </div>

      {/* Add/Edit Product Form */}
      <AnimatePresence>
        {showForm && (
          <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSaveProduct} className="overflow-hidden">
            <div className="p-6 rounded-3xl bg-[#111111] border border-white/5 space-y-5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">{editingProduct ? 'Edit Product' : 'New Product'}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Field label="Product Name" value={form.name} onChange={(v: string) => setForm({ ...form, name: v })} placeholder="Travis Scott Hoodie" required />
                <Field label="SKU" value={form.sku} onChange={(v: string) => setForm({ ...form, sku: v })} placeholder="TS-HD-001" />
                <Field label="Price (KWD)" value={form.price} onChange={(v: string) => setForm({ ...form, price: v })} type="number" step="0.001" placeholder="45.000" required />
                <Field label="Stock" value={form.stock} onChange={(v: string) => setForm({ ...form, stock: v })} type="number" placeholder="10" />
                <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-[#a1a1a1]">Sizes</label>
                  {/* Selected Size Tags */}
                  {form.sizes.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {form.sizes.map((size) => (
                        <button key={size} type="button" onClick={() => handleRemoveSize(size)}
                          className="flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-[#ff0000]/20 hover:border-[#ff0000]/30">
                          {size} ×
                        </button>
                      ))}
                    </div>
                  )}
                  {/* Preset Size Buttons */}
                  <div className="flex flex-wrap gap-1.5 p-3 bg-black rounded-xl border border-white/10">
                    {['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'One Size'].map((s) => {
                      const isSelected = form.sizes.includes(s);
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => {
                            if (form.sizes.includes(s)) {
                              handleRemoveSize(s);
                            } else {
                              setForm((prev) => ({ ...prev, sizes: [...prev.sizes, s] }));
                            }
                          }}
                          className={`px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-wider transition-all duration-200 cursor-pointer ${
                            isSelected
                              ? 'bg-[#ff0000] text-white shadow-lg shadow-[#ff0000]/20'
                              : 'border border-white/10 text-[#a1a1a1] hover:border-white/30 hover:text-white'
                          }`}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                  {/* Custom Size Input */}
                  <div className="flex gap-2">
                    <input value={sizeEntry} onChange={(e) => setSizeEntry(e.target.value)} placeholder="Custom size (e.g. 28, 30, 32)"
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSize(); }}}
                      className="w-full bg-black border border-white/10 rounded-xl py-2.5 px-3.5 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#ff0000]/40 transition" />
                    <button type="button" onClick={(e) => { e.preventDefault(); handleAddSize(); }}
                      className="px-3 py-2 rounded-xl bg-[#ff0000] hover:bg-[#d60000] text-white text-[10px] uppercase font-bold tracking-widest transition shrink-0">
                      Add
                    </button>
                  </div>
                  {/* Stock per size */}
                  {form.sizes.length > 0 && (
                    <div className="pt-3 border-t border-white/5">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-[#a1a1a1] block mb-2">Stock Per Size</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {form.sizes.map((size) => (
                          <div key={size} className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-white uppercase w-10 shrink-0">{size}</span>
                            <input
                              type="number" min="0"
                              value={form.stockPerSize[size] ?? ''}
                              onChange={(e) => setForm((prev) => ({ ...prev, stockPerSize: { ...prev.stockPerSize, [size]: e.target.value } }))}
                              placeholder="0"
                              className="w-full bg-black border border-white/10 rounded-lg py-1.5 px-2 text-xs text-white placeholder:text-[#555] focus:outline-none focus:border-[#ff0000]/40 transition"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-[#a1a1a1]">Colors</label>
                  {/* Selected Color Tags */}
                  {form.colors.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {form.colors.map((color) => {
                        const preset = PRESET_COLORS.find(p => p.name === color);
                        const hex = preset?.hex || (color.startsWith('#') ? color : undefined);
                        return (
                          <button key={color} type="button" onClick={() => handleRemoveColor(color)}
                            title={`Remove ${color}`}
                            className="flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-[#ff0000]/20 hover:border-[#ff0000]/30">
                            {hex && <span className="w-3 h-3 rounded-full border border-white/20 inline-block shrink-0" style={{ backgroundColor: hex }} />}
                            {color} ×
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {/* Preset Color Swatches */}
                  <div className="flex flex-wrap gap-1.5 p-3 bg-black rounded-xl border border-white/10">
                    {PRESET_COLORS.map((c) => {
                      const isSelected = form.colors.includes(c.name);
                      return (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => handleAddPresetColor(c.name)}
                          title={c.name}
                          className={`w-7 h-7 rounded-full transition-all duration-200 cursor-pointer relative hover:scale-110 ${
                            isSelected ? 'ring-2 ring-white ring-offset-1 ring-offset-black scale-105' : 'ring-1 ring-white/10'
                          }`}
                          style={{ backgroundColor: c.hex }}
                        >
                          {isSelected && (
                            <span className="absolute inset-0 flex items-center justify-center">
                              <svg viewBox="0 0 10 10" className="w-3 h-3">
                                <path d="M2 5l2.5 2.5L8 3" stroke={c.hex === '#ffffff' || c.hex === '#fffdd0' || c.hex === '#f5f5dc' ? '#000' : '#fff'} strokeWidth="1.5" fill="none" strokeLinecap="round" />
                              </svg>
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {/* Custom Color Input */}
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={colorEntry}
                      onChange={(e) => setColorEntry(e.target.value)}
                      className="w-10 h-10 rounded-lg border border-white/10 bg-black cursor-pointer shrink-0"
                    />
                    <input
                      value={colorLabelEntry}
                      onChange={(e) => setColorLabelEntry(e.target.value)}
                      placeholder="Custom color name (e.g. Ash Blue)"
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddColor(); }}}
                      className="flex-1 bg-black border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#ff0000]/40 transition" />
                    <button type="button" onClick={() => handleAddColor()}
                      className="px-3 py-2 rounded-xl bg-[#ff0000] hover:bg-[#d60000] text-white text-[10px] uppercase font-bold tracking-widest transition shrink-0">
                      Add
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-[#a1a1a1]">Catalog</label>
                  <select value={form.catalog} onChange={(e) => setForm({ ...form, catalog: e.target.value, subCatalog: '' })}
                    className="w-full bg-black border border-white/10 rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:border-[#ff0000]/40 transition">
                    {catalogsState.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-[#a1a1a1]">Sub Catalog</label>
                  <select value={form.subCatalog} onChange={(e) => setForm({ ...form, subCatalog: e.target.value })}
                    className="w-full bg-black border border-white/10 rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:border-[#ff0000]/40 transition">
                    <option value="">None</option>
                    {filteredSubCatalogs.map((sc) => <option key={sc.id} value={sc.name}>{sc.name}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2 lg:col-span-3 space-y-3">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-[#a1a1a1]">Product Images</label>
                  {/* Main Image Preview */}
                  <div className="flex gap-3">
                    <div className="w-24 h-28 rounded-xl overflow-hidden border border-white/10 bg-black shrink-0">
                      {form.image_url && form.image_url !== '/placeholder.svg' ? (
                        <Image src={form.image_url} alt="main" width={96} height={112} className="w-full h-full object-cover" unoptimized />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#333] text-[9px] uppercase font-bold">Main</div>
                      )}
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="Main image URL (https://...)"
                        className="w-full bg-black border border-white/10 rounded-xl py-2 px-3.5 text-xs text-white placeholder:text-[#555] focus:outline-none focus:border-[#ff0000]/40 transition" />
                      <input type="file" accept="image/*" onChange={handleProductImageUpload}
                        className="w-full text-[9px] text-white file:bg-[#ff0000] file:text-white file:px-2.5 file:py-1.5 file:rounded-xl file:border-none file:text-[9px] file:font-bold file:cursor-pointer" />
                    </div>
                  </div>
                  {/* Gallery Images */}
                  <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] uppercase font-bold tracking-widest text-[#a1a1a1]">Gallery ({form.images.length})</span>
                      {form.images.length > 0 && (
                        <button type="button" onClick={() => setForm({ ...form, images: [] })}
                          className="text-[8px] text-[#555] hover:text-red-400 uppercase tracking-wider font-bold transition">Clear All</button>
                      )}
                    </div>
                    {form.images.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {form.images.map((img, i) => (
                          <div key={i} className="relative group">
                            <div className="w-12 h-14 rounded-lg overflow-hidden border border-white/10 bg-black">
                              <Image src={img} alt={`gallery-${i}`} width={48} height={56} className="w-full h-full object-cover" unoptimized />
                            </div>
                            <button type="button" onClick={() => handleRemoveSecondaryImage(img)}
                              className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#ff0000] text-white flex items-center justify-center text-[8px] font-bold opacity-0 group-hover:opacity-100 transition cursor-pointer shadow-lg">×</button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-1.5">
                      <input value={secondaryImageEntry} onChange={(e) => setSecondaryImageEntry(e.target.value)}
                        placeholder="Paste URL & Add, or paste multiple (comma-separated)..."
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSecondaryImage(); }}}
                        className="flex-1 bg-black border border-white/10 rounded-lg py-1.5 px-2.5 text-[11px] text-white placeholder:text-[#555] focus:outline-none focus:border-[#ff0000]/40 transition" />
                      <button type="button" onClick={() => {
                        const urls = secondaryImageEntry.split(/[,\n]/).map(s => s.trim()).filter(Boolean);
                        urls.forEach(url => {
                          if (!form.images.includes(url)) {
                            setForm(prev => ({ ...prev, images: [...prev.images, url] }));
                          }
                        });
                        setSecondaryImageEntry('');
                      }}
                        className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[9px] uppercase font-bold tracking-widest transition shrink-0 cursor-pointer">Add</button>
                    </div>
                    <label className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-white/20 hover:border-[#ff0000]/40 hover:bg-[#ff0000]/5 transition cursor-pointer group">
                      <Plus className="w-3.5 h-3.5 text-[#ff0000]" />
                      <span className="text-[9px] font-bold text-white">Upload Files</span>
                      <input type="file" accept="image/*" multiple onChange={handleSecondaryImageUpload} className="hidden" />
                    </label>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-[#a1a1a1]">Featured</label>
                  <button type="button" onClick={() => setForm({ ...form, is_featured: !form.is_featured })}
                    className={`w-10 h-6 rounded-full transition cursor-pointer ${form.is_featured ? 'bg-[#ff0000]' : 'bg-white/10'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white transition mt-1 ${form.is_featured ? 'ml-[22px]' : 'ml-1'}`} />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button type="submit" className="px-6 py-2.5 bg-[#ff0000] hover:bg-[#d60000] text-white rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer">
                  <Save className="w-3.5 h-3.5" /> {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
                <button type="button" onClick={resetForm} className="px-6 py-2.5 border border-white/10 rounded-xl text-xs font-bold text-white/70 hover:text-white transition cursor-pointer">Cancel</button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>



      {/* Bulk Edit — Slide-in Panel */}
      {bulkEditMode && (
        <>
          <div className="fixed inset-0 z-50 bg-black/60" onClick={resetBulkForm} />
          <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-[#0a0a0a] border-l border-white/10 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Bulk Edit Products</h3>
              <button type="button" onClick={resetBulkForm}
                className="w-8 h-8 rounded-xl border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:border-white/30 transition cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveBulkEdit(Array.from(selectedRows)); }} className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-[#a1a1a1]">New Price (KWD)</label>
                  <input value={bulkEditForm.price} onChange={(e) => setBulkEditForm({ ...bulkEditForm, price: e.target.value })} type="number" step="0.001"
                    className="w-full bg-black border border-white/10 rounded-xl py-2.5 px-3.5 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#ff0000]/40 transition" />
                </div>
                <div className="flex items-center gap-3 pt-2 border-t border-white/10">
                  <button type="button" onClick={resetBulkForm}
                    className="flex-1 py-2.5 border border-white/10 rounded-xl text-xs font-bold text-white/70 hover:text-white transition cursor-pointer">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 py-2.5 bg-[#ff0000] hover:bg-[#d60000] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer">
                    <Save className="w-3.5 h-3.5" /> Apply Changes
                  </button>
                </div>
              </form>
            </div>
        </>
      )}

      {/* Loading */}
      {loading ? (
        <div className="h-[40vh] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#ff0000] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : tab === 'products' ? (
        /* Products Table */
        <div className="space-y-2">
          {filteredProds.length === 0 ? (
            <div className="h-[30vh] flex flex-col items-center justify-center text-[#a1a1a1]">
              <Package className="w-10 h-10 mb-3 opacity-40" />
              <p className="text-xs uppercase tracking-widest font-bold">No products found</p>
              <button onClick={() => { resetForm(); setShowForm(true); }} className="mt-4 px-5 py-2.5 rounded-xl bg-[#ff0000] text-white text-[10px] font-bold uppercase tracking-widest transition cursor-pointer">
                <Plus className="w-3.5 h-3.5 inline mr-1" /> Add First Product
              </button>
            </div>
          ) : (
            <DataTable
              columns={[
                { key: 'select', label: '', render: (p: Product) => (
                  <button onClick={(e) => { e.stopPropagation(); toggleRow(p.id); }}
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center transition cursor-pointer ${
                      selectedRows.has(p.id) ? 'bg-[#ff0000] border-[#ff0000]' : 'border-white/20 hover:border-white/40'
                    }`}>
                    {selectedRows.has(p.id) && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </button>
                )},
                { key: 'name', label: 'Product', render: (p: Product) => (
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-9 rounded-lg bg-black border border-white/10 overflow-hidden relative shrink-0 flex items-center justify-center text-[6px] text-[#555]">
                      {p.image_url && p.image_url !== '/placeholder.svg'
                        ? <Image src={p.image_url} alt={p.name} fill sizes="28px" className="object-cover" unoptimized />
                        : <Package className="w-3 h-3 opacity-30" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{p.name}</p>
                      <p className="text-[9px] text-[#555]">SKU: {p.sku}</p>
                    </div>
                  </div>
                )},
                { key: 'catalog', label: 'Catalog', render: (p: Product) => (
                  <span className="text-[10px] text-[#a1a1a1]">{p.catalog}</span>
                )},
                { key: 'subCatalog', label: 'Sub Catalog', render: (p: Product) => (
                  <span className="text-[10px] text-[#a1a1a1]">{p.subCatalog}</span>
                )},
                { key: 'price', label: 'Price', render: (p: Product) => (
                  <span className="text-xs font-bold text-white">{formatKWD(Number(p.price))}</span>
                )},
                { key: 'stock', label: 'Stock', render: (p: Product) => {
                  const perSize = p.stock_per_size && typeof p.stock_per_size === 'object' && Object.keys(p.stock_per_size).length > 0 ? p.stock_per_size : null;
                  return (
                    <div className="text-[10px]">
                      <span className={`font-bold ${(p.stock ?? 0) <= 0 ? 'text-red-400' : (p.stock ?? 0) <= 5 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {p.stock ?? 0}
                      </span>
                      {perSize && (
                        <div className="text-[8px] text-[#666] mt-0.5 space-x-1.5">
                          {Object.entries(perSize).map(([size, qty]) => (
                            <span key={size} className="inline-block">{size}:{String(qty)}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }},
                { key: 'sizes', label: 'Size', render: (p: Product) => (
                  <span className="text-[10px] text-[#a1a1a1]">{p.sizes?.join(', ') || '-'}</span>
                )},
                { key: 'colors', label: 'Colors', render: (p: Product) => (
                  <span className="text-[10px] text-[#a1a1a1]">{p.colors?.join(', ') || '-'}</span>
                )},
                { key: 'featured', label: '', render: (p: Product) => (
                  p.is_featured ? <span className="text-[8px] bg-[#ff0000]/10 text-[#ff0000] px-2 py-0.5 rounded-full uppercase font-black">FEATURED</span> : null
                )},
                { key: 'actions', label: '', render: (p: Product) => (
                  <button onClick={(e) => { e.stopPropagation(); handleEditProduct(p); }}
                    className="w-7 h-7 rounded-lg border border-white/10 hover:border-white/30 flex items-center justify-center text-[#a1a1a1] hover:text-white transition cursor-pointer">
                    <Pencil className="w-3 h-3" />
                  </button>
                )},
              ]}
              data={filteredProds}
              keyExtractor={(p) => p.id}
            />
          )}
        </div>
      ) : (
        /* Orders Table */
        <div className="space-y-2">
          {filteredOrders.length === 0 ? (
            <div className="h-[30vh] flex flex-col items-center justify-center text-[#a1a1a1]">
              <ShoppingBag className="w-10 h-10 mb-3 opacity-40" />
              <p className="text-xs uppercase tracking-widest font-bold">No orders found</p>
            </div>
          ) : (
            <DataTable
              columns={[
                { key: 'select', label: '', render: (o: Order) => (
                  <button onClick={(e) => { e.stopPropagation(); toggleRow(o.id); }}
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center transition cursor-pointer ${
                      selectedRows.has(o.id) ? 'bg-[#ff0000] border-[#ff0000]' : 'border-white/20 hover:border-white/40'
                    }`}>
                    {selectedRows.has(o.id) && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </button>
                )},
                { key: 'id', label: 'Order ID', render: (o: Order) => (
                  <span className="font-mono text-[11px] text-white">#{o.id.slice(0, 8)}</span>
                )},
                { key: 'total', label: 'Total', render: (o: Order) => (
                  <span className="text-xs font-bold text-white">{formatKWD(Number(o.total_price))}</span>
                )},
                { key: 'payment', label: 'Payment', render: (o: Order) => (
                  <span className="text-[10px] text-[#a1a1a1]">{o.payment_method}</span>
                )},
                { key: 'proof', label: 'Proof', render: (o: Order) => (
                  o.payment_proof ? (
                    <button onClick={() => window.open(o.payment_proof, '_blank')}
                      className="w-8 h-8 rounded-lg overflow-hidden border border-white/10 hover:border-[#ff0000]/40 transition cursor-pointer">
                      <img src={o.payment_proof} alt="Payment proof" className="w-full h-full object-cover" />
                    </button>
                  ) : (
                    <span className="text-[10px] text-[#333]">—</span>
                  )
                )},
                { key: 'status', label: 'Status', render: (o: Order) => (
                  editingOrderId === o.id ? (
                    <select value={orderStatusEdit} onChange={(e) => { setOrderStatusEdit(e.target.value); }}
                      onBlur={() => handleOrderStatusChange(o.id, orderStatusEdit)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleOrderStatusChange(o.id, orderStatusEdit); }}
                      className="bg-black border border-white/20 rounded-lg px-2 py-1 text-[10px] text-white focus:outline-none focus:border-[#ff0000]/40"
                      autoFocus>
                      {orderStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  ) : (
                    <button onClick={() => { setEditingOrderId(o.id); setOrderStatusEdit(o.status); }}
                      className={`text-[8px] uppercase font-black px-2.5 py-1 rounded-full transition cursor-pointer hover:scale-105 ${
                        o.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        o.status === 'shipped' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                        o.status === 'cancelled' || o.status === 'refunded' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>{o.status}</button>
                  )
                )},
                { key: 'phone', label: 'Phone', render: (o: Order) => (
                  <span className="text-[10px] text-[#555]">{o.phone || '—'}</span>
                )},
                { key: 'date', label: 'Date', render: (o: Order) => (
                  <span className="text-[10px] text-[#555]">{new Date(o.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
                )},
              ]}
              data={filteredOrders}
              keyExtractor={(o) => o.id}
            />
          )}
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