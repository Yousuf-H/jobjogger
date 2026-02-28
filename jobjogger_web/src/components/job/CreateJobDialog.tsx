import { useState } from 'react'
import { AxiosError } from 'axios'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { JobForm } from '@/components/job/JobForm'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createJob } from '@/services/api/jobs'
import type { CreateJobFormValues } from '@/lib/validations/job'
import { toast } from 'sonner'

export default function CreateJobDialog() {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: createJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      toast.success('Job created successfully!')
      setOpen(false)
    },
    onError: (error: AxiosError<{ errors: string[] }>) => {
      const message =
        error.response?.data?.errors?.[0] || 'Failed to create job'
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
        <Button className="cursor-pointer" variant="outline">+ New Job</Button>
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
        />
      </DialogContent>
    </Dialog>
  )
}
