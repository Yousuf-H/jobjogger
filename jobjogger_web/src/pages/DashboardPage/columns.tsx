import type { ColumnDef } from '@tanstack/react-table'
import type { Job } from '@/types/job'
import { ActionsCell } from './ActionsCell'

export const columns = (
  onArchive: (id: number) => void,
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
  },
  {
    accessorKey: 'location',
    header: 'Location',
  },
  {
    accessorKey: 'priority',
    header: 'Priority',
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
            onArchive={onArchive}
            onDelete={onDelete}
          />
        </div>
      )
    },
  },
]
