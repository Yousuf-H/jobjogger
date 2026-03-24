import { fetchJob } from '@/services/api/jobs'
import { useQuery } from '@tanstack/react-query'

export function useJob(id: string | undefined) {
  return useQuery({
    queryKey: ['jobs', id],
    queryFn: () => fetchJob(Number(id)),
    enabled: !!id,
  })
}
