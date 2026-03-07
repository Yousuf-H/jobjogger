import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Check, ChevronDown } from 'lucide-react'

import { updateJob } from '@/services/api/jobs'
import { Badge } from '@/components/ui/badge'
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
        <Badge
          variant={getStatusVariant(job.status)}
          className="cursor-pointer gap-1 px-3 py-1 text-sm capitalize transition-opacity hover:opacity-80"
        >
          {currentLabel}
          <ChevronDown className="h-4 w-4" />
        </Badge>
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
