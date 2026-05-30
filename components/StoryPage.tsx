'use client';

import { motion } from 'framer-motion';
import { MapPin, Package, Award, Users } from 'lucide-react';

const milestones = [
  { year: '2023', title: 'The Vision', desc: 'RUTAB was born from a vision to fuse Arab heritage with modern streetwear, creating a brand that speaks to the GCC\'s bold new generation.' },
  { year: '2024', title: 'First Drop', desc: 'Our inaugural collection sold out in 48 hours, establishing RUTAB as Kuwait\'s fastest-growing luxury streetwear label.' },
  { year: '2025', title: 'GCC Expansion', desc: 'Expanded across the Gulf region with pop-ups in Dubai, Riyadh, and Doha — bringing Gulf luxury streetwear to the world.' },
  { year: '2026', title: 'Global Reach', desc: 'Launched worldwide shipping, collaborated with regional artists, and built a community of over 50,000 loyal customers.' },
];

const values = [
  { icon: Award, title: 'Quality First', desc: 'Every piece is crafted with premium materials and meticulous attention to detail.' },
  { icon: Users, title: 'Community Driven', desc: 'Built by the culture, for the culture — our community shapes every collection.' },
  { icon: Package, title: 'Limited Drops', desc: 'Exclusivity is at our core. Each drop is limited, making every piece a collector\'s item.' },
  { icon: MapPin, title: 'Proudly Kuwaiti', desc: 'Rooted in Kuwaiti heritage, inspired by Gulf identity, designed for the world.' },
];

export default function StoryPage() {
  return (
    <div className="pt-28 min-h-screen bg-black text-white px-6 max-w-7xl mx-auto pb-32">
      {/* Hero section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="border-b border-white/5 pb-14 mb-16"
      >
        <span className="text-[#ff0000] text-[10px] font-bold tracking-[0.25em] uppercase block mb-4">
          About Rutab
        </span>
        <h1 className="text-6xl md:text-8xl font-black uppercase leading-[0.9] tracking-tight">
          Our<br />
          <span className="text-[#ff0000]">Story</span>
        </h1>
        <p className="text-sm md:text-base text-[#a1a1a1] max-w-2xl mt-6 leading-relaxed">
          From a bold idea in Kuwait to a movement redefining Gulf streetwear. RUTAB is more than fashion — it&apos;s identity, heritage, and the future of Arab luxury.
        </p>
      </motion.div>

      {/* Brand narrative */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="text-[#ff0000] text-[10px] font-bold tracking-[0.25em] uppercase block mb-4">Our Heritage</span>
          <h2 className="text-3xl md:text-5xl font-black uppercase leading-tight mb-6">
            Born in Kuwait,<br />Built for the <span className="text-[#ff0000]">World</span>
          </h2>
          <div className="space-y-4 text-sm text-[#a1a1a1] leading-relaxed">
            <p>
              RUTAB (رطب) takes its name from the Arabic word for fresh dates — a symbol of hospitality, generosity, and the rich cultural tapestry of the Gulf region. Just as dates have been a cornerstone of Arab tradition for millennia, RUTAB aims to be a cornerstone of the modern Arab fashion identity.
            </p>
            <p>
              Founded in Kuwait, our brand represents the intersection of traditional Gulf heritage and contemporary streetwear culture. We believe that luxury should tell a story — one that honors where you come from while boldly stepping into the future.
            </p>
            <p>
              Every stitch, every fabric choice, every design element is a tribute to the resilience, creativity, and ambition of the Arab youth. We don&apos;t just follow trends — we set them, drawing inspiration from the bustling souks of Kuwait City to the avant-garde runways of Tokyo and Milan.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <div className="aspect-[4/5] rounded-[30px] overflow-hidden bg-[#0a0a0a] border border-white/5 flex items-center justify-center">
            <div className="text-center p-10">
              <div className="text-8xl font-black text-[#ff0000]/10 leading-none mb-4">رطب</div>
              <div className="w-16 h-0.5 bg-[#ff0000]/30 mx-auto mb-4" />
              <p className="text-xs text-[#555] uppercase tracking-[0.3em] font-bold">Since 2023</p>
            </div>
          </div>
          <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-[#ff0000]/5 rounded-full blur-3xl pointer-events-none" />
        </motion.div>
      </div>

      {/* Milestones timeline */}
      <div className="mb-24">
        <div className="text-center mb-14">
          <span className="text-[#ff0000] text-[10px] font-bold tracking-[0.25em] uppercase block mb-3">Timeline</span>
          <h2 className="text-3xl md:text-5xl font-black uppercase">The Journey</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {milestones.map((m, i) => (
            <motion.div
              key={m.year}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 hover:border-[#ff0000]/20 transition group"
            >
              <span className="text-[#ff0000] text-2xl font-black block mb-2">{m.year}</span>
              <h3 className="text-sm font-bold uppercase tracking-wider mb-2 group-hover:text-[#ff0000] transition">{m.title}</h3>
              <p className="text-xs text-[#a1a1a1] leading-relaxed">{m.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Values */}
      <div>
        <div className="text-center mb-14">
          <span className="text-[#ff0000] text-[10px] font-bold tracking-[0.25em] uppercase block mb-3">What We Stand For</span>
          <h2 className="text-3xl md:text-5xl font-black uppercase">Our Values</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 text-center hover:border-[#ff0000]/20 transition group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#ff0000]/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-[#ff0000]/20 transition">
                <v.icon className="w-5 h-5 text-[#ff0000]" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider mb-2">{v.title}</h3>
              <p className="text-xs text-[#a1a1a1] leading-relaxed">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
