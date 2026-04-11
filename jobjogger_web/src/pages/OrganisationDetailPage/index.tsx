import {
  OrganisationForm,
  type OrganisationFormValues,
} from '@/components/organisation/OrganisationForm'
import { PageError } from '@/components/layout/PageError'
import { PageLoading } from '@/components/layout/PageLoading'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TypographyH1 } from '@/components/ui/typography'
import { useOrganisation, useSimilarOrganisations } from '@/hooks/useOrganisation'
import { useOrganisationActions } from '@/hooks/useOrganisationActions'
import { usePageTitle } from '@/hooks/usePageTitle'
import { getStatusConfig } from '@/lib/statusConfig'
import type { OrgJob, Organisation } from '@/types/organisation'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRightLeft,
  Briefcase,
  Building2,
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

// ─── Rating accent colour for header bar ────────────────────────────────────

function getRatingAccentClass(rating?: number | null): string {
  if (rating == null) return 'bg-primary'
  if (rating <= 2) return 'bg-rose-400 dark:bg-rose-500'
  if (rating <= 3.5) return 'bg-violet-400 dark:bg-violet-500'
  return 'bg-sky-400 dark:bg-sky-500'
}

// ─── Star rating (read-only, always shows all 5 stars) ──────────────────────

function StarRating({ rating }: { rating?: number | null }) {
  if (rating == null) {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star key={s} className="h-3.5 w-3.5 text-muted-foreground/25" />
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
              {/* Empty star underneath */}
              <Star className="h-3.5 w-3.5 text-muted-foreground/25" />
              {/* Filled star clipped to fill% */}
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
      <span className="text-muted-foreground text-xs font-medium tabular-nums">
        {rating % 1 === 0 ? `${rating}.0` : rating}
      </span>
    </div>
  )
}

// ─── Quick stat chip (mirrors JobDetailPage pattern) ────────────────────────

function QuickStat({
  icon: Icon,
  label,
  value,
  iconClassName,
  children,
}: {
  icon: React.ElementType
  label: string
  value?: string
  iconClassName?: string
  children?: React.ReactNode
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
        {children ?? <p className="text-sm font-medium">{value}</p>}
      </div>
    </div>
  )
}

// ─── Edit dialog ─────────────────────────────────────────────────────────────

