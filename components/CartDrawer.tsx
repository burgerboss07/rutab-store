'use client';

import { useStore, Product, formatPrice } from '../lib/store';
import { X, Trash2, ShoppingBag } from 'lucide-react';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { getSupabase } from '../lib/supabase';

export default function CartDrawer() {
  const isCartOpen = useStore((state) => state.isCartOpen);
  const setCartOpen = useStore((state) => state.setCartOpen);
  const cart = useStore((state) => state.cart);
  const removeFromCart = useStore((state) => state.removeFromCart);
  const getCartTotal = useStore((state) => state.getCartTotal);
  const setActiveView = useStore((state) => state.setActiveView);
  const setSelectedProductId = useStore((state) => state.setSelectedProductId);
  const addToCart = useStore((state) => state.addToCart);

  const [upsellItem, setUpsellItem] = useState<Product | null>(null);
  const [exiting, setExiting] = useState(false);
  const [visible, setVisible] = useState(false);

  // Entrance/exit animation
  useEffect(() => {
    if (isCartOpen) {
      setExiting(false);
      setVisible(true);
    } else if (visible) {
      setExiting(true);
      const timer = setTimeout(() => {
        setExiting(false);
        setVisible(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isCartOpen, visible]);

  const currency = useStore((state) => state.currency);

  // Hydration safety
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const cartItems = mounted ? cart : [];

  // Fetch a potential upsell item (e.g. from Caps category)
  useEffect(() => {
    async function fetchUpsell() {
      try {
        const client = getSupabase();
        const { data } = await client
          .from('products')
          .select('*')
          .eq('category', 'Caps')
          .limit(1);
        if (data && data.length > 0) {
          setUpsellItem(data[0] as Product);
        }
      } catch (err) {
        console.error('Error fetching upsell:', err);
      }
    }
    fetchUpsell();
  }, []);

  // Format currency
  const formatKWD = (value: number) => {
    return formatPrice(value, currency);
  };

  const handleCheckout = () => {
    setCartOpen(false);
    setActiveView('checkout');
  };

  const isUpsellInCart = upsellItem 
    ? cartItems.some(item => item.id === upsellItem.id)
    : false;

  return (
    visible ? (
      <>
        {/* Dark Backdrop */}
        <div
          className={`fixed inset-0 bg-black z-50 cursor-pointer transition-opacity duration-300 ${exiting ? 'opacity-0' : 'opacity-70'}`}
          onClick={() => setCartOpen(false)}
        />

        {/* Cart Drawer panel */}
        <div
          className={`fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#0a0a0a] border-l border-white/10 z-50 flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.8)] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${exiting ? 'translate-x-full' : 'translate-x-0'}`}
        >
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-[#ff0000]" />
                <h2 className="text-2xl font-black uppercase tracking-wider">Your Bag</h2>
              </div>
              <button
                onClick={() => setCartOpen(false)}
                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-[#a1a1a1] hover:text-white hover:border-white/30 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Cart Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
              {cartItems.length === 0 ? (
                <div className="h-[300px] flex flex-col items-center justify-center text-center space-y-4">
                  <ShoppingBag className="w-12 h-12 text-white/10" />
                  <p className="text-[#a1a1a1] text-sm">Your shopping cart is empty.</p>
                  <button
                    onClick={() => {
                      setCartOpen(false);
                      setActiveView('shop');
                    }}
                    className="px-6 py-3 rounded-xl bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-[#ff0000] hover:text-white transition cursor-pointer"
                  >
                    Go Shop Drops
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  {cartItems.map((item) => (
                    <div
                      key={`${item.id}-${item.size}-${item.color}`}
                      className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 relative group hover:border-[#ff0000]/20 transition-all duration-300"
                    >
                      {/* Product Thumbnail */}
                      <div
                        onClick={() => { setSelectedProductId(item.id); setCartOpen(false); }}
                        className="w-20 h-24 relative rounded-xl border border-white/10 bg-black overflow-hidden shrink-0 cursor-pointer"
                      >
                        <Image
                          src={item.image_url}
                          alt={item.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                          unoptimized
                        />
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h3
                            onClick={() => { setSelectedProductId(item.id); setCartOpen(false); }}
                            className="font-bold text-sm text-white uppercase line-clamp-1 cursor-pointer hover:text-[#ff0000] transition-colors"
                          >
                            {item.name}
                          </h3>
                          <div className="flex gap-3 text-[10px] text-[#a1a1a1] uppercase mt-1">
                            <span>Size: <strong className="text-white">{item.size}</strong></span>
                            <span>Color: <strong className="text-white">{item.color}</strong></span>
                            {item.quantity > 1 && <span>Qty: <strong className="text-white">{item.quantity}</strong></span>}
                          </div>
                        </div>
                      </div>

                      {/* Price & Delete Button */}
                      <div className="flex flex-col justify-between items-end">
                        <span className="text-sm font-bold text-[#ff0000]">
                          {formatKWD(item.price * item.quantity)}
                        </span>
                        
                        <button
                          onClick={() => removeFromCart(item.id, item.size, item.color)}
                          className="text-[#a1a1a1] hover:text-[#ff0000] p-1.5 transition rounded hover:bg-[#ff0000]/10 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Upsell Recommendation Section */}
              {upsellItem && !isUpsellInCart && cartItems.length > 0 && (
                <div className="pt-6 border-t border-white/10 space-y-4">
                  <h3 className="text-xs uppercase font-bold tracking-widest text-white">Complete the Fit</h3>
                  <div className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-[#ff0000]/10 hover:border-[#ff0000]/30 transition-all duration-300 items-center justify-between">
                    <div className="flex gap-3 items-center">
                      <div className="w-12 h-16 relative rounded-lg border border-white/10 bg-black overflow-hidden shrink-0">
                        <Image
                          src={upsellItem.image_url}
                          alt={upsellItem.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs uppercase text-white line-clamp-1">{upsellItem.name}</h4>
                        <p className="text-[10px] text-[#ff0000] font-bold mt-0.5">
                          {formatKWD(typeof upsellItem.price === 'string' ? parseFloat(upsellItem.price) : upsellItem.price)}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => addToCart({
                        id: upsellItem.id,
                        name: upsellItem.name,
                        price: typeof upsellItem.price === 'string' ? parseFloat(upsellItem.price) : upsellItem.price,
                        image_url: upsellItem.image_url,
                        size: 'One Size',
                        color: 'Black'
                      }, 1)}
                      className="px-4 py-2 rounded-xl bg-white text-black hover:bg-[#ff0000] hover:text-white text-[10px] font-bold uppercase tracking-wider transition cursor-pointer"
                    >
                      Add +
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer / Summary Checkout */}
            {cartItems.length > 0 && (
              <div className="p-6 bg-[#050505] border-t border-white/10 space-y-4">
                <div className="flex items-center justify-between text-sm uppercase tracking-wider text-[#a1a1a1]">
                  <span>Subtotal</span>
                  <span className="text-lg font-black text-white">{formatKWD(getCartTotal())}</span>
                </div>
                <p className="text-[10px] text-[#a1a1a1] leading-relaxed">
                  Shipping fees and taxes are calculated at checkout. Free shipping applies in Kuwait.
                </p>
                
                <button
                  onClick={handleCheckout}
                  className="w-full py-4 rounded-2xl bg-[#ff0000] text-white hover:bg-[#d60000] text-sm font-bold uppercase tracking-widest transition cursor-pointer shadow-[0_0_30px_rgba(255,0,0,0.3)] hover:scale-[1.01]"
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </div>
        </>
      ) : null
  );
}
