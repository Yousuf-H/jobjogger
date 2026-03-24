import { ActivityChart } from '@/components/analytics/ActivityChart'
import { PipelineFunnel } from '@/components/analytics/PipelineFunnel'
import { SourcePerformance } from '@/components/analytics/SourcePerformance'
import { StageDurations } from '@/components/analytics/StageDurations'
import { SummaryCards } from '@/components/analytics/SummaryCards'
import { Skeleton } from '@/components/ui/skeleton'
import { useAnalytics } from '@/hooks/useAnalytics'

export default function AnalyticsPage() {
  const { data, isLoading, error } = useAnalytics()

  if (error) {
    return (
      <div className="page-container">
        <div className="flex h-[400px] items-center justify-center">
          <p className="text-muted-foreground">
            Failed to load analytics. Please try again.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground text-sm">
          Insights into your job search progress
        </p>
      </div>

      {isLoading || !data ? (
        <AnalyticsSkeleton />
      ) : (
        <>
          <SummaryCards data={data.summary_stats} />
          <ActivityChart
            weekly={data.activity.weekly}
            monthly={data.activity.monthly}
          />
          <PipelineFunnel data={data.funnel_data} />
          <SourcePerformance data={data.source_performance} />
          <StageDurations data={data.stage_durations} />
        </>
      )}
    </div>
  )
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-[300px] rounded-lg" />
      <Skeleton className="h-[320px] rounded-lg" />
      <Skeleton className="h-[280px] rounded-lg" />
      <Skeleton className="h-[240px] rounded-lg" />
    </div>
  )
}
