'use client';

import Link from 'next/link';
import { useAdminStore } from '@/lib/admin-store';
import { ChevronRight } from 'lucide-react';

export default function AdminBreadcrumbs() {
  const crumbs = useAdminStore((s) => s.breadcrumbs);

  return (
    <nav className="flex items-center gap-2 text-[11px] text-[#a1a1a1]">
      {crumbs.map((c, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <span key={c.label} className="flex items-center gap-2">
            {i > 0 && <ChevronRight className="w-3 h-3 text-white/20" />}
            {c.href && !isLast ? (
              <Link href={c.href} className="hover:text-white transition">
                {c.label}
              </Link>
            ) : (
              <span className={isLast ? 'text-white font-bold' : ''}>{c.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
