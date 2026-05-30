import { TypographyH1 } from '@/components/ui/typography'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useAdminStats } from '@/hooks/useAdminStats'
import { PageLoading } from '@/components/layout/PageLoading'
import { PageError } from '@/components/layout/PageError'
import { AdminStatCards } from './AdminStatCards'
import { AdminCharts } from './AdminCharts'
import { PeriodToggle } from './PeriodToggle'
import { useState } from 'react'
import type { StatPeriod } from '@/types/admin'

export default function AdminPage() {
  usePageTitle('Admin')
  const [period, setPeriod] = useState<StatPeriod>('daily')
  const { data, isLoading, error } = useAdminStats(period)

  if (error) return <PageError title="Failed to load admin stats" message={error.message} />

  return (
    <div className="page-container space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <TypographyH1 className="text-2xl font-semibold tracking-tight">Admin</TypographyH1>
          <p className="text-muted-foreground text-sm">Platform usage overview</p>
        </div>
        <PeriodToggle value={period} onChange={setPeriod} />
      </div>

      {isLoading || !data ? (
        <PageLoading />
      ) : (
        <>
          <AdminStatCards totals={data.totals} period={period} sessions={data.sessions_over_time} activeUsers={data.active_users_over_time} />
          <AdminCharts
            period={period}
            signups={data.signups_over_time}
            jobs={data.jobs_over_time}
            sessions={data.sessions_over_time}
            activeUsers={data.active_users_over_time}
          />
        </>
      )}
    </div>
  )
}
