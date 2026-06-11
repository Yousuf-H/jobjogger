import { useActivity } from '@/hooks/useActivity'
import { PageError } from '@/components/layout/PageError'
import { PageLoading } from '@/components/layout/PageLoading'
import { usePageTitle } from '@/hooks/usePageTitle'
import { getStatusConfig } from '@/lib/statusConfig'
import type { ActivityEntry } from '@/types/timelineEntry'
import type { JobStatus } from '@/types/job'
import { formatDistanceToNow, isToday, isYesterday, isThisWeek, isThisMonth } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

function buildPageItems(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const items: (number | '…')[] = [1]
  if (current > 3) items.push('…')
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) items.push(p)
  if (current < total - 2) items.push('…')
  items.push(total)
  return items
}

function dateGroup(dateStr: string): string {
  const d = new Date(dateStr)
  if (isToday(d)) return 'Today'
  if (isYesterday(d)) return 'Yesterday'
  if (isThisWeek(d)) return 'This week'
  if (isThisMonth(d)) return 'This month'
  return 'Earlier'
}

const GROUP_ORDER = ['Today', 'Yesterday', 'This week', 'This month', 'Earlier']

function groupEntries(entries: ActivityEntry[]): { group: string; items: ActivityEntry[] }[] {
  const map = new Map<string, ActivityEntry[]>()
  for (const entry of entries) {
    const g = dateGroup(entry.occurred_at)
    if (!map.has(g)) map.set(g, [])
    map.get(g)!.push(entry)
  }
  return GROUP_ORDER.filter((g) => map.has(g)).map((g) => ({ group: g, items: map.get(g)! }))
}

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

const PER_PAGE = 25

export default function ActivityPage() {
  usePageTitle('Activity')
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const { data, isLoading, error } = useActivity(page, PER_PAGE)

  if (isLoading) return <PageLoading />
  if (error) return <PageError message={error.message} />

  const entries = data?.entries ?? []
  const meta = data?.meta
  const groups = groupEntries(entries)

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[18px] font-semibold tracking-tight text-[#111827]">Activity</h1>
        <p className="mt-0.5 text-[13px] text-[#6B7280]">
          A full history of changes across your job applications.
        </p>
      </div>

      <div className="rounded-[10px] border border-[#E5E7EB] bg-white">
        {!entries.length ? (
          <p className="py-16 text-center text-[13px] text-[#9CA3AF]">No activity yet</p>
        ) : (
          groups.map((group) => (
            <div key={group.group}>
              <div className="border-b border-[#F3F4F6] px-5 py-2.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                  {group.group}
                </span>
              </div>
              <ul>
                {group.items.map((entry, i) => {
                  const to = entry.metadata?.to as JobStatus | undefined
                  const config = getStatusConfig(to ?? 'wishlist')
                  const { prefix, bold, suffix } = activityPhrase(entry)
                  const isLast = i === group.items.length - 1

                  return (
                    <li
                      key={entry.id}
                      onClick={() => navigate(`/jobs/${entry.job_id}`)}
                      className={`flex cursor-pointer items-start gap-4 px-5 py-3.5 hover:bg-[#F9FAFB] ${isLast ? '' : 'border-b border-[#F3F4F6]'}`}
                    >
                      <div
                        className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: config.color }}
                      />
                      <div className="flex flex-1 flex-col gap-0.5">
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
            </div>
          ))
        )}
      </div>

      {meta && meta.total_pages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-[#9CA3AF]">
            {meta.total} entries
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {buildPageItems(page, meta.total_pages).map((item, i) =>
              item === '…' ? (
                <span key={`ellipsis-${i}`} className="px-1 text-[13px] text-[#9CA3AF]">…</span>
              ) : (
                <Button
                  key={item}
                  variant={item === page ? 'default' : 'outline'}
                  size="icon"
                  className="h-8 w-8 text-[13px]"
                  onClick={() => setPage(item)}
                >
                  {item}
                </Button>
              )
            )}

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= meta.total_pages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
