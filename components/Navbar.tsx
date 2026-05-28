'use client';

import { useStore, StoreView, CURRENCY_CONFIG } from '../lib/store';
import { ShoppingBag, Heart, User, Search, ChevronDown } from 'lucide-react';
import { useSyncExternalStore, useState, useRef, useEffect } from 'react';

const emptySubscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export default function Navbar() {
  const activeView = useStore((state) => state.activeView);
  const setActiveView = useStore((state) => state.setActiveView);
  const setCartOpen = useStore((state) => state.setCartOpen);
  const getCartItemCount = useStore((state) => state.getCartItemCount);
  const wishlist = useStore((state) => state.wishlist);
  const currency = useStore((state) => state.currency);
  const setCurrency = useStore((state) => state.setCurrency);

  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCurrencyDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currencies = ['USD ($)', 'PKR (Rs)', 'AED (AED)', 'EUR (€)', 'KWD (K.D)'];

  // Hydration safety
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const cartCount = mounted ? getCartItemCount() : 0;
  const wishlistCount = mounted ? wishlist.length : 0;

  const navLinks: { label: string; view: StoreView }[] = [
    { label: 'Home', view: 'home' },
    { label: 'Shop', view: 'shop' },
    { label: 'Account', view: 'account' },
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-40 bg-black/60 backdrop-blur-xl border-b border-white/10 premium-transition">
      <div className="max-w-7xl mx-auto h-20 flex items-center justify-between px-6">
        
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveView('home')} 
          className="cursor-pointer group flex flex-col justify-center"
        >
          <div className="relative">
            <h1 className="text-2xl md:text-3xl font-black tracking-widest text-[#ff0000] leading-none">
              RUTAB
            </h1>
            <span className="absolute inset-0 text-[#ff0000] blur-md opacity-0 group-hover:opacity-60 transition duration-300">
              RUTAB
            </span>
          </div>
          <span className="text-[9px] text-[#a1a1a1] tracking-[0.4em] uppercase block mt-0.5 ml-0.5">
            رطب
          </span>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-10 text-xs uppercase tracking-widest font-bold">
          {navLinks.map((link) => (
            <button
              key={link.view}
              onClick={() => setActiveView(link.view)}
              className={`hover:text-[#ff0000] transition-colors relative py-2 cursor-pointer ${
                activeView === link.view ? 'text-[#ff0000]' : 'text-[#e5e5e5]'
              }`}
            >
              {link.label}
              {activeView === link.view && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#ff0000]" />
              )}
            </button>
          ))}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-5 md:gap-7">
          {/* Mock Search Trigger */}
          <button 
            onClick={() => setActiveView('shop')}
            className="text-[#e5e5e5] hover:text-[#ff0000] transition cursor-pointer"
          >
            <Search className="w-5 h-5" />
          </button>
          
          {/* Wishlist Link */}
          <button
            onClick={() => setActiveView('account')}
            className="text-[#e5e5e5] hover:text-[#ff0000] transition relative cursor-pointer"
          >
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#ff0000] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Account Profile Link */}
          <button
            onClick={() => setActiveView('account')}
            className="text-[#e5e5e5] hover:text-[#ff0000] transition cursor-pointer"
          >
            <User className="w-5 h-5" />
          </button>

          {/* Currency Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
              className="text-white text-sm font-bold flex items-center gap-1.5 cursor-pointer hover:text-[#a1a1a1] transition px-2 py-1 rounded-lg hover:bg-white/5"
            >
              <span className="text-xs">{CURRENCY_CONFIG[currency]?.symbol || 'K.D'}</span>
              <span className="text-[10px] text-[#a1a1a1]">{currency.split(' ')[0]}</span>
            </button>
            {isCurrencyDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-40 bg-[#0f0f0f] border border-white/15 rounded-2xl py-2 shadow-2xl z-50 backdrop-blur-xl">
                {currencies.map(c => (
                  <button
                    key={c}
                    onClick={() => {
                      setCurrency(c);
                      setIsCurrencyDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs text-white hover:bg-white/5 transition flex items-center gap-3 cursor-pointer"
                  >
                    <div className={`w-1.5 h-1.5 rounded-full transition ${currency === c ? 'bg-[#ff0000]' : 'bg-transparent'}`} />
                    <span className="font-mono text-[#ff0000] font-bold w-6 text-center">{CURRENCY_CONFIG[c]?.symbol}</span>
                    <span className="text-[#a1a1a1] text-[10px] uppercase tracking-wider">{c.split(' ')[0]}</span>
                    {currency === c && <span className="ml-auto text-[#ff0000] text-[9px] font-black">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Cart Bag Icon with animated count change */}
          <button
            onClick={() => setCartOpen(true)}
            className="group flex items-center justify-center p-2.5 rounded-full border border-white/10 hover:border-[#ff0000]/40 bg-white/5 hover:bg-[#ff0000]/10 hover:text-white transition cursor-pointer relative"
          >
            <ShoppingBag className="w-4 h-4 group-hover:animate-cart-shake text-white" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1.5 bg-[#ff0000] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-5 h-5 flex items-center justify-center border border-black shadow-[0_0_10px_rgba(255,0,0,0.5)]">
                {cartCount}
              </span>
            )}
          </button>
        </div>

      </div>
    </header>
  );
}
