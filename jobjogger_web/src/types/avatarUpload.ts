import type { User } from '@/types/user'

export interface AvatarUploadProps {
  user: User | null
  onUpdate: (user: User) => void
  disabled?: boolean
}
