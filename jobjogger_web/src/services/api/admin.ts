import type { AdminStatsData, StatPeriod } from '@/types/admin'
import { apiClient } from './client'

export async function fetchAdminStats(period: StatPeriod): Promise<AdminStatsData> {
  const response = await apiClient.get('/admin/stats', { params: { period } })
  return response.data
}
