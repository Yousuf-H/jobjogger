import { useAuth } from '@/hooks/useAuth'
import { fetchAdminStats } from '@/services/api/admin'
import type { StatPeriod } from '@/types/admin'
import { useQuery } from '@tanstack/react-query'

export function useAdminStats(period: StatPeriod) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['adminStats', user?.id, period],
    queryFn: () => fetchAdminStats(period),
    enabled: !!user?.id,
  })
}
