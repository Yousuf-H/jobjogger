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
import type { UpdateJobFormValues } from '@/lib/validations/job'
import { updateJob } from '@/services/api/jobs'
import type { Job } from '@/types/job'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { toast } from 'sonner'

interface EditJobDialogProps {
  job: Job
  trigger?: ReactNode
}

export default function EditJobDialog({ job, trigger }: EditJobDialogProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (jobData: Job) => updateJob(job.id, jobData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      queryClient.invalidateQueries({ queryKey: ['jobs', job.id.toString()] })
      toast.success('Job updated successfully!')
      setOpen(false)
    },
    onError: (error: AxiosError<{ errors: string[] }>) => {
      const message =
        error.response?.data?.errors?.[0] || 'Failed to update job'
      toast.error(message)
    },
  })

  const handleSubmit = (formData: UpdateJobFormValues) => {
    const updatedJob: Job = {
      ...job,
      ...formData,
      tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()) : [],
    }

    mutation.mutate(updatedJob)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="cursor-pointer" variant="outline">
            Edit Job
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Job</DialogTitle>
          <DialogDescription>
            Fill in the details to update the job application
          </DialogDescription>
        </DialogHeader>

        <JobForm
          key={open ? 'open' : 'closed'}
          defaultValues={{
            company_name: job.company_name,
            job_title: job.job_title,
            status: job.status,
            job_url: job.job_url || '',
            location: job.location || '',
            employment_type: job.employment_type || undefined,
            salary_range: job.salary_range || '',
            source: job.source || undefined,
            source_other: job.source_other || '',
            priority: job.priority || undefined,
            tags: job.tags.join(', '),
          }}
          onSubmit={handleSubmit}
          isSubmitting={mutation.isPending}
          mode="edit"
        />
      </DialogContent>
    </Dialog>
  )
}
