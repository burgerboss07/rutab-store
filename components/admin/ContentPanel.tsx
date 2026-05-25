'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSupabase } from '@/lib/supabase';
import { Product, Order } from '@/lib/store';
import { useAdminStore, mockProducts, mockOrders } from '@/lib/admin-store';
import Image from 'next/image';
import DataTable from './ui/DataTable';
import {
  Package, Search, Download, RefreshCw, CheckCircle2,
  ShoppingBag, Plus, Pencil, Trash2, Save, X, ChevronDown, ChevronUp,
  AlertTriangle
} from 'lucide-react';

function formatKWD(v: number) { return `${v.toFixed(3)} KWD`; }
function uid() { return Math.random().toString(36).slice(2, 10); }

interface ProductFormData {
  name: string; sku: string; catalog: string; subCatalog: string; price: string;
  stock: string; description: string; image_url: string; is_featured: boolean;
}

const emptyForm: ProductFormData = {
  name: '', sku: '', catalog: '', subCatalog: '', price: '', stock: '0',
  description: '', image_url: '/placeholder.svg', is_featured: false,
};

interface BulkEditFormData {
  price: string; stock: string; catalog: string; subCatalog: string;
}

const emptyBulkForm: BulkEditFormData = {
  price: '', stock: '', catalog: '', subCatalog: ''
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
  const [loading, setLoading] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [orderStatusEdit, setOrderStatusEdit] = useState('');

  const didFetch = useRef(false);

  useEffect(() => {
    setBreadcrumbs([{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Content' }]);
  }, [setBreadcrumbs]);

  useEffect(() => {
    if (!didFetch.current) { didFetch.current = true; fetchData(); }
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const client = getSupabase();
      const [prodRes, ordRes] = await Promise.all([
        client.from('products').select('*').order('created_at', { ascending: false }),
        client.from('orders').select('*').order('created_at', { ascending: false }),
      ]);
      if (prodRes.data && prodRes.data.length > 0) setProducts(prodRes.data as Product[]);
      else setProducts(mockProducts);
      if (ordRes.data && ordRes.data.length > 0) setOrders(ordRes.data as Order[]);
      else setOrders(mockOrders);
    } catch {
      setProducts(mockProducts);
      setOrders(mockOrders);
    } finally { setLoading(false); }
  };

  const filteredProds = products.filter((p) =>
    !search.trim() || p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku?.toLowerCase().includes(search.toLowerCase()) ||
    p.catalog?.toLowerCase().includes(search.toLowerCase()) ||
    p.subCatalog?.toLowerCase().includes(search.toLowerCase())
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
  const handleBulkDelete = () => {
    if (selectedRows.size === 0) return;
    if (tab === 'products') {
      setProducts((prev) => prev.filter((p) => !selectedRows.has(p.id)));
    } else {
      setOrders((prev) => prev.filter((o) => !selectedRows.has(o.id)));
    }
    setSelectedRows(new Set());
    setSelectAll(false);
    setBulkDeleteConfirm(false);
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

    const handleSaveBulkEdit = () => {
      if (selectedRows.size === 0 || tab !== 'products') return;
      
      const priceVal = bulkEditForm.price ? parseFloat(bulkEditForm.price) : undefined;
      const stockVal = bulkEditForm.stock ? parseInt(bulkEditForm.stock) : undefined;
      
      setProducts(prev => prev.map(p => {
        if (!selectedRows.has(p.id)) return p;
        
        return {
          ...p,
          ...(priceVal !== undefined ? { price: priceVal } : {}),
          ...(stockVal !== undefined ? { stock: stockVal } : {}),
          ...(bulkEditForm.catalog ? { catalog: bulkEditForm.catalog } : {}),
          ...(bulkEditForm.subCatalog ? { subCatalog: bulkEditForm.subCatalog } : {})
        };
      }));
      
      setSelectedRows(new Set());
      setSelectAll(false);
      resetBulkForm();
    };

  const handleEditProduct = (p: Product) => {
    setEditingProduct(p);
    setForm({
      name: p.name, sku: p.sku || '', category: p.category || 'T-Shirts',
      price: String(p.price), stock: String(p.stock ?? 0),
      description: p.description || '', image_url: p.image_url || '/placeholder.svg',
      is_featured: p.is_featured || false,
    });
    setShowForm(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) return;
    const payload: Product = {
      id: editingProduct?.id || uid(),
      name: form.name, sku: form.sku, category: form.category,
      price: parseFloat(form.price), stock: parseInt(form.stock) || 0,
      description: form.description, image_url: form.image_url,
      is_featured: form.is_featured,
      created_at: editingProduct?.created_at || new Date().toISOString(),
    };
    if (editingProduct) {
      setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? payload : p)));
    } else {
      setProducts((prev) => [payload, ...prev]);
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
      ? ['Name', 'SKU', 'Category', 'Price', 'Stock', 'Featured']
      : ['ID', 'Total', 'Status', 'Payment', 'Date', 'Phone'];
    const csv = [
      headers.join(','),
      ...rows.map((d: any) => {
        if (tab === 'products') return `"${d.name}","${d.sku}","${d.category}",${d.price},${d.stock},${d.is_featured}`;
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
                    <button onClick={() => setBulkDeleteConfirm(false)}
                      className="px-4 py-2.5 rounded-xl border border-white/10 text-white/70 text-[10px] font-bold uppercase tracking-widest transition cursor-pointer">
                      Cancel
                    </button>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
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
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-[#a1a1a1]">Catalog</label>
                  <select value={form.catalog} onChange={(e) => setForm({ ...form, catalog: e.target.value })}
                    className="w-full bg-black border border-white/10 rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:border-[#ff0000]/40 transition">
                    {catalogs.map((c) => <option key={c} value={c}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-[#a1a1a1]">Sub Catalog</label>
                  <select value={form.subCatalog} onChange={(e) => setForm({ ...form, subCatalog: e.target.value })}
                    className="w-full bg-black border border-white/10 rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:border-[#ff0000]/40 transition">
                    {filteredSubCatalogs.map((sc) => <option key={sc} value={sc}>{sc.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-[#a1a1a1]">Image URL</label>
                  <input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..."
                    className="w-full bg-black border border-white/10 rounded-xl py-2.5 px-3.5 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#ff0000]/40 transition" />
                </div>
                <div className="sm:col-span-2 lg:col-span-3 space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-[#a1a1a1]">Description</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} placeholder="Product description..."
                    className="w-full bg-black border border-white/10 rounded-xl py-2.5 px-3.5 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#ff0000]/40 transition resize-none" />
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

      {/* Bulk Edit Form */}
      <AnimatePresence>
        {bulkEditMode && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#111111] border border-white/5 rounded-3xl w-full max-w-md p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Bulk Edit Products</h3>
                <button type="button" onClick={resetBulkForm}
                  className="px-3 py-1.5 rounded-xl border border-white/10 text-xs font-bold text-white/70 hover:text-white transition cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); handleSaveBulkEdit(); }} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-[#a1a1a1]">Price (KWD)</label>
                  <input value={bulkEditForm.price} onChange={(e) => setBulkEditForm({ ...bulkEditForm, price: e.target.value })} type="number" step="0.001"
                    className="w-full bg-black border border-white/10 rounded-xl py-2.5 px-3.5 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#ff0000]/40 transition" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-[#a1a1a1]">Stock</label>
                  <input value={bulkEditForm.stock} onChange={(e) => setBulkEditForm({ ...bulkEditForm, stock: e.target.value })} type="number"
                    className="w-full bg-black border border-white/10 rounded-xl py-2.5 px-3.5 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#ff0000]/40 transition" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-[#a1a1a1]">Catalog</label>
                  <select value={bulkEditForm.catalog} onChange={(e) => setBulkEditForm({ ...bulkEditForm, catalog: e.target.value })}
                    className="w-full bg-black border border-white/10 rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:border-[#ff0000]/40 transition">
                    {catalogs.map((c) => <option key={c} value={c}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-[#a1a1a1]">Sub Catalog</label>
                  <select value={bulkEditForm.subCatalog} onChange={(e) => setBulkEditForm({ ...bulkEditForm, subCatalog: e.target.value })}
                    className="w-full bg-black border border-white/10 rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:border-[#ff0000]/40 transition">
                    {filteredSubCatalogs.map((sc) => <option key={sc} value={sc}>{sc.name}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <button type="button" onClick={resetBulkForm}
                    className="px-4 py-2.5 border border-white/10 rounded-xl text-xs font-bold text-white/70 hover:text-white transition cursor-pointer">
                    Cancel
                  </button>
                  <button type="submit" className="px-6 py-2.5 bg-[#ff0000] hover:bg-[#d60000] text-white rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer">
                    <Save className="w-3.5 h-3.5" /> Apply Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                    <div className="w-9 h-11 rounded-lg bg-black border border-white/10 overflow-hidden relative shrink-0 flex items-center justify-center text-[8px] text-[#555]">
                      {p.image_url && p.image_url !== '/placeholder.svg'
                        ? <Image src={p.image_url} alt={p.name} fill sizes="36px" className="object-cover" unoptimized />
                        : <Package className="w-4 h-4 opacity-30" />}
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
                { key: 'stock', label: 'Stock', render: (p: Product) => (
                  <span className={`text-[10px] font-bold ${(p.stock ?? 0) <= 0 ? 'text-red-400' : (p.stock ?? 0) <= 5 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {p.stock ?? 0}
                  </span>
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