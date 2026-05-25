'use client';

import { ReactNode } from 'react';
import { useAdminStore } from '@/lib/admin-store';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import AdminBreadcrumbs from './AdminBreadcrumbs';
import AdminFooter from './AdminFooter';

export default function AdminShell({ children, onLock }: { children: ReactNode; onLock?: () => void }) {
  const collapsed = useAdminStore((s) => s.sidebarCollapsed);

  return (
    <div className="min-h-screen bg-black text-white flex">
      <AdminSidebar />
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${collapsed ? 'ml-[68px]' : 'ml-[240px]'}`}>
        <AdminHeader onLock={onLock} />
        <div className="flex-1 flex flex-col overflow-y-auto">
          <div className="px-6 pt-4 pb-2">
            <AdminBreadcrumbs />
          </div>
          <main className="flex-1 px-6 pb-8">
            {children}
          </main>
          <AdminFooter />
        </div>
      </div>
    </div>
  );
}
