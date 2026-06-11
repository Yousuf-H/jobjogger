import { useActivity } from '@/hooks/useActivity'
import { getStatusConfig } from '@/lib/statusConfig'
import type { ActivityEntry } from '@/types/timelineEntry'
import type { JobStatus } from '@/types/job'
import { formatDistanceToNow } from 'date-fns'
import { Link } from 'react-router-dom'

function activityPhrase(entry: ActivityEntry): { prefix: string; bold: string; suffix: string } {
  const to = entry.metadata?.to as JobStatus | undefined
  const { job_title, company_name } = entry

  switch (to) {
    case 'wishlist':
      return { prefix: 'Added', bold: company_name, suffix: 'to wishlist' }
    case 'applied':
      return { prefix: 'Applied to', bold: job_title, suffix: `at ${company_name}` }
    case 'phone_screen':
      return { prefix: 'Phone screen for', bold: job_title, suffix: `at ${company_name}` }
    case 'interviewing':
      return { prefix: 'Interviewing for', bold: job_title, suffix: `at ${company_name}` }
    case 'offer':
      return { prefix: 'Offer received for', bold: job_title, suffix: `at ${company_name}` }
    case 'accepted':
      return { prefix: 'Accepted offer for', bold: job_title, suffix: `at ${company_name}` }
    case 'rejected':
      return { prefix: 'Rejected for', bold: job_title, suffix: `at ${company_name}` }
    case 'ghosted':
      return { prefix: 'Ghosted after applying to', bold: job_title, suffix: `at ${company_name}` }
    case 'withdrawn':
      return { prefix: 'Withdrew from', bold: job_title, suffix: `at ${company_name}` }
    default:
      return { prefix: entry.description, bold: '', suffix: '' }
  }
}

export function RecentActivity() {
  const { data, isLoading } = useActivity()
  const entries = data?.entries

  return (
    <div className="flex flex-col rounded-[10px] border border-[#E5E7EB] bg-white p-5">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h2 className="text-[14px] font-semibold text-[#111827]">Recent activity</h2>
          <p className="mt-0.5 text-[12px] text-[#6B7280]">
            Latest updates across your applications
          </p>
        </div>
        <Link to="/activity" className="text-[12px] font-medium text-[#2563EB] hover:underline">
          View all →
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-start gap-3 py-2.5">
              <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#E5E7EB]" />
              <div className="flex flex-1 flex-col gap-1.5">
                <div className="h-3 w-3/4 rounded bg-[#F3F4F6]" />
                <div className="h-2.5 w-1/4 rounded bg-[#F3F4F6]" />
              </div>
            </div>
          ))}
        </div>
      ) : !entries?.length ? (
        <p className="py-6 text-center text-[13px] text-[#9CA3AF]">No activity yet</p>
      ) : (
        <ul>
          {entries.map((entry, i) => {
            const to = entry.metadata?.to as JobStatus | undefined
            const statusKey = to ?? 'wishlist'
            const config = getStatusConfig(statusKey)
            const { prefix, bold, suffix } = activityPhrase(entry)
            const isLast = i === entries.length - 1

            return (
              <li
                key={entry.id}
                className={`flex items-start gap-3 py-3 ${isLast ? '' : 'border-b border-[#F3F4F6]'}`}
              >
                <div
                  className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: config.color }}
                />
                <div className="flex flex-col gap-0.5">
                  <span className="text-[13px] text-[#374151]">
                    {prefix}{bold ? <> <span className="font-semibold">{bold}</span> </> : ' '}{suffix}
                  </span>
                  <span className="text-[11px] text-[#9CA3AF]">
                    {formatDistanceToNow(new Date(entry.occurred_at), { addSuffix: true })}
                  </span>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
