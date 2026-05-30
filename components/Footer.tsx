'use client';

import { useStore } from '../lib/store';

export default function Footer() {
  const setActiveView = useStore((state) => state.setActiveView);
  const storeSettings = useStore((s) => s.storeSettings);
  const f = storeSettings?.footer || {};

  const brandDescription = f.brandDescription || 'Premium luxury streetwear destination based in Kuwait, serving the broader GCC region with limited, high-end fashion drops.';
  const shopLinks = f.shopLinks || [{ label: 'Hoodies', view: 'shop' }, { label: 'T-Shirts', view: 'shop' }, { label: 'Caps & Hats', view: 'shop' }];
  const companyLinks = f.companyLinks || [{ label: 'About Brand', view: 'home' }, { label: 'Track Order', view: 'account' }];
  const newsletterTitle = f.newsletterTitle || 'Join the drops';
  const newsletterNote = f.newsletterNote || 'Subscribe to receive SMS & email notifications for upcoming limited collections.';
  const copyright = f.copyright || '© 2026 RUTAB — Luxury Fashion E-commerce Experience.';
  const socialLinks = f.socialLinks || [{ label: 'Instagram', url: '' }, { label: 'TikTok', url: '' }, { label: 'WhatsApp', url: '' }];

  return (
    <footer className="bg-[#050505] border-t border-white/5 text-white pt-24 pb-12 mt-20 relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-16 border-b border-white/10">
          
          {/* Column 1: Info */}
          <div className="space-y-4">
            <h2 className="text-3xl font-black text-[#ff0000] tracking-widest leading-none">RUTAB</h2>
            <span className="text-[10px] text-[#a1a1a1] tracking-[0.3em] uppercase block mt-1">رطب</span>
            <p className="text-xs text-[#a1a1a1] leading-relaxed pt-2">{brandDescription}</p>
          </div>

          {/* Column 2: Shop Catalog links */}
          <div>
            <h3 className="mb-6 text-xs uppercase font-bold tracking-widest text-[#a1a1a1]">Shop Drops</h3>
            <ul className="space-y-3.5 text-xs text-[#e5e5e5]">
              {shopLinks.map((link: any, idx: number) => (
                <li key={idx}>
                  <button onClick={() => setActiveView(link.view)} className="hover:text-[#ff0000] transition cursor-pointer">{link.label}</button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Company links */}
          <div>
            <h3 className="mb-6 text-xs uppercase font-bold tracking-widest text-[#a1a1a1]">Company</h3>
            <ul className="space-y-3.5 text-xs text-[#e5e5e5]">
              {companyLinks.map((link: any, idx: number) => (
                <li key={idx}>
                  <button onClick={() => setActiveView(link.view)} className="hover:text-[#ff0000] transition cursor-pointer">{link.label}</button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase font-bold tracking-widest text-[#a1a1a1]">{newsletterTitle}</h3>
            <p className="text-xs text-[#a1a1a1] leading-relaxed">{newsletterNote}</p>
            <div className="flex gap-2">
              <input type="email" placeholder="Enter email"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs outline-none focus:border-[#ff0000] text-white" />
              <button className="bg-white text-black hover:bg-[#ff0000] hover:text-white font-bold text-xs uppercase px-5 rounded-xl transition cursor-pointer">Join</button>
            </div>
          </div>

        </div>

        {/* Footer Sub-row */}
        <div className="pt-10 flex flex-col sm:flex-row items-center justify-between text-[#a1a1a1] text-xs gap-4">
          <p>{copyright}</p>
          <div className="flex gap-6 uppercase tracking-wider font-bold text-[10px]">
            {socialLinks.map((link: any, idx: number) => (
              link.url ? (
                <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer"
                  className="hover:text-[#ff0000] transition cursor-pointer">{link.label}</a>
              ) : (
                <span key={idx} className="hover:text-[#ff0000] transition cursor-pointer">{link.label}</span>
              )
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}
