import { fetchOrganisations } from '@/services/api/organisations'
import { getCurrentUserId } from '@/lib/auth'
import { QUERY_KEYS } from '@/lib/queryKeys'
import { useQuery } from '@tanstack/react-query'

export function useOrganisations() {
  const userId = getCurrentUserId()

  return useQuery({
    queryKey: QUERY_KEYS.organisations.list(userId),
    queryFn: fetchOrganisations,
  })
}
