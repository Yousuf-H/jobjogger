import { fetchJob } from '@/services/api/jobs'
import { getCurrentUserId } from '@/lib/auth'
import { QUERY_KEYS } from '@/lib/queryKeys'
import { useQuery } from '@tanstack/react-query'

export function useJob(id: string | undefined) {
  const userId = getCurrentUserId()

  return useQuery({
    queryKey: QUERY_KEYS.jobs.detail(userId, id),
    queryFn: () => fetchJob(Number(id)),
    enabled: !!id,
  })
}
