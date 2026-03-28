import { columns as createColumns } from '@/components/job/columns'
import DataTable from '@/components/job/DataTable'
import { JobsToolbar } from '@/components/job/JobsToolbar'
import { PageError } from '@/components/layout/PageError'
import { PageLoading } from '@/components/layout/PageLoading'
import { Card } from '@/components/ui/card'
import { useJobActions } from '@/hooks/useJobActions'
import { useJobs } from '@/hooks/useJobs'
import type { Job, JobFilters } from '@/types/job'
import { useCallback, useState } from 'react'

export default function JobsPage() {
  const [filters, setFilters] = useState<JobFilters>({})

  const handleFiltersChange = useCallback((newFilters: JobFilters) => {
    setFilters(newFilters)
  }, [])

  const { data, isLoading, error } = useJobs(filters)
  const { handleView, archiveMutation, unarchiveMutation, deleteMutation } =
    useJobActions()

  return (
    <div className="page-container space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Jobs</h1>
        <p className="text-muted-foreground text-sm">
          Manage and track all your job applications.
        </p>
      </div>

      <JobsToolbar
        onFiltersChange={handleFiltersChange}
        resultCount={data?.length || 0}
      />

      <Card className="overflow-hidden border-0 shadow-sm p-4">
        {isLoading ? (
          <PageLoading variant="table" />
        ) : error ? (
          <PageError message={error.message} />
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
      </Card>
    </div>
  )
}
