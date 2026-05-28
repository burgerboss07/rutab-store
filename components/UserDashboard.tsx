'use client';

import { Package, Heart, ShoppingBag } from 'lucide-react';
import { useStore, formatPrice } from '../lib/store';

export default function UserDashboard() {
  const orders = useStore((s) => s.orders);
  const wishlist = useStore((s) => s.wishlist);
  const setActiveView = useStore((s) => s.setActiveView);

  const formatKWD = (v: number) => formatPrice(v, 'KWD (K.D)');

  return (
    <div className="pt-24 min-h-screen bg-black text-white px-6 flex items-center justify-center pb-24">
      <div className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[35px] p-8 space-y-6 shadow-2xl text-center">
        <div className="space-y-2">
          <span className="text-[#ff0000] text-xs font-bold tracking-[0.2em] uppercase">Account</span>
          <h2 className="text-3xl font-black uppercase text-white mt-1">Coming Soon</h2>
          <p className="text-[10px] text-[#a1a1a1]">Customer accounts are being set up. Browse the store and shop as a guest.</p>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
            <Package className="w-4 h-4 text-white/50 mx-auto" />
            <p className="text-lg font-black text-white">{orders.length}</p>
            <p className="text-[9px] text-[#a1a1a1] uppercase tracking-wider font-bold">Orders</p>
          </div>
          <button onClick={() => setActiveView('wishlist')} className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1 hover:bg-white/10 transition cursor-pointer text-center w-full">
            <Heart className="w-4 h-4 text-white/50 mx-auto" />
            <p className="text-lg font-black text-white">{wishlist.length}</p>
            <p className="text-[9px] text-[#a1a1a1] uppercase tracking-wider font-bold">Wishlist</p>
          </button>
        </div>
      </div>
    </div>
  );
}
