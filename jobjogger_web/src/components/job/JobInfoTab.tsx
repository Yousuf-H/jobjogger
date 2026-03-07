import { Card, CardContent } from '@/components/ui/card'
import type { Job } from '@/types/job'
import { Separator } from '@/components/ui/separator'
import { FileText } from 'lucide-react'
import EditJobDialog from '@/components/job/EditJobDialog'
import { Button } from '../ui/button'

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function InfoItem({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <p className="text-sm font-medium">{label}</p>
      <div className="text-muted-foreground mt-1 text-sm">{children}</div>
    </div>
  )
}

function EmptyJobInfoState({ job }: { job: Job }) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed px-6 py-10 text-center">
      <div className="bg-muted mb-4 rounded-full p-3">
        <FileText className="text-muted-foreground h-5 w-5" />
      </div>

      <h3 className="text-lg font-semibold">No job details added yet</h3>

      <p className="text-muted-foreground mt-2 max-w-md text-sm leading-6">
        Add details like employment type, salary range, source, dates, job link,
        or a description to make this job easier to track.
      </p>

      <EditJobDialog
        job={job}
        trigger={<Button className="mt-5">Add job details</Button>}
      />
    </div>
  )
}

export function JobInfoTab({ job }: { job: Job }) {
  const hasTopLevelInfo =
    Boolean(job?.employment_type) ||
    Boolean(job?.salary_range) ||
    Boolean(job?.source) ||
    Boolean(job?.job_url) ||
    Boolean(job?.date_applied) ||
    Boolean(job?.follow_up_date)

  const hasDescription = Boolean(job?.job_description?.trim())

  const hasAnyJobInfo = hasTopLevelInfo || hasDescription

  if (!hasAnyJobInfo) {
    return (
      <Card>
        <CardContent className="p-6">
          <EmptyJobInfoState job={job} />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-6">
        {hasTopLevelInfo ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {job?.employment_type && (
              <InfoItem label="Employment Type">
                <span className="capitalize">
                  {job.employment_type.replaceAll('_', ' ')}
                </span>
              </InfoItem>
            )}

            {job?.salary_range && (
              <InfoItem label="Salary Range">{job.salary_range}</InfoItem>
            )}

            {job?.source && (
              <InfoItem label="Source">
                <span className="capitalize">
                  {job.source.replaceAll('_', ' ')}
                </span>
              </InfoItem>
            )}

            {job?.job_url && (
              <InfoItem label="Job Posting">
                <a
                  href={
                    job.job_url.startsWith('http://') ||
                    job.job_url.startsWith('https://')
                      ? job.job_url
                      : `https://${job.job_url}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  View original posting →
                </a>
              </InfoItem>
            )}

            {job?.date_applied && (
              <InfoItem label="Date Applied">
                {formatDate(job.date_applied)}
              </InfoItem>
            )}

            {job?.follow_up_date && (
              <InfoItem label="Follow-up Date">
                {formatDate(job.follow_up_date)}
              </InfoItem>
            )}
          </div>
        ) : null}

        {hasTopLevelInfo && hasDescription ? (
          <Separator className="my-6" />
        ) : null}

        {hasDescription ? (
          <div>
            <p className="text-sm font-medium">Job Description</p>
            <p className="text-muted-foreground mt-2 whitespace-pre-wrap text-sm leading-6">
              {job.job_description}
            </p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
