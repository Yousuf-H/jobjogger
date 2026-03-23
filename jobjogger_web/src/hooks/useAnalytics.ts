import { useQuery } from "@tanstack/react-query"
import { fetchAnalytics } from "@/services/api/analytics"

export function useAnalytics() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  return useQuery({
    queryKey: ['analytics', user.id],
    queryFn: () => fetchAnalytics()
  })
}