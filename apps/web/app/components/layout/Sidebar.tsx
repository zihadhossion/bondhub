import { Link } from 'react-router-dom';

interface SidebarCommunity {
  id: string;
  name: string;
  initials: string;
  gradient: string;
}

interface SidebarProps {
  communities?: SidebarCommunity[];
}

export default function Sidebar({ communities }: SidebarProps) {
  const defaultCommunities: SidebarCommunity[] = communities ?? [];

  return (
    <aside className="hidden lg:block w-[260px] flex-shrink-0">
      <div
        className="bg-[#111827] rounded-[12px] p-5 sticky top-[88px]"
        style={{ border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <h3 className="text-sm font-semibold text-[#F9FAFB] mb-4">My Communities</h3>
        {defaultCommunities.length === 0 ? (
          <p className="text-sm text-[#6B7280]">No communities yet.</p>
        ) : (
          <ul className="space-y-3">
            {defaultCommunities.map((c) => (
              <li key={c.id}>
                <Link
                  to={`/communities/${c.id}`}
                  className="flex items-center gap-3 text-sm text-[#9CA3AF] hover:text-[#F9FAFB] transition"
                >
                  <span
                    className={`w-8 h-8 rounded-[8px] ${c.gradient} flex items-center justify-center text-xs font-bold text-white`}
                  >
                    {c.initials}
                  </span>
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
        <Link
          to="/communities"
          className="block mt-4 text-sm text-[#14B8A6] hover:underline"
        >
          Discover More →
        </Link>
      </div>
    </aside>
  );
}
