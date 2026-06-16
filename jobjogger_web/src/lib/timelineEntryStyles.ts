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
      return { Icon: IconArrowRight, bg: 'bg-[#EFF6FF]', ring: 'ring-[#BFDBFE]', color: 'text-[#2563EB]', label: 'Status change' }
    case 'note':
      return { Icon: IconNote, bg: 'bg-[#F5F3FF]', ring: 'ring-[#DDD6FE]', color: 'text-[#7C3AED]', label: 'Note' }
    case 'interview':
      return { Icon: IconMicrophone, bg: 'bg-[#FFFBEB]', ring: 'ring-[#FDE68A]', color: 'text-[#D97706]', label: 'Interview' }
    case 'contact':
      return { Icon: IconUser, bg: 'bg-[#F0FDF4]', ring: 'ring-[#BBF7D0]', color: 'text-[#16A34A]', label: 'Contact' }
    case 'assessment':
      return { Icon: IconClipboardCheck, bg: 'bg-[#FEF2F2]', ring: 'ring-[#FECACA]', color: 'text-[#DC2626]', label: 'Assessment' }
    case 'follow_up':
      return { Icon: IconBell, bg: 'bg-[#FDF2F8]', ring: 'ring-[#FBCFE8]', color: 'text-[#DB2777]', label: 'Follow-up' }
    default:
      return { Icon: IconFlag, bg: 'bg-[#F9FAFB]', ring: 'ring-[#E5E7EB]', color: 'text-[#6B7280]', label: type.replaceAll('_', ' ') }
  }
}
