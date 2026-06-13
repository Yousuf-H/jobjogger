import ActionsCell from '@/components/job/ActionsCell'
import EditJobDialog from '@/components/job/EditJobDialog'
import { JobTabs } from '@/components/job/JobTabs'
import { StatusBadge } from '@/components/job/StatusBadge'
import { PageError } from '@/components/layout/PageError'
import { PageLoading } from '@/components/layout/PageLoading'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useJob } from '@/hooks/useJob'
import { useJobActions } from '@/hooks/useJobActions'
import { useOrganisations } from '@/hooks/useOrganisations'
import { usePageTitle } from '@/hooks/usePageTitle'
import { getPriorityConfig } from '@/lib/statusConfig'
import { cn } from '@/lib/utils'
import { updateJob } from '@/services/api/jobs'
import { formatDistanceToNow, parseISO, format } from 'date-fns'
import {
  ArrowLeft,
  Bell,
  Briefcase,
  Building2,
  Calendar,
  ExternalLink,
  Link2Off,
  MapPin,
  Pencil,
  Star,
} from 'lucide-react'
import type { ElementType } from 'react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

function formatDateDisplay(dateString?: string | null): string {
  if (!dateString) return '—'
  const d = parseISO(dateString.split('T')[0])
  return format(d, 'd MMM yyyy')
}

function formatLabel(value?: string | null): string {
  if (!value) return ''
  return value.replaceAll('_', ' ')
}

type MetaItemProps = {
  icon: ElementType
  label: string
  value: React.ReactNode
  valueClass?: string
}

function MetaItem({ icon: Icon, label, value, valueClass }: MetaItemProps) {
  return (
    <div className="flex items-center gap-[8px] pr-[20px] mr-[20px] border-r border-border last:border-r-0 last:pr-0 last:mr-0">
      <div className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-[6px] bg-muted border border-border/60">
        <Icon className="h-[13px] w-[13px] text-muted-foreground" />
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] text-muted-foreground leading-tight">{label}</span>
        <span className={cn('text-[12px] font-medium text-foreground/80 leading-tight', valueClass)}>
          {value}
        </span>
      </div>
    </div>
  )
}

