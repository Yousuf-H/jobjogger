import { FacetedFilter } from '@/components/job/FacetedFilter'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useDebounce } from '@/hooks/useDebounce'
import { cn } from '@/lib/utils'
import type { JobFilters, JobStatus } from '@/types/job'
import { AlertTriangle, Archive, CalendarClock, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

type Priority = 'low' | 'medium' | 'high'
type JobSource = 'seek' | 'linkedin' | 'referral' | 'company_site' | 'other'

const STATUS_OPTIONS: { label: string; value: JobStatus }[] = [
  { label: 'Wishlist', value: 'wishlist' },
  { label: 'Applied', value: 'applied' },
  { label: 'Phone Screen', value: 'phone_screen' },
  { label: 'Interviewing', value: 'interviewing' },
  { label: 'Offer', value: 'offer' },
  { label: 'Accepted', value: 'accepted' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Ghosted', value: 'ghosted' },
  { label: 'Withdrawn', value: 'withdrawn' },
]

const PRIORITY_OPTIONS: { label: string; value: Priority }[] = [
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Low', value: 'low' },
]

const SOURCE_OPTIONS: { label: string; value: JobSource }[] = [
  { label: 'Seek', value: 'seek' },
  { label: 'LinkedIn', value: 'linkedin' },
  { label: 'Referral', value: 'referral' },
  { label: 'Company Site', value: 'company_site' },
  { label: 'Other', value: 'other' },
]

const PILL_BASE = 'inline-flex items-center gap-1.5 h-8 rounded-full border px-3 text-xs font-normal whitespace-nowrap transition-colors cursor-pointer shrink-0'
const PILL_INACTIVE = 'bg-background text-muted-foreground border-border hover:text-foreground hover:bg-muted/60'
const PILL_ACTIVE = 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800'

interface JobsToolbarProps {
  onFiltersChange: (filters: JobFilters) => void
  resultCount: number
}

export function JobsToolbar({
  onFiltersChange,
  resultCount,
}: JobsToolbarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatuses, setSelectedStatuses] = useState<Set<string>>(new Set())
  const [selectedPriorities, setSelectedPriorities] = useState<Set<string>>(new Set())
  const [selectedSources, setSelectedSources] = useState<Set<string>>(new Set())
  const [dueThisWeek, setDueThisWeek] = useState(false)
  const [overdue, setOverdue] = useState(false)
  const [showArchived, setShowArchived] = useState(false)

  const debouncedSearch = useDebounce(searchQuery, 500)

  const filters: JobFilters = useMemo(
    () => ({
      ...(selectedStatuses.size > 0 && {
        status: Array.from(selectedStatuses) as JobStatus[],
      }),
      ...(selectedPriorities.size > 0 && {
        priority: Array.from(selectedPriorities) as Priority[],
      }),
      ...(selectedSources.size > 0 && {
        source: Array.from(selectedSources) as JobSource[],
      }),
      ...(debouncedSearch && { search: debouncedSearch }),
      ...(dueThisWeek && { due_this_week: true }),
      ...(overdue && { overdue: true }),
      archived: showArchived,
    }),
    [selectedStatuses, selectedPriorities, selectedSources, debouncedSearch, dueThisWeek, overdue, showArchived]
  )

  useEffect(() => {
    onFiltersChange(filters)
  }, [filters, onFiltersChange])

  const clearAllFilters = () => {
    setSearchQuery('')
    setSelectedStatuses(new Set())
    setSelectedPriorities(new Set())
    setSelectedSources(new Set())
    setDueThisWeek(false)
    setOverdue(false)
    setShowArchived(false)
  }

  const activeChips: { key: string; label: string; onRemove: () => void }[] = []

  selectedStatuses.forEach((status) => {
    const option = STATUS_OPTIONS.find((o) => o.value === status)
    if (option) {
      activeChips.push({
        key: `status-${status}`,
        label: option.label,
        onRemove: () => {
          const next = new Set(selectedStatuses)
          next.delete(status)
          setSelectedStatuses(next)
        },
      })
    }
  })

  selectedPriorities.forEach((priority) => {
    const option = PRIORITY_OPTIONS.find((o) => o.value === priority)
    if (option) {
      activeChips.push({
        key: `priority-${priority}`,
        label: `${option.label} priority`,
        onRemove: () => {
          const next = new Set(selectedPriorities)
          next.delete(priority)
          setSelectedPriorities(next)
        },
      })
    }
  })

  selectedSources.forEach((source) => {
    const option = SOURCE_OPTIONS.find((o) => o.value === source)
    if (option) {
      activeChips.push({
        key: `source-${source}`,
        label: option.label,
        onRemove: () => {
          const next = new Set(selectedSources)
          next.delete(source)
          setSelectedSources(next)
        },
      })
    }
  })

  if (dueThisWeek) {
    activeChips.push({
      key: 'due-this-week',
      label: 'Due this week',
      onRemove: () => setDueThisWeek(false),
    })
  }

  if (overdue) {
    activeChips.push({
      key: 'overdue',
      label: 'Overdue',
      onRemove: () => setOverdue(false),
    })
  }

  if (showArchived) {
    activeChips.push({
      key: 'archived',
      label: 'Archived',
      onRemove: () => setShowArchived(false),
    })
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="space-y-3 p-4">
        {/* Search + filter pills + count */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            placeholder="Search jobs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 w-full shrink-0 text-sm sm:w-[200px] lg:w-[260px]"
          />

          {/* Filter pills */}
          <div className="flex flex-1 flex-wrap items-center gap-1.5">
              <FacetedFilter
                title="Status"
                options={STATUS_OPTIONS}
                selected={selectedStatuses}
                onSelectionChange={setSelectedStatuses}
              />
              <FacetedFilter
                title="Priority"
                options={PRIORITY_OPTIONS}
                selected={selectedPriorities}
                onSelectionChange={setSelectedPriorities}
              />
              <FacetedFilter
                title="Source"
                options={SOURCE_OPTIONS}
                selected={selectedSources}
                onSelectionChange={setSelectedSources}
              />

              <button
                type="button"
                onClick={() => setDueThisWeek(!dueThisWeek)}
                className={cn(PILL_BASE, dueThisWeek ? PILL_ACTIVE : PILL_INACTIVE)}
              >
                <CalendarClock className="h-3.5 w-3.5 shrink-0" />
                Due this week
              </button>

              <button
                type="button"
                onClick={() => setOverdue(!overdue)}
                className={cn(PILL_BASE, overdue ? PILL_ACTIVE : PILL_INACTIVE)}
              >
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                Overdue
              </button>

              <button
                type="button"
                onClick={() => setShowArchived(!showArchived)}
                className={cn(PILL_BASE, showArchived ? PILL_ACTIVE : PILL_INACTIVE)}
              >
                <Archive className="h-3.5 w-3.5 shrink-0" />
                Archived
              </button>
          </div>

          <span className="shrink-0 text-muted-foreground text-xs font-medium">
            {resultCount} {resultCount === 1 ? 'job' : 'jobs'}
          </span>
        </div>

        {/* Active filter chips */}
        {activeChips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {activeChips.map((chip) => (
              <Badge
                key={chip.key}
                variant="secondary"
                className="gap-1 pr-1 text-xs font-normal"
              >
                {chip.label}
                <button
                  type="button"
                  onClick={chip.onRemove}
                  className="hover:bg-muted-foreground/20 ml-0.5 cursor-pointer rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}

            <button
              type="button"
              onClick={clearAllFilters}
              className="text-muted-foreground hover:text-foreground cursor-pointer text-xs"
            >
              Clear all
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
