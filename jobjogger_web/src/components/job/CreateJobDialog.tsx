import type React from 'react'
import { JobForm } from '@/components/job/JobForm'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import type { CreateJobFormValues } from '@/lib/validations/job'
import { extractErrorMessage } from '@/lib/errors'
import { createJob } from '@/services/api/jobs'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export default function CreateJobDialog({
  className,
  trigger,
}: {
  className?: string
  trigger?: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: createJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      queryClient.invalidateQueries({ queryKey: ['activity'] })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
      toast.success('Job created successfully!')
      setOpen(false)
    },
    onError: (error: unknown) => {
      toast.error(extractErrorMessage(error, 'Failed to create job'))
    },
  })

  const handleSubmit = (data: CreateJobFormValues) => {
    const jobData = {
      ...data,
      tags: data.tags ? data.tags.split(',').map((t) => t.trim()) : [],
    }
    mutation.mutate(jobData)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" variant="default" className={`min-w-36 ${className ?? ''}`}>
            <Plus className="mr-1.5 h-4 w-4" />
            New Job
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add job</DialogTitle>
          <DialogDescription className="sr-only">
            Fill in the details to add a new job application.
          </DialogDescription>
        </DialogHeader>
        <JobForm
          key={open ? 'open' : 'closed'}
          onSubmit={handleSubmit}
          isSubmitting={mutation.isPending}
          mode="create"
        />
      </DialogContent>
    </Dialog>
  )
}
