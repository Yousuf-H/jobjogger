import { fetchOrganisation, fetchSimilarOrganisations } from '@/services/api/organisations'
import { getCurrentUserId } from '@/lib/auth'
import { QUERY_KEYS } from '@/lib/queryKeys'
import { useQuery } from '@tanstack/react-query'

/**
 * Fetches a single organisation by ID.
 *
 * Disabled when `id` is `undefined` — safe to call before the route param resolves.
 *
 * @param id - Organisation ID as a string (from `useParams`), or `undefined`.
 * @returns A TanStack `UseQueryResult` with the `Organisation` object.
 */
export function useOrganisation(id: string | undefined) {
  const userId = getCurrentUserId()

  return useQuery({
    queryKey: QUERY_KEYS.organisations.detail(userId, id),
    queryFn: () => fetchOrganisation(Number(id)),
    enabled: !!id,
  })
}

/**
 * Fetches organisations that are potential duplicates of the given organisation.
 *
 * Used by the merge workflow on the Organisation detail page. The `enabled`
 * parameter lets callers gate the fetch behind a user action (e.g. opening
 * the merge dialog) to avoid unnecessary requests.
 *
 * @param id      - The organisation ID to find duplicates for, or `undefined`.
 * @param enabled - Whether to run the query (e.g. pass `dialogOpen`).
 * @returns A TanStack `UseQueryResult` with an array of similar `Organisation` objects.
 */
export function useSimilarOrganisations(id: string | undefined, enabled: boolean) {
  const userId = getCurrentUserId()

  return useQuery({
    queryKey: QUERY_KEYS.organisations.similar(userId, id),
    queryFn: () => fetchSimilarOrganisations(Number(id)),
    enabled: !!id && enabled,
  })
}
