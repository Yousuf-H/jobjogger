import { fetchOrganisations } from '@/services/api/organisations'
import { useQuery } from '@tanstack/react-query'

export function useOrganisations() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  return useQuery({
    queryKey: ['organisations', user.id],
    queryFn: fetchOrganisations,
  })
}
