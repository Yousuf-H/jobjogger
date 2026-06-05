export type StatPeriod = 'daily' | 'weekly' | 'monthly'

export interface TimeSeriesPoint {
  date: string
  count: number
}

export interface AdminTotals {
  users: number
  jobs: number
}

export interface DemoStats {
  last_sign_in_at: string | null
  total_jobs: number
}

export interface AdminStatsData {
  period: StatPeriod
  totals: AdminTotals
  active_users_in_window: number
  signups_over_time: TimeSeriesPoint[]
  sessions_over_time: TimeSeriesPoint[]
  active_users_over_time: TimeSeriesPoint[]
  jobs_over_time: TimeSeriesPoint[]
  demo: DemoStats
}
