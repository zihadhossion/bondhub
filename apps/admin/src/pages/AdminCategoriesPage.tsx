import { useState } from 'react';
import { Search, Plus, Pencil, Trash2, Globe, Tag, X } from 'lucide-react';
import { useAdminCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../hooks/useAdmin';
import type { Category } from '../types';

interface CategoryModalState {
  open: boolean;
  mode: 'create' | 'edit' | 'delete';
  categoryId?: string;
  categoryName?: string;
}

export default function AdminCategoriesPage() {
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<CategoryModalState>({ open: false, mode: 'create' });
  const [createName, setCreateName] = useState('');
  const [createDesc, setCreateDesc] = useState('');
  const [editName, setEditName] = useState('');
  const [page, setPage] = useState(1);

  const { data: categoriesData, isLoading } = useAdminCategories({ page, limit: 20, search: search || undefined });
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const categories = categoriesData?.data ?? [];
  const total = categoriesData?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  const openCreate = () => {
    setCreateName('');
    setCreateDesc('');
    setModal({ open: true, mode: 'create' });
  };

  const openEditModal = (cat: Category) => {
    setEditName(cat.name);
    setModal({ open: true, mode: 'edit', categoryId: cat.id, categoryName: cat.name });
  };

  const openDeleteModal = (cat: Category) => {
    setModal({ open: true, mode: 'delete', categoryId: cat.id, categoryName: cat.name });
  };

  const closeModal = () => setModal({ open: false, mode: 'create' });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createCategory.mutate({ name: createName, description: createDesc || undefined }, { onSuccess: closeModal });
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modal.categoryId) return;
    updateCategory.mutate({ id: modal.categoryId, payload: { name: editName } }, { onSuccess: closeModal });
  };

  const handleDelete = () => {
    if (!modal.categoryId) return;
    deleteCategory.mutate(modal.categoryId, { onSuccess: closeModal });
  };

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#F9FAFB]">Categories</h1>
          <p className="text-sm text-[#9CA3AF] mt-1">Manage interest categories for BondHub communities</p>
        </div>
        <button
          onClick={openCreate}
          className="text-white text-sm font-semibold px-4 py-2.5 rounded-[10px] cursor-pointer transition flex items-center gap-2 whitespace-nowrap"
          style={{ background: 'linear-gradient(135deg, #ED1C24, #F472B6)' }}
        >
          <Plus className="w-4 h-4" strokeWidth={1.5} />
          Create Category
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" strokeWidth={1.5} />
        <input
          type="search"
          placeholder="Search categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-80 pl-10 pr-4 py-2.5 text-sm rounded-[10px] outline-none text-[#F9FAFB] placeholder-[#6B7280]"
          style={{ background: '#1F2937', border: '1px solid rgba(255,255,255,0.08)' }}
        />
      </div>

      {/* Table Card */}
      <div
        className="rounded-[12px] overflow-hidden"
        style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#0D1117', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <th className="w-10 px-4 py-3 text-left">
                  <input type="checkbox" className="cursor-pointer w-3.5 h-3.5" onChange={() => {}} />
                </th>
                {['Category Name', 'Community Count', 'Created At', 'Actions'].map((col, i) => (
                  <th
                    key={col}
                    className={`px-4 py-3 font-semibold tracking-[0.08em] uppercase text-left ${i === 3 ? 'text-right' : ''}`}
                    style={{ color: '#6B7280', fontSize: '11px' }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center"><div className="flex justify-center"><div className="w-6 h-6 border-2 border-[#ED1C24] border-t-transparent rounded-full animate-spin" /></div></td></tr>
              ) : categories.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-16 text-center"><div className="flex flex-col items-center gap-3 text-[#6B7280]"><Tag className="w-10 h-10 opacity-40" strokeWidth={1.5} /><p className="text-sm">No categories found</p></div></td></tr>
              ) : (
                categories.map(cat => (
                  <tr key={cat.id} className="transition-colors duration-100" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td className="px-4 py-3.5"><input type="checkbox" className="cursor-pointer w-3.5 h-3.5" onChange={() => {}} /></td>
                    <td className="px-4 py-3.5">
                      <div>
                        <p className="font-medium text-sm text-[#F9FAFB]">{cat.name}</p>
                        <p className="text-xs text-[#6B7280]">#{cat.slug}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: 'rgba(20,184,166,0.12)', color: '#2DD4BF' }}>
                        <Globe className="w-3 h-3" strokeWidth={1.5} />
                        {cat.communitiesCount} communities
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-[#9CA3AF]">{new Date(cat.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button type="button" onClick={() => openEditModal(cat)} className="cursor-pointer text-[#9CA3AF] hover:text-[#F9FAFB] p-1.5 rounded-lg hover:bg-white/5 transition-colors"><Pencil className="w-4 h-4" strokeWidth={1.5} /></button>
                        <button type="button" onClick={() => openDeleteModal(cat)} className="cursor-pointer text-[#9CA3AF] hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"><Trash2 className="w-4 h-4" strokeWidth={1.5} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div
          className="flex items-center justify-between px-5 py-3.5"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="text-sm text-[#9CA3AF]">Showing {categories.length} of {total} categories</p>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1.5 text-xs rounded-lg text-[#6B7280] disabled:opacity-40" style={{ background: 'rgba(255,255,255,0.04)' }}>Previous</button>
            <button type="button" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="px-3 py-1.5 text-xs rounded-lg text-[#6B7280] disabled:opacity-40" style={{ background: 'rgba(255,255,255,0.04)' }}>Next</button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {modal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={closeModal}
        >
          {/* Create Modal */}
          {modal.mode === 'create' && (
            <div
              className="w-full max-w-md mx-4 rounded-[16px] p-6"
              style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(237,28,36,0.12)' }}
                  >
                    <Tag className="w-4 h-4 text-[#ED1C24]" strokeWidth={1.5} />
                  </div>
                  <h2 className="text-lg font-bold text-[#F9FAFB]">Create Category</h2>
                </div>
                <button
                  onClick={closeModal}
                  className="cursor-pointer text-[#6B7280] hover:text-[#F9FAFB] p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <X className="w-5 h-5" strokeWidth={1.5} />
                </button>
              </div>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label htmlFor="categoryName" className="block text-sm font-medium text-[#9CA3AF] mb-1.5">
                    Category Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="categoryName"
                    type="text"
                    placeholder="e.g. Photography"
                    required
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-[10px] outline-none text-[#F9FAFB] placeholder-[#6B7280]"
                    style={{ background: '#1F2937', border: '1px solid rgba(255,255,255,0.08)' }}
                  />
                </div>
                <div>
                  <label htmlFor="categoryDesc" className="block text-sm font-medium text-[#9CA3AF] mb-1.5">
                    Description <span className="text-[#6B7280] font-normal">(optional)</span>
                  </label>
                  <textarea
                    id="categoryDesc"
                    rows={3}
                    placeholder="Brief description of this category..."
                    value={createDesc}
                    onChange={(e) => setCreateDesc(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-[10px] outline-none text-[#F9FAFB] placeholder-[#6B7280] resize-none"
                    style={{ background: '#1F2937', border: '1px solid rgba(255,255,255,0.08)' }}
                  />
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="submit"
                    className="flex-1 text-white text-sm font-semibold py-2.5 rounded-[10px] cursor-pointer transition"
                    style={{ background: 'linear-gradient(135deg, #ED1C24, #F472B6)' }}
                  >
                    Create Category
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 text-sm font-medium py-2.5 rounded-[10px] cursor-pointer transition text-[#9CA3AF] hover:text-[#F9FAFB]"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Edit Modal */}
          {modal.mode === 'edit' && (
            <div
              className="w-full max-w-md mx-4 rounded-[16px] p-6"
              style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(96,165,250,0.12)' }}
                  >
                    <Pencil className="w-4 h-4 text-[#60A5FA]" strokeWidth={1.5} />
                  </div>
                  <h2 className="text-lg font-bold text-[#F9FAFB]">Edit Category</h2>
                </div>
                <button
                  onClick={closeModal}
                  className="cursor-pointer text-[#6B7280] hover:text-[#F9FAFB] p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <X className="w-5 h-5" strokeWidth={1.5} />
                </button>
              </div>
              <form onSubmit={handleEdit} className="space-y-4">
                <div>
                  <label htmlFor="editCategoryName" className="block text-sm font-medium text-[#9CA3AF] mb-1.5">
                    Category Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="editCategoryName"
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-[10px] outline-none text-[#F9FAFB] placeholder-[#6B7280]"
                    style={{ background: '#1F2937', border: '1px solid rgba(255,255,255,0.08)' }}
                  />
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="submit"
                    className="flex-1 text-white text-sm font-semibold py-2.5 rounded-[10px] cursor-pointer transition"
                    style={{ background: 'linear-gradient(135deg, #ED1C24, #F472B6)' }}
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 text-sm font-medium py-2.5 rounded-[10px] cursor-pointer transition text-[#9CA3AF] hover:text-[#F9FAFB]"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Delete Confirm Modal */}
          {modal.mode === 'delete' && (
            <div
              className="w-full max-w-sm mx-4 rounded-[16px] p-6"
              style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(239,68,68,0.12)' }}
                >
                  <Trash2 className="w-5 h-5 text-red-400" strokeWidth={1.5} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#F9FAFB]">Delete Category</h2>
                  <p className="text-sm text-[#9CA3AF]">This action cannot be undone</p>
                </div>
              </div>
              <p className="text-sm text-[#9CA3AF] mb-5">
                Are you sure you want to delete{' '}
                <strong className="text-[#F9FAFB]">{modal.categoryName}</strong>? All associated communities will lose
                this category.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={closeModal}
                  className="flex-1 text-sm font-medium py-2.5 rounded-[10px] cursor-pointer transition text-[#9CA3AF] hover:text-[#F9FAFB]"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 text-sm font-semibold py-2.5 rounded-[10px] cursor-pointer transition text-white"
                  style={{ background: '#EF4444' }}
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function CategoryTableRow({
  name,
  slug,
  icon,
  iconColor: _iconColor,
  iconBg,
  communitiesCount,
  createdAt,
  onEdit,
  onDelete,
}: {
  name: string;
  slug: string;
  icon: React.ReactNode;
  iconColor: string;
  iconBg: string;
  communitiesCount: number;
  createdAt: string;
  onEdit: (name: string) => void;
  onDelete: (name: string) => void;
}) {
  return (
    <tr
      className="table-row-hover transition-colors duration-100"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
    >
      <td className="px-4 py-3.5">
        <input type="checkbox" className="cursor-pointer w-3.5 h-3.5" onChange={() => {}} />
      </td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: iconBg }}>
            {icon}
          </div>
          <div>
            <p className="font-medium text-[#F9FAFB]">{name}</p>
            <p className="text-xs text-[#6B7280]">#{slug}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5">
        <span
          className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
          style={{ background: 'rgba(20,184,166,0.12)', color: '#2DD4BF' }}
        >
          <Globe className="w-3 h-3" strokeWidth={1.5} />
          {communitiesCount} communities
        </span>
      </td>
      <td className="px-4 py-3.5 text-[#9CA3AF]">{createdAt}</td>
      <td className="px-4 py-3.5">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => onEdit(name)}
            className="cursor-pointer text-[#9CA3AF] hover:text-[#F9FAFB] p-1.5 rounded-lg hover:bg-white/5 transition-colors"
            title="Edit"
          >
            <Pencil className="w-4 h-4" strokeWidth={1.5} />
          </button>
          <button
            onClick={() => onDelete(name)}
            className="cursor-pointer text-[#9CA3AF] hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
      </td>
    </tr>
  );
}
