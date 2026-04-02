import { useParams, useNavigate, Link } from 'react-router-dom';
import { MessageCircle, Heart, Users, Plus } from 'lucide-react';
import { useCommunity, useCommunityPosts, useCommunityMembers, useJoinOptimistic } from '../hooks/useCommunity';
import type { Community } from '../types';

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
  return gradients[id.charCodeAt(0) % gradients.length];
}

interface CommunityDetailContentProps {
  community: Community;
}

function CommunityDetailContent({ community }: CommunityDetailContentProps) {
  const navigate = useNavigate();

  const { data: postsData, isLoading: postsLoading } = useCommunityPosts(community.id);
  const { data: membersData } = useCommunityMembers(community.id);

  // useOptimistic for join/leave — button toggles instantly, reverts on error
  const { optimisticMember, toggleMembership, isPending } = useJoinOptimistic(
    community.id,
    community.isJoined ?? false,
  );

  const posts = postsData?.data ?? [];
  const members = membersData?.data ?? [];

  return (
    <div className="py-6">
      {/* Community Banner */}
      <div className="relative rounded-[16px] overflow-hidden mb-6" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="h-[8px]" style={{ background: getGradient(community.id) }} />
        <div className="px-6 md:px-8 py-8 md:py-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="w-14 h-14 rounded-[12px] flex items-center justify-center text-xl font-bold text-white flex-shrink-0" style={{ background: getGradient(community.id) }}>
                  {community.name.charAt(0).toUpperCase()}
                </span>
                <div>
                  <h1 className="text-[24px] md:text-[28px] font-bold" style={{ color: '#F9FAFB' }}>{community.name}</h1>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: 'rgba(20, 184, 166, 0.15)', color: '#14B8A6' }}>
                      {typeof community.category === 'object' ? (community.category as {name?: string})?.name : community.category}
                    </span>
                    <span className="flex items-center gap-1 text-xs" style={{ color: '#6B7280' }}>
                      <Users strokeWidth={1.5} className="w-3.5 h-3.5" /> {(community.membersCount ?? 0).toLocaleString()} members
                    </span>
                  </div>
                </div>
              </div>
              {community.description && (
                <p className="text-sm leading-relaxed max-w-xl" style={{ color: '#9CA3AF' }}>{community.description}</p>
              )}
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                type="button"
                onClick={toggleMembership}
                disabled={isPending}
                className="text-sm font-medium px-5 py-2.5 rounded-[8px] cursor-pointer transition hover:opacity-80 disabled:opacity-60"
                style={
                  optimisticMember
                    ? { background: 'rgba(20, 184, 166, 0.15)', border: '1px solid rgba(20, 184, 166, 0.4)', color: '#14B8A6' }
                    : { background: 'linear-gradient(135deg, #ED1C24, #F472B6)', color: '#fff', border: 'none' }
                }
              >
                {optimisticMember ? 'Joined ✓' : 'Join Community'}
              </button>
              <button
                type="button"
                onClick={() => navigate(`/communities/${community.id}/post`)}
                className="text-white text-sm font-semibold px-5 py-2.5 rounded-[8px] flex items-center gap-2 cursor-pointer transition hover:opacity-80"
                style={{ background: 'linear-gradient(135deg, #ED1C24, #F472B6)' }}
              >
                <Plus strokeWidth={1.5} className="w-4 h-4" /> Create Post
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-6 pb-6">
        {/* Post Feed */}
        <section className="flex-1 min-w-0">
          {postsLoading ? (
            <div className="space-y-4">
              {[1,2,3].map(i => <div key={i} className="h-[120px] rounded-[12px] animate-pulse" style={{ background: '#111827' }} />)}
            </div>
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-[60px] text-center rounded-[12px]" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}>
              <MessageCircle className="w-[32px] h-[32px] mb-3" style={{ color: '#6B7280' }} strokeWidth={1.5} />
              <p className="text-sm" style={{ color: '#6B7280' }}>No posts yet. Be the first to post!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map(post => (
                <Link
                  key={post.id}
                  to={`/posts/${post.id}`}
                  className="block rounded-[12px] p-5 transition cursor-pointer"
                  style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(237, 28, 36, 0.2)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.06)'; }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold text-white overflow-hidden" style={{ background: getGradient(post.author.id) }}>
                      {post.author.profilePicture ? <img src={post.author.profilePicture} alt={post.author.displayName} className="w-full h-full object-cover" /> : post.author.displayName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold" style={{ color: '#F9FAFB' }}>{post.author.displayName}</span>
                      <span className="text-xs" style={{ color: '#6B7280' }}>{formatRelativeTime(post.createdAt)}</span>
                    </div>
                  </div>
                  <h3 className="text-[16px] font-bold mb-2" style={{ color: '#F9FAFB' }}>{post.title}</h3>
                  <p className="text-sm leading-relaxed line-clamp-2" style={{ color: '#9CA3AF' }}>{post.content}</p>
                  <div className="flex items-center gap-5 mt-4" style={{ color: '#6B7280' }}>
                    <span className="flex items-center gap-1.5 text-sm"><MessageCircle strokeWidth={1.5} className="w-4 h-4" /> {post.commentsCount}</span>
                    <span className="flex items-center gap-1.5 text-sm"><Heart strokeWidth={1.5} className="w-4 h-4" /> {post.likesCount}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Right Sidebar */}
        <aside className="hidden lg:block w-[280px] flex-shrink-0">
          <div className="sticky top-[88px] space-y-5">
            {/* Community Stats */}
            <div className="rounded-[12px] p-5" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 className="text-sm font-semibold mb-4" style={{ color: '#F9FAFB' }}>Community Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: '#9CA3AF' }}>Members</span>
                  <span className="text-sm font-semibold" style={{ color: '#F9FAFB' }}>{(community.membersCount ?? 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: '#9CA3AF' }}>Posts</span>
                  <span className="text-sm font-semibold" style={{ color: '#F9FAFB' }}>{(community.postsCount ?? 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: '#9CA3AF' }}>Created</span>
                  <span className="text-sm font-semibold" style={{ color: '#F9FAFB' }}>{new Date(community.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>
            </div>

            {/* Active Members */}
            {members.length > 0 && (
              <div className="rounded-[12px] p-5" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}>
                <h3 className="text-sm font-semibold mb-4" style={{ color: '#F9FAFB' }}>Members</h3>
                <div className="space-y-3">
                  {members.slice(0, 5).map(member => (
                    <Link key={member.id} to={`/users/${member.id}`} className="flex items-center gap-3 cursor-pointer group">
                      <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white overflow-hidden" style={{ background: getGradient(member.id) }}>
                        {member.profilePicture ? <img src={member.profilePicture} alt={member.displayName} className="w-full h-full object-cover" /> : member.displayName.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium transition group-hover:text-[#ED1C24]" style={{ color: '#F9FAFB' }}>{member.displayName}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function CommunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: community, isLoading: communityLoading } = useCommunity(id ?? '');

  if (communityLoading) {
    return (
      <div className="animate-pulse py-6">
        <div className="h-[100px] rounded-[16px] mb-6" style={{ background: '#111827' }} />
        <div className="flex gap-6">
          <div className="flex-1 space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-[120px] rounded-[12px]" style={{ background: '#111827' }} />)}
          </div>
          <div className="hidden lg:block w-[280px] space-y-4">
            <div className="h-[160px] rounded-[12px]" style={{ background: '#111827' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="flex flex-col items-center justify-center py-[80px] text-center">
        <p className="text-[18px] font-bold mb-[8px]" style={{ color: '#F9FAFB' }}>Community not found</p>
        <button type="button" onClick={() => navigate('/communities')} className="px-[24px] py-[10px] rounded-[10px] text-[14px] font-semibold text-white cursor-pointer" style={{ background: 'linear-gradient(135deg, #ED1C24, #F472B6)' }}>
          Browse Communities
        </button>
      </div>
    );
  }

  return <CommunityDetailContent community={community} />;
}
