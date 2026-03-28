import { SummaryCards } from '@/components/analytics/SummaryCards'
import { StatusChart } from '@/components/dashboard/StatusChart'
import CreateJobDialog from '@/components/job/CreateJobDialog'
import DataTable from '@/components/job/DataTable'
import { columns as createColumns } from '@/components/job/columns'
import { PageError } from '@/components/layout/PageError'
import { PageLoading } from '@/components/layout/PageLoading'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAnalytics } from '@/hooks/useAnalytics'
import { useAuth } from '@/hooks/useAuth'
import { useJobActions } from '@/hooks/useJobActions'
import { useJobs } from '@/hooks/useJobs'
import { calculateStatusBreakdown } from '@/lib/statsHelpers'
import type { Job } from '@/types/job'
import { ArrowRight, BriefcaseBusiness } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data, isLoading, error } = useJobs()
  const { archiveMutation, unarchiveMutation, deleteMutation, handleView } =
    useJobActions()
  const { data: analyticsData } = useAnalytics()

  if (isLoading) return <PageLoading variant="dashboard" />

  if (error)
    return (
      <PageError title="Could not load dashboard" message={error.message} />
    )

  const recentJobs = data?.slice(0, 5) || []
  const statusBreakdown = calculateStatusBreakdown(data || [])
  const firstName = user?.name?.split(' ')[0] || 'there'

  return (
    <div className="page-container space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {firstName}
          </h1>
          <p className="text-muted-foreground text-sm">
            Here's how your job search is going.
          </p>
        </div>
        <CreateJobDialog />
      </div>

      {analyticsData && <SummaryCards data={analyticsData.summary_stats} />}

      {statusBreakdown.length > 0 && <StatusChart data={statusBreakdown} />}

      <Card className="border-border/70 shadow-sm">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-xl">Recent jobs</CardTitle>
            <p className="text-muted-foreground mt-1 text-sm">
              Your latest applications and progress updates.
            </p>
          </div>

          <Button
            className="self-start sm:self-auto"
            onClick={() => navigate('/jobs')}
          >
            View all
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          {recentJobs.length > 0 ? (
            <DataTable
              columns={createColumns(
                handleView,
                archiveMutation.mutate,
                unarchiveMutation.mutate,
                deleteMutation.mutate
              )}
              data={recentJobs}
              onRowClick={(row) => handleView((row as Job).id)}
            />
          ) : (
            <div className="bg-muted/20 flex min-h-[240px] flex-col items-center justify-center rounded-xl border border-dashed px-6 py-10 text-center">
              <div className="bg-muted mb-4 rounded-full p-3">
                <BriefcaseBusiness className="text-muted-foreground h-5 w-5" />
              </div>

              <h3 className="text-lg font-semibold">No jobs yet</h3>
              <p className="text-muted-foreground mt-2 max-w-md text-sm leading-6">
                Add your first job application to start tracking progress,
                interviews, and follow-ups in one place.
              </p>

              <div className="mt-5">
                <CreateJobDialog />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
