export interface AnalyticsSummary {
  total_applied: number
  response_rate: number
  interview_rate: number
  avg_days_to_respond: number | null
}

export interface ActivityDataPoint {
  period: string
  count: number
}

export interface FunnelDataPoint {
  status: string
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
  summary: AnalyticsSummary
  activity: {
    weekly: ActivityDataPoint[]
    monthly: ActivityDataPoint[]
  }
  funnel: FunnelDataPoint[]
  source_performance: SourcePerformanceDataPoint[]
  stage_durations: StageDurationDataPoint[]
}