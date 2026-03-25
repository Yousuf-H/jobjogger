import { Card, CardContent } from '@/components/ui/card'
import { Briefcase, Calendar, Clock, Trophy } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon: React.ElementType
  iconColor?: string
  trend?: {
    value: string
    positive: boolean
  }
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconColor = 'bg-primary/10 text-primary',
  trend,
}: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-muted-foreground text-sm font-medium">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            {description && (
              <p className="text-muted-foreground text-xs">{description}</p>
            )}
            {trend && (
              <p
                className={`text-xs font-medium ${trend.positive ? 'text-success' : 'text-destructive'}`}
              >
                {trend.positive ? '+' : ''}
                {trend.value}
              </p>
            )}
          </div>
          <div className={`rounded-full p-3 ${iconColor}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface StatsCardsProps {
  stats: {
    total: number
    active: number
    interviews: number
    offers: number
  }
}

const STAT_CARD_STYLES = {
  total: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  active:
    'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
  interviews:
    'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  offers:
    'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
} as const

export function StatsCards({ stats }: StatsCardsProps) {
  const activePercentage =
    stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Applications"
        value={stats.total}
        description="All time"
        icon={Briefcase}
        iconColor={STAT_CARD_STYLES.total}
      />

      <StatCard
        title="Active"
        value={stats.active}
        description={`${activePercentage}% of total`}
        icon={Clock}
        iconColor={STAT_CARD_STYLES.active}
      />

      <StatCard
        title="Interviews"
        value={stats.interviews}
        description="This week"
        icon={Calendar}
        iconColor={STAT_CARD_STYLES.interviews}
      />

      <StatCard
        title="Offers"
        value={stats.offers}
        description="Pending response"
        icon={Trophy}
        iconColor={STAT_CARD_STYLES.offers}
      />
    </div>
  )
}
