'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface KpiCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: { value: string; positive: boolean };
  accentColor?: string;
}

export default function KpiCard({ label, value, subtitle, icon, trend, accentColor = '#ff0000' }: KpiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl bg-[#0a0a0a] border border-white/5 p-5 space-y-3 hover:border-white/10 transition group"
    >
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#a1a1a1] font-bold">{label}</p>
        <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-white/70 group-hover:border-white/20 transition">
          {icon}
        </div>
      </div>
      <p className="text-3xl font-black text-white">{value}</p>
      <div className="flex items-center gap-2">
        {trend && (
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              trend.positive
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}
          >
            {trend.positive ? '↑' : '↓'} {trend.value}
          </span>
        )}
        {subtitle && <span className="text-[11px] text-[#a1a1a1]">{subtitle}</span>}
      </div>
    </motion.div>
  );
}
