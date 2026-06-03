'use client';

import { useState, useEffect, useMemo } from 'react';
import { getSupabase } from '../lib/supabase';
import ProductCard from './ProductCard';
import { Product, useStore, CURRENCY_CONFIG } from '../lib/store';
import { SlidersHorizontal, Search, RotateCcw, X } from 'lucide-react';

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const syncVersion = useStore((s) => s.syncVersion);
  const storeSettings = useStore((s) => s.storeSettings);

  // Filters State
  const [selectedCatalog, setSelectedCatalog] = useState<string>('All');
  const [selectedSubCatalog, setSelectedSubCatalog] = useState<string>('All');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('All');
  const [selectedSize, setSelectedSize] = useState<string>('All');
  const [selectedColor, setSelectedColor] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('newest');
  
  // Mobile filter drawer state
  const [isFilterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const currency = useStore((s) => s.currency);

  // Filter options (populated from products)
  const [catalogs, setCatalogs] = useState<string[]>(['All']);
  const [subCatalogs, setSubCatalogs] = useState<string[]>(['All']);
  const [availableSizes, setAvailableSizes] = useState<string[]>(['All']);
  const [availableColors, setAvailableColors] = useState<string[]>(['All']);
  // Price ranges list — reacts to currency changes
  const currencyConfig = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG['KWD (K.D)'];
  const fmt = (v: number) => {
    const converted = v * currencyConfig.rate;
    const formatted = converted.toLocaleString(undefined, { minimumFractionDigits: currencyConfig.decimals, maximumFractionDigits: currencyConfig.decimals });
    return currencyConfig.suffix ? `${formatted} ${currencyConfig.symbol}` : `${currencyConfig.symbol}${formatted}`;
  };
  const priceRanges = useMemo(() => {
    const thresholds = storeSettings?.filter_config?.priceThresholds || [];
    const t15 = thresholds.find((t: any) => t.value === 'under-15')?.max;
    const t25min = thresholds.find((t: any) => t.value === '15-25')?.min;
    const t25max = thresholds.find((t: any) => t.value === '15-25')?.max;
    const t25 = thresholds.find((t: any) => t.value === 'over-25')?.min;
    const low = t15 ? parseFloat(t15) : 15;
    const midMin = t25min ? parseFloat(t25min) : 15;
    const midMax = t25max ? parseFloat(t25max) : 25;
    const high = t25 ? parseFloat(t25) : 25;
    return [
      { label: 'All Prices', value: 'All' },
      { label: `Under ${fmt(low)}`, value: 'under-15' },
      { label: `${fmt(midMin)} - ${fmt(midMax)}`, value: '15-25' },
      { label: `Over ${fmt(high)}`, value: 'over-25' },
    ];
  }, [currency, storeSettings]);

  // Fetch products and set filter options
  useEffect(() => {
    async function fetchProductsAndSetFilters() {
      try {
        const client = getSupabase();
        const { data } = await client
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });
        if (data) {
          const mappedData = data.map((p: any) => ({
            ...p,
            catalog: p.catalog || p.category,
            subCatalog: p.subCatalog || p.subcategory
          }));
          setProducts(mappedData);

          // Extract unique catalogs and subCatalogs for filters
          const uniqueCatalogs = ['All', ...new Set(mappedData.map(p => p.catalog).filter(Boolean))];
          const catOrder = storeSettings?.filter_config?.catalogOrder || [];
          const sortedCatalogs = ['All', ...catOrder.filter((c: string) => c !== 'All' && uniqueCatalogs.includes(c)), ...uniqueCatalogs.filter((c: string) => c !== 'All' && !catOrder.includes(c))];
          setCatalogs(sortedCatalogs);

          // Extract unique sizes from all products
          const allSizes = new Set<string>();
          mappedData.forEach((p: any) => (p.sizes || []).forEach((s: string) => allSizes.add(s)));
          const storeSizeOrder = storeSettings?.filter_config?.sizeOrder || ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'One Size'];
          const sortedSizes = ['All', ...storeSizeOrder.filter((s: string) => allSizes.has(s)), ...[...allSizes].filter((s: string) => !storeSizeOrder.includes(s)).sort()];
          setAvailableSizes(sortedSizes);

          // Extract unique colors from all products
          const allColors = new Set<string>();
          mappedData.forEach((p: any) => (p.colors || []).forEach((c: string) => allColors.add(c)));
          const storeColorConfig = storeSettings?.filter_config?.colorConfig || [];
          const colorOrder = ['All', ...storeColorConfig.map((c: any) => c.name).filter((n: string) => allColors.has(n)), ...[...allColors].filter((c: string) => !storeColorConfig.some((sc: any) => sc.name === c)).sort()];
          setAvailableColors(colorOrder);

          // Initialize subCatalogs to ['All'] - will update when catalog changes
          setSubCatalogs(['All']);
        }
      } catch (err) {
        console.error('Error fetching shop products:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProductsAndSetFilters();
  }, [syncVersion]);

  // Update subCatalogs options when selectedCatalog changes
  useEffect(() => {
    if (selectedCatalog === 'All') {
      setSubCatalogs(['All']);
      return;
    }
    // Get unique subCatalogs for the selectedCatalog
    const uniqueSubCatalogs = [...new Set(
      products
        .filter(p => p.catalog === selectedCatalog)
        .map(p => p.subCatalog)
        .filter((sc): sc is string => Boolean(sc))
    )];
    // Apply admin visibility config — merge saved visible sub-cats with any newly discovered ones
    const savedVisible = storeSettings?.filter_config?.visibleSubCatalogs?.[selectedCatalog];
    const visibleSubs = savedVisible ? [...new Set([...savedVisible, ...uniqueSubCatalogs])] : uniqueSubCatalogs;
    const filtered = uniqueSubCatalogs.filter(sc => visibleSubs.includes(sc));
    setSubCatalogs(['All', ...filtered]);
  }, [selectedCatalog, products]);

  // Apply filters inline during render
  const filteredProducts = products.filter((p) => {
    // Search Query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const nameMatch = p.name.toLowerCase().includes(query);
      if (!nameMatch) return false;
    }

    // Catalog Filter
    if (selectedCatalog !== 'All' && p.catalog !== selectedCatalog) {
      return false;
    }
    // SubCatalog Filter
    if (selectedSubCatalog !== 'All' && p.subCatalog !== selectedSubCatalog) {
      return false;
    }

    // Size Filter (driven by DB data)
    if (selectedSize !== 'All' && (!p.sizes || !p.sizes.includes(selectedSize))) {
      return false;
    }

    // Color Filter (driven by DB data)
    if (selectedColor !== 'All' && (!p.colors || !p.colors.includes(selectedColor))) {
      return false;
    }

    // Price Range Filter
    if (selectedPriceRange !== 'All') {
      const price = typeof p.price === 'string' ? parseFloat(p.price) : p.price;
      if (selectedPriceRange === 'under-15' && price >= 15) return false;
      if (selectedPriceRange === '15-25' && (price < 15 || price > 25)) return false;
      if (selectedPriceRange === 'over-25' && price <= 25) return false;
    }

    return true;
  });

  // Apply Sorting
  const sortedProducts = [...filteredProducts];
  if (sortBy === 'newest') {
    sortedProducts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } else if (sortBy === 'price-low') {
    sortedProducts.sort((a, b) => {
      const priceA = typeof a.price === 'string' ? parseFloat(a.price) : a.price;
      const priceB = typeof b.price === 'string' ? parseFloat(b.price) : b.price;
      return priceA - priceB;
    });
  } else if (sortBy === 'price-high') {
    sortedProducts.sort((a, b) => {
      const priceA = typeof a.price === 'string' ? parseFloat(a.price) : a.price;
      const priceB = typeof b.price === 'string' ? parseFloat(b.price) : b.price;
      return priceB - priceA;
    });
  } else if (sortBy === 'best-selling') {
    sortedProducts.sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0));
  }

  const resetFilters = () => {
    setSelectedCatalog('All');
    setSelectedSubCatalog('All');
    setSelectedPriceRange('All');
    setSelectedSize('All');
    setSelectedColor('All');
    setSearchQuery('');
    setSortBy('newest');
  };

  return (
    <div className="pt-24 min-h-screen bg-black text-white px-6 max-w-7xl mx-auto pb-24">
      {/* Page Header */}
      <div className="border-b border-white/5 pb-10 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-[#ff0000] text-xs font-bold tracking-[0.25em] uppercase block mb-3">
            Rutab Catalog
          </span>
          <h2 className="text-5xl md:text-7xl font-black uppercase">
            All Products
          </h2>
        </div>
        
        {/* Quick Search */}
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Search drops..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm outline-none focus:border-[#ff0000] transition duration-300"
          />
          <Search className="w-5 h-5 text-[#a1a1a1] absolute left-4 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      <div className="grid lg:grid-cols-[250px_1fr] gap-10 items-start">
        {/* DESKTOP SIDEBAR FILTERS */}
        <aside className="hidden lg:block sticky top-28 h-[calc(100vh-7rem)] overflow-y-auto no-scrollbar" style={{ overscrollBehavior: 'contain' }}>
          <div className="space-y-8 bg-[#0a0a0a] border border-white/5 rounded-[30px] p-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="font-bold uppercase text-sm tracking-wider flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#ff0000]" />
              Filters
            </h3>
            <button
              onClick={resetFilters}
              className="text-xs text-[#a1a1a1] hover:text-white flex items-center gap-1 transition cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </div>

           {/* Catalog Filter */}
           <div className="space-y-3">
             <h4 className="text-xs uppercase font-bold text-[#a1a1a1] tracking-wider">Catalog</h4>
             <div className="flex flex-col gap-2">
               {catalogs.map((cat) => (
                 <button
                   key={cat}
                   onClick={() => { setSelectedCatalog(cat); setSelectedSubCatalog('All'); }}
                   className={`text-left text-xs py-1.5 transition-colors uppercase tracking-wider font-semibold cursor-pointer ${
                     selectedCatalog === cat ? 'text-[#ff0000]' : 'text-white/60 hover:text-white'
                   }`}
                 >
                   {cat}
                 </button>
               ))}
             </div>
           </div>

           {/* SubCatalog Filter */}
           <div className="space-y-3 pt-4 border-t border-white/5">
             <h4 className="text-xs uppercase font-bold text-[#a1a1a1] tracking-wider">Sub Catalog</h4>
             <div className="flex flex-col gap-2">
               {subCatalogs.map((sc) => (
                 <button
                   key={sc}
                   onClick={() => setSelectedSubCatalog(sc)}
                   className={`text-left text-xs py-1.5 transition-colors uppercase tracking-wider font-semibold cursor-pointer ${
                     selectedSubCatalog === sc ? 'text-[#ff0000]' : 'text-white/60 hover:text-white'
                   }`}
                 >
                   {sc}
                 </button>
               ))}
             </div>
           </div>

          {/* Price Range Filter */}
          <div className="space-y-3 pt-4 border-t border-white/5">
            <h4 className="text-xs uppercase font-bold text-[#a1a1a1] tracking-wider">Price</h4>
            <div className="flex flex-col gap-2">
              {priceRanges.map((pr) => (
                <button
                  key={pr.value}
                  onClick={() => setSelectedPriceRange(pr.value)}
                  className={`text-left text-xs py-1.5 transition-colors uppercase tracking-wider font-semibold cursor-pointer ${
                    selectedPriceRange === pr.value ? 'text-[#ff0000]' : 'text-white/60 hover:text-white'
                  }`}
                >
                  {pr.label}
                </button>
              ))}
            </div>
          </div>

          {/* Size Filter (DB-driven) */}
          {availableSizes.length > 1 && (
            <div className="space-y-3 pt-4 border-t border-white/5">
              <h4 className="text-xs uppercase font-bold text-[#a1a1a1] tracking-wider">Size</h4>
              <div className="flex gap-2 flex-wrap">
                {availableSizes.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition uppercase cursor-pointer ${
                      selectedSize === sz
                        ? 'bg-white text-black border-white'
                        : 'border-white/10 bg-white/5 text-white hover:border-white/30'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Filter (DB-driven) */}
          {availableColors.length > 1 && (
            <div className="space-y-3 pt-4 border-t border-white/5">
              <h4 className="text-xs uppercase font-bold text-[#a1a1a1] tracking-wider">Color</h4>
              <div className="flex gap-2 flex-wrap">
                {availableColors.map((c) => {
                  const colorHex = (storeSettings?.filter_config?.colorConfig || []).find((cc: any) => cc.name === c)?.hex;
                  return (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition uppercase cursor-pointer flex items-center gap-1.5 ${
                        selectedColor === c
                          ? 'bg-white text-black border-white'
                          : 'border-white/10 bg-white/5 text-white hover:border-white/30'
                      }`}
                    >
                      {colorHex && <span className="w-3 h-3 rounded-full border border-white/20 shrink-0" style={{ backgroundColor: colorHex }} />}
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        </aside>

        {/* MAIN PRODUCT LIST GRID */}
        <main className="space-y-8">
          {/* Sorting and Count toolbar */}
          <div className="flex items-center justify-between bg-[#0a0a0a] border border-white/5 rounded-2xl p-4 shadow-md">
            <p className="text-xs text-[#a1a1a1]">
              Showing <strong className="text-white">{sortedProducts.length}</strong> drops
            </p>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setFilterDrawerOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 border border-white/10 rounded-xl bg-white/5 text-xs uppercase font-bold tracking-wider hover:border-white/30 cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Filter
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-black border border-white/10 rounded-xl text-xs uppercase tracking-wider font-bold py-2 px-3 outline-none cursor-pointer focus:border-[#ff0000] text-white"
              >
                <option value="newest">Newest Drops</option>
                <option value="best-selling">Best Sellers</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Grid Products */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  className="aspect-[3/4] h-[380px] rounded-[30px] bg-[#0a0a0a] border border-white/5 animate-pulse"
                />
              ))}
            </div>
          ) : sortedProducts.length === 0 ? (
            <div className="text-center py-24 bg-[#0a0a0a] border border-white/5 rounded-[30px]">
              <p className="text-[#a1a1a1] mb-4">No drops match your active filters.</p>
              <button
                onClick={resetFilters}
                className="px-6 py-3 rounded-xl bg-white text-black hover:bg-[#ff0000] hover:text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* MOBILE DRAWER FILTERS */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
          {/* Backdrop */}
          <div
            onClick={() => setFilterDrawerOpen(false)}
            className="absolute inset-0 bg-black/80"
          />

          {/* Drawer content */}
          <div className="relative w-full max-w-xs bg-[#0a0a0a] border-l border-white/10 h-full p-6 flex flex-col justify-between shadow-2xl z-10 overflow-y-auto">
            <div className="space-y-8">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="font-bold uppercase text-sm tracking-wider flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#ff0000]" />
                  Filters
                </h3>
                <button
                  onClick={() => setFilterDrawerOpen(false)}
                  className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-[#a1a1a1] hover:text-white transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

             {/* Catalog Filter */}
             <div className="space-y-3">
               <h4 className="text-xs uppercase font-bold text-[#a1a1a1] tracking-wider">Catalog</h4>
               <div className="flex flex-wrap gap-2">
                 {catalogs.map((cat) => (
                   <button
                     key={cat}
                     onClick={() => { setSelectedCatalog(cat); setSelectedSubCatalog('All'); }}
                     className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold transition uppercase cursor-pointer ${
                       selectedCatalog === cat
                         ? 'bg-[#ff0000] text-white border-[#ff0000]'
                         : 'border-white/10 bg-white/5 text-white'
                     }`}
                   >
                     {cat}
                   </button>
                 ))}
               </div>
             </div>

             {/* SubCatalog Filter */}
             <div className="space-y-3 pt-4 border-t border-white/5">
               <h4 className="text-xs uppercase font-bold text-[#a1a1a1] tracking-wider">Sub Catalog</h4>
               <div className="flex flex-wrap gap-2">
                 {subCatalogs.map((sc) => (
                   <button
                     key={sc}
                     onClick={() => setSelectedSubCatalog(sc)}
                     className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold transition uppercase cursor-pointer ${
                       selectedSubCatalog === sc
                         ? 'bg-[#ff0000] text-white border-[#ff0000]'
                         : 'border-white/10 bg-white/5 text-white'
                     }`}
                   >
                     {sc}
                   </button>
                 ))}
               </div>
             </div>

              {/* Price Range Filter */}
              <div className="space-y-3 pt-4 border-t border-white/5">
                <h4 className="text-xs uppercase font-bold text-[#a1a1a1] tracking-wider">Price</h4>
                <div className="flex flex-col gap-2">
                  {priceRanges.map((pr) => (
                    <button
                      key={pr.value}
                      onClick={() => setSelectedPriceRange(pr.value)}
                      className={`text-left text-xs py-1.5 transition-colors uppercase tracking-wider font-semibold cursor-pointer ${
                        selectedPriceRange === pr.value ? 'text-[#ff0000]' : 'text-white/60'
                      }`}
                    >
                      {pr.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Filter (DB-driven) */}
              {availableSizes.length > 1 && (
                <div className="space-y-3 pt-4 border-t border-white/5">
                  <h4 className="text-xs uppercase font-bold text-[#a1a1a1] tracking-wider">Size</h4>
                  <div className="flex gap-2 flex-wrap">
                    {availableSizes.map((sz) => (
                      <button
                        key={sz}
                        onClick={() => setSelectedSize(sz)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition uppercase cursor-pointer ${
                          selectedSize === sz
                            ? 'bg-white text-black border-white'
                            : 'border-white/10 bg-white/5 text-white'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Filter (DB-driven) */}
              {availableColors.length > 1 && (
                <div className="space-y-3 pt-4 border-t border-white/5">
                  <h4 className="text-xs uppercase font-bold text-[#a1a1a1] tracking-wider">Color</h4>
                  <div className="flex gap-2 flex-wrap">
                    {availableColors.map((c) => {
                      const colorHex = (storeSettings?.filter_config?.colorConfig || []).find((cc: any) => cc.name === c)?.hex;
                      return (
                        <button
                          key={c}
                          onClick={() => setSelectedColor(c)}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition uppercase cursor-pointer flex items-center gap-1.5 ${
                            selectedColor === c
                              ? 'bg-white text-black border-white'
                              : 'border-white/10 bg-white/5 text-white'
                          }`}
                        >
                          {colorHex && <span className="w-3 h-3 rounded-full border border-white/20 shrink-0" style={{ backgroundColor: colorHex }} />}
                          {c}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-white/10 flex gap-4 mt-6">
              <button
                onClick={resetFilters}
                className="flex-1 py-3 border border-white/10 rounded-xl bg-white/5 text-xs font-bold uppercase tracking-wider hover:border-white/20 transition cursor-pointer"
              >
                Reset
              </button>
              <button
                onClick={() => setFilterDrawerOpen(false)}
                className="flex-1 py-3 bg-[#ff0000] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#d60000] transition cursor-pointer"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
