'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, Heart, ShoppingBag, LogOut, User, Mail, Phone, MapPin } from 'lucide-react';
import { useStore, formatPrice } from '../lib/store';
import { getSupabase } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export default function UserDashboard() {
  const [supaUser, setSupaUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const orders = useStore((s) => s.orders);
  const wishlist = useStore((s) => s.wishlist);
  const setActiveView = useStore((s) => s.setActiveView);

  useEffect(() => {
    (async () => {
      try {
        const supabase = getSupabase();
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setSupaUser(session.user);
          const { data: p } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
          if (p) setProfile(p);
        }
      } catch {}
      setLoading(false);
    })();
  }, []);

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

  const handleSignOut = async () => {
    const supabase = getSupabase();
    await supabase.auth.signOut();
    setSupaUser(null);
    setProfile(null);
    useStore.getState().signOut();
  };

  return (
    <div className="pt-24 min-h-screen bg-black text-white px-6 pb-24">
      <div className="max-w-4xl mx-auto space-y-8">
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

        <div className="bg-[#0a0a0a] border border-white/10 rounded-[35px] p-6 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider">Profile</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <p className="text-[9px] text-[#a1a1a1] uppercase tracking-wider font-bold">Address</p>
                <p className="text-xs text-white">Not set</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-[#0a0a0a] border border-white/10 text-center space-y-1">
            <Package className="w-5 h-5 text-[#a1a1a1] mx-auto" />
            <p className="text-2xl font-black text-white">{orders.length}</p>
            <p className="text-[9px] text-[#a1a1a1] uppercase tracking-wider font-bold">Orders</p>
          </div>
          <button onClick={() => setActiveView('wishlist')}
            className="p-5 rounded-2xl bg-[#0a0a0a] border border-white/10 text-center space-y-1 hover:bg-white/5 transition cursor-pointer">
            <Heart className="w-5 h-5 text-[#a1a1a1] mx-auto" />
            <p className="text-2xl font-black text-white">{wishlist.length}</p>
            <p className="text-[9px] text-[#a1a1a1] uppercase tracking-wider font-bold">Wishlist</p>
          </button>
          <div className="p-5 rounded-2xl bg-[#0a0a0a] border border-white/10 text-center space-y-1">
            <ShoppingBag className="w-5 h-5 text-[#a1a1a1] mx-auto" />
            <p className="text-2xl font-black text-white">-</p>
            <p className="text-[9px] text-[#a1a1a1] uppercase tracking-wider font-bold">Spent</p>
          </div>
        </div>

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
                  <div>
                    <p className="text-xs font-bold text-white">#{order.id.slice(0, 8)}</p>
                    <p className="text-[9px] text-[#a1a1a1]">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-white">{formatPrice(order.total_price, 'KWD (K.D)')}</p>
                    <span className={`text-[9px] font-bold uppercase ${order.status === 'completed' ? 'text-emerald-400' : 'text-[#a1a1a1]'}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
