import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import { useAppSelector } from '../hooks/useAppSelector';
import { useFollowers, useFollowUser } from '../hooks/useUser';

function getGradient(id: string): string {
  const gradients = [
    'linear-gradient(135deg, #ED1C24, #F472B6)',
    'linear-gradient(135deg, #3B82F6, #06B6D4)',
    'linear-gradient(135deg, #8B5CF6, #EC4899)',
    'linear-gradient(135deg, #10B981, #14B8A6)',
  ];
  return gradients[id.charCodeAt(0) % gradients.length];
}

export default function FollowersPage() {
  const navigate = useNavigate();
  const currentUserId = useAppSelector((s) => s.auth.user?.id ?? '');
  const [search, setSearch] = useState('');

  const { data: followersData, isLoading } = useFollowers(currentUserId);
  const followUser = useFollowUser();

  const followers = followersData?.data ?? [];
  const filtered = followers.filter(u =>
    u.displayName.toLowerCase().includes(search.toLowerCase()) ||
    (u.bio ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="pt-[88px] pb-[100px] md:pb-[40px] px-[16px] md:px-[32px] max-w-[600px] mx-auto">
      <div className="flex items-center gap-[12px] mb-[20px]">
        <button type="button" onClick={() => navigate('/profile')} className="p-[8px] rounded-[10px] hover:bg-white/[0.06] transition cursor-pointer">
          <ArrowLeft strokeWidth={1.5} className="w-[20px] h-[20px] text-[#9CA3AF]" />
        </button>
        <h1 className="text-[24px] font-bold text-[#F9FAFB]">Followers</h1>
        <span className="text-[13px] font-semibold px-[10px] py-[2px] rounded-full" style={{ background: 'rgba(237, 28, 36, 0.2)', color: '#ED1C24' }}>
          {followersData?.total ?? 0}
        </span>
      </div>

      <div className="relative mb-[16px]">
        <input
          type="text"
          placeholder="Search followers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#1F2937] rounded-[10px] px-[14px] py-[12px] pl-[40px] text-[14px] text-[#F9FAFB] placeholder-[#6B7280] focus:outline-none transition"
          style={{ border: '1px solid rgba(255,255,255,0.06)' }}
        />
        <Search strokeWidth={1.5} className="absolute left-[12px] top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#6B7280]" />
      </div>

      {isLoading ? (
        <div className="space-y-[8px]">
          {[1,2,3].map(i => <div key={i} className="h-[72px] rounded-[12px] animate-pulse" style={{ background: '#111827' }} />)}
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-[8px]">
          {filtered.map((follower) => (
            <div key={follower.id} className="bg-[#111827] rounded-[12px] p-[16px] flex items-center gap-[12px] transition" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="w-[40px] h-[40px] rounded-full flex-shrink-0 flex items-center justify-center text-[16px] font-semibold text-white overflow-hidden" style={{ background: getGradient(follower.id) }}>
                {follower.profilePicture ? <img src={follower.profilePicture} alt={follower.displayName} className="w-full h-full object-cover" /> : follower.displayName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <Link to={`/users/${follower.id}`} className="text-[14px] font-semibold text-[#F9FAFB] hover:text-[#ED1C24] transition cursor-pointer">
                  {follower.displayName}
                </Link>
                {follower.bio && <p className="text-[12px] text-[#6B7280] truncate">{follower.bio}</p>}
              </div>
              {follower.id !== currentUserId && (
                <button
                  type="button"
                  onClick={() => {
                    // If current user follows this follower back, unfollow; otherwise follow
                    followUser.mutate(follower.id);
                  }}
                  className="flex-shrink-0 px-[16px] py-[6px] rounded-[8px] text-[13px] font-medium transition cursor-pointer hover:opacity-80"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#F9FAFB' }}
                >
                  Follow
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-[48px]">
          <p className="text-[16px] text-[#9CA3AF]">{search ? 'No results found' : 'No followers yet'}</p>
        </div>
      )}
    </main>
  );
}
