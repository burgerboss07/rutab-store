'use client';

import { useStore } from '../lib/store';

export default function Footer() {
  const setActiveView = useStore((state) => state.setActiveView);

  return (
    <footer className="bg-[#050505] border-t border-white/5 text-white pt-24 pb-12 mt-20 relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-16 border-b border-white/10">
          
          {/* Column 1: Info */}
          <div className="space-y-4">
            <h2 className="text-3xl font-black text-[#ff0000] tracking-widest leading-none">RUTAB</h2>
            <span className="text-[10px] text-[#a1a1a1] tracking-[0.3em] uppercase block mt-1">رطب</span>
            <p className="text-xs text-[#a1a1a1] leading-relaxed pt-2">
              Premium luxury streetwear destination based in Kuwait, serving the broader GCC region with limited, high-end fashion drops.
            </p>
          </div>

          {/* Column 2: Shop Catalog links */}
          <div>
            <h3 className="mb-6 text-xs uppercase font-bold tracking-widest text-[#a1a1a1]">Shop Drops</h3>
            <ul className="space-y-3.5 text-xs text-[#e5e5e5]">
              <li>
                <button onClick={() => setActiveView('shop')} className="hover:text-[#ff0000] transition cursor-pointer">Hoodies</button>
              </li>
              <li>
                <button onClick={() => setActiveView('shop')} className="hover:text-[#ff0000] transition cursor-pointer">T-Shirts</button>
              </li>
              <li>
                <button onClick={() => setActiveView('shop')} className="hover:text-[#ff0000] transition cursor-pointer">Caps & Hats</button>
              </li>

            </ul>
          </div>

          {/* Column 3: Corporate Info links */}
          <div>
            <h3 className="mb-6 text-xs uppercase font-bold tracking-widest text-[#a1a1a1]">Company</h3>
            <ul className="space-y-3.5 text-xs text-[#e5e5e5]">
              <li>
                <button onClick={() => setActiveView('home')} className="hover:text-[#ff0000] transition cursor-pointer">About Brand</button>
              </li>
              <li>
                <button onClick={() => setActiveView('account')} className="hover:text-[#ff0000] transition cursor-pointer">Track Order</button>
              </li>

            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase font-bold tracking-widest text-[#a1a1a1]">Join the drops</h3>
            <p className="text-xs text-[#a1a1a1] leading-relaxed">
              Subscribe to receive SMS & email notifications for upcoming limited collections.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter email"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs outline-none focus:border-[#ff0000] text-white"
              />
              <button className="bg-white text-black hover:bg-[#ff0000] hover:text-white font-bold text-xs uppercase px-5 rounded-xl transition cursor-pointer">
                Join
              </button>
            </div>
          </div>

        </div>

        {/* Footer Sub-row */}
        <div className="pt-10 flex flex-col sm:flex-row items-center justify-between text-[#a1a1a1] text-xs gap-4">
          <p>© 2026 RUTAB — Luxury Fashion E-commerce Experience.</p>
          
          <div className="flex gap-6 uppercase tracking-wider font-bold text-[10px]">
            <span className="hover:text-[#ff0000] transition cursor-pointer">Instagram</span>
            <span className="hover:text-[#ff0000] transition cursor-pointer">TikTok</span>
            <span className="hover:text-[#ff0000] transition cursor-pointer">WhatsApp</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
