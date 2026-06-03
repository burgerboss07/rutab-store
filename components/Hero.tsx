'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { useStore } from '../lib/store';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import Image from 'next/image';

const GarmentCanvas = dynamic(() => import('./3D/GarmentCanvas'), { ssr: false });

function GarmentWrapper() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => { setIsDesktop(window.innerWidth >= 1024); }, []);
  if (!isDesktop) return null;
  return <GarmentCanvas />;
}

export default function Hero({
  title = "رُطب",
  subtitle = "Worldwide Delivery",
  slogan = "FUTURE ARAB STREETWEAR.",
  sloganHighlight = "BOLD. FRESH STYLE. REAL COMFORT.",
  description = "RUTAB—YOUR EVERYDAY CHOICE."
}: {
  title?: string;
  subtitle?: string;
  slogan?: string;
  sloganHighlight?: string;
  description?: string;
} = {}) {
  const setActiveView = useStore((state) => state.setActiveView);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20 bg-black">
      {/* Hero background Max Payne artwork */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none overflow-hidden">
        <Image
          src="/max_payne_bg.png"
          alt="Max Payne Background Art"
          fill
          priority
          className="object-cover object-left opacity-35 lg:opacity-45"
        />
        {/* Blending gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_left,transparent_40%,#000000_90%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black" />
      </div>
      
      {/* 3D background garment container */}
      <div className="absolute inset-y-0 right-0 w-full lg:w-1/2 h-[50vh] lg:h-screen z-0 opacity-80 lg:opacity-100 flex items-center justify-center pt-24 lg:pt-0">
        {/* Red Glow behind 3D Gun */}
        <div className="absolute w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] rounded-full bg-[#ff0000]/15 blur-[120px] pointer-events-none" />
        <GarmentWrapper />
      </div>

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 items-center gap-16 relative z-10 w-full min-h-[85vh]">
        
        {/* Left Side Content */}
        <div className="text-left space-y-8 max-w-xl">
          {/* Animated subtitle tag */}
          <div
            className="inline-flex items-center gap-2.5 px-4.5 py-2.5 rounded-full border border-[#ff0000]/20 bg-[#ff0000]/5 backdrop-blur-md shadow-[0_0_20px_rgba(255,0,0,0.15)] animate-fade-in-up"
          >
            <span className="w-2.5 h-2.5 bg-[#ff0000] rounded-full animate-ping" />
            <p className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#e5e5e5]">
              {subtitle}
            </p>
          </div>

          {/* Heading */}
          <div className="space-y-4">
            <h1
              className="text-7xl sm:text-8xl md:text-9xl font-black leading-none tracking-tight text-white relative animate-fade-in-up"
              style={{ animationDelay: '0.1s' }}
            >
              {title}
              <span className="absolute left-0 bottom-0 text-stroke-white text-5xl md:text-6xl font-black block tracking-widest translate-y-12">
                RUTAB
              </span>
            </h1>
            
            {/* Cinematic spacer to let heading breathe */}
            <div className="h-10" />

            <p
              className="text-2xl sm:text-3xl text-white/90 leading-relaxed font-light animate-fade-in-up"
              style={{ animationDelay: '0.2s' }}
            >
              {slogan}
              <br />
              <span className="text-[#ff0000] font-bold">{sloganHighlight}</span>
            </p>
          </div>

          <p
            className="text-xs sm:text-sm text-[#a1a1a1] leading-relaxed max-w-md uppercase tracking-wider font-semibold animate-fade-in-up"
            style={{ animationDelay: '0.3s' }}
          >
            {description}
          </p>

          {/* CTAs */}
          <div
            className="flex flex-wrap gap-4 pt-4 animate-fade-in-up"
            style={{ animationDelay: '0.4s' }}
          >
            <button
              onClick={() => setActiveView('shop')}
              className="px-8 py-4.5 bg-[#ff0000] text-white hover:bg-[#d60000] rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center gap-2.5 transition cursor-pointer shadow-[0_0_30px_rgba(255,0,0,0.3)] hover:scale-105"
            >
              <ShoppingBag className="w-4 h-4" />
              Shop New Drop
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveView('shop')}
              className="px-8 py-4.5 border border-white/10 rounded-2xl bg-white/5 hover:border-white/30 text-white font-bold text-xs uppercase tracking-widest transition cursor-pointer hover:bg-white/10"
            >
              Explore Catalog
            </button>
          </div>
        </div>

        {/* Dummy right column placeholder to push text left on desktop grids */}
        <div className="hidden lg:block h-[400px] pointer-events-none" />

      </div>

    </section>
  );
}
