import type { User } from '@/types/user'

export interface AvatarUploadProps {
  user: User | null
  onUpdate: (user: User) => void
  onRemove?: () => void
  disabled?: boolean
}
