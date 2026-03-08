import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'

import { fetchJob } from '@/services/api/jobs'
import { JobTabs } from '@/components/job/JobTabs'
import EditJobDialog from '@/components/job/EditJobDialog'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

import type { ElementType, ReactNode } from 'react'
import {
  ArrowLeft,
  Clock,
  ExternalLink,
  Globe,
  Link as LinkIcon,
  MapPin,
  Star,
  Tag as TagIcon,
} from 'lucide-react'
import { ActionsCell } from './DashboardPage/ActionsCell'
import { useJobActions } from '@/hooks/useJobActions'
import { StatusBadge } from '@/components/job/StatusBadge'

function normalizeUrl(url: string): string {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `https://${url}`
}

function formatRelativeDate(dateString?: string | null): string {
  if (!dateString) return 'Not available'
  return formatDistanceToNow(new Date(dateString), { addSuffix: true })
}

function formatLabel(value?: string | null): string {
  if (!value) return ''
  return value.replaceAll('_', ' ')
}

interface SnapshotFieldProps {
  icon: ElementType
  label: string
  value?: string | null
  placeholder: string
  capitalize?: boolean
  children?: ReactNode
}

function SnapshotField({
  icon: Icon,
  label,
  value,
  placeholder,
  capitalize = false,
  children,
}: SnapshotFieldProps) {
  const hasValue = Boolean(value)

  return (
    <div className="rounded-lg border p-4">
      <div className="mb-2 flex items-center gap-2">
        <Icon className="text-muted-foreground h-4 w-4" />
        <p className="text-muted-foreground text-sm font-medium">{label}</p>
      </div>

      {children ? (
        children
      ) : hasValue ? (
        <p className={`font-medium ${capitalize ? 'capitalize' : ''}`}>
          {value}
        </p>
      ) : (
        <p className="text-muted-foreground text-sm">{placeholder}</p>
      )}
    </div>
  )
}

export default function JobDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { archiveMutation, unarchiveMutation, deleteMutation } = useJobActions()

  const { data, isLoading, error } = useQuery({
    queryKey: ['jobs', id],
    queryFn: () => fetchJob(Number(id)),
  })

  if (isLoading) {
    return <div className="p-8">Loading...</div>
  }

  if (error) {
    return <div className="p-8">Error: {error.message}</div>
  }

  if (!data?.job) {
    return <div className="p-8">Job not found</div>
  }

  const { job, timeline_entries } = data

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-5xl px-6 py-6">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate('/jobs')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Jobs
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

        <section className="mb-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge job={job} />

              <div className="text-muted-foreground flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  <span>Updated {formatRelativeDate(job.updated_at)}</span>
                </div>

                {job.source ? (
                  <div className="flex items-center gap-1.5 capitalize">
                    <Globe className="h-4 w-4" />
                    <span>{formatLabel(job.source)}</span>
                  </div>
                ) : null}
              </div>
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {job.job_title || 'Untitled role'}
              </h1>
              <p className="text-muted-foreground mt-2 text-lg">
                {job.company_name || 'No company recorded'}
              </p>
            </div>
          </div>
        </section>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Job Snapshot</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <SnapshotField
                icon={MapPin}
                label="Location"
                value={job.location}
                placeholder="No location recorded"
                capitalize
              />

              <SnapshotField
                icon={Star}
                label="Priority"
                value={job.priority}
                placeholder="No priority set"
                capitalize
              />

              <SnapshotField
                icon={Globe}
                label="Source"
                value={formatLabel(job.source)}
                placeholder="No source recorded"
                capitalize
              />

              <SnapshotField
                icon={Clock}
                label="Last updated"
                value={formatRelativeDate(job.updated_at)}
                placeholder="Not available"
              />

              <SnapshotField
                icon={LinkIcon}
                label="Job link"
                value={job.job_url}
                placeholder="No job link saved"
              >
                {job.job_url ? (
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={normalizeUrl(job.job_url)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View job posting
                    </a>
                  </Button>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No job link saved
                  </p>
                )}
              </SnapshotField>

              <SnapshotField
                icon={TagIcon}
                label="Tags"
                placeholder="No tags added yet"
              >
                {job.tags && job.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {job.tags.map((tag: string, index: number) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="capitalize"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No tags added yet
                  </p>
                )}
              </SnapshotField>
            </div>
          </CardContent>
        </Card>

        <section>
          <JobTabs job={job} timelineEntries={timeline_entries || []} />
        </section>
      </div>
    </div>
  )
}
