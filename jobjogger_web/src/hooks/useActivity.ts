import { fetchActivity } from '@/services/api/activity'
import { getCurrentUserId } from '@/lib/auth'
import { QUERY_KEYS } from '@/lib/queryKeys'
import { useQuery } from '@tanstack/react-query'

export function useActivity(page = 1, perPage = 5) {
  const userId = getCurrentUserId()

  return useQuery({
    queryKey: QUERY_KEYS.activity(userId, page, perPage),
    queryFn: () => fetchActivity(page, perPage),
  })
}
