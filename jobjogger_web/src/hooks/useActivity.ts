import { fetchActivity } from '@/services/api/activity'
import { getCurrentUserId } from '@/lib/auth'
import { QUERY_KEYS } from '@/lib/queryKeys'
import { keepPreviousData, useQuery } from '@tanstack/react-query'

export function useActivity(page = 1, perPage = 5) {
  const userId = getCurrentUserId()

  return useQuery({
    queryKey: QUERY_KEYS.activity.detail(userId, page, perPage),
    queryFn: () => fetchActivity(page, perPage),
    placeholderData: keepPreviousData,
  })
}
