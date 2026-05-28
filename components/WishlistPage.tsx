'use client';

import { useState, useEffect } from 'react';
import { useStore, formatPrice, Product } from '../lib/store';
import { getSupabase } from '../lib/supabase';
import Image from 'next/image';
import { Heart, ShoppingBag, Trash2, ArrowLeft } from 'lucide-react';

export default function WishlistPage() {
  const wishlist = useStore((s) => s.wishlist);
  const toggleWishlist = useStore((s) => s.toggleWishlist);
  const addToCart = useStore((s) => s.addToCart);
  const setActiveView = useStore((s) => s.setActiveView);
  const currency = useStore((s) => s.currency);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWishlistProducts() {
      if (wishlist.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const client = getSupabase();
        const { data } = await client
          .from('products')
          .select('*')
          .in('id', wishlist);
        if (data) setProducts(data as Product[]);
      } catch (err) {
        console.error('Error fetching wishlist products:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchWishlistProducts();
  }, [wishlist]);

  const handleRemove = (id: string) => {
    toggleWishlist(id);
  };

  const handleAddToCart = (product: Product) => {
    const priceVal = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
    addToCart({
      id: product.id,
      name: product.name,
      price: priceVal,
      image_url: product.image_url,
      size: product.sizes?.[0] || 'M',
      color: product.colors?.[0] || 'Black',
    }, 1);
  };

  return (
    <div className="pt-24 min-h-screen bg-black text-white px-6 pb-24">
      <div className="max-w-6xl mx-auto pt-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <button onClick={() => setActiveView('home')}
            className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition cursor-pointer">
            <ArrowLeft className="w-4 h-4 text-[#a1a1a1]" />
          </button>
          <div>
            <span className="text-[#ff0000] text-xs font-bold tracking-[0.2em] uppercase">Saved Items</span>
            <h1 className="text-4xl md:text-5xl font-black uppercase mt-1">Wishlist</h1>
          </div>
          <span className="ml-auto text-[#a1a1a1] text-xs font-mono">({wishlist.length} items)</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-[50vh]">
            <div className="w-8 h-8 rounded-full border border-red-500/30 border-t-red-600 animate-spin" />
          </div>
        ) : wishlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[50vh] border border-white/5 rounded-[30px] bg-[#0a0a0a]">
            <Heart className="w-12 h-12 text-[#333] mb-4" />
            <p className="text-[#a1a1a1] text-xs uppercase tracking-widest font-bold mb-2">Your wishlist is empty</p>
            <button onClick={() => setActiveView('shop')}
              className="px-6 py-3 bg-[#ff0000] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#d60000] transition cursor-pointer">
              Browse Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => {
              const priceVal = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
              return (
                <div key={product.id} className="bg-[#0a0a0a] border border-white/5 rounded-[30px] overflow-hidden group hover:border-[#ff0000]/30 transition-all duration-500">
                  {/* Image */}
                  <div className="relative aspect-[1/1] bg-black overflow-hidden">
                    <Image
                      src={product.image_url || '/placeholder.svg'}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      unoptimized
                    />
                    {/* Remove button */}
                    <button onClick={() => handleRemove(product.id)}
                      className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 border border-white/10 flex items-center justify-center hover:bg-[#ff0000] transition cursor-pointer z-10">
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  </div>
                  {/* Info */}
                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-[#ff0000] uppercase font-bold tracking-wider">{product.catalog || product.category}</span>
                      {product.subCatalog && (
                        <span className="text-[8px] text-[#a1a1a1] uppercase tracking-wider">/ {product.subCatalog}</span>
                      )}
                    </div>
                    <h3 className="font-bold text-sm uppercase">{product.name}</h3>
                    <p className="text-lg font-black text-[#ff0000]">{formatPrice(priceVal, currency)}</p>
                    <button onClick={() => handleAddToCart(product)}
                      className="w-full py-3 rounded-2xl bg-white text-black hover:bg-[#ff0000] hover:text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer">
                      <ShoppingBag className="w-3.5 h-3.5" /> Add to Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
