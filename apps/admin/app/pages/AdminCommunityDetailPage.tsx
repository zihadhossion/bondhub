import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Archive, Trash2, Users, FileText, Flag } from 'lucide-react';
import { useAdminCommunity, useUpdateCommunityStatus, useDeleteAdminCommunity } from '../hooks/useAdmin';

export default function AdminCommunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: community, isLoading } = useAdminCommunity(id ?? '');
  const updateStatus = useUpdateCommunityStatus();
  const deleteCommunity = useDeleteAdminCommunity();

  const handleDelete = () => {
    if (!id) return;
    deleteCommunity.mutate(id, { onSuccess: () => navigate('/communities') });
  };

  return (
    <div className="p-6">
      <Link to="/communities" className="inline-flex items-center gap-2 text-sm text-[#9CA3AF] hover:text-[#F9FAFB] transition cursor-pointer mb-6">
        <ArrowLeft className="w-4 h-4" strokeWidth={1.5} /> Back to Communities
      </Link>

      {isLoading ? (
        <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-[#ED1C24] border-t-transparent rounded-full animate-spin" /></div>
      ) : !community ? (
        <div className="text-center py-16 text-[#6B7280]">Community not found</div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-[12px] flex items-center justify-center text-xl font-bold text-white" style={{ background: 'linear-gradient(135deg, #14B8A6, #06B6D4)' }}>
                {community.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-[22px] font-bold text-[#F9FAFB]">{community.name}</h1>
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: 'rgba(34,197,94,0.15)', color: '#22C55E' }}>Active</span>
                </div>
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full mt-1 inline-block" style={{ background: 'rgba(20,184,166,0.15)', color: '#14B8A6' }}>{typeof community.category === 'object' ? (community.category as {name?: string})?.name : community.category}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => id && updateStatus.mutate({ id, payload: { status: 'archived' } })} className="text-sm font-medium px-4 py-2.5 rounded-[8px] flex items-center gap-2 cursor-pointer transition" style={{ background: 'rgba(255,255,255,0.05)', color: '#9CA3AF', border: '1px solid rgba(255,255,255,0.1)' }}>
                <Archive className="w-4 h-4" strokeWidth={1.5} /> Archive
              </button>
              <button type="button" onClick={handleDelete} disabled={deleteCommunity.isPending} className="text-sm font-medium px-4 py-2.5 rounded-[8px] flex items-center gap-2 cursor-pointer transition disabled:opacity-60" style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)' }}>
                <Trash2 className="w-4 h-4" strokeWidth={1.5} /> Delete
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2 rounded-[12px] p-6" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 className="text-sm font-semibold text-[#6B7280] uppercase tracking-[0.08em] mb-3">About</h3>
              <p className="text-sm text-[#9CA3AF] leading-relaxed mb-5">{community.description ?? 'No description provided.'}</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[#6B7280] mb-1">Slug</p>
                  <p className="text-sm text-[#F9FAFB] font-medium">#{community.slug}</p>
                </div>
                <div>
                  <p className="text-xs text-[#6B7280] mb-1">Created date</p>
                  <p className="text-sm text-[#F9FAFB] font-medium">{new Date(community.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { icon: Users, label: 'Members', value: community.membersCount, color: '#3B82F6', bg: 'rgba(59,130,246,0.15)' },
                { icon: FileText, label: 'Posts', value: community.postsCount, color: '#A855F7', bg: 'rgba(168,85,247,0.15)' },
                { icon: Flag, label: 'Flags', value: 0, color: '#EF4444', bg: 'rgba(239,68,68,0.15)' },
              ].map(({ icon: Icon, label, value, color, bg }) => (
                <div key={label} className="rounded-[12px] p-5 flex items-center gap-4" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: bg }}>
                    <Icon className="w-5 h-5" style={{ color }} strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-[22px] font-bold text-[#F9FAFB] leading-tight">{value}</p>
                    <p className="text-xs text-[#6B7280]">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
