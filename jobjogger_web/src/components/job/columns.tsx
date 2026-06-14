import ActionsCell from '@/components/job/ActionsCell'
import { StatusBadge } from '@/components/job/StatusBadge'
import type { Job } from '@/types/job'
import type { ColumnDef } from '@tanstack/react-table'
import { format, formatDistanceToNow, isFuture, parseISO } from 'date-fns'

export const columns = (
  onView: (id: number) => void,
  onArchive: (id: number) => void,
  onUnarchive: (id: number) => void,
  onDelete: (id: number) => void,
  hasFollowUp = false,
  hasNextInterview = false,
): ColumnDef<Job>[] => {
  const cols: ColumnDef<Job>[] = [
    {
      accessorKey: 'company_name',
      header: 'Company',
    },
    {
      accessorKey: 'job_title',
      header: 'Role',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <div onClick={(e) => e.stopPropagation()}>
          <StatusBadge job={row.original} />
        </div>
      ),
    },
  ]

  if (hasFollowUp) {
    cols.push({
      accessorKey: 'follow_up_date',
      header: 'Follow-up',
      cell: ({ row }) => {
        const date = row.getValue('follow_up_date') as string
        if (!date) return null
        const [year, month, day] = date.split('T')[0].split('-').map(Number)
        const followUpDay = new Date(year, month - 1, day)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const isOverdue = followUpDay < today
        return (
          <span className={isOverdue ? 'text-destructive font-medium' : 'text-foreground/80'}>
            {format(parseISO(date.split('T')[0]), 'd MMM yyyy')}
          </span>
        )
      },
    })
  }

  if (hasNextInterview) {
    cols.push({
      accessorKey: 'next_interview_at',
      header: 'Next Interview',
      cell: ({ row }) => {
        const job = row.original
        if (!job.next_interview_at) return null
        const date = new Date(job.next_interview_at)
        if (!isFuture(date)) return null
        return (
          <span className="text-violet-600 dark:text-violet-400 font-medium text-xs">
            {formatDistanceToNow(date, { addSuffix: true })}
          </span>
        )
      },
    })
  }

  cols.push({
    id: 'actions',
    cell: ({ row }) => {
      const job = row.original
      return (
        <div onClick={(e) => e.stopPropagation()}>
          <ActionsCell
            jobId={job.id}
            isArchived={Boolean(job.archived_at)}
            onView={onView}
            onArchive={onArchive}
            onUnarchive={onUnarchive}
            onDelete={onDelete}
          />
        </div>
      )
    },
  })

  return cols
}
