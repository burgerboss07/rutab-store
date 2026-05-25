'use client';

import { Heart } from 'lucide-react';

export default function AdminFooter() {
  return (
    <footer className="border-t border-white/5 px-6 py-4 flex items-center justify-between text-[10px] text-[#555] uppercase tracking-wider shrink-0">
      <span>&copy; {new Date().getFullYear()} RUTAB Store. All rights reserved.</span>
      <div className="flex items-center gap-4">
        <span>v2.0.1</span>
        <a href="#" className="hover:text-white transition">Support</a>
      </div>
    </footer>
  );
}
