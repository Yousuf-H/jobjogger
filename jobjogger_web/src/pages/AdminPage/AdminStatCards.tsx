import StatisticsCard from '@/components/ui/statistics-card'
import type { AdminTotals, StatPeriod, TimeSeriesPoint } from '@/types/admin'
import { Activity, Briefcase, Users, Zap } from 'lucide-react'

interface AdminStatCardsProps {
  totals: AdminTotals
  period: StatPeriod
  sessions: TimeSeriesPoint[]
  activeUsers: TimeSeriesPoint[]
}

function sumRecent(series: TimeSeriesPoint[], n: number): number {
  return series.slice(-n).reduce((acc, p) => acc + p.count, 0)
}

function periodLabel(period: StatPeriod): string {
  if (period === 'daily') return 'last 7 days'
  if (period === 'weekly') return 'last 4 weeks'
  return 'last 3 months'
}

function recentN(period: StatPeriod): number {
  if (period === 'daily') return 7
  if (period === 'weekly') return 4
  return 3
}

export function AdminStatCards({ totals, period, sessions, activeUsers }: AdminStatCardsProps) {
  const n = recentN(period)
  const label = periodLabel(period)

  const cards = [
    {
      label: 'Total users',
      value: String(totals.users),
      icon: <Users className="h-4 w-4 lg:h-5 lg:w-5" />,
      subtitle: 'Excluding demo account',
      cardClassName: 'bg-purple-100 border border-purple-200/50 dark:bg-purple-950/30 dark:border-purple-800/30',
      iconClassName: 'bg-white text-purple-500 dark:bg-purple-900/50 dark:text-purple-300 shadow-sm',
      textClassName: 'text-purple-700 dark:text-purple-300',
    },
    {
      label: 'Total jobs',
      value: String(totals.jobs),
      icon: <Briefcase className="h-4 w-4 lg:h-5 lg:w-5" />,
      subtitle: 'Excluding demo account',
      cardClassName: 'bg-sky-100 border border-sky-200/50 dark:bg-sky-950/30 dark:border-sky-800/30',
      iconClassName: 'bg-white text-sky-500 dark:bg-sky-900/50 dark:text-sky-300 shadow-sm',
      textClassName: 'text-sky-700 dark:text-sky-300',
    },
    {
      label: 'Sessions',
      value: String(sumRecent(sessions, n)),
      icon: <Zap className="h-4 w-4 lg:h-5 lg:w-5" />,
      subtitle: `Sign-ins, ${label}`,
      cardClassName: 'bg-pink-100 border border-pink-200/50 dark:bg-pink-950/30 dark:border-pink-800/30',
      iconClassName: 'bg-white text-pink-500 dark:bg-pink-900/50 dark:text-pink-300 shadow-sm',
      textClassName: 'text-pink-700 dark:text-pink-300',
    },
    {
      label: 'Active users',
      value: String(sumRecent(activeUsers, n)),
      icon: <Activity className="h-4 w-4 lg:h-5 lg:w-5" />,
      subtitle: `Job activity, ${label}`,
      cardClassName: 'bg-violet-100 border border-violet-200/50 dark:bg-violet-950/30 dark:border-violet-800/30',
      iconClassName: 'bg-white text-violet-500 dark:bg-violet-900/50 dark:text-violet-300 shadow-sm',
      textClassName: 'text-violet-700 dark:text-violet-300',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <StatisticsCard
          key={card.label}
          icon={card.icon}
          title={card.label}
          value={card.value}
          subtitle={card.subtitle}
          cardClassName={card.cardClassName}
          iconClassName={card.iconClassName}
          textClassName={card.textClassName}
        />
      ))}
    </div>
  )
}
