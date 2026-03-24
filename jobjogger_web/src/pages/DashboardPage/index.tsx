import { StatsCards } from '@/components/dashboard/StatsCards'
import { StatusChart } from '@/components/dashboard/StatusChart'
import CreateJobDialog from '@/components/job/CreateJobDialog'
import DataTable from '@/components/job/DataTable'
import { columns as createColumns } from '@/components/job/columns'
import { PageError } from '@/components/layout/PageError'
import { PageLoading } from '@/components/layout/PageLoading'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useJobActions } from '@/hooks/useJobActions'
import { useJobs } from '@/hooks/useJobs'
import { calculateStatusBreakdown } from '@/lib/statsHelpers'
import type { Job } from '@/types/job'
import { ArrowRight, BriefcaseBusiness, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { data, isLoading, error } = useJobs()
  const { archiveMutation, unarchiveMutation, deleteMutation, handleView } =
    useJobActions()

  if (isLoading) return <PageLoading variant="dashboard" />

  if (error)
    return (
      <PageError title="Could not load dashboard" message={error.message} />
    )

  const recentJobs = data?.slice(0, 10) || []

  const stats = {
    total: data?.length || 0,
    active:
      data?.filter((job) =>
        ['applied', 'phone_screen', 'interviewing'].includes(job.status)
      ).length || 0,
    interviews:
      data?.filter((job) => job.status === 'interviewing').length || 0,
    offers: data?.filter((job) => job.status === 'offer').length || 0,
  }

  const statusBreakdown = calculateStatusBreakdown(data || [])

  return (
    <div className="page-container space-y-8">
      <Card className="border-border/70 from-card to-muted/30 overflow-hidden bg-gradient-to-br shadow-sm">
        <CardContent className="flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between lg:p-8">
          <div className="max-w-2xl space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1 rounded-full px-3 py-1">
                <Sparkles className="h-3.5 w-3.5" />
                Job search dashboard
              </Badge>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Stay on top of your job search
              </h1>
              <p className="text-muted-foreground max-w-xl text-sm leading-6 sm:text-base">
                Track applications, monitor interviews, and keep momentum with a
                clear view of your recent activity and progress.
              </p>
            </div>

            <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-sm">
              <div className="flex items-center gap-2">
                <BriefcaseBusiness className="h-4 w-4" />
                <span>{stats.total} total applications</span>
              </div>
              <span className="hidden sm:inline">•</span>
              <span>{stats.interviews} currently in interview stages</span>
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col">
            <CreateJobDialog />
            <Button variant="outline" onClick={() => navigate('/jobs')}>
              View all jobs
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Overview</h2>
          <p className="text-muted-foreground text-sm">
            A quick snapshot of your current pipeline.
          </p>
        </div>
        <StatsCards stats={stats} />
      </section>

      {statusBreakdown.length > 0 && (
        <section>
          <StatusChart data={statusBreakdown} />
        </section>
      )}

      <Card className="border-border/70 shadow-sm">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-xl">Recent jobs</CardTitle>
            <p className="text-muted-foreground mt-1 text-sm">
              Your latest applications and progress updates.
            </p>
          </div>

          <Button
            variant="ghost"
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
