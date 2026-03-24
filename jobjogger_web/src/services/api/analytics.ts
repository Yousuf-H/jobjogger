import type { AnalyticsData } from '@/types/analytics'
import { apiClient } from './client'

export async function fetchAnalytics(): Promise<AnalyticsData> {
  const response = await apiClient.get('/analytics')

  return response.data
}