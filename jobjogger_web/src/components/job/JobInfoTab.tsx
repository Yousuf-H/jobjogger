import { Card, CardContent } from '@/components/ui/card'
import type { Job } from '@/types/job'
import { Separator } from '@/components/ui/separator'

export function JobInfoTab({ job }: { job: Job }) {
  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })

  return (
    <Card>
      <CardContent className="mt-4 space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {job?.employment_type && (
            <div>
              <p className="text-sm font-medium">Employment Type</p>
              <p className="text-muted-foreground text-sm capitalize">
                {job.employment_type.replaceAll('_', ' ')}
              </p>
            </div>
          )}

          {job?.salary_range && (
            <div>
              <p className="text-sm font-medium">Salary Range</p>
              <p className="text-muted-foreground text-sm">
                {job.salary_range}
              </p>
            </div>
          )}

          {job?.source && (
            <div>
              <p className="text-sm font-medium">Source</p>
              <p className="text-muted-foreground text-sm capitalize">
                {job.source.replaceAll('_', ' ')}
              </p>
            </div>
          )}

          {job?.job_url && (
            <div>
              <p className="text-sm font-medium">Job Posting</p>
              <a
                href={job.job_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                View Original Posting →
              </a>
            </div>
          )}

          {job?.date_applied && (
            <div>
              <p className="text-sm font-medium">Date Applied</p>
              <p className="text-muted-foreground text-sm">
                {formatDate(job.date_applied)}
              </p>
            </div>
          )}

          {job?.follow_up_date && (
            <div>
              <p className="text-sm font-medium">Follow-up Date</p>
              <p className="text-muted-foreground text-sm">
                {formatDate(job.follow_up_date)}
              </p>
            </div>
          )}
        </div>

        <Separator />

        {job?.job_description && (
          <div>
            <p className="text-muted-foreground whitespace-pre-wrap text-sm">
              {job.job_description}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
