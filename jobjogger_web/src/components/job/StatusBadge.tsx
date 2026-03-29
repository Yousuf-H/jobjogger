import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Check, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { getStatusConfig } from '@/lib/statusConfig'
import { cn } from '@/lib/utils'
import { updateJob } from '@/services/api/jobs'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Job, JobStatus } from '@/types/job'

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
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (newStatus: JobStatus) =>
      updateJob(job.id, { status: newStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      toast.success('Status updated!')
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
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium transition-opacity hover:opacity-80',
            'focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
            'disabled:pointer-events-none disabled:opacity-50',
            config.badgeClass
          )}
          disabled={mutation.isPending}
          aria-label={`Change status. Current status: ${config.label}`}
        >
          {config.label}
          <ChevronDown className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-38">
        {STATUS_OPTIONS.map((option) => {
          const optionConfig = getStatusConfig(option.value)
          return (
            <DropdownMenuItem
              key={option.value}
              onClick={() => handleStatusChange(option.value)}
              disabled={mutation.isPending}
              className="cursor-pointer"
            >
              <div className="flex w-full items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      'h-2.5 w-2.5 rounded-full',
                      optionConfig.badgeClass
                    )}
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
  )
}