function EditOrganisationDialog({ org }: { org: Organisation }) {
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
        <Button variant="outline" size="sm">
          <Pencil className="mr-1.5 h-3.5 w-3.5" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Organisation</DialogTitle>
          <DialogDescription>Update the details for {org.name}.</DialogDescription>
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
            This organisation was automatically created. Mark it as reviewed when
            you're done.
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
          This organisation may be a duplicate of another. Review the suggestions
          below and merge if appropriate.
        </p>

        <div className="space-y-2">
          {similar.map((suggestion) => (
            <div
              key={suggestion.id}
              className="flex items-center justify-between gap-3 rounded-md border border-amber-200 bg-white px-3 py-2 dark:border-amber-800/40 dark:bg-amber-950/20"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{suggestion.name}</p>
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
                      <strong>{suggestion.name}</strong> will be merged into{' '}
                      <strong>{org.name}</strong>. All linked jobs will be moved
                      to <strong>{org.name}</strong>, and{' '}
                      <strong>{suggestion.name}</strong> will be deleted. This
                      cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() =>
                        mergeMutation.mutate({
                          duplicateId: suggestion.id,
                          targetId: org.id,
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
          <Button variant="ghost" className="h-8 w-8 p-0">
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
    <div className="space-y-6">
      {/* Notes */}
      <div>
        <h3 className="mb-2 text-sm font-semibold">Notes</h3>
        {org.notes ? (
          <p className="text-muted-foreground whitespace-pre-wrap text-sm leading-relaxed">
            {org.notes}
          </p>
        ) : (
          <p className="text-muted-foreground text-sm italic">
            No notes yet. Click edit to add company notes.
          </p>
        )}
      </div>

      <Separator />

      {/* Aliases */}
      <div>
        <h3 className="mb-2 text-sm font-semibold">Also known as</h3>
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
          <p className="text-muted-foreground text-sm italic">
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
      <p className="text-muted-foreground text-sm italic">
        No jobs linked to this organisation yet.
      </p>
    )
  }

  return (
    <div className="-mx-6 -mb-6">
      {jobs.map((job, i) => {
        const statusConfig = getStatusConfig(job.status)
        return (
          <Link
            key={job.id}
            to={`/jobs/${job.id}`}
            className={`group flex items-center justify-between gap-4 px-6 py-3.5 transition-colors hover:bg-muted/50 ${i !== 0 ? 'border-t' : ''}`}
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div
                className="border-background h-2.5 w-2.5 shrink-0 rounded-full border-2 shadow-sm"
                style={{ backgroundColor: statusConfig.color }}
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium transition-colors group-hover:text-primary">
                  {job.job_title}
                </p>
                {job.archived_at && (
                  <p className="text-muted-foreground text-xs mt-0.5">Archived</p>
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

// ─── Tab: Contacts ───────────────────────────────────────────────────────────

function ContactsTab() {
  return (
    <p className="text-muted-foreground text-sm italic">
      Contacts are coming soon. You'll be able to track people at this
      organisation and link them to specific roles.
    </p>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OrganisationDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: org, isLoading, error } = useOrganisation(id)
  const { deleteMutation } = useOrganisationActions({
    onDeleteSuccess: () => navigate('/organisations'),
  })

  const linkedJobs = org?.jobs ?? []

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

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-5xl px-6 py-6">

        {/* Review banner — above everything */}
        {org.needs_review && (
          <div className="mb-6">
            <ReviewBanner org={org} />
          </div>
        )}

        {/* Top bar */}
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              window.history.length > 1
                ? navigate(-1)
                : navigate('/organisations')
            }
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="flex items-center gap-2">
            <EditOrganisationDialog org={org} />
            <OrgActionsMenu org={org} onDelete={() => deleteMutation.mutate(org.id)} isPending={deleteMutation.isPending} />
          </div>
        </div>

        {/* Header card */}
        <Card className="mb-6 overflow-hidden border-0 shadow-sm">
          <div className={`h-1.5 ${getRatingAccentClass(org.rating)}`} />
          <CardContent className="p-6">
            {/* Name + industry */}
            <TypographyH1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {org.name}
            </TypographyH1>
            {org.industry && (
              <p className="text-muted-foreground mt-1 text-base">
                {org.industry}
              </p>
            )}

            {/* Quick stats row */}
            <div className="mt-6 grid grid-cols-2 gap-4 border-t pt-5 sm:flex sm:flex-wrap sm:gap-6">
              {org.size && (
                <QuickStat
                  icon={Users}
                  label="Size"
                  value={`${org.size} employees`}
                  iconClassName="bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-300"
                />
              )}
              {org.website && (
                <QuickStat
                  icon={Globe}
                  label="Website"
                  iconClassName="bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-300"
                >
                  <a
                    href={
                      org.website.startsWith('http')
                        ? org.website
                        : `https://${org.website}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm font-medium text-sky-600 hover:underline dark:text-sky-400"
                  >
                    Visit <ExternalLink className="h-3 w-3" />
                  </a>
                </QuickStat>
              )}
              <QuickStat
                icon={Briefcase}
                label="Linked jobs"
                value={String(linkedJobs.length)}
                iconClassName="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300"
              />
              <QuickStat
                icon={Star}
                label="Rating"
                iconClassName="bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300"
              >
                <StarRating rating={org.rating} />
              </QuickStat>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Card className="overflow-hidden border-0 shadow-sm">
          <Tabs defaultValue="overview" className="w-full">
            <div className="px-6 pt-2">
              <TabsList className="h-auto w-full justify-start gap-4 rounded-none border-b bg-transparent p-0">
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-1 pb-3 pt-3 text-sm shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="jobs"
                  className="data-[state=active]:border-primary gap-1.5 rounded-none border-b-2 border-transparent px-1 pb-3 pt-3 text-sm shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  Jobs
                  {linkedJobs.length > 0 && (
                    <span className="bg-primary/10 text-primary rounded-full px-1.5 py-0.5 text-xs font-medium">
                      {linkedJobs.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="contacts"
                  className="data-[state=active]:border-primary gap-1.5 rounded-none border-b-2 border-transparent px-1 pb-3 pt-3 text-sm shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  Contacts
                  <Badge
                    variant="secondary"
                    className="rounded-full px-1.5 py-0.5 text-xs font-medium"
                  >
                    Soon
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent value="overview" className="mt-0">
                <OverviewTab org={org} />
              </TabsContent>
              <TabsContent value="jobs" className="mt-0">
                <JobsTab jobs={linkedJobs} />
              </TabsContent>
              <TabsContent value="contacts" className="mt-0">
                <ContactsTab />
              </TabsContent>
            </div>
          </Tabs>
        </Card>

      </div>
    </div>
  )
}
