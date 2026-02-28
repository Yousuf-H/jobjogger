import { useQuery } from '@tanstack/react-query'
import { fetchJobs } from '@/services/api/jobs'
import type { JobFilters } from '@/types/job'

export function useJobs(filters?: JobFilters) {
  return useQuery({
    queryKey: ['jobs', filters],
    queryFn: () => fetchJobs(filters),
  })
}
