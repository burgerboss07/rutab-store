'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save, AlertTriangle } from 'lucide-react';
import { Profile } from './CustomersPanel';

interface Props {
  profile: Profile;
  onClose: () => void;
  onSaved: () => void;
}

const statusOptions = [
  { value: 'active', label: 'Active', color: 'bg-emerald-500' },
  { value: 'vip', label: 'VIP', color: 'bg-amber-500' },
  { value: 'inactive', label: 'Inactive', color: 'bg-zinc-500' },
  { value: 'flagged', label: 'Flagged', color: 'bg-red-500' },
] as const;

export default function EditCustomerModal({ profile, onClose, onSaved }: Props) {
  const [fullName, setFullName] = useState(profile.full_name || '');
  const [email, setEmail] = useState(profile.email || '');
  const [phone, setPhone] = useState(profile.phone || '');
  const [address, setAddress] = useState(profile.address || '');
  const [area, setArea] = useState(profile.area || '');
  const [notes, setNotes] = useState(profile.notes || '');
  const [status, setStatus] = useState<Profile['status']>(profile.status || 'active');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: profile.id,
          full_name: fullName,
          email,
          phone,
          address,
          area,
          notes,
          status,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Update failed');
      onSaved();
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-[32px] shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/5">
          <div>
            <h3 className="text-xl font-black uppercase tracking-wider">Edit Member</h3>
            <p className="text-[11px] text-[#a1a1a1] mt-0.5">
              Update profile details for {profile.full_name || 'this member'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl border border-white/10 hover:border-white/30 flex items-center justify-center text-[#a1a1a1] hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto no-scrollbar">
          {error && (
            <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-[11px] font-bold">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-widest text-[#a1a1a1]">Full Name</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#ff0000]/40 transition"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-widest text-[#a1a1a1]">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#ff0000]/40 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-widest text-[#a1a1a1]">Phone</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+965 9000 0000"
                className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#ff0000]/40 transition"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-widest text-[#a1a1a1]">Area / District</label>
              <input
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="Salmiya, Kuwait City"
                className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#ff0000]/40 transition"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold tracking-widest text-[#a1a1a1]">Address</label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street, building, apartment"
              className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#ff0000]/40 transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold tracking-widest text-[#a1a1a1]">Internal Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="VIP customer — frequent bulk buyer"
              rows={3}
              className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#ff0000]/40 transition resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-widest text-[#a1a1a1]">Member Status</label>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStatus(opt.value)}
                  className={`px-5 py-2.5 rounded-xl border font-bold text-xs uppercase tracking-wider transition cursor-pointer ${
                    status === opt.value
                      ? `${opt.color}/20 border-${opt.value === 'active' ? 'emerald' : opt.value === 'vip' ? 'amber' : opt.value === 'flagged' ? 'red' : 'zinc'}-500/40 text-white`
                      : 'bg-black border-white/10 text-[#a1a1a1] hover:border-white/30'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/5">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-white/10 hover:border-white/30 text-sm font-bold text-[#a1a1a1] hover:text-white transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-[#ff0000] hover:bg-[#d60000] text-white text-sm font-bold flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
