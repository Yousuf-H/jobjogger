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
import { getCurrentUserId } from '@/lib/auth'
import { extractErrorMessage } from '@/lib/errors'
import { QUERY_KEYS } from '@/lib/queryKeys'
import { updateJob } from '@/services/api/jobs'
import type { Job } from '@/types/job'
import { useMutation, useQueryClient } from '@tanstack/react-query'
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
      const userId = getCurrentUserId()
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.jobs.byUser(userId) })
      toast.success('Job updated successfully!')
      setOpen(false)
      const statusChanged = jobData.status !== job.status
      if (statusChanged && INTERVIEW_TRIGGER_STATUSES.includes(jobData.status)) {
        setPromptOpen(true)
      }
    },
    onError: (error: unknown) => {
      toast.error(extractErrorMessage(error, 'Failed to update job'))
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
          <DialogTitle>Edit job</DialogTitle>
          <DialogDescription className="sr-only">
            Update the details for this job application.
          </DialogDescription>
        </DialogHeader>

        {/* TODO: replace key trick with form.reset() in onOpenChange — requires lifting useForm to dialog scope */}
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
            application_deadline: job.application_deadline || '',
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
