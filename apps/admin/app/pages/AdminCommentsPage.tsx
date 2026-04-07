import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Eye, Trash2, MessageSquare } from 'lucide-react';
import { useAdminComments, useDeleteAdminComment } from '../hooks/useAdmin';

export default function AdminCommentsPage() {
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);

  const { data: commentsData, isLoading } = useAdminComments({ page, limit: 20, search: search || undefined });
  const deleteComment = useDeleteAdminComment();

  const allComments = commentsData?.data ?? [];
  const comments = allComments.filter(c => {
    const ts = new Date(c.createdAt).getTime();
    if (dateFrom && ts < new Date(dateFrom).getTime()) return false;
    if (dateTo && ts > new Date(dateTo + 'T23:59:59').getTime()) return false;
    return true;
  });
  const total = commentsData?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[24px] font-bold text-[#F9FAFB]">Comments</h1>
          <p className="text-[14px] text-[#6B7280] mt-1">Manage all comments across posts</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px] max-w-[320px]">
          <input
            type="text"
            placeholder="Search by content or author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-[10px] px-3 py-[9px] pl-9 text-[13px] text-[#F9FAFB] placeholder-[#6B7280] outline-none transition"
            style={{ background: '#1F2937', border: '1px solid rgba(255,255,255,0.06)' }}
          />
          <Search className="absolute left-[10px] top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" strokeWidth={1.5} />
        </div>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="rounded-[10px] px-3 py-[9px] text-[13px] text-[#9CA3AF] outline-none cursor-pointer"
          style={{ background: '#1F2937', border: '1px solid rgba(255,255,255,0.06)' }}
        />
        <span className="text-[13px] text-[#6B7280]">to</span>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="rounded-[10px] px-3 py-[9px] text-[13px] text-[#9CA3AF] outline-none cursor-pointer"
          style={{ background: '#1F2937', border: '1px solid rgba(255,255,255,0.06)' }}
        />
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
                    className="w-4 h-4 rounded-[4px] cursor-pointer"
                    style={{ border: '1px solid rgba(255,255,255,0.1)', accentColor: '#ED1C24' }}
                    onChange={() => {}}
                  />
                </th>
                {['Comment Content', 'Author', 'Post Title', 'Created At', 'Actions'].map((col, i) => (
                  <th
                    key={col}
                    className={`px-4 py-3 text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider ${
                      i === 4 ? 'text-right' : 'text-left'
                    }`}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center"><div className="flex justify-center"><div className="w-6 h-6 border-2 border-[#ED1C24] border-t-transparent rounded-full animate-spin" /></div></td></tr>
              ) : comments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-[#6B7280]">
                      <MessageSquare className="w-10 h-10 opacity-40" strokeWidth={1.5} />
                      <p className="text-sm">No comments found</p>
                      <p className="text-xs">Comments will appear here once users start engaging with posts</p>
                    </div>
                  </td>
                </tr>
              ) : (
                comments.map(c => (
                  <CommentTableRow
                    key={c.id}
                    id={c.id}
                    content={c.content}
                    author={c.authorName}
                    postTitle={c.postTitle}
                    postId={c.postId}
                    createdAt={new Date(c.createdAt).toLocaleDateString()}
                    onView={() => {}}
                    onDelete={(id) => deleteComment.mutate(id)}
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
          <p className="text-sm text-[#9CA3AF]">Showing {comments.length} of {total} comments</p>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1.5 text-xs rounded-lg text-[#6B7280] disabled:opacity-40" style={{ background: 'rgba(255,255,255,0.04)' }}>Previous</button>
            <button type="button" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="px-3 py-1.5 text-xs rounded-lg text-[#6B7280] disabled:opacity-40" style={{ background: 'rgba(255,255,255,0.04)' }}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CommentTableRow({
  id,
  content,
  author,
  postTitle,
  postId,
  createdAt,
  onView,
  onDelete,
}: {
  id: string;
  content: string;
  author: string;
  postTitle: string;
  postId: string;
  createdAt: string;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <tr
      className="table-row-hover transition"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
    >
      <td className="px-4 py-[14px]">
        <input
          type="checkbox"
          className="w-4 h-4 rounded-[4px] cursor-pointer"
          style={{ border: '1px solid rgba(255,255,255,0.1)', accentColor: '#ED1C24' }}
          onChange={() => {}}
        />
      </td>
      <td className="px-4 py-[14px] text-[13px] text-[#9CA3AF] max-w-[300px] truncate">{content}</td>
      <td className="px-4 py-[14px] text-[13px] text-[#9CA3AF]">{author}</td>
      <td className="px-4 py-[14px]">
        <Link
          to={`/posts/${postId}`}
          className="text-[13px] text-[#14B8A6] hover:underline cursor-pointer"
        >
          {postTitle}
        </Link>
      </td>
      <td className="px-4 py-[14px] text-[13px] text-[#6B7280]">{createdAt}</td>
      <td className="px-4 py-[14px] text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onView(id)}
            className="p-[6px] rounded-[6px] hover:bg-white/[0.06] transition cursor-pointer"
            title="View"
          >
            <Eye className="w-4 h-4 text-[#6B7280]" strokeWidth={1.5} />
          </button>
          <button
            onClick={() => onDelete(id)}
            className="p-[6px] rounded-[6px] hover:bg-red-500/10 transition cursor-pointer"
            title="Delete"
          >
            <Trash2 className="w-4 h-4 text-[#6B7280]" strokeWidth={1.5} />
          </button>
        </div>
      </td>
    </tr>
  );
}
