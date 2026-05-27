'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAdminStore, dashboardMock } from '@/lib/admin-store';
import type {
  SalesAnalytics, InventoryItem, CustomerSegment, FunnelStage,
  SocialPlatform, ShippingStats, LiveActivity, SEOMetric, PayoutRecord,
} from '@/lib/admin-store';
import KpiCard from './ui/KpiCard';
import { useStore, formatPrice } from '@/lib/store';
import {
  DollarSign, ShoppingBag, Users, Activity, Package, TrendingUp,
  Plus, Download, FileText, Box, BarChart3, Target, Camera,
  Truck, Radio, Search, CreditCard, AlertTriangle, Clock,
  Hash, Globe, CheckCircle2, XCircle, Eye, Zap,
} from 'lucide-react';

// ─── Sub-components ───────────────────────────────────────────────────

function LineChart({ data, color = '#ff0000', h = 100 }: { data: number[]; color?: string; h?: number }) {
  const w = 280;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h * 0.8 - 10}`).join(' ');
  const id = `grad-${color!.replace('#', '')}-${h}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: h }}>
      <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={points} className="opacity-80" />
      <polyline fill={`url(#${id})`} stroke="none" points={`0,${h} ${points} ${w},${h}`} className="opacity-20" />
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.4" /><stop offset="100%" stopColor={color} stopOpacity="0" /></linearGradient></defs>
    </svg>
  );
}

function BarChart({ data, color = '#ff0000' }: { data: number[]; color?: string }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-1.5 h-20">
      {data.map((v, i) => (
        <div key={i} className="flex-1 rounded-t-sm transition-all duration-500"
          style={{ height: `${(v / max) * 100}%`, backgroundColor: i === data.length - 1 ? color : 'rgba(255,255,255,0.08)' }} />
      ))}
    </div>
  );
}

