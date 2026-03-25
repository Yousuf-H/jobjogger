import { fetchJob } from '@/services/api/jobs'
import { useQuery } from '@tanstack/react-query'

export function useJob(id: string | undefined) {
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  return useQuery({
    queryKey: ['jobs', user.id, id],
    queryFn: () => fetchJob(Number(id)),
    enabled: !!id,
  })
}
