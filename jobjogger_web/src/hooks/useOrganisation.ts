import { fetchOrganisation, fetchSimilarOrganisations } from '@/services/api/organisations'
import { useQuery } from '@tanstack/react-query'

export function useOrganisation(id: string | undefined) {
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  return useQuery({
    queryKey: ['organisations', user.id, id],
    queryFn: () => fetchOrganisation(Number(id)),
    enabled: !!id,
  })
}

export function useSimilarOrganisations(id: string | undefined, enabled: boolean) {
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  return useQuery({
    queryKey: ['organisations', user.id, id, 'similar'],
    queryFn: () => fetchSimilarOrganisations(Number(id)),
    enabled: !!id && enabled,
  })
}
