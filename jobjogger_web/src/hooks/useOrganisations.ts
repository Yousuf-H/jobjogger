import { fetchOrganisations } from '@/services/api/organisations'
import { getCurrentUserId } from '@/lib/auth'
import { QUERY_KEYS } from '@/lib/queryKeys'
import { keepPreviousData, useQuery } from '@tanstack/react-query'

/**
 * Fetches the full list of organisations for the current user.
 *
 * Uses `keepPreviousData` to avoid list flash while a sort/filter change loads.
 *
 * @returns A TanStack `UseQueryResult` with an array of `Organisation` objects.
 */
export function useOrganisations() {
  const userId = getCurrentUserId()

  return useQuery({
    queryKey: QUERY_KEYS.organisations.list(userId),
    queryFn: fetchOrganisations,
    placeholderData: keepPreviousData,
  })
}
