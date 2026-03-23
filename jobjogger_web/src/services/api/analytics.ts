import { apiClient } from './client'
import type { AnalyticsData } from '@/types/analytic'

export async function fetchAnalytics(): Promise<AnalyticsData> {
  const response = await apiClient.get('/analytics')

  return response.data
}