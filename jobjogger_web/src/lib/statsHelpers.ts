import { STATUS_CONFIG } from '@/lib/statusConfig'
import type { Job, JobStatus } from '@/types/job'

export interface StatusBreakdown {
  status: string
  count: number
  fill: string
}

export function calculateStatusBreakdown(jobs: Job[]): StatusBreakdown[] {
  // Terminal statuses (accepted/rejected/ghosted/withdrawn) are excluded — this
  // chart shows the active pipeline, not closed-out outcomes.
  const statusCounts: Record<string, number> = {
    wishlist: 0,
    applied: 0,
    phone_screen: 0,
    interviewing: 0,
    offer: 0,
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
}
