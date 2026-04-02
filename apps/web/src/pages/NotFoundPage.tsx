import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-[#0B0F1A] flex items-center justify-center px-[16px]">
      <div className="text-center">
        <AlertCircle strokeWidth={1.5} className="w-[64px] h-[64px] text-[#ED1C24] mx-auto mb-[24px]" style={{ filter: 'drop-shadow(0 0 20px rgba(237,28,36,0.4))' }} />
        <h1
          className="text-[80px] md:text-[120px] font-bold leading-none mb-[8px]"
          style={{ background: 'linear-gradient(135deg, #ED1C24, #F472B6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
        >
          404
        </h1>
        <h2 className="text-[24px] md:text-[28px] font-bold text-[#F9FAFB] mb-[12px]">Page Not Found</h2>
        <p className="text-[15px] text-[#9CA3AF] mb-[32px] max-w-[400px] mx-auto leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <button
          onClick={() => navigate('/feed')}
          className="inline-flex items-center gap-[8px] px-[28px] py-[12px] rounded-[10px] text-[15px] font-semibold text-white transition cursor-pointer"
          style={{ background: 'linear-gradient(135deg, #ED1C24, #F472B6)' }}
          onMouseOver={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 20px rgba(237, 28, 36, 0.4)'; }}
          onMouseOut={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'; }}
        >
          Back to Feed
        </button>
      </div>
    </main>
  );
}
