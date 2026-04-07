import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, Heart, MessageCircle } from 'lucide-react';
import { useAppSelector } from '../hooks/useAppSelector';
import { useUserProfile, useUserPosts, useFollowUser, useUnfollowUser } from '../hooks/useUser';

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

export default function UserProfilePage() {
  const { id: userId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentUserId = useAppSelector((s) => s.auth.user?.id);
  const [page] = useState(1);

  const { data: profile, isLoading: profileLoading } = useUserProfile(userId ?? '');
  const { data: postsData, isLoading: postsLoading } = useUserPosts(userId ?? '', page);
  const followUser = useFollowUser();
  const unfollowUser = useUnfollowUser();

  // Redirect to own profile if viewing self
  if (userId && currentUserId && userId === currentUserId) {
    navigate('/profile', { replace: true });
    return null;
  }

  // postsData is PaginatedResponse<Post> — extract the array from .data
  const posts = postsData?.data ?? [];

  if (profileLoading) {
    return (
      <main className="pt-[88px] pb-[100px] md:pb-[40px] px-[16px] md:px-[32px] max-w-[720px] mx-auto">
        <div className="bg-[#111827] rounded-[16px] p-[24px] md:p-[32px] animate-pulse" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex gap-[20px]">
            <div className="w-[96px] h-[96px] rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <div className="flex-1">
              <div className="h-7 w-[200px] rounded mb-3" style={{ background: 'rgba(255,255,255,0.06)' }} />
              <div className="h-4 w-[300px] rounded mb-4" style={{ background: 'rgba(255,255,255,0.06)' }} />
              <div className="h-8 w-[120px] rounded" style={{ background: 'rgba(255,255,255,0.06)' }} />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="pt-[88px] pb-[100px] px-[16px] max-w-[720px] mx-auto">
        <div className="text-center py-[60px]">
          <p className="text-[18px] font-bold text-[#F9FAFB] mb-2">User not found</p>
          <button type="button" onClick={() => navigate(-1)} className="text-sm text-[#14B8A6] hover:underline cursor-pointer">Go back</button>
        </div>
      </main>
    );
  }


  return (
    <main className="pt-[88px] pb-[100px] md:pb-[40px] px-[16px] md:px-[32px] max-w-[720px] mx-auto">
      <button type="button" onClick={() => navigate(-1)} className="inline-flex items-center gap-[6px] text-[#9CA3AF] hover:text-[#F9FAFB] transition cursor-pointer mb-[16px]">
        <ArrowLeft strokeWidth={1.5} className="w-[18px] h-[18px]" />
        <span className="text-[14px]">Back</span>
      </button>

      {/* Profile Header */}
      <section className="bg-[#111827] rounded-[16px] p-[24px] md:p-[32px]" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-[20px]">
          <div className="w-[96px] h-[96px] rounded-full flex-shrink-0 flex items-center justify-center text-[36px] font-bold text-white overflow-hidden" style={{ background: getGradient(profile.id) }}>
            {profile.profilePicture ? <img src={profile.profilePicture} alt={profile.displayName} className="w-full h-full object-cover" /> : profile.displayName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-[24px] md:text-[28px] font-bold text-[#F9FAFB]">{profile.displayName}</h1>
            {profile.bio && <p className="text-[14px] text-[#9CA3AF] mt-[6px]">{profile.bio}</p>}
            <div className="flex items-center justify-center sm:justify-start gap-[24px] mt-[16px]">
              <div>
                <span className="text-[18px] font-bold text-[#F9FAFB]">{profile.followingCount}</span>
                <span className="text-[14px] text-[#9CA3AF] ml-[4px]">Following</span>
              </div>
              <div>
                <span className="text-[18px] font-bold text-[#F9FAFB]">{profile.followersCount}</span>
                <span className="text-[14px] text-[#9CA3AF] ml-[4px]">Followers</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => followUser.mutate(profile.id)}
              disabled={followUser.isPending || unfollowUser.isPending}
              className="mt-[16px] px-[24px] py-[10px] rounded-[10px] text-[14px] font-semibold text-white transition cursor-pointer inline-flex items-center gap-[6px] disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #ED1C24, #F472B6)' }}
            >
              <UserPlus strokeWidth={1.5} className="w-[16px] h-[16px]" />
              Follow
            </button>
          </div>
        </div>
      </section>

      {/* Posts Section */}
      <section className="mt-[32px]">
        <h2 className="text-[18px] font-bold text-[#F9FAFB] mb-[16px]">Posts</h2>

        {postsLoading && (
          <div className="flex justify-center py-[40px]">
            <div className="w-6 h-6 border-2 border-[#ED1C24] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!postsLoading && posts.length === 0 && (
          <div className="text-center py-[40px] text-[#6B7280]">No posts yet</div>
        )}

        {posts.map((post) => (
          <article key={post.id} className="bg-[#111827] rounded-[12px] p-[20px] mb-[12px] hover:border-[rgba(237,28,36,0.2)] transition" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-[12px] mb-[12px]">
              <div className="w-[36px] h-[36px] rounded-full flex-shrink-0 flex items-center justify-center text-[14px] font-semibold text-white overflow-hidden" style={{ background: getGradient(post.author.id) }}>
                {post.author.profilePicture ? <img src={post.author.profilePicture} alt={post.author.displayName} className="w-full h-full object-cover" /> : post.author.displayName.charAt(0).toUpperCase()}
              </div>
              <div>
                <span className="text-[14px] font-semibold text-[#F9FAFB]">{post.author.displayName}</span>
                <span className="text-[12px] text-[#6B7280] ml-[8px]">in</span>
                <Link to={`/communities/${post.community.id}`} className="text-[12px] text-[#14B8A6] hover:underline cursor-pointer ml-[4px]">
                  {post.community.name}
                </Link>
              </div>
              <span className="text-[12px] text-[#6B7280] ml-auto">{formatRelativeTime(post.createdAt)}</span>
            </div>
            <Link to={`/posts/${post.id}`} className="block cursor-pointer">
              <h3 className="text-[16px] font-semibold text-[#F9FAFB] mb-[8px] hover:text-[#ED1C24] transition">{post.title}</h3>
              <p className="text-[14px] text-[#9CA3AF] leading-relaxed line-clamp-2">{post.content}</p>
            </Link>
            <div className="flex items-center gap-[16px] mt-[14px] pt-[14px]" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-[4px] text-[#6B7280] ml-auto">
                <Heart strokeWidth={1.5} className="w-[16px] h-[16px]" />
                <span className="text-[12px]">{post.likesCount}</span>
              </div>
              <div className="flex items-center gap-[4px] text-[#6B7280]">
                <MessageCircle strokeWidth={1.5} className="w-[16px] h-[16px]" />
                <span className="text-[12px]">{post.commentsCount}</span>
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
