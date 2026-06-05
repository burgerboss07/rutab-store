'use client';

import { useStore, formatPrice } from '../lib/store';
import { Heart, ShoppingBag, ImageOff } from 'lucide-react';
import { useState } from 'react';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: string | number;
    image_url?: string | null;
    catalog?: string;
    subCatalog?: string;
    category?: string;
    subcategory?: string;
    sku: string;
    stock?: number;
    sizes?: string[];
    colors?: string[];
    stock_per_size?: Record<string, number> | Record<string, string>;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const setSelectedProductId = useStore((state) => state.setSelectedProductId);
  const addToCart = useStore((state) => state.addToCart);
  const toggleWishlist = useStore((state) => state.toggleWishlist);
  const wishlist = useStore((state) => state.wishlist);
  const currency = useStore((state) => state.currency);

  const [hovered, setHovered] = useState(false);
  const [addingSize, setAddingSize] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

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

  // Determine sizes and colors from DB, with sensible fallbacks
  const productCategory = product.category || product.catalog;
  const sizes = product.sizes && product.sizes.length > 0
    ? product.sizes
    : (productCategory === 'Caps' ? ['One Size'] : ['S', 'M', 'L', 'XL']);
  const firstColor = product.colors && product.colors.length > 0 ? product.colors[0] : 'Black';

  const hasPerSizeStock = product.stock_per_size && typeof product.stock_per_size === 'object' && Object.keys(product.stock_per_size).length > 0;
  const getSizeStock = (size: string): number => {
    if (hasPerSizeStock) {
      const raw = product.stock_per_size?.[size];
      return raw === undefined || raw === null ? 0 : Number(raw);
    }
    return product.stock ?? 99;
  };
  const productOutOfStock = hasPerSizeStock
    ? sizes.every((sz) => getSizeStock(sz) <= 0)
    : (product.stock ?? -1) === 0;

  const handleSizeSelect = (e: React.MouseEvent, size: string) => {
    e.stopPropagation();
    const maxQty = getSizeStock(size);
    const inCart = useStore.getState().cart
      .filter((i) => i.id === product.id && i.size === size)
      .reduce((sum, i) => sum + i.quantity, 0);
    const qty = Math.min(1, Math.max(0, maxQty - inCart));
    if (qty <= 0) return;
    addToCart({
      id: product.id,
      name: product.name,
      price: priceVal,
      image_url: product.image_url || '',
      size,
      color: firstColor,
    }, qty);
    setAddingSize(false);
  };

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
        {imgError || !product.image_url ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a1a]">
            <div className="text-center">
              <ImageOff className="w-12 h-12 mx-auto mb-1 text-[#444]" />
              <span className="text-[9px] text-[#555] uppercase tracking-widest font-bold block mb-0.5">No Image</span>
              <span className="text-[7px] text-[#333] uppercase tracking-wider">{product.name}</span>
            </div>
          </div>
        ) : (
          <img
            src={product.image_url}
            alt={product.name}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
              !imgLoaded ? 'opacity-0' : 'scale-100 opacity-100 group-hover:scale-105'
            }`}
            loading="lazy"
          />
        )}
        
        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 hover:bg-[#ff0000] border border-white/10 flex items-center justify-center transition cursor-pointer text-white shadow-lg"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-white text-white' : ''}`} />
        </button>

        {/* Stock Badge Warning */}
        {productOutOfStock ? (
          <span className="absolute top-4 left-4 bg-black/85 text-xs text-stroke-white border border-white/10 uppercase tracking-widest font-heading font-black px-3.5 py-1.5 rounded-full z-10">
            Out of Stock
          </span>
        ) : !hasPerSizeStock && (product.stock ?? 0) <= 5 ? (
          <span className="absolute top-4 left-4 bg-[#ff0000] text-white text-[9px] uppercase tracking-widest font-bold px-3 py-1 rounded-full z-10">
            Low Stock
          </span>
        ) : null}

        {/* Quick Add Overlay Panel */}
        {!productOutOfStock && (
          <div className="absolute inset-x-0 bottom-0 p-4 z-10 bg-gradient-to-t from-black via-black/80 to-transparent translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            {addingSize ? (
              <div className="flex flex-col items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#a1a1a1]">
                  Select Size
                </span>
                <div className="flex gap-1.5 flex-wrap justify-center">
                  {sizes.map((sz) => {
                    const maxQty = getSizeStock(sz);
                    const inCart = useStore.getState().cart
                      .filter((i) => i.id === product.id && i.size === sz)
                      .reduce((sum, i) => sum + i.quantity, 0);
                    const sizeSoldOut = maxQty - inCart <= 0;
                    return (
                    <button
                      key={sz}
                      onClick={(e) => handleSizeSelect(e, sz)}
                      disabled={sizeSoldOut}
                      className={`px-3.5 py-1.5 font-bold text-xs rounded-xl transition border ${
                        sizeSoldOut
                          ? 'bg-[#222] text-[#555] border-white/5 cursor-not-allowed'
                          : 'bg-white text-black hover:bg-[#ff0000] hover:text-white cursor-pointer border-white/10'
                      }`}
                    >
                      {sz}
                    </button>
                    );
                  })}
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
           <div className="flex items-center gap-2 mb-1">
             <span className="text-[9px] text-[#ff0000] uppercase font-bold tracking-wider">
               {product.catalog}
             </span>
             {product.subCatalog && (
               <span className="text-[8px] text-[#a1a1a1] uppercase tracking-wider font-light">
                 / {product.subCatalog}
               </span>
             )}
           </div>
           <h3 className="font-bold text-sm text-white uppercase line-clamp-1 group-hover:text-[#ff0000] transition-colors duration-300">
             {product.name}
           </h3>
          </div>

         <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
          <span className="text-lg font-black text-white">
            {formatPrice(priceVal, currency)}
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
