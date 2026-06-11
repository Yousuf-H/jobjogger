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
import { createJob } from '@/services/api/jobs'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
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
      toast.success('Job created successfully!')
      setOpen(false)
    },
    onError: (
      error: AxiosError<{ status?: { message?: string }; errors?: string[] }>
    ) => {
      const message =
        error.response?.data?.status?.message ||
        error.response?.data?.errors?.[0] ||
        'Failed to create job'
      toast.error(message)
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
          <Button size="sm" variant="success" className={`min-w-36 ${className ?? ''}`}>
            <Plus className="mr-1.5 h-4 w-4" />
            New Job
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Job</DialogTitle>
          <DialogDescription>
            Fill in the details to add a new job application
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
