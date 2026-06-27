import { fetchResumeTemplate, fetchResumeTemplates } from '@/services/api/resume'
import { getCurrentUserId } from '@/lib/auth'
import { QUERY_KEYS } from '@/lib/queryKeys'
import { useQuery } from '@tanstack/react-query'

/**
 * Fetches all resume templates for the current user.
 *
 * @returns A TanStack `UseQueryResult` with an array of `ResumeTemplate` objects.
 */
export function useResumeTemplates() {
  const userId = getCurrentUserId()

  return useQuery({
    queryKey: QUERY_KEYS.resumeTemplates.all(userId),
    queryFn: fetchResumeTemplates,
  })
}

/**
 * Fetches a single resume template by ID, including its variants.
 *
 * Disabled when `id` is `undefined` — safe to call before a selection is made.
 *
 * @param id - The template ID, or `undefined`.
 * @returns A TanStack `UseQueryResult` with the `ResumeTemplate` and its variants.
 */
export function useResumeTemplate(id: number | undefined) {
  const userId = getCurrentUserId()

  return useQuery({
    queryKey: QUERY_KEYS.resumeTemplates.detail(userId, id),
    queryFn: () => fetchResumeTemplate(id!),
    enabled: !!id,
  })
}
