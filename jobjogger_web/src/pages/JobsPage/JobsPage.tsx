import { useState } from 'react'
import { useJobs } from '@/hooks/useJobs'
import { useJobActions } from '@/hooks/useJobActions'
import { columns as createColumns } from '@/pages/DashboardPage/columns'
import { DataTable } from '@/pages/DashboardPage/DataTable'
import type { JobFilters, JobStatus, Job } from '@/types/job'
import CreateJobDialog from '@/components/job/CreateJobDialog'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { useDebounce } from '@/hooks/useDebounce'
import { Button } from '@/components/ui/button'

export default function JobsPage() {
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showArchived, setShowArchived] = useState(false)

  const debouncedSearch = useDebounce(searchQuery, 500)

  const filters: JobFilters = {
    ...(selectedStatus && { status: [selectedStatus as JobStatus] }),
    ...(debouncedSearch && { search: debouncedSearch }),
    archived: showArchived,
  }

  const { data, isLoading, error } = useJobs(filters)
  const { handleView, archiveMutation, unarchiveMutation, deleteMutation } =
    useJobActions()

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div className="page-container">
      <div className="mb-4 flex items-center justify-between">
        {/* Filters Row */}
        <div className="flex w-full flex-wrap items-center gap-4">
          {/* Status Filter */}
          <Select
            value={selectedStatus || 'all'}
            onValueChange={(value) =>
              setSelectedStatus(value === 'all' ? '' : value)
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="wishlist">Wishlist</SelectItem>
              <SelectItem value="applied">Applied</SelectItem>
              <SelectItem value="phone_screen">Phone Screen</SelectItem>
              <SelectItem value="interviewing">Interviewing</SelectItem>
              <SelectItem value="offer">Offer</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="ghosted">Ghosted</SelectItem>
              <SelectItem value="withdrawn">Withdrawn</SelectItem>
            </SelectContent>
          </Select>

          {/* Search */}
          <Input
            placeholder="Search jobs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />

          {/* Show Archived Toggle */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="archived"
              checked={showArchived}
              onCheckedChange={(checked) => setShowArchived(!!checked)}
            />
            <label htmlFor="archived" className="cursor-pointer text-sm">
              Show Archived
            </label>
          </div>

          {(selectedStatus || searchQuery || showArchived) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedStatus('')
                setSearchQuery('')
                setShowArchived(false)
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>

        {/* Header Row */}
        <div className="flex items-center justify-between">
          <CreateJobDialog />
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={createColumns(
          handleView,
          archiveMutation.mutate,
          unarchiveMutation.mutate,
          deleteMutation.mutate
        )}
        data={data || []}
        onRowClick={(row) => handleView((row as Job).id)}
      />

      <p className="text-muted-foreground my-2 text-sm">
        {data?.length || 0} jobs found
      </p>
    </div>
  )
}
