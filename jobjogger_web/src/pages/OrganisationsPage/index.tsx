import {
  OrganisationForm,
  type OrganisationFormValues,
} from '@/components/organisation/OrganisationForm'
import { PageError } from '@/components/layout/PageError'
import { PageLoading } from '@/components/layout/PageLoading'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { TypographyH1 } from '@/components/ui/typography'
import { useOrganisationActions } from '@/hooks/useOrganisationActions'
import { useOrganisations } from '@/hooks/useOrganisations'
import { usePageTitle } from '@/hooks/usePageTitle'
import type { Organisation } from '@/types/organisation'
import {
  AlertTriangle,
  Briefcase,
  Building2,
  ExternalLink,
  Plus,
  Star,
  Users,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

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

function OrgRating({ rating }: { rating?: number | null }) {
  if (rating == null) return null
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => {
          const fill = Math.min(Math.max(rating - (s - 1), 0), 1)
          return (
            <span key={s} className="relative h-3 w-3">
              <Star className="h-3 w-3 text-muted-foreground/30" />
              {fill > 0 && (
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${fill * 100}%` }}
                >
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                </span>
              )}
            </span>
          )
        })}
      </div>
      <span className="text-muted-foreground text-xs tabular-nums">
        {rating % 1 === 0 ? `${rating}.0` : rating}
      </span>
    </div>
  )
}

function CreateOrganisationDialog({ className }: { className?: string }) {
  const [open, setOpen] = useState(false)
  const { createMutation } = useOrganisationActions()

  const handleSubmit = (data: OrganisationFormValues) => {
    createMutation.mutate(data, { onSuccess: () => setOpen(false) })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="success" className={`min-w-36 ${className ?? ''}`}>
          <Plus className="mr-1.5 h-4 w-4" />
          New Organisation
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Organisation</DialogTitle>
          <DialogDescription>
            Add a company to track across your job applications.
          </DialogDescription>
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

interface OrgCardProps {
  org: Organisation
  onClick: () => void
}

function OrgCard({ org, onClick }: OrgCardProps) {
  const activeCount = org.active_jobs_count ?? 0
  const totalCount = org.total_jobs_count ?? 0
  const inactiveCount = totalCount - activeCount
  return (
    <Card
      className="hover:border-primary/30 cursor-pointer border-0 shadow-sm transition-all hover:shadow-md"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-lg">
              <Building2 className="h-4 w-4" />
            </div>
            <p className="truncate font-semibold leading-tight">{org.name}</p>
          </div>
          {org.needs_review && (
            <Badge
              variant="outline"
              className="border-amber-300 bg-amber-50 text-amber-700 shrink-0 gap-1 dark:bg-amber-900/20 dark:text-amber-400"
            >
              <AlertTriangle className="h-3 w-3" />
              Review
            </Badge>
          )}
        </div>

        <div className="text-muted-foreground space-y-1.5 text-sm">
          {org.industry && (
            <p className="truncate">{org.industry}</p>
          )}

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {org.size && (
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {org.size}
              </span>
            )}
            {totalCount === 0 ? (
              <span className="flex items-center gap-1">
                <Briefcase className="h-3 w-3" />
                0 jobs
              </span>
            ) : inactiveCount > 0 ? (
              <>
                <span className="flex items-center gap-1">
                  <Briefcase className="h-3 w-3" />
                  {activeCount} active
                </span>
                <span>{inactiveCount} inactive</span>
              </>
            ) : (
              <span className="flex items-center gap-1">
                <Briefcase className="h-3 w-3" />
                {activeCount} {activeCount === 1 ? 'job' : 'jobs'}
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
                className="flex items-center gap-1 text-sky-600 hover:underline dark:text-sky-400"
              >
                <ExternalLink className="h-3 w-3" />
                Website
              </a>
            )}
          </div>

          {org.rating != null && (
            <OrgRating rating={org.rating} />
          )}
        </div>
      </CardContent>
    </Card>
  )
}

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

  return (
    <div className="page-container space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <TypographyH1 className="text-2xl font-bold tracking-tight">
            Organisations
          </TypographyH1>
          <p className="text-muted-foreground text-sm">
            Track companies across your job applications.
          </p>
        </div>
        <CreateOrganisationDialog className="w-full sm:w-auto" />
      </div>

      {hasOrganisations && <WelcomeBanner />}

      {hasOrganisations && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Input
                placeholder="Search organisations…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 w-full text-sm sm:w-[200px] lg:w-[280px]"
              />
              <Button
                type="button"
                variant={reviewOnly ? 'default' : 'outline'}
                size="sm"
                className="h-8 text-xs"
                onClick={() => setReviewOnly((v) => !v)}
              >
                <AlertTriangle className="mr-1.5 h-3.5 w-3.5" />
                Needs review
              </Button>
              <span className="text-muted-foreground sm:ml-auto text-xs font-medium">
                {filtered.length} {filtered.length === 1 ? 'organisation' : 'organisations'}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <PageLoading variant="default" />
      ) : error ? (
        <PageError message={error.message} />
      ) : !hasOrganisations ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 rounded-full bg-blue-100 p-4 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
              <Building2 className="h-6 w-6" />
            </div>
            <p className="font-semibold">No organisations yet</p>
            <p className="text-muted-foreground mt-1 text-sm">
              Organisations are created automatically when you add jobs, or you
              can add them manually.
            </p>
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground py-4 text-sm">
          No organisations match your search.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((org) => (
            <OrgCard
              key={org.id}
              org={org}
              onClick={() => navigate(`/organisations/${org.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
