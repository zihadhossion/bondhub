import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowLeft, AlertCircle } from 'lucide-react';
import { useResetPassword } from '../hooks/useAuth';

type StrengthLevel = 0 | 1 | 2 | 3 | 4;

function getStrength(pw: string): StrengthLevel {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score as StrengthLevel;
}

const STRENGTH_COLORS: Record<number, string> = {
  1: '#EF4444',
  2: '#F59E0B',
  3: '#14B8A6',
  4: '#22C55E',
};
const STRENGTH_LABELS: Record<number, string> = {
  1: 'Weak',
  2: 'Fair',
  3: 'Good',
  4: 'Strong',
};

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const resetPasswordMutation = useResetPassword();

  const strength = getStrength(newPassword);
  const strengthColor = newPassword.length === 0 ? 'rgba(255,255,255,0.08)' : STRENGTH_COLORS[strength] ?? '#EF4444';
  const strengthLabel =
    newPassword.length === 0
      ? 'Enter a password'
      : STRENGTH_LABELS[strength] ?? 'Too short';
  const strengthLabelColor = newPassword.length === 0 ? '#6B7280' : (STRENGTH_COLORS[strength] ?? '#EF4444');

  const passwordsMatch = confirmPassword.length > 0 && newPassword === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return;
    resetPasswordMutation.mutate({ token, newPassword });
  };

  const inputStyle = {
    background: '#1F2937',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '10px',
    height: '44px',
    color: '#F9FAFB',
    outline: 'none',
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
          {/* Lock Icon */}
          <div className="flex justify-center mb-[20px]">
            <div
              className="w-[56px] h-[56px] rounded-full flex items-center justify-center"
              style={{ background: 'rgba(20, 184, 166, 0.1)' }}
            >
              <Lock className="w-[28px] h-[28px]" style={{ color: '#14B8A6' }} strokeWidth={1.5} />
            </div>
          </div>

          <h2 className="text-[24px] font-bold text-center" style={{ color: '#F9FAFB' }}>
            Set new password
          </h2>
          <p className="text-[14px] text-center mt-[8px]" style={{ color: '#9CA3AF' }}>
            Choose a strong password to secure your account
          </p>

          <form className="mt-[28px] space-y-[20px]" onSubmit={handleSubmit}>
            {/* New Password */}
            <div>
              <label
                htmlFor="newPassword"
                className="block text-[13px] mb-[6px]"
                style={{ color: '#9CA3AF' }}
              >
                New password
              </label>
              <div className="relative">
                <span
                  className="absolute left-[14px] top-1/2 -translate-y-1/2"
                  style={{ color: '#6B7280' }}
                >
                  <Lock className="w-[18px] h-[18px]" strokeWidth={1.5} />
                </span>
                <input
                  type={showNew ? 'text' : 'password'}
                  id="newPassword"
                  name="newPassword"
                  placeholder="Min 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={8}
                  required
                  className="w-full pl-[42px] pr-[44px] text-[14px] transition-all duration-200"
                  style={inputStyle}
                />
                <button
                  type="button"
                  onClick={() => setShowNew((prev) => !prev)}
                  className="absolute right-[14px] top-1/2 -translate-y-1/2 transition-colors cursor-pointer"
                  style={{ color: '#6B7280' }}
                  aria-label="Toggle new password visibility"
                >
                  {showNew ? (
                    <EyeOff className="w-[18px] h-[18px]" strokeWidth={1.5} />
                  ) : (
                    <Eye className="w-[18px] h-[18px]" strokeWidth={1.5} />
                  )}
                </button>
              </div>

              {/* Password Strength Indicator */}
              <div className="mt-[10px]">
                <div className="flex gap-[4px]">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="flex-1"
                      style={{
                        height: '4px',
                        borderRadius: '2px',
                        background:
                          newPassword.length > 0 && i <= strength
                            ? strengthColor
                            : 'rgba(255,255,255,0.08)',
                        transition: 'all 0.3s ease',
                      }}
                    />
                  ))}
                </div>
                <p className="text-[12px] mt-[6px]" style={{ color: strengthLabelColor }}>
                  {strengthLabel}
                </p>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-[13px] mb-[6px]"
                style={{ color: '#9CA3AF' }}
              >
                Confirm password
              </label>
              <div className="relative">
                <span
                  className="absolute left-[14px] top-1/2 -translate-y-1/2"
                  style={{ color: '#6B7280' }}
                >
                  <Lock className="w-[18px] h-[18px]" strokeWidth={1.5} />
                </span>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full pl-[42px] pr-[44px] text-[14px] transition-all duration-200"
                  style={inputStyle}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((prev) => !prev)}
                  className="absolute right-[14px] top-1/2 -translate-y-1/2 transition-colors cursor-pointer"
                  style={{ color: '#6B7280' }}
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirm ? (
                    <EyeOff className="w-[18px] h-[18px]" strokeWidth={1.5} />
                  ) : (
                    <Eye className="w-[18px] h-[18px]" strokeWidth={1.5} />
                  )}
                </button>
              </div>
              {passwordsMatch && (
                <p className="text-[12px] mt-[6px]" style={{ color: '#22C55E' }}>
                  Passwords match
                </p>
              )}
              {passwordsMismatch && (
                <p className="text-[12px] mt-[6px]" style={{ color: '#EF4444' }}>
                  Passwords do not match
                </p>
              )}
            </div>

            {/* Submit */}
            {resetPasswordMutation.isError && (
              <div
                className="flex items-center gap-[8px] px-[14px] py-[10px] text-[13px] rounded-[10px]"
                style={{
                  background: 'rgba(237, 28, 36, 0.1)',
                  border: '1px solid rgba(237, 28, 36, 0.3)',
                  color: '#ED1C24',
                }}
              >
                <AlertCircle className="w-[16px] h-[16px] flex-shrink-0" strokeWidth={1.5} />
                <span>{resetPasswordMutation.error?.message}</span>
              </div>
            )}
            <button
              type="submit"
              disabled={resetPasswordMutation.isPending || !token}
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
              {resetPasswordMutation.isPending ? 'Resetting...' : 'Reset password'}
            </button>
          </form>

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
