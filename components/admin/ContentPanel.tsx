'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSupabase } from '@/lib/supabase';
import { Product, Order } from '@/lib/store';
import { useAdminStore } from '@/lib/admin-store';
import Image from 'next/image';
import DataTable from './ui/DataTable';
import {
  Package, Search, Download, Filter, RefreshCw, CheckCircle2,
  DollarSign, ShoppingBag, Plus, Pencil, Trash2, ChevronDown, ChevronUp
} from 'lucide-react';

function formatKWD(v: number) {
  return `${v.toFixed(3)} KWD`;
}

export default function ContentPanel() {
  const setBreadcrumbs = useAdminStore((s) => s.setBreadcrumbs);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'products' | 'orders'>('products');
  const [search, setSearch] = useState('');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const didFetch = useRef(false);

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Dashboard', href: '/admin/dashboard' },
      { label: 'Content' },
    ]);
  }, [setBreadcrumbs]);

  useEffect(() => {
    if (!didFetch.current) {
      didFetch.current = true;
      void fetchData();
    }
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const client = getSupabase();
      const [prodRes, ordRes] = await Promise.all([
        client.from('products').select('*').order('created_at', { ascending: false }),
        client.from('orders').select('*').order('created_at', { ascending: false }),
      ]);
      if (prodRes.data) setProducts(prodRes.data as Product[]);
      if (ordRes.data) setOrders(ordRes.data as Order[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    const data = tab === 'products' ? products : orders;
    const headers = tab === 'products'
      ? ['Name', 'SKU', 'Category', 'Price', 'Stock', 'Featured']
      : ['ID', 'Total', 'Status', 'Payment', 'Date'];
    const rows = (selectedRows.size > 0 ? data.filter((d) => selectedRows.has(d.id)) : data).map((d: any) => {
      if (tab === 'products') return `"${d.name}","${d.sku}","${d.category}",${d.price},${d.stock},${d.is_featured}`;
      return `"${d.id}",${d.total_price},"${d.status}","${d.payment_method}","${d.created_at}"`;
    });
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rutab-${tab}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredProds = products.filter((p) =>
    !search.trim() || p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredOrders = orders.filter((o) =>
    !search.trim() || o.id.toLowerCase().includes(search.toLowerCase()) ||
    o.address.toLowerCase().includes(search.toLowerCase())
  );

  const toggleRow = (id: string) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-6 pt-4 animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black uppercase tracking-wider">Content Management</h1>
        <p className="text-sm text-[#a1a1a1] mt-1">Manage products and fulfil orders from one place.</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-3">
        {(['products', 'orders'] as const).map((t) => (
          <button key={t}
            onClick={() => { setTab(t); setSelectedRows(new Set()); }}
            className={`px-5 py-2.5 rounded-xl text-[10px] uppercase font-bold tracking-[0.25em] transition cursor-pointer ${
              tab === t ? 'bg-[#ff0000] text-white' : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            {t === 'products' ? `Products (${products.length})` : `Orders (${orders.length})`}
          </button>
        ))}
      </div>

      {/* Search + Bulk Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" />
          <input type="text" placeholder={tab === 'products' ? 'Search products...' : 'Search orders...'}
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-[280px] bg-[#0a0a0a] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#ff0000]/40 transition" />
        </div>
        <div className="flex items-center gap-2">
          {selectedRows.size > 0 && (
            <motion.span initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="text-[10px] text-white font-bold bg-[#ff0000]/10 px-3 py-1.5 rounded-full border border-[#ff0000]/20">
              {selectedRows.size} selected
            </motion.span>
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
            </div>
          ) : (
            <DataTable
              columns={[
                { key: 'select', label: '', render: (p: Product) => (
                  <button onClick={() => toggleRow(p.id)}
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center transition cursor-pointer ${
                      selectedRows.has(p.id) ? 'bg-[#ff0000] border-[#ff0000]' : 'border-white/20'
                    }`}>
                    {selectedRows.has(p.id) && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </button>
                )},
                { key: 'name', label: 'Product', render: (p: Product) => (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-11 rounded-lg bg-black border border-white/10 overflow-hidden relative shrink-0">
                      <Image src={p.image_url} alt={p.name} fill sizes="36px" className="object-cover" unoptimized />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{p.name}</p>
                      <p className="text-[9px] text-[#555]">SKU: {p.sku}</p>
                    </div>
                  </div>
                )},
                { key: 'category', label: 'Category', render: (p: Product) => (
                  <span className="text-[10px] text-[#a1a1a1]">{p.category}</span>
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
                  <button onClick={() => toggleRow(o.id)}
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center transition cursor-pointer ${
                      selectedRows.has(o.id) ? 'bg-[#ff0000] border-[#ff0000]' : 'border-white/20'
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
                  <span className={`text-[8px] uppercase font-black px-2.5 py-1 rounded-full ${
                    o.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    o.status === 'shipped' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                    'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {o.status}
                  </span>
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
