import type { ActivityEntry } from '@/types/timelineEntry'
import { apiClient } from './client'

export async function fetchActivity(limit?: number): Promise<ActivityEntry[]> {
  const response = await apiClient.get('/activity', { params: limit ? { limit } : undefined })
  return response.data
}
