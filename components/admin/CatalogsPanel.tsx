'use client';

import { useState, useEffect, Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit, Save, X, Download, RefreshCw, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { Catalog } from '../../lib/admin-store';
import { getSupabase } from '../../lib/supabase';

export default function CatalogsPanel() {
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCatalog, setEditingCatalog] = useState<Catalog | null>(null);
  const [form, setForm] = useState<{ name: string; description: string; image_url: string }>({
    name: '',
    description: '',
    image_url: ''
  });
  const [newSubName, setNewSubName] = useState('');
  const [expandedSubs, setExpandedSubs] = useState<Set<string>>(new Set());

  const fetchCatalogs = async () => {
    try {
      const client = getSupabase();
      const { data, error } = await client
        .from('categories')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      const mapped = (data || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        description: c.description || '',
        image_url: c.image_url || '/placeholder.svg',
        subCatalogs: Array.isArray(c.sub_categories)
          ? c.sub_categories.map((sc: any) => typeof sc === 'string' ? { id: crypto.randomUUID(), name: sc, catalogId: c.id, created_at: new Date().toISOString() } : sc)
          : [],
        created_at: c.created_at || new Date().toISOString()
      }));
      setCatalogs(mapped);
    } catch (err) {
      console.error('Error fetching catalogs:', err);
      // On error keep existing state rather than replacing with mock data
    }
  };

  // Initialize with Supabase data
  useEffect(() => {
    fetchCatalogs();
  }, []);

  // Filtered catalogs based on search
  const filteredCatalogs = catalogs.filter((c) =>
    !search.trim() || c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddSubCatalog = () => {
    if (!newSubName.trim() || !editingCatalog) return;
    const sub = {
      id: crypto.randomUUID(),
      name: newSubName.trim(),
      catalogId: editingCatalog.id,
      created_at: new Date().toISOString(),
    };
    setEditingCatalog({ ...editingCatalog, subCatalogs: [...editingCatalog.subCatalogs, sub] });
    setNewSubName('');
  };

  const handleRemoveSubCatalog = (subId: string) => {
    if (!editingCatalog) return;
    setEditingCatalog({
      ...editingCatalog,
      subCatalogs: editingCatalog.subCatalogs.filter(s => s.id !== subId)
    });
  };

  // Form reset
  const resetForm = () => {
    setForm({ name: '', description: '', image_url: '' });
    setEditingCatalog(null);
    setNewSubName('');
    setShowForm(false);
  };

  // Handle edit catalog
  const handleEditCatalog = (catalog: Catalog) => {
    setEditingCatalog(catalog);
    setForm({
      name: catalog.name,
      description: catalog.description || '',
      image_url: catalog.image_url || ''
    });
    setShowForm(true);
  };

  // Handle save catalog
  const handleSaveCatalog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;

    const catalogId = editingCatalog?.id || crypto.randomUUID();
    const payload: Catalog = {
      id: catalogId,
      name: form.name,
      description: form.description,
      image_url: form.image_url || '/placeholder.svg',
      subCatalogs: editingCatalog?.subCatalogs || [],
      created_at: editingCatalog?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      const subCategories = editingCatalog?.subCatalogs || [];
      if (editingCatalog) {
        const res = await fetch('/api/admin/data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            table: 'categories',
            action: 'update',
            id: editingCatalog.id,
            data: { name: payload.name, description: payload.description, image_url: payload.image_url, sub_categories: subCategories },
          }),
        });
        if (!res.ok) throw new Error((await res.json())?.error || 'Update failed');
        setCatalogs(prev => prev.map(c => c.id === editingCatalog.id ? { ...payload, subCatalogs: subCategories } : c));
      } else {
        const res = await fetch('/api/admin/data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            table: 'categories',
            action: 'insert',
            data: { id: payload.id, name: payload.name, description: payload.description, image_url: payload.image_url, sub_categories: [] },
          }),
        });
        if (!res.ok) throw new Error((await res.json())?.error || 'Insert failed');
        setCatalogs([{ ...payload, subCatalogs: [] }, ...catalogs]);
      }
    } catch (err) {
      console.error('Error saving catalog:', err);
      alert('Failed to save catalog to Supabase');
    }

    resetForm();
  };

  // Toggle row selection
  const toggleRowSelection = (id: string) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Handle select all
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allIds = new Set(filteredCatalogs.map(c => c.id));
      setSelectedRows(allIds);
      setSelectAll(true);
    } else {
      setSelectedRows(new Set());
      setSelectAll(false);
    }
  };

  // Delete selected catalogs
  const handleDeleteSelected = async () => {
    try {
      for (const id of selectedRows) {
        const res = await fetch('/api/admin/data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ table: 'categories', action: 'delete', id }),
        });
        if (!res.ok) throw new Error((await res.json())?.error || 'Delete failed');
      }

      setCatalogs(prev => prev.filter(c => !selectedRows.has(c.id)));
      setSelectedRows(new Set());
      setSelectAll(false);
      setBulkDeleteConfirm(false);
    } catch (err) {
      console.error('Error deleting catalogs:', err);
      alert('Failed to delete selected catalogs from Supabase');
    }
  };

  // Export CSV
  const exportCSV = () => {
    const data = selectedRows.size > 0 ? filteredCatalogs.filter(c => selectedRows.has(c.id)) : filteredCatalogs;
    const headers = ['Name', 'Description', 'Image URL', 'Created At'];
    const csv = [
      headers.join(','),
      ...data.map(d => `"${d.name}","${d.description || ''}","${d.image_url}","${d.created_at}"`)
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `rutab-catalogs-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pt-4 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-wider">Catalogs Management</h1>
        <p className="text-sm text-[#a1a1a1] mt-1">Manage product catalogs and subcategories</p>
      </div>

      {/* Search + Bulk Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative flex items-center gap-3">
          <input
            type="text"
            placeholder="Search catalogs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-xs sm:w-auto bg-white/5 border border-white/10 rounded-2xl py-3 pl-10 pr-4 text-sm outline-none focus:border-[#ff0000] transition duration-300"
          />
          <Search className="w-4 h-4 text-[#a1a1a1] absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-3 rounded-xl bg-[#ff0000] border border-transparent hover:bg-[#d60000] text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add Catalog
          </button>
          <button
            onClick={exportCSV}
            className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button
            onClick={fetchCatalogs}
            className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Sync
          </button>
          <button
            onClick={() => setBulkDeleteConfirm(true)}
            disabled={selectedRows.size === 0}
            className={`px-4 py-3 rounded-xl border border-white/10 text-[10px] font-bold uppercase tracking-widest transition cursor-pointer ${selectedRows.size > 0 ? 'bg-white/5 text-white hover:text-white' : 'bg-white/5 text-white/40 cursor-not-allowed'}`}
          >
            <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete Selected
            {selectedRows.size > 0 ? ` (${selectedRows.size})` : ''}
          </button>
        </div>
      </div>

      {/* Bulk Delete Confirmation */}
      {bulkDeleteConfirm && selectedRows.size > 0 && (
        <div className="bg-[#111111] border border-white/5 rounded-3xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Confirm Bulk Delete</h3>
          <p className="text-[#a1a1a1]">
            Are you sure you want to delete {selectedRows.size} selected catalogs? This action cannot be undone.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setBulkDeleteConfirm(false); setSelectedRows(new Set()); setSelectAll(false); }}
              className="px-4 py-2.5 border border-white/10 rounded-xl text-xs font-bold text-white/70 hover:text-white transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteSelected}
              className="px-4 py-2.5 bg-[#ff0000] hover:bg-[#d60000] text-white rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Catalog Form */}
      <AnimatePresence>
        {showForm && (
          <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSaveCatalog} className="overflow-hidden">
            <div className="p-6 rounded-3xl bg-[#111111] border border-white/5 space-y-5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">{editingCatalog ? 'Edit Catalog' : 'New Catalog'}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-[#a1a1a1]">Catalog Name</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Arabic Poetry"
                    className="w-full bg-black border border-white/10 rounded-xl py-2.5 px-3.5 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#ff0000]/40 transition" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-[#a1a1a1]">Description</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} placeholder="Brief description..."
                    className="w-full bg-black border border-white/10 rounded-xl py-2.5 px-3.5 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#ff0000]/40 transition resize-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-[#a1a1a1]">Image URL</label>
                  <input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..."
                    className="w-full bg-black border border-white/10 rounded-xl py-2.5 px-3.5 text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#ff0000]/40 transition" />
                </div>
              </div>

              {editingCatalog && (
                <div className="border-t border-white/5 pt-5 space-y-3">
                  <h4 className="text-[10px] uppercase font-bold tracking-widest text-[#a1a1a1]">Sub-Categories</h4>
                  <div className="flex flex-wrap gap-2">
                    {editingCatalog.subCatalogs.length === 0 ? (
                      <p className="text-[10px] text-[#555]">No sub-categories added yet</p>
                    ) : (
                      editingCatalog.subCatalogs.map(sub => (
                        <span key={sub.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/5 rounded-lg text-[10px] text-white">
                          {sub.name}
                          <button type="button" onClick={() => handleRemoveSubCatalog(sub.id)} className="text-red-400 hover:text-red-300 cursor-pointer" title="Remove sub-category">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <input value={newSubName} onChange={(e) => setNewSubName(e.target.value)}
                      placeholder="New sub-category name..."
                      className="flex-1 bg-black border border-white/10 rounded-lg py-1.5 px-2.5 text-[11px] text-white placeholder:text-[#555] focus:outline-none focus:border-[#ff0000]/40 transition" />
                    <button type="button" onClick={handleAddSubCatalog}
                      className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-white hover:bg-white/10 transition cursor-pointer whitespace-nowrap">
                      + Add
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button type="submit" className="px-6 py-2.5 bg-[#ff0000] hover:bg-[#d60000] text-white rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer">
                  <Save className="w-3.5 h-3.5" /> {editingCatalog ? 'Update Catalog' : 'Create Catalog'}
                </button>
                <button type="button" onClick={resetForm} className="px-6 py-2.5 border border-white/10 rounded-xl text-xs font-bold text-white/70 hover:text-white transition cursor-pointer">Cancel</button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Catalogs Table */}
      <div className="bg-[#111111] border border-white/5 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/5">
            <thead className="bg-[#0a0a0a]">
              <tr>
                <th className="h-12 text-left text-[9px] uppercase font-bold tracking-widest text-white/60 px-6">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectAll && filteredCatalogs.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-[#ff0000] border-white/30 rounded"
                    />
                    Select All
                  </div>
                </th>
                <th className="h-12 text-left text-[9px] uppercase font-bold tracking-widest text-white/60 px-6">Name</th>
                <th className="h-12 text-left text-[9px] uppercase font-bold tracking-widest text-white/60 px-6">Sub-Categories</th>
                <th className="h-12 text-left text-[9px] uppercase font-bold tracking-widest text-white/60 px-6">Description</th>
                <th className="h-12 text-left text-[9px] uppercase font-bold tracking-widest text-white/60 px-6 w-[140px]">Image</th>
                <th className="h-12 text-left text-[9px] uppercase font-bold tracking-widest text-white/60 px-6">Created At</th>
                <th className="h-12 text-left text-[9px] uppercase font-bold tracking-widest text-white/60 px-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredCatalogs.length === 0 ? (
                <tr>
                    <td className="px-6 py-4 text-center text-[10px] text-[#a1a1a1]" colSpan={7}>
                    No catalogs found
                  </td>
                </tr>
              ) : (
                filteredCatalogs.map((catalog) => (
                  <Fragment key={catalog.id}>
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 text-left text-[10px] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedRows.has(catalog.id)}
                            onChange={() => toggleRowSelection(catalog.id)}
                            className="w-4 h-4 text-[#ff0000] border-white/30 rounded"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-left text-[10px] font-medium whitespace-nowrap">{catalog.name}</td>
                      <td className="px-6 py-4 text-left text-[10px] font-medium whitespace-nowrap">
                        <button
                          onClick={() => setExpandedSubs(prev => {
                            const next = new Set(prev);
                            next.has(catalog.id) ? next.delete(catalog.id) : next.add(catalog.id);
                            return next;
                          })}
                          className="flex items-center gap-2 text-[10px] text-[#a1a1a1] hover:text-white transition cursor-pointer"
                        >
                          {catalog.subCatalogs.length > 0 ? (
                            <span className="text-[#ff0000] font-bold">{catalog.subCatalogs.length}</span>
                          ) : (
                            <span className="text-[#555]">0</span>
                          )}
                          {expandedSubs.has(catalog.id) ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-left text-[10px] font-medium whitespace-nowrap line-clamp-1">
                        {catalog.description || '-'}
                      </td>
                      <td className="px-6 py-4 text-left text-[10px] font-medium whitespace-nowrap truncate max-w-[140px]">
                        {catalog.image_url || '-'}
                      </td>
                      <td className="px-6 py-4 text-left text-[10px] font-medium whitespace-nowrap">
                        {new Date(catalog.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-left text-[10px] font-medium whitespace-nowrap flex gap-2">
                        <button
                          onClick={() => handleEditCatalog(catalog)}
                          className="p-2 rounded-full hover:bg-white/5 transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4 text-[#a1a1a1] hover:text-white" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedRows(prev => {
                              const newSet = new Set(prev);
                              newSet.add(catalog.id);
                              return newSet;
                            });
                            setBulkDeleteConfirm(true);
                          }}
                          className="p-2 rounded-full hover:bg-white/5 transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-[#a1a1a1] hover:text-white" />
                        </button>
                      </td>
                    </tr>
                    {expandedSubs.has(catalog.id) && (
                      <tr>
                        <td colSpan={7} className="px-6 pb-4">
                          <div className="bg-black/50 rounded-xl p-4 space-y-2">
                            <p className="text-[9px] uppercase font-bold tracking-widest text-[#a1a1a1]">Sub-Categories</p>
                            {catalog.subCatalogs.length === 0 ? (
                              <p className="text-[10px] text-[#555]">No sub-categories</p>
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                {catalog.subCatalogs.map(sub => (
                                  <span key={sub.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/5 rounded-lg text-[10px] text-white">
                                    {sub.name}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}