import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Eye, Trash2, FileText, X, AlertTriangle } from 'lucide-react';
import { useAdminPosts, useDeleteAdminPost } from '../hooks/useAdmin';

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

export default function AdminPostsPage() {
  const [search, setSearch] = useState('');
  const [communityFilter, setCommunityFilter] = useState('all');
  const [bulkAction, setBulkAction] = useState('');
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  const { data: postsData, isLoading } = useAdminPosts({ page, limit: 20, search: search || undefined });
  const deletePost = useDeleteAdminPost();

  const allPosts = postsData?.data ?? [];
  const posts = communityFilter !== 'all' ? allPosts.filter(p => p.communityName === communityFilter) : allPosts;
  const communityNames = Array.from(new Set(allPosts.map(p => p.communityName)));
  const total = postsData?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  const allSelected = posts.length > 0 && posts.every((p) => selectedIds.has(p.id));

  const toggleSelectAll = () => {
    if (allSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(posts.map((p) => p.id)));
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleApplyBulkAction = () => {
    if (!bulkAction || selectedIds.size === 0) return;
    if (bulkAction === 'delete') {
      setConfirmBulkDelete(true);
    }
  };

  const handleConfirmDelete = () => {
    if (!confirmDeleteId) return;
    deletePost.mutate(confirmDeleteId, {
      onSuccess: () => {
        setSelectedIds((prev) => { const next = new Set(prev); next.delete(confirmDeleteId); return next; });
        setConfirmDeleteId(null);
      },
    });
  };

  const handleConfirmBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    for (const id of ids) {
      await deletePost.mutateAsync(id).catch(() => {});
    }
    setSelectedIds(new Set());
    setConfirmBulkDelete(false);
    setBulkAction('');
  };

  const postToDelete = posts.find((p) => p.id === confirmDeleteId);

  return (
    <div className="p-6">
      {confirmDeleteId && (
        <ConfirmModal
          title="Delete Post"
          message={`Are you sure you want to delete "${postToDelete?.title ?? 'this post'}"? This action cannot be undone.`}
          confirmLabel="Delete Post"
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmDeleteId(null)}
          isPending={deletePost.isPending}
        />
      )}

      {confirmBulkDelete && (
        <ConfirmModal
          title="Delete Selected Posts"
          message={`Are you sure you want to delete ${selectedIds.size} post${selectedIds.size !== 1 ? 's' : ''}? This action cannot be undone.`}
          confirmLabel={`Delete ${selectedIds.size} Post${selectedIds.size !== 1 ? 's' : ''}`}
          onConfirm={handleConfirmBulkDelete}
          onCancel={() => setConfirmBulkDelete(false)}
          isPending={deletePost.isPending}
        />
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[24px] font-bold text-[#F9FAFB]">Posts</h1>
          <p className="text-[14px] text-[#6B7280] mt-1">Manage all posts across communities</p>
        </div>
        {selectedIds.size > 0 && (
          <span className="text-sm text-[#9CA3AF]">{selectedIds.size} selected</span>
        )}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px] max-w-[320px]">
          <input
            type="text"
            placeholder="Search by title or author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-[10px] px-3 py-[9px] pl-9 text-[13px] text-[#F9FAFB] placeholder-[#6B7280] outline-none transition"
            style={{ background: '#1F2937', border: '1px solid rgba(255,255,255,0.06)' }}
          />
          <Search className="absolute left-[10px] top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" strokeWidth={1.5} />
        </div>
        <select
          value={communityFilter}
          onChange={(e) => { setCommunityFilter(e.target.value); setPage(1); }}
          className="rounded-[10px] px-3 py-[9px] text-[13px] text-[#9CA3AF] outline-none cursor-pointer appearance-none pr-8"
          style={{ background: '#1F2937', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <option value="all">All Communities</option>
          {communityNames.map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
        <div className="ml-auto flex items-center gap-2">
          <select
            value={bulkAction}
            onChange={(e) => setBulkAction(e.target.value)}
            className="rounded-[10px] px-3 py-[9px] text-[13px] text-[#9CA3AF] outline-none cursor-pointer appearance-none pr-8"
            style={{ background: '#1F2937', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <option value="">Bulk Actions</option>
            <option value="delete">Delete Selected</option>
          </select>
          <button
            type="button"
            onClick={handleApplyBulkAction}
            disabled={!bulkAction || selectedIds.size === 0}
            className="px-[14px] py-[9px] rounded-[10px] text-[13px] font-medium text-[#F9FAFB] transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            Apply
          </button>
        </div>
      </div>

      {/* Table */}
      <div
        className="rounded-[12px] overflow-hidden"
        style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: '#0D1117' }}>
                <th className="w-[40px] px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded-[4px] cursor-pointer"
                    style={{ border: '1px solid rgba(255,255,255,0.1)', accentColor: '#ED1C24' }}
                  />
                </th>
                {['Post Title', 'Author', 'Community', 'Comments', 'Created At', 'Actions'].map(
                  (col, i) => (
                    <th
                      key={col}
                      className={`px-4 py-3 text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider ${
                        i === 3 ? 'text-center' : i === 5 ? 'text-right' : 'text-left'
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
                <tr><td colSpan={7} className="px-4 py-8 text-center"><div className="flex justify-center"><div className="w-6 h-6 border-2 border-[#ED1C24] border-t-transparent rounded-full animate-spin" /></div></td></tr>
              ) : posts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-[#6B7280]">
                      <FileText className="w-10 h-10 opacity-40" strokeWidth={1.5} />
                      <p className="text-sm">No posts found</p>
                      <p className="text-xs">Posts will appear here once users start creating them</p>
                    </div>
                  </td>
                </tr>
              ) : (
                posts.map(p => (
                  <PostTableRow
                    key={p.id}
                    id={p.id}
                    title={p.title}
                    author={p.authorName}
                    community={p.communityName}
                    communityColor={{ bg: 'rgba(20,184,166,0.15)', text: '#14B8A6' }}
                    commentsCount={p.commentsCount}
                    createdAt={new Date(p.createdAt).toLocaleDateString()}
                    selected={selectedIds.has(p.id)}
                    onSelect={toggleSelect}
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
          <p className="text-sm text-[#9CA3AF]">Showing {posts.length} of {total} posts</p>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1.5 text-xs rounded-lg text-[#6B7280] disabled:opacity-40" style={{ background: 'rgba(255,255,255,0.04)' }}>Previous</button>
            <button type="button" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="px-3 py-1.5 text-xs rounded-lg text-[#6B7280] disabled:opacity-40" style={{ background: 'rgba(255,255,255,0.04)' }}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PostTableRow({
  id,
  title,
  author,
  community,
  communityColor,
  commentsCount,
  createdAt,
  selected,
  onSelect,
  onDeleteClick,
}: {
  id: string;
  title: string;
  author: string;
  community: string;
  communityColor: { bg: string; text: string };
  commentsCount: number;
  createdAt: string;
  selected: boolean;
  onSelect: (id: string) => void;
  onDeleteClick: (id: string) => void;
}) {
  return (
    <tr
      className="table-row-hover transition"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
    >
      <td className="px-4 py-[14px]">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onSelect(id)}
          className="w-4 h-4 rounded-[4px] cursor-pointer"
          style={{ border: '1px solid rgba(255,255,255,0.1)', accentColor: '#ED1C24' }}
        />
      </td>
      <td className="px-4 py-[14px]">
        <Link
          to={`/posts/${id}`}
          className="text-[14px] font-medium text-[#F9FAFB] hover:text-[#ED1C24] transition cursor-pointer"
        >
          {title}
        </Link>
      </td>
      <td className="px-4 py-[14px] text-[13px] text-[#9CA3AF]">{author}</td>
      <td className="px-4 py-[14px]">
        <span
          className="px-[10px] py-[3px] rounded-full text-[11px] font-medium"
          style={{ background: communityColor.bg, color: communityColor.text }}
        >
          {community}
        </span>
      </td>
      <td className="px-4 py-[14px] text-center text-[13px] text-[#9CA3AF]">{commentsCount}</td>
      <td className="px-4 py-[14px] text-[13px] text-[#6B7280]">{createdAt}</td>
      <td className="px-4 py-[14px] text-right">
        <div className="flex items-center justify-end gap-2">
          <Link
            to={`/posts/${id}`}
            className="p-[6px] rounded-[6px] hover:bg-white/[0.06] transition cursor-pointer"
            title="View"
          >
            <Eye className="w-4 h-4 text-[#6B7280]" strokeWidth={1.5} />
          </Link>
          <button
            type="button"
            onClick={() => onDeleteClick(id)}
            className="p-[6px] rounded-[6px] hover:bg-red-500/10 transition cursor-pointer"
            title="Delete"
          >
            <Trash2 className="w-4 h-4 text-[#6B7280] hover:text-red-400" strokeWidth={1.5} />
          </button>
        </div>
      </td>
    </tr>
  );
}
