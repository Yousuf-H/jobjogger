import {
  OrganisationForm,
  type OrganisationFormValues,
} from '@/components/organisation/OrganisationForm'
import { DataTable } from '@/components/ui/DataTable'
import { PageError } from '@/components/layout/PageError'
import { PageLoading } from '@/components/layout/PageLoading'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useOrganisationActions } from '@/hooks/useOrganisationActions'
import { useOrganisations } from '@/hooks/useOrganisations'
import { usePageTitle } from '@/hooks/usePageTitle'
import { cn } from '@/lib/utils'
import type { Organisation } from '@/types/organisation'
import type { ColumnDef } from '@tanstack/react-table'
import {
  AlertTriangle,
  ExternalLink,
  Plus,
  Star,
  X,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const PILL_BASE =
  'inline-flex items-center gap-1.5 h-8 rounded-full border px-3 text-xs font-normal whitespace-nowrap transition-colors cursor-pointer shrink-0'
const PILL_INACTIVE =
  'bg-background text-muted-foreground border-border hover:text-foreground hover:bg-muted/60'
const PILL_ACTIVE =
  'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800'

const AVATAR_COLORS = [
  'bg-avatar-1/15 text-avatar-1',
  'bg-avatar-2/15 text-avatar-2',
  'bg-avatar-3/15 text-avatar-3',
  'bg-avatar-4/15 text-avatar-4',
  'bg-avatar-5/15 text-avatar-5',
  'bg-avatar-6/15 text-avatar-6',
]

function avatarColorClasses(org: Organisation) {
  return AVATAR_COLORS[org.id % AVATAR_COLORS.length]
}

function primaryIndustry(industry: string) {
  return industry.split(/[/,]/)[0].trim()
}

const WELCOME_DISMISSED_KEY = 'jobjogger_orgs_welcome_dismissed'

function WelcomeBanner() {
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(WELCOME_DISMISSED_KEY) === 'true'
  )

  if (dismissed) return null

  const handleDismiss = () => {
    localStorage.setItem(WELCOME_DISMISSED_KEY, 'true')
    setDismissed(true)
  }

  return (
    <Card className="border-blue-200 bg-blue-50 shadow-sm dark:border-blue-800/50 dark:bg-blue-900/10">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">
              Welcome to Organisations
            </p>
            <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
              We've automatically created organisations from your saved job
              applications. Fill in details like industry, size, and rating as
              you go — no rush.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 shrink-0 p-0 text-blue-600 hover:bg-blue-100 dark:text-blue-400"
            onClick={handleDismiss}
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-3">
          <Button
            size="sm"
            variant="outline"
            className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-400"
            onClick={handleDismiss}
          >
            Got it
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function CreateOrganisationDialog() {
  const [open, setOpen] = useState(false)
  const { createMutation } = useOrganisationActions()

  const handleSubmit = (data: OrganisationFormValues) => {
    createMutation.mutate(data, { onSuccess: () => setOpen(false) })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="default">
          <Plus className="h-4 w-4" />
          New organisation
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add organisation</DialogTitle>
        </DialogHeader>
        <OrganisationForm
          key={open ? 'open' : 'closed'}
          onSubmit={handleSubmit}
          isSubmitting={createMutation.isPending}
          mode="create"
        />
      </DialogContent>
    </Dialog>
  )
}

function OrgMobileRow({ org, onClick }: { org: Organisation; onClick: () => void }) {
  const initial = org.name.charAt(0).toUpperCase()
  const totalCount = org.total_jobs_count ?? 0

  return (
    <div
      role="button"
      tabIndex={0}
      className="flex items-start gap-3 px-4 py-3 hover:bg-muted/30 cursor-pointer transition-colors border-b border-border/40 last:border-0 focus-visible:outline-none focus-visible:bg-blue-50 dark:focus-visible:bg-blue-900/20"
      onClick={onClick}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && e.target === e.currentTarget) {
          e.preventDefault()
          onClick()
        }
      }}
    >
      <div
        className={cn(
          'flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold mt-0.5',
          avatarColorClasses(org)
        )}
      >
        {initial}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium text-sm truncate">{org.name}</span>
          {org.needs_review && (
            <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-blue-500 dark:text-blue-400" />
          )}
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
          {org.industry && <span>{primaryIndustry(org.industry)}</span>}
          {org.size && <span>{org.size}</span>}
          <span>
            {totalCount} {totalCount === 1 ? 'job' : 'jobs'}
          </span>
          {org.rating != null && (
            <span className="inline-flex items-center gap-0.5">
              <Star className="h-3 w-3" />
              {org.rating % 1 === 0 ? `${org.rating}.0` : org.rating}
            </span>
          )}
          {org.website && (
            <a
              href={
                org.website.startsWith('http')
                  ? org.website
                  : `https://${org.website}`
              }
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-brand flex items-center gap-0.5 hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              Site
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

const DEFAULT_SORT = [{ id: 'name', desc: false }]

export default function OrganisationsPage() {
  usePageTitle('Organisations')
  const navigate = useNavigate()
  const { data: organisations, isLoading, error } = useOrganisations()
  const [search, setSearch] = useState('')
  const [reviewOnly, setReviewOnly] = useState(false)

  const hasOrganisations = organisations && organisations.length > 0

  const filtered = (organisations ?? []).filter((org) => {
    if (reviewOnly && !org.needs_review) return false
    if (search.trim()) {
      return org.name.toLowerCase().includes(search.trim().toLowerCase())
    }
    return true
  })

  const tableColumns = useMemo<ColumnDef<Organisation>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Organisation',
        cell: ({ row }) => (
          <span className="font-medium text-sm">{row.original.name}</span>
        ),
      },
      {
        accessorKey: 'industry',
        header: 'Industry',
        enableSorting: false,
        cell: ({ row }) => {
          const industry = row.getValue<string | null>('industry')
          if (!industry)
            return <span className="text-muted-foreground/40 text-sm">—</span>
          return (
            <span className="border-border bg-muted text-muted-foreground inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap">
              {primaryIndustry(industry)}
            </span>
          )
        },
      },
      {
        accessorKey: 'rating',
        header: 'Rating',
        cell: ({ row }) => {
          const rating = row.getValue<number | null>('rating')
          if (rating == null)
            return <span className="text-muted-foreground/40 text-sm">—</span>
          return (
            <span className="inline-flex items-center gap-1 text-sm tabular-nums text-foreground">
              <Star className="h-3.5 w-3.5 text-muted-foreground" />
              {rating % 1 === 0 ? `${rating}.0` : rating}
            </span>
          )
        },
      },
      {
        accessorKey: 'needs_review',
        header: '',
        enableSorting: false,
        cell: ({ row }) => {
          const needsReview = row.getValue<boolean>('needs_review')
          if (!needsReview) return null
          return (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-xs text-blue-600 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800 whitespace-nowrap">
              <AlertTriangle className="h-3 w-3" />
              Needs review
            </span>
          )
        },
      },
      {
        accessorKey: 'total_jobs_count',
        header: 'Linked jobs',
        cell: ({ row }) => {
          const count = (row.getValue<number | undefined>('total_jobs_count')) ?? 0
          return <span className="text-sm tabular-nums">{count}</span>
        },
      },
    ],
    []
  )

  const handleOrgClick = (org: Organisation) =>
    navigate(`/organisations/${org.id}`)

  return (
    <div className="space-y-[14px]">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[18px] font-semibold tracking-tight text-foreground">Organisations</h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            Track companies across your job applications.
          </p>
        </div>
        <CreateOrganisationDialog />
      </div>

      {hasOrganisations && <WelcomeBanner />}

      <Card className="border-0 shadow-sm">
        <CardContent className="space-y-3 p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              placeholder="Search organisations…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 w-full shrink-0 text-sm sm:w-[200px] lg:w-[260px]"
            />
            <div className="flex items-center justify-between gap-2 sm:contents">
              <button
                type="button"
                onClick={() => setReviewOnly((v) => !v)}
                className={cn(PILL_BASE, reviewOnly ? PILL_ACTIVE : PILL_INACTIVE)}
              >
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                Needs review
              </button>
              <span className="text-muted-foreground text-xs font-medium sm:ml-auto">
                {filtered.length}{' '}
                {filtered.length === 1 ? 'organisation' : 'organisations'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <PageLoading variant="default" />
      ) : error ? (
        <PageError message={error.message} />
      ) : (
        <Card className="overflow-hidden border-0 p-0 shadow-sm">
          <div className="hidden sm:block">
            <DataTable
              columns={tableColumns}
              data={filtered}
              onRowClick={handleOrgClick}
              defaultSort={DEFAULT_SORT}
              emptyMessage={search || reviewOnly ? 'No organisations match your search.' : 'No organisations yet. They are created automatically when you add jobs.'}
            />
          </div>
          <div className="sm:hidden">
            {filtered.length > 0 ? (
              filtered.map((org) => (
                <OrgMobileRow
                  key={org.id}
                  org={org}
                  onClick={() => handleOrgClick(org)}
                />
              ))
            ) : (
              <p className="p-4 text-center text-sm text-muted-foreground">
                {search || reviewOnly ? 'No organisations match your search.' : 'No organisations yet. They are created automatically when you add jobs.'}
              </p>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
