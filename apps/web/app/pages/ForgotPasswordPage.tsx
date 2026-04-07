import { useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { useForgotPassword } from '../hooks/useAuth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const forgotPasswordMutation = useForgotPassword();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    forgotPasswordMutation.mutate(email);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-[16px] py-[40px]"
      style={{ background: '#0B0F1A' }}
    >
      <div className="w-full max-w-[420px]">
        {/* Logo */}
        <header className="text-center mb-[32px]">
          <Link to="/" className="cursor-pointer">
            <h1
              className="text-[32px] font-bold"
              style={{
                color: '#ED1C24',
                textShadow: '0 0 20px rgba(237, 28, 36, 0.5)',
              }}
            >
              BondHub
            </h1>
          </Link>
        </header>

        {/* Auth Card */}
        <main
          className="rounded-[16px] p-[32px] sm:p-[40px]"
          style={{
            background: '#111827',
            border: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          {/* Key Icon */}
          <div className="flex justify-center mb-[20px]">
            <div
              className="w-[56px] h-[56px] rounded-full flex items-center justify-center"
              style={{ background: 'rgba(20, 184, 166, 0.1)' }}
            >
              <KeyRound className="w-[28px] h-[28px]" style={{ color: '#14B8A6' }} strokeWidth={1.5} />
            </div>
          </div>

          <h2 className="text-[24px] font-bold text-center" style={{ color: '#F9FAFB' }}>
            Reset your password
          </h2>
          <p className="text-[14px] text-center mt-[8px]" style={{ color: '#9CA3AF' }}>
            Enter your email and we'll send a reset link
          </p>

          <form className="mt-[28px] space-y-[20px]" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <div className="relative">
                <span
                  className="absolute left-[14px] top-1/2 -translate-y-1/2"
                  style={{ color: '#6B7280' }}
                >
                  <Mail className="w-[18px] h-[18px]" strokeWidth={1.5} />
                </span>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-[42px] pr-[14px] text-[14px] transition-all duration-200"
                  style={{
                    background: '#1F2937',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '10px',
                    height: '44px',
                    color: '#F9FAFB',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={forgotPasswordMutation.isPending}
              className="w-full h-[44px] rounded-[12px] text-white font-semibold text-[15px] cursor-pointer transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #ED1C24, #F472B6)' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  '0 0 20px rgba(237, 28, 36, 0.4)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
              }}
            >
              {forgotPasswordMutation.isPending ? 'Sending...' : 'Send reset link'}
            </button>
          </form>

          {/* Error message */}
          {forgotPasswordMutation.isError && (
            <div
              className="flex items-center gap-[8px] mt-[20px] px-[14px] py-[10px] text-[13px] rounded-[10px]"
              style={{
                background: 'rgba(237, 28, 36, 0.1)',
                border: '1px solid rgba(237, 28, 36, 0.3)',
                color: '#ED1C24',
              }}
            >
              <AlertCircle className="w-[16px] h-[16px] flex-shrink-0" strokeWidth={1.5} />
              <span>{forgotPasswordMutation.error?.message}</span>
            </div>
          )}

          {/* Success message */}
          {forgotPasswordMutation.isSuccess && (
            <div
              className="flex items-start gap-[8px] mt-[20px] px-[14px] py-[12px] text-[13px] rounded-[10px]"
              style={{
                background: 'rgba(20, 184, 166, 0.1)',
                border: '1px solid rgba(20, 184, 166, 0.3)',
                color: '#14B8A6',
              }}
            >
              <CheckCircle className="w-[16px] h-[16px] flex-shrink-0 mt-[1px]" strokeWidth={1.5} />
              <span>
                If an account exists with that email, you'll receive a password reset link shortly.
              </span>
            </div>
          )}

          {/* Back to login */}
          <div className="mt-[24px] text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-[6px] text-[14px] hover:underline cursor-pointer"
              style={{ color: '#14B8A6' }}
            >
              <ArrowLeft className="w-[16px] h-[16px]" strokeWidth={1.5} />
              Back to login
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
