'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSupabase } from '@/lib/supabase';
import { Order, useStore } from '@/lib/store';
import { useAdminStore } from '@/lib/admin-store';
import DataTable from './ui/DataTable';
import {
  ShoppingBag, Search, Download, CheckCircle2,
  Trash2, AlertTriangle, RefreshCw, X
} from 'lucide-react';

const orderStatuses = ['pending', 'shipped', 'delivered', 'cancelled', 'refunded'];

function formatKWD(v: number) { return `${v.toFixed(3)} KWD`; }

export default function OrdersPanel() {
  const setBreadcrumbs = useAdminStore((s) => s.setBreadcrumbs);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [orderStatusEdit, setOrderStatusEdit] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fetched = useRef(false);

  useEffect(() => {
    setBreadcrumbs([{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Orders' }]);
  }, [setBreadcrumbs]);

  useEffect(() => {
    if (!fetched.current) { fetched.current = true; fetchOrders(); }
  }, []);

  // Live sync: re-fetch when orders change in DB
  useEffect(() => {
    const channel = getSupabase()
      .channel('admin-orders-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders();
      })
      .subscribe();
    return () => { getSupabase().removeChannel(channel); };
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const client = getSupabase();
      const { data, error } = await client
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });
      if (!error) {
        const prods = useStore.getState().products;
        const mapped = (data || []).map((o: any) => ({
          ...o,
          items: (o.order_items || []).map((i: any) => {
            const prod = prods.find((p: any) => p.id === (i.product_id || i.id));
            return {
              id: i.product_id || i.id,
              product_name: i.product_name || prod?.name || 'Unknown Product',
              price: i.price,
              quantity: i.quantity,
              size: i.size || '',
              color: i.color || '',
              image_url: prod?.image_url || '',
            };
          }),
        }));
        setOrders(mapped as Order[]);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((o) =>
    !search.trim() ||
    o.id.toLowerCase().includes(search.toLowerCase()) ||
    (o.address || '').toLowerCase().includes(search.toLowerCase()) ||
    (o.phone || '').toLowerCase().includes(search.toLowerCase())
  );

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
      setSelectedRows(new Set(filteredOrders.map((o) => o.id)));
      setSelectAll(true);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRows.size === 0) return;
    try {
      for (const id of selectedRows) {
        const res = await fetch('/api/admin/data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ table: 'orders', action: 'delete', id }),
        });
        if (!res.ok) throw new Error((await res.json())?.error || 'Delete failed');
      }
      setOrders((prev) => prev.filter((o) => !selectedRows.has(o.id)));
      setSelectedRows(new Set());
      setSelectAll(false);
      setBulkDeleteConfirm(false);
    } catch (err) {
      console.error('Error deleting orders:', err);
      alert('Failed to delete orders from Supabase');
    }
  };

  const handleOrderStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: 'orders', action: 'update', id: orderId, data: { status: newStatus } }),
      });
      if (!res.ok) throw new Error((await res.json())?.error || 'Update failed');
      const updated = (prev: Order[]) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o));
      setOrders(updated);
      useStore.getState().setOrders(updated(useStore.getState().orders));
      useStore.getState().bumpSync();
    } catch (err) {
      console.error('Error updating order status:', err);
    }
    setEditingOrderId(null);
  };

  const exportCSV = () => {
    const rows = selectedRows.size > 0
      ? filteredOrders.filter((d) => selectedRows.has(d.id))
      : filteredOrders;
    const csv = [
      'ID,Total,Status,Payment,Proof,Date,Phone,Address',
      ...rows.map((o) =>
        `"${o.id}",${o.total_price},"${o.status}","${o.payment_method}","${o.payment_proof || ''}","${o.created_at}","${o.phone || ''}","${(o.address || '').replace(/"/g, '""')}"`
      ),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `rutab-orders-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pt-4 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-wider">Orders</h1>
          <p className="text-sm text-[#a1a1a1] mt-1">View, fulfil, and manage customer orders.</p>
        </div>
        <button onClick={fetchOrders} disabled={loading}
          className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition cursor-pointer disabled:opacity-50">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Search + Bulk Actions */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" />
          <input type="text" placeholder="Search orders by ID, address, phone..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-[320px] bg-[#0a0a0a] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#ff0000]/40 transition" />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={exportCSV}
            className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition cursor-pointer">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <AnimatePresence>
            {selectedRows.size > 0 && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-2">
                <span className="text-[10px] text-white font-bold bg-[#ff0000]/10 px-3 py-1.5 rounded-full border border-[#ff0000]/20">
                  {selectedRows.size} selected
                </span>
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
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="h-[40vh] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border border-red-500/30 border-t-red-600 animate-spin" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="h-[40vh] flex flex-col items-center justify-center text-[#a1a1a1]">
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
            { key: 'items', label: 'Items', render: (o: Order) => (
              <div className="flex flex-col gap-1.5 min-w-[180px]">
                {(o.items || []).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    {item.image_url ? (
                      <div className="w-8 h-10 rounded-lg overflow-hidden border border-white/10 shrink-0 bg-black">
                        <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-8 h-10 rounded-lg bg-black border border-white/10 shrink-0 flex items-center justify-center">
                        <ShoppingBag className="w-3 h-3 text-[#333]" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-white truncate max-w-[160px]">{item.product_name}</p>
                      <p className="text-[9px] text-[#a1a1a1]">
                        {item.size && <span className="uppercase">{item.size}</span>}
                        {item.size && ' · '}x{item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )},
            { key: 'total', label: 'Total', render: (o: Order) => (
              <span className="text-xs font-bold text-white">{formatKWD(Number(o.total_price))}</span>
            )},
            { key: 'payment', label: 'Payment', render: (o: Order) => (
              <span className="text-[10px] text-[#a1a1a1]">{o.payment_method}</span>
            )},
            { key: 'proof', label: 'Proof', render: (o: Order) => (
              o.payment_proof ? (
                <button onClick={() => setPreviewImage(o.payment_proof!)}
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
            { key: 'address', label: 'Address', render: (o: Order) => (
              <span className="text-[10px] text-[#555] max-w-[200px] truncate block">{o.address || '—'}</span>
            )},
          ]}
          data={filteredOrders}
          keyExtractor={(o) => o.id}
        />
      )}

      {/* Image preview modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6"
          onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-2xl w-full max-h-[90vh] flex items-center justify-center">
            <button onClick={() => setPreviewImage(null)}
              className="absolute -top-10 right-0 text-white/60 hover:text-white transition cursor-pointer z-10">
              <X className="w-6 h-6" />
            </button>
            <img src={previewImage} alt="Payment proof"
              className="max-w-full max-h-[85vh] rounded-2xl object-contain"
              onClick={(e) => e.stopPropagation()} />
          </div>
        </div>
      )}
    </div>
  );
}
