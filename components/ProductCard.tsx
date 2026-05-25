'use client';

import { useStore } from '../lib/store';
import { Heart, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: string | number;
    image_url: string;
    category: string;
    sku: string;
    stock: number;
  };
}

// Map of product IDs to secondary high-res image details
const secondaryImages: Record<string, string> = {
  '550e8400-e29b-41d4-a716-446655440101': 'https://images.unsplash.com/photo-1556821840-4a6f98721c04?q=80&w=600',
  '550e8400-e29b-41d4-a716-446655440103': 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=600',
  '550e8400-e29b-41d4-a716-446655440104': 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600',
  '550e8400-e29b-41d4-a716-446655440105': 'https://images.unsplash.com/photo-1503342394128-c104d54dba01?q=80&w=600',
  '550e8400-e29b-41d4-a716-446655440106': 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=600',
  '550e8400-e29b-41d4-a716-446655440107': 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=600',
  '550e8400-e29b-41d4-a716-446655440108': 'https://images.unsplash.com/photo-1506629905607-d9d6b0b15f1c?q=80&w=600',
  '550e8400-e29b-41d4-a716-446655440109': 'https://images.unsplash.com/photo-1521369909029-2afed882baee?q=80&w=600',
  '550e8400-e29b-41d4-a716-446655440110': 'https://images.unsplash.com/photo-1576871337622-98d48d4aa53e?q=80&w=600',
};

export default function ProductCard({ product }: ProductCardProps) {
  const setSelectedProductId = useStore((state) => state.setSelectedProductId);
  const addToCart = useStore((state) => state.addToCart);
  const toggleWishlist = useStore((state) => state.toggleWishlist);
  const wishlist = useStore((state) => state.wishlist);

  const [hovered, setHovered] = useState(false);
  const [addingSize, setAddingSize] = useState(false);

  const isWishlisted = wishlist.includes(product.id);
  const priceVal = typeof product.price === 'string' ? parseFloat(product.price) : product.price;

  const handleCardClick = () => {
    setSelectedProductId(product.id);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const handleQuickAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAddingSize(true);
  };

  const handleSizeSelect = (e: React.MouseEvent, size: string) => {
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      price: priceVal,
      image_url: product.image_url,
      size,
      color: 'Black', // Default color for quick add
    }, 1);
    setAddingSize(false);
  };

  // Determine sizes available based on category
  const sizes = product.category === 'Caps' ? ['One Size'] : ['S', 'M', 'L', 'XL'];
  const secondaryImg = secondaryImages[product.id] || product.image_url;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setAddingSize(false);
      }}
      className="group relative bg-[#0a0a0a] rounded-[30px] overflow-hidden border border-white/5 hover:border-[#ff0000]/30 transition-all duration-500 hover:-translate-y-2 shadow-xl flex flex-col h-full"
    >
      {/* Product Image Gallery Wrapper */}
      <div 
        onClick={handleCardClick}
        className="relative aspect-[3/4] overflow-hidden cursor-pointer bg-black"
      >
        {/* Main Image */}
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className={`object-cover transition-all duration-700 ${
            hovered ? 'scale-105 opacity-0' : 'scale-100 opacity-100'
          }`}
          unoptimized
        />
        
        {/* Secondary Detail Image on Hover */}
        <Image
          src={secondaryImg}
          alt={`${product.name} detail`}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className={`object-cover transition-all duration-700 ${
            hovered ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
          unoptimized
        />

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 hover:bg-[#ff0000] border border-white/10 flex items-center justify-center transition cursor-pointer text-white shadow-lg"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-white text-white' : ''}`} />
        </button>

        {/* Stock Badge Warning */}
        {product.stock <= 0 ? (
          <span className="absolute top-4 left-4 bg-black/85 text-xs text-stroke-white border border-white/10 uppercase tracking-widest font-heading font-black px-3.5 py-1.5 rounded-full z-10">
            Out of Stock
          </span>
        ) : product.stock <= 5 ? (
          <span className="absolute top-4 left-4 bg-[#ff0000] text-white text-[9px] uppercase tracking-widest font-bold px-3 py-1 rounded-full z-10">
            Low Stock
          </span>
        ) : null}

        {/* Quick Add Overlay Panel */}
        {product.stock > 0 && (
          <div className="absolute inset-x-0 bottom-0 p-4 z-10 bg-gradient-to-t from-black via-black/80 to-transparent translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            {addingSize ? (
              <div className="flex flex-col items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#a1a1a1]">
                  Select Size
                </span>
                <div className="flex gap-1.5 flex-wrap justify-center">
                  {sizes.map((sz) => (
                    <button
                      key={sz}
                      onClick={(e) => handleSizeSelect(e, sz)}
                      className="px-3.5 py-1.5 bg-white text-black hover:bg-[#ff0000] hover:text-white font-bold text-xs rounded-xl transition cursor-pointer border border-white/10"
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <button
                onClick={handleQuickAddClick}
                className="w-full py-3 rounded-2xl bg-white text-black hover:bg-[#ff0000] hover:text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                Quick Add
              </button>
            )}
          </div>
        )}
      </div>

      {/* Info Details */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div onClick={handleCardClick} className="cursor-pointer">
          <span className="text-[10px] text-[#ff0000] uppercase font-bold tracking-widest block mb-1">
            {product.category}
          </span>
          <h3 className="font-bold text-sm text-white uppercase line-clamp-1 group-hover:text-[#ff0000] transition-colors duration-300">
            {product.name}
          </h3>
          <p className="text-[11px] text-[#a1a1a1] line-clamp-2 mt-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
          <span className="text-lg font-black text-white">
            {priceVal.toFixed(3)} <span className="text-xs font-normal text-[#a1a1a1]">KWD</span>
          </span>
          
          <button
            onClick={handleCardClick}
            className="text-[10px] uppercase font-bold tracking-widest text-[#a1a1a1] hover:text-white transition cursor-pointer"
          >
            Details →
          </button>
        </div>
      </div>
    </div>
  );
}
