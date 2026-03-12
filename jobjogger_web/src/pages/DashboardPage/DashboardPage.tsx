import { useNavigate } from 'react-router-dom'
import { BriefcaseBusiness, ArrowRight, Sparkles } from 'lucide-react'

import { DataTable } from '@/pages/DashboardPage/DataTable'
import { columns as createColumns } from '@/pages/DashboardPage/columns'
import type { Job } from '@/types/job'

import CreateJobDialog from '@/components/job/CreateJobDialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

import { useJobs } from '@/hooks/useJobs'
import { useJobActions } from '@/hooks/useJobActions'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { StatusChart } from '@/components/dashboard/StatusChart'
import { calculateStatusBreakdown } from '@/utils/statsHelpers'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { data, isLoading, error } = useJobs()
  const { archiveMutation, unarchiveMutation, deleteMutation, handleView } =
    useJobActions()

  if (isLoading) {
    return (
      <div className="page-container space-y-6">
        <Card className="border-border/70 overflow-hidden">
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="bg-muted h-8 w-48 animate-pulse rounded-md" />
              <div className="bg-muted h-4 w-80 animate-pulse rounded-md" />
              <div className="bg-muted mt-4 h-10 w-36 animate-pulse rounded-md" />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="bg-muted h-4 w-24 animate-pulse rounded" />
                  <div className="bg-muted h-8 w-16 animate-pulse rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="bg-muted h-6 w-40 animate-pulse rounded" />
              <div className="bg-muted h-64 w-full animate-pulse rounded-xl" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-container">
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold">Could not load dashboard</h2>
            <p className="text-muted-foreground mt-2 text-sm">
              {error.message}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

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
