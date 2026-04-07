import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Eye, Trash2, XCircle, UserX, Flag } from 'lucide-react';
import { useAdminFlags, useDismissFlag, useResolveFlag, useBulkFlagAction } from '../hooks/useAdmin';
import type { FlagStatus, ContentType } from '../types';

function StatusPill({ status }: { status: FlagStatus }) {
  const styles: Record<FlagStatus, { bg: string; color: string; label: string }> = {
    pending: { bg: 'rgba(245,158,11,0.15)', color: '#F59E0B', label: 'Pending' },
    resolved: { bg: 'rgba(20,184,166,0.15)', color: '#14B8A6', label: 'Resolved' },
    dismissed: { bg: 'rgba(107,114,128,0.15)', color: '#9CA3AF', label: 'Dismissed' },
  };
  const s = styles[status];
  return (
    <span
      className="px-[10px] py-[3px] rounded-full text-[11px] font-medium"
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
}

function ContentTypePill({ type }: { type: ContentType }) {
  const styles: Record<ContentType, { bg: string; color: string }> = {
    post: { bg: 'rgba(59,130,246,0.15)', color: '#3B82F6' },
    comment: { bg: 'rgba(168,85,247,0.15)', color: '#A855F7' },
  };
  const s = styles[type];
  return (
    <span
      className="px-[8px] py-[3px] rounded-full text-[11px] font-medium capitalize"
      style={{ background: s.bg, color: s.color }}
    >
      {type}
    </span>
  );
}

export default function AdminFlaggedPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [bulkAction, setBulkAction] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);

  const { data: flagsData, isLoading } = useAdminFlags({
    page,
    limit: 20,
    search: search || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });
  const dismissFlag = useDismissFlag();
  const resolveFlag = useResolveFlag();
  const bulkFlagAction = useBulkFlagAction();

  const allFlags = flagsData?.data ?? [];
  const flags = typeFilter !== 'all' ? allFlags.filter(f => f.contentType === typeFilter) : allFlags;
  const total = flagsData?.total ?? 0;
  const totalPages = Math.ceil(total / 20);
  const pendingCount = flags.filter(f => f.status === 'pending').length;

  const allSelected = flags.length > 0 && flags.every(f => selectedIds.has(f.id));
  const toggleSelectAll = () => {
    if (allSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(flags.map(f => f.id)));
  };
  const toggleSelect = (id: string) =>
    setSelectedIds(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });

  const handleApplyBulkAction = () => {
    if (!bulkAction || selectedIds.size === 0) return;
    const actionMap: Record<string, 'delete_content' | 'dismiss' | 'suspend_user'> = {
      delete: 'delete_content',
      dismiss: 'dismiss',
      suspend: 'suspend_user',
    };
    const mapped = actionMap[bulkAction];
    if (!mapped) return;
    bulkFlagAction.mutate({ action: mapped, ids: Array.from(selectedIds) }, {
      onSuccess: () => { setSelectedIds(new Set()); setBulkAction(''); },
    });
  };

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[24px] font-bold text-[#F9FAFB] flex items-center gap-[10px]">
            Flagged Content
            <span
              className="inline-flex items-center justify-center px-[10px] py-[2px] rounded-full text-[12px] font-semibold"
              style={{ background: 'rgba(239,68,68,0.15)', color: '#F87171' }}
            >
              {pendingCount} Pending
            </span>
          </h1>
          <p className="text-[14px] text-[#6B7280] mt-1">Review and moderate flagged posts and comments</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px] max-w-[320px]">
          <input
            type="text"
            placeholder="Search flagged content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-[10px] px-3 py-[9px] pl-9 text-[13px] text-[#F9FAFB] placeholder-[#6B7280] outline-none transition"
            style={{ background: '#1F2937', border: '1px solid rgba(255,255,255,0.06)' }}
          />
          <Search className="absolute left-[10px] top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" strokeWidth={1.5} />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-[10px] px-3 py-[9px] text-[13px] text-[#9CA3AF] outline-none cursor-pointer appearance-none pr-8"
          style={{ background: '#1F2937', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <option value="all">All Types</option>
          <option value="post">Posts</option>
          <option value="comment">Comments</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-[10px] px-3 py-[9px] text-[13px] text-[#9CA3AF] outline-none cursor-pointer appearance-none pr-8"
          style={{ background: '#1F2937', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="resolved">Resolved</option>
          <option value="dismissed">Dismissed</option>
        </select>
        <div className="ml-auto flex items-center gap-2">
          <select
            value={bulkAction}
            onChange={(e) => setBulkAction(e.target.value)}
            className="rounded-[10px] px-3 py-[9px] text-[13px] text-[#9CA3AF] outline-none cursor-pointer appearance-none pr-8"
            style={{ background: '#1F2937', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <option value="">Bulk Actions</option>
            <option value="delete">Delete Content</option>
            <option value="dismiss">Dismiss Flags</option>
            <option value="suspend">Suspend Users</option>
          </select>
          <button
            onClick={handleApplyBulkAction}
            disabled={!bulkAction || selectedIds.size === 0 || bulkFlagAction.isPending}
            className="px-[14px] py-[9px] rounded-[10px] text-[13px] font-medium text-[#F9FAFB] hover:bg-white/10 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            {bulkFlagAction.isPending ? 'Applying…' : 'Apply'}
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
                {['Type', 'Content Preview', 'Author', 'Flagged By', 'Flags', 'Status', 'Created At', 'Actions'].map(
                  (col, i) => (
                    <th
                      key={col}
                      className={`px-4 py-3 text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider ${
                        i === 4 || i === 5 ? 'text-center' : i === 7 ? 'text-right' : 'text-left'
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
              ) : flags.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-[#6B7280]">
                      <Flag className="w-10 h-10 opacity-40" strokeWidth={1.5} />
                      <p className="text-sm">No flagged content</p>
                      <p className="text-xs">Flagged posts and comments will appear here</p>
                    </div>
                  </td>
                </tr>
              ) : (
                flags.map(f => (
                  <FlaggedTableRow
                    key={f.id}
                    id={f.id}
                    type={f.contentType}
                    contentPreview={f.reason}
                    author="—"
                    flaggedBy={f.reportedBy}
                    flagCount={1}
                    status={f.status}
                    createdAt={new Date(f.createdAt).toLocaleDateString()}
                    selected={selectedIds.has(f.id)}
                    onSelect={toggleSelect}
                    onDelete={(id) => resolveFlag.mutate(id)}
                    onDismiss={(id) => dismissFlag.mutate(id)}
                    onSuspendUser={(id) => bulkFlagAction.mutate({ action: 'suspend_user', ids: [id] })}
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
          <p className="text-sm text-[#9CA3AF]">Showing {flags.length} of {total} flagged items</p>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1.5 text-xs rounded-lg text-[#6B7280] disabled:opacity-40" style={{ background: 'rgba(255,255,255,0.04)' }}>Previous</button>
            <button type="button" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="px-3 py-1.5 text-xs rounded-lg text-[#6B7280] disabled:opacity-40" style={{ background: 'rgba(255,255,255,0.04)' }}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FlaggedTableRow({
  id,
  type,
  contentPreview,
  author,
  flaggedBy,
  flagCount,
  status,
  createdAt,
  selected,
  onSelect,
  onDelete,
  onDismiss,
  onSuspendUser,
}: {
  id: string;
  type: ContentType;
  contentPreview: string;
  author: string;
  flaggedBy: string;
  flagCount: number;
  status: FlagStatus;
  createdAt: string;
  selected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onDismiss: (id: string) => void;
  onSuspendUser: (id: string) => void;
}) {
  return (
    <tr
      className="table-row-hover transition"
      style={{
        borderBottom: '1px solid rgba(255,255,255,0.03)',
        borderLeft: status === 'pending' ? '3px solid rgba(239,68,68,0.2)' : undefined,
      }}
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
        <ContentTypePill type={type} />
      </td>
      <td className="px-4 py-[14px] text-[13px] text-[#9CA3AF] max-w-[260px] truncate">{contentPreview}</td>
      <td className="px-4 py-[14px] text-[13px] text-[#9CA3AF]">{author}</td>
      <td className="px-4 py-[14px] text-[13px] text-[#6B7280]">{flaggedBy}</td>
      <td className="px-4 py-[14px] text-center">
        <span className="text-[14px] font-bold text-[#EF4444]">{flagCount}</span>
      </td>
      <td className="px-4 py-[14px] text-center">
        <StatusPill status={status} />
      </td>
      <td className="px-4 py-[14px] text-[13px] text-[#6B7280]">{createdAt}</td>
      <td className="px-4 py-[14px] text-right">
        <div className="flex items-center justify-end gap-[6px]">
          <Link
            to={`/flagged/${id}`}
            className="p-[6px] rounded-[6px] hover:bg-white/[0.06] transition cursor-pointer"
            title="View"
          >
            <Eye className="w-4 h-4 text-[#6B7280]" strokeWidth={1.5} />
          </Link>
          <button
            onClick={() => onDelete(id)}
            className="p-[6px] rounded-[6px] hover:bg-red-500/10 transition cursor-pointer"
            title="Delete"
          >
            <Trash2 className="w-4 h-4 text-[#6B7280]" strokeWidth={1.5} />
          </button>
          <button
            onClick={() => onDismiss(id)}
            className="p-[6px] rounded-[6px] hover:bg-white/[0.06] transition cursor-pointer"
            title="Dismiss"
          >
            <XCircle className="w-4 h-4 text-[#6B7280]" strokeWidth={1.5} />
          </button>
          <button
            onClick={() => onSuspendUser(id)}
            className="p-[6px] rounded-[6px] hover:bg-red-500/10 transition cursor-pointer"
            title="Suspend User"
          >
            <UserX className="w-4 h-4 text-[#6B7280]" strokeWidth={1.5} />
          </button>
        </div>
      </td>
    </tr>
  );
}
