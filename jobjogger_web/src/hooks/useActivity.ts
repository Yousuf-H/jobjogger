import { fetchActivity } from '@/services/api/activity'
import { useQuery } from '@tanstack/react-query'

export function useActivity(limit?: number) {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  return useQuery({
    queryKey: ['activity', user.id, limit],
    queryFn: () => fetchActivity(limit),
  })
}
