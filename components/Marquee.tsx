'use client';

export default function Marquee() {
  const items = [
    'FREE SHIPPING IN KUWAIT',
    'LIMITED CYBER LUXURY DROP 2.0',
    'EXPRESS GCC DELIVERY (2-3 DAYS)',
    'SECURE CHECKOUT VIA KNET / APPLE PAY',
    'PREMIER STREETWEAR DESTINATION',
  ];

  // Repeat twice for infinite seamless loop animation
  const loopItems = [...items, ...items];

  return (
    <div className="relative w-full bg-[#ff0000] py-3 overflow-hidden select-none border-y border-[#ff0000]/30 z-20">
      <div className="flex whitespace-nowrap animate-marquee">
        {loopItems.map((item, index) => (
          <div key={index} className="inline-flex items-center">
            <span className="text-xs md:text-sm font-heading font-bold tracking-[0.2em] text-white">
              {item}
            </span>
            <span className="text-white mx-8 md:mx-12 text-[8px] opacity-70">✦</span>
          </div>
        ))}
      </div>
    </div>
  );
}
