'use client';

import { useState, useEffect, useRef } from 'react';
import { getSupabase } from '../lib/supabase';
import ProductCard from './ProductCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../lib/store';

export default function TrendingSlider({
  title = "Trending Drops",
  subtitle = "Hot Right Now"
}: {
  title?: string;
  subtitle?: string;
} = {}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const client = getSupabase();
        const { data } = await client
          .from('products')
          .select('*')
          .eq('is_featured', true);
        
        if (data) {
          const mapped = data.map((p: any) => ({
            ...p,
            catalog: p.catalog || p.category,
            subCatalog: p.subCatalog || p.subcategory
          }));
          setProducts(mapped);
        }
      } catch (err) {
        console.error('Error fetching trending products:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const { scrollLeft, clientWidth } = sliderRef.current;
      const scrollAmount = clientWidth * 0.75;
      sliderRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="py-24 px-6 max-w-7xl mx-auto border-b border-white/5 relative overflow-hidden">
      <div className="flex items-end justify-between mb-16">
        <div>
          <span className="text-[#ff0000] text-xs font-bold tracking-[0.25em] uppercase block mb-3">
            {subtitle}
          </span>
          <h2 className="text-4xl md:text-6xl font-black uppercase">
            {title}
          </h2>
        </div>

        {/* Custom Navigation Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => scroll('left')}
            className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center bg-black/40 hover:bg-[#ff0000] hover:text-white hover:border-[#ff0000] transition-all duration-300 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center bg-black/40 hover:bg-[#ff0000] hover:text-white hover:border-[#ff0000] transition-all duration-300 cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex gap-6 overflow-hidden">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="min-w-[280px] md:min-w-[350px] h-[500px] rounded-[35px] bg-[#0a0a0a] border border-white/5 animate-pulse"
            />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 border border-white/5 rounded-[30px] bg-[#0a0a0a]">
          <p className="text-[#a1a1a1]">No featured drops found.</p>
        </div>
      ) : (
        <div
          ref={sliderRef}
          className="flex gap-6 overflow-x-auto pb-8 snap-x no-scrollbar snap-mandatory scroll-smooth"
        >
          {products.map((product) => (
            <div key={product.id} className="min-w-[280px] md:min-w-[360px] snap-start">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
