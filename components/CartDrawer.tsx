'use client';

import { useStore, Product, formatPrice } from '../lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { getSupabase } from '../lib/supabase';

export default function CartDrawer() {
  const isCartOpen = useStore((state) => state.isCartOpen);
  const setCartOpen = useStore((state) => state.setCartOpen);
  const cart = useStore((state) => state.cart);
  const updateQuantity = useStore((state) => state.updateQuantity);
  const removeFromCart = useStore((state) => state.removeFromCart);
  const getCartTotal = useStore((state) => state.getCartTotal);
  const setActiveView = useStore((state) => state.setActiveView);
  const addToCart = useStore((state) => state.addToCart);

  const [upsellItem, setUpsellItem] = useState<Product | null>(null);
  const currency = useStore((state) => state.currency);

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
    ? cart.some(item => item.id === upsellItem.id)
    : false;

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Dark Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
            className="fixed inset-0 bg-black z-50 cursor-pointer"
          />

          {/* Cart Drawer panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#0a0a0a] border-l border-white/10 z-50 flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.8)]"
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
              {cart.length === 0 ? (
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
                  {cart.map((item) => (
                    <div
                      key={`${item.id}-${item.size}-${item.color}`}
                      className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 relative group hover:border-[#ff0000]/20 transition-all duration-300"
                    >
                      {/* Product Thumbnail */}
                      <div className="w-20 h-24 relative rounded-xl border border-white/10 bg-black overflow-hidden shrink-0">
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
                          <h3 className="font-bold text-sm text-white uppercase line-clamp-1">{item.name}</h3>
                          <div className="flex gap-3 text-[10px] text-[#a1a1a1] uppercase mt-1">
                            <span>Size: <strong className="text-white">{item.size}</strong></span>
                            <span>Color: <strong className="text-white">{item.color}</strong></span>
                          </div>
                        </div>

                        {/* Quantity Adjusters */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity - 1)}
                            className="w-6 h-6 rounded bg-white/10 flex items-center justify-center text-white hover:bg-[#ff0000] transition cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold text-white w-4 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity + 1)}
                            className="w-6 h-6 rounded bg-white/10 flex items-center justify-center text-white hover:bg-[#ff0000] transition cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
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
              {upsellItem && !isUpsellInCart && cart.length > 0 && (
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
            {cart.length > 0 && (
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
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
