import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCommunities, useJoinCommunity } from '../hooks/useCommunity';
import { useCategories } from '../hooks/useCategory';
import type { Community } from '../types';

// ---- Helpers ----
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

// ---- Empty State ----
function EmptyCommunities() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-[60px] text-center">
      <div className="w-[64px] h-[64px] rounded-full flex items-center justify-center mb-[16px]" style={{ background: 'rgba(237, 28, 36, 0.1)' }}>
        <Users className="w-[32px] h-[32px]" style={{ color: '#ED1C24' }} strokeWidth={1.5} />
      </div>
      <h3 className="text-[18px] font-bold mb-[8px]" style={{ color: '#F9FAFB' }}>No communities found</h3>
      <p className="text-[14px]" style={{ color: '#9CA3AF' }}>Try a different search term or category.</p>
    </div>
  );
}

// ---- Community Card ----
function CommunityCard({ community, onJoin }: { community: Community; onJoin: (id: string) => void }) {
  return (
    <div
      className="block rounded-[12px] overflow-hidden transition cursor-pointer"
      style={{ background: '#111827', border: community.isJoined ? '1px solid rgba(20, 184, 166, 0.4)' : '1px solid rgba(255,255,255,0.06)' }}
      onMouseEnter={(e) => { if (!community.isJoined) (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(237, 28, 36, 0.2)'; }}
      onMouseLeave={(e) => { if (!community.isJoined) (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.06)'; }}
    >
      <Link to={`/communities/${community.id}`} className="block">
        <div className="h-[40px]" style={{ background: getGradient(community.id) }} />
        <div className="p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[16px] font-bold" style={{ color: '#F9FAFB' }}>{community.name}</h3>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: 'rgba(20, 184, 166, 0.15)', color: '#14B8A6' }}>{typeof community.category === 'object' ? (community.category as {name?: string})?.name : community.category}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs mb-2" style={{ color: '#6B7280' }}>
            <Users className="w-3.5 h-3.5" strokeWidth={1.5} />
            {(community.membersCount ?? 0).toLocaleString()} members
          </div>
          {community.description && (
            <p className="text-sm leading-relaxed mb-4 line-clamp-1" style={{ color: '#9CA3AF' }}>{community.description}</p>
          )}
        </div>
      </Link>
      <div className="px-5 pb-5">
        {community.isJoined ? (
          <span className="text-xs font-semibold" style={{ color: '#14B8A6' }}>Joined ✓</span>
        ) : (
          <button
            type="button"
            onClick={() => onJoin(community.id)}
            className="text-xs font-medium px-4 py-1.5 rounded-[8px] cursor-pointer transition hover:opacity-80"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#F9FAFB' }}
          >
            Join
          </button>
        )}
      </div>
    </div>
  );
}

// ---- Main Page ----
const btnBase: React.CSSProperties = { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#9CA3AF' };

export default function CommunitiesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [page, setPage] = useState(1);

  const { data: categoriesData } = useCategories();
  const categoryNames = ['All', ...(categoriesData?.map(c => c.name) ?? [])];

  const { data: communitiesData, isLoading } = useCommunities({
    q: searchQuery || undefined,
    categoryId: activeCategory !== 'All' ? categoriesData?.find(c => c.name === activeCategory)?.id : undefined,
    page,
    limit: 12,
  });

  const joinCommunity = useJoinCommunity();

  const communities = communitiesData?.data ?? [];
  const totalPages = communitiesData ? Math.ceil(communitiesData.total / 12) : 1;

  return (
    <div className="py-6 md:py-8">
      <h1 className="text-[26px] md:text-[30px] font-bold mb-6" style={{ color: '#F9FAFB' }}>Communities</h1>

      {/* Search Bar */}
      <div className="flex items-center rounded-[10px] px-4 py-3 gap-3 mb-6" style={{ background: '#1F2937', border: '1px solid rgba(255,255,255,0.06)' }}>
        <Search className="w-5 h-5 flex-shrink-0" style={{ color: '#6B7280' }} strokeWidth={1.5} />
        <input
          type="text"
          placeholder="Search communities..."
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
          className="bg-transparent text-sm outline-none w-full"
          style={{ color: '#F9FAFB' }}
        />
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categoryNames.map(cat => (
          <button
            key={cat}
            type="button"
            onClick={() => { setActiveCategory(cat); setPage(1); }}
            className="text-sm font-medium px-4 py-2 rounded-full cursor-pointer transition hover:opacity-80"
            style={activeCategory === cat ? { background: 'linear-gradient(135deg, #ED1C24, #F472B6)', color: 'white' } : btnBase}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Community Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-[12px] overflow-hidden animate-pulse" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="h-[40px]" style={{ background: 'rgba(255,255,255,0.06)' }} />
              <div className="p-5">
                <div className="h-5 w-3/4 rounded mb-2" style={{ background: 'rgba(255,255,255,0.06)' }} />
                <div className="h-3 w-1/2 rounded mb-2" style={{ background: 'rgba(255,255,255,0.06)' }} />
                <div className="h-4 w-full rounded mb-4" style={{ background: 'rgba(255,255,255,0.06)' }} />
                <div className="h-7 w-[60px] rounded" style={{ background: 'rgba(255,255,255,0.06)' }} />
              </div>
            </div>
          ))
        ) : communities.length > 0 ? (
          communities.map(c => <CommunityCard key={c.id} community={c} onJoin={(id) => joinCommunity.mutate(id)} />)
        ) : (
          <EmptyCommunities />
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button type="button" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="text-sm font-medium px-3 py-2 rounded-[8px] cursor-pointer transition hover:opacity-80 disabled:opacity-40" style={btnBase}>
            <ChevronLeft className="w-4 h-4 inline" strokeWidth={1.5} /> Prev
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
            const pageNum = i + 1;
            const isActive = pageNum === page;
            return (
              <button key={pageNum} type="button" onClick={() => setPage(pageNum)} className="text-sm font-medium px-3.5 py-2 rounded-[8px] cursor-pointer transition hover:opacity-80" style={isActive ? { background: 'linear-gradient(135deg, #ED1C24, #F472B6)', color: 'white' } : { ...btnBase, color: '#9CA3AF' }}>
                {pageNum}
              </button>
            );
          })}
          <button type="button" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="text-sm font-medium px-3 py-2 rounded-[8px] cursor-pointer transition hover:opacity-80 disabled:opacity-40" style={btnBase}>
            Next <ChevronRight className="w-4 h-4 inline" strokeWidth={1.5} />
          </button>
        </div>
      )}
    </div>
  );
}
