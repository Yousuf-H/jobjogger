import { columns as createColumns } from '@/components/job/columns'
import CreateJobDialog from '@/components/job/CreateJobDialog'
import DataTable from '@/components/job/DataTable'
import { ExtensionBanner } from '@/components/job/ExtensionBanner'
import { JobsToolbar } from '@/components/job/JobsToolbar'
import { PageError } from '@/components/layout/PageError'
import { PageLoading } from '@/components/layout/PageLoading'
import { Card } from '@/components/ui/card'
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

  const hasFollowUp = useMemo(() => (data || []).some((j) => Boolean(j.follow_up_date)), [data])
  const hasNextInterview = useMemo(() => (data || []).some((j) => Boolean(j.next_interview_at)), [data])

  const tableColumns = useMemo(
    () => createColumns(
      handleView,
      archiveMutation.mutate,
      unarchiveMutation.mutate,
      deleteMutation.mutate,
      hasFollowUp,
      hasNextInterview,
    ),
    [handleView, archiveMutation.mutate, unarchiveMutation.mutate, deleteMutation.mutate, hasFollowUp, hasNextInterview],
  )

  return (
    <div className="page-container space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[18px] font-semibold text-foreground">Jobs</h1>
          <p className="text-[13px] text-muted-foreground">
            Track and manage all your job applications.
          </p>
        </div>
        <CreateJobDialog className="w-full sm:w-auto" />
      </div>

      <ExtensionBanner />

      <JobsToolbar
        onFiltersChange={handleFiltersChange}
        resultCount={data?.length || 0}
      />

      <Card className="overflow-hidden border-0 p-0 shadow-sm">
        {isLoading ? (
          <div className="p-4">
            <PageLoading variant="table" />
          </div>
        ) : error ? (
          <div className="p-4">
            <PageError message={error.message} />
          </div>
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
