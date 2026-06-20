import { columns as createColumns } from '@/components/job/columns'
import ActionsCell from '@/components/job/ActionsCell'
import CreateJobDialog from '@/components/job/CreateJobDialog'
import { DataTable } from '@/components/ui/DataTable'
import { ExtensionBanner } from '@/components/job/ExtensionBanner'
import { JobsToolbar } from '@/components/job/JobsToolbar'
import { StatusBadge } from '@/components/job/StatusBadge'
import { PageError } from '@/components/layout/PageError'
import { PageLoading } from '@/components/layout/PageLoading'
import { Card } from '@/components/ui/card'
import { useJobActions } from '@/hooks/useJobActions'
import { useJobs } from '@/hooks/useJobs'
import { usePageTitle } from '@/hooks/usePageTitle'
import type { Job, JobFilters } from '@/types/job'
import { useCallback, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'

interface JobMobileRowProps {
  job: Job
  onClick: () => void
  onView: (id: number) => void
  onArchive: (id: number) => void
  onUnarchive: (id: number) => void
  onDelete: (id: number) => void
}

function JobMobileRow({ job, onClick, onView, onArchive, onUnarchive, onDelete }: JobMobileRowProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/30 cursor-pointer transition-colors border-b border-border/40 last:border-0 focus-visible:outline-none focus-visible:bg-blue-50 dark:focus-visible:bg-blue-900/20"
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
    >
      <div className="min-w-0">
        <span className="font-medium text-sm block">{job.company_name}</span>
        <span className="text-xs text-muted-foreground mt-0.5 block">{job.job_title}</span>
      </div>
      <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
        <StatusBadge job={job} />
        <ActionsCell
          jobId={job.id}
          isArchived={Boolean(job.archived_at)}
          onView={onView}
          onArchive={onArchive}
          onUnarchive={onUnarchive}
          onDelete={onDelete}
        />
      </div>
    </div>
  )
}

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
    <div className="space-y-[14px]">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[18px] font-semibold tracking-tight text-foreground">Jobs</h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            Track and manage all your job applications.
          </p>
        </div>
        <CreateJobDialog
          trigger={
            <button className="flex items-center gap-1.5 rounded-[8px] bg-[#2563EB] px-[14px] py-[8px] text-[13px] font-medium text-white transition-colors hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              New job
            </button>
          }
        />
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
          <>
            <div className="hidden sm:block">
              <DataTable
                columns={tableColumns}
                data={data || []}
                onRowClick={(row) => handleView((row as Job).id)}
              />
            </div>
            <div className="sm:hidden">
              {(data || []).length > 0 ? (
                (data || []).map((job) => (
                  <JobMobileRow
                    key={job.id}
                    job={job}
                    onClick={() => handleView(job.id)}
                    onView={handleView}
                    onArchive={archiveMutation.mutate}
                    onUnarchive={unarchiveMutation.mutate}
                    onDelete={deleteMutation.mutate}
                  />
                ))
              ) : (
                <p className="p-4 text-center text-sm text-muted-foreground">No results.</p>
              )}
            </div>
          </>
        )}
      </Card>
    </div>
  )
}
