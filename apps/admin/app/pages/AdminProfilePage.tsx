import { User, Mail, Shield, Calendar, Users, FileText, Heart } from 'lucide-react';
import { useAppSelector } from '../hooks/useAppSelector';

export default function AdminProfilePage() {
  const user = useAppSelector((s) => s.auth.user);

  if (!user) return null;

  const joined = new Date(user.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const stats = [
    { label: 'Posts', value: user.postsCount, Icon: FileText, color: '#C084FC', bg: 'rgba(168,85,247,0.15)' },
    { label: 'Followers', value: user.followersCount, Icon: Users, color: '#60A5FA', bg: 'rgba(59,130,246,0.15)' },
    { label: 'Following', value: user.followingCount, Icon: Heart, color: '#F472B6', bg: 'rgba(244,114,182,0.15)' },
  ];

  return (
    <div className="p-6 min-h-screen max-w-2xl">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#F9FAFB]">My Profile</h1>
        <p className="text-sm mt-1 text-[#9CA3AF]">Your admin account information</p>
      </div>

      {/* Profile card */}
      <div
        className="rounded-[16px] p-6 mb-6"
        style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* Avatar + name */}
        <div className="flex items-center gap-5 mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#ED1C24] to-[#F472B6] flex items-center justify-center text-2xl font-bold text-white overflow-hidden flex-shrink-0">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.displayName} className="w-full h-full object-cover" />
            ) : (
              user.displayName?.[0]?.toUpperCase() ?? 'A'
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#F9FAFB]">{user.displayName}</h2>
            <span className="inline-block mt-1 text-xs font-semibold px-3 py-1 rounded-full bg-[rgba(237,28,36,0.15)] text-[#ED1C24]">
              Admin
            </span>
          </div>
        </div>

        {/* Info rows */}
        <div className="flex flex-col gap-3">
          <InfoRow Icon={Mail} label="Email" value={user.email} />
          <InfoRow Icon={Shield} label="Role" value={user.role.charAt(0).toUpperCase() + user.role.slice(1)} />
          <InfoRow
            Icon={User}
            label="Status"
            value={
              <span
                className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  user.status === 'active'
                    ? 'bg-[rgba(34,197,94,0.15)] text-[#4ADE80]'
                    : 'bg-[rgba(239,68,68,0.15)] text-[#F87171]'
                }`}
              >
                {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
              </span>
            }
          />
          {user.bio && <InfoRow Icon={FileText} label="Bio" value={user.bio} />}
          <InfoRow Icon={Calendar} label="Joined" value={joined} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map(({ label, value, Icon, color, bg }) => (
          <div
            key={label}
            className="rounded-[12px] p-4 flex flex-col items-center gap-2"
            style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: bg }}>
              <Icon className="w-4 h-4" strokeWidth={1.5} style={{ color }} />
            </div>
            <span className="text-xl font-bold text-[#F9FAFB]">{value}</span>
            <span className="text-xs text-[#6B7280]">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function InfoRow({
  Icon,
  label,
  value,
}: {
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number; style?: React.CSSProperties }>;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div
      className="flex items-center gap-3 py-3"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
    >
      <Icon className="w-4 h-4 text-[#6B7280] flex-shrink-0" strokeWidth={1.5} />
      <span className="text-sm text-[#6B7280] w-[80px] flex-shrink-0">{label}</span>
      <span className="text-sm text-[#F9FAFB]">{value}</span>
    </div>
  );
}
