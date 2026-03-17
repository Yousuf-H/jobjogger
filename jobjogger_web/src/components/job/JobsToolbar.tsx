import { X, CalendarClock, AlertTriangle } from 'lucide-react'
import { FacetedFilter } from '@/components/job/FacetedFilter'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import CreateJobDialog from '@/components/job/CreateJobDialog'
import { useDebounce } from '@/hooks/useDebounce'
import type { JobFilters, JobStatus } from '@/types/job'
import { useState, useMemo, useEffect } from 'react'

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

export function JobsToolbar({ onFiltersChange, resultCount }: JobsToolbarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatuses, setSelectedStatuses] = useState<Set<string>>(new Set())
  const [selectedPriorities, setSelectedPriorities] = useState<Set<string>>(new Set())
  const [selectedSources, setSelectedSources] = useState<Set<string>>(new Set())
  const [dueThisWeek, setDueThisWeek] = useState(false)
  const [overdue, setOverdue] = useState(false)
  const [showArchived, setShowArchived] = useState(false)

  const debouncedSearch = useDebounce(searchQuery, 500)

  // Build filters object whenever state changes
  const filters: JobFilters = useMemo(() => ({
    ...(selectedStatuses.size > 0 && { status: Array.from(selectedStatuses) as JobStatus[] }),
    ...(selectedPriorities.size > 0 && { priority: Array.from(selectedPriorities)[0] as Priority }),
    ...(selectedSources.size > 0 && { source: Array.from(selectedSources)[0] as JobSource }),
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(dueThisWeek && { due_this_week: true }),
    ...(overdue && { overdue: true }),
    archived: showArchived,
  }), [selectedStatuses, selectedPriorities, selectedSources, debouncedSearch, dueThisWeek, overdue, showArchived])

  // Notify parent of filter changes
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

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <Input
          placeholder="Search jobs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-8 w-[200px] lg:w-[280px] text-sm"
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

        <Separator orientation="vertical" className="h-5" />

        <Button
          type='button'
          variant={dueThisWeek ? 'default' : 'outline'}
          size="sm"
          className="h-8 text-xs"
          onClick={() => setDueThisWeek(!dueThisWeek)}
        >
          <CalendarClock className="mr-1.5 h-3.5 w-3.5" />
          Due this week
        </Button>

        <Button
          type='button'
          variant={overdue ? 'destructive' : 'outline'}
          size="sm"
          className="h-8 text-xs"
          onClick={() => setOverdue(!overdue)}
        >
          <AlertTriangle className="mr-1.5 h-3.5 w-3.5" />
          Overdue
        </Button>

        <div>
          <CreateJobDialog />
        </div>
      </div>

      {activeChips.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          {activeChips.map((chip) => (
            <Badge
              key={chip.key}
              variant="secondary"
              className="gap-1 pr-1 text-xs font-normal"
            >
              {chip.label}
              <Button
                type='button'
                variant="ghost"
                size="icon"
                onClick={chip.onRemove}
                className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20 cursor-pointer"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          <Separator orientation="vertical" className="h-4" />
          <Button
            type='button'
            variant="outline"
            size="sm"
            onClick={clearAllFilters}
            className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
          >
            Clear all
          </Button>
        </div>
      )}

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox
            checked={showArchived}
            onCheckedChange={(checked) => setShowArchived(!!checked)}
          />
          <span className="text-sm text-muted-foreground">Show archived</span>
        </label>
        <span className="text-xs text-muted-foreground">
          {resultCount} {resultCount === 1 ? 'job' : 'jobs'}
        </span>
      </div>
    </div>
  )
}