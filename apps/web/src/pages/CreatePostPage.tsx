import { useState } from 'react';
import type { FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCommunity } from '../hooks/useCommunity';
import { useCreatePost } from '../hooks/usePost';

export default function CreatePostPage() {
  const { id: communityId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const { data: community } = useCommunity(communityId ?? '');
  const createPost = useCreatePost();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !communityId) return;
    createPost.mutate({ communityId, title, content });
  };

  return (
    <main className="pt-[64px] max-w-[1280px] mx-auto px-4 md:px-6">
      <div className="flex justify-center py-6 md:py-10">
        <div className="w-full max-w-2xl">

          {/* Heading */}
          <h1 className="text-[22px] md:text-[26px] font-bold text-[#F9FAFB] mb-2">Create Post</h1>
          <p className="text-sm text-[#9CA3AF] mb-6 flex items-center gap-2">
            Posting in{' '}
            {community ? (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: 'rgba(20, 184, 166, 0.15)', color: '#14B8A6' }}>
                {community.name}
              </span>
            ) : (
              <span className="w-[100px] h-[20px] rounded animate-pulse inline-block" style={{ background: 'rgba(255,255,255,0.06)' }} />
            )}
          </p>

          {createPost.isError && (
            <div className="px-[14px] py-[10px] text-[13px] rounded-[10px] mb-5" style={{ background: 'rgba(237, 28, 36, 0.1)', border: '1px solid rgba(237, 28, 36, 0.3)', color: '#ED1C24' }}>
              {createPost.error?.message}
            </div>
          )}

          {/* Form Card */}
          <div className="bg-[#111827] rounded-[12px] p-6 md:p-8" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
            <form onSubmit={handleSubmit}>

              {/* Title Input */}
              <div className="mb-5">
                <label htmlFor="post-title" className="block text-sm font-medium text-[#9CA3AF] mb-2">
                  Title
                </label>
                <input
                  id="post-title"
                  type="text"
                  maxLength={100}
                  placeholder="Give your post a title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#1F2937] text-sm text-[#F9FAFB] rounded-[10px] px-4 py-3 outline-none placeholder-[#6B7280] transition focus:ring-1 focus:ring-[#ED1C24]"
                  style={{ border: '1px solid rgba(255,255,255,0.06)' }}
                />
                <div className="flex justify-end mt-1">
                  <span className="text-xs text-[#6B7280]">{title.length}/100</span>
                </div>
              </div>

              {/* Content Textarea */}
              <div className="mb-6">
                <label htmlFor="post-content" className="block text-sm font-medium text-[#9CA3AF] mb-2">
                  Content
                </label>
                <textarea
                  id="post-content"
                  rows={8}
                  maxLength={300}
                  placeholder="Share your thoughts, experiences, or questions..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-[#1F2937] text-sm text-[#F9FAFB] rounded-[10px] px-4 py-3 outline-none resize-none placeholder-[#6B7280] transition focus:ring-1 focus:ring-[#ED1C24]"
                  style={{ border: '1px solid rgba(255,255,255,0.06)' }}
                />
                <div className="flex justify-end mt-1">
                  <span className="text-xs text-[#6B7280]">{content.length}/300</span>
                </div>
              </div>

              {/* Button Row */}
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="text-sm font-medium px-5 py-2.5 rounded-[8px] cursor-pointer transition hover:opacity-80"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#F9FAFB' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createPost.isPending || !title.trim() || !content.trim()}
                  className="text-white text-sm font-semibold px-5 py-2.5 rounded-[8px] cursor-pointer transition disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(135deg, #ED1C24, #F472B6)' }}
                >
                  {createPost.isPending ? 'Submitting...' : 'Submit Post'}
                </button>
              </div>

            </form>
          </div>

        </div>
      </div>
    </main>
  );
}
