import { useState, useRef } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Camera, AlertCircle, Loader2 } from 'lucide-react';
import { useAppSelector } from '../hooks/useAppSelector';
import { useUpdateProfile } from '../hooks/useUser';
import { userService } from '../services/api/user.service';

export default function EditProfilePage() {
  const user = useAppSelector((s) => s.auth.user);
  const updateProfileMutation = useUpdateProfile();

  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [showCameraOverlay, setShowCameraOverlay] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.profilePicture ?? null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initials = displayName.charAt(0).toUpperCase() || '?';

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarPreview(URL.createObjectURL(file));
    setAvatarError(null);
    setAvatarUploading(true);
    try {
      await userService.uploadAvatar(file);
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : 'Failed to upload avatar');
      setAvatarPreview(user?.profilePicture ?? null);
    } finally {
      setAvatarUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateProfileMutation.mutate({
      displayName: displayName || undefined,
      bio: bio || undefined,
    });
  };

  return (
    <main className="pt-[88px] pb-[100px] md:pb-[40px] px-[16px] md:px-[32px] max-w-[600px] mx-auto">

      {/* Page Heading */}
      <div className="flex items-center gap-[12px] mb-[24px]">
        <Link
          to="/profile"
          className="p-[8px] rounded-[10px] hover:bg-white/[0.06] transition cursor-pointer"
        >
          <ArrowLeft strokeWidth={1.5} className="w-[20px] h-[20px] text-[#9CA3AF]" />
        </Link>
        <h1 className="text-[24px] font-bold text-[#F9FAFB]">Edit Profile</h1>
      </div>

      {/* Edit Form Card */}
      <div
        className="bg-[#111827] rounded-[16px] p-[24px] md:p-[32px]"
        style={{ border: '1px solid rgba(255,255,255,0.06)' }}
      >
        {avatarError && (
          <div
            className="flex items-center gap-[8px] px-[14px] py-[10px] text-[13px] rounded-[10px] mb-[20px]"
            style={{ background: 'rgba(237,28,36,0.1)', border: '1px solid rgba(237,28,36,0.3)', color: '#ED1C24' }}
          >
            <AlertCircle className="w-[16px] h-[16px] flex-shrink-0" strokeWidth={1.5} />
            <span>{avatarError}</span>
          </div>
        )}

        {updateProfileMutation.isError && (
          <div
            className="flex items-center gap-[8px] px-[14px] py-[10px] text-[13px] rounded-[10px] mb-[20px]"
            style={{
              background: 'rgba(237, 28, 36, 0.1)',
              border: '1px solid rgba(237, 28, 36, 0.3)',
              color: '#ED1C24',
            }}
          >
            <AlertCircle className="w-[16px] h-[16px] flex-shrink-0" strokeWidth={1.5} />
            <span>{updateProfileMutation.error?.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* Avatar Upload */}
          <div className="flex flex-col items-center mb-[28px]">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <div
              className="relative group"
              onMouseEnter={() => setShowCameraOverlay(true)}
              onMouseLeave={() => setShowCameraOverlay(false)}
            >
              <div className="w-[96px] h-[96px] rounded-full bg-gradient-to-br from-[#ED1C24] to-[#F472B6] ring-2 ring-[#ED1C24]/30 flex items-center justify-center text-[36px] font-bold text-white overflow-hidden">
                {avatarPreview ? (
                  <img src={avatarPreview} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              {avatarUploading && (
                <div className="absolute inset-0 w-[96px] h-[96px] rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
                  <Loader2 strokeWidth={2} className="w-[24px] h-[24px] text-white animate-spin" />
                </div>
              )}
              {!avatarUploading && showCameraOverlay && (
                <button
                  type="button"
                  onClick={handlePhotoClick}
                  className="absolute inset-0 w-[96px] h-[96px] rounded-full flex items-center justify-center cursor-pointer"
                  style={{ background: 'rgba(0,0,0,0.5)' }}
                >
                  <Camera strokeWidth={1.5} className="w-[24px] h-[24px] text-white" />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={handlePhotoClick}
              disabled={avatarUploading}
              className="mt-[10px] text-[13px] text-[#14B8A6] hover:underline cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {avatarUploading ? 'Uploading...' : 'Change Photo'}
            </button>
          </div>

          {/* Display Name */}
          <div className="mb-[20px]">
            <label htmlFor="displayName" className="block text-[13px] font-medium text-[#9CA3AF] mb-[6px]">
              Display Name
            </label>
            <input
              type="text"
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-[#1F2937] rounded-[10px] px-[14px] py-[12px] text-[14px] text-[#F9FAFB] placeholder-[#6B7280] focus:outline-none transition"
              style={{ border: '1px solid rgba(255,255,255,0.06)' }}
            />
          </div>

          {/* Bio */}
          <div className="mb-[20px]">
            <label htmlFor="bio" className="block text-[13px] font-medium text-[#9CA3AF] mb-[6px]">
              Bio
            </label>
            <textarea
              id="bio"
              rows={3}
              maxLength={200}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-[#1F2937] rounded-[10px] px-[14px] py-[12px] text-[14px] text-[#F9FAFB] placeholder-[#6B7280] focus:outline-none transition resize-none"
              style={{ border: '1px solid rgba(255,255,255,0.06)' }}
            />
            <div className="flex justify-end mt-[4px]">
              <span className="text-[12px] text-[#6B7280]">{bio.length}/200</span>
            </div>
          </div>

          {/* Email (Read-only) */}
          <div className="mb-[28px]">
            <label htmlFor="email" className="block text-[13px] font-medium text-[#9CA3AF] mb-[6px]">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={user?.email ?? ''}
              readOnly
              className="w-full rounded-[10px] px-[14px] py-[12px] text-[14px] text-[#6B7280] cursor-not-allowed"
              style={{ background: 'rgba(31,41,55,0.5)', border: '1px solid rgba(255,255,255,0.04)' }}
            />
          </div>

          {/* Button Row */}
          <div className="flex items-center justify-end gap-[12px]">
            <Link
              to="/profile"
              className="px-[20px] py-[10px] rounded-[10px] text-[14px] font-medium text-[#F9FAFB] hover:border-[rgba(237,28,36,0.2)] transition cursor-pointer"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="px-[24px] py-[10px] rounded-[10px] text-[14px] font-semibold text-white transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #ED1C24, #F472B6)' }}
            >
              {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

        </form>
      </div>

    </main>
  );
}
