import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useLogin } from '../hooks/useAuth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  const loginMutation = useLogin();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const emailEmpty = !email.trim();
    const passwordEmpty = !password.trim();
    setEmailError(emailEmpty);
    setPasswordError(passwordEmpty);
    if (emailEmpty || passwordEmpty) return;
    loginMutation.mutate({ email, password });
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
          <h2 className="text-[24px] font-bold text-center" style={{ color: '#F9FAFB' }}>
            Welcome back
          </h2>
          <p className="text-[14px] text-center mt-[8px]" style={{ color: '#9CA3AF' }}>
            Sign in to continue to your communities
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
                    border: emailError
                      ? '1px solid #ED1C24'
                      : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '10px',
                    height: '44px',
                    color: '#F9FAFB',
                    outline: 'none',
                    boxShadow: emailError ? '0 0 0 3px rgba(237, 28, 36, 0.15)' : 'none',
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <span
                  className="absolute left-[14px] top-1/2 -translate-y-1/2"
                  style={{ color: '#6B7280' }}
                >
                  <Lock className="w-[18px] h-[18px]" strokeWidth={1.5} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-[42px] pr-[44px] text-[14px] transition-all duration-200"
                  style={{
                    background: '#1F2937',
                    border: passwordError
                      ? '1px solid #ED1C24'
                      : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '10px',
                    height: '44px',
                    color: '#F9FAFB',
                    outline: 'none',
                    boxShadow: passwordError ? '0 0 0 3px rgba(237, 28, 36, 0.15)' : 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-[14px] top-1/2 -translate-y-1/2 transition-colors cursor-pointer"
                  style={{ color: '#6B7280' }}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <EyeOff className="w-[18px] h-[18px]" strokeWidth={1.5} />
                  ) : (
                    <Eye className="w-[18px] h-[18px]" strokeWidth={1.5} />
                  )}
                </button>
              </div>
            </div>

            {/* Error message */}
            {loginMutation.isError && (
              <div
                className="flex items-center gap-[8px] px-[14px] py-[10px] text-[13px] rounded-[10px]"
                style={{
                  background: 'rgba(237, 28, 36, 0.1)',
                  border: '1px solid rgba(237, 28, 36, 0.3)',
                  color: '#ED1C24',
                }}
              >
                <AlertCircle className="w-[16px] h-[16px] flex-shrink-0" strokeWidth={1.5} />
                <span>{loginMutation.error?.message}</span>
              </div>
            )}

            {/* Forgot password */}
            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-[13px] hover:underline cursor-pointer"
                style={{ color: '#14B8A6' }}
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loginMutation.isPending}
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
              {loginMutation.isPending ? 'Logging in...' : 'Log in'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-[16px] my-[24px]">
            <div className="flex-1 h-px" style={{ background: 'rgba(255, 255, 255, 0.06)' }} />
            <span className="text-[13px]" style={{ color: '#6B7280' }}>
              or
            </span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255, 255, 255, 0.06)' }} />
          </div>

          {/* Sign up link */}
          <p className="text-center text-[14px]" style={{ color: '#9CA3AF' }}>
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="hover:underline cursor-pointer font-medium"
              style={{ color: '#14B8A6' }}
            >
              Sign up
            </Link>
          </p>
        </main>
      </div>
    </div>
  );
}
