import { useState } from 'react';
import type { FormEvent } from 'react';
import { User, Bell, Smartphone, Info, ChevronRight, LogOut, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { useLogout } from '../hooks/useAuth';
import { useChangePassword } from '../hooks/useUser';
import { useAppSelector } from '../hooks/useAppSelector';

interface ToggleSwitchProps {
  enabled: boolean;
  onToggle: () => void;
  label: string;
}

function ToggleSwitch({ enabled, onToggle, label }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={label}
      className="flex-shrink-0 relative cursor-pointer transition-colors duration-200"
      style={{
        width: '44px',
        height: '24px',
        borderRadius: '9999px',
        background: enabled ? '#14B8A6' : 'rgba(255, 255, 255, 0.06)',
        position: 'relative',
      }}
    >
      <span
        className="absolute top-[3px] rounded-full bg-white transition-all duration-200"
        style={{
          width: '18px',
          height: '18px',
          left: enabled ? '23px' : '3px',
        }}
      />
    </button>
  );
}

export default function SettingsPage() {
  const userEmail = useAppSelector((s) => s.auth.user?.email);
  const logoutMutation = useLogout();
  const changePasswordMutation = useChangePassword();

  const [toggles, setToggles] = useState({
    newComments: true,
    newFollowers: true,
    communityUpdates: false,
  });

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const toggle = (key: keyof typeof toggles) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleChangePassword = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordError('');
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }
    changePasswordMutation.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          setPasswordSuccess(true);
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          setTimeout(() => {
            setPasswordSuccess(false);
            setShowPasswordForm(false);
          }, 2000);
        },
        onError: (err) => {
          setPasswordError(err.message || 'Failed to change password.');
        },
      }
    );
  };

  return (
    <main className="pt-[88px] pb-[100px] md:pb-[40px] px-[16px] md:px-[32px] max-w-[600px] mx-auto">

      <h1 className="text-[24px] font-bold text-[#F9FAFB] mb-[24px]">Settings</h1>

      {/* Account Section */}
      <section
        className="bg-[#111827] rounded-[12px] p-[20px] md:p-[24px] mb-[16px]"
        style={{ border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <h3 className="text-[16px] font-bold text-[#F9FAFB] mb-[16px] flex items-center gap-[8px]">
          <User strokeWidth={1.5} className="w-[18px] h-[18px] text-[#9CA3AF]" />
          Account
        </h3>

        {/* Email Row */}
        <div className="flex items-center justify-between py-[12px]" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div>
            <p className="text-[13px] text-[#6B7280]">Email</p>
            <p className="text-[14px] text-[#F9FAFB] mt-[2px]">{userEmail ?? '—'}</p>
          </div>
          <span className="text-[12px] text-[#6B7280] italic">Contact support to change email</span>
        </div>

        {/* Password Row */}
        <div className="py-[12px]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] text-[#6B7280]">Password</p>
              <p className="text-[14px] text-[#F9FAFB] mt-[2px] tracking-widest">••••••••</p>
            </div>
            <button
              type="button"
              onClick={() => { setShowPasswordForm((v) => !v); setPasswordError(''); setPasswordSuccess(false); }}
              className="px-[14px] py-[6px] rounded-[8px] text-[13px] font-medium text-[#F9FAFB] hover:border-[rgba(237,28,36,0.2)] transition cursor-pointer"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              {showPasswordForm ? 'Cancel' : 'Change Password'}
            </button>
          </div>

          {showPasswordForm && (
            <form onSubmit={handleChangePassword} className="mt-[16px] space-y-[12px]">
              {passwordError && (
                <div className="flex items-center gap-[8px] px-[12px] py-[8px] rounded-[8px] text-[12px]" style={{ background: 'rgba(237,28,36,0.1)', border: '1px solid rgba(237,28,36,0.3)', color: '#ED1C24' }}>
                  <AlertCircle className="w-[14px] h-[14px] flex-shrink-0" strokeWidth={1.5} />
                  {passwordError}
                </div>
              )}
              {passwordSuccess && (
                <div className="flex items-center gap-[8px] px-[12px] py-[8px] rounded-[8px] text-[12px]" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#22C55E' }}>
                  <CheckCircle className="w-[14px] h-[14px] flex-shrink-0" strokeWidth={1.5} />
                  Password changed successfully!
                </div>
              )}
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  placeholder="Current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full bg-[#1F2937] rounded-[8px] px-[12px] py-[10px] pr-[36px] text-[13px] text-[#F9FAFB] placeholder-[#6B7280] outline-none"
                  style={{ border: '1px solid rgba(255,255,255,0.06)' }}
                />
                <button type="button" onClick={() => setShowCurrent((v) => !v)} className="absolute right-[10px] top-1/2 -translate-y-1/2 text-[#6B7280] cursor-pointer">
                  {showCurrent ? <EyeOff className="w-[14px] h-[14px]" strokeWidth={1.5} /> : <Eye className="w-[14px] h-[14px]" strokeWidth={1.5} />}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full bg-[#1F2937] rounded-[8px] px-[12px] py-[10px] pr-[36px] text-[13px] text-[#F9FAFB] placeholder-[#6B7280] outline-none"
                  style={{ border: '1px solid rgba(255,255,255,0.06)' }}
                />
                <button type="button" onClick={() => setShowNew((v) => !v)} className="absolute right-[10px] top-1/2 -translate-y-1/2 text-[#6B7280] cursor-pointer">
                  {showNew ? <EyeOff className="w-[14px] h-[14px]" strokeWidth={1.5} /> : <Eye className="w-[14px] h-[14px]" strokeWidth={1.5} />}
                </button>
              </div>
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full bg-[#1F2937] rounded-[8px] px-[12px] py-[10px] text-[13px] text-[#F9FAFB] placeholder-[#6B7280] outline-none"
                style={{ border: '1px solid rgba(255,255,255,0.06)' }}
              />
              <button
                type="submit"
                disabled={changePasswordMutation.isPending}
                className="w-full py-[10px] rounded-[8px] text-[13px] font-semibold text-white transition cursor-pointer disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #ED1C24, #F472B6)' }}
              >
                {changePasswordMutation.isPending ? 'Saving...' : 'Update Password'}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Notifications Section */}
      <section
        className="bg-[#111827] rounded-[12px] p-[20px] md:p-[24px] mb-[16px]"
        style={{ border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <h3 className="text-[16px] font-bold text-[#F9FAFB] mb-[16px] flex items-center gap-[8px]">
          <Bell strokeWidth={1.5} className="w-[18px] h-[18px] text-[#9CA3AF]" />
          Notifications
        </h3>

        <div className="flex items-center justify-between py-[12px]" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <span className="text-[14px] text-[#F9FAFB]">New comments on my posts</span>
          <ToggleSwitch enabled={toggles.newComments} onToggle={() => toggle('newComments')} label="Toggle new comments notifications" />
        </div>

        <div className="flex items-center justify-between py-[12px]" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <span className="text-[14px] text-[#F9FAFB]">New followers</span>
          <ToggleSwitch enabled={toggles.newFollowers} onToggle={() => toggle('newFollowers')} label="Toggle new followers notifications" />
        </div>

        <div className="flex items-center justify-between py-[12px]">
          <span className="text-[14px] text-[#F9FAFB]">Community updates</span>
          <ToggleSwitch enabled={toggles.communityUpdates} onToggle={() => toggle('communityUpdates')} label="Toggle community updates notifications" />
        </div>
      </section>

      {/* App Section */}
      <section
        className="bg-[#111827] rounded-[12px] p-[20px] md:p-[24px] mb-[16px]"
        style={{ border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <h3 className="text-[16px] font-bold text-[#F9FAFB] mb-[16px] flex items-center gap-[8px]">
          <Smartphone strokeWidth={1.5} className="w-[18px] h-[18px] text-[#9CA3AF]" />
          App
        </h3>

        <button
          type="button"
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          className="w-full flex items-center justify-center gap-[8px] px-[20px] py-[12px] rounded-[10px] text-[14px] font-medium transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#EF4444',
            border: '1px solid rgba(239, 68, 68, 0.2)',
          }}
          onMouseOver={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239, 68, 68, 0.2)'; }}
          onMouseOut={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239, 68, 68, 0.1)'; }}
        >
          <LogOut strokeWidth={1.5} className="w-[16px] h-[16px]" />
          Logout
        </button>
      </section>

      {/* About Section */}
      <section
        className="bg-[#111827] rounded-[12px] p-[20px] md:p-[24px]"
        style={{ border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <h3 className="text-[16px] font-bold text-[#F9FAFB] mb-[16px] flex items-center gap-[8px]">
          <Info strokeWidth={1.5} className="w-[18px] h-[18px] text-[#9CA3AF]" />
          About
        </h3>

        <div className="space-y-[12px]">
          <a
            href="https://bondhub.com/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-between py-[4px] group cursor-pointer"
          >
            <span className="text-[14px] text-[#F9FAFB] group-hover:text-[#14B8A6] transition">Terms of Service</span>
            <ChevronRight strokeWidth={1.5} className="w-[16px] h-[16px] text-[#6B7280] group-hover:text-[#14B8A6] transition" />
          </a>
          <a
            href="https://bondhub.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-between py-[4px] group cursor-pointer"
          >
            <span className="text-[14px] text-[#F9FAFB] group-hover:text-[#14B8A6] transition">Privacy Policy</span>
            <ChevronRight strokeWidth={1.5} className="w-[16px] h-[16px] text-[#6B7280] group-hover:text-[#14B8A6] transition" />
          </a>
          <div className="pt-[8px]" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-[13px] text-[#6B7280]">BondHub v1.0.0</p>
          </div>
        </div>
      </section>

    </main>
  );
}
