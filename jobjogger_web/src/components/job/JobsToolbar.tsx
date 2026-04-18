import { FacetedFilter } from '@/components/job/FacetedFilter'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { useDebounce } from '@/hooks/useDebounce'
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

interface JobsToolbarProps {
  onFiltersChange: (filters: JobFilters) => void
  resultCount: number
}

export function JobsToolbar({
  onFiltersChange,
  resultCount,
}: JobsToolbarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatuses, setSelectedStatuses] = useState<Set<string>>(
    new Set()
  )
  const [selectedPriorities, setSelectedPriorities] = useState<Set<string>>(
    new Set()
  )
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
    [
      selectedStatuses,
      selectedPriorities,
      selectedSources,
      debouncedSearch,
      dueThisWeek,
      overdue,
      showArchived,
    ]
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
        {/* Search + filters row */}
        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder="Search jobs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 w-full text-sm sm:w-[200px] lg:w-[280px]"
          />

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

          <Separator orientation="vertical" className="hidden h-5 sm:block" />

          <Button
            type="button"
            variant={dueThisWeek ? 'default' : 'outline'}
            size="sm"
            className="h-8 text-xs"
            onClick={() => setDueThisWeek(!dueThisWeek)}
          >
            <CalendarClock className="mr-1.5 h-3.5 w-3.5" />
            Due this week
          </Button>

          <Button
            type="button"
            variant={overdue ? 'destructive' : 'outline'}
            size="sm"
            className="h-8 text-xs"
            onClick={() => setOverdue(!overdue)}
          >
            <AlertTriangle className="mr-1.5 h-3.5 w-3.5" />
            Overdue
          </Button>

          <Button
            type="button"
            variant={showArchived ? 'default' : 'outline'}
            size="sm"
            className="h-8 text-xs"
            onClick={() => setShowArchived(!showArchived)}
          >
            <Archive className="mr-1.5 h-3.5 w-3.5" />
            Archived
          </Button>

          <div className="sm:ml-auto">
          </div>
        </div>

        {/* Active filter chips + result count */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground text-xs font-medium">
            {resultCount} {resultCount === 1 ? 'job' : 'jobs'}
          </span>

          {activeChips.length > 0 && (
            <>
              <Separator orientation="vertical" className="h-4" />

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
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
