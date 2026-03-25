import { fetchAnalytics } from '@/services/api/analytics'
import { useQuery } from '@tanstack/react-query'

export function useAnalytics() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  return useQuery({
    queryKey: ['analytics', user.id],
    queryFn: () => fetchAnalytics(),
  })
}
