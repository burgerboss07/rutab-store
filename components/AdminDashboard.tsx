'use client';

import { useState, useEffect, useRef } from 'react';
import { getSupabase } from '../lib/supabase';
import { Product, Order } from '../lib/store';
import Image from 'next/image';
import { ShieldCheck, Plus, Pencil, Trash2, CheckCircle2, Package, RefreshCw, BarChart2, DollarSign, Users } from 'lucide-react';
import CustomersPanel from './admin/CustomersPanel';

let skuCounter = 0;
function generateSku(category: string): string {
  skuCounter += 1;
  return `RTB-${category.substring(0, 2).toUpperCase()}-${skuCounter.toString(36).padStart(4, '0')}`;
}

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Active view inside Admin
  const [adminTab, setAdminTab] = useState<'analytics' | 'products' | 'orders' | 'customers'>('analytics');

  // Product Add/Edit Form State
  const [showProductForm, setShowProductForm] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [editingId, setEditingId] = useState<string | null>(null);

  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodImg, setProdImg] = useState('');
  const [prodCategory, setProdCategory] = useState('Brand Shirts');
  const [prodStock, setProdStock] = useState('50');
  const [prodFeatured, setProdFeatured] = useState(false);
  const [prodSku, setProdSku] = useState('');

  const [prodSizes, setProdSizes] = useState<string[]>([]);
  const [prodStockPerSize, setProdStockPerSize] = useState<Record<string, string>>({});
  const [prodType, setProdType] = useState('Shirt');
  const [prodColors, setProdColors] = useState<string[]>([]);
  const [prodBackImg, setProdBackImg] = useState('');

  const [productSearch, setProductSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | 'pending' | 'shipped' | 'delivered'>('all');
  const [productFilter, setProductFilter] = useState<'all' | 'featured' | 'low-stock' | 'out-of-stock'>('all');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const client = getSupabase();
      // Fetch Products
      const { data: prodData } = await client
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      if (prodData) setProducts(prodData as Product[]);

      // Fetch Orders
      const { data: ordData } = await client
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (ordData) setOrders(ordData as Order[]);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch products and orders on mount
  const didFetch = useRef(false);
  useEffect(() => {
    if (!didFetch.current) {
      didFetch.current = true;
      void fetchAdminData();
    }
  });

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName || !prodPrice || !prodImg) {
      alert('Please fill in required product details.');
      return;
    }

    const generatedSku = prodSku || generateSku(prodCategory);

    const totalStock = Object.values(prodStockPerSize).reduce((acc, curr) => acc + (parseInt(curr) || 0), 0);

    const payload = {
      name: prodName,
      description: prodDesc,
      price: parseFloat(prodPrice),
      image_url: prodImg,
      category: prodCategory,
      stock: totalStock > 0 ? totalStock : (parseInt(prodStock) || 0),
      is_featured: prodFeatured,
      sku: generatedSku,
      sizes: prodSizes,
      colors: prodColors,
      stock_per_size: prodStockPerSize,
      product_type: prodType,
      back_image_url: prodBackImg
    };

      try {
      const client = getSupabase();
      if (formMode === 'add') {
        const { error } = await client.from('products').insert(payload);
        if (error) throw error;
        alert('Product added successfully!');
      } else if (formMode === 'edit' && editingId) {
        const { error } = await client
          .from('products')
          .update(payload)
          .eq('id', editingId);
        if (error) throw error;
        alert('Product updated successfully!');
      }
      resetForm();
      fetchAdminData();
    } catch (err) {
      console.error('Product operation failed:', err);
      alert('Error updating products. Check console.');
    }
  };

  const handleEditInit = (p: Product) => {
    setFormMode('edit');
    setEditingId(p.id);
    setProdName(p.name);
    setProdDesc(p.description || '');
    setProdPrice(typeof p.price === 'string' ? p.price : p.price.toString());
    setProdImg(p.image_url || '');
    setProdCategory(p.category || 'Brand Shirts');
    setProdStock(p.stock?.toString() ?? '0');
    setProdFeatured(p.is_featured || false);
    setProdSku(p.sku || '');
    // Provide default fallback since DB might not have these
    setProdSizes(p.sizes || []);
    setProdStockPerSize(p.stock_per_size || {});
    setProdType(p.product_type || 'Shirt');
    setProdColors(p.colors || []);
    setProdBackImg(p.back_image_url || '');
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const client = getSupabase();
      const { error } = await client.from('products').delete().eq('id', id);
      if (error) throw error;
      alert('Product deleted.');
      fetchAdminData();
    } catch (err) {
      console.error('Failed to delete product:', err);
      alert('Failed to delete product. It might be referenced in order history.');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'pending' ? 'shipped' : 'delivered';
    try {
      const client = getSupabase();
      const { error } = await client
        .from('orders')
        .update({ status: nextStatus })
        .eq('id', orderId);
      if (error) throw error;
      alert(`Order status updated to ${nextStatus}!`);
      fetchAdminData();
    } catch (err) {
      console.error('Order update failed:', err);
    }
  };

  const resetForm = () => {
    setProdName('');
    setProdDesc('');
    setProdPrice('');
    setProdImg('');
    setProdCategory('Brand Shirts');
    setProdStock('50');
    setProdFeatured(false);
    setProdSku('');
    setProdSizes([]);
    setProdStockPerSize({});
    setProdType('Shirt');
    setProdColors([]);
    setProdBackImg('');
    setEditingId(null);
    setFormMode('add');
    setShowProductForm(false);
  };

  const formatKWD = (value: number) => {
    return `${value.toFixed(3)} KWD`;
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = productSearch.trim() === '' || p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.category.toLowerCase().includes(productSearch.toLowerCase());
    if (!matchesSearch) return false;

    if (productFilter === 'featured') return p.is_featured;
    if (productFilter === 'low-stock') return p.stock > 0 && p.stock <= 5;
    if (productFilter === 'out-of-stock') return p.stock <= 0;
    return true;
  });

  const filteredOrders = orders.filter((ord) => {
    const matchesSearch = orderSearch.trim() === '' || ord.id.toLowerCase().includes(orderSearch.toLowerCase()) || ord.address.toLowerCase().includes(orderSearch.toLowerCase()) || ord.payment_method.toLowerCase().includes(orderSearch.toLowerCase());
    if (!matchesSearch) return false;
    if (orderStatusFilter !== 'all') return ord.status === orderStatusFilter;
    return true;
  });

  // Calculations for Analytics
  const totalRevenue = orders.reduce((sum, o) => sum + (typeof o.total_price === 'number' ? o.total_price : parseFloat(String(o.total_price))), 0);
  const aov = orders.length > 0 ? totalRevenue / orders.length : 0;
  const outOfStockCount = products.filter((p) => (p.stock ?? 0) <= 0).length;

  return (
    <div className="pt-24 min-h-screen bg-black text-white px-6 max-w-6xl mx-auto pb-24 grid md:grid-cols-[250px_1fr] gap-10 items-start">
      
      {/* Sidebar Controls */}
      <aside className="space-y-6">
        <div className="bg-[#0a0a0a] border border-white/5 rounded-[30px] p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#ff0000]/10 border border-[#ff0000]/20 flex items-center justify-center text-[#ff0000]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm uppercase text-white">Root Admin</h3>
              <p className="text-[10px] text-green-500 uppercase tracking-widest font-black">Live Console</p>
            </div>
          </div>
          
          <button
            onClick={fetchAdminData}
            className="w-full py-2.5 rounded-xl border border-white/10 hover:border-red-500/30 hover:bg-white/5 text-white transition text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Sync Db
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-col gap-2 bg-[#0a0a0a] border border-white/5 rounded-[30px] p-4 shadow-xl">
          <button
            onClick={() => setAdminTab('analytics')}
            className={`w-full py-3.5 px-4 rounded-2xl flex items-center gap-3 text-xs uppercase font-bold tracking-wider transition-colors cursor-pointer ${
              adminTab === 'analytics' ? 'bg-[#ff0000] text-white' : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            Metrics Summary
          </button>
          
          <button
            onClick={() => setAdminTab('products')}
            className={`w-full py-3.5 px-4 rounded-2xl flex items-center gap-3 text-xs uppercase font-bold tracking-wider transition-colors cursor-pointer ${
              adminTab === 'products' ? 'bg-[#ff0000] text-white' : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Package className="w-4 h-4" />
            Products CRUD ({products.length})
          </button>
          
          <button
            onClick={() => setAdminTab('orders')}
            className={`w-full py-3.5 px-4 rounded-2xl flex items-center gap-3 text-xs uppercase font-bold tracking-wider transition-colors cursor-pointer ${
              adminTab === 'orders' ? 'bg-[#ff0000] text-white' : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            Orders Fulfilment ({orders.length})
          </button>

          <button
            onClick={() => setAdminTab('customers')}
            className={`w-full py-3.5 px-4 rounded-2xl flex items-center gap-3 text-xs uppercase font-bold tracking-wider transition-colors cursor-pointer ${
              adminTab === 'customers' ? 'bg-[#ff0000] text-white' : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-4 h-4" />
            Vault Members
          </button>
        </div>
      </aside>

      {/* Main Tab Panels */}
      <main className="bg-[#0a0a0a] border border-white/5 rounded-[40px] p-6 md:p-8 shadow-xl min-h-[60vh] overflow-x-auto space-y-8">
        {loading ? (
          <div className="h-[40vh] flex flex-col items-center justify-center">
            <RefreshCw className="w-8 h-8 text-[#ff0000] animate-spin mb-4" />
            <p className="text-[#a1a1a1] text-xs uppercase tracking-widest">Accessing Supabase Gateway...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
              <div className="rounded-3xl bg-white/5 border border-white/5 p-5 space-y-3">
                <p className="text-[10px] uppercase tracking-[0.35em] text-[#a1a1a1]">Live Sales</p>
                <p className="text-3xl font-black text-white">{formatKWD(totalRevenue)}</p>
                <p className="text-[11px] text-[#a1a1a1]">Total revenue across all orders.</p>
              </div>
              <div className="rounded-3xl bg-white/5 border border-white/5 p-5 space-y-3">
                <p className="text-[10px] uppercase tracking-[0.35em] text-[#a1a1a1]">Orders</p>
                <p className="text-3xl font-black text-white">{orders.length}</p>
                <p className="text-[11px] text-[#a1a1a1]">New + active orders in the system.</p>
              </div>
              <div className="rounded-3xl bg-white/5 border border-white/5 p-5 space-y-3">
                <p className="text-[10px] uppercase tracking-[0.35em] text-[#a1a1a1]">Customers</p>
                <p className="text-3xl font-black text-white">—</p>
                <p className="text-[11px] text-[#a1a1a1]">See Vault Members tab.</p>
              </div>
              <div className="rounded-3xl bg-white/5 border border-white/5 p-5 space-y-3">
                <p className="text-[10px] uppercase tracking-[0.35em] text-[#a1a1a1]">Alerts</p>
                <p className="text-3xl font-black text-white">{outOfStockCount}</p>
                <p className="text-[11px] text-[#a1a1a1]">Products currently out of stock.</p>
              </div>
            </div>

            {/* Admin Tab Panel */}
            {adminTab === 'analytics' && (
              <div className="space-y-8 animate-fade-in-up">
                <h2 className="text-3xl font-black uppercase tracking-wider pb-4 border-b border-white/5">Store Metrics Overview</h2>
                
                {/* Visual stats grid cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                    <DollarSign className="w-6 h-6 text-[#ff0000]" />
                    <p className="text-[10px] text-[#a1a1a1] uppercase font-bold">Total Sales Revenue</p>
                    <p className="text-2xl font-black text-white">{formatKWD(totalRevenue)}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                    <Package className="w-6 h-6 text-[#ff0000]" />
                    <p className="text-[10px] text-[#a1a1a1] uppercase font-bold">Orders Received</p>
                    <p className="text-2xl font-black text-white">{orders.length}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                    <CheckCircle2 className="w-6 h-6 text-[#ff0000]" />
                    <p className="text-[10px] text-[#a1a1a1] uppercase font-bold">Stock alerts</p>
                    <p className="text-2xl font-black text-white">{outOfStockCount} Out of stock</p>
                  </div>
                </div>

                {/* Additional metrics */}
                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                  <h4 className="font-bold text-xs uppercase text-[#a1a1a1]">Average Order Value (AOV)</h4>
                  <p className="text-3xl font-black text-white">{formatKWD(aov)}</p>
                  <p className="text-[10px] text-[#a1a1a1]">Target: 45.000 KWD (PRD Objective)</p>
                </div>
              </div>
            )}

            {/* PRODUCTS CRUD Tab Panel */}
            {adminTab === 'products' && (
              <div className="space-y-6 animate-fade-in-up">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between pb-4 border-b border-white/5">
                  <div>
                    <h2 className="text-3xl font-black uppercase tracking-wider">Catalog CRUD</h2>
                    <p className="text-sm text-[#a1a1a1] mt-1">Add, edit, and manage product inventory from one dashboard.</p>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <button
                      onClick={() => {
                        resetForm();
                        setShowProductForm(true);
                      }}
                      className="px-5 py-3 rounded-2xl bg-[#ff0000] hover:bg-[#e31d1d] text-white font-bold uppercase text-xs tracking-[0.2em] transition"
                    >
                      Add product
                    </button>
                    <div className="relative w-full sm:w-auto">
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="w-full min-w-[220px] bg-[#0a0a0a] border border-white/10 rounded-2xl py-3 px-4 text-sm text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {[
                    { label: 'All', value: 'all' },
                    { label: 'Featured', value: 'featured' },
                    { label: 'Low Stock', value: 'low-stock' },
                    { label: 'Out of Stock', value: 'out-of-stock' },
                  ].map((filter) => (
                    <button
                      key={filter.value}
                      onClick={() => setProductFilter(filter.value as any)}
                      className={`px-4 py-2 rounded-full uppercase text-[10px] font-bold tracking-[0.3em] transition ${productFilter === filter.value ? 'bg-[#ff0000] text-white' : 'bg-white/5 text-white/80 hover:bg-white/10'}`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>

                {showProductForm && (
                  <form onSubmit={handleProductSubmit} className="p-6 rounded-3xl bg-[#111111] border border-white/5 space-y-6">
                    <div>
                      <h3 className="font-bold text-2xl text-white">
                        {formMode === 'add' ? 'Add Product' : 'Edit Product'}
                      </h3>
                      <p className="text-sm text-[#a1a1a1]">
                        {formMode === 'add' ? 'Add a new product to the catalog' : `Modify the details for ${prodName || 'this product'}`}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-bold text-white">Product Name</label>
                      <input
                        type="text"
                        required
                        value={prodName}
                        onChange={(e) => setProdName(e.target.value)}
                        placeholder="Travis Scott"
                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg py-3 px-4 text-sm text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-bold text-white">Price (USD)</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={prodPrice}
                        onChange={(e) => setProdPrice(e.target.value)}
                        placeholder="16.1"
                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg py-3 px-4 text-sm text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-white">Available Sizes</label>
                      <div className="flex flex-wrap gap-2">
                        {['S', 'M', 'L', 'XL', 'XXL', 'XXXL'].map((size) => {
                          const isSelected = prodSizes.includes(size);
                          return (
                            <button
                              type="button"
                              key={size}
                              onClick={() => {
                                if (isSelected) {
                                  setProdSizes(prodSizes.filter(s => s !== size));
                                } else {
                                  setProdSizes([...prodSizes, size]);
                                }
                              }}
                              className={`px-5 py-2.5 rounded-lg border font-bold text-sm transition cursor-pointer ${
                                isSelected ? 'bg-[#8c2121] text-white border-[#8c2121]' : 'bg-[#0a0a0a] text-white border-white/10 hover:border-white/30'
                              }`}
                            >
                              {size}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {prodSizes.length > 0 && (
                      <div className="p-5 border border-white/10 rounded-xl bg-[#0f0f0f] space-y-4">
                        <h4 className="font-bold text-white text-sm">Stock Per Size</h4>
                        <div className="grid grid-cols-2 gap-4">
                          {prodSizes.map((size) => (
                            <div key={size} className="space-y-1">
                              <label className="text-xs font-bold text-white">Stock for {size}</label>
                              <input
                                type="number"
                                value={prodStockPerSize[size] || ''}
                                onChange={(e) => setProdStockPerSize({ ...prodStockPerSize, [size]: e.target.value })}
                                placeholder="1"
                                className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg py-2 px-3 text-sm text-white"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-white">Product Type</label>
                      <div className="flex flex-wrap gap-2">
                        {['Shirt', 'Hoodie', 'Cap', 'Trouser'].map((type) => (
                          <button
                            type="button"
                            key={type}
                            onClick={() => setProdType(type)}
                            className={`px-5 py-2.5 rounded-lg border font-bold text-sm transition cursor-pointer ${
                              prodType === type ? 'bg-[#8c2121] text-white border-[#8c2121]' : 'bg-[#0a0a0a] text-white border-white/10 hover:border-white/30'
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-bold text-white">Category</label>
                      <select
                        value={prodCategory}
                        onChange={(e) => setProdCategory(e.target.value)}
                        className="w-full bg-[#0a0a0a] border border-[#8c2121] focus:ring focus:ring-[#8c2121]/30 rounded-lg py-3 px-4 text-sm text-white outline-none appearance-none cursor-pointer"
                      >
                        <option value="Arabic Poetry">Arabic Poetry</option>
                        <option value="Cartoons">Cartoons</option>
                        <option value="Brand Shirts">Brand Shirts</option>
                        <option value="Urdu Poetry">Urdu Poetry</option>
                        <option value="Trippy Designs">Trippy Designs</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-white">Available Colors</label>
                      <div className="flex flex-wrap gap-2">
                        {['Black', 'White', 'Grey', 'Brown'].map((color) => {
                          const isSelected = prodColors.includes(color);
                          return (
                            <button
                              type="button"
                              key={color}
                              onClick={() => {
                                if (isSelected) {
                                  setProdColors(prodColors.filter(c => c !== color));
                                } else {
                                  setProdColors([...prodColors, color]);
                                }
                              }}
                              className={`px-5 py-2.5 rounded-lg border font-bold text-sm transition cursor-pointer ${
                                isSelected ? 'bg-[#8c2121] text-white border-[#8c2121]' : 'bg-[#0a0a0a] text-white border-white/10 hover:border-white/30'
                              }`}
                            >
                              {color}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-bold text-white">Front Product Image URL</label>
                      <input
                        type="url"
                        required
                        value={prodImg}
                        onChange={(e) => setProdImg(e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg py-3 px-4 text-sm text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-bold text-white">Back Product Image URL</label>
                      <input
                        type="url"
                        value={prodBackImg}
                        onChange={(e) => setProdBackImg(e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg py-3 px-4 text-sm text-white"
                      />
                    </div>

                    <div className="flex gap-4 pt-2">
                      <button
                        type="submit"
                        className="px-6 py-3 bg-[#8c2121] hover:bg-[#a62b2b] text-white rounded-lg text-sm font-bold transition cursor-pointer"
                      >
                        Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={resetForm}
                        className="px-6 py-3 border border-white/10 rounded-lg text-sm font-bold text-white hover:bg-white/5 cursor-pointer transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                <div className="space-y-3">
                  {products.map((p) => (
                    <div
                      key={p.id}
                      className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
                    >
                      <div className="flex gap-4 items-center min-w-0 w-full sm:w-auto">
                        <div className="w-10 h-12 relative rounded-lg bg-black border border-white/10 overflow-hidden flex-shrink-0">
                          <Image
                            src={p.image_url}
                            alt={p.name}
                            fill
                            sizes="40px"
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-xs uppercase text-white truncate max-w-[180px]">{p.name}</h4>
                          <div className="flex items-center gap-3 text-[10px] text-[#a1a1a1] mt-0.5">
                            <span>SKU: {p.sku}</span>
                            <span>Stock: <strong className={p.stock <= 0 ? 'text-[#ff0000]' : 'text-white'}>{p.stock}</strong></span>
                            <span>{p.is_featured && <span className="text-[#ff0000] font-bold">FEATURED</span>}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditInit(p)}
                          className="w-8 h-8 rounded-lg border border-white/10 hover:border-white/30 flex items-center justify-center text-[#a1a1a1] hover:text-white transition cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="w-8 h-8 rounded-lg border border-white/10 hover:border-[#ff0000] flex items-center justify-center text-[#a1a1a1] hover:text-[#ff0000] transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ORDERS Tab Panel */}
            {adminTab === 'orders' && (
              <div className="space-y-6 animate-fade-in-up">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between pb-4 border-b border-white/5">
                  <div>
                    <h2 className="text-3xl font-black uppercase tracking-wider">Fulfillments Manager</h2>
                    <p className="text-sm text-[#a1a1a1] mt-1">Search orders, update status, and keep fulfilment moving.</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <input
                      type="text"
                      placeholder="Search orders by ID, address or method"
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      className="w-full min-w-[260px] bg-[#0a0a0a] border border-white/10 rounded-2xl py-3 px-4 text-sm text-white"
                    />
                    <select
                      value={orderStatusFilter}
                      onChange={(e) => setOrderStatusFilter(e.target.value as any)}
                      className="bg-[#0a0a0a] border border-white/10 rounded-2xl py-3 px-4 text-sm text-white outline-none"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </div>
                </div>

                {filteredOrders.length === 0 ? (
                  <div className="text-center py-12 text-[#a1a1a1] text-xs">No orders stored.</div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((ord) => (
                      <div
                        key={ord.id}
                        className="p-5 rounded-2xl bg-white/5 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1 min-w-0">
                          <p className="font-mono text-xs font-bold text-white truncate max-w-[200px]">ID: {ord.id}</p>
                          <p className="text-[10px] text-[#a1a1a1]">Address: {ord.address}</p>
                          <p className="text-[10px] text-[#ff0000] font-bold">Total price: {formatKWD(typeof ord.total_price === 'number' ? ord.total_price : parseFloat(String(ord.total_price)))} • Method: {ord.payment_method}</p>
                        </div>

                        <div className="flex items-center gap-3 self-end sm:self-auto">
                          <span className={`text-[9px] uppercase font-black px-3 py-1 rounded-full ${
                            ord.status === 'delivered'
                              ? 'bg-green-500/10 border border-green-500/30 text-green-500'
                              : ord.status === 'shipped'
                              ? 'bg-blue-500/10 border border-blue-500/30 text-blue-500'
                              : 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-500'
                          }`}>
                            {ord.status}
                          </span>

                          {ord.status !== 'delivered' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(ord.id, ord.status)}
                              className="px-4 py-2 bg-white text-black hover:bg-[#ff0000] hover:text-white font-bold text-[10px] uppercase tracking-wider rounded-xl transition cursor-pointer"
                            >
                              Fulfill → {ord.status === 'pending' ? 'Ship' : 'Deliver'}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* CUSTOMERS Tab Panel */}
            {adminTab === 'customers' && (
              <CustomersPanel />
            )}
          </>
        )}
      </main>

    </div>
  );
}
