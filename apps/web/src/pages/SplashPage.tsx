import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function SplashPage() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex items-center justify-center px-[16px]"
      style={{ background: '#0B0F1A' }}
    >
      <main className="flex flex-col items-center text-center">
        {/* Logo */}
        <h1
          className="text-[64px] sm:text-[80px] font-bold leading-tight"
          style={{
            color: '#ED1C24',
            animation: 'pulse-glow 3s ease-in-out infinite, fade-in-up 1s ease-out forwards',
          }}
        >
          BondHub
        </h1>

        {/* Tagline */}
        <p
          className="text-[18px] sm:text-[20px] mt-[16px]"
          style={{
            color: '#9CA3AF',
            animation: 'fade-in-up 1s ease-out 0.3s forwards',
            opacity: 0,
          }}
        >
          Connecting communities, building bonds
        </p>

        {/* Decorative dots */}
        <div
          className="flex items-center gap-[8px] mt-[32px]"
          style={{ animation: 'fade-in-up 1s ease-out 0.3s forwards', opacity: 0 }}
        >
          <span
            className="w-[6px] h-[6px] rounded-full"
            style={{ background: '#ED1C24', opacity: 0.6 }}
          />
          <span
            className="w-[6px] h-[6px] rounded-full"
            style={{ background: '#F472B6', opacity: 0.4 }}
          />
          <span
            className="w-[6px] h-[6px] rounded-full"
            style={{ background: '#14B8A6', opacity: 0.3 }}
          />
        </div>

        {/* Enter Button */}
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="inline-flex items-center gap-[10px] mt-[48px] px-[40px] py-[14px] rounded-[12px] text-white font-semibold text-[16px] transition-all duration-300 cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, #ED1C24, #F472B6)',
            animation: 'fade-in-up 1s ease-out 0.6s forwards',
            opacity: 0,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              '0 0 20px rgba(237, 28, 36, 0.4)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
          }}
        >
          Enter BondHub
          <ArrowRight className="w-[20px] h-[20px]" strokeWidth={1.5} />
        </button>

        {/* Footer text */}
        <p
          className="text-[13px] mt-[48px]"
          style={{
            color: '#6B7280',
            animation: 'fade-in-up 1s ease-out 0.6s forwards',
            opacity: 0,
          }}
        >
          Quality connections over quantity
        </p>
      </main>

      <style>{`
        @keyframes pulse-glow {
          0%, 100% {
            text-shadow: 0 0 20px rgba(237, 28, 36, 0.5), 0 0 40px rgba(237, 28, 36, 0.3);
          }
          50% {
            text-shadow: 0 0 40px rgba(237, 28, 36, 0.8), 0 0 80px rgba(237, 28, 36, 0.5), 0 0 120px rgba(237, 28, 36, 0.3);
          }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
