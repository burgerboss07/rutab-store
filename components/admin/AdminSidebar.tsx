'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAdminStore } from '@/lib/admin-store';
import {
  LayoutDashboard, Users, Package, BarChart3, Settings, Shield,
  ChevronLeft, ChevronRight, ShoppingBag, UserCircle, Percent,
  LayoutTemplate
} from 'lucide-react';

const navItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Users', href: '/admin/users', icon: Users },
    { label: 'Content', href: '/admin/content', icon: Package },
    { label: 'Home Page', href: '/admin/homepage', icon: LayoutTemplate },
    { label: 'Discounts', href: '/admin/discounts', icon: Percent },
    { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { label: 'Security', href: '/admin/security', icon: Shield },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
    { label: 'Profile', href: '/admin/profile', icon: UserCircle },
  ];

export default function AdminSidebar() {
  const pathname = usePathname();
  const collapsed = useAdminStore((s) => s.sidebarCollapsed);
  const toggle = useAdminStore((s) => s.toggleSidebar);

  return (
    <aside
      className={`fixed top-0 left-0 h-full z-30 bg-[#0a0a0a] border-r border-white/5 flex flex-col transition-all duration-300 ${
        collapsed ? 'w-[68px]' : 'w-[240px]'
      }`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-white/5 shrink-0">
        <Link href="/admin/dashboard" className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[#ff0000]/10 border border-[#ff0000]/20 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-4 h-4 text-[#ff0000]" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <span className="text-sm font-black tracking-widest text-white truncate block">RUTAB</span>
              <span className="text-[8px] text-[#ff0000] uppercase font-black tracking-[0.3em]">Admin Panel</span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 no-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                isActive
                  ? 'bg-[#ff0000]/10 text-[#ff0000] border border-[#ff0000]/20'
                  : 'text-white/50 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Role + Collapse */}
      {!collapsed && (
        <div className="px-4 pb-1">
          <span className="text-[8px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase font-black tracking-wider">
            Super Admin
          </span>
        </div>
      )}
      <div className="border-t border-white/5 p-3">
        <button
          onClick={toggle}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 text-xs font-bold uppercase tracking-wider transition cursor-pointer"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /> Collapse</>}
        </button>
      </div>
    </aside>
  );
}
