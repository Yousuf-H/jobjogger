import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Check, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

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

type StatusVariant =
  | 'success'
  | 'destructive'
  | 'warning'
  | 'secondary'
  | 'outline'

function getStatusVariant(status: string): StatusVariant {
  switch (status) {
    case 'offer':
    case 'accepted':
      return 'success'
    case 'rejected':
    case 'ghosted':
      return 'destructive'
    case 'interviewing':
    case 'phone_screen':
      return 'secondary'
    case 'applied':
      return 'warning'
    case 'wishlist':
    case 'withdrawn':
      return 'outline'
    default:
      return 'secondary'
  }
}

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
      queryClient.invalidateQueries({ queryKey: ['jobs', job.id.toString()] })
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

  const currentLabel =
    STATUS_OPTIONS.find((opt) => opt.value === job.status)?.label ||
    job.status.replace('_', ' ')

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium capitalize transition-opacity hover:opacity-80',
            'focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
            'disabled:pointer-events-none disabled:opacity-50',
            getStatusVariant(job.status) === 'success' &&
              'bg-success text-success-foreground',
            getStatusVariant(job.status) === 'destructive' &&
              'bg-destructive text-destructive-foreground',
            getStatusVariant(job.status) === 'warning' &&
              'bg-warning text-warning-foreground',
            getStatusVariant(job.status) === 'secondary' &&
              'bg-secondary text-secondary-foreground',
            getStatusVariant(job.status) === 'outline' &&
              'border-input bg-background hover:bg-accent hover:text-accent-foreground border'
          )}
          disabled={mutation.isPending}
          aria-label={`Change status. Current status: ${currentLabel}`}
        >
          {currentLabel}
          <ChevronDown className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-38">
        {STATUS_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleStatusChange(option.value)}
            disabled={mutation.isPending}
            className="cursor-pointer"
          >
            <div className="flex w-full items-center justify-between">
              <span>{option.label}</span>
              {job.status === option.value && (
                <Check className="text-primary h-4 w-4" />
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
