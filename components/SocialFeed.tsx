'use client';

import { useStore } from '../lib/store';
import { Play, Heart, ShoppingBag } from 'lucide-react';
import Image from 'next/image';

const feeds: any[] = [];

export default function SocialFeed({
  title = "Seen in Rutab",
  subtitle = "Community Style",
  description = "Tag @RutabStore on Instagram or TikTok for a chance to be featured and receive 10% off your next drop.",
  feeds: customFeeds
}: {
  title?: string;
  subtitle?: string;
  description?: string;
  feeds?: any[];
} = {}) {
  const setSelectedProductId = useStore((state) => state.setSelectedProductId);
  const activeFeeds = customFeeds && customFeeds.length > 0 ? customFeeds : feeds;

  const handleShopFit = (productId: string) => {
    setSelectedProductId(productId);
  };

  return (
    <section className="py-24 px-6 max-w-7xl mx-auto border-b border-white/5">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
        <div>
          <span className="text-[#ff0000] text-xs font-bold tracking-[0.25em] uppercase block mb-3">
            {subtitle}
          </span>
          <h2 className="text-4xl md:text-6xl font-black uppercase">
            {title}
          </h2>
        </div>
        <p className="text-[#a1a1a1] max-w-sm mt-4 md:mt-0 text-sm leading-relaxed">
          {description}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {activeFeeds.map((feed, index) => (
          <div
            key={index}
            className="group relative h-[500px] rounded-[35px] overflow-hidden border border-white/5 bg-[#050505] shadow-2xl flex flex-col justify-between"
          >
            {/* Visual Media Placeholder */}
            <div className="absolute inset-0">
              {feed.videoUrl ? (
                <video
                  src={feed.videoUrl}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover opacity-75 group-hover:scale-105 transition-all duration-700"
                />
              ) : (
                <Image
                  src={feed.image}
                  alt="reels fit"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover opacity-75 group-hover:scale-105 transition-all duration-700"
                  unoptimized
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/10" />
            </div>

            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500">
                <Play className="w-6 h-6 fill-white text-white translate-x-0.5" />
              </span>
            </div>

            {/* Top Stats */}
            <div className="relative z-10 p-6 flex justify-between items-center w-full">
              <span className="text-[10px] uppercase font-bold tracking-wider bg-black/60 px-3 py-1 rounded-full border border-white/10 backdrop-blur-md">
                {feed.views} Views
              </span>
              
              {/* Interaction icons */}
              <div className="flex gap-2">
                <span className="w-8 h-8 rounded-full bg-black/60 border border-white/10 backdrop-blur-md flex items-center justify-center text-xs gap-1">
                  <Heart className="w-3.5 h-3.5 fill-[#ff0000] text-[#ff0000]" />
                </span>
              </div>
            </div>

            {/* Bottom Content */}
            <div className="relative z-10 p-6 w-full mt-auto">
              <p className="text-white font-bold text-sm mb-4">{feed.username}</p>
              
              {/* Shop the Fit Action Button */}
              <button
                onClick={() => handleShopFit(feed.productId)}
                className="w-full py-3.5 rounded-2xl bg-white text-black hover:bg-[#ff0000] hover:text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 premium-transition shadow-lg"
              >
                <ShoppingBag className="w-4 h-4" />
                Shop the Fit: {feed.productName}
              </button>
            </div>

            {/* Subtle Gradient Borders */}
            <div className="absolute inset-0 border border-white/5 rounded-[35px] pointer-events-none group-hover:border-[#ff0000]/20 transition-all" />
          </div>
        ))}
      </div>
    </section>
  );
}
