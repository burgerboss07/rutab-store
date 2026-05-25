'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit, Save, X, Download, RefreshCw, Search } from 'lucide-react';
import { Catalog } from '../../lib/admin-store';

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

  // Mock catalogs data (in production, this would come from Supabase)
  const mockCatalogs: Catalog[] = [
    {
      id: '1',
      name: 'Arabic Poetry',
      description: 'Beautiful Arabic calligraphy and poetry designs',
      image_url: '/placeholder.svg',
      subCatalogs: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Cartoons',
      description: 'Fun cartoon and character designs',
      image_url: '/placeholder.svg',
      subCatalogs: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '3',
      name: 'Brand Shirts',
      description: 'Official brand collaboration shirts',
      image_url: '/placeholder.svg',
      subCatalogs: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  // Initialize with mock data
  useEffect(() => {
    setCatalogs(mockCatalogs);
  }, []);

  // Filtered catalogs based on search
  const filteredCatalogs = catalogs.filter((c) =>
    !search.trim() || c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase())
  );

  // Form reset
  const resetForm = () => {
    setForm({ name: '', description: '', image_url: '' });
    setEditingCatalog(null);
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
  const handleSaveCatalog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;

    const payload: Catalog = {
      id: editingCatalog?.id || Math.random().toString(36).substr(2, 9),
      name: form.name,
      description: form.description,
      image_url: form.image_url,
      subCatalogs: editingCatalog?.subCatalogs || [],
      created_at: editingCatalog?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (editingCatalog) {
      setCatalogs(prev => prev.map(c => c.id === editingCatalog.id ? payload : c));
    } else {
      setCatalogs([payload, ...catalogs]);
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
  const handleDeleteSelected = () => {
    setCatalogs(prev => prev.filter(c => !selectedRows.has(c.id)));
    setSelectedRows(new Set());
    setSelectAll(false);
    setBulkDeleteConfirm(false);
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
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search catalogs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-xs sm:w-auto bg-white/5 border border-white/10 rounded-2xl py-3 pl-6 pr-4 text-sm outline-none focus:border-[#ff0000] transition duration-300"
          />
          <Search className="w-4 h-4 text-[#a1a1a1] absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportCSV}
            className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button
            onClick={() => setCatalogs(mockCatalogs)}
            className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Sync
          </button>
          <button
            onClick={() => { setSelectAll(false); setSelectedRows(new Set()); }}
            className={`px-4 py-3 rounded-xl border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white/70 hover:text-white transition cursor-pointer ${selectedRows.size > 0 ? 'bg-white/5' : 'bg-transparent'}`}
          >
            {selectedRows.size > 0 ? (
              <>
                <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete Selected ({selectedRows.size})
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" /> Delete Selected
              </>
            )}
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
              onClick={() => setBulkDeleteConfirm(false)}
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
                <th className="h-12 text-left text-[9px] uppercase font-bold tracking-widest text-white/60 px-6">Description</th>
                <th className="h-12 text-left text-[9px] uppercase font-bold tracking-widest text-white/60 px-6">Image URL</th>
                <th className="h-12 text-left text-[9px] uppercase font-bold tracking-widest text-white/60 px-6">Created At</th>
                <th className="h-12 text-left text-[9px] uppercase font-bold tracking-widest text-white/60 px-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredCatalogs.length === 0 ? (
                <tr>
                  <td className="px-6 py-4 text-center text-[10px] text-[#a1a1a1]" colSpan={6}>
                    No catalogs found
                  </td>
                </tr>
              ) : (
                filteredCatalogs.map((catalog) => (
                  <tr key={catalog.id} className="hover:bg-white/5 transition-colors">
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
                    <td className="px-6 py-4 text-left text-[10px] font-medium whitespace-nowrap line-clamp-1">
                      {catalog.description || '-'}
                    </td>
                    <td className="px-6 py-4 text-left text-[10px] font-medium whitespace-nowrap break-all max-w-xs">
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}