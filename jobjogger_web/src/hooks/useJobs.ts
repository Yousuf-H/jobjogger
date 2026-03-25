import { fetchJobs } from '@/services/api/jobs'
import type { JobFilters } from '@/types/job'
import { useQuery } from '@tanstack/react-query'

export function useJobs(filters?: JobFilters) {
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  return useQuery({
    queryKey: ['jobs', user.id, filters],
    queryFn: () => fetchJobs(filters),
  })
}
