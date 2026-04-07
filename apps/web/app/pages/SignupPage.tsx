import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, Camera, AlertCircle } from 'lucide-react';
import { useRegister } from '../hooks/useAuth';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [profileFileName, setProfileFileName] = useState('');

  const registerMutation = useRegister();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileFileName(file.name);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    registerMutation.mutate({ email, password, displayName, bio: bio || undefined });
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
            Create your account
          </h2>
          <p className="text-[14px] text-center mt-[8px]" style={{ color: '#9CA3AF' }}>
            Join the BondHub community
          </p>

          {registerMutation.isError && (
            <div
              className="flex items-center gap-[8px] px-[14px] py-[10px] text-[13px] rounded-[10px] mt-[16px]"
              style={{
                background: 'rgba(237, 28, 36, 0.1)',
                border: '1px solid rgba(237, 28, 36, 0.3)',
                color: '#ED1C24',
              }}
            >
              <AlertCircle className="w-[16px] h-[16px] flex-shrink-0" strokeWidth={1.5} />
              <span>{registerMutation.error?.message}</span>
            </div>
          )}
          <form className="mt-[28px] space-y-[20px]" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-[13px] mb-[6px]"
                style={{ color: '#9CA3AF' }}
              >
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
                  placeholder="you@example.com"
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

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-[13px] mb-[6px]"
                style={{ color: '#9CA3AF' }}
              >
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
                  placeholder="Min 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  required
                  className="w-full pl-[42px] pr-[44px] text-[14px] transition-all duration-200"
                  style={{
                    background: '#1F2937',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '10px',
                    height: '44px',
                    color: '#F9FAFB',
                    outline: 'none',
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
              <p className="text-[12px] mt-[6px]" style={{ color: '#6B7280' }}>
                Min 8 characters with at least one number
              </p>
            </div>

            {/* Display Name */}
            <div>
              <label
                htmlFor="displayName"
                className="block text-[13px] mb-[6px]"
                style={{ color: '#9CA3AF' }}
              >
                Display name
              </label>
              <div className="relative">
                <span
                  className="absolute left-[14px] top-1/2 -translate-y-1/2"
                  style={{ color: '#6B7280' }}
                >
                  <User className="w-[18px] h-[18px]" strokeWidth={1.5} />
                </span>
                <input
                  type="text"
                  id="displayName"
                  name="displayName"
                  placeholder="How others will see you"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
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

            {/* Bio */}
            <div>
              <div className="flex items-center justify-between mb-[6px]">
                <label htmlFor="bio" className="text-[13px]" style={{ color: '#9CA3AF' }}>
                  Bio{' '}
                  <span style={{ color: '#6B7280' }}>(optional)</span>
                </label>
                <span className="text-[12px]" style={{ color: '#6B7280' }}>
                  {bio.length} / 200
                </span>
              </div>
              <textarea
                id="bio"
                name="bio"
                rows={3}
                maxLength={200}
                placeholder="Tell us a little about yourself..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-[14px] py-[10px] text-[14px] transition-all duration-200 resize-none"
                style={{
                  background: '#1F2937',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '10px',
                  color: '#F9FAFB',
                  outline: 'none',
                }}
              />
            </div>

            {/* Profile Picture Upload */}
            <div>
              <label className="block text-[13px] mb-[6px]" style={{ color: '#9CA3AF' }}>
                Profile photo{' '}
                <span style={{ color: '#6B7280' }}>(optional)</span>
              </label>
              <label
                htmlFor="profilePic"
                className="flex flex-col items-center justify-center py-[24px] cursor-pointer transition-all duration-200"
                style={{
                  border: '2px dashed rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLLabelElement).style.borderColor =
                    'rgba(20, 184, 166, 0.4)';
                  (e.currentTarget as HTMLLabelElement).style.background =
                    'rgba(20, 184, 166, 0.05)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLLabelElement).style.borderColor =
                    'rgba(255, 255, 255, 0.1)';
                  (e.currentTarget as HTMLLabelElement).style.background = 'transparent';
                }}
              >
                <Camera className="w-[28px] h-[28px] mb-[8px]" style={{ color: '#6B7280' }} strokeWidth={1.5} />
                <span className="text-[13px]" style={{ color: '#9CA3AF' }}>
                  {profileFileName || 'Upload photo'}
                </span>
                <span className="text-[11px] mt-[4px]" style={{ color: '#6B7280' }}>
                  JPG, PNG up to 5MB
                </span>
                <input
                  type="file"
                  id="profilePic"
                  name="profilePic"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full h-[44px] rounded-[12px] text-white font-semibold text-[15px] cursor-pointer transition-all duration-300 mt-[4px] disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #ED1C24, #F472B6)' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  '0 0 20px rgba(237, 28, 36, 0.4)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
              }}
            >
              {registerMutation.isPending ? 'Creating account...' : 'Create account'}
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

          {/* Login link */}
          <p className="text-center text-[14px]" style={{ color: '#9CA3AF' }}>
            Already have an account?{' '}
            <Link
              to="/login"
              className="hover:underline cursor-pointer font-medium"
              style={{ color: '#14B8A6' }}
            >
              Log in
            </Link>
          </p>
        </main>
      </div>
    </div>
  );
}
