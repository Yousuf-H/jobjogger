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
import { updateJob } from '@/services/api/jobs'
import type { UpdateJobFormValues } from '@/lib/validations/job'
import { toast } from 'sonner'
import type { Job } from '@/types/job'
import type { ReactNode } from 'react'

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
            job_description: job.job_description || '',
          }}
          onSubmit={handleSubmit}
          isSubmitting={mutation.isPending}
          mode="edit"
        />
      </DialogContent>
    </Dialog>
  )
}
