'use client';

import { useStore } from '@/lib/store';
import { Package, ChevronLeft, MapPin, Phone, CreditCard, Calendar, ImageIcon, X } from 'lucide-react';
import { useState } from 'react';

function formatPrice(price: number, currency: string = 'KWD') {
  return `${currency} ${price.toFixed(3)}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

const STATUS_STEPS = ['pending', 'shipped', 'delivered'];

function getStepIndex(status: string): number {
  return STATUS_STEPS.indexOf(status);
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'pending': return 'Order Placed';
    case 'shipped': return 'Shipped';
    case 'delivered': return 'Delivered';
    case 'cancelled': return 'Cancelled';
    case 'refunded': return 'Refunded';
    default: return status;
  }
}

export default function OrderTracking() {
  const orders = useStore((s) => s.orders);
  const setActiveView = useStore((s) => s.setActiveView);
  const trackingOrderId = useStore((s) => s.trackingOrderId);
  const currency = useStore((s) => s.currency);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const order = orders.find((o) => o.id === trackingOrderId);
  if (!order) return <div className="text-center py-24 text-[#555]">Order not found.</div>;

  const stepIndex = order.status === 'cancelled' || order.status === 'refunded' ? -1 : getStepIndex(order.status);
  const isCancelled = order.status === 'cancelled' || order.status === 'refunded';

  return (
    <div className="pt-24 min-h-screen bg-black text-white px-6 pb-24">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(255,0,0,0.15),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.03),transparent_35%)] pointer-events-none z-0" />
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px] pointer-events-none z-0" />

      <div className="max-w-3xl mx-auto relative z-10 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button onClick={() => setActiveView('orders')}
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#a1a1a1] hover:text-white transition cursor-pointer">
            <ChevronLeft className="w-3.5 h-3.5" /> Back to Orders
          </button>
          <span className={`text-[8px] uppercase font-black px-3 py-1.5 rounded-full border ${
            order.status === 'delivered' ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10' :
            order.status === 'shipped' ? 'text-blue-400 border-blue-500/20 bg-blue-500/10' :
            order.status === 'cancelled' ? 'text-red-400 border-red-500/20 bg-red-500/10' :
            order.status === 'refunded' ? 'text-zinc-400 border-zinc-500/20 bg-zinc-500/10' :
            'text-amber-400 border-amber-500/20 bg-amber-500/10'
          }`}>{getStatusLabel(order.status)}</span>
        </div>

        {/* Order Header */}
        <div>
          <h1 className="text-3xl font-black uppercase tracking-wider">Order #{order.id.slice(0, 8)}</h1>
          <p className="text-[10px] text-[#555] mt-1 font-mono">{formatDate(order.created_at)}</p>
        </div>

        {/* Progress Stepper */}
        <div className="bg-[#0a0a0a] border border-white/10 rounded-[35px] p-8">
          {isCancelled ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
                <Package className="w-7 h-7 text-red-400" />
              </div>
              <p className="text-sm font-bold uppercase tracking-wider text-red-400">Order {order.status}</p>
              <p className="text-[10px] text-[#555] mt-2">This order has been {order.status}. Please contact support for more details.</p>
            </div>
          ) : (
            <div className="relative">
              {/* Progress bar background */}
              <div className="absolute top-5 left-[30px] right-[30px] h-[2px] bg-white/10" />
              {/* Progress bar fill */}
              <div className="absolute top-5 left-[30px] h-[2px] bg-[#ff0000] transition-all duration-700"
                style={{ width: stepIndex >= 0 ? `${(stepIndex / (STATUS_STEPS.length - 1)) * 100}%` : '0%',
                  right: stepIndex >= 0 ? undefined : `${((STATUS_STEPS.length - 1 - stepIndex) / (STATUS_STEPS.length - 1)) * 100}%` }} />
              <div className="flex justify-between relative">
                {STATUS_STEPS.map((step, idx) => {
                  const isActive = idx <= stepIndex;
                  const isCurrent = idx === stepIndex;
                  return (
                    <div key={step} className="flex flex-col items-center text-center" style={{ width: `${100 / STATUS_STEPS.length}%` }}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black border-2 transition-all duration-500 z-10 ${
                        isActive ? 'bg-[#ff0000] border-[#ff0000] text-white' :
                        'bg-[#0a0a0a] border-white/10 text-[#555]'
                      } ${isCurrent ? 'ring-4 ring-[#ff0000]/20 scale-110' : ''}`}>
                        {isActive ? <Package className="w-4 h-4" /> : idx + 1}
                      </div>
                      <p className={`text-[9px] font-bold uppercase tracking-widest mt-3 transition ${
                        isActive ? 'text-white' : 'text-[#555]'
                      }`}>{getStatusLabel(step)}</p>
                      {isCurrent && (
                        <span className="text-[8px] text-[#ff0000] font-bold uppercase tracking-widest mt-1 animate-pulse">
                          {order.status === 'delivered' ? 'Delivered' : 'In Transit'}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Order Details + Items Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Info Cards */}
          <div className="space-y-4">
            <div className="bg-[#0a0a0a] border border-white/10 rounded-[25px] p-6 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#a1a1a1]">Shipping Details</h3>
              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#555] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white/70 text-[10px] uppercase tracking-wider font-bold">Address</p>
                    <p className="text-white mt-0.5">{order.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-[#555] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white/70 text-[10px] uppercase tracking-wider font-bold">Phone</p>
                    <p className="text-white mt-0.5">{order.phone}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#0a0a0a] border border-white/10 rounded-[25px] p-6 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#a1a1a1]">Payment Info</h3>
              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-3">
                  <CreditCard className="w-4 h-4 text-[#555] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white/70 text-[10px] uppercase tracking-wider font-bold">Method</p>
                    <p className="text-white mt-0.5 capitalize">{order.payment_method?.replace('_', ' ')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-[#555] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white/70 text-[10px] uppercase tracking-wider font-bold">Order Date</p>
                    <p className="text-white mt-0.5">{formatDate(order.created_at)}</p>
                  </div>
                </div>
                {order.payment_proof && (
                  <div className="flex items-start gap-3">
                    <ImageIcon className="w-4 h-4 text-[#555] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white/70 text-[10px] uppercase tracking-wider font-bold">Payment Proof</p>
                      <button onClick={() => setPreviewImage(order.payment_proof!)}
                        className="mt-1 w-16 h-16 rounded-xl overflow-hidden border border-white/10 hover:border-[#ff0000]/40 transition cursor-pointer">
                        <img src={order.payment_proof} alt="Payment proof" className="w-full h-full object-cover" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-[#0a0a0a] border border-white/10 rounded-[25px] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#a1a1a1]">Items ({order.items.length})</h3>
              <span className="text-sm font-black">{formatPrice(order.total_price, currency)}</span>
            </div>
            <div className="space-y-3">
              {order.items.map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-white/5 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-white truncate">{item.product_name}</p>
                      <p className="text-[9px] text-[#555] mt-0.5">
                        {item.size && `Size: ${item.size}`}{item.size && item.color ? ' · ' : ''}{item.color && `Color: ${item.color}`}
                        {' · '}Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="font-bold ml-3 shrink-0">{formatPrice(item.price * item.quantity, currency)}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-white/5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#a1a1a1]">Total</span>
              <span className="text-base font-black">{formatPrice(order.total_price, currency)}</span>
            </div>
          </div>
        </div>

        {/* Image Preview Modal */}
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
    </div>
  );
}
