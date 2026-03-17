import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from 'recharts'
import type { ActivityDataPoint } from '@/types/analytics'

interface ActivityChartProps {
  weekly: ActivityDataPoint[]
  monthly: ActivityDataPoint[]
}

function formatLabel(dateStr: string, mode: 'weekly' | 'monthly'): string {
  const date = new Date(dateStr)
  if (mode === 'monthly') {
    return date.toLocaleDateString('en-AU', { month: 'short', year: '2-digit' })
  }
  const day = date.getDate()
  const month = date.toLocaleDateString('en-AU', { month: 'short' })
  return `${day} ${month}`
}

export function ActivityChart({ weekly, monthly }: ActivityChartProps) {
  const [mode, setMode] = useState<'weekly' | 'monthly'>('weekly')

  const rawData = mode === 'weekly' ? weekly : monthly
  const chartData = rawData.map((d) => ({
    label: formatLabel(d.period, mode),
    count: d.count,
  }))

  const chartConfig = {
    count: {
      label: 'Jobs created',
      color: 'var(--chart-2)',
    },
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Application activity</CardTitle>
          <p className="text-muted-foreground text-sm">
            Jobs created over time
          </p>
        </div>
        <div className="flex rounded-md border">
          <Button
            type="button"
            variant={mode === 'weekly' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-7 rounded-r-none text-xs"
            onClick={() => setMode('weekly')}
          >
            Weekly
          </Button>
          <Button
            type="button"
            variant={mode === 'monthly' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-7 rounded-l-none text-xs"
            onClick={() => setMode('monthly')}
          >
            Monthly
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex h-[220px] items-center justify-center">
            <p className="text-muted-foreground text-sm">No data yet</p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[220px] w-full">
            <BarChart data={chartData}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                fontSize={11}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                fontSize={11}
                allowDecimals={false}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="count"
                fill="var(--color-count)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}