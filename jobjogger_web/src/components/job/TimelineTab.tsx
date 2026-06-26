import AddTimelineEntryDialog from '@/components/job/AddTimelineEntryDialog'
import TimelineHelpDialog from '@/components/job/TimelineHelpDialog'
import { cn } from '@/lib/utils'
import { getEntryTypeConfig } from '@/lib/timelineEntryStyles'
import { getCurrentUserId } from '@/lib/auth'
import { QUERY_KEYS } from '@/lib/queryKeys'
import { deleteTimelineEntry } from '@/services/api/timelineEntries'
import type { TimelineEntry } from '@/types/timelineEntry'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { IconPencil, IconTrash } from '@tabler/icons-react'
import { format, parseISO } from 'date-fns'
import { History } from 'lucide-react'
import { TypographyH3 } from '@/components/ui/typography'
import { toast } from 'sonner'

interface TimelineTabProps {
  timelineEntries: TimelineEntry[]
  job: { id: number }
}

function formatEntryDate(date: string) {
  return format(parseISO(date), 'd MMM yyyy')
}

function TimelineEntryItem({
  entry,
  jobId,
}: {
  entry: TimelineEntry
  jobId: number
}) {
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: () => deleteTimelineEntry(entry.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.jobs.byUser(getCurrentUserId()) })
      toast.success('Timeline entry deleted!')
    },
    onError: () => {
      toast.error('Failed to delete entry')
    },
  })

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this entry?')) {
      deleteMutation.mutate()
    }
  }

  // Only status_change entries are system-generated and immutable — every
  // other type is user-created and supports edit/delete.
  const isLocked = entry.entry_type === 'status_change'
  const config = getEntryTypeConfig(entry.entry_type)
  const date = formatEntryDate(entry.occurred_at)

  return (
    <div
      className={cn(
        'relative flex gap-[14px] rounded-[8px] px-[6px] py-[10px]',
        !isLocked && 'timeline-row'
      )}
    >
      {/* Dot */}
      <div
        className={cn(
          'relative z-10 flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full border-2 border-card ring-1',
          config.bg,
          config.ring
        )}
        style={{ marginLeft: '-8px' }}
      >
        <config.Icon className={cn('h-[16px] w-[16px]', config.color)} />
      </div>

      {/* Body */}
      <div className="min-w-0 flex-1 pt-[2px]">
        <p className={cn('text-[12px] font-medium', config.color)}>{config.label}</p>
        <p className="mt-[2px] whitespace-pre-wrap text-[13px] leading-[1.5] text-[#374151] dark:text-foreground/80">
          {entry.description}
        </p>

        {!isLocked && (
          <div className="timeline-mobile-actions mt-[8px] gap-[6px]">
            <AddTimelineEntryDialog
              jobId={jobId}
              entry={entry}
              mode="edit"
              trigger={
                <button className="flex items-center gap-[4px] rounded-[6px] border-[0.5px] border-[#E5E7EB] px-[8px] py-[3px] text-[11px] text-[#6B7280] dark:border-border dark:text-muted-foreground">
                  <IconPencil className="h-[11px] w-[11px]" />
                  Edit
                </button>
              }
            />
            <button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="flex items-center gap-[4px] rounded-[6px] border-[0.5px] border-[#FECACA] bg-[#FEF2F2] px-[8px] py-[3px] text-[11px] text-[#DC2626] dark:border-red-900 dark:bg-red-950/30 dark:text-red-400"
            >
              <IconTrash className="h-[11px] w-[11px]" />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Date / actions column — fixed width so hover never shifts layout */}
      <div className="relative h-[22px] w-[116px] shrink-0">
        <span
          className={cn(
            'absolute right-0 text-[11px] text-[#9CA3AF] dark:text-muted-foreground',
            !isLocked && 'timeline-date'
          )}
        >
          {date}
        </span>

        {!isLocked && (
          <div className="timeline-actions absolute right-0 flex items-center gap-[6px]">
            <AddTimelineEntryDialog
              jobId={jobId}
              entry={entry}
              mode="edit"
              trigger={
                <button className="flex h-[22px] w-[22px] items-center justify-center rounded-[5px] border-[0.5px] border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-[#F3F4F6] dark:border-border dark:bg-card dark:text-muted-foreground dark:hover:bg-muted">
                  <IconPencil className="h-[12px] w-[12px]" />
                </button>
              }
            />
            <button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="flex h-[22px] w-[22px] items-center justify-center rounded-[5px] border-[0.5px] border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#FECACA] hover:bg-[#FEF2F2] hover:text-[#DC2626] dark:border-border dark:bg-card dark:text-muted-foreground dark:hover:border-red-900 dark:hover:bg-red-950/30 dark:hover:text-red-400"
            >
              <IconTrash className="h-[12px] w-[12px]" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export function TimelineTab({ timelineEntries, job }: TimelineTabProps) {
  return (
    <div className="space-y-4">
      {timelineEntries.length === 0 ? (
        <div className="flex min-h-[200px] flex-col items-center justify-center px-6 py-10 text-center">
          <div className="mb-4 rounded-full bg-muted p-3 text-muted-foreground">
            <History className="h-5 w-5" />
          </div>
          <TypographyH3 className="text-base font-semibold">No timeline activity yet</TypographyH3>
          <p className="text-muted-foreground mt-2 max-w-md text-sm">
            Timeline events will appear here as you track status changes,
            interviews, recruiter contact, and other job activity.
          </p>
          <div className="mt-5">
            <AddTimelineEntryDialog jobId={job.id} />
          </div>
        </div>
      ) : (
        <>
        <div className="flex items-center justify-end gap-2">
          <TimelineHelpDialog />
          <AddTimelineEntryDialog jobId={job.id} />
        </div>
        <div className="relative">
          <div
            className="absolute w-[1.5px] bg-[#E5E7EB] dark:bg-border"
            style={{ left: '15px', top: '25px', bottom: '25px' }}
          />
          <div>
            {timelineEntries.map((entry) => (
              <TimelineEntryItem key={entry.id} entry={entry} jobId={job.id} />
            ))}
          </div>
        </div>
        </>
      )}
    </div>
  )
}
