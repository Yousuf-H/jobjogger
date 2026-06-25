import { cn } from '@/lib/utils'
import type { SummaryStats } from '@/types/analytics'
import { Clock, MailOpen, Mic, Send } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string
  subLabel: string
  icon: React.ElementType
  iconContainerClass: string
  iconColor: string
}

function StatCard({ label, value, subLabel, icon: Icon, iconContainerClass, iconColor }: StatCardProps) {
  return (
    <div className="rounded-[10px] border border-border bg-card" style={{ padding: '14px 16px' }}>
      <div className="flex items-center justify-between">
        <span className="text-[12px] text-muted-foreground">{label}</span>
        <div className={cn('flex h-[36px] w-[36px] items-center justify-center rounded-full', iconContainerClass)}>
          <Icon className={cn('h-[18px] w-[18px]', iconColor)} />
        </div>
      </div>
      <p className="mt-2 text-[26px] font-semibold leading-none tracking-tight text-foreground">
        {value}
      </p>
      <p className="mt-1 text-[11px] text-muted-foreground">{subLabel}</p>
    </div>
  )
}

export function SummaryCards({ data }: { data: SummaryStats }) {
  const cards: StatCardProps[] = [
    {
      label: 'Total applied',
      value: String(data.total_applied),
      subLabel: 'Applications sent',
      icon: Send,
      iconContainerClass: 'bg-blue-50 border border-blue-200 dark:bg-blue-500/20 dark:border-blue-500/40',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Response rate',
      value: `${data.response_rate}%`,
      subLabel: 'Got a reply back',
      icon: MailOpen,
      iconContainerClass: 'bg-green-50 border border-green-200 dark:bg-green-500/20 dark:border-green-500/40',
      iconColor: 'text-green-600 dark:text-green-400',
    },
    {
      label: 'Interview rate',
      value: `${data.interview_rate}%`,
      subLabel: 'Made it to interview',
      icon: Mic,
      iconContainerClass: 'bg-amber-50 border border-amber-200 dark:bg-amber-500/20 dark:border-amber-500/40',
      iconColor: 'text-amber-600 dark:text-amber-400',
    },
    {
      label: 'Avg. days to reply',
      value: data.avg_days_to_respond !== null ? String(data.avg_days_to_respond) : '—',
      subLabel: 'Time to first reply',
      icon: Clock,
      iconContainerClass: 'bg-purple-50 border border-purple-200 dark:bg-purple-500/20 dark:border-purple-500/40',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-[14px] lg:grid-cols-4">
      {cards.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </div>
  )
}
