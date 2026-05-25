'use client';

import { useState, useEffect } from 'react';
import { useStore, Product } from '../lib/store';
import { supabase } from '../lib/supabase';
import { User, LogOut, Package, MapPin, Heart, Key, Loader2, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import Image from 'next/image';

export default function UserDashboard() {
  const user = useStore((state) => state.user);
  const setUser = useStore((state) => state.setUser);
  const orders = useStore((state) => state.orders);
  const wishlist = useStore((state) => state.wishlist);
  const addToCart = useStore((state) => state.addToCart);

  // Authentication inputs
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoggingIn, setLoggingIn] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  // Fetch wishlist product details from Supabase to show cards
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [loadingWishlist, setLoadingWishlist] = useState(false);

  // Sidebar tab controls
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'wishlist'>('orders');

  // Address inputs
  const [addresses, setAddresses] = useState<{ title: string; address: string }[]>([]);
  const [newAddrTitle, setNewAddrTitle] = useState('');
  const [newAddrText, setNewAddrText] = useState('');
  const [showAddAddress, setShowAddAddress] = useState(false);

  useEffect(() => {
    async function fetchWishlistDetails() {
      if (wishlist.length === 0) {
        setWishlistProducts([]);
        return;
      }
      setLoadingWishlist(true);
      try {
        const { data } = await supabase
          .from('products')
          .select('*')
          .in('id', wishlist);
        if (data) {
          setWishlistProducts(data);
        }
      } catch (err) {
        console.error('Error fetching wishlist products:', err);
      } finally {
        setLoadingWishlist(false);
      }
    }
    fetchWishlistDetails();
  }, [wishlist]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    setAuthError('');
    setAuthSuccess('');

    try {
      if (authMode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          throw error;
        }

        if (data.user) {
          // Sync profile to public.profiles table
          try {
            await supabase.from('profiles').upsert({
              id: data.user.id,
              email: email,
              full_name: data.user.user_metadata?.full_name || 'Streetwear Enthusiast',
              phone: data.user.user_metadata?.phone || '+965 9999 8888',
            });
          } catch (profileErr) {
            console.error('Failed to sync public profile:', profileErr);
          }

          setUser({
            email: data.user.email || email,
            name: data.user.user_metadata?.full_name || 'Streetwear Enthusiast',
            phone: data.user.user_metadata?.phone || '+965 9999 8888',
            address: '',
            area: '',
          });
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name || 'Streetwear Enthusiast',
              phone: phone || '+965 9999 8888',
            }
          }
        });

        if (error) {
          throw error;
        }

        if (data.user) {
          // Save details to public.profiles table
          try {
            await supabase.from('profiles').upsert({
              id: data.user.id,
              email: email,
              full_name: name || 'Streetwear Enthusiast',
              phone: phone || '+965 9999 8888',
            });
          } catch (profileErr) {
            console.error('Failed to create public profile:', profileErr);
          }

          if (data.session) {
            setUser({
              email: data.user.email || email,
              name: data.user.user_metadata?.full_name || name || 'Streetwear Enthusiast',
              phone: data.user.user_metadata?.phone || phone || '+965 9999 8888',
              address: '',
              area: '',
            });
          } else {
            setAuthSuccess('Account created successfully! Please check your email to verify your account.');
          }
        }
      }
    } catch (err: any) {
      console.error('Auth Error:', err);
      setAuthError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoggingIn(false);
    }
  };

  // Load user-specific addresses on mount or when user changes
  useEffect(() => {
    if (user && typeof window !== 'undefined') {
      const saved = localStorage.getItem(`rutab_vault_addresses_${user.email}`);
      if (saved) {
        try {
          setAddresses(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to parse addresses:', e);
          setAddresses([]);
        }
      } else {
        setAddresses([]);
      }
    } else {
      setAddresses([]);
    }
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrTitle || !newAddrText) return;
    const updated = [...addresses, { title: newAddrTitle, address: newAddrText }];
    setAddresses(updated);
    if (user && typeof window !== 'undefined') {
      localStorage.setItem(`rutab_vault_addresses_${user.email}`, JSON.stringify(updated));
    }
    setNewAddrTitle('');
    setNewAddrText('');
    setShowAddAddress(false);
  };

  const handleDeleteAddress = (indexToDelete: number) => {
    const updated = addresses.filter((_, idx) => idx !== indexToDelete);
    setAddresses(updated);
    if (user && typeof window !== 'undefined') {
      localStorage.setItem(`rutab_vault_addresses_${user.email}`, JSON.stringify(updated));
    }
  };

  const formatKWD = (value: number) => {
    return `${value.toFixed(3)} KWD`;
  };

  // Auth portal layout
  if (!user) {
    return (
      <div className="pt-24 min-h-screen bg-black text-white px-6 flex items-center justify-center pb-24">
        <form
          onSubmit={handleAuth}
          className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[35px] p-8 space-y-6 shadow-2xl animate-fade-in-up"
        >
          <div className="text-center">
            <span className="text-[#ff0000] text-xs font-bold tracking-[0.2em] uppercase">Rutab Vault</span>
            <h2 className="text-3xl font-black uppercase text-white mt-1">
              {authMode === 'login' ? 'Vault Sign In' : 'Vault Register'}
            </h2>
          </div>

          {/* Toggle Tabs */}
          <div className="grid grid-cols-2 p-1 bg-black border border-white/5 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setAuthError('');
                setAuthSuccess('');
              }}
              className={`py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition cursor-pointer ${
                authMode === 'login'
                  ? 'bg-[#ff0000] text-white'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setAuthError('');
                setAuthSuccess('');
              }}
              className={`py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition cursor-pointer ${
                authMode === 'register'
                  ? 'bg-[#ff0000] text-white'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>

          {authError && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-500 text-[10px] text-center p-3 rounded-xl font-bold uppercase tracking-widest animate-pulse">
              {authError}
            </div>
          )}

          {authSuccess && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] text-center p-3 rounded-xl font-bold uppercase tracking-widest">
              {authSuccess}
            </div>
          )}

          <div className="space-y-4">
            {authMode === 'register' && (
              <>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-[#a1a1a1]">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ahmad Al-Sabah"
                    className="w-full bg-black border border-white/10 rounded-xl py-3.5 px-4 text-xs outline-none focus:border-[#ff0000] text-white transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-[#a1a1a1]">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+965 9999 9999"
                    className="w-full bg-black border border-white/10 rounded-xl py-3.5 px-4 text-xs outline-none focus:border-[#ff0000] text-white transition-colors"
                  />
                </div>
              </>
            )}

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-widest text-[#a1a1a1]">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full bg-black border border-white/10 rounded-xl py-3.5 px-4 text-xs outline-none focus:border-[#ff0000] text-white transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-widest text-[#a1a1a1]">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-black border border-white/10 rounded-xl py-3.5 px-4 text-xs outline-none focus:border-[#ff0000] text-white transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full py-4 bg-[#ff0000] text-white hover:bg-[#d60000] disabled:bg-zinc-700 font-bold text-xs uppercase tracking-widest rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {authMode === 'login' ? 'Accessing Vault...' : 'Creating Account...'}
              </>
            ) : (
              <>
                <Key className="w-4 h-4" />
                {authMode === 'login' ? 'Access Dashboard' : 'Create Vault Account'}
              </>
            )}
          </button>

          <div className="text-center">
            {authMode === 'login' ? (
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setAuthError('');
                  setAuthSuccess('');
                }}
                className="text-[10px] text-white/50 hover:text-white transition uppercase font-bold tracking-wider cursor-pointer"
              >
                New to Rutab Vault? <span className="text-[#ff0000] underline">Register now</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setAuthError('');
                  setAuthSuccess('');
                }}
                className="text-[10px] text-white/50 hover:text-white transition uppercase font-bold tracking-wider cursor-pointer"
              >
                Already have a key? <span className="text-[#ff0000] underline">Sign In</span>
              </button>
            )}
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen bg-black text-white px-6 max-w-6xl mx-auto pb-24 grid md:grid-cols-[250px_1fr] gap-10 items-start">
      
      {/* Sidebar Controls */}
      <aside className="space-y-6">
        <div className="bg-[#0a0a0a] border border-white/5 rounded-[30px] p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#ff0000]/10 border border-[#ff0000]/20 flex items-center justify-center text-[#ff0000]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm uppercase text-white truncate max-w-[130px]">{user.name}</h3>
              <p className="text-[10px] text-[#a1a1a1] truncate max-w-[130px]">{user.email}</p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full py-2.5 rounded-xl border border-white/10 hover:border-red-500/30 hover:bg-red-500/10 text-white/60 hover:text-white transition text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-col gap-2 bg-[#0a0a0a] border border-white/5 rounded-[30px] p-4 shadow-xl">
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full py-3.5 px-4 rounded-2xl flex items-center gap-3 text-xs uppercase font-bold tracking-wider transition-colors cursor-pointer ${
              activeTab === 'orders' ? 'bg-[#ff0000] text-white' : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Package className="w-4 h-4" />
            Orders ({orders.length})
          </button>
          
          <button
            onClick={() => setActiveTab('addresses')}
            className={`w-full py-3.5 px-4 rounded-2xl flex items-center gap-3 text-xs uppercase font-bold tracking-wider transition-colors cursor-pointer ${
              activeTab === 'addresses' ? 'bg-[#ff0000] text-white' : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <MapPin className="w-4 h-4" />
            Addresses ({addresses.length})
          </button>

          <button
            onClick={() => setActiveTab('wishlist')}
            className={`w-full py-3.5 px-4 rounded-2xl flex items-center gap-3 text-xs uppercase font-bold tracking-wider transition-colors cursor-pointer ${
              activeTab === 'wishlist' ? 'bg-[#ff0000] text-white' : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Heart className="w-4 h-4" />
            Wishlist ({wishlist.length})
          </button>
        </div>
      </aside>

      {/* Main Tab Panels */}
      <main className="bg-[#0a0a0a] border border-white/5 rounded-[40px] p-6 md:p-8 shadow-xl min-h-[50vh]">
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-black uppercase text-white tracking-wider pb-4 border-b border-white/5">
              Order History
            </h2>

            {orders.length === 0 ? (
              <div className="text-center py-12 text-[#a1a1a1] text-xs">
                No orders placed yet.
              </div>
            ) : (
              <div className="space-y-5">
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                      <div>
                        <p className="text-[10px] text-[#a1a1a1] uppercase">Invoice ID</p>
                        <p className="font-mono text-xs font-bold text-white truncate max-w-[200px]">{ord.id}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[#a1a1a1] uppercase text-left sm:text-right">Date Placed</p>
                        <p className="text-xs font-bold text-white">
                          {new Date(ord.created_at).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[#a1a1a1] uppercase text-left sm:text-right">Status</p>
                        <span className="text-[9px] uppercase font-black px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 mt-0.5 inline-block">
                          {ord.status}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {ord.items.map((item, i) => (
                        <div key={i} className="flex justify-between items-center text-xs">
                          <span className="text-[#e5e5e5] truncate max-w-[240px]">
                            {item.product_name} ({item.size}) <strong className="text-[#a1a1a1]">x{item.quantity}</strong>
                          </span>
                          <span className="font-bold text-[#ff0000]">{formatKWD(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-white/5 pt-3 flex justify-between items-center text-xs">
                      <span className="text-[#a1a1a1]">Payment: {ord.payment_method}</span>
                      <span className="text-sm font-black text-white">
                        Total: <span className="text-[#ff0000]">{formatKWD(ord.total_price)}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'addresses' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-white/5">
              <h2 className="text-3xl font-black uppercase text-white tracking-wider">
                Manage Addresses
              </h2>
              <button
                onClick={() => setShowAddAddress(!showAddAddress)}
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-[#ff0000] hover:text-white border border-white/10 flex items-center justify-center transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {showAddAddress && (
              <form onSubmit={handleAddAddress} className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-4 animate-fade-in-up">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-[#a1a1a1]">Address Title</label>
                  <input
                    type="text"
                    required
                    value={newAddrTitle}
                    onChange={(e) => setNewAddrTitle(e.target.value)}
                    placeholder="e.g. Office, Chalet"
                    className="w-full bg-black border border-white/10 rounded-xl py-2.5 px-3.5 text-xs outline-none focus:border-[#ff0000]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-[#a1a1a1]">Full Address details</label>
                  <input
                    type="text"
                    required
                    value={newAddrText}
                    onChange={(e) => setNewAddrText(e.target.value)}
                    placeholder="Area, block, street, building/house number"
                    className="w-full bg-black border border-white/10 rounded-xl py-2.5 px-3.5 text-xs outline-none focus:border-[#ff0000]"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-white text-black hover:bg-[#ff0000] hover:text-white rounded-xl text-xs font-bold uppercase transition"
                >
                  Save Address
                </button>
              </form>
            )}

            <div className="space-y-4">
              {addresses.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <MapPin className="w-8 h-8 text-white/20 mx-auto" />
                  <p className="text-[#a1a1a1] text-xs font-bold uppercase tracking-wider">No saved addresses yet</p>
                  <p className="text-white/30 text-[10px]">Click the + button above to add your delivery address.</p>
                </div>
              ) : (
                addresses.map((addr, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-start justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <MapPin className="w-5 h-5 text-[#ff0000] shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-xs uppercase text-white">{addr.title}</h4>
                        <p className="text-xs text-[#a1a1a1] mt-1">{addr.address}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteAddress(idx)}
                      className="p-2 text-white/40 hover:text-[#ff0000] hover:bg-white/5 rounded-lg transition shrink-0 cursor-pointer"
                      title="Delete Address"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'wishlist' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-black uppercase text-white tracking-wider pb-4 border-b border-white/5">
              My Wishlist
            </h2>

            {wishlist.length === 0 ? (
              <div className="text-center py-12 text-[#a1a1a1] text-xs">
                Your wishlist is empty.
              </div>
            ) : loadingWishlist ? (
              <div className="text-center py-12 flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-[#ff0000]" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {wishlistProducts.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 rounded-2xl bg-white/5 border border-white/5 flex gap-3 items-center justify-between"
                  >
                    <div className="flex gap-3 items-center min-w-0">
                      <div className="w-12 h-16 relative rounded-xl border border-white/10 bg-black overflow-hidden shrink-0">
                        <Image
                          src={p.image_url}
                          alt={p.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs uppercase text-white truncate">{p.name}</h4>
                        <p className="text-[10px] text-[#ff0000] font-bold mt-0.5">
                          {formatKWD(typeof p.price === 'string' ? parseFloat(p.price) : p.price)}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => addToCart({
                        id: p.id,
                        name: p.name,
                        price: typeof p.price === 'string' ? parseFloat(p.price) : p.price,
                        image_url: p.image_url,
                        size: p.category === 'Caps' ? 'One Size' : 'M',
                        color: 'Black',
                      }, 1)}
                      className="p-2.5 rounded-xl bg-white text-black hover:bg-[#ff0000] hover:text-white transition cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

    </div>
  );
}
