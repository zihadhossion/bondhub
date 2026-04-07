import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Eye, Ban, Trash2, Users, X, AlertTriangle } from 'lucide-react';
import { useAdminUsers, useUpdateUserStatus, useDeleteAdminUser } from '../hooks/useAdmin';
import type { User } from '../types';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

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

function UserTableRow({
  user,
  selected,
  onSelect,
  onSuspend,
  onDeleteClick,
}: {
  user: User;
  selected: boolean;
  onSelect: (id: string) => void;
  onSuspend: (id: string) => void;
  onDeleteClick: (id: string) => void;
}) {
  return (
    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
      <td className="px-4 py-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onSelect(user.id)}
          className="rounded-sm cursor-pointer"
          style={{ border: '1px solid rgba(255,255,255,0.2)' }}
        />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: 'linear-gradient(135deg, #3B82F6, #06B6D4)' }}>
            {user.displayName.charAt(0).toUpperCase()}
          </div>
          <Link to={`/users/${user.id}`} className="text-sm font-medium text-[#F9FAFB] hover:text-[#ED1C24] transition cursor-pointer">
            {user.displayName}
          </Link>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-[#9CA3AF]">{user.email}</td>
      <td className="px-4 py-3">
        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={user.status === 'active' ? { background: 'rgba(34,197,94,0.15)', color: '#22C55E' } : { background: 'rgba(239,68,68,0.15)', color: '#EF4444' }}>
          {user.status === 'active' ? 'Active' : 'Suspended'}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-[#9CA3AF]">—</td>
      <td className="px-4 py-3 text-sm text-[#9CA3AF]">{user.postsCount}</td>
      <td className="px-4 py-3 text-sm text-[#9CA3AF]">{formatDate(user.createdAt)}</td>
      <td className="px-4 py-3 text-sm text-[#9CA3AF]">—</td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          <Link to={`/users/${user.id}`} className="p-1.5 text-[#6B7280] hover:text-[#F9FAFB] cursor-pointer transition" title="View">
            <Eye className="w-4 h-4" strokeWidth={1.5} />
          </Link>
          <button type="button" onClick={() => onSuspend(user.id)} className="p-1.5 text-[#6B7280] hover:text-yellow-500 cursor-pointer transition" title="Suspend">
            <Ban className="w-4 h-4" strokeWidth={1.5} />
          </button>
          <button type="button" onClick={() => onDeleteClick(user.id)} className="p-1.5 text-[#6B7280] hover:text-red-500 cursor-pointer transition" title="Delete">
            <Trash2 className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const { data: usersData, isLoading } = useAdminUsers({
    page,
    limit: 20,
    search: search || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });

  const updateStatus = useUpdateUserStatus();
  const deleteUser = useDeleteAdminUser();

  const users = usersData?.data ?? [];
  const total = usersData?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  const allSelected = users.length > 0 && users.every((u) => selectedIds.has(u.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(users.map((u) => u.id)));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleSuspend = (id: string) => {
    updateStatus.mutate({ id, payload: { status: 'suspended' } });
  };

  const handleConfirmDelete = () => {
    if (!confirmDeleteId) return;
    deleteUser.mutate(confirmDeleteId, {
      onSuccess: () => {
        setSelectedIds((prev) => { const next = new Set(prev); next.delete(confirmDeleteId); return next; });
        setConfirmDeleteId(null);
      },
    });
  };

  const userToDelete = users.find((u) => u.id === confirmDeleteId);

  return (
    <div className="p-6">
      {confirmDeleteId && (
        <ConfirmModal
          title="Delete User"
          message={`Are you sure you want to delete "${userToDelete?.displayName ?? 'this user'}"? This action cannot be undone.`}
          confirmLabel="Delete User"
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmDeleteId(null)}
          isPending={deleteUser.isPending}
        />
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <h1 className="text-[22px] font-bold text-[#F9FAFB]">Users</h1>
        {selectedIds.size > 0 && (
          <span className="text-sm text-[#9CA3AF]">{selectedIds.size} selected</span>
        )}
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center gap-3 mb-5">
        <div className="flex items-center rounded-[10px] px-3 py-2.5 gap-2 w-full md:w-auto" style={{ background: '#1F2937', border: '1px solid rgba(255,255,255,0.06)' }}>
          <Search className="w-4 h-4 text-[#6B7280]" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="bg-transparent text-sm text-[#F9FAFB] outline-none w-full md:w-[240px] placeholder-[#6B7280]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="text-sm text-[#9CA3AF] rounded-[10px] px-3 py-2.5 outline-none cursor-pointer"
          style={{ background: '#1F2937', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      <div className="rounded-[12px] overflow-hidden" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}>
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
                {['Display Name', 'Email', 'Status', 'Communities', 'Posts', 'Created At', 'Last Login', 'Actions'].map((col, i) => (
                  <th key={col} className={`px-4 py-3 text-[11px] font-semibold text-[#6B7280] uppercase tracking-[0.08em] ${i === 7 ? 'text-right' : 'text-left'}`}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center"><div className="flex justify-center"><div className="w-6 h-6 border-2 border-[#ED1C24] border-t-transparent rounded-full animate-spin" /></div></td></tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-[#6B7280]">
                      <Users className="w-10 h-10 opacity-40" strokeWidth={1.5} />
                      <p className="text-sm">No users found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map(user => (
                  <UserTableRow
                    key={user.id}
                    user={user}
                    selected={selectedIds.has(user.id)}
                    onSelect={toggleSelect}
                    onSuspend={handleSuspend}
                    onDeleteClick={setConfirmDeleteId}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-5 py-3.5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-sm text-[#9CA3AF]">Showing {users.length} of {total} users</p>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1.5 text-xs rounded-lg text-[#6B7280] disabled:opacity-40" style={{ background: 'rgba(255,255,255,0.04)' }}>
              Previous
            </button>
            <button type="button" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="px-3 py-1.5 text-xs rounded-lg text-[#6B7280] disabled:opacity-40" style={{ background: 'rgba(255,255,255,0.04)' }}>
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
