import { fetchOrganisation, fetchSimilarOrganisations } from '@/services/api/organisations'
import { getCurrentUserId } from '@/lib/auth'
import { QUERY_KEYS } from '@/lib/queryKeys'
import { useQuery } from '@tanstack/react-query'

export function useOrganisation(id: string | undefined) {
  const userId = getCurrentUserId()

  return useQuery({
    queryKey: QUERY_KEYS.organisations.detail(userId, id),
    queryFn: () => fetchOrganisation(Number(id)),
    enabled: !!id,
  })
}

export function useSimilarOrganisations(id: string | undefined, enabled: boolean) {
  const userId = getCurrentUserId()

  return useQuery({
    queryKey: QUERY_KEYS.organisations.similar(userId, id),
    queryFn: () => fetchSimilarOrganisations(Number(id)),
    enabled: !!id && enabled,
  })
}
