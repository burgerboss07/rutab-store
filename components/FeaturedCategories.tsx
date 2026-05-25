'use client';

import { useStore } from '../lib/store';
import Image from 'next/image';

const categoriesList = [
  {
    name: 'Arabic Poetry',
    desc: 'Classic and modern Arabic poetry designs.',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600',
    count: '3 Items',
  },
  {
    name: 'Cartoons',
    desc: 'Fun and vibrant cartoon graphics.',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=600',
    count: '3 Items',
  },
  {
    name: 'Brand Shirts',
    desc: 'Premium branded luxury shirts.',
    image: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?q=80&w=600',
    count: '2 Items',
  },
  {
    name: 'Urdu Poetry',
    desc: 'Elegant Urdu poetry typography.',
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=600',
    count: '2 Items',
  },
  {
    name: 'Trippy Designs',
    desc: 'Psychedelic and surreal aesthetics.',
    image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=600',
    count: '2 Items',
  },
];

export default function FeaturedCategories() {
  const setActiveView = useStore((state) => state.setActiveView);

  const handleCategoryClick = (categoryName: string) => {
    console.log('Navigating to category:', categoryName);
    // Navigate to shop
    setActiveView('shop');
    // We can also trigger filtering, which is handled dynamically in ShopPage using Zustand
    // We will set this in store or handle url
  };

  return (
    <section className="py-24 px-6 max-w-7xl mx-auto border-b border-white/5">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
        <div>
          <span className="text-[#ff0000] text-xs font-bold tracking-[0.25em] uppercase block mb-3">
            Collections
          </span>
          <h2 className="text-4xl md:text-6xl font-black uppercase">
            Shop by Category
          </h2>
        </div>
        <p className="text-[#a1a1a1] max-w-sm mt-4 md:mt-0 text-sm leading-relaxed">
          Premium streetwear essentials designed for oversized silhouettes, technical wear, and bold statements.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {categoriesList.map((cat, index) => (
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
        ))}
      </div>
    </section>
  );
}
