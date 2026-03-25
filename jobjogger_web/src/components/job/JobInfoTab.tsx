import EditJobDialog from '@/components/job/EditJobDialog'
import { Card, CardContent } from '@/components/ui/card'
import { Markdown } from '@/components/ui/markdown'
import { Separator } from '@/components/ui/separator'
import type { Job } from '@/types/job'
import {
  BriefcaseBusiness,
  Calendar,
  CalendarClock,
  DollarSign,
  ExternalLink,
  FileText,
  Globe,
} from 'lucide-react'
import type { ElementType, ReactNode } from 'react'
import { Button } from '../ui/button'

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function normalizeUrl(url: string) {
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `https://${url}`
}

function InfoItem({
  label,
  icon: Icon,
  children,
  tone = 'default',
}: {
  label: string
  icon: ElementType
  children: ReactNode
  tone?: 'default' | 'success' | 'warning' | 'info'
}) {
  const toneStyles = {
    default: 'border-border bg-card/80',
    success:
      'border-emerald-200 bg-emerald-50/70 dark:border-emerald-900 dark:bg-emerald-950/30',
    warning:
      'border-amber-200 bg-amber-50/70 dark:border-amber-900 dark:bg-amber-950/30',
    info: 'border-blue-200 bg-blue-50/70 dark:border-blue-900 dark:bg-blue-950/30',
  }

  const iconStyles = {
    default: 'bg-muted text-muted-foreground',
    success:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300',
    warning:
      'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300',
    info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300',
  }

  return (
    <div
      className={`hover:bg-accent/40 rounded-xl border p-4 shadow-sm transition-colors ${toneStyles[tone]}`}
    >
      <div className="mb-3 flex items-center gap-3">
        <div className={`rounded-lg p-2 ${iconStyles[tone]}`}>
          <Icon className="h-4 w-4" />
        </div>
        <p className="text-muted-foreground text-sm font-medium">{label}</p>
      </div>

      <div className="text-sm font-medium leading-6">{children}</div>
    </div>
  )
}

function EmptyJobInfoState({ job }: { job: Job }) {
  return (
    <div className="from-muted/50 to-background flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed bg-gradient-to-b px-6 py-10 text-center">
      <div className="mb-4 rounded-full bg-blue-100 p-4 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
        <FileText className="h-6 w-6" />
      </div>

      <h3 className="text-xl font-semibold tracking-tight">
        No job details added yet
      </h3>

      <p className="text-muted-foreground mt-3 max-w-md text-sm leading-6">
        Add employment type, salary, source, dates, a job link, or a description
        to make this role easier to review and track later.
      </p>

      <EditJobDialog
        job={job}
        trigger={<Button className="mt-6 shadow-sm">Add job details</Button>}
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
      <Card className="border-border/70 shadow-sm">
        <CardContent className="p-6">
          <EmptyJobInfoState job={job} />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/70 from-card to-card/80 bg-gradient-to-b shadow-sm">
      <CardContent className="p-6">
        {hasTopLevelInfo ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {job?.employment_type && (
              <InfoItem label="Employment Type" icon={BriefcaseBusiness}>
                <span className="capitalize">
                  {job.employment_type.replaceAll('_', ' ')}
                </span>
              </InfoItem>
            )}

            {job?.salary_range && (
              <InfoItem label="Salary Range" icon={DollarSign} tone="success">
                <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                  {job.salary_range}
                </span>
              </InfoItem>
            )}

            {job?.source && (
              <InfoItem label="Source" icon={Globe}>
                <span className="capitalize">
                  {job.source.replaceAll('_', ' ')}
                </span>
              </InfoItem>
            )}

            {job?.job_url && (
              <InfoItem label="Job Posting" icon={ExternalLink} tone="info">
                <a
                  href={normalizeUrl(job.job_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-1 text-blue-600 hover:underline dark:text-blue-400"
                >
                  View original posting
                  <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              </InfoItem>
            )}

            {job?.date_applied && (
              <InfoItem label="Date Applied" icon={Calendar}>
                {formatDate(job.date_applied)}
              </InfoItem>
            )}

            {job?.follow_up_date && (
              <InfoItem
                label="Follow-up Date"
                icon={CalendarClock}
                tone="warning"
              >
                <span className="font-medium text-amber-700 dark:text-amber-300">
                  {formatDate(job.follow_up_date)}
                </span>
              </InfoItem>
            )}
          </div>
        ) : null}

        {hasTopLevelInfo && hasDescription ? (
          <Separator className="my-8" />
        ) : null}

        {hasDescription ? (
          <div className="bg-muted/30 rounded-2xl border p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="bg-muted rounded-lg p-2">
                <FileText className="text-muted-foreground h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold">Job Description</p>
                <p className="text-muted-foreground text-xs">
                  Formatted from the original listing
                </p>
              </div>
            </div>

            <Markdown>{job.job_description}</Markdown>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