function OrgRow({ jobId, organisationId }: { jobId: number; organisationId?: number | null }) {
  const queryClient = useQueryClient()
  const { data: organisations } = useOrganisations()
  const org = organisations?.find((o) => o.id === organisationId)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [hoverDetach, setHoverDetach] = useState(false)

  const detachMutation = useMutation({
    mutationFn: () => updateJob(jobId, { organisation_id: null }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      toast.success('Organisation detached.')
    },
    onError: () => {
      toast.error('Failed to detach organisation')
    },
  })

  if (!org) return null

  return (
    <>
      <div className="rounded-[10px] border border-border bg-card p-[11px_16px]">
        <div className="flex items-center gap-[12px]">
          <div className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-[7px] bg-muted border border-border">
            <Building2 className="h-[15px] w-[15px] text-muted-foreground" />
          </div>
          <div className="flex flex-1 flex-col min-w-0">
            <span className="text-[13px] font-medium text-foreground truncate">{org.name}</span>
            {org.industry && (
              <span className="text-[11px] text-muted-foreground">{org.industry}</span>
            )}
          </div>
          <div className="flex items-center gap-[10px] shrink-0">
            <Link
              to={`/organisations/${org.id}`}
              className="text-[12px] font-medium text-[#2563EB] hover:underline"
            >
              View organisation
            </Link>
            <span className="text-border">|</span>
            <button
              onClick={() => setConfirmOpen(true)}
              onMouseEnter={() => setHoverDetach(true)}
              onMouseLeave={() => setHoverDetach(false)}
              disabled={detachMutation.isPending}
              className={cn(
                'flex items-center gap-1 rounded-[6px] px-[6px] py-[3px] text-[12px] transition-colors',
                hoverDetach
                  ? 'bg-red-50 text-[#DC2626] border border-red-200 dark:bg-red-950/30 dark:border-red-900 dark:text-red-400'
                  : 'text-muted-foreground'
              )}
            >
              <Link2Off className="h-[13px] w-[13px]" />
              Detach
            </button>
          </div>
        </div>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Detach this organisation?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{org.name}</strong> will be removed from this job. The organisation itself won't be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmOpen(false)
                detachMutation.mutate()
              }}
            >
              Detach
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default function JobDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { archiveMutation, unarchiveMutation, deleteMutation } = useJobActions({
    onDeleteSuccess: () => navigate('/jobs'),
  })

  const { data, isLoading, error } = useJob(id)
  const job = data?.job

  usePageTitle(job?.job_title ? `${job.job_title} — ${job.company_name}` : 'Job Detail')

  if (isLoading) return <PageLoading variant="detail" />
  if (error) return <PageError message={error.message} />
  if (!job) return <PageError title="Job not found" message="This job may have been deleted." />

  const { timeline_entries } = data!
  const priorityConfig = job.priority ? getPriorityConfig(job.priority) : null

  const metaItems: { icon: ElementType; label: string; value: React.ReactNode; valueClass?: string; show: boolean }[] = [
    {
      icon: MapPin,
      label: 'Location',
      value: job.location || '—',
      show: Boolean(job.location),
    },
    {
      icon: Briefcase,
      label: 'Type',
      value: job.employment_type ? formatLabel(job.employment_type) : '—',
      show: Boolean(job.employment_type),
    },
    {
      icon: Calendar,
      label: 'Applied',
      value: formatDateDisplay(job.date_applied),
      show: Boolean(job.date_applied),
    },
    {
      icon: Bell,
      label: 'Follow up',
      value: formatDateDisplay(job.follow_up_date),
      valueClass: job.follow_up_date ? 'text-[#D97706] dark:text-amber-400' : undefined,
      show: Boolean(job.follow_up_date),
    },
  ]

  const visibleMeta = metaItems.filter((m) => m.show)

  return (
    <div className="space-y-3">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/jobs')}
          className="flex items-center gap-1 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-[14px] w-[14px]" />
          Back to jobs
        </button>
        <div className="flex items-center gap-2">
          <EditJobDialog
            job={job}
            trigger={
              <button className="flex items-center gap-[6px] rounded-[7px] border border-border bg-card px-[12px] py-[6px] text-[12px] font-medium text-foreground/80 hover:bg-muted/50 transition-colors">
                <Pencil className="h-[13px] w-[13px]" />
                Edit job
              </button>
            }
          />
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
      <div className="rounded-[10px] border border-border bg-card p-[18px_20px]">
        {/* Badges row */}
        <div className="mb-[12px] flex flex-wrap items-center gap-[8px]">
          <StatusBadge job={job} />

          {priorityConfig && (
            <span className="inline-flex items-center gap-[4px] rounded-full border border-amber-200 bg-amber-50 px-[9px] py-[3px] text-[11px] font-medium text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400">
              <Star className="h-[11px] w-[11px]" />
              {priorityConfig.label} priority
            </span>
          )}

          {job.source && (
            <span className="inline-flex items-center rounded-full border border-border bg-muted px-[9px] py-[3px] text-[11px] font-medium text-muted-foreground capitalize">
              {formatLabel(job.source)}
            </span>
          )}

          <span className="text-[11px] text-muted-foreground ml-auto">
            Updated {formatDistanceToNow(new Date(job.updated_at), { addSuffix: true })}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-[20px] font-semibold tracking-tight text-foreground leading-tight mb-[5px]">
          {job.job_title || 'Untitled role'}
        </h1>

        {/* Company line */}
        <div className="flex items-center gap-[6px]">
          <div className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[4px] bg-blue-50 dark:bg-blue-950/40">
            <Building2 className="h-[11px] w-[11px] text-[#2563EB] dark:text-blue-400" />
          </div>
          <span className="text-[13px] font-medium text-foreground/80">{job.company_name}</span>
        </div>

        {/* Metadata strip */}
        {visibleMeta.length > 0 && (
          <div className="mt-[14px] pt-[14px] border-t border-border/60 flex flex-wrap items-center gap-y-[10px]">
            {visibleMeta.map((m, i) => (
              <MetaItem key={i} icon={m.icon} label={m.label} value={m.value} valueClass={m.valueClass} />
            ))}
            {job.job_url && (
              <div className="flex items-center gap-[8px]">
                <div className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-[6px] bg-muted border border-border/60">
                  <ExternalLink className="h-[13px] w-[13px] text-muted-foreground" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted-foreground leading-tight">Posting</span>
                  <a
                    href={job.job_url.startsWith('http') ? job.job_url : `https://${job.job_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[12px] font-medium text-[#2563EB] hover:underline leading-tight dark:text-blue-400"
                  >
                    View original
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Org row — only when linked */}
      {job.organisation_id && (
        <OrgRow jobId={job.id} organisationId={job.organisation_id} />
      )}

      {/* Tabs */}
      <JobTabs job={job} timelineEntries={timeline_entries || []} />
    </div>
  )
}
