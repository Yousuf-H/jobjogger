import { ScheduleInterviewPrompt } from '@/components/job/ScheduleInterviewPrompt'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Check, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { STATUS_CONFIG, getStatusConfig } from '@/lib/statusConfig'
import { cn } from '@/lib/utils'
import { updateJob } from '@/services/api/jobs'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { TERMINAL_STATUSES, type Job, type JobStatus } from '@/types/job'

const INTERVIEW_TRIGGER_STATUSES: JobStatus[] = ['phone_screen', 'interviewing']

const STATUS_OPTIONS: { value: JobStatus; label: string }[] = [
  { value: 'wishlist', label: 'Wishlist' },
  { value: 'applied', label: 'Applied' },
  { value: 'phone_screen', label: 'Phone Screen' },
  { value: 'interviewing', label: 'Interviewing' },
  { value: 'offer', label: 'Offer' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'ghosted', label: 'Ghosted' },
  { value: 'withdrawn', label: 'Withdrawn' },
]

interface StatusBadgeProps {
  job: Job
}

export function StatusBadge({ job }: StatusBadgeProps) {
  const [open, setOpen] = useState(false)
  const [promptOpen, setPromptOpen] = useState(false)
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (newStatus: JobStatus) =>
      updateJob(job.id, { status: newStatus }),
    onSuccess: (_, newStatus) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      queryClient.invalidateQueries({ queryKey: ['activity'] })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
      toast.success('Status updated!')
      if (newStatus !== job.status && INTERVIEW_TRIGGER_STATUSES.includes(newStatus)) {
        setPromptOpen(true)
      }
    },
    onError: () => {
      toast.error('Failed to update status')
    },
  })

  const handleStatusChange = (newStatus: JobStatus) => {
    mutation.mutate(newStatus)
    setOpen(false)
  }

  const config = getStatusConfig(job.status)

  return (
    <>
      <ScheduleInterviewPrompt
        open={promptOpen}
        onOpenChange={setPromptOpen}
        jobId={job.id}
      />
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              'inline-flex items-center gap-[5px] rounded-full px-[9px] py-[3px] text-[11px] font-medium transition-opacity hover:opacity-80',
              'focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
              'disabled:pointer-events-none disabled:opacity-50',
              config.badgeClass
            )}
            disabled={mutation.isPending}
            aria-label={`Change status. Current status: ${config.label}`}
          >
            <span
              className="h-[6px] w-[6px] rounded-full shrink-0"
              style={{ backgroundColor: config.color }}
            />
            {config.label}
            <ChevronDown className="h-[10px] w-[10px]" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="w-40">
          {(job.status === 'wishlist'
            ? STATUS_OPTIONS.filter((o) => !TERMINAL_STATUSES.includes(o.value))
            : STATUS_OPTIONS
          ).map((option) => {
            const optionConfig = STATUS_CONFIG[option.value]
            return (
              <DropdownMenuItem
                key={option.value}
                onClick={() => handleStatusChange(option.value)}
                disabled={mutation.isPending}
                className="cursor-pointer"
              >
                <div className="flex w-full items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: optionConfig.color }}
                    />
                    <span>{option.label}</span>
                  </div>
                  {job.status === option.value && (
                    <Check className="text-primary h-4 w-4" />
                  )}
                </div>
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
