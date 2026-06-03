'use client';

import { useStore, Product, formatPrice } from '../lib/store';
import { getSupabase } from '../lib/supabase';
import { useState, useEffect } from 'react';
import { X, Heart, ShoppingBag, Ruler, Check, ChevronDown, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

// Map of product IDs to secondary high-res image details
const secondaryImages: Record<string, string[]> = {
  '550e8400-e29b-41d4-a716-446655440101': [
    'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1200',
    'https://images.unsplash.com/photo-1556821840-4a6f98721c04?q=80&w=1200'
  ],
  '550e8400-e29b-41d4-a716-446655440103': [
    'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=1200',
    'https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?q=80&w=1200'
  ],
  '550e8400-e29b-41d4-a716-446655440104': [
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1200',
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1200'
  ],
  '550e8400-e29b-41d4-a716-446655440105': [
    'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1200',
    'https://images.unsplash.com/photo-1503342394128-c104d54dba01?q=80&w=1200'
  ],
  '550e8400-e29b-41d4-a716-446655440106': [
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=1200',
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=1200'
  ],
  '550e8400-e29b-41d4-a716-446655440107': [
    'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=1200',
    'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=1200'
  ],
  '550e8400-e29b-41d4-a716-446655440108': [
    'https://images.unsplash.com/photo-1506629905607-d9d6b0b15f1c?q=80&w=1200',
    'https://images.unsplash.com/photo-1506629905607-d9d6b0b15f1c?q=80&w=1200'
  ],
  '550e8400-e29b-41d4-a716-446655440109': [
    'https://images.unsplash.com/photo-1521369909029-2afed882baee?q=80&w=1200',
    'https://images.unsplash.com/photo-1521369909029-2afed882baee?q=80&w=1200'
  ],
  '550e8400-e29b-41d4-a716-446655440110': [
    'https://images.unsplash.com/photo-1576871337622-98d48d4aa53e?q=80&w=1200',
    'https://images.unsplash.com/photo-1576871337622-98d48d4aa53e?q=80&w=1200'
  ],
};

const getColorHex = (colorName: string) => {
  const normalized = colorName.trim().toLowerCase();
  const colorsMap: Record<string, string> = {
    black: '#0a0a0a',
    white: '#ffffff',
    wash: '#374151',
    grey: '#6b7280',
    gray: '#6b7280',
    charcoal: '#1f2937',
    red: '#dc2626',
    blue: '#2563eb',
    navy: '#1e3a8a',
    green: '#16a34a',
    olive: '#556b2f',
    brown: '#78350f',
    beige: '#f5f5dc',
    cream: '#fffdd0',
    tan: '#d2b48c',
    yellow: '#eab308',
    purple: '#7c3aed',
    pink: '#db2777',
    orange: '#ea580c',
    sand: '#c2b280',
  };

  if (colorName.startsWith('#') || colorName.startsWith('rgb') || colorName.startsWith('hsl')) {
    return colorName;
  }

  return colorsMap[normalized] || '#ff0000';
};

export default function ProductDetails() {
  const selectedProductId = useStore((state) => state.selectedProductId);
  const setSelectedProductId = useStore((state) => state.setSelectedProductId);
  const addToCart = useStore((state) => state.addToCart);
  const setCartOpen = useStore((state) => state.setCartOpen);
  const toggleWishlist = useStore((state) => state.toggleWishlist);
  const wishlist = useStore((state) => state.wishlist);
  const storeSettings = useStore((s) => s.storeSettings);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const currency = useStore((state) => state.currency);
  
  // Custom states
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [sizeQuantities, setSizeQuantities] = useState<Record<string, number>>({});
  const [selectedColor, setSelectedColor] = useState<string>('Black');
  const [activeImage, setActiveImage] = useState<string>('');
  const [zoomStyle, setZoomStyle] = useState({ display: 'none', backgroundPosition: '0% 0%' });
  const [isSizeGuideOpen, setSizeGuideOpen] = useState(false);

  // Accordion state
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  const shippingPolicy = storeSettings?.shipping_policy || '';
  const returnPolicy = storeSettings?.return_policy || '';

  // Fetch product detail
  useEffect(() => {
    async function fetchProduct() {
      if (!selectedProductId) return;
      setLoading(true);
      try {
        const client = getSupabase();
        const { data } = await client
          .from('products')
          .select('*')
          .eq('id', selectedProductId)
          .single();
        if (data) {
          const mapped = {
            ...data,
            catalog: data.catalog || data.category,
            subCatalog: data.subCatalog || data.subcategory
          };
          setProduct(mapped);
          setActiveImage(data.image_url);
          // Default size values
          if (data.sizes && data.sizes.length > 0) {
            setSelectedSize(data.sizes[0]);
          } else if (data.category === 'Caps') {
            setSelectedSize('One Size');
          } else {
            setSelectedSize('M');
          }

          if (data.colors && data.colors.length > 0) {
            setSelectedColor(data.colors[0]);
          } else {
            setSelectedColor('Black');
          }
        }
      } catch (err) {
        console.error('Error fetching product detail:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [selectedProductId]);

  if (!selectedProductId) return null;

  const isWishlisted = product ? wishlist.includes(product.id) : false;
  const priceVal = product ? (typeof product.price === 'string' ? parseFloat(product.price) : product.price) : 0;
  
  // Custom image thumbnails: always include main image first, then DB images, then mock fallbacks
  const gallery = product 
    ? Array.from(new Set([
        product.image_url, 
        ...(product.images || []), 
        ...(secondaryImages[product.id] || [])
      ]))
    : [];

  const handleAddToCart = () => {
    if (!product) return;
    const itemsToAdd = Object.entries(sizeQuantities).filter(([, qty]) => qty > 0);
    if (itemsToAdd.length === 0) {
      addToCart({
        id: product.id,
        name: product.name,
        price: priceVal,
        image_url: product.image_url,
        size: selectedSize,
        color: selectedColor,
      }, 1);
    } else {
      itemsToAdd.forEach(([size, qty]) => {
        addToCart({
          id: product.id,
          name: product.name,
          price: priceVal,
          image_url: product.image_url,
          size,
          color: selectedColor,
        }, qty);
      });
    }
    setCartOpen(true);
  };

  const updateSizeQty = (size: string, delta: number) => {
    setSizeQuantities(prev => {
      const current = prev[size] || 0;
      const next = current + delta;
      if (next <= 0) {
        const { [size]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [size]: next };
    });
  };

  // Zoom on hover logic
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - window.scrollX - left) / width) * 100;
    const y = ((e.pageY - window.scrollY - top) / height) * 100;
    setZoomStyle({
      display: 'block',
      backgroundPosition: `${x}% ${y}%`,
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: 'none', backgroundPosition: '0% 0%' });
  };

  const sizes = product?.sizes && product.sizes.length > 0 
    ? product.sizes 
    : (product?.category === 'Caps' ? ['One Size'] : ['S', 'M', 'L', 'XL']);
    
  const colors = product?.colors && product.colors.length > 0
    ? product.colors
    : ['Black', 'Wash', 'Red'];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/95 flex items-center justify-center p-4 md:p-10">
        
        {/* Main Details Panel Container */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25 }}
          className="relative w-full max-w-6xl max-h-[90vh] bg-[#0a0a0a] border border-white/10 rounded-[40px] shadow-[0_0_80px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col md:grid md:grid-cols-2 min-h-[80vh] md:overflow-visible"
        >
          {/* Close Button */}
          <button
            onClick={() => setSelectedProductId(null)}
            className="absolute top-6 right-6 z-20 w-12 h-12 rounded-full border border-white/10 flex items-center justify-center bg-black/40 text-[#a1a1a1] hover:text-white hover:border-white/30 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {loading ? (
            <div className="col-span-2 h-[80vh] flex flex-col items-center justify-center">
              <RefreshCw className="w-8 h-8 text-[#ff0000] animate-spin mb-4" />
              <p className="text-[#a1a1a1] uppercase text-xs tracking-widest">Loading Drop Details...</p>
            </div>
          ) : !product ? (
            <div className="col-span-2 h-[80vh] flex items-center justify-center">
              <p className="text-[#a1a1a1]">Product not found.</p>
            </div>
          ) : (
            <>
              {/* LEFT COLUMN: Gallery with Zoom */}
              <div className="p-6 md:p-8 flex flex-col gap-4 border-r border-white/5">
                {/* Main Zoom Display */}
                <div
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  className="relative aspect-[1/1] rounded-3xl overflow-hidden border border-white/10 bg-black cursor-zoom-in"
                  style={{
                    backgroundImage: `url(${activeImage})`,
                    backgroundSize: '100%',
                    backgroundRepeat: 'no-repeat',
                  }}
                >
                  {/* Invisible Image to preserve ratio */}
                  <Image
                    src={activeImage}
                    alt="active view"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover pointer-events-none opacity-100"
                    unoptimized
                  />
                  {/* Zoom glass pane overlay */}
                  <div
                    className="absolute inset-0 pointer-events-none border border-white/10 rounded-3xl transition-opacity duration-300"
                    style={{
                      ...zoomStyle,
                      backgroundImage: `url(${activeImage})`,
                      backgroundSize: '200%',
                      backgroundRepeat: 'no-repeat',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                    }}
                  />
                </div>

                {/* Thumbnail Strip */}
                <div className="flex gap-3">
                  {gallery.map((imgUrl, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImage(imgUrl)}
                      className={`relative w-14 h-16 rounded-xl overflow-hidden border transition cursor-pointer bg-black ${
                        activeImage === imgUrl ? 'border-[#ff0000]' : 'border-white/10 hover:border-white/30'
                      }`}
                    >
                    <Image src={imgUrl} alt="thumb" fill sizes="56px" className="object-cover" unoptimized />
                    </button>
                  ))}
                </div>
              </div>

              {/* RIGHT COLUMN: Info, selectors, action buttons */}
              <div className="p-6 md:p-10 flex flex-col justify-between overflow-y-auto no-scrollbar" style={{ maxHeight: '90vh' }} data-lenis-prevent>
                <div className="space-y-6 pt-10 md:pt-0">
                  {/* Category & Title */}
                  <div>
                    <span className="text-xs uppercase font-bold tracking-[0.2em] text-[#ff0000] block mb-2">
                      Rutab Streetwear Drop
                    </span>
                    <h2 className="text-4xl md:text-5xl font-black uppercase text-white leading-tight">
                      {product.name}
                    </h2>
                    <p className="text-xs text-[#a1a1a1] mt-2">SKU: {product.sku}</p>
                  </div>

                  {/* Price */}
                  <div className="text-3xl font-black text-white border-y border-white/5 py-4">
                    {formatPrice(priceVal, currency)}
                  </div>

                  {/* Upgraded Color selector */}
                  <div className="space-y-3">
                    <span className="text-xs uppercase font-bold tracking-widest text-[#a1a1a1] block">
                      Color: <strong className="text-white">{selectedColor}</strong>
                    </span>
                    <div className="flex gap-3">
                      {colors.map((c) => {
                        const hex = getColorHex(c);
                        const isSelected = selectedColor === c;
                        return (
                          <button
                            key={c}
                            onClick={() => setSelectedColor(c)}
                            title={c}
                            className="w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 cursor-pointer relative hover:scale-110 active:scale-95"
                            style={{
                              borderColor: isSelected ? hex : 'rgba(255,255,255,0.1)',
                              boxShadow: isSelected ? `0 0 15px ${hex}60` : 'none',
                            }}
                          >
                            <span
                              className="w-7 h-7 rounded-full inline-block transition-transform duration-300 border border-white/5"
                              style={{ 
                                backgroundColor: hex,
                                transform: isSelected ? 'scale(0.85)' : 'scale(1)' 
                              }}
                            />
                            {isSelected && (
                              <Check className={`w-3.5 h-3.5 absolute drop-shadow-md ${
                                c.toLowerCase() === 'white' ? 'text-black' : 'text-white'
                              }`} />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Size selector with multi-quantity */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase font-bold tracking-widest text-[#a1a1a1]">
                        Select Sizes & Quantities
                      </span>
                      <button
                        onClick={() => setSizeGuideOpen(true)}
                        className="text-xs font-bold text-white flex items-center gap-1.5 hover:text-[#ff0000] transition cursor-pointer"
                      >
                        <Ruler className="w-3.5 h-3.5" />
                        Size Chart
                      </button>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {sizes.map((sz) => {
                        const qty = sizeQuantities[sz] || 0;
                        return (
                          <div key={sz}
                            className={`flex items-center gap-1 border rounded-xl transition ${
                              qty > 0 ? 'border-[#ff0000] bg-[#ff0000]/5' : 'border-white/10 bg-white/5'
                            }`}
                          >
                            <span className="text-xs font-bold uppercase px-3 py-2 text-white min-w-[28px] text-center">{sz}</span>
                            <button
                              onClick={() => {
                                if (qty <= 1) {
                                  setSelectedSize(sz);
                                  updateSizeQty(sz, -1);
                                } else {
                                  updateSizeQty(sz, -1);
                                }
                              }}
                              className="w-7 h-7 rounded-full border border-white/10 flex items-center justify-center text-[10px] text-white hover:bg-white/10 transition cursor-pointer"
                            >−</button>
                            <span className="text-xs font-bold w-5 text-center text-white">{qty}</span>
                            <button
                              onClick={() => { setSelectedSize(sz); updateSizeQty(sz, 1); }}
                              className="w-7 h-7 rounded-full border border-white/10 flex items-center justify-center text-[10px] text-white hover:bg-white/10 transition cursor-pointer"
                            >+</button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Cart Action Buttons */}
                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={handleAddToCart}
                      className="flex-1 py-4 bg-[#ff0000] text-white hover:bg-[#d60000] font-bold text-sm uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 transition cursor-pointer shadow-[0_0_30px_rgba(255,0,0,0.3)]"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      {Object.values(sizeQuantities).reduce((a, b) => a + b, 0) > 0
                        ? `Add (${Object.values(sizeQuantities).reduce((a, b) => a + b, 0)}) to Cart`
                        : 'Add to Cart'}
                    </button>

                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className="w-14 h-14 rounded-2xl border border-white/10 flex items-center justify-center hover:border-white/30 text-white bg-white/5 cursor-pointer transition"
                    >
                      <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-[#ff0000] text-[#ff0000]' : ''}`} />
                    </button>
                  </div>

                  {/* Product Details Accordions */}
                  <div className="pt-6 border-t border-white/5 space-y-2">
                    {/* Materials */}
                    <div className="border border-white/5 rounded-2xl overflow-hidden bg-white/5">
                      <button
                        onClick={() => setOpenAccordion(openAccordion === 'materials' ? null : 'materials')}
                        className="w-full p-4 flex items-center justify-between font-bold text-xs uppercase tracking-wider text-white"
                      >
                        Fabric & Materials
                        <ChevronDown className={`w-4 h-4 transition-transform ${openAccordion === 'materials' ? 'rotate-180' : ''}`} />
                      </button>
                      {openAccordion === 'materials' && (
                        <div className="p-4 pt-0 text-xs text-[#e5e5e5] leading-relaxed space-y-1">
                          {(storeSettings?.fabric_care || [
                            '100% Premium Combed Cotton Loopback',
                            'Heavyweight build (Hoodies: 450GSM, T-Shirts: 300GSM)',
                            'Pre-shrunk fabric to preserve structural fitting',
                            'Screen-printed matte silicone graphics',
                          ]).map((item: string, idx: number) => (
                            <p key={idx}>• {item}</p>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Shipping & Returns */}
                    <div className="border border-white/5 rounded-2xl overflow-hidden bg-white/5">
                      <button
                        onClick={() => setOpenAccordion(openAccordion === 'shipping' ? null : 'shipping')}
                        className="w-full p-4 flex items-center justify-between font-bold text-xs uppercase tracking-wider text-white"
                      >
                        Shipping & Returns
                        <ChevronDown className={`w-4 h-4 transition-transform ${openAccordion === 'shipping' ? 'rotate-180' : ''}`} />
                      </button>
                      {openAccordion === 'shipping' && (
                        <div className="p-4 pt-0 text-xs text-[#e5e5e5] leading-relaxed space-y-1 whitespace-pre-line">
                          {shippingPolicy && <p>{shippingPolicy}</p>}
                          {returnPolicy && (
                            <>
                              {shippingPolicy && <div className="border-t border-white/10 my-2" />}
                              <p><strong>Returns</strong>: {returnPolicy}</p>
                            </>
                          )}
                          {!shippingPolicy && !returnPolicy && (
                            <p className="text-[#555] italic">Shipping & returns information not configured yet.</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </>
          )}
        </motion.div>

        {/* STREETWEAR SIZING GUIDE MODAL POPUP */}
        {isSizeGuideOpen && (
          <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[30px] p-6 space-y-6 shadow-2xl relative">
              <button
                onClick={() => setSizeGuideOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3">
                <Ruler className="w-5 h-5 text-[#ff0000]" />
                <h3 className="text-xl font-black uppercase tracking-wider">Streetwear Sizing Chart</h3>
              </div>

              <div className="overflow-x-auto border border-white/5 rounded-2xl">
                <table className="w-full text-xs text-left text-[#e5e5e5] select-none">
                  <thead className="bg-white/5 text-[10px] uppercase font-bold tracking-wider text-white border-b border-white/5">
                    <tr>
                      <th className="p-3">Size</th>
                      <th className="p-3">Chest (cm)</th>
                      <th className="p-3">Length (cm)</th>
                      <th className="p-3">Sleeve (cm)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {(storeSettings?.sizing_chart?.rows || [
                      { size: 'S', chest: '118', length: '68', sleeve: '59' },
                      { size: 'M', chest: '124', length: '71', sleeve: '61' },
                      { size: 'L', chest: '130', length: '74', sleeve: '63' },
                      { size: 'XL', chest: '136', length: '77', sleeve: '65' },
                    ]).map((row: any, idx: number) => (
                      <tr key={idx}>
                        <td className="p-3 font-bold">{row.size}</td>
                        <td className="p-3">{row.chest}</td>
                        <td className="p-3">{row.length}</td>
                        <td className="p-3">{row.sleeve}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="text-[10px] text-[#a1a1a1] leading-relaxed">
                {storeSettings?.sizing_chart?.note || '* Note: All garments are designed for a relaxed, oversized drape. If you prefer a closer, traditional fit, we recommend ordering one size down.'}
              </p>
            </div>
          </div>
        )}

      </div>
    </AnimatePresence>
  );
}
