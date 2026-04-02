import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { usePost, useUpdatePost } from '../hooks/usePost';

const TITLE_MAX = 100;
const CONTENT_MAX = 300;

export default function EditPostPage() {
  const { id: postId } = useParams<{ id: string }>();
  const { data: post, isLoading } = usePost(postId ?? '');
  const updatePost = useUpdatePost();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setContent(post.content);
    }
  }, [post]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const backPath = postId ? `/posts/${postId}` : '/feed';

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !postId) return;
    updatePost.mutate({ id: postId, payload: { title, content } });
  };

  const inputStyle: React.CSSProperties = {
    background: '#1F2937',
    border: '1px solid rgba(255,255,255,0.06)',
    color: '#F9FAFB',
    outline: 'none',
    borderRadius: '10px',
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-6 md:py-10">
        <div className="w-full max-w-2xl">
          <div className="rounded-[12px] p-6 md:p-8 animate-pulse" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="h-7 w-[120px] rounded mb-6" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <div className="h-5 w-[160px] rounded mb-5" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <div className="h-10 w-full rounded mb-5" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <div className="h-[160px] w-full rounded" style={{ background: 'rgba(255,255,255,0.06)' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center py-6 md:py-10">
      <div className="w-full max-w-2xl">
        <Link to={backPath} className="inline-flex items-center gap-2 text-sm transition mb-5 cursor-pointer" style={{ color: '#9CA3AF' }}>
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} /> Cancel
        </Link>

        <div className="rounded-[12px] p-6 md:p-8" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h1 className="text-[22px] font-bold mb-6" style={{ color: '#F9FAFB' }}>Edit Post</h1>

          {post && (
            <div className="mb-5">
              <label className="block text-sm font-medium mb-2" style={{ color: '#9CA3AF' }}>Community</label>
              <span className="text-xs font-medium px-3 py-1.5 rounded-full inline-block" style={{ background: 'rgba(20, 184, 166, 0.15)', color: '#14B8A6' }}>
                {post.community.name}
              </span>
            </div>
          )}

          {updatePost.isError && (
            <div className="px-[14px] py-[10px] text-[13px] rounded-[10px] mb-5" style={{ background: 'rgba(237, 28, 36, 0.1)', border: '1px solid rgba(237, 28, 36, 0.3)', color: '#ED1C24' }}>
              {updatePost.error?.message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label htmlFor="post-title" className="block text-sm font-medium mb-2" style={{ color: '#9CA3AF' }}>Title</label>
              <input
                id="post-title"
                type="text"
                maxLength={TITLE_MAX}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full text-sm px-4 py-3"
                style={inputStyle}
              />
              <div className="flex justify-end mt-1">
                <span className="text-xs" style={{ color: '#6B7280' }}>{title.length}/{TITLE_MAX}</span>
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="post-content" className="block text-sm font-medium mb-2" style={{ color: '#9CA3AF' }}>Content</label>
              <textarea
                id="post-content"
                rows={8}
                maxLength={CONTENT_MAX}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                className="w-full text-sm px-4 py-3 resize-none"
                style={inputStyle}
              />
              <div className="flex justify-end mt-1">
                <span className="text-xs" style={{ color: '#6B7280' }}>{content.length}/{CONTENT_MAX}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <Link to={backPath} className="text-sm font-medium px-5 py-2.5 rounded-[8px] cursor-pointer transition hover:opacity-80" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#F9FAFB' }}>
                Cancel
              </Link>
              <button
                type="submit"
                disabled={updatePost.isPending}
                className="text-white text-sm font-semibold px-5 py-2.5 rounded-[8px] cursor-pointer transition disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #ED1C24, #F472B6)' }}
              >
                {updatePost.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
