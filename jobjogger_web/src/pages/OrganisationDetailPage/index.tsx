import { OrgContactsTab } from '@/components/contact/OrgContactsTab'
import { PageError } from '@/components/layout/PageError'
import { PageLoading } from '@/components/layout/PageLoading'
import {
  OrganisationForm,
  type OrganisationFormValues,
} from '@/components/organisation/OrganisationForm'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useContacts } from '@/hooks/useContacts'
import {
  useOrganisation,
  useSimilarOrganisations,
} from '@/hooks/useOrganisation'
import { useOrganisationActions } from '@/hooks/useOrganisationActions'
import { usePageTitle } from '@/hooks/usePageTitle'
import { getStatusConfig } from '@/lib/statusConfig'
import { cn } from '@/lib/utils'
import type { OrgJob, Organisation } from '@/types/organisation'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRightLeft,
  Briefcase,
  ExternalLink,
  Globe,
  MoreVertical,
  Pencil,
  Star,
  Tag as TagIcon,
  Users,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

// ─── Star rating (read-only) ─────────────────────────────────────────────────

function StarRating({ rating }: { rating?: number | null }) {
  if (rating == null) {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star key={s} className="text-muted-foreground/25 h-3.5 w-3.5" />
        ))}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => {
          const fill = Math.min(Math.max(rating - (s - 1), 0), 1)
          return (
            <span key={s} className="relative h-3.5 w-3.5">
              <Star className="text-muted-foreground/25 h-3.5 w-3.5" />
              {fill > 0 && (
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${fill * 100}%` }}
                >
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                </span>
              )}
            </span>
          )
        })}
      </div>
      <span className="text-[12px] font-medium text-[#374151] dark:text-foreground/80 tabular-nums">
        {rating % 1 === 0 ? `${rating}.0` : rating}
      </span>
    </div>
  )
}

// ─── Meta item (matches job detail pattern) ──────────────────────────────────

function MetaItem({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-[8px] pr-[20px] mr-[20px] border-r border-[#E5E7EB] last:border-r-0 last:pr-0 last:mr-0 dark:border-border">
      <div className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-[6px] bg-[#F9FAFB] border border-[#F3F4F6] dark:bg-muted dark:border-border/60">
        <Icon className="h-[13px] w-[13px] text-[#9CA3AF] dark:text-muted-foreground" />
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] text-[#9CA3AF] leading-tight dark:text-muted-foreground">
          {label}
        </span>
        {children}
      </div>
    </div>
  )
}

// ─── Edit dialog ─────────────────────────────────────────────────────────────

function EditOrganisationDialog({
  org,
  trigger,
}: {
  org: Organisation
  trigger?: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const { updateMutation } = useOrganisationActions()

  const handleSubmit = (data: OrganisationFormValues) => {
    updateMutation.mutate(
      { id: org.id, data },
      { onSuccess: () => setOpen(false) }
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm">
            <Pencil className="mr-1.5 h-3.5 w-3.5" />
            Edit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit organisation</DialogTitle>
          <DialogDescription className="sr-only">
            Update the details for this organisation.
          </DialogDescription>
        </DialogHeader>
        <OrganisationForm
          key={open ? 'open' : 'closed'}
          onSubmit={handleSubmit}
          defaultValues={{
            name: org.name,
            website: org.website ?? '',
            industry: org.industry ?? '',
            size: org.size ?? undefined,
            rating: org.rating != null ? Number(org.rating) : null,
            notes: org.notes ?? '',
          }}
          isSubmitting={updateMutation.isPending}
          mode="edit"
        />
      </DialogContent>
    </Dialog>
  )
}

// ─── Review banner ───────────────────────────────────────────────────────────

function ReviewBanner({ org }: { org: Organisation }) {
  const { mergeMutation, dismissReviewMutation } = useOrganisationActions()
  const { data: similar, isLoading } = useSimilarOrganisations(
    String(org.id),
    org.needs_review
  )

  if (isLoading) return null

  const hasSimilar = similar && similar.length > 0

  if (!hasSimilar) {
    return (
      <Card className="border-blue-200 bg-blue-50 shadow-sm dark:border-blue-800/50 dark:bg-blue-900/10">
        <CardContent className="flex items-center justify-between gap-4 p-4">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            This organisation was automatically created. Mark it as reviewed
            when you're done.
          </p>
          <Button
            size="sm"
            variant="outline"
            className="shrink-0 border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-400"
            onClick={() => dismissReviewMutation.mutate(org.id)}
            disabled={dismissReviewMutation.isPending}
          >
            {dismissReviewMutation.isPending ? 'Saving…' : 'Mark as reviewed'}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-amber-200 bg-amber-50 shadow-sm dark:border-amber-800/50 dark:bg-amber-900/10">
      <CardContent className="p-4">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              Possible duplicate detected
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-amber-600 hover:bg-amber-100 dark:text-amber-400"
            onClick={() => dismissReviewMutation.mutate(org.id)}
            disabled={dismissReviewMutation.isPending}
            aria-label="Dismiss review"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-muted-foreground mb-3 text-sm">
          This organisation may be a duplicate of another. Review the
          suggestions below and merge if appropriate.
        </p>

        <div className="space-y-2">
          {similar.map((suggestion) => (
            <div
              key={suggestion.id}
              className="flex items-center justify-between gap-3 rounded-md border border-amber-200 bg-white px-3 py-2 dark:border-amber-800/40 dark:bg-amber-950/20"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {suggestion.name}
                </p>
                {suggestion.industry && (
                  <p className="text-muted-foreground truncate text-xs">
                    {suggestion.industry}
                  </p>
                )}
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0 border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-400"
                  >
                    <ArrowRightLeft className="mr-1.5 h-3.5 w-3.5" />
                    Merge into this org
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Merge organisations?</AlertDialogTitle>
                    <AlertDialogDescription>
                      <strong>{org.name}</strong> will be merged into{' '}
                      <strong>{suggestion.name}</strong>. All linked jobs will be moved
                      to <strong>{suggestion.name}</strong>, and{' '}
                      <strong>{org.name}</strong> will be deleted. This
                      cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() =>
                        mergeMutation.mutate({
                          duplicateId: org.id,
                          targetId: suggestion.id,
                        })
                      }
                      disabled={mergeMutation.isPending}
                      className="bg-amber-600 hover:bg-amber-700"
                    >
                      {mergeMutation.isPending ? 'Merging…' : 'Merge'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Actions dropdown (… menu) ───────────────────────────────────────────────

function OrgActionsMenu({
  org,
  onDelete,
  isPending,
}: {
  org: Organisation
  onDelete: () => void
  isPending: boolean
}) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-[26px] w-[26px] p-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onSelect={() => setShowDeleteDialog(true)}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete organisation?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{org.name}</strong> will be permanently deleted. Any
              linked jobs will have their organisation detached. This cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete()
                setShowDeleteDialog(false)
              }}
              disabled={isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isPending ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

// ─── Tab: Overview ───────────────────────────────────────────────────────────

function OverviewTab({ org }: { org: Organisation }) {
  return (
    <div>
      <div>
        {org.notes ? (
          <p className="text-[13px] text-[#374151] leading-[1.6] whitespace-pre-wrap dark:text-foreground/80">
            {org.notes}
          </p>
        ) : (
          <p className="text-[13px] text-[#9CA3AF] italic dark:text-muted-foreground">
            No notes yet. Click edit to add company notes.
          </p>
        )}
      </div>

      <div className="border-t border-[#F3F4F6] my-[16px] dark:border-border/60" />

      <div>
        <h3 className="text-[12px] font-semibold text-[#111827] mb-[6px] dark:text-foreground">
          Also known as
        </h3>
        {org.aliases && org.aliases.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {org.aliases.map((alias) => (
              <Badge key={alias} variant="secondary" className="gap-1">
                <TagIcon className="h-3 w-3" />
                {alias}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-[12px] text-[#9CA3AF] italic dark:text-muted-foreground">
            No aliases yet — these are added automatically when you merge
            duplicate organisations.
          </p>
        )}
      </div>
    </div>
  )
}

// ─── Tab: Jobs ───────────────────────────────────────────────────────────────

function JobsTab({ jobs }: { jobs: OrgJob[] }) {
  if (jobs.length === 0) {
    return (
      <p className="text-[13px] text-[#9CA3AF] italic dark:text-muted-foreground">
        No jobs linked to this organisation yet.
      </p>
    )
  }

  return (
    <div className="-mx-[20px] -mb-[16px]">
      {jobs.map((job, i) => {
        const statusConfig = getStatusConfig(job.status)
        return (
          <Link
            key={job.id}
            to={`/jobs/${job.id}`}
            className={`hover:bg-muted/50 group flex items-center justify-between gap-4 px-[20px] py-3.5 transition-colors ${i !== 0 ? 'border-t' : ''}`}
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div
                className="border-background h-2.5 w-2.5 shrink-0 rounded-full border-2 shadow-sm"
                style={{ backgroundColor: statusConfig.color }}
              />
              <div className="min-w-0">
                <p className="group-hover:text-primary truncate text-sm font-medium transition-colors">
                  {job.job_title}
                </p>
                {job.archived_at && (
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    Archived
                  </p>
                )}
              </div>
            </div>
            <Badge
              className={`shrink-0 text-xs ${statusConfig.badgeClass}`}
              variant="secondary"
            >
              {statusConfig.label}
            </Badge>
          </Link>
        )
      })}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type ActiveTab = 'overview' | 'jobs' | 'contacts'

export default function OrganisationDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview')

  const { data: org, isLoading, error } = useOrganisation(id)
  const { deleteMutation } = useOrganisationActions({
    onDeleteSuccess: () => navigate('/organisations'),
  })

  const linkedJobs = org?.jobs ?? []
  const { data: orgContacts = [] } = useContacts(
    { organisation_id: org?.id },
    { enabled: !!org?.id }
  )

  usePageTitle(org?.name ?? 'Organisation')

  if (isLoading) return <PageLoading variant="detail" />
  if (error) return <PageError message={error.message} />
  if (!org)
    return (
      <PageError
        title="Organisation not found"
        message="This organisation may have been deleted."
      />
    )

  const tabs: { key: ActiveTab; label: string; count?: number }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'jobs', label: 'Jobs', count: linkedJobs.length },
    { key: 'contacts', label: 'Contacts', count: orgContacts.length },
  ]

  return (
    <div className="space-y-3">
      {/* Review banner — above everything */}
      {org.needs_review && <ReviewBanner org={org} />}

      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() =>
            window.history.length > 1
              ? navigate(-1)
              : navigate('/organisations')
          }
          className="flex items-center gap-1 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-[14px] w-[14px]" />
          Back
        </button>

        <div className="flex items-center gap-2">
          <EditOrganisationDialog
            org={org}
            trigger={
              <button className="flex items-center gap-[6px] rounded-[7px] border border-border bg-card px-[12px] py-[6px] text-[12px] font-medium text-foreground/80 hover:bg-muted/50 transition-colors">
                <Pencil className="h-[13px] w-[13px]" />
                Edit
              </button>
            }
          />
          <OrgActionsMenu
            org={org}
            onDelete={() => deleteMutation.mutate(org.id)}
            isPending={deleteMutation.isPending}
          />
        </div>
      </div>

      {/* Header card */}
      <div className="rounded-[10px] border border-[#E5E7EB] bg-card p-[18px_20px] dark:border-border">
        <h1 className="text-[20px] font-semibold tracking-tight text-[#111827] leading-tight mb-[4px] dark:text-foreground">
          {org.name}
        </h1>
        {org.industry && (
          <p className="text-[13px] text-[#6B7280] dark:text-muted-foreground">
            {org.industry}
          </p>
        )}

        {/* Meta strip */}
        <div className="flex flex-wrap items-stretch pt-[14px] mt-[14px] border-t border-[#F3F4F6] dark:border-border/60 gap-y-[10px]">
          {org.size && (
            <MetaItem icon={Users} label="Size">
              <span className="text-[12px] font-medium text-[#374151] leading-tight dark:text-foreground/80">
                {org.size} employees
              </span>
            </MetaItem>
          )}
          {org.website && (
            <MetaItem icon={Globe} label="Website">
              <a
                href={
                  org.website.startsWith('http')
                    ? org.website
                    : `https://${org.website}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-[3px] text-[12px] font-medium text-[#2563EB] hover:underline leading-tight dark:text-blue-400"
              >
                Visit <ExternalLink className="h-[10px] w-[10px]" />
              </a>
            </MetaItem>
          )}
          <MetaItem icon={Briefcase} label="Linked jobs">
            <span className="text-[12px] font-medium text-[#374151] leading-tight dark:text-foreground/80">
              {linkedJobs.length}
            </span>
          </MetaItem>
          <MetaItem icon={Star} label="Rating">
            <StarRating rating={org.rating} />
          </MetaItem>
        </div>
      </div>

      {/* Tabs card */}
      <div className="rounded-[10px] border border-[#E5E7EB] bg-card overflow-hidden dark:border-border">
        {/* Tab bar */}
        <div className="overflow-x-auto border-b border-[#E5E7EB] px-[16px] flex scrollbar-hide dark:border-border">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex shrink-0 items-center gap-[5px] whitespace-nowrap border-b-2 -mb-px px-[12px] py-[11px] text-[12px] cursor-pointer transition-colors',
                  isActive
                    ? 'border-[#2563EB] text-[#2563EB] font-medium dark:text-blue-400 dark:border-blue-400'
                    : 'border-transparent text-[#6B7280] hover:text-foreground dark:text-muted-foreground'
                )}
              >
                {tab.label}
                {tab.count != null && tab.count > 0 && (
                  <span
                    className={cn(
                      'rounded-full px-[5px] py-[1px] text-[10px] leading-tight',
                      isActive
                        ? 'bg-[#DBEAFE] text-[#1D4ED8] dark:bg-blue-950/50 dark:text-blue-300'
                        : 'bg-[#F3F4F6] text-[#6B7280] dark:bg-muted dark:text-muted-foreground'
                    )}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Tab content */}
        <div className="p-[16px_20px]">
          {activeTab === 'overview' && <OverviewTab org={org} />}
          {activeTab === 'jobs' && <JobsTab jobs={linkedJobs} />}
          {activeTab === 'contacts' && (
            <OrgContactsTab
              organisationId={org.id}
              organisationName={org.name}
            />
          )}
        </div>
      </div>
    </div>
  )
}
