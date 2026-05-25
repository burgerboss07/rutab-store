'use client';

import { useStore, StoreView } from '../lib/store';
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

  // Sync count on client side to avoid hydration issues with persisted localstorage
  const mounted = useSyncExternalStore(emptySubscribe, getSnapshot, getServerSnapshot);

  const cartCount = mounted ? getCartItemCount() : 0;

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
            {wishlist.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#ff0000] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                {wishlist.length}
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
              className="text-white text-sm font-bold flex items-center gap-1 cursor-pointer hover:text-[#a1a1a1] transition"
            >
              {currency ? currency.split(' ')[0] : 'K.D'}
            </button>
            {isCurrencyDropdownOpen && (
              <div className="absolute top-full right-0 mt-6 w-36 bg-[#0a0a0a] border border-white/10 rounded-lg py-2 shadow-xl">
                {currencies.map(c => (
                  <button
                    key={c}
                    onClick={() => {
                      setCurrency(c);
                      setIsCurrencyDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-white hover:bg-white/5 transition flex items-center gap-2 cursor-pointer"
                  >
                    {currency === c ? <div className="w-1.5 h-1.5 rounded-full bg-white" /> : <div className="w-1.5 h-1.5" />}
                    {c}
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
