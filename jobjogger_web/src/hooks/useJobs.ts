import { fetchJobs } from '@/services/api/jobs'
import { getCurrentUserId } from '@/lib/auth'
import { QUERY_KEYS } from '@/lib/queryKeys'
import type { JobFilters } from '@/types/job'
import { keepPreviousData, useQuery } from '@tanstack/react-query'

/**
 * Fetches the current user's job list with optional filters.
 *
 * Uses `keepPreviousData` so the list doesn't flash to empty while a filter
 * change is in flight — important for the Jobs page search/filter bar.
 *
 * @param filters - Optional filter params (status, search query, tags, etc.).
 *                  Changes to `filters` trigger a new background fetch while
 *                  the previous results remain visible.
 * @returns A TanStack `UseQueryResult` with an array of `Job` objects.
 */
export function useJobs(filters?: JobFilters) {
  const userId = getCurrentUserId()

  return useQuery({
    queryKey: QUERY_KEYS.jobs.list(userId, filters),
    queryFn: () => fetchJobs(filters),
    placeholderData: keepPreviousData,
  })
}
