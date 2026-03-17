import { useState, useCallback } from 'react'
import { useJobs } from '@/hooks/useJobs'
import { useJobActions } from '@/hooks/useJobActions'
import { columns as createColumns } from '@/pages/DashboardPage/columns'
import { DataTable } from '@/pages/DashboardPage/DataTable'
import { JobsToolbar } from '@/components/job/JobsToolbar'
import type { JobFilters, Job } from '@/types/job'

export default function JobsPage() {
  const [filters, setFilters] = useState<JobFilters>({})

  const handleFiltersChange = useCallback((newFilters: JobFilters) => {
    setFilters(newFilters)
  }, [])

  const { data, isLoading, error } = useJobs(filters)
  const { handleView, archiveMutation, unarchiveMutation, deleteMutation } =
    useJobActions()

return (
  <div className="page-container">
    <JobsToolbar
      onFiltersChange={handleFiltersChange}
      resultCount={data?.length || 0}
    />

    <div className="mt-4">
      {isLoading ? (
        <div>Loading...</div>
      ) : error ? (
        <div>Error: {error.message}</div>
      ) : (
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
      )}
    </div>
  </div>
)
}