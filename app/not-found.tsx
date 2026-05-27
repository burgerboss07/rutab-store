'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center relative">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(255,0,0,0.15),transparent_45%)] pointer-events-none z-0" />
      <div className="relative z-10 space-y-6 max-w-md mx-auto">
        <span className="text-[#ff0000] text-[10px] font-bold tracking-[0.2em] uppercase">Error 404</span>
        <h1 className="text-4xl font-black uppercase tracking-wider">Page Not Found</h1>
        <p className="text-xs text-[#a1a1a1]">The destination you requested is unavailable or has been moved.</p>
        <Link href="/" className="inline-block py-4 px-8 bg-[#ff0000] text-white hover:bg-[#d60000] font-bold text-xs uppercase tracking-widest rounded-2xl transition shadow-[0_0_30px_rgba(255,0,0,0.3)]">
          Back to Storefront
        </Link>
      </div>
    </div>
  );
}
