import type { JobStatus } from '@/types/job'

type PriorityKey = 'low' | 'medium' | 'high'

interface StatusConfig {
  label: string
  color: string
  badgeClass: string
}

interface PriorityConfig {
  label: string
  badgeClass: string
}

export const STATUS_CONFIG: Record<JobStatus, StatusConfig> = {
  wishlist: {
    label: 'Wishlist',
    color: 'var(--status-wishlist)',
    badgeClass:
      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  },
  applied: {
    label: 'Applied',
    color: 'var(--status-applied)',
    badgeClass:
      'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  },
  phone_screen: {
    label: 'Phone Screen',
    color: 'var(--status-phone-screen)',
    badgeClass:
      'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
  },
  interviewing: {
    label: 'Interviewing',
    color: 'var(--status-interviewing)',
    badgeClass:
      'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  },
  offer: {
    label: 'Offer',
    color: 'var(--status-offer)',
    badgeClass:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  },
  accepted: {
    label: 'Accepted',
    color: 'var(--status-accepted)',
    badgeClass:
      'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  },
  rejected: {
    label: 'Rejected',
    color: 'var(--status-rejected)',
    badgeClass: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  },
  ghosted: {
    label: 'Ghosted',
    color: 'var(--status-ghosted)',
    badgeClass:
      'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  },
  withdrawn: {
    label: 'Withdrawn',
    color: 'var(--status-withdrawn)',
    badgeClass:
      'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  },
}

export const PRIORITY_CONFIG: Record<PriorityKey, PriorityConfig> = {
  low: {
    label: 'Low',
    badgeClass:
      'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  },
  medium: {
    label: 'Medium',
    badgeClass:
      'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  },
  high: {
    label: 'High',
    badgeClass: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  },
}

export function getStatusConfig(status: string): StatusConfig {
  return STATUS_CONFIG[status as JobStatus] ?? STATUS_CONFIG.wishlist
}

export function getPriorityConfig(
  priority: string | null | undefined
): PriorityConfig | null {
  if (!priority) return null
  return PRIORITY_CONFIG[priority as PriorityKey] ?? null
}
