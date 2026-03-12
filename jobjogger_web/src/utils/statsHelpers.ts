import type { Job } from '@/types/job'

export interface StatusBreakdown {
  status: string
  count: number
  fill: string
}

const STATUS_COLORS: Record<string, string> = {
  wishlist: '#94a3b8', // slate
  applied: '#f59e0b', // amber/warning
  phone_screen: '#8b5cf6', // violet
  interviewing: '#6366f1', // indigo
  offer: '#10b981', // emerald/success
  accepted: '#22c55e', // green
  rejected: '#ef4444', // red/destructive
  ghosted: '#64748b', // slate-500
  withdrawn: '#71717a', // zinc-500
}

export function calculateStatusBreakdown(jobs: Job[]): StatusBreakdown[] {
  const statusCounts: Record<string, number> = {
    wishlist: 0,
    applied: 0,
    phone_screen: 0,
    interviewing: 0,
    offer: 0,
    accepted: 0,
    rejected: 0,
    ghosted: 0,
    withdrawn: 0,
  }

  jobs.forEach((job) => {
    if (statusCounts[job.status] !== undefined) {
      statusCounts[job.status]++
    }
  })

  return Object.entries(statusCounts)
    .map(([status, count]) => ({
      status,
      count,
      fill: STATUS_COLORS[status] || '#94a3b8',
    }))
    .filter((item) => item.count > 0) // Only include statuses with jobs
}
