import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Flag, Trash2, XCircle, Calendar } from 'lucide-react';
import { useAdminFlag, useResolveFlag, useDismissFlag } from '../hooks/useAdmin';

export default function AdminFlagDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: flag, isLoading } = useAdminFlag(id ?? '');
  const resolveFlag = useResolveFlag();
  const dismissFlag = useDismissFlag();

  const statusStyles: Record<string, { bg: string; color: string }> = {
    pending: { bg: 'rgba(245,158,11,0.15)', color: '#F59E0B' },
    resolved: { bg: 'rgba(20,184,166,0.15)', color: '#14B8A6' },
    dismissed: { bg: 'rgba(107,114,128,0.15)', color: '#9CA3AF' },
  };

  return (
    <div className="p-6">
      <Link
        to="/flagged"
        className="inline-flex items-center gap-[6px] text-[13px] text-[#6B7280] hover:text-[#F9FAFB] transition cursor-pointer mb-5"
      >
        <ArrowLeft className="w-4 h-4" strokeWidth={1.5} /> Back to Flagged Content
      </Link>

      {isLoading ? (
        <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-[#ED1C24] border-t-transparent rounded-full animate-spin" /></div>
      ) : !flag ? (
        <div className="text-center py-16 text-[#6B7280]">Flag not found</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <article
              className="rounded-[12px] p-6"
              style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span
                  className="px-[10px] py-[3px] rounded-full text-[11px] font-medium capitalize"
                  style={flag.contentType === 'post' ? { background: 'rgba(59,130,246,0.15)', color: '#3B82F6' } : { background: 'rgba(168,85,247,0.15)', color: '#A855F7' }}
                >
                  {flag.contentType}
                </span>
                <span
                  className="px-[10px] py-[3px] rounded-full text-[11px] font-medium capitalize"
                  style={statusStyles[flag.status] ?? statusStyles.pending}
                >
                  {flag.status === 'pending' ? 'Pending Review' : flag.status}
                </span>
              </div>

              <h1 className="text-[18px] font-bold text-[#F9FAFB] leading-tight mb-4">
                Flagged {flag.contentType} — {flag.contentId}
              </h1>

              <div className="rounded-[8px] p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider mb-2">Reason</p>
                <p className="text-sm text-[#9CA3AF]">{flag.reason}</p>
              </div>
            </article>

            <section
              className="rounded-[12px] p-6"
              style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <h2 className="text-[18px] font-bold text-[#F9FAFB] mb-5 flex items-center gap-2">
                <Flag className="w-5 h-5 text-[#EF4444]" strokeWidth={1.5} />
                Flag Details
              </h2>
              <ul className="space-y-3">
                {[
                  { label: 'Content ID', value: flag.contentId },
                  { label: 'Reported By', value: flag.reportedBy },
                  { label: 'Reported At', value: new Date(flag.createdAt).toLocaleDateString() },
                ].map(({ label, value }) => (
                  <li key={label} className="flex items-center justify-between">
                    <span className="text-[13px] text-[#6B7280]">{label}</span>
                    <span className="text-[13px] text-[#9CA3AF]">{value}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className="space-y-6">
            <div
              className="rounded-[12px] p-5"
              style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <h3 className="text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider mb-4">Reporter</h3>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-[44px] h-[44px] rounded-full flex items-center justify-center text-[16px] font-semibold text-white"
                  style={{ background: 'linear-gradient(135deg, #ED1C24, #F472B6)' }}
                >
                  {flag.reportedBy.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-[14px] font-medium text-[#F9FAFB]">{flag.reportedBy}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[12px] text-[#6B7280]">
                <Calendar className="w-[14px] h-[14px]" strokeWidth={1.5} />
                <span>{new Date(flag.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div
              className="rounded-[12px] p-5"
              style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <h3 className="text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider mb-4">Actions</h3>
              <div className="space-y-[10px]">
                <button
                  type="button"
                  onClick={() => id && resolveFlag.mutate(id, { onSuccess: () => navigate('/flagged') })}
                  disabled={resolveFlag.isPending || flag.status === 'resolved'}
                  className="w-full px-4 py-[10px] rounded-[10px] text-[13px] font-medium transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{ background: 'rgba(20,184,166,0.15)', color: '#14B8A6', border: '1px solid rgba(20,184,166,0.3)' }}
                >
                  <Trash2 className="w-4 h-4" strokeWidth={1.5} /> Resolve Flag
                </button>

                <button
                  type="button"
                  onClick={() => id && dismissFlag.mutate(id, { onSuccess: () => navigate('/flagged') })}
                  disabled={dismissFlag.isPending || flag.status === 'dismissed'}
                  className="w-full px-4 py-[10px] rounded-[10px] text-[13px] font-medium transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{ background: 'rgba(255,255,255,0.06)', color: '#F9FAFB', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <XCircle className="w-4 h-4" strokeWidth={1.5} /> Dismiss Flag
                </button>

                <div
                  className="mt-2 p-3 rounded-[8px]"
                  style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.1)' }}
                >
                  <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(248,113,113,0.8)' }}>
                    <strong>Warning:</strong> Resolving removes this flag from the pending queue. Dismissing marks it as not actionable.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
