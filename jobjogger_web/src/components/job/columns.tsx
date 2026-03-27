import ActionsCell from '@/components/job/ActionsCell'
import { getPriorityConfig, getStatusConfig } from '@/lib/statusConfig'
import type { Job } from '@/types/job'
import type { ColumnDef } from '@tanstack/react-table'

export const columns = (
  onView: (id: number) => void,
  onArchive: (id: number) => void,
  onUnarchive: (id: number) => void,
  onDelete: (id: number) => void
): ColumnDef<Job>[] => [
  {
    accessorKey: 'company_name',
    header: 'Company Name',
  },
  {
    accessorKey: 'job_title',
    header: 'Job Title',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const config = getStatusConfig(row.getValue('status'))
      return (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.badgeClass}`}
        >
          {config.label}
        </span>
      )
    },
  },
  {
    accessorKey: 'location',
    header: 'Location',
  },
  {
    accessorKey: 'priority',
    header: 'Priority',
    cell: ({ row }) => {
      const priority = row.getValue('priority') as string
      if (!priority) return null
      const config = getPriorityConfig(priority)
      if (!config) return null
      return (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.badgeClass}`}
        >
          {config.label}
        </span>
      )
    },
  },
  {
    accessorKey: 'follow_up_date',
    header: 'Follow Up Date',
  },
  {
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
  },
]
