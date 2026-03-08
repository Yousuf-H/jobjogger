import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { TimelineEntry } from '@/types/timelineEntry'
import { History, Trash2 } from 'lucide-react'
import AddTimelineEntryDialog from '@/components/job/AddTimelineEntryDialog'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteTimelineEntry } from '@/services/api/timelineEntries'
import { toast } from 'sonner'
import TimelineHelpDialog from '@/components/job/TimelineHelpDialog'

interface TimelineTabProps {
  timelineEntries: TimelineEntry[]
  job: { id: number }
}

function getEntryTypeColor(type: string) {
  switch (type) {
    case 'status_change':
      return 'bg-blue-500'
    case 'interview':
      return 'bg-green-500'
    case 'contact':
      return 'bg-purple-500'
    case 'note':
      return 'bg-yellow-500'
    case 'assessment':
      return 'bg-orange-500'
    case 'follow_up':
      return 'bg-pink-500'
    default:
      return 'bg-gray-400'
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function EmptyTimelineState() {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed px-6 py-10 text-center">
      <div className="mb-4 rounded-full bg-blue-100 p-4 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
        <History className="h-6 w-6" />
      </div>

      <h3 className="text-lg font-semibold">No timeline activity yet</h3>

      <p className="text-muted-foreground mt-2 max-w-md text-sm leading-6">
        Timeline events will appear here as you track status changes,
        interviews, recruiter contact, and other job activity.
      </p>
    </div>
  )
}

function TimelineEntryItem({
  entry,
  isLast,
  jobId,
}: {
  entry: TimelineEntry
  isLast: boolean
  jobId: number
}) {
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: () => deleteTimelineEntry(entry.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs', jobId.toString()] })
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

  const isManualEntry = entry.entry_type !== 'status_change'

  return (
    <div className="flex gap-4">
      <div className="flex w-6 flex-col items-center">
        <div
          className={cn(
            'border-background relative z-10 mt-2 h-3 w-3 rounded-full border-2 shadow-sm',
            getEntryTypeColor(entry.entry_type)
          )}
        />
        {!isLast && <div className="bg-border mt-2 w-px flex-1" />}
      </div>

      <div className="relative flex-1 rounded-lg border p-4">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <Badge variant="outline" className="capitalize">
            {entry.entry_type.replaceAll('_', ' ')}
          </Badge>

          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-xs">
              {formatDate(entry.occurred_at)}
            </span>

            {/* Edit/Delete buttons - only for manual entries */}
            {isManualEntry && (
              <div className="flex gap-1">
                <AddTimelineEntryDialog
                  jobId={jobId}
                  entry={entry}
                  mode="edit"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>
        </div>

        <p className="whitespace-pre-wrap text-sm leading-6">
          {entry.description}
        </p>
      </div>
    </div>
  )
}

export function TimelineTab({ timelineEntries, job }: TimelineTabProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
        <div className="space-y-1">
          <CardTitle>Timeline</CardTitle>
          <p className="text-muted-foreground text-sm">
            Follow the history of this job application, including updates,
            conversations, interviews, and important changes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <TimelineHelpDialog />
          <AddTimelineEntryDialog jobId={job.id} />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {timelineEntries.length === 0 ? (
          <EmptyTimelineState />
        ) : (
          <div className="space-y-4">
            {timelineEntries.map((entry, index) => (
              <TimelineEntryItem
                key={entry.id}
                entry={entry}
                isLast={index === timelineEntries.length - 1}
                jobId={job.id}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
