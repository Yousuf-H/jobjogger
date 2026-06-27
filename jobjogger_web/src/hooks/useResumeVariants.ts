import { fetchAllResumeVariants, fetchResumeVariant } from '@/services/api/resume'
import { getCurrentUserId } from '@/lib/auth'
import { QUERY_KEYS } from '@/lib/queryKeys'
import { useQuery } from '@tanstack/react-query'

/**
 * Fetches all resume variants for the current user across all templates.
 *
 * Used by the variant picker (e.g. when linking a resume to a job).
 *
 * @returns A TanStack `UseQueryResult` with an array of `ResumeVariant` objects.
 */
export function useAllResumeVariants() {
  const userId = getCurrentUserId()

  return useQuery({
    queryKey: QUERY_KEYS.resumeVariants.all(userId),
    queryFn: fetchAllResumeVariants,
  })
}

/**
 * Fetches a single resume variant by ID.
 *
 * Disabled when `id` is `null` or `undefined`.
 *
 * @param id - The variant ID, or `null` / `undefined`.
 * @returns A TanStack `UseQueryResult` with the `ResumeVariant` object.
 */
export function useResumeVariant(id: number | null | undefined) {
  const userId = getCurrentUserId()

  return useQuery({
    queryKey: QUERY_KEYS.resumeVariants.detail(userId, id),
    queryFn: () => fetchResumeVariant(id!),
    enabled: !!id,
  })
}
