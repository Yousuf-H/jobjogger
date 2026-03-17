import { apiClient } from './client'
import type { AnalyticsData } from '@/types/analytics'

export async function fetchAnalytics(): Promise<AnalyticsData> {
  const response = await apiClient.get('/analytics')
  return response.data
}