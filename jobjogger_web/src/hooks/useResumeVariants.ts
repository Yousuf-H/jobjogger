import { fetchAllResumeVariants, fetchResumeVariant } from '@/services/api/resume'
import { getCurrentUserId } from '@/lib/auth'
import { QUERY_KEYS } from '@/lib/queryKeys'
import { useQuery } from '@tanstack/react-query'

export function useAllResumeVariants() {
  const userId = getCurrentUserId()

  return useQuery({
    queryKey: QUERY_KEYS.resumeVariants.all(userId),
    queryFn: fetchAllResumeVariants,
  })
}

export function useResumeVariant(id: number | null | undefined) {
  const userId = getCurrentUserId()

  return useQuery({
    queryKey: QUERY_KEYS.resumeVariants.detail(userId, id),
    queryFn: () => fetchResumeVariant(id!),
    enabled: !!id,
  })
}
