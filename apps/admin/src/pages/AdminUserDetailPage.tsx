import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAdminUser, useUpdateUserStatus } from '../hooks/useAdmin';

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: user, isLoading } = useAdminUser(id ?? '');
  const updateStatus = useUpdateUserStatus();

  const handleSuspend = () => {
    if (!id || !user) return;
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    updateStatus.mutate({ id, payload: { status: newStatus } });
  };

  return (
    <div className="p-6">
      <Link to="/users" className="inline-flex items-center gap-2 text-sm text-[#9CA3AF] hover:text-[#F9FAFB] transition cursor-pointer mb-6">
        <ArrowLeft className="w-4 h-4" strokeWidth={1.5} /> Back to Users
      </Link>

      {isLoading ? (
        <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-[#ED1C24] border-t-transparent rounded-full animate-spin" /></div>
      ) : !user ? (
        <div className="text-center py-16 text-[#6B7280]">User not found</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="rounded-[12px] p-6" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex flex-col items-center text-center">
                <div className="w-[80px] h-[80px] rounded-full flex items-center justify-center text-2xl font-bold text-white mb-4" style={{ background: 'linear-gradient(135deg, #3B82F6, #06B6D4)' }}>
                  {user.displayName.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-lg font-bold text-[#F9FAFB]">{user.displayName}</h2>
                <p className="text-sm text-[#9CA3AF] mt-1">{user.email}</p>
                <span className="text-[11px] font-semibold px-3 py-1 rounded-full mt-3" style={user.status === 'active' ? { background: 'rgba(34,197,94,0.15)', color: '#22C55E' } : { background: 'rgba(239,68,68,0.15)', color: '#EF4444' }}>
                  {user.status === 'active' ? 'Active' : 'Suspended'}
                </span>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleSuspend}
                  disabled={updateStatus.isPending}
                  className="flex-1 text-sm font-medium px-4 py-2.5 rounded-[8px] cursor-pointer transition disabled:opacity-60"
                  style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)' }}
                >
                  {user.status === 'active' ? 'Suspend Account' : 'Restore Account'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Posts Created', value: user.postsCount },
                { label: 'Followers', value: user.followersCount },
                { label: 'Following', value: user.followingCount },
                { label: 'Role', value: user.role },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-[12px] p-4 text-center" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="text-[22px] font-bold text-[#F9FAFB]">{value}</p>
                  <p className="text-xs text-[#6B7280] mt-1">{label}</p>
                </div>
              ))}
            </div>

            <div className="rounded-[12px] p-5" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 className="text-sm font-semibold text-[#F9FAFB] mb-4">Account Info</h3>
              <ul className="space-y-3">
                {[
                  { label: 'User ID', value: user.id },
                  { label: 'Created at', value: new Date(user.createdAt).toLocaleDateString() },
                ].map(({ label, value }) => (
                  <li key={label} className="flex items-center justify-between">
                    <span className="text-sm text-[#6B7280]">{label}</span>
                    <span className="text-sm text-[#9CA3AF] truncate ml-4 max-w-[140px]">{value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {user.bio && (
              <div className="rounded-[12px] p-6" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}>
                <h3 className="text-base font-semibold text-[#F9FAFB] mb-3">Bio</h3>
                <p className="text-sm text-[#9CA3AF]">{user.bio}</p>
              </div>
            )}
            <div className="rounded-[12px] p-6" style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 className="text-base font-semibold text-[#F9FAFB] mb-5">Activity Log</h3>
              <div className="flex flex-col items-center justify-center py-10 text-[#6B7280]">
                <p className="text-sm">No activity recorded yet</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
