import { Link } from 'react-router-dom';
import { LayoutDashboard } from 'lucide-react';

export default function AdminNotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0B0F1A' }}>
      <div className="text-center px-6">
        <p
          className="text-[120px] font-bold leading-none mb-4 select-none"
          style={{
            background: 'linear-gradient(135deg, #ED1C24, #F472B6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          404
        </p>
        <h1 className="text-2xl font-bold text-[#F9FAFB] mb-2">Page Not Found</h1>
        <p className="text-[#6B7280] text-sm mb-8 max-w-sm mx-auto">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-white text-sm font-semibold px-6 py-3 rounded-[10px] transition"
          style={{ background: 'linear-gradient(135deg, #ED1C24, #F472B6)' }}
        >
          <LayoutDashboard className="w-4 h-4" strokeWidth={1.5} />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
