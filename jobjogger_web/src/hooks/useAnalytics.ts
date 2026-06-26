import { fetchAnalytics } from '@/services/api/analytics'
import { getCurrentUserId } from '@/lib/auth'
import { QUERY_KEYS } from '@/lib/queryKeys'
import { useQuery } from '@tanstack/react-query'

export function useAnalytics() {
  const userId = getCurrentUserId()

  return useQuery({
    queryKey: QUERY_KEYS.analytics(userId),
    queryFn: () => fetchAnalytics(),
  })
}
