import { columns as createColumns } from '@/components/job/columns'
import CreateJobDialog from '@/components/job/CreateJobDialog'
import DataTable from '@/components/job/DataTable'
import { ExtensionBanner } from '@/components/job/ExtensionBanner'
import { JobsToolbar } from '@/components/job/JobsToolbar'
import { PageError } from '@/components/layout/PageError'
import { PageLoading } from '@/components/layout/PageLoading'
import { Card } from '@/components/ui/card'
import { TypographyH1 } from '@/components/ui/typography'
import { useJobActions } from '@/hooks/useJobActions'
import { useJobs } from '@/hooks/useJobs'
import { usePageTitle } from '@/hooks/usePageTitle'
import type { Job, JobFilters } from '@/types/job'
import { useCallback, useMemo, useState } from 'react'

export default function JobsPage() {
  usePageTitle('Jobs')
  const [filters, setFilters] = useState<JobFilters>({})

  const handleFiltersChange = useCallback((newFilters: JobFilters) => {
    setFilters(newFilters)
  }, [])

  const { data, isLoading, error } = useJobs(filters)
  const { handleView, archiveMutation, unarchiveMutation, deleteMutation } =
    useJobActions()

  const tableColumns = useMemo(
    () => createColumns(
      handleView,
      archiveMutation.mutate,
      unarchiveMutation.mutate,
      deleteMutation.mutate,
    ),
    [handleView, archiveMutation.mutate, unarchiveMutation.mutate, deleteMutation.mutate],
  )

  return (
    <div className="page-container space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <TypographyH1 className="text-2xl font-bold tracking-tight">
            Jobs
          </TypographyH1>
          <p className="text-muted-foreground text-sm">
            Manage and track all your job applications.
          </p>
        </div>
        <CreateJobDialog className="w-full sm:w-auto" />
      </div>

      <ExtensionBanner />

      <JobsToolbar
        onFiltersChange={handleFiltersChange}
        resultCount={data?.length || 0}
      />

      <Card className="overflow-hidden border-0 p-4 shadow-sm">
        {isLoading ? (
          <PageLoading variant="table" />
        ) : error ? (
          <PageError message={error.message} />
        ) : (
          <DataTable
            columns={tableColumns}
            data={data || []}
            onRowClick={(row) => handleView((row as Job).id)}
          />
        )}
      </Card>
    </div>
  )
}
