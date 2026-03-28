import StatisticsCard from '@/components/ui/statistics-card'
import type { SummaryStats } from '@/types/analytics'
import { Award, Rocket, Timer, TrendingUp } from 'lucide-react'

interface SummaryStatsProps {
  data: SummaryStats
}

export function SummaryCards({ data }: SummaryStatsProps) {
  const cards = [
    {
      label: 'Total applied',
      value: String(data.total_applied),
      icon: <Rocket className="h-4 w-4 lg:h-5 lg:w-5" />,
      subtitle: 'Applications sent',
      cardClassName:
        'bg-purple-100 border border-purple-200/50 dark:bg-purple-950/30 dark:border-purple-800/30',
      iconClassName:
        'bg-white text-purple-500 dark:bg-purple-900/50 dark:text-purple-300 shadow-sm',
      textClassName: 'text-purple-700 dark:text-purple-300',
    },
    {
      label: 'Response rate',
      value: `${data.response_rate}%`,
      icon: <TrendingUp className="h-4 w-4 lg:h-5 lg:w-5" />,
      subtitle: 'Got a reply back',
      cardClassName:
        'bg-pink-100 border border-pink-200/50 dark:bg-pink-950/30 dark:border-pink-800/30',
      iconClassName:
        'bg-white text-pink-500 dark:bg-pink-900/50 dark:text-pink-300 shadow-sm',
      textClassName: 'text-pink-700 dark:text-pink-300',
    },
    {
      label: 'Interview rate',
      value: `${data.interview_rate}%`,
      icon: <Award className="h-4 w-4 lg:h-5 lg:w-5" />,
      subtitle: 'Made it to interview',
      cardClassName:
        'bg-sky-100 border border-sky-200/50 dark:bg-sky-950/30 dark:border-sky-800/30',
      iconClassName:
        'bg-white text-sky-500 dark:bg-sky-900/50 dark:text-sky-300 shadow-sm',
      textClassName: 'text-sky-700 dark:text-sky-300',
    },
    {
      label: 'Avg. days to respond',
      value:
        data.avg_days_to_respond !== null
          ? String(data.avg_days_to_respond)
          : '—',
      icon: <Timer className="h-4 w-4 lg:h-5 lg:w-5" />,
      subtitle: 'Time to first reply',
      cardClassName:
        'bg-violet-100 border border-violet-200/50 dark:bg-violet-950/30 dark:border-violet-800/30',
      iconClassName:
        'bg-white text-violet-500 dark:bg-violet-900/50 dark:text-violet-300 shadow-sm',
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
