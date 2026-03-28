import { STATUS_CONFIG } from '@/lib/statusConfig'
import type { Job, JobStatus } from '@/types/job'

export interface StatusBreakdown {
  status: string
  count: number
  fill: string
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
      fill: STATUS_CONFIG[status as JobStatus]?.color ?? '#94a3b8',
    }))
    .filter((item) => item.count > 0)
}
