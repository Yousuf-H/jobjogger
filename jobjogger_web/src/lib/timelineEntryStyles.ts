import {
  IconArrowRight,
  IconBell,
  IconClipboardCheck,
  IconFlag,
  IconMicrophone,
  IconNote,
  IconUser,
} from '@tabler/icons-react'

export interface EntryTypeConfig {
  Icon: React.ComponentType<{ className?: string }>
  bg: string
  ring: string
  color: string
  label: string
}

export function getEntryTypeConfig(type: string): EntryTypeConfig {
  switch (type) {
    case 'status_change':
      return { Icon: IconArrowRight, bg: 'bg-[#EFF6FF] dark:bg-blue-950/30', ring: 'ring-[#BFDBFE] dark:ring-blue-800', color: 'text-[#2563EB] dark:text-blue-400', label: 'Status change' }
    case 'note':
      return { Icon: IconNote, bg: 'bg-[#F5F3FF] dark:bg-violet-950/30', ring: 'ring-[#DDD6FE] dark:ring-violet-800', color: 'text-[#7C3AED] dark:text-violet-400', label: 'Note' }
    case 'interview':
      return { Icon: IconMicrophone, bg: 'bg-[#FFFBEB] dark:bg-amber-950/30', ring: 'ring-[#FDE68A] dark:ring-amber-800', color: 'text-[#D97706] dark:text-amber-400', label: 'Interview' }
    case 'contact':
      return { Icon: IconUser, bg: 'bg-[#F0FDF4] dark:bg-green-950/30', ring: 'ring-[#BBF7D0] dark:ring-green-800', color: 'text-[#16A34A] dark:text-green-400', label: 'Contact' }
    case 'assessment':
      return { Icon: IconClipboardCheck, bg: 'bg-[#FEF2F2] dark:bg-red-950/30', ring: 'ring-[#FECACA] dark:ring-red-800', color: 'text-[#DC2626] dark:text-red-400', label: 'Assessment' }
    case 'follow_up':
      return { Icon: IconBell, bg: 'bg-[#FDF2F8] dark:bg-pink-950/30', ring: 'ring-[#FBCFE8] dark:ring-pink-800', color: 'text-[#DB2777] dark:text-pink-400', label: 'Follow-up' }
    default:
      return { Icon: IconFlag, bg: 'bg-[#F9FAFB] dark:bg-muted', ring: 'ring-[#E5E7EB] dark:ring-border', color: 'text-[#6B7280] dark:text-muted-foreground', label: type.replaceAll('_', ' ') }
  }
}
