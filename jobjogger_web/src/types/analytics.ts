export interface FunnelDataPoint {
  status: string
  count: number
}

export interface SummaryStats {
  total_applied: number
  response_rate: number
  interview_rate: number
  avg_days_to_respond: number | null
}

export interface ActivityDataPoint {
  period: string
  count: number
}

export interface SourcePerformanceDataPoint {
  source: string
  applied: number
  got_interview: number
}

export interface StageDurationDataPoint {
  label: string
  avg_days: number | null
}

export interface AnalyticsData {
  funnel_data: FunnelDataPoint[]
  summary_stats: SummaryStats
  activity: {
    weekly: ActivityDataPoint[]
    monthly: ActivityDataPoint[]
  }
  source_performance: SourcePerformanceDataPoint[]
  stage_durations: StageDurationDataPoint[]
}
