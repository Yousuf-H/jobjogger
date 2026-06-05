import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import type { StatPeriod, TimeSeriesPoint } from '@/types/admin'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'

interface AdminChartsProps {
  period: StatPeriod
  signups: TimeSeriesPoint[]
  jobs: TimeSeriesPoint[]
  sessions: TimeSeriesPoint[]
  activeUsers: TimeSeriesPoint[]
}

function formatDate(dateStr: string, period: StatPeriod): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const d = new Date(year, month - 1, day)
  if (period === 'monthly') return d.toLocaleDateString('en-AU', { month: 'short', year: '2-digit' })
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
}

function toChartData(series: TimeSeriesPoint[], period: StatPeriod) {
  return series.map((p) => ({ label: formatDate(p.date, period), count: p.count }))
}


interface TimeSeriesChartProps {
  title: string
  subtitle: string
  data: { label: string; count: number }[]
  gradientId: string
  color: string
}

function TimeSeriesChart({ title, subtitle, data, gradientId, color }: TimeSeriesChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-muted-foreground text-sm">{subtitle}</p>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-[200px] items-center justify-center">
            <p className="text-muted-foreground text-sm">No data yet</p>
          </div>
        ) : (
          <ChartContainer config={{ count: { label: 'Count', color } }} className="h-[200px] w-full">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
              <YAxis tickLine={false} axisLine={false} fontSize={11} allowDecimals={false} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
              <Area dataKey="count" type="natural" fill={`url(#${gradientId})`} stroke={color} strokeWidth={2} />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}

export function AdminCharts({ period, signups, jobs, sessions, activeUsers }: AdminChartsProps) {
  const charts = [
    { title: 'Signups over time', subtitle: 'New user registrations', data: toChartData(signups, period), gradientId: 'fillSignups', color: 'var(--chart-1)' },
    { title: 'Jobs created over time', subtitle: 'New jobs added by real users', data: toChartData(jobs, period), gradientId: 'fillJobs', color: 'var(--chart-2)' },
    { title: 'Sessions over time', subtitle: 'Distinct users who signed in', data: toChartData(sessions, period), gradientId: 'fillSessions', color: 'var(--chart-3)' },
    { title: 'Active users over time', subtitle: 'Users who created or updated a job', data: toChartData(activeUsers, period), gradientId: 'fillActive', color: 'var(--chart-4)' },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {charts.map((c) => (
        <TimeSeriesChart key={c.title} {...c} />
      ))}
    </div>
  )
}

