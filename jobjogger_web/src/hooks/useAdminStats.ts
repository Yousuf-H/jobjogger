import { getCurrentUserId } from '@/lib/auth'
import { QUERY_KEYS } from '@/lib/queryKeys'
import { fetchAdminStats } from '@/services/api/admin'
import type { StatPeriod } from '@/types/admin'
import { keepPreviousData, useQuery } from '@tanstack/react-query'

/**
 * Fetches platform-wide admin statistics for a given time period.
 *
 * Only fires when a user is present (`enabled: !!userId`). Uses
 * `keepPreviousData` so the chart doesn't flash while switching periods.
 *
 * @param period - The time window to aggregate over (e.g. `'7d'`, `'30d'`).
 * @returns A TanStack `UseQueryResult` with the admin stats payload.
 */
export function useAdminStats(period: StatPeriod) {
  const userId = getCurrentUserId()

  return useQuery({
    queryKey: QUERY_KEYS.adminStats(userId, period),
    queryFn: () => fetchAdminStats(period),
    enabled: !!userId,
    placeholderData: keepPreviousData,
  })
}
