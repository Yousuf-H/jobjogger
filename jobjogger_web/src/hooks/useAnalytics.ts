import { fetchAnalytics } from '@/services/api/analytics'
import { getCurrentUserId } from '@/lib/auth'
import { QUERY_KEYS } from '@/lib/queryKeys'
import { useQuery } from '@tanstack/react-query'

/**
 * Fetches analytics aggregates for the current user's job applications.
 *
 * Returns counts and breakdowns used by the Analytics page (status funnel,
 * applications over time, response rate, etc.).
 *
 * @returns A TanStack `UseQueryResult` with the analytics payload.
 */
export function useAnalytics() {
  const userId = getCurrentUserId()

  return useQuery({
    queryKey: QUERY_KEYS.analytics(userId),
    queryFn: () => fetchAnalytics(),
  })
}
