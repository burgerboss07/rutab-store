'use client';

import { ReactNode } from 'react';

interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
}

export default function DataTable<T extends Record<string, any>>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  emptyMessage = 'No data found.',
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="text-center py-16 text-[#a1a1a1]">
        <p className="text-xs uppercase tracking-widest font-bold">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto no-scrollbar">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-white/5">
            {columns.map((col) => (
              <th
                key={col.key}
                className="pb-3 pr-4 text-[10px] uppercase tracking-[0.25em] text-[#a1a1a1] font-bold whitespace-nowrap"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr
              key={keyExtractor(item)}
              onClick={() => onRowClick?.(item)}
              className={`border-b border-white/[0.03] text-sm text-white/90 transition ${
                onRowClick ? 'cursor-pointer hover:bg-white/[0.02]' : ''
              }`}
            >
              {columns.map((col) => (
                <td key={col.key} className="py-3.5 pr-4 whitespace-nowrap">
                  {col.render ? col.render(item) : (item[col.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
