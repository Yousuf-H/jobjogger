import { JobForm } from '@/components/job/JobForm'
import { ScheduleInterviewPrompt } from '@/components/job/ScheduleInterviewPrompt'
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

const INTERVIEW_TRIGGER_STATUSES = ['phone_screen', 'interviewing']

interface EditJobDialogProps {
  job: Job
  trigger?: ReactNode
}

export default function EditJobDialog({ job, trigger }: EditJobDialogProps) {
  const [open, setOpen] = useState(false)
  const [promptOpen, setPromptOpen] = useState(false)
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (jobData: Job) => updateJob(job.id, jobData),
    onSuccess: (_, jobData) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      queryClient.invalidateQueries({ queryKey: ['jobs', job.id.toString()] })
      toast.success('Job updated successfully!')
      setOpen(false)
      const statusChanged = jobData.status !== job.status
      if (statusChanged && INTERVIEW_TRIGGER_STATUSES.includes(jobData.status)) {
        setPromptOpen(true)
      }
    },
    onError: (
      error: AxiosError<{ status?: { message?: string }; errors?: string[] }>
    ) => {
      const message =
        error.response?.data?.status?.message ||
        error.response?.data?.errors?.[0] ||
        'Failed to update job'
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
    <>
    <ScheduleInterviewPrompt
      open={promptOpen}
      onOpenChange={setPromptOpen}
      jobId={job.id}
    />
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
            date_applied: job.date_applied || '',
            follow_up_date: job.follow_up_date || '',
          }}
          onSubmit={handleSubmit}
          isSubmitting={mutation.isPending}
          mode="edit"
        />
      </DialogContent>
    </Dialog>
    </>
  )
}
