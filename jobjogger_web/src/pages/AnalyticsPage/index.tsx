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

  if (isLoading) return <PageLoading variant="analytics" />
  if (error) return <PageError title="Failed to load analytics" message={error.message} />

  return (
    <div className="space-y-[14px]">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[18px] font-semibold tracking-tight text-foreground">Analytics</h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            Insights into your job search progress
          </p>
        </div>
      </div>

      {data && (
        <>
          <SummaryCards data={data.summary_stats} />
          <ActivityChart weekly={data.activity.weekly} monthly={data.activity.monthly} />
          <div className="grid grid-cols-1 gap-[14px] min-[1440px]:grid-cols-2">
            <PipelineFunnel data={data.funnel_data} />
            <SourcePerformance data={data.source_performance} />
          </div>
          <StageDurations data={data.stage_durations} />
        </>
      )}
    </div>
  )
}
