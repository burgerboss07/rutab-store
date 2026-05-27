'use client';

import { useStore } from '../lib/store';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { getSupabase } from '../lib/supabase';

export default function FeaturedCategories({
  title = "Shop by Category",
  subtitle = "Collections",
  description = "Premium streetwear essentials designed for oversized silhouettes, technical wear, and bold statements."
}: {
  title?: string;
  subtitle?: string;
  description?: string;
} = {}) {
  const setActiveView = useStore((state) => state.setActiveView);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      setLoading(true);
      try {
        const client = getSupabase();
        const { data, error } = await client.from('categories').select('*').order('name', { ascending: true });
        if (error) throw error;

        // Fetch product counts per category
        const { data: productsData } = await client.from('products').select('category');
        const counts: Record<string, number> = {};
        if (productsData) {
          productsData.forEach(p => {
            const catName = p.category;
            if (catName) {
              counts[catName] = (counts[catName] || 0) + 1;
            }
          });
        }

        const formatted = (data || []).map(cat => ({
          name: cat.name,
          desc: cat.description || `Explore our ${cat.name} collection.`,
          image: cat.image_url || 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600',
          count: `${counts[cat.name] || 0} Items`
        }));
        setCategories(formatted);
      } catch (err) {
        console.error('Error fetching categories:', err);
        // Keep empty on error — don't show stale hardcoded data
        setCategories([]);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);


  const handleCategoryClick = (categoryName: string) => {
    console.log('Navigating to category:', categoryName);
    // Navigate to shop
    setActiveView('shop');
  };

  return (
    <section className="py-24 px-6 max-w-7xl mx-auto border-b border-white/5">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
        <div>
          <span className="text-[#ff0000] text-xs font-bold tracking-[0.25em] uppercase block mb-3">
            {subtitle}
          </span>
          <h2 className="text-4xl md:text-6xl font-black uppercase">
            {title}
          </h2>
        </div>
        <p className="text-[#a1a1a1] max-w-sm mt-4 md:mt-0 text-sm leading-relaxed">
          {description}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          // Skeleton loading
          [1, 2, 4].map(n => (
            <div key={n} className="h-[450px] rounded-[30px] bg-[#0a0a0a] border border-white/5 animate-pulse" />
          ))
        ) : (
          categories.map((cat, index) => (
            <div
              key={index}
              onClick={() => handleCategoryClick(cat.name)}
              className="group relative h-[450px] rounded-[30px] overflow-hidden border border-white/10 bg-[#0a0a0a] cursor-pointer hover:border-[#ff0000]/40 transition-all duration-500 hover:-translate-y-2 shadow-2xl flex flex-col justify-end p-8"
            >
              {/* Background Image with Zoom on Hover */}
              <div className="absolute inset-0 z-0">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover opacity-60 group-hover:opacity-80 group-hover:scale-115 transition duration-700"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              </div>

              {/* Content */}
              <div className="relative z-10">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#ff0000] bg-black/60 px-3 py-1 rounded-full border border-[#ff0000]/20 inline-block mb-4">
                  {cat.count}
                </span>

                <h3 className="text-3xl font-black uppercase mb-2 group-hover:text-[#ff0000] transition-colors duration-300">
                  {cat.name}
                </h3>

                <p className="text-[#e5e5e5] text-xs leading-relaxed opacity-0 group-hover:opacity-100 max-h-0 group-hover:max-h-[50px] transition-all duration-500 overflow-hidden">
                  {cat.desc}
                </p>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-[10px] font-bold tracking-wider uppercase text-[#a1a1a1] group-hover:text-white transition-colors">
                    Explore Drop →
                  </span>
                </div>
              </div>

              {/* Glowing Corner */}
              <div className="absolute -top-12 -right-12 w-24 h-24 bg-[#ff0000]/10 rounded-full blur-2xl group-hover:bg-[#ff0000]/30 transition duration-500" />
            </div>
          ))
        )}
      </div>
    </section>
  );
}
