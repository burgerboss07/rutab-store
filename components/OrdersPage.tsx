'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Package, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';

function formatPrice(price: number, currency: string = 'KWD') {
  return `${currency} ${price.toFixed(3)}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

export default function OrdersPage() {
  const orders = useStore((s) => s.orders);
  const setActiveView = useStore((s) => s.setActiveView);
  const setTrackingOrderId = useStore((s) => s.setTrackingOrderId);
  const currency = useStore((s) => s.currency);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10';
      case 'shipped': return 'text-blue-400 border-blue-500/20 bg-blue-500/10';
      case 'pending': return 'text-amber-400 border-amber-500/20 bg-amber-500/10';
      case 'cancelled': return 'text-red-400 border-red-500/20 bg-red-500/10';
      case 'refunded': return 'text-zinc-400 border-zinc-500/20 bg-zinc-500/10';
      default: return 'text-[#a1a1a1] border-white/10 bg-white/5';
    }
  };

  return (
    <div className="pt-24 min-h-screen bg-black text-white px-6 pb-24">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(255,0,0,0.15),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.03),transparent_35%)] pointer-events-none z-0" />
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px] pointer-events-none z-0" />

      <div className="max-w-4xl mx-auto relative z-10 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[#ff0000] text-[10px] font-bold tracking-[0.2em] uppercase">Order History</span>
            <h1 className="text-3xl font-black uppercase tracking-wider mt-1">My Orders</h1>
          </div>
          <button onClick={() => setActiveView('account')}
            className="px-5 py-2.5 rounded-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/5 text-[10px] font-bold uppercase tracking-widest transition cursor-pointer">
            Back to Account
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="bg-[#0a0a0a] border border-white/10 rounded-[35px] p-12 text-center space-y-4">
            <Package className="w-12 h-12 text-[#555] mx-auto" />
            <p className="text-sm font-bold uppercase tracking-wider text-[#a1a1a1]">No orders yet</p>
            <p className="text-[10px] text-[#555]">Your order history will appear here once you make a purchase.</p>
            <button onClick={() => setActiveView('shop')}
              className="px-6 py-3 bg-[#ff0000] hover:bg-[#d60000] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition cursor-pointer">
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-[#0a0a0a] border border-white/10 rounded-[35px] overflow-hidden">
                <button onClick={() => toggleExpand(order.id)}
                  className="w-full p-6 flex items-center justify-between text-left cursor-pointer hover:bg-white/[0.02] transition">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                      <Package className="w-4 h-4 text-[#a1a1a1]" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white font-mono">#{order.id.slice(0, 8)}</p>
                      <p className="text-[9px] text-[#555] uppercase tracking-wider">{formatDate(order.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-[8px] uppercase font-black px-2.5 py-1 rounded-full border ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    <span className="text-xs font-bold">{formatPrice(order.total_price, currency)}</span>
                    <button onClick={(e) => { e.stopPropagation(); setTrackingOrderId(order.id); setActiveView('track'); }}
                      className="px-3 py-1.5 rounded-lg bg-[#ff0000] hover:bg-[#d60000] text-white text-[8px] font-bold uppercase tracking-widest transition cursor-pointer">
                      Track
                    </button>
                    {expanded.has(order.id) ? <ChevronUp className="w-4 h-4 text-[#555]" /> : <ChevronDown className="w-4 h-4 text-[#555]" />}
                  </div>
                </button>

                {expanded.has(order.id) && (
                  <div className="px-6 pb-6 space-y-3 border-t border-white/5 pt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[10px] text-[#a1a1a1]">
                      <div>
                        <span className="font-bold uppercase tracking-wider">Address</span>
                        <p className="text-white mt-0.5">{order.address}</p>
                      </div>
                      <div>
                        <span className="font-bold uppercase tracking-wider">Phone</span>
                        <p className="text-white mt-0.5">{order.phone}</p>
                      </div>
                      <div>
                        <span className="font-bold uppercase tracking-wider">Payment</span>
                        <p className="text-white mt-0.5 capitalize">{order.payment_method?.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <span className="font-bold uppercase tracking-wider">Order ID</span>
                        <p className="text-white mt-0.5 font-mono text-[9px]">{order.id}</p>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-[#a1a1a1]">Items ({order.items.length})</p>
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/5 text-xs">
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-white truncate">{item.product_name}</p>
                            <p className="text-[9px] text-[#555] mt-0.5">
                              {item.size && `Size: ${item.size}`}{item.size && item.color ? ' | ' : ''}{item.color && `Color: ${item.color}`}
                              {' | '}Qty: {item.quantity}
                            </p>
                          </div>
                          <span className="font-bold ml-4 shrink-0">{formatPrice(item.price * item.quantity, currency)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-white/5">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#a1a1a1]">Total</span>
                      <span className="text-sm font-black">{formatPrice(order.total_price, currency)}</span>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); setTrackingOrderId(order.id); setActiveView('track'); }}
                      className="w-full mt-2 py-2.5 rounded-xl bg-[#ff0000] hover:bg-[#d60000] text-white text-[10px] font-bold uppercase tracking-widest transition cursor-pointer flex items-center justify-center gap-2">
                      Track Order <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
