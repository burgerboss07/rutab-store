'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAdminStore } from '@/lib/admin-store';
import { getSupabase } from '@/lib/supabase';
import {
  Shield, ShieldCheck, Clock, Globe, AlertTriangle,
  CheckCircle2, XCircle
} from 'lucide-react';
import DataTable from './ui/DataTable';

const auditLogs = [
  { id: '1', user: 'Admin', action: 'Updated product "Travis Scott"', ip: '188.70.10.22', time: '2 min ago', status: 'success' },
  { id: '2', user: 'Admin', action: 'Changed user role (hamad → editor)', ip: '188.70.10.22', time: '15 min ago', status: 'success' },
  { id: '3', user: 'System', action: 'Failed login attempt (unknown IP)', ip: '45.33.32.156', time: '1h ago', status: 'error' },
  { id: '4', user: 'Admin', action: 'Deleted order #x9y8z7', ip: '188.70.10.22', time: '3h ago', status: 'success' },
  { id: '5', user: 'System', action: 'SSL certificate renewed', ip: '—', time: '1d ago', status: 'info' },
  { id: '6', user: 'Admin', action: 'Exported customer CSV', ip: '188.70.10.22', time: '1d ago', status: 'success' },
  { id: '7', user: 'System', action: 'Maintenance mode toggled', ip: '—', time: '2d ago', status: 'warning' },
];

const loginHistory = [
  { id: '1', ip: '188.70.10.22', device: 'Chrome / Windows', time: '2 min ago', status: 'success' },
  { id: '2', ip: '188.70.10.22', device: 'Chrome / Windows', time: '1d ago', status: 'success' },
  { id: '3', ip: '45.33.32.156', device: 'Firefox / Linux', time: '1d ago', status: 'failed' },
  { id: '4', ip: '188.70.10.22', device: 'Safari / macOS', time: '3d ago', status: 'success' },
];

export default function SecurityPanel() {
  const setBreadcrumbs = useAdminStore((s) => s.setBreadcrumbs);
  const [tab, setTab] = useState<'audit' | 'logins'>('audit');
  const [hasData, setHasData] = useState(true);

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Dashboard', href: '/admin/dashboard' },
      { label: 'Security' },
    ]);

    async function checkData() {
      try {
        const client = getSupabase();
        const { count } = await client
          .from('orders')
          .select('*', { count: 'exact', head: true });
        setHasData((count || 0) > 0);
      } catch (e) {
        setHasData(true);
      }
    }
    checkData();
  }, [setBreadcrumbs]);

  return (
    <div className="space-y-6 pt-4 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-wider">Security & Logs</h1>
        <p className="text-sm text-[#a1a1a1] mt-1">Audit logs and login history.</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-3">
      {([
          { id: 'audit' as const, label: 'Audit Logs', icon: <Shield className="w-3.5 h-3.5" /> },
          { id: 'logins' as const, label: 'Login History', icon: <Globe className="w-3.5 h-3.5" /> },
        ]).map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] uppercase font-bold tracking-[0.25em] transition cursor-pointer ${
              tab === t.id ? 'bg-[#ff0000] text-white' : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === 'audit' && (
        <div className="rounded-3xl bg-[#0a0a0a] border border-white/5 p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#ff0000]" /> Who did what — and when
          </h3>
          <DataTable
            columns={[
              { key: 'user', label: 'User', render: (row: any) => (
                <span className="text-xs font-bold text-white">{row.user}</span>
              )},
              { key: 'action', label: 'Action', render: (row: any) => (
                <span className="text-[11px] text-white/80">{row.action}</span>
              )},
              { key: 'ip', label: 'IP Address', render: (row: any) => (
                <span className="text-[10px] font-mono text-[#a1a1a1]">{row.ip}</span>
              )},
              { key: 'time', label: 'Time', render: (row: any) => (
                <span className="text-[10px] text-[#555]">{row.time}</span>
              )},
              { key: 'status', label: '', render: (row: any) => (
                row.status === 'success' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> :
                row.status === 'error' ? <XCircle className="w-3.5 h-3.5 text-red-400" /> :
                row.status === 'warning' ? <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> :
                <Shield className="w-3.5 h-3.5 text-blue-400" />
              )},
            ]}
            data={hasData ? auditLogs : []}
            keyExtractor={(r) => r.id}
          />
        </div>
      )}

      {tab === 'logins' && (
        <div className="rounded-3xl bg-[#0a0a0a] border border-white/5 p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#ff0000]" /> Login attempts
          </h3>
          <DataTable
            columns={[
              { key: 'ip', label: 'IP Address', render: (r: any) => (
                <span className="text-xs font-mono text-white">{r.ip}</span>
              )},
              { key: 'device', label: 'Device / Browser', render: (r: any) => (
                <span className="text-[11px] text-[#a1a1a1]">{r.device}</span>
              )},
              { key: 'time', label: 'Time', render: (r: any) => (
                <span className="text-[10px] text-[#555]">{r.time}</span>
              )},
              { key: 'status', label: 'Status', render: (r: any) => (
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                  r.status === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                }`}>{r.status}</span>
              )},
            ]}
            data={hasData ? loginHistory : []}
            keyExtractor={(r) => r.id}
          />
        </div>
      )}

    </div>
  );
}
