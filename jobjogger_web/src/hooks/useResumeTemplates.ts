import { fetchResumeTemplate, fetchResumeTemplates } from '@/services/api/resume'
import { getCurrentUserId } from '@/lib/auth'
import { QUERY_KEYS } from '@/lib/queryKeys'
import { useQuery } from '@tanstack/react-query'

export function useResumeTemplates() {
  const userId = getCurrentUserId()

  return useQuery({
    queryKey: QUERY_KEYS.resumeTemplates.all(userId),
    queryFn: fetchResumeTemplates,
  })
}

export function useResumeTemplate(id: number | undefined) {
  const userId = getCurrentUserId()

  return useQuery({
    queryKey: QUERY_KEYS.resumeTemplates.detail(userId, id),
    queryFn: () => fetchResumeTemplate(id!),
    enabled: !!id,
  })
}
