import { Card, CardContent } from '@/components/ui/card'
import type { AnalyticsSummary } from '@/types/analytics'

interface SummaryCardsProps {
  data: AnalyticsSummary
}

export function SummaryCards({ data }: SummaryCardsProps) {
  const cards = [
    { label: 'Total applied', value: data.total_applied },
    { label: 'Response rate', value: `${data.response_rate}%` },
    { label: 'Interview rate', value: `${data.interview_rate}%` },
    {
      label: 'Avg. days to respond',
      value: data.avg_days_to_respond !== null ? data.avg_days_to_respond : '—',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label} className="bg-muted/50 border-0 shadow-none">
          <CardContent className="p-4">
            <p className="text-muted-foreground text-xs">{card.label}</p>
            <p className="text-2xl font-medium tracking-tight">{card.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}