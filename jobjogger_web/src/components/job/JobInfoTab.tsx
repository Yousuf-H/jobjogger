import EditJobDialog from '@/components/job/EditJobDialog'
import { Markdown } from '@/components/ui/markdown'
import { Button } from '@/components/ui/button'
import type { Job } from '@/types/job'
import { FileText } from 'lucide-react'

export function JobInfoTab({ job }: { job: Job }) {
  const hasDescription = Boolean(job?.job_description?.trim())

  if (!hasDescription) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center px-6 py-10 text-center">
        <div className="mb-4 rounded-full bg-blue-100 p-3 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
          <FileText className="h-5 w-5" />
        </div>

        <h3 className="text-base font-semibold">No job description yet</h3>
        <p className="text-muted-foreground mt-2 max-w-md text-sm">
          Paste the original job listing here to reference requirements, tech
          stack, and responsibilities when preparing for interviews.
        </p>

        <EditJobDialog
          job={job}
          trigger={
            <Button variant="outline" size="sm" className="mt-4">
              Add description
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      <Markdown>{job.job_description}</Markdown>
    </div>
  )
}
