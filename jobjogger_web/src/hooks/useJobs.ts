import { fetchJobs } from '@/services/api/jobs'
import type { JobFilters } from '@/types/job'
import { useQuery } from '@tanstack/react-query'

export function useJobs(filters?: JobFilters) {
  return useQuery({
    queryKey: ['jobs', filters],
    queryFn: () => fetchJobs(filters),
  })
}
