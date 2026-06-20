import { uploadAvatar } from '@/services/api/user'
import type { AvatarUploadProps } from '@/types/avatarUpload'
import { Camera, Trash2 } from 'lucide-react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'

export function AvatarUpload({
  user,
  onUpdate,
  onRemove,
  disabled = false,
}: AvatarUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const initial =
    user?.name
      ?.trim()
      .charAt(0)
      .toUpperCase() || '?'

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const response = await uploadAvatar(file)
      onUpdate(response.user)
      toast.success('Avatar updated')
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { status?: { message?: string } } }
      }
      toast.error(
        axiosError.response?.data?.status?.message || 'Failed to upload avatar'
      )
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="relative w-[72px] h-[72px] shrink-0">
      {user?.avatar_url ? (
        <img
          src={user.avatar_url}
          alt={user.name}
          className="w-[72px] h-[72px] rounded-full object-cover"
        />
      ) : (
        <div className="w-[72px] h-[72px] rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[26px] font-semibold select-none">
          {initial}
        </div>
      )}

      {/* Upload badge — always visible at bottom-right */}
      <button
        type="button"
        onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
        disabled={uploading || disabled}
        aria-label="Upload avatar"
        className="absolute bottom-0 right-0 w-[24px] h-[24px] rounded-full bg-card border border-border flex items-center justify-center shadow-sm transition-opacity hover:opacity-80 disabled:pointer-events-none disabled:opacity-50"
      >
        <Camera className="w-[11px] h-[11px] text-foreground/70" />
      </button>

      {/* Remove badge — only when an avatar is set */}
      {user?.avatar_url && onRemove && (
        <button
          type="button"
          onClick={() => !disabled && !uploading && onRemove()}
          disabled={uploading || disabled}
          aria-label="Remove avatar"
          className="absolute top-0 right-0 w-[20px] h-[20px] rounded-full bg-card border border-border flex items-center justify-center shadow-sm transition-opacity hover:opacity-80 disabled:pointer-events-none disabled:opacity-50"
        >
          <Trash2 className="w-[9px] h-[9px] text-destructive" />
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}
