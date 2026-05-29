'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSupabase } from '@/lib/supabase';
import { Order } from '@/lib/store';
import { mockOrders as mockOrdersData } from '@/lib/admin-store';
import {
  Search, Users, ChevronDown, ChevronUp, Download,
  Pencil, CheckCircle2, X, Package, DollarSign, Calendar,
  Filter, Trash2, AlertTriangle, RefreshCw
} from 'lucide-react';
import EditCustomerModal from './EditCustomerModal';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  address?: string;
  area?: string;
  notes?: string;
  status?: 'active' | 'vip' | 'inactive' | 'flagged';
  created_at: string;
}

type SortKey = 'name' | 'orders' | 'spent' | 'date';
type StatusFilter = 'all' | 'active' | 'vip' | 'inactive' | 'flagged';
type DateFilter = 'all' | 'month' | 'week' | 'today';

interface CustomerStats {
  orderCount: number;
  totalSpent: number;
}

function getInitials(name: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return parts[0][0].toUpperCase();
}

function formatKWD(value: number): string {
  return `${value.toFixed(3)} KWD`;
}

const PAGE_SIZE = 8;

const statusConfig = {
  vip: { label: 'VIP', class: 'bg-amber-500/10 border border-amber-500/30 text-amber-400' },
  active: { label: 'Active', class: 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' },
  inactive: { label: 'Inactive', class: 'bg-zinc-500/10 border border-zinc-500/30 text-zinc-400' },
  flagged: { label: 'Flagged', class: 'bg-red-500/10 border border-red-500/30 text-red-400' },
};

export default function CustomersPanel() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [areaFilter, setAreaFilter] = useState('');

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectAllOnPage, setSelectAllOnPage] = useState(false);

  // Sort
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortAsc, setSortAsc] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);

  // Expanded customer (order history)
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Edit modal
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);

  // Sync state
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  const handleSyncUsers = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch('/api/admin/sync-users', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSyncResult(`Synced! ${data.profiles_created} created, ${data.profiles_skipped} skipped`);
        fetchData();
      } else {
        setSyncResult('Sync failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err: any) {
      setSyncResult('Sync error: ' + err.message);
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncResult(null), 4000);
    }
  };

  const didFetch = useRef(false);

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

      const { data: profileData } = await client
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (profileData && profileData.length > 0) setProfiles(profileData as Profile[]);

      let { data: orderData } = await client
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (!orderData || orderData.length === 0) {
        const { error: seedErr } = await client.from('orders').insert(
          (mockOrdersData as any[]).map((o: any) => ({ ...o, created_at: new Date(o.created_at).toISOString() }))
        );
        if (!seedErr) {
          const { data } = await client.from('orders').select('*').order('created_at', { ascending: false });
          orderData = data;
        }
      }

      if (orderData && orderData.length > 0) setAllOrders(orderData as Order[]);
      else setAllOrders(mockOrdersData as any[]);
    } catch {
      setAllOrders(mockOrdersData as any[]);
    } finally {
      setLoading(false);
    }
  };

  // Compute stats per profile by matching phone number
  const statsMap = useMemo<Map<string, CustomerStats>>(() => {
    const map = new Map<string, CustomerStats>();
    for (const p of profiles) {
      const phone = p.phone?.trim();
      if (!phone) {
        map.set(p.id, { orderCount: 0, totalSpent: 0 });
        continue;
      }
      const customerOrders = allOrders.filter((o) => o.phone?.trim() === phone);
      const totalSpent = customerOrders.reduce(
        (sum, o) => sum + (typeof o.total_price === 'number' ? o.total_price : parseFloat(String(o.total_price))),
        0
      );
      map.set(p.id, { orderCount: customerOrders.length, totalSpent });
    }
    return map;
  }, [profiles, allOrders]);

  // Filtered & sorted list
  const filtered = useMemo(() => {
    let result = [...profiles];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.full_name?.toLowerCase().includes(q) ||
          p.email?.toLowerCase().includes(q) ||
          p.phone?.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((p) => (p.status || inferStatus(p.id)) === statusFilter);
    }

    // Area filter
    if (areaFilter.trim()) {
      const q = areaFilter.toLowerCase();
      result = result.filter((p) => p.area?.toLowerCase().includes(q));
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = Date.now();
      const day = 86400000;
      const cutoff =
        dateFilter === 'today' ? now - day :
        dateFilter === 'week' ? now - 7 * day :
        now - 30 * day;
      result = result.filter((p) => new Date(p.created_at).getTime() >= cutoff);
    }

    // Sort
    result.sort((a, b) => {
      const statsA = statsMap.get(a.id) || { orderCount: 0, totalSpent: 0 };
      const statsB = statsMap.get(b.id) || { orderCount: 0, totalSpent: 0 };
      let cmp = 0;
      switch (sortKey) {
        case 'name': cmp = (a.full_name || '').localeCompare(b.full_name || ''); break;
        case 'orders': cmp = statsA.orderCount - statsB.orderCount; break;
        case 'spent': cmp = statsA.totalSpent - statsB.totalSpent; break;
        case 'date': cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime(); break;
      }
      return sortAsc ? cmp : -cmp;
    });

    return result;
  }, [profiles, search, statusFilter, areaFilter, dateFilter, sortKey, sortAsc, statsMap]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const inferStatus = (profileId: string): Profile['status'] => {
    const stats = statsMap.get(profileId);
    if (!stats) return 'inactive';
    if (stats.orderCount >= 5 || stats.totalSpent > 500) return 'vip';
    if (stats.orderCount > 0) return 'active';
    return 'inactive';
  };

  const getCustomerOrders = (profile: Profile): Order[] => {
    if (!profile.phone?.trim()) return [];
    return allOrders.filter((o) => o.phone?.trim() === profile.phone.trim());
  };

  // Bulk actions
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectAllOnPage) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pageItems.map((p) => p.id)));
    }
    setSelectAllOnPage(!selectAllOnPage);
  };

  const deleteUsers = async (ids: string[]) => {
    try {
      const res = await fetch('/api/admin/delete-users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Delete failed');
      }
      setProfiles((prev) => prev.filter((p) => !ids.includes(p.id)));
    } catch (err: any) {
      console.error('Error deleting profiles:', err);
      alert(err.message || 'Failed to delete profiles');
    }
  };

  const handleBulkDelete = async () => {
    await deleteUsers(Array.from(selectedIds));
    setSelectedIds(new Set());
    setSelectAllOnPage(false);
    setBulkDeleteConfirm(false);
  };

  const handleDeleteSingle = async (id: string) => {
    await deleteUsers([id]);
  };

  const exportCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Status', 'Orders', 'Total Spent', 'Area', 'Registered'];
    const rows = selectedIds.size > 0
      ? profiles.filter((p) => selectedIds.has(p.id))
      : profiles;
    const csv = [
      headers.join(','),
      ...rows.map((p) => {
        const status = p.status || inferStatus(p.id) || 'inactive';
        const stats = statsMap.get(p.id) || { orderCount: 0, totalSpent: 0 };
        return [
          p.id, `"${p.full_name || ''}"`, `"${p.email || ''}"`, `"${p.phone || ''}"`,
          status, stats.orderCount, stats.totalSpent.toFixed(3), `"${p.area || ''}"`,
          new Date(p.created_at).toLocaleDateString()
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rutab-customers-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleProfileUpdated = (updated: Profile) => {
    setProfiles((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setEditingProfile(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between pb-4 border-b border-white/5">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-wider">Vault Members</h2>
          <p className="text-sm text-[#a1a1a1] mt-1">
            {filtered.length} customer{filtered.length !== 1 ? 's' : ''} registered
          </p>
          {syncResult && (
            <p className="text-[10px] mt-1 font-bold uppercase tracking-wider text-emerald-400">{syncResult}</p>
          )}
        </div>
        <button onClick={handleSyncUsers} disabled={syncing}
          className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition cursor-pointer disabled:opacity-50">
          <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing...' : 'Sync Users'}
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-3">
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a1a1a1]" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#ff0000]/40 transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest text-[#a1a1a1] font-bold mr-1">
            <Filter className="w-3 h-3 inline mr-1" />
            Status
          </span>
          {(['all', 'active', 'vip', 'inactive', 'flagged'] as const).map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3.5 py-1.5 rounded-full uppercase text-[9px] font-bold tracking-[0.25em] transition cursor-pointer ${
                statusFilter === s
                  ? 'bg-[#ff0000] text-white'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              {s === 'all' ? 'All' : s}
            </button>
          ))}

          <span className="text-[10px] uppercase tracking-widest text-[#a1a1a1] font-bold ml-3 mr-1">
            <Calendar className="w-3 h-3 inline mr-1" />
            Joined
          </span>
          {(['all', 'month', 'week', 'today'] as const).map((d) => (
            <button
              key={d}
              onClick={() => { setDateFilter(d); setPage(1); }}
              className={`px-3.5 py-1.5 rounded-full uppercase text-[9px] font-bold tracking-[0.25em] transition cursor-pointer ${
                dateFilter === d
                  ? 'bg-[#ff0000] text-white'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              {d === 'all' ? 'All Time' : d === 'month' ? '30d' : d === 'week' ? '7d' : 'Today'}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="flex items-center justify-between bg-[#ff0000]/10 border border-[#ff0000]/20 rounded-2xl px-5 py-3"
          >
            <span className="text-xs font-bold text-white">
              {selectedIds.size} selected
            </span>
            <div className="flex items-center gap-3">
              {!bulkDeleteConfirm ? (
                <button onClick={() => setBulkDeleteConfirm(true)}
                  className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition cursor-pointer">
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              ) : (
                <>
                  <button onClick={handleBulkDelete}
                    className="px-4 py-2 rounded-xl bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition cursor-pointer">
                    <AlertTriangle className="w-3.5 h-3.5" /> Confirm
                  </button>
                  <button onClick={() => setBulkDeleteConfirm(false)}
                    className="px-4 py-2 rounded-xl border border-white/10 text-white/70 text-[10px] font-bold uppercase tracking-widest transition cursor-pointer">
                    Cancel
                  </button>
                </>
              )}
              <button
                onClick={exportCSV}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
              <button
                onClick={() => setSelectedIds(new Set())}
                className="px-4 py-2 rounded-xl border border-white/10 hover:border-white/30 text-white/70 hover:text-white text-[10px] font-bold uppercase tracking-widest transition cursor-pointer"
              >
                <X className="w-3.5 h-3.5 inline mr-1" />
                Clear
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sort Controls */}
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#a1a1a1] font-bold">
        <span>Sort by:</span>
        {(['name', 'orders', 'spent', 'date'] as const).map((key) => (
          <button
            key={key}
            onClick={() => {
              if (sortKey === key) setSortAsc(!sortAsc);
              else { setSortKey(key); setSortAsc(false); }
            }}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 ${
              sortKey === key
                ? 'bg-white/10 text-white'
                : 'hover:text-white hover:bg-white/5'
            }`}
          >
            {key === 'name' ? 'Name' : key === 'orders' ? 'Orders' : key === 'spent' ? 'Spent' : 'Registered'}
            {sortKey === key && (
              <ChevronDown className={`w-3 h-3 transition ${sortAsc ? 'rotate-180' : ''}`} />
            )}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="h-[40vh] flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#ff0000] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-[#a1a1a1] text-xs uppercase tracking-widest">Loading vault members...</p>
        </div>
      ) : pageItems.length === 0 ? (
        <div className="h-[30vh] flex flex-col items-center justify-center text-[#a1a1a1]">
          <Users className="w-10 h-10 mb-3 opacity-40" />
          <p className="text-xs uppercase tracking-widest font-bold">
            {search || statusFilter !== 'all' || dateFilter !== 'all'
              ? 'No members match your filters'
              : 'No vault members yet'}
          </p>
        </div>
      ) : (
        <>
          {/* Customer Cards */}
          <div className="space-y-2">
            {/* Select All header */}
            <div className="flex items-center gap-4 px-1 py-2">
              <button onClick={toggleSelectAll}
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition cursor-pointer ${
                  selectAllOnPage
                    ? 'bg-[#ff0000] border-[#ff0000]'
                    : 'border-white/20 hover:border-white/40'
                }`}>
                {selectAllOnPage && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
              </button>
              <span className="text-[10px] uppercase tracking-widest text-[#a1a1a1] font-bold">
                {selectAllOnPage ? `${pageItems.length} selected on this page` : 'Select all on this page'}
              </span>
            </div>
            <AnimatePresence mode="popLayout">
              {pageItems.map((profile, index) => {
                const status = profile.status || inferStatus(profile.id) || 'inactive';
                const cfg = statusConfig[status];
                const stats = statsMap.get(profile.id) || { orderCount: 0, totalSpent: 0 };
                const isSelected = selectedIds.has(profile.id);
                const isExpanded = expandedId === profile.id;
                const customerOrders = getCustomerOrders(profile);

                return (
                  <motion.div
                    key={profile.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: index * 0.03 }}
                    className={`rounded-2xl border transition-colors ${
                      isSelected
                        ? 'border-[#ff0000]/40 bg-[#ff0000]/5'
                        : 'border-white/5 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    {/* Card Header */}
                    <div className="p-4 flex items-center gap-4">
                      {/* Checkbox */}
                      <button
                        onClick={() => toggleSelect(profile.id)}
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition cursor-pointer ${
                          isSelected
                            ? 'bg-[#ff0000] border-[#ff0000]'
                            : 'border-white/20 hover:border-white/40'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                      </button>

                      {/* Avatar */}
                      <div className="w-11 h-11 rounded-full bg-[#ff0000]/10 border border-[#ff0000]/20 flex items-center justify-center text-[#ff0000] font-black text-sm shrink-0 uppercase">
                        {getInitials(profile.full_name)}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-[1fr_1fr_auto_auto] gap-x-6 gap-y-1 items-center">
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-white truncate">
                            {profile.full_name || 'Unknown'}
                          </h4>
                          <p className="text-[10px] text-[#a1a1a1] truncate">{profile.email}</p>
                        </div>

                        <div className="text-[11px] text-[#a1a1a1] hidden md:block">
                          {profile.phone || '—'}
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5 text-[11px]">
                            <Package className="w-3 h-3 text-[#ff0000]" />
                            <span className="font-bold text-white">{stats.orderCount}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px]">
                            <DollarSign className="w-3 h-3 text-emerald-400" />
                            <span className="font-bold text-white">{formatKWD(stats.totalSpent)}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 justify-self-end">
                          <span className={`text-[9px] uppercase font-black px-2.5 py-1 rounded-full ${cfg.class}`}>
                            {cfg.label}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => setEditingProfile(profile)}
                          className="w-8 h-8 rounded-lg border border-white/10 hover:border-white/30 flex items-center justify-center text-[#a1a1a1] hover:text-white transition cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => { if (confirm('Delete this user?')) handleDeleteSingle(profile.id); }}
                          className="w-8 h-8 rounded-lg border border-white/10 hover:border-red-500/30 hover:bg-red-500/10 flex items-center justify-center text-[#a1a1a1] hover:text-red-400 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : profile.id)}
                          className="w-8 h-8 rounded-lg border border-white/10 hover:border-white/30 flex items-center justify-center text-[#a1a1a1] hover:text-white transition cursor-pointer"
                        >
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Order History */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-white/5 px-4 pb-4 pt-3">
                            <h5 className="text-[10px] uppercase tracking-widest font-bold text-[#a1a1a1] mb-3 flex items-center gap-2">
                              <Package className="w-3 h-3" />
                              Order History ({customerOrders.length})
                            </h5>
                            {customerOrders.length === 0 ? (
                              <p className="text-[11px] text-[#555] italic">No orders yet.</p>
                            ) : (
                              <div className="space-y-2 max-h-52 overflow-y-auto no-scrollbar pr-1">
                                {customerOrders.map((ord) => (
                                  <div
                                    key={ord.id}
                                    className="flex items-center justify-between bg-black/30 rounded-xl px-4 py-2.5 border border-white/5"
                                  >
                                    <div className="space-y-0.5 min-w-0">
                                      <p className="font-mono text-[10px] text-white/80 truncate">
                                        #{ord.id.slice(0, 8)}
                                      </p>
                                      <p className="text-[10px] text-[#a1a1a1]">
                                        {new Date(ord.created_at).toLocaleDateString('en-GB', {
                                          day: '2-digit', month: 'short', year: 'numeric'
                                        })}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <span className="text-[10px] font-bold text-white">
                                        {formatKWD(
                                          typeof ord.total_price === 'number'
                                            ? ord.total_price
                                            : parseFloat(String(ord.total_price))
                                        )}
                                      </span>
                                      <span className={`text-[8px] uppercase font-black px-2 py-0.5 rounded-full ${
                                        ord.status === 'delivered'
                                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                          : ord.status === 'shipped'
                                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                      }`}>
                                        {ord.status}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <p className="text-[10px] text-[#a1a1a1]">
              Page {safePage} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, safePage - 1))}
                disabled={safePage <= 1}
                className="px-4 py-2 rounded-xl border border-white/10 hover:border-white/30 text-xs font-bold text-white disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                    p === safePage
                      ? 'bg-[#ff0000] text-white'
                      : 'border border-white/10 text-[#a1a1a1] hover:border-white/30 hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(Math.min(totalPages, safePage + 1))}
                disabled={safePage >= totalPages}
                className="px-4 py-2 rounded-xl border border-white/10 hover:border-white/30 text-xs font-bold text-white disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {/* Edit Customer Modal */}
      {editingProfile && (
        <EditCustomerModal
          profile={editingProfile}
          onClose={() => setEditingProfile(null)}
          onSaved={handleProfileUpdated}
        />
      )}
    </div>
  );
}
