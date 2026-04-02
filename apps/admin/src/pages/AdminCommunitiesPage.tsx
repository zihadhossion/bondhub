import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Search, Eye, Archive, Trash2, Globe, Plus, X, AlertTriangle } from 'lucide-react';
import { useAdminCommunities, useAdminCategories, useCreateAdminCommunity, useUpdateCommunityStatus, useDeleteAdminCommunity } from '../hooks/useAdmin';
import type { Community } from '../types';

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  isPending?: boolean;
}

function ConfirmModal({ title, message, confirmLabel, onConfirm, onCancel, isPending }: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div className="rounded-[16px] p-[24px] w-full max-w-[400px]" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="flex items-start justify-between mb-[16px]">
          <div className="flex items-center gap-[10px]">
            <AlertTriangle className="w-[20px] h-[20px] text-[#EF4444] flex-shrink-0" strokeWidth={1.5} />
            <h3 className="text-[16px] font-bold text-[#F9FAFB]">{title}</h3>
          </div>
          <button type="button" onClick={onCancel} className="text-[#6B7280] hover:text-[#F9FAFB] cursor-pointer transition">
            <X className="w-[18px] h-[18px]" strokeWidth={1.5} />
          </button>
        </div>
        <p className="text-[14px] text-[#9CA3AF] mb-[20px]">{message}</p>
        <div className="flex items-center justify-end gap-[10px]">
          <button
            type="button"
            onClick={onCancel}
            className="px-[16px] py-[8px] rounded-[8px] text-[13px] font-medium text-[#F9FAFB] cursor-pointer transition hover:bg-white/10"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="px-[16px] py-[8px] rounded-[8px] text-[13px] font-medium text-white cursor-pointer transition disabled:opacity-60"
            style={{ background: '#EF4444' }}
          >
            {isPending ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminCommunitiesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createCategoryId, setCreateCategoryId] = useState('');
  const [createDesc, setCreateDesc] = useState('');

  const { data: communitiesData, isLoading } = useAdminCommunities({
    page, limit: 20,
    search: search || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });
  const { data: categoriesData } = useAdminCategories({ limit: 100 });
  const updateStatus = useUpdateCommunityStatus();
  const deleteCommunity = useDeleteAdminCommunity();
  const createCommunity = useCreateAdminCommunity();

  const communities = communitiesData?.data ?? [];
  const categories = categoriesData?.data ?? [];
  const total = communitiesData?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  const allSelected = communities.length > 0 && communities.every((c) => selectedIds.has(c.id));

  const toggleSelectAll = () => {
    if (allSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(communities.map((c) => c.id)));
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleConfirmDelete = () => {
    if (!confirmDeleteId) return;
    deleteCommunity.mutate(confirmDeleteId, {
      onSuccess: () => {
        setSelectedIds((prev) => { const next = new Set(prev); next.delete(confirmDeleteId); return next; });
        setConfirmDeleteId(null);
      },
    });
  };

  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    if (!createCategoryId) return;
    createCommunity.mutate(
      { name: createName, categoryId: createCategoryId, description: createDesc || undefined },
      {
        onSuccess: () => {
          setShowCreateModal(false);
          setCreateName('');
          setCreateCategoryId('');
          setCreateDesc('');
        },
      }
    );
  };

  const communityToDelete = communities.find((c) => c.id === confirmDeleteId);

  return (
    <div className="p-6">
      {confirmDeleteId && (
        <ConfirmModal
          title="Delete Community"
          message={`Are you sure you want to delete "${communityToDelete?.name ?? 'this community'}"? This action cannot be undone.`}
          confirmLabel="Delete Community"
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmDeleteId(null)}
          isPending={deleteCommunity.isPending}
        />
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="rounded-[16px] p-[24px] w-full max-w-[480px]" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-center justify-between mb-[20px]">
              <h3 className="text-[18px] font-bold text-[#F9FAFB]">Create Community</h3>
              <button type="button" onClick={() => setShowCreateModal(false)} className="text-[#6B7280] hover:text-[#F9FAFB] cursor-pointer transition">
                <X className="w-[20px] h-[20px]" strokeWidth={1.5} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-[14px]">
              <div>
                <label className="block text-[12px] font-medium text-[#9CA3AF] mb-[6px]">Community Name *</label>
                <input
                  type="text"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  required
                  placeholder="e.g. Photography Enthusiasts"
                  className="w-full rounded-[8px] px-[12px] py-[10px] text-[13px] text-[#F9FAFB] placeholder-[#6B7280] outline-none"
                  style={{ background: '#1F2937', border: '1px solid rgba(255,255,255,0.06)' }}
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#9CA3AF] mb-[6px]">Category *</label>
                <select
                  value={createCategoryId}
                  onChange={(e) => setCreateCategoryId(e.target.value)}
                  required
                  className="w-full rounded-[8px] px-[12px] py-[10px] text-[13px] text-[#F9FAFB] outline-none cursor-pointer"
                  style={{ background: '#1F2937', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#9CA3AF] mb-[6px]">Description</label>
                <textarea
                  value={createDesc}
                  onChange={(e) => setCreateDesc(e.target.value)}
                  rows={3}
                  placeholder="Describe this community..."
                  className="w-full rounded-[8px] px-[12px] py-[10px] text-[13px] text-[#F9FAFB] placeholder-[#6B7280] outline-none resize-none"
                  style={{ background: '#1F2937', border: '1px solid rgba(255,255,255,0.06)' }}
                />
              </div>
              {createCommunity.isError && (
                <p className="text-[12px]" style={{ color: '#EF4444' }}>{createCommunity.error?.message}</p>
              )}
              <div className="flex items-center justify-end gap-[10px] pt-[4px]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-[16px] py-[8px] rounded-[8px] text-[13px] font-medium text-[#F9FAFB] cursor-pointer hover:bg-white/10 transition"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createCommunity.isPending}
                  className="px-[16px] py-[8px] rounded-[8px] text-[13px] font-semibold text-white cursor-pointer transition disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #ED1C24, #F472B6)' }}
                >
                  {createCommunity.isPending ? 'Creating...' : 'Create Community'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-[22px] font-bold text-[#F9FAFB]">Communities</h1>
          {selectedIds.size > 0 && (
            <span className="text-sm text-[#9CA3AF]">{selectedIds.size} selected</span>
          )}
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="text-white text-sm font-semibold px-4 py-2.5 rounded-[8px] flex items-center gap-2 cursor-pointer transition"
            style={{ background: 'linear-gradient(135deg, #ED1C24, #F472B6)' }}
          >
            <Plus className="w-4 h-4" strokeWidth={1.5} /> Create Community
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-3 mb-5">
        <div
          className="flex items-center rounded-[10px] px-3 py-2.5 gap-2 w-full md:w-auto"
          style={{ background: '#1F2937', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <Search className="w-4 h-4 text-[#6B7280]" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Search communities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm text-[#F9FAFB] outline-none w-full md:w-[240px] placeholder-[#6B7280]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-sm text-[#9CA3AF] rounded-[10px] px-3 py-2.5 outline-none cursor-pointer"
          style={{ background: '#1F2937', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Communities Table */}
      <div
        className="rounded-[12px] overflow-hidden"
        style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr style={{ background: '#0D1117' }}>
                <th className="w-[40px] px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="rounded-sm cursor-pointer"
                    style={{ border: '1px solid rgba(255,255,255,0.2)' }}
                  />
                </th>
                {['Community Name', 'Category', 'Description', 'Members', 'Posts', 'Status', 'Created At', 'Actions'].map(
                  (col, i) => (
                    <th
                      key={col}
                      className={`px-4 py-3 text-[11px] font-semibold text-[#6B7280] uppercase tracking-[0.08em] ${
                        i === 7 ? 'text-right' : 'text-left'
                      }`}
                    >
                      {col}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center"><div className="flex justify-center"><div className="w-6 h-6 border-2 border-[#ED1C24] border-t-transparent rounded-full animate-spin" /></div></td></tr>
              ) : communities.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-16 text-center"><div className="flex flex-col items-center gap-3 text-[#6B7280]"><Globe className="w-10 h-10 opacity-40" strokeWidth={1.5} /><p className="text-sm">No communities found</p></div></td></tr>
              ) : (
                communities.map(c => (
                  <CommunityTableRow
                    key={c.id}
                    community={c}
                    selected={selectedIds.has(c.id)}
                    onSelect={toggleSelect}
                    onArchive={(id) => updateStatus.mutate({ id, payload: { status: 'archived' } })}
                    onDeleteClick={setConfirmDeleteId}
                  />
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
          <p className="text-sm text-[#9CA3AF]">Showing {communities.length} of {total} communities</p>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1.5 text-xs rounded-lg text-[#6B7280] disabled:opacity-40" style={{ background: 'rgba(255,255,255,0.04)' }}>Previous</button>
            <button type="button" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="px-3 py-1.5 text-xs rounded-lg text-[#6B7280] disabled:opacity-40" style={{ background: 'rgba(255,255,255,0.04)' }}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CommunityTableRow({
  community,
  selected,
  onSelect,
  onArchive,
  onDeleteClick,
}: {
  community: Community;
  selected: boolean;
  onSelect: (id: string) => void;
  onArchive: (id: string) => void;
  onDeleteClick: (id: string) => void;
}) {
  const categoryName = typeof community.category === 'object'
    ? (community.category as { name?: string })?.name ?? ''
    : (community.category as string) ?? '';
  const status = (community.status ?? 'active') as 'active' | 'archived';

  return (
    <tr
      className="table-row-hover transition"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
    >
      <td className="px-4 py-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onSelect(community.id)}
          className="rounded-sm cursor-pointer"
          style={{ border: '1px solid rgba(255,255,255,0.2)' }}
        />
      </td>
      <td className="px-4 py-3">
        <Link
          to={`/communities/${community.id}`}
          className="text-sm font-medium text-[#F9FAFB] hover:text-[#ED1C24] transition cursor-pointer"
        >
          {community.name}
        </Link>
      </td>
      <td className="px-4 py-3">
        <span
          className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
          style={{ background: 'rgba(20,184,166,0.15)', color: '#14B8A6' }}
        >
          {categoryName}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-[#9CA3AF] max-w-[200px] truncate">{community.description ?? '—'}</td>
      <td className="px-4 py-3 text-sm text-[#9CA3AF]">{community.membersCount}</td>
      <td className="px-4 py-3 text-sm text-[#9CA3AF]">{community.postsCount}</td>
      <td className="px-4 py-3">
        <span
          className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
          style={
            status === 'active'
              ? { background: 'rgba(34,197,94,0.15)', color: '#22C55E' }
              : { background: 'rgba(107,114,128,0.15)', color: '#6B7280' }
          }
        >
          {status === 'active' ? 'Active' : 'Archived'}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-[#9CA3AF]">{new Date(community.createdAt).toLocaleDateString()}</td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          <Link
            to={`/communities/${community.id}`}
            className="p-1.5 text-[#6B7280] hover:text-[#F9FAFB] cursor-pointer transition"
            title="View"
          >
            <Eye className="w-4 h-4" strokeWidth={1.5} />
          </Link>
          <button
            type="button"
            onClick={() => onArchive(community.id)}
            className="p-1.5 text-[#6B7280] hover:text-yellow-500 cursor-pointer transition"
            title="Archive"
          >
            <Archive className="w-4 h-4" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={() => onDeleteClick(community.id)}
            className="p-1.5 text-[#6B7280] hover:text-red-500 cursor-pointer transition"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
      </td>
    </tr>
  );
}
