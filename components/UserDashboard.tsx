'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, Heart, ShoppingBag, LogOut, User, Mail, Phone, MapPin, Edit3, Save, X, ArrowUpRight } from 'lucide-react';
import { useStore } from '../lib/store';
import { getSupabase } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

function formatPrice(price: number, currency: string = 'KWD') {
  return `${currency} ${price.toFixed(3)}`;
}

export default function UserDashboard() {
  const [supaUser, setSupaUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ full_name: '', phone: '', address: '' });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const orders = useStore((s) => s.orders);
  const wishlist = useStore((s) => s.wishlist);
  const currency = useStore((s) => s.currency);
  const setActiveView = useStore((s) => s.setActiveView);

  const totalSpent = orders.reduce((sum, o) => sum + Number(o.total_price || 0), 0);

  const loadProfile = async () => {
    try {
      const supabase = getSupabase();
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setSupaUser(session.user);
        const { data: p } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        if (p) {
          setProfile(p);
          setEditForm({ full_name: p.full_name || '', phone: p.phone || '', address: p.address || '' });
        }
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadProfile(); }, []);

  const handleSaveProfile = async () => {
    if (!supaUser) return;
    setSaving(true);
    setSaveMsg(null);
    try {
      const supabase = getSupabase();
      const { error } = await supabase.from('profiles').update({
        full_name: editForm.full_name,
        phone: editForm.phone,
        address: editForm.address,
      }).eq('id', supaUser.id);
      if (error) throw error;
      setProfile((prev: any) => ({ ...prev, full_name: editForm.full_name, phone: editForm.phone, address: editForm.address }));
      useStore.getState().setUser({
        email: userEmail,
        name: editForm.full_name,
        phone: editForm.phone,
        address: editForm.address,
        area: '',
      });
      setSaveMsg('Profile updated');
      setEditing(false);
    } catch (err: any) {
      setSaveMsg('Failed: ' + err.message);
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="pt-24 min-h-screen bg-black text-white flex items-center justify-center pb-24">
        <div className="w-8 h-8 border-2 border-[#ff0000] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!supaUser) {
    return (
      <div className="pt-24 min-h-screen bg-black text-white px-6 flex items-center justify-center pb-24">
        <div className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[35px] p-8 space-y-6 shadow-2xl text-center">
          <div className="space-y-2">
            <span className="text-[#ff0000] text-xs font-bold tracking-[0.2em] uppercase">Account</span>
            <h2 className="text-3xl font-black uppercase text-white mt-1">Sign In Required</h2>
            <p className="text-[10px] text-[#a1a1a1]">Sign in to view your orders, wishlist, and account details.</p>
          </div>
          <Link href="/auth/login"
            className="inline-block w-full py-4 bg-[#ff0000] text-white hover:bg-[#d60000] font-bold text-sm uppercase tracking-widest rounded-2xl transition shadow-[0_0_30px_rgba(255,0,0,0.3)]">
            Sign In
          </Link>
          <Link href="/auth/signup"
            className="inline-block w-full py-3 border border-white/10 text-white/70 hover:text-white text-xs font-bold uppercase tracking-widest rounded-2xl transition">
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  const userName = profile?.full_name || supaUser.user_metadata?.full_name || '';
  const userEmail = profile?.email || supaUser.email || '';
  const userPhone = profile?.phone || '';
  const userAddress = profile?.address || '';

  const handleSignOut = async () => {
    const supabase = getSupabase();
    await supabase.auth.signOut();
    setSupaUser(null);
    setProfile(null);
    useStore.getState().signOut();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-emerald-500/10 text-emerald-400';
      case 'shipped': return 'bg-blue-500/10 text-blue-400';
      case 'cancelled': return 'bg-red-500/10 text-red-400';
      case 'refunded': return 'bg-zinc-500/10 text-zinc-400';
      default: return 'bg-amber-500/10 text-amber-400';
    }
  };

  return (
    <div className="pt-24 min-h-screen bg-black text-white px-6 pb-24">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(255,0,0,0.15),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.03),transparent_35%)] pointer-events-none z-0" />
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px] pointer-events-none z-0" />

      <div className="max-w-4xl mx-auto relative z-10 space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[#ff0000] text-xs font-bold tracking-[0.2em] uppercase">My Account</span>
            <h2 className="text-3xl font-black uppercase tracking-wider">Dashboard</h2>
          </div>
          <button onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2.5 border border-white/10 rounded-xl text-xs font-bold text-white/70 hover:text-white hover:bg-white/5 transition cursor-pointer">
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>

        {/* Profile Card */}
        <div className="bg-[#0a0a0a] border border-white/10 rounded-[35px] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider">Profile</h3>
            {!editing ? (
              <button onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-white/70 hover:text-white hover:bg-white/10 transition cursor-pointer">
                <Edit3 className="w-3 h-3" /> Edit
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={handleSaveProfile} disabled={saving}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#ff0000] text-white text-[10px] font-bold transition cursor-pointer disabled:opacity-50">
                  <Save className="w-3 h-3" /> {saving ? 'Saving...' : 'Save'}
                </button>
                <button onClick={() => { setEditing(false); setEditForm({ full_name: profile?.full_name || '', phone: profile?.phone || '', address: profile?.address || '' }); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-white/70 hover:text-white transition cursor-pointer">
                  <X className="w-3 h-3" /> Cancel
                </button>
              </div>
            )}
          </div>

          {saveMsg && (
            <div className={`text-[10px] font-bold text-center py-2 px-3 rounded-xl ${saveMsg.includes('Failed') ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
              {saveMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {editing ? (
              <>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[9px] uppercase font-bold tracking-widest text-[#a1a1a1]">Full Name</label>
                  <input value={editForm.full_name} onChange={(e) => setEditForm(f => ({ ...f, full_name: e.target.value }))}
                    className="w-full bg-black border border-white/10 rounded-xl py-2 px-3 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#ff0000]/40 transition" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase font-bold tracking-widest text-[#a1a1a1]">Email</label>
                  <p className="text-xs text-white/50 py-2 px-1">{userEmail}</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase font-bold tracking-widest text-[#a1a1a1]">Phone</label>
                  <input value={editForm.phone} onChange={(e) => setEditForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full bg-black border border-white/10 rounded-xl py-2 px-3 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#ff0000]/40 transition"
                    placeholder="+965 XXXX XXXX" />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[9px] uppercase font-bold tracking-widest text-[#a1a1a1]">Default Shipping Address</label>
                  <textarea value={editForm.address} onChange={(e) => setEditForm(f => ({ ...f, address: e.target.value }))}
                    rows={3}
                    className="w-full bg-black border border-white/10 rounded-xl py-2 px-3 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#ff0000]/40 transition resize-none"
                    placeholder="House/Flat No., Street, Block, Area, City, Country" />
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                  <User className="w-4 h-4 text-[#a1a1a1]" />
                  <div>
                    <p className="text-[9px] text-[#a1a1a1] uppercase tracking-wider font-bold">Name</p>
                    <p className="text-xs text-white">{userName || 'Not set'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                  <Mail className="w-4 h-4 text-[#a1a1a1]" />
                  <div>
                    <p className="text-[9px] text-[#a1a1a1] uppercase tracking-wider font-bold">Email</p>
                    <p className="text-xs text-white">{userEmail}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                  <Phone className="w-4 h-4 text-[#a1a1a1]" />
                  <div>
                    <p className="text-[9px] text-[#a1a1a1] uppercase tracking-wider font-bold">Phone</p>
                    <p className="text-xs text-white">{userPhone || 'Not set'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                  <MapPin className="w-4 h-4 text-[#a1a1a1]" />
                  <div>
                    <p className="text-[9px] text-[#a1a1a1] uppercase tracking-wider font-bold">Default Address</p>
                    <p className="text-xs text-white">{userAddress || 'Not set — add one in Edit'}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <button onClick={() => setActiveView('orders')}
            className="p-5 rounded-2xl bg-[#0a0a0a] border border-white/10 text-center space-y-1 hover:bg-white/5 transition cursor-pointer group">
            <Package className="w-5 h-5 text-[#a1a1a1] mx-auto group-hover:text-[#ff0000] transition" />
            <p className="text-2xl font-black text-white">{orders.length}</p>
            <p className="text-[9px] text-[#a1a1a1] uppercase tracking-wider font-bold">Orders</p>
          </button>
          <button onClick={() => setActiveView('wishlist')}
            className="p-5 rounded-2xl bg-[#0a0a0a] border border-white/10 text-center space-y-1 hover:bg-white/5 transition cursor-pointer group">
            <Heart className="w-5 h-5 text-[#a1a1a1] mx-auto group-hover:text-[#ff0000] transition" />
            <p className="text-2xl font-black text-white">{wishlist.length}</p>
            <p className="text-[9px] text-[#a1a1a1] uppercase tracking-wider font-bold">Wishlist</p>
          </button>
          <div className="p-5 rounded-2xl bg-[#0a0a0a] border border-white/10 text-center space-y-1">
            <ShoppingBag className="w-5 h-5 text-[#a1a1a1] mx-auto" />
            <p className="text-2xl font-black text-white">{formatPrice(totalSpent, currency)}</p>
            <p className="text-[9px] text-[#a1a1a1] uppercase tracking-wider font-bold">Spent</p>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-[#0a0a0a] border border-white/10 rounded-[35px] p-6 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider">Recent Orders</h3>
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-8 h-8 text-[#333] mx-auto mb-3" />
              <p className="text-[10px] text-[#a1a1a1]">No orders yet</p>
              <button onClick={() => setActiveView('shop')}
                className="mt-3 px-4 py-2 bg-[#ff0000] text-white text-[10px] font-bold uppercase tracking-wider rounded-xl hover:bg-[#d60000] transition cursor-pointer">
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                      <Package className="w-3.5 h-3.5 text-[#555]" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white font-mono">#{order.id.slice(0, 8)}</p>
                      <p className="text-[9px] text-[#555]">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[8px] uppercase font-black px-2 py-0.5 rounded-full ${getStatusBadge(order.status)}`}>
                      {order.status}
                    </span>
                    <span className="text-xs font-bold text-white">{formatPrice(Number(order.total_price), currency)}</span>
                    <button onClick={() => { useStore.getState().setTrackingOrderId(order.id); setActiveView('track'); }}
                      className="text-[#555] hover:text-[#ff0000] transition cursor-pointer">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {orders.length > 0 && (
            <button onClick={() => setActiveView('orders')}
              className="w-full text-center text-[10px] font-bold uppercase tracking-widest text-[#ff0000] hover:text-white transition cursor-pointer pt-2">
              View All Orders ({orders.length})
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
