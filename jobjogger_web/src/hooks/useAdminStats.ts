import { fetchAdminStats } from '@/services/api/admin'
import type { StatPeriod } from '@/types/admin'
import { useQuery } from '@tanstack/react-query'

export function useAdminStats(period: StatPeriod) {
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  return useQuery({
    queryKey: ['adminStats', user.id, period],
    queryFn: () => fetchAdminStats(period),
  })
}
