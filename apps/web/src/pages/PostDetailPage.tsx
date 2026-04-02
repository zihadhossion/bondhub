import { useState, useTransition } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, Flag, MessageCircle } from 'lucide-react';
import { usePost } from '../hooks/usePost';
import { useLikeOptimistic } from '../hooks/usePost';
import { useComments, useCreateComment, useOptimisticComments } from '../hooks/useComment';
import { useFollowUser } from '../hooks/useUser';
import { useCreateFlag } from '../hooks/useFlag';
import { useAppSelector } from '../hooks/useAppSelector';
import type { Post, User, Comment } from '../types';

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function getGradient(id: string): string {
  const gradients = [
    'linear-gradient(135deg, #ED1C24, #F472B6)',
    'linear-gradient(135deg, #3B82F6, #06B6D4)',
    'linear-gradient(135deg, #8B5CF6, #EC4899)',
    'linear-gradient(135deg, #10B981, #14B8A6)',
  ];
  return gradients[id.charCodeAt(0) % gradients.length];
}

function EmptyComments() {
  return (
    <div className="flex flex-col items-center py-[32px] text-center">
      <MessageCircle className="w-[32px] h-[32px] mb-[8px]" style={{ color: '#6B7280' }} strokeWidth={1.5} />
      <p className="text-sm" style={{ color: '#6B7280' }}>No comments yet. Be the first!</p>
    </div>
  );
}

interface PostDetailContentProps {
  post: Post;
  postId: string;
  currentUser: User | null;
}

