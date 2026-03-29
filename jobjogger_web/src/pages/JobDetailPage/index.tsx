import ActionsCell from '@/components/job/ActionsCell'
import EditJobDialog from '@/components/job/EditJobDialog'
import { JobTabs } from '@/components/job/JobTabs'
import { StatusBadge } from '@/components/job/StatusBadge'
import { PageError } from '@/components/layout/PageError'
import { PageLoading } from '@/components/layout/PageLoading'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useJob } from '@/hooks/useJob'
import { useJobActions } from '@/hooks/useJobActions'
import { usePageTitle } from '@/hooks/usePageTitle'
import { getPriorityConfig, getStatusConfig } from '@/lib/statusConfig'
import { TypographyH1 } from '@/components/ui/typography'
import { formatDistanceToNow } from 'date-fns'
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  CalendarClock,
  Clock,
  DollarSign,
  ExternalLink,
  Globe,
  MapPin,
  Star,
  Tag as TagIcon,
} from 'lucide-react'
import type { ElementType } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

function formatRelativeDate(dateString?: string | null): string {
  if (!dateString) return 'Not available'
  return formatDistanceToNow(new Date(dateString), { addSuffix: true })
}

function formatLabel(value?: string | null): string {
  if (!value) return ''
  return value.replaceAll('_', ' ')
}

function formatDate(dateString?: string | null): string {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function MetaItem({
  icon: Icon,
  children,
}: {
  icon: ElementType
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-1.5 text-sm">
      <Icon className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
      <span>{children}</span>
    </div>
  )
}

function QuickStat({
  icon: Icon,
  label,
  value,
  iconClassName,
}: {
  icon: ElementType
  label: string
  value: string
  iconClassName?: string
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex size-9 items-center justify-center rounded-lg ${iconClassName ?? 'bg-muted text-muted-foreground'}`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-muted-foreground text-xs">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  )
}

export default function JobDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { archiveMutation, unarchiveMutation, deleteMutation } = useJobActions({
    onDeleteSuccess: () => {
      navigate('/jobs')
    },
  })

  const { data, isLoading, error } = useJob(id)

  const job = data?.job
  usePageTitle(
    job?.job_title ? `${job.job_title} — ${job.company_name}` : 'Job Detail'
  )

  if (isLoading) return <PageLoading variant="detail" />
  if (error) return <PageError message={error.message} />
  if (!job)
    return (
      <PageError
        title="Job not found"
        message="This job may have been deleted."
      />
    )

  const { timeline_entries } = data!
  const statusConfig = getStatusConfig(job.status)
  const priorityConfig = job.priority ? getPriorityConfig(job.priority) : null

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-5xl px-6 py-6">
        {/* Top bar */}
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="flex items-center gap-2">
            <EditJobDialog job={job} />
            <ActionsCell
              jobId={job.id}
              isArchived={Boolean(job.archived_at)}
              onArchive={archiveMutation.mutate}
              onUnarchive={unarchiveMutation.mutate}
              onDelete={deleteMutation.mutate}
            />
          </div>
        </div>

        {/* Header card */}
        <Card className="mb-6 overflow-hidden border-0 shadow-sm">
          {/* Status accent bar */}
          <div
            className="h-1.5"
            style={{ backgroundColor: statusConfig.color }}
          />

          <CardContent className="p-6">
            {/* Top row: status + priority + meta */}
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <StatusBadge job={job} />
              {priorityConfig && (
                <Badge variant="outline" className="gap-1 capitalize">
                  <Star className="h-3 w-3" />
                  {priorityConfig.label} priority
                </Badge>
              )}
              <Separator
                orientation="vertical"
                className="hidden h-4 sm:block"
              />
              <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                <MetaItem icon={Clock}>
                  Updated {formatRelativeDate(job.updated_at)}
                </MetaItem>
                {job.source && (
                  <MetaItem icon={Globe}>
                    <span className="capitalize">
                      {formatLabel(job.source)}
                    </span>
                  </MetaItem>
                )}
              </div>
            </div>

            {/* Title */}
            <TypographyH1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {job.job_title || 'Untitled role'}
            </TypographyH1>
            <p className="text-muted-foreground mt-1 text-base">
              {job.company_name || 'No company recorded'}
            </p>

            {/* Quick stats row */}
            <div className="mt-6 grid grid-cols-2 gap-4 border-t pt-5 sm:flex sm:flex-wrap sm:gap-6">
              {job.location && (
                <QuickStat
                  icon={MapPin}
                  label="Location"
                  value={job.location}
                  iconClassName="bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300"
                />
              )}
              {job.employment_type && (
                <QuickStat
                  icon={Briefcase}
                  label="Type"
                  value={formatLabel(job.employment_type)}
                  iconClassName="bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-300"
                />
              )}
              {job.salary_range && (
                <QuickStat
                  icon={DollarSign}
                  label="Salary"
                  value={job.salary_range}
                  iconClassName="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300"
                />
              )}
              {job.date_applied && (
                <QuickStat
                  icon={Calendar}
                  label="Applied"
                  value={formatDate(job.date_applied)}
                  iconClassName="bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300"
                />
              )}
              {job.follow_up_date && (
                <QuickStat
                  icon={CalendarClock}
                  label="Follow up"
                  value={formatDate(job.follow_up_date)}
                  iconClassName="bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-300"
                />
              )}
              {job.job_url && (
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-300">
                    <ExternalLink className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Posting</p>
                    <a
                      href={
                        job.job_url.startsWith('http')
                          ? job.job_url
                          : `https://${job.job_url}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-sky-600 hover:underline dark:text-sky-400"
                    >
                      View original
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Tags */}
            {job.tags && job.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-4">
                <TagIcon className="text-muted-foreground h-3.5 w-3.5" />
                {job.tags.map((tag: string, index: number) => (
                  <Badge key={index} variant="secondary" className="capitalize">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs */}
        <section>
          <JobTabs job={job} timelineEntries={timeline_entries || []} />
        </section>
      </div>
    </div>
  )
}
