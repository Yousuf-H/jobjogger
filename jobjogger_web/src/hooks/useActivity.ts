import { fetchActivity } from '@/services/api/activity'
import { getCurrentUserId } from '@/lib/auth'
import { QUERY_KEYS } from '@/lib/queryKeys'
import { keepPreviousData, useQuery } from '@tanstack/react-query'

/**
 * Fetches a paginated activity feed for the current user.
 *
 * Uses `keepPreviousData` so the previous page's results remain visible while
 * the next page is loading — prevents a flash to an empty state on page change.
 *
 * @param page    - 1-based page number (default: 1).
 * @param perPage - Number of entries per page (default: 5).
 * @returns A TanStack `UseQueryResult` with the activity feed data.
 */
export function useActivity(page = 1, perPage = 5) {
  const userId = getCurrentUserId()

  return useQuery({
    queryKey: QUERY_KEYS.activity.detail(userId, page, perPage),
    queryFn: () => fetchActivity(page, perPage),
    placeholderData: keepPreviousData,
  })
}