function PostDetailContent({ post, postId, currentUser }: PostDetailContentProps) {
  const navigate = useNavigate();
  const [commentText, setCommentText] = useState('');
  const [copied, setCopied] = useState(false);
  const [, startCommentTransition] = useTransition();

  const { data: commentsData, isLoading: commentsLoading } = useComments(postId);
  const { mutateAsync: createCommentAsync, isPending: commentPending } = useCreateComment();
  const followUser = useFollowUser();
  const createFlag = useCreateFlag();

  // useOptimistic for like toggle — auto-reverts on error via startTransition
  const { optimisticLiked, toggleLike, isPending: likePending } = useLikeOptimistic(post);

  // useOptimistic for comment list — append/remove without waiting for server
  const { optimisticComments, dispatch } = useOptimisticComments(commentsData?.data ?? []);

  const handlePostComment = () => {
    if (!commentText.trim()) return;
    const body = commentText;
    const temp: Comment = {
      id: `temp-${Date.now()}`,
      content: body,
      author: {
        id: currentUser?.id ?? '',
        displayName: currentUser?.displayName ?? 'You',
        profilePicture: currentUser?.profilePicture,
      },
      postId,
      likesCount: 0,
      createdAt: new Date().toISOString(),
    };

    startCommentTransition(async () => {
      dispatch({ type: 'add', comment: temp });
      setCommentText('');
      await createCommentAsync({ postId, payload: { content: body } });
    });
  };

  const handleFlag = (contentType: 'post' | 'comment', contentId: string) => {
    createFlag.mutate({ contentType, contentId });
  };

  const inputStyle = { background: '#1F2937', border: '1px solid rgba(255,255,255,0.06)', color: '#F9FAFB', outline: 'none' };
  const authorGradient = getGradient(post.author.id);

  return (
    <div className="flex gap-6 py-6">
      {/* Main Column */}
      <section className="flex-1 min-w-0">
        <button type="button" onClick={() => navigate('/feed')} className="inline-flex items-center gap-2 text-sm transition mb-5 cursor-pointer" style={{ color: '#9CA3AF' }}>
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} /> Back to Feed
        </button>

        <article className="rounded-[12px] p-6 md:p-8" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}>
          {/* Community Badge */}
          <Link to={`/communities/${post.community.id}`} className="text-xs font-medium px-3 py-1 rounded-full cursor-pointer inline-block mb-4" style={{ background: 'rgba(20, 184, 166, 0.15)', color: '#14B8A6' }}>
            {post.community.name}
          </Link>

          <h1 className="text-[24px] md:text-[28px] font-bold leading-tight mb-5" style={{ color: '#F9FAFB' }}>{post.title}</h1>

          {/* Author Row */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold text-white overflow-hidden" style={{ background: authorGradient }}>
              {post.author.profilePicture ? <img src={post.author.profilePicture} alt={post.author.displayName} className="w-full h-full object-cover" /> : post.author.displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Link to={`/users/${post.author.id}`} className="text-sm font-semibold" style={{ color: '#F9FAFB' }}>{post.author.displayName}</Link>
                {post.author.id !== currentUser?.id && (
                  <button type="button" onClick={() => followUser.mutate(post.author.id)} className="text-xs font-medium px-2 py-0.5 rounded-[6px] cursor-pointer transition hover:opacity-80" style={{ background: 'rgba(20, 184, 166, 0.15)', color: '#14B8A6' }}>
                    Follow
                  </button>
                )}
              </div>
              <span className="text-xs" style={{ color: '#6B7280' }}>{formatRelativeTime(post.createdAt)}</span>
            </div>
          </div>

          {/* Content */}
          <div className="text-sm leading-relaxed space-y-4 mb-6" style={{ color: '#9CA3AF' }}>
            {post.content.split('\n\n').map((para, idx) => <p key={idx}>{para}</p>)}
          </div>

          {/* Action Bar */}
          <div className="flex items-center gap-4 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <button type="button" onClick={toggleLike} disabled={likePending} className="flex items-center gap-1.5 text-sm transition cursor-pointer disabled:opacity-60" style={{ color: optimisticLiked ? '#ED1C24' : '#6B7280' }}>
              <Heart className="w-4 h-4" strokeWidth={1.5} fill={optimisticLiked ? '#ED1C24' : 'none'} />
              {post.likesCount ?? 0}
            </button>
            <button type="button" onClick={() => { navigator.clipboard?.writeText(window.location.href).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); }} className="flex items-center gap-1.5 text-sm transition cursor-pointer hover:text-[#F9FAFB]" style={{ color: copied ? '#14B8A6' : '#6B7280' }}>
              <Share2 className="w-4 h-4" strokeWidth={1.5} /> {copied ? 'Copied!' : 'Share'}
            </button>
            <button type="button" onClick={() => handleFlag('post', post.id)} className="flex items-center gap-1.5 text-sm transition cursor-pointer hover:text-[#F9FAFB] ml-auto" style={{ color: '#6B7280' }}>
              <Flag className="w-4 h-4" strokeWidth={1.5} /> Report
            </button>
          </div>

          {/* Comments Section */}
          <div className="mt-6">
            <h3 className="text-[16px] font-bold mb-5" style={{ color: '#F9FAFB' }}>
              {commentsData?.total ?? 0} Comment{(commentsData?.total ?? 0) !== 1 ? 's' : ''}
            </h3>

            {/* Comment Input */}
            <div className="flex gap-3 mb-6">
              <div className="w-9 h-9 rounded-full flex-shrink-0" style={{ background: 'linear-gradient(135deg, #ED1C24, #F472B6)' }} />
              <div className="flex-1">
                <textarea rows={3} placeholder="Write a comment..." value={commentText} onChange={(e) => setCommentText(e.target.value)} className="w-full text-sm rounded-[10px] p-3 resize-none" style={{ ...inputStyle, borderRadius: '10px' }} />
                <div className="flex justify-end mt-2">
                  <button type="button" onClick={handlePostComment} disabled={commentPending || !commentText.trim()} className="text-white text-sm font-semibold px-4 py-2 rounded-[8px] cursor-pointer transition disabled:opacity-60 disabled:cursor-not-allowed" style={{ background: 'linear-gradient(135deg, #ED1C24, #F472B6)' }}>
                    {commentPending ? 'Posting...' : 'Post'}
                  </button>
                </div>
              </div>
            </div>

            {/* Comments List — uses optimisticComments so new comments appear instantly */}
            {commentsLoading ? (
              <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-[#ED1C24] border-t-transparent rounded-full animate-spin" /></div>
            ) : optimisticComments.length === 0 ? (
              <EmptyComments />
            ) : (
              optimisticComments.map(comment => (
                <div key={comment.id} className="flex gap-3 mb-5">
                  <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold text-white overflow-hidden" style={{ background: getGradient(comment.author.id) }}>
                    {comment.author.profilePicture ? <img src={comment.author.profilePicture} alt={comment.author.displayName} className="w-full h-full object-cover" /> : comment.author.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold" style={{ color: '#F9FAFB' }}>{comment.author.displayName}</span>
                      <span className="text-xs" style={{ color: '#6B7280' }}>{formatRelativeTime(comment.createdAt)}</span>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: '#9CA3AF' }}>{comment.content}</p>
                    <button type="button" onClick={() => handleFlag('comment', comment.id)} className="flex items-center gap-1 text-xs transition mt-2 cursor-pointer hover:text-[#F9FAFB]" style={{ color: '#6B7280' }}>
                      <Flag className="w-3 h-3" strokeWidth={1.5} /> Report
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>
      </section>

      {/* Right Sidebar — Community Info */}
      <aside className="hidden lg:block w-[280px] flex-shrink-0">
        <div className="sticky top-[88px]">
          <div className="rounded-[12px] p-5" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: '#F9FAFB' }}>Community Info</h3>
            <div className="flex items-center gap-3 mb-3">
              <span className="w-10 h-10 rounded-[8px] flex items-center justify-center text-sm font-bold text-white flex-shrink-0" style={{ background: getGradient(post.community.id) }}>
                {post.community.name.charAt(0).toUpperCase()}
              </span>
              <div>
                <Link to={`/communities/${post.community.id}`} className="text-sm font-semibold transition cursor-pointer hover:text-[#ED1C24]" style={{ color: '#F9FAFB' }}>{post.community.name}</Link>
              </div>
            </div>
            <Link to={`/communities/${post.community.id}`} className="block w-full text-center text-xs font-medium py-2 rounded-[8px] cursor-pointer transition hover:opacity-80" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#F9FAFB' }}>
              View Community
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
}

export default function PostDetailPage() {
  const { id: postId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentUser = useAppSelector((s) => s.auth.user);

  const { data: post, isLoading: postLoading } = usePost(postId ?? '');

  if (postLoading) {
    return (
      <div className="flex gap-6 py-6">
        <section className="flex-1 min-w-0">
          <div className="rounded-[12px] p-6 md:p-8 animate-pulse" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="h-4 w-[120px] rounded mb-4" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <div className="h-8 w-3/4 rounded mb-5" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
              <div className="h-4 w-[160px] rounded" style={{ background: 'rgba(255,255,255,0.06)' }} />
            </div>
            <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-4 rounded" style={{ background: 'rgba(255,255,255,0.06)' }} />)}</div>
          </div>
        </section>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center py-[80px] text-center">
        <p className="text-[18px] font-bold mb-[8px]" style={{ color: '#F9FAFB' }}>Post not found</p>
        <p className="text-sm mb-[24px]" style={{ color: '#9CA3AF' }}>This post may have been removed or doesn't exist.</p>
        <button type="button" onClick={() => navigate('/feed')} className="px-[24px] py-[10px] rounded-[10px] text-[14px] font-semibold text-white cursor-pointer transition-all duration-300" style={{ background: 'linear-gradient(135deg, #ED1C24, #F472B6)' }}>Back to Feed</button>
      </div>
    );
  }

  return <PostDetailContent post={post} postId={postId!} currentUser={currentUser} />;
}
