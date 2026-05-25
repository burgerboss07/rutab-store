'use client';

import { useEffect } from 'react';
import { useAdminStore } from '@/lib/admin-store';
import CustomersPanel from './CustomersPanel';

export default function UsersPanel() {
  const setBreadcrumbs = useAdminStore((s) => s.setBreadcrumbs);

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Dashboard', href: '/admin/dashboard' },
      { label: 'Users' },
    ]);
  }, [setBreadcrumbs]);

  return <CustomersPanel />;
}
