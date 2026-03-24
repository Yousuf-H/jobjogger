import StatisticsCard from '@/components/ui/statistics-card'
import type { SummaryStats } from '@/types/analytics'
import { Clock, MessageSquareReply, Send, UserCheck } from 'lucide-react'

interface SummaryStatsProps {
  data: SummaryStats
}

export function SummaryCards({ data }: SummaryStatsProps) {
  const cards = [
    {
      label: 'Total applied',
      value: String(data.total_applied),
      icon: <Send className="h-4 w-4" />,
      subtitle: 'Applications sent',
    },
    {
      label: 'Response rate',
      value: `${data.response_rate}%`,
      icon: <MessageSquareReply className="h-4 w-4" />,
      subtitle: 'Got a reply back',
    },
    {
      label: 'Interview rate',
      value: `${data.interview_rate}%`,
      icon: <UserCheck className="h-4 w-4" />,
      subtitle: 'Made it to interview',
    },
    {
      label: 'Avg. days to respond',
      value: data.avg_days_to_respond !== null ? String(data.avg_days_to_respond) : '—',
      icon: <Clock className="h-4 w-4" />,
      subtitle: 'Time to first reply',
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
        />
      ))}
    </div>
  )
}