import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import type { ActivityDataPoint } from '@/types/analytics'
import { useState } from 'react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'

interface ActivityChartProps {
  weekly: ActivityDataPoint[]
  monthly: ActivityDataPoint[]
}

function formatLabel(dateStr: string, mode: 'weekly' | 'monthly'): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)

  if (mode === 'monthly') {
    return date.toLocaleDateString('en-AU', { month: 'short', year: '2-digit' })
  }
  return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
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
      color: 'var(--chart-1)',
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
            <AreaChart data={chartData} margin={
              { top: 20,
                right: 10,
                left: -25,
                bottom: 0
              }
            }>
              <defs>
                <linearGradient id="fillCount" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-count)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-count)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
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
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Area
                dataKey="count"
                type="natural"
                fill="url(#fillCount)"
                stroke="var(--color-count)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}