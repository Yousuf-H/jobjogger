import { getCurrentUserId } from '@/lib/auth'
import { QUERY_KEYS } from '@/lib/queryKeys'
import { fetchAdminStats } from '@/services/api/admin'
import type { StatPeriod } from '@/types/admin'
import { keepPreviousData, useQuery } from '@tanstack/react-query'

export function useAdminStats(period: StatPeriod) {
  const userId = getCurrentUserId()

  return useQuery({
    queryKey: QUERY_KEYS.adminStats(userId, period),
    queryFn: () => fetchAdminStats(period),
    enabled: !!userId,
    placeholderData: keepPreviousData,
  })
}
