import { ActivityChart } from '@/components/analytics/ActivityChart'
import { PipelineFunnel } from '@/components/analytics/PipelineFunnel'
import { SourcePerformance } from '@/components/analytics/SourcePerformance'
import { StageDurations } from '@/components/analytics/StageDurations'
import { SummaryCards } from '@/components/analytics/SummaryCards'
import { PageError } from '@/components/layout/PageError'
import { PageLoading } from '@/components/layout/PageLoading'
import { useAnalytics } from '@/hooks/useAnalytics'
import { usePageTitle } from '@/hooks/usePageTitle'

export default function AnalyticsPage() {
  usePageTitle('Analytics')
  const { data, isLoading, error } = useAnalytics()

  if (error)
    return (
      <PageError title="Failed to load analytics" message={error.message} />
    )

  return (
    <div className="page-container space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground text-sm">
          Insights into your job search progress
        </p>
      </div>

      {isLoading || !data ? (
        <PageLoading variant="analytics" />
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
