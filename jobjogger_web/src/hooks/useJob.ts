import { fetchJob } from '@/services/api/jobs'
import { getCurrentUserId } from '@/lib/auth'
import { QUERY_KEYS } from '@/lib/queryKeys'
import { useQuery } from '@tanstack/react-query'

/**
 * Fetches a single job and its timeline entries by ID.
 *
 * The query is disabled (`enabled: false`) when `id` is `undefined`, so it is
 * safe to call with a route param that may not yet be resolved.
 *
 * @param id - The job ID as a string (typically from `useParams`), or `undefined`.
 * @returns A TanStack `UseQueryResult` containing `{ job, timeline_entries }`.
 */
export function useJob(id: string | undefined) {
  const userId = getCurrentUserId()

  return useQuery({
    queryKey: QUERY_KEYS.jobs.detail(userId, id),
    queryFn: () => fetchJob(Number(id)),
    enabled: !!id,
  })
}
