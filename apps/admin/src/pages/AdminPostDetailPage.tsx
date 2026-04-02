import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Flag, MessageSquare, Trash2 } from 'lucide-react';
import { useAdminPost, useDeleteAdminPost } from '../hooks/useAdmin';

export default function AdminPostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: post, isLoading } = useAdminPost(id ?? '');
  const deletePost = useDeleteAdminPost();

  const handleDelete = () => {
    if (!id) return;
    deletePost.mutate(id, { onSuccess: () => navigate('/posts') });
  };

  return (
    <div className="p-6">
      <Link
        to="/posts"
        className="inline-flex items-center gap-[6px] text-[13px] text-[#6B7280] hover:text-[#F9FAFB] transition cursor-pointer mb-5"
      >
        <ArrowLeft className="w-4 h-4" strokeWidth={1.5} /> Back to Posts
      </Link>

      {isLoading ? (
        <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-[#ED1C24] border-t-transparent rounded-full animate-spin" /></div>
      ) : !post ? (
        <div className="text-center py-16 text-[#6B7280]">Post not found</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <article
              className="rounded-[12px] p-6"
              style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: 'rgba(20,184,166,0.15)', color: '#14B8A6' }}>{post.communityName}</span>
              </div>
              <h1 className="text-[20px] font-bold text-[#F9FAFB] mb-4">{post.title}</h1>
              <p className="text-sm text-[#9CA3AF] leading-relaxed whitespace-pre-wrap">{post.content}</p>
            </article>

            <section
              className="rounded-[12px] p-6"
              style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <h2 className="text-[18px] font-bold text-[#F9FAFB] mb-5 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#9CA3AF]" strokeWidth={1.5} />
                Comments ({post.commentsCount})
              </h2>
              <div className="flex flex-col items-center justify-center py-10 text-[#6B7280]">
                <MessageSquare className="w-8 h-8 mb-2 opacity-40" strokeWidth={1.5} />
                <p className="text-sm">View comments in the Comments section</p>
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <div
              className="rounded-[12px] p-5"
              style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <h3 className="text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider mb-4">Post Info</h3>
              <ul className="space-y-3">
                {[
                  { label: 'Author', value: post.authorName },
                  { label: 'Community', value: post.communityName },
                  { label: 'Created At', value: new Date(post.createdAt).toLocaleDateString() },
                  { label: 'Comments', value: String(post.commentsCount) },
                ].map(({ label, value }) => (
                  <li key={label} className="flex items-center justify-between">
                    <span className="text-[13px] text-[#6B7280]">{label}</span>
                    <span className="text-[13px] text-[#9CA3AF]">{value}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div
              className="rounded-[12px] p-5"
              style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <h3 className="text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider mb-4">Actions</h3>
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deletePost.isPending}
                  className="w-full px-4 py-[10px] rounded-[10px] text-[13px] font-medium transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)' }}
                >
                  <Trash2 className="w-4 h-4" strokeWidth={1.5} /> Delete Post
                </button>
                <Link
                  to="/flagged"
                  className="w-full px-4 py-[10px] rounded-[10px] text-[13px] font-medium transition cursor-pointer flex items-center justify-center gap-2"
                  style={{ background: 'rgba(255,255,255,0.06)', color: '#F9FAFB', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <Flag className="w-4 h-4" strokeWidth={1.5} /> View Flags
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
