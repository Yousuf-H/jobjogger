import { fetchActivity } from '@/services/api/activity'
import { useQuery } from '@tanstack/react-query'

export function useActivity(page = 1, perPage = 5) {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  return useQuery({
    queryKey: ['activity', user.id, page, perPage],
    queryFn: () => fetchActivity(page, perPage),
  })
}
