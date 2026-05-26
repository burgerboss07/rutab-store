'use client';

import { useState, useEffect, useCallback } from 'react';
import { useStore, Product, formatPrice } from '../lib/store';
import { getSupabase } from '../lib/supabase';
import { createClient } from '@/lib/supabase-browser';
import {
  User, LogOut, Package, MapPin, Heart, Key, Loader2, Plus, ShoppingBag,
  Trash2, Star, Pencil, Save, X, Mail, Phone, Crown
} from 'lucide-react';
import Image from 'next/image';

interface Address {
  id: string;
  title: string;
  address_line1: string;
  area: string;
  is_default: boolean;
}

export default function UserDashboard() {
  const user = useStore((s) => s.user);
  const setUser = useStore((s) => s.setUser);
  const orders = useStore((s) => s.orders);
  const wishlist = useStore((s) => s.wishlist);
  const toggleWishlist = useStore((s) => s.toggleWishlist);
  const addToCart = useStore((s) => s.addToCart);
  const currency = useStore((s) => s.currency);

  const supabase = typeof window !== 'undefined' ? createClient() : null;

  // Auth state
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoggingIn, setLoggingIn] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  // Tab
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'wishlist' | 'profile'>('orders');

  // Wishlist
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [loadingWishlist, setLoadingWishlist] = useState(false);

  // Addresses (DB-backed)
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [newAddrTitle, setNewAddrTitle] = useState('');
  const [newAddrLine, setNewAddrLine] = useState('');
  const [newAddrArea, setNewAddrArea] = useState('');
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  // Profile editing
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');

  // Loyalty
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [loyaltyTier, setLoyaltyTier] = useState<'Bronze' | 'Silver' | 'Gold' | 'Platinum'>('Bronze');

  // Fetch wishlist product details
  useEffect(() => {
    async function fetchWishlistDetails() {
      if (wishlist.length === 0) { setWishlistProducts([]); return; }
      setLoadingWishlist(true);
      try {
        const client = getSupabase();
        const { data } = await client.from('products').select('*').in('id', wishlist);
        if (data) setWishlistProducts(data as Product[]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingWishlist(false);
      }
    }
    fetchWishlistDetails();
  }, [wishlist]);

  // Fetch addresses and profile from DB when user is logged in
  const fetchProfileData = useCallback(async () => {
    if (!user || !supabase) return;
    setLoadingAddresses(true);
    try {
      // Fetch current auth user to get ID
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      // Fetch addresses
      const { data: addrData } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', authUser.id)
        .order('is_default', { ascending: false });
      if (addrData) setAddresses(addrData as Address[]);

      // Fetch profile (for loyalty points)
      const { data: profile } = await supabase
        .from('profiles')
        .select('loyalty_points, role, full_name, phone')
        .eq('id', authUser.id)
        .single();

      if (profile) {
        const pts = (profile as any).loyalty_points || 0;
        setLoyaltyPoints(pts);
        if (pts >= 1000) setLoyaltyTier('Platinum');
        else if (pts >= 500) setLoyaltyTier('Gold');
        else if (pts >= 100) setLoyaltyTier('Silver');
        else setLoyaltyTier('Bronze');
        if (!editName) setEditName((profile as any).full_name || '');
        if (!editPhone) setEditPhone((profile as any).phone || '');
      }
    } catch (err) {
      console.error('Failed to fetch profile data:', err);
    } finally {
      setLoadingAddresses(false);
    }
  }, [user, supabase]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (user) fetchProfileData();
  }, [user, fetchProfileData]);

  // Auth handlers
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    setAuthError('');
    setAuthSuccess('');
    try {
      const client = getSupabase();
      if (authMode === 'login') {
        const { data, error } = await client.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user) {
          await client.from('profiles').upsert({
            id: data.user.id, email, full_name: data.user.user_metadata?.full_name || 'Rutab Member',
            phone: data.user.user_metadata?.phone || '+965 9999 8888',
          }, { onConflict: 'id' });
          setUser({
            email: data.user.email || email,
            name: data.user.user_metadata?.full_name || 'Rutab Member',
            phone: data.user.user_metadata?.phone || '+965 9999 8888',
            address: '', area: '',
          });
        }
      } else {
        const { data, error } = await client.auth.signUp({
          email, password,
          options: { data: { full_name: name || 'Rutab Member', phone: phone || '+965 9999 8888' } },
        });
        if (error) throw error;
        if (data.user) {
          await client.from('profiles').upsert({
            id: data.user.id, email, full_name: name || 'Rutab Member', phone: phone || '+965 9999 8888',
          }, { onConflict: 'id' });
          if (data.session) {
            setUser({
              email: data.user.email || email, name: name || 'Rutab Member',
              phone: phone || '+965 9999 8888', address: '', area: '',
            });
          } else {
            setAuthSuccess('Account created! Check your email to verify.');
          }
        }
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    const client = getSupabase();
    await client.auth.signOut();
    setUser(null);
  };

  // Address handlers (DB-backed)
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrTitle || !newAddrLine) return;
    try {
      const { data: { user: authUser } } = await (supabase || getSupabase()).auth.getUser();
      if (!authUser) return;
      const client = supabase || getSupabase();
      const { data, error } = await client.from('addresses').insert({
        user_id: authUser.id,
        title: newAddrTitle,
        address_line1: newAddrLine,
        area: newAddrArea || null,
      }).select().single();
      if (error) throw error;
      if (data) setAddresses((prev) => [...prev, data as Address]);
      setNewAddrTitle('');
      setNewAddrLine('');
      setNewAddrArea('');
      setShowAddAddress(false);
    } catch (err) {
      console.error('Failed to save address:', err);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      const client = supabase || getSupabase();
      await client.from('addresses').delete().eq('id', id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error('Failed to delete address:', err);
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    try {
      const client = supabase || getSupabase();
      const { data: { user: authUser } } = await client.auth.getUser();
      if (!authUser) return;
      await client.from('addresses').update({ is_default: false }).eq('user_id', authUser.id);
      await client.from('addresses').update({ is_default: true }).eq('id', id);
      setAddresses((prev) =>
        prev.map((a) => ({ ...a, is_default: a.id === id }))
      );
    } catch (err) {
      console.error('Failed to set default address:', err);
    }
  };

  // Profile update
  const handleUpdateProfile = async () => {
    try {
      const client = supabase || getSupabase();
      const { data: { user: authUser } } = await client.auth.getUser();
      if (!authUser) return;
      await client.from('profiles').update({
        full_name: editName, phone: editPhone,
      }).eq('id', authUser.id);
      if (user) setUser({ ...user, name: editName, phone: editPhone });
      setEditing(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  const formatKWD = (v: number) => formatPrice(v, currency);

  // Auth Portal
  if (!user) {
    return (
      <div className="pt-24 min-h-screen bg-black text-white px-6 flex items-center justify-center pb-24">
        <form onSubmit={handleAuth}
          className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[35px] p-8 space-y-6 shadow-2xl animate-fade-in-up">
          <div className="text-center">
            <span className="text-[#ff0000] text-xs font-bold tracking-[0.2em] uppercase">Rutab Vault</span>
            <h2 className="text-3xl font-black uppercase text-white mt-1">{authMode === 'login' ? 'Vault Sign In' : 'Vault Register'}</h2>
          </div>
          <div className="grid grid-cols-2 p-1 bg-black border border-white/5 rounded-2xl">
            <button type="button" onClick={() => { setAuthMode('login'); setAuthError(''); setAuthSuccess(''); }}
              className={`py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition cursor-pointer ${authMode === 'login' ? 'bg-[#ff0000] text-white' : 'text-white/60 hover:text-white'}`}>Sign In</button>
            <button type="button" onClick={() => { setAuthMode('register'); setAuthError(''); setAuthSuccess(''); }}
              className={`py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition cursor-pointer ${authMode === 'register' ? 'bg-[#ff0000] text-white' : 'text-white/60 hover:text-white'}`}>Register</button>
          </div>
          {authError && <div className="bg-red-500/10 border border-red-500/30 text-red-500 text-[10px] text-center p-3 rounded-xl font-bold uppercase tracking-widest">{authError}</div>}
          {authSuccess && <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] text-center p-3 rounded-xl font-bold uppercase tracking-widest">{authSuccess}</div>}
          <div className="space-y-4">
            {authMode === 'register' && (
              <><Input label="Full Name" type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Ahmad Al-Sabah" /><Input label="Phone Number" type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+965 9999 9999" /></>
            )}
            <Input label="Email Address" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@domain.com" />
            <Input label="Password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <button type="submit" disabled={isLoggingIn}
            className="w-full py-4 bg-[#ff0000] text-white hover:bg-[#d60000] disabled:bg-zinc-700 font-bold text-xs uppercase tracking-widest rounded-xl transition cursor-pointer flex items-center justify-center gap-2">
            {isLoggingIn ? <><Loader2 className="w-4 h-4 animate-spin" /> {authMode === 'login' ? 'Accessing Vault...' : 'Creating...'}</> : <><Key className="w-4 h-4" /> {authMode === 'login' ? 'Access Dashboard' : 'Create Account'}</>}
          </button>
          <div className="text-center">
            {authMode === 'login' ? (
              <button type="button" onClick={() => { setAuthMode('register'); setAuthError(''); setAuthSuccess(''); }}
                className="text-[10px] text-white/50 hover:text-white transition uppercase font-bold tracking-wider cursor-pointer">New to Rutab? <span className="text-[#ff0000] underline">Register now</span></button>
            ) : (
              <button type="button" onClick={() => { setAuthMode('login'); setAuthError(''); setAuthSuccess(''); }}
                className="text-[10px] text-white/50 hover:text-white transition uppercase font-bold tracking-wider cursor-pointer">Already a member? <span className="text-[#ff0000] underline">Sign In</span></button>
            )}
          </div>
        </form>
      </div>
    );
  }

  // Dashboard (authenticated)
  return (
    <div className="pt-24 min-h-screen bg-black text-white px-6 max-w-6xl mx-auto pb-24 grid md:grid-cols-[250px_1fr] gap-10 items-start">
      <aside className="space-y-6">
        {/* Profile Card */}
        <div className="bg-[#0a0a0a] border border-white/5 rounded-[30px] p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#ff0000]/10 border border-[#ff0000]/20 flex items-center justify-center text-[#ff0000]">
              <User className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm uppercase text-white truncate max-w-[130px]">{user.name}</h3>
              <p className="text-[10px] text-[#a1a1a1] truncate max-w-[130px]">{user.email}</p>
            </div>
          </div>
          {/* Loyalty Badge */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <div className="flex-1">
              <p className="text-[9px] font-bold text-amber-400 uppercase tracking-wider">{loyaltyTier}</p>
              <p className="text-[8px] text-amber-400/60">{loyaltyPoints} pts</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full py-2.5 rounded-xl border border-white/10 hover:border-red-500/30 hover:bg-red-500/10 text-white/60 hover:text-white transition text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer">
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>

        {/* Tabs */}
        <div className="flex flex-col gap-2 bg-[#0a0a0a] border border-white/5 rounded-[30px] p-4 shadow-xl">
          {[
            { id: 'orders' as const, label: 'Orders', icon: <Package className="w-4 h-4" />, count: orders.length },
            { id: 'addresses' as const, label: 'Addresses', icon: <MapPin className="w-4 h-4" />, count: addresses.length },
            { id: 'wishlist' as const, label: 'Wishlist', icon: <Heart className="w-4 h-4" />, count: wishlist.length },
            { id: 'profile' as const, label: 'Profile', icon: <User className="w-4 h-4" />, count: undefined },
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`w-full py-3.5 px-4 rounded-2xl flex items-center gap-3 text-xs uppercase font-bold tracking-wider transition-colors cursor-pointer ${activeTab === tab.id ? 'bg-[#ff0000] text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
              {tab.icon} {tab.label} {tab.count !== undefined && <span className="text-[9px] opacity-60">({tab.count})</span>}
            </button>
          ))}
        </div>
      </aside>

      <main className="bg-[#0a0a0a] border border-white/5 rounded-[40px] p-6 md:p-8 shadow-xl min-h-[50vh]">
        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-black uppercase tracking-wider pb-4 border-b border-white/5">Order History</h2>
            {orders.length === 0 ? (
              <div className="text-center py-12 text-[#a1a1a1] text-xs">No orders placed yet.</div>
            ) : (
              <div className="space-y-5">
                {orders.map((ord) => (
                  <div key={ord.id} className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                      <div><p className="text-[10px] text-[#a1a1a1] uppercase">Invoice</p><p className="font-mono text-xs font-bold text-white truncate max-w-[200px]">#{ord.id.slice(0, 8)}</p></div>
                      <div><p className="text-[10px] text-[#a1a1a1] uppercase text-left sm:text-right">Date</p><p className="text-xs font-bold text-white">{new Date(ord.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p></div>
                      <div><p className="text-[10px] text-[#a1a1a1] uppercase text-left sm:text-right">Status</p><span className={`text-[9px] uppercase font-black px-3 py-1 rounded-full inline-block ${ord.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : ord.status === 'shipped' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>{ord.status}</span></div>
                    </div>
                    <div className="space-y-2">
                      {ord.items.map((item, i) => (
                        <div key={i} className="flex justify-between items-center text-xs">
                          <span className="text-[#e5e5e5] truncate max-w-[240px]">{item.product_name} ({item.size}) <strong className="text-[#a1a1a1]">x{item.quantity}</strong></span>
                          <span className="font-bold text-[#ff0000]">{formatKWD(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-white/5 pt-3 flex justify-between items-center text-xs">
                      <span className="text-[#a1a1a1]">Payment: {ord.payment_method}</span>
                      <span className="text-sm font-black text-white">Total: <span className="text-[#ff0000]">{formatKWD(ord.total_price)}</span></span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Addresses Tab */}
        {activeTab === 'addresses' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-white/5">
              <h2 className="text-3xl font-black uppercase tracking-wider">Saved Addresses</h2>
              <button onClick={() => setShowAddAddress(!showAddAddress)}
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-[#ff0000] hover:text-white border border-white/10 flex items-center justify-center transition cursor-pointer"><Plus className="w-4 h-4" /></button>
            </div>
            {showAddAddress && (
              <form onSubmit={handleSaveAddress} className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-4 animate-fade-in-up">
                <Input label="Address Title" type="text" required value={newAddrTitle} onChange={(e) => setNewAddrTitle(e.target.value)} placeholder="e.g. Home, Office" />
                <Input label="Full Address" type="text" required value={newAddrLine} onChange={(e) => setNewAddrLine(e.target.value)} placeholder="Street, building, apartment" />
                <Input label="Area / District" type="text" value={newAddrArea} onChange={(e) => setNewAddrArea(e.target.value)} placeholder="Salmiya" />
                <button type="submit" className="px-6 py-2.5 bg-white text-black hover:bg-[#ff0000] hover:text-white rounded-xl text-xs font-bold uppercase transition cursor-pointer">Save Address</button>
              </form>
            )}
            {loadingAddresses ? (
              <div className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[#ff0000] mx-auto" /></div>
            ) : addresses.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <MapPin className="w-8 h-8 text-white/20 mx-auto" />
                <p className="text-[#a1a1a1] text-xs font-bold uppercase tracking-wider">No saved addresses yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {addresses.map((addr) => (
                  <div key={addr.id} className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <MapPin className={`w-5 h-5 shrink-0 mt-0.5 ${addr.is_default ? 'text-[#ff0000]' : 'text-[#a1a1a1]'}`} />
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs uppercase text-white flex items-center gap-2">
                          {addr.title}
                          {addr.is_default && <span className="text-[8px] bg-[#ff0000]/10 text-[#ff0000] px-2 py-0.5 rounded-full uppercase font-black">Default</span>}
                        </h4>
                        <p className="text-xs text-[#a1a1a1] mt-1">{addr.address_line1}</p>
                        {addr.area && <p className="text-[10px] text-[#555]">{addr.area}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {!addr.is_default && (
                        <button onClick={() => handleSetDefaultAddress(addr.id)}
                          className="p-2 text-white/40 hover:text-emerald-400 hover:bg-white/5 rounded-lg transition cursor-pointer" title="Set as default"><Star className="w-3.5 h-3.5" /></button>
                      )}
                      <button onClick={() => handleDeleteAddress(addr.id)}
                        className="p-2 text-white/40 hover:text-[#ff0000] hover:bg-white/5 rounded-lg transition cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Wishlist Tab */}
        {activeTab === 'wishlist' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-black uppercase tracking-wider pb-4 border-b border-white/5">My Wishlist</h2>
            {wishlist.length === 0 ? (
              <div className="text-center py-12 text-[#a1a1a1] text-xs">Your wishlist is empty.</div>
            ) : loadingWishlist ? (
              <div className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[#ff0000] mx-auto" /></div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {wishlistProducts.map((p) => (
                  <div key={p.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex gap-3 items-center justify-between">
                    <div className="flex gap-3 items-center min-w-0">
                      <div className="w-12 h-16 relative rounded-xl border border-white/10 bg-black overflow-hidden shrink-0">
                        <Image src={p.image_url} alt={p.name} fill sizes="48px" className="object-cover" unoptimized />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs uppercase text-white truncate">{p.name}</h4>
                        <p className="text-[10px] text-[#ff0000] font-bold mt-0.5">{formatKWD(typeof p.price === 'string' ? parseFloat(p.price) : p.price)}</p>
                      </div>
                    </div>
                    <button onClick={() => addToCart({ id: p.id, name: p.name, price: typeof p.price === 'string' ? parseFloat(p.price) : p.price, image_url: p.image_url, size: 'M', color: 'Black' }, 1)}
                      className="p-2.5 rounded-xl bg-white text-black hover:bg-[#ff0000] hover:text-white transition cursor-pointer"><ShoppingBag className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-black uppercase tracking-wider pb-4 border-b border-white/5">My Profile</h2>

            {editing ? (
              <div className="space-y-4">
                <Input label="Full Name" type="text" value={editName} onChange={(e) => setEditName(e.target.value)} />
                <Input label="Phone" type="tel" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
                <Input label="Email" type="email" value={user.email} onChange={() => {}} disabled />
                <div className="flex items-center gap-3 pt-2">
                  <button onClick={handleUpdateProfile} className="px-6 py-2.5 bg-[#ff0000] hover:bg-[#d60000] text-white rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer">
                    <Save className="w-3.5 h-3.5" /> Save Changes
                  </button>
                  <button onClick={() => setEditing(false)} className="px-6 py-2.5 border border-white/10 rounded-xl text-xs font-bold text-white/70 hover:text-white transition cursor-pointer">
                    <X className="w-3.5 h-3.5 inline mr-1" /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-6 p-5 rounded-2xl bg-white/5 border border-white/5">
                  <div className="w-16 h-16 rounded-full bg-[#ff0000]/10 border border-[#ff0000]/20 flex items-center justify-center text-[#ff0000] text-xl font-black">
                    {user.name?.charAt(0)?.toUpperCase() || 'R'}
                  </div>
                  <div className="flex-1">
                    <p className="text-lg font-black text-white">{user.name}</p>
                    <p className="text-xs text-[#a1a1a1]">{user.email}</p>
                    <p className="text-xs text-[#a1a1a1]">{user.phone}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <Crown className="w-2.5 h-2.5 inline mr-1" />{loyaltyTier}
                      </span>
                      <span className="text-[9px] text-[#a1a1a1]">{loyaltyPoints} points</span>
                    </div>
                  </div>
                  <button onClick={() => setEditing(true)} className="p-3 rounded-xl border border-white/10 hover:border-white/30 text-white/60 hover:text-white transition cursor-pointer">
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <StatCard label="Total Orders" value={orders.length.toString()} icon={<Package className="w-4 h-4" />} />
                  <StatCard label="Wishlist" value={wishlist.length.toString()} icon={<Heart className="w-4 h-4" />} />
                  <StatCard label="Loyalty Points" value={loyaltyPoints.toString()} icon={<Crown className="w-4 h-4" />} />
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function Input({ label, className = '', onChange, ...props }: { label?: string; className?: string; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; [key: string]: any }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] uppercase font-bold tracking-widest text-[#a1a1a1]">{label}</label>
      <input onChange={onChange} {...props} className={`w-full bg-black border border-white/10 rounded-xl py-3.5 px-4 text-xs outline-none focus:border-[#ff0000] text-white transition-colors ${className}`} />
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
      <div className="text-white/50">{icon}</div>
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="text-[9px] text-[#a1a1a1] uppercase tracking-wider font-bold">{label}</p>
    </div>
  );
}
