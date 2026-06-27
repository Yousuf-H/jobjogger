import { fetchJobs } from '@/services/api/jobs'
import { getCurrentUserId } from '@/lib/auth'
import { QUERY_KEYS } from '@/lib/queryKeys'
import type { JobFilters } from '@/types/job'
import { useQuery } from '@tanstack/react-query'

/**
 * Fetches the current user's job list with optional filters.
 *
 * @param filters - Optional filter params (status, search query, tags, etc.).
 * @returns A TanStack `UseQueryResult` with an array of `Job` objects.
 */
export function useJobs(filters?: JobFilters) {
  const userId = getCurrentUserId()

  return useQuery({
    queryKey: QUERY_KEYS.jobs.list(userId, filters),
    queryFn: () => fetchJobs(filters),
  })
}
