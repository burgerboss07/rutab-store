'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAdminStore } from '@/lib/admin-store';
import { Search, Bell, User, LogOut, ChevronDown, CheckCheck, Settings, Menu } from 'lucide-react';

export default function AdminHeader({ onLock }: { onLock?: () => void }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const notifications = useAdminStore((s) => s.notifications);
  const unreadCount = useAdminStore((s) => s.unreadCount);
  const markRead = useAdminStore((s) => s.markNotificationRead);
  const clearAll = useAdminStore((s) => s.clearNotifications);
  const toggleSidebar = useAdminStore((s) => s.toggleSidebar);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="h-16 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md flex items-center justify-between px-4 gap-4 shrink-0">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:border-white/30 transition cursor-pointer"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="relative hidden sm:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" />
          <input
            type="text"
            placeholder="Search users, orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-[260px] bg-black border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#ff0000]/40 transition"
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:border-white/30 transition cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {unreadCount() > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#ff0000] text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                {unreadCount()}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute top-full right-0 mt-2 w-[340px] bg-[#0f0f0f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                <span className="text-xs font-bold uppercase tracking-wider text-white">Notifications</span>
                <button onClick={clearAll} className="text-[10px] text-[#a1a1a1] hover:text-white uppercase tracking-wider transition cursor-pointer">
                  Clear all
                </button>
              </div>
              <div className="max-h-[300px] overflow-y-auto no-scrollbar">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markRead(n.id)}
                    className={`px-4 py-3 border-b border-white/5 flex items-start gap-3 cursor-pointer transition ${
                      n.read ? 'opacity-50' : 'bg-white/[0.02]'
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                        n.type === 'error' ? 'bg-red-500' :
                        n.type === 'warning' ? 'bg-amber-500' :
                        n.type === 'success' ? 'bg-emerald-500' :
                        'bg-blue-500'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] text-white/90 leading-snug">{n.message}</p>
                      <p className="text-[9px] text-[#a1a1a1] mt-0.5 uppercase tracking-wider">{n.time}</p>
                    </div>
                    {!n.read && <CheckCheck className="w-3 h-3 text-[#ff0000] mt-1 shrink-0" />}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl border border-white/10 hover:border-white/30 transition cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-[#ff0000]/10 border border-[#ff0000]/20 flex items-center justify-center text-[#ff0000] text-[10px] font-black">
              A
            </div>
            <span className="text-xs font-bold text-white hidden md:block">Admin</span>
            <ChevronDown className="w-3 h-3 text-white/40" />
          </button>

          {profileOpen && (
            <div className="absolute top-full right-0 mt-2 w-[200px] bg-[#0f0f0f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
              <Link href="/admin/profile" onClick={() => setProfileOpen(false)}>
                <div className="flex items-center gap-3 px-4 py-3 text-xs text-white/80 hover:bg-white/5 transition">
                  <User className="w-4 h-4" />
                  My Profile
                </div>
              </Link>
              <Link href="/admin/settings" onClick={() => setProfileOpen(false)}>
                <div className="flex items-center gap-3 px-4 py-3 text-xs text-white/80 hover:bg-white/5 transition">
                  <Settings className="w-4 h-4" />
                  Settings
                </div>
              </Link>
                <button
                  onClick={() => {
                    if (onLock) onLock();
                    router.push('/');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-xs text-red-400 hover:bg-white/5 transition border-t border-white/5 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
