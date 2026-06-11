import type { ActivityResponse } from '@/types/timelineEntry'
import { apiClient } from './client'

export async function fetchActivity(page = 1, perPage = 5): Promise<ActivityResponse> {
  const response = await apiClient.get('/activity', { params: { page, per_page: perPage } })
  return response.data
}
