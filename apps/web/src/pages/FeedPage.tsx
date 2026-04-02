import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageCircle, Heart, TrendingUp } from 'lucide-react';
import { useFeed } from '../hooks/usePost';
import { useCommunities } from '../hooks/useCommunity';
import type { Post, Community } from '../types';

// ---- Helpers ----
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
    'linear-gradient(135deg, #F59E0B, #EF4444)',
    'linear-gradient(135deg, #6366F1, #8B5CF6)',
  ];
  const idx = id.charCodeAt(0) % gradients.length;
  return gradients[idx];
}

// ---- Empty State ----
function EmptyFeed() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center py-[60px] text-center">
      <div className="w-[64px] h-[64px] rounded-full flex items-center justify-center mb-[16px]" style={{ background: 'rgba(237, 28, 36, 0.1)' }}>
        <MessageCircle className="w-[32px] h-[32px]" style={{ color: '#ED1C24' }} strokeWidth={1.5} />
      </div>
      <h3 className="text-[18px] font-bold mb-[8px]" style={{ color: '#F9FAFB' }}>Your feed is empty</h3>
      <p className="text-[14px] mb-[24px]" style={{ color: '#9CA3AF' }}>Join communities to see posts from people who share your interests.</p>
      <button type="button" onClick={() => navigate('/communities')} className="px-[24px] py-[10px] rounded-[10px] text-[14px] font-semibold text-white cursor-pointer transition-all duration-300" style={{ background: 'linear-gradient(135deg, #ED1C24, #F472B6)' }}>
        Discover Communities
      </button>
    </div>
  );
}

// ---- Post Card ----
function PostCard({ post }: { post: Post }) {
  const navigate = useNavigate();
  const gradient = getGradient(post.author.id);
  return (
    <button
      type="button"
      onClick={() => navigate(`/posts/${post.id}`)}
      className="block w-full text-left rounded-[12px] p-5 mb-4 transition cursor-pointer"
      style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(237, 28, 36, 0.2)'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.06)'; }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold text-white overflow-hidden" style={{ background: gradient }}>
          {post.author.profilePicture ? <img src={post.author.profilePicture} alt={post.author.displayName} className="w-full h-full object-cover" /> : post.author.displayName.charAt(0).toUpperCase()}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold" style={{ color: '#F9FAFB' }}>{post.author.displayName}</span>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: 'rgba(20, 184, 166, 0.15)', color: '#14B8A6' }}>{post.community.name}</span>
          <span className="text-xs" style={{ color: '#6B7280' }}>{formatRelativeTime(post.createdAt)}</span>
        </div>
      </div>
      <h3 className="text-[16px] font-bold mb-2" style={{ color: '#F9FAFB' }}>{post.title}</h3>
      <p className="text-sm leading-relaxed line-clamp-2" style={{ color: '#9CA3AF' }}>{post.content}</p>
      <div className="flex items-center gap-5 mt-4" style={{ color: '#6B7280' }}>
        <span className="flex items-center gap-1.5 text-sm"><MessageCircle className="w-4 h-4" strokeWidth={1.5} /> {post.commentsCount}</span>
        <span className="flex items-center gap-1.5 text-sm"><Heart className="w-4 h-4" strokeWidth={1.5} /> {post.likesCount}</span>
      </div>
    </button>
  );
}

// ---- Community Sidebar Item ----
function CommunitySidebarItem({ community }: { community: Community }) {
  return (
    <li>
      <Link to={`/communities/${community.id}`} className="flex items-center gap-3 text-sm transition cursor-pointer" style={{ color: '#9CA3AF' }}>
        <span className="w-8 h-8 rounded-[8px] flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: getGradient(community.id) }}>
          {community.name.charAt(0).toUpperCase()}
        </span>
        {community.name}
      </Link>
    </li>
  );
}

// ---- Main Page ----
export default function FeedPage() {
  const [page] = useState(1);
  const { data: feedData, isLoading: feedLoading } = useFeed(page);
  const { data: joinedData, isLoading: joinedLoading } = useCommunities({ page: 1, limit: 5 });
  const { data: trendingData } = useCommunities({ page: 1, limit: 5, sortBy: 'membersCount', sortOrder: 'DESC' });
  const isLoading = feedLoading || joinedLoading;
  const posts = feedData?.data ?? [];
  const joinedCommunities = joinedData?.data ?? [];
  const trendingCommunities = trendingData?.data ?? [];

  return (
    <div className="flex gap-6 py-6">
      {/* Left Sidebar — My Communities */}
      <aside className="hidden lg:block w-[260px] flex-shrink-0">
        <div className="rounded-[12px] p-5 sticky top-[88px]" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: '#F9FAFB' }}>My Communities</h3>
          {isLoading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-8 rounded-[8px] animate-pulse" style={{ background: 'rgba(255,255,255,0.06)' }} />)}</div>
          ) : joinedCommunities.length > 0 ? (
            <ul className="space-y-3">{joinedCommunities.map(c => <CommunitySidebarItem key={c.id} community={c} />)}</ul>
          ) : (
            <p className="text-sm" style={{ color: '#6B7280' }}>No communities yet.</p>
          )}
          <Link to="/communities" className="block mt-4 text-sm hover:underline cursor-pointer" style={{ color: '#14B8A6' }}>Discover More →</Link>
        </div>
      </aside>

      {/* Center Feed */}
      <section className="flex-1 min-w-0">
        <h2 className="text-[22px] font-bold mb-5" style={{ color: '#F9FAFB' }}>Your Feed</h2>
        {isLoading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="rounded-[12px] p-5 animate-pulse" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
                  <div className="h-4 w-[200px] rounded" style={{ background: 'rgba(255,255,255,0.06)' }} />
                </div>
                <div className="h-5 w-3/4 rounded mb-2" style={{ background: 'rgba(255,255,255,0.06)' }} />
                <div className="h-4 w-full rounded mb-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
              </div>
            ))}
          </div>
        ) : posts.length > 0 ? (
          posts.map(post => <PostCard key={post.id} post={post} />)
        ) : (
          <EmptyFeed />
        )}
      </section>

      {/* Right Sidebar */}
      <aside className="hidden xl:block w-[280px] flex-shrink-0">
        <div className="sticky top-[88px] space-y-5">
          {/* Trending Communities */}
          <div className="rounded-[12px] p-5" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: '#F9FAFB' }}>Trending Communities</h3>
            {trendingCommunities.length > 0 ? (
              <ul className="space-y-3">
                {trendingCommunities.map(c => (
                  <li key={c.id}>
                    <Link to={`/communities/${c.id}`} className="flex items-center justify-between cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-[8px] flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: getGradient(c.id) }}>
                          {c.name.charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <span className="text-sm font-medium transition" style={{ color: '#F9FAFB' }}>{c.name}</span>
                          <p className="text-xs" style={{ color: '#6B7280' }}>{c.membersCount.toLocaleString()} members</p>
                        </div>
                      </div>
                      <TrendingUp className="w-4 h-4" style={{ color: '#14B8A6' }} strokeWidth={1.5} />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm" style={{ color: '#6B7280' }}>No trending communities right now.</p>
            )}
          </div>

          {/* People to Follow — placeholder since we don't have a suggested users endpoint */}
          <div className="rounded-[12px] p-5" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: '#F9FAFB' }}>People to Follow</h3>
            <p className="text-sm" style={{ color: '#6B7280' }}>No suggestions available.</p>
          </div>
        </div>
      </aside>
    </div>
  );
}
