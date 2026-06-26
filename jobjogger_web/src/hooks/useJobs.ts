import { fetchJobs } from '@/services/api/jobs'
import { getCurrentUserId } from '@/lib/auth'
import { QUERY_KEYS } from '@/lib/queryKeys'
import type { JobFilters } from '@/types/job'
import { keepPreviousData, useQuery } from '@tanstack/react-query'

export function useJobs(filters?: JobFilters) {
  const userId = getCurrentUserId()

  return useQuery({
    queryKey: QUERY_KEYS.jobs.list(userId, filters),
    queryFn: () => fetchJobs(filters),
    placeholderData: keepPreviousData,
  })
}
