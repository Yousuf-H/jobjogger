import { Button } from '@/components/ui/button'
import { deleteAvatar, uploadAvatar } from '@/services/api/user'
import type { User } from '@/types/user'
import { Camera, Trash2 } from 'lucide-react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'

export function AvatarUpload({
  user,
  onUpdate,
}: {
  user: User | null
  onUpdate: (user: User) => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const initials =
    user?.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '?'

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

  const handleRemove = async () => {
    setUploading(true)
    try {
      const response = await deleteAvatar()
      onUpdate(response.user)
      toast.success('Avatar removed')
    } catch {
      toast.error('Failed to remove avatar')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex items-center gap-5">
      <div className="relative">
        {user?.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.name}
            className="size-20 rounded-full object-cover"
          />
        ) : (
          <div className="bg-primary/10 text-primary flex size-20 items-center justify-center rounded-full text-xl font-semibold">
            {initials}
          </div>
        )}

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="bg-primary text-primary-foreground absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full shadow-sm transition-opacity hover:opacity-90"
        >
          <Camera className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Upload photo'}
          </Button>
          {user?.avatar_url && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              disabled={uploading}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
        <p className="text-muted-foreground text-xs">
          PNG, JPEG, or WebP. Max 5MB.
        </p>
      </div>

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
