import { fetchAllResumeVariants, fetchResumeVariant } from '@/services/api/resume'
import { useQuery } from '@tanstack/react-query'

export function useAllResumeVariants() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  return useQuery({
    queryKey: ['resume_variants', user.id],
    queryFn: fetchAllResumeVariants,
  })
}

export function useResumeVariant(id: number | null | undefined) {
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  return useQuery({
    queryKey: ['resume_variants', user.id, id],
    queryFn: () => fetchResumeVariant(id!),
    enabled: !!id,
  })
}
