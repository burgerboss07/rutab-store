'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAdminStore } from '@/lib/admin-store';
import { useStore, formatPrice } from '@/lib/store';
import { BarChart3, TrendingUp, Download, Calendar, Globe, MousePointer, Users } from 'lucide-react';

function LineChart({ data, color = '#ff0000' }: { data: number[]; color?: string }) {
  const w = 600, h = 180;
  const max = Math.max(...data, 1);
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h * 0.85 - 10}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full">
      <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={points} className="opacity-80" />
      <polyline fill={`url(#chartGrad)`} stroke="none" points={`0,${h} ${points} ${w},${h}`} className="opacity-15" />
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const dateRanges = ['7D', '30D', '90D', '1Y', 'All'];

export default function AnalyticsPanel() {
  const setBreadcrumbs = useAdminStore((s) => s.setBreadcrumbs);
  const [range, setRange] = useState('30D');
  const currency = useStore((s) => s.currency);
  const formatKWD = (v: number) => formatPrice(v, currency);

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Dashboard', href: '/admin/dashboard' },
      { label: 'Analytics' },
    ]);
  }, [setBreadcrumbs]);

  const salesData = [42, 38, 55, 48, 62, 58, 71, 65, 78, 72, 85, 80, 92];
  const trafficData = [1200, 1400, 1100, 1600, 1500, 1800, 1700, 2100, 1900, 2300, 2200, 2500, 2400];

  return (
    <div className="space-y-8 pt-4 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-wider">Analytics & Reports</h1>
        <p className="text-sm text-[#a1a1a1] mt-1">Track performance, traffic, and generate reports.</p>
      </div>

      {/* Date Range + Export */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#a1a1a1]" />
          {dateRanges.map((r) => (
            <button key={r} onClick={() => setRange(r)}
              className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition cursor-pointer ${
                range === r ? 'bg-[#ff0000] text-white' : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}>{r}</button>
          ))}
        </div>
        <button className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition cursor-pointer">
          <Download className="w-3.5 h-3.5" /> Export Report
        </button>
      </div>

      {/* Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Page Views', value: '24.5K', icon: <Globe className="w-4 h-4" />, trend: '+8.2%' },
          { label: 'Unique Visitors', value: '8.2K', icon: <Users className="w-4 h-4" />, trend: '+12.1%' },
          { label: 'Bounce Rate', value: '32.1%', icon: <MousePointer className="w-4 h-4" />, trend: '-2.4%', up: false },
          { label: 'Conversion', value: '4.8%', icon: <TrendingUp className="w-4 h-4" />, trend: '+0.6%' },
        ].map((m) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-[#0a0a0a] border border-white/5 p-5 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#a1a1a1] font-bold">{m.label}</p>
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/60">{m.icon}</div>
            </div>
            <p className="text-2xl font-black text-white">{m.value}</p>
            <span className={`text-[10px] font-bold ${m.up !== false ? 'text-emerald-400' : 'text-red-400'}`}>{m.trend}</span>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-3xl bg-[#0a0a0a] border border-white/5 p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Sales Performance</h3>
          <div className="h-[180px]"><LineChart data={salesData} /></div>
          <div className="flex justify-between text-[9px] text-[#555] uppercase tracking-wider">
            <span>May 1</span><span>May 7</span><span>May 14</span><span>May 21</span><span>May 28</span>
          </div>
        </div>
        <div className="rounded-3xl bg-[#0a0a0a] border border-white/5 p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Traffic Overview</h3>
          <div className="h-[180px]"><LineChart data={trafficData} color="#3b82f6" /></div>
          <div className="flex justify-between text-[9px] text-[#555] uppercase tracking-wider">
            <span>May 1</span><span>May 7</span><span>May 14</span><span>May 21</span><span>May 28</span>
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="rounded-3xl bg-[#0a0a0a] border border-white/5 p-6 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Top Performing Products</h3>
        <div className="space-y-3">
          {[
            { name: 'Travis Scott', sales: 142, revenue: 2284.2, growth: '+24%' },
            { name: 'Kuwait Hoodie', sales: 98, revenue: 1578.2, growth: '+18%' },
            { name: 'Arabic Poetry Tee', sales: 76, revenue: 1223.6, growth: '+32%' },
            { name: 'Cartoon Classics Cap', sales: 54, revenue: 869.4, growth: '+11%' },
          ].map((p, i) => (
            <div key={p.name} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-[#555] font-mono w-4">#{i + 1}</span>
                <span className="text-xs font-bold text-white">{p.name}</span>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-[10px] text-[#a1a1a1]">{p.sales} sales</span>
                <span className="text-[10px] font-bold text-white">{formatKWD(p.revenue)}</span>
                <span className="text-[10px] font-bold text-emerald-400">{p.growth}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
