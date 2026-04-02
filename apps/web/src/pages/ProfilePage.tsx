import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Edit3, Heart, MessageCircle } from 'lucide-react';
import { useAppSelector } from '../hooks/useAppSelector';
import { useUserPosts } from '../hooks/useUser';
import { useCurrentUser } from '../hooks/useAuth';

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function ProfilePage() {
  const user = useAppSelector((s) => s.auth.user);
  const { isLoading: bootstrapLoading } = useCurrentUser();
  const navigate = useNavigate();
  const [page] = useState(1);
  const { data: postsData, isLoading: postsLoading } = useUserPosts(user?.id ?? '', page);

  useEffect(() => {
    if (!bootstrapLoading && !user) {
      navigate('/login');
    }
  }, [bootstrapLoading, user, navigate]);

  const initials = user?.displayName?.charAt(0).toUpperCase() ?? '?';

  if (bootstrapLoading) {
    return (
      <div className="flex justify-center pt-[120px]">
        <div className="w-6 h-6 border-2 border-[#ED1C24] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="pt-[88px] pb-[100px] md:pb-[40px] px-[16px] md:px-[32px] max-w-[720px] mx-auto">

      {/* Profile Header Card */}
      <section
        className="bg-[#111827] rounded-[16px] p-[24px] md:p-[32px]"
        style={{ border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-[20px]">
          {/* Avatar */}
          <div className="w-[96px] h-[96px] rounded-full bg-gradient-to-br from-[#ED1C24] to-[#F472B6] ring-2 ring-[#ED1C24]/30 flex-shrink-0 flex items-center justify-center text-[36px] font-bold text-white overflow-hidden">
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt={user.displayName} className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-[24px] md:text-[28px] font-bold text-[#F9FAFB]">
              {user?.displayName ?? '—'}
            </h1>
            {user?.bio && (
              <p className="text-[14px] text-[#9CA3AF] mt-[6px]">{user.bio}</p>
            )}
            {/* Stats */}
            <div className="flex items-center justify-center sm:justify-start gap-[24px] mt-[16px]">
              <Link to="/profile/following" className="cursor-pointer hover:text-[#F9FAFB] transition">
                <span className="text-[18px] font-bold text-[#F9FAFB]">{user?.followingCount ?? 0}</span>
                <span className="text-[14px] text-[#9CA3AF] ml-[4px]">Following</span>
              </Link>
              <Link to="/profile/followers" className="cursor-pointer hover:text-[#F9FAFB] transition">
                <span className="text-[18px] font-bold text-[#F9FAFB]">{user?.followersCount ?? 0}</span>
                <span className="text-[14px] text-[#9CA3AF] ml-[4px]">Followers</span>
              </Link>
            </div>
            {/* Edit Button */}
            <Link
              to="/profile/edit"
              className="inline-flex items-center gap-[6px] mt-[16px] px-[20px] py-[10px] rounded-[10px] text-[14px] font-medium text-[#F9FAFB] hover:border-[rgba(237,28,36,0.2)] transition cursor-pointer"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <Edit3 strokeWidth={1.5} className="w-[16px] h-[16px]" />
              Edit Profile
            </Link>
          </div>
        </div>
      </section>

      {/* My Posts Section */}
      <section className="mt-[32px]">
        <h2 className="text-[18px] font-bold text-[#F9FAFB] mb-[16px]">My Posts</h2>

        {postsLoading && (
          <div className="flex justify-center py-[40px]">
            <div className="w-6 h-6 border-2 border-[#ED1C24] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!postsLoading && (postsData?.data?.length ?? 0) === 0 && (
          <div className="text-center py-[40px] text-[#6B7280]">
            No posts yet
          </div>
        )}

        {postsData?.data?.map((post) => (
          <article
            key={post.id}
            className="bg-[#111827] rounded-[12px] p-[20px] mb-[12px] hover:border-[rgba(237,28,36,0.2)] transition"
            style={{ border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="flex items-center gap-[12px] mb-[12px]">
              <div className="w-[36px] h-[36px] rounded-full bg-gradient-to-br from-[#ED1C24] to-[#F472B6] flex items-center justify-center text-[14px] font-semibold text-white overflow-hidden flex-shrink-0">
                {post.author.profilePicture ? (
                  <img src={post.author.profilePicture} alt={post.author.displayName} className="w-full h-full object-cover" />
                ) : (
                  post.author.displayName.charAt(0).toUpperCase()
                )}
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