function Donut({ percentage, label, color = '#ff0000' }: { percentage: number; label: string; color?: string }) {
  const r = 32;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percentage / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="80" height="80" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
        <circle cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="6" strokeDasharray={circ}
          strokeDashoffset={offset} strokeLinecap="round" transform="rotate(-90 40 40)" className="transition-all duration-700" />
        <text x="40" y="40" textAnchor="middle" dominantBaseline="middle" className="fill-white text-[11px] font-black">{percentage}%</text>
      </svg>
      <span className="text-[9px] text-[#a1a1a1] uppercase tracking-wider">{label}</span>
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <h2 className="text-base font-black uppercase tracking-wider text-white flex items-center gap-2">{title}</h2>
        {subtitle && <span className="text-[9px] text-[#a1a1a1] uppercase tracking-wider">{subtitle}</span>}
      </div>
      {children}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────

export default function DashboardHome() {
  const setBreadcrumbs = useAdminStore((s) => s.setBreadcrumbs);
  const activities = useAdminStore((s) => s.activities);
  const d = dashboardMock;

  const currency = useStore((s) => s.currency);
  const formatKWD = (v: number) => formatPrice(v, currency);

  useEffect(() => {
    setBreadcrumbs([{ label: 'Dashboard', href: '/admin/dashboard' }]);
  }, [setBreadcrumbs]);

  const salesData = [12, 19, 15, 22, 18, 29, 24, 33, 28, 35, 31, 42];
  const signupData = [4, 6, 3, 8, 5, 9, 7, 11, 8, 13, 10, 15];

  return (
    <div className="space-y-10 animate-fade-in-up pt-4 pb-12">
      {/* ═══ Page Header ═══ */}
      <div>
        <h1 className="text-3xl font-black uppercase tracking-wider">Dashboard Overview</h1>
        <p className="text-sm text-[#a1a1a1] mt-1">Real-time snapshot of your store performance.</p>
      </div>

      {/* ═══ KPI Widgets ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Revenue" value={formatKWD(12847.5)} icon={<DollarSign className="w-4 h-4" />} trend={{ value: '12.5%', positive: true }} subtitle="vs last month" />
        <KpiCard label="New Users" value="48" icon={<Users className="w-4 h-4" />} trend={{ value: '8.2%', positive: true }} subtitle="this week" />
        <KpiCard label="Pending Orders" value="12" icon={<Package className="w-4 h-4" />} trend={{ value: '3', positive: false }} subtitle="needs fulfilment" />
        <KpiCard label="Conversion Rate" value="4.8%" icon={<TrendingUp className="w-4 h-4" />} trend={{ value: '1.2%', positive: true }} subtitle="above target" />
      </div>

      {/* ═══ Quick Actions ═══ */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: 'Add Product', icon: <Plus className="w-4 h-4" />, href: '/admin/content' },
          { label: 'Export Report', icon: <Download className="w-4 h-4" />, href: '/admin/analytics' },
          { label: 'View Orders', icon: <FileText className="w-4 h-4" />, href: '/admin/content' },
          { label: 'System Health', icon: <Activity className="w-4 h-4" />, href: '/admin/security' },
        ].map((a) => (
          <a key={a.label} href={a.href}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-[#ff0000]/10 hover:border-[#ff0000]/30 text-white/80 hover:text-white text-[10px] font-bold uppercase tracking-widest transition">
            {a.icon}{a.label}
          </a>
        ))}
      </div>

      {/* ═══ 1. SALES ANALYTICS ═══ */}
      <Section title="Sales Analytics" subtitle="Revenue breakdown & top performers">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue by Category - Donut */}
          <div className="rounded-3xl bg-[#0a0a0a] border border-white/5 p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Revenue by Category</h3>
            <div className="space-y-3">
              {d.salesAnalytics.revenueByCategory.map((cat) => (
                <div key={cat.label} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="text-[11px] text-[#a1a1a1] flex-1">{cat.label}</span>
                  <span className="text-xs font-bold text-white">{(cat.value / 1000).toFixed(1)}K</span>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Revenue Trend */}
          <div className="lg:col-span-2 rounded-3xl bg-[#0a0a0a] border border-white/5 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Monthly Revenue</h3>
                <p className="text-[10px] text-[#a1a1a1]">Last 6 months</p>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +18.2%</span>
            </div>
            <div className="grid grid-cols-6 gap-2">
              {d.salesAnalytics.monthlyRevenue.map((m) => (
                <div key={m.month} className="flex flex-col items-center gap-1">
                  <div className="text-[8px] text-[#555] font-bold">{m.month}</div>
                  <div className="w-full bg-white/5 rounded-t-sm" style={{ height: `${(m.revenue / 32000) * 100}%`, minHeight: 4, backgroundColor: m.month === 'Jun' ? '#ff0000' : 'rgba(255,255,255,0.08)' }} />
                  <div className="text-[8px] text-white font-bold">{(m.revenue / 1000).toFixed(1)}K</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Top Products */}
        <div className="rounded-3xl bg-[#0a0a0a] border border-white/5 p-6 space-y-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Top Products</h3>
          <div className="divide-y divide-white/5">
            {d.salesAnalytics.topProducts.map((p, i) => (
              <div key={p.name} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-[#555] font-mono w-4">#{i + 1}</span>
                  <span className="text-xs font-bold text-white">{p.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-bold text-white">{formatKWD(p.revenue)}</span>
                  <span className="text-[10px] font-bold text-emerald-400">{p.growth}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══ 2. CUSTOMER INSIGHTS ═══ */}
      <Section title="Customer Insights" subtitle="Segmentation & retention metrics">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-3xl bg-[#0a0a0a] border border-white/5 p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Segments</h3>
            <div className="grid grid-cols-2 gap-4">
              {d.customerSegments.map((s) => (
                <Donut key={s.label} percentage={s.percentage} label={`${s.label} (${s.count})`} color={s.color} />
              ))}
            </div>
          </div>
          <div className="rounded-3xl bg-[#0a0a0a] border border-white/5 p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Retention Snapshot</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-black/50 border border-white/5">
                <span className="text-[11px] text-[#a1a1a1]">Repeat Purchase Rate</span>
                <span className="text-sm font-black text-white">34.2%</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-black/50 border border-white/5">
                <span className="text-[11px] text-[#a1a1a1]">Avg. Order Value</span>
                <span className="text-sm font-black text-white">{formatKWD(48.50)}</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-black/50 border border-white/5">
                <span className="text-[11px] text-[#a1a1a1]">Avg. Lifetime Value</span>
                <span className="text-sm font-black text-white">{formatKWD(284.00)}</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-black/50 border border-white/5">
                <span className="text-[11px] text-[#a1a1a1]">Churn Rate (30d)</span>
                <span className="text-sm font-black text-amber-400">8.1%</span>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ═══ 3. MARKETING FUNNEL ═══ */}
      <Section title="Marketing Funnel" subtitle="Acquisition channels & conversion">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-3xl bg-[#0a0a0a] border border-white/5 p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Conversion Funnel</h3>
            <div className="space-y-3">
              {d.funnel.map((f, i) => (
                <div key={f.stage} className="flex items-center gap-4">
                  <div className="w-24 shrink-0 text-[10px] uppercase tracking-wider font-bold text-[#a1a1a1]">{f.stage}</div>
                  <div className="flex-1 h-7 rounded-lg bg-white/5 overflow-hidden relative">
                    <div className="h-full rounded-lg bg-[#ff0000]/40 transition-all" style={{ width: `${(f.count / d.funnel[0].count) * 100}%` }} />
                  </div>
                  <div className="w-20 text-right text-xs font-bold text-white">{f.count.toLocaleString()}</div>
                  {i > 0 && <div className="w-16 text-right text-[9px] text-red-400 font-bold">{f.dropoff}</div>}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl bg-[#0a0a0a] border border-white/5 p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Acquisition Channels</h3>
            <div className="grid grid-cols-2 gap-4">
              <Donut percentage={38} label="Direct" color="#ff0000" />
              <Donut percentage={28} label="Social" color="#e1306c" />
              <Donut percentage={18} label="Search" color="#3b82f6" />
              <Donut percentage={16} label="Referral" color="#22c55e" />
            </div>
          </div>
        </div>
      </Section>

      {/* ═══ 4. INVENTORY DASHBOARD ═══ */}
      <Section title="Inventory Dashboard" subtitle="Stock levels & low-stock alerts">
        <div className="rounded-3xl bg-[#0a0a0a] border border-white/5 p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-4 border-b border-white/5">
            <div className="flex flex-col items-center p-4 rounded-xl bg-black/50 border border-white/5">
              <Package className="w-5 h-5 text-white/40 mb-1" />
              <span className="text-2xl font-black text-white">142</span>
              <span className="text-[9px] text-[#a1a1a1] uppercase tracking-wider">Total Items</span>
            </div>
            <div className="flex flex-col items-center p-4 rounded-xl bg-black/50 border border-white/5">
              <AlertTriangle className="w-5 h-5 text-amber-400 mb-1" />
              <span className="text-2xl font-black text-amber-400">4</span>
              <span className="text-[9px] text-[#a1a1a1] uppercase tracking-wider">Low Stock</span>
            </div>
            <div className="flex flex-col items-center p-4 rounded-xl bg-black/50 border border-white/5">
              <XCircle className="w-5 h-5 text-red-400 mb-1" />
              <span className="text-2xl font-black text-red-400">1</span>
              <span className="text-[9px] text-[#a1a1a1] uppercase tracking-wider">Out of Stock</span>
            </div>
          </div>
          <div className="space-y-2">
            {d.inventory.filter((i) => i.stock <= i.threshold).map((item) => (
              <div key={item.sku} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${item.stock === 0 ? 'bg-red-500' : 'bg-amber-500'}`} />
                  <span className="text-xs font-bold text-white">{item.name}</span>
                  <span className="text-[9px] text-[#555]">{item.sku}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-[10px] font-bold ${item.stock === 0 ? 'text-red-400' : 'text-amber-400'}`}>{item.stock} / {item.threshold}</span>
                  <span className="text-[9px] text-[#555]">{item.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══ 5. SOCIAL MEDIA + SEO ═══ */}
      <Section title="Social Media & SEO" subtitle="Platform engagement & search performance">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Social Media */}
          <div className="rounded-3xl bg-[#0a0a0a] border border-white/5 p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2"><Camera className="w-4 h-4 text-[#ff0000]" /> Social Platforms</h3>
            <div className="space-y-3">
              {d.socialMedia.map((s) => (
                <div key={s.platform} className="flex items-center gap-4 p-3 rounded-xl bg-black/50 border border-white/5">
                  <Hash className="w-5 h-5" style={{ color: s.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{s.platform}</span>
                      <span className="text-[9px] text-emerald-400 font-bold">{s.growth}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[9px] text-[#a1a1a1]">
                      <span>{s.followers.toLocaleString()} followers</span>
                      <span>{s.posts} posts</span>
                      <span>Eng. {s.engagement}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SEO Dashboard */}
          <div className="rounded-3xl bg-[#0a0a0a] border border-white/5 p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2"><Search className="w-4 h-4 text-[#ff0000]" /> Keyword Rankings</h3>
            <div className="space-y-2">
              {d.seo.map((kw) => (
                <div key={kw.keyword} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate">{kw.keyword}</p>
                    <p className="text-[9px] text-[#555] truncate">{kw.url}</p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-black text-white">#{kw.position}</span>
                      <span className={`text-[9px] font-bold ${kw.change > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {kw.change > 0 ? `+${kw.change}` : kw.change}
                      </span>
                    </div>
                    <span className="text-[9px] text-[#555]">{kw.volume.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ═══ 6. SHIPPING & LOGISTICS + LIVE STORE ACTIVITY ═══ */}
      <Section title="Shipping & Live Activity" subtitle="Delivery status & real-time store events">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Shipping */}
          <div className="rounded-3xl bg-[#0a0a0a] border border-white/5 p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2"><Truck className="w-4 h-4 text-[#ff0000]" /> Delivery Status</h3>
            <div className="grid grid-cols-2 gap-3">
              {d.shipping.map((s) => (
                <div key={s.status} className="flex flex-col items-center p-4 rounded-xl bg-black/50 border border-white/5">
                  <span className="text-2xl font-black text-white">{s.count}</span>
                  <span className="text-[9px] uppercase tracking-wider font-bold" style={{ color: s.color }}>{s.status}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 text-[10px] text-[#a1a1a1] pt-2 border-t border-white/5">
              <Truck className="w-3 h-3" /> Avg. delivery: <span className="text-white font-bold">2.4 days</span>
              <span className="ml-auto">via <span className="text-white font-bold">Aramex</span>, <span className="text-white font-bold">DHL</span></span>
            </div>
          </div>

          {/* Live Store Activity */}
          <div className="rounded-3xl bg-[#0a0a0a] border border-white/5 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2"><Radio className="w-4 h-4 text-[#ff0000]" /> Live Activity</h3>
              <span className="flex items-center gap-1.5 text-[9px] text-emerald-400 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
              </span>
            </div>
            <div className="space-y-3 max-h-[280px] overflow-y-auto no-scrollbar">
              {d.liveActivity.map((ev) => (
                <div key={ev.id} className="flex items-start gap-3 pb-3 border-b border-white/5 last:border-0">
                  <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${
                    ev.type === 'order' ? 'bg-emerald-400' : ev.type === 'cart' ? 'bg-amber-400' : 'bg-[#ff0000]'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] text-white/80 leading-snug">{ev.message}</p>
                    <p className="text-[9px] text-[#555] mt-0.5">{ev.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ═══ 7. PAYOUTS / FINANCIALS ═══ */}
      <Section title="Payouts & Financials" subtitle="Settlement history & invoice summary">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="flex flex-col items-center p-5 rounded-2xl bg-[#0a0a0a] border border-white/5">
            <CreditCard className="w-5 h-5 text-emerald-400 mb-1" />
            <span className="text-xl font-black text-white">{formatKWD(7471.25)}</span>
            <span className="text-[9px] text-[#a1a1a1] uppercase tracking-wider">Pending Payouts</span>
          </div>
          <div className="flex flex-col items-center p-5 rounded-2xl bg-[#0a0a0a] border border-white/5">
            <DollarSign className="w-5 h-5 text-[#ff0000] mb-1" />
            <span className="text-xl font-black text-white">{formatKWD(13050.50)}</span>
            <span className="text-[9px] text-[#a1a1a1] uppercase tracking-wider">Completed (MTD)</span>
          </div>
          <div className="flex flex-col items-center p-5 rounded-2xl bg-[#0a0a0a] border border-white/5">
            <FileText className="w-5 h-5 text-blue-400 mb-1" />
            <span className="text-xl font-black text-white">24</span>
            <span className="text-[9px] text-[#a1a1a1] uppercase tracking-wider">Invoices (MTD)</span>
          </div>
        </div>
        <div className="rounded-3xl bg-[#0a0a0a] border border-white/5 p-6 space-y-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Recent Payouts</h3>
          <div className="space-y-2">
            {d.payouts.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="font-mono text-[10px] text-[#555]">{p.id}</span>
                  <span className="text-[11px] text-white/80 truncate">{p.description}</span>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-[11px] text-[#a1a1a1]">{p.method}</span>
                  <span className="text-xs font-bold text-white">{formatKWD(p.amount)}</span>
                  <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-full ${
                    p.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>{p.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══ Original charts (kept for continuity) ═══ */}
      <Section title="Traffic & Growth" subtitle="Visitors, signups & recent activity">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-3xl bg-[#0a0a0a] border border-white/5 p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Sales Trend (30 days)</h3>
            <LineChart data={salesData} />
          </div>
          <div className="rounded-3xl bg-[#0a0a0a] border border-white/5 p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Traffic Sources</h3>
            <div className="grid grid-cols-2 gap-4">
              <Donut percentage={62} label="Direct" />
              <Donut percentage={23} label="Social" />
              <Donut percentage={10} label="Email" />
              <Donut percentage={5} label="Other" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-3xl bg-[#0a0a0a] border border-white/5 p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Signups by Region</h3>
            <BarChart data={signupData} />
            <div className="flex justify-between text-[9px] text-[#a1a1a1] uppercase tracking-wider pt-1">
              <span>Kuwait</span><span>UAE</span><span>KSA</span><span>Qatar</span><span>Bahrain</span><span>Oman</span><span>Other</span>
            </div>
          </div>
          <div className="rounded-3xl bg-[#0a0a0a] border border-white/5 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#ff0000]" /> Activity Feed
              </h3>
              <span className="text-[10px] text-[#a1a1a1]">Live</span>
            </div>
            <div className="space-y-3 max-h-[260px] overflow-y-auto no-scrollbar">
              {activities.map((a) => (
                <motion.div key={a.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  className="flex items-start gap-3 pb-3 border-b border-white/5 last:border-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#ff0000] mt-2 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] text-white/80 leading-snug"><strong className="text-white">{a.user}</strong> {a.action} <span className="text-[#a1a1a1]">{a.target}</span></p>
                    <p className="text-[9px] text-[#555] mt-0.5 flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> {a.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
